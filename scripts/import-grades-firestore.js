#!/usr/bin/env node
/**
 * Importador masivo de calificaciones a Firestore usando Firebase Admin + BulkWriter
 *
 * Entrada: CSV con encabezados (flexibles):
 *   nombre,rut,curso,seccion,asignatura,profesor,fecha,tipo,nota
 * Campos aceptados (insensibles a mayúsculas y acentos simples):
 *   nombre | student | studentName
 *   rut | studentId
 *   curso | course | courseId
 *   seccion | section | sectionId
 *   asignatura | subject | subjectId
 *   profesor | teacher | teacherName
 *   fecha | gradedAt | date
 *   tipo | type
 *   nota | score
 *
 * Uso:
 *   node scripts/import-grades-firestore.js --file=./path/data.csv --year=2025 --projectId=superjf1234
 * Requiere: GOOGLE_APPLICATION_CREDENTIALS apuntando al JSON de servicio.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { initAdmin } = require('./firebase-admin');

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map(a => {
      const [k, v] = a.split('=');
      return [k.replace(/^--/, ''), v ?? true];
    })
  );
  if (!args.file) throw new Error('Parámetro --file requerido');
  args.year = Number(args.year || new Date().getFullYear());
  // bandera para prueba en seco (no escribe en Firestore)
  args.dry = args.dry === true || String(args.dry).toLowerCase() === 'true';
  return args;
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function headerIndex(headers, names) {
  const set = new Set(names.map(norm));
  for (let i = 0; i < headers.length; i++) {
    if (set.has(norm(headers[i]))) return i;
  }
  return -1;
}

function toId(...parts) {
  return parts
    .map(p => String(p || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, ''))
    .filter(Boolean)
    .join('-');
}

async function main() {
  const { file, year, dry } = parseArgs();
  const admin = initAdmin();
  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  const bulk = db.bulkWriter({ throttling: true });
  bulk.onWriteError(err => {
    if (err.failedAttempts < 5) {
      return true; // retry
    }
    console.error('❌ Error escritura permanente:', err);
    return false;
  });

  let processed = 0;
  let enqueued = 0;
  let ok = 0;
  let bad = 0;

  const stream = fs
    .createReadStream(path.resolve(file))
    .pipe(
      parse({
        bom: true,
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        trim: true,
      })
    );

  console.log('🚀 Iniciando importación a Firestore', dry ? '(DRY RUN, no se escribirá)' : '');

  stream.on('headers', headers => {
    console.log('Encabezados:', headers.join(', '));
  });

  stream.on('data', row => {
    processed++;
    try {
      const headers = Object.keys(row);

      const name = row[headers[headerIndex(headers, ['nombre', 'student', 'studentname'])]];
      const rut = row[headers[headerIndex(headers, ['rut', 'studentid', 'id'])]];
      const course = row[headers[headerIndex(headers, ['curso', 'course', 'courseid'])]];
      const section = row[headers[headerIndex(headers, ['seccion', 'section', 'sectionid'])]] || null;
      const subject = row[headers[headerIndex(headers, ['asignatura', 'subject', 'subjectid'])]] || null;
      const teacher = row[headers[headerIndex(headers, ['profesor', 'teacher', 'teachername'])]] || null;
      const dateStr = row[headers[headerIndex(headers, ['fecha', 'gradedat', 'date'])]];
      const type = (row[headers[headerIndex(headers, ['tipo', 'type'])]] || 'evaluacion').toLowerCase();
      const scoreRaw = row[headers[headerIndex(headers, ['nota', 'score'])]];

      if (!name || !rut || !course || !dateStr || !scoreRaw) {
        bad++;
        return;
      }

      const score = Number(String(scoreRaw).replace(',', '.'));

      // Parseo robusto de fechas con formato día-primero (DD-MM-YYYY o DD/MM/YYYY)
      function parseDayFirstToDate(input) {
        if (!input) return null;
        const s = String(input).trim();
        // Si ya parece ISO o YYYY-MM-DD, confiar en Date nativo
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          const d = new Date(s);
          return isNaN(d.getTime()) ? null : d;
        }
        // DD-MM-YYYY o DD/MM/YYYY
        const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) {
          const dd = Number(m[1]);
          const MM = Number(m[2]);
          const yyyy = Number(m[3]);
          if (!dd || !MM || !yyyy) return null;
          // Usar mediodía local para evitar retrocesos por zona horaria
          const d = new Date(yyyy, MM - 1, dd, 12, 0, 0, 0);
          return isNaN(d.getTime()) ? null : d;
        }
        // Intento final con Date nativo
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      }

      const gradedAtDate = parseDayFirstToDate(dateStr);
      if (!gradedAtDate) { bad++; return; }
      const gradedAt = gradedAtDate;
      const now = new Date();

      const courseId = toId(course);
      const docId = toId(rut, courseId, String(+gradedAt));

      const payload = {
        id: docId,
        testId: toId(subject || 'general', type, String(+gradedAt)),
        studentId: rut,
        studentName: name,
        score,
        courseId,
        sectionId: section ? toId(section) : null,
        subjectId: subject ? toId(subject) : null,
        title: `${subject || 'Evaluación'} ${gradedAt.toISOString().slice(0, 10)}`,
        gradedAt: admin.firestore.Timestamp.fromDate(gradedAt),
        year,
        type: ['tarea', 'prueba', 'evaluacion'].includes(type) ? type : 'evaluacion',
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
        teacherName: teacher || null,
      };

      if (!dry) {
        const ref = db.doc(`courses/${courseId}/grades/${docId}`);
        bulk.set(ref, payload, { merge: true });
      }
      enqueued++;

      if (enqueued % 5000 === 0) {
        console.log(`⏳ Encolados: ${enqueued} (procesados: ${processed})`);
      }
    } catch (e) {
      bad++;
    }
  });

  await new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  if (!dry) {
    await bulk.close();
  }
  ok = enqueued - bad;

  console.log('✅ Importación finalizada');
  console.log({ processed, enqueued, ok, bad });
}

main().catch(err => {
  console.error('❌ Error general importador:', err);
  process.exit(1);
});
