/**
 * API: /api/stats/summary
 * 
 * Endpoint optimizado para obtener estadísticas precomputadas desde Firestore.
 * Lee desde la colección stats_cache/{year} que contiene KPIs ya calculados.
 * 
 * Tiempo de respuesta esperado: <100ms (vs ~30s cargando 70K+ documentos)
 * 
 * Query params:
 * - year: Año a consultar (default: año actual)
 * - includeMonthly: Incluir breakdown mensual (default: false)
 * - includeCourses: Incluir breakdown por curso (default: false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Interfaz para las estadísticas cacheadas
interface CachedStats {
  year: number;
  lastUpdated: string;
  
  // KPIs de asistencia
  attendance: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number; // Porcentaje de asistencia (present + late) / total
  };
  
  // KPIs de calificaciones
  grades: {
    totalRecords: number;
    averageScore: number;
    approvedCount: number;
    failedCount: number;
    approvalRate: number; // Porcentaje de aprobados
  };
  
  // KPIs generales
  general: {
    totalStudents: number;
    totalCourses: number;
    totalSections: number;
    totalTeachers: number;
  };
}

interface MonthlyStats {
  month: number;
  monthName: string;
  attendanceRate: number;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
}

interface CourseStats {
  courseId: string;
  courseName: string;
  attendanceRate: number;
  averageGrade: number;
  studentCount: number;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const includeMonthly = searchParams.get('includeMonthly') === 'true';
    const includeCourses = searchParams.get('includeCourses') === 'true';
    
    const db = getAdminFirestore();
    
    // Leer documento principal de stats_cache
    const statsRef = db.collection('stats_cache').doc(String(year));
    const statsDoc = await statsRef.get();
    
    // Si no existe caché, devolver indicador para triggear rebuild
    if (!statsDoc.exists) {
      return NextResponse.json({
        cached: false,
        year,
        message: 'No hay estadísticas cacheadas para este año. Ejecutar /api/stats/rebuild',
        needsRebuild: true,
        responseTime: Date.now() - startTime
      }, { status: 200 });
    }
    
    const stats = statsDoc.data() as CachedStats;
    
    // Respuesta base
    const response: any = {
      cached: true,
      year,
      lastUpdated: stats.lastUpdated,
      responseTime: Date.now() - startTime,
      
      // KPIs principales
      kpis: {
        // Asistencia
        attendanceRate: stats.attendance?.attendanceRate ?? null,
        totalAttendanceRecords: stats.attendance?.totalRecords ?? 0,
        presentCount: stats.attendance?.presentCount ?? 0,
        absentCount: stats.attendance?.absentCount ?? 0,
        lateCount: stats.attendance?.lateCount ?? 0,
        excusedCount: stats.attendance?.excusedCount ?? 0,
        
        // Calificaciones
        averageGrade: stats.grades?.averageScore ?? null,
        totalGradeRecords: stats.grades?.totalRecords ?? 0,
        approvalRate: stats.grades?.approvalRate ?? null,
        approvedCount: stats.grades?.approvedCount ?? 0,
        failedCount: stats.grades?.failedCount ?? 0,
        
        // General
        studentsCount: stats.general?.totalStudents ?? 0,
        coursesCount: stats.general?.totalCourses ?? 0,
        sectionsCount: stats.general?.totalSections ?? 0,
        teachersCount: stats.general?.totalTeachers ?? 0,
      }
    };
    
    // Incluir breakdown mensual si se solicita
    if (includeMonthly) {
      const monthlySnap = await statsRef.collection('monthly').orderBy('month').get();
      response.monthly = monthlySnap.docs.map(doc => doc.data() as MonthlyStats);
    }
    
    // Incluir breakdown por curso si se solicita
    if (includeCourses) {
      const coursesSnap = await statsRef.collection('courses').get();
      response.courses = coursesSnap.docs.map(doc => ({
        courseId: doc.id,
        ...doc.data()
      })) as CourseStats[];
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    // Si es error de configuración de Firebase, manejar silenciosamente
    const isConfigError = error.message?.includes('Unable to detect a Project Id') ||
                          error.message?.includes('UNAUTHENTICATED') ||
                          error.message?.includes('authentication') ||
                          error.code === 16;
    
    if (isConfigError) {
      // No mostrar error en consola para errores de configuración esperados
      return NextResponse.json({
        cached: false,
        year: new Date().getFullYear(),
        needsRebuild: false,
        authError: true,
        message: 'Firebase Admin no configurado. Usando datos locales.',
        responseTime: Date.now() - startTime
      }, { status: 200 });
    }
    
    console.error('❌ [stats/summary] Error:', error);
    
    return NextResponse.json({
      error: 'Error al obtener estadísticas',
      message: error.message,
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
}