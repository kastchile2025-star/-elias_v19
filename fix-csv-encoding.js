#!/usr/bin/env node

/**
 * Script para corregir encoding UTF-8 en CSV
 * Convierte Ã© → é, Ã­ → í, Ã³ → ó, etc.
 */

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('❌ Uso: node fix-csv-encoding.js <archivo.csv>');
  process.exit(1);
}

const fullPath = path.resolve(inputFile);
if (!fs.existsSync(fullPath)) {
  console.error(`❌ Archivo no encontrado: ${fullPath}`);
  process.exit(1);
}

console.log(`📖 Leyendo: ${fullPath}`);

// Leer como buffer binario
const buffer = fs.readFileSync(fullPath);

// Intentar detectar encoding
let text;
try {
  // Intentar UTF-8 primero
  text = buffer.toString('utf-8');
  console.log('✅ Archivo leído como UTF-8');
} catch (e) {
  try {
    // Fallback: latin1
    text = buffer.toString('latin1');
    console.log('⚠️ Archivo leído como Latin-1, convirtiendo a UTF-8...');
  } catch (e2) {
    console.error('❌ No se pudo leer el archivo:', e2);
    process.exit(1);
  }
}

// Mapeo de caracteres mal codificados
const fixes = {
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ã¡': 'á',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã': 'Á',
  'Ã‰': 'É',
  'Ã': 'Í',
  'Ã"': 'Ó',
  'Ãš': 'Ú',
  'Ã'': 'Ñ',
  'Ã¼': 'ü',
  'Ãœ': 'Ü',
  'SecciÃ³n': 'Sección',
  'BÃ¡sico': 'Básico',
  'GeografÃ­a': 'Geografía',
  'FÃ­sica': 'Física',
  'MatemÃ¡ticas': 'Matemáticas',
  'MÃºsica': 'Música',
  'InglÃ©s': 'Inglés',
  'TecnologÃ­a': 'Tecnología',
  'OrientaciÃ³n': 'Orientación',
  'EducaciÃ³n': 'Educación',
  'ComunicaciÃ³n': 'Comunicación'
};

// Aplicar correcciones
let fixed = text;
for (const [bad, good] of Object.entries(fixes)) {
  const regex = new RegExp(bad, 'g');
  fixed = fixed.replace(regex, good);
}

// Verificar si hubo cambios
const changesMade = fixed !== text;
if (!changesMade) {
  console.log('✅ El archivo ya está correctamente codificado');
  process.exit(0);
}

// Generar nombre de archivo corregido
const dir = path.dirname(fullPath);
const basename = path.basename(fullPath, '.csv');
const outputPath = path.join(dir, `${basename}-fixed.csv`);

// Guardar archivo corregido
fs.writeFileSync(outputPath, fixed, 'utf-8');

console.log(`✅ Archivo corregido guardado en: ${outputPath}`);
console.log(`📊 Tamaño original: ${buffer.length} bytes`);
console.log(`📊 Tamaño corregido: ${Buffer.from(fixed, 'utf-8').length} bytes`);

// Mostrar algunas líneas del resultado
const lines = fixed.split('\n').slice(0, 5);
console.log('\n📋 Primeras líneas del archivo corregido:');
lines.forEach((line, i) => {
  console.log(`${i + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
});
