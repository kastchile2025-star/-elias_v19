#!/usr/bin/env node

/**
 * Test completo del CSV parser con tu archivo exacto
 * Simula lo que hace el endpoint POST /api/firebase/bulk-upload-grades
 */

// Funciones del endpoint
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getColumnValue(row, aliases) {
  const normalizedAliases = aliases.map(norm);
  for (const alias of normalizedAliases) {
    const key = Object.keys(row).find(k => norm(k) === alias);
    if (key && row[key]) {
      return String(row[key]).trim();
    }
  }
  for (const alias of aliases) {
    if (row[alias]) {
      return String(row[alias]).trim();
    }
  }
  return '';
}

function toId(...parts) {
  return parts
    .map(p => String(p || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, ''))
    .filter(Boolean)
    .join('-');
}

function parseFlexibleDate(input) {
  const s = String(input || '').trim();
  if (!s) return null;
  const t = s.replaceAll('.', '/').replaceAll('-', '/');
  const ymd = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
  const dmy = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  let iso = '';
  if (ymd.test(t)) {
    iso = t.replaceAll('/', '-');
  } else if (dmy.test(t)) {
    const [d, m, y] = t.split('/');
    iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  if (!iso) return null;
  const date = new Date(iso + 'T00:00:00Z');
  return isNaN(date.getTime()) ? null : date;
}

function parseScore(s) {
  const n = Number(String(s).replace(',', '.'));
  if (isNaN(n)) return null;
  return n >= 0 && n <= 100 ? n : null;
}

function parseCSVManually(csvText) {
  let normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    
    return result.map(field => {
      field = field.trim();
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"');
      }
      return field;
    });
  };
  
  const lines = normalized.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseLine(lines[0]);
  
  return lines.slice(1).map((line, idx) => {
    const fields = parseLine(line);
    const row = {};
    headers.forEach((header, i) => {
      const normalizedHeader = header.toLowerCase().trim();
      row[normalizedHeader] = fields[i] || '';
    });
    return row;
  });
}

// Tu CSV completo
const csvData = `Nombre,RUT,Curso,Sección,Asignatura,Profesor,Fecha,Tipo,Nota
Ana Benitez,10000048-2,1ro Básico,B,Lenguaje y Comunicación,Ana López,01-03-2025,prueba,32
Ana Campos,10000049-0,1ro Básico,B,Lenguaje y Comunicación,Ana López,01-03-2025,prueba,87
Pedro Vera,10000061-K,1ro Básico,B,Lenguaje y Comunicación,Ana López,01-03-2025,prueba,79
Pedro Alvarez,10000069-5,1ro Básico,B,Lenguaje y Comunicación,Ana López,01-03-2025,prueba,82
Carlos Diaz,10000157-8,2do Básico,B,Ciencias Naturales,Carlos Pérez,01-03-2025,tarea,78
Luis Rios,10000412-7,5to Básico,B,Matemáticas,Gustavo Farias,01-03-2025,tarea,95
Luis Munoz,10000416-K,5to Básico,B,Matemáticas,Gustavo Farias,01-03-2025,tarea,94
Luis Mendez,10000423-2,5to Básico,B,Matemáticas,Gustavo Farias,01-03-2025,tarea,68
Luis Carmona,10000445-3,5to Básico,B,Matemáticas,Gustavo Farias,01-03-2025,tarea,94
Luis Sepulveda,10000447-K,5to Básico,B,Matemáticas,Gustavo Farias,01-03-2025,tarea,42
Patricia Diaz,10000857-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,94
Patricia Rojas,10000872-6,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,91
Patricia Salinas,10000881-5,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,98
Patricia Valenzuela,10000888-2,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,74
Patricia Sepulveda,10000897-1,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,70
Patricia Benitez,10000898-K,2do Medio,B,"Historia, Geografía y Ciencias Sociales",Juan Lopez,01-03-2025,tarea,66`;

console.log('🔍 TEST COMPLETO DEL ENDPOINT\n');

const rows = parseCSVManually(csvData);

console.log(`✅ CSV parseado correctamente: ${rows.length} filas\n`);

const headers = Object.keys(rows[0] || {});
console.log(`📋 Headers: ${JSON.stringify(headers)}\n`);

// Simular procesamiento del endpoint
console.log('📊 Procesando filas...\n');

let processed = 0;
let errors = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const rowNumber = i + 2;

  try {
    // Extraer datos (igual que el endpoint)
    const nombre = getColumnValue(row, ['nombre', 'student', 'studentname']);
    const rut = getColumnValue(row, ['rut', 'studentid', 'id']);
    const curso = getColumnValue(row, ['curso', 'course', 'courseid']);
    const seccion = getColumnValue(row, ['seccion', 'section', 'sectionid']);
    const asignatura = getColumnValue(row, ['asignatura', 'subject', 'subjectid']);
    const profesor = getColumnValue(row, ['profesor', 'teacher', 'teachername']);
    const fechaStr = getColumnValue(row, ['fecha', 'gradedat', 'date']);
    const tipoStr = getColumnValue(row, ['tipo', 'type']);
    const notaStr = getColumnValue(row, ['nota', 'score']);

    // Validaciones
    if (!nombre || !rut || !curso || !fechaStr || !notaStr) {
      errors.push(`Fila ${rowNumber}: Faltan campos (nombre=${nombre||'?'}, rut=${rut||'?'}, curso=${curso||'?'}, fecha=${fechaStr||'?'}, nota=${notaStr||'?'})`);
      continue;
    }

    // Parsear nota
    const score = parseScore(notaStr);
    if (score == null) {
      errors.push(`Fila ${rowNumber}: Nota inválida: ${notaStr}`);
      continue;
    }

    // Parsear fecha
    const gradedAt = parseFlexibleDate(fechaStr);
    if (!gradedAt) {
      errors.push(`Fila ${rowNumber}: Fecha inválida: ${fechaStr}`);
      continue;
    }

    // Normalizar tipo
    const type = ['tarea', 'prueba', 'evaluacion'].includes(tipoStr.toLowerCase())
      ? tipoStr.toLowerCase()
      : 'evaluacion';

    // Generar IDs
    const courseId = toId(curso);
    const docId = toId(rut, courseId, String(+gradedAt));
    const testId = toId(asignatura || 'general', type, String(+gradedAt));

    // Log para debug (primeras 3 filas)
    if (i < 3) {
      console.log(`✅ Fila ${rowNumber}:`);
      console.log(`   Nombre: "${nombre}"`);
      console.log(`   RUT: "${rut}"`);
      console.log(`   Asignatura: "${asignatura}"`);
      console.log(`   Nota: ${score}`);
      console.log(`   Tipo: ${type}`);
      console.log('');
    }

    // Verificar filas problemáticas
    if (nombre.includes('Patricia')) {
      console.log(`✅ Fila ${rowNumber} (Patricia):`);
      console.log(`   Nombre: "${nombre}"`);
      console.log(`   RUT: "${rut}"`);
      console.log(`   Asignatura: "${asignatura}"`);
      console.log(`   Nota: ${score}`);
      console.log('');
    }

    processed++;

  } catch (e) {
    errors.push(`Fila ${rowNumber}: ${e.message}`);
  }
}

console.log('─'.repeat(60));
console.log('\n📊 RESUMEN:\n');
console.log(`✅ Filas procesadas: ${processed}/${rows.length}`);
console.log(`❌ Errores: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ ERRORES ENCONTRADOS:\n');
  for (let i = 0; i < Math.min(5, errors.length); i++) {
    console.log(`  ${errors[i]}`);
  }
  if (errors.length > 5) {
    console.log(`  ... y ${errors.length - 5} más`);
  }
} else {
  console.log('\n✅ ¡SIN ERRORES! Todas las filas se procesaron correctamente');
}

// Validación final
console.log('\n' + '─'.repeat(60));
console.log('🧪 VALIDACIÓN FINAL:\n');

if (processed === rows.length && errors.length === 0) {
  console.log('✅ ÉXITO: El fix funciona correctamente');
  console.log('   - Todas las filas se parsearon correctamente');
  console.log('   - Los campos con comillas funcionan bien');
  console.log('   - Los tipos de datos se validaron correctamente');
  process.exit(0);
} else {
  console.log('❌ FALLO: Aún hay problemas');
  process.exit(1);
}
