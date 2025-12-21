#!/usr/bin/env node

/**
 * Script de prueba para validar el parser CSV
 * Probará con tu archivo CSV exacto
 */

// Función de normalización
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Parser mejorado
function parseCSVManually(csvText) {
  // Normalizar saltos de línea
  let normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Usar parseador robusto que maneja quoted fields
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Comilla escapada: ""
          current += '"';
          i++; // Saltar siguiente comilla
        } else {
          // Toggle de estado de comillas
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Fin de campo
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Agregar último campo
    result.push(current.trim());
    
    // Limpiar comillas de los campos finales
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

  // Parsear encabezados
  const headers = parseLine(lines[0]);
  
  // Parsear filas
  return lines.slice(1).map((line, idx) => {
    const fields = parseLine(line);
    const row = {};
    headers.forEach((header, i) => {
      // Normalizar header keys
      const normalizedHeader = header.toLowerCase().trim();
      row[normalizedHeader] = fields[i] || '';
    });
    return row;
  });
}

// Tu CSV
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

console.log('🔍 Probando parser CSV mejorado...\n');

const rows = parseCSVManually(csvData);

console.log(`✅ Total de filas parseadas: ${rows.length}\n`);

const headers = Object.keys(rows[0] || {});
console.log(`✅ Headers detectados: ${JSON.stringify(headers)}\n`);

// Mostrar primeras 3 filas
console.log('📋 Primeras 3 filas parseadas:\n');
for (let i = 0; i < Math.min(3, rows.length); i++) {
  console.log(`Fila ${i+1}:`);
  console.log(JSON.stringify(rows[i], null, 2));
  console.log('---');
}

// Probar las filas problemáticas (Patricia Diaz y siguientes)
console.log('\n🔍 Probando filas que antes fallaban:\n');
const problematicIndices = [10, 11, 12, 13, 14]; // Patricia Diaz, Rojas, Salinas, etc.

for (const idx of problematicIndices) {
  if (idx < rows.length) {
    const row = rows[idx];
    console.log(`Fila ${idx+1} (Patricia):`);
    console.log(`  Nombre: "${row.nombre || row.Nombre}"`);
    console.log(`  RUT: "${row.rut || row.RUT}"`);
    console.log(`  Curso: "${row.curso || row.Curso}"`);
    console.log(`  Asignatura: "${row.asignatura || row.Asignatura}"`);
    console.log(`  Nota: "${row.nota || row.Nota}"`);
    console.log('---');
  }
}

// Validar que las filas de Patricia se parsearon correctamente
console.log('\n✅ VALIDACIÓN:\n');
const patriciaDiaz = rows[10];
if (patriciaDiaz && 
    (patriciaDiaz.nombre === 'Patricia Diaz' || patriciaDiaz.Nombre === 'Patricia Diaz') &&
    (patriciaDiaz.rut === '10000857-2' || patriciaDiaz.RUT === '10000857-2') &&
    (patriciaDiaz.asignatura === 'Historia, Geografía y Ciencias Sociales' || 
     patriciaDiaz.Asignatura === 'Historia, Geografía y Ciencias Sociales')) {
  console.log('✅ ÉXITO: Patricia Diaz se parseó correctamente con asignatura que contiene comillas');
} else {
  console.log('❌ FALLO: Patricia Diaz no se parseó correctamente');
  console.log('Datos actuales:', patriciaDiaz);
}
