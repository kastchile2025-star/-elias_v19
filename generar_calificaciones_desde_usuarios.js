#!/usr/bin/env node
/**
 * Genera un CSV de calificaciones para TODOS los estudiantes y asignaturas
 * definidos en `public/test-data/users-consolidated-2025-CORREGIDO_v2.csv`.
 *
 * - 10 actividades por asignatura por semestre (20 al año)
 * - Sem 1: marzo-junio | Sem 2: julio-diciembre
 * - Tipos: prueba, tarea, evaluacion
 * - Notas: 1..100 (enteros)
 * - Header compatible con carga masiva: Nombre,RUT,Curso,Sección,Asignatura,Profesor,Fecha,Tipo,Nota
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.resolve(__dirname, 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const OUTPUT = path.resolve(__dirname, 'public/test-data/grades-consolidated-2025-DERIVADO_USUARIOS.csv');

// Map de códigos → nombres de asignaturas estándar
const SUBJECT_CODE_MAP = {
  MAT: 'Matemáticas',
  LEN: 'Lenguaje y Comunicación',
  CNT: 'Ciencias Naturales',
  HIS: 'Historia, Geografía y Ciencias Sociales',
  BIO: 'Biología',
  FIS: 'Física',
  QUI: 'Química',
  FIL: 'Filosofía',
  EDC: 'Educación Ciudadana',
  ING: 'Inglés',
  EFI: 'Educación Física',
  MUS: 'Música',
  ART: 'Artes Visuales',
  TEC: 'Tecnología',
  REL: 'Religión'
};

const ACTIVITY_TYPES = ['prueba', 'tarea', 'evaluacion'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function splitCSVLine(line) {
  // separa por comas respetando comillas
  const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;
  const parts = [];
  let lastIndex = 0;
  line.replace(regex, (m, idx) => {
    parts.push(line.slice(lastIndex, idx));
    lastIndex = idx + 1;
    return m;
  });
  parts.push(line.slice(lastIndex));
  return parts.map(s => s.replace(/^\s*\"?|\"?\s*$/g, '').replace(/^\"|\"$/g, ''));
}

function parseCSV(raw) {
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = splitCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const rec = {};
    header.forEach((h, i) => rec[h] = (cols[i] || ''));
    return rec;
  });
}

function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateSemesterDates(year) {
  // 10 fechas 1er semestre (Mar-Jun)
  const first = [];
  const firstMonths = [3,3,4,4,5,5,5,6,6,6];
  firstMonths.forEach((m, i) => {
    const day = 5 + (i * 2);
    first.push(new Date(year, m - 1, Math.min(day, 28)));
  });

  // 10 fechas 2do semestre (Jul-Dic, incluye Dic)
  const second = [];
  const secondMonths = [7,7,8,8,9,9,10,10,11,12];
  secondMonths.forEach((m, i) => {
    const day = 4 + (i * 2);
    second.push(new Date(year, m - 1, Math.min(day, 28)));
  });

  return { first, second };
}

function main() {
  const raw = fs.readFileSync(INPUT, 'utf8');
  const rows = parseCSV(raw);

  // Filtrar y mapear estudiantes por curso+sección
  const students = rows.filter(r => (r.role || r["role"]) === 'student');
  const teachers = rows.filter(r => (r.role || r["role"]) === 'teacher');

  const byCourseSec = new Map();
  for (const s of students) {
    const key = `${s.course}|${s.section}`;
    if (!byCourseSec.has(key)) byCourseSec.set(key, []);
    byCourseSec.get(key).push({ name: s.name, rut: s.rut, course: s.course, section: s.section });
  }

  // Mapa de asignaturas disponibles por curso+sección, con profesores
  const subjByCourseSec = new Map(); // key → Map(subjectName → [teachers])
  for (const t of teachers) {
    const key = `${t.course}|${t.section}`;
    const code = (t.subjects || '').trim();
    const subjectName = SUBJECT_CODE_MAP[code];
    if (!subjectName) continue; // ignorar códigos no mapeados
    if (!subjByCourseSec.has(key)) subjByCourseSec.set(key, new Map());
    const inner = subjByCourseSec.get(key);
    if (!inner.has(subjectName)) inner.set(subjectName, []);
    inner.get(subjectName).push(t.name);
  }

  const { first: firstSem, second: secondSem } = generateSemesterDates(2025);

  const header = 'Nombre,RUT,Curso,Sección,Asignatura,Profesor,Fecha,Tipo,Nota';
  const out = [header];

  let total = 0;
  for (const [key, stuList] of byCourseSec.entries()) {
    const subjectsMap = subjByCourseSec.get(key);
    if (!subjectsMap) {
      // Si no hay profesores/asignaturas declaradas, saltamos esta combinación
      continue;
    }

    for (const stu of stuList) {
      for (const [subjectName, profList] of subjectsMap.entries()) {
        const teachersArr = profList.length ? profList : ['Profesor no asignado'];
        // 10 actividades 1er semestre
        for (let i = 0; i < firstSem.length; i++) {
          const tipo = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
          const fecha = formatDateISO(firstSem[i]);
          const profesor = teachersArr[i % teachersArr.length];
          const nota = randInt(1, 100);
          out.push([
            stu.name,
            stu.rut,
            stu.course,
            stu.section,
            subjectName,
            profesor,
            fecha,
            tipo,
            nota
          ].map(v => String(v).includes(',') ? `"${v}"` : String(v)).join(','));
          total++;
        }
        // 10 actividades 2do semestre
        for (let i = 0; i < secondSem.length; i++) {
          const tipo = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
          const fecha = formatDateISO(secondSem[i]);
          const profesor = teachersArr[i % teachersArr.length];
          const nota = randInt(1, 100);
          out.push([
            stu.name,
            stu.rut,
            stu.course,
            stu.section,
            subjectName,
            profesor,
            fecha,
            tipo,
            nota
          ].map(v => String(v).includes(',') ? `"${v}"` : String(v)).join(','));
          total++;
        }
      }
    }
  }

  fs.writeFileSync(OUTPUT, out.join('\n'), 'utf8');
  console.log(`✅ Generado ${path.basename(OUTPUT)} con ${total} registros.`);
}

if (require.main === module) {
  main();
}
