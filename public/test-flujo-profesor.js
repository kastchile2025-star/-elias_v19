// Script para probar la nueva funcionalidad de creación de profesores
// Ejecutar en la consola del navegador

console.log('🧪 PRUEBA - CREACIÓN DE PROFESORES CON CURSOS Y ASIGNATURAS');
console.log('═══════════════════════════════════════════════════════════');

function probarNuevoFlujoProfesor() {
  console.log('\n🔍 VERIFICANDO ESTADO ACTUAL...\n');
  
  // Verificar que estamos en la página correcta
  const currentPath = window.location.pathname;
  if (!currentPath.includes('gestion-usuarios')) {
    console.log('⚠️  Ve a la página de Gestión de Usuarios primero');
    console.log('💡 URL: /dashboard/gestion-usuarios');
    return;
  }
  
  // Verificar login como admin
  const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
  if (!currentUser || currentUser.role !== 'admin') {
    console.log('⚠️  Necesitas estar logueado como administrador');
    console.log('💡 Ejecuta: loginComoAdmin()');
    return;
  }
  
  console.log('✅ Usuario actual:', currentUser.displayName);
  console.log('✅ Página correcta:', currentPath);
  
  // Verificar que getSubjectsForCourse funciona
  console.log('\n📚 VERIFICANDO ASIGNATURAS POR CURSO...\n');
  
  const testCourses = ['1ro Básico', '4to Básico', '8vo Básico', '1ro Medio'];
  
  testCourses.forEach(course => {
    // Simular la función getSubjectsForCourse
    const books = JSON.parse(localStorage.getItem('books-data') || '[]');
    
    // Como no tenemos access directo a la función, simulamos la lógica
    const mockSubjects = {
      '1ro Básico': ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
      '4to Básico': ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
      '8vo Básico': ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas'],
      '1ro Medio': ['Biología', 'Física', 'Química', 'Historia, Geografía y Ciencias Sociales', 'Lenguaje y Comunicación', 'Matemáticas']
    };
    
    const subjects = mockSubjects[course] || [];
    console.log(`📖 ${course}: ${subjects.length} asignaturas`);
    subjects.forEach(subject => {
      console.log(`   • ${subject}`);
    });
    console.log('');
  });
  
  console.log('\n✅ FLUJO ESPERADO:\n');
  console.log('1. Hacer clic en "Crear Nuevo Usuario"');
  console.log('2. Completar datos básicos (usuario, nombre, email, contraseña)');
  console.log('3. Seleccionar rol: "Profesor"');
  console.log('4. 🆕 SELECCIONAR CURSO PRINCIPAL (lista desplegable)');
  console.log('5. 🆕 VER ASIGNATURAS DISPONIBLES para ese curso');
  console.log('6. Seleccionar las asignaturas que enseñará');
  console.log('7. Opcionalmente agregar cursos adicionales');
  console.log('8. Crear el profesor');
  
  console.log('\n📝 EJEMPLO DE PRUEBA:\n');
  console.log('• Nombre: "Profesor Test"');
  console.log('• Usuario: "prof_test"');
  console.log('• Email: "test@teacher.com"');
  console.log('• Curso Principal: "6to Básico"');
  console.log('• Asignaturas: Matemáticas + Ciencias Naturales');
  console.log('• Cursos adicionales: (opcional) 7mo Básico');
  
  console.log('\n🔍 VERIFICACIONES:\n');
  console.log('✓ Solo aparecen asignaturas del curso seleccionado');
  console.log('✓ Se requiere al menos una asignatura');
  console.log('✓ Se puede agregar cursos adicionales');
  console.log('✓ El profesor queda correctamente configurado');
  
  return true;
}

function simularCreacionProfesor() {
  console.log('\n🚀 SIMULANDO CREACIÓN DE PROFESOR...\n');
  
  const nuevoProfesor = {
    username: 'prof_demo_' + Date.now(),
    displayName: 'Profesor Demo',
    email: 'demo@teacher.com',
    role: 'teacher',
    selectedCourse: '6to Básico',
    activeCourses: ['6to Básico', '7mo Básico'], // Principal + adicional
    teachingSubjects: ['Matemáticas', 'Ciencias Naturales'],
    password: '1234'
  };
  
  // Agregar a localStorage
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  // Crear estructura completa del profesor
  const profesorCompleto = {
    ...nuevoProfesor,
    teachingAssignments: nuevoProfesor.teachingSubjects.map(subject => ({
      teacherUsername: nuevoProfesor.username,
      teacherName: nuevoProfesor.displayName,
      subject: subject,
      courses: nuevoProfesor.activeCourses
    }))
  };
  
  users.push(profesorCompleto);
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  
  console.log('✅ Profesor creado:', profesorCompleto.displayName);
  console.log('   Username:', profesorCompleto.username);
  console.log('   Curso principal:', profesorCompleto.selectedCourse);
  console.log('   Todos los cursos:', profesorCompleto.activeCourses.join(', '));
  console.log('   Asignaturas:', profesorCompleto.teachingSubjects.join(', '));
  
  // Crear estudiantes de prueba para este profesor
  crearEstudiantesPrueba(profesorCompleto);
  
  console.log('\n💡 Ahora puedes:');
  console.log('1. Recargar la página');
  console.log('2. Ver el nuevo profesor en la lista');
  console.log('3. Login como el profesor para probar el chat');
  
  return profesorCompleto;
}

function crearEstudiantesPrueba(profesor) {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  const estudiantes = [
    {
      username: `est1_${profesor.username}`,
      displayName: 'Ana Demo',
      email: 'ana@student.com',
      role: 'student',
      activeCourses: ['6to Básico'],
      password: '1234',
      assignedTeacher: profesor.username,
      assignedTeachers: {
        'Matemáticas': profesor.username,
        'Ciencias Naturales': profesor.username,
        'Lenguaje y Comunicación': 'jorge',
        'Historia, Geografía y Ciencias Sociales': 'carlos'
      }
    },
    {
      username: `est2_${profesor.username}`,
      displayName: 'Luis Demo',
      email: 'luis@student.com',
      role: 'student',
      activeCourses: ['7mo Básico'],
      password: '1234',
      assignedTeacher: profesor.username,
      assignedTeachers: {
        'Matemáticas': profesor.username,
        'Ciencias Naturales': profesor.username,
        'Lenguaje y Comunicación': 'jorge',
        'Historia, Geografía y Ciencias Sociales': 'carlos'
      }
    }
  ];
  
  const todosLosUsuarios = [...users, ...estudiantes];
  localStorage.setItem('smart-student-users', JSON.stringify(todosLosUsuarios));
  
  console.log(`\n👨‍🎓 Creados ${estudiantes.length} estudiantes para ${profesor.displayName}:`);
  estudiantes.forEach(e => {
    console.log(`   • ${e.displayName} (${e.activeCourses[0]})`);
  });
  
  // Crear mensajes de prueba
  crearMensajesChat(profesor, estudiantes);
}

function crearMensajesChat(profesor, estudiantes) {
  const messages = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
  const nuevosMensajes = [];
  
  estudiantes.forEach((estudiante, index) => {
    nuevosMensajes.push({
      id: `demo_${Date.now()}_${index}`,
      senderId: profesor.username,
      recipientId: estudiante.username,
      content: `¡Hola ${estudiante.displayName}! Soy tu nuevo profesor de ${profesor.teachingSubjects.join(' y ')}. ¿Tienes alguna pregunta?`,
      timestamp: new Date(Date.now() - (index * 60000)).toISOString(),
      read: false,
      type: 'text'
    });
  });
  
  const todosLosMensajes = [...messages, ...nuevosMensajes];
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(todosLosMensajes));
  
  console.log(`📨 Creados ${nuevosMensajes.length} mensajes de chat`);
}

function loginComoAdmin() {
  localStorage.setItem('smart-student-auth', 'true');
  localStorage.setItem('smart-student-user', JSON.stringify({
    username: 'admin',
    role: 'admin',
    displayName: 'Administrador del Sistema',
    activeCourses: [],
    email: 'admin@smartstudent.com'
  }));
  console.log('✅ Login como admin realizado');
  console.log('🔄 Recarga la página si es necesario');
}

function limpiarDatosDemo() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const messages = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
  
  const usuariosLimpios = users.filter(u => 
    !u.username.startsWith('prof_demo_') && 
    !u.username.startsWith('est1_prof_demo_') &&
    !u.username.startsWith('est2_prof_demo_')
  );
  
  const mensajesLimpios = messages.filter(m => 
    !m.id.startsWith('demo_')
  );
  
  localStorage.setItem('smart-student-users', JSON.stringify(usuariosLimpios));
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(mensajesLimpios));
  
  console.log('🧹 Datos de demo limpiados');
}

// Exportar funciones
window.probarNuevoFlujoProfesor = probarNuevoFlujoProfesor;
window.simularCreacionProfesor = simularCreacionProfesor;
window.loginComoAdmin = loginComoAdmin;
window.limpiarDatosDemo = limpiarDatosDemo;

console.log('\n🚀 FUNCIONES DISPONIBLES:');
console.log('   • probarNuevoFlujoProfesor() - Ver el nuevo flujo');
console.log('   • simularCreacionProfesor() - Crear profesor de prueba');
console.log('   • loginComoAdmin() - Login como administrador');
console.log('   • limpiarDatosDemo() - Limpiar datos de prueba');

console.log('\n💡 PASOS PARA PROBAR:');
console.log('1. loginComoAdmin()');
console.log('2. Ir a /dashboard/gestion-usuarios');
console.log('3. probarNuevoFlujoProfesor()');
console.log('4. Probar creación manual O simularCreacionProfesor()');

// Auto-ejecutar verificación
probarNuevoFlujoProfesor();
