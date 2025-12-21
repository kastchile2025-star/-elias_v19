#!/usr/bin/env node
/**
 * Normaliza un CSV de calificaciones con encabezado:
 * nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema
 *
 * - Corrige mojibake y tildes comunes
 * - Estandariza asignaturas (Historia -> "Historia, Geografía y Ciencias Sociales")
 * - Normaliza tipo a: tarea | prueba | evaluacion
 * - Fuerza fecha a YYYY-MM-DD
 * - Asegura nota entre 1..100
 * - Genera nuevo archivo *_NORMALIZADO.csv, citando campos con comas
 */

const fs = require('fs');
const path = require('path');

const INPUT = process.argv[2] || 'calificaciones_1ro_basico_A.csv';
const outPath = path.join(path.dirname(INPUT), path.basename(INPUT, '.csv') + '_NORMALIZADO.csv');

function fixMojibake(txt = '') {
  let s = String(txt);
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E\x0F]/g, '');
  s = s.replace(/\uFFFD/g, '');
  s = s.replace(/Â(?=[\s¡!¿?\-:;,\.])/g, '');
  // Corregir secuencias comunes de doble decodificación
  const reps = [
    [/Ã¡/g, 'á'], [/Ã©/g, 'é'], [/Ãí/g, 'í'], [/Ã³/g, 'ó'], [/Ãº/g, 'ú'], [/Ã±/g, 'ñ'],
    [/Ã/g, 'Á'], [/Ã‰/g, 'É'], [/Ã/g, 'Í'], [/Ã“/g, 'Ó'], [/Ãš/g, 'Ú'], [/Ã‘/g, 'Ñ'],
  ];
  reps.forEach(([rgx, to]) => { s = s.replace(rgx, to); });
  // Palabras frecuentes
  s = s
    .replace(/comunicacion/gi, 'comunicación')
    .replace(/educacion/gi, 'educación')
    .replace(/evaluacion/gi, 'evaluación')
    .replace(/matematicas/gi, 'matemáticas')
    .replace(/geografia/gi, 'geografía')
    .replace(/historia y geografia/gi, 'Historia, Geografía y Ciencias Sociales');
  return s.normalize('NFC').trim();
}

function canonicalSubject(s = '') {
  const n = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (n.startsWith('historia y geografia') || n.includes('historia, geografia')) return 'Historia, Geografía y Ciencias Sociales';
  if (n.startsWith('ciencias naturales')) return 'Ciencias Naturales';
  if (n.startsWith('lenguaje y comunic')) return 'Lenguaje y Comunicación';
  if (n.startsWith('matemat')) return 'Matemáticas';
  return s; // dejar tal cual si ya es válido
}

function normalizeTipo(t = '') {
  const n = t.toLowerCase().trim();
  if (n.startsWith('tarea')) return 'tarea';
  if (n.startsWith('prueb')) return 'prueba';
  if (n.startsWith('evalu')) return 'evaluacion';
  return 'tarea';
}

function toISODate(d = '') {
  // Espera YYYY-MM-DD o DD/MM/YYYY; devuelve YYYY-MM-DD
  let s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const dd = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  // fallback: intentar Date.parse
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }
  return s;
}

function quote(val) {
  const s = String(val == null ? '' : val);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function clampScore(x) {
  const n = Math.max(1, Math.min(100, Math.round(Number(x) || 0)));
  return n;
}

function normalizeLine(fields) {
  // nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema
  const [nombre, rut, curso, seccion, asignatura, tipo, fecha, nota, tema] = fields;
  return [
    fixMojibake(nombre),
    rut.trim(),
    fixMojibake(curso).replace(/\b1ro\s*basico\b/i, '1ro Básico'),
    String(seccion || '').toUpperCase(),
    canonicalSubject(fixMojibake(asignatura)),
    normalizeTipo(tipo),
    toISODate(fecha),
    clampScore(nota),
    fixMojibake(tema),
  ];
}

function parseLine(line) {
  // CSV de entrada sin comillas -> split directo
  return line.split(',');
}

function run() {
  if (!fs.existsSync(INPUT)) {
    console.error(`No se encontró el archivo: ${INPUT}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(INPUT, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = lines[0];
  const expected = 'nombre,rut,curso,seccion,asignatura,tipo,fecha,nota,tema';
  const out = [expected];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i]);
    if (fields.length < 8) continue; // ignorar líneas incompletas
    const norm = normalizeLine(fields);
    out.push(norm.map(quote).join(','));
  }
  fs.writeFileSync(outPath, out.join('\n'), 'utf8');
  console.log(`✅ Archivo normalizado: ${outPath}`);
}

run();
