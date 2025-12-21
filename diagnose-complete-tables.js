/**
 * DIAGNÓSTICO COMPLETO: Análisis de todas las tablas y relaciones
 */

console.log('🔍 DIAGNÓSTICO COMPLETO: Analizando todas las tablas del sistema');
console.log('===============================================================');

const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log('\n📊 RESUMEN GENERAL:');
console.log('   • Usuarios:', users.length);
console.log('   • Asignaciones estudiantes:', studentAssignments.length);
console.log('   • Cursos:', courses.length);
console.log('   • Secciones:', sections.length);

console.log('\n📚 TABLA COURSES:');
courses.forEach((course, index) => {
    console.log(`   ${index + 1}. ID: ${course.id}`);
    console.log(`      Nombre: ${course.name}`);
});

console.log('\n🏫 TABLA SECTIONS:');
sections.forEach((section, index) => {
    console.log(`   ${index + 1}. ID: ${section.id}`);
    console.log(`      Nombre: ${section.name}`);
    console.log(`      CourseId: ${section.courseId || 'N/A'}`);
});

console.log('\n👥 ESTUDIANTES:');
const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
estudiantes.forEach((estudiante, index) => {
    console.log(`   ${index + 1}. ${estudiante.displayName || estudiante.username} (${estudiante.username})`);
    console.log(`      ID: ${estudiante.id}`);
});

console.log('\n📋 ASIGNACIONES COMPLETAS:');
console.log('   Total asignaciones:', studentAssignments.length);
studentAssignments.forEach((assignment, index) => {
    const estudiante = users.find(u => u.id === assignment.studentId);
    const curso = courses.find(c => c.id === assignment.courseId);
    const seccion = sections.find(s => s.id === assignment.sectionId);
    
    console.log(`   ${index + 1}. Estudiante: ${estudiante?.username || 'NO ENCONTRADO'}`);
    console.log(`      CourseId: ${assignment.courseId}`);
    console.log(`      Curso: ${curso?.name || 'NO ENCONTRADO'}`);
    console.log(`      SectionId: ${assignment.sectionId}`);
    console.log(`      Sección: ${seccion?.name || 'NO ENCONTRADO'}`);
    console.log('      ---');
});

console.log('\n🎯 ANÁLISIS DEL PROBLEMA:');
console.log('   Los logs muestran que todos los estudiantes están en sectionId: a75b7e0e-1130-486a-ae5e-6f7233e002bf');

const seccionProblematica = sections.find(s => s.id === 'a75b7e0e-1130-486a-ae5e-6f7233e002bf');
console.log('   Esta sección corresponde a:', seccionProblematica?.name || 'SECCIÓN NO ENCONTRADA');

console.log('\n💡 SOLUCIÓN REQUERIDA:');
console.log('   Si el profesor pedro debería tener solo 2 estudiantes en "5to Básico Sección A",');
console.log('   entonces hay que:');
console.log('   1. Verificar qué estudiantes realmente pertenecen a esa sección');
console.log('   2. Mover los otros estudiantes a sus secciones correctas');
console.log('   3. O crear las secciones faltantes si no existen');

console.log('\n🔍 BUSCAR SECCIONES DE 5TO BÁSICO:');
const secciones5to = sections.filter(s => s.name && (s.name.includes('5to') || s.name.includes('5°')));
console.log('   Secciones de 5to encontradas:', secciones5to.length);
secciones5to.forEach(s => console.log('   -', s.name, '(ID:', s.id, ')'));

console.log('\n🔍 BUSCAR CURSOS DE 5TO BÁSICO:');
const cursos5to = courses.filter(c => c.name && (c.name.includes('5to') || c.name.includes('5°')));
console.log('   Cursos de 5to encontrados:', cursos5to.length);
cursos5to.forEach(c => console.log('   -', c.name, '(ID:', c.id, ')'));
