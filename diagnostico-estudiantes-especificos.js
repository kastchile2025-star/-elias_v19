/**
 * 🔍 DIAGNÓSTICO: ¿Por qué no aparecen estudiantes específicos?
 * 
 * Copia y pega este código en la consola del navegador en la página de tareas
 */

console.log('🔍 DIAGNÓSTICO: Estudiantes Específicos');

// 1. Verificar usuario actual
const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
const currentUser = auth.user;

if (!currentUser) {
  console.log('❌ No hay usuario logueado');
} else {
  console.log(`👤 Usuario actual: ${currentUser.displayName} (${currentUser.role})`);
  console.log(`🔑 Username: ${currentUser.username}`);
}

// 2. Verificar datos de estudiantes
const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const estudiantes = allUsers.filter(u => u.role === 'student');

console.log(`\n📊 ESTUDIANTES EN LOCALSTORAGE:`);
console.log(`Total usuarios: ${allUsers.length}`);
console.log(`Total estudiantes: ${estudiantes.length}`);

if (estudiantes.length === 0) {
  console.log('❌ NO HAY ESTUDIANTES en localStorage');
  console.log('💡 Necesitas crear estudiantes en Gestión de Usuarios');
} else {
  console.log('\n👥 LISTA DE ESTUDIANTES:');
  estudiantes.forEach((est, i) => {
    console.log(`${i + 1}. ${est.displayName || est.name || est.username}`);
    console.log(`   • Username: ${est.username}`);
    console.log(`   • Cursos activos: ${JSON.stringify(est.activeCourses || [])}`);
    console.log(`   • Profesor asignado: ${est.assignedTeacher || 'No asignado'}`);
    console.log(`   • Profesores por materia: ${JSON.stringify(est.assignedTeachers || {})}`);
    console.log(`   • Sección: ${est.sectionName || 'No especificada'}`);
    console.log('');
  });
}

// 3. Verificar asignaciones del profesor actual
if (currentUser && currentUser.role === 'teacher') {
  console.log(`\n🎓 ESTUDIANTES ASIGNADOS AL PROFESOR "${currentUser.username}":`);
  
  const estudiantesAsignados = estudiantes.filter(est => 
    est.assignedTeacher === currentUser.username ||
    (est.assignedTeachers && Object.values(est.assignedTeachers || {}).includes(currentUser.username))
  );
  
  console.log(`📝 Total asignados: ${estudiantesAsignados.length}`);
  
  if (estudiantesAsignados.length === 0) {
    console.log('❌ NO HAY ESTUDIANTES ASIGNADOS a este profesor');
    console.log('💡 Ve a Gestión de Usuarios > Asignaciones y asigna estudiantes');
  } else {
    estudiantesAsignados.forEach((est, i) => {
      console.log(`${i + 1}. ${est.displayName || est.username}`);
      console.log(`   • Cursos: ${JSON.stringify(est.activeCourses || [])}`);
      
      if (est.assignedTeacher === currentUser.username) {
        console.log(`   • ✅ Asignado directamente`);
      }
      
      if (est.assignedTeachers) {
        const materias = Object.keys(est.assignedTeachers).filter(
          materia => est.assignedTeachers[materia] === currentUser.username
        );
        if (materias.length > 0) {
          console.log(`   • ✅ Asignado por materias: ${materias.join(', ')}`);
        }
      }
    });
  }
}

// 4. Verificar cursos disponibles
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log(`\n📚 CURSOS EN LOCALSTORAGE:`);
console.log(`Total cursos: ${courses.length}`);
console.log(`Total secciones: ${sections.length}`);

// 5. Simular la función getStudentsForCourse
console.log(`\n🧪 SIMULANDO getStudentsForCourse("5to Básico Sección A"):`);

const courseId = "5to Básico Sección A"; // Del formulario en la imagen
if (currentUser && currentUser.role === 'teacher') {
  // Simulación simplificada
  const assignedStudents = estudiantes.filter(userObj => {
    if (userObj.role !== 'student') return false;
    
    return userObj.assignedTeacher === currentUser.username ||
           (userObj.assignedTeachers && Object.values(userObj.assignedTeachers).includes(currentUser.username));
  });
  
  console.log(`🎯 Resultado simulado: ${assignedStudents.length} estudiantes`);
  assignedStudents.forEach(s => {
    console.log(`   • ${s.displayName || s.username}`);
  });
  
  if (assignedStudents.length === 0) {
    console.log('❌ PROBLEMA IDENTIFICADO: No hay estudiantes asignados');
    console.log('🔧 SOLUCIÓN: Ve a Admin > Gestión de Usuarios > Asignaciones');
  }
}

// 6. Función para crear estudiantes de prueba
function crearEstudiantesPrueba() {
  if (!currentUser || currentUser.role !== 'teacher') {
    console.log('❌ Necesitas estar logueado como profesor');
    return;
  }
  
  console.log('🏗️ Creando estudiantes de prueba...');
  
  const estudiantesPrueba = [
    {
      id: `student-test-${Date.now()}-1`,
      username: 'estudiante1',
      name: 'Ana García',
      displayName: 'Ana García',
      email: 'ana@test.com',
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
      id: `student-test-${Date.now()}-2`,
      username: 'estudiante2',
      name: 'Carlos López',
      displayName: 'Carlos López',
      email: 'carlos@test.com',
      role: 'student',
      password: '1234',
      activeCourses: ['5to Básico Sección A', '4to Básico - A'],
      assignedTeacher: currentUser.username,
      assignedTeachers: {
        'Ciencias Naturales': currentUser.username,
        'Matemáticas': currentUser.username
      },
      sectionName: 'A'
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
  
  console.log('✅ Estudiantes de prueba creados');
  console.log('🔄 Recarga la página o reintenta crear una tarea');
}

// Hacer función disponible
window.crearEstudiantesPrueba = crearEstudiantesPrueba;

console.log('\n🔧 FUNCIÓN DISPONIBLE: crearEstudiantesPrueba()');
console.log('💡 Ejecuta crearEstudiantesPrueba() si no hay estudiantes');
