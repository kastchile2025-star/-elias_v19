// 🔧 VERIFICACIÓN: Nueva función de parseo corregida
console.clear();
console.log('🔧 VERIFICANDO FUNCIÓN DE PARSEO CORREGIDA');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Función corregida para parsear GUIDs dobles
function getCourseDataFromCombinedId(combinedId) {
  if (!combinedId || !combinedId.includes('-')) {
    console.warn(`ID no válido: "${combinedId}"`);
    return null;
  }
  
  const parts = combinedId.split('-');
  console.log(`Split parts: ${parts.length}`, parts);
  
  // Dos GUIDs concatenados = 10 partes cuando se divide por guiones
  if (parts.length !== 10) {
    console.warn(`Formato inesperado. Esperado 10 partes, recibido ${parts.length}`);
    return null;
  }
  
  // Reconstruir: primeras 5 partes = courseId, últimas 5 = sectionId
  const courseId = parts.slice(0, 5).join('-');
  const sectionId = parts.slice(5, 10).join('-');
  
  console.log(`✅ Parsed "${combinedId}"`);
  console.log(`   courseId: "${courseId}"`);
  console.log(`   sectionId: "${sectionId}"`);
  
  return { courseId, sectionId };
}

// 2️⃣ Probar con el ID problemático
const testId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
console.log(`\n🎯 Testing ID: ${testId}`);

const result = getCourseDataFromCombinedId(testId);

// 3️⃣ Verificar contra datos reales
if (result) {
  console.log('\n📊 VERIFICANDO CONTRA DATOS REALES:');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  
  console.log(`Buscando courseId: "${result.courseId}"`);
  console.log(`Buscando sectionId: "${result.sectionId}"`);
  
  const matches = studentAssignments.filter(assignment => 
    assignment.courseId === result.courseId && 
    assignment.sectionId === result.sectionId
  );
  
  console.log(`\n📈 RESULTADO: ${matches.length} coincidencias encontradas`);
  
  if (matches.length > 0) {
    console.log('✅ ¡ÉXITO! Asignaciones encontradas:');
    const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    matches.forEach((assignment, index) => {
      const user = allUsers.find(u => u.id === assignment.studentId);
      console.log(`   ${index + 1}. ${assignment.studentId} -> ${user ? user.username : 'Usuario no encontrado'}`);
    });
  } else {
    console.log('❌ Aún no se encuentran coincidencias');
  }
}

// 4️⃣ Probar función completa de estudiantes
function getStudentsInCourse(course) {
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  
  const courseData = getCourseDataFromCombinedId(course);
  if (!courseData) return [];
  
  const { courseId, sectionId } = courseData;
  
  const assignedStudentIds = studentAssignments
    .filter(assignment => assignment.courseId === courseId && assignment.sectionId === sectionId)
    .map(assignment => assignment.studentId);
  
  const studentsInCourse = assignedStudentIds
    .map(studentId => {
      const user = allUsers.find(u => u.id === studentId && u.role === 'student');
      return user ? { username: user.username, displayName: user.displayName || user.username } : null;
    })
    .filter(student => student !== null);
  
  return studentsInCourse;
}

console.log('\n🧪 PROBANDO FUNCIÓN COMPLETA getStudentsInCourse:');
const students = getStudentsInCourse(testId);

console.log(`📊 Estudiantes encontrados: ${students.length}`);
if (students.length > 0) {
  console.log('👥 Lista de estudiantes:');
  students.forEach((student, index) => {
    console.log(`   ${index + 1}. ${student.username} (${student.displayName})`);
  });
  console.log('\n🎉 ¡CORRECCIÓN EXITOSA! Las notificaciones de "Todo el Curso" ahora funcionarán');
} else {
  console.log('❌ Aún no encuentra estudiantes');
}

console.log('\n═══════════════════════════════════════════════════════════');
