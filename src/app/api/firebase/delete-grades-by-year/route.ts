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
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(sa);
        projectId = sa.project_id;
      } catch {}
    }
    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
      try {
        const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
        const txt = await fs.readFile(filePath!, 'utf-8');
        const sa = JSON.parse(txt);
        credential = admin.credential.cert(sa);
        projectId = sa.project_id;
      } catch {}
    }
    if (!credential) {
      try {
        const p = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
        const txt = await fs.readFile(p, 'utf-8');
        const sa = JSON.parse(txt);
        credential = admin.credential.cert(sa);
        projectId = sa.project_id;
      } catch {}
    }
    if (!credential) {
      credential = admin.credential.applicationDefault();
      projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
    }
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

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get('year');
    const doit = searchParams.get('doit');
    const paged = searchParams.get('paged') === '1';
    const limit = Math.max(1, Math.min(2000, Number(searchParams.get('limit') || 1000))); // docs por llamada (group)
    const courseBatch = Math.max(1, Math.min(50, Number(searchParams.get('courseBatch') || 10))); // cursos por llamada
    const cursor = searchParams.get('cursor') || undefined; // id del último curso procesado
    const year = yearStr ? Number(yearStr) : NaN;

    if (!doit) return json({ ok: false, error: 'Falta ?doit=1 para confirmar la eliminación' }, 400);
    if (!Number.isFinite(year)) return json({ ok: false, error: 'Parámetro year inválido' }, 400);

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
        await new Promise((r) => setTimeout(r, 20));
      }
      return total;
    };

    // 1) Intento rápido: collectionGroup (puede requerir índice)
    let deleted = 0;
    let phase: 'group' | 'courses' = 'group';
    let nextCursor: string | null = null;
    let more = false;

    // Modo paginado: borra un máximo por llamada para evitar timeouts
    if (paged) {
      const delSome = async (q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
        const snap = await q.limit(limit).get();
        if (snap.empty) return 0;
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        return snap.size;
      };

      // Intentar numeric y string
      try { deleted += await delSome(db.collectionGroup('grades').where('year', '==', year)); } catch {}
      if (deleted === 0) {
        try { deleted += await delSome(db.collectionGroup('grades').where('year', '==', String(year))); } catch {}
      }
      if (deleted > 0) {
        phase = 'group';
        more = true; // probablemente quedan más; el cliente repetirá
        return json({ ok: true, year, deleted, phase, more, nextCursor });
      }

      // Fallback por cursos en lotes pequeños
      phase = 'courses';
      let query = db.collection('courses').orderBy(admin.firestore.FieldPath.documentId());
      if (cursor) {
        const curRef = db.collection('courses').doc(cursor);
        const curSnap = await curRef.get();
        if (curSnap.exists) query = query.startAfter(curSnap.id);
      }
      const coursesSnap = await query.limit(courseBatch).get();
      for (const courseDoc of coursesSnap.docs) {
        const gradesCol = courseDoc.ref.collection('grades');
        try { deleted += await delSome(gradesCol.where('year', '==', year)); } catch {}
        try { deleted += await delSome(gradesCol.where('year', '==', String(year))); } catch {}
        nextCursor = courseDoc.id;
      }
      more = !!(coursesSnap.size === courseBatch);
      return json({ ok: true, year, deleted, phase, more, nextCursor });
    }

    // Modo no paginado (borrado completo en una llamada) — mantiene compatibilidad
    try {
      const qNum = db.collectionGroup('grades').where('year', '==', year);
      deleted += await deleteBatch(qNum);
    } catch {}
    try {
      const qStr = db.collectionGroup('grades').where('year', '==', String(year));
      deleted += await deleteBatch(qStr);
    } catch {}
    if (deleted === 0) {
      const coursesSnap = await db.collection('courses').select().get();
      for (const courseDoc of coursesSnap.docs) {
        const gradesCol = courseDoc.ref.collection('grades');
        try { deleted += await deleteBatch(gradesCol.where('year', '==', year)); } catch {}
        try { deleted += await deleteBatch(gradesCol.where('year', '==', String(year))); } catch {}
      }
    }
    return json({ ok: true, year, deleted, phase: 'courses', more: false, nextCursor: null });
  } catch (error: any) {
    console.error('❌ [delete-grades-by-year] Error:', error);
    return json({ ok: false, error: error?.message || String(error) }, 500);
  }
}

// Soporte para método DELETE (alias de POST con doit=1)
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  url.searchParams.set('doit', '1');
  const modifiedReq = new NextRequest(url.toString(), {
    method: 'POST',
    headers: req.headers,
  });
  return POST(modifiedReq);
}
