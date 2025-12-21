// Script para ver la estructura de secciones en el sistema
const fs = require('fs');
const path = require('path');

// Leer el archivo de usuarios consolidados para ver la estructura
const usersFile = path.join(process.cwd(), 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const content = fs.readFileSync(usersFile, 'utf-8');
const lines = content.split('\n').slice(0, 30);

console.log('📊 Muestra del archivo de usuarios:\n');
lines.forEach((line, i) => {
  console.log(`${i}: ${line.substring(0, 100)}`);
});

// El archivo de calificaciones generado
const gradesFile = path.join(process.cwd(), 'public/test-data/calificaciones-carga-masiva-2025-completo.csv');
const gradesContent = fs.readFileSync(gradesFile, 'utf-8');
const gradesLines = gradesContent.split('\n').slice(0, 10);

console.log('\n📝 Muestra del archivo de calificaciones:\n');
gradesLines.forEach((line, i) => {
  console.log(`${i}: ${line}`);
});

// Cursos únicos en el archivo de calificaciones
const allLines = gradesContent.split('\n').slice(1); // Skip header
const cursos = new Set();
allLines.forEach(line => {
  const parts = line.split(',');
  if (parts.length >= 4) {
    cursos.add(`${parts[2]}|${parts[3]}`); // curso|seccion
  }
});

console.log('\n📚 Cursos únicos en el archivo de calificaciones:');
cursos.forEach(c => console.log(`  - ${c}`));
