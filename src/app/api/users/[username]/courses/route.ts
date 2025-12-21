import { NextRequest, NextResponse } from 'next/server';

/**
 * API para obtener los cursos asignados a un usuario
 * GET /api/users/[username]/courses
 */

interface Course {
  id: string;
  name: string;
  level: string;
  subjects: string[];
  studentsCount: number;
  teacherId?: string;
}

// Datos simulados de cursos específicos por usuario (en producción vendrían de una base de datos)
const mockUserCourses: Record<string, Course[]> = {
  jorge: [
    {
      id: 'course-5to-basico',
      name: '5to Básico',
      level: 'Básico',
      subjects: ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
      studentsCount: 18,
      teacherId: 'user-jorge-001',
    },
    {
      id: 'course-4to-basico',
      name: '4to Básico',
      level: 'Básico',
      subjects: ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
      studentsCount: 15,
      teacherId: 'user-jorge-001',
    }
  ],
  felipe: [
    {
      id: 'course-5to-basico',
      name: '5to Básico',
      level: 'Básico',
      subjects: ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia'],
      studentsCount: 2,
    }
  ],
  maria: [
    {
      id: 'course-5to-basico',
      name: '5to Básico',
      level: 'Básico',
      subjects: ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia'],
      studentsCount: 2,
    }
  ],
  jose: [
    {
      id: 'course-4to-basico',
      name: '4to Básico',
      level: 'Básico',
      subjects: ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia'],
      studentsCount: 1,
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    console.log('🔍 [API COURSES] Buscando cursos para usuario:', username);

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));

    // Buscar los cursos del usuario
    const userCourses = mockUserCourses[username] || [];

    console.log('✅ [API COURSES] Cursos encontrados para', username, ':', userCourses);

    return NextResponse.json(userCourses, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });

  } catch (error) {
    console.error('❌ [API COURSES] Error obteniendo cursos:', error);
    
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
