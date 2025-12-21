// Script para configurar datos de prueba en localStorage
// Ejecutar en la consola del navegador DESPUÉS de cargar la aplicación

console.log('🔧 Configurando datos de prueba...');

// Datos de prueba para profesores
const testUsers = [
  {
    id: 'prof001',
    username: 'profesor.ciencias',
    password: '123456',
    role: 'teacher',
    name: 'Ana García',
    email: 'ana.garcia@colegio.cl'
  },
  {
    id: 'prof002', 
    username: 'profesor.matematicas',
    password: '123456',
    role: 'teacher',
    name: 'Carlos López',
    email: 'carlos.lopez@colegio.cl'
  }
];

// Datos de cursos
const testCourses = [
  { id: 'curso1', name: '1ro Básico' },
  { id: 'curso2', name: '2do Básico' },
  { id: 'curso3', name: '3ro Básico' }
];

// Datos de secciones
const testSections = [
  { id: 'sec1a', courseId: 'curso1', name: '1A' },
  { id: 'sec1b', courseId: 'curso1', name: '1B' },
  { id: 'sec2a', courseId: 'curso2', name: '2A' },
  { id: 'sec3a', courseId: 'curso3', name: '3A' }
];

// Asignaciones específicas para cada profesor
const testAssignments = [
  // Ana García - Profesora de Ciencias
  {
    id: 'assign1',
    teacherId: 'prof001',
    sectionId: 'sec1a',
    subjectName: 'Ciencias Naturales'
  },
  {
    id: 'assign2',
    teacherId: 'prof001',
    sectionId: 'sec1b',
    subjectName: 'Ciencias Naturales'
  },
  {
    id: 'assign3',
    teacherId: 'prof001',
    sectionId: 'sec2a',
    subjectName: 'Ciencias Naturales'
  },
  // Carlos López - Profesor de Matemáticas
  {
    id: 'assign4',
    teacherId: 'prof002',
    sectionId: 'sec1a',
    subjectName: 'Matemáticas'
  },
  {
    id: 'assign5',
    teacherId: 'prof002',
    sectionId: 'sec2a', 
    subjectName: 'Matemáticas'
  },
  {
    id: 'assign6',
    teacherId: 'prof002',
    sectionId: 'sec3a',
    subjectName: 'Matemáticas'
  }
];

// Guardar en localStorage
localStorage.setItem('smart-student-users', JSON.stringify(testUsers));
localStorage.setItem('smart-student-courses', JSON.stringify(testCourses));
localStorage.setItem('smart-student-sections', JSON.stringify(testSections));
localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(testAssignments));

console.log('✅ Datos de prueba configurados:');
console.log('👥 Profesores:', testUsers.length);
console.log('📚 Cursos:', testCourses.length);
console.log('🏫 Secciones:', testSections.length);
console.log('📋 Asignaciones:', testAssignments.length);

console.log('\n🎯 Para probar:');
console.log('1. Inicia sesión como "profesor.ciencias" (solo debería ver Ciencias Naturales)');
console.log('2. Inicia sesión como "profesor.matematicas" (solo debería ver Matemáticas)');
console.log('3. Contraseña para ambos: 123456');

console.log('\n📝 Configuración completada. Recarga la página para aplicar los cambios.');
