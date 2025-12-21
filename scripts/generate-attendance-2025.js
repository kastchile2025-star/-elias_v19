#!/usr/bin/env node
/**
 * Genera un CSV de asistencia (plantilla) para carga masiva:
 * - Fechas: Lunes a Viernes desde 2025-03-01 hasta 2025-12-31
 * - Una fila por estudiante y por día hábil
 * - Columnas compatibles con el importador de asistencia del sistema
 *
 * Entrada: public/test-data/users-consolidated-2025-CORREGIDO_v2.csv
 * Salida:  public/test-data/attendance-template-2025.csv
 */

const fs = require('fs');
const path = require('path');

const USERS_CSV = path.resolve(__dirname, '../public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const OUTPUT_CSV = path.resolve(__dirname, '../public/test-data/attendance-template-2025.csv');

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u00ba\u00b0]/g, '')
    .replace(/(\d+)\s*(ro|do|to)/g, '$1')
    .replace(/\s+/g, ' ').trim();
}

function parseCSV(text) {
  // Parser simple que soporta comillas dobles para encapsular comas
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
    if (parts.length === 1 && parts[0].trim() === '') continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (parts[j] !== undefined ? parts[j] : '').trim();
    }
    rows.push(obj);
  }
  return rows;
}

function splitCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { // escapar ""
        cur += '"';
        i++; // saltar la segunda comilla
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function toISODateString(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateWeekdays(startStr, endStr) {
  const start = new Date(`${startStr}T00:00:00Z`);
  const end = new Date(`${endStr}T00:00:00Z`);
  const dates = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay(); // 0=Dom,1=Lun,...6=Sab
    if (day >= 1 && day <= 5) {
      dates.push(toISODateString(d));
    }
  }
  return dates;
}

function main() {
  if (!fs.existsSync(USERS_CSV)) {
    console.error(`No se encuentra el archivo de usuarios: ${USERS_CSV}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(USERS_CSV, 'utf8');
  const rows = parseCSV(raw);
  if (!rows.length) {
    console.error('El CSV de usuarios está vacío.');
    process.exit(1);
  }

  // Mapear encabezados a llaves conocidas
  const headerMap = {};
  const sample = rows[0];
  Object.keys(sample).forEach(k => {
    const nk = normalize(k);
    if (nk === 'role') headerMap.role = k;
    else if (nk === 'name' || nk === 'nombre') headerMap.name = k;
    else if (nk === 'rut') headerMap.rut = k;
    else if (nk === 'email' || nk === 'correo') headerMap.email = k;
    else if (nk === 'username' || nk === 'usuario') headerMap.username = k;
    else if (nk === 'password' || nk === 'contrasena' || nk === 'contraseña') headerMap.password = k;
    else if (nk === 'course' || nk === 'curso') headerMap.course = k;
    else if (nk === 'section' || nk === 'seccion' || nk === 'sección') headerMap.section = k;
    else if (nk === 'subjects' || nk === 'asignaturas') headerMap.subjects = k;
  });

  const students = rows
    .filter(r => normalize(r[headerMap.role]) === 'student')
    .map(r => ({
      name: r[headerMap.name] || '',
      rut: r[headerMap.rut] || '',
      username: r[headerMap.username] || '',
      course: r[headerMap.course] || '',
      section: r[headerMap.section] || ''
    }))
    .filter(s => s.course && s.section && (s.username || s.rut));

  if (!students.length) {
    console.error('No se encontraron estudiantes válidos con course/section y rut o username.');
    process.exit(1);
  }

  const dates = generateWeekdays('2025-03-01', '2025-12-31');

  // Encabezado compatible con el importador de asistencia
  const header = ['date','course','section','studentUsername','rut','name','status','comment'];

  // Generar filas: por defecto status = 'present'
  const outLines = [header.join(',')];

  // Ordenar por curso, sección, nombre para estabilidad
  const collator = new Intl.Collator('es', { sensitivity: 'base' });
  students.sort((a,b) => {
    const c1 = collator.compare(a.course, b.course);
    if (c1 !== 0) return c1;
    const c2 = collator.compare(a.section, b.section);
    if (c2 !== 0) return c2;
    return collator.compare(a.name, b.name);
  });

  for (const date of dates) {
    for (const s of students) {
      const row = [
        date,
        escapeCSV(s.course),
        escapeCSV(s.section),
        escapeCSV(s.username),
        escapeCSV(s.rut),
        escapeCSV(s.name),
        'present', // estado por defecto (editable a 'absent' o 'late')
        '' // comment
      ];
      outLines.push(row.join(','));
    }
  }

  // Escribir archivo
  fs.writeFileSync(OUTPUT_CSV, outLines.join('\n'), 'utf8');
  console.log(`Archivo generado: ${OUTPUT_CSV}`);
  console.log(`Estudiantes: ${students.length} | Días hábiles: ${dates.length} | Filas: ${(students.length * dates.length)}`);
}

function escapeCSV(value) {
  const s = String(value ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

if (require.main === module) {
  main();
}
