'use server';

/**
 * @fileOverview Generates evaluation content with mixed question types.
 *
 * - generateEvaluationContent - A function that handles the evaluation content generation process.
 * - GenerateEvaluationInput - The input type for the generateEvaluationContent function.
 * - GenerateEvaluationOutput - The return type for the generateEvaluationContent function.
 */

import {ai} from '@/ai/genkit';
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
      // Generate mock data dynamically based on questionCount
      const mockQuestions: EvaluationQuestion[] = [];
      
      // Generate questions dynamically
      for (let i = 1; i <= questionCount; i++) {
        const questionTypes: ('TRUE_FALSE' | 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECTION')[] = ['TRUE_FALSE', 'MULTIPLE_CHOICE', 'MULTIPLE_SELECTION'];
        const type = questionTypes[(i - 1) % 3]; // Distribute evenly
        
        if (type === 'TRUE_FALSE') {
          mockQuestions.push({
            id: i.toString(),
            type: 'TRUE_FALSE',
            questionText: input.language === 'es' 
              ? `¿El concepto ${i} de "${input.topic}" está relacionado con "${input.bookTitle}"?`
              : `Is concept ${i} of "${input.topic}" related to "${input.bookTitle}"?`,
            correctAnswer: i % 2 === 1, // Alternate true/false
            explanation: input.language === 'es'
              ? `Esta es una pregunta de ejemplo ${i} mientras se configura la API.`
              : `This is a sample question ${i} while the API is being configured.`
          });
        } else if (type === 'MULTIPLE_CHOICE') {
          mockQuestions.push({
            id: i.toString(),
            type: 'MULTIPLE_CHOICE',
            questionText: input.language === 'es'
              ? `¿Cuál es el aspecto más importante del concepto ${i} en "${input.topic}"?`
              : `What is the most important aspect of concept ${i} in "${input.topic}"?`,
            options: input.language === 'es' ? [
              `Característica A del concepto ${i}`,
              `Característica B del concepto ${i}`,
              `Característica C del concepto ${i}`,
              `Característica D del concepto ${i}`
            ] : [
              `Feature A of concept ${i}`,
              `Feature B of concept ${i}`,
              `Feature C of concept ${i}`,
              `Feature D of concept ${i}`
            ],
            correctAnswerIndex: (i - 1) % 4, // Distribute answers
            explanation: input.language === 'es'
              ? `Esta es una pregunta de ejemplo ${i} mientras se configura la API.`
              : `This is a sample question ${i} while the API is being configured.`
          });
        } else {
          mockQuestions.push({
            id: i.toString(),
            type: 'MULTIPLE_SELECTION',
            questionText: input.language === 'es'
              ? `¿Cuáles son las características principales del concepto ${i} en "${input.topic}"? (Selecciona todas las correctas)`
              : `What are the main characteristics of concept ${i} in "${input.topic}"? (Select all correct ones)`,
            options: input.language === 'es' ? [
              `Característica principal A del concepto ${i}`,
              `Característica principal B del concepto ${i}`,
              `Característica principal C del concepto ${i}`,
              `Característica principal D del concepto ${i}`
            ] : [
              `Main feature A of concept ${i}`,
              `Main feature B of concept ${i}`,
              `Main feature C of concept ${i}`,
              `Main feature D of concept ${i}`
            ],
            correctAnswerIndices: [0, (i % 3) + 1], // Two correct answers
            explanation: input.language === 'es'
              ? `Esta es una pregunta de ejemplo ${i} mientras se configura la API.`
              : `This is a sample question ${i} while the API is being configured.`
          });
        }
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
      language: input.language 
    });
    
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      // Return mock data with exact questionCount respecting proportions
      const timestamp = input.timestamp || Date.now();
      const randomSeed = input.randomSeed || Math.floor(Math.random() * 1000);
      const count = input.questionCount || 15;

      console.log('⚠️ Using mock data - API key not available. Language:', input.language);

      const makeId = (i: number) => `q${i + 1}_${timestamp}_${randomSeed}`;
      const isEs = input.language === 'es';
      const contextLabel = isEs ? `${input.subject ? input.subject + ' - ' : ''}${input.bookTitle}` : `${input.subject ? input.subject + ' - ' : ''}${input.bookTitle}`;

      // Distribución aproximada en tercios
      const tfCount = Math.round(count / 3);
      const mcCount = Math.round((count - tfCount) / 2);
      const msCount = count - tfCount - mcCount;

      const questions: EvaluationQuestion[] = [];

      // TRUE_FALSE
      for (let i = 0; i < tfCount; i++) {
        questions.push({
          id: makeId(questions.length),
          type: 'TRUE_FALSE',
          questionText: isEs
            ? `Según ${contextLabel}, ¿la afirmación ${i + 1} sobre "${input.topic}" es verdadera?`
            : `According to ${contextLabel}, is statement ${i + 1} about "${input.topic}" true?`,
          correctAnswer: i % 2 === 0,
          explanation: isEs
            ? `Pregunta V/F basada en el contenido del PDF (${input.bookTitle}).`
            : `T/F question based on the PDF content (${input.bookTitle}).`
        });
      }

      // MULTIPLE_CHOICE
      for (let i = 0; i < mcCount; i++) {
        questions.push({
          id: makeId(questions.length),
          type: 'MULTIPLE_CHOICE',
          questionText: isEs
            ? `¿Cuál opción describe mejor el concepto ${i + 1} de "${input.topic}" según ${contextLabel}?`
            : `Which option best describes concept ${i + 1} of "${input.topic}" according to ${contextLabel}?`,
          options: isEs
            ? [`Opción A`, `Opción B`, `Opción C`, `Opción D`]
            : [`Option A`, `Option B`, `Option C`, `Option D`],
          correctAnswerIndex: i % 4,
          explanation: isEs ? `Correcta según el texto base del PDF.` : `Correct according to the PDF base text.`
        });
      }

      // MULTIPLE_SELECTION
      for (let i = 0; i < msCount; i++) {
        const correct = [0, 2];
        questions.push({
          id: makeId(questions.length),
          type: 'MULTIPLE_SELECTION',
          questionText: isEs
            ? `Selecciona todas las alternativas correctas sobre "${input.topic}" basadas en ${contextLabel}.`
            : `Select all correct alternatives about "${input.topic}" based on ${contextLabel}.`,
          options: isEs
            ? [`Característica A`, `Característica B`, `Característica C`, `Característica D`]
            : [`Feature A`, `Feature B`, `Feature C`, `Feature D`],
          correctAnswerIndices: correct,
          explanation: isEs ? `Respuestas derivadas del material del PDF.` : `Answers derived from the PDF material.`
        });
      }

      return {
        evaluationTitle: `${isEs ? 'EVALUACIÓN' : 'EVALUATION'} - ${input.topic.toUpperCase()}`,
        questions
      };
    }
    
    return await generateDynamicEvaluationFlow(input);
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
