// 🚨 DIAGNÓSTICO CRÍTICO: Panel de Notificaciones vs Dashboard
// Ejecutar para identificar por qué la campana no muestra los comentarios

function diagnosticarCampanaVsDashboard() {
  console.clear();
  console.log('🚨 DIAGNÓSTICO CRÍTICO: Panel de Notificaciones vs Dashboard');
  console.log('='.repeat(65));
  
  try {
    // Obtener datos
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Usuario actual (Felipe según la imagen)
    const currentUser = users.find(u => u.username === 'felipe');
    
    console.log('📊 ESTADO ACTUAL:');
    console.log(`• Comentarios totales: ${comments.length}`);
    console.log(`• Usuario actual: ${currentUser?.username} (${currentUser?.name})`);
    console.log(`• Burbuja muestra: 5 (según imagen)`);
    console.log(`• Campana muestra: 0 comentarios visibles`);
    console.log();
    
    // Mostrar comentarios más recientes
    console.log('💬 COMENTARIOS MÁS RECIENTES:');
    const recentComments = comments
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 5);
    
    recentComments.forEach((comment, index) => {
      const task = tasks.find(t => t.id === comment.taskId);
      console.log(`${index + 1}. [${comment.timestamp}]`);
      console.log(`   Tarea: "${task?.title || 'Sin título'}"`);
      console.log(`   Autor: ${comment.authorUsername || comment.studentUsername} (${comment.authorRole || 'unknown'})`);
      console.log(`   Contenido: "${(comment.comment || '').substring(0, 50)}..."`);
      console.log(`   Leído por: [${comment.readBy?.join(', ') || 'nadie'}]`);
      console.log(`   Es entrega: ${comment.isSubmission}`);
      console.log();
    });
    
    // Simular lógica del dashboard (versión corregida)
    console.log('🔴 SIMULACIÓN LÓGICA DASHBOARD (CORREGIDA):');
    
    const checkStudentAssignmentToTask = (task, studentId, studentUsername) => {
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        return task.assignedStudentIds.includes(studentId);
      }
      
      if (task.assignedTo === 'course') {
        const taskCourseId = task.courseSectionId || task.course;
        if (!taskCourseId) return false;
        
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const matchingAssignment = studentAssignments.find(assignment => {
          if (assignment.studentId !== studentId) return false;
          
          const course = courses.find(c => c.id === assignment.courseId);
          const section = sections.find(s => s.id === assignment.sectionId);
          const compositeId = `${course?.id}-${section?.id}`;
          
          return compositeId === taskCourseId || assignment.courseId === taskCourseId;
        });
        
        if (matchingAssignment) return true;
        return studentData.activeCourses?.includes(taskCourseId) || false;
      }
      
      return false;
    };
    
    const dashboardCount = comments.filter(comment => {
      // Filtros básicos
      if (comment.studentUsername === currentUser.username || comment.authorUsername === currentUser.username) {
        return false;
      }
      if (comment.isSubmission) return false;
      if (comment.readBy?.includes(currentUser.username)) return false;
      
      // Verificar tarea
      const task = tasks.find(t => t.id === comment.taskId);
      if (!task) return false;
      
      // Para tareas de curso, verificar asignación
      if (task.assignedTo === 'course') {
        return checkStudentAssignmentToTask(task, currentUser.id, currentUser.username);
      }
      
      return true;
    }).length;
    
    console.log(`Dashboard debería mostrar: ${dashboardCount} comentarios`);
    
    // Simular lógica de la campana (notifications-panel.tsx)
    console.log('🔔 SIMULACIÓN LÓGICA CAMPANA (notifications-panel.tsx):');
    
    // Verificar si existe la función checkStudentAssignmentToTask en el contexto global
    const campanaHasFunction = typeof window.checkStudentAssignmentToTask === 'function';
    console.log(`¿Campana tiene acceso a checkStudentAssignmentToTask? ${campanaHasFunction ? '✅' : '❌'}`);
    
    if (!campanaHasFunction) {
      console.log('🚨 PROBLEMA IDENTIFICADO: La función checkStudentAssignmentToTask NO está disponible en el contexto global');
      console.log('📋 Esto explicaría por qué la campana no puede filtrar correctamente');
    }
    
    // Verificar estado del componente NotificationsPanel
    console.log('\n🔍 VERIFICANDO COMPONENTE NotificationsPanel:');
    
    // Buscar elementos del DOM relacionados con notificaciones
    const notificationElements = {
      panel: document.querySelector('[data-testid*="notification"], [class*="notification"]'),
      comments: document.querySelectorAll('[data-testid*="comment"], [class*="comment"]'),
      badges: document.querySelectorAll('[class*="badge"]'),
      unreadItems: document.querySelectorAll('[class*="unread"], [data-testid*="unread"]')
    };
    
    console.log(`Panel de notificaciones encontrado: ${notificationElements.panel ? '✅' : '❌'}`);
    console.log(`Elementos de comentarios: ${notificationElements.comments.length}`);
    console.log(`Badges: ${notificationElements.badges.length}`);
    console.log(`Items no leídos: ${notificationElements.unreadItems.length}`);
    
    // Verificar eventos de actualización
    console.log('\n🔄 VERIFICANDO EVENTOS:');
    
    // Intentar disparar eventos manualmente
    const events = [
      'taskNotificationsUpdated',
      'notificationsUpdated', 
      'updateDashboardCounts'
    ];
    
    events.forEach(eventName => {
      console.log(`Disparando evento: ${eventName}`);
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { 
          type: 'debug_sync',
          source: 'diagnostic',
          timestamp: new Date().toISOString()
        }
      }));
    });
    
    // Intentar acceso directo a funciones del panel
    console.log('\n🎯 INTENTANDO ACCESO DIRECTO AL PANEL:');
    
    // Buscar funciones relacionadas con el panel en el contexto global
    const globalFunctions = Object.keys(window).filter(key => 
      key.toLowerCase().includes('notification') || 
      key.toLowerCase().includes('comment') ||
      key.toLowerCase().includes('unread')
    );
    
    console.log('Funciones globales relacionadas:', globalFunctions);
    
    // Verificar si hay datos en el estado del React
    const reactFiberKey = Object.keys(notificationElements.panel || {}).find(key => 
      key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
    );
    
    if (reactFiberKey && notificationElements.panel) {
      console.log('🎯 Componente React detectado - intentando acceso al estado');
      try {
        const fiber = notificationElements.panel[reactFiberKey];
        console.log('Estado del componente:', fiber?.memoizedState);
      } catch (e) {
        console.log('No se pudo acceder al estado del componente React');
      }
    }
    
    console.log('\n🚨 RESUMEN DEL PROBLEMA:');
    console.log('1. Dashboard cuenta comentarios correctamente (lógica corregida)');
    console.log('2. Campana NO muestra comentarios (posible problema de sincronización)');
    console.log('3. Posibles causas:');
    console.log('   - checkStudentAssignmentToTask no disponible globalmente');
    console.log('   - Eventos de actualización no están llegando al panel');
    console.log('   - Estado del componente React no se actualiza');
    console.log('   - Filtrado en campana es diferente al dashboard');
    
    return {
      dashboardCount,
      campanaHasFunction,
      elementsFound: Object.keys(notificationElements).map(key => ({
        [key]: !!notificationElements[key] || notificationElements[key].length
      }))
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return null;
  }
}

// Función para forzar sincronización
function forzarSincronizacionCompleta() {
  console.log('\n🔄 FORZANDO SINCRONIZACIÓN COMPLETA...');
  
  // Recargar datos del localStorage
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const currentUser = users.find(u => u.username === 'felipe');
  
  // Disparar múltiples eventos
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated', {
      detail: { force: true, userId: currentUser?.id }
    }));
  }, 100);
  
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('notificationsUpdated', {
      detail: { 
        type: 'force_update',
        unreadCount: comments.length,
        userId: currentUser?.id
      }
    }));
  }, 200);
  
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('updateDashboardCounts', {
      detail: { 
        type: 'student_notification_sync',
        count: comments.length
      }
    }));
  }, 300);
  
  console.log('✅ Eventos de sincronización disparados');
  console.log('📋 Si el problema persiste, recarga la página completamente');
}

// Auto-ejecutar
console.log('🚨 Script de diagnóstico crítico cargado');
console.log('▶️ Ejecutando diagnóstico...');

diagnosticarCampanaVsDashboard();

// Ejecutar sincronización después del diagnóstico
setTimeout(() => {
  forzarSincronizacionCompleta();
}, 2000);
