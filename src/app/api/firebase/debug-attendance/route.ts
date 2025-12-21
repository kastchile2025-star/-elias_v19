import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = (await import('firebase-admin')).default;
    const fs = await import('fs/promises');
    const path = await import('path');

    if (admin.apps.length === 0) {
      const credentialPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
      const content = await fs.readFile(credentialPath, 'utf-8');
      const sa = JSON.parse(content);
      admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
    }

    const db = admin.firestore();
    
    // Obtener 10 registros de asistencia para diagnóstico
    const snap = await db.collectionGroup('attendance').limit(10).get();
    
    const samples = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        path: doc.ref.path,
        year: data.year,
        yearType: typeof data.year,
        dateString: data.dateString,
        course: data.course,
        section: data.section
      };
    });
    
    // Contar por año
    const yearCounts: Record<string, number> = {};
    const allSnap = await db.collectionGroup('attendance').get();
    allSnap.docs.forEach(doc => {
      const yr = String(doc.data().year || 'unknown');
      yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    });

    return NextResponse.json({
      totalRecords: allSnap.size,
      yearCounts,
      samples
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
