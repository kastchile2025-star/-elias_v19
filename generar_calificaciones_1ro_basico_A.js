#!/usr/bin/env node
/**
 * Generador de CSV de calificaciones para 1ro Básico A
 * Requerimientos:
 *  1. 10 actividades (notas) para 1er semestre (Mar-Jun) y 10 para 2do semestre (Jul-Dic) por asignatura
 *  2. Todas las asignaturas asignadas a 1ro Básico (A) (usamos set estándar: Lenguaje y Comunicación, Matemáticas, Ciencias Naturales, Historia, Geografía y Ciencias Sociales)
 *  3. Notas aleatorias entre 1 y 100 (enteros)
 *  4. Formato de salida similar a calificaciones_ejemplo_carga_masiva_v2_con_tema.csv (incluye columna tema)
 *
 * Uso:
 *    node generar_calificaciones_1ro_basico_A.js > calificaciones_1ro_basico_A.csv
 */

const fs = require('fs');
const path = require('path');
// Fuente de usuarios consolidada (v2) ubicada en public/test-data
const INPUT = path.resolve(__dirname, 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');

// Asignaturas base para 1ro Básico (nombres estandarizados usados en CSVs de ejemplo)
const SUBJECTS = [
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Ciencias Naturales',
  'Historia, Geografía y Ciencias Sociales'
];

// Tipos de actividad rotativos
const ACTIVITY_TYPES = ['prueba', 'tarea', 'evaluacion'];

// Temas generados simples por asignatura (se ciclan)
const SUBJECT_TOPICS = {
  'Lenguaje y Comunicación': [
    'Comprensión lectora',
    'Escritura básica',
    'Vocales y consonantes',
    'Palabras frecuentes',
    'Textos breves'
  ],
  'Matemáticas': [
    'Números 1-20',
    'Suma y resta básica',
    'Figuras geométricas',
    'Secuencias numéricas',
    'Comparación de cantidades'
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

function parseCSV(raw) {
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = lines[0].split(',');
  return lines.slice(1).map(line => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // split simple respetando comillas
    const rec = {};
    header.forEach((h, i) => rec[h.trim()] = (cols[i] || '').replace(/^"|"$/g, ''));
    return rec;
  });
}

// Generar fechas espaciadas dentro de rangos de semestre
function generateSemesterDates(year) {
  // 1er semestre: Marzo (03) a Junio (06) → generamos 10 fechas uniformes
  // 2do semestre: Julio (07) a Noviembre (11) / Diciembre (12) → 10 fechas
  const first = [];
  const second = [];
  // Elegimos días representativos (5 del mes medio, etc.) distribuidos
  const firstMonths = [3,3,4,4,5,5,5,6,6,6];
  const secondMonths = [7,7,8,8,9,9,10,10,11,11];
  firstMonths.forEach((m, idx) => {
    const day = 5 + (idx * 2); // simple progresión
    first.push(new Date(year, m-1, Math.min(day, 28)));
  });
  secondMonths.forEach((m, idx) => {
    const day = 4 + (idx * 2);
    second.push(new Date(year, m-1, Math.min(day, 28)));
  });
  return { first, second };
}

function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Lectura de usuarios
const rawUsers = fs.readFileSync(INPUT, 'utf8');
const users = parseCSV(rawUsers);
// Filtrar estudiantes de 1ro Básico A
const students = users.filter(u => u.role === 'student' && u.course === '1ro Básico' && u.section === 'A');
if (!students.length) {
  console.error('No se encontraron estudiantes para 1ro Básico A');
  process.exit(1);
}

const { first: firstSemDates, second: secondSemDates } = generateSemesterDates(2025);

// Cabecera CSV extendida con tema
const header = 'nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema';
const rows = [header];

students.forEach(stu => {
  SUBJECTS.forEach(subject => {
    // 10 actividades 1er semestre + 10 segundo semestre
    firstSemDates.forEach((date, idx) => {
      const tipo = ACTIVITY_TYPES[idx % ACTIVITY_TYPES.length];
      const topics = SUBJECT_TOPICS[subject] || ['Tema'];
      const tema = topics[idx % topics.length];
      const nota = randInt(1, 100); // entero 1..100
      rows.push([
        stu.name,
        stu.rut,
        stu.course,
        stu.section,
        subject,
        tipo,
        formatDateISO(date),
        nota,
        tema
      ].map(v => String(v).includes(',') ? `"${v}"` : v).join(','));
    });
    secondSemDates.forEach((date, idx) => {
      const tipo = ACTIVITY_TYPES[idx % ACTIVITY_TYPES.length];
      const topics = SUBJECT_TOPICS[subject] || ['Tema'];
      const tema = topics[idx % topics.length];
      const nota = randInt(1, 100);
      rows.push([
        stu.name,
        stu.rut,
        stu.course,
        stu.section,
        subject,
        tipo,
        formatDateISO(date),
        nota,
        tema
      ].map(v => String(v).includes(',') ? `"${v}"` : v).join(','));
    });
  });
});

const output = rows.join('\n');
const outPath = path.resolve(__dirname, 'public/test-data/calificaciones_1ro_basico_A_2025.csv');
fs.writeFileSync(outPath, output, 'utf8');
console.log('Generado', path.basename(outPath), 'con', rows.length - 1, 'registros');
