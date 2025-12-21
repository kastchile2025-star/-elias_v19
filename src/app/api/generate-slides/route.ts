import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Esquema para validar la entrada
const GenerateSlidesInputSchema = z.object({
  topic: z.string().min(1, 'El tema es requerido'),
  subject: z.string().min(1, 'La asignatura es requerida'),
  slideCount: z.number().min(1).max(30, 'El número de diapositivas debe estar entre 1 y 30'),
  language: z.enum(['es', 'en']).default('es'),
});

// Esquema para la respuesta de la IA
const SlideSchema = z.object({
  title: z.string().describe('Título de la diapositiva'),
  content: z.array(z.string()).describe('Lista de puntos clave para la diapositiva (3-5 puntos)'),
  imageSearchQuery: z.string().optional().describe('Consulta breve en inglés para buscar una imagen ilustrativa de la diapositiva')
});

const SlidesResponseSchema = z.object({
  slides: z.array(SlideSchema).describe('Array de diapositivas generadas')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, subject, slideCount, language } = GenerateSlidesInputSchema.parse(body);

    console.log('🎯 Generating slides:', { topic, subject, slideCount, language });

  // Verificar si existe alguna API key válida para Gemini
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'your_google_api_key_here') {
      console.log('⚠️ Using mock slides generation - API key not available');
      // Generación mock enriquecida y específica por tema/asignatura
      const mockSlides = buildHeuristicSlides(topic, subject, slideCount, language);
      const slidesWithImages = await attachImagesToSlides(mockSlides as any, topic, subject);

      return NextResponse.json({ 
        slides: slidesWithImages,
        generated: true,
        source: 'mock'
      });
    }

    // Generar con IA real
   const prompt = language === 'es' ? 
  `Genera el contenido para una presentación educativa de ${slideCount} diapositivas sobre "${topic}" en la asignatura "${subject}".

Requisitos por cada diapositiva:
- Título concreto y temático (evita "Aspecto", "Parte", numeraciones genéricas).
- 3 a 5 puntos clave con información específica del tema; evita frases vacías como "punto clave".
- Contenido factual y adecuado al nivel de la asignatura, con definiciones, ejemplos reales o aplicaciones.
- Campo "imageSearchQuery" con consulta breve en inglés para buscar una imagen (solo palabras clave, sin comillas).

No generes diapositiva de portada ni de conclusión: entrega exactamente ${slideCount} diapositivas de contenido.
El lenguaje debe ser claro y pedagógico.` :
  `Generate content for an educational presentation of ${slideCount} slides about "${topic}" for the subject "${subject}".

Requirements per slide:
- Concrete, topic-focused title (avoid generic "Aspect", "Part", numeric-only names).
- 3 to 5 key points with specific information; avoid filler like "key point".
- Factual content appropriate for the subject level, include definitions, real examples or applications.
- An "imageSearchQuery" in English with short keywords (no quotes).

Do not include a cover or conclusion slide: produce exactly ${slideCount} content slides.
Use clear, pedagogical language.`;

    // Helper: espera
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    // Llamada a IA con timeout
    const callAI = async () => {
      const timeoutMs = 15000;
      return await Promise.race([
        ai.generate({
          model: 'googleai/gemini-2.0-flash',
          prompt,
          config: { temperature: 0.4, maxOutputTokens: 3072 },
          output: { schema: SlidesResponseSchema },
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('ai-timeout')), timeoutMs))
      ]);
    };

    // Reintentos ligeros para 503/429/timeout
    let result: any;
    let aiFailed = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await callAI();
        aiFailed = false;
        break;
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        const retryable = /503|429|overloaded|timeout|ai-timeout|ECONNRESET|ENOTFOUND/i.test(msg);
        console.log(`⚠️ AI call failed (attempt ${attempt + 1}/3):`, msg);
        if (attempt < 2 && retryable) { await sleep(600 * Math.pow(2, attempt)); continue; }
        aiFailed = true;
        break;
      }
    }

    if (aiFailed) {
      console.log('⚠️ Falling back to mock slides due to AI unavailability.');
      const mockSlides = buildHeuristicSlides(topic, subject, slideCount, language);
      const slidesWithImages = await attachImagesToSlides(mockSlides as any, topic, subject);
      return NextResponse.json({ slides: slidesWithImages, generated: true, source: 'mock-fallback' });
    }

    console.log('🔍 Raw result from AI:', result);

    // Intentar acceder a los datos de diferentes maneras
  let slides;
    try {
      slides = result.output;
    } catch (error) {
      console.log('Error accessing result.output:', error);
      if (result.data) {
        slides = result.data;
      } else if (result.text) {
        // Si es texto plano, intentar parsearlo
        try {
          slides = JSON.parse(result.text);
        } catch {
          console.error('Could not parse result text as JSON');
          slides = null;
        }
      } else {
        console.error('Unknown result format:', result);
        slides = null;
      }
    }

    console.log('📋 Processed slides:', slides);

    if (!slides || !slides.slides || slides.slides.length === 0) {
      throw new Error('La IA no pudo generar diapositivas válidas');
    }

    console.log('✅ Slides generated successfully:', slides.slides.length);

  // Post-procesar para evitar contenido genérico
  const refined = refineGenericSlides(slides.slides, topic, subject, language as 'es'|'en');
  // Adjuntar imágenes por slide (usa proveedores si hay API keys o fallback si no)
  const slidesWithImages = await attachImagesToSlides(refined, topic, subject);

    return NextResponse.json({
      slides: slidesWithImages,
      generated: true,
      source: 'ai'
    });

  } catch (error) {
    console.error('❌ Error generating slides:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al generar las diapositivas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// ===================== Helpers de imágenes =====================

type BasicSlide = { title: string; content: string[]; imageSearchQuery?: string; imageUrl?: string };

// Normaliza cadena a ASCII básico
const normalizeAscii = (s?: string) => (s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]+/g, '')
  .replace(/[^a-z0-9\s]/gi, ' ')
  .toLowerCase()
  .trim();

// Construye palabras clave enriquecidas en inglés (mezcla tema, asignatura y contenido)
function buildImageKeywords(topic?: string, subject?: string, slide?: BasicSlide, idx?: number) {
  const base = `${normalizeAscii(topic)} ${normalizeAscii(subject)} ${normalizeAscii(slide?.title)} ${normalizeAscii((slide?.content || []).join(' '))}`.trim();
  const tokens = base.split(/\s+/).filter(Boolean);
  const extras = ['education', 'learning', 'classroom', 'illustration'];
  const picked = Array.from(new Set([...tokens.slice(0, 10), ...extras]));
  return encodeURIComponent(picked.join(', ')) + (typeof idx === 'number' ? `&sig=${idx + 1}` : '');
}

async function tryProviders(query: string, index: number) {
  // Provider 0: Photom (o servicio compatible) mediante variables de entorno
  // Admite diferentes nombres de variables para flexibilidad: PHOTOM_API_KEY / PHOTOM_SANDBOX_KEY / SMART_API_KEY
  // y base configurable: PHOTOM_API_URL / SMART_API_URL. Si están presentes, se intenta primero.
  const photomKey = process.env.PHOTOM_API_KEY || process.env.PHOTOM_SANDBOX_KEY || process.env.SMART_API_KEY;
  const photomBase = process.env.PHOTOM_API_URL || process.env.SMART_API_URL;
  if (photomKey && photomBase) {
    try {
      const url = `${photomBase.replace(/\/$/, '')}/search?query=${encodeURIComponent(query)}&limit=1&safe=true&page=${(index % 20) + 1}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${photomKey}`,
          Accept: 'application/json'
        },
        // Evitar reutilización de caché de edge
        cache: 'no-store' as any
      });
      if (res.ok) {
        const data: any = await res.json();
        // Intentos flexibles de extracción de URL según respuestas comunes
        const candidate =
          data?.results?.[0]?.url ||
          data?.results?.[0]?.image_url ||
          data?.data?.[0]?.url ||
          data?.data?.[0]?.image_url ||
          data?.items?.[0]?.link ||
          data?.images?.[0]?.url ||
          data?.photos?.[0]?.url;
        if (typeof candidate === 'string' && candidate) return candidate as string;
      } else {
        console.log('Photom provider HTTP error:', res.status, await res.text().catch(()=>''));
      }
    } catch (e) {
      console.log('Photom provider failed:', e);
    }
  }

  // Provider 1: Pexels
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (pexelsKey) {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=${(index % 50) + 1}`, {
        headers: { Authorization: pexelsKey }
      });
      if (res.ok) {
        const data: any = await res.json();
        const url: string | undefined = data?.photos?.[0]?.src?.large || data?.photos?.[0]?.src?.landscape || data?.photos?.[0]?.src?.medium;
        if (url) return url;
      }
    } catch (e) {
      console.log('Pexels provider failed:', e);
    }
  }

  // Provider 2: Unsplash API
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey) {
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&page=${(index % 30) + 1}&orientation=landscape&client_id=${unsplashKey}`);
      if (res.ok) {
        const data: any = await res.json();
        const url: string | undefined = data?.results?.[0]?.urls?.regular || data?.results?.[0]?.urls?.full || data?.results?.[0]?.urls?.small;
        if (url) return url;
      }
    } catch (e) {
      console.log('Unsplash API provider failed:', e);
    }
  }

  // Provider 3: Google Custom Search (requiere GOOGLE_CSE_ID + GOOGLE_API_KEY)
  const cseId = process.env.GOOGLE_CSE_ID;
  const gKey = process.env.GOOGLE_API_KEY;
  if (cseId && gKey && gKey !== 'your_google_api_key_here') {
    try {
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cseId}&searchType=image&num=1&safe=active&imgType=photo&imgSize=large&key=${gKey}`);
      if (res.ok) {
        const data: any = await res.json();
        const url: string | undefined = data?.items?.[0]?.link;
        if (url) return url;
      }
    } catch (e) {
      console.log('Google CSE provider failed:', e);
    }
  }

  // Fallback sin API: Unsplash Featured con firma única
  const url = `https://source.unsplash.com/featured/1280x720/?${encodeURIComponent(query)}&sig=${index + 1}`;
  return url;
}

async function attachImagesToSlides(slides: BasicSlide[], topic: string, subject: string): Promise<BasicSlide[]> {
  const timeout = (ms: number) => new Promise((_res, rej) => setTimeout(() => rej(new Error('timeout')), ms));

  const promises = slides.map((s, i) => (async () => {
    const q = s.imageSearchQuery || decodeURIComponent(buildImageKeywords(topic, subject, s, i).replace(/&sig=.*$/, ''));
    try {
      const url = await Promise.race([
        tryProviders(q, i),
        timeout(4000),
      ]) as string;
      return { ...s, imageUrl: url } as BasicSlide;
    } catch {
      // Fallback final por si hubo timeout o error en proveedores
      const url = `https://source.unsplash.com/featured/1280x720/?${buildImageKeywords(topic, subject, s, i)}`;
      return { ...s, imageUrl: url } as BasicSlide;
    }
  })());

  const withImages = await Promise.all(promises);
  return withImages;
}

// ===================== Generación heurística (mock enriquecido) =====================
function buildHeuristicSlides(topic: string, subject: string, slideCount: number, language: 'es'|'en'): BasicSlide[] {
  const subj = (subject || '').toLowerCase();
  const isEs = language === 'es';
  const t = topic.trim();
  const slides: BasicSlide[] = [];

  // Plantillas por asignatura
  const templates: Record<string, { title: (i:number)=>string; points:(i:number)=>string[] }> = {
    'ciencias naturales': {
      title: (i)=> isEs ? `${t}: ${['Definición y contexto','Características clave','Estructura y componentes','Procesos principales','Importancia y aplicaciones'][i%5]}` : `${t}: ${['Definition & context','Key characteristics','Structure & components','Main processes','Importance & applications'][i%5]}`,
      points: (i)=> isEs ? [
        `Descripción específica de ${t} en Ciencias Naturales`,
        `Elementos/partes principales y su función`,
        `Ejemplo real o fenómeno relacionado con ${t}`,
        `Relación de ${t} con el entorno o sistemas biológicos/químicos/físicos`
      ] : [
        `Specific description of ${t} in Natural Sciences`,
        `Main elements/parts and their function`,
        `Real example or phenomenon related to ${t}`,
        `Relation of ${t} with environment or biological/chemical/physical systems`
      ]
    },
    'lenguaje y comunicación': {
      title: (i)=> isEs ? `${t}: ${['Concepto y uso','Estructura/gramática','Ejemplos y análisis','Recursos expresivos','Aplicación comunicativa'][i%5]}` : `${t}: ${['Concept & use','Structure/grammar','Examples & analysis','Expressive resources','Communicative application'][i%5]}`,
      points: (i)=> isEs ? [
        `Definición precisa de ${t} y su función comunicativa`,
        `Reglas o estructuras asociadas a ${t}`,
        `Ejemplo textual breve que ilustre ${t}`,
        `Recomendaciones para usar ${t} correctamente`
      ] : [
        `Precise definition of ${t} and its communicative function`,
        `Rules or structures associated with ${t}`,
        `Short text example illustrating ${t}`,
        `Recommendations to use ${t} correctly`
      ]
    },
    'matemáticas': {
      title: (i)=> isEs ? `${t}: ${['Definición','Propiedades','Procedimiento','Ejemplos resueltos','Aplicaciones'][i%5]}` : `${t}: ${['Definition','Properties','Procedure','Solved examples','Applications'][i%5]}`,
      points: (i)=> isEs ? [
        `Explicación formal de ${t}`,
        `Propiedades o teoremas clave vinculados a ${t}`,
        `Pasos para resolver ejercicios de ${t}`,
        `Ejemplo resuelto paso a paso`
      ] : [
        `Formal explanation of ${t}`,
        `Key properties or theorems related to ${t}`,
        `Steps to solve ${t} exercises`,
        `Step-by-step solved example`
      ]
    },
    'historia': {
      title: (i)=> isEs ? `${t}: ${['Contexto histórico','Acontecimientos clave','Personajes relevantes','Causas y consecuencias','Legado e impacto'][i%5]}` : `${t}: ${['Historical context','Key events','Relevant figures','Causes and consequences','Legacy and impact'][i%5]}`,
      points: (i)=> isEs ? [
        `Marco temporal y geográfico de ${t}`,
        `Hechos determinantes relacionados con ${t}`,
        `Actores/personajes y su rol`,
        `Consecuencias a corto y largo plazo`
      ] : [
        `Time and geographic frame of ${t}`,
        `Determinant facts related to ${t}`,
        `Actors/figures and their role`,
        `Short and long-term consequences`
      ]
    }
  };

  const key = Object.keys(templates).find(k => subj.includes(k)) || 'ciencias naturales';
  for (let i=0; i<slideCount; i++) {
    slides.push({
      title: templates[key].title(i),
      content: templates[key].points(i),
      imageSearchQuery: `${t} ${subject} educational slide, high quality, ${i+1}`
    });
  }
  return slides;
}

function isGenericTitle(s?: string) {
  const x = (s || '').toLowerCase();
  return /aspecto|aspect|parte|seccion|section|slide\s*\d+/i.test(x);
}

function isGenericPoint(s?: string) {
  const x = (s || '').toLowerCase();
  return /punto clave|key point|aspecto|aspect|item \d+|punto \d+/i.test(x);
}

function refineGenericSlides(slides: BasicSlide[], topic: string, subject: string, language: 'es'|'en'): BasicSlide[] {
  const refined: BasicSlide[] = [];
  const heur = buildHeuristicSlides(topic, subject, slides.length, language);
  for (let i=0; i<slides.length; i++) {
    const s = slides[i] || {} as BasicSlide;
    let title = s.title;
    let content = Array.isArray(s.content) ? [...s.content] : [];
    if (!title || isGenericTitle(title)) title = heur[i]?.title || title;
    if (content.length === 0 || content.every(p => !p || isGenericPoint(p))) content = heur[i]?.content || content;
    refined.push({ ...s, title, content });
  }
  return refined;
}
