// 🎯 INTERCEPTOR: Función loadUnreadComments
// Intercepta y monitorea la ejecución de loadUnreadComments para encontrar el problema

function interceptarLoadUnreadComments() {
  console.clear();
  console.log('🎯 INTERCEPTOR: Función loadUnreadComments');
  console.log('='.repeat(50));
  
  // Interceptar console.log para capturar logs específicos
  const originalLog = console.log;
  const loadUnreadCommentsLogs = [];
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('[loadUnreadComments]') || message.includes('Processing') && message.includes('comments')) {
      loadUnreadCommentsLogs.push(`${new Date().toISOString()}: ${message}`);
    }
    originalLog.apply(console, args);
  };
  
  // Interceptar errores para capturar problemas
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('loadUnreadComments') || message.includes('Error loading unread comments')) {
      errors.push(`${new Date().toISOString()}: ${message}`);
    }
    originalError.apply(console, args);
  };
  
  console.log('🔍 MONITOREANDO ejecución de loadUnreadComments...');
  console.log('📊 Estado actual de datos:');
  
  // Verificar datos disponibles
  const storedComments = localStorage.getItem('smart-student-task-comments');
  const storedTasks = localStorage.getItem('smart-student-tasks');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const currentUser = users.find(u => u.username === 'felipe');
  
  console.log(`• Comentarios disponibles: ${storedComments ? 'SÍ' : 'NO'}`);
  console.log(`• Tareas disponibles: ${storedTasks ? 'SÍ' : 'NO'}`);
  console.log(`• Usuario felipe encontrado: ${currentUser ? 'SÍ' : 'NO'}`);
  
  if (storedComments && storedTasks) {
    const comments = JSON.parse(storedComments);
    const tasks = JSON.parse(storedTasks);
    console.log(`• Total comentarios: ${comments.length}`);
    console.log(`• Total tareas: ${tasks.length}`);
  }
  
  // Verificar si hay elementos DOM para mostrar comentarios
  console.log('\n🔍 VERIFICANDO ELEMENTOS DOM:');
  const commentElements = document.querySelectorAll('[class*="comment"], [data-testid*="comment"]');
  const unreadElements = document.querySelectorAll('[class*="unread"], [data-testid*="unread"]');
  const notificationPanelElements = document.querySelectorAll('[class*="notification"]');
  
  console.log(`• Elementos de comentarios: ${commentElements.length}`);
  console.log(`• Elementos no leídos: ${unreadElements.length}`);
  console.log(`• Paneles de notificación: ${notificationPanelElements.length}`);
  
  // Simular y forzar ejecución de loadUnreadComments
  console.log('\n🔄 FORZANDO EJECUCIÓN DE loadUnreadComments...');
  
  // Disparar eventos que deberían activar loadUnreadComments
  const eventsTrigger = [
    { name: 'storage', detail: { key: 'smart-student-task-comments' } },
    { name: 'taskNotificationsUpdated', detail: { force: true } },
    { name: 'commentsUpdated', detail: { source: 'manual' } }
  ];
  
  eventsTrigger.forEach((event, index) => {
    setTimeout(() => {
      if (event.name === 'storage') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: event.detail.key,
          newValue: storedComments
        }));
      } else {
        window.dispatchEvent(new CustomEvent(event.name, { detail: event.detail }));
      }
      console.log(`✅ Evento disparado: ${event.name}`);
    }, index * 100);
  });
  
  // Monitorear por 5 segundos
  setTimeout(() => {
    console.log('\n📊 RESULTADOS DEL MONITOREO:');
    console.log(`🔍 Logs capturados de loadUnreadComments: ${loadUnreadCommentsLogs.length}`);
    
    if (loadUnreadCommentsLogs.length > 0) {
      console.log('\n📋 LOGS DE loadUnreadComments:');
      loadUnreadCommentsLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('\n🚨 PROBLEMA CRÍTICO: loadUnreadComments NO se está ejecutando');
      console.log('Posibles causas:');
      console.log('1. El useEffect no se está activando');
      console.log('2. La condición user?.role === "student" no se cumple');
      console.log('3. Hay un error que impide la ejecución');
      console.log('4. El componente no está montado correctamente');
    }
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORES CAPTURADOS:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Verificar estado del DOM después de los eventos
    const newCommentElements = document.querySelectorAll('[class*="comment"], [data-testid*="comment"]');
    const newUnreadElements = document.querySelectorAll('[class*="unread"], [data-testid*="unread"]');
    
    console.log('\n🔍 ESTADO DEL DOM DESPUÉS DE EVENTOS:');
    console.log(`• Elementos de comentarios: ${commentElements.length} → ${newCommentElements.length}`);
    console.log(`• Elementos no leídos: ${unreadElements.length} → ${newUnreadElements.length}`);
    
    if (newCommentElements.length === 0 && newUnreadElements.length === 0) {
      console.log('\n🚨 CONCLUSIÓN: El DOM no está siendo actualizado');
      console.log('El problema está en la actualización del estado de React o en el renderizado');
    }
    
    // Restaurar console.log original
    console.log = originalLog;
    console.error = originalError;
    
    return {
      logsCapturados: loadUnreadCommentsLogs.length,
      erroresCapturados: errors.length,
      elementosDOM: {
        comentarios: newCommentElements.length,
        noLeidos: newUnreadElements.length
      }
    };
  }, 5000);
  
  console.log('\n⏱️ Monitoreando por 5 segundos...');
  console.log('💡 Si no ves logs de [loadUnreadComments], el problema está en el useEffect o la condición del rol');
}

// Función para verificar específicamente el contexto de usuario
function verificarContextoUsuario() {
  console.log('\n🔍 VERIFICANDO CONTEXTO DE USUARIO:');
  
  // Buscar elementos que muestren el usuario actual
  const userElements = [
    document.querySelector('h1'),
    document.querySelector('h2'),
    document.querySelector('[class*="welcome"]'),
    document.querySelector('[data-testid*="user"]'),
    document.querySelector('[class*="user-name"]')
  ].filter(Boolean);
  
  console.log('Elementos que podrían mostrar usuario:');
  userElements.forEach((element, index) => {
    console.log(`${index + 1}. "${element.textContent}" (${element.tagName})`);
  });
  
  // Verificar localStorage del usuario
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const currentUser = users.find(u => u.username === 'felipe');
  
  if (currentUser) {
    console.log('\n✅ Usuario felipe encontrado en localStorage:');
    console.log(`• ID: ${currentUser.id}`);
    console.log(`• Username: ${currentUser.username}`);
    console.log(`• Name: ${currentUser.name}`);
    console.log(`• Role: ${currentUser.role}`);
    console.log(`• activeCourses: ${JSON.stringify(currentUser.activeCourses)}`);
  } else {
    console.log('\n❌ Usuario felipe NO encontrado en localStorage');
  }
  
  return currentUser;
}

// Auto-ejecutar
console.log('🎯 Script interceptor cargado');
console.log('▶️ Iniciando monitoreo...');

verificarContextoUsuario();
interceptarLoadUnreadComments();
