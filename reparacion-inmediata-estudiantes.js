// SCRIPT DE REPARACIÓN INMEDIATA
// Ejecutar en la consola del navegador para corregir los datos

console.log('🚀 INICIANDO REPARACIÓN DE DATOS...');

// Obtener datos actuales
const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');

if (!auth.user || auth.user.role !== 'teacher') {
  console.error('❌ Error: Debes estar logueado como profesor');
} else {
  console.log('👤 Profesor actual:', auth.user.displayName, '(username:', auth.user.username, ')');
  
  // Buscar el curso por UUID
  const targetCourseId = '9077a79d-c290-45f9-b549-6e57df8828d2';
  const targetCourse = courses.find(c => c.id === targetCourseId);
  
  console.log('🔍 Curso objetivo:', targetCourse);
  
  if (!targetCourse) {
    console.log('❌ No se encontró el curso con UUID. Creando curso...');
    courses.push({
      id: targetCourseId,
      name: '4to Básico'
    });
    localStorage.setItem('smart-student-courses', JSON.stringify(courses));
    console.log('✅ Curso creado:', targetCourseId);
  }
  
  // Reparar estudiantes - asignar al curso correcto y al profesor
  const estudiantesParaReparar = ['felipe', 'maria', 'sofia'];
  let reparados = 0;
  
  users.forEach(user => {
    if (user.role === 'student' && estudiantesParaReparar.includes(user.username)) {
      console.log('🔧 Reparando estudiante:', user.username);
      
      // Asignar al curso por UUID
      user.activeCourses = [targetCourseId];
      
      // Asignar al profesor actual
      user.assignedTeacher = auth.user.username;
      user.assignedTeachers = {
        'Lenguaje y Comunicación': auth.user.username,
        'Matemáticas': auth.user.username,
        'Ciencias Naturales': auth.user.username,
        'Historia, Geografía y Ciencias Sociales': auth.user.username
      };
      
      console.log('✅ Reparado:', user.username, '- Curso:', user.activeCourses, '- Profesor:', user.assignedTeacher);
      reparados++;
    }
  });
  
  // Guardar cambios
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  
  console.log('🎉 REPARACIÓN COMPLETADA:');
  console.log(`   • Estudiantes reparados: ${reparados}`);
  console.log(`   • Curso objetivo: ${targetCourseId}`);
  console.log(`   • Profesor asignado: ${auth.user.username}`);
  console.log('');
  console.log('💡 Ahora recarga la página y vuelve a intentar crear una tarea.');
  console.log('   Los estudiantes deberían aparecer en "Estudiantes específicos".');
}

console.log('🔚 Script completado.');
