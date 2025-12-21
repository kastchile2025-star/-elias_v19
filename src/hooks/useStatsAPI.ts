"use client";

import { useState, useEffect, useCallback } from 'react';

// Tipos para los datos de la API de estadísticas (actualizados para stats_cache)
export interface StatsKPIYear {
  year: number;
  total_students: number;
  active_students: number;
  total_courses: number;
  active_courses: number;
  total_grades: number;
  average_grade: number;
  total_attendance_records: number;
  attendance_rate: number;
  last_updated: string;
}

export interface StatsAttendanceMonthly {
  year: number;
  month: number;
  monthName?: string;
  attendance_rate: number;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  last_updated?: string;
}

export interface StatsAttendanceSection {
  year: number;
  course_id: string;
  section_id: string;
  attendance_rate: number;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  last_updated?: string;
}

// Nueva interfaz para respuesta de stats_cache
export interface CachedStatsResponse {
  cached: boolean;
  year: number;
  lastUpdated?: string;
  needsRebuild?: boolean;
  responseTime?: number;
  kpis?: {
    // Asistencia
    attendanceRate: number | null;
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    // Calificaciones
    averageGrade: number | null;
    totalGradeRecords: number;
    approvalRate: number | null;
    approvedCount: number;
    failedCount: number;
    // General
    studentsCount: number;
    coursesCount: number;
    sectionsCount: number;
    teachersCount: number;
  };
  monthly?: Array<{
    month: number;
    monthName: string;
    attendanceRate: number;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
  }>;
  courses?: Array<{
    courseId: string;
    courseName: string;
    attendanceRate: number;
    totalRecords: number;
  }>;
}

export interface StatsSummaryResponse {
  success: boolean;
  kpis: StatsKPIYear | null;
  attendanceMonthly: StatsAttendanceMonthly[];
  attendanceSection: StatsAttendanceSection[];
  cached: boolean;
  timestamp: string;
}

// Hook para obtener estadísticas precomputadas de la API (OPTIMIZADO para stats_cache)
export function useStatsAPI(year?: number) {
  const [data, setData] = useState<CachedStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRebuilding, setIsRebuilding] = useState(false);

  const currentYear = year ?? new Date().getFullYear();

  const fetchStats = useCallback(async (includeMonthly = false, includeCourses = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        year: String(currentYear),
        ...(includeMonthly && { includeMonthly: 'true' }),
        ...(includeCourses && { includeCourses: 'true' })
      });
      
      const response = await fetch(`/api/stats/summary?${params}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: CachedStatsResponse = await response.json();
      setData(result);
      
      // Si necesita rebuild, dispararlo automáticamente en background
      if (result.needsRebuild && !isRebuilding) {
        console.log(`📊 [useStatsAPI] Stats para ${currentYear} necesitan rebuild, disparando...`);
        triggerStatsRebuild();
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al obtener estadísticas';
      setError(errorMsg);
      console.error('Error fetching stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentYear, isRebuilding]);

  // Trigger para reconstruir estadísticas
  const triggerStatsRebuild = useCallback(async () => {
    if (isRebuilding) return;
    
    setIsRebuilding(true);
    console.log(`🔄 [useStatsAPI] Iniciando rebuild de stats para ${currentYear}...`);
    
    try {
      const response = await fetch('/api/stats/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: currentYear, what: ['all'] })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ [useStatsAPI] Rebuild completado en ${result.duration}ms`);
        
        // Recargar stats después del rebuild
        await fetchStats();
      }
    } catch (err) {
      console.warn('Error triggering stats refresh:', err);
    } finally {
      setIsRebuilding(false);
    }
  }, [currentYear, fetchStats, isRebuilding]);

  useEffect(() => {
    fetchStats();
  }, [currentYear, fetchStats]);

  // Escuchar eventos de actualización SQL y statsRebuildCompleted para refrescar automáticamente
  useEffect(() => {
    const handleUpdate = () => {
      // Esperar un poco para que el servidor procese los cambios
      setTimeout(() => {
        fetchStats();
      }, 500);
    };
    
    const handleRebuildComplete = (e: CustomEvent) => {
      if (e.detail?.year === currentYear) {
        console.log(`📊 [useStatsAPI] Stats rebuild completado para ${currentYear}, recargando...`);
        fetchStats();
      }
    };

    window.addEventListener('sqlAttendanceUpdated', handleUpdate);
    window.addEventListener('sqlGradesUpdated', handleUpdate);
    window.addEventListener('sqlActivitiesUpdated', handleUpdate);
    window.addEventListener('statsRebuildCompleted', handleRebuildComplete as EventListener);

    return () => {
      window.removeEventListener('sqlAttendanceUpdated', handleUpdate);
      window.removeEventListener('sqlGradesUpdated', handleUpdate);
      window.removeEventListener('sqlActivitiesUpdated', handleUpdate);
      window.removeEventListener('statsRebuildCompleted', handleRebuildComplete as EventListener);
    };
  }, [currentYear, fetchStats]);

  return {
    data,
    loading,
    error,
    isRebuilding,
    refetch: fetchStats,
    triggerRebuild: triggerStatsRebuild,
    // Datos individuales para fácil acceso (compatibilidad con formato anterior)
    kpis: data?.kpis ? {
      year: data.year,
      total_students: data.kpis.studentsCount,
      active_students: data.kpis.studentsCount,
      total_courses: data.kpis.coursesCount,
      active_courses: data.kpis.coursesCount,
      total_grades: data.kpis.totalGradeRecords,
      average_grade: data.kpis.averageGrade ?? 0,
      total_attendance_records: data.kpis.totalAttendanceRecords,
      attendance_rate: data.kpis.attendanceRate ?? 0,
      last_updated: data.lastUpdated ?? ''
    } : null,
    attendanceMonthly: data?.monthly?.map(m => ({
      year: data.year,
      month: m.month,
      monthName: m.monthName,
      attendance_rate: m.attendanceRate,
      total_records: m.totalRecords,
      present_count: m.presentCount,
      absent_count: m.absentCount,
      late_count: 0,
      excused_count: 0
    })) ?? [],
    attendanceSection: data?.courses?.map(c => ({
      year: data.year,
      course_id: c.courseId,
      section_id: '',
      attendance_rate: c.attendanceRate,
      total_records: c.totalRecords,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0
    })) ?? [],
    cached: data?.cached ?? false,
    needsRebuild: data?.needsRebuild ?? false,
    timestamp: data?.lastUpdated,
    // Acceso directo a KPIs cacheados
    cachedKpis: data?.kpis
  };
}

// Hook auxiliar para transformar datos de API a formato legacy para compatibilidad
export function useStatsLegacyFormat(year?: number) {
  const { data, loading, error, refetch, cached, isRebuilding, triggerRebuild, cachedKpis } = useStatsAPI(year);

  // Transformar a formato legacy de KPIs snapshot
  const legacyKPIs = cachedKpis ? {
    year: data?.year ?? new Date().getFullYear(),
    studentsCount: cachedKpis.studentsCount,
    coursesCount: cachedKpis.coursesCount,
    sectionsCount: cachedKpis.sectionsCount,
    teachersCount: cachedKpis.teachersCount,
    attendancePct: cachedKpis.attendanceRate,
    approvedCount: cachedKpis.approvedCount,
    failedCount: cachedKpis.failedCount,
    overallAvgPct: cachedKpis.averageGrade,
    totalAttendanceRecords: cachedKpis.totalAttendanceRecords,
    totalGradeRecords: cachedKpis.totalGradeRecords
  } : null;

  // Transformar asistencia mensual a formato legacy
  const legacyAttendanceMonthly = (data?.monthly ?? []).reduce((acc, item) => {
    const monthKey = `${data?.year}-${item.month.toString().padStart(2, '0')}`;
    acc[monthKey] = {
      present: item.presentCount,
      total: item.totalRecords,
      rate: item.attendanceRate
    };
    return acc;
  }, {} as Record<string, { present: number; total: number; rate: number }>);

  // Transformar agregados por curso a formato legacy
  const legacySectionAgg = (data?.courses ?? []).map(item => ({
    courseId: item.courseId || null,
    courseName: item.courseName,
    sectionId: null,
    present: Math.round(item.totalRecords * item.attendanceRate / 100),
    total: item.totalRecords,
    attendanceRate: item.attendanceRate
  }));

  return {
    kpis: legacyKPIs,
    attendanceMonthly: legacyAttendanceMonthly,
    sectionAgg: legacySectionAgg,
    loading,
    error,
    refetch,
    cached,
    isRebuilding,
    triggerRebuild,
    // Indicador de si los datos están disponibles
    hasData: Boolean(cachedKpis),
    needsRebuild: data?.needsRebuild ?? false
  };
}