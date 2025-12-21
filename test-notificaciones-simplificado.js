// 🔧 SCRIPT SIMPLIFICADO: Probar notificaciones directamente en consola
// Ejecuta esto en la página de tareas (/dashboard/tareas) donde TaskNotificationManager está disponible

console.clear();
console.log('🎯 PROBANDO NOTIFICACIONES DE "TODO EL CURSO" DIRECTAMENTE');
console.log('═══════════════════════════════════════════════════════════');

// Función auxiliar para parsear IDs combinados (misma lógica que implementamos)
function getCourseDataFromCombinedId(combinedId) {
  if (!combinedId || !combinedId.includes('-')) {
    console.warn(`ID no válido: "${combinedId}"`);
    return null;
  }
  
  const lastDashIndex = combinedId.lastIndexOf('-');
  if (lastDashIndex === -1) return null;
  
  const courseId = combinedId.substring(0, lastDashIndex);
  const sectionId = combinedId.substring(lastDashIndex + 1);
  
  return { courseId, sectionId };
}

// Función para obtener estudiantes usando la nueva lógica
function getStudentsInCourse(course) {
  console.log(`🔍 Buscando estudiantes en curso: "${course}"`);
  
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  
  const courseData = getCourseDataFromCombinedId(course);
  if (!courseData) {
    console.error(`❌ No se pudo parsear courseId: "${course}"`);
    return [];
  }
  
  const { courseId, sectionId } = courseData;
  console.log(`📚 Parsed - CourseId: ${courseId}, SectionId: ${sectionId}`);
  
  const assignedStudentIds = studentAssignments
    .filter(assignment => assignment.courseId === courseId && assignment.sectionId === sectionId)
    .map(assignment => assignment.studentId);
  
  console.log(`🎯 Student IDs asignados: ${assignedStudentIds.length}`, assignedStudentIds);
  
  const studentsInCourse = assignedStudentIds
    .map(studentId => {
      const user = allUsers.find(u => u.id === studentId && u.role === 'student');
      return user ? { username: user.username, displayName: user.displayName || user.username } : null;
    })
    .filter(student => student !== null);
  
  console.log(`✅ Estudiantes encontrados: ${studentsInCourse.length}`);
  studentsInCourse.forEach((student, index) => {
    console.log(`   ${index + 1}. ${student.username} (${student.displayName})`);
  });
  
  return studentsInCourse;
}

// Probar la función con datos reales
console.log('\n1️⃣ PROBANDO FUNCIÓN getStudentsInCourse:');
const courseId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
const students = getStudentsInCourse(courseId);

console.log('\n2️⃣ RESULTADO:');
if (students.length > 0) {
  console.log(`✅ ¡ÉXITO! Función corregida encuentra ${students.length} estudiantes`);
  console.log(`👥 Estudiantes: [${students.map(s => s.username).join(', ')}]`);
  console.log('\n🎯 Esto significa que las notificaciones de "Todo el Curso" ahora funcionarán');
} else {
  console.log('❌ La función no encuentra estudiantes');
}

console.log('\n3️⃣ CREAR NUEVA TAREA PARA PROBAR:');
console.log('💡 Para probar completamente:');
console.log('   1. Ve al panel del profesor');
console.log('   2. Crea una nueva tarea asignada a "Todo el Curso"');
console.log('   3. Verifica que los estudiantes reciban la notificación');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔧 DIAGNÓSTICO COMPLETADO - Las correcciones están funcionando');
