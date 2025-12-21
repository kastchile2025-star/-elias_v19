#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const USERS_CSV = path.resolve(__dirname, '../public/test-data/users-consolidated-2025-CORREGIDO.csv');
const OUTPUT_CSV = path.resolve(__dirname, '../public/test-data/calificaciones_1roA_todas_asignaturas_v1.csv');

// Asignaturas canon para 1ro Básico
const SUBJECTS = [
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Historia, Geografía y Ciencias Sociales',
  'Ciencias Naturales',
  'Educación Física',
  'Artes Visuales',
  'Música',
  'Inglés',
  'Tecnología',
  'Orientación',
];

const TYPES = ['tarea', 'evaluacion', 'prueba'];

// 10 fechas S1 (Mar-Jun) y 10 fechas S2 (Jul-Dic) - distribuidas semanal/quincenal
const DATES_S1 = [
  '2025-03-05','2025-03-12','2025-03-19','2025-03-26',
  '2025-04-09','2025-04-23',
  '2025-05-07','2025-05-21',
  '2025-06-04','2025-06-18'
];
const DATES_S2 = [
  '2025-07-09','2025-07-23',
  '2025-08-06','2025-08-20',
  '2025-09-03','2025-09-17',
  '2025-10-01','2025-10-15','2025-10-29',
  '2025-11-12','2025-11-26',
  '2025-12-10','2025-12-17'
].slice(0,10); // asegurar 10

function escapeCSV(value){
  if (value == null) return '';
  const str = String(value);
  // Si contiene coma, comillas o salto de línea, envolver y escapar
  if (/[",\n\r]/.test(str)){
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function readUsers(){
  const raw = fs.readFileSync(USERS_CSV, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim());
  const header = lines.shift();
  const cols = header.split(',').map(s => s.trim().toLowerCase());
  const idx = {
    role: cols.indexOf('role'),
    name: cols.indexOf('name'),
    rut: cols.indexOf('rut'),
    course: cols.indexOf('course'),
    section: cols.indexOf('section'),
  };
  const students = [];
  for (const line of lines){
    const parts = line.split(','); // campos de este CSV no esperan comas internas
    const role = (parts[idx.role]||'').trim();
    const course = (parts[idx.course]||'').trim();
    const section = (parts[idx.section]||'').trim();
    if (role === 'student' && course === '1ro Básico' && section === 'A'){
      students.push({
        nombre: (parts[idx.name]||'').trim(),
        rut: (parts[idx.rut]||'').trim(),
      });
    }
  }
  return students;
}

function makeTopicsFor(subject){
  // 20 temas simples por asignatura
  const base = [
    'Unidad 1','Unidad 2','Unidad 3','Unidad 4','Unidad 5',
    'Unidad 6','Unidad 7','Unidad 8','Unidad 9','Unidad 10',
    'Unidad 11','Unidad 12','Unidad 13','Unidad 14','Unidad 15',
    'Unidad 16','Unidad 17','Unidad 18','Unidad 19','Unidad 20'
  ];
  return base.map((u,i)=> `${u} - ${subject}`);
}

function generate(){
  const students = readUsers();
  if (students.length === 0){
    console.error('No se encontraron estudiantes para 1ro Básico A en el CSV de usuarios.');
    process.exit(1);
  }
  console.log(`Estudiantes detectados 1ro Básico A: ${students.length}`);

  const header = 'nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema\n';
  const out = fs.createWriteStream(OUTPUT_CSV, {encoding:'utf8'});
  out.write(header);

  let rows = 0;
  for (const s of students){
    for (const subject of SUBJECTS){
      const fechas = [...DATES_S1, ...DATES_S2]; // 20
      const temas = makeTopicsFor(subject);
      for (let i=0;i<fechas.length;i++){
        const fecha = fechas[i];
        const tipo = TYPES[i % TYPES.length];
        // distribuir nota semi-aleatoria 60-100
        const nota = 60 + ((i*7 + s.rut.length + subject.length) % 41); // 60..100 determinista
        const line = [
          escapeCSV(s.nombre),
          escapeCSV(s.rut),
          escapeCSV('1ro Básico'),
          'A',
          escapeCSV(subject),
          escapeCSV(tipo),
          fecha,
          nota,
          escapeCSV(temas[i])
        ].join(',') + '\n';
        out.write(line);
        rows++;
      }
    }
  }
  out.end();
  out.on('finish', ()=>{
    console.log(`Archivo generado: ${OUTPUT_CSV}`);
    console.log(`Filas totales: ${rows}`);
  });
}

if (require.main === module){
  generate();
}
