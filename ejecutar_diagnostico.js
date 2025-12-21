// Diagnóstico directo del localStorage simulado
// Este script simula el diagnóstico que se haría en el navegador

function simularDiagnostico() {
  console.log('🔍 DIAGNÓSTICO DEL SISTEMA SMART STUDENT');
  console.log('==========================================');
  
  // Simular datos que estarían en localStorage
  console.log('\n📋 EJECUTA ESTE SCRIPT EN LA CONSOLA DEL NAVEGADOR:');
  console.log('(Abre http://localhost:3001, presiona F12, ve a Console y pega este código)\n');
  
  const diagnosticScript = `
// Diagnóstico completo del sistema
function diagnosticarSistema() {
  console.clear();
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA SMART STUDENT');
  console.log('================================================');
  
  // 1. Verificar todas las claves de localStorage
  const allKeys = Object.keys(localStorage).filter(key => key.includes('smart-student'));
  console.log('\\n📊 CLAVES EN LOCALSTORAGE (' + allKeys.length + '):');
  allKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const count = Array.isArray(data) ? data.length : (typeof data === 'object' ? 'Objeto' : 'Primitivo');
      console.log('   ' + key + ': ' + count + ' elementos');
    } catch (e) {
      console.log('   ' + key + ': Error al parsear');
    }
  });
  
  if (allKeys.length === 0) {
    console.log('   ❌ NO SE ENCONTRARON DATOS DE SMART STUDENT');
    console.log('   💡 Posibles causas:');
    console.log('      - Los datos no se han importado aún');
    console.log('      - La importación falló');
    console.log('      - Los datos se guardaron con otro nombre');
    console.log('\\n🔍 Buscando todas las claves de localStorage:');
    Object.keys(localStorage).forEach(key => {
      console.log('   📦 ' + key);
    });
    return;
  }
  
  // 2. Analizar datos específicos
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  console.log('\\n👥 ANÁLISIS DE USUARIOS:');
  const estudiantes = users.filter(u => u.role === 'estudiante');
  const profesores = users.filter(u => u.role === 'profesor');
  const admins = users.filter(u => u.role === 'admin');
  console.log('   Estudiantes: ' + estudiantes.length);
  console.log('   Profesores: ' + profesores.length);
  console.log('   Administradores: ' + admins.length);
  
  if (users.length === 0) {
    console.log('   ❌ NO HAY USUARIOS IMPORTADOS');
  } else {
    console.log('\\n   📋 Primeros 3 usuarios:');
    users.slice(0, 3).forEach(user => {
      console.log('      👤 ' + (user.displayName || user.name || 'Sin nombre') + ' (' + user.role + ')');
    });
  }
  
  console.log('\\n📚 ANÁLISIS DE CURSOS Y SECCIONES:');
  console.log('   Cursos totales: ' + courses.length);
  console.log('   Secciones totales: ' + sections.length);
  
  if (courses.length === 0) {
    console.log('   ❌ NO HAY CURSOS IMPORTADOS');
  } else {
    console.log('\\n   📖 Cursos disponibles:');
    courses.forEach(course => {
      const sectionsForCourse = sections.filter(s => s.courseId === course.id);
      console.log('      📚 ' + course.name + ': ' + sectionsForCourse.length + ' secciones');
      sectionsForCourse.forEach(section => {
        console.log('         └── ' + section.name);
      });
    });
  }
  
  console.log('\\n🔗 ANÁLISIS DE ASIGNACIONES:');
  console.log('   Asignaciones estudiante-curso: ' + studentAssignments.length);
  console.log('   Asignaciones profesor-sección: ' + teacherAssignments.length);
  
  if (studentAssignments.length === 0) {
    console.log('   ❌ NO HAY ASIGNACIONES DE ESTUDIANTES');
  } else {
    console.log('\\n   📋 Distribución por sección:');
    sections.forEach(section => {
      const studentsInSection = studentAssignments.filter(a => a.sectionId === section.id);
      const course = courses.find(c => c.id === section.courseId);
      console.log('      🏫 ' + (course?.name || 'Curso desconocido') + ' - ' + section.name + ': ' + studentsInSection.length + ' estudiantes');
    });
  }
  
  if (teacherAssignments.length === 0) {
    console.log('\\n   ❌ NO HAY ASIGNACIONES DE PROFESORES');
  } else {
    console.log('\\n   🎓 Asignaciones de profesores:');
    teacherAssignments.forEach(assignment => {
      const teacher = users.find(u => u.id === assignment.teacherId);
      const section = sections.find(s => s.id === assignment.sectionId);
      const course = courses.find(c => c.id === section?.courseId);
      console.log('      👨‍🏫 ' + (teacher?.displayName || 'Profesor desconocido') + ' → ' + (course?.name || 'Curso desconocido') + ' - ' + (section?.name || 'Sección desconocida'));
    });
  }
  
  console.log('\\n🔍 DATOS RAW (para depuración):');
  console.log('📊 Usuarios:', users);
  console.log('📚 Cursos:', courses);
  console.log('🏫 Secciones:', sections);
  console.log('👥 Asignaciones estudiantes:', studentAssignments);
  console.log('🎓 Asignaciones profesores:', teacherAssignments);
  
  return {
    usuarios: { estudiantes, profesores, admins },
    cursos: courses,
    secciones: sections,
    asignacionesEstudiantes: studentAssignments,
    asignacionesProfesores: teacherAssignments
  };
}

// Ejecutar diagnóstico
console.log('🚀 Iniciando diagnóstico...');
const resultado = diagnosticarSistema();
console.log('\\n✅ Diagnóstico completado');
  `;
  
  console.log(diagnosticScript);
  console.log('\n📋 INSTRUCCIONES:');
  console.log('1. Copia todo el código de arriba');
  console.log('2. Ve al navegador (http://localhost:3001)');
  console.log('3. Abre la consola del desarrollador (F12)');
  console.log('4. Pega el código y presiona Enter');
  console.log('5. Comparte aquí el resultado del diagnóstico');
}

simularDiagnostico();
