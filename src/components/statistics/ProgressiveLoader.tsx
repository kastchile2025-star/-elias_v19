'use client';

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { Progress } from '@/components/ui/progress';
import {
  KPICardsSkeleton,
  InsightsSkeleton,
  CourseComparisonSkeleton,
  PeriodChartSkeleton,
  AttendanceChartSkeleton,
  InfoCardsSkeleton,
  AttendancePercentSkeleton,
} from './Skeletons';

// Lazy loading de componentes pesados
const LazyAttendanceTrendChart = lazy(() => import('./AttendanceTrendChart'));
const LazyCourseComparisonChart = lazy(() => import('./CourseComparisonChart'));
const LazyGradesOverTimeChart = lazy(() => import('./GradesOverTimeChart'));
const LazyInsightsCard = lazy(() => import('./InsightsCard'));

export interface StatsModuleLoaderProps {
  children: React.ReactNode;
  moduleName: string;
  priority: number; // 1 = alta prioridad, 5 = baja prioridad
  fallback?: React.ReactNode;
  enabled?: boolean;
  onLoad?: () => void;
}

/**
 * Componente de carga progresiva para módulos de estadísticas
 * Carga los componentes en orden de prioridad para mejorar el tiempo de carga inicial
 */
export function StatsModuleLoader({
  children,
  moduleName,
  priority,
  fallback,
  enabled = true,
  onLoad,
}: StatsModuleLoaderProps) {
  const [isReady, setIsReady] = useState(priority === 1);

  useEffect(() => {
    if (!enabled) return;
    
    // Cargar módulos con delay basado en prioridad
    const delay = (priority - 1) * 200; // 0ms, 200ms, 400ms, 600ms, 800ms
    const timer = setTimeout(() => {
      setIsReady(true);
      onLoad?.();
    }, delay);

    return () => clearTimeout(timer);
  }, [priority, enabled, onLoad]);

  if (!enabled) return null;

  if (!isReady) {
    return fallback || null;
  }

  return <>{children}</>;
}

export interface ProgressiveStatsLoaderProps {
  isVisible: boolean;
  progress: number;
  message: string;
  onComplete?: () => void;
}

/**
 * Loader visual con progreso para la página de estadísticas
 */
export function ProgressiveStatsLoader({
  isVisible,
  progress,
  message,
}: ProgressiveStatsLoaderProps) {
  const { translate } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-[320px] shadow-lg">
        <CardContent className="pt-6 pb-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t('loadingStats', 'Cargando estadísticas')}
            </p>
            <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export interface UseProgressiveLoadingOptions {
  modules: string[];
  onComplete?: () => void;
}

/**
 * Hook para manejar la carga progresiva de módulos
 */
export function useProgressiveLoading({ modules, onComplete }: UseProgressiveLoadingOptions) {
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const markAsLoaded = useCallback((moduleName: string) => {
    setLoadedModules(prev => {
      const next = new Set(prev);
      next.add(moduleName);
      return next;
    });
  }, []);

  useEffect(() => {
    if (loadedModules.size >= modules.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [loadedModules.size, modules.length, isComplete, onComplete]);

  const progress = modules.length > 0 ? (loadedModules.size / modules.length) * 100 : 100;

  return {
    loadedModules,
    markAsLoaded,
    isComplete,
    progress,
    isLoading: !isComplete,
  };
}

// Re-exportar componentes lazy para uso externo
export {
  LazyAttendanceTrendChart,
  LazyCourseComparisonChart,
  LazyGradesOverTimeChart,
  LazyInsightsCard,
};

// Exportar skeletons para uso en la página
export {
  KPICardsSkeleton,
  InsightsSkeleton,
  CourseComparisonSkeleton,
  PeriodChartSkeleton,
  AttendanceChartSkeleton,
  InfoCardsSkeleton,
  AttendancePercentSkeleton,
};
