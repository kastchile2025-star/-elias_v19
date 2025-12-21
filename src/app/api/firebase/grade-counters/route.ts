import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function jsonResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? Number(yearParam) : NaN;

  try {
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
        } catch (e) {
          // ignore, try file
        }
      }

      // Admitir ruta de archivo desde variable de entorno
      if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
        try {
          const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
          const txt = await fs.readFile(filePath!, 'utf-8');
          const sa = JSON.parse(txt);
          credential = admin.credential.cert(sa);
          projectId = sa.project_id;
        } catch (e) {
          // continuar con siguiente fallback
        }
      }

      // Buscar en .secrets/firebase-admin.json
      if (!credential) {
        try {
          const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
          const content = await fs.readFile(secretsPath, 'utf-8');
          const sa = JSON.parse(content);
          if (sa.type === 'service_account') {
            credential = admin.credential.cert(sa);
            projectId = sa.project_id;
          }
        } catch (e) {
          // continuar con siguiente fallback
        }
      }

      // Fallback: archivo en raíz del proyecto
      if (!credential) {
        try {
          const credentialPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
          const content = await fs.readFile(credentialPath, 'utf-8');
          const sa = JSON.parse(content);
          credential = admin.credential.cert(sa);
          projectId = sa.project_id;
        } catch (e) {
          // keep null; init will fail below and we report gracefully
        }
      }

      if (credential) {
        const appOptions: any = { credential };
        if (projectId) {
          appOptions.projectId = projectId;
          process.env.GOOGLE_CLOUD_PROJECT = projectId;
          process.env.GCLOUD_PROJECT = projectId;
          process.env.FIREBASE_CONFIG = JSON.stringify({ projectId });
        }
        admin.initializeApp(appOptions);
      } else {
        return jsonResponse({ ok: false, error: 'Firebase Admin no inicializado: faltan credenciales' }, 500);
      }
    }

    const db = admin.firestore();

    // Contador total de calificaciones (todas las colecciones courses/*/grades)
    const t0 = Date.now();
    let totalGrades = 0;
    try {
      // Preferir agregación count() si está disponible (rápido y económico)
      // @ts-ignore - Admin SDK soporta count() en runtime recientes
      const agg = await (db as any).collectionGroup('grades').count().get();
      const data = typeof agg?.data === 'function' ? agg.data() : (agg && (agg as any)[0]?.data?.());
      totalGrades = Number((data && (data.count ?? data.aggregate?.count)) || 0);
    } catch {
      // Fallback lento: obtener snapshot completo y contar
      const allSnap = await db.collectionGroup('grades').get();
      totalGrades = allSnap.size;
    }

    let yearCount = null as number | null;
    let yearCountMethod: 'field-filter' | 'courses-scan' | 'snapshot' | null = null;
  if (!Number.isNaN(year)) {
      // 1) Intento rápido: collectionGroup con filtro por campo year (num y string)
      try {
        // @ts-ignore - count() disponible en runtime recientes
        const aggNum = await (db as any)
          .collectionGroup('grades')
          .where('year', '==', year)
          .count()
          .get()
          .catch(() => null as any);
        // @ts-ignore
        const aggStr = await (db as any)
          .collectionGroup('grades')
          .where('year', '==', String(year))
          .count()
          .get()
          .catch(() => null as any);
        const dNum = aggNum && (typeof aggNum.data === 'function' ? aggNum.data() : (aggNum as any)[0]?.data?.());
        const dStr = aggStr && (typeof aggStr.data === 'function' ? aggStr.data() : (aggStr as any)[0]?.data?.());
        const cNum = Number((dNum && (dNum.count ?? dNum.aggregate?.count)) || 0);
        const cStr = Number((dStr && (dStr.count ?? dStr.aggregate?.count)) || 0);
        const sum = cNum + cStr;
        if (Number.isFinite(sum) && sum > 0) {
          yearCount = sum;
          yearCountMethod = 'field-filter';
        }
      } catch {
        // ignore -> fallback
      }

      // 2) Fallback: snapshots con filtro por campo (por si count() no está disponible)
      if (yearCount == null) {
        try {
          const [snapNum, snapStr] = await Promise.all([
            db.collectionGroup('grades').where('year', '==', year).get().catch(() => null as any),
            db.collectionGroup('grades').where('year', '==', String(year)).get().catch(() => null as any),
          ]);
          const cntNum = snapNum ? snapNum.size : 0;
          const cntStr = snapStr ? snapStr.size : 0;
          const sum = cntNum + cntStr;
          if (sum > 0) {
            yearCount = sum;
            yearCountMethod = 'snapshot';
          }
        } catch {
          // ignore -> next fallback
        }
      }

      // 3) Fallback definitivo: contar por cursos del año sumando sus subcolecciones grades
      //    Esto evita depender del campo 'year' en cada grade.
      if (yearCount == null || yearCount === 0) {
        try {
          const coursesNum = await db.collection('courses').where('year', '==', year).get().catch(() => null as any);
          const coursesStr = await db.collection('courses').where('year', '==', String(year)).get().catch(() => null as any);
          const courseDocs = [
            ...(coursesNum?.docs ?? []),
            ...(coursesStr?.docs ?? []),
          ];

          let sum = 0;
          // Consultar en lotes para no exceder límites
          for (let i = 0; i < courseDocs.length; i++) {
            const c = courseDocs[i];
            try {
              // @ts-ignore - count() en subcolección
              const agg = await (c.ref.collection('grades') as any).count().get();
              const data = typeof agg?.data === 'function' ? agg.data() : (agg && (agg as any)[0]?.data?.());
              sum += Number((data && (data.count ?? data.aggregate?.count)) || 0);
            } catch {
              const snap = await c.ref.collection('grades').get();
              sum += snap.size;
            }
          }

          // Si ya teníamos un conteo > 0, conservar el máximo para ser conservadores
          if (yearCount != null && yearCount > 0) {
            yearCount = Math.max(yearCount, sum);
          } else {
            yearCount = sum;
          }
          yearCountMethod = 'courses-scan';
        } catch {
          // último fallback fallido -> dejar null
        }
      }
    }

    const dt = Date.now() - t0;

  return jsonResponse({ ok: true, totalGrades, year: Number.isNaN(year) ? null : year, yearCount, dt, source: 'firebase-admin', method: yearCountMethod });
  } catch (error: any) {
    return jsonResponse({ ok: false, error: error?.message || String(error) }, 500);
  }
}
