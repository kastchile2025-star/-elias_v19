import { NextRequest, NextResponse } from 'next/server';

/**
 * API para obtener las asignaturas de un usuario
 * GET /api/users/[username]/subjects
 */

interface Subject {
  id: string;
  name: string;
  tag: string;
  colorClass: string;
  courseId: string;
}

// Datos simulados de asignaturas específicas por usuario (en producción vendrían de una base de datos)
const mockUserSubjects: Record<string, Subject[]> = {
  jorge: [
    {
      id: 'subject-cnt-jorge',
      name: 'Ciencias Naturales',
      tag: 'CNT',
      colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-his-jorge',
      name: 'Historia, Geografía y Ciencias Sociales',
      tag: 'HIS',
      colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-len-jorge',
      name: 'Lenguaje y Comunicación',
      tag: 'LEN',
      colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-mat-jorge',
      name: 'Matemáticas',
      tag: 'MAT',
      colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      courseId: 'course-4to-basico',
    }
  ],
  felipe: [
    {
      id: 'subject-mat-felipe',
      name: 'Matemáticas',
      tag: 'MAT',
      colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-len-felipe',
      name: 'Lenguaje y Comunicación',
      tag: 'LEN',
      colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-cnt-felipe',
      name: 'Ciencias Naturales',
      tag: 'CNT',
      colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-his-felipe',
      name: 'Historia',
      tag: 'HIS',
      colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      courseId: 'course-5to-basico',
    }
  ],
  maria: [
    {
      id: 'subject-mat-maria',
      name: 'Matemáticas',
      tag: 'MAT',
      colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-len-maria',
      name: 'Lenguaje y Comunicación',
      tag: 'LEN',
      colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-cnt-maria',
      name: 'Ciencias Naturales',
      tag: 'CNT',
      colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      courseId: 'course-5to-basico',
    },
    {
      id: 'subject-his-maria',
      name: 'Historia',
      tag: 'HIS',
      colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      courseId: 'course-5to-basico',
    }
  ],
  jose: [
    {
      id: 'subject-mat-jose',
      name: 'Matemáticas',
      tag: 'MAT',
      colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      courseId: 'course-4to-basico',
    },
    {
      id: 'subject-len-jose',
      name: 'Lenguaje y Comunicación',
      tag: 'LEN',
      colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      courseId: 'course-4to-basico',
    },
    {
      id: 'subject-cnt-jose',
      name: 'Ciencias Naturales',
      tag: 'CNT',
      colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      courseId: 'course-4to-basico',
    },
    {
      id: 'subject-his-jose',
      name: 'Historia',
      tag: 'HIS',
      colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      courseId: 'course-4to-basico',
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    console.log('🔍 [API SUBJECTS] Buscando asignaturas para usuario:', username);

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 200));

    // Buscar las asignaturas del usuario
    const userSubjects = mockUserSubjects[username] || [];

    console.log('✅ [API SUBJECTS] Asignaturas encontradas para', username, ':', userSubjects);

    return NextResponse.json(userSubjects, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });

  } catch (error) {
    console.error('❌ [API SUBJECTS] Error obteniendo asignaturas:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        code: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
