// 🚨 DIAGNÓSTICO CRÍTICO: Por qué la campana está vacía
// La simulación muestra que DEBERÍA haber 4 comentarios, pero la campana real está vacía

function diagnosticarCampanaVacia() {
  console.clear();
  console.log('🚨 DIAGNÓSTICO CRÍTICO: Por qué la campana está vacía');
  console.log('='.repeat(55));
  
  console.log('📊 ESTADO CONFIRMADO:');
  console.log('• Simulación dice: 4 comentarios deberían aparecer');
  console.log('• Campana real muestra: 0 comentarios');
  console.log('• Dashboard muestra: 5 en burbuja');
  console.log();
  
  // 1. Verificar si el componente NotificationsPanel está montado
  console.log('🔍 1. VERIFICANDO COMPONENTE NOTIFICATIONSPANEL:');
  
  const notificationElements = {
    panel: document.querySelector('[class*="notification"]'),
    campana: document.querySelector('[data-testid*="notification"], [aria-label*="notification"], [role="dialog"]'),
    comentarios: document.querySelectorAll('[class*="comment"], [data-testid*="comment"]'),
    unreadItems: document.querySelectorAll('[class*="unread"], [data-testid*="unread"]')
  };
  
  console.log(`Panel encontrado: ${notificationElements.panel ? '✅' : '❌'}`);
  console.log(`Campana encontrada: ${notificationElements.campana ? '✅' : '❌'}`);
  console.log(`Elementos de comentarios: ${notificationElements.comentarios.length}`);
  console.log(`Items no leídos: ${notificationElements.unreadItems.length}`);
  
  // 2. Verificar si hay errores en la consola del componente
  console.log('\n🔍 2. VERIFICANDO ERRORES DE REACT:');
  
  // Interceptar errores de React
  const originalError = console.error;
  const errors = [];
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // 3. Verificar estado del localStorage cuando el componente carga
  console.log('\n🔍 3. VERIFICANDO DATOS DEL COMPONENTE:');
  
  const storedComments = localStorage.getItem('smart-student-task-comments');
  const storedTasks = localStorage.getItem('smart-student-tasks');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const currentUser = users.find(u => u.username === 'felipe');
  
  console.log(`• storedComments disponible: ${storedComments ? 'SÍ' : 'NO'}`);
  console.log(`• storedTasks disponible: ${storedTasks ? 'SÍ' : 'NO'}`);
  console.log(`• Usuario actual encontrado: ${currentUser ? 'SÍ' : 'NO'}`);
  
  if (currentUser) {
    console.log(`• user.id: ${currentUser.id}`);
    console.log(`• user.username: ${currentUser.username}`);
    console.log(`• user.role: ${currentUser.role}`);
  }
  
  // 4. Simular llamada directa a loadUnreadComments
  console.log('\n🔍 4. FORZANDO CARGA DE COMENTARIOS NO LEÍDOS:');
  
  if (storedComments && storedTasks && currentUser) {
    const comments = JSON.parse(storedComments);
    const tasks = JSON.parse(storedTasks);
    
    console.log(`• Total comentarios: ${comments.length}`);
    console.log(`• Total tareas: ${tasks.length}`);
    
    // Verificar si hay algún comentario sin readBy (no leído)
    const unreadComments = comments.filter(c => !c.readBy?.includes(currentUser.username));
    console.log(`• Comentarios sin marcar como leídos: ${unreadComments.length}`);
    
    unreadComments.forEach((comment, index) => {
      console.log(`  ${index + 1}. "${comment.comment}" por ${comment.authorUsername} - readBy: [${comment.readBy?.join(', ') || 'nadie'}]`);
    });
  }
  
  // 5. Verificar si useEffect se está ejecutando
  console.log('\n🔍 5. VERIFICANDO EJECUCIÓN DE USEEFFECT:');
  
  // Buscar logs específicos del componente
  const notificationLogs = [];
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('[loadUnreadComments]') || message.includes('[NotificationsPanel]')) {
      notificationLogs.push(message);
    }
    originalLog.apply(console, args);
  };
  
  // 6. Intentar forzar re-render del componente
  console.log('\n🔍 6. FORZANDO RE-RENDER DEL COMPONENTE:');
  
  // Disparar eventos que deberían activar useEffect
  const eventsToTrigger = [
    'taskNotificationsUpdated',
    'notificationsUpdated',
    'updateDashboardCounts'
  ];
  
  eventsToTrigger.forEach(eventName => {
    console.log(`Disparando: ${eventName}`);
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        type: 'force_reload',
        debug: true,
        timestamp: Date.now()
      }
    }));
  });
  
  // 7. Verificar si el hook useAuth está funcionando
  console.log('\n🔍 7. VERIFICANDO CONTEXTO DE AUTENTICACIÓN:');
  
  // Buscar elementos que indiquen el usuario autenticado
  const userElements = document.querySelectorAll('[class*="user"], [data-testid*="user"]');
  const welcomeText = document.querySelector('h1, h2, h3');
  
  console.log(`Elementos de usuario encontrados: ${userElements.length}`);
  console.log(`Texto de bienvenida: "${welcomeText?.textContent || 'No encontrado'}"`);
  
  if (welcomeText?.textContent?.includes('Felipe')) {
    console.log('✅ Usuario Felipe identificado correctamente en UI');
  } else {
    console.log('❌ Usuario Felipe NO identificado en UI - posible problema de contexto');
  }
  
  // 8. Intentar acceso directo al estado del componente React
  console.log('\n🔍 8. ACCESO DIRECTO AL ESTADO DE REACT:');
  
  if (notificationElements.panel) {
    try {
      const reactFiberKey = Object.keys(notificationElements.panel).find(key => 
        key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
      );
      
      if (reactFiberKey) {
        const fiber = notificationElements.panel[reactFiberKey];
        console.log('✅ Fiber de React encontrado');
        console.log('Estado del componente:', fiber?.memoizedState);
        console.log('Props del componente:', fiber?.memoizedProps);
      } else {
        console.log('❌ No se pudo acceder al Fiber de React');
      }
    } catch (e) {
      console.log('❌ Error accediendo al estado de React:', e.message);
    }
  }
  
  // 9. Verificar si hay múltiples instancias del componente
  console.log('\n🔍 9. VERIFICANDO INSTANCIAS MÚLTIPLES:');
  
  const allNotificationPanels = document.querySelectorAll('[class*="NotificationsPanel"], [data-component*="notification"]');
  console.log(`Instancias de NotificationsPanel encontradas: ${allNotificationPanels.length}`);
  
  // 10. Resumen y diagnóstico
  console.log('\n🚨 RESUMEN DEL DIAGNÓSTICO:');
  console.log('PROBLEMAS POTENCIALES:');
  console.log('1. El componente no se está renderizando');
  console.log('2. useEffect no se está ejecutando');
  console.log('3. El contexto de autenticación no está funcionando');
  console.log('4. Los datos no se están cargando en el estado del componente');
  console.log('5. Hay conflicto entre múltiples instancias');
  
  setTimeout(() => {
    console.log('\n📋 LOGS DE NOTIFICACIONES CAPTURADOS:', notificationLogs);
    console.log('📋 ERRORES CAPTURADOS:', errors);
  }, 1000);
  
  return {
    componentFound: !!notificationElements.panel,
    commentsExpected: 4,
    commentsActual: 0,
    userIdentified: welcomeText?.textContent?.includes('Felipe'),
    dataAvailable: !!(storedComments && storedTasks && currentUser)
  };
}

// Función para forzar recarga del componente específico
function forzarRecargaComponente() {
  console.log('\n🔄 FORZANDO RECARGA ESPECÍFICA DEL COMPONENTE...');
  
  // Eliminar cualquier caché del componente
  const notificationCache = sessionStorage.getItem('notificationsCache');
  if (notificationCache) {
    sessionStorage.removeItem('notificationsCache');
    console.log('🗑️ Cache de notificaciones eliminado');
  }
  
  // Forzar múltiples eventos de sincronización
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated', { detail: { force: true } }));
  }, 100);
  
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { type: 'force_update' } }));
  }, 200);
  
  setTimeout(() => {
    // Simular cambio en localStorage para activar listeners
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    localStorage.setItem('smart-student-task-comments', JSON.stringify(comments));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'smart-student-task-comments',
      newValue: JSON.stringify(comments)
    }));
  }, 300);
  
  console.log('✅ Eventos de recarga disparados');
}

// Auto-ejecutar
console.log('🚨 Script de diagnóstico crítico cargado');
console.log('▶️ Ejecutando diagnóstico de campana vacía...');

diagnosticarCampanaVacia();
