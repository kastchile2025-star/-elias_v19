import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function json(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function initAdmin() {
  const admin = (await import('firebase-admin')).default;
  const fs = await import('fs/promises');
  const path = await import('path');
  if (admin.apps.length === 0) {
    let credential: any | null = null;
    let projectId: string | undefined;
    let loadedFrom = 'none';
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(sa);
        projectId = sa.project_id;
        loadedFrom = 'FIREBASE_SERVICE_ACCOUNT_JSON';
        console.log('✅ [initAdmin] Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_JSON');
      } catch (e) {
        console.error('❌ [initAdmin] Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
      }
    }
    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
      try {
        const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
        console.log(`🔍 [initAdmin] Intentando cargar desde FIREBASE_SERVICE_ACCOUNT_FILE: ${filePath}`);
        const txt = await fs.readFile(filePath!, 'utf-8');
        const sa = JSON.parse(txt);
        credential = admin.credential.cert(sa);
        projectId = sa.project_id;
        loadedFrom = `FIREBASE_SERVICE_ACCOUNT_FILE (${filePath})`;
        console.log(`✅ [initAdmin] Credenciales cargadas desde ${filePath}`);
      } catch (e: any) {
        console.error(`❌ [initAdmin] Error leyendo FIREBASE_SERVICE_ACCOUNT_FILE:`, e.message);
      }
    }
    if (!credential) {
      try {
        const p = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
        console.log(`🔍 [initAdmin] Intentando cargar desde archivo hardcoded: ${p}`);
        const txt = await fs.readFile(p, 'utf-8');
        const sa = JSON.parse(txt);
        credential = admin.credential.cert(sa);
        projectId = sa.project_id;
        loadedFrom = `hardcoded file (${p})`;
        console.log(`✅ [initAdmin] Credenciales cargadas desde archivo hardcoded`);
      } catch (e: any) {
        console.log(`⚠️ [initAdmin] Archivo hardcoded no encontrado: ${e.message}`);
      }
    }
    if (!credential) {
      credential = admin.credential.applicationDefault();
      projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
      loadedFrom = 'applicationDefault()';
      console.log('⚠️ [initAdmin] Usando credenciales por defecto del entorno');
    }
    
    console.log(`📋 [initAdmin] Credenciales cargadas desde: ${loadedFrom}`);
    console.log(`📋 [initAdmin] ProjectId: ${projectId}`);
    
    const appOptions: any = { credential };
    if (projectId) {
      appOptions.projectId = projectId;
      process.env.GOOGLE_CLOUD_PROJECT = projectId;
      process.env.GCLOUD_PROJECT = projectId;
      process.env.FIREBASE_CONFIG = JSON.stringify({ projectId });
    }
    admin.initializeApp(appOptions);
  }
  return (await import('firebase-admin')).default;
}

/**
 * DELETE ALL GRADES ENDPOINT
 * 
 * Este endpoint elimina TODAS las calificaciones de Firebase sin filtro de año.
 * Diseñado para eliminar ~107K+ registros de forma eficiente usando batches.
 * 
 * Query Parameters:
 *   - doit=1 (requerido): Confirmación de que se quiere eliminar TODO
 *   - paged=1 (opcional): Modo paginado para eliminar en lotes y evitar timeouts
 *   - limit=N (opcional): Número máximo de documentos por lote (default: 1000, max: 2000)
 *   - cursor=ID (opcional): ID del último curso procesado para continuar desde ahí
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doit = searchParams.get('doit');
    const paged = searchParams.get('paged') === '1';
    const limit = Math.max(1, Math.min(2000, Number(searchParams.get('limit') || 1000)));
    const cursor = searchParams.get('cursor') || undefined;

    // Confirmación requerida
    if (!doit) {
      return json({ ok: false, error: 'Falta ?doit=1 para confirmar la eliminación de TODOS los registros' }, 400);
    }

    const admin = await initAdmin();
    const db = admin.firestore();

    const deleteBatch = async (q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
      let total = 0;
      while (true) {
        const snap = await q.limit(300).get();
        if (snap.empty) break;
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        total += snap.size;
        // Pequeño delay para no saturar Firebase
        await new Promise((r) => setTimeout(r, 20));
      }
      return total;
    };

    let deleted = 0;
    let phase: 'group' | 'courses' = 'group';
    let nextCursor: string | null = null;
    let more = false;

    // Modo paginado: elimina en lotes para evitar timeouts
    if (paged) {
      const delSome = async (q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
        const snap = await q.limit(limit).get();
        if (snap.empty) return 0;
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        return snap.size;
      };

      // Intentar usar collectionGroup (más rápido pero puede requerir índice)
      try {
        deleted += await delSome(db.collectionGroup('grades'));
        // También eliminar actividades
        const activitiesDeleted = await delSome(db.collectionGroup('activities'));
        console.log(`🗑️ Actividades eliminadas: ${activitiesDeleted}`);
        
        if (deleted > 0) {
          phase = 'group';
          more = true; // Probablemente quedan más registros
          return json({ ok: true, deleted, activitiesDeleted, phase, more, nextCursor: null });
        }
      } catch (err) {
        console.log('⚠️ collectionGroup no disponible o sin índice, usando fallback por cursos');
      }

      // Fallback: eliminar por cursos (más lento pero garantizado)
      phase = 'courses';
      let query = db.collection('courses').orderBy(admin.firestore.FieldPath.documentId());
      if (cursor) {
        query = query.startAfter(cursor);
      }
      
      const coursesSnap = await query.limit(10).get(); // Procesar 10 cursos por llamada
      let activitiesDeleted = 0;
      for (const courseDoc of coursesSnap.docs) {
        const gradesCol = courseDoc.ref.collection('grades');
        deleted += await delSome(gradesCol);
        
        // También eliminar actividades de este curso
        const activitiesCol = courseDoc.ref.collection('activities');
        activitiesDeleted += await delSome(activitiesCol);
        
        nextCursor = courseDoc.id;
      }
      
      more = !!(coursesSnap.size === 10);
      return json({ ok: true, deleted, activitiesDeleted, phase, more, nextCursor });
    }

    // Modo no paginado: eliminar TODOS los registros en una sola llamada
    // (Puede causar timeout si hay demasiados registros)
    console.log('🗑️ [delete-all-grades] Iniciando eliminación completa...');
    
    let activitiesDeleted = 0;
    
    try {
      // Intentar eliminar usando collectionGroup (más eficiente)
      console.log('🗑️ Intentando collectionGroup para grades...');
      deleted += await deleteBatch(db.collectionGroup('grades'));
      
      console.log('🗑️ Intentando collectionGroup para activities...');
      activitiesDeleted += await deleteBatch(db.collectionGroup('activities'));
      
      phase = 'group';
    } catch (err: any) {
      console.log('⚠️ collectionGroup falló, usando fallback por cursos:', err.message);
      // Fallback: eliminar curso por curso
      const coursesSnap = await db.collection('courses').select().get();
      console.log(`🗑️ Procesando ${coursesSnap.size} cursos...`);
      
      for (const courseDoc of coursesSnap.docs) {
        // Eliminar calificaciones
        const gradesCol = courseDoc.ref.collection('grades');
        const gradesCount = await deleteBatch(gradesCol);
        deleted += gradesCount;
        
        // Eliminar actividades
        const activitiesCol = courseDoc.ref.collection('activities');
        const activitiesCount = await deleteBatch(activitiesCol);
        activitiesDeleted += activitiesCount;
        
        console.log(`🗑️ Curso ${courseDoc.id}: ${gradesCount} calificaciones y ${activitiesCount} actividades eliminadas`);
      }
      phase = 'courses';
    }

    console.log(`✅ [delete-all-grades] Eliminación completada: ${deleted} calificaciones y ${activitiesDeleted} actividades eliminadas`);
    return json({ ok: true, deleted, activitiesDeleted, phase, more: false, nextCursor: null });
  } catch (error: any) {
    console.error('❌ [delete-all-grades] Error:', error);
    return json({ ok: false, error: error?.message || String(error) }, 500);
  }
}
