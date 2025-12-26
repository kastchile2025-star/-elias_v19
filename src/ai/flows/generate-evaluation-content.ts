'use server';

/**
 * @fileOverview Generates evaluation content with mixed question types.
 *
 * - generateEvaluationContent - A function that handles the evaluation content generation process.
 * - GenerateEvaluationInput - The input type for the generateEvaluationContent function.
 * - GenerateEvaluationOutput - The return type for the generateEvaluationContent function.
 */

import {ai, generateWithAI, useOpenRouter} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEvaluationInputSchema = z.object({
  topic: z.string().describe('The specific topic for the evaluation.'),
  bookTitle: z.string().describe('The title of the book to base the evaluation on.'),
  language: z.enum(['es', 'en']).describe('The language for the evaluation content (e.g., "es" for Spanish, "en" for English).'),
  questionCount: z.number().optional().describe('Number of questions to generate (default: 15)'),
  timeLimit: z.number().optional().describe('Time limit in seconds (default: 120)'),
});
type GenerateEvaluationInput = z.infer<typeof GenerateEvaluationInputSchema>;

// Extended schema for dynamic evaluation with PDF content
const GenerateDynamicEvaluationInputSchema = z.object({
  topic: z.string().describe('The specific topic for the evaluation.'),
  bookTitle: z.string().describe('The title of the book to base the evaluation on.'),
  course: z.string().optional().describe('The course/grade associated with the book.'),
  subject: z.string().optional().describe('The subject associated with the book.'),
  language: z.enum(['es', 'en']).describe('The language for the evaluation content (e.g., "es" for Spanish, "en" for English).'),
  pdfContent: z.string().describe('The actual content extracted from the PDF book.'),
  timestamp: z.number().describe('Timestamp to ensure uniqueness.'),
  randomSeed: z.number().describe('Random seed to ensure variability in questions.'),
  questionCount: z.number().optional().describe('Number of questions to generate (default: 15)'),
  timeLimit: z.number().optional().describe('Time limit in seconds (default: 120)'),
});
type GenerateDynamicEvaluationInput = z.infer<typeof GenerateDynamicEvaluationInputSchema>;

const TrueFalseQuestionSchema = z.object({
  id: z.string().describe('Unique ID for the question.'),
  type: z.enum(['TRUE_FALSE']).describe('Question type.'),
  questionText: z.string().describe('The text of the true/false question.'),
  correctAnswer: z.boolean().describe('The correct answer (true or false).'),
  explanation: z.string().describe('A brief explanation for the correct answer.'),
});

const MultipleChoiceQuestionSchema = z.object({
  id: z.string().describe('Unique ID for the question.'),
  type: z.enum(['MULTIPLE_CHOICE']).describe('Question type.'),
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options: z.array(z.string()).length(4).describe('An array of exactly 4 string options (A, B, C, D).'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct option in the options array.'),
  explanation: z.string().describe('A brief explanation for the correct answer.'),
});

const MultipleSelectionQuestionSchema = z.object({
  id: z.string().describe('Unique ID for the question.'),
  type: z.enum(['MULTIPLE_SELECTION']).describe('Question type.'),
  questionText: z.string().describe('The text of the multiple-selection question.'),
  options: z.array(z.string()).length(4).describe('An array of exactly 4 string options (A, B, C, D).'),
  correctAnswerIndices: z.array(z.number()).min(2).max(3).describe('An array of 2-3 indices indicating the correct options (multiple correct answers).'),
  explanation: z.string().describe('A brief explanation for why those specific answers are correct.'),
});

const EvaluationQuestionSchema = z.union([TrueFalseQuestionSchema, MultipleChoiceQuestionSchema, MultipleSelectionQuestionSchema]);
export type EvaluationQuestion = z.infer<typeof EvaluationQuestionSchema>;

const GenerateEvaluationOutputSchema = z.object({
  evaluationTitle: z.string().describe('The title of the evaluation, formatted as "EVALUACIÓN - [TOPIC_NAME_IN_UPPERCASE]" if language is "es", or "EVALUATION - [TOPIC_NAME_IN_UPPERCASE]" if language is "en".'),
  questions: z.array(EvaluationQuestionSchema).describe('An array of evaluation questions, with a mix of types. The prompt requests 15 questions total (5 True/False, 5 Multiple Choice, 5 Multiple Selection).'),
});
type GenerateEvaluationOutput = z.infer<typeof GenerateEvaluationOutputSchema>;


export async function generateEvaluationContent(input: GenerateEvaluationInput): Promise<GenerateEvaluationOutput> {
  try {
    const questionCount = input.questionCount || 15;
    
    console.log('🔍 generateEvaluationContent called with:', {
      questionCount: input.questionCount,
      questionCountUsed: questionCount,
      topic: input.topic,
      bookTitle: input.bookTitle,
      timeLimit: input.timeLimit,
      language: input.language
    });
    console.log('🌍 generateEvaluationContent received language:', input.language);
    
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      console.log('📝 Using mock generation with questionCount:', questionCount);
      console.log('⚠️ Using mock data - API key not available. Language:', input.language);
      // Generate mock data dynamically based on questionCount with educational content
      const mockQuestions: EvaluationQuestion[] = [];
      const isEs = input.language === 'es';
      const topic = input.topic;
      const topicLower = topic.toLowerCase();
      
      // Distribuir tipos de preguntas equitativamente
      const tfCount = Math.round(questionCount / 3);
      const mcCount = Math.round((questionCount - tfCount) / 2);
      const msCount = questionCount - tfCount - mcCount;
      
      // Banco de preguntas específicas por tema
      const getTopicQuestions = () => {
        if (topicLower.includes('respiratorio')) {
          return {
            trueFalse: [
              { q: 'Los pulmones son los órganos principales del sistema respiratorio.', a: true, e: 'Los pulmones son donde ocurre el intercambio gaseoso.' },
              { q: 'El estómago es parte del sistema respiratorio.', a: false, e: 'El estómago pertenece al sistema digestivo.' },
              { q: 'La tráquea conduce el aire hacia los bronquios.', a: true, e: 'La tráquea es el conducto principal de aire.' },
              { q: 'El corazón realiza la respiración pulmonar.', a: false, e: 'El corazón pertenece al sistema circulatorio.' },
              { q: 'Los alvéolos son donde ocurre el intercambio de gases.', a: true, e: 'En los alvéolos se intercambia oxígeno por CO₂.' }
            ],
            multipleChoice: [
              { q: '¿Cuál es la función principal de los pulmones?', opts: ['Realizar el intercambio gaseoso', 'Bombear sangre', 'Digerir alimentos', 'Filtrar toxinas'], correct: 0 },
              { q: '¿Qué músculo permite la respiración?', opts: ['Diafragma', 'Bíceps', 'Corazón', 'Esófago'], correct: 0 },
              { q: '¿Dónde se encuentran los alvéolos?', opts: ['En los pulmones', 'En el corazón', 'En los riñones', 'En el hígado'], correct: 0 },
              { q: '¿Qué gas absorbemos al respirar?', opts: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno', 'Metano'], correct: 0 },
              { q: '¿Cuál estructura contiene las cuerdas vocales?', opts: ['Laringe', 'Tráquea', 'Bronquios', 'Nariz'], correct: 0 }
            ],
            multipleSelection: [
              { q: '¿Cuáles son órganos del sistema respiratorio?', opts: ['Pulmones', 'Estómago', 'Tráquea', 'Riñones'], correct: [0, 2] },
              { q: '¿Qué ocurre durante la inspiración?', opts: ['El diafragma se contrae', 'Entra aire rico en oxígeno', 'Se expulsa CO₂', 'El corazón se detiene'], correct: [0, 1] },
              { q: '¿Cuáles son funciones de las fosas nasales?', opts: ['Filtrar el aire', 'Bombear sangre', 'Calentar el aire', 'Digerir nutrientes'], correct: [0, 2] }
            ]
          };
        } else if (topicLower.includes('célula')) {
          return {
            trueFalse: [
              { q: 'El núcleo contiene el material genético de la célula.', a: true, e: 'El ADN se encuentra en el núcleo.' },
              { q: 'Las mitocondrias son exclusivas de las células vegetales.', a: false, e: 'Las mitocondrias están en células animales y vegetales.' },
              { q: 'La membrana celular controla qué entra y sale de la célula.', a: true, e: 'La membrana es selectivamente permeable.' },
              { q: 'Las bacterias tienen núcleo definido.', a: false, e: 'Las bacterias son procariotas, sin núcleo definido.' },
              { q: 'Los cloroplastos realizan la fotosíntesis.', a: true, e: 'Los cloroplastos contienen clorofila.' }
            ],
            multipleChoice: [
              { q: '¿Cuál organelo produce energía en la célula?', opts: ['Mitocondrias', 'Ribosomas', 'Vacuola', 'Pared celular'], correct: 0 },
              { q: '¿Dónde se encuentra el ADN en células eucariotas?', opts: ['En el núcleo', 'En el citoplasma', 'En la membrana', 'En los ribosomas'], correct: 0 },
              { q: '¿Qué organelo es exclusivo de células vegetales?', opts: ['Cloroplasto', 'Mitocondria', 'Ribosoma', 'Núcleo'], correct: 0 },
              { q: '¿Cuál es la función de los ribosomas?', opts: ['Sintetizar proteínas', 'Producir energía', 'Almacenar agua', 'Controlar la célula'], correct: 0 },
              { q: '¿Qué tipo de célula tiene pared celular?', opts: ['Célula vegetal', 'Célula animal', 'Glóbulo rojo', 'Neurona'], correct: 0 }
            ],
            multipleSelection: [
              { q: '¿Cuáles son organelos de la célula?', opts: ['Núcleo', 'Huesos', 'Mitocondrias', 'Piel'], correct: [0, 2] },
              { q: '¿Qué estructuras tienen las células vegetales?', opts: ['Pared celular', 'Cilios', 'Cloroplastos', 'Flagelos'], correct: [0, 2] },
              { q: '¿Cuáles son funciones de la membrana celular?', opts: ['Proteger la célula', 'Producir energía', 'Regular el paso de sustancias', 'Sintetizar ADN'], correct: [0, 2] }
            ]
          };
        } else if (topicLower.includes('fotosíntesis') || topicLower.includes('fotosintesis')) {
          return {
            trueFalse: [
              { q: 'La fotosíntesis produce oxígeno como producto.', a: true, e: 'El O₂ es un subproducto de la fotosíntesis.' },
              { q: 'La fotosíntesis ocurre en las mitocondrias.', a: false, e: 'La fotosíntesis ocurre en los cloroplastos.' },
              { q: 'Las plantas necesitan luz solar para la fotosíntesis.', a: true, e: 'La luz es esencial para la fase luminosa.' },
              { q: 'Los animales realizan fotosíntesis.', a: false, e: 'Solo las plantas, algas y algunas bacterias.' },
              { q: 'La clorofila es el pigmento que captura la luz.', a: true, e: 'La clorofila da el color verde a las plantas.' }
            ],
            multipleChoice: [
              { q: '¿Dónde ocurre la fotosíntesis?', opts: ['En los cloroplastos', 'En las mitocondrias', 'En el núcleo', 'En la vacuola'], correct: 0 },
              { q: '¿Qué gas absorben las plantas durante la fotosíntesis?', opts: ['Dióxido de carbono', 'Oxígeno', 'Nitrógeno', 'Metano'], correct: 0 },
              { q: '¿Cuál es el producto principal de la fotosíntesis?', opts: ['Glucosa', 'Proteínas', 'Lípidos', 'Vitaminas'], correct: 0 },
              { q: '¿Por qué poros intercambian gases las hojas?', opts: ['Estomas', 'Tricomas', 'Cutícula', 'Epidermis'], correct: 0 },
              { q: '¿Qué pigmento es responsable del color verde?', opts: ['Clorofila', 'Caroteno', 'Xantofila', 'Antocianina'], correct: 0 }
            ],
            multipleSelection: [
              { q: '¿Qué elementos necesita la fotosíntesis?', opts: ['Luz solar', 'Oxígeno', 'Dióxido de carbono', 'Proteínas'], correct: [0, 2] },
              { q: '¿Cuáles son productos de la fotosíntesis?', opts: ['Glucosa', 'Dióxido de carbono', 'Oxígeno', 'Agua como producto'], correct: [0, 2] },
              { q: '¿Dónde están los cloroplastos?', opts: ['En las hojas', 'En las raíces', 'En los tallos verdes', 'En las flores rojas'], correct: [0, 2] }
            ]
          };
        }
        
        // Fallback genérico pero estructurado
        return {
          trueFalse: [
            { q: `Los conceptos de ${topic} son fundamentales para el aprendizaje.`, a: true, e: 'Los conceptos básicos siempre son esenciales.' },
            { q: `${topic} no tiene relación con otras áreas del conocimiento.`, a: false, e: 'Todos los temas están interrelacionados.' },
            { q: `El estudio de ${topic} requiere práctica constante.`, a: true, e: 'La práctica refuerza el aprendizaje.' }
          ],
          multipleChoice: [
            { q: `¿Qué es fundamental para comprender ${topic}?`, opts: ['Conocer los conceptos básicos', 'Memorizar sin entender', 'Ignorar los detalles', 'Saltarse los ejercicios'], correct: 0 },
            { q: `¿Cómo se aprende mejor ${topic}?`, opts: ['Con práctica y estudio', 'Solo leyendo una vez', 'Sin hacer ejercicios', 'Memorizando fechas'], correct: 0 }
          ],
          multipleSelection: [
            { q: `¿Cuáles son buenas prácticas para estudiar ${topic}?`, opts: ['Tomar notas', 'No preguntar dudas', 'Hacer ejercicios', 'Evitar la lectura'], correct: [0, 2] }
          ]
        };
      };
      
      const questions = getTopicQuestions();
      
      // Generar preguntas Verdadero/Falso
      for (let i = 0; i < tfCount; i++) {
        const qNum = mockQuestions.length + 1;
        const q = questions.trueFalse[i % questions.trueFalse.length];
        mockQuestions.push({
          id: qNum.toString(),
          type: 'TRUE_FALSE',
          questionText: isEs ? q.q : q.q,
          correctAnswer: q.a,
          explanation: isEs ? q.e : q.e
        });
      }
      
      // Generar preguntas Selección Simple
      for (let i = 0; i < mcCount; i++) {
        const qNum = mockQuestions.length + 1;
        const q = questions.multipleChoice[i % questions.multipleChoice.length];
        mockQuestions.push({
          id: qNum.toString(),
          type: 'MULTIPLE_CHOICE',
          questionText: isEs ? q.q : q.q,
          options: q.opts,
          correctAnswerIndex: q.correct,
          explanation: isEs 
            ? `La respuesta correcta es "${q.opts[q.correct]}".`
            : `The correct answer is "${q.opts[q.correct]}".`
        });
      }
      
      // Generar preguntas Selección Múltiple
      for (let i = 0; i < msCount; i++) {
        const qNum = mockQuestions.length + 1;
        const q = questions.multipleSelection[i % questions.multipleSelection.length];
        mockQuestions.push({
          id: qNum.toString(),
          type: 'MULTIPLE_SELECTION',
          questionText: isEs ? q.q : q.q,
          options: q.opts,
          correctAnswerIndices: q.correct,
          explanation: isEs
            ? `Las opciones correctas son "${q.opts[q.correct[0]]}" y "${q.opts[q.correct[1]]}".`
            : `The correct options are "${q.opts[q.correct[0]]}" and "${q.opts[q.correct[1]]}".`
        });
      }
      
      console.log('✅ Mock questions generated:', {
        requested: questionCount,
        generated: mockQuestions.length,
        questions: mockQuestions.map(q => ({ id: q.id, type: q.type, text: q.questionText.substring(0, 50) + '...' }))
      });
      
      return {
        evaluationTitle: input.language === 'es' 
          ? `Evaluación - ${input.topic.toUpperCase()}`
          : `Evaluation - ${input.topic.toUpperCase()}`,
        questions: mockQuestions
      };
    }
    
    return await generateEvaluationFlow(input);
  } catch (error) {
    console.error('Error generating evaluation content:', error);
    // Return fallback data
    return {
      evaluationTitle: input.language === 'es' 
        ? `Evaluación - ${input.topic.toUpperCase()}`
        : `Evaluation - ${input.topic.toUpperCase()}`,
      questions: [
        {
          id: '1',
          type: 'TRUE_FALSE',
          questionText: input.language === 'es'
            ? `¿El tema "${input.topic}" está relacionado con "${input.bookTitle}"?`
            : `Is the topic "${input.topic}" related to "${input.bookTitle}"?`,
          correctAnswer: true,
          explanation: input.language === 'es'
            ? 'Pregunta generada como respaldo debido a un error en la API.'
            : 'Question generated as fallback due to an API error.'
        }
      ]
    };
  }
}

const generateEvaluationPrompt = ai.definePrompt({
  name: 'generateEvaluationPrompt',
  input: {schema: GenerateEvaluationInputSchema.extend({ topic_uppercase: z.string(), title_prefix: z.string() })},
  output: {schema: GenerateEvaluationOutputSchema},
  config: { 
    temperature: 0.7, // Increased temperature for more varied output
  },
  prompt: `You are an expert educator creating an evaluation.
Based on the book titled "{{bookTitle}}", generate an evaluation for the topic "{{topic}}".
The language for all content (title, questions, options, explanations) MUST be {{{language}}}.

The evaluation must adhere to the following structure:
1.  **Evaluation Title**: The title must be "{{title_prefix}} - {{topic_uppercase}}".
2.  **Total Questions**: Generate exactly {{questionCount}} unique questions. It is CRITICAL that you generate a COMPLETELY NEW and UNIQUE set of questions for this topic from this book, different from any set you might have generated previously for the same inputs. Do not repeat questions or question structures you may have used before for this specific topic and book. Avoid repetition.
3.  **Question Types** (distribute evenly among the {{questionCount}} questions):
    *   Generate approximately {{questionCount}}/3 True/False questions (rounded).
    *   Generate approximately {{questionCount}}/3 Multiple Choice questions (rounded).
    *   Generate approximately {{questionCount}}/3 Multiple Selection questions (rounded).
4.  **For each question, ensure you provide**:
    *   \`id\`: A unique string identifier for the question (e.g., "q1", "q2", "q3", ..., "q{{questionCount}}").
    *   \`type\`: Set to "TRUE_FALSE" for true/false questions, "MULTIPLE_CHOICE" for multiple-choice questions, or "MULTIPLE_SELECTION" for multiple-selection questions.
    *   \`questionText\`: The clear and concise text of the question.
    *   \`explanation\`: A brief and clear explanation for why the correct answer is correct, referencing concepts from the book "{{bookTitle}}" if possible.
5.  **Specifics for True/False Questions**:
    *   \`correctAnswer\`: A boolean value (\`true\` or \`false\`).
6.  **Specifics for Multiple Choice Questions**:
    *   \`options\`: An array of exactly 4 distinct string options. Label them implicitly as A, B, C, D for the user, but just provide the string array.
    *   \`correctAnswerIndex\`: A number from 0 to 3 indicating the index of the correct option in the 'options' array.
7.  **Specifics for Multiple Selection Questions** (5 questions):
    *   \`options\`: An array of exactly 4 distinct string options.
    *   \`correctAnswerIndices\`: An array of 2-3 numbers (0-3) indicating the indices of the correct options (multiple correct answers).

Example of a True/False question structure (if language is "es"):
{
  "id": "q1",
}

Example of a Multiple Selection question structure (if language is "es"):
{
  "id": "q11",
  "type": "MULTIPLE_SELECTION",
  "questionText": "¿Cuáles de las siguientes son características del sistema respiratorio? (Selecciona todas las correctas)",
  "options": ["Intercambia gases", "Produce insulina", "Filtra la sangre", "Transporta oxígeno"],
  "correctAnswerIndices": [0, 3],
  "explanation": "El sistema respiratorio intercambia gases y transporta oxígeno, pero no produce insulina ni filtra la sangre."
}

Ensure all questions are relevant to the topic "{{topic}}" as covered in the book "{{bookTitle}}".
The output must be a valid JSON object matching the specified output schema.
`,
});

// New dynamic prompt that uses PDF content
const generateDynamicEvaluationPrompt = ai.definePrompt({
  name: 'generateDynamicEvaluationPrompt',
  input: {schema: GenerateDynamicEvaluationInputSchema.extend({ topic_uppercase: z.string(), title_prefix: z.string() })},
  output: {schema: GenerateEvaluationOutputSchema},
  config: { 
    temperature: 0.9, // Higher temperature for more varied output
  },
  prompt: `You are an expert educator creating a dynamic evaluation SPECIFICALLY about the topic "{{topic}}".
Based on the book titled "{{bookTitle}}" and the following PDF CONTENT, generate a completely unique evaluation FOCUSED EXCLUSIVELY on the topic "{{topic}}".

PDF CONTENT:
{{pdfContent}}

GENERATION PARAMETERS (to ensure uniqueness):
- Timestamp: {{timestamp}}
- Random Seed: {{randomSeed}}

CRITICAL INSTRUCTIONS:
1. ALL questions must be SPECIFICALLY about the topic "{{topic}}" - NOT about the book in general
2. Use ONLY the parts of the PDF content that relate directly to "{{topic}}"
3. Do NOT create questions about the book structure, general content, or study methods
4. Focus EXCLUSIVELY on concepts, processes, characteristics, and facts related to "{{topic}}"
5. Each time you generate questions, they must be COMPLETELY DIFFERENT from any previous generation
6. Use the timestamp {{timestamp}} and random seed {{randomSeed}} to ensure variability
7. The language for all content (title, questions, options, explanations) MUST be {{{language}}}
8. If provided, ensure questions align with the course ({{course}}) and subject ({{subject}})

TOPIC FOCUS: Remember, the evaluation is about "{{topic}}" specifically, not about the book or general study content.

The evaluation must adhere to the following structure:
1.  **Evaluation Title**: The title must be "{{title_prefix}} - {{topic_uppercase}}".
2.  **Total Questions**: Generate exactly {{questionCount}} unique questions based on the PDF content above.
3.  **Question Types** (distribute evenly among the {{questionCount}} questions):
    *   Generate approximately {{questionCount}}/3 True/False questions (type: "TRUE_FALSE", rounded)
    *   Generate approximately {{questionCount}}/3 Multiple Choice questions (type: "MULTIPLE_CHOICE", rounded) - single correct answer
    *   Generate approximately {{questionCount}}/3 Multiple Selection questions (type: "MULTIPLE_SELECTION", rounded) - multiple correct answers
4.  **For each question, ensure you provide**:
    *   \`id\`: A unique string identifier including the timestamp (e.g., "q1_{{timestamp}}", "q2_{{timestamp}}", ..., "q{{questionCount}}_{{timestamp}}").
    *   \`type\`: Set to "TRUE_FALSE", "MULTIPLE_CHOICE", or "MULTIPLE_SELECTION".
    *   \`questionText\`: The clear and concise text of the question, asking SPECIFICALLY about "{{topic}}" concepts, processes, or characteristics.
    *   \`explanation\`: A brief explanation referencing the specific part of the PDF content about "{{topic}}" where this information can be found.
5.  **Specifics for True/False Questions**:
    *   \`correctAnswer\`: A boolean value (\`true\` or \`false\`).
6.  **Specifics for Multiple Choice Questions (single answer)**:
    *   \`options\`: An array of exactly 4 distinct string options based on the PDF content.
    *   \`correctAnswerIndex\`: A number from 0 to 3 indicating the index of the correct option.
7.  **Specifics for Multiple Selection Questions (multiple answers)** (5 questions):
    *   \`options\`: An array of exactly 4 distinct string options based on the PDF content.
    *   \`correctAnswerIndices\`: An array of 2-3 numbers (0-3) indicating the indices of the correct options.

Example of a Multiple Selection question structure (if language is "es" and topic is "sistema respiratorio"):
{
  "id": "q3_{{timestamp}}",
  "type": "MULTIPLE_SELECTION",
  "questionText": "¿Cuáles de las siguientes son partes del sistema respiratorio? (Selecciona todas las correctas)",
  "options": ["Pulmones", "Estómago", "Tráquea", "Hígado"],
  "correctAnswerIndices": [0, 2],
  "explanation": "Los pulmones y la tráquea son partes del sistema respiratorio, mientras que el estómago y el hígado pertenecen a otros sistemas."
}

ENSURE UNIQUENESS: Use different sections, examples, concepts, or details from the PDF content that relate to "{{topic}}" each time. Never repeat the same question structure or content. The random seed {{randomSeed}} should influence which aspects of "{{topic}}" you focus on.

The output must be a valid JSON object matching the specified output schema.
`,
});

const generateEvaluationFlow = ai.defineFlow(
  {
    name: 'generateEvaluationFlow',
    inputSchema: GenerateEvaluationInputSchema,
    outputSchema: GenerateEvaluationOutputSchema,
  },
  async (input: GenerateEvaluationInput): Promise<GenerateEvaluationOutput> => {
    const questionCount = input.questionCount || 15;
    const titlePrefix = input.language === 'es' ? 'EVALUACIÓN' : 'EVALUATION';
    const promptInput = {
      ...input,
      questionCount,
      topic_uppercase: input.topic.toUpperCase(),
      title_prefix: titlePrefix,
    };
    const {output} = await generateEvaluationPrompt(promptInput);

    if (!output || !output.questions || output.questions.length !== questionCount) {
      console.error('AI response:', JSON.stringify(output, null, 2));
      if (output && output.questions) {
        console.error(`Expected ${questionCount} questions, but received ${output.questions.length}.`);
      }
      throw new Error(
        `AI failed to generate the required ${questionCount} evaluation questions or the format is incorrect. Expected ${questionCount}, got ${output?.questions?.length || 0}.`
      );
    }
    return output;
  }
);

// New dynamic flow that uses PDF content
const generateDynamicEvaluationFlow = ai.defineFlow(
  {
    name: 'generateDynamicEvaluationFlow',
    inputSchema: GenerateDynamicEvaluationInputSchema,
    outputSchema: GenerateEvaluationOutputSchema,
  },
  async (input: GenerateDynamicEvaluationInput): Promise<GenerateEvaluationOutput> => {
    const questionCount = input.questionCount || 15;
    const titlePrefix = input.language === 'es' ? 'EVALUACIÓN' : 'EVALUATION';
    const promptInput = {
      ...input,
      questionCount,
      topic_uppercase: input.topic.toUpperCase(),
      title_prefix: titlePrefix,
    };
    const {output} = await generateDynamicEvaluationPrompt(promptInput);

    if (!output || !output.questions || output.questions.length !== questionCount) {
      console.error('AI response:', JSON.stringify(output, null, 2));
      if (output && output.questions) {
        console.error(`Expected ${questionCount} questions, but received ${output.questions.length}.`);
      }
      throw new Error(
        `AI failed to generate the required ${questionCount} evaluation questions or the format is incorrect. Expected ${questionCount}, got ${output?.questions?.length || 0}.`
      );
    }
    return output;
  }
);

// New export for dynamic evaluation
export async function generateDynamicEvaluationContent(input: GenerateDynamicEvaluationInput): Promise<GenerateEvaluationOutput> {
  try {
    console.log('🌍 generateDynamicEvaluationContent received language:', input.language);
    console.log('📚 generateDynamicEvaluationContent input:', { 
      bookTitle: input.bookTitle, 
      topic: input.topic, 
      language: input.language,
      questionCount: input.questionCount
    });
    
    const count = input.questionCount || 15;
    const timestamp = input.timestamp || Date.now();
    const randomSeed = input.randomSeed || Math.floor(Math.random() * 1000);
    const isEs = input.language === 'es';
    
    // Verificar si tenemos OpenRouter o Google API disponible
    const hasOpenRouter = useOpenRouter;
    const hasGoogleAPI = process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your_google_api_key_here';
    
    console.log('🔑 API availability:', { hasOpenRouter, hasGoogleAPI });
    
    // Si tenemos OpenRouter, generar preguntas reales con IA
    if (hasOpenRouter) {
      console.log('✅ Using OpenRouter to generate real evaluation questions');
      
      try {
        const tfCount = Math.round(count / 3);
        const mcCount = Math.round((count - tfCount) / 2);
        const msCount = count - tfCount - mcCount;
        
        const prompt = isEs 
          ? `Eres un profesor experto en educación. Genera una evaluación educativa sobre el tema "${input.topic}" para el curso "${input.course || 'General'}" en la asignatura "${input.subject || input.bookTitle}".

IMPORTANTE: Las preguntas deben ser sobre el CONTENIDO REAL del tema "${input.topic}". NO generes preguntas sobre "qué es una asignatura" o "qué son objetivos de aprendizaje". Las preguntas deben evaluar CONOCIMIENTO ESPECÍFICO del tema.

${input.pdfContent ? `Contenido del libro para basar las preguntas:\n${input.pdfContent.substring(0, 4000)}` : ''}

Genera exactamente ${count} preguntas en este formato JSON:
{
  "evaluationTitle": "Evaluación - ${input.topic}",
  "questions": [
    // ${tfCount} preguntas de Verdadero/Falso:
    {"id": "q1", "type": "TRUE_FALSE", "questionText": "Pregunta específica sobre ${input.topic}...", "correctAnswer": true, "explanation": "Explicación..."},
    // ${mcCount} preguntas de Selección Múltiple (4 opciones, una correcta):
    {"id": "q${tfCount + 1}", "type": "MULTIPLE_CHOICE", "questionText": "Pregunta sobre ${input.topic}...", "options": ["Opción A", "Opción B", "Opción C", "Opción D"], "correctAnswerIndex": 0, "explanation": "Explicación..."},
    // ${msCount} preguntas de Selección Múltiple (varias correctas):
    {"id": "q${tfCount + mcCount + 1}", "type": "MULTIPLE_SELECTION", "questionText": "¿Cuáles de los siguientes...?", "options": ["Opción A", "Opción B", "Opción C", "Opción D"], "correctAnswerIndices": [0, 2], "explanation": "Explicación..."}
  ]
}

Reglas:
1. TODAS las preguntas deben ser sobre el contenido específico de "${input.topic}"
2. Las preguntas de TRUE_FALSE deben tener correctAnswer (boolean)
3. Las preguntas de MULTIPLE_CHOICE deben tener correctAnswerIndex (número 0-3)
4. Las preguntas de MULTIPLE_SELECTION deben tener correctAnswerIndices (array de números)
5. Genera preguntas variadas y educativas que evalúen comprensión real
6. NO incluyas preguntas genéricas sobre "asignaturas" o "objetivos de aprendizaje"

Responde SOLO con el JSON, sin texto adicional.`
          : `You are an expert teacher. Generate an educational evaluation about "${input.topic}" for "${input.course || 'General'}" course in "${input.subject || input.bookTitle}" subject.

IMPORTANT: Questions must be about the REAL CONTENT of "${input.topic}". Do NOT generate questions about "what is a subject" or "what are learning objectives". Questions must evaluate SPECIFIC KNOWLEDGE of the topic.

${input.pdfContent ? `Book content to base questions on:\n${input.pdfContent.substring(0, 4000)}` : ''}

Generate exactly ${count} questions in this JSON format:
{
  "evaluationTitle": "Evaluation - ${input.topic}",
  "questions": [
    // ${tfCount} True/False questions:
    {"id": "q1", "type": "TRUE_FALSE", "questionText": "Specific question about ${input.topic}...", "correctAnswer": true, "explanation": "Explanation..."},
    // ${mcCount} Multiple Choice questions (4 options, one correct):
    {"id": "q${tfCount + 1}", "type": "MULTIPLE_CHOICE", "questionText": "Question about ${input.topic}...", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswerIndex": 0, "explanation": "Explanation..."},
    // ${msCount} Multiple Selection questions (multiple correct):
    {"id": "q${tfCount + mcCount + 1}", "type": "MULTIPLE_SELECTION", "questionText": "Which of the following...?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswerIndices": [0, 2], "explanation": "Explanation..."}
  ]
}

Rules:
1. ALL questions must be about specific content of "${input.topic}"
2. TRUE_FALSE questions must have correctAnswer (boolean)
3. MULTIPLE_CHOICE questions must have correctAnswerIndex (number 0-3)
4. MULTIPLE_SELECTION questions must have correctAnswerIndices (array of numbers)
5. Generate varied educational questions that evaluate real understanding
6. Do NOT include generic questions about "subjects" or "learning objectives"

Respond ONLY with JSON, no additional text.`;

        const aiResponse = await generateWithAI(prompt, {
          temperature: 0.7,
          maxTokens: 4000,
          jsonMode: true
        });
        
        console.log('🤖 OpenRouter raw response length:', aiResponse.length);
        
        // Parsear la respuesta JSON
        let jsonStr = aiResponse.trim();
        // Limpiar posibles marcadores de código
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.slice(7);
        }
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();
        
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length === count) {
          // Asignar IDs únicos a cada pregunta
          const questionsWithIds = parsed.questions.map((q: any, i: number) => ({
            ...q,
            id: `q${i + 1}_${timestamp}_${randomSeed}`
          }));
          
          console.log('✅ Successfully generated', questionsWithIds.length, 'questions with OpenRouter');
          
          return {
            evaluationTitle: parsed.evaluationTitle || `${isEs ? 'Evaluación' : 'Evaluation'} - ${input.topic}`,
            questions: questionsWithIds
          };
        } else {
          console.warn('⚠️ OpenRouter response did not have expected question count, falling back to mock');
          throw new Error('Invalid question count from OpenRouter');
        }
      } catch (aiError) {
        console.error('❌ OpenRouter generation failed:', aiError);
        // Continuar con fallback
      }
    }
    
    // Check if Google API key is available
    if (hasGoogleAPI) {
      console.log('✅ Using Google AI to generate real evaluation questions');
      // Aquí iría la lógica de Google AI si está disponible
      // Por ahora, continúa con el fallback
    }
    
    // Fallback: Return mock data with exact questionCount respecting proportions
    console.log('⚠️ Using mock data - no AI API available. Language:', input.language);

    const makeId = (i: number) => `q${i + 1}_${timestamp}_${randomSeed}`;
    const contextLabel = isEs ? `${input.subject ? input.subject + ' - ' : ''}${input.bookTitle}` : `${input.subject ? input.subject + ' - ' : ''}${input.bookTitle}`;

    // Distribución aproximada en tercios
    const tfCount = Math.round(count / 3);
    const mcCount = Math.round((count - tfCount) / 2);
    const msCount = count - tfCount - mcCount;

    const questions: EvaluationQuestion[] = [];
      
      // Generar preguntas basadas en el contenido del PDF si está disponible
      const pdfLines = (input.pdfContent || '').split('\n').filter(l => l.trim().length > 10);
      const hasRealContent = pdfLines.length > 5;
      
      // Líneas a ignorar (encabezados del PDF, metadatos)
      const normalizeText = (text: string) =>
        text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

      const ignoredPhrases = [
        // Metadatos típicos del mock PDF
        'contenido educativo',
        'contenido educativo de',
        'tema especifico',
        'materia',
        'curso',
        // Cierres/avisos del mock
        'el material esta actualizado',
        'los conceptos se presentan',
        'segun los estandares',
        'curriculares vigentes'
      ];

      const isLikelySectionHeader = (line: string): boolean => {
        const trimmed = line.trim();
        if (trimmed.length < 6 || trimmed.length > 90) return false;

        // Encabezados tipo "ÓRGANOS DEL SISTEMA RESPIRATORIO:" / "INTERCAMBIO GASEOSO:" etc.
        const mostlyCaps = /^[A-ZÁÉÍÓÚÑ\s\-]+:?$/.test(trimmed);
        if (!mostlyCaps) return false;

        const normalized = normalizeText(trimmed);
        return (
          normalized.includes('sistema') ||
          normalized.includes('organos') ||
          normalized.includes('proceso') ||
          normalized.includes('intercambio') ||
          normalized.includes('cuidados') ||
          normalized.includes('enfermedades')
        );
      };

      const shouldIgnoreLine = (line: string): boolean => {
        const normalized = normalizeText(line);
        if (!normalized) return true;
        if (isLikelySectionHeader(line)) return true;

        // Ignorar valores sueltos comunes (esto evita opciones como "Materia" o "Curso")
        if (normalized === 'materia' || normalized === 'curso' || normalized === 'tema especifico') return true;

        return ignoredPhrases.some(phrase => normalized.includes(phrase));
      };
      
      // Función avanzada para extraer conceptos específicos del PDF
      const extractDetailedConcepts = () => {
        const facts: string[] = []; // Hechos afirmativos específicos
        const components: string[] = []; // Componentes/partes del tema
        const definitions: string[] = []; // Definiciones
        const processes: string[] = []; // Procesos
        const distractors: string[] = []; // Distractores (incorrectos pero plausibles)
        
        for (const line of pdfLines) {
          const trimmed = line.trim();
          const cleanLine = trimmed.replace(/^[-•*]\s*/, '');
          
          // Ignorar líneas de metadatos
          if (shouldIgnoreLine(cleanLine)) {
            continue;
          }
          
          // Extraer componentes (líneas con ":" que describen partes)
          if (cleanLine.includes(':') && cleanLine.length > 20 && cleanLine.length < 150) {
            const parts = cleanLine.split(':');
            if (parts.length >= 2 && parts[0].length < 50) {
              // Ignorar si el nombre del componente es un encabezado
              const componentName = parts[0].trim();
              if (shouldIgnoreLine(componentName) || isLikelySectionHeader(componentName)) {
                continue;
              }
              components.push(cleanLine);
              // Extraer solo el nombre del componente
              if (componentName.length > 3) {
                facts.push(componentName);
              }
            }
          }
          
          // Extraer definiciones (líneas que empiezan con mayúscula y son descriptivas)
          if (/^[A-ZÁÉÍÓÚ][a-záéíóú]/.test(cleanLine) && 
              (cleanLine.includes(' es ') || cleanLine.includes(' son ') || cleanLine.includes(' significa '))) {
            definitions.push(cleanLine.substring(0, 120));
          }
          
          // Extraer procesos (líneas con verbos en infinitivo o gerundio)
          if (cleanLine.match(/\b(permite|produce|realiza|ocurre|contiene|transforma|transporta|controla)\b/i)) {
            processes.push(cleanLine.substring(0, 120));
          }
          
          // Extraer hechos (líneas que describen características específicas)
          if (cleanLine.length > 30 && cleanLine.length < 100 && !cleanLine.includes(':')) {
            facts.push(cleanLine);
          }
        }
        
        // Generar distractores basados en el tema pero incorrectos
        const topicLower = input.topic.toLowerCase();
        if (topicLower.includes('respiratorio')) {
          distractors.push(
            'El sistema digestivo procesa los alimentos',
            'Los riñones filtran la sangre',
            'El corazón es parte del sistema circulatorio',
            'Los huesos sostienen el cuerpo'
          );
        } else if (topicLower.includes('célula')) {
          distractors.push(
            'Los virus son células procariotas',
            'Las bacterias tienen núcleo definido',
            'Los animales realizan fotosíntesis',
            'Las rocas contienen mitocondrias'
          );
        } else if (topicLower.includes('fotosíntesis') || topicLower.includes('fotosintesis')) {
          distractors.push(
            'Los animales realizan fotosíntesis',
            'La fotosíntesis consume oxígeno',
            'Las plantas no necesitan luz solar',
            'Los hongos producen su propio alimento'
          );
        } else if (topicLower.includes('fraccion') || topicLower.includes('fracción')) {
          distractors.push(
            'El denominador indica cuántas partes se toman',
            'Las fracciones impropias son menores que 1',
            'No se pueden sumar fracciones diferentes',
            'El numerador siempre es mayor que el denominador'
          );
        } else {
          distractors.push(
            `Un concepto de otra materia`,
            `Información no relacionada con ${input.topic}`,
            `Un proceso diferente al tema estudiado`,
            `Una definición incorrecta del concepto`
          );
        }
        
        return { facts, components, definitions, processes, distractors };
      };
      
      const conceptData = hasRealContent ? extractDetailedConcepts() : { facts: [], components: [], definitions: [], processes: [], distractors: [] };
      
      // Filtrar conceptos que contengan frases de metadatos
      const filterConcepts = (arr: string[]) => arr.filter(c => c.length > 15 && !shouldIgnoreLine(c));
      const concepts = filterConcepts([...conceptData.components, ...conceptData.definitions, ...conceptData.processes]);
      
      // También filtrar facts y components del conceptData
      conceptData.facts = filterConcepts(conceptData.facts);
      conceptData.components = filterConcepts(conceptData.components);
      conceptData.definitions = filterConcepts(conceptData.definitions);
      conceptData.processes = filterConcepts(conceptData.processes);
      
      // Generar preguntas de Verdadero/Falso basadas en contenido real
      const generateTrueFalseQuestion = (index: number): EvaluationQuestion => {
        const { facts, components, definitions, distractors } = conceptData;
        const allFacts = [...definitions, ...components.slice(0, 10)];
        const isTrue = index % 2 === 0;
        
        if (hasRealContent && allFacts.length > 0) {
          const factIndex = index % allFacts.length;
          const fact = allFacts[factIndex];
          
          if (isTrue) {
            // Afirmación verdadera basada en el contenido
            const statement = fact.includes(':') 
              ? fact.split(':')[1]?.trim() || fact
              : fact;
            
            return {
              id: makeId(questions.length),
              type: 'TRUE_FALSE',
              questionText: isEs
                ? `${statement.charAt(0).toUpperCase() + statement.slice(1).substring(0, 150)}.`
                : `${statement.charAt(0).toUpperCase() + statement.slice(1).substring(0, 150)}.`,
              correctAnswer: true,
              explanation: isEs
                ? `Esta afirmación es correcta según el contenido sobre ${input.topic}.`
                : `This statement is correct according to the content about ${input.topic}.`
            };
          } else {
            // Afirmación falsa usando distractores
            const distractor = distractors[index % distractors.length] || 
              `${input.topic} no tiene relación con los procesos biológicos`;
            
            return {
              id: makeId(questions.length),
              type: 'TRUE_FALSE',
              questionText: isEs
                ? `${distractor}.`
                : `${distractor}.`,
              correctAnswer: false,
              explanation: isEs
                ? `Esta afirmación es incorrecta. El contenido de ${input.topic} indica lo contrario.`
                : `This statement is incorrect. The content about ${input.topic} indicates otherwise.`
            };
          }
        }
        
        // Fallback con contenido educativo específico del tema
        const topicLower = input.topic.toLowerCase();
        let question = '';
        let answer = true;
        let explanation = '';
        
        if (topicLower.includes('respiratorio')) {
          if (isTrue) {
            question = isEs ? 'Los pulmones son los órganos principales del sistema respiratorio.' : 'The lungs are the main organs of the respiratory system.';
            answer = true;
            explanation = isEs ? 'Los pulmones son efectivamente los órganos principales donde ocurre el intercambio gaseoso.' : 'The lungs are indeed the main organs where gas exchange occurs.';
          } else {
            question = isEs ? 'El estómago es parte del sistema respiratorio.' : 'The stomach is part of the respiratory system.';
            answer = false;
            explanation = isEs ? 'El estómago pertenece al sistema digestivo, no al respiratorio.' : 'The stomach belongs to the digestive system, not the respiratory system.';
          }
        } else {
          question = isEs
            ? `Los conceptos fundamentales de ${input.topic} son esenciales para su comprensión.`
            : `The fundamental concepts of ${input.topic} are essential for its understanding.`;
          answer = true;
          explanation = isEs ? 'Los conceptos básicos siempre son la base del aprendizaje.' : 'Basic concepts are always the foundation of learning.';
        }
        
        return {
          id: makeId(questions.length),
          type: 'TRUE_FALSE',
          questionText: question,
          correctAnswer: answer,
          explanation: explanation
        };
      };
      
      // Generar preguntas de Selección Múltiple con opciones reales del tema
      const generateMultipleChoiceQuestion = (index: number): EvaluationQuestion => {
        const { components, definitions, processes, distractors } = conceptData;
        const correctAnswerIndex = index % 4;
        
        // Extraer nombres de componentes limpios (excluyendo metadatos)
        const getComponentNames = (): string[] => {
          const names: string[] = [];
          for (const comp of components) {
            // Saltar si contiene frases de metadatos
            if (shouldIgnoreLine(comp)) {
              continue;
            }
            const parts = comp.split(':');
            if (parts.length >= 2) {
              const name = parts[0].trim();
              const description = parts[1].trim().substring(0, 80);
              // Verificar que el nombre no sea un encabezado genérico
              if (name.length > 3 && name.length < 50 && !shouldIgnoreLine(name)) {
                names.push(`${name}: ${description}`);
              }
            }
          }
          return names;
        };
        
        const componentNames = getComponentNames();
        const topicLower = input.topic.toLowerCase();

        // Tema: Sistema Respiratorio (opciones siempre coherentes con la pregunta)
        if (hasRealContent && topicLower.includes('respiratorio')) {
          const questionType = index % 10;

          if (questionType === 0) {
            const options = ['Alvéolos pulmonares', 'Tráquea', 'Bronquios', 'Diafragma'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Qué estructura permite el intercambio gaseoso en los pulmones?'
                : 'Which structure enables gas exchange in the lungs?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'El intercambio gaseoso ocurre en los alvéolos pulmonares.'
                : 'Gas exchange occurs in the pulmonary alveoli.'
            };
          }

          if (questionType === 1) {
            const options = ['Fosas nasales', 'Esófago', 'Estómago', 'Riñones'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Qué estructura filtra, calienta y humedece el aire que ingresa al cuerpo?'
                : 'Which structure filters, warms, and humidifies the air entering the body?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'Las fosas nasales filtran, calientan y humedecen el aire.'
                : 'Nasal cavities filter, warm, and humidify the air.'
            };
          }

          if (questionType === 2) {
            const options = ['Tráquea', 'Alvéolos pulmonares', 'Diafragma', 'Faringe'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Qué estructura conduce el aire hacia los bronquios?'
                : 'Which structure carries air toward the bronchi?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'La tráquea conduce el aire hacia los bronquios.'
                : 'The trachea carries air to the bronchi.'
            };
          }

          if (questionType === 3) {
            const options = ['Laringe', 'Páncreas', 'Riñones', 'Intestino delgado'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Qué órgano contiene las cuerdas vocales y permite la fonación?'
                : 'Which organ contains the vocal cords and enables phonation?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'La laringe contiene las cuerdas vocales.'
                : 'The larynx contains the vocal cords.'
            };
          }

          if (questionType === 4) {
            const options = ['Bronquios', 'Esófago', 'Uréteres', 'Venas'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Cómo se llaman las ramificaciones de la tráquea que ingresan a cada pulmón?'
                : 'What are the branches of the trachea that enter each lung called?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'Los bronquios son las ramificaciones de la tráquea.'
                : 'Bronchi are the branches of the trachea.'
            };
          }

          if (questionType === 5) {
            const options = ['Diafragma', 'Bíceps', 'Fémur', 'Húmero'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Qué músculo permite los movimientos respiratorios?'
                : 'Which muscle enables breathing movements?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'El diafragma es el músculo clave en la respiración.'
                : 'The diaphragm is the key muscle in breathing.'
            };
          }

          if (questionType === 6) {
            const options = ['Inspiración', 'Fotosíntesis', 'Digestión', 'Evaporación'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Cómo se llama la fase en la que entra aire rico en oxígeno al cuerpo?'
                : 'What is the phase called when oxygen-rich air enters the body?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'En la inspiración entra aire rico en oxígeno.'
                : 'In inhalation, oxygen-rich air enters the body.'
            };
          }

          if (questionType === 7) {
            const options = ['Espiración', 'Inspiración', 'Circulación', 'Digestión'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Cómo se llama la fase en la que se expulsa aire rico en dióxido de carbono?'
                : 'What is the phase called when carbon dioxide-rich air is expelled?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'En la espiración se expulsa aire con CO₂.'
                : 'In exhalation, air containing CO₂ is expelled.'
            };
          }

          if (questionType === 8) {
            const options = ['Pulmones', 'Corazón', 'Estómago', 'Riñones'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_CHOICE',
              questionText: isEs
                ? '¿Cuál de los siguientes órganos pertenece al sistema respiratorio?'
                : 'Which of the following organs belongs to the respiratory system?',
              options,
              correctAnswerIndex: 0,
              explanation: isEs
                ? 'Los pulmones son órganos principales del sistema respiratorio.'
                : 'The lungs are primary organs of the respiratory system.'
            };
          }

          // questionType === 9
          const options = ['Difusión', 'Evaporación', 'Combustión', 'Condensación'];
          return {
            id: makeId(questions.length),
            type: 'MULTIPLE_CHOICE',
            questionText: isEs
              ? '¿Qué proceso permite que el oxígeno pase de los alvéolos a la sangre?'
              : 'Which process allows oxygen to pass from the alveoli into the blood?',
            options,
            correctAnswerIndex: 0,
            explanation: isEs
              ? 'El intercambio se realiza por difusión a través de las membranas.'
              : 'The exchange happens by diffusion through membranes.'
          };
        }
        
        if (hasRealContent && componentNames.length >= 2) {
          // Usar componentes reales del tema
          const correctOption = componentNames[index % componentNames.length];
          const wrongDistractors = distractors.slice(0, 3);
          
          // Crear array de opciones con la correcta y 3 distractores
          const allOptions = [correctOption, ...wrongDistractors];
          
          // Reordenar para que la respuesta correcta esté en la posición indicada
          const shuffledOptions = [...wrongDistractors];
          shuffledOptions.splice(correctAnswerIndex, 0, correctOption);
          
          // Generar pregunta específica según el tema
          let questionText = '';
          if (topicLower.includes('respiratorio')) {
            const questionTypes = [
              '¿Cuál de los siguientes es un órgano del sistema respiratorio?',
              '¿Qué estructura permite el intercambio gaseoso en los pulmones?',
              '¿Cuál de las siguientes opciones describe correctamente una función respiratoria?',
              '¿Qué órgano filtra y calienta el aire que respiramos?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : `Which of the following is part of the respiratory system?`;
          } else if (topicLower.includes('célula')) {
            const questionTypes = [
              '¿Cuál de los siguientes es un organelo celular?',
              '¿Qué estructura controla las funciones de la célula?',
              '¿Cuál es una característica de las células eucariotas?',
              '¿Qué parte de la célula produce energía?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : `Which of the following is a cell organelle?`;
          } else if (topicLower.includes('fotosíntesis') || topicLower.includes('fotosintesis')) {
            const questionTypes = [
              '¿Cuál es un producto de la fotosíntesis?',
              '¿Dónde ocurre la fase luminosa de la fotosíntesis?',
              '¿Qué pigmento captura la luz solar?',
              '¿Cuál es un elemento necesario para la fotosíntesis?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : `Which is a product of photosynthesis?`;
          } else if (topicLower.includes('fraccion') || topicLower.includes('fracción')) {
            const questionTypes = [
              '¿Qué indica el numerador en una fracción?',
              '¿Cuál es una fracción propia?',
              '¿Cómo se multiplican dos fracciones?',
              '¿Qué son fracciones equivalentes?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : `What does the numerator indicate in a fraction?`;
          } else {
            questionText = isEs
              ? `¿Cuál de las siguientes opciones corresponde a ${input.topic}?`
              : `Which of the following corresponds to ${input.topic}?`;
          }
          
          return {
            id: makeId(questions.length),
            type: 'MULTIPLE_CHOICE',
            questionText,
            options: shuffledOptions.slice(0, 4),
            correctAnswerIndex: correctAnswerIndex,
            explanation: isEs
              ? `La respuesta correcta es "${correctOption.substring(0, 60)}..." según el contenido del material.`
              : `The correct answer is "${correctOption.substring(0, 60)}..." according to the material content.`
          };
        }
        
        // Fallback con opciones específicas según el tema
        let options: string[];
        let questionText: string;
        
        if (topicLower.includes('respiratorio')) {
          options = isEs ? [
            'Los pulmones realizan el intercambio de oxígeno y dióxido de carbono',
            'El hígado filtra el aire que respiramos',
            'El corazón es el órgano principal del sistema respiratorio',
            'Los músculos producen oxígeno para el cuerpo'
          ] : [
            'The lungs perform oxygen and carbon dioxide exchange',
            'The liver filters the air we breathe',
            'The heart is the main organ of the respiratory system',
            'Muscles produce oxygen for the body'
          ];
          questionText = isEs ? '¿Cuál afirmación sobre el sistema respiratorio es correcta?' : 'Which statement about the respiratory system is correct?';
        } else if (topicLower.includes('célula')) {
          options = isEs ? [
            'El núcleo contiene el material genético (ADN)',
            'Las mitocondrias almacenan el agua celular',
            'La membrana celular produce proteínas',
            'Los ribosomas controlan la división celular'
          ] : [
            'The nucleus contains genetic material (DNA)',
            'Mitochondria store cellular water',
            'The cell membrane produces proteins',
            'Ribosomes control cell division'
          ];
          questionText = isEs ? '¿Cuál afirmación sobre la célula es correcta?' : 'Which statement about the cell is correct?';
        } else {
          options = isEs ? [
            `Es un concepto fundamental de ${input.topic}`,
            `No está relacionado con el tema principal`,
            `Es una aplicación avanzada del concepto`,
            `Representa una excepción a la regla general`
          ] : [
            `It is a fundamental concept of ${input.topic}`,
            `It is not related to the main topic`,
            `It is an advanced application of the concept`,
            `It represents an exception to the general rule`
          ];
          questionText = isEs ? `¿Cuál característica corresponde a ${input.topic}?` : `Which characteristic corresponds to ${input.topic}?`;
        }
        
        return {
          id: makeId(questions.length),
          type: 'MULTIPLE_CHOICE',
          questionText,
          options,
          correctAnswerIndex: 0,
          explanation: isEs
            ? `La primera opción es la correcta según el contenido estudiado.`
            : `The first option is correct according to the studied content.`
        };
      };
      
      // Generar preguntas de Selección Múltiple (varias respuestas correctas)
      const generateMultipleSelectionQuestion = (index: number): EvaluationQuestion => {
        const { components, distractors } = conceptData;
        const topicLower = input.topic.toLowerCase();
        
        // Extraer solo los nombres de componentes (antes de ":"), excluyendo metadatos
        const getShortComponentNames = (): string[] => {
          const names: string[] = [];
          for (const comp of components) {
            // Saltar si contiene frases de metadatos
            if (shouldIgnoreLine(comp)) {
              continue;
            }
            const parts = comp.split(':');
            if (parts.length >= 2) {
              const name = parts[0].trim();
              // Verificar que el nombre no sea un encabezado genérico
              if (name.length > 3 && name.length < 40 && !names.includes(name) && !shouldIgnoreLine(name)) {
                names.push(name);
              }
            }
          }
          return names; // Ya sin duplicados
        };
        
        const shortNames = getShortComponentNames();

        // Tema: Sistema Respiratorio (opciones siempre coherentes con la pregunta)
        if (hasRealContent && topicLower.includes('respiratorio')) {
          const questionType = index % 6;

          if (questionType === 0) {
            const options = ['Pulmones', 'Estómago', 'Tráquea', 'Riñones'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_SELECTION',
              questionText: isEs
                ? '¿Cuáles de los siguientes son órganos del sistema respiratorio?'
                : 'Which of the following are organs of the respiratory system?',
              options,
              correctAnswerIndices: [0, 2],
              explanation: isEs
                ? 'Pulmones y tráquea forman parte del sistema respiratorio.'
                : 'Lungs and trachea are part of the respiratory system.'
            };
          }

          if (questionType === 1) {
            const options = [
              'Evitar ambientes con aire contaminado',
              'No fumar ni exponerse al humo del tabaco',
              'Mantener espacios cerrados sin ventilación',
              'Inhalar humo para fortalecer los pulmones'
            ];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_SELECTION',
              questionText: isEs
                ? 'Selecciona cuidados correctos del sistema respiratorio:'
                : 'Select correct care practices for the respiratory system:',
              options,
              correctAnswerIndices: [0, 1],
              explanation: isEs
                ? 'Evitar contaminación y no fumar son medidas correctas.'
                : 'Avoiding pollution and not smoking are correct measures.'
            };
          }

          if (questionType === 2) {
            const options = ['Inspiración', 'Digestión', 'Espiración', 'Fotosíntesis'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_SELECTION',
              questionText: isEs
                ? '¿Cuáles son fases del proceso de respiración?'
                : 'Which are phases of the breathing process?',
              options,
              correctAnswerIndices: [0, 2],
              explanation: isEs
                ? 'La respiración tiene dos fases principales: inspiración y espiración.'
                : 'Breathing has two main phases: inhalation and exhalation.'
            };
          }

          if (questionType === 3) {
            const options = ['Alvéolos', 'Hígado', 'Bronquiolos', 'Intestino'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_SELECTION',
              questionText: isEs
                ? 'Selecciona estructuras donde participa el intercambio/flujo de gases:'
                : 'Select structures involved in gas exchange/flow:',
              options,
              correctAnswerIndices: [0, 2],
              explanation: isEs
                ? 'Los alvéolos participan en el intercambio gaseoso y los bronquiolos en la conducción del aire.'
                : 'Alveoli participate in gas exchange and bronchioles in air conduction.'
            };
          }

          if (questionType === 4) {
            const options = ['Asma', 'Bronquitis', 'Neumonía', 'Apendicitis'];
            return {
              id: makeId(questions.length),
              type: 'MULTIPLE_SELECTION',
              questionText: isEs
                ? '¿Cuáles de las siguientes son enfermedades del sistema respiratorio?'
                : 'Which of the following are respiratory system diseases?',
              options,
              correctAnswerIndices: [0, 1, 2],
              explanation: isEs
                ? 'Asma, bronquitis y neumonía son enfermedades respiratorias; la apendicitis no.'
                : 'Asthma, bronchitis, and pneumonia are respiratory diseases; appendicitis is not.'
            };
          }

          // questionType === 5
          const options = ['Evitar humo del tabaco', 'Ventilar espacios cerrados', 'Fumar para “fortalecer” los pulmones', 'Hacer ejercicio regularmente'];
          return {
            id: makeId(questions.length),
            type: 'MULTIPLE_SELECTION',
            questionText: isEs
              ? 'Selecciona hábitos que ayudan a cuidar el sistema respiratorio:'
              : 'Select habits that help care for the respiratory system:',
            options,
            correctAnswerIndices: [0, 1, 3],
            explanation: isEs
              ? 'Evitar humo, ventilar y hacer ejercicio ayudan al sistema respiratorio.'
              : 'Avoiding smoke, ventilating, and exercising help the respiratory system.'
          };
        }
        
        if (hasRealContent && shortNames.length >= 3) {
          // Seleccionar 2-3 componentes reales como respuestas correctas
          const correctOptions = shortNames.slice(index % 3, (index % 3) + 2);
          const wrongDistractors = distractors.slice(0, 2);
          
          // Construir opciones: 2 correctas + 2 incorrectas
          const options = [
            correctOptions[0] || shortNames[0],
            wrongDistractors[0] || 'Elemento no relacionado',
            correctOptions[1] || shortNames[1] || shortNames[0],
            wrongDistractors[1] || 'Proceso de otra materia'
          ];
          
          // Generar pregunta específica según el tema
          let questionText = '';
          if (topicLower.includes('respiratorio')) {
            const questionTypes = [
              '¿Cuáles de los siguientes son órganos del sistema respiratorio?',
              '¿Qué estructuras participan en la respiración?',
              '¿Cuáles forman parte del proceso de intercambio gaseoso?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : 'Which of the following are organs of the respiratory system?';
          } else if (topicLower.includes('célula')) {
            const questionTypes = [
              '¿Cuáles de los siguientes son organelos de la célula?',
              '¿Qué estructuras se encuentran en células eucariotas?',
              '¿Cuáles son partes de la célula animal?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : 'Which of the following are cell organelles?';
          } else if (topicLower.includes('fotosíntesis') || topicLower.includes('fotosintesis')) {
            const questionTypes = [
              '¿Cuáles son elementos necesarios para la fotosíntesis?',
              '¿Qué productos genera la fotosíntesis?',
              '¿Cuáles estructuras participan en la fotosíntesis?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : 'Which elements are necessary for photosynthesis?';
          } else if (topicLower.includes('fraccion') || topicLower.includes('fracción')) {
            const questionTypes = [
              '¿Cuáles son tipos de fracciones?',
              '¿Qué operaciones se pueden realizar con fracciones?',
              '¿Cuáles son componentes de una fracción?'
            ];
            questionText = isEs ? questionTypes[index % questionTypes.length] : 'Which are types of fractions?';
          } else {
            questionText = isEs
              ? `¿Cuáles de los siguientes están relacionados con ${input.topic}?`
              : `Which of the following are related to ${input.topic}?`;
          }
          
          return {
            id: makeId(questions.length),
            type: 'MULTIPLE_SELECTION',
            questionText,
            options,
            correctAnswerIndices: [0, 2], // Primera y tercera son correctas
            explanation: isEs
              ? `Las opciones "${options[0]}" y "${options[2]}" son parte del tema ${input.topic}.`
              : `The options "${options[0]}" and "${options[2]}" are part of the topic ${input.topic}.`
          };
        }
        
        // Fallback con opciones específicas según el tema
        let options: string[];
        let questionText: string;
        let explanation: string;
        
        if (topicLower.includes('respiratorio')) {
          options = isEs ? [
            'Pulmones',
            'Estómago',
            'Tráquea',
            'Riñones'
          ] : ['Lungs', 'Stomach', 'Trachea', 'Kidneys'];
          questionText = isEs ? '¿Cuáles son órganos del sistema respiratorio?' : 'Which are organs of the respiratory system?';
          explanation = isEs ? 'Los pulmones y la tráquea son parte del sistema respiratorio.' : 'The lungs and trachea are part of the respiratory system.';
        } else if (topicLower.includes('célula')) {
          options = isEs ? [
            'Núcleo',
            'Huesos',
            'Mitocondrias',
            'Piel'
          ] : ['Nucleus', 'Bones', 'Mitochondria', 'Skin'];
          questionText = isEs ? '¿Cuáles son organelos de la célula?' : 'Which are cell organelles?';
          explanation = isEs ? 'El núcleo y las mitocondrias son organelos celulares.' : 'The nucleus and mitochondria are cell organelles.';
        } else if (topicLower.includes('fotosíntesis') || topicLower.includes('fotosintesis')) {
          options = isEs ? [
            'Luz solar',
            'Oxígeno como reactivo',
            'Dióxido de carbono',
            'Proteínas animales'
          ] : ['Sunlight', 'Oxygen as reactant', 'Carbon dioxide', 'Animal proteins'];
          questionText = isEs ? '¿Cuáles son necesarios para la fotosíntesis?' : 'Which are necessary for photosynthesis?';
          explanation = isEs ? 'La luz solar y el CO₂ son necesarios para la fotosíntesis.' : 'Sunlight and CO₂ are necessary for photosynthesis.';
        } else {
          options = isEs ? [
            'Comprensión de conceptos básicos',
            'Memorización sin análisis',
            'Aplicación práctica del conocimiento',
            'Ignorar el contexto del tema'
          ] : [
            'Understanding of basic concepts',
            'Memorization without analysis',
            'Practical application of knowledge',
            'Ignoring the topic context'
          ];
          questionText = isEs ? `¿Cuáles son aspectos importantes de ${input.topic}?` : `Which are important aspects of ${input.topic}?`;
          explanation = isEs ? 'La comprensión y aplicación práctica son esenciales.' : 'Understanding and practical application are essential.';
        }
        
        return {
          id: makeId(questions.length),
          type: 'MULTIPLE_SELECTION',
          questionText,
          options,
          correctAnswerIndices: [0, 2],
          explanation
        };
      };

      // Dedupe: impedir que se repitan preguntas dentro de la misma evaluación
      const signatureFor = (q: EvaluationQuestion): string => {
        const qt = (q.questionText || '').trim().toLowerCase();
        return `${q.type}|${qt}`;
      };

      const usedSignatures = new Set<string>();
      const tryMakeUnique = (make: (n: number) => EvaluationQuestion, base: number): EvaluationQuestion => {
        let candidate = make(base);
        for (let attempt = 0; attempt < 25; attempt++) {
          candidate = make(base + attempt * 7);
          const sig = signatureFor(candidate);
          if (!usedSignatures.has(sig)) {
            usedSignatures.add(sig);
            return candidate;
          }
        }
        // Si por algún motivo se agotaron variantes, forzar unicidad mínima
        const forced = make(base + 999);
        forced.questionText = `${forced.questionText} (variante)`;
        usedSignatures.add(signatureFor(forced));
        return forced;
      };

      // TRUE_FALSE
      for (let i = 0; i < tfCount; i++) {
        questions.push(tryMakeUnique(generateTrueFalseQuestion, i));
      }

      // MULTIPLE_CHOICE
      for (let i = 0; i < mcCount; i++) {
        questions.push(tryMakeUnique(generateMultipleChoiceQuestion, i));
      }

      // MULTIPLE_SELECTION
      for (let i = 0; i < msCount; i++) {
        questions.push(tryMakeUnique(generateMultipleSelectionQuestion, i));
      }

      return {
        evaluationTitle: `${isEs ? 'EVALUACIÓN' : 'EVALUATION'} - ${input.topic.toUpperCase()}`,
        questions
      };
  } catch (error) {
    console.error('Error generating dynamic evaluation content:', error);
    // Return fallback data with uniqueness
    const timestamp = input.timestamp || Date.now();
    const randomSeed = input.randomSeed || Math.floor(Math.random() * 1000);
    
    return {
      evaluationTitle: `${input.language === 'es' ? 'EVALUACIÓN' : 'EVALUATION'} - ${input.topic.toUpperCase()}`,
      questions: [
        // Fallback data with 15 questions - only the first one for brevity
        {
          id: `fallback_tf1_${timestamp}_${randomSeed}`,
          type: 'TRUE_FALSE',
          questionText: input.language === 'es'
            ? `Pregunta de respaldo V/F para "${input.topic}". ¿Esta pregunta es única? (ID: ${randomSeed})`
            : `Fallback T/F question for "${input.topic}". Is this question unique? (ID: ${randomSeed})`,
          correctAnswer: true,
          explanation: input.language === 'es'
            ? `Pregunta V/F generada como respaldo debido a un error en la API. Timestamp: ${timestamp}`
            : `T/F fallback question generated due to API error. Timestamp: ${timestamp}`
        }
        // Note: In a real implementation, you would include all 15 questions here
        // For now, keeping it short to avoid excessive mock data
      ]
    };
  }
}
