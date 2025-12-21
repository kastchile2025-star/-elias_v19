// SCRIPT DE PRUEBA PARA ESTUDIANTES ESPECÍFICOS
// Ejecutar en la consola del navegador cuando estés en la página de crear tarea

console.log('🚀 INICIANDO PRUEBA DE ESTUDIANTES ESPECÍFICOS...');

// Función para crear datos de prueba rápidamente
function crearDatosPrueba() {
  console.log('📝 Creando datos de prueba...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  if (!auth.user || auth.user.role !== 'teacher') {
    console.error('❌ Error: Debes estar logueado como profesor');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  
  // Crear curso si no existe
  const courseId = '4to Básico Sección A';
  if (!courses.find(c => c.id === courseId)) {
    courses.push({ id: courseId, name: courseId });
    localStorage.setItem('smart-student-courses', JSON.stringify(courses));
    console.log('✅ Curso creado:', courseId);
  }
  
  // Crear estudiantes de prueba
  const estudiantes = [
    { username: 'ana.test', name: 'Ana Test' },
    { username: 'luis.test', name: 'Luis Test' },
    { username: 'sofia.test', name: 'Sofia Test' }
  ];
  
  estudiantes.forEach(({ username, name }) => {
    const existing = users.find(u => u.username === username);
    if (existing) {
      // Actualizar estudiante existente
      existing.activeCourses = [courseId];
      existing.assignedTeacher = auth.user.username;
      existing.assignedTeachers = {
        'Lenguaje y Comunicación': auth.user.username
      };
      console.log('🔄 Actualizado:', name);
    } else {
      // Crear nuevo estudiante
      users.push({
        id: `student-${username}`,
        username: username,
        displayName: name,
        role: 'student',
        activeCourses: [courseId],
        assignedTeacher: auth.user.username,
        assignedTeachers: {
          'Lenguaje y Comunicación': auth.user.username
        }
      });
      console.log('✅ Creado:', name);
    }
  });
  
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  console.log('🎉 ¡Datos de prueba creados! Recarga la página.');
}

// Función para verificar el estado actual
function verificarEstado() {
  console.log('🔍 VERIFICANDO ESTADO ACTUAL...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  if (!auth.user) {
    console.error('❌ No hay usuario logueado');
    return;
  }
  
  console.log('👤 Usuario:', auth.user.displayName, '(' + auth.user.role + ')');
  
  if (auth.user.role === 'teacher') {
    const estudiantes = users.filter(u => 
      u.role === 'student' && (
        u.assignedTeacher === auth.user.username ||
        (u.assignedTeachers && Object.values(u.assignedTeachers).includes(auth.user.username))
      )
    );
    
    console.log('👥 Estudiantes asignados:', estudiantes.length);
    estudiantes.forEach(e => {
      console.log(`   • ${e.displayName} - Cursos: ${e.activeCourses?.join(', ')}`);
    });
    
    if (estudiantes.length === 0) {
      console.log('⚠️  No hay estudiantes asignados. Ejecuta crearDatosPrueba()');
    }
  }
}

// Hacer las funciones globales
window.crearDatosPrueba = crearDatosPrueba;
window.verificarEstado = verificarEstado;

// Ejecutar verificación inicial
verificarEstado();

console.log('📋 COMANDOS DISPONIBLES:');
console.log('   • verificarEstado() - Ver estado actual');
console.log('   • crearDatosPrueba() - Crear estudiantes de prueba');
console.log('🔚 Script cargado. ¡Prueba la funcionalidad!');
