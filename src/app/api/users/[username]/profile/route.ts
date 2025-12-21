import { NextRequest, NextResponse } from 'next/server';

/**
 * API para obtener el perfil completo de un usuario
 * GET /api/users/[username]/profile
 */

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  fullName?: string;
  rut?: string; // RUT del estudiante para vincular con calificaciones
  activeCourses?: string[];
  activeCourseNames?: string[];
  teachingSubjects?: string[];
  enrolledCourses?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Datos simulados del backend (en producción vendrían de una base de datos)
const mockUsers: UserProfile[] = [
  {
    id: 'user-jorge-001',
    username: 'jorge',
    email: 'jorge@smartstudent.com',
    role: 'teacher',
    fullName: 'Jorge Martínez',
    // 🎯 EXACTAMENTE como aparece en gestión de usuarios
    activeCourseNames: ['5to Básico', '4to Básico'],
    teachingSubjects: ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
  },
  {
    id: 'user-sofia-001',
    username: 'sofia',
    email: 'sofía.gonzález@student.cl',
    role: 'student',
    fullName: 'Sofía González González',
    rut: '10000000-8', // RUT para vincular con calificaciones en Firebase
    enrolledCourses: ['1ro Básico A'],
    activeCourseNames: ['1ro Básico A'],
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-20T14:45:00Z',
  },
  {
    id: 'user-felipe-001',
    username: 'felipe',
    email: 'felipe@smartstudent.com',
    role: 'student',
    fullName: 'Felipe González',
    enrolledCourses: ['5to Básico'],
    activeCourseNames: ['5to Básico'],
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-20T14:45:00Z',
  },
  {
    id: 'user-maria-001',
    username: 'maria',
    email: 'maria@smartstudent.com',
    role: 'student',
    fullName: 'María López',
    enrolledCourses: ['5to Básico'],
    activeCourseNames: ['5to Básico'],
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-20T14:45:00Z',
  },
  {
    id: 'user-jose-001',
    username: 'jose',
    email: 'jose@smartstudent.com',
    role: 'student',
    fullName: 'José Pérez',
    enrolledCourses: ['4to Básico'],
    activeCourseNames: ['4to Básico'],
    createdAt: '2024-02-15T11:30:00Z',
    updatedAt: '2024-12-20T16:20:00Z',
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    console.log('🔍 [API] Buscando perfil para usuario:', username);

    // Simular latencia de red (opcional)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Buscar el usuario en los datos simulados
    const user = mockUsers.find(u => u.username === username);

    if (!user) {
      console.log('❌ [API] Usuario no encontrado:', username);
      return NextResponse.json(
        { error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    console.log('✅ [API] Perfil encontrado:', user);

    return NextResponse.json(user, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });

  } catch (error) {
    console.error('❌ [API] Error obteniendo perfil de usuario:', error);
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const updates = await request.json();

    console.log('🔄 [API] Actualizando perfil para usuario:', username, updates);

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));

    // Buscar el índice del usuario
    const userIndex = mockUsers.findIndex(u => u.username === username);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Actualizar el usuario
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    console.log('✅ [API] Perfil actualizado:', mockUsers[userIndex]);

    return NextResponse.json(mockUsers[userIndex], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('❌ [API] Error actualizando perfil:', error);
    
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
