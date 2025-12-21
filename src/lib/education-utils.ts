/**
 * Utilidades para generar códigos únicos del sistema educativo
 */

import { Course, Section } from '@/types/education';

export class EducationCodeGenerator {
  private static generateCode(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}-${timestamp}${random}`.toUpperCase().substring(0, 12);
  }

  static generateCourseCode(): string {
    return this.generateCode('CRS');
  }

  static generateSectionCode(): string {
    return this.generateCode('SEC');
  }

  static generateSubjectCode(): string {
    return this.generateCode('SUB');
  }

  static generateStudentCode(): string {
    return this.generateCode('STU');
  }

  static generateTeacherCode(): string {
    return this.generateCode('TCH');
  }

  static generateAdminCode(): string {
    return this.generateCode('ADM');
  }

  static validateCode(code: string, expectedPrefix: string): boolean {
    const regex = new RegExp(`^${expectedPrefix}-[A-Z0-9]{5,8}$`);
    return regex.test(code);
  }
}

/**
 * Utilidades para validación de formularios
 */
export class FormValidation {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 4) {
      errors.push('La contraseña debe tener al menos 4 caracteres');
    }

    // Removed uppercase requirement
    // Removed lowercase requirement  
    // Removed number requirement for more flexible passwords

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateName(name: string): boolean {
    return name.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
  }
}

/**
 * Utilidades para manejo de datos locales
 */
export class LocalStorageManager {
  private static readonly KEYS = {
    COURSES: 'smart-student-courses',
    SECTIONS: 'smart-student-sections',
    SUBJECTS: 'smart-student-subjects',
    STUDENTS: 'smart-student-students',
    TEACHERS: 'smart-student-teachers',
    ASSIGNMENTS: 'smart-student-assignments',
    TEST_GRADES: 'smart-student-test-grades',
    ATTENDANCE: 'smart-student-attendance',
    SUBMISSIONS: 'smart-student-submissions',
    CONFIG: 'smart-student-config',
    TEACHER_ASSIGNMENTS: 'smart-student-teacher-assignments',
    STUDENT_ASSIGNMENTS: 'smart-student-student-assignments'
  };

  // Large item storage (chunking) to avoid localStorage quota errors
  private static readonly CHUNK_SUFFIX = '__part_';
  private static readonly CHUNKS_META_SUFFIX = '__parts';
  private static readonly STORAGE_WHERE_SUFFIX = '__where'; // 'local' | 'session'
  private static readonly CHUNK_SIZE = 500_000; // ~500k chars per chunk (~1MB UTF-16)

  private static removeLargeItem(baseKey: string) {
    // Remove from localStorage
    try { localStorage.removeItem(baseKey); } catch {}
    try {
      const partsStr = localStorage.getItem(baseKey + this.CHUNKS_META_SUFFIX);
      const total = partsStr ? parseInt(partsStr, 10) : 0;
      for (let i = 0; i < total; i++) {
        try { localStorage.removeItem(baseKey + this.CHUNK_SUFFIX + i); } catch {}
      }
      if (partsStr) localStorage.removeItem(baseKey + this.CHUNKS_META_SUFFIX);
      try { localStorage.removeItem(baseKey + this.STORAGE_WHERE_SUFFIX); } catch {}
    } catch {}
    // Remove from sessionStorage as well
    try { sessionStorage.removeItem(baseKey); } catch {}
    try {
      const partsStr = sessionStorage.getItem(baseKey + this.CHUNKS_META_SUFFIX);
      const total = partsStr ? parseInt(partsStr, 10) : 0;
      for (let i = 0; i < total; i++) {
        try { sessionStorage.removeItem(baseKey + this.CHUNK_SUFFIX + i); } catch {}
      }
      if (partsStr) sessionStorage.removeItem(baseKey + this.CHUNKS_META_SUFFIX);
      try { sessionStorage.removeItem(baseKey + this.STORAGE_WHERE_SUFFIX); } catch {}
    } catch {}
  }

  // Attempt to write using chunked strategy to the provided storage area.
  private static tryWriteChunked(storage: Storage, baseKey: string, value: string, initialSize: number): boolean {
    // Cleanup any previous entries in this storage
    try {
      storage.removeItem(baseKey);
      const partsStr = storage.getItem(baseKey + this.CHUNKS_META_SUFFIX);
      const total = partsStr ? parseInt(partsStr, 10) : 0;
      for (let i = 0; i < total; i++) {
        try { storage.removeItem(baseKey + this.CHUNK_SUFFIX + i); } catch {}
      }
      if (partsStr) storage.removeItem(baseKey + this.CHUNKS_META_SUFFIX);
    } catch {}

    let size = Math.max(8_000, Math.min(initialSize, this.CHUNK_SIZE));
    for (let attempts = 0; attempts < 6; attempts++) { // reduce up to ~6 times
      const total = Math.ceil(value.length / size);
      try {
        for (let i = 0; i < total; i++) {
          const slice = value.slice(i * size, (i + 1) * size);
          storage.setItem(baseKey + this.CHUNK_SUFFIX + i, slice);
        }
        storage.setItem(baseKey + this.CHUNKS_META_SUFFIX, String(total));
        // mark where it's stored if using session
        try {
          if (storage === sessionStorage) localStorage.setItem(baseKey + this.STORAGE_WHERE_SUFFIX, 'session');
          else localStorage.setItem(baseKey + this.STORAGE_WHERE_SUFFIX, 'local');
        } catch {}
        return true;
      } catch (e) {
        // Cleanup partial writes
        try {
          const partsStr = storage.getItem(baseKey + this.CHUNKS_META_SUFFIX);
          const t = partsStr ? parseInt(partsStr, 10) : total;
          for (let i = 0; i < t; i++) storage.removeItem(baseKey + this.CHUNK_SUFFIX + i);
          storage.removeItem(baseKey + this.CHUNKS_META_SUFFIX);
        } catch {}
        // Reduce chunk size and retry
        size = Math.max(4_000, Math.floor(size / 2));
      }
    }
    return false;
  }

  private static setLargeItem(baseKey: string, value: string) {
    // Try simple set first
    try {
      localStorage.setItem(baseKey, value);
      // Clean any previous chunked remnants
      try { localStorage.removeItem(baseKey + this.CHUNKS_META_SUFFIX); } catch {}
      let idx = 0;
      while (localStorage.getItem(baseKey + this.CHUNK_SUFFIX + idx) !== null) {
        try { localStorage.removeItem(baseKey + this.CHUNK_SUFFIX + idx); } catch {}
        idx++;
      }
      try { localStorage.setItem(baseKey + this.STORAGE_WHERE_SUFFIX, 'local'); } catch {}
      return;
    } catch (e) {
      // Fallback to chunked write
    }
    // Remove potential previous full value and chunks
    this.removeLargeItem(baseKey);
    // Try chunked into localStorage with dynamic chunk size
    const okLocal = this.tryWriteChunked(localStorage, baseKey, value, this.CHUNK_SIZE);
    if (okLocal) return;
    // Try sessionStorage as a last resort (same keys)
    const okSession = this.tryWriteChunked(sessionStorage, baseKey, value, this.CHUNK_SIZE / 2);
    if (okSession) return;
    // If all failed, cleanup and throw
    this.removeLargeItem(baseKey);
    throw new Error('Storage quota exceeded for key ' + baseKey);
  }

  // Variant: prefer writing to sessionStorage first to save localStorage quota
  private static setLargeItemPreferSession(baseKey: string, value: string) {
    // Try chunked into sessionStorage first
    this.removeLargeItem(baseKey);
    const okSession = this.tryWriteChunked(sessionStorage, baseKey, value, this.CHUNK_SIZE / 2);
    if (okSession) return;
    // Fallback to localStorage
    const okLocal = this.tryWriteChunked(localStorage, baseKey, value, this.CHUNK_SIZE);
    if (okLocal) return;
    // Final attempt: plain set (unlikely to help but for completeness)
    try { localStorage.setItem(baseKey, value); return; } catch {}
    this.removeLargeItem(baseKey);
    throw new Error('Storage quota exceeded for key ' + baseKey + ' (preferSession)');
  }

  private static getLargeItem(baseKey: string): string | null {
    // Prefer where it's marked
    const where = localStorage.getItem(baseKey + this.STORAGE_WHERE_SUFFIX);
    const readFrom = (storage: Storage): string | null => {
      const direct = storage.getItem(baseKey);
      if (direct !== null) return direct;
      const partsStr = storage.getItem(baseKey + this.CHUNKS_META_SUFFIX);
      const total = partsStr ? parseInt(partsStr, 10) : 0;
      if (!total || isNaN(total) || total <= 0) return null;
      let out = '';
      for (let i = 0; i < total; i++) {
        const part = storage.getItem(baseKey + this.CHUNK_SUFFIX + i) || '';
        out += part;
      }
      return out;
    };
    if (where === 'session') {
      const v = readFrom(sessionStorage);
      if (v !== null) return v;
    }
    const vLocal = readFrom(localStorage);
    if (vLocal !== null) return vLocal;
    // Fallback: try session if where not set but exists there
    const vSession = readFrom(sessionStorage);
    return vSession;
  }

  // Year-key helpers
  private static yearToString(year?: number): string | null {
    if (!year || !Number.isFinite(year)) return null;
    return String(year);
  }

  private static keyWithYear(baseKey: string, year?: number): string {
    const y = this.yearToString(year);
    return y ? `${baseKey}-${y}` : baseKey;
  }

  // Public key builder for external listeners (e.g., window.storage events)
  static keyForTestGrades(year: number): string {
    return this.keyWithYear(this.KEYS.TEST_GRADES, year);
  }

  // Discover existing years from known keys
  static listYears(): number[] {
    const years = new Set<number>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i) || '';
  // Incluir todas las colecciones segmentadas por año (cursos, secciones, asignaturas, usuarios, asistencia, calificaciones, resúmenes)
  const m = key.match(/smart-student-(?:courses|sections|subjects|students|teachers|teacher-assignments|student-assignments|attendance|attendance-summary|test-grades)-(\d{4})$/);
        if (m) {
          const y = parseInt(m[1], 10);
          if (y >= 2000 && y <= 2100) years.add(y);
        }
      }
    } catch {}
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }

  // Bootstrap a year: optionally clone structure from another year
  static bootstrapYear(targetYear: number, fromYear?: number) {
    const dst = (k: string) => this.keyWithYear(k, targetYear);
    const src = (k: string) => this.keyWithYear(k, fromYear);

    const cloneArray = (key: string, mapFn?: (x: any) => any) => {
      const base = fromYear ? JSON.parse(localStorage.getItem(src(key)) || '[]') : [];
      const data = mapFn ? base.map(mapFn) : base;
      localStorage.setItem(dst(key), JSON.stringify(data));
    };

    // Clone courses/sections/subjects from previous year if provided; reset counters
    cloneArray(this.KEYS.COURSES);
    cloneArray(this.KEYS.SECTIONS, (s: any) => ({ ...s, studentCount: 0, updatedAt: new Date() }));
    cloneArray(this.KEYS.SUBJECTS);

    // Empty collections for users and assignments (will be loaded per año)
    localStorage.setItem(dst(this.KEYS.STUDENTS), '[]');
    localStorage.setItem(dst(this.KEYS.TEACHERS), '[]');
    localStorage.setItem(dst(this.KEYS.TEACHER_ASSIGNMENTS), '[]');
    localStorage.setItem(dst(this.KEYS.STUDENT_ASSIGNMENTS), '[]');

    return { success: true, year: targetYear };
  }

  static getCourses() {
    return JSON.parse(localStorage.getItem(this.KEYS.COURSES) || '[]');
  }

  static setCourses(courses: any[]) {
    localStorage.setItem(this.KEYS.COURSES, JSON.stringify(courses));
  }

  static getCoursesForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.COURSES, year);
    // fallback: if not found, try non-suffixed
    const raw = localStorage.getItem(key) ?? localStorage.getItem(this.KEYS.COURSES);
    return JSON.parse(raw || '[]');
  }

  static setCoursesForYear(year: number, courses: any[]) {
    const key = this.keyWithYear(this.KEYS.COURSES, year);
    localStorage.setItem(key, JSON.stringify(courses));
  }

  static getSections() {
    return JSON.parse(localStorage.getItem(this.KEYS.SECTIONS) || '[]');
  }

  static setSections(sections: any[]) {
    localStorage.setItem(this.KEYS.SECTIONS, JSON.stringify(sections));
  }

  static getSectionsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.SECTIONS, year);
    const raw = localStorage.getItem(key) ?? localStorage.getItem(this.KEYS.SECTIONS);
    return JSON.parse(raw || '[]');
  }

  static setSectionsForYear(year: number, sections: any[]) {
    const key = this.keyWithYear(this.KEYS.SECTIONS, year);
    localStorage.setItem(key, JSON.stringify(sections));
  }

  static getSubjects() {
    return JSON.parse(localStorage.getItem(this.KEYS.SUBJECTS) || '[]');
  }

  static setSubjects(subjects: any[]) {
    localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  static getSubjectsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.SUBJECTS, year);
    const raw = localStorage.getItem(key) ?? localStorage.getItem(this.KEYS.SUBJECTS);
    return JSON.parse(raw || '[]');
  }

  static setSubjectsForYear(year: number, subjects: any[]) {
    const key = this.keyWithYear(this.KEYS.SUBJECTS, year);
    localStorage.setItem(key, JSON.stringify(subjects));
  }

  static getStudents() {
    const raw = this.getLargeItem(this.KEYS.STUDENTS);
    return JSON.parse(raw || '[]');
  }

  static setStudents(students: any[]) {
    const value = JSON.stringify(students);
    this.setLargeItem(this.KEYS.STUDENTS, value);
  }

  static getStudentsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.STUDENTS, year);
  const raw = this.getLargeItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && parsed.fmt === 'students-compact-v1' && Array.isArray(parsed.fields) && Array.isArray(parsed.rows)) {
        const idx: Record<string, number> = {};
        parsed.fields.forEach((f: string, i: number) => { idx[f] = i; });
        return parsed.rows.map((r: any[]) => ({
          id: r[idx.id],
          username: r[idx.username],
          rut: r[idx.rut],
          name: r[idx.name],
          displayName: r[idx.displayName],
          email: r[idx.email],
          courseId: r[idx.courseId],
          sectionId: r[idx.sectionId],
          role: r[idx.role] || 'student',
        }));
      }
      return parsed || [];
    } catch {
      return [];
    }
  }

  static setStudentsForYear(year: number, students: any[]) {
    const key = this.keyWithYear(this.KEYS.STUDENTS, year);
    try {
      const value = JSON.stringify(students);
      this.setLargeItem(key, value);
      return;
    } catch (e) {
      // Fallback compacto
      const fields = ['id','username','rut','name','displayName','email','courseId','sectionId','role'];
      const rows = (students || []).map(s => [
        s.id ?? '',
        s.username ?? '',
        s.rut ?? '',
        s.name ?? '',
        s.displayName ?? '',
        s.email ?? '',
        s.courseId ?? '',
        s.sectionId ?? '',
        s.role ?? 'student',
      ]);
      const compact = { fmt: 'students-compact-v1', fields, rows };
      const value2 = JSON.stringify(compact);
      this.setLargeItem(key, value2);
    }
  }

  static getTeachers() {
    return JSON.parse(localStorage.getItem(this.KEYS.TEACHERS) || '[]');
  }

  static setTeachers(teachers: any[]) {
    localStorage.setItem(this.KEYS.TEACHERS, JSON.stringify(teachers));
  }

  static getTeachersForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.TEACHERS, year);
  const raw = this.getLargeItem(key) ?? localStorage.getItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && parsed.fmt === 'teachers-compact-v1' && Array.isArray(parsed.fields) && Array.isArray(parsed.rows)) {
        const idx: Record<string, number> = {};
        parsed.fields.forEach((f: string, i: number) => { idx[f] = i; });
        return parsed.rows.map((r: any[]) => ({
          id: r[idx.id],
          username: r[idx.username],
          name: r[idx.name],
          displayName: r[idx.displayName],
          email: r[idx.email],
          role: r[idx.role] || 'teacher',
          assignedSections: r[idx.assignedSections] || [],
        }));
      }
      return parsed || [];
    } catch { return []; }
  }

  static setTeachersForYear(year: number, teachers: any[]) {
    const key = this.keyWithYear(this.KEYS.TEACHERS, year);
    try {
      const value = JSON.stringify(teachers);
      this.setLargeItem(key, value);
      return;
    } catch (e) {
      const fields = ['id','username','name','displayName','email','role','assignedSections'];
      const rows = (teachers || []).map(t => [
        t.id ?? '', t.username ?? '', t.name ?? '', t.displayName ?? '', t.email ?? '', t.role ?? 'teacher', t.assignedSections ?? []
      ]);
      const compact = { fmt: 'teachers-compact-v1', fields, rows };
      const value2 = JSON.stringify(compact);
      this.setLargeItem(key, value2);
    }
  }

  static getAssignments() {
    return JSON.parse(localStorage.getItem(this.KEYS.ASSIGNMENTS) || '[]');
  }

  static setAssignments(assignments: any[]) {
    localStorage.setItem(this.KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }

  static getTeacherAssignmentsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.TEACHER_ASSIGNMENTS, year);
  const raw = this.getLargeItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      // Formato clásico (array de objetos)
      if (Array.isArray(parsed)) return parsed;
      // Formato compacto v2 con diccionarios
      if (
        parsed && parsed.fmt === 'teacher-assignments-compact-v2' &&
        Array.isArray(parsed.teachers) &&
        Array.isArray(parsed.sections) &&
        Array.isArray(parsed.subjects) &&
        Array.isArray(parsed.items)
      ) {
        const teachers: string[] = parsed.teachers;
        const sections: string[] = parsed.sections;
        const subjects: string[] = parsed.subjects;
        const out: any[] = [];
        for (const it of parsed.items as Array<[number, number, number, number?]>) {
          const [ti, si, subi, activeFlag] = it;
          const teacherId = teachers[ti];
          const sectionId = sections[si];
          const subjectName = subjects[subi];
          out.push({
            id: `ta-${teacherId}-${sectionId}-${subjectName}`,
            teacherId,
            sectionId,
            subjectName,
            isActive: activeFlag ? Boolean(activeFlag) : true,
            source: 'compact-v2'
          });
        }
        return out;
      }
      // Formato compacto v1 (fields/rows)
      if (parsed && parsed.fmt === 'teacher-assignments-compact-v1' && Array.isArray(parsed.fields) && Array.isArray(parsed.rows)) {
        const idx: Record<string, number> = {};
        (parsed.fields as string[]).forEach((f: string, i: number) => { idx[f] = i; });
        return (parsed.rows as any[]).map((r: any[]) => ({
          id: r[idx.id] ?? `ta-${r[idx.teacherId]}-${r[idx.sectionId]}-${r[idx.subjectName]}`,
          teacherId: r[idx.teacherId],
          teacherUsername: r[idx.teacherUsername],
          sectionId: r[idx.sectionId],
          subjectName: r[idx.subjectName],
          createdAt: r[idx.createdAt],
          isActive: typeof r[idx.isActive] === 'boolean' ? r[idx.isActive] : true,
          source: r[idx.source] ?? 'compact-v1'
        }));
      }
      return parsed || [];
    } catch {
      return [];
    }
  }

  static setTeacherAssignmentsForYear(year: number, assignments: any[]) {
    const key = this.keyWithYear(this.KEYS.TEACHER_ASSIGNMENTS, year);
    try {
      const value = JSON.stringify(assignments);
      this.setLargeItem(key, value);
      return;
    } catch (e) {
      // Fallback 1: Formato súper compacto con diccionarios
      const teachers: string[] = [];
      const sections: string[] = [];
      const subjects: string[] = [];
      const tIndex = (id: string) => {
        let i = teachers.indexOf(id);
        if (i === -1) { teachers.push(id); i = teachers.length - 1; }
        return i;
      };
      const sIndex = (id: string) => {
        let i = sections.indexOf(id);
        if (i === -1) { sections.push(id); i = sections.length - 1; }
        return i;
      };
      const subIndex = (name: string) => {
        let i = subjects.indexOf(name);
        if (i === -1) { subjects.push(name); i = subjects.length - 1; }
        return i;
      };
      const items: Array<[number, number, number, number?]> = [];
      for (const a of assignments || []) {
        const ti = tIndex(String(a.teacherId ?? ''));
        const si = sIndex(String(a.sectionId ?? ''));
        const subi = subIndex(String(a.subjectName ?? 'General'));
        const active = a.isActive === false ? 0 : 1;
        items.push([ti, si, subi, active]);
      }
      const compactV2 = { fmt: 'teacher-assignments-compact-v2', teachers, sections, subjects, items };
      const value2 = JSON.stringify(compactV2);
      try {
        this.setLargeItem(key, value2);
        return;
      } catch (e2) {
        // Fallback 2: Formato compacto v1 (fields/rows)
        const fields = ['id','teacherId','teacherUsername','sectionId','subjectName','createdAt','isActive','source'];
        const rows = (assignments || []).map(a => [
          a.id ?? `ta-${a.teacherId}-${a.sectionId}-${a.subjectName}`,
          a.teacherId ?? '',
          a.teacherUsername ?? '',
          a.sectionId ?? '',
          a.subjectName ?? 'General',
          a.createdAt ?? '',
          typeof a.isActive === 'boolean' ? a.isActive : true,
          a.source ?? 'import'
        ]);
        const compactV1 = { fmt: 'teacher-assignments-compact-v1', fields, rows };
        const value3 = JSON.stringify(compactV1);
        this.setLargeItem(key, value3);
      }
    }
  }

  static getStudentAssignmentsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.STUDENT_ASSIGNMENTS, year);
  const raw = this.getLargeItem(key);
  return JSON.parse(raw || '[]');
  }

  static setStudentAssignmentsForYear(year: number, assignments: any[]) {
    const key = this.keyWithYear(this.KEYS.STUDENT_ASSIGNMENTS, year);
  const value = JSON.stringify(assignments);
  this.setLargeItem(key, value);
  }

  // Attendance helpers with chunked storage (global, no por año)
  static getAttendance() {
    const raw = this.getLargeItem(this.KEYS.ATTENDANCE);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      // Formato compacto por excepciones
      if (parsed && parsed.fmt === 'exceptions-v1' && Array.isArray(parsed.days) && Array.isArray(parsed.students) && Array.isArray(parsed.items)) {
        const days: string[] = parsed.days; // 'YYYY-MM-DD'
        const studentsArr: Array<[string, string, string]> = parsed.students; // [studentId, courseId, sectionId]
        const items: Array<[string, string, string, string?]> = parsed.items; // [day, studentId, statusChar, comment?]

        // Map rápido de excepciones por clave day:studentId
        const exc = new Map<string, { status: 'absent'|'late'|'present'; comment?: string }>();
        for (const it of items) {
          const d = String(it[0]);
          const s = String(it[1]);
          const st = it[2] === 'a' ? 'absent' : it[2] === 'l' ? 'late' : 'present';
          const c = it.length > 3 ? String(it[3]) : undefined;
          exc.set(`${d}:${s}`, { status: st as any, comment: c });
        }
        const out: any[] = [];
        const nowIso = new Date().toISOString();
        for (const d of days) {
          for (const s of studentsArr) {
            const [studentId, courseId, sectionId] = s;
            const key = `${d}:${studentId}`;
            const ex = exc.get(key);
            const status = ex?.status || 'present';
            const comment = ex?.comment;
            out.push({
              id: `att-${studentId}-${sectionId}-${d}`,
              date: `${d}T00:00:00.000Z`,
              courseId,
              sectionId,
              studentId,
              status,
              comment,
              createdAt: nowIso,
              updatedAt: nowIso,
            });
          }
        }
        return out;
      }
      return parsed || [];
    } catch {
      return [];
    }
  }

  static setAttendance(records: any[]) {
    try {
      const value = JSON.stringify(records);
      this.setLargeItem(this.KEYS.ATTENDANCE, value);
      return;
    } catch (e) {
      // Fallback: almacenar como "excepciones" (solo absent/late) con metadatos mínimos
      try {
        const daysSet = new Set<string>();
        const studentsMap = new Map<string, { courseId: string; sectionId: string }>();
        const items: Array<[string, string, string, string?]> = [];
        for (const r of records) {
          const day = String(r.date).slice(0,10);
          daysSet.add(day);
          const sid = String(r.studentId);
          if (!studentsMap.has(sid)) studentsMap.set(sid, { courseId: String(r.courseId), sectionId: String(r.sectionId) });
          if (r.status !== 'present') {
            const st = r.status === 'absent' ? 'a' : r.status === 'late' ? 'l' : 'p';
            if (r.comment) items.push([day, sid, st, String(r.comment)]); else items.push([day, sid, st]);
          }
        }
        const days = Array.from(daysSet).sort();
        const students = Array.from(studentsMap.entries()).map(([id, v]) => [id, v.courseId, v.sectionId]);
        const compact = { fmt: 'exceptions-v1', days, students, items };
        const value = JSON.stringify(compact);
        this.setLargeItem(this.KEYS.ATTENDANCE, value);
        return;
      } catch (e2) {
        this.removeLargeItem(this.KEYS.ATTENDANCE);
        throw e2;
      }
    }
  }

  // Attendance por año (almacenamiento segmentado por año para evitar límite y cruces)
  static getAttendanceForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.ATTENDANCE, year);
    // 1) Intentar per-year
    let raw = this.getLargeItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        // Nuevo formato súper compacto v2
        if (
          parsed && parsed.fmt === 'exceptions-v2' &&
          typeof parsed.d === 'string' && typeof parsed.s === 'string' && typeof parsed.i === 'string'
        ) {
          const yearStr = String(year);
          const days: string[] = String(parsed.d).split('|').filter(Boolean).filter((d: string) => d.startsWith(yearStr + '-'));
          const studentsArr: Array<[string, string, string]> = String(parsed.s)
            .split('|')
            .filter(Boolean)
            .map((row: string) => {
              const [sid, cid, secid] = row.split(',');
              return [sid || '', cid || '', secid || ''];
            });
          // Excepciones indexadas por clave day:studentId
          const exc = new Map<string, { status: 'absent'|'late'|'present'; comment?: string }>();
          if (parsed.i && typeof parsed.i === 'string' && parsed.i.length) {
            const items = String(parsed.i).split(';');
            for (const it of items) {
              if (!it) continue;
              // dIdx:sIdx:st(:commentEnc)? — índices en base36
              const parts = it.split(':');
              const dIdx = parseInt(parts[0], 36);
              const sIdx = parseInt(parts[1], 36);
              const stChar = parts[2] || 'p';
              const comment = parts.length > 3 ? decodeURIComponent(parts.slice(3).join(':')) : undefined;
              const d = days[dIdx];
              const s = studentsArr[sIdx]?.[0] || '';
              if (!d || !s) continue;
              const st = stChar === 'a' ? 'absent' : stChar === 'l' ? 'late' : 'present';
              exc.set(`${d}:${s}`, { status: st as any, comment });
            }
          }
          const out: any[] = [];
          const nowIso = new Date().toISOString();
          for (let di = 0; di < days.length; di++) {
            const d = days[di];
            for (let si = 0; si < studentsArr.length; si++) {
              const [studentId, courseId, sectionId] = studentsArr[si];
              const key2 = `${d}:${studentId}`;
              const ex = exc.get(key2);
              const status = ex?.status || 'present';
              const comment = ex?.comment;
              out.push({
                id: `att-${studentId}-${sectionId}-${d}`,
                date: `${d}T00:00:00.000Z`,
                courseId,
                sectionId,
                studentId,
                status,
                comment,
                createdAt: nowIso,
                updatedAt: nowIso,
              });
            }
          }
          return out;
        }
        if (parsed && parsed.fmt === 'exceptions-v1' && Array.isArray(parsed.days) && Array.isArray(parsed.students) && Array.isArray(parsed.items)) {
          const yearStr = String(year);
          const daysAll: string[] = parsed.days;
          const days = daysAll.filter(d => String(d).startsWith(yearStr + '-'));
          const studentsArr: Array<[string, string, string]> = parsed.students; // [studentId, courseId, sectionId]
          const items: Array<[string, string, string, string?]> = parsed.items; // [day, studentId, statusChar, comment?]
          const exc = new Map<string, { status: 'absent'|'late'|'present'; comment?: string }>();
          for (const it of items) {
            const d = String(it[0]);
            if (!d.startsWith(yearStr + '-')) continue;
            const s = String(it[1]);
            const st = it[2] === 'a' ? 'absent' : it[2] === 'l' ? 'late' : 'present';
            const c = it.length > 3 ? String(it[3]) : undefined;
            exc.set(`${d}:${s}`, { status: st as any, comment: c });
          }
          const out: any[] = [];
          const nowIso = new Date().toISOString();
          for (const d of days) {
            for (const s of studentsArr) {
              const [studentId, courseId, sectionId] = s;
              const key = `${d}:${studentId}`;
              const ex = exc.get(key);
              const status = ex?.status || 'present';
              const comment = ex?.comment;
              out.push({
                id: `att-${studentId}-${sectionId}-${d}`,
                date: `${d}T00:00:00.000Z`,
                courseId,
                sectionId,
                studentId,
                status,
                comment,
                createdAt: nowIso,
                updatedAt: nowIso,
              });
            }
          }
          return out;
        }
        return parsed || [];
      } catch {
        // fall-through
      }
    }
    // 2) Fallback: filtrar desde global (para compatibilidad)
    raw = this.getLargeItem(this.KEYS.ATTENDANCE);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const yearStr = String(year);
        return parsed.filter((a: any) => String(a?.date || '').startsWith(yearStr + '-'));
      }
      if (parsed && parsed.fmt === 'exceptions-v1' && Array.isArray(parsed.days) && Array.isArray(parsed.students) && Array.isArray(parsed.items)) {
        const yearStr = String(year);
        const daysAll: string[] = parsed.days;
        const days = daysAll.filter(d => String(d).startsWith(yearStr + '-'));
        const studentsArr: Array<[string, string, string]> = parsed.students;
        const items: Array<[string, string, string, string?]> = parsed.items;
        const exc = new Map<string, { status: 'absent'|'late'|'present'; comment?: string }>();
        for (const it of items) {
          const d = String(it[0]);
          if (!d.startsWith(yearStr + '-')) continue;
          const s = String(it[1]);
          const st = it[2] === 'a' ? 'absent' : it[2] === 'l' ? 'late' : 'present';
          const c = it.length > 3 ? String(it[3]) : undefined;
          exc.set(`${d}:${s}`, { status: st as any, comment: c });
        }
        const out: any[] = [];
        const nowIso = new Date().toISOString();
        for (const d of days) {
          for (const s of studentsArr) {
            const [studentId, courseId, sectionId] = s;
            const key = `${d}:${studentId}`;
            const ex = exc.get(key);
            const status = ex?.status || 'present';
            const comment = ex?.comment;
            out.push({
              id: `att-${studentId}-${sectionId}-${d}`,
              date: `${d}T00:00:00.000Z`,
              courseId,
              sectionId,
              studentId,
              status,
              comment,
              createdAt: nowIso,
              updatedAt: nowIso,
            });
          }
        }
        return out;
      }
      return [];
    } catch {
      return [];
    }
  }

  static setAttendanceForYear(year: number, records: any[], options?: { preferSession?: boolean }) {
    const key = this.keyWithYear(this.KEYS.ATTENDANCE, year);
    // Siempre almacenar en formato compacto por año para minimizar uso de cuota
    try {
      const yearStr = String(year);
      const daysSet = new Set<string>();
      const studentsMap = new Map<string, { courseId: string; sectionId: string }>();
      type PendingItem = { d: string; s: string; st: 'a'|'l'|'p'; c?: string };
      const pend: PendingItem[] = [];
      for (const r of records) {
        const day = String(r.date).slice(0,10);
        if (!day.startsWith(yearStr + '-')) continue;
        daysSet.add(day);
        const sid = String(r.studentId);
        if (!studentsMap.has(sid)) studentsMap.set(sid, { courseId: String(r.courseId), sectionId: String(r.sectionId) });
        if (r.status !== 'present') {
          const st = r.status === 'absent' ? 'a' : r.status === 'late' ? 'l' : 'p';
          const it: PendingItem = { d: day, s: sid, st };
          if (r.comment) it.c = String(r.comment);
          pend.push(it);
        }
      }
      const days = Array.from(daysSet).sort();
      const dayIndex = new Map(days.map((d, i) => [d, i] as [string, number]));
      const studentsArr = Array.from(studentsMap.entries()).map(([id, v]) => [id, v.courseId, v.sectionId] as [string,string,string]);
      const studentIndex = new Map(studentsArr.map((row, i) => [row[0], i] as [string, number]));
      // Serializar ultra-compacto
      const dStr = days.join('|');
      const sStr = studentsArr.map(([sid, cid, secid]) => `${sid},${cid},${secid}`).join('|');
      const iStr = pend.map(it => {
        const di = dayIndex.get(it.d) ?? 0;
        const si = studentIndex.get(it.s) ?? 0;
        const base = `${di.toString(36)}:${si.toString(36)}:${it.st}`;
        return it.c ? `${base}:${encodeURIComponent(it.c)}` : base;
      }).join(';');
      const compactV2 = { fmt: 'exceptions-v2', d: dStr, s: sStr, i: iStr } as any;
  const value = JSON.stringify(compactV2);
  if (options?.preferSession) this.setLargeItemPreferSession(key, value);
  else this.setLargeItem(key, value);
    } catch (e) {
      this.removeLargeItem(key);
      throw e;
    }
  }

  static clearAttendanceForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.ATTENDANCE, year);
    this.removeLargeItem(key);
  }

  // Submissions por año (para gráfico de comparación de cursos)
  static getSubmissionsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.SUBMISSIONS, year);
    // 1) Intentar per-year
    let raw = this.getLargeItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    
    // 2) Fallback a global y filtrar por año
    try {
      const globalSubmissions = this.getLargeItem(this.KEYS.SUBMISSIONS);
      if (globalSubmissions) {
        const allSubmissions = JSON.parse(globalSubmissions);
        if (Array.isArray(allSubmissions)) {
          return allSubmissions.filter(s => {
            const createdAt = s.createdAt || s.timestamp || s.when || s.date;
            if (typeof createdAt === 'number') {
              return new Date(createdAt).getFullYear() === year;
            } else if (typeof createdAt === 'string') {
              if (/^\d{4}-\d{2}-\d{2}/.test(createdAt)) {
                return new Date(createdAt).getFullYear() === year;
              } else if (/^\d{2}-\d{2}-\d{4}$/.test(createdAt)) {
                const [dd,mm,yyyy] = createdAt.split('-').map(Number);
                return yyyy === year;
              }
            }
            return false;
          });
        }
      }
    } catch {}
    
    return [];
  }

  static setSubmissionsForYear(year: number, records: any[]) {
    const key = this.keyWithYear(this.KEYS.SUBMISSIONS, year);
    this.setLargeItem(key, JSON.stringify(records));
  }

  static clearSubmissionsForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.SUBMISSIONS, year);
    this.removeLargeItem(key);
  }

  // === NUEVO: Acceso compacto (sin expandir) para exportación/importación ===
  static getAttendanceCompactForYear(year: number): any | null {
    const key = this.keyWithYear(this.KEYS.ATTENDANCE, year);
    const raw = this.getLargeItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return raw; }
  }

  static setAttendanceCompactForYear(year: number, compact: any, options?: { preferSession?: boolean }) {
    const key = this.keyWithYear(this.KEYS.ATTENDANCE, year);
    const value = typeof compact === 'string' ? compact : JSON.stringify(compact);
    if (options?.preferSession) this.setLargeItemPreferSession(key, value);
    else this.setLargeItem(key, value);
  }

  static clearAttendance() {
    // Limpiar global
    this.removeLargeItem(this.KEYS.ATTENDANCE);
    // Limpiar por año (si existieran claves segmentadas)
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (/^smart-student-attendance-\d{4}$/.test(k)) toRemove.push(k);
      }
      toRemove.forEach(k => this.removeLargeItem(k));
    } catch {}
  }

  // ===== Test grades (per-year, chunked) =====
  static getTestGradesForYear(year: number): any[] {
    try {
      const key = this.keyWithYear(this.KEYS.TEST_GRADES, year);
      // 0) Verificar formato shardeado v1 (meta + shards)
      try {
        const metaRaw = localStorage.getItem(key + '__meta') ?? sessionStorage.getItem(key + '__meta');
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta?.fmt === 'test-grades-sharded-v1' && Number.isFinite(meta.shards)) {
            const shards: any[] = [];
            for (let s = 0; s < meta.shards; s++) {
              const shardKey = key + `__shard_${s}`;
              const shardRaw = this.getLargeItem(shardKey) ?? localStorage.getItem(shardKey) ?? sessionStorage.getItem(shardKey);
              if (!shardRaw) continue;
              try {
                const parsedShard = JSON.parse(shardRaw);
                if (parsedShard?.fmt === 'test-grades-compact-v2' && Array.isArray(parsedShard.tests)) {
                  // Reutilizar lógica de compact v2 parcial
                  const tests: any[] = parsedShard.tests;
                  const students: any[] = parsedShard.students || [];
                  const rows: Array<any[]> = parsedShard.rows || [];
                  for (const row of rows) {
                    const [ti, si, score, gradedAt] = row;
                    const tMeta = tests[ti] || [];
                    shards.push({
                      id: `${tMeta[0]}-${students[si]}`,
                      testId: tMeta[0],
                      studentId: students[si],
                      score,
                      courseId: tMeta[1],
                      sectionId: tMeta[2] || null,
                      subjectId: tMeta[3] || null,
                      gradedAt: gradedAt || tMeta[4] || Date.now(),
                    });
                  }
                }
              } catch {}
            }
            if (shards.length) return shards;
          }
        }
      } catch {}
      const raw = this.getLargeItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
          // Compact v1: { fmt: 'test-grades-compact-v1', fields, rows }
          if (parsed && parsed.fmt === 'test-grades-compact-v1' && Array.isArray(parsed.fields) && Array.isArray(parsed.rows)) {
            const idx: Record<string, number> = {};
            (parsed.fields as string[]).forEach((f: string, i: number) => { idx[f] = i; });
            return (parsed.rows as any[]).map(r => ({
              id: r[idx.id],
              testId: r[idx.testId],
              studentId: r[idx.studentId],
              score: r[idx.score],
              courseId: r[idx.courseId],
              sectionId: r[idx.sectionId] || null,
              subjectId: r[idx.subjectId] || null,
              gradedAt: r[idx.gradedAt],
            }));
          }
          // Compact v2: { fmt:'test-grades-compact-v2', tests:[], students:[], subjects:[], rows:[[ti,si,suI,score,gradedAt?]] }
          if (parsed && parsed.fmt === 'test-grades-compact-v2' && Array.isArray(parsed.tests) && Array.isArray(parsed.students) && Array.isArray(parsed.rows)) {
            const tests: any[] = parsed.tests; // each test entry could be [testId, courseId, sectionId, subjectId, gradedAtBase?]
            const students: any[] = parsed.students; // studentId list
            const rows: Array<any[]> = parsed.rows;
            const out: any[] = [];
            for (const row of rows) {
              const [ti, si, score, gradedAt, subjIdx] = row; // legacy simple layout
              const tMeta = tests[ti] || [];
              out.push({
                id: `${tMeta[0]}-${students[si]}`,
                testId: tMeta[0],
                studentId: students[si],
                score,
                courseId: tMeta[1],
                sectionId: tMeta[2] || null,
                subjectId: (typeof subjIdx === 'number' && parsed.subjects?.[subjIdx]) || tMeta[3] || null,
                gradedAt: gradedAt || tMeta[4] || Date.now(),
              });
            }
            return out;
          }
          return [];
        } catch { return []; }
      }
      // Fallback: legacy global key
      try {
        const legacy = this.getLargeItem(this.KEYS.TEST_GRADES) ?? localStorage.getItem(this.KEYS.TEST_GRADES);
        const arr = legacy ? JSON.parse(legacy) : [];
        return Array.isArray(arr) ? arr : [];
      } catch { return []; }
    } catch { return []; }
  }

  static setTestGradesForYear(year: number, grades: any[], options?: { preferSession?: boolean }) {
    const key = this.keyWithYear(this.KEYS.TEST_GRADES, year);
    const arr = Array.isArray(grades) ? grades : [];
    const attemptStore = (val: string, preferSession?: boolean) => {
      if (preferSession) this.setLargeItemPreferSession(key, val); else this.setLargeItem(key, val);
    };
    // 1) Intento directo (array completo)
    const rawFull = JSON.stringify(arr);
    try {
      attemptStore(rawFull, options?.preferSession);
      return;
    } catch (e1) {
      // 2) Formato compacto v1 (fields/rows)
      try {
        const fields = ['id','testId','studentId','score','courseId','sectionId','subjectId','gradedAt'];
        const rows = arr.map(g => [
          g.id ?? `${g.testId}-${g.studentId}`,
          g.testId ?? '',
          g.studentId ?? '',
            typeof g.score === 'number' ? Number(g.score) : (Number(g.score) || 0),
          g.courseId ?? '',
          g.sectionId ?? '',
          g.subjectId ?? '',
          g.gradedAt ?? Date.now()
        ]);
        const compactV1 = { fmt: 'test-grades-compact-v1', fields, rows };
        const rawV1 = JSON.stringify(compactV1);
        attemptStore(rawV1, options?.preferSession);
        return;
      } catch (e2) {
        // 3) Formato súper compacto v2 con diccionarios de tests y students
        try {
          const testMap = new Map<string, number>();
          const tests: any[] = [];
          const studentMap = new Map<string, number>();
          const students: string[] = [];
          const rows: any[] = [];
          for (const g of arr) {
            const tKey = String(g.testId ?? '');
            let ti = testMap.get(tKey);
            if (ti == null) { ti = tests.length; testMap.set(tKey, ti); tests.push([tKey, g.courseId ?? '', g.sectionId ?? '', g.subjectId ?? '', g.gradedAt ?? Date.now()]); }
            const sKey = String(g.studentId ?? '');
            let si = studentMap.get(sKey);
            if (si == null) { si = students.length; studentMap.set(sKey, si); students.push(sKey); }
            rows.push([ti, si, typeof g.score === 'number' ? Number(g.score) : (Number(g.score) || 0), g.gradedAt ?? Date.now()]);
          }
          const compactV2 = { fmt: 'test-grades-compact-v2', tests, students, rows };
          const rawV2 = JSON.stringify(compactV2);
          attemptStore(rawV2, options?.preferSession);
          return;
        } catch (e3) {
          // 4) Fallback final: sharding en múltiples claves pequeñas
          try {
            // Limpieza previa
            try { Object.keys(localStorage).forEach(k => { if (k.startsWith(key + '__shard_') || k === key + '__meta') localStorage.removeItem(k); }); } catch {}
            try { Object.keys(sessionStorage).forEach(k => { if (k.startsWith(key + '__shard_') || k === key + '__meta') sessionStorage.removeItem(k); }); } catch {}
            const shardSize = 1500; // elementos por shard
            const shardCount = Math.ceil(arr.length / shardSize) || 1;
            const meta = { fmt: 'test-grades-sharded-v1', shards: shardCount, total: arr.length };
            try { (options?.preferSession ? sessionStorage : localStorage).setItem(key + '__meta', JSON.stringify(meta)); } catch {}
            for (let s = 0; s < shardCount; s++) {
              const slice = arr.slice(s * shardSize, (s + 1) * shardSize);
              const testMap = new Map<string, number>(); const tests: any[] = [];
              const studentMap = new Map<string, number>(); const students: string[] = [];
              const rows: any[] = [];
              for (const g of slice) {
                const tKey = String(g.testId ?? '');
                let ti = testMap.get(tKey); if (ti == null) { ti = tests.length; testMap.set(tKey, ti); tests.push([tKey, g.courseId ?? '', g.sectionId ?? '', g.subjectId ?? '', g.gradedAt ?? Date.now()]); }
                const sKey = String(g.studentId ?? '');
                let si = studentMap.get(sKey); if (si == null) { si = students.length; studentMap.set(sKey, si); students.push(sKey); }
                rows.push([ti, si, typeof g.score === 'number' ? Number(g.score) : (Number(g.score)||0), g.gradedAt ?? Date.now()]);
              }
              const shardObj = { fmt: 'test-grades-compact-v2', tests, students, rows };
              const shardRaw = JSON.stringify(shardObj);
              const shardKey = key + `__shard_${s}`;
              if (options?.preferSession) this.setLargeItemPreferSession(shardKey, shardRaw); else this.setLargeItem(shardKey, shardRaw);
            }
            return; // éxito con shards
          } catch {
            throw e1; // re-lanzar error original si sharding falla
          }
        }
      }
    }
  }

  static clearTestGradesForYear(year: number) {
    const key = this.keyWithYear(this.KEYS.TEST_GRADES, year);
    this.removeLargeItem(key);
  }

  // Resumen anual de asistencia (fallback pequeño)
  private static attendanceSummaryKey(year: number) {
    return `smart-student-attendance-summary-${year}`;
  }

  static setAttendanceSummary(year: number, summary: { days: number; students: number; total: number; present: number }) {
    try {
      localStorage.setItem(this.attendanceSummaryKey(year), JSON.stringify(summary));
    } catch (e) {
      try { sessionStorage.setItem(this.attendanceSummaryKey(year), JSON.stringify(summary)); } catch {}
    }
  }

  static getAttendanceSummary(year: number): { days: number; students: number; total: number; present: number } | null {
    const key = this.attendanceSummaryKey(year);
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  // Purgar solo la clave legacy global de asistencia (no toca las segmentadas)
  static purgeLegacyGlobalAttendance() {
    this.removeLargeItem(this.KEYS.ATTENDANCE);
  }

  static getConfig() {
    return JSON.parse(localStorage.getItem(this.KEYS.CONFIG) || '{}');
  }

  static setConfig(config: any) {
    localStorage.setItem(this.KEYS.CONFIG, JSON.stringify(config));
  }

  /**
   * Debug: Mostrar contenido del localStorage
   */
  static debugLocalStorage() {
    console.log('=== DEBUG LOCALSTORAGE ===');
    const courses = this.getCourses();
    const sections = this.getSections();
    const subjects = this.getSubjects();
    
    console.log('Raw localStorage courses:', localStorage.getItem(this.KEYS.COURSES));
    console.log('Raw localStorage sections:', localStorage.getItem(this.KEYS.SECTIONS));
    
    console.log('Parsed courses:', courses);
    console.log('Parsed sections:', sections);
    console.log('Parsed subjects:', subjects);
    
    courses.forEach((course: any, index: number) => {
      console.log(`Course ${index}:`, {
        id: course.id,
        name: course.name,
        level: course.level,
        type: typeof course.level
      });
    });
    
    return { courses, sections, subjects };
  }
}

/**
 * Generador de nombres de usuario automáticos
 */
export class UsernameGenerator {
  static generateFromName(name: string, role: 'student' | 'teacher' | 'admin'): string {
    const cleanName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z\s]/g, '') // Remove special characters
      .trim();

    const parts = cleanName.split(' ');
    let username = '';

    if (parts.length >= 2) {
      // FirstName + LastName
      username = parts[0] + parts[parts.length - 1];
    } else {
      // Single name
      username = parts[0];
    }

    // Add role prefix
    const prefix = role === 'student' ? 'est' : role === 'teacher' ? 'prof' : 'admin';
    username = prefix + username;

    // Add random number to ensure uniqueness
    const random = Math.floor(Math.random() * 999) + 1;
    username += random.toString().padStart(3, '0');

    return username.substring(0, 20); // Limit length
  }

  static generateRandomPassword(length: number = 8): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    // Ensure at least one uppercase, one lowercase, and one number
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

/**
 * Utilidades para automatización del sistema educativo
 */
export class EducationAutomation {
  /**
   * Sanea vínculos estudiante->curso/sección cuando los IDs ya no existen
   * - Elimina asignaciones de estudiantes con sectionId inválido
   * - Quita courseId/sectionId de estudiantes con referencias rotas
   */
  static sanitizeStudentLinks(year?: number): { detached: number; removedAssignments: number } {
    try {
      const courses = year ? LocalStorageManager.getCoursesForYear(year) : LocalStorageManager.getCourses();
      const sections = year ? LocalStorageManager.getSectionsForYear(year) : LocalStorageManager.getSections();
      const students = year ? LocalStorageManager.getStudentsForYear(year) : LocalStorageManager.getStudents();
      const assignments = year ? LocalStorageManager.getStudentAssignmentsForYear(year) : [];

      const validCourseIds = new Set((courses || []).map((c: any) => c.id));
      const validSectionIds = new Set((sections || []).map((s: any) => s.id));
      const validStudentIds = new Set((students || []).map((u: any) => u.id));

      // 1) Limpiar asignaciones que apuntan a secciones o estudiantes inexistentes
      let removedAssignments = 0;
      if (Array.isArray(assignments) && year) {
        const filtered = assignments.filter((a: any) => validSectionIds.has(a.sectionId) && validStudentIds.has(a.studentId));
        removedAssignments = assignments.length - filtered.length;
        if (removedAssignments > 0) LocalStorageManager.setStudentAssignmentsForYear(year, filtered);
      }

      // 2) Desasignar estudiantes con referencias rotas
      let detached = 0;
      const sanitizedStudents = (students || []).map((s: any) => {
        const hasBadCourse = s.courseId && !validCourseIds.has(s.courseId);
        const hasBadSection = s.sectionId && !validSectionIds.has(s.sectionId);
        if (hasBadCourse || hasBadSection) {
          detached++;
          return { ...s, courseId: undefined, sectionId: undefined };
        }
        return s;
      });

      if (year) LocalStorageManager.setStudentsForYear(year, sanitizedStudents);
      else LocalStorageManager.setStudents(sanitizedStudents);

      return { detached, removedAssignments };
    } catch {
      return { detached: 0, removedAssignments: 0 };
    }
  }

  /**
   * Reasigna estudiantes a secciones actuales cuando se recrearon cursos/secciones
   * Usa smart-student-users.activeCourses[0] como nombre de curso y la letra 'section' si existe; si no, usa 'A'.
   */
  static reassignStudentsToExistingSections(year?: number): { reassigned: number } {
    try {
      const y = year;
      const courses = y ? LocalStorageManager.getCoursesForYear(y) : LocalStorageManager.getCourses();
      const sections = y ? LocalStorageManager.getSectionsForYear(y) : LocalStorageManager.getSections();
      const students = y ? LocalStorageManager.getStudentsForYear(y) : LocalStorageManager.getStudents();

      const allUsers: any[] = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const byId = new Map<string, any>();
      const byUsername = new Map<string, any>();
      for (const u of allUsers) {
        if (u?.id) byId.set(String(u.id), u);
        if (u?.username) byUsername.set(String(u.username).toLowerCase(), u);
      }

      const nameToCourse = new Map<string, any>();
      for (const c of courses || []) nameToCourse.set(String(c.name), c);

      let reassigned = 0;
      const updatedStudents = (students || []).map((s: any) => {
        // Si ya tiene sectionId válido, no tocar
        if (s?.sectionId && (sections || []).some((sec: any) => sec.id === s.sectionId)) return s;

        // Determinar nombre de curso desde smart-student-users
        const candidate = (s?.id && byId.get(String(s.id))) || (s?.username && byUsername.get(String(s.username).toLowerCase()));
        const courseName = Array.isArray(candidate?.activeCourses) && candidate.activeCourses.length > 0 
          ? candidate.activeCourses[0] 
          : undefined;
        const course = courseName ? nameToCourse.get(courseName) : undefined;
        if (!course) return s; // sin referencia de curso no podemos reasignar

        // Determinar letra de sección preferida
        const preferredLetter = (typeof s?.section === 'string' && s.section.trim()) ? String(s.section).trim() : 'A';
        const options = (sections || []).filter((sec: any) => sec.courseId === course.id);
        if (options.length === 0) return s;
        const byLetter = options.find((sec: any) => String(sec.name).toUpperCase() === preferredLetter.toUpperCase());
        const target = byLetter || options.find((sec: any) => String(sec.name).toUpperCase() === 'A') || options[0];
        if (!target) return s;

        reassigned++;
        return { ...s, courseId: course.id, sectionId: target.id };
      });

      if (y) LocalStorageManager.setStudentsForYear(y, updatedStudents);
      else LocalStorageManager.setStudents(updatedStudents);

      // Asegurar registros en student-assignments para los reasignados
      if (y) {
        const existing: any[] = LocalStorageManager.getStudentAssignmentsForYear(y);
        const keySet = new Set(existing.map(a => `${a.studentId}:${a.sectionId}`));
        const toAdd: any[] = [];
        for (const s of updatedStudents) {
          if (!s?.id || !s?.sectionId) continue;
          const key = `${s.id}:${s.sectionId}`;
          if (!keySet.has(key)) {
            toAdd.push({
              id: `sa-${s.id}-${s.sectionId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              studentId: s.id,
              courseId: s.courseId,
              sectionId: s.sectionId,
              isActive: true,
              assignedAt: new Date().toISOString(),
              source: 'auto-reassign'
            });
            keySet.add(key);
          }
        }
        if (toAdd.length > 0) LocalStorageManager.setStudentAssignmentsForYear(y, [...existing, ...toAdd]);
      }

      return { reassigned };
    } catch {
      return { reassigned: 0 };
    }
  }

  /**
   * Asigna estudiantes por índice a las secciones estándar (A/B) cuando faltan courseId/sectionId.
   * Supone un orden del CSV de 24 bloques de 45 estudiantes (1ro Básico A/B … 4to Medio A/B).
   * Solo afecta a estudiantes que NO tienen courseId o sectionId. Crea registros en student-assignments.
   */
  static assignStudentsByIndex(year?: number): { assigned: number; message: string } {
    try {
      const y = year;
      const courses = y ? LocalStorageManager.getCoursesForYear(y) : LocalStorageManager.getCourses();
      const sections = y ? LocalStorageManager.getSectionsForYear(y) : LocalStorageManager.getSections();
      const students = y ? LocalStorageManager.getStudentsForYear(y) : LocalStorageManager.getStudents();

      if (!Array.isArray(students) || students.length === 0) {
        return { assigned: 0, message: 'No hay estudiantes para asignar' };
      }

      // Mapa rápido por nombre de curso y letra de sección
      const byCourseName = new Map<string, any>();
      for (const c of courses || []) byCourseName.set(String(c.name), c);

      const byCourseAndLetter = new Map<string, any>();
      for (const s of sections || []) byCourseAndLetter.set(`${s.courseId}|${String(s.name).toUpperCase()}`, s);

      // Distribución estándar 24 x 45
      const blocks: Array<{ curso: string; letra: 'A'|'B'; inicio: number; fin: number }> = [
        { curso: '1ro Básico', letra: 'A', inicio: 0, fin: 45 },
        { curso: '1ro Básico', letra: 'B', inicio: 45, fin: 90 },
        { curso: '2do Básico', letra: 'A', inicio: 90, fin: 135 },
        { curso: '2do Básico', letra: 'B', inicio: 135, fin: 180 },
        { curso: '3ro Básico', letra: 'A', inicio: 180, fin: 225 },
        { curso: '3ro Básico', letra: 'B', inicio: 225, fin: 270 },
        { curso: '4to Básico', letra: 'A', inicio: 270, fin: 315 },
        { curso: '4to Básico', letra: 'B', inicio: 315, fin: 360 },
        { curso: '5to Básico', letra: 'A', inicio: 360, fin: 405 },
        { curso: '5to Básico', letra: 'B', inicio: 405, fin: 450 },
        { curso: '6to Básico', letra: 'A', inicio: 450, fin: 495 },
        { curso: '6to Básico', letra: 'B', inicio: 495, fin: 540 },
        { curso: '7mo Básico', letra: 'A', inicio: 540, fin: 585 },
        { curso: '7mo Básico', letra: 'B', inicio: 585, fin: 630 },
        { curso: '8vo Básico', letra: 'A', inicio: 630, fin: 675 },
        { curso: '8vo Básico', letra: 'B', inicio: 675, fin: 720 },
        { curso: '1ro Medio', letra: 'A', inicio: 720, fin: 765 },
        { curso: '1ro Medio', letra: 'B', inicio: 765, fin: 810 },
        { curso: '2do Medio', letra: 'A', inicio: 810, fin: 855 },
        { curso: '2do Medio', letra: 'B', inicio: 855, fin: 900 },
        { curso: '3ro Medio', letra: 'A', inicio: 900, fin: 945 },
        { curso: '3ro Medio', letra: 'B', inicio: 945, fin: 990 },
        { curso: '4to Medio', letra: 'A', inicio: 990, fin: 1035 },
        { curso: '4to Medio', letra: 'B', inicio: 1035, fin: 1080 }
      ];

      // Cargar asignaciones existentes del año
      const existingAssignments: any[] = y ? LocalStorageManager.getStudentAssignmentsForYear(y) : [];
      const keySet = new Set(existingAssignments.map(a => `${a.studentId}:${a.sectionId}`));

      let assigned = 0;
      const updated = [...students];
      const newAssignments: any[] = [];

      for (const block of blocks) {
        const course = byCourseName.get(block.curso);
        if (!course) continue;
        const section = byCourseAndLetter.get(`${course.id}|${block.letra}`);
        if (!section) continue;

        for (let i = block.inicio; i < block.fin && i < updated.length; i++) {
          const s = updated[i];
          if (s?.courseId && s?.sectionId) continue; // ya asignado
          // asignar
          updated[i] = { ...s, courseId: course.id, sectionId: section.id };
          assigned++;
          // crear student-assignment si no existe
          const saKey = `${s.id}:${section.id}`;
          if (s?.id && !keySet.has(saKey)) {
            newAssignments.push({
              id: `sa-${s.id}-${section.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              studentId: s.id,
              courseId: course.id,
              sectionId: section.id,
              isActive: true,
              assignedAt: new Date().toISOString(),
              source: 'index-fallback'
            });
            keySet.add(saKey);
          }
        }
      }

      if (assigned > 0) {
        y ? LocalStorageManager.setStudentsForYear(y, updated) : LocalStorageManager.setStudents(updated);
        if (y && newAssignments.length > 0) {
          LocalStorageManager.setStudentAssignmentsForYear(y, [...existingAssignments, ...newAssignments]);
        }
      }

      return { assigned, message: `Asignados por índice: ${assigned}` };
    } catch (e) {
      return { assigned: 0, message: 'Error en asignación por índice' };
    }
  }
  /**
   * Crear secciones A y B para TODOS los cursos (versión de corrección)
   */
  static forceCreateSectionsForAllCourses(translate?: (key: string) => string, year?: number): { success: boolean; created: number; message: string } {
    try {
      const courses = year ? LocalStorageManager.getCoursesForYear(year) : LocalStorageManager.getCourses();
      const existingSections = year ? LocalStorageManager.getSectionsForYear(year) : LocalStorageManager.getSections();
      const newSections = [];
      let createdCount = 0;

      console.log('FORCE MODE - Total courses found:', courses.length);
      console.log('FORCE MODE - Existing sections:', existingSections.length);

      // Procesar TODOS los cursos sin filtrar por nivel
      for (const course of courses) {
        console.log(`Processing course: ${course.name}, level: ${course.level}`);
        
        // Verificar si ya existen secciones A y B para este curso
        const courseSections = existingSections.filter((section: Section) => section.courseId === course.id);
        const hasASection = courseSections.some((section: Section) => section.name === 'A');
        const hasBSection = courseSections.some((section: Section) => section.name === 'B');

        console.log(`Course ${course.name}: has A=${hasASection}, has B=${hasBSection}`);

        // Crear sección A si no existe
    if (!hasASection) {
          const sectionA = {
            id: crypto.randomUUID(),
            uniqueCode: EducationCodeGenerator.generateSectionCode(),
            name: 'A',
            courseId: course.id,
            studentCount: 0,
      maxStudents: 45,
            subjects: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newSections.push(sectionA);
          createdCount++;
          console.log(`FORCE CREATED section A for ${course.name}`);
        }

        // Crear sección B si no existe
        if (!hasBSection) {
          const sectionB = {
            id: crypto.randomUUID(),
            uniqueCode: EducationCodeGenerator.generateSectionCode(),
            name: 'B',
            courseId: course.id,
            studentCount: 0,
      maxStudents: 45,
            subjects: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newSections.push(sectionB);
          createdCount++;
          console.log(`FORCE CREATED section B for ${course.name}`);
        }
      }

      console.log(`FORCE MODE - Total sections to create: ${newSections.length}`);

      // Guardar las nuevas secciones
      if (newSections.length > 0) {
        const allSections = [...existingSections, ...newSections];
        year ? LocalStorageManager.setSectionsForYear(year, allSections) : LocalStorageManager.setSections(allSections);
        console.log('FORCE MODE - Sections saved to localStorage');
      }

      return {
        success: true,
        created: createdCount,
        message: translate ? 
          `${translate('forcedMode') || 'FORZADO'}: ${translate('sectionsCreatedCount') || 'Se crearon {{count}} secciones para {{courses}} cursos'}`
            .replace('{{count}}', createdCount.toString())
            .replace('{{courses}}', courses.length.toString()) :
          `FORZADO: Se crearon ${createdCount} secciones para ${courses.length} cursos`
      };

    } catch (error: any) {
      console.error('Error in forceCreateSectionsForAllCourses:', error);
      return {
        success: false,
        created: 0,
        message: translate ? (translate('errorInForcedMode') || 'Error en modo forzado') : 'Error en modo forzado'
      };
    }
  }
  static createStandardSections(translate?: (key: string) => string, year?: number): { success: boolean; created: number; message: string } {
    try {
      const courses = year ? LocalStorageManager.getCoursesForYear(year) : LocalStorageManager.getCourses();
      const existingSections = year ? LocalStorageManager.getSectionsForYear(year) : LocalStorageManager.getSections();
      const newSections = [];
      let createdCount = 0;

      console.log('Total courses found:', courses.length);
      console.log('Existing sections:', existingSections.length);

      // Filtrar cursos de básica y media
      const basicaMediaCourses = courses.filter((course: Course) => 
        course.level === 'basica' || course.level === 'media'
      );

      console.log('Basica/Media courses:', basicaMediaCourses.length);
      console.log('Courses:', basicaMediaCourses.map((c: Course) => ({ name: c.name, level: c.level })));

      for (const course of basicaMediaCourses) {
        // Verificar si ya existen secciones A y B para este curso
        const courseSections = existingSections.filter((section: Section) => section.courseId === course.id);
        const hasASection = courseSections.some((section: Section) => section.name === 'A');
        const hasBSection = courseSections.some((section: Section) => section.name === 'B');

        console.log(`Course ${course.name}: has A=${hasASection}, has B=${hasBSection}`);

        // Crear sección A si no existe
    if (!hasASection) {
          const sectionA = {
            id: crypto.randomUUID(),
            uniqueCode: EducationCodeGenerator.generateSectionCode(),
            name: 'A',
            courseId: course.id,
            studentCount: 0,
      maxStudents: 45,
            subjects: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newSections.push(sectionA);
          createdCount++;
          console.log(`Created section A for ${course.name}`);
        }

        // Crear sección B si no existe
        if (!hasBSection) {
          const sectionB = {
            id: crypto.randomUUID(),
            uniqueCode: EducationCodeGenerator.generateSectionCode(),
            name: 'B',
            courseId: course.id,
            studentCount: 0,
      maxStudents: 45,
            subjects: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newSections.push(sectionB);
          createdCount++;
          console.log(`Created section B for ${course.name}`);
        }
      }

      console.log(`Total sections to create: ${newSections.length}`);

      // Guardar las nuevas secciones
      if (newSections.length > 0) {
        const allSections = [...existingSections, ...newSections];
        year ? LocalStorageManager.setSectionsForYear(year, allSections) : LocalStorageManager.setSections(allSections);
      }

      return {
        success: true,
        created: createdCount,
        message: translate ? 
          (translate('sectionsCreatedForCourses') || 'Se crearon {{count}} secciones para {{courses}} cursos')
            .replace('{{count}}', createdCount.toString())
            .replace('{{courses}}', basicaMediaCourses.length.toString()) :
          `Se crearon ${createdCount} secciones para ${basicaMediaCourses.length} cursos`
      };

    } catch (error: any) {
      console.error('Error creating standard sections:', error);
      return {
        success: false,
        created: 0,
        message: translate ? (translate('errorCreatingAutomaticSections') || 'Error al crear las secciones automáticas') : 'Error al crear las secciones automáticas'
      };
    }
  }

  /**
   * Obtener estadísticas de secciones por curso
   */
  static getSectionStats(year?: number): { courseId: string; courseName: string; sectionsCount: number; hasAB: boolean }[] {
    const courses = year ? LocalStorageManager.getCoursesForYear(year) : LocalStorageManager.getCourses();
    const sections = year ? LocalStorageManager.getSectionsForYear(year) : LocalStorageManager.getSections();

    return courses.map((course: Course) => {
      const courseSections = sections.filter((section: Section) => section.courseId === course.id);
      const hasA = courseSections.some((section: Section) => section.name === 'A');
      const hasB = courseSections.some((section: Section) => section.name === 'B');

      return {
        courseId: course.id,
        courseName: course.name,
        sectionsCount: courseSections.length,
        hasAB: hasA && hasB
      };
    });
  }

  /**
   * Crear cursos estándar del sistema educativo chileno
   */
  static createStandardCourses(translate?: (key: string) => string, year?: number): { success: boolean; created: number; message: string } {
    try {
      const existingCourses = year ? LocalStorageManager.getCoursesForYear(year) : LocalStorageManager.getCourses();
      const newCourses = [];

      // Cursos de Educación Básica
      const basicaCourses = [
        '1ro Básico', '2do Básico', '3ro Básico', '4to Básico',
        '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'
      ];

      // Cursos de Educación Media
      const mediaCourses = [
        '1ro Medio', '2do Medio', '3ro Medio', '4to Medio'
      ];

      // Crear cursos de básica
      for (const courseName of basicaCourses) {
        const exists = existingCourses.some((course: Course) => course.name === courseName);
        if (!exists) {
          const newCourse = {
            id: crypto.randomUUID(),
            uniqueCode: EducationCodeGenerator.generateCourseCode(),
            name: courseName,
            level: 'basica' as const,
            description: '',
            sections: [],
            subjects: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newCourses.push(newCourse);
        }
      }

      // Crear cursos de media
      for (const courseName of mediaCourses) {
        const exists = existingCourses.some((course: Course) => course.name === courseName);
        if (!exists) {
          const newCourse = {
            id: crypto.randomUUID(),
            uniqueCode: EducationCodeGenerator.generateCourseCode(),
            name: courseName,
            level: 'media' as const,
            description: '',
            sections: [],
            subjects: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newCourses.push(newCourse);
        }
      }

      // Guardar los nuevos cursos
      if (newCourses.length > 0) {
        const allCourses = [...existingCourses, ...newCourses];
        year ? LocalStorageManager.setCoursesForYear(year, allCourses) : LocalStorageManager.setCourses(allCourses);
      }

      return {
        success: true,
        created: newCourses.length,
        message: translate ? 
          (translate('standardCoursesCreated') || 'Se crearon {{count}} cursos estándar')
            .replace('{{count}}', newCourses.length.toString()) :
          `Se crearon ${newCourses.length} cursos estándar`
      };

    } catch (error) {
      console.error('Error creating standard courses:', error);
      return {
        success: false,
        created: 0,
        message: translate ? (translate('errorCreatingStandardCourses') || 'Error al crear los cursos estándar') : 'Error al crear los cursos estándar'
      };
    }
  }

  /**
   * Recalcula los contadores de estudiantes en todas las secciones
   */
  static recalculateSectionCounts(translate?: (key: string) => string, year?: number): { success: boolean; message: string; updated: number } {
    try {
  // Primero: sanear vínculos rotos si recrearon cursos/secciones
  try { this.sanitizeStudentLinks(year); } catch {}

  // Segundo: intentar reasignar estudiantes a secciones actuales usando nombres
  try { this.reassignStudentsToExistingSections(year); } catch {}

      // 1) Cargar secciones del año (o global legacy)
      const sections = (year ? LocalStorageManager.getSectionsForYear(year) : LocalStorageManager.getSections()).map((section: any) => ({ ...section }));

      // 2) Fuente primaria: asignaciones de estudiantes por año (garantiza consistencia)
      const assignments = year ? LocalStorageManager.getStudentAssignmentsForYear(year) : [];

      // 3) Fuente secundaria: colección anual de estudiantes
      const studentsYear = year ? LocalStorageManager.getStudentsForYear(year) : LocalStorageManager.getStudents();

      // 4) Fallback final: usuarios globales (legacy) con role=student
      const globalUsersRaw = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const fallbackStudents = Array.isArray(globalUsersRaw)
        ? globalUsersRaw.filter((u: any) => (u.role === 'student') && (u.sectionId || u.section))
        : [];

      // Resetear todos los contadores a 0
      const updatedSections = sections.map((section: any) => ({
        ...section,
        studentCount: 0
      }));

      // Contar estudiantes por sección
      if (Array.isArray(assignments) && assignments.length > 0) {
        // Usar asignaciones (studentId, sectionId) garantizadas
        const bySection = new Map<string, Set<string>>();
        for (const a of assignments) {
          if (!a?.sectionId || !a?.studentId) continue;
          if (!bySection.has(a.sectionId)) bySection.set(a.sectionId, new Set());
          bySection.get(a.sectionId)!.add(a.studentId);
        }
        for (const [sectionId, set] of bySection.entries()) {
          const idx = updatedSections.findIndex((s: any) => s.id === sectionId);
          if (idx !== -1) updatedSections[idx].studentCount = set.size;
        }
      } else if (Array.isArray(studentsYear) && studentsYear.length > 0) {
        // Usar estudiantes del año (sectionId en el registro)
        studentsYear.forEach((student: any) => {
          const sid = student.sectionId || student.section; // tolerar campo legacy
          if (sid) {
            const sectionIndex = updatedSections.findIndex((s: any) => s.id === sid);
            if (sectionIndex !== -1) {
              updatedSections[sectionIndex].studentCount++;
            }
          }
        });
      } else if (fallbackStudents.length > 0) {
        // Fallback final a usuarios globales (legacy)
        fallbackStudents.forEach((student: any) => {
          const sid = student.sectionId || student.section;
          if (sid) {
            const sectionIndex = updatedSections.findIndex((s: any) => s.id === sid);
            if (sectionIndex !== -1) {
              updatedSections[sectionIndex].studentCount++;
            }
          }
        });
      }

      // Guardar las secciones actualizadas
  year ? LocalStorageManager.setSectionsForYear(year, updatedSections) : LocalStorageManager.setSections(updatedSections);

      return {
        success: true,
        updated: updatedSections.length,
        message: translate ? 
          (translate('countersRecalculated') || 'Se recalcularon los contadores de {{count}} secciones')
            .replace('{{count}}', updatedSections.length.toString()) :
          `Se recalcularon los contadores de ${updatedSections.length} secciones`
      };

    } catch (error) {
      console.error('Error recalculating section counts:', error);
      return {
        success: false,
        updated: 0,
        message: translate ? (translate('errorRecalculatingCounters') || 'Error al recalcular los contadores') : 'Error al recalcular los contadores'
      };
    }
  }
}
