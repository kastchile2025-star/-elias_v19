
// src/ai/flows/generate-quiz.ts
'use server';

/**
 * @fileOverview Generates a quiz on a specific topic from a selected book.
 * The quiz will have 15 open-ended questions, each with its expected answer/explanation.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function (formatted HTML string).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { bookPDFs } from '@/lib/books-data';

// PDF processing (server-side)
// Using pdfjs-dist in Node/Edge can be tricky; we defensively import and cap sizes.
async function extractTextFromPdfBuffer(buf: ArrayBuffer): Promise<string[]> {
  try {
    // Dynamic import using eval to avoid static bundling
    const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pdfjsLib = await dynamicImport('pdfjs-dist/build/pdf.mjs');
    // Nota: en entorno Node, el worker no es necesario
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;
    const loadingTask = pdfjsLib.getDocument({ data: buf });
    const pdf = await loadingTask.promise;
    const pages: string[] = [];
    const maxPages = Math.min(pdf.numPages || 0, 200);
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = (content.items || [])
          .map((it: any) => (typeof it?.str === 'string' ? it.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pages.push(text);
      } catch {
        pages.push('');
      }
      // Soft cap: stop early if collected enough text
      const totalChars = pages.reduce((a, b) => a + b.length, 0);
      if (totalChars > 150_000) break;
    }
    return pages;
  } catch (e) {
    console.warn('[generate-quiz] PDF extract failed:', e);
    return [];
  }
}

function toDriveDownloadUrl(entry: { pdfUrl?: string; driveId?: string }): string | null {
  if (entry?.driveId) return `https://drive.google.com/uc?export=download&id=${entry.driveId}`;
  if (entry?.pdfUrl) {
    // Convert /file/d/<id>/view?usp=... to direct download
    const m = entry.pdfUrl.match(/\/file\/d\/([^/]+)\/view/);
    if (m && m[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
    return entry.pdfUrl;
  }
  return null;
}

async function fetchPdfArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return null;
    return await resp.arrayBuffer();
  } catch (e) {
    console.warn('[generate-quiz] fetch PDF failed:', e);
    return null;
  }
}

function selectRelevantContext(pages: string[], topic: string, subjectHint?: string, maxChars = 8000): { context: string; usedPageIndexes: number[] } {
  if (!pages?.length) return { context: '', usedPageIndexes: [] };
  const terms = (topic.toLowerCase().split(/[^a-záéíóúñü0-9]+/i).filter(Boolean));
  const subjectTerms = subjectHint ? subjectHint.toLowerCase().split(/[^a-záéíóúñü0-9]+/i).filter(Boolean) : [];
  const scorePage = (txt: string) => {
    const low = txt.toLowerCase();
    let s = 0;
    terms.forEach(t => { if (t && low.includes(t)) s += 3; });
    subjectTerms.forEach(t => { if (t && low.includes(t)) s += 1; });
    return s + Math.min(2, txt.length / 5000); // tiny length prior
  };
  const scored = pages.map((t, idx) => ({ idx, s: scorePage(t), t }));
  scored.sort((a, b) => b.s - a.s);
  const chunks: string[] = [];
  const used: number[] = [];
  let acc = 0;
  for (const it of scored) {
    if (!it.t || it.t.length < 100) continue;
    chunks.push(`(p.${it.idx + 1}) ${it.t}`);
    used.push(it.idx);
    acc += it.t.length;
    if (acc >= maxChars) break;
    if (chunks.length >= 12) break; // cap pages
  }
  return { context: chunks.join('\n\n'), usedPageIndexes: used };
}

async function collectContextForInput(input: GenerateQuizInput): Promise<{ context: string; references: string[] }> {
  // Identify PDFs by course and subject/book
  const course = input.courseName;
  const hint = input.bookTitle;
  const candidates = bookPDFs.filter(b => b.course === course && (b.title === hint || b.subject === hint));
  const refs: string[] = [];
  let combinedContext = '';
  for (const b of candidates) {
    const url = toDriveDownloadUrl(b);
    if (!url) continue;
    const buf = await fetchPdfArrayBuffer(url);
    if (!buf) continue;
    const pages = await extractTextFromPdfBuffer(buf);
    if (!pages.length) continue;
    const { context } = selectRelevantContext(pages, input.topic, b.subject, 6000);
    if (context) {
      combinedContext += (combinedContext ? '\n\n' : '') + `Fuente: ${b.title} (${b.subject})\n` + context;
      refs.push(b.title);
    }
    if (combinedContext.length > 14_000) break; // cap total
  }
  return { context: combinedContext, references: refs };
}

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  bookTitle: z.string().describe('The title of the book.'),
  courseName: z.string().describe('The name of the course (used for context if needed).'),
  language: z.enum(['es', 'en']).describe('The language for the quiz content (e.g., "es" for Spanish, "en" for English).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Schema for the structured output expected from the AI prompt
const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the open-ended question.'),
  expectedAnswer: z.string().describe('A comprehensive ideal answer to the open-ended question, based on the book content. This should be detailed enough for a student to understand the topic thoroughly.'),
});

const AiPromptOutputSchema = z.object({
  quizTitle: z.string().describe('The title of the quiz, formatted as "CUESTIONARIO - [TOPIC_NAME_IN_UPPERCASE]" if language is "es", or "QUIZ - [TOPIC_NAME_IN_UPPERCASE]" if language is "en".'),
  questions: z.array(QuestionSchema).length(15).describe('An array of exactly 15 open-ended quiz questions.'),
});

// Schema for the final output of the flow (formatted HTML string)
const GenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz as a formatted HTML string.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  // Mock mode for development only when NO compatible key is present
  const hasAnyKey = !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);
  if (process.env.NODE_ENV === 'development' && !hasAnyKey) {
    console.log('📝 Running generateQuiz in MOCK mode');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isSpanish = input.language === 'es';
    const titlePrefix = isSpanish ? 'CUESTIONARIO' : 'QUIZ';
    const topicUpper = input.topic.toUpperCase();
    
    const mockQuestions = [
      {
        questionText: isSpanish ? `¿Cuál es el concepto más importante de ${input.topic}?` : `What is the most important concept of ${input.topic}?`,
        expectedAnswer: isSpanish ? `El concepto más importante es la comprensión fundamental de los principios básicos que rigen ${input.topic}.` : `The most important concept is the fundamental understanding of the basic principles that govern ${input.topic}.`
      },
      {
        questionText: isSpanish ? `¿Cómo se relaciona ${input.topic} con otros temas del curso?` : `How does ${input.topic} relate to other course topics?`,
        expectedAnswer: isSpanish ? `${capitalizeFirstLetter(input.topic)} se conecta con múltiples áreas del conocimiento a través de sus aplicaciones prácticas.` : `${capitalizeFirstLetter(input.topic)} connects with multiple knowledge areas through its practical applications.`
      },
      {
        questionText: isSpanish ? `¿Cuáles son las aplicaciones prácticas de ${input.topic}?` : `What are the practical applications of ${input.topic}?`,
        expectedAnswer: isSpanish ? `Las aplicaciones incluyen resolver problemas cotidianos y comprender fenómenos naturales.` : `Applications include solving everyday problems and understanding natural phenomena.`
      }
    ];
    
    // Generate 15 questions by repeating and varying the mock questions
    const questions = [];
    for (let i = 0; i < 15; i++) {
      const baseQuestion = mockQuestions[i % mockQuestions.length];
      questions.push({
        questionText: `${baseQuestion.questionText}`,
        expectedAnswer: capitalizeFirstLetter(baseQuestion.expectedAnswer)
      });
    }
    
    const mockHtml = `
      <div class="quiz-container">
        <h1>${titlePrefix} - ${topicUpper}</h1>
        <p><strong>${isSpanish ? 'Libro:' : 'Book:'}</strong> ${input.bookTitle}</p>
        <p><strong>${isSpanish ? 'Curso:' : 'Course:'}</strong> ${input.courseName}</p>
        
        <br />
        
        ${questions.map((q, index) => `
          <div class="question-block" style="margin-bottom: 2em;">
            <p style="margin-bottom: 1em;"><strong>${index + 1}. ${q.questionText}</strong></p>
            <div class="answer-space">
              <p style="margin-bottom: 0.5em;"><strong>${isSpanish ? 'Respuesta esperada:' : 'Expected answer:'}</strong></p>
              <p style="margin-bottom: 1.5em; text-align: justify;">${q.expectedAnswer}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    return { quiz: mockHtml };
  }

  // Gather PDF context before calling the AI flow
  const { context, references } = await collectContextForInput(input);
  return generateQuizFlow({ ...input, _pdfContext: context, _pdfRefs: references });
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema.extend({
    topic_uppercase: z.string(),
    title_prefix: z.string(),
    _pdfContext: z.string().optional(),
    _pdfRefs: z.array(z.string()).optional(),
  })},
  output: {schema: AiPromptOutputSchema},
  prompt: `You are an expert educator and curriculum designer.
Your task is to generate a comprehensive quiz STRICTLY based on the provided PDF context extracted from the book(s) related to "{{bookTitle}}" and topic "{{topic}}".

Important rules:
- Use ONLY the following extracted PDF context to craft the questions and expected answers.
- If the context is insufficient, prefer concise, general high-level questions but DO NOT invent detailed facts not present in the context.
- Keep all content in {{{language}}}.

PDF CONTEXT (may be partial and noisy, includes page markers like (p.12)):
"""
{{_pdfContext}}
"""

The quiz MUST adhere to the following structure:
1.  **Quiz Title**: The title must be exactly "{{title_prefix}} - {{topic_uppercase}}".
2.  **Number of Questions**: Generate exactly 15 unique open-ended questions.
3.  **For each question, provide**:
    *   \`questionText\`: The clear and concise text of the open-ended question.
    *   \`expectedAnswer\`: A comprehensive ideal answer to the question, referencing concepts from the book "{{bookTitle}}" where possible. This answer should be detailed and clear, suitable for study and understanding.

All content (title, questions, answers) should be directly relevant to the topic "{{topic}}" as covered in the provided PDF context for "{{bookTitle}}". Ensure the language of all generated content is {{{language}}}.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    // Extend input schema at runtime for internal fields
    inputSchema: GenerateQuizInputSchema.extend({ _pdfContext: z.string().optional(), _pdfRefs: z.array(z.string()).optional() }),
    outputSchema: GenerateQuizOutputSchema, // Flow returns the HTML string
  },
  async (input: GenerateQuizInput & { _pdfContext?: string; _pdfRefs?: string[] }) => {
    const titlePrefix = input.language === 'es' ? 'CUESTIONARIO' : 'QUIZ';
    const promptInput = {
      ...input,
      topic_uppercase: input.topic.toUpperCase(),
      title_prefix: titlePrefix,
      _pdfContext: input._pdfContext || '',
    };
    const {output} = await generateQuizPrompt(promptInput);

    if (!output || !output.questions || output.questions.length === 0) {
      throw new Error('AI failed to generate quiz questions.');
    }

    const isSpanish = input.language === 'es';
  let formattedQuizHtml = `<h2>${output.quizTitle}</h2>`;
    formattedQuizHtml += `<p><strong>${isSpanish ? 'Libro:' : 'Book:'}</strong> ${input.bookTitle}</p>`;
    formattedQuizHtml += `<p><strong>${isSpanish ? 'Curso:' : 'Course:'}</strong> ${input.courseName}</p>`;
    formattedQuizHtml += `<br /><br />`;
    
    output.questions.forEach((q, index) => {
      formattedQuizHtml += `<p style="margin-bottom: 1em;"><strong>${index + 1}. ${q.questionText}</strong></p>`;
      const answerLabel = input.language === 'es' ? 'Respuesta esperada' : 'Expected answer';
      formattedQuizHtml += `<p style="margin-top: 0.5em; margin-bottom: 0.5em;"><strong>${answerLabel}:</strong></p>`;
      // Format the expected answer for better readability, e.g., convert newlines to <br>
      const formattedAnswer = capitalizeFirstLetter(q.expectedAnswer.replace(/\n/g, '<br />'));
      formattedQuizHtml += `<p style="margin-top: 0.25em; margin-bottom: 2em; text-align: justify;">${formattedAnswer}</p>`;
      
      if (index < output.questions.length - 1) {
        formattedQuizHtml += '<hr style="margin-top: 1rem; margin-bottom: 1.5rem; border-top: 1px solid #e5e7eb;" />';
      }
    });

    // Append references if available
    if (Array.isArray(input._pdfRefs) && input._pdfRefs.length) {
      formattedQuizHtml += `<hr style="margin-top: 1rem; margin-bottom: 1rem; border-top: 1px solid #e5e7eb;" />`;
      const refsTitle = isSpanish ? 'Referencias (PDF)' : 'References (PDF)';
      formattedQuizHtml += `<p><strong>${refsTitle}:</strong> ${input._pdfRefs.join('; ')}</p>`;
    }

    return { quiz: formattedQuizHtml };
  }
);
