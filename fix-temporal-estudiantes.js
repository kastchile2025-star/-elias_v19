/**
 * 🛠️ FIX RÁPIDO: Reemplazar función getStudentsForCourse
 * 
 * Ejecuta este script en la consola para reemplazar temporalmente la función
 * hasta que se arregle el código fuente.
 */

console.log('🛠️ APLICANDO FIX TEMPORAL: getStudentsForCourse');

// Reemplazar la función temporalmente en window
window.getStudentsForCourseFixed = function(courseId) {
  console.log(`🚀 [FIX TEMPORAL] Obteniendo estudiantes para courseId: "${courseId}"`);
  
  // Obtener usuario actual
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const currentUser = auth.user;
  
  if (!courseId || !currentUser?.username) {
    console.log('⚠️ [FIX TEMPORAL] Sin courseId o usuario');
    return [];
  }
  
  // Cargar datos frescos del localStorage
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  console.log(`📊 [FIX TEMPORAL] Total usuarios en localStorage: ${allUsers.length}`);
  
  // Filtrar solo estudiantes
  const allStudents = allUsers.filter(u => u.role === 'student');
  console.log(`🎓 [FIX TEMPORAL] Total estudiantes: ${allStudents.length}`);
  
  // Obtener estudiantes asignados al profesor actual
  const assignedStudents = allStudents.filter(student => {
    // Verificar asignación directa
    const directAssignment = student.assignedTeacher === currentUser.username;
    
    // Verificar asignación por materias
    const subjectAssignment = student.assignedTeachers && 
      Object.values(student.assignedTeachers).includes(currentUser.username);
    
    return directAssignment || subjectAssignment;
  });
  
  console.log(`✅ [FIX TEMPORAL] Estudiantes asignados al profesor "${currentUser.username}": ${assignedStudents.length}`);
  
  // Log detallado de cada estudiante
  assignedStudents.forEach((student, index) => {
    console.log(`   ${index + 1}. ${student.displayName || student.name || student.username}`);
    console.log(`      • Username: ${student.username}`);
    console.log(`      • Cursos activos: ${JSON.stringify(student.activeCourses || [])}`);
    console.log(`      • Asignación directa: ${student.assignedTeacher === currentUser.username ? 'SÍ' : 'NO'}`);
    
    if (student.assignedTeachers) {
      const subjects = Object.keys(student.assignedTeachers).filter(
        subject => student.assignedTeachers[subject] === currentUser.username
      );
      if (subjects.length > 0) {
        console.log(`      • Materias asignadas: ${subjects.join(', ')}`);
      }
    }
  });
  
  if (assignedStudents.length === 0) {
    console.log('❌ [FIX TEMPORAL] NO HAY ESTUDIANTES ASIGNADOS');
    console.log('💡 [SOLUCIÓN] Ve a Admin > Gestión de Usuarios > Asignaciones');
    console.log('💡 [SOLUCIÓN] Asigna estudiantes al profesor actual');
  }
  
  // Retornar en el formato esperado
  return assignedStudents.map(s => ({
    id: s.id,
    username: s.username,
    displayName: s.displayName || s.name || s.username
  }));
};

// Interceptar llamadas a la función original
const originalGetStudentsForCourse = window.getStudentsForCourse;
window.getStudentsForCourse = window.getStudentsForCourseFixed;

console.log('✅ [FIX TEMPORAL] Función reemplazada temporalmente');
console.log('🔄 [FIX TEMPORAL] Ahora intenta crear una nueva tarea');

// Función para crear estudiantes de prueba si no los hay
window.crearEstudiantesParaProfesor = function() {
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const currentUser = auth.user;
  
  if (!currentUser || currentUser.role !== 'teacher') {
    console.log('❌ Necesitas estar logueado como profesor');
    return;
  }
  
  console.log('🏗️ Creando estudiantes de prueba para profesor...');
  
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  const estudiantesPrueba = [
    {
      id: `student-${Date.now()}-1`,
      username: 'felipe',
      name: 'Felipe Student',
      displayName: 'Felipe Student',
      email: 'felipe@test.com',
      role: 'student',
      password: '1234',
      activeCourses: ['5to Básico Sección A', '4to Básico - A'],
      assignedTeacher: currentUser.username,
      assignedTeachers: {
        'Ciencias Naturales': currentUser.username,
        'Matemáticas': currentUser.username
      },
      sectionName: 'A'
    },
    {
      id: `student-${Date.now()}-2`,
      username: 'maria',
      name: 'Maria Student',
      displayName: 'Maria Student',
      email: 'maria@test.com',
      role: 'student',
      password: '1234',
      activeCourses: ['5to Básico Sección A', '4to Básico - B'],
      assignedTeacher: currentUser.username,
      assignedTeachers: {
        'Ciencias Naturales': currentUser.username,
        'Matemáticas': currentUser.username
      },
      sectionName: 'A'
    },
    {
      id: `student-${Date.now()}-3`,
      username: 'sofia',
      name: 'Sofia Student',
      displayName: 'Sofia Student',
      email: 'sofia@test.com',
      role: 'student',
      password: '1234',
      activeCourses: ['4to Básico - B', '5to Básico Sección A'],
      assignedTeacher: currentUser.username,
      assignedTeachers: {
        'Ciencias Naturales': currentUser.username,
        'Matemáticas': currentUser.username
      },
      sectionName: 'B'
    }
  ];
  
  // Añadir a usuarios existentes
  const updatedUsers = [...allUsers, ...estudiantesPrueba];
  localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
  
  // Disparar eventos de sincronización
  window.dispatchEvent(new CustomEvent('usersUpdated', {
    detail: { action: 'test-creation', timestamp: new Date().toISOString() }
  }));
  
  window.dispatchEvent(new CustomEvent('studentAssignmentsUpdated', {
    detail: { action: 'test-creation', timestamp: new Date().toISOString() }
  }));
  
  console.log('✅ Estudiantes de prueba creados y asignados');
  console.log('🔄 Ahora intenta crear una nueva tarea');
  
  // Probar la función
  setTimeout(() => {
    const resultado = window.getStudentsForCourseFixed('5to Básico Sección A');
    console.log(`🧪 PRUEBA: ${resultado.length} estudiantes encontrados`);
  }, 1000);
};

console.log('\n🔧 FUNCIONES DISPONIBLES:');
console.log('• crearEstudiantesParaProfesor() - Crear estudiantes de prueba');
console.log('• getStudentsForCourseFixed(courseId) - Función corregida');

// Auto-ejecutar diagnóstico
setTimeout(() => {
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  if (auth.user && auth.user.role === 'teacher') {
    const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const estudiantes = allUsers.filter(u => u.role === 'student');
    const asignados = estudiantes.filter(e => 
      e.assignedTeacher === auth.user.username ||
      (e.assignedTeachers && Object.values(e.assignedTeachers || {}).includes(auth.user.username))
    );
    
    console.log(`\n📊 DIAGNÓSTICO AUTOMÁTICO:`);
    console.log(`• Profesor: ${auth.user.displayName}`);
    console.log(`• Estudiantes total: ${estudiantes.length}`);
    console.log(`• Estudiantes asignados: ${asignados.length}`);
    
    if (asignados.length === 0) {
      console.log('⚠️ PROBLEMA: No hay estudiantes asignados');
      console.log('💡 Ejecuta: crearEstudiantesParaProfesor()');
    } else {
      console.log('✅ HAY ESTUDIANTES ASIGNADOS');
      console.log('🎯 Ahora intenta crear una nueva tarea');
    }
  }
}, 2000);
