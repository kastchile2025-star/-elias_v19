// Tipos compartidos para componentes de estadísticas
export type Period = 'all' | '7d' | '30d' | '90d';
export type Semester = 'all' | 'S1' | 'S2';
export type Level = 'basica' | 'media';

export interface TimeWindow {
  from: number;
  to: number;
}

export interface AttendanceTrendCardProps {
  period: Period;
  teacherUsername: string;
  filters: {
    semester?: Exclude<Semester, 'all'>;
    courseId?: string;
    sectionId?: string;
    level?: Level;
  };
  titleSummary?: string;
  blocked?: boolean;
  year: number;
  sqlAttendanceByYear?: Record<number, any[]>;
  isAttendanceSQLConnected?: boolean;
  preloadStats?: {
    year: number;
    attendanceMonthly?: Record<string, { present: number; total: number }>;
  } | null;
  onChangePeriod?: (p: Period) => void;
}

export interface InsightsCardProps {
  insights: string[];
  aiInsights: string[];
  isGeneratingInsights: boolean;
  insightsSync: boolean;
  prioritizeCharts: boolean;
  onRefreshInsights: () => void;
}

export interface CourseComparisonChartProps {
  data: Array<{ label: string; avgPct?: number; attendancePct?: number; avg20?: number }>;
  filters: {
    courseSectionId?: string;
    level?: Level;
    courseId?: string;
    sectionId?: string;
    sectionLetter?: string;
    semester?: Exclude<Semester, 'all'>;
  };
  period: Period;
  year: number;
  comparisonType: 'notas' | 'asistencia';
  setComparisonType: (type: 'notas' | 'asistencia') => void;
  sqlGrades?: Record<number, any[]>;
  isSQLConnected?: boolean;
  sqlAttendance?: Record<number, any[]>;
  isAttendanceSQLConnected?: boolean;
  preloadStats?: {
    year: number;
    sectionAgg?: Array<{
      courseId: string | null;
      sectionId: string | null;
      present: number;
      total: number;
    }>;
  } | null;
  loaderDone?: boolean;
}

export interface PeriodChartCardProps {
  monthlyPctByKey: Record<string, number>;
  semester?: Exclude<Semester, 'all'>;
  comparisonType: 'notas' | 'asistencia';
  displayYear: number;
  onYearChange: (year: number) => void;
  filters: {
    semester?: Exclude<Semester, 'all'>;
    level?: Level;
    courseId?: string;
    sectionId?: string;
    sectionLetter?: string;
  };
  zoomY: boolean;
  onZoomToggle: () => void;
  sqlGrades?: Record<number, any[]>;
  isSQLConnected?: boolean;
  sqlAttendance?: Record<number, any[]>;
  isAttendanceSQLConnected?: boolean;
}

export interface KPICardProps {
  title: string;
  value: number | string | undefined;
  subtitle?: string;
  color: 'emerald' | 'blue' | 'fuchsia' | 'rose';
  filterDescription?: string;
  isLoading?: boolean;
  showDash?: boolean;
  showMessage?: string;
}

export interface InfoCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface AttendancePercentCardProps {
  percentage: number | undefined;
  daysTotal?: number;
  period: string;
  isLoading?: boolean;
}

export interface StudentAggregation {
  overallAvgPct?: number;
  approvedCount: number;
  failedCount: number;
  standoutAvgPct?: number;
  totalStudents: number;
  standoutCount: number;
  standoutIsFallbackTop?: boolean;
  hasFilters: boolean;
}
