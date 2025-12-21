// 🔄 FUERZA RECARGA COMPLETA Y SINCRONIZACIÓN
// Ejecutar para aplicar todos los cambios y sincronizar sistemas

function fuerzaRecargaCompleta() {
  console.clear();
  console.log('🔄 FUERZA RECARGA COMPLETA Y SINCRONIZACIÓN');
  console.log('='.repeat(50));
  
  console.log('📋 PASOS A EJECUTAR:');
  console.log('1. Limpiar caché del navegador');
  console.log('2. Disparar eventos de sincronización');
  console.log('3. Recargar página completamente');
  
  // Limpiar cualquier estado en sessionStorage relacionado con notificaciones
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('notification') || key.includes('comment') || key.includes('unread'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Eliminado de sessionStorage: ${key}`);
  });
  
  // Disparar eventos de sincronización múltiples
  const events = [
    'taskNotificationsUpdated',
    'notificationsUpdated',
    'updateDashboardCounts',
    'pendingTasksUpdated'
  ];
  
  events.forEach((eventName, index) => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { 
          type: 'force_reload',
          source: 'manual_sync',
          timestamp: Date.now()
        }
      }));
      console.log(`✅ Evento disparado: ${eventName}`);
    }, index * 100);
  });
  
  // Forzar recarga después de eventos
  setTimeout(() => {
    console.log('🔄 Recargando página en 3 segundos...');
    console.log('⚠️ IMPORTANTE: Después de la recarga, verifica que:');
    console.log('   • La burbuja roja muestre el número correcto');
    console.log('   • La campana muestre los mismos comentarios');
    console.log('   • Solo Felipe y María vean los comentarios del profesor');
    
    setTimeout(() => {
      window.location.reload(true); // Recarga forzada
    }, 3000);
  }, 1000);
}

// Función alternativa sin recarga automática
function sincronizarSinRecarga() {
  console.log('🔄 SINCRONIZACIÓN SIN RECARGA');
  console.log('='.repeat(35));
  
  // Obtener datos actuales
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const currentUser = users.find(u => u.username === 'felipe');
  
  if (!currentUser) {
    console.error('❌ Usuario felipe no encontrado');
    return;
  }
  
  // Calcular conteo correcto según lógica corregida
  const correctCount = comments.filter(comment => {
    // Aplicar misma lógica que dashboard corregido
    if (comment.studentUsername === currentUser.username || comment.authorUsername === currentUser.username) return false;
    if (comment.isSubmission) return false;
    if (comment.readBy?.includes(currentUser.username)) return false;
    return true; // Simplificado para prueba
  }).length;
  
  console.log(`📊 Conteo correcto calculado: ${correctCount}`);
  
  // Buscar y actualizar elementos de contador en el DOM
  const selectors = [
    '[class*="badge"]',
    '[data-testid*="badge"]', 
    '[class*="notification"]',
    '[data-testid*="notification"]'
  ];
  
  let elementsUpdated = 0;
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Solo actualizar si muestra un número (probablemente contador)
      const text = element.textContent?.trim();
      if (text && /^\d+$/.test(text) && parseInt(text) > 3) {
        console.log(`🔄 Actualizando elemento: "${text}" → "${correctCount}"`);
        element.textContent = correctCount.toString();
        element.style.backgroundColor = correctCount > 0 ? '#ef4444' : '#6b7280';
        elementsUpdated++;
      }
    });
  });
  
  console.log(`✅ Elementos actualizados: ${elementsUpdated}`);
  
  // Disparar eventos
  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  window.dispatchEvent(new CustomEvent('notificationsUpdated', {
    detail: { count: correctCount }
  }));
  
  return { correctCount, elementsUpdated };
}

// Funciones disponibles
console.log('🔄 Scripts de recarga y sincronización cargados:');
console.log('• fuerzaRecargaCompleta() - Recarga página automáticamente');
console.log('• sincronizarSinRecarga() - Sincroniza sin recargar');
console.log('\n💡 Recomendación: Ejecutar fuerzaRecargaCompleta() para aplicar cambios del dashboard');
