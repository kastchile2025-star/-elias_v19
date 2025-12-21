// CONFIGURACIÓN RÁPIDA - COPIA Y PEGA EN CONSOLA DEL NAVEGADOR
// Este script configura todo lo necesario para que funcionen los cursos-sección

console.log('⚡ CONFIGURACIÓN RÁPIDA DEL SISTEMA');

// 1. Obtener usuario actual
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('👤 Usuario:', user);

if (!user) {
  console.log('❌ No hay usuario logueado');
} else {
  // 2. Configurar cursos básicos
  const courses = [
    { id: 'curso-4', name: '4to Básico', level: 'basica', year: 4 },
    { id: 'curso-5', name: '5to Básico', level: 'basica', year: 5 },
    { id: 'curso-6', name: '6to Básico', level: 'basica', year: 6 }
  ];

  // 3. Configurar secciones
  const sections = [
    { id: 'seccion-4A', name: 'A', courseId: 'curso-4', uniqueCode: 'SEC-4A', studentCount: 0, maxStudents: 30 },
    { id: 'seccion-4B', name: 'B', courseId: 'curso-4', uniqueCode: 'SEC-4B', studentCount: 0, maxStudents: 30 },
    { id: 'seccion-5A', name: 'A', courseId: 'curso-5', uniqueCode: 'SEC-5A', studentCount: 0, maxStudents: 30 },
    { id: 'seccion-5B', name: 'B', courseId: 'curso-5', uniqueCode: 'SEC-5B', studentCount: 0, maxStudents: 30 },
    { id: 'seccion-6A', name: 'A', courseId: 'curso-6', uniqueCode: 'SEC-6A', studentCount: 0, maxStudents: 30 }
  ];

  // 4. Configurar asignaciones para el usuario actual
  const assignments = [
    { id: 'asig-1', teacherId: user.id, sectionId: 'seccion-4A', subjectName: 'Matemáticas', assignedAt: new Date().toISOString() },
    { id: 'asig-2', teacherId: user.id, sectionId: 'seccion-5A', subjectName: 'Lenguaje', assignedAt: new Date().toISOString() },
    { id: 'asig-3', teacherId: user.id, sectionId: 'seccion-6A', subjectName: 'Ciencias Naturales', assignedAt: new Date().toISOString() }
  ];

  // 5. Guardar todo
  localStorage.setItem('smart-student-courses', JSON.stringify(courses));
  localStorage.setItem('smart-student-sections', JSON.stringify(sections));
  localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(assignments));

  console.log('✅ CONFIGURACIÓN COMPLETA!');
  console.log('📋 Cursos configurados:', courses.length);
  console.log('📋 Secciones configuradas:', sections.length);
  console.log('📋 Asignaciones configuradas:', assignments.length);

  console.log('\n🎯 AHORA DEBERÍAS VER ESTOS CURSOS-SECCIÓN:');
  console.log('   📍 "4to Básico A" - Matemáticas');
  console.log('   📍 "5to Básico A" - Lenguaje');
  console.log('   📍 "6to Básico A" - Ciencias Naturales');

  console.log('\n🔄 RECARGA LA PÁGINA AHORA');
}
