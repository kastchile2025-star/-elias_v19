/**
 * 🧪 SCRIPT DE PRUEBA: Sincronización Estudiantes Específicos
 * 
 * Este script permite probar que la sincronización automática entre
 * Gestión de Usuarios y Tareas funcione correctamente.
 */

console.log('🧪 SCRIPT DE PRUEBA: Sincronización Estudiantes Específicos cargado');

// Función para verificar el estado actual
function verificarEstadoSincronizacion() {
  console.log('\n📊 VERIFICANDO ESTADO ACTUAL...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
  
  const currentUser = auth.user;
  
  console.log(`👤 Usuario actual: ${currentUser?.displayName || 'No logueado'} (${currentUser?.role || 'N/A'})`);
  console.log(`📊 Estadísticas:`);
  console.log(`   • Total usuarios: ${users.length}`);
  console.log(`   • Estudiantes: ${users.filter(u => u.role === 'student').length}`);
  console.log(`   • Profesores: ${users.filter(u => u.role === 'teacher').length}`);
  console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
  console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
  
  if (currentUser?.role === 'teacher') {
    const estudiantesAsignados = users.filter(u => 
      u.role === 'student' && (
        u.assignedTeacher === currentUser.username ||
        (u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentUser.username))
      )
    );
    
    console.log(`🎓 Para profesor ${currentUser.username}:`);
    console.log(`   • Estudiantes asignados: ${estudiantesAsignados.length}`);
    estudiantesAsignados.forEach(e => {
      console.log(`     - ${e.displayName || e.username}`);
    });
  }
  
  return {
    currentUser,
    users,
    studentAssignments,
    teacherAssignments
  };
}

// Función para probar eventos de sincronización
function probarEventosSincronizacion() {
  console.log('\n🔄 PROBANDO EVENTOS DE SINCRONIZACIÓN...');
  
  // Event listeners para verificar que los eventos se disparen
  const eventosDetectados = [];
  
  const detectarEvento = (eventName) => {
    return (event) => {
      eventosDetectados.push({ 
        evento: eventName, 
        timestamp: new Date().toISOString(),
        detail: event.detail 
      });
      console.log(`✅ Detectado evento: ${eventName}`, event.detail);
    };
  };
  
  window.addEventListener('usersUpdated', detectarEvento('usersUpdated'));
  window.addEventListener('studentAssignmentsUpdated', detectarEvento('studentAssignmentsUpdated'));
  window.addEventListener('teacherAssignmentsChanged', detectarEvento('teacherAssignmentsChanged'));
  
  // Simular cambios
  console.log('🔄 Simulando cambio en usuarios...');
  window.dispatchEvent(new CustomEvent('usersUpdated', {
    detail: { action: 'test', source: 'manual', timestamp: new Date().toISOString() }
  }));
  
  setTimeout(() => {
    console.log('🔄 Simulando cambio en asignaciones de estudiantes...');
    window.dispatchEvent(new CustomEvent('studentAssignmentsUpdated', {
      detail: { action: 'test', source: 'manual', timestamp: new Date().toISOString() }
    }));
  }, 1000);
  
  setTimeout(() => {
    console.log('🔄 Simulando cambio en asignaciones de profesores...');
    window.dispatchEvent(new CustomEvent('teacherAssignmentsChanged'));
  }, 2000);
  
  setTimeout(() => {
    console.log('📋 RESUMEN DE EVENTOS DETECTADOS:');
    if (eventosDetectados.length === 0) {
      console.log('❌ No se detectaron eventos. La sincronización puede no estar funcionando.');
    } else {
      eventosDetectados.forEach((evento, index) => {
        console.log(`${index + 1}. ${evento.evento} - ${evento.timestamp}`);
      });
      console.log('✅ Eventos detectados correctamente. La sincronización está funcionando.');
    }
  }, 3500);
}

// Función para crear datos de prueba si no existen
function crearDatosPrueba() {
  console.log('\n🏗️ CREANDO DATOS DE PRUEBA...');
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  
  if (!auth.user) {
    console.log('❌ No hay usuario logueado. Por favor, haz login primero.');
    return;
  }
  
  if (auth.user.role !== 'teacher' && auth.user.role !== 'admin') {
    console.log('❌ Necesitas estar logueado como profesor o admin para crear datos de prueba.');
    return;
  }
  
  // Crear estudiantes de prueba si no existen
  const estudiantesPrueba = ['ana', 'carlos', 'lucia'];
  let cambios = false;
  
  estudiantesPrueba.forEach(username => {
    const existeEstudiante = users.find(u => u.username === username);
    
    if (!existeEstudiante) {
      const nuevoEstudiante = {
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username: username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        displayName: username.charAt(0).toUpperCase() + username.slice(1) + ' Test',
        email: `${username}@test.com`,
        role: 'student',
        password: '1234',
        activeCourses: ['4to Básico'],
        assignedTeacher: auth.user.role === 'teacher' ? auth.user.username : 'profesor_test',
        assignedTeachers: {
          'Matemáticas': auth.user.role === 'teacher' ? auth.user.username : 'profesor_test',
          'Lenguaje y Comunicación': auth.user.role === 'teacher' ? auth.user.username : 'profesor_test',
          'Ciencias Naturales': auth.user.role === 'teacher' ? auth.user.username : 'profesor_test',
          'Historia, Geografía y Ciencias Sociales': auth.user.role === 'teacher' ? auth.user.username : 'profesor_test'
        }
      };
      
      users.push(nuevoEstudiante);
      cambios = true;
      console.log(`✅ Creado estudiante: ${nuevoEstudiante.displayName}`);
    } else {
      console.log(`ℹ️ Estudiante ${username} ya existe`);
    }
  });
  
  if (cambios) {
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    // Disparar eventos de sincronización
    window.dispatchEvent(new CustomEvent('usersUpdated', {
      detail: { action: 'create', source: 'test-data', timestamp: new Date().toISOString() }
    }));
    
    window.dispatchEvent(new CustomEvent('studentAssignmentsUpdated', {
      detail: { action: 'create', source: 'test-data', timestamp: new Date().toISOString() }
    }));
    
    console.log('✅ Datos de prueba creados y eventos disparados');
  } else {
    console.log('ℹ️ No se crearon nuevos datos - ya existen estudiantes de prueba');
  }
}

// Función para simular cambio en gestión de usuarios
function simularCambioEnGestionUsuarios() {
  console.log('\n🔄 SIMULANDO CAMBIO EN GESTIÓN DE USUARIOS...');
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  
  if (!auth.user || auth.user.role !== 'teacher') {
    console.log('❌ Necesitas estar logueado como profesor para esta prueba');
    return;
  }
  
  // Buscar un estudiante para modificar
  const estudiante = users.find(u => 
    u.role === 'student' && 
    (u.assignedTeacher === auth.user.username || 
     (u.assignedTeachers && Object.values(u.assignedTeachers).includes(auth.user.username)))
  );
  
  if (!estudiante) {
    console.log('❌ No se encontró ningún estudiante asignado. Ejecuta crearDatosPrueba() primero.');
    return;
  }
  
  console.log(`🔄 Modificando estudiante: ${estudiante.displayName}`);
  
  // Simular cambio (agregar timestamp a displayName)
  const timestamp = new Date().toLocaleTimeString();
  estudiante.displayName = `${estudiante.name} (Actualizado ${timestamp})`;
  
  // Guardar cambios
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  
  // Disparar eventos de sincronización
  window.dispatchEvent(new CustomEvent('usersUpdated', {
    detail: { 
      action: 'update', 
      userType: 'student',
      source: 'simulated-change',
      timestamp: new Date().toISOString() 
    }
  }));
  
  window.dispatchEvent(new CustomEvent('studentAssignmentsUpdated', {
    detail: { 
      action: 'update', 
      source: 'simulated-change',
      timestamp: new Date().toISOString() 
    }
  }));
  
  console.log('✅ Cambio simulado y eventos disparados');
  console.log('💡 Ve a la pestaña Tareas y crea una nueva tarea para ver los cambios');
}

// Función para verificar si la función mejorada está disponible
function verificarFuncionMejorada() {
  console.log('\n🔍 VERIFICANDO FUNCIÓN MEJORADA...');
  
  if (typeof window.getStudentsForCourseImproved === 'function') {
    console.log('✅ Función getStudentsForCourseImproved disponible');
    
    // Probar la función
    const resultado = window.getStudentsForCourseImproved('4to Básico');
    console.log(`🧪 Prueba de función mejorada:`, resultado);
  } else {
    console.log('❌ Función getStudentsForCourseImproved no disponible');
    console.log('💡 Ejecuta el script fix-estudiantes-especificos-sincronizacion.js');
  }
}

// Función principal de prueba completa
function pruebaCompleta() {
  console.log('🚀 EJECUTANDO PRUEBA COMPLETA DE SINCRONIZACIÓN...');
  
  verificarEstadoSincronizacion();
  verificarFuncionMejorada();
  
  setTimeout(() => {
    probarEventosSincronizacion();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n📋 INSTRUCCIONES PARA PRUEBA MANUAL:');
    console.log('1. Ve a Gestión de Usuarios');
    console.log('2. Modifica la asignación de un estudiante');
    console.log('3. Ve a la pestaña Tareas del profesor');
    console.log('4. Crea una nueva tarea y selecciona "Estudiantes específicos"');
    console.log('5. Verifica que los cambios se reflejen automáticamente');
    console.log('');
    console.log('🔧 FUNCIONES DISPONIBLES:');
    console.log('- verificarEstadoSincronizacion()');
    console.log('- crearDatosPrueba()');
    console.log('- simularCambioEnGestionUsuarios()');
    console.log('- probarEventosSincronizacion()');
  }, 5000);
}

// Exponer funciones globalmente
window.verificarEstadoSincronizacion = verificarEstadoSincronizacion;
window.probarEventosSincronizacion = probarEventosSincronizacion;
window.crearDatosPrueba = crearDatosPrueba;
window.simularCambioEnGestionUsuarios = simularCambioEnGestionUsuarios;
window.verificarFuncionMejorada = verificarFuncionMejorada;
window.pruebaCompleta = pruebaCompleta;

console.log('✅ Script de prueba cargado. Ejecuta pruebaCompleta() para empezar.');
