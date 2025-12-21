import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Endpoint simple para verificar si Firebase está habilitado y configurado
 * No requiere Firebase Admin SDK, solo verifica las variables de entorno
 */
export async function GET() {
  try {
    // Verificar si Firebase está habilitado
    const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
    
    if (!useFirebase) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Firebase no está habilitado',
          enabled: false
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          }
        }
      );
    }

    // Verificar que las credenciales básicas estén configuradas
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

    if (!apiKey || !projectId || !authDomain) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Credenciales de Firebase incompletas',
          enabled: true,
          configured: false,
          missing: [
            !apiKey && 'NEXT_PUBLIC_FIREBASE_API_KEY',
            !projectId && 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            !authDomain && 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
          ].filter(Boolean)
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          }
        }
      );
    }

    // Todo está configurado correctamente
    return NextResponse.json(
      { 
        ok: true, 
        enabled: true,
        configured: true,
        projectId,
        authDomain,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );

  } catch (error: any) {
    console.error('Error en /api/firebase/health:', error);
    
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Error desconocido',
        code: error.code || 'unknown'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  }
}
