import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutos máximo
export const dynamic = 'force-dynamic';

function jsonResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

/**
 * API Route: DELETE /api/firebase/delete-attendance-by-year
 * 
 * Elimina todos los registros de asistencia de un año específico en Firestore
 * usando Firebase Admin SDK.
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const yearParam = url.searchParams.get('year');
    const year = yearParam ? Number(yearParam) : NaN;

    if (isNaN(year) || year < 2000 || year > 2100) {
      return jsonResponse({ 
        error: 'Año inválido', 
        details: 'El parámetro year debe ser un número válido entre 2000 y 2100' 
      }, 400);
    }

    console.log(`🗑️ [API] Iniciando eliminación de asistencia para el año ${year}`);

    const admin = (await import('firebase-admin')).default;
    const fs = await import('fs/promises');
    const path = await import('path');

    // Inicializar Firebase Admin si no está ya inicializado
    if (admin.apps.length === 0) {
      let credential: any | null = null;
      let projectId: string | undefined;

      // Estrategia 1: Variable de entorno con JSON
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          credential = admin.credential.cert(sa);
          projectId = sa.project_id;
          console.log('✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_JSON');
        } catch (e) {
          console.error('❌ Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
        }
      }

      // Estrategia 2: Variable de entorno con ruta de archivo
      if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
        try {
          const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
          const fileTxt = await fs.readFile(filePath!, 'utf-8');
          const serviceAccount = JSON.parse(fileTxt);
          credential = admin.credential.cert(serviceAccount);
          projectId = serviceAccount.project_id;
          console.log('✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_FILE');
        } catch (e) {
          console.error('❌ Error leyendo FIREBASE_SERVICE_ACCOUNT_FILE:', e);
        }
      }

      // Estrategia 3: Archivo en .secrets/firebase-admin.json
      if (!credential) {
        try {
          const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
          const secretsFile = await fs.readFile(secretsPath, 'utf-8');
          const serviceAccount = JSON.parse(secretsFile);
          if (serviceAccount.type === 'service_account') {
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde .secrets/firebase-admin.json');
          }
        } catch (e) {
          console.log('⚠️ No se encontró .secrets/firebase-admin.json');
        }
      }

      // Estrategia 4: Archivo legacy en raíz
      if (!credential) {
        try {
          const credentialPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
          const credentialFile = await fs.readFile(credentialPath, 'utf-8');
          const serviceAccount = JSON.parse(credentialFile);
          credential = admin.credential.cert(serviceAccount);
          projectId = serviceAccount.project_id;
          console.log('✅ Credenciales cargadas desde archivo JSON directo');
        } catch (e) {
          console.log('⚠️ No se encontró archivo de credenciales en raíz');
        }
      }

      if (!credential) {
        return jsonResponse({ 
          error: 'Firebase Admin no configurado',
          details: 'No se encontraron credenciales válidas para Firebase Admin SDK'
        }, 500);
      }

      const appOptions: any = { credential };
      if (projectId) {
        appOptions.projectId = projectId;
        process.env.GOOGLE_CLOUD_PROJECT = projectId;
        process.env.GCLOUD_PROJECT = projectId;
      }

      admin.initializeApp(appOptions);
      console.log('✅ Firebase Admin inicializado correctamente');
    }

    const db = admin.firestore();
    let deleted = 0;
    const seenIds = new Set<string>();

    // Obtener todos los cursos
    const coursesSnapshot = await db.collection('courses').get();
    console.log(`📚 [Firebase] Encontrados ${coursesSnapshot.size} cursos para revisar`);

    for (const courseDoc of coursesSnapshot.docs) {
      const attRef = db.collection(`courses/${courseDoc.id}/attendance`);

      // Buscar con year como número
      const qNum = attRef.where('year', '==', year);
      const attSnapshotNum = await qNum.get();

      // También buscar con year como string (por si fue guardado así)
      const qStr = attRef.where('year', '==', String(year));
      const attSnapshotStr = await qStr.get();

      // Combinar resultados evitando duplicados
      const allDocs = [...attSnapshotNum.docs, ...attSnapshotStr.docs].filter(d => {
        if (seenIds.has(d.id)) return false;
        seenIds.add(d.id);
        return true;
      });

      console.log(`📋 [Firebase] Curso ${courseDoc.id}: ${allDocs.length} registros de asistencia para el año ${year}`);

      if (allDocs.length === 0) continue;

      // Procesar en lotes de 400 (límite de Firestore es 500)
      const CHUNK = 400;

      for (let i = 0; i < allDocs.length; i += CHUNK) {
        const part = allDocs.slice(i, i + CHUNK);
        const batch = db.batch();

        for (const d of part) {
          batch.delete(d.ref);
        }

        await batch.commit();
        deleted += part.length;

        console.log(`✅ [Firebase] Batch eliminado: ${part.length} registros (Total: ${deleted})`);
      }
    }

    console.log(`🎯 [Firebase] Eliminación completada: ${deleted} registros eliminados del año ${year}`);

    return jsonResponse({
      success: true,
      deleted,
      year,
      message: `Se eliminaron ${deleted} registros de asistencia del año ${year}`
    });

  } catch (error: any) {
    console.error('❌ Error eliminando asistencia:', error);
    return jsonResponse({
      success: false,
      error: 'Error al eliminar asistencia',
      details: error.message
    }, 500);
  }
}

// También soportar POST para compatibilidad
export async function POST(request: NextRequest) {
  return DELETE(request);
}
