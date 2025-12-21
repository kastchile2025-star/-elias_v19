'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Tipos
export type Period = 'all' | '7d' | '30d' | '90d';
export type Semester = 'all' | 'S1' | 'S2';
export type Level = 'basica' | 'media';

export interface StatsFilters {
  period: Period;
  semester: Semester;
  level: 'all' | Level;
  courseId: string | 'all';
  sectionId: string | 'all';
  year: number;
}

export interface LoadingState {
  kpis: boolean;
  attendance: boolean;
  grades: boolean;
  insights: boolean;
  charts: boolean;
}

export interface StatsDataState {
  kpis: {
    studentsCount: number;
    coursesCount: number;
    teachersCount: number;
    attendancePct?: number;
    approvedCount: number;
    failedCount: number;
    overallAvgPct?: number;
    standoutAvgPct?: number;
  } | null;
  attendanceData: any[];
  gradesData: any[];
  insights: string[];
}

interface UseOptimizedStatsDataOptions {
  year: number;
  filters: Partial<StatsFilters>;
  sqlGradesByYear?: Record<number, any[]>;
  sqlAttendanceByYear?: Record<number, any[]>;
  isSQLConnected?: boolean;
  isAttendanceSQLConnected?: boolean;
}

// Cache global para evitar recargas innecesarias
const globalDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

/**
 * Hook optimizado para carga de datos de estadísticas
 * Implementa carga progresiva y caching para mejorar rendimiento
 */
export function useOptimizedStatsData({
  year,
  filters,
  sqlGradesByYear,
  sqlAttendanceByYear,
  isSQLConnected,
  isAttendanceSQLConnected,
}: UseOptimizedStatsDataOptions) {
  const [loading, setLoading] = useState<LoadingState>({
    kpis: true,
    attendance: true,
    grades: true,
    insights: true,
    charts: true,
  });

  const [data, setData] = useState<StatsDataState>({
    kpis: null,
    attendanceData: [],
    gradesData: [],
    insights: [],
  });

  const [progress, setProgress] = useState(0);
  const loadStartTimeRef = useRef<number>(Date.now());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generar clave de cache basada en filtros
  const cacheKey = useMemo(() => {
    return `stats-${year}-${JSON.stringify(filters)}`;
  }, [year, filters]);

  // Función para leer desde cache
  const readFromCache = useCallback((key: string) => {
    const cached = globalDataCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }, []);

  // Función para escribir en cache
  const writeToCache = useCallback((key: string, data: any) => {
    globalDataCache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Función optimizada para leer localStorage con parsing
  const readLocalStorage = useCallback((key: string, defaultValue: any = []) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, []);

  // Carga de KPIs (prioridad 1 - carga rápida)
  const loadKPIs = useCallback(async () => {
    const cachedKPIs = readFromCache(`kpis-${year}`);
    if (cachedKPIs) {
      setData(prev => ({ ...prev, kpis: cachedKPIs }));
      setLoading(prev => ({ ...prev, kpis: false }));
      setProgress(p => Math.max(p, 25));
      return cachedKPIs;
    }

    try {
      // Cargar datos básicos de KPIs desde localStorage o API
      const users = readLocalStorage('smart-student-users', []);
      const students = users.filter((u: any) => u?.role === 'student' || u?.role === 'estudiante');
      const teachers = users.filter((u: any) => u?.role === 'teacher' || u?.role === 'profesor');
      const courses = [
        ...readLocalStorage(`smart-student-admin-courses-${year}`, []),
        ...readLocalStorage(`smart-student-courses-${year}`, []),
      ];

      const kpis = {
        studentsCount: students.length,
        coursesCount: courses.length,
        teachersCount: teachers.length,
        attendancePct: undefined,
        approvedCount: 0,
        failedCount: 0,
        overallAvgPct: undefined,
        standoutAvgPct: undefined,
      };

      writeToCache(`kpis-${year}`, kpis);
      setData(prev => ({ ...prev, kpis }));
      setLoading(prev => ({ ...prev, kpis: false }));
      setProgress(p => Math.max(p, 25));
      return kpis;
    } catch (error) {
      console.error('Error loading KPIs:', error);
      setLoading(prev => ({ ...prev, kpis: false }));
      return null;
    }
  }, [year, readFromCache, writeToCache, readLocalStorage]);

  // Carga de datos de asistencia (prioridad 2)
  const loadAttendance = useCallback(async () => {
    const cachedAttendance = readFromCache(`attendance-${year}`);
    if (cachedAttendance) {
      setData(prev => ({ ...prev, attendanceData: cachedAttendance }));
      setLoading(prev => ({ ...prev, attendance: false }));
      setProgress(p => Math.max(p, 50));
      return cachedAttendance;
    }

    try {
      let attendance: any[] = [];

      // Preferir datos SQL si están disponibles
      if (isAttendanceSQLConnected && sqlAttendanceByYear?.[year]) {
        attendance = sqlAttendanceByYear[year] || [];
      } else {
        // Cargar desde LocalStorageManager o clave directa
        try {
          const { LocalStorageManager } = await import('@/lib/education-utils');
          attendance = LocalStorageManager.getAttendanceForYear?.(year) || [];
        } catch {
          attendance = readLocalStorage(`smart-student-attendance-${year}`, []);
        }
      }

      writeToCache(`attendance-${year}`, attendance);
      setData(prev => ({ ...prev, attendanceData: attendance }));
      setLoading(prev => ({ ...prev, attendance: false }));
      setProgress(p => Math.max(p, 50));
      return attendance;
    } catch (error) {
      console.error('Error loading attendance:', error);
      setLoading(prev => ({ ...prev, attendance: false }));
      return [];
    }
  }, [year, readFromCache, writeToCache, readLocalStorage, isAttendanceSQLConnected, sqlAttendanceByYear]);

  // Carga de datos de calificaciones (prioridad 3)
  const loadGrades = useCallback(async () => {
    const cachedGrades = readFromCache(`grades-${year}`);
    if (cachedGrades) {
      setData(prev => ({ ...prev, gradesData: cachedGrades }));
      setLoading(prev => ({ ...prev, grades: false }));
      setProgress(p => Math.max(p, 75));
      return cachedGrades;
    }

    try {
      let grades: any[] = [];

      // Preferir datos SQL si están disponibles
      if (isSQLConnected && sqlGradesByYear?.[year]) {
        grades = sqlGradesByYear[year] || [];
      } else {
        // Cargar desde LocalStorageManager o clave directa
        try {
          const { LocalStorageManager } = await import('@/lib/education-utils');
          grades = LocalStorageManager.getSubmissionsForYear?.(year) || [];
        } catch {
          grades = readLocalStorage(`smart-student-submissions-${year}`, []);
        }
      }

      writeToCache(`grades-${year}`, grades);
      setData(prev => ({ ...prev, gradesData: grades }));
      setLoading(prev => ({ ...prev, grades: false }));
      setProgress(p => Math.max(p, 75));
      return grades;
    } catch (error) {
      console.error('Error loading grades:', error);
      setLoading(prev => ({ ...prev, grades: false }));
      return [];
    }
  }, [year, readFromCache, writeToCache, readLocalStorage, isSQLConnected, sqlGradesByYear]);

  // Marcar gráficos como listos (prioridad 4)
  const markChartsReady = useCallback(() => {
    setLoading(prev => ({ ...prev, charts: false }));
    setProgress(100);
  }, []);

  // Efecto principal de carga progresiva
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    loadStartTimeRef.current = Date.now();

    const loadData = async () => {
      // Fase 1: KPIs (inmediato)
      await loadKPIs();
      
      // Pequeño delay para permitir render inicial
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Fase 2: Asistencia
      await loadAttendance();
      
      // Pequeño delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Fase 3: Calificaciones
      await loadGrades();
      
      // Pequeño delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fase 4: Gráficos listos
      markChartsReady();
    };

    loadData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadKPIs, loadAttendance, loadGrades, markChartsReady]);

  // Calcular si todo está listo
  const isReady = useMemo(() => {
    return !loading.kpis && !loading.attendance && !loading.grades;
  }, [loading]);

  // Calcular si los gráficos pueden mostrarse
  const chartsReady = useMemo(() => {
    return !loading.charts;
  }, [loading]);

  return {
    data,
    loading,
    progress,
    isReady,
    chartsReady,
    refresh: useCallback(() => {
      // Limpiar cache y recargar
      globalDataCache.clear();
      setLoading({
        kpis: true,
        attendance: true,
        grades: true,
        insights: true,
        charts: true,
      });
      setProgress(0);
    }, []),
  };
}

/**
 * Hook para manejar la visibilidad progresiva de secciones
 */
export function useProgressiveVisibility(totalSections: number, delayMs = 100) {
  const [visibleSections, setVisibleSections] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleSections(current);
      if (current >= totalSections) {
        clearInterval(interval);
      }
    }, delayMs);

    return () => clearInterval(interval);
  }, [totalSections, delayMs]);

  return {
    isVisible: (sectionIndex: number) => sectionIndex < visibleSections,
    allVisible: visibleSections >= totalSections,
  };
}

/**
 * Hook para detectar cuando un elemento entra en el viewport
 * Útil para cargar datos solo cuando el componente es visible
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}
