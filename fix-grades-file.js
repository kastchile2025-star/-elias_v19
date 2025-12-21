const fs = require('fs');

// Leer archivo original
const content = fs.readFileSync('grades-consolidated-2025-.csv', 'utf8');
const lines = content.split('\n');

// Función para convertir serial de Excel a fecha
function excelSerialToDate(serial) {
  // Excel cuenta desde 1900-01-01, pero tiene un bug con 1900 siendo año bisiesto
  const excelEpoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
  const days = parseInt(serial);
  
  if (isNaN(days) || days < 1 || days > 50000) {
    return null; // Fecha inválida
  }
  
  const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Función para convertir nota de 0-100 a escala 1-7
function convertirNota(notaStr) {
  const nota100 = parseInt(notaStr);
  if (isNaN(nota100) || nota100 < 0 || nota100 > 100) return '4.0';
  
  // Conversión: 0-100 -> 1.0-7.0
  // 60 = 4.0 (mínimo aprobatorio)
  // 100 = 7.0
  if (nota100 < 60) {
    // 0-59 -> 1.0-3.9
    return (1.0 + (nota100 / 60) * 2.9).toFixed(1);
  } else {
    // 60-100 -> 4.0-7.0
    return (4.0 + ((nota100 - 60) / 40) * 3.0).toFixed(1);
  }
}

// Función para parsear CSV considerando campos que pueden contener comas
function parseCSVLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    parts.push(current.trim());
  }
  
  return parts;
}

// Procesar líneas
const newLines = ['nombre,rut,curso,seccion,asignatura,profesor,fecha,tipo,nota,tema'];
let skipped = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Remover los punto y coma extra al final
  const cleanLine = line.replace(/;+$/g, '');
  
  // Parsear considerando posibles comas dentro de campos
  const parts = parseCSVLine(cleanLine);
  
  if (parts.length < 9) {
    skipped++;
    continue;
  }
  
  const nombre = parts[0];
  const rut = parts[1];
  const curso = parts[2];
  const seccion = parts[3];
  const asignatura = parts[4];
  const profesor = parts[5];
  const fechaSerial = parts[6];
  const tipo = parts[7].toLowerCase();
  const notaStr = parts[8];
  
  // Convertir fecha
  const fecha = excelSerialToDate(fechaSerial);
  if (!fecha) {
    skipped++;
    continue; // Saltar registros con fecha inválida
  }
  
  // Mantener nota en escala 0-100 (no convertir)
  const nota = notaStr;
  
  // Tema por defecto basado en asignatura
  const tema = asignatura;
  
  newLines.push(`${nombre},${rut},${curso},${seccion},${asignatura},${profesor},${fecha},${tipo},${nota},${tema}`);
}

// Escribir archivo corregido
fs.writeFileSync('grades-consolidated-2025-CORREGIDO.csv', newLines.join('\n'), 'utf8');

console.log(`✅ Archivo corregido generado: grades-consolidated-2025-CORREGIDO.csv`);
console.log(`   - Registros originales: ${lines.length - 1}`);
console.log(`   - Registros convertidos: ${newLines.length - 1}`);
console.log(`   - Registros omitidos (fecha inválida): ${skipped}`);
console.log(`   - Fechas convertidas de formato Excel a YYYY-MM-DD`);
console.log(`   - Notas mantenidas en escala 0-100`);
