#!/usr/bin/env node
/*
  Deduplica un CSV de calificaciones usando como clave lógica:
  RUT | Curso | Sección | Asignatura | Tipo | Fecha

  Uso:
    node scripts/dedup-csv.js <input.csv> <output.csv>
*/
const fs = require('fs');

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
function toId(...parts) {
  return parts
    .map((p) => String(p || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, ''))
    .filter(Boolean)
    .join('-');
}
function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result.map((f) => (f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1).replace(/""/g, '"') : f));
}
function csvEscape(s) {
  const t = String(s ?? '');
  return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}

function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.error('Uso: node scripts/dedup-csv.js <input.csv> <output.csv>');
    process.exit(1);
  }
  const text = fs.readFileSync(input, 'utf-8').replace(/\r\n?/g, '\n');
  const lines = text.split('\n').filter((l) => l.length > 0);
  const header = parseLine(lines[0]);
  const data = lines.slice(1);
  const col = {
    rut: header.findIndex((h) => ['rut', 'studentid', 'id'].includes(norm(h))),
    curso: header.findIndex((h) => ['curso', 'course', 'courseid'].includes(norm(h))),
    seccion: header.findIndex((h) => ['seccion', 'section', 'sectionid'].includes(norm(h))),
    asignatura: header.findIndex((h) => ['asignatura', 'subject', 'subjectid'].includes(norm(h))),
    tipo: header.findIndex((h) => ['tipo', 'type'].includes(norm(h))),
    fecha: header.findIndex((h) => ['fecha', 'gradedat', 'date'].includes(norm(h))),
  };
  for (const [k, v] of Object.entries(col)) {
    if (v < 0) { console.error(`Columna faltante: ${k}`); process.exit(2); }
  }
  const seen = new Set();
  const out = [header.join(',')];
  let dups = 0;
  for (const line of data) {
    const cols = parseLine(line);
    if (!cols.length) continue;
    const key = [
      cols[col.rut] || '',
      toId(cols[col.curso] || ''),
      toId(cols[col.seccion] || ''),
      toId(cols[col.asignatura] || 'general'),
      norm(cols[col.tipo] || ''),
      cols[col.fecha] || ''
    ].join('|');
    if (seen.has(key)) { dups++; continue; }
    seen.add(key);
    // Reescribir línea con CSV escaping seguro manteniendo el orden de columnas original
    const safeLine = header.map((_, i) => csvEscape(cols[i] ?? '')).join(',');
    out.push(safeLine);
  }
  fs.writeFileSync(output, out.join('\n'), 'utf-8');
  console.log(JSON.stringify({ input, output, totalIn: lines.length - 1, totalOut: out.length - 1, removedDuplicates: dups }, null, 2));
}

main();
