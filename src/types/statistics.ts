/**
 * Tipos compartidos para el módulo de estadísticas
 * Extraídos de estadisticas/page.tsx para mejor modularización
 */

// ==================== TIPOS BASE ====================

export type Period = '7d' | '30d' | '90d' | 'all';
export type Level = 'basica' | 'media';
export type Semester = 'all' | 'S1' | 'S2';

// ==================== FILTROS ====================

export interface StatsFilters {
  courseSectionId?: string;
  level?: Level;
  courseId?: string;
  sectionId?: string;
  semester?: Exclude<Semester, 'all'>;
  subject?: string;
  year?: number;
  skipAttendanceProcessing?: boolean;
  skipComparisonProcessing?: boolean;
}

// ==================== REGISTROS NORMALIZADOS ====================

export interface NormalizedAttendance {
  ts: number;
  dayKey: string; // YYYY-MM-DD en zona local
  courseId: string;
  sectionId: string;
  presentIds: string[]; // ids en minúsculas
  presentCount: number;
  totalCount?: number;
  status?: 'present' | 'absent';
  raw: any;
}

export interface NormalizedGrade {
  ts: number;
  monthKey: string; // YYYY-MM
  courseId: string;
  sectionId: string;
  score: number; // 0-100
  raw: any;
}

// ==================== CACHE ====================

export interface AttendanceYearCacheEntry {
  dayIndex: Map<string, NormalizedAttendance[]>;
  sourceCount: number;
  builtAt: number;
}

export interface GradesYearCacheEntry {
  monthIndex: Map<string, NormalizedGrade[]>;
  sourceCount: number;
  builtAt: number;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ==================== PROPS DE COMPONENTES ====================

export interface AttendanceTrendCardProps {
  period: Period;
  teacherUsername: string;
  filters: {
    semester?: Exclude<Semester, 'all'>;
    courseId?: string;
    sectionId?: string;
    level?: Level;
    courseName?: string;
    sectionLetter?: string;
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
  externalZoomY?: boolean;
  onZoomChange?: (zoom: boolean) => void;
  hideHeader?: boolean;
}

export interface CourseComparisonChartProps {
  type: 'notas' | 'asistencia';
  year: number;
  filters: StatsFilters;
  preloadStats?: {
    year: number;
    sectionAgg?: Array<{
      courseId: string | null;
      sectionId: string | null;
      present: number;
      total: number;
    }>;
  } | null;
  sqlAttendanceByYear?: Record<number, any[]>;
  sqlGradesByYear?: Record<number, any[]>;
  localAttendanceData?: any[];
  localGradesData?: any[];
  isAttendanceSQLConnected?: boolean;
  isGradesSQLConnected?: boolean;
  titleSummary?: string;
  language?: string;
}

export interface GradesOverTimeChartProps {
  comparisonType: 'notas' | 'asistencia';
  year: number;
  onYearChange?: (y: number) => void;
  filters: StatsFilters;
  zoomY?: boolean;
  onZoomChange?: (zoom: boolean) => void;
  series?: Array<{ label: string; values: (number | null)[] }>;
  labels?: string[];
  isLoading?: boolean;
}

// ==================== KPIs ====================

export interface StatsKPIs {
  year: number;
  studentsCount?: number;
  coursesCount?: number;
  sectionsCount?: number;
  teachersCount?: number;
  attendancePct?: number;
  approvedCount?: number;
  failedCount?: number;
  overallAvgPct?: number;
}

export interface FallbackStats {
  year: number;
  attendanceMonthly?: Record<string, { present: number; total: number }>;
  sectionAgg?: Array<{
    courseId: string | null;
    sectionId: string | null;
    present: number;
    total: number;
  }>;
}

// ==================== SERIES PARA GRÁFICOS ====================

export interface ChartSeries {
  label: string;
  values: (number | null)[];
  color?: string;
}

export interface AttendanceChartData {
  presentSeries: number[];
  absentSeries: number[];
  labels: string[];
  mode: 'daily' | 'monthly';
  debugInfo?: Record<string, any>;
}

// ==================== INSIGHTS ====================

export interface InsightItem {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  text: string;
  metric?: number;
}

// ==================== COMPARISON ====================

export interface ComparisonItem {
  id: string;
  label: string;
  value: number;
  total?: number;
  courseId?: string;
  sectionId?: string;
}

// ==================== CALENDAR CONFIG ====================

export interface VacationRange {
  start?: string;
  end?: string;
}

export interface CalendarYearConfig {
  showWeekends: boolean;
  summer: VacationRange;
  winter: VacationRange;
  holidays: string[];
}

// ==================== HELPER TYPES ====================

export type MonthlyAggregation = Record<string, { present: number; total: number }>;
export type SectionAggregation = Array<{
  courseId: string | null;
  sectionId: string | null;
  present: number;
  total: number;
}>;
