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
          // ignore
        }
      }

      if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
        try {
          const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
          const txt = await fs.readFile(filePath!, 'utf-8');
          const sa = JSON.parse(txt);
          credential = admin.credential.cert(sa);
          projectId = sa.project_id;
        } catch (e) {
          // ignore
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
            console.log('✅ Credenciales cargadas desde .secrets/firebase-admin.json');
          }
        } catch (e) {
          // ignore
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
          // ignore
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

    // Contador total de asistencia (todas las colecciones courses/*/attendance)
    const t0 = Date.now();
    let totalAttendance = 0;
    let authError = false;
    
    try {
      // @ts-ignore - Admin SDK soporta count() en runtime recientes
      const agg = await (db as any).collectionGroup('attendance').count().get();
      if (agg) {
        const data = typeof agg?.data === 'function' ? agg.data() : (agg && (agg as any)[0]?.data?.());
        totalAttendance = Number((data && (data.count ?? data.aggregate?.count)) || 0);
      }
    } catch (countError: any) {
      // Detectar errores de autenticación
      const isAuthErr = countError?.code === 16 || 
                        countError?.message?.includes('UNAUTHENTICATED') ||
                        countError?.message?.includes('authentication') ||
                        countError?.message?.includes('credentials');
      
      if (isAuthErr) {
        console.error('❌ Error de autenticación Firebase Admin:', countError.message);
        authError = true;
      } else {
        console.warn('⚠️ count() falló para total, intentando snapshot:', countError);
        try {
          const allSnap = await db.collectionGroup('attendance').limit(10000).get();
          totalAttendance = allSnap.size;
        } catch (snapError: any) {
          const isSnapAuthErr = snapError?.message?.includes('UNAUTHENTICATED') || 
                                snapError?.message?.includes('authentication');
          if (isSnapAuthErr) {
            authError = true;
            console.error('❌ Error de autenticación en snapshot:', snapError.message);
          } else {
            console.warn('⚠️ snapshot también falló, retornando 0');
          }
          totalAttendance = 0;
        }
      }
    }
    
    // Si hay error de autenticación, devolver respuesta indicando el problema
    if (authError) {
      return jsonResponse({
        ok: false,
        authError: true,
        error: 'Firebase Admin no puede autenticarse. Las credenciales pueden haber expirado.',
        message: 'Regenera las credenciales en Firebase Console → Configuración → Cuentas de servicio',
        totalAttendance: 0,
        yearCount: 0,
        year: Number.isNaN(year) ? null : year,
        dt: Date.now() - t0,
        source: 'firebase-admin-auth-error'
      }, 200); // Devolver 200 para que el cliente pueda mostrar el mensaje
    }

    let yearCount = null as number | null;
    let yearCountMethod: 'field-filter' | 'courses-scan' | 'snapshot' | 'manual-scan' | null = null;
    
    if (!Number.isNaN(year)) {
      // 1) Intento rápido: collectionGroup con filtro por campo year
      try {
        // @ts-ignore
        const aggNum = await (db as any)
          .collectionGroup('attendance')
          .where('year', '==', year)
          .count()
          .get()
          .catch(() => null as any);
        // @ts-ignore
        const aggStr = await (db as any)
          .collectionGroup('attendance')
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
      } catch (e) {
        console.warn('⚠️ count() con filtro year falló:', e);
      }

      // 2) Fallback: snapshots con filtro por campo
      if (yearCount == null || yearCount === 0) {
        try {
          const [snapNum, snapStr] = await Promise.all([
            db.collectionGroup('attendance').where('year', '==', year).get().catch(() => null as any),
            db.collectionGroup('attendance').where('year', '==', String(year)).get().catch(() => null as any),
          ]);
          const cntNum = snapNum ? snapNum.size : 0;
          const cntStr = snapStr ? snapStr.size : 0;
          const sum = cntNum + cntStr;
          if (sum > 0) {
            yearCount = sum;
            yearCountMethod = 'snapshot';
          }
        } catch (e) {
          console.warn('⚠️ snapshot con filtro year falló:', e);
        }
      }
      
      // 3) Fallback manual: obtener todos y filtrar en memoria
      if (yearCount == null || yearCount === 0) {
        try {
          console.log(`🔍 Usando fallback manual para contar año ${year}...`);
          const allSnap = await db.collectionGroup('attendance').get();
          let count = 0;
          allSnap.docs.forEach(doc => {
            const docYear = doc.data().year;
            if (docYear === year || docYear === String(year) || Number(docYear) === year) {
              count++;
            }
          });
          yearCount = count;
          yearCountMethod = 'manual-scan';
          console.log(`✅ Conteo manual: ${count} registros para año ${year}`);
        } catch (e) {
          console.warn('⚠️ Fallback manual falló:', e);
        }
      }

      // 4) Fallback por cursos (legacy) - solo si manual-scan no funcionó
      // NOTA: Este método es problemático porque cuenta TODOS los registros del curso, no solo los del año
      // Por eso lo dejamos como último recurso y ya no debería ejecutarse
      if (yearCount == null) {
        try {
          console.log(`⚠️ Usando fallback courses-scan para año ${year}...`);
          const coursesNum = await db.collection('courses').where('year', '==', year).get().catch(() => null as any);
          const coursesStr = await db.collection('courses').where('year', '==', String(year)).get().catch(() => null as any);
          const courseDocs = [
            ...(coursesNum?.docs ?? []),
            ...(coursesStr?.docs ?? []),
          ];

          let sum = 0;
          for (let i = 0; i < courseDocs.length; i++) {
            const c = courseDocs[i];
            try {
              // @ts-ignore
              const agg = await (c.ref.collection('attendance') as any).count().get();
              const data = typeof agg?.data === 'function' ? agg.data() : (agg && (agg as any)[0]?.data?.());
              sum += Number((data && (data.count ?? data.aggregate?.count)) || 0);
            } catch {
              const snap = await c.ref.collection('attendance').get();
              sum += snap.size;
            }
          }

          yearCount = sum;
          yearCountMethod = 'courses-scan';
        } catch {
          // último fallback fallido -> dejar null
        }
      }
    }

    const dt = Date.now() - t0;

    return jsonResponse({ 
      ok: true, 
      totalAttendance, 
      year: Number.isNaN(year) ? null : year, 
      yearCount, 
      dt, 
      source: 'firebase-admin', 
      method: yearCountMethod 
    });
  } catch (error: any) {
    return jsonResponse({ ok: false, error: error?.message || String(error) }, 500);
  }
}
