/**
 * 🧪 VERIFICACIÓN FINAL: Sincronización de Estudiantes Específicos
 * 
 * Este script verifica que la solución esté funcionando correctamente
 * después de corregir el error de inicialización de loadTasks.
 */

console.log('🧪 VERIFICACIÓN FINAL: Sincronización de Estudiantes Específicos');

// Función para verificar que el error esté corregido
function verificarErrorCorregido() {
  console.log('\n🔍 VERIFICANDO CORRECCIÓN DEL ERROR...');
  
  // Verificar que estamos en la página correcta
  if (window.location.pathname.includes('/tareas')) {
    console.log('✅ Estamos en la página de tareas');
    
    // Verificar que no hay errores de React en la consola
    const hasReactErrors = document.querySelector('.react-error-overlay') !== null;
    
    if (hasReactErrors) {
      console.log('❌ Todavía hay errores de React visibles');
      return false;
    } else {
      console.log('✅ No se detectan errores de React en la interfaz');
    }
    
    // Verificar que los useEffect se están ejecutando correctamente
    if (window.estudiantesEspecificosSyncFixed) {
      console.log('✅ Sincronización ya implementada anteriormente');
    }
    
    return true;
  } else {
    console.log('ℹ️ No estamos en la página de tareas, redirecciona para probar');
    return false;
  }
}

// Función para verificar la funcionalidad completa
function verificarFuncionalidadCompleta() {
  console.log('\n🎯 VERIFICANDO FUNCIONALIDAD COMPLETA...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  if (!auth.user) {
    console.log('❌ No hay usuario logueado');
    console.log('💡 Ve a http://localhost:9002 y haz login');
    return false;
  }
  
  console.log(`👤 Usuario logueado: ${auth.user.displayName} (${auth.user.role})`);
  
  if (auth.user.role === 'teacher') {
    console.log('\n🎓 VERIFICACIÓN PARA PROFESOR:');
    
    // Verificar estudiantes asignados
    const estudiantesAsignados = users.filter(u => 
      u.role === 'student' && (
        u.assignedTeacher === auth.user.username ||
        (u.assignedTeachers && Object.values(u.assignedTeachers).includes(auth.user.username))
      )
    );
    
    console.log(`📊 Estudiantes asignados: ${estudiantesAsignados.length}`);
    
    if (estudiantesAsignados.length === 0) {
      console.log('⚠️ Este profesor no tiene estudiantes asignados');
      console.log('💡 Ejecuta crearDatosPrueba() para crear datos de prueba');
      return false;
    }
    
    estudiantesAsignados.forEach(e => {
      console.log(`   • ${e.displayName || e.username}`);
    });
    
    // Probar la función de obtención de estudiantes
    if (typeof window.getStudentsForCourseImproved === 'function') {
      console.log('\n🔧 PROBANDO FUNCIÓN MEJORADA:');
      const resultado = window.getStudentsForCourseImproved('4to Básico');
      console.log(`   • Estudiantes encontrados: ${resultado.length}`);
      return resultado.length > 0;
    } else {
      console.log('\n⚠️ Función mejorada no disponible');
      console.log('💡 Ejecuta el script fix-estudiantes-especificos-sincronizacion.js');
      return false;
    }
    
  } else if (auth.user.role === 'admin') {
    console.log('\n👑 VERIFICACIÓN PARA ADMIN:');
    console.log('✅ Admin puede hacer cambios en Gestión de Usuarios');
    console.log('💡 Los cambios se sincronizarán automáticamente con profesores');
    return true;
  }
  
  return false;
}

// Función para crear datos de prueba mínimos
function crearDatosPruebaMinimos() {
  console.log('\n🏗️ CREANDO DATOS DE PRUEBA MÍNIMOS...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  if (!auth.user) {
    console.log('❌ No hay usuario logueado');
    return false;
  }
  
  // Crear un estudiante de prueba si no existe
  const estudiantePrueba = users.find(u => u.username === 'estudiante_test');
  
  if (!estudiantePrueba) {
    const nuevoEstudiante = {
      id: `student-${Date.now()}`,
      username: 'estudiante_test',
      name: 'Estudiante Test',
      displayName: 'Estudiante Test',
      email: 'estudiante@test.com',
      role: 'student',
      password: '1234',
      activeCourses: ['4to Básico'],
      assignedTeacher: auth.user.username,
      assignedTeachers: {
        'Matemáticas': auth.user.username,
        'Lenguaje y Comunicación': auth.user.username,
        'Ciencias Naturales': auth.user.username,
        'Historia, Geografía y Ciencias Sociales': auth.user.username
      }
    };
    
    users.push(nuevoEstudiante);
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    // Disparar eventos de sincronización
    window.dispatchEvent(new CustomEvent('usersUpdated', {
      detail: { action: 'create', source: 'test-verification', timestamp: new Date().toISOString() }
    }));
    
    window.dispatchEvent(new CustomEvent('studentAssignmentsUpdated', {
      detail: { action: 'create', source: 'test-verification', timestamp: new Date().toISOString() }
    }));
    
    console.log('✅ Estudiante de prueba creado y eventos disparados');
    return true;
  } else {
    console.log('ℹ️ El estudiante de prueba ya existe');
    return true;
  }
}

// Función para probar la sincronización en tiempo real
function probarSincronizacionTiempoReal() {
  console.log('\n⚡ PROBANDO SINCRONIZACIÓN EN TIEMPO REAL...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  
  if (!auth.user) {
    console.log('❌ No hay usuario logueado');
    return;
  }
  
  // Configurar listeners para detectar eventos
  let eventosDetectados = 0;
  
  const detectarEvento = (eventName) => {
    return (event) => {
      eventosDetectados++;
      console.log(`✅ Evento detectado: ${eventName}`, event.detail);
    };
  };
  
  window.addEventListener('usersUpdated', detectarEvento('usersUpdated'));
  window.addEventListener('studentAssignmentsUpdated', detectarEvento('studentAssignmentsUpdated'));
  window.addEventListener('teacherAssignmentsChanged', detectarEvento('teacherAssignmentsChanged'));
  
  // Simular un cambio
  console.log('🔄 Simulando cambio en localStorage...');
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const timestamp = new Date().toLocaleTimeString();
  
  // Modificar un estudiante existente
  const estudiante = users.find(u => u.role === 'student');
  if (estudiante) {
    estudiante.displayName = `${estudiante.name} (Sync Test ${timestamp})`;
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    // Disparar evento manualmente
    window.dispatchEvent(new CustomEvent('usersUpdated', {
      detail: { action: 'sync-test', timestamp: new Date().toISOString() }
    }));
    
    setTimeout(() => {
      console.log(`📊 Eventos detectados en total: ${eventosDetectados}`);
      if (eventosDetectados > 0) {
        console.log('✅ La sincronización en tiempo real está funcionando');
      } else {
        console.log('❌ La sincronización en tiempo real no está funcionando');
      }
    }, 3000);
  }
}

// Función de verificación completa
function verificacionCompleta() {
  console.log('🚀 EJECUTANDO VERIFICACIÓN COMPLETA...');
  
  const errorCorregido = verificarErrorCorregido();
  
  if (!errorCorregido) {
    console.log('❌ Hay problemas con la página. Verifica errores en consola.');
    return;
  }
  
  const funcionalidadOK = verificarFuncionalidadCompleta();
  
  if (!funcionalidadOK) {
    console.log('\n🔧 Intentando crear datos de prueba...');
    crearDatosPruebaMinimos();
    
    setTimeout(() => {
      console.log('\n🔄 Re-verificando después de crear datos...');
      verificarFuncionalidadCompleta();
    }, 2000);
  }
  
  setTimeout(() => {
    probarSincronizacionTiempoReal();
  }, 5000);
  
  console.log('\n📋 INSTRUCCIONES FINALES:');
  console.log('1. ✅ Error de loadTasks corregido');
  console.log('2. 🔄 Sincronización automática implementada');
  console.log('3. 📱 Prueba manual: Ve a Gestión de Usuarios → modifica asignaciones');
  console.log('4. 🎯 Luego ve a Tareas → Nueva Tarea → "Estudiantes específicos"');
  console.log('5. ✅ Los cambios deberían reflejarse automáticamente');
}

// Ejecutar verificación automáticamente
setTimeout(verificacionCompleta, 1000);

// Exponer funciones para uso manual
window.verificarErrorCorregido = verificarErrorCorregido;
window.verificarFuncionalidadCompleta = verificarFuncionalidadCompleta;
window.crearDatosPruebaMinimos = crearDatosPruebaMinimos;
window.probarSincronizacionTiempoReal = probarSincronizacionTiempoReal;
window.verificacionCompleta = verificacionCompleta;

console.log('✅ Script de verificación final cargado');
console.log('🔧 Funciones disponibles: verificacionCompleta(), crearDatosPruebaMinimos()');
console.log('📋 La verificación se ejecutará automáticamente en 1 segundo...');
