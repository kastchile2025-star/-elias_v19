/**
 * Firebase Cloud Functions para Smart Student
 * 
 * Funciones:
 * 1. scheduledStatsRebuild: Cron job que recalcula estadísticas diariamente
 * 2. onBulkUploadComplete: Trigger que detecta cargas masivas y recalcula stats
 * 3. rebuildStatsHttp: Endpoint HTTP para triggear rebuild manualmente
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Nombres de meses en español
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Función de utilidad para reconstruir estadísticas de un año
 */
async function rebuildStatsForYear(year: number): Promise<{
  success: boolean;
  attendance?: any;
  grades?: any;
  general?: any;
  duration: number;
}> {
  const startTime = Date.now();
  console.log(`🔄 Rebuilding stats for year ${year}...`);
  
  try {
    // ========================================
    // 1. ESTADÍSTICAS DE ASISTENCIA
    // ========================================
    const attendanceByStatus = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0
    };
    
    const coursesSnap = await db.collection('courses').get();
    const monthlyData: Record<number, { present: number; absent: number; late: number; excused: number; total: number }> = {};
    const courseData: Record<string, { present: number; absent: number; total: number; name: string }> = {};
    
    // Inicializar meses
    for (let m = 1; m <= 12; m++) {
      monthlyData[m] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    }
    
    for (const courseDoc of coursesSnap.docs) {
      const courseId = courseDoc.id;
      const courseName = courseDoc.data()?.name || courseDoc.data()?.gradeName || courseId;
      
      if (!courseData[courseId]) {
        courseData[courseId] = { present: 0, absent: 0, total: 0, name: courseName };
      }
      
      const attRef = db.collection(`courses/${courseId}/attendance`);
      const [numSnap, strSnap] = await Promise.all([
        attRef.where('year', '==', year).get(),
        attRef.where('year', '==', String(year)).get()
      ]);
      
      const seenIds = new Set<string>();
      const allDocs = [...numSnap.docs, ...strSnap.docs];
      
      for (const doc of allDocs) {
        if (seenIds.has(doc.id)) continue;
        seenIds.add(doc.id);
        
        const data = doc.data();
        const status = String(data.status || 'present').toLowerCase();
        
        attendanceByStatus.total++;
        if (status === 'present') attendanceByStatus.present++;
        else if (status === 'absent') attendanceByStatus.absent++;
        else if (status === 'late') attendanceByStatus.late++;
        else if (status === 'excused') attendanceByStatus.excused++;
        else attendanceByStatus.present++;
        
        // Extraer mes
        let month = 1;
        try {
          const dateStr = data.date || data.dateString;
          if (typeof dateStr === 'string') {
            if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              month = parts[0].length === 4 ? parseInt(parts[1]) : parseInt(parts[1]);
            } else if (dateStr.includes('/')) {
              month = parseInt(dateStr.split('/')[1]);
            }
          } else if (data.date?.toDate) {
            month = data.date.toDate().getMonth() + 1;
          }
        } catch (e) { /* use default */ }
        
        if (month >= 1 && month <= 12) {
          monthlyData[month].total++;
          if (status === 'present') monthlyData[month].present++;
          else if (status === 'absent') monthlyData[month].absent++;
          else if (status === 'late') monthlyData[month].late++;
          else if (status === 'excused') monthlyData[month].excused++;
        }
        
        courseData[courseId].total++;
        if (status === 'present' || status === 'late') {
          courseData[courseId].present++;
        } else {
          courseData[courseId].absent++;
        }
      }
    }
    
    const attendanceRate = attendanceByStatus.total > 0
      ? Math.round(((attendanceByStatus.present + attendanceByStatus.late) / attendanceByStatus.total) * 10000) / 100
      : 0;
    
    // ========================================
    // 2. ESTADÍSTICAS DE CALIFICACIONES
    // ========================================
    let totalGrades = 0;
    let sumScores = 0;
    let approvedCount = 0;
    let failedCount = 0;
    
    for (const courseDoc of coursesSnap.docs) {
      const gradesRef = db.collection(`courses/${courseDoc.id}/grades`);
      const [numSnap, strSnap] = await Promise.all([
        gradesRef.where('year', '==', year).get(),
        gradesRef.where('year', '==', String(year)).get()
      ]);
      
      const seenIds = new Set<string>();
      for (const doc of [...numSnap.docs, ...strSnap.docs]) {
        if (seenIds.has(doc.id)) continue;
        seenIds.add(doc.id);
        
        const data = doc.data();
        const score = typeof data.score === 'number' ? data.score 
          : typeof data.grade === 'number' ? data.grade 
          : null;
        
        if (score !== null) {
          totalGrades++;
          sumScores += score;
          if (score >= 60 || (score >= 4.0 && score <= 7.0)) {
            approvedCount++;
          } else {
            failedCount++;
          }
        }
      }
    }
    
    // ========================================
    // 3. ESTADÍSTICAS GENERALES
    // ========================================
    const usersSnap = await db.collection('users').get();
    let totalStudents = 0;
    let totalTeachers = 0;
    
    usersSnap.docs.forEach(doc => {
      const role = String(doc.data()?.role || '').toLowerCase();
      if (role === 'student' || role === 'estudiante') totalStudents++;
      else if (role === 'teacher' || role === 'profesor') totalTeachers++;
    });
    
    let totalSections = 0;
    for (const courseDoc of coursesSnap.docs) {
      const sectionsSnap = await db.collection(`courses/${courseDoc.id}/sections`).get();
      totalSections += sectionsSnap.size;
    }
    
    // ========================================
    // 4. GUARDAR EN STATS_CACHE
    // ========================================
    const statsRef = db.collection('stats_cache').doc(String(year));
    const now = new Date().toISOString();
    
    const attendance = {
      totalRecords: attendanceByStatus.total,
      presentCount: attendanceByStatus.present,
      absentCount: attendanceByStatus.absent,
      lateCount: attendanceByStatus.late,
      excusedCount: attendanceByStatus.excused,
      attendanceRate
    };
    
    const grades = {
      totalRecords: totalGrades,
      averageScore: totalGrades > 0 ? Math.round((sumScores / totalGrades) * 100) / 100 : 0,
      approvedCount,
      failedCount,
      approvalRate: totalGrades > 0 ? Math.round((approvedCount / totalGrades) * 10000) / 100 : 0
    };
    
    const general = {
      totalStudents,
      totalCourses: coursesSnap.size,
      totalSections,
      totalTeachers
    };
    
    await statsRef.set({
      year,
      lastUpdated: now,
      attendance,
      grades,
      general
    }, { merge: true });
    
    // Guardar datos mensuales
    const monthlyBatch = db.batch();
    Object.entries(monthlyData)
      .filter(([_, data]) => data.total > 0)
      .forEach(([month, data]) => {
        const monthRef = statsRef.collection('monthly').doc(String(month).padStart(2, '0'));
        monthlyBatch.set(monthRef, {
          month: parseInt(month),
          monthName: MONTH_NAMES[parseInt(month) - 1],
          attendanceRate: data.total > 0
            ? Math.round(((data.present + data.late) / data.total) * 10000) / 100
            : 0,
          totalRecords: data.total,
          presentCount: data.present,
          absentCount: data.absent,
          lateCount: data.late,
          excusedCount: data.excused
        });
      });
    await monthlyBatch.commit();
    
    // Guardar datos por curso
    const courseBatch = db.batch();
    Object.entries(courseData)
      .filter(([_, data]) => data.total > 0)
      .forEach(([courseId, data]) => {
        const courseRef = statsRef.collection('courses').doc(courseId);
        courseBatch.set(courseRef, {
          courseId,
          courseName: data.name,
          attendanceRate: data.total > 0
            ? Math.round((data.present / data.total) * 10000) / 100
            : 0,
          totalRecords: data.total,
          presentCount: data.present,
          absentCount: data.absent
        });
      });
    await courseBatch.commit();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Stats rebuilt for year ${year} in ${duration}ms`);
    
    return { success: true, attendance, grades, general, duration };
    
  } catch (error) {
    console.error(`❌ Error rebuilding stats for year ${year}:`, error);
    return { success: false, duration: Date.now() - startTime };
  }
}

/**
 * FUNCIÓN 1: Cron Job - Recalcula estadísticas diariamente a las 2:00 AM (Chile)
 * 
 * Ejecuta automáticamente todos los días para mantener las estadísticas actualizadas.
 */
export const scheduledStatsRebuild = functions
  .region('us-central1')
  .pubsub
  .schedule('0 2 * * *') // Todos los días a las 2:00 AM
  .timeZone('America/Santiago')
  .onRun(async (context) => {
    console.log('🕐 [scheduledStatsRebuild] Iniciando rebuild programado...');
    
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1]; // Año actual y anterior
    
    for (const year of years) {
      await rebuildStatsForYear(year);
    }
    
    console.log('✅ [scheduledStatsRebuild] Completado');
    return null;
  });

/**
 * FUNCIÓN 2: HTTP Endpoint - Permite triggear rebuild manualmente
 * 
 * Útil para:
 * - Después de cargas masivas
 * - Debugging
 * - Forzar actualización
 * 
 * POST https://us-central1-superjf1234-e9cbc.cloudfunctions.net/rebuildStatsHttp
 * Body: { "year": 2025 }
 */
export const rebuildStatsHttp = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    try {
      const year = parseInt(req.body?.year) || new Date().getFullYear();
      console.log(`🔄 [rebuildStatsHttp] Rebuilding stats for year ${year}...`);
      
      const result = await rebuildStatsForYear(year);
      
      res.json(result);
    } catch (error: any) {
      console.error('❌ [rebuildStatsHttp] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

/**
 * FUNCIÓN 3: Firestore Trigger - Detecta cambios masivos en asistencia
 * 
 * Se activa cuando hay muchas escrituras en la colección de asistencia.
 * Usa un documento de control para evitar rebuilds excesivos.
 */
export const onAttendanceWrite = functions
  .region('us-central1')
  .firestore
  .document('courses/{courseId}/attendance/{attendanceId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const year = parseInt(data?.year) || new Date().getFullYear();
    
    // Control de rate limiting: solo rebuild si pasaron más de 5 minutos desde el último
    const controlRef = db.collection('stats_control').doc(`rebuild_${year}`);
    const controlDoc = await controlRef.get();
    
    if (controlDoc.exists) {
      const lastRebuild = controlDoc.data()?.lastRebuild?.toDate?.() || new Date(0);
      const minutesSinceLastRebuild = (Date.now() - lastRebuild.getTime()) / 60000;
      
      if (minutesSinceLastRebuild < 5) {
        // Incrementar contador pendiente
        await controlRef.update({
          pendingCount: admin.firestore.FieldValue.increment(1)
        });
        console.log(`⏳ [onAttendanceWrite] Rate limited. Pending count incremented for year ${year}`);
        return;
      }
    }
    
    // Marcar inicio de rebuild
    await controlRef.set({
      lastRebuild: admin.firestore.Timestamp.now(),
      pendingCount: 0,
      status: 'rebuilding'
    }, { merge: true });
    
    // Ejecutar rebuild
    await rebuildStatsForYear(year);
    
    // Marcar como completado
    await controlRef.update({
      status: 'completed',
      completedAt: admin.firestore.Timestamp.now()
    });
    
    console.log(`✅ [onAttendanceWrite] Stats rebuilt for year ${year}`);
  });

/**
 * FUNCIÓN 4: Callable Function - Para llamar desde el cliente con auth
 * 
 * Permite que usuarios autenticados (admin/teacher) triggeen un rebuild.
 */
export const rebuildStatsCallable = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Debe estar autenticado');
    }
    
    const year = parseInt(data?.year) || new Date().getFullYear();
    console.log(`🔄 [rebuildStatsCallable] User ${context.auth.uid} requesting rebuild for year ${year}`);
    
    const result = await rebuildStatsForYear(year);
    
    return result;
  });
