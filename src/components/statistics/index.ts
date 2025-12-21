// Exportaciones centralizadas de componentes de estadísticas
// Estos componentes usan carga diferida (lazy loading) para mejorar el rendimiento

export * from './types';

// Componentes modulares
export { default as KPICard, KPICardsGrid } from './KPICard';
export { default as InsightsCard } from './InsightsCard';
export { default as StatsInfoCards } from './StatsInfoCards';
export { default as AttendancePercentCard } from './AttendancePercentCard';

// Componentes de gráficos modulares (para lazy loading)
export { default as AttendanceTrendChart } from './AttendanceTrendChart';
export { default as CourseComparisonChart } from './CourseComparisonChart';
export { default as GradesOverTimeChart } from './GradesOverTimeChart';

// Sistema de carga progresiva
export {
  StatsModuleLoader,
  ProgressiveStatsLoader,
  useProgressiveLoading,
  LazyAttendanceTrendChart,
  LazyCourseComparisonChart,
  LazyGradesOverTimeChart,
  LazyInsightsCard,
} from './ProgressiveLoader';

// Skeletons para carga diferida
export {
  AttendanceChartSkeleton,
  InsightsSkeleton,
  CourseComparisonSkeleton,
  PeriodChartSkeleton,
  KPICardsSkeleton,
  InfoCardsSkeleton,
  AttendancePercentSkeleton,
} from './Skeletons';
