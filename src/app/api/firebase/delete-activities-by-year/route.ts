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
      try { const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); credential = admin.credential.cert(sa); projectId = sa.project_id; } catch {}
    }
    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
      try { const txt = await fs.readFile(process.env.FIREBASE_SERVICE_ACCOUNT_FILE!, 'utf-8'); const sa = JSON.parse(txt); credential = admin.credential.cert(sa); projectId = sa.project_id; } catch {}
    }
    if (!credential) {
      try { const p = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json'); const txt = await fs.readFile(p, 'utf-8'); const sa = JSON.parse(txt); credential = admin.credential.cert(sa); projectId = sa.project_id; } catch {}
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
    const limit = Math.max(1, Math.min(2000, Number(searchParams.get('limit') || 1000)));
    const cursor = searchParams.get('cursor') || undefined;
    const courseIdFilter = searchParams.get('courseId') || undefined;
    const sectionIdFilter = searchParams.get('sectionId') || undefined; // e.g., 'a'

    const year = yearStr ? Number(yearStr) : NaN;
    if (!doit) return json({ ok: false, error: 'Falta ?doit=1 para confirmar la eliminación' }, 400);
    if (!Number.isFinite(year)) return json({ ok: false, error: 'Parámetro year inválido' }, 400);

    const admin = await initAdmin();
    const db = admin.firestore();

    const delSome = async (q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
      const snap = await q.limit(limit).get();
      if (snap.empty) return { deleted: 0, lastId: null as string | null };
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return { deleted: snap.size, lastId: snap.docs[snap.docs.length - 1].id };
    };

    let deleted = 0; let more = false; let nextCursor: string | null = null;

    if (courseIdFilter) {
      // Borrar sólo bajo un curso específico
      let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(`courses/${courseIdFilter}/activities`).where('year', '==', year);
      if (sectionIdFilter) query = query.where('sectionId', '==', sectionIdFilter);
      const res = await delSome(query);
      deleted += res.deleted; nextCursor = res.lastId; more = res.deleted === limit;
      return json({ ok: true, scope: 'course', courseId: courseIdFilter, sectionId: sectionIdFilter || null, year, deleted, more, nextCursor });
    }

    // Intento por collectionGroup
    let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collectionGroup('activities').where('year', '==', year);
    if (sectionIdFilter) q = q.where('sectionId', '==', sectionIdFilter);
    const res = await delSome(q);
    deleted += res.deleted; nextCursor = res.lastId; more = res.deleted === limit;

    return json({ ok: true, scope: 'group', year, sectionId: sectionIdFilter || null, deleted, more, nextCursor });
  } catch (error: any) {
    return json({ ok: false, error: error?.message || String(error) }, 500);
  }
}
