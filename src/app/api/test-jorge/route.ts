import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 [TEST API] Endpoint de test llamado');
  
  // Simular datos del profesor Jorge
  const testData = {
    profile: {
      username: 'jorge',
      role: 'teacher',
      activeCourseNames: ['4to Básico', '5to Básico'],
      teachingSubjects: ['Matemáticas', 'Lenguaje y Comunicación'],
      name: 'Jorge González',
      email: 'jorge@escuela.cl'
    },
    courses: [
      {
        id: '4-basico',
        name: '4to Básico',
        level: 'Básico',
        subjects: ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia'],
        studentsCount: 15,
        teacherId: 'jorge'
      },
      {
        id: '5-basico', 
        name: '5to Básico',
        level: 'Básico',
        subjects: ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia'],
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
    ]
  };

  return NextResponse.json(testData);
}
