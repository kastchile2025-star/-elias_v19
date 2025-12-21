"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { 
  Calendar, 
  Users, 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  UserX, 
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { es as esLocale, enGB } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LocalStorageManager } from '@/lib/education-utils';
import { useAttendanceSQL } from '@/hooks/useAttendanceSQL';
import { isFirebaseEnabled } from '@/lib/sql-config';

// Tipos de datos
interface Student {
  username: string;
  displayName: string;
  activeCourses: string[];
  assignedTeachers?: Record<string, string>;
  id?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  courseId: string | null;
  sectionId: string | null;
  course?: string; // Nombre original del curso (ej: "1ro Básico") - de Firebase
  section?: string; // Nombre original de la sección (ej: "A") - de Firebase
  compositeKey?: string; // Clave compuesta courseId-sectionId para compatibilidad
  studentId: string;
  studentUsername?: string; // Alias para compatibilidad
  status: 'present' | 'absent' | 'late' | 'excused' | string;
  present?: boolean;
  comment?: string | null;
  subject?: string;
  teacherUsername?: string;
  notes?: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  year: number;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

// Obtener nombre de mes acorde al locale del navegador
const getMonthName = (monthIndex: number, year: number) =>
  new Date(year, monthIndex, 1).toLocaleString(undefined, { month: 'long' });

const statusColors = {
  present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  excused: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
};

const statusIcons = {
  present: Check,
  absent: X,
  late: Clock,
  excused: UserCheck
};

// Labels traducibles para los estados (definidos dentro del componente usando translate)

// Utilidades de fechas en horario local para evitar desfases por zona horaria
const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseLocalDate = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// Utilidades para clave de curso+sección y normalización
const makeCourseKey = (courseId: string, sectionId: string) => `${courseId}-${sectionId}`;
const toDayKey = (isoOrYmd: string) => String(isoOrYmd).slice(0, 10);

// --- Calendario Admin: utilidades para detectar días no laborables ---
type VacationRange = { start?: string; end?: string };
type CalendarYearConfig = { showWeekends: boolean; summer: VacationRange; winter: VacationRange; holidays: string[] };
const pad = (n: number) => String(n).padStart(2, '0');
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const inRange = (date: Date, range?: VacationRange) => {
  if (!range?.start || !range?.end) return false;
  // Comparar en horario local: construir fechas sin pasar por Date ISO string
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const aDate = parseLocalDate(range.start);
  const bDate = parseLocalDate(range.end);
  const a = aDate.getTime();
  const b = bDate.getTime();
  const [min, max] = a <= b ? [a, b] : [b, a];
  return t >= min && t <= max;
};
const loadCalendarConfig = (year: number): CalendarYearConfig => {
  const def: CalendarYearConfig = { showWeekends: true, summer: {}, winter: {}, holidays: [] };
  try {
    const raw = localStorage.getItem(`admin-calendar-${year}`);
    if (!raw) return def;
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch { parsed = raw; }
    if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch { /* ignore */ } }
    return { ...def, ...(parsed && typeof parsed === 'object' ? parsed : {}) } as CalendarYearConfig;
  } catch { return def; }
};
const getNonWorkingReason = (dateStr: string): null | 'holiday' | 'summer' | 'winter' | 'weekend' => {
  const d = parseLocalDate(dateStr);
  const cfg = loadCalendarConfig(d.getFullYear());
  if (cfg.holidays?.includes(keyOf(d))) return 'holiday';
  if (inRange(d, cfg.summer)) return 'summer';
  if (inRange(d, cfg.winter)) return 'winter';
  const dow = d.getDay(); // 0=Dom, 6=Sab
  // Solo considerar fin de semana como no laborable si el Admin lo tiene habilitado
  if (cfg.showWeekends && (dow === 0 || dow === 6)) return 'weekend';
  return null;
};

export default function AttendancePage() {
  const { translate, language } = useLanguage();
  const { user } = useAuth();
  const dateLocale: Locale = language === 'es' ? esLocale : enGB;
  const {
    getAttendanceByYear: getAttendanceByYearSQL,
    upsertAttendance: upsertAttendanceSQL,
    deleteAttendanceByDateCourseSection: deleteDaySQL,
    deleteAttendanceById: deleteAttendanceByIdSQL
  } = useAttendanceSQL();
  
  // Helper de traducción con fallback: si translate devuelve la clave tal cual, usamos el valor por defecto
  const t = useCallback((key: string, def?: string) => {
    const val = translate(key);
    return val === key ? (def || '') : val;
  }, [translate]);

  // Mapas de etiquetas con traducción
  const statusLabels = useMemo(() => ({
    present: t('attendance.present', t('present', 'Present')),
    absent: t('attendance.absent', t('absent', 'Absent')),
    late: t('attendance.late', t('late', 'Late')),
    excused: t('attendance.excused', t('excused', 'Excused'))
  }), [t]);
  
  // Estados principales
  const [selectedView, setSelectedView] = useState<'dashboard' | 'calendar' | 'students' | 'reports'>('dashboard');
  // selectedCourse es un ID compuesto courseId-sectionId
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Inicializar fecha respetando 'admin-selected-year' si existe (mismo día/mes)
    try {
      const saved = Number(localStorage.getItem('admin-selected-year') || '');
      const now = new Date();
      const baseYear = Number.isFinite(saved) && saved > 0 ? saved : now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      const maxDay = new Date(baseYear, month + 1, 0).getDate();
      const dt = new Date(baseYear, month, Math.min(day, maxDay));
      return toLocalDateString(dt);
    } catch {
      return toLocalDateString(new Date());
    }
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => parseLocalDate(toLocalDateString(new Date())).getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('admin-selected-year') || '');
      return Number.isFinite(saved) && saved > 0 ? saved : new Date().getFullYear();
    } catch {
      return new Date().getFullYear();
    }
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Datos
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [mySubjects, setMySubjects] = useState<string[]>([]);
  // Dispone de combos curso-sección; para admin se llena con todas las secciones del año
  const [teacherCourseSections, setTeacherCourseSections] = useState<Array<{ id: string; courseId: string; sectionId: string; label: string }>>([]);
  // Filtros Admin
  const isAdmin = (user?.role === 'admin');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  // Niveles fijos: 'basica' y 'media' con etiquetas traducibles
  const LEVEL_OPTIONS = useMemo(() => (
    language === 'es'
      ? [ { key: 'basica', label: 'Básica' }, { key: 'media', label: 'Media' } ]
      : [ { key: 'basica', label: 'Basic' }, { key: 'media', label: 'Secondary' } ]
  ), [language]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; name: string; level?: string }>>([]);
  const [availableSections, setAvailableSections] = useState<Array<{ id: string; name: string; courseId: string }>>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('__all__');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [dailyAttendance, setDailyAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [nonWorkingReason, setNonWorkingReason] = useState<null | 'holiday' | 'summer' | 'winter' | 'weekend'>(null);
  // Flag de estudiantes cargados para la sección seleccionada (para cerrar overlay en profesor)
  const [studentsReady, setStudentsReady] = useState<boolean>(false);

  // Overlay inicial: espera primera carga SQL + catálogos por rol
  const [showInitialOverlay, setShowInitialOverlay] = useState<boolean>(true);
  const [overlayProgress, setOverlayProgress] = useState<number>(0);
  const [sqlFetchDone, setSqlFetchDone] = useState<boolean>(false);
  const [teacherDataReady, setTeacherDataReady] = useState<boolean>(false);
  const [adminDataReady, setAdminDataReady] = useState<boolean>(false);
  const overlayStartedAtRef = useRef<number | null>(null);
  const [dayAttendanceReady, setDayAttendanceReady] = useState<boolean>(false);
  const [postReadyPainted, setPostReadyPainted] = useState<boolean>(false);

  // Derivados del selectedCourse: priorizar combos ya calculados
  const selectedCourseIds = useMemo(() => {
    if (!selectedCourse) return { courseId: '', sectionId: '' };
    const combo = teacherCourseSections.find(cs => cs.id === selectedCourse);
    if (combo) return { courseId: combo.courseId, sectionId: combo.sectionId };
    // Fallback legacy: intentar detectar uuid-uuid (5+5 partes)
    const parts = selectedCourse.split('-');
    if (parts.length >= 10) {
      return { courseId: parts.slice(0, 5).join('-'), sectionId: parts.slice(5, 10).join('-') };
    }
    // Fallback legacy 2: separador '::'
    const [courseId, sectionId] = selectedCourse.split('::');
    // Fallback final: intentar dividir por último '-'
    if (!courseId && !sectionId && selectedCourse.includes('-')) {
      const idx = selectedCourse.lastIndexOf('-');
      return { courseId: selectedCourse.slice(0, idx), sectionId: selectedCourse.slice(idx + 1) };
    }
    return { courseId: courseId || '', sectionId: sectionId || '' };
  }, [selectedCourse, teacherCourseSections]);

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🔧 Modo de base de datos:', isFirebaseEnabled() ? 'Firebase' : 'IndexedDB');
    if (!user) return;
    if (user.role === 'teacher') {
      loadTeacherData();
      loadAttendanceRecords();
    } else if (user.role === 'admin') {
      loadAdminData();
      loadAttendanceRecords();
    }
  }, [user]);

  // Carga datos base para Admin (todos los cursos/secciones del año seleccionado)
  const normalizeLevel = (raw: any): 'basica' | 'media' | null => {
    if (!raw) return null;
    const s = String(raw).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    // Básica
    if (/(basica|basico|basic|primary|primaria|elementary)/.test(s)) return 'basica';
    // Media / Secundaria / High School
    if (/(media|secundaria|secondary|high|highschool|hs)/.test(s)) return 'media';
    return null;
  };

  const loadAdminData = () => {
    try {
      setAdminDataReady(false);
      // Años disponibles
      const years = LocalStorageManager.listYears();
      setAvailableYears(years);

      // Cursos/secciones del año (raw)
      const coursesRaw: any[] = LocalStorageManager.getCoursesForYear(selectedYear) || [];
      const sectionsRaw: any[] = LocalStorageManager.getSectionsForYear(selectedYear) || [];
      
      console.log('🎓 Cursos RAW del localStorage (primero):', coursesRaw.length > 0 ? coursesRaw[0] : 'vacío');
      console.log('📚 Secciones RAW del localStorage (primero):', sectionsRaw.length > 0 ? sectionsRaw[0] : 'vacío');

  // Niveles disponibles: fijos (Básica, Media)
  setAvailableLevels(LEVEL_OPTIONS.map(o => o.key));

      // Normalizar cursos y secciones con ids no vacíos
      const normCourses = coursesRaw.map((c: any, i: number) => {
        const id = String(c.id ?? c.courseId ?? c.uuid ?? c.UUID ?? c.key ?? c.code ?? `auto-course-${i}`);
        const name = String(c.fullName || c.displayName || c.longName || c.label || c.gradeName || c.name || 'Curso');
        return { id, name, level: c?.level };
      });
      const normSections = sectionsRaw.map((s: any, i: number) => {
        const id = String(s.id ?? s.sectionId ?? `auto-section-${i}`);
        let courseId = String(s.courseId || (s.course && (s.course.id || s.courseId)) || '');
        if (!courseId) courseId = 'unknown-course';
        const name = String(s.fullName || s.displayName || s.longName || s.label || s.name || 'Sección');
        return { id, name, courseId };
      });
      setAvailableCourses(normCourses);
      setAvailableSections(normSections);

      // Construir lista global de curso-sección para la UI (y para obtener etiquetas)
      const byCourseId = new Map<string, { id: string; name: string; level?: string }>(
        normCourses.map(c => [c.id, c]) as any
      );
      const combos: Array<{ id: string; courseId: string; sectionId: string; label: string }> = [];
      for (const s of normSections) {
        const sectionId = s.id;
        const courseId = s.courseId;
        const course = byCourseId.get(courseId);
        const courseName = course?.name || translate('course');
        const sectionName = s.name || '';
        // Evitar ids vacíos, aunque ya están normalizados
        const id = `${courseId}-${sectionId}`;
        combos.push({ id, courseId, sectionId, label: `${courseName} ${sectionName}`.trim() });
      }
      // Ordenar por etiqueta
      combos.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
      setTeacherCourseSections(combos);

  // Admin: no autoseleccionar; esperar que el usuario elija Nivel → Curso → Sección
  if (combos.length === 0) {
        // Limpiar si no hay datos
        setSelectedCourse('');
        setSelectedCourseId('');
        setSelectedSectionId('');
        setStudents([]);
      }
      setAdminDataReady(true);
    } catch (e) {
      console.error('Error loading admin data:', e);
      setAdminDataReady(true);
    }
  };

  const loadTeacherData = () => {
    try {
      setTeacherDataReady(false);
      const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  // Datos bases
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  // Posibles colecciones del Mod Admin (Gestión Usuarios)
  const adminCourses = JSON.parse(localStorage.getItem('smart-student-admin-courses') || '[]');
  const adminSections = JSON.parse(localStorage.getItem('smart-student-admin-sections') || '[]');
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');

      // Intentar obtener un mapa de etiquetas curso-sección si existe en el storage
      // Estructuras soportadas:
      // - Array de { courseId, sectionId, label }
      // - Objeto con clave `${courseId}-${sectionId}`: label
      let csLabelMap: Record<string, string> = {};
      try {
        const labelsRaw = localStorage.getItem('smart-student-course-section-labels')
          || localStorage.getItem('smart-student-course-sections-labels')
          || localStorage.getItem('smart-student-course-sections-map');
        if (labelsRaw) {
          const parsed = JSON.parse(labelsRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((x: any) => {
              if (x && (x.courseId || x.course) && (x.sectionId || x.section) && x.label) {
                const k = `${x.courseId || x.course}-${x.sectionId || x.section}`;
                csLabelMap[k] = x.label;
              }
            });
          } else if (parsed && typeof parsed === 'object') {
            csLabelMap = parsed;
          }
        }
      } catch {}

      const getCourseSectionLabel = (courseId: string, sectionId: string) => {
        const key = `${courseId}-${sectionId}`;
        if (csLabelMap[key]) return csLabelMap[key];
        // Buscar en colecciones base y en Admin (priorizar Admin si tiene nombres humanos)
        const courseSources = [
          ...adminCourses,
          ...courses
        ];
        const sectionSources = [
          ...adminSections,
          ...sections
        ];
        // localizar sección primero
        const s = sectionSources.find((x: any) => x && (x.id === sectionId || x.sectionId === sectionId)) || {};
        // si no viene courseId, intentar derivarlo desde la sección encontrada
        const derivedCourseId = courseId || (s && (s.courseId || (s.course && (s.course.id || s.courseId)))) || courseId;
        const c = courseSources.find((x: any) => x && (x.id === derivedCourseId || x.courseId === derivedCourseId)) || {};
        // Tomar nombres más expresivos posibles
        const courseName = c.fullName || c.displayName || c.longName || c.label || c.gradeName || c.name || translate('course');
        const sectionName = s.fullName || s.displayName || s.longName || s.label || s.name || '';
        // Si el assignment ya trae label explícito, usarlo
        if ((c as any).label && (s as any).label) return `${(c as any).label} ${(s as any).label}`.trim();
        return `${courseName} ${sectionName}`.trim();
      };

      // Filtrar asignaciones del profesor por id o username
      const myAssignments = teacherAssignments.filter((ta: any) =>
        ta.teacherId === user?.id ||
        ta.teacherId === user?.username ||
        ta.teacherUsername === user?.username ||
        ta.teacher === user?.username
      );

      // Normalizar posibles nombres de campos y deducir courseId desde la sección cuando falte
      const sectionSourcesAll = [...adminSections, ...sections];
      const normalizeIds = (ta: any) => {
        const sectionId = ta.sectionId || ta.section || ta.sectionUUID || ta.sectionUuid || ta.section_id || ta.sectionID;
        let courseId = ta.courseId || ta.course || ta.courseUUID || ta.courseUuid || ta.course_id || ta.courseID;
        if (!courseId && sectionId) {
          const sec = sectionSourcesAll.find((s: any) => s && (s.id === sectionId || s.sectionId === sectionId));
          courseId = sec?.courseId || (sec?.course && (sec.course.id || sec.courseId)) || courseId;
        }
        return { courseId, sectionId };
      };

      const courseSections: Array<{ id: string; courseId: string; sectionId: string; label: string }> = myAssignments
        .map((ta: any) => {
          const { courseId, sectionId } = normalizeIds(ta);
          if (!sectionId) return null;
          const safeCourseId = courseId || 'unknown-course';
          const id = `${safeCourseId}-${sectionId}`;
          return { id, courseId: safeCourseId, sectionId, label: getCourseSectionLabel(courseId, sectionId) };
        })
        .filter(Boolean) as Array<{ id: string; courseId: string; sectionId: string; label: string }>;
      // Quitar duplicados por id (tipado fuerte)
      const seen = new Set<string>();
      const unique: Array<{ id: string; courseId: string; sectionId: string; label: string }> = courseSections.filter((cs) => {
        if (seen.has(cs.id)) return false;
        seen.add(cs.id);
        return true;
      });
  // Ordenar por etiqueta para una mejor UX
  unique.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
  setTeacherCourseSections(unique);

      // Materias del profesor
      const teacher = users.find((u: any) => u.username === user?.username || u.id === user?.id);
      const subjects = teacher?.teachingSubjects || [];
      setMySubjects(subjects);

      if (unique.length > 0 && !selectedCourse) {
        setSelectedCourse(unique[0].id);
      }
      if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0]);
      }

      // Cargar estudiantes por sección seleccionada (si ya hay selección inicial)
      if (unique.length > 0) {
        const initial: { id: string; courseId: string; sectionId: string; label: string } = unique[0];
        loadStudentsForSection(initial.sectionId, users);
      }
      setTeacherDataReady(true);
    } catch (error) {
      console.error('Error loading teacher data:', error);
      setTeacherDataReady(true);
    }
  };

  // Cargar estudiantes de una sección específica usando smart-student-student-assignments
  const loadStudentsForSection = (sectionId: string, usersCache?: any[]) => {
    try {
      setStudentsReady(false);
      // Preferir colecciones por año
      const studentsYear = LocalStorageManager.getStudentsForYear(selectedYear) || [];
      const users = usersCache || studentsYear;
      const assignmentsYear = LocalStorageManager.getStudentAssignmentsForYear(selectedYear) || [];
      // Fallback global si vacío
      const studentAssignments = (assignmentsYear && assignmentsYear.length > 0)
        ? assignmentsYear
        : JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
      const studentIds = studentAssignments
        .filter((sa: any) => sa.sectionId === sectionId)
        .map((sa: any) => sa.studentId || sa.studentUsername);
      let assigned = users.filter((u: any) => u.role === 'student' && (studentIds.includes(u.id) || studentIds.includes(u.username)));

      // Si soy estudiante, filtrar para mostrarme solo a mí
      if (user?.role === 'student') {
        assigned = assigned.filter((u: any) => u.username === user.username || u.id === user.id);
        // Si no me encontré en la lista (quizás no estoy en usersCache), agregarme manualmente
        if (assigned.length === 0) {
           assigned = [{
             username: user.username,
             displayName: user.displayName || user.username,
             id: user.id,
             activeCourses: []
           }];
        }
      }

      // Fallback especial para Admin: si no hay asignaciones, reconstruir lista desde registros de asistencia
      if (assigned.length === 0 && isAdmin) {
        // Determinar courseId de la sección
        const secObj = availableSections.find(s => String(s.id) === String(sectionId));
        const courseIdForSection = secObj?.courseId || '';
        const composite = courseIdForSection ? `${courseIdForSection}-${sectionId}` : '';
        const idsFromAttendance = new Set<string>();
        attendanceRecords.forEach(r => {
          const byComposite = composite && r.compositeKey === composite;
          const bySectionId = r.sectionId ? String(r.sectionId) === String(sectionId) : false;
          if (byComposite || bySectionId) idsFromAttendance.add(String(r.studentUsername || r.studentId));
        });
        if (idsFromAttendance.size > 0) {
          const byUsername = new Map<string, any>(users.map((u: any) => [String(u.username).toLowerCase(), u]));
          const synthetic: any[] = [];
          idsFromAttendance.forEach(un => {
            const u = byUsername.get(String(un).toLowerCase());
            if (u) synthetic.push(u);
            else synthetic.push({ username: un, displayName: un, activeCourses: [], role: 'student' });
          });
          assigned = synthetic;
        }
      }

      setStudents(assigned.map((s: any) => ({
        username: s.username,
        displayName: s.displayName || s.name || s.username,
        activeCourses: Array.isArray(s.activeCourses) ? s.activeCourses : [],
        id: s.id
      })));
      // Calcular marcas del día al tener estudiantes y sección lista
      try {
        const day = selectedDate;
        const dayAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
        attendanceRecords.forEach((r) => {
          if (r.date !== day) return;
          if (isRecordInSelectedCourse(r)) {
            const username = r.studentUsername || r.studentId;
            if (username) dayAttendance[username] = r.status as any;
          }
        });
        setDailyAttendance(dayAttendance);
        setDayAttendanceReady(true);
      } catch {}
      setStudentsReady(true);
    } catch (e) {
      console.error('Error loading students for section:', e);
      setStudentsReady(true);
    }
  };

  const loadStudentData = () => {
    try {
      setTeacherDataReady(false);
      // Cargar asignaciones de estudiante
      const studentAssignments = LocalStorageManager.getStudentAssignmentsForYear(selectedYear) || 
        JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
      
      const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
      const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
      const adminCourses = JSON.parse(localStorage.getItem('smart-student-admin-courses') || '[]');
      const adminSections = JSON.parse(localStorage.getItem('smart-student-admin-sections') || '[]');
      
      const allCourses = [...adminCourses, ...courses];
      const allSections = [...adminSections, ...sections];

      // Filtrar mis asignaciones
      const myAssignments = studentAssignments.filter((sa: any) => 
        sa.studentId === user?.id || 
        sa.studentUsername === user?.username ||
        sa.student === user?.username
      );

      const getCourseSectionLabel = (courseId: string, sectionId: string) => {
        const c = allCourses.find((x: any) => x.id === courseId) || {};
        const s = allSections.find((x: any) => x.id === sectionId) || {};
        const cName = c.name || c.fullName || translate('course');
        const sName = s.name || s.label || '';
        return `${cName} ${sName}`.trim();
      };

      const courseSections = myAssignments.map((sa: any) => {
        const sectionId = sa.sectionId;
        // Buscar courseId si no viene
        let courseId = sa.courseId;
        if (!courseId && sectionId) {
           const sec = allSections.find((s: any) => s.id === sectionId);
           courseId = sec?.courseId;
        }
        if (!courseId || !sectionId) return null;
        
        return {
          id: `${courseId}-${sectionId}`,
          courseId,
          sectionId,
          label: getCourseSectionLabel(courseId, sectionId)
        };
      }).filter(Boolean);

      // Eliminar duplicados
      const uniqueMap = new Map();
      courseSections.forEach((cs: any) => uniqueMap.set(cs.id, cs));
      const unique = Array.from(uniqueMap.values()) as any[];
      
      setTeacherCourseSections(unique);
      
      if (unique.length > 0 && !selectedCourse) {
        setSelectedCourse(unique[0].id);
      }
      
      // Cargar "estudiantes" (solo yo)
      if (unique.length > 0) {
        loadStudentsForSection(unique[0].sectionId);
      }
      
      setTeacherDataReady(true);
    } catch (e) {
      console.error('Error loading student data:', e);
      setTeacherDataReady(true);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setSqlFetchDone(false);
      const yearRows = await getAttendanceByYearSQL(selectedYear);
      
      // Si soy estudiante, filtrar solo mis registros
      let filteredRows = yearRows;
      if (user?.role === 'student') {
        filteredRows = (yearRows || []).filter((r: any) => 
          r.studentId === user.username || r.studentId === user.id || r.studentUsername === user.username
        );
      }

      console.log('📊 Datos de asistencia recibidos:', filteredRows?.length || 0, 'registros');
      if (filteredRows && filteredRows.length > 0) {
        console.log('🔍 Primer registro de ejemplo:', filteredRows[0]);
      }
      
      const studentsYear: any[] = LocalStorageManager.getStudentsForYear(selectedYear) || [];
      console.log('👥 Estudiantes en localStorage para', selectedYear, ':', studentsYear.length);
      
      const byId = new Map<string, any>();
      const byUsername = new Map<string, any>();
      for (const s of studentsYear) {
        if (s && s.id) byId.set(String(s.id), s);
        if (s && s.username) byUsername.set(String(s.username), s);
      }
      
      // 🔍 DEBUG: Log del primer registro raw antes de mapear
      if (filteredRows && filteredRows.length > 0) {
        const firstRow = filteredRows[0];
        console.log('🔍 [DEBUG] Primer registro raw antes de mapear:', {
          rawDate: String(firstRow.date),
          status: firstRow.status,
          studentId: firstRow.studentId,
          courseId: firstRow.courseId,
          sectionId: firstRow.sectionId
        });
      }
      
      const mapped: AttendanceRecord[] = (filteredRows || []).map((r: any) => {
        // Intentar encontrar el estudiante por username primero, luego por ID
        const u = byUsername.get(String(r.studentId)) || byId.get(String(r.studentId));
        const studentUsername = u?.username || String(r.studentId);
        const rawDate = String(r.date);
        const date = toDayKey(rawDate);
        const compositeKey = makeCourseKey(String(r.courseId || ''), String(r.sectionId || ''));
        
        // Preservar el nombre original del curso de Firebase antes de sobrescribir
        const originalCourseName = r.course;
        const originalSectionName = r.section;
        
        return {
          id: r.id || `att-${r.studentId}-${r.sectionId}-${date}`,
          studentUsername,
          date,
          courseId: r.courseId,
          sectionId: r.sectionId,
          course: originalCourseName, // 🎯 Nombre original de Firebase (ej: "1ro Básico")
          section: originalSectionName, // 🎯 Nombre original de Firebase (ej: "A")
          compositeKey, // Guardar composite separado para otros usos
          studentId: r.studentId,
          status: (r.status || 'present'),
          present: r.present,
          comment: r.comment,
          subject: 'General',
          teacherUsername: '',
          notes: r.comment,
          timestamp: r.updatedAt || r.createdAt || new Date().toISOString(),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          year: r.year,
        };
      });
      
      console.log('✅ Registros mapeados:', mapped.length);
      if (mapped.length > 0) {
        console.log('🔍 Primer registro mapeado completo:', mapped[0]);
        console.log('🔍 Campos importantes - date:', mapped[0].date, ', status:', mapped[0].status, ', studentUsername:', mapped[0].studentUsername);
        console.log('🔍 Campos Firebase ORIGINALES - course:', mapped[0].course, ', section:', mapped[0].section);
        console.log('🔍 Campos ID - courseId:', mapped[0].courseId, ', sectionId:', mapped[0].sectionId);
        console.log('🔍 Composite key:', mapped[0].compositeKey);
        console.log('🔍 Todos los course (nombres originales) únicos:', [...new Set(mapped.map(r => r.course))].slice(0, 5));
        console.log('🔍 Todos los section (nombres originales) únicos:', [...new Set(mapped.map(r => r.section))]);
        console.log('🔍 Todas las fechas únicas (primeras 10):', [...new Set(mapped.map(r => r.date))].slice(0, 10));
      }
      
      setAttendanceRecords(mapped);
      // Sincronizar marcas del día inmediatamente si ya hay selección lista
      try {
        if (selectedCourse || (isAdmin && selectedCourseId && selectedSectionId)) {
          console.log('🎯 Filtros activos - Admin:', isAdmin, 
            ', selectedCourseId:', selectedCourseId, 
            ', selectedSectionId:', selectedSectionId,
            ', selectedCourse:', selectedCourse,
            ', selectedDate:', selectedDate);
            
          const dayAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
          let matchCount = 0;
          
          console.log(`🔍 [DEBUG] Buscando asistencia para fecha: "${selectedDate}"`);
          console.log(`🔍 [DEBUG] Total registros mapeados: ${mapped.length}`);
          
          // Mostrar primeras 3 fechas únicas de los registros
          const uniqueDates = [...new Set(mapped.map(r => r.date))].slice(0, 5);
          console.log(`🔍 [DEBUG] Primeras 5 fechas en registros:`, uniqueDates);
          
          mapped.forEach((r) => {
            if (r.date === selectedDate) {
              // Usar el mismo criterio de emparejamiento por curso/sección
              const match = (() => {
                // Admin: usar filtros separados
                if (isAdmin && selectedCourseId && selectedSectionId) {
                  if (r.courseId === selectedCourseId && r.sectionId === selectedSectionId) return true;
                  const expectedComposite = makeCourseKey(selectedCourseId, selectedSectionId);
                  if (r.compositeKey === expectedComposite) return true;
                }
                // Profesor: usar selectedCourse
                const { courseId, sectionId } = selectedCourseIds;
                if (r.compositeKey === selectedCourse) return true;
                if (sectionId) {
                  if (r.course && r.course.endsWith(`-${sectionId}`)) return true;
                  if (r.sectionId && String(r.sectionId) === String(sectionId)) return true;
                }
                if (courseId && sectionId) {
                  const expected = `${courseId}-${sectionId}`;
                  if (r.compositeKey === expected) return true;
                }
                return false;
              })();
              if (match) {
                const username = r.studentUsername || r.studentId;
                console.log(`✅ [DEBUG] Match encontrado: ${username} → ${r.status}`);
                if (username) dayAttendance[username] = r.status as 'present' | 'absent' | 'late' | 'excused';
                matchCount++;
              }
            }
          });
          console.log(`📅 Asistencia del día ${selectedDate}:`, matchCount, 'estudiantes con estado registrado');
          if (matchCount > 0) {
            console.log('📊 Estados:', dayAttendance);
          } else {
            console.warn('⚠️ No se encontraron coincidencias. Verificar filtros.');
          }
          
          // IMPORTANTE: Solo actualizar dailyAttendance si tenemos datos del servidor
          // o si está vacío. Esto evita sobrescribir marcas locales pendientes.
          setDailyAttendance(prev => {
            // Si no hay registros del servidor Y ya tenemos datos locales, mantener los locales
            if (matchCount === 0 && Object.keys(prev).length > 0) {
              console.log('⚠️ Preservando marcas locales existentes');
              return prev;
            }
            // Si hay datos del servidor, usar esos
            return dayAttendance;
          });
          setDayAttendanceReady(true);
        }
      } catch {}
      setSqlFetchDone(true);
    } catch (error) {
      console.error('Error loading attendance records (SQL):', error);
      setAttendanceRecords([]);
      setSqlFetchDone(true);
    }
  };

  // Helper para aplicar cambio de año de forma consistente (ajustar fecha y resetear filtros dependientes)
  const applyYearChange = useCallback((newYear: number) => {
    setSelectedYear(newYear);
    // Ajustar fecha al mismo día/mes en el nuevo año (clamp a fin de mes)
    try {
      const cur = parseLocalDate(selectedDate);
      const month = cur.getMonth();
      const day = cur.getDate();
      const maxDay = new Date(newYear, month + 1, 0).getDate();
      const nd = new Date(newYear, month, Math.min(day, maxDay));
      setSelectedDate(toLocalDateString(nd));
    } catch {}
    // Resetear filtros dependientes (flujo Admin)
    setSelectedLevel('__all__');
    setSelectedCourseId('');
    setSelectedSectionId('');
    setSelectedCourse('');
    setStudents([]);
    // Persistir selección de año para sincronizar con otros módulos Admin
    try { localStorage.setItem('admin-selected-year', String(newYear)); } catch {}
  }, [selectedDate]);

  // Sincronizar cambios de 'admin-selected-year' originados desde otras pestañas/modulos
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'admin-selected-year' && e.newValue) {
        const y = parseInt(e.newValue, 10);
        if (Number.isFinite(y)) applyYearChange(y);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [applyYearChange]);

  // Recargar catálogos y asistencia cuando cambia el año seleccionado
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      loadAdminData();
      loadAttendanceRecords();
    } else if (user.role === 'teacher') {
      loadTeacherData();
      loadAttendanceRecords();
    } else if (user.role === 'student') {
      loadStudentData();
      loadAttendanceRecords();
    }
  }, [selectedYear, user]);

  // Sincronizar tras importaciones (otras pestañas) para el año actual
  useEffect(() => {
    const onAttChanged = () => loadAttendanceRecords();
    // @ts-ignore: evento custom desde el módulo Admin
    window.addEventListener('attendanceChanged', onAttChanged);
    // @ts-ignore: evento desde SQL
    window.addEventListener('sqlAttendanceUpdated', onAttChanged);
    return () => {
      // @ts-ignore
      window.removeEventListener('attendanceChanged', onAttChanged);
      // @ts-ignore
      window.removeEventListener('sqlAttendanceUpdated', onAttChanged);
    };
  }, [selectedYear]);

  // Nueva: reaccionar a cambios globales tras importación (años, cursos, secciones, asignaciones, usuarios)
  useEffect(() => {
    const onGlobalChange = () => {
      try {
        // Actualizar lista de años disponibles sin requerir refresco manual
        setAvailableYears(LocalStorageManager.listYears());
        if (!user) return;
        if (user.role === 'admin') {
          loadAdminData();
          loadAttendanceRecords();
        } else if (user.role === 'teacher') {
          loadTeacherData();
          loadAttendanceRecords();
        }
      } catch (e) {
        console.warn('Global change handler failed:', e);
      }
    };
    // @ts-ignore: eventos custom disparados desde Admin Configuración al importar
    window.addEventListener('yearsChanged', onGlobalChange);
    // @ts-ignore
    window.addEventListener('coursesChanged', onGlobalChange);
    // @ts-ignore
    window.addEventListener('sectionsChanged', onGlobalChange);
    // @ts-ignore
    window.addEventListener('teacherAssignmentsChanged', onGlobalChange);
    // @ts-ignore
    window.addEventListener('studentAssignmentsChanged', onGlobalChange);
    // @ts-ignore
  window.addEventListener('usersUpdated', onGlobalChange);
  // Importación completa
  window.addEventListener('dataImported', onGlobalChange);
    return () => {
      // @ts-ignore
      window.removeEventListener('yearsChanged', onGlobalChange);
      // @ts-ignore
      window.removeEventListener('coursesChanged', onGlobalChange);
      // @ts-ignore
      window.removeEventListener('sectionsChanged', onGlobalChange);
      // @ts-ignore
      window.removeEventListener('teacherAssignmentsChanged', onGlobalChange);
      // @ts-ignore
      window.removeEventListener('studentAssignmentsChanged', onGlobalChange);
      // @ts-ignore
  window.removeEventListener('usersUpdated', onGlobalChange);
  window.removeEventListener('dataImported', onGlobalChange);
    };
  }, [user, selectedYear]);

  const saveAttendanceRecord = async (record: AttendanceRecord) => {
    try {
      let { courseId, sectionId } = selectedCourseIds;
      
      // Si es Admin, necesitamos convertir los UUIDs a IDs normalizados
      if (isAdmin && selectedCourseId && selectedSectionId) {
        const course = availableCourses.find(c => c.id === selectedCourseId);
        const section = availableSections.find(s => s.id === selectedSectionId);
        
        if (course && section) {
          // Normalizar los nombres para crear el ID que se guardará
          const normalizeName = (name: string) => 
            name.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '_');
          
          courseId = normalizeName(course.name);
          sectionId = section.name.toUpperCase();
          
          console.log('💾 Mapeo para guardar:', {
            courseUUID: selectedCourseId,
            courseName: course.name,
            courseIdNormalizado: courseId,
            sectionUUID: selectedSectionId,
            sectionName: section.name,
            sectionIdNormalizado: sectionId
          });
        }
      }
      
      console.log('💾 saveAttendanceRecord - courseId:', courseId, ', sectionId:', sectionId);
      
      const studentsYear: any[] = LocalStorageManager.getStudentsForYear(selectedYear) || [];
      const byUsername = new Map<string, any>(studentsYear.map((s: any) => [String(s.username || '').toLowerCase(), s]));
      const usernameToLookup = record.studentUsername || record.studentId;
      const student = byUsername.get(String(usernameToLookup || '').toLowerCase());
      const studentId = student?.id || usernameToLookup; // fallback
      const iso = `${record.date}T00:00:00.000Z`;
      const canonical = {
        id: `att-${studentId}-${sectionId}-${toDayKey(iso)}`,
        date: iso,
        courseId: courseId || null,
        sectionId: sectionId || null,
        studentId: String(studentId),
        status: record.status,
        comment: record.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        year: selectedYear
      };
      
      console.log('💾 Objeto canonical a guardar:', canonical);
      
      await upsertAttendanceSQL([canonical as any]);
      
      // NO recargar inmediatamente para evitar sobrescribir marcas locales
      // El estado ya se actualizó en markAttendance
      // await loadAttendanceRecords();
      
      // Actualizar solo los registros en memoria sin recargar todo
      setAttendanceRecords(prev => {
        const existing = prev.findIndex(r => r.id === record.id);
        const newRecord: AttendanceRecord = {
          ...record,
          courseId: courseId || null,
          sectionId: sectionId || null
        };
        
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newRecord;
          return updated;
        } else {
          return [...prev, newRecord];
        }
      });
      
      try { window.dispatchEvent(new CustomEvent('attendanceChanged', { detail: { action: 'save', year: selectedYear } })); } catch {}
      try { window.dispatchEvent(new CustomEvent('updateDashboardCounts', { detail: { source: 'attendance', action: 'save' } })); } catch {}
      try { window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { source: 'attendance', action: 'save' } })); } catch {}
    } catch (error) {
      console.error('Error saving attendance record (SQL):', error);
    }
  };

  const isRecordInSelectedCourse = (record: AttendanceRecord) => {
    // Para modo Admin con filtros separados (selectedCourseId, selectedSectionId)
    if (isAdmin && selectedCourseId && selectedSectionId) {
      console.log('🔍 Comparando - Record:', {
        courseId: record.courseId,
        sectionId: record.sectionId,
        course: record.course,
        section: record.section
      }, 'vs Filtros:', {
        selectedCourseId,
        selectedSectionId
      });

      const selectedCourse = availableCourses.find(c => c.id === selectedCourseId);
      const selectedSection = availableSections.find(s => s.id === selectedSectionId);

      // 1) Match directo por IDs (cuando existen ambos UUID)
      if (record.courseId === selectedCourseId && record.sectionId === selectedSectionId) {
        console.log('✅ Match directo por IDs (courseId/sectionId)');
        return true;
      }

      // 2) Fallback robusto: mismo courseId + mismo nombre de sección
      if (selectedCourse && selectedSection) {
        const sameCourseId = record.courseId === selectedCourse.id;
        const sameSectionName = (record.section || '').toUpperCase() === (selectedSection.name || '').toUpperCase();

        if (sameCourseId && sameSectionName) {
          console.log('✅ Match por courseId + section name (fallback)');
          return true;
        }
      }

      // 3) Fallback "Skeleton": comparar consonantes y números (ignora vocales y símbolos rotos)
      if (selectedCourse && selectedSection) {
         const toSkeleton = (str: string) => {
            return String(str || '')
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/[aeiou]/g, '') // Remove vowels
                .replace(/[^a-z0-9]/g, ''); // Keep only consonants and numbers
         };
         
         // Intentar con el nombre del curso (si existe) o el ID
         const recordSkeleton = toSkeleton(record.course || record.courseId || '');
         const selectedSkeleton = toSkeleton(selectedCourse.name);
         
         const sameSectionName = (record.section || '').toUpperCase() === (selectedSection.name || '').toUpperCase();
         
         if (recordSkeleton === selectedSkeleton && sameSectionName) {
             console.log('✅ Match por Skeleton (consonantes) - Record:', recordSkeleton, 'Selected:', selectedSkeleton);
             return true;
         }
      }

      // 4) Fallback adicional: comparar nombres normalizados (por si cambian los IDs)
      if (selectedCourse && selectedSection && record.course && record.section) {
        const normalizeForCompare = (str: string) => {
          let normalized = String(str || '').trim().toLowerCase();
          try {
            normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          } catch {
            normalized = normalized
              .replace(/[áàäâã]/g, 'a')
              .replace(/[éèëê]/g, 'e')
              .replace(/[íìïî]/g, 'i')
              .replace(/[óòöôõ]/g, 'o')
              .replace(/[úùüû]/g, 'u')
              .replace(/ñ/g, 'n');
          }
          return normalized.replace(/\s+/g, '_');
        };

        const normalizedSelectedCourse = normalizeForCompare(selectedCourse.name);
        const normalizedSelectedSection = normalizeForCompare(selectedSection.name);
        const normalizedRecordCourse = normalizeForCompare(record.course);
        const normalizedRecordSection = normalizeForCompare(record.section);

        console.log('🔍 Comparando nombres normalizados:');
        console.log('  - Selected:', { course: normalizedSelectedCourse, section: normalizedSelectedSection });
        console.log('  - Record:', { course: normalizedRecordCourse, section: normalizedRecordSection });
        console.log('  - Curso original del record:', record.course);
        console.log('  - Curso original seleccionado:', selectedCourse.name);

        if (normalizedRecordCourse === normalizedSelectedCourse &&
            normalizedRecordSection === normalizedSelectedSection) {
          console.log('✅ Match por nombres normalizados');
          return true;
        }
      }

      console.log('❌ No match encontrado');
      return false;
    }
    
    // Para modo Profesor con selectedCourse (composite)
    if (!selectedCourse) return false;
    const { courseId, sectionId } = selectedCourseIds;
    // Coincidencia exacta por composite actual
    if (record.compositeKey === selectedCourse) return true;
    // Fallback: si el courseId es desconocido/varía, empatar por sección
    if (sectionId) {
      if (record.course && record.course.endsWith(`-${sectionId}`)) return true;
      if (record.sectionId && String(record.sectionId) === String(sectionId)) return true;
    }
    // Fallback adicional: si tenemos courseId válido, probar composite estándar
    if (courseId && sectionId) {
      const expected = `${courseId}-${sectionId}`;
      if (record.compositeKey === expected) return true;
    }
    return false;
  };

  const getAttendanceForDate = (date: string) => {
    // ✅ Asistencia compartida: considerar solo fecha y sección/curso seleccionado (ignoramos asignatura)
    return attendanceRecords.filter(record => 
      record.date === date &&
      isRecordInSelectedCourse(record)
    );
  };

  const markAttendance = async (studentUsername: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (nonWorkingReason) {
      return; // No permitir marcaje en días no laborables
    }
    
    // 🔄 TOGGLE: Si el estado actual es el mismo que se está presionando, desmarcar
    const currentStatus = dailyAttendance[studentUsername];
    if (currentStatus === status) {
      // Desmarcar: eliminar el registro
      setDailyAttendance(prev => {
        const next = { ...prev };
        delete next[studentUsername];
        return next;
      });
      
      // Eliminar registro de la base de datos (memoria y SQL)
      // FIX: Filtrar por propiedades (estudiante + fecha + curso) en lugar de ID, 
      // ya que el ID puede variar (temporal vs canónico de SQL)
      setAttendanceRecords(prev => prev.filter(r => {
        const isTargetStudent = (r.studentUsername === studentUsername || r.studentId === studentUsername);
        const isTargetDate = r.date === selectedDate;
        // Verificar si el registro pertenece al contexto actual (curso/sección seleccionados)
        // Usamos la misma lógica que isRecordInSelectedCourse pero inline para asegurar acceso al closure actual si fuera necesario,
        // aunque isRecordInSelectedCourse debería funcionar bien.
        const isInContext = isRecordInSelectedCourse(r);
        
        // Si es el registro del estudiante en esta fecha y curso, lo eliminamos (return false)
        return !(isTargetStudent && isTargetDate && isInContext);
      }));
      
      // Construir el ID canónico que se usó al guardar en SQL
      const studentsYear: any[] = LocalStorageManager.getStudentsForYear(selectedYear) || [];
      const byUsername = new Map<string, any>(studentsYear.map((s: any) => [String(s.username || '').toLowerCase(), s]));
      const student = byUsername.get(String(studentUsername || '').toLowerCase());
      const studentId = student?.id || studentUsername;
      
      // Obtener courseId y sectionId normalizados
      let { courseId, sectionId } = selectedCourseIds;
      if (isAdmin && selectedCourseId && selectedSectionId) {
        const course = availableCourses.find(c => c.id === selectedCourseId);
        const section = availableSections.find(s => s.id === selectedSectionId);
        if (course && section) {
          const normalizeName = (name: string) => 
            name.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '_');
          courseId = normalizeName(course.name);
          sectionId = section.name.toUpperCase();
        }
      }
      
      // Construir el ID canónico usando la misma lógica que saveAttendanceRecord
      const iso = `${selectedDate}T00:00:00.000Z`;
      const canonicalId = `att-${studentId}-${sectionId}-${toDayKey(iso)}`;
      
      // Eliminar de SQL/Firebase
      try {
        await deleteAttendanceByIdSQL(canonicalId, selectedYear);
        console.log('✅ Registro eliminado de la base de datos:', canonicalId);
      } catch (error) {
        console.error('❌ Error al eliminar registro de la base de datos:', error);
      }
      
      // Notificar cambios
      try { window.dispatchEvent(new CustomEvent('attendanceChanged', { detail: { action: 'delete', year: selectedYear } })); } catch {}
      try { window.dispatchEvent(new CustomEvent('updateDashboardCounts', { detail: { source: 'attendance', action: 'delete' } })); } catch {}
      
      return;
    }
    
    // Marcar con el nuevo estado
    const record: AttendanceRecord = {
      id: `${studentUsername}-${selectedDate}-${selectedSubject}-${selectedCourse}`,
      studentUsername,
      studentId: studentUsername,
      date: selectedDate,
      status,
      subject: selectedSubject,
      course: selectedCourse,
      courseId: null,
      sectionId: null,
      year: selectedYear,
      teacherUsername: user?.username || '',
      timestamp: new Date().toISOString()
    };

    saveAttendanceRecord(record);
    
    // Actualizar estado local
    setDailyAttendance(prev => ({
      ...prev,
      [studentUsername]: status
    }));
  };

  const markAllPresent = async () => {
    if (nonWorkingReason) return;
    
    // Preparar estado local
    const nextDaily: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    const recordsToSave: any[] = [];
    
    // Obtener IDs normalizados una sola vez
    let { courseId, sectionId } = selectedCourseIds;
    if (isAdmin && selectedCourseId && selectedSectionId) {
        const course = availableCourses.find(c => c.id === selectedCourseId);
        const section = availableSections.find(s => s.id === selectedSectionId);
        if (course && section) {
          const normalizeName = (name: string) => 
            name.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '_');
          courseId = normalizeName(course.name);
          sectionId = section.name.toUpperCase();
        }
    }

    const studentsYear: any[] = LocalStorageManager.getStudentsForYear(selectedYear) || [];
    const byUsername = new Map<string, any>(studentsYear.map((s: any) => [String(s.username || '').toLowerCase(), s]));

    // Set de IDs de estudiantes que estamos actualizando
    const updatedStudentIds = new Set<string>();

    filteredStudents.forEach(s => {
      nextDaily[s.username] = 'present';
      updatedStudentIds.add(s.username);
      if (s.id) updatedStudentIds.add(String(s.id));
      
      const student = byUsername.get(String(s.username || '').toLowerCase());
      const studentId = student?.id || s.username;
      const iso = `${selectedDate}T00:00:00.000Z`;
      
      const canonical = {
        id: `att-${studentId}-${sectionId}-${toDayKey(iso)}`,
        date: iso,
        courseId: courseId || null,
        sectionId: sectionId || null,
        studentId: String(studentId),
        status: 'present',
        comment: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        year: selectedYear
      };
      recordsToSave.push(canonical);
    });

    // Actualizar UI inmediatamente (Merge para no perder estados de estudiantes no filtrados)
    setDailyAttendance(prev => ({ ...prev, ...nextDaily }));
    
    // Guardar en BD en lote
    try {
        await upsertAttendanceSQL(recordsToSave);
        
        // Actualizar attendanceRecords en memoria
        setAttendanceRecords(prev => {
            // Crear nuevos registros para memoria
            const newRecords = recordsToSave.map(r => ({
                ...r,
                // Recuperar username para el registro en memoria
                studentUsername: filteredStudents.find(s => String(s.id) === r.studentId || s.username === r.studentId)?.username || r.studentId,
                subject: selectedSubject,
                course: selectedCourse,
                teacherUsername: user?.username || '',
                timestamp: r.updatedAt,
                // Asegurar que date sea string YYYY-MM-DD para consistencia
                date: selectedDate 
            }));
            
            // Filtrar los que no son de esta fecha/curso para mantenerlos
            // PERO solo eliminar los que estamos reemplazando (los de filteredStudents)
            const others = prev.filter(r => {
                const isTargetDate = r.date === selectedDate;
                const isInContext = isRecordInSelectedCourse(r);
                
                if (isTargetDate && isInContext) {
                    // Es un registro de este día y curso.
                    // ¿Debemos eliminarlo? Solo si corresponde a uno de los estudiantes que estamos actualizando.
                    const isBeingUpdated = updatedStudentIds.has(r.studentUsername || '') || updatedStudentIds.has(r.studentId || '');
                    return !isBeingUpdated; // Mantener si NO se está actualizando
                }
                return true; // Mantener registros de otros días/cursos
            });
            
            return [...others, ...newRecords];
        });

        // Eventos
        try { window.dispatchEvent(new CustomEvent('attendanceChanged', { detail: { action: 'saveBatch', year: selectedYear } })); } catch {}
        try { window.dispatchEvent(new CustomEvent('updateDashboardCounts', { detail: { source: 'attendance', action: 'saveBatch' } })); } catch {}

    } catch (error) {
        console.error('Error marking all present:', error);
    }
  };

  // Limpiar marcas del día: elimina registros persistidos y refresca el calendario
  const clearMarks = useCallback(async () => {
    try {
      // Para Admin, necesitamos obtener los IDs normalizados que se usaron al guardar
      let courseIdToDelete: string | null = null;
      let sectionIdToDelete: string | null = null;
      
      if (isAdmin && selectedCourseId && selectedSectionId) {
        // Buscar el curso y sección para obtener sus nombres normalizados
        const course = availableCourses.find(c => c.id === selectedCourseId);
        const section = availableSections.find(s => s.id === selectedSectionId);
        
        if (course && section) {
          // Normalizar los nombres para crear el ID que se usó al guardar
          // Ejemplo: "1ro Medio" -> "1ro_medio"
          const normalizeName = (name: string) => 
            name.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // quitar tildes
              .replace(/\s+/g, '_'); // espacios a guiones bajos
          
          courseIdToDelete = normalizeName(course.name);
          sectionIdToDelete = section.name.toUpperCase(); // Las secciones suelen ser "A", "B", etc.
          
          console.log('🔍 Mapeo UUID -> ID normalizado:', {
            courseUUID: selectedCourseId,
            courseName: course.name,
            courseIdNormalizado: courseIdToDelete,
            sectionUUID: selectedSectionId,
            sectionName: section.name,
            sectionIdNormalizado: sectionIdToDelete
          });
        } else {
          console.error('❌ No se encontró el curso o sección seleccionado');
          return;
        }
      } else {
        // Para profesor, usar los IDs del selectedCourseIds
        courseIdToDelete = selectedCourseIds.courseId;
        sectionIdToDelete = selectedCourseIds.sectionId;
      }
      
      console.log('🗑️ Limpiando marcas - Fecha:', selectedDate, ', Curso:', courseIdToDelete, ', Sección:', sectionIdToDelete);
      
      // Eliminar de Firebase/backend
      await deleteDaySQL(selectedYear, selectedDate, courseIdToDelete || null, sectionIdToDelete || null);
      
      // Limpiar estado local inmediatamente
      setDailyAttendance({});
      
      // Actualizar registros en memoria eliminando los del día
      setAttendanceRecords(prev => {
        return prev.filter(r => {
          // Mantener registros que NO sean del día/curso/sección a eliminar
          if (r.date !== selectedDate) return true;
          
          // Verificar si el registro pertenece al curso/sección a eliminar usando la función robusta
          if (isRecordInSelectedCourse(r)) {
             console.log('🗑️ Eliminando registro de memoria:', r.id);
             return false; // Eliminar este registro
          }
          
          return true; // Mantener todos los demás registros
        });
      });
      
      console.log('✅ Marcas eliminadas correctamente');
      
      try { window.dispatchEvent(new CustomEvent('attendanceChanged', { detail: { action: 'clear', year: selectedYear } })); } catch {}
      try { window.dispatchEvent(new CustomEvent('updateDashboardCounts', { detail: { source: 'attendance', action: 'clear' } })); } catch {}
      try { window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { source: 'attendance', action: 'clear' } })); } catch {}
    } catch (e) {
      console.error('Error clearing attendance marks (SQL):', e);
      setDailyAttendance({});
    }
  }, [deleteDaySQL, selectedYear, selectedDate, selectedCourseIds.courseId, selectedCourseIds.sectionId, isAdmin, selectedCourseId, selectedSectionId, selectedCourse, availableCourses, availableSections]);

  // Cargar asistencia del día seleccionado y marcar listo
  useEffect(() => {
  const dayRecords = getAttendanceForDate(selectedDate);
    const dayAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    
    dayRecords.forEach(record => {
      const username = record.studentUsername || record.studentId;
      if (username) dayAttendance[username] = record.status as 'present' | 'absent' | 'late' | 'excused';
    });
    
    setDailyAttendance(dayAttendance);
    setDayAttendanceReady(true);
  }, [selectedDate, selectedCourse, selectedSubject, attendanceRecords]);

  // Reiniciar ready de asistencia del día al cambiar fecha o curso
  useEffect(() => {
    setDayAttendanceReady(false);
  }, [selectedDate, selectedCourse]);

  // Asegurar un frame de pintura tras ready antes de cerrar overlay
  useEffect(() => {
    if (studentsReady && dayAttendanceReady) {
      const id = requestAnimationFrame(() => setPostReadyPainted(true));
      return () => cancelAnimationFrame(id);
    }
    setPostReadyPainted(false);
  }, [studentsReady, dayAttendanceReady]);

  // Detectar día no laborable según Calendario Admin
  useEffect(() => {
    setNonWorkingReason(getNonWorkingReason(selectedDate));
  }, [selectedDate]);

  // Escuchar cambios del calendario admin en otras pestañas/ventanas
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('admin-calendar-')) {
        setNonWorkingReason(getNonWorkingReason(selectedDate));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [selectedDate]);

  // Recargar asistencia cuando cambie el año o cuando haya eventos de importación/actualización
  useEffect(() => {
    loadAttendanceRecords();
    // Si es admin, refrescar catálogo de cursos/secciones al cambiar de año
    if (isAdmin) {
      loadAdminData();
    }
  }, [selectedYear]);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const debouncedLoad = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadAttendanceRecords();
      }, 500); // Esperar 500ms antes de recargar
    };
    
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      // Solo recargar si el cambio viene de otra pestaña (e.storageArea será diferente)
      if (e.key === 'smart-student-attendance' || /^smart-student-attendance-\d{4}$/.test(e.key)) {
        debouncedLoad();
      }
    };
    
    const onChanged = (e: CustomEvent) => {
      // Solo recargar si el evento NO viene de este mismo componente guardando
      if (e.detail?.action !== 'save') {
        debouncedLoad();
      }
    };
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('attendanceChanged', onChanged as any);
    window.addEventListener('sqlAttendanceUpdated', onChanged as any);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('attendanceChanged', onChanged as any);
      window.removeEventListener('sqlAttendanceUpdated', onChanged as any);
    };
  }, []);

  // Sincronizar mes/año del calendario con la fecha seleccionada del encabezado/input
  useEffect(() => {
  // Usar parseo local para evitar desfases por zona horaria
  const d = parseLocalDate(selectedDate);
    const m = d.getMonth();
    const y = d.getFullYear();
    if (m !== selectedMonth) setSelectedMonth(m);
    if (y !== selectedYear) {
      setSelectedYear(y);
      // Persistir admin-selected-year para sincronizar con otros módulos Admin
      try { localStorage.setItem('admin-selected-year', String(y)); } catch {}
    }
  }, [selectedDate]);

  // Cuando cambia el curso-sección seleccionado, recargar estudiantes de esa sección
  useEffect(() => {
    if (!selectedCourse) return;
    const { sectionId } = selectedCourseIds;
    if (sectionId) {
      setStudentsReady(false);
      loadStudentsForSection(sectionId);
    }
  }, [selectedCourse]);

  // Listeners según rol para refrescar catálogos
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (user?.role === 'teacher') {
        if (e.key === 'smart-student-teacher-assignments' || e.key === 'smart-student-admin-sections' || e.key === 'smart-student-admin-courses') {
          loadTeacherData();
        }
      } else if (user?.role === 'admin') {
        if (e.key === 'smart-student-admin-sections' || e.key === 'smart-student-admin-courses' || /^smart-student-.*-\d{4}$/.test(e.key || '')) {
          loadAdminData();
        }
      }
    };
    const handleTeacherCustom = () => { if (user?.role === 'teacher') loadTeacherData(); };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('teacherAssignmentsChanged', handleTeacherCustom as any);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('teacherAssignmentsChanged', handleTeacherCustom as any);
    };
  }, [user]);

  if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'student') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <UserX className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">{translate('accessRestricted')}</h2>
              <p className="text-gray-500">{translate('teachersOnly')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Animación del overlay inicial y condiciones de cierre
  useEffect(() => {
    if (!showInitialOverlay) return;
    if (overlayStartedAtRef.current == null) overlayStartedAtRef.current = Date.now();
    const tickMs = 120;
    let pct = 0;
    setOverlayProgress(10);
    const timer = setInterval(() => {
      // Avance lento hasta ~90% si aún no está listo
      pct = Math.min(90, pct + Math.random() * 4 + 1);
      setOverlayProgress(prev => (prev < pct ? pct : prev));
      const teacherReady = user?.role === 'teacher'
        ? (
            teacherDataReady &&
            sqlFetchDone &&
            // Si hay combos disponibles, requerir selección y estudiantes cargados; si no hay combos, permitir pasar
            (
              teacherCourseSections.length === 0 ||
              (!!selectedCourse && studentsReady && dayAttendanceReady && postReadyPainted)
            )
          )
        : false;
      const adminReady = user?.role === 'admin' ? (adminDataReady && sqlFetchDone) : false;
      const ready = teacherReady || adminReady;
      if (ready) {
        setOverlayProgress(100);
        clearInterval(timer);
        setTimeout(() => setShowInitialOverlay(false), 300);
      }
    }, tickMs);
    return () => clearInterval(timer);
  }, [showInitialOverlay, user?.role, teacherDataReady, adminDataReady, sqlFetchDone, selectedCourse, teacherCourseSections.length, studentsReady, dayAttendanceReady, postReadyPainted]);

  // --- Memos y Helpers de UI ---

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(s => 
      (s.displayName || '').toLowerCase().includes(lower) ||
      (s.username || '').toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);

  const adminAggregates = useMemo(() => {
    // Calcular totales para el día seleccionado (solo visualización rápida)
    const dayCounts = { present: 0, absent: 0, late: 0, excused: 0 };
    // Usar dailyAttendance para reflejar cambios en tiempo real
    Object.values(dailyAttendance).forEach(status => {
      if (status in dayCounts) dayCounts[status]++;
    });
    
    return {
      totalStudents: filteredStudents.length,
      dayCounts
    };
  }, [dailyAttendance, filteredStudents]);

  const semesterStats = useMemo(() => {
    if (filteredStudents.length === 0) return { s1: 0, s2: 0, general: 0 };
    
    // Calcular promedio general de asistencia de los estudiantes mostrados
    let sumRates = 0;
    let count = 0;
    
    filteredStudents.forEach(s => {
      const records = attendanceRecords.filter(r => 
        (r.studentUsername === s.username || r.studentId === s.username) &&
        r.year === selectedYear
      );
      const total = records.length;
      if (total > 0) {
        const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
        sumRates += (present / total);
        count++;
      }
    });
    
    const avg = count > 0 ? Math.round((sumRates / count) * 100) : 0;
    return { s1: avg, s2: avg, general: avg };
  }, [filteredStudents, attendanceRecords, selectedYear]);

  const generateCalendarDays = useCallback(() => {
    const d = new Date(selectedYear, selectedMonth, 1);
    const days: Date[] = [];
    while (d.getMonth() === selectedMonth) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [selectedYear, selectedMonth]);

  const getDateAttendanceStats = (date: string) => {
    // Estadísticas para el calendario (puntos de colores)
    // Filtrar registros de esa fecha y del curso seleccionado (si aplica)
    const records = attendanceRecords.filter(r => 
      r.date === date && 
      isRecordInSelectedCourse(r)
    );
    
    const total = records.length;
    if (total === 0) return { percentage: 0, present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    
    const effectivePresent = present + late;
    
    return {
      percentage: Math.round((effectivePresent / total) * 100),
      present,
      absent,
      late,
      excused,
      total
    };
  };

  const getStudentAttendanceStats = (username: string) => {
    const records = attendanceRecords.filter(r => 
      (r.studentUsername === username || r.studentId === username) &&
      r.year === selectedYear
    );
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const total = present + absent + late + excused;
    
    return {
      present,
      absent,
      late,
      excused,
      total
    };
  };

  const getWorkingAttendanceRate = (username: string) => {
    const stats = getStudentAttendanceStats(username);
    const total = stats.present + stats.absent + stats.late + stats.excused;
    if (total === 0) return 100; // Por defecto 100% si no hay registros
    return Math.round(((stats.present + stats.late) / total) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {showInitialOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/70 backdrop-blur-sm">
          <div className="w-11/12 max-w-md rounded-xl border bg-white/95 dark:bg-gray-900/95 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('preparingAttendance', language === 'es' ? 'Preparando Asistencia' : 'Preparing Attendance')}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('loadingInitialData', language === 'es' ? 'Cargando datos iniciales y sincronizando registros...' : 'Loading initial data and syncing records...')}
            </p>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${overlayProgress}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">{Math.round(overlayProgress)}%</div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-indigo-100 to-blue-50 dark:from-indigo-900/20 dark:via-indigo-800/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <UserCheck className="inline h-7 w-7 md:h-8 md:w-8 mr-2 text-indigo-600" />
            {translate('attendanceManagement') || 'Gestión de Asistencia'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {translate('attendanceControl') || 'Registra y visualiza la asistencia de tus estudiantes.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-indigo-600 text-white">{format(parseLocalDate(selectedDate), 'dd-MM-yyyy', { locale: dateLocale })}</Badge>
            {selectedCourse && (
              <Badge variant="outline" className="border-indigo-300 text-indigo-700 dark:text-indigo-300">
                {teacherCourseSections.find(cs => cs.id === selectedCourse)?.label || translate('course')}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Filtros principales */}
        {isAdmin ? (
          <div className="flex flex-wrap gap-2 items-center">
            {/* Año */}
            <Select value={String(selectedYear)} onValueChange={(v) => {
              const newYear = parseInt(v, 10);
              applyYearChange(newYear);
            }}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder={translate('calendarYear') || 'Año'} />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Nivel */}
            <Select value={selectedLevel} onValueChange={(v) => {
              setSelectedLevel(v);
              // Al cambiar nivel, reset curso y sección
              setSelectedCourseId('');
              setSelectedSectionId('');
              setSelectedCourse('');
            }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={translate('level') || 'Nivel'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{translate('all') || 'Todos'}</SelectItem>
                {LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Curso */}
            <Select 
              value={selectedCourseId} 
              onValueChange={(v) => {
              setSelectedCourseId(v);
              // Reset sección y selección compuesta
              setSelectedSectionId('');
              setSelectedCourse('');
              }}
              disabled={!selectedLevel || selectedLevel === '__all__'}
            >
              <SelectTrigger className="w-48" disabled={!selectedLevel || selectedLevel === '__all__'}>
                <SelectValue placeholder={translate('course') || 'Curso'} />
              </SelectTrigger>
              <SelectContent>
                {(availableCourses
                  .filter(c => {
                    if (!selectedLevel || selectedLevel === '__all__') return false;
                    return normalizeLevel(c.level) === selectedLevel;
                  })
                ).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sección */}
            <Select 
              value={selectedSectionId} 
              onValueChange={(v) => {
              setSelectedSectionId(v);
              if (selectedCourseId && v) {
                const composite = `${selectedCourseId}-${v}`;
                setSelectedCourse(composite);
                // Cargar estudiantes
                loadStudentsForSection(v);
              } else {
                setSelectedCourse('');
                setStudents([]);
              }
              }}
              disabled={!selectedCourseId}
            >
              <SelectTrigger className="w-48" disabled={!selectedCourseId}>
                <SelectValue placeholder={translate('section') || (language === 'es' ? 'Sección' : 'Section')} />
              </SelectTrigger>
              <SelectContent>
                {availableSections
                  .filter(s => selectedCourseId ? s.courseId === selectedCourseId : false)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCourse} onValueChange={(v) => setSelectedCourse(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={translate('attendanceSelectCourse') || 'Curso + Sección'} />
              </SelectTrigger>
              <SelectContent>
                {teacherCourseSections.map(cs => (
                  <SelectItem
                    key={cs.id}
                    value={cs.id}
                    className="hover:!bg-transparent focus:!bg-transparent data-[highlighted]:!bg-transparent data-[state=checked]:!bg-transparent"
                  >
                    {cs.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { id: 'dashboard', label: translate('dashboardTab'), icon: BarChart3 },
          { id: 'calendar', label: translate('calendarTab'), icon: Calendar },
          { id: 'students', label: translate('studentsTab'), icon: Users }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={selectedView === tab.id ? 'default' : 'ghost'}
            className={cn(
              "flex items-center gap-2 hover:bg-indigo-600 hover:text-white",
              selectedView === tab.id && "bg-indigo-600 text-white hover:bg-indigo-600"
            )}
            onClick={() => setSelectedView(tab.id as any)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Dashboard View */}
      {selectedView === 'dashboard' && (
        <div className="space-y-6">
          {/* Tarjetas de resumen y Promedios */}
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Tarjetas de contadores diarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
              {[
                { 
                  title: translate('attendanceTotalStudents'), 
                  value: isAdmin && adminAggregates ? adminAggregates.totalStudents : filteredStudents.length, 
                  icon: Users, 
                  color: 'blue' 
                },
                { 
                  title: translate('presentToday'), 
                  value: isAdmin && adminAggregates 
                    ? adminAggregates.dayCounts.present 
                    : Object.values(dailyAttendance).filter(status => status === 'present').length, 
                  icon: UserCheck, 
                  color: 'green' 
                },
                { 
                  title: translate('absentToday'), 
                  value: isAdmin && adminAggregates 
                    ? adminAggregates.dayCounts.absent 
                    : Object.values(dailyAttendance).filter(status => status === 'absent').length, 
                  icon: UserX, 
                  color: 'red' 
                },
                { 
                  title: translate('lateToday'), 
                  value: isAdmin && adminAggregates 
                    ? adminAggregates.dayCounts.late 
                    : Object.values(dailyAttendance).filter(status => status === 'late').length, 
                  icon: Clock, 
                  color: 'yellow' 
                }
              ].map((stat, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-full",
                        stat.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                        stat.color === 'green' && "bg-green-100 dark:bg-green-900/30",
                        stat.color === 'red' && "bg-red-100 dark:bg-red-900/30",
                        stat.color === 'yellow' && "bg-yellow-100 dark:bg-yellow-900/30"
                      )}>
                        <stat.icon className={cn(
                          "h-6 w-6",
                          stat.color === 'blue' && "text-blue-600 dark:text-blue-300",
                          stat.color === 'green' && "text-green-600 dark:text-green-300",
                          stat.color === 'red' && "text-red-600 dark:text-red-300",
                          stat.color === 'yellow' && "text-yellow-600 dark:text-yellow-300"
                        )} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cuadro de Promedios Semestrales */}
            <Card className="w-full xl:w-72 flex-shrink-0 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {translate('attendanceAverage') || 'Promedio Asistencia'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600 dark:text-gray-400">{translate('semester1') || '1er Semestre'}</span>
                   <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{semesterStats.s1}%</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600 dark:text-gray-400">{translate('semester2') || '2do Semestre'}</span>
                   <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{semesterStats.s2}%</span>
                 </div>
                 <div className="pt-3 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                   <span className="font-medium text-indigo-900 dark:text-indigo-200">{translate('generalAverage') || 'Prom. General'}</span>
                   <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{semesterStats.general}%</span>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Asistencia del día */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  {translate('attendanceDate') || 'Asistencia del día'} - {format(parseLocalDate(selectedDate), 'dd-MM-yyyy', { locale: dateLocale })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-transparent"
                    onClick={() => {
                      const d = parseLocalDate(selectedDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(toLocalDateString(d));
                    }}
                    aria-label={translate('prevDay') || 'Día anterior'}
                    title={translate('prevDay') || 'Día anterior'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <DateInput value={selectedDate} onChange={(v) => setSelectedDate(v)} locale={dateLocale} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-transparent"
                    onClick={() => {
                      const d = parseLocalDate(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(toLocalDateString(d));
                    }}
                    aria-label={translate('nextDay') || 'Día siguiente'}
                    title={translate('nextDay') || 'Día siguiente'}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {nonWorkingReason && (
                <div className="mb-4 p-3 rounded-md border text-sm bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 text-amber-800 dark:text-amber-200">
                  {nonWorkingReason === 'holiday' && (translate('noAttendanceHoliday') || 'No se requiere asistencia: feriado')}
                  {nonWorkingReason === 'summer' && (translate('noAttendanceSummer') || 'No se requiere asistencia: vacaciones de verano')}
                  {nonWorkingReason === 'winter' && (translate('noAttendanceWinter') || 'No se requiere asistencia: vacaciones de invierno')}
                  {nonWorkingReason === 'weekend' && (translate('noAttendanceWeekend') || 'No se requiere asistencia: fin de semana')}
                </div>
              )}
              {/* Acciones rápidas (ocultar para estudiantes) */}
              {user?.role !== 'student' && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Button size="sm" variant="secondary" disabled={!!nonWorkingReason} className="hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50" onClick={() => {
                  const next: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
                  filteredStudents.forEach(s => { next[s.username] = 'present'; });
                  setDailyAttendance(next);
                  filteredStudents.forEach(s => markAttendance(s.username, 'present'));
                }}>{translate('markAllPresent') || 'Marcar todos presente'}</Button>
                <Button size="sm" variant="outline" className="hover:bg-indigo-600 hover:text-white transition-colors" onClick={clearMarks}>{translate('clearMarks') || 'Limpiar marcas'}</Button>
              </div>
              )}
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">{translate('noStudentsSelected') || 'No hay estudiantes para la sección seleccionada.'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map(student => {
                    const currentStatus = dailyAttendance[student.username];
                    
                    return (
                      <div key={student.username} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-700">
                              {student.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.displayName}</p>
                            <p className="text-sm text-gray-500">{student.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {currentStatus && (
                            <Badge className={statusColors[currentStatus]}>
                              {statusLabels[currentStatus]}
                            </Badge>
                          )}
                          
                          {/* Controles de asistencia (ocultar para estudiantes) */}
                          {user?.role !== 'student' && (
                          <div className="flex gap-1">
            {Object.entries(statusLabels).map(([status, label]) => {
                              const Icon = statusIcons[status as keyof typeof statusIcons];
                              return (
                <Button
                                  key={status}
              disabled={!!nonWorkingReason}
                                  size="sm"
                                  variant={currentStatus === status ? "default" : "outline"}
                                  className={cn(
                  "p-2 transition-colors",
                  // Mantener el mismo color al hacer hover (incoloro)
                  currentStatus === status && status === 'present' && "bg-green-600 hover:bg-green-600",
                  currentStatus === status && status === 'absent' && "bg-red-600 hover:bg-red-600",
                  currentStatus === status && status === 'late' && "bg-yellow-600 hover:bg-yellow-600",
                  currentStatus === status && status === 'excused' && "bg-blue-600 hover:bg-blue-600",
                  // Para estados no seleccionados: hover con color indigo característico
      currentStatus !== status && "hover:bg-indigo-600 hover:text-white",
      nonWorkingReason && "opacity-50 cursor-not-allowed"
                                  )}
                                  onClick={() => markAttendance(student.username, status as any)}
                                  title={label}
                                >
                                  <Icon className="h-4 w-4" />
                                </Button>
                              );
                            })}
                          </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {translate('attendanceCalendarTitle') || 'Calendario de Asistencia'} - {getMonthName(selectedMonth, selectedYear)} {selectedYear}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-transparent"
                    onClick={() => {
                      // Ir al mes anterior manteniendo el día en rango
                      // Evitar desfases: parsear YYYY-MM-DD en local time
                      const current = parseLocalDate(selectedDate);
                      let newMonth = selectedMonth - 1;
                      let newYear = selectedYear;
                      if (newMonth < 0) { newMonth = 11; newYear = selectedYear - 1; }
                      const day = current.getDate();
                      const maxDay = new Date(newYear, newMonth + 1, 0).getDate();
                      const newDate = new Date(newYear, newMonth, Math.min(day, maxDay));
                      setSelectedMonth(newMonth);
                      setSelectedYear(newYear);
                      try { localStorage.setItem('admin-selected-year', String(newYear)); } catch {}
                      setSelectedDate(toLocalDateString(newDate));
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-transparent"
                    onClick={() => {
                      // Ir al mes siguiente manteniendo el día en rango
                      // Evitar desfases: parsear YYYY-MM-DD en local time
                      const current = parseLocalDate(selectedDate);
                      let newMonth = selectedMonth + 1;
                      let newYear = selectedYear;
                      if (newMonth > 11) { newMonth = 0; newYear = selectedYear + 1; }
                      const day = current.getDate();
                      const maxDay = new Date(newYear, newMonth + 1, 0).getDate();
                      const newDate = new Date(newYear, newMonth, Math.min(day, maxDay));
                      setSelectedMonth(newMonth);
                      setSelectedYear(newYear);
                      try { localStorage.setItem('admin-selected-year', String(newYear)); } catch {}
                      setSelectedDate(toLocalDateString(newDate));
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {[translate('monShort')||'Lun', translate('tueShort')||'Mar', translate('wedShort')||'Mié', translate('thuShort')||'Jue', translate('friShort')||'Vie', translate('satShort')||'Sáb', translate('sunShort')||'Dom'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === selectedMonth;
                  const isToday = date.toDateString() === new Date().toDateString();
                  const stats = getDateAttendanceStats(toLocalDateString(date));
                  const hasData = stats.total > 0;
                  const reason = getNonWorkingReason(toLocalDateString(date));
                  const isBlocked = !!reason;
                  const hiddenComment = reason === 'holiday'
                    ? (translate('noAttendanceHoliday') || 'No se requiere asistencia: feriado')
                    : reason === 'summer'
                      ? (translate('noAttendanceSummer') || 'No se requiere asistencia: vacaciones de verano')
                      : reason === 'winter'
                        ? (translate('noAttendanceWinter') || 'No se requiere asistencia: vacaciones de invierno')
                        : reason === 'weekend'
                          ? (translate('noAttendanceWeekend') || 'No se requiere asistencia: fin de semana')
                          : '';
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-2 min-h-16 border rounded transition-colors",
                        isBlocked ? "bg-gray-100 dark:bg-gray-800/60 opacity-60 cursor-not-allowed" : "cursor-pointer",
                        isCurrentMonth ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/60",
                        isToday && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
                        hasData && "border-indigo-200 dark:border-indigo-700"
                      )}
                      onClick={() => { if (!isBlocked) setSelectedDate(toLocalDateString(date)); }}
                      title={hiddenComment}
                    >
                      <div className={cn(
                        "text-sm font-medium",
                        isCurrentMonth ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500",
                        isToday && "text-blue-600 dark:text-blue-300"
                      )}>
                        {date.getDate()}
                      </div>
                      {hasData && (
                        <div className="mt-1 space-y-1">
                          <div className="flex gap-1">
                            {stats.present > 0 && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title={`${stats.present} presente(s)`} />
                            )}
                            {stats.absent > 0 && (
                              <div className="w-2 h-2 bg-red-500 rounded-full" title={`${stats.absent} ausente(s)`} />
                            )}
                            {stats.late > 0 && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" title={`${stats.late} tarde(s)`} />
                            )}
                            {stats.excused > 0 && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${stats.excused} justificado(s)`} />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.total} {translate('records') || 'registros'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students View */}
      {selectedView === 'students' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {translate('studentTracking') || 'Seguimiento por estudiante'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={translate('searchStudent') || 'Buscar estudiante'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map(student => {
                  const stats = getStudentAttendanceStats(student.username);
                  const attendanceRate = getWorkingAttendanceRate(student.username);
                  
                  return (
                    <div key={student.username} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-700">
                              {student.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{student.displayName}</h3>
                            <p className="text-sm text-gray-500">{student.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{attendanceRate}%</div>
                          <div className="text-sm text-gray-500">{translate('attendanceRate') || 'Tasa de asistencia'}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(statusLabels).map(([status, label]) => {
                          const count = stats[status as keyof AttendanceStats] as number;
                          const Icon = statusIcons[status as keyof typeof statusIcons];
                          
                          return (
                            <div key={status} className="text-center">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1",
                                status === 'present' && "bg-green-100",
                                status === 'absent' && "bg-red-100",
                                status === 'late' && "bg-yellow-100",
                                status === 'excused' && "bg-blue-100"
                              )}>
                                <Icon className={cn(
                                  "h-5 w-5",
                                  status === 'present' && "text-green-600",
                                  status === 'absent' && "text-red-600",
                                  status === 'late' && "text-yellow-600",
                                  status === 'excused' && "text-blue-600"
                                )} />
                              </div>
                              <div className="font-semibold">{count}</div>
                              <div className="text-xs text-gray-500">{label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      
    </div>
  );
}


// Selector de fecha con popover y calendario (localizado) que emite YYYY-MM-DD y muestra dd-MM-yyyy
function DateInput({ value, onChange, locale }: { value: string; onChange: (v: string) => void; locale: Locale }) {
  // Parseo local seguro: evita que YYYY-MM-DD se interprete como UTC y reste un día en algunas zonas horarias
  const parsed = value ? parseLocalDate(value) : undefined;
  const selected = parsed && !isNaN(parsed.getTime()) ? parsed : undefined;
  const label = selected ? format(selected, 'dd-MM-yyyy', { locale }) : 'dd-mm-yyyy';
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
          <CalendarDays className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <UICalendar
          mode="single"
          selected={selected}
          locale={locale}
          onSelect={(d) => d && onChange(toIso(d))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}


