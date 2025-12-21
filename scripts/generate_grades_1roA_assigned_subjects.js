#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const USERS_CSV = path.resolve(__dirname, '../public/test-data/users-consolidated-2025-CORREGIDO.csv');
const OUTPUT_CSV = path.resolve(__dirname, '../public/test-data/calificaciones_1roA_asignadas_v1.csv');

// Solo asignaturas realmente asignadas al curso (nivel básica)
const SUBJECTS = [
  'Ciencias Naturales',
  'Historia, Geografía y Ciencias Sociales',
  'Lenguaje y Comunicación',
  'Matemáticas'
];

const TYPES = ['tarea', 'evaluacion', 'prueba'];

// 10 fechas primer semestre (Mar-Jun)
const DATES_S1 = [
  '2025-03-05','2025-03-12','2025-03-19','2025-03-26',
  '2025-04-09','2025-04-23',
  '2025-05-07','2025-05-21',
  '2025-06-04','2025-06-18'
];
// 10 fechas segundo semestre (Jul-Nov/Dec)
const DATES_S2 = [
  '2025-07-09','2025-07-23',
  '2025-08-06','2025-08-20',
  '2025-09-03','2025-09-17',
  '2025-10-01','2025-10-15',
  '2025-10-29','2025-11-12'
];

function escapeCSV(value){
  if (value == null) return '';
  const str = String(value);
  return /[",\n\r]/.test(str) ? '"' + str.replace(/"/g,'""') + '"' : str;
}

function readStudents(){
  const raw = fs.readFileSync(USERS_CSV,'utf8');
  const lines = raw.split(/\r?\n/).filter(l=>l.trim());
  const header = lines.shift();
  const cols = header.split(',').map(c=>c.trim().toLowerCase());
  const idx = {
    role: cols.indexOf('role'),
    name: cols.indexOf('name'),
    rut: cols.indexOf('rut'),
    course: cols.indexOf('course'),
    section: cols.indexOf('section')
  };
  const students = [];
  for (const line of lines){
    const parts = line.split(',');
    if ((parts[idx.role]||'').trim()==='student' && (parts[idx.course]||'').trim()==='1ro Básico' && (parts[idx.section]||'').trim()==='A'){
      students.push({ nombre:(parts[idx.name]||'').trim(), rut:(parts[idx.rut]||'').trim() });
    }
  }
  return students;
}

function topics(subject){
  return Array.from({length:20}, (_,i)=>`Unidad ${i+1} - ${subject}`);
}

function generate(){
  const students = readStudents();
  if (!students.length){
    console.error('No se encontraron estudiantes 1ro Básico A');
    process.exit(1);
  }
  const out = fs.createWriteStream(OUTPUT_CSV,{encoding:'utf8'});
  out.write('nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema\n');
  let rows=0;
  for (const stu of students){
    for (const subject of SUBJECTS){
      const fechas = [...DATES_S1, ...DATES_S2]; // 20
      const tps = topics(subject);
      for (let i=0;i<fechas.length;i++){
        const fecha = fechas[i];
        const tipo = TYPES[i % TYPES.length];
        // Nota determinista 60..100
        const nota = 60 + ((i*13 + subject.length + stu.rut.length) % 41);
        const line = [
          escapeCSV(stu.nombre),
          escapeCSV(stu.rut),
          '1ro Básico',
          'A',
            escapeCSV(subject),
          tipo,
          fecha,
          nota,
          escapeCSV(tps[i])
        ].join(',')+'\n';
        out.write(line); rows++;
      }
    }
  }
  out.end(()=>{
    console.log(`Archivo generado: ${OUTPUT_CSV}`);
    console.log(`Estudiantes: ${students.length}`);
    console.log(`Asignaturas: ${SUBJECTS.length}`);
    console.log(`Actividades por asignatura: 20 (10 + 10)`);
    console.log(`Filas totales: ${rows}`);
  });
}

if (require.main === module){ generate(); }
