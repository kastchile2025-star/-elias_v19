// ========================================
// CONFIGURACIÓN RÁPIDA PARA COMUNICACIONES
// COPIA TODO ESTE CÓDIGO EN LA CONSOLA DEL NAVEGADOR
// ========================================

console.log('⚡ CONFIGURANDO DATOS PARA COMUNICACIONES...');

// Configurar cursos básicos
const courses = [
  { id: 'curso-4', name: '4to Básico', level: 'basica', year: 4 },
  { id: 'curso-5', name: '5to Básico', level: 'basica', year: 5 },
  { id: 'curso-6', name: '6to Básico', level: 'basica', year: 6 }
];

// Configurar secciones
const sections = [
  { id: 'seccion-4A', name: 'A', courseId: 'curso-4', uniqueCode: 'SEC-4A', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-4B', name: 'B', courseId: 'curso-4', uniqueCode: 'SEC-4B', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-5A', name: 'A', courseId: 'curso-5', uniqueCode: 'SEC-5A', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-5B', name: 'B', courseId: 'curso-5', uniqueCode: 'SEC-5B', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-6A', name: 'A', courseId: 'curso-6', uniqueCode: 'SEC-6A', studentCount: 0, maxStudents: 30 }
];

// Obtener usuario actual
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
console.log('👤 Usuario actual:', currentUser.username || 'no encontrado');

// Configurar asignaciones para el profesor actual
const assignments = [
  { 
    id: 'asig-1', 
    teacherId: currentUser.id || 'teacher-1', 
    sectionId: 'seccion-4A', 
    subjectName: 'Matemáticas', 
    assignedAt: new Date().toISOString() 
  },
  { 
    id: 'asig-2', 
    teacherId: currentUser.id || 'teacher-1', 
    sectionId: 'seccion-5A', 
    subjectName: 'Lenguaje', 
    assignedAt: new Date().toISOString() 
  },
  { 
    id: 'asig-3', 
    teacherId: currentUser.id || 'teacher-1', 
    sectionId: 'seccion-6A', 
    subjectName: 'Ciencias Naturales', 
    assignedAt: new Date().toISOString() 
  }
];

// Guardar en localStorage
localStorage.setItem('smart-student-courses', JSON.stringify(courses));
localStorage.setItem('smart-student-sections', JSON.stringify(sections));
localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(assignments));

console.log('✅ CONFIGURACIÓN COMPLETADA!');
console.log('📋 Cursos configurados:', courses.length);
console.log('📋 Secciones configuradas:', sections.length);
console.log('📋 Asignaciones configuradas:', assignments.length);

console.log('\n🎯 CURSOS-SECCIÓN DISPONIBLES PARA EL PROFESOR:');
console.log('   📍 "4to Básico A" - Matemáticas');
console.log('   📍 "5to Básico A" - Lenguaje');
console.log('   📍 "6to Básico A" - Ciencias Naturales');

console.log('\n🔄 AHORA RECARGA LA PÁGINA para ver los cursos-sección en el dropdown');

// Mostrar datos configurados para verificación
console.log('\n📊 VERIFICACIÓN DE DATOS:');
console.log('Cursos:', JSON.parse(localStorage.getItem('smart-student-courses') || '[]'));
console.log('Secciones:', JSON.parse(localStorage.getItem('smart-student-sections') || '[]'));
console.log('Asignaciones:', JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]'));
