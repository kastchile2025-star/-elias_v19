'use server';

import { generateEvaluationContent as generateEvaluationFlow } from '@/ai/flows/generate-evaluation-content';

export interface EvaluationSubmissionInput {
  taskId: string;
  studentId: string;
  studentName: string;
  answers: any[];
  score: number;
  totalQuestions: number;
  completionPercentage: number;
  timeSpent: number;
  evaluationTitle: string;
  course: string;
  subject: string;
  topic: string;
}

export interface EvaluationSubmissionOutput {
  success: boolean;
  submissionId: string;
  completionPercentage: number;
  message: string;
  submissionData?: any;
}

export interface EvaluationGenerationInput {
  bookTitle: string;
  topic: string;
  language: 'es' | 'en';
  questionCount?: number;
  timeLimit?: number;
}

export interface EvaluationGenerationOutput {
  evaluationTitle: string;
  questions: any[];
}

/**
 * Server action para generar contenido de evaluación
 */
export async function generateEvaluationAction(input: EvaluationGenerationInput): Promise<EvaluationGenerationOutput> {
  try {
    console.log('📝 Server Action generateEvaluationAction called with:', input);
    console.log('🌍 Server Action received language:', input.language);
    
    const result = await generateEvaluationFlow(input);
    
    console.log('✅ Evaluation generated successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Error in generateEvaluationAction:', error);
    throw new Error(`Failed to generate evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Server action para enviar una evaluación completada por el estudiante
 */
export async function submitEvaluationAction(input: EvaluationSubmissionInput): Promise<EvaluationSubmissionOutput> {
  try {
    console.log('📤 Server Action submitEvaluationAction called with:', {
      taskId: input.taskId,
      studentId: input.studentId,
      score: input.score,
      completionPercentage: input.completionPercentage
    });

    // Generar ID único para la entrega
    const submissionId = `submission_${input.taskId}_${input.studentId}_${Date.now()}`;
    
    // En el lado del servidor, solo validamos y registramos la información
    // El cliente se encargará de actualizar el localStorage
    
    // Crear nueva submission data para retornar al cliente
    const newSubmission = {
      id: submissionId,
      taskId: input.taskId,
      studentId: input.studentId,
      studentName: input.studentName,
      submissionDate: new Date().toISOString(),
      answers: input.answers,
      score: input.score,
      totalQuestions: input.totalQuestions,
      completionPercentage: input.completionPercentage,
      timeSpent: input.timeSpent,
      evaluationTitle: input.evaluationTitle,
      course: input.course,
      subject: input.subject,
      topic: input.topic,
      status: 'completed',
      type: 'evaluation'
    };

    console.log('✅ Evaluation data processed successfully on server:', {
      submissionId,
      completionPercentage: input.completionPercentage,
      score: input.score
    });

    // Retornar datos para que el cliente actualice el localStorage
    return {
      success: true,
      submissionId,
      completionPercentage: input.completionPercentage,
      message: input.completionPercentage >= 70 
        ? '¡Excelente trabajo! Has completado la evaluación exitosamente.' 
        : 'Evaluación completada. ¡Sigue practicando para mejorar!',
      submissionData: newSubmission
    };
    
  } catch (error) {
    console.error('❌ Error in submitEvaluationAction:', error);
    throw new Error(`Failed to submit evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Server action para obtener el estado de una evaluación específica
 */
export async function getEvaluationStatusAction(taskId: string, studentId: string) {
  try {
    const userTasksKey = `userTasks_${studentId}`;
    const userTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]');
    
    const task = userTasks.find((task: any) => task.id === taskId);
    
    if (!task) {
      return { found: false, status: null };
    }

    return {
      found: true,
      status: task.status,
      completedAt: task.completedAt,
      score: task.score,
      completionPercentage: task.completionPercentage
    };
    
  } catch (error) {
    console.error('❌ Error in getEvaluationStatusAction:', error);
    throw new Error(`Failed to get evaluation status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
