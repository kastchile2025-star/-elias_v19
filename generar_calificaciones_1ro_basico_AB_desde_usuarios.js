#!/usr/bin/env node
/**
 * Genera CSV de calificaciones SOLO para 1ro Básico A y B
 * a partir de `public/test-data/users-consolidated-2025-CORREGIDO_v2.csv`.
 * - 10 actividades por asignatura por semestre (20/año)
 * - Fechas: S1 (mar-jun), S2 (jul-dic)
 * - Tipos: prueba, tarea, evaluacion
 * - Notas: 1..100
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.resolve(__dirname, 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const OUTPUT = path.resolve(__dirname, 'public/test-data/grades-1ro-basico-AB-2025-DERIVADO_USUARIOS_TEMA.csv');

// Códigos → nombres de asignaturas
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

const BASIC_DEFAULT_SUBJECTS = [
  'Matemáticas',
  'Lenguaje y Comunicación',
  'Ciencias Naturales',
  'Historia, Geografía y Ciencias Sociales'
];

const ACTIVITY_TYPES = ['prueba', 'tarea', 'evaluacion'];

// Temas por asignatura (se ciclan si se excede)
const SUBJECT_TOPICS = {
  'Matemáticas': [
    'Números 1-20',
    'Suma y resta básica',
    'Figuras geométricas',
    'Secuencias numéricas',
    'Comparación de cantidades'
  ],
  'Lenguaje y Comunicación': [
    'Comprensión lectora',
    'Escritura básica',
    'Vocales y consonantes',
    'Palabras frecuentes',
    'Textos breves'
  ],
  'Ciencias Naturales': [
    'Seres vivos',
    'Plantas y partes',
    'Cinco sentidos',
    'Ciclo del agua',
    'Hábitat de animales'
  ],
  'Historia, Geografía y Ciencias Sociales': [
    'Mi familia',
    'Mi comunidad',
    'Ubicación espacial',
    'Tradiciones',
    'Símbolos patrios'
  ]
};

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function splitCSVLine(line) {
  const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;
  const parts = [];
  let lastIndex = 0;
  line.replace(regex, (m, idx) => { parts.push(line.slice(lastIndex, idx)); lastIndex = idx + 1; });
  parts.push(line.slice(lastIndex));
  return parts.map(s => s.replace(/^\s*\"?|\"?\s*$/g, '').replace(/^\"|\"$/g, ''));
}

function parseCSV(raw) {
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = splitCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const rec = {}; header.forEach((h, i) => rec[h] = (cols[i] || '')); return rec;
  });
}

function formatDateISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function generateSemesterDates(year) {
  const first = []; const firstMonths = [3,3,4,4,5,5,5,6,6,6];
  firstMonths.forEach((m,i)=>first.push(new Date(year, m-1, Math.min(5+(i*2),28))));
  const second = []; const secondMonths = [7,7,8,8,9,9,10,10,11,12];
  secondMonths.forEach((m,i)=>second.push(new Date(year, m-1, Math.min(4+(i*2),28))));
  return { first, second };
}

function main() {
  const raw = fs.readFileSync(INPUT, 'utf8');
  const rows = parseCSV(raw);

  const students = rows.filter(r => r.role === 'student' && r.course === '1ro Básico' && (r.section === 'A' || r.section === 'B'))
                       .map(s => ({ name: s.name, rut: s.rut, course: s.course, section: s.section }));

  const teachers = rows.filter(r => r.role === 'teacher' && r.course === '1ro Básico' && (r.section === 'A' || r.section === 'B'));

  // curso+seccion → Map(subject → [teachers])
  const subjByCourseSec = new Map();
  for (const t of teachers) {
    const key = `${t.course}|${t.section}`;
    const subjectName = SUBJECT_CODE_MAP[(t.subjects||'').trim()];
    if (!subjectName) continue;
    if (!subjByCourseSec.has(key)) subjByCourseSec.set(key, new Map());
    const inner = subjByCourseSec.get(key);
    if (!inner.has(subjectName)) inner.set(subjectName, []);
    inner.get(subjectName).push(t.name);
  }

  // agrupar estudiantes por curso+seccion
  const byCourseSec = new Map();
  for (const s of students) {
    const key = `${s.course}|${s.section}`;
    if (!byCourseSec.has(key)) byCourseSec.set(key, []);
    byCourseSec.get(key).push(s);
  }

  const { first: firstSem, second: secondSem } = generateSemesterDates(2025);
  // Encabezado requerido (sin profesor, con tema, en minúsculas)
  const out = ['nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema'];
  let total = 0;

  for (const [key, stuList] of byCourseSec.entries()) {
    let subjectsMap = subjByCourseSec.get(key);
    if (!subjectsMap) {
      // Fallback: incluir 4 asignaturas básicas sin profesor asignado
      subjectsMap = new Map(BASIC_DEFAULT_SUBJECTS.map(s => [s, ['Profesor no asignado']]));
    }
    for (const stu of stuList) {
      for (const [subjectName, profList] of subjectsMap.entries()) {
        const teachersArr = profList.length ? profList : ['Profesor no asignado'];
        for (let i=0;i<firstSem.length;i++) {
          const temaList = SUBJECT_TOPICS[subjectName] || ['Tema'];
            const row = [
              stu.name,
              stu.rut,
              stu.course,
              stu.section,
              subjectName,
              ACTIVITY_TYPES[i % ACTIVITY_TYPES.length],
              formatDateISO(firstSem[i]),
              randInt(1,100),
              temaList[i % temaList.length]
            ];
            out.push(row.map(v => String(v).includes(',') ? `"${v}`+`"` : String(v)).join(','));
            total++;
        }
        for (let i=0;i<secondSem.length;i++) {
          const temaList = SUBJECT_TOPICS[subjectName] || ['Tema'];
            const row = [
              stu.name,
              stu.rut,
              stu.course,
              stu.section,
              subjectName,
              ACTIVITY_TYPES[i % ACTIVITY_TYPES.length],
              formatDateISO(secondSem[i]),
              randInt(1,100),
              temaList[i % temaList.length]
            ];
            out.push(row.map(v => String(v).includes(',') ? `"${v}`+`"` : String(v)).join(','));
            total++;
        }
      }
    }
  }

  fs.writeFileSync(OUTPUT, out.join('\n'), 'utf8');
  console.log(`✅ Generado ${path.basename(OUTPUT)} con ${total} registros (incluye columna tema).`);
}

if (require.main === module) {
  main();
}
