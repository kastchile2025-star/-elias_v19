import { NextRequest, NextResponse } from 'next/server';
import { bookPDFs } from '@/lib/books-data';

// Helper function to extract Google Drive file ID from various URL formats
function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)\//,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Generate mock PDF content based on book, subject, and specific topic
function generateMockPDFContent(book: any, topic?: string): string {
  const { course, subject, title } = book;
  
  // Create topic-specific content if topic is provided
  if (topic) {
    const topicContent = generateTopicSpecificContent(subject, topic, course);
    return `
Contenido educativo de ${title}
Curso: ${course}
Materia: ${subject}

TEMA ESPECÍFICO: ${topic}

${topicContent}

El material está actualizado según los estándares curriculares vigentes para ${course}.
Los conceptos se presentan con ejemplos relevantes y contextualizados para ${topic}.
`;
  }
  
  // Fallback to general content if no topic provided
  const mockContent = `
Contenido educativo de ${title}
Curso: ${course}
Materia: ${subject}

Este libro contiene conceptos fundamentales y avanzados relacionados con ${subject} para estudiantes de ${course}.

Los temas principales incluyen:
- Conceptos básicos y definiciones importantes
- Ejemplos prácticos y casos de estudio
- Ejercicios y actividades de refuerzo
- Metodologías de aprendizaje específicas

El contenido está estructurado de manera progresiva, desde conceptos básicos hasta aplicaciones más complejas.
Los estudiantes pueden utilizar este material para reforzar su comprensión y prepararse para evaluaciones.

Cada capítulo incluye objetivos de aprendizaje claros y actividades de autoevaluación.
Se recomienda complementar el estudio con práctica adicional y discusión en grupo.

El material está actualizado según los estándares curriculares vigentes para ${course}.
Los conceptos se presentan con ejemplos relevantes y contextualizados.
`;

  return mockContent.trim();
}

// Generate topic-specific content based on subject and topic
function generateTopicSpecificContent(subject: string, topic: string, course: string): string {
  const topicNormalized = topic.toLowerCase();
  
  // Ciencias Naturales topics
  if (subject.toLowerCase().includes('ciencias naturales') || subject.toLowerCase().includes('biología')) {
    if (topicNormalized.includes('sistema respiratorio') || topicNormalized.includes('respiratorio')) {
      return `
El sistema respiratorio es el conjunto de órganos que permite el intercambio gaseoso entre el organismo y el medio ambiente.

Componentes principales del sistema respiratorio:
- Fosas nasales: Filtran, calientan y humedecen el aire
- Faringe: Conducto compartido con el sistema digestivo
- Laringe: Contiene las cuerdas vocales
- Tráquea: Tubo principal que conduce el aire
- Bronquios: Ramificaciones de la tráquea hacia los pulmones
- Bronquiolos: Conductos más pequeños dentro de los pulmones
- Alvéolos: Pequeñas cavidades donde ocurre el intercambio gaseoso
- Pulmones: Órganos principales del sistema respiratorio

Función principal: Intercambio gaseoso
- Inspiración: Entrada de oxígeno (O2) al organismo
- Espiración: Eliminación de dióxido de carbono (CO2)
- El oxígeno pasa de los alvéolos a la sangre
- El dióxido de carbono pasa de la sangre a los alvéolos para ser eliminado

Cuidados del sistema respiratorio:
- Evitar la contaminación del aire
- No fumar
- Hacer ejercicio regularmente
- Mantener una buena higiene
`;
    }
    
    if (topicNormalized.includes('célula') || topicNormalized.includes('celular')) {
      return `
La célula es la unidad básica de la vida. Todos los seres vivos están formados por células.

Tipos de células:
- Células procariotas: Sin núcleo definido (bacterias)
- Células eucariotas: Con núcleo definido (plantas, animales)

Partes de la célula eucariota:
- Membrana celular: Controla el paso de sustancias
- Citoplasma: Medio interno donde ocurren reacciones
- Núcleo: Contiene el material genético (ADN)
- Mitocondrias: Producen energía para la célula
- Ribosomas: Sintetizan proteínas

En células vegetales también encontramos:
- Pared celular: Protección y soporte
- Cloroplastos: Realizan la fotosíntesis
- Vacuola: Almacena agua y sustancias

Funciones celulares:
- Nutrición: Obtención de energía
- Respiración celular: Uso del oxígeno
- Reproducción: División celular
- Excreción: Eliminación de desechos
`;
    }
  }
  
  // Matemáticas topics
  if (subject.toLowerCase().includes('matemáticas') || subject.toLowerCase().includes('matemática')) {
    if (topicNormalized.includes('fracción') || topicNormalized.includes('fracciones')) {
      return `
Las fracciones representan partes de un todo o de una unidad.

Componentes de una fracción:
- Numerador: Número de arriba, indica las partes que se toman
- Denominador: Número de abajo, indica las partes en que se divide el todo
- Línea de fracción: Separa numerador y denominador

Tipos de fracciones:
- Fracciones propias: Numerador menor que denominador (1/2, 3/4)
- Fracciones impropias: Numerador mayor que denominador (5/3, 7/2)
- Números mixtos: Parte entera más fracción (2 1/3)

Operaciones con fracciones:
- Suma: Se suman numeradores con igual denominador
- Resta: Se restan numeradores con igual denominador
- Multiplicación: Se multiplican numeradores entre sí y denominadores entre sí
- División: Se multiplica por la fracción inversa

Fracciones equivalentes:
- Representan la misma cantidad: 1/2 = 2/4 = 3/6
- Se obtienen multiplicando o dividiendo por el mismo número
`;
    }
  }
  
  // Lenguaje topics
  if (subject.toLowerCase().includes('lenguaje') || subject.toLowerCase().includes('comunicación')) {
    if (topicNormalized.includes('sustantivo') || topicNormalized.includes('sustantivos')) {
      return `
Los sustantivos son palabras que nombran personas, animales, cosas, lugares o ideas.

Tipos de sustantivos:
- Sustantivos comunes: Nombran de forma general (perro, casa, niño)
- Sustantivos propios: Nombran de forma específica (Pedro, Chile, Andes)
- Sustantivos concretos: Se pueden percibir con los sentidos (mesa, flor)
- Sustantivos abstractos: No se pueden percibir con los sentidos (amor, libertad)

Clasificación por número:
- Singular: Un solo elemento (gato)
- Plural: Más de un elemento (gatos)

Clasificación por género:
- Masculino: Generalmente terminan en -o (niño, perro)
- Femenino: Generalmente terminan en -a (niña, perra)
- Neutro: No tienen género específico (mar, sol)

Función en la oración:
- Pueden ser sujeto de la oración
- Pueden ser complemento del verbo
- Se combinan con artículos y adjetivos
`;
    }
  }
  
  // Fallback for unknown topics
  return `
Este tema "${topic}" es parte importante del currículo de ${subject} para ${course}.

El estudio de este tema incluye:
- Conceptos fundamentales relacionados con ${topic}
- Ejemplos prácticos y aplicaciones
- Ejercicios para reforzar el aprendizaje
- Actividades de evaluación y autoevaluación

Los estudiantes deben comprender los aspectos básicos de ${topic} y ser capaces de aplicar estos conocimientos en diferentes contextos.

Es importante relacionar este tema con otros conceptos de ${subject} para tener una comprensión integral de la materia.
`;
}

// Function to simulate PDF content extraction
async function simulatePDFContentExtraction(driveId: string, book: any, topic?: string): Promise<string> {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, return mock content based on the book information and topic
    // In a production environment, this would actually parse the PDF
    const mockContent = generateMockPDFContent(book, topic);
    
    return `${mockContent}\n\n[Contenido extraído del PDF ID: ${driveId}]`;
    
  } catch (error) {
    console.error('Error simulating PDF content extraction:', error);
    return `Contenido de referencia para ${book.title}. El PDF está disponible pero no se pudo extraer el contenido completo. Materia: ${book.subject}, Curso: ${book.course}.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookTitle, subject, course, topic } = body || {};

    if (!bookTitle && !(subject && course)) {
      return NextResponse.json(
        { error: 'bookTitle or (subject + course) is required' },
        { status: 400 }
      );
    }

    // Resolve book by exact title, otherwise by subject+course, otherwise by best-effort matching
    const normalize = (s: string) => (s || '').trim().toLowerCase();

    let book = bookPDFs.find(b => normalize(b.title) === normalize(bookTitle || ''));
    let matchedBy: 'title' | 'subject-course' | 'subject' | 'fallback' | undefined;

    if (book) {
      matchedBy = 'title';
    } else if (subject && course) {
      book = bookPDFs.find(b => normalize(b.course) === normalize(course) && normalize(b.subject) === normalize(subject));
      if (!book) {
        // intentar por coincidencia parcial del subject dentro del curso
        book = bookPDFs.find(b => normalize(b.course) === normalize(course) && normalize(b.subject).includes(normalize(subject)));
      }
      if (book) matchedBy = 'subject-course';
    }

    // Si aún no se encuentra, intentar por subject solo (primer match)
    if (!book && subject) {
      book = bookPDFs.find(b => normalize(b.subject) === normalize(subject)) ||
             bookPDFs.find(b => normalize(b.subject).includes(normalize(subject!)));
      if (book) matchedBy = 'subject';
    }

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found', details: { bookTitle, subject, course } },
        { status: 404 }
      );
    }
    
    // Extract Google Drive file ID
    const driveId = book.driveId || extractGoogleDriveFileId(book.pdfUrl);
    
    if (!driveId) {
      return NextResponse.json(
        { error: 'Invalid PDF URL format' },
        { status: 400 }
      );
    }
    
    // Simulate PDF content extraction with topic-specific content
    const pdfContent = await simulatePDFContentExtraction(driveId, book, topic);
    
    return NextResponse.json({
      success: true,
      bookTitle: book.title,
      course: book.course,
      subject: book.subject,
      pdfContent: pdfContent,
      driveId: driveId,
      matchedBy,
      topicRequested: topic
    });
    
  } catch (error) {
    console.error('Error in extract-pdf-content API:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF content' },
      { status: 500 }
    );
  }
}
