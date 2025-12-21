// DIAGNÓSTICO COMPLETO DEL SISTEMA
// Ejecuta este script en la consola del navegador (F12 > Console)

console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE COMUNICACIONES');

// 1. Verificar usuario actual
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
console.log('\n👤 USUARIO ACTUAL:');
console.log(currentUser);

// 2. Verificar datos del sistema
console.log('\n📊 DATOS DEL SISTEMA:');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
const assignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');

console.log(`📚 Cursos encontrados: ${courses.length}`);
console.log('Cursos:', courses);

console.log(`📝 Secciones encontradas: ${sections.length}`);
console.log('Secciones:', sections);

console.log(`👨‍🏫 Asignaciones encontradas: ${assignments.length}`);
console.log('Asignaciones:', assignments);

// 3. Si es profesor, verificar sus asignaciones
if (currentUser && currentUser.role === 'teacher') {
  console.log('\n🎯 ANÁLISIS DE ASIGNACIONES DEL PROFESOR:');
  
  const userAssignments = assignments.filter(assignment => 
    assignment.teacherId === currentUser.id || assignment.teacherId === currentUser.username
  );
  
  console.log(`Asignaciones para ${currentUser.id}:`, userAssignments);
  
  if (userAssignments.length === 0) {
    console.log('❌ EL PROFESOR NO TIENE ASIGNACIONES');
    console.log('💡 Esto explica por qué no aparecen cursos-sección');
    
    // Crear asignaciones automáticamente
    console.log('\n🔧 CREANDO ASIGNACIONES AUTOMÁTICAMENTE...');
    
    if (courses.length > 0 && sections.length > 0) {
      const newAssignments = [
        {
          id: 'auto-asig-1',
          teacherId: currentUser.id,
          sectionId: sections[0].id,
          subjectName: 'Matemáticas',
          assignedAt: new Date().toISOString()
        }
      ];
      
      if (sections.length > 1) {
        newAssignments.push({
          id: 'auto-asig-2',
          teacherId: currentUser.id,
          sectionId: sections[1].id,
          subjectName: 'Lenguaje',
          assignedAt: new Date().toISOString()
        });
      }
      
      const allAssignments = [...assignments, ...newAssignments];
      localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(allAssignments));
      
      console.log('✅ Asignaciones creadas:', newAssignments);
      console.log('🔄 RECARGA LA PÁGINA para ver los cambios');
    } else {
      console.log('❌ No hay cursos o secciones para asignar');
    }
  } else {
    // Mostrar cursos-sección que deberían aparecer
    console.log('\n🎯 CURSOS-SECCIÓN QUE DEBERÍAN APARECER:');
    
    const uniqueSections = [...new Set(userAssignments.map(a => a.sectionId))];
    uniqueSections.forEach(sectionId => {
      const section = sections.find(s => s.id === sectionId);
      const course = courses.find(c => c.id === section?.courseId);
      const subjects = userAssignments.filter(a => a.sectionId === sectionId).map(a => a.subjectName);
      
      if (course && section) {
        console.log(`   📍 "${course.name} ${section.name}" - Asignaturas: ${subjects.join(', ')}`);
      } else {
        console.log(`   ❌ Sección inválida: ${sectionId}`);
      }
    });
  }
} else {
  console.log('\n❌ NO ERES PROFESOR O NO ESTÁS LOGUEADO');
}

// 4. Verificar si LocalStorageManager está disponible
console.log('\n🔧 VERIFICACIÓN TÉCNICA:');
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    console.log('✅ localStorage disponible');
  } else {
    console.log('❌ localStorage no disponible');
  }
} catch (e) {
  console.log('❌ Error accediendo localStorage:', e);
}

// 5. Comando para crear datos completos si es necesario
if (courses.length === 0 || sections.length === 0) {
  console.log('\n🚀 CONFIGURANDO DATOS COMPLETOS DEL SISTEMA...');
  
  const realCourses = [
    { id: 'curso-4', name: '4to Básico', level: 'basica', year: 4 },
    { id: 'curso-5', name: '5to Básico', level: 'basica', year: 5 },
    { id: 'curso-6', name: '6to Básico', level: 'basica', year: 6 }
  ];
  
  const realSections = [
    { id: 'seccion-4A', name: 'A', courseId: 'curso-4', uniqueCode: 'SEC-4A' },
    { id: 'seccion-4B', name: 'B', courseId: 'curso-4', uniqueCode: 'SEC-4B' },
    { id: 'seccion-5A', name: 'A', courseId: 'curso-5', uniqueCode: 'SEC-5A' },
    { id: 'seccion-5B', name: 'B', courseId: 'curso-5', uniqueCode: 'SEC-5B' }
  ];
  
  const realAssignments = currentUser ? [
    { id: 'asig-1', teacherId: currentUser.id, sectionId: 'seccion-4A', subjectName: 'Matemáticas', assignedAt: new Date().toISOString() },
    { id: 'asig-2', teacherId: currentUser.id, sectionId: 'seccion-5A', subjectName: 'Lenguaje', assignedAt: new Date().toISOString() }
  ] : [];
  
  localStorage.setItem('smart-student-courses', JSON.stringify(realCourses));
  localStorage.setItem('smart-student-sections', JSON.stringify(realSections));
  localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(realAssignments));
  
  console.log('✅ DATOS CONFIGURADOS!');
  console.log('🔄 RECARGA LA PÁGINA para ver: "4to Básico A" y "5to Básico A"');
}

console.log('\n💡 RESUMEN:');
console.log('1. Si no ves cursos-sección, significa que no tienes asignaciones');
console.log('2. Ve al módulo Admin > Gestión de Usuarios > Asignaciones');
console.log('3. Asigna tu usuario a algunas secciones específicas');
console.log('4. O ejecuta el script de configuración automática de arriba');
