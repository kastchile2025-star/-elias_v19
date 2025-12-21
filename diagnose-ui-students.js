// Comparar RUTs en Firebase vs archivo de usuarios
const fs = require('fs');
const path = require('path');

// Leer archivo de usuarios
const usersFile = path.join(process.cwd(), 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const content = fs.readFileSync(usersFile, 'utf-8');
const lines = content.split('\n').slice(1); // Skip header

// Buscar estudiantes del 1ro Medio A (sección A)
const medioAStudents = [];
lines.forEach(line => {
  const parts = line.split(',');
  if (parts.length >= 8) {
    const role = parts[0];
    const name = parts[1];
    const rut = parts[2];
    const course = parts[6];
    const section = parts[7];
    
    if (role === 'student' && course === '1ro Medio' && section === 'A') {
      medioAStudents.push({ name, rut, course, section });
    }
  }
});

console.log(`\n📊 Estudiantes del 1ro Medio A en archivo de usuarios: ${medioAStudents.length}\n`);

// Mostrar primeros 10
console.log('Muestra de estudiantes (archivo fuente):');
medioAStudents.slice(0, 15).forEach((s, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${s.name.padEnd(35)} RUT: ${s.rut}`);
});

// Comparar con los que tienen calificaciones en Firebase
console.log('\n\n📋 Comparación con Firebase:');
console.log('Los estudiantes CON calificaciones tienen RUTs como:');
console.log('  - Sofía Araya González: 10000720-7');
console.log('  - Alberto Araya Figueroa: 10000761-4');
console.log('');
console.log('Verificar que estos RUTs coincidan con los del archivo de usuarios...');

// Buscar específicamente a Alberto
const alberto = medioAStudents.find(s => s.name.includes('Alberto'));
console.log('\n🔍 Buscando a Alberto en archivo de usuarios:');
console.log(alberto ? `  Encontrado: ${alberto.name} - RUT: ${alberto.rut}` : '  NO ENCONTRADO');

// Buscar estudiantes sin calificaciones visibles
const sinCalificaciones = ['Alberto', 'Andrés', 'Ángel', 'Antonia', 'Carolina', 'Constanza', 'Cristóbal', 'Daniela'];
console.log('\n🔍 Estudiantes que NO muestran calificaciones en la UI:');
sinCalificaciones.forEach(nombre => {
  const found = medioAStudents.find(s => s.name.includes(nombre));
  if (found) {
    console.log(`  ${found.name.padEnd(35)} RUT: ${found.rut}`);
  }
});
