import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Utilidades compartidas (copiadas/ajustadas de generate-slides helper)
const normalizeAscii = (s?: string) => (s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]+/g, '')
  .replace(/[^a-z0-9\s]/gi, ' ')
  .toLowerCase()
  .trim();

function buildImageKeywords(topic?: string, subject?: string, extra?: string) {
  const base = `${normalizeAscii(topic)} ${normalizeAscii(subject)} ${normalizeAscii(extra)}`.trim();
  const tokens = base.split(/\s+/).filter(Boolean);
  const extras = ['education', 'learning', 'classroom', 'illustration'];
  const picked = Array.from(new Set([...tokens.slice(0, 10), ...extras]));
  return encodeURIComponent(picked.join(', '));
}

async function tryProviders(query: string, index: number): Promise<string> {
  const photomKey = process.env.PHOTOM_API_KEY || process.env.PHOTOM_SANDBOX_KEY || process.env.SMART_API_KEY;
  const photomBase = process.env.PHOTOM_API_URL || process.env.SMART_API_URL;
  if (photomKey && photomBase) {
    try {
      const url = `${photomBase.replace(/\/$/, '')}/search?query=${encodeURIComponent(query)}&limit=1&safe=true&page=${(index % 20) + 1}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${photomKey}`, Accept: 'application/json' },
        cache: 'no-store' as any,
      });
      if (res.ok) {
        const data: any = await res.json();
        const candidate =
          data?.results?.[0]?.url ||
          data?.results?.[0]?.image_url ||
          data?.data?.[0]?.url ||
          data?.data?.[0]?.image_url ||
          data?.items?.[0]?.link ||
          data?.images?.[0]?.url ||
          data?.photos?.[0]?.url;
        if (typeof candidate === 'string' && candidate) return candidate as string;
      }
    } catch {}
  }

  const pexelsKey = process.env.PEXELS_API_KEY;
  if (pexelsKey) {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=${(index % 50) + 1}`, {
        headers: { Authorization: pexelsKey }
      });
      if (res.ok) {
        const data: any = await res.json();
        const url: string | undefined = data?.photos?.[0]?.src?.landscape || data?.photos?.[0]?.src?.large || data?.photos?.[0]?.src?.medium;
        if (url) return url;
      }
    } catch {}
  }

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey) {
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&page=${(index % 30) + 1}&orientation=landscape&client_id=${unsplashKey}`);
      if (res.ok) {
        const data: any = await res.json();
        const url: string | undefined = data?.results?.[0]?.urls?.regular || data?.results?.[0]?.urls?.full || data?.results?.[0]?.urls?.small;
        if (url) return url;
      }
    } catch {}
  }

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
    } catch {}
  }

  // Fallback sin API: Unsplash Featured con firma única
  return `https://source.unsplash.com/featured/1280x720/?${encodeURIComponent(query)}&sig=${index + 1}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || '';
    const subject = searchParams.get('subject') || '';
    const n = Math.max(1, Math.min(30, Number(searchParams.get('n') || '30')));
    const aiMode = (searchParams.get('ai') || '').toLowerCase();

    const qBase = buildImageKeywords(topic, subject, '');
    let baseQueries: string[] = Array.from({ length: n }, (_, i) => `${qBase}`);

    // Si se solicita ai=gemini, pedir a Gemini una lista diversa de consultas (en inglés) y usarla
    if (aiMode === 'gemini') {
      try {
        const QueryList = z.object({ queries: z.array(z.string()).min(1) });
        const prompt = `Generate ${n} diverse, concise English image search queries for educational presentation slide backgrounds about topic: "${topic}" and subject: "${subject}".
Requirements:
- Landscape photos, high-quality, classroom-friendly, illustrative
- No quotes, no punctuation at the end, 3-7 words each
- Vary subtopics and perspectives to avoid duplicates

Return ONLY JSON as: {"queries":["..."]}`;
        const timeoutMs = 10000;
        const result: any = await Promise.race([
          ai.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt,
            config: { temperature: 0.6, maxOutputTokens: 1024 },
            output: { schema: QueryList },
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('ai-timeout')), timeoutMs)),
        ]);
        const out = (result?.output || result?.data) as { queries?: string[] } | undefined;
        if (out && Array.isArray(out.queries) && out.queries.length > 0) {
          baseQueries = out.queries.slice(0, n).map(q => q || topic || subject).map(q => encodeURIComponent(q));
        }
      } catch {
        // fallback silencioso a queries heurísticas
      }
    }

    const queries = baseQueries.map((q, i) => `${q}&sig=${i + 1}`);

    const timeout = (ms: number) => new Promise((_res, rej) => setTimeout(() => rej(new Error('timeout')), ms));
    const results = await Promise.all(
      queries.map((q, i) => Promise.race([
        tryProviders(q, i),
        timeout(4000),
      ]).catch(() => `https://source.unsplash.com/featured/1280x720/?${q}`) as Promise<string>)
    );

    // Envolver con proxy para evitar CORS del lado cliente
    const urls = results.map(u => `/api/image-proxy?u=${encodeURIComponent(u)}`);

    return NextResponse.json({ topic, subject, count: urls.length, urls });
  } catch (e: any) {
    return NextResponse.json({ error: 'image-search-failed', details: String(e?.message || e || '') }, { status: 500 });
  }
}
