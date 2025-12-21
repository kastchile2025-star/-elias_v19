#!/usr/bin/env node
/*
  Analiza un CSV de calificaciones y reporta:
  - Filas totales (incluyendo header)
  - Filas de datos (sin header)
  - Duplicados por clave lógica (rut|cursoId|seccionId|asignaturaId|tipo|fechaISO)
*/
const fs = require('fs');
const path = require('path');

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
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result.map((f) => {
    if (f.startsWith('"') && f.endsWith('"')) {
      return f.slice(1, -1).replace(/""/g, '"');
    }
    return f;
  });
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/analyze-csv.js <path.csv>');
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf-8').replace(/\r\n?/g, '\n');
  const lines = text.split('\n').filter((l) => l.length > 0);
  const header = parseLine(lines[0]);
  const idx = {
    nombre: header.findIndex((h) => norm(h) === 'nombre' || norm(h) === 'student' || norm(h) === 'studentname'),
    rut: header.findIndex((h) => norm(h) === 'rut' || norm(h) === 'studentid' || norm(h) === 'id'),
    curso: header.findIndex((h) => norm(h) === 'curso' || norm(h) === 'course' || norm(h) === 'courseid'),
    seccion: header.findIndex((h) => norm(h) === 'seccion' || norm(h) === 'section' || norm(h) === 'sectionid'),
    asignatura: header.findIndex((h) => norm(h) === 'asignatura' || norm(h) === 'subject' || norm(h) === 'subjectid'),
    fecha: header.findIndex((h) => norm(h) === 'fecha' || norm(h) === 'gradedat' || norm(h) === 'date'),
    tipo: header.findIndex((h) => norm(h) === 'tipo' || norm(h) === 'type'),
    nota: header.findIndex((h) => norm(h) === 'nota' || norm(h) === 'score'),
  };
  const missing = Object.entries(idx).filter(([, v]) => v < 0).map(([k]) => k);
  const dataLines = lines.slice(1);
  const totalRows = dataLines.length;
  const seen = new Map();
  let bad = 0;
  for (let i = 0; i < dataLines.length; i++) {
    const cols = parseLine(dataLines[i]);
    const rut = cols[idx.rut] || '';
    const curso = cols[idx.curso] || '';
    const seccion = cols[idx.seccion] || '';
    const asignatura = cols[idx.asignatura] || '';
    const fecha = cols[idx.fecha] || '';
    const tipo = cols[idx.tipo] || '';
    const nota = cols[idx.nota] || '';
    if (!rut || !curso || !fecha || !tipo || !nota) { bad++; continue; }
    const courseId = toId(curso);
    const subjectId = toId(asignatura || 'general');
    // clave lógica similar a testId + rut + curso + seccion
    const key = [rut, courseId, toId(seccion), subjectId, norm(tipo), fecha].join('|');
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  let dups = 0; let dupExamples = 0;
  const examples = [];
  for (const [k, v] of seen.entries()) {
    if (v > 1) { dups += (v - 1); if (dupExamples < 5) { examples.push({ key: k, count: v }); dupExamples++; } }
  }

  console.log(JSON.stringify({
    file: path.basename(file),
    header,
    missingColumns: missing,
    totalLines: lines.length,
    dataRows: totalRows,
    invalidRows: bad,
    uniqueKeys: seen.size,
    duplicateRows: dups,
    duplicateExamples: examples,
  }, null, 2));
}

main();
