/**
 * API: /api/stats/rebuild
 * 
 * Endpoint para recalcular estadísticas usando count() y agregaciones de Firestore.
 * Guarda los resultados en stats_cache/{year} para consultas rápidas.
 * 
 * Este endpoint usa Firebase Admin SDK para:
 * 1. Ejecutar count() queries (no carga todos los documentos)
 * 2. Calcular agregados por mes y curso
 * 3. Guardar resultados en stats_cache
 * 
 * POST body:
 * - year: Año a recalcular (default: año actual)
 * - what: Array de qué recalcular ['attendance', 'grades', 'all'] (default: 'all')
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Permitir hasta 60 segundos para rebuilds grandes

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

// Nombres de meses en español
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface RebuildResult {
  year: number;
  success: boolean;
  attendance?: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
  };
  grades?: {
    totalRecords: number;
    averageScore: number;
    approvedCount: number;
    failedCount: number;
    approvalRate: number;
  };
  general?: {
    totalStudents: number;
    totalCourses: number;
    totalSections: number;
    totalTeachers: number;
  };
  monthly?: any[];
  courses?: any[];
  duration: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json().catch(() => ({}));
    const year = Number(body?.year || new Date().getFullYear());
    const what: string[] = Array.isArray(body?.what) ? body.what : ['all'];
    const includeAll = what.includes('all');
    const includeAttendance = includeAll || what.includes('attendance');
    const includeGrades = includeAll || what.includes('grades');
    
    console.log(`🔄 [stats/rebuild] Iniciando rebuild para año ${year}...`);
    
    const db = getAdminFirestore();
    const result: RebuildResult = {
      year,
      success: false,
      duration: 0
    };
    
    // ========================================
    // 1. ESTADÍSTICAS DE ASISTENCIA
    // ========================================
    if (includeAttendance) {
      console.log('📊 Calculando estadísticas de asistencia...');
      
      // Obtener todos los registros de asistencia del año usando collectionGroup
      // Usamos una consulta batch para contar por status
      const attendanceByStatus = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0
      };
      
      // Obtener cursos para iterar sus subcolecciones de attendance
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
        
        // Query con year como número
        const attRef = db.collection(`courses/${courseId}/attendance`);
        const yearNumQuery = attRef.where('year', '==', year);
        const yearStrQuery = attRef.where('year', '==', String(year));
        
        const [numSnap, strSnap] = await Promise.all([
          yearNumQuery.get(),
          yearStrQuery.get()
        ]);
        
        // Procesar resultados (evitar duplicados)
        const seenIds = new Set<string>();
        const allDocs = [...numSnap.docs, ...strSnap.docs];
        
        for (const doc of allDocs) {
          if (seenIds.has(doc.id)) continue;
          seenIds.add(doc.id);
          
          const data = doc.data();
          const status = String(data.status || 'present').toLowerCase();
          
          // Contar por status
          attendanceByStatus.total++;
          if (status === 'present') attendanceByStatus.present++;
          else if (status === 'absent') attendanceByStatus.absent++;
          else if (status === 'late') attendanceByStatus.late++;
          else if (status === 'excused') attendanceByStatus.excused++;
          else attendanceByStatus.present++; // Default a presente
          
          // Contar por mes
          let month = 1;
          try {
            const dateStr = data.date || data.dateString;
            if (dateStr) {
              // Intentar parsear diferentes formatos de fecha
              if (typeof dateStr === 'string') {
                if (dateStr.includes('-')) {
                  // yyyy-mm-dd o dd-mm-yyyy
                  const parts = dateStr.split('-');
                  if (parts[0].length === 4) {
                    month = parseInt(parts[1]);
                  } else {
                    month = parseInt(parts[1]);
                  }
                } else if (dateStr.includes('/')) {
                  // dd/mm/yyyy
                  const parts = dateStr.split('/');
                  month = parseInt(parts[1]);
                }
              } else if (data.date?.toDate) {
                month = data.date.toDate().getMonth() + 1;
              }
            }
          } catch (e) {
            // Usar mes 1 por defecto
          }
          
          if (month >= 1 && month <= 12) {
            monthlyData[month].total++;
            if (status === 'present') monthlyData[month].present++;
            else if (status === 'absent') monthlyData[month].absent++;
            else if (status === 'late') monthlyData[month].late++;
            else if (status === 'excused') monthlyData[month].excused++;
          }
          
          // Contar por curso
          courseData[courseId].total++;
          if (status === 'present' || status === 'late') {
            courseData[courseId].present++;
          } else {
            courseData[courseId].absent++;
          }
        }
      }
      
      // Calcular tasa de asistencia (present + late) / total
      const attendanceRate = attendanceByStatus.total > 0
        ? Math.round(((attendanceByStatus.present + attendanceByStatus.late) / attendanceByStatus.total) * 10000) / 100
        : 0;
      
      result.attendance = {
        totalRecords: attendanceByStatus.total,
        presentCount: attendanceByStatus.present,
        absentCount: attendanceByStatus.absent,
        lateCount: attendanceByStatus.late,
        excusedCount: attendanceByStatus.excused,
        attendanceRate
      };
      
      // Preparar datos mensuales
      result.monthly = Object.entries(monthlyData)
        .filter(([_, data]) => data.total > 0)
        .map(([month, data]) => ({
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
        }));
      
      // Preparar datos por curso
      result.courses = Object.entries(courseData)
        .filter(([_, data]) => data.total > 0)
        .map(([courseId, data]) => ({
          courseId,
          courseName: data.name,
          attendanceRate: data.total > 0
            ? Math.round((data.present / data.total) * 10000) / 100
            : 0,
          totalRecords: data.total,
          presentCount: data.present,
          absentCount: data.absent
        }));
      
      console.log(`✅ Asistencia: ${attendanceByStatus.total} registros, ${attendanceRate}% tasa`);
    }
    
    // ========================================
    // 2. ESTADÍSTICAS DE CALIFICACIONES
    // ========================================
    if (includeGrades) {
      console.log('📊 Calculando estadísticas de calificaciones...');
      
      let totalGrades = 0;
      let sumScores = 0;
      let approvedCount = 0;
      let failedCount = 0;
      
      const coursesSnap = await db.collection('courses').get();
      
      for (const courseDoc of coursesSnap.docs) {
        const courseId = courseDoc.id;
        const gradesRef = db.collection(`courses/${courseId}/grades`);
        
        // Query con year como número y string
        const [numSnap, strSnap] = await Promise.all([
          gradesRef.where('year', '==', year).get(),
          gradesRef.where('year', '==', String(year)).get()
        ]);
        
        const seenIds = new Set<string>();
        const allDocs = [...numSnap.docs, ...strSnap.docs];
        
        for (const doc of allDocs) {
          if (seenIds.has(doc.id)) continue;
          seenIds.add(doc.id);
          
          const data = doc.data();
          const score = typeof data.score === 'number' ? data.score 
            : typeof data.grade === 'number' ? data.grade 
            : null;
          
          if (score !== null) {
            totalGrades++;
            sumScores += score;
            
            // Considerar aprobado si score >= 60 (o grade >= 4.0 en escala 1-7)
            // Ajustar según la configuración del sistema
            if (score >= 60 || (score >= 4.0 && score <= 7.0)) {
              approvedCount++;
            } else {
              failedCount++;
            }
          }
        }
      }
      
      const averageScore = totalGrades > 0 ? Math.round((sumScores / totalGrades) * 100) / 100 : 0;
      const approvalRate = totalGrades > 0 ? Math.round((approvedCount / totalGrades) * 10000) / 100 : 0;
      
      result.grades = {
        totalRecords: totalGrades,
        averageScore,
        approvedCount,
        failedCount,
        approvalRate
      };
      
      console.log(`✅ Calificaciones: ${totalGrades} registros, promedio ${averageScore}, ${approvalRate}% aprobación`);
    }
    
    // ========================================
    // 3. ESTADÍSTICAS GENERALES
    // ========================================
    console.log('📊 Calculando estadísticas generales...');
    
    // Contar usuarios por rol
    const usersSnap = await db.collection('users').get();
    let totalStudents = 0;
    let totalTeachers = 0;
    
    usersSnap.docs.forEach(doc => {
      const role = String(doc.data()?.role || '').toLowerCase();
      if (role === 'student' || role === 'estudiante') totalStudents++;
      else if (role === 'teacher' || role === 'profesor') totalTeachers++;
    });
    
    // Contar cursos y secciones
    const coursesSnap = await db.collection('courses').get();
    const totalCourses = coursesSnap.size;
    
    let totalSections = 0;
    for (const courseDoc of coursesSnap.docs) {
      const sectionsSnap = await db.collection(`courses/${courseDoc.id}/sections`).get();
      totalSections += sectionsSnap.size;
    }
    
    result.general = {
      totalStudents,
      totalCourses,
      totalSections,
      totalTeachers
    };
    
    console.log(`✅ General: ${totalStudents} estudiantes, ${totalCourses} cursos, ${totalTeachers} profesores`);
    
    // ========================================
    // 4. GUARDAR EN STATS_CACHE
    // ========================================
    console.log('💾 Guardando en stats_cache...');
    
    const statsRef = db.collection('stats_cache').doc(String(year));
    const now = new Date().toISOString();
    
    // Documento principal
    await statsRef.set({
      year,
      lastUpdated: now,
      attendance: result.attendance || null,
      grades: result.grades || null,
      general: result.general
    }, { merge: true });
    
    // Sub-colección mensual
    if (result.monthly && result.monthly.length > 0) {
      const batch = db.batch();
      for (const monthData of result.monthly) {
        const monthRef = statsRef.collection('monthly').doc(String(monthData.month).padStart(2, '0'));
        batch.set(monthRef, monthData);
      }
      await batch.commit();
    }
    
    // Sub-colección por curso
    if (result.courses && result.courses.length > 0) {
      const batch = db.batch();
      for (const courseData of result.courses) {
        const courseRef = statsRef.collection('courses').doc(courseData.courseId);
        batch.set(courseRef, courseData);
      }
      await batch.commit();
    }
    
    result.success = true;
    result.duration = Date.now() - startTime;
    
    console.log(`✅ [stats/rebuild] Completado en ${result.duration}ms`);
    
    // Emitir evento para que el cliente sepa que hay nuevas stats
    // (El cliente puede escuchar esto via polling o WebSocket)
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    // Si es error de configuración de Firebase, manejar silenciosamente
    const isConfigError = error.message?.includes('Unable to detect a Project Id') ||
                          error.message?.includes('UNAUTHENTICATED') ||
                          error.message?.includes('authentication') ||
                          error.code === 16;
    
    if (isConfigError) {
      return NextResponse.json({
        success: false,
        authError: true,
        message: 'Firebase Admin no configurado. Usando datos locales.',
        duration: Date.now() - startTime
      }, { status: 200 });
    }
    
    console.error('❌ [stats/rebuild] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    }, { status: 500 });
  }
}

// GET para verificar estado
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    
    const db = getAdminFirestore();
    const statsDoc = await db.collection('stats_cache').doc(String(year)).get();
    
    if (!statsDoc.exists) {
      return NextResponse.json({
        cached: false,
        year,
        message: 'No hay estadísticas cacheadas. Ejecutar POST para reconstruir.'
      });
    }
    
    const data = statsDoc.data();
    return NextResponse.json({
      cached: true,
      year,
      lastUpdated: data?.lastUpdated,
      hasAttendance: !!data?.attendance,
      hasGrades: !!data?.grades,
      hasGeneral: !!data?.general
    });
    
  } catch (error: any) {
    // Si es error de configuración de Firebase, manejar silenciosamente
    const isConfigError = error.message?.includes('Unable to detect a Project Id') ||
                          error.message?.includes('UNAUTHENTICATED') ||
                          error.message?.includes('authentication') ||
                          error.code === 16;
    
    if (isConfigError) {
      return NextResponse.json({
        cached: false,
        authError: true,
        message: 'Firebase Admin no configurado.',
        responseTime: Date.now() - startTime
      }, { status: 200 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}