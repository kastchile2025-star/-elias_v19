// Script de diagnóstico para ejecutar en consola del navegador
function diagnosticarSistemaCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA SMART STUDENT');
  console.log('================================================');
  
  // 1. Verificar todas las claves de localStorage
  const allKeys = Object.keys(localStorage).filter(key => key.includes('smart-student'));
  console.log(`\n📊 CLAVES EN LOCALSTORAGE (${allKeys.length}):`);
  allKeys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const count = Array.isArray(data) ? data.length : (typeof data === 'object' ? 'Objeto' : 'Primitivo');
    console.log(`   ${key}: ${count} elementos`);
  });
  
  // 2. Analizar datos específicos
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  console.log('\n👥 ANÁLISIS DE USUARIOS:');
  const estudiantes = users.filter(u => u.role === 'estudiante');
  const profesores = users.filter(u => u.role === 'profesor');
  const admins = users.filter(u => u.role === 'admin');
  console.log(`   Estudiantes: ${estudiantes.length}`);
  console.log(`   Profesores: ${profesores.length}`);
  console.log(`   Administradores: ${admins.length}`);
  
  console.log('\n📚 ANÁLISIS DE CURSOS Y SECCIONES:');
  console.log(`   Cursos totales: ${courses.length}`);
  console.log(`   Secciones totales: ${sections.length}`);
  
  // Mostrar estructura de cursos
  courses.forEach(course => {
    const sectionsForCourse = sections.filter(s => s.courseId === course.id);
    console.log(`   📖 ${course.name}: ${sectionsForCourse.length} secciones`);
    sectionsForCourse.forEach(section => {
      console.log(`      └── ${section.name}`);
    });
  });
  
  console.log('\n🔗 ANÁLISIS DE ASIGNACIONES:');
  console.log(`   Asignaciones estudiante-curso: ${studentAssignments.length}`);
  console.log(`   Asignaciones profesor-sección: ${teacherAssignments.length}`);
  
  // Analizar asignaciones de estudiantes por sección
  sections.forEach(section => {
    const studentsInSection = studentAssignments.filter(a => a.sectionId === section.id);
    const course = courses.find(c => c.id === section.courseId);
    console.log(`   📋 ${course?.name || 'Curso desconocido'} - ${section.name}: ${studentsInSection.length} estudiantes`);
    
    // Mostrar estudiantes asignados
    studentsInSection.forEach(assignment => {
      const student = users.find(u => u.id === assignment.studentId);
      console.log(`      👤 ${student?.displayName || student?.name || 'Usuario desconocido'} (${student?.username || 'Sin username'})`);
    });
  });
  
  // Analizar asignaciones de profesores
  console.log('\n🎓 ASIGNACIONES DE PROFESORES:');
  teacherAssignments.forEach(assignment => {
    const teacher = users.find(u => u.id === assignment.teacherId);
    const section = sections.find(s => s.id === assignment.sectionId);
    const course = courses.find(c => c.id === section?.courseId);
    console.log(`   👨‍🏫 ${teacher?.displayName || teacher?.name || 'Profesor desconocido'} → ${course?.name || 'Curso desconocido'} - ${section?.name || 'Sección desconocida'}`);
  });
  
  console.log('\n⚠️ POSIBLES PROBLEMAS DETECTADOS:');
  let problemas = 0;
  
  // Verificar referencias rotas
  studentAssignments.forEach(assignment => {
    const student = users.find(u => u.id === assignment.studentId);
    const section = sections.find(s => s.id === assignment.sectionId);
    const course = courses.find(c => c.id === assignment.courseId);
    
    if (!student) {
      console.log(`   ❌ Estudiante no encontrado: ${assignment.studentId}`);
      problemas++;
    }
    if (!section) {
      console.log(`   ❌ Sección no encontrada: ${assignment.sectionId}`);
      problemas++;
    }
    if (!course) {
      console.log(`   ❌ Curso no encontrado: ${assignment.courseId}`);
      problemas++;
    }
  });
  
  teacherAssignments.forEach(assignment => {
    const teacher = users.find(u => u.id === assignment.teacherId);
    const section = sections.find(s => s.id === assignment.sectionId);
    
    if (!teacher) {
      console.log(`   ❌ Profesor no encontrado: ${assignment.teacherId}`);
      problemas++;
    }
    if (!section) {
      console.log(`   ❌ Sección no encontrada para profesor: ${assignment.sectionId}`);
      problemas++;
    }
  });
  
  if (problemas === 0) {
    console.log('   ✅ No se detectaron problemas de integridad');
  } else {
    console.log(`   ⚠️ Se detectaron ${problemas} problemas de integridad`);
  }
  
  console.log('\n🔄 DATOS RAW PARA DEPURACIÓN:');
  console.log('Estudiantes asignaciones (primeras 3):');
  console.log(studentAssignments.slice(0, 3));
  console.log('Profesor asignaciones (primeras 3):');
  console.log(teacherAssignments.slice(0, 3));
  console.log('Usuarios (primeras 3):');
  console.log(users.slice(0, 3));
  console.log('Cursos (primeros 3):');
  console.log(courses.slice(0, 3));
  console.log('Secciones (primeras 3):');
  console.log(sections.slice(0, 3));
  
  return {
    usuarios: { estudiantes, profesores, admins },
    cursos: courses,
    secciones: sections,
    asignacionesEstudiantes: studentAssignments,
    asignacionesProfesores: teacherAssignments,
    problemas
  };
}

// Ejecutar diagnóstico automáticamente
console.log('🚀 Iniciando diagnóstico...');
const resultado = diagnosticarSistemaCompleto();
console.log('\n✅ Diagnóstico completado. Resultado guardado en variable "resultado"');
