// Script para configurar datos reales del módulo admin
// Ejecuta este script completo en la consola del navegador

console.log('🚀 CONFIGURANDO DATOS REALES DEL SISTEMA EDUCATIVO...');

// 1. CURSOS REALES
const realCourses = [
  { id: 'curso-1', name: '1ro Básico', level: 'basica', year: 1 },
  { id: 'curso-2', name: '2do Básico', level: 'basica', year: 2 },
  { id: 'curso-3', name: '3ro Básico', level: 'basica', year: 3 },
  { id: 'curso-4', name: '4to Básico', level: 'basica', year: 4 },
  { id: 'curso-5', name: '5to Básico', level: 'basica', year: 5 },
  { id: 'curso-6', name: '6to Básico', level: 'basica', year: 6 },
  { id: 'curso-7', name: '7mo Básico', level: 'basica', year: 7 },
  { id: 'curso-8', name: '8vo Básico', level: 'basica', year: 8 }
];

// 2. SECCIONES REALES
const realSections = [
  { id: 'seccion-4A', name: 'A', courseId: 'curso-4', uniqueCode: 'SEC-4A', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-4B', name: 'B', courseId: 'curso-4', uniqueCode: 'SEC-4B', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-5A', name: 'A', courseId: 'curso-5', uniqueCode: 'SEC-5A', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-5B', name: 'B', courseId: 'curso-5', uniqueCode: 'SEC-5B', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-6A', name: 'A', courseId: 'curso-6', uniqueCode: 'SEC-6A', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-6B', name: 'B', courseId: 'curso-6', uniqueCode: 'SEC-6B', studentCount: 0, maxStudents: 30 },
  { id: 'seccion-7A', name: 'A', courseId: 'curso-7', uniqueCode: 'SEC-7A', studentCount: 0, maxStudents: 30 }
];

// 3. ESTUDIANTES REALES
const realStudents = [
  { id: 'est-1', name: 'Ana García', sectionId: 'seccion-4A', email: 'ana.garcia@email.com' },
  { id: 'est-2', name: 'Carlos López', sectionId: 'seccion-4A', email: 'carlos.lopez@email.com' },
  { id: 'est-3', name: 'María Rodríguez', sectionId: 'seccion-4A', email: 'maria.rodriguez@email.com' },
  { id: 'est-4', name: 'Pedro Martínez', sectionId: 'seccion-5A', email: 'pedro.martinez@email.com' },
  { id: 'est-5', name: 'Laura Fernández', sectionId: 'seccion-5A', email: 'laura.fernandez@email.com' },
  { id: 'est-6', name: 'Diego Herrera', sectionId: 'seccion-6A', email: 'diego.herrera@email.com' },
  { id: 'est-7', name: 'Sofía Morales', sectionId: 'seccion-6B', email: 'sofia.morales@email.com' },
  { id: 'est-8', name: 'Andrés Silva', sectionId: 'seccion-7A', email: 'andres.silva@email.com' }
];

// 4. OBTENER USUARIO ACTUAL Y CREAR ASIGNACIONES
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
console.log('👤 Usuario actual:', currentUser);

let teacherAssignments = [];

if (currentUser && currentUser.role === 'teacher') {
  // Crear asignaciones para el profesor actual
  teacherAssignments = [
    // Asignar 4to Básico A - Matemáticas y Lenguaje
    { id: 'asig-1', teacherId: currentUser.id, sectionId: 'seccion-4A', subjectName: 'Matemáticas', assignedAt: new Date().toISOString() },
    { id: 'asig-2', teacherId: currentUser.id, sectionId: 'seccion-4A', subjectName: 'Lenguaje', assignedAt: new Date().toISOString() },
    
    // Asignar 5to Básico A - Ciencias
    { id: 'asig-3', teacherId: currentUser.id, sectionId: 'seccion-5A', subjectName: 'Ciencias Naturales', assignedAt: new Date().toISOString() },
    
    // Asignaciones de otros profesores (para completar el sistema)
    { id: 'asig-4', teacherId: 'teacher-2', sectionId: 'seccion-6A', subjectName: 'Historia', assignedAt: new Date().toISOString() },
    { id: 'asig-5', teacherId: 'teacher-3', sectionId: 'seccion-7A', subjectName: 'Educación Física', assignedAt: new Date().toISOString() }
  ];
} else {
  console.log('❌ No hay usuario profesor logueado');
  // Crear asignaciones genéricas
  teacherAssignments = [
    { id: 'asig-1', teacherId: 'profesor-demo', sectionId: 'seccion-4A', subjectName: 'Matemáticas', assignedAt: new Date().toISOString() },
    { id: 'asig-2', teacherId: 'profesor-demo', sectionId: 'seccion-5A', subjectName: 'Lenguaje', assignedAt: new Date().toISOString() }
  ];
}

// 5. GUARDAR TODOS LOS DATOS
localStorage.setItem('smart-student-courses', JSON.stringify(realCourses));
localStorage.setItem('smart-student-sections', JSON.stringify(realSections));
localStorage.setItem('smart-student-students', JSON.stringify(realStudents));
localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));

console.log('✅ DATOS CONFIGURADOS CORRECTAMENTE!');

// 6. VERIFICACIÓN
console.log('\n📊 RESUMEN DE DATOS CONFIGURADOS:');
console.log(`📚 Cursos: ${realCourses.length}`);
console.log(`📝 Secciones: ${realSections.length}`);
console.log(`👥 Estudiantes: ${realStudents.length}`);
console.log(`👨‍🏫 Asignaciones: ${teacherAssignments.length}`);

// 7. MOSTRAR CURSOS-SECCIÓN QUE DEBERÍAN APARECER
if (currentUser && currentUser.role === 'teacher') {
  console.log('\n🎯 CURSOS-SECCIÓN QUE DEBERÍAS VER EN COMUNICACIONES:');
  const userAssignments = teacherAssignments.filter(a => a.teacherId === currentUser.id);
  const uniqueSections = [...new Set(userAssignments.map(a => a.sectionId))];
  
  uniqueSections.forEach(sectionId => {
    const section = realSections.find(s => s.id === sectionId);
    const course = realCourses.find(c => c.id === section?.courseId);
    const subjects = userAssignments.filter(a => a.sectionId === sectionId).map(a => a.subjectName);
    console.log(`   📍 "${course?.name} ${section?.name}" - Asignaturas: ${subjects.join(', ')}`);
  });
}

console.log('\n🔄 RECARGA LA PÁGINA DE COMUNICACIONES para ver los cambios');
console.log('💡 Si no ves cambios, verifica que estés logueado como profesor');

// 8. COMANDO DE LIMPIEZA (si es necesario)
console.log('\n🧹 Si necesitas limpiar y reconfigurar, ejecuta:');
console.log('localStorage.clear(); location.reload();');
