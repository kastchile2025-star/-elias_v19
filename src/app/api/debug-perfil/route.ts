import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [DEBUG PERFIL] Endpoint debug perfil llamado');
    
    // Datos de ejemplo para Jorge
    const jorgeData = {
      user: {
        username: 'jorge',
        name: 'Jorge González',
        role: 'teacher',
        email: 'jorge@escuela.cl'
      },
      backendProfile: {
        username: 'jorge',
        role: 'teacher',
        activeCourseNames: ['4to Básico', '5to Básico'],
        teachingSubjects: ['Matemáticas', 'Lenguaje y Comunicación'],
        name: 'Jorge González',
        email: 'jorge@escuela.cl',
        completedEvaluations: 12,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-12-20T15:45:00Z'
      },
      courses: [
        {
          id: '4-basico',
          name: '4to Básico',
          level: 'Básico',
          subjects: ['Matemáticas', 'Lenguaje y Comunicación'],
          studentsCount: 15,
          teacherId: 'jorge'
        },
        {
          id: '5-basico',
          name: '5to Básico', 
          level: 'Básico',
          subjects: ['Matemáticas', 'Lenguaje y Comunicación'],
          studentsCount: 18,
          teacherId: 'jorge'
        }
      ],
      subjects: [
        {
          id: 'mat',
          name: 'Matemáticas',
          tag: 'MAT',
          colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
          courseId: '4-basico'
        },
        {
          id: 'len',
          name: 'Lenguaje y Comunicación',
          tag: 'LEN', 
          colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
          courseId: '4-basico'
        }
      ],
      priority: {
        coursesSource: 'backend-courses', // backend-courses, backend-profile, local
        subjectsSource: 'backend-subjects', // backend-subjects, backend-profile, local
        expectedCourses: ['4to Básico', '5to Básico'],
        expectedSubjects: ['MAT', 'LEN']
      }
    };

    return NextResponse.json(jorgeData);
  } catch (error) {
    console.error('❌ [DEBUG PERFIL] Error:', error);
    return NextResponse.json(
      { error: 'Error en debug perfil', details: error }, 
      { status: 500 }
    );
  }
}
