/**
 * Utilidades y funciones de cache para el módulo de estadísticas
 * Extraídas de estadisticas/page.tsx para mejor modularización y rendimiento
 */

import { toPercentFromConfigured } from '@/lib/grading';
import { LocalStorageManager } from '@/lib/education-utils';
import type {
  Level,
  NormalizedAttendance,
  NormalizedGrade,
  AttendanceYearCacheEntry,
  GradesYearCacheEntry,
  CacheEntry,
  CalendarYearConfig,
  VacationRange,
} from '@/types/statistics';

// ==================== CONSTANTES ====================

export const CACHE_TTL = 60000; // 60 segundos
export const LS_CACHE_TTL = 30000; // 30 segundos

// ==================== CACHES GLOBALES ====================

const dataCache = new Map<string, CacheEntry>();
const localStorageJsonCache = new Map<string, { data: any; timestamp: number }>();
const dateParseCache = new Map<string, number>();
const attendanceYearCache = new Map<number, AttendanceYearCacheEntry>();
const gradesYearCache = new Map<number, GradesYearCacheEntry>();

// ==================== FUNCIONES DE CACHE ====================

/**
 * Lee y parsea localStorage con cache para evitar parsear repetidamente
 */
export const getCachedLocalStorageJson = (key: string, defaultValue: any = []): any => {
  const now = Date.now();
  const cached = localStorageJsonCache.get(key);
  if (cached && (now - cached.timestamp) < LS_CACHE_TTL) {
    return cached.data;
  }
  try {
    if (typeof window === 'undefined') return defaultValue;
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : defaultValue;
    localStorageJsonCache.set(key, { data, timestamp: now });
    return data;
  } catch {
    return defaultValue;
  }
};

/**
 * Cache genérico con TTL
 */
export const getCachedData = <T>(key: string, fetcher: () => T, ttl: number = CACHE_TTL): T => {
  const now = Date.now();
  const cached = dataCache.get(key);

  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data as T;
  }

  const data = fetcher();
  dataCache.set(key, { data, timestamp: now, ttl });
  return data;
};

/**
 * Limpia todas las caches (útil para forzar recarga de datos)
 */
export const clearAllCaches = () => {
  dataCache.clear();
  localStorageJsonCache.clear();
  dateParseCache.clear();
  attendanceYearCache.clear();
  gradesYearCache.clear();
};

/**
 * Limpia cache para un año específico
 */
export const clearYearCache = (year: number) => {
  attendanceYearCache.delete(year);
  gradesYearCache.delete(year);
  // Limpiar entradas de dataCache relacionadas con el año
  for (const key of dataCache.keys()) {
    if (key.includes(`:${year}`)) {
      dataCache.delete(key);
    }
  }
};

// ==================== PARSING DE FECHAS ====================

/**
 * Parsea timestamps con cache para optimizar rendimiento
 */
export const parseTimestampOptimized = (value: any): number => {
  if (!value) return 0;
  if (typeof value === 'number') return value;

  const strValue = String(value);
  if (dateParseCache.has(strValue)) {
    return dateParseCache.get(strValue)!;
  }

  let result = 0;

  // dd-mm-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(strValue)) {
    const [dd, mm, yyyy] = strValue.split('-').map(Number);
    result = new Date(yyyy, (mm || 1) - 1, dd || 1, 0, 0, 0, 0).getTime();
  }
  // dd/mm/yyyy
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(strValue)) {
    const [dd, mm, yyyy] = strValue.split('/').map(Number);
    result = new Date(yyyy, (mm || 1) - 1, dd || 1, 0, 0, 0, 0).getTime();
  }
  // yyyy-mm-dd
  else if (/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
    result = new Date(strValue + 'T00:00:00').getTime();
  }
  // Otros formatos
  else {
    const parsed = Date.parse(strValue);
    result = Number.isNaN(parsed) ? 0 : parsed;
  }

  if (result && !isNaN(result)) {
    dateParseCache.set(strValue, result);
  }
  return result;
};

// ==================== UTILIDADES DE FECHAS ====================

/**
 * Genera clave de día en formato YYYY-MM-DD usando zona local
 */
export const keyOfDayLocal = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Parsea clave de día a timestamp
 */
export const parseDayKeyLocal = (k: string): number => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0).getTime();
};

/**
 * Convierte días a milisegundos
 */
export const days = (n: number): number => n * 24 * 60 * 60 * 1000;

/**
 * Obtiene rango alineado por día
 */
export const getDayAlignedRange = (lookDays: number, anchorTs?: number): { from: number; to: number } => {
  const anchor = anchorTs ?? Date.now();
  const anchorDate = new Date(anchor);
  anchorDate.setHours(23, 59, 59, 999);
  const to = anchorDate.getTime();
  const fromDate = new Date(anchor - days(lookDays - 1));
  fromDate.setHours(0, 0, 0, 0);
  const from = fromDate.getTime();
  return { from, to };
};

/**
 * Obtiene ventana temporal basada en período
 */
export const getTimeWindow = (period: string): { from?: number; to?: number } => {
  const now = Date.now();
  if (period === '7d') return getDayAlignedRange(7);
  if (period === '30d') return getDayAlignedRange(30);
  if (period === '90d') return getDayAlignedRange(90);
  return { from: undefined, to: undefined };
};

// ==================== CONSTRUCCIÓN DE MAPAS ====================

/**
 * Infiere nivel desde nombre de curso
 */
const inferLevelFromCourse = (c: any): string => {
  if (c?.level) return String(c.level);
  const s = (c?.name || c?.id || '').toLowerCase();
  if (s.includes('media') || s.includes('medio') || s.includes('secundaria') || s.includes('high')) return 'media';
  if (s.includes('basica') || s.includes('basico') || s.includes('primaria') || s.includes('basic')) return 'basica';
  return '';
};

/**
 * Construye mapa de curso a nivel
 */
export const buildCourseLevelMap = (year: number): Record<string, string> => {
  const cacheKey = `courseLevelMap:${year}`;
  const cached = getCachedData(cacheKey, () => null, CACHE_TTL);
  if (cached && typeof cached === 'object') return cached as Record<string, string>;

  const map: Record<string, string> = {};

  try {
    const yearCourses = LocalStorageManager.getCoursesForYear?.(year) || [];
    if (Array.isArray(yearCourses)) {
      yearCourses.forEach((c: any) => {
        if (c?.id) {
          const l = inferLevelFromCourse(c);
          if (l) map[String(c.id)] = l;
        }
      });
    }
    if (Object.keys(map).length === 0) {
      const arrYear = getCachedLocalStorageJson(`smart-student-courses-${year}`, []);
      if (Array.isArray(arrYear)) {
        arrYear.forEach((c: any) => {
          if (c?.id) {
            const l = inferLevelFromCourse(c);
            if (l) map[String(c.id)] = l;
          }
        });
      }
    }
    if (Object.keys(map).length === 0) {
      const legacy = getCachedLocalStorageJson('smart-student-courses', []);
      if (Array.isArray(legacy)) {
        legacy.forEach((c: any) => {
          if (c?.id) {
            const l = inferLevelFromCourse(c);
            if (l) map[String(c.id)] = l;
          }
        });
      }
    }
  } catch {
    /* ignore */
  }

  dataCache.set(cacheKey, { data: map, timestamp: Date.now(), ttl: CACHE_TTL });
  return map;
};

/**
 * Construye lista de todos los estudiantes
 */
export const buildAllStudents = (year: number): any[] => {
  const cacheKey = `allStudents:${year}`;
  const cached = getCachedData(cacheKey, () => null, CACHE_TTL);
  if (Array.isArray(cached)) return cached;

  let allStudents: any[] = [];
  try {
    allStudents = LocalStorageManager.getStudentsForYear?.(year) || [];
    if (!Array.isArray(allStudents) || allStudents.length === 0) {
      const legacy = getCachedLocalStorageJson(`smart-student-students-${year}`, []);
      if (Array.isArray(legacy)) allStudents = legacy;
    }
    if (!Array.isArray(allStudents) || allStudents.length === 0) {
      const usersGlobal = getCachedLocalStorageJson('smart-student-users', []);
      if (Array.isArray(usersGlobal)) {
        allStudents = usersGlobal.filter((u: any) => u?.role === 'student');
      }
    }
  } catch {
    /* ignore */
  }

  dataCache.set(cacheKey, { data: allStudents, timestamp: Date.now(), ttl: CACHE_TTL });
  return allStudents;
};

/**
 * Construye mapa de estudiante a nivel
 */
export const buildStudentLevelMap = (year: number, courseLevelMap: Record<string, string>): Record<string, Level> => {
  const cacheKey = `studentLevelMap:${year}`;
  const cached = getCachedData(cacheKey, () => null, CACHE_TTL);
  if (cached && typeof cached === 'object') return cached as Record<string, Level>;

  const map: Record<string, Level> = {};
  const allStudents = buildAllStudents(year);

  try {
    allStudents.forEach((st) => {
      const cid = String((st as any).courseId || '');
      const lvl: any = (st as any).level || courseLevelMap[cid];
      if (lvl === 'basica' || lvl === 'media') {
        const ids: string[] = [];
        if ((st as any).id) ids.push(String((st as any).id));
        if ((st as any).studentId) ids.push(String((st as any).studentId));
        if ((st as any).username) ids.push(String((st as any).username));
        if ((st as any).rut) ids.push(String((st as any).rut));
        ids.forEach((k) => {
          if (k) map[k.toLowerCase()] = lvl;
        });
      }
    });
  } catch {
    /* ignore */
  }

  dataCache.set(cacheKey, { data: map, timestamp: Date.now(), ttl: CACHE_TTL });
  return map;
};

// ==================== NORMALIZACIÓN DE REGISTROS ====================

/**
 * Normaliza un registro de asistencia
 */
export const normalizeAttendanceRecord = (r: any): NormalizedAttendance | null => {
  const ts = parseTimestampOptimized(r?.timestamp || r?.date || r?.when || r?.createdAt || r?.updatedAt);
  if (!ts) return null;

  const d = new Date(ts);
  const dayKey = keyOfDayLocal(d);
  const cs = r.course || r.courseSectionId;
  const courseId = String(r.courseId || (typeof cs === 'string' ? cs.split('-').slice(0, -1).join('-') : ''));
  const sectionId = String(r.sectionId || (typeof cs === 'string' ? cs.split('-').slice(-1)[0] : ''));

  let presentIds: string[] = [];
  let presentCount = 0;
  let totalCount: number | undefined = undefined;

  if (Array.isArray(r.presentStudents) && r.presentStudents.length) {
    const set = new Set<string>();
    r.presentStudents.forEach((ps: any) => {
      const pid = String(ps?.studentId || ps?.id || ps?.username || ps).toLowerCase();
      if (pid) set.add(pid);
    });
    presentIds = Array.from(set);
    presentCount =
      r.presentCount && typeof r.presentCount === 'number'
        ? Math.max(r.presentCount, presentIds.length)
        : presentIds.length;
  } else if (r.status === 'present' || r.present === true) {
    const pid = String(r.studentId || r.studentUsername || r.username || r.user || '').toLowerCase();
    if (pid) presentIds = [pid];
    presentCount = 1;
  }

  if (typeof (r as any).totalCount === 'number') totalCount = Number((r as any).totalCount);
  const status = (r as any).status === 'absent' ? 'absent' : presentCount > 0 ? 'present' : undefined;

  return { ts, dayKey, courseId, sectionId, presentIds, presentCount, totalCount, status, raw: r };
};

/**
 * Construye índice de asistencia por año
 */
export const buildAttendanceYearIndex = (
  year: number,
  source: any[]
): { dayIndex: Map<string, NormalizedAttendance[]>; sourceCount: number } => {
  const cached = attendanceYearCache.get(year);
  const sourceCount = Array.isArray(source) ? source.length : 0;
  if (cached && cached.sourceCount === sourceCount) {
    return { dayIndex: cached.dayIndex, sourceCount: cached.sourceCount };
  }

  const map = new Map<string, NormalizedAttendance[]>();
  try {
    (source || []).forEach((r: any) => {
      const n = normalizeAttendanceRecord(r);
      if (!n) return;
      if (!map.has(n.dayKey)) map.set(n.dayKey, []);
      map.get(n.dayKey)!.push(n);
    });
  } catch {
    /* ignore */
  }

  attendanceYearCache.set(year, { dayIndex: map, sourceCount, builtAt: Date.now() });
  return { dayIndex: map, sourceCount };
};

/**
 * Normaliza un registro de calificación
 */
export const normalizeGradeRecord = (g: any): NormalizedGrade | null => {
  const v = g?.gradedAt ?? g?.createdAt ?? g?.timestamp ?? g?.when ?? g?.date;
  let ts = 0;
  if (typeof v === 'number') ts = v;
  else if (typeof v === 'string') {
    const t = Date.parse(v);
    if (!isNaN(t)) ts = t;
  }
  if (!ts) return null;

  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const monthKey = `${y}-${m}`;

  const courseId = String(g?.courseId || g?.course || '');
  const sectionId = String(g?.sectionId || g?.section || '');

  const rawScore =
    typeof g?.score === 'number'
      ? g.score
      : typeof g?.grade === 'number'
        ? toPercentFromConfigured(g.grade)
        : undefined;
  if (typeof rawScore !== 'number' || !isFinite(rawScore)) return null;

  const score = Math.max(0, Math.min(100, rawScore));
  return { ts, monthKey, courseId, sectionId, score, raw: g };
};

/**
 * Construye índice de calificaciones por año
 */
export const buildGradesYearIndex = (
  year: number,
  source: any[]
): { monthIndex: Map<string, NormalizedGrade[]>; sourceCount: number } => {
  const cached = gradesYearCache.get(year);
  const sourceCount = Array.isArray(source) ? source.length : 0;
  if (cached && cached.sourceCount === sourceCount) {
    return { monthIndex: cached.monthIndex, sourceCount: cached.sourceCount };
  }

  const map = new Map<string, NormalizedGrade[]>();
  try {
    (source || []).forEach((r: any) => {
      const n = normalizeGradeRecord(r);
      if (!n) return;
      const d = new Date(n.ts);
      if (d.getFullYear() !== year) return;
      if (!map.has(n.monthKey)) map.set(n.monthKey, []);
      map.get(n.monthKey)!.push(n);
    });
  } catch {
    /* ignore */
  }

  gradesYearCache.set(year, { monthIndex: map, sourceCount, builtAt: Date.now() });
  return { monthIndex: map, sourceCount };
};

// ==================== RANGO DE SEMESTRES ====================

/**
 * Obtiene rango de fechas para un semestre según configuración del Calendario
 */
export const getSemesterRange = (year: number, sem: 'S1' | 'S2'): { start?: number; end?: number } => {
  if (typeof window === 'undefined') {
    // SSR: usar fallback
    return getSemesterRangeFallback(year, sem);
  }

  const keys = [
    `smart-student-semesters-${year}`,
    'smart-student-semesters',
    `admin-calendar-${year}`,
    'admin-calendar',
  ];

  const parseDate = (s?: string): number | undefined => {
    if (!s) return undefined;
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('-').map(Number);
      const d = new Date(yyyy, (mm || 1) - 1, dd || 1);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [yyyy, mm, dd] = s.split('-').map(Number);
      const d = new Date(yyyy, (mm || 1) - 1, dd || 1);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    const t = Date.parse(s);
    return isNaN(t) ? undefined : t;
  };

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const cfg = JSON.parse(raw);

      // Formato directo { first:{start,end}, second:{start,end} }
      if (cfg?.first || cfg?.second) {
        const node = sem === 'S1' ? cfg.first : cfg.second;
        if (node) {
          const start = parseDate(node.start || node.inicio || node.from);
          const end = parseDate(node.end || node.fin || node.to);
          if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (startDate.getFullYear() !== year || endDate.getFullYear() !== year) {
              startDate.setFullYear(year);
              endDate.setFullYear(year);
              const adjustedStart = startDate.getTime();
              const adjustedEnd = endDate.getTime();
              return adjustedStart <= adjustedEnd
                ? { start: adjustedStart, end: adjustedEnd }
                : { start: adjustedEnd, end: adjustedStart };
            }
            return start <= end ? { start, end } : { start: end, end: start };
          }
        }
      }

      // Formato anidado { semesters:{ first:{...}, second:{...} } }
      if (cfg?.semesters) {
        const node = sem === 'S1' ? cfg.semesters.first : cfg.semesters.second;
        if (node) {
          const start = parseDate(node.start || node.inicio || node.from);
          const end = parseDate(node.end || node.fin || node.to);
          if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (startDate.getFullYear() !== year || endDate.getFullYear() !== year) {
              startDate.setFullYear(year);
              endDate.setFullYear(year);
              const adjustedStart = startDate.getTime();
              const adjustedEnd = endDate.getTime();
              return adjustedStart <= adjustedEnd
                ? { start: adjustedStart, end: adjustedEnd }
                : { start: adjustedEnd, end: adjustedStart };
            }
            return start <= end ? { start, end } : { start: end, end: start };
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  return getSemesterRangeFallback(year, sem);
};

/**
 * Fallback para rango de semestres (Chile)
 */
const getSemesterRangeFallback = (year: number, sem: 'S1' | 'S2'): { start: number; end: number } => {
  const fallbackStart =
    sem === 'S1'
      ? new Date(year, 2, 1).getTime() // 1 de Marzo
      : new Date(year, 6, 1).getTime(); // 1 de Julio
  const fallbackEnd =
    sem === 'S1'
      ? new Date(year, 5, 30, 23, 59, 59, 999).getTime() // 30 de Junio
      : new Date(year, 11, 31, 23, 59, 59, 999).getTime(); // 31 de Diciembre

  return { start: fallbackStart, end: fallbackEnd };
};

// ==================== CONFIGURACIÓN DE CALENDARIO ====================

/**
 * Obtiene configuración de calendario para un año
 */
export const getCalendarConfig = (year: number): CalendarYearConfig => {
  const def: CalendarYearConfig = { showWeekends: true, summer: {}, winter: {}, holidays: [] };
  if (typeof window === 'undefined') return def;

  try {
    const raw = localStorage.getItem(`admin-calendar-${year}`);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return { ...def, ...parsed } as CalendarYearConfig;
    return def;
  } catch {
    return def;
  }
};

/**
 * Verifica si una fecha está dentro de un rango de vacaciones
 */
export const isInVacationRange = (date: Date, range?: VacationRange): boolean => {
  if (!range?.start || !range?.end) return false;

  const parseYmdLocal = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const a = parseYmdLocal(range.start).getTime();
  const b = parseYmdLocal(range.end).getTime();
  const [min, max] = a <= b ? [a, b] : [b, a];
  return t >= min && t <= max;
};

// ==================== NOMBRES DE MESES ====================

export const getMonthNames = (language: string = 'es'): string[] => {
  const names: Record<string, string[]> = {
    es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  return names[language] || names.es;
};

export const getMonthNamesLong = (language: string = 'es'): string[] => {
  const names: Record<string, string[]> = {
    es: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };
  return names[language] || names.es;
};

// ==================== INFERENCIA DE NIVEL ====================

/**
 * Infiere nivel desde nombre de curso
 */
export const inferLevelFromCourseName = (courseName: string): 'basica' | 'media' | undefined => {
  if (!courseName) return undefined;
  const name = String(courseName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (/medio|media/i.test(name)) return 'media';
  if (/basico|basica|básico|básica/i.test(name)) return 'basica';
  if (/^[1-8](ro|do|to|ero|vo|mo|°)/i.test(name) && !/medio|media/i.test(name)) return 'basica';
  if (/[1-4](ro|do|to|ero|°)\s*(medio|media)/i.test(name)) return 'media';
  return undefined;
};

/**
 * Normaliza nombre de curso para comparación
 */
export const normalizeCourseNameForMatch = (name: string): string => {
  if (!name) return '';
  let n = String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  n = n
    .replace(/\b1ro\b|\bprimero\b|\bprimer\b/g, '1')
    .replace(/\b2do\b|\bsegundo\b/g, '2')
    .replace(/\b3ro\b|\btercero\b|\btercer\b/g, '3')
    .replace(/\b4to\b|\bcuarto\b/g, '4')
    .replace(/\b5to\b|\bquinto\b/g, '5')
    .replace(/\b6to\b|\bsexto\b/g, '6')
    .replace(/\b7mo\b|\bseptimo\b/g, '7')
    .replace(/\b8vo\b|\boctavo\b/g, '8')
    .replace(/°/g, '')
    .replace(/basico/g, 'basica')
    .replace(/medio/g, 'media');
  n = n.replace(/[^a-z0-9\s]/g, '').trim();
  return n;
};

/**
 * Extrae grado y nivel de un nombre de curso normalizado
 */
export const extractGradeLevel = (s: string): string => {
  const gradeMatch = s.match(/(\d)/);
  const grade = gradeMatch ? gradeMatch[1] : '';
  const level = s.includes('media') ? 'media' : s.includes('basica') ? 'basica' : '';
  return `${grade}${level}`;
};

// ==================== CÁLCULO DE DATOS MENSUALES ====================

/**
 * Calcula datos de asistencia mensual desde localStorage
 */
export const computeMonthlyAttendanceFromLocalStorage = (
  year: number
): Record<string, { present: number; total: number }> | null => {
  try {
    const rawAttendance = LocalStorageManager.getAttendanceForYear?.(year) || [];

    if (!Array.isArray(rawAttendance) || rawAttendance.length === 0) return null;

    const attendanceMonthly: Record<string, { present: number; total: number }> = {};

    rawAttendance.forEach((r: any) => {
      const dateVal = r.date || r.timestamp || r.when;
      const ts = parseTimestampOptimized(dateVal);
      if (!ts || new Date(ts).getFullYear() !== year) return;

      const d = new Date(ts);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!attendanceMonthly[monthKey]) {
        attendanceMonthly[monthKey] = { present: 0, total: 0 };
      }

      if (r.status === 'present' || r.present === true) {
        attendanceMonthly[monthKey].present += 1;
        attendanceMonthly[monthKey].total += 1;
      } else if (r.status === 'absent' || r.present === false || r.status === 'late') {
        attendanceMonthly[monthKey].total += 1;
        if (r.status === 'late') attendanceMonthly[monthKey].present += 1;
      } else if (Array.isArray(r.presentStudents)) {
        attendanceMonthly[monthKey].present += r.presentStudents.length;
        attendanceMonthly[monthKey].total += r.presentStudents.length + (r.absentStudents?.length || 0);
      }
    });

    return Object.keys(attendanceMonthly).length > 0 ? attendanceMonthly : null;
  } catch {
    return null;
  }
};

/**
 * Calcula datos de asistencia mensual desde IndexedDB (fuente principal)
 * con fallback a localStorage si IndexedDB no está disponible o vacío
 */
export const computeMonthlyAttendanceFromIndexedDB = async (
  year: number
): Promise<Record<string, { present: number; total: number }> | null> => {
  try {
    // Dynamic import to avoid SSR issues
    const { attendanceIDB } = await import('@/lib/attendance-idb');
    
    // Test connection first
    const { success } = await attendanceIDB.testConnection();
    if (!success) {
      console.log('[Stats] IndexedDB no disponible, usando localStorage');
      return computeMonthlyAttendanceFromLocalStorage(year);
    }
    
    // Get monthly data directly from IndexedDB
    const monthly = await attendanceIDB.getMonthlyAttendance(year);
    
    if (monthly.size === 0) {
      console.log('[Stats] IndexedDB vacío, intentando localStorage');
      return computeMonthlyAttendanceFromLocalStorage(year);
    }
    
    // Convert Map to record format
    const result: Record<string, { present: number; total: number }> = {};
    for (const [month, data] of monthly.entries()) {
      result[month] = {
        present: data.present + data.late, // late counts as present for rate
        total: data.total
      };
    }
    
    console.log(`[Stats] Cargados ${monthly.size} meses de asistencia desde IndexedDB`);
    return result;
  } catch (error) {
    console.warn('[Stats] Error con IndexedDB, usando localStorage:', error);
    return computeMonthlyAttendanceFromLocalStorage(year);
  }
};

/**
 * Migra datos de asistencia de localStorage a IndexedDB
 */
export const migrateAttendanceToIndexedDB = async (year: number): Promise<{
  success: boolean;
  logs: string[];
  migrated: number;
}> => {
  try {
    const { attendanceIDB } = await import('@/lib/attendance-idb');
    
    // Check if IndexedDB is available
    const { success } = await attendanceIDB.testConnection();
    if (!success) {
      return { success: false, logs: ['IndexedDB no disponible'], migrated: 0 };
    }
    
    // Check if already migrated
    const { count } = await attendanceIDB.countAttendanceByYear(year);
    if (count > 0) {
      return { 
        success: true, 
        logs: [`Ya existen ${count} registros en IndexedDB para ${year}`], 
        migrated: 0 
      };
    }
    
    // Migrate from localStorage
    return await attendanceIDB.migrateFromLocalStorage(year, LocalStorageManager);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, logs: [`Error en migración: ${msg}`], migrated: 0 };
  }
};
