/* eslint-disable no-restricted-globals */
// Worker de importación de asistencia: recibe rows (XLSX.sheet_to_json), y catálogos mínimos
// Devuelve progreso y un arreglo de registros procesados para upsert.

type Row = Record<string, any>;

const normalize = (s: string) => String(s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[\u00ba\u00b0]/g, '')
  .replace(/(\d+)\s*(ro|do|to)/g, '$1')
  .replace(/\s+/g, ' ').trim();

const cleanRut = (rut: string) => String(rut || '')
  .replace(/\./g, '')
  .replace(/\s+/g, '')
  .toUpperCase();

const excelSerialToISO = (n: number) => {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = Math.round(n * 24 * 60 * 60 * 1000);
  const d = new Date(excelEpoch.getTime() + ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
};

const makeDateISO = (val: any) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number' && isFinite(val)) return excelSerialToISO(val);
  const v = String(val || '').trim();
  if (!v) return undefined;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`).toISOString();
  const d = new Date(v);
  if (!isNaN(d.getTime())) return d.toISOString();
  return undefined;
};

const statusMap: Record<string,string> = {
  'present':'present','presente':'present','p':'present',
  'absent':'absent','ausente':'absent','a':'absent',
  'late':'late','atraso':'late','tarde':'late','l':'late'
};

onmessage = async (e: MessageEvent) => {
  const { rows, studentsSlim, coursesSlim, sectionsSlim, batchSize = 5000 } = e.data || {};
  if (!Array.isArray(rows)) {
    // @ts-ignore
    postMessage({ type: 'error', message: 'Rows no válidos' });
    return;
  }

  // Construir índices
  const studentByRut = new Map(studentsSlim.map((s: any) => [s.rutClean, s]));
  const studentByUsername = new Map(studentsSlim.map((s: any) => [s.usernameNorm, s]));
  const courseByName = new Map(coursesSlim.map((c: any) => [c.nameNorm, c]));
  const sectionByCourseAndName = new Map(
    sectionsSlim.map((sec: any) => [ `${sec.courseId}:${sec.nameNorm}`, sec ])
  );

  const out: any[] = [];
  let created = 0;
  let errors = 0;

  const getByAliases = (obj: Row, aliases: string[]) => {
    const key = Object.keys(obj).find(k => aliases.includes(String(k).trim().toLowerCase())) as string | undefined;
    if (!key) return '';
    return (obj as any)[key];
  };

  for (let start = 0; start < rows.length; start += batchSize) {
    const end = Math.min(start + batchSize, rows.length);
    for (let i = start; i < end; i++) {
      const row = rows[i];
      const dateRaw = getByAliases(row, ['date','fecha']);
      const courseRaw = getByAliases(row, ['course','curso']);
      const sectionRaw = getByAliases(row, ['section','seccion','sección']);
      const usernameRaw = getByAliases(row, ['studentusername','usuario','alumno','username']);
      const nameRaw = getByAliases(row, ['name','nombre']);
      const rutRaw = getByAliases(row, ['rut']);
      const statusRaw = getByAliases(row, ['status','estado']);
      const comment = String(getByAliases(row, ['comment','comentario','observacion','observación']) || '').trim();

      const dateISO = makeDateISO(dateRaw);
      if (!dateISO) { errors++; continue; }

      let student: any | undefined;
      const rutClean = rutRaw ? cleanRut(String(rutRaw)) : '';
      if (rutClean && studentByRut.has(rutClean)) {
        student = studentByRut.get(rutClean);
      } else if (usernameRaw) {
        student = studentByUsername.get(normalize(String(usernameRaw)));
      }
      if (!student && nameRaw) {
        // Busqueda por nombre requiere curso+seccion, se intenta abajo si están
      }

      const status = statusMap[normalize(String(statusRaw || ''))];
      if (!status) { errors++; continue; }

      // Resolver curso y sección
      let course: any | undefined;
      let section: any | undefined;
      const courseName = String(courseRaw || '').trim();
      const sectionName = String(sectionRaw || '').trim();
      if (courseName) course = courseByName.get(normalize(courseName));
      if (!course && student?.courseId) course = coursesSlim.find((c: any) => c.id === student.courseId);
      if (!course) { errors++; continue; }
      if (sectionName) section = sectionByCourseAndName.get(`${course.id}:${normalize(sectionName)}`);
      if (!section && student?.sectionId) {
        const secCandidate = sectionsSlim.find((s: any) => s.id === student.sectionId);
        if (secCandidate && secCandidate.courseId === course.id) section = secCandidate;
      }
      if (!section && nameRaw) {
        const nameKey = normalize(String(nameRaw));
        const secCandidates = sectionsSlim.filter((s: any) => s.courseId === course.id);
        // Nota: en worker evitamos escanear todos los estudiantes; si no hay índice por nombre, se omite
      }
      if (!student) { errors++; continue; }
      if (!section) { errors++; continue; }

      out.push({
        key: `${dateISO.slice(0,10)}:${student.id}`,
        record: {
          id: `att-${student.id}-${section.id}-${dateISO.slice(0,10)}`,
          date: dateISO,
          courseId: course.id,
          sectionId: section.id,
          studentId: student.id,
          status,
          comment: comment || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      created++;
    }
    // Progreso por lote
    // @ts-ignore
    postMessage({ type: 'progress', processed: end, total: rows.length, created, errors });
    await new Promise(res => setTimeout(res, 0));
  }

  // @ts-ignore
  postMessage({ type: 'done', created, errors, results: out });
};
