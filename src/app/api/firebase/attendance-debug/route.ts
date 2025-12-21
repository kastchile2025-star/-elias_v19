import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  try {
    const admin = (await import('firebase-admin')).default;

    // Inicializar Firebase Admin si no está inicializado
    if (admin.apps.length === 0) {
      let credential: any | null = null;
      let projectId: string | undefined;

      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          credential = admin.credential.cert(sa);
          projectId = sa.project_id;
        } catch (e) {
          console.error('Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
        }
      }

      if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const saPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_FILE);
          const sa = JSON.parse(await fs.readFile(saPath, 'utf-8'));
          credential = admin.credential.cert(sa);
          projectId = sa.project_id;
        } catch (e) {
          console.error('Error leyendo FIREBASE_SERVICE_ACCOUNT_FILE:', e);
        }
      }

      if (!credential) {
        return jsonResponse({ error: 'Firebase Admin no configurado correctamente' }, 500);
      }

      admin.initializeApp({
        credential,
        projectId
      });
    }

    const db = admin.firestore();
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    console.log(`🔍 [DEBUG] Verificando asistencia para año: ${year}`);

    // Obtener todos los cursos
    const coursesSnapshot = await db.collection('courses').get();
    const coursesCount = coursesSnapshot.size;

    console.log(`📚 [DEBUG] Cursos encontrados: ${coursesCount}`);

    const courseDetails: any[] = [];
    let totalRecords = 0;
    let recordsWithYear = 0;
    let recordsWithoutYear = 0;
    const yearsFound = new Set<number>();

    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();

      // Obtener asistencia del curso
      const attendanceSnapshot = await db
        .collection(`courses/${courseId}/attendance`)
        .get();

      const attendanceWithYear = [];
      const attendanceWithoutYear = [];
      const attendanceForTargetYear = [];

      for (const attDoc of attendanceSnapshot.docs) {
        const attData = attDoc.data();
        totalRecords++;

        if (attData.year !== undefined && attData.year !== null) {
          recordsWithYear++;
          yearsFound.add(attData.year);
          attendanceWithYear.push({ id: attDoc.id, year: attData.year, date: attData.date });

          if (attData.year === year) {
            attendanceForTargetYear.push({ id: attDoc.id, ...attData });
          }
        } else {
          recordsWithoutYear++;
          attendanceWithoutYear.push({ id: attDoc.id, date: attData.date });
        }
      }

      if (attendanceSnapshot.size > 0) {
        courseDetails.push({
          courseId,
          courseName: courseData.name || 'Sin nombre',
          totalAttendance: attendanceSnapshot.size,
          withYear: attendanceWithYear.length,
          withoutYear: attendanceWithoutYear.length,
          forTargetYear: attendanceForTargetYear.length,
          samples: {
            withYear: attendanceWithYear.slice(0, 3),
            withoutYear: attendanceWithoutYear.slice(0, 3),
            forTargetYear: attendanceForTargetYear.slice(0, 3)
          }
        });

        console.log(`  📖 Curso ${courseData.name}: ${attendanceSnapshot.size} registros (${attendanceForTargetYear.length} del año ${year})`);
      }
    }

    const result = {
      year,
      timestamp: new Date().toISOString(),
      summary: {
        totalCourses: coursesCount,
        totalRecords,
        recordsWithYear,
        recordsWithoutYear,
        recordsForTargetYear: courseDetails.reduce((sum, c) => sum + c.forTargetYear, 0),
        yearsFound: Array.from(yearsFound).sort()
      },
      courseDetails: courseDetails.sort((a, b) => b.forTargetYear - a.forTargetYear)
    };

    console.log(`✅ [DEBUG] Resumen - Total: ${totalRecords}, Año ${year}: ${result.summary.recordsForTargetYear}`);

    return jsonResponse(result);
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
    return jsonResponse({
      error: 'Error al obtener datos de diagnóstico',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}
