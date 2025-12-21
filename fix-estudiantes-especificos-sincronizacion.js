/**
 * 🔄 SOLUCIÓN: Sincronización Automática de Estudiantes Específicos
 * 
 * PROBLEMA: En el módulo profesor, pestaña tareas, al seleccionar "Estudiantes específicos" 
 * solo aparecen los estudiantes que estaban asignados al momento de cargar la página.
 * Los cambios realizados en Gestión de Usuarios (módulo admin) no se reflejan automáticamente.
 * 
 * SOLUCIÓN: Crear una sincronización automática que actualice la lista de estudiantes
 * disponibles cada vez que se realicen cambios en las asignaciones de usuarios.
 */

console.log('🔄 INICIANDO REPARACIÓN: Sincronización Estudiantes Específicos');

// Función para diagnosticar el estado actual
function diagnosticarSincronizacion() {
  console.log('\n📊 DIAGNÓSTICO INICIAL:');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
  
  const currentUser = auth.user;
  
  if (!currentUser) {
    console.log('❌ No hay usuario logueado');
    return;
  }
  
  console.log(`👤 Usuario actual: ${currentUser.displayName} (${currentUser.role})`);
  
  if (currentUser.role === 'teacher') {
    console.log('\n🎓 ANÁLISIS PARA PROFESOR:');
    
    // Estudiantes asignados directamente
    const estudiantesDirectos = users.filter(u => 
      u.role === 'student' && u.assignedTeacher === currentUser.username
    );
    
    // Estudiantes asignados por materia
    const estudiantesPorMateria = users.filter(u => 
      u.role === 'student' && u.assignedTeachers && 
      Object.values(u.assignedTeachers).includes(currentUser.username)
    );
    
    // Estudiantes por asignaciones específicas
    const asignacionesProfesor = teacherAssignments.filter(ta => 
      ta.teacherId === currentUser.id || ta.teacherId === currentUser.username
    );
    
    console.log(`   • Estudiantes asignados directos: ${estudiantesDirectos.length}`);
    console.log(`   • Estudiantes asignados por materia: ${estudiantesPorMateria.length}`);
    console.log(`   • Asignaciones específicas del profesor: ${asignacionesProfesor.length}`);
    
    estudiantesDirectos.forEach(e => console.log(`     - ${e.displayName} (directo)`));
    estudiantesPorMateria.forEach(e => console.log(`     - ${e.displayName} (por materia)`));
    
    // Verificar cursos disponibles para crear tareas
    const cursosProfesor = asignacionesProfesor.map(a => a.sectionId);
    console.log(`   • Secciones asignadas: ${cursosProfesor.join(', ')}`);
    
  } else if (currentUser.role === 'admin') {
    console.log('\n👑 ANÁLISIS PARA ADMIN:');
    console.log(`   • Total estudiantes: ${users.filter(u => u.role === 'student').length}`);
    console.log(`   • Total profesores: ${users.filter(u => u.role === 'teacher').length}`);
    console.log(`   • Total asignaciones estudiante-sección: ${studentAssignments.length}`);
    console.log(`   • Total asignaciones profesor-sección: ${teacherAssignments.length}`);
  }
}

// Función para crear/actualizar la sincronización automática
function implementarSincronizacionAutomatica() {
  console.log('\n🔧 IMPLEMENTANDO SINCRONIZACIÓN AUTOMÁTICA...');
  
  // Verificar si ya existe el event listener
  if (window.estudiantesEspecificosSyncFixed) {
    console.log('✅ Sincronización ya está implementada');
    return;
  }
  
  // Función que actualiza la lista de estudiantes disponibles
  function actualizarEstudiantesDisponibles() {
    console.log('🔄 Actualizando lista de estudiantes disponibles...');
    
    // Disparar evento personalizado para notificar a los componentes
    const evento = new CustomEvent('studentAssignmentsUpdated', {
      detail: {
        timestamp: new Date().toISOString(),
        source: 'gestion-usuarios'
      }
    });
    
    window.dispatchEvent(evento);
    console.log('📡 Evento studentAssignmentsUpdated disparado');
  }
  
  // Escuchar cambios en las asignaciones de profesores
  window.addEventListener('teacherAssignmentsChanged', function() {
    console.log('🎓 Detectado cambio en asignaciones de profesores');
    actualizarEstudiantesDisponibles();
  });
  
  // Escuchar cambios en las asignaciones de estudiantes
  window.addEventListener('studentAssignmentsChanged', function() {
    console.log('👥 Detectado cambio en asignaciones de estudiantes');
    actualizarEstudiantesDisponibles();
  });
  
  // Escuchar cambios generales en usuarios
  window.addEventListener('usersUpdated', function() {
    console.log('👤 Detectado cambio en usuarios');
    actualizarEstudiantesDisponibles();
  });
  
  // Observer para cambios en localStorage
  let lastStudentAssignments = localStorage.getItem('smart-student-student-assignments');
  let lastTeacherAssignments = localStorage.getItem('smart-student-teacher-assignments');
  let lastUsers = localStorage.getItem('smart-student-users');
  
  setInterval(function() {
    const currentStudentAssignments = localStorage.getItem('smart-student-student-assignments');
    const currentTeacherAssignments = localStorage.getItem('smart-student-teacher-assignments');
    const currentUsers = localStorage.getItem('smart-student-users');
    
    if (currentStudentAssignments !== lastStudentAssignments) {
      console.log('🔄 Detectado cambio en student-assignments via localStorage');
      lastStudentAssignments = currentStudentAssignments;
      actualizarEstudiantesDisponibles();
    }
    
    if (currentTeacherAssignments !== lastTeacherAssignments) {
      console.log('🔄 Detectado cambio en teacher-assignments via localStorage');
      lastTeacherAssignments = currentTeacherAssignments;
      actualizarEstudiantesDisponibles();
    }
    
    if (currentUsers !== lastUsers) {
      console.log('🔄 Detectado cambio en users via localStorage');
      lastUsers = currentUsers;
      actualizarEstudiantesDisponibles();
    }
  }, 1000); // Verificar cada segundo
  
  // Marcar como implementado
  window.estudiantesEspecificosSyncFixed = true;
  
  console.log('✅ Sincronización automática implementada exitosamente');
}

// Función para mejorar la función getStudentsForCourse existente
function mejorarFuncionGetStudentsForCourse() {
  console.log('\n🚀 MEJORANDO FUNCIÓN getStudentsForCourse...');
  
  // Esta función se inyectará en el contexto de la página de tareas
  const funcionMejorada = `
    // 🎯 FUNCIÓN MEJORADA: getStudentsForCourse con sincronización automática
    window.getStudentsForCourseImproved = function(courseId) {
      console.log('🚀 [SYNC] getStudentsForCourse mejorada ejecutándose para:', courseId);
      
      if (!courseId) {
        console.log('⚠️ [SYNC] CourseId no proporcionado');
        return [];
      }
      
      // Cargar datos SIEMPRE desde localStorage (datos frescos)
      const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
      const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
      const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
      
      const currentUser = auth.user;
      if (!currentUser || currentUser.role !== 'teacher') {
        console.log('⚠️ [SYNC] Usuario no es profesor');
        return [];
      }
      
      console.log('📊 [SYNC] Datos actualizados cargados del localStorage');
      
      // Método 1: Buscar por asignaciones específicas de sección
      const asignacionesProfesor = teacherAssignments.filter(ta => 
        ta.teacherId === currentUser.id || ta.teacherId === currentUser.username
      );
      
      if (asignacionesProfesor.length > 0) {
        console.log('🎯 [SYNC] Método 1: Búsqueda por asignaciones específicas');
        
        const sectionIds = asignacionesProfesor.map(a => a.sectionId);
        const estudiantesAsignados = studentAssignments.filter(sa => 
          sectionIds.includes(sa.sectionId)
        );
        
        if (estudiantesAsignados.length > 0) {
          const studentIds = estudiantesAsignados.map(sa => sa.studentId);
          const students = allUsers.filter(u => 
            u.role === 'student' && studentIds.includes(u.id)
          );
          
          console.log('✅ [SYNC] Método 1 exitoso:', students.length, 'estudiantes');
          return students.map(s => ({
            id: s.id,
            username: s.username,
            displayName: s.displayName || s.username
          }));
        }
      }
      
      // Método 2: Buscar por asignación directa al profesor
      console.log('🔄 [SYNC] Método 2: Búsqueda por asignación directa');
      const estudiantesDirectos = allUsers.filter(u => 
        u.role === 'student' && u.assignedTeacher === currentUser.username
      );
      
      if (estudiantesDirectos.length > 0) {
        console.log('✅ [SYNC] Método 2 exitoso:', estudiantesDirectos.length, 'estudiantes');
        return estudiantesDirectos.map(s => ({
          id: s.id,
          username: s.username,
          displayName: s.displayName || s.username
        }));
      }
      
      // Método 3: Buscar por asignación por materia
      console.log('🔄 [SYNC] Método 3: Búsqueda por asignación por materia');
      const estudiantesPorMateria = allUsers.filter(u => 
        u.role === 'student' && u.assignedTeachers && 
        Object.values(u.assignedTeachers).includes(currentUser.username)
      );
      
      if (estudiantesPorMateria.length > 0) {
        console.log('✅ [SYNC] Método 3 exitoso:', estudiantesPorMateria.length, 'estudiantes');
        return estudiantesPorMateria.map(s => ({
          id: s.id,
          username: s.username,
          displayName: s.displayName || s.username
        }));
      }
      
      console.log('⚠️ [SYNC] No se encontraron estudiantes asignados');
      return [];
    };
    
    // Event listener para actualizar automáticamente
    window.addEventListener('studentAssignmentsUpdated', function(event) {
      console.log('🔄 [SYNC] Recibido evento de actualización:', event.detail);
      
      // Forzar recarga de datos en el componente React
      if (window.refreshStudentsList) {
        window.refreshStudentsList();
      }
      
      // Disparar re-render si hay un setter de estado disponible
      if (window.setForceRefresh) {
        window.setForceRefresh(Date.now());
      }
    });
    
    console.log('✅ [SYNC] Función mejorada inyectada exitosamente');
  `;
  
  // Ejecutar la función mejorada
  eval(funcionMejorada);
  
  console.log('✅ Función getStudentsForCourse mejorada implementada');
}

// Función para simular cambios y probar la sincronización
function simularCambiosYProbar() {
  console.log('\n🧪 SIMULANDO CAMBIOS PARA PROBAR SINCRONIZACIÓN...');
  
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  
  if (!auth.user || auth.user.role !== 'teacher') {
    console.log('⚠️ Para probar, necesitas estar logueado como profesor');
    return;
  }
  
  // Simular cambio en asignaciones
  setTimeout(() => {
    console.log('🔄 Simulando cambio en asignaciones...');
    window.dispatchEvent(new CustomEvent('teacherAssignmentsChanged'));
  }, 2000);
  
  setTimeout(() => {
    console.log('🔄 Simulando cambio en estudiantes...');
    window.dispatchEvent(new CustomEvent('studentAssignmentsChanged'));
  }, 4000);
}

// Función principal para ejecutar todas las mejoras
function ejecutarSolucionCompleta() {
  console.log('🚀 EJECUTANDO SOLUCIÓN COMPLETA...');
  
  diagnosticarSincronizacion();
  implementarSincronizacionAutomatica();
  mejorarFuncionGetStudentsForCourse();
  
  console.log('\n✅ SOLUCIÓN IMPLEMENTADA EXITOSAMENTE');
  console.log('');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('1. Ve a Gestión de Usuarios y realiza cambios en asignaciones');
  console.log('2. Ve a la pestaña Tareas del profesor');
  console.log('3. Crea una nueva tarea y selecciona "Estudiantes específicos"');
  console.log('4. Los estudiantes deberían actualizarse automáticamente');
  console.log('');
  console.log('🔧 FUNCIONES DISPONIBLES:');
  console.log('- diagnosticarSincronizacion(): Analizar estado actual');
  console.log('- simularCambiosYProbar(): Probar la sincronización');
  console.log('- window.getStudentsForCourseImproved(courseId): Función mejorada');
}

// Ejecutar la solución automáticamente
ejecutarSolucionCompleta();

// Exponer funciones para uso manual
window.diagnosticarSincronizacion = diagnosticarSincronizacion;
window.simularCambiosYProbar = simularCambiosYProbar;
window.ejecutarSolucionCompleta = ejecutarSolucionCompleta;

console.log('🎯 SCRIPT CARGADO - Usa ejecutarSolucionCompleta() para aplicar todas las mejoras');
