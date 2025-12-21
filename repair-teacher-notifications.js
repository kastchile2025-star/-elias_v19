// SCRIPT DE REPARACIÓN PARA NOTIFICACIONES DE PROFESOR
console.log('🔧 REPARANDO NOTIFICACIONES DE PROFESOR...');

function repairTeacherNotifications() {
  try {
    // Obtener usuario actual
    const userStr = localStorage.getItem('smart-student-user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || user.role !== 'teacher') {
      console.log('❌ Usuario no es profesor');
      return false;
    }
    
    // Obtener el nombre del profesor (usar ID como fallback)
    const teacherName = user.name || user.id || 'pepe';
    
    console.log('👤 Profesor:', teacherName);
    console.log('🆔 ID Profesor:', user.id);
    
    // Obtener notificaciones
    const notificationsStr = localStorage.getItem('smart-student-notifications');
    const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
    
    console.log('📊 Total notificaciones antes:', notifications.length);
    
    // Reparar notificaciones
    let repairedCount = 0;
    const repairedNotifications = notifications.map(notification => {
      // Si es una notificación para profesor con targetUsernames null o undefined
      if (notification.targetUserRole === 'teacher' && 
          notification.type === 'pending_grading' &&
          (!notification.targetUsernames || notification.targetUsernames.includes(null))) {
        
        console.log(`🔧 Reparando notificación: ${notification.taskTitle}`);
        
        repairedCount++;
        return {
          ...notification,
          targetUsernames: [teacherName],
          fromDisplayName: 'Sistema'
        };
      }
      
      return notification;
    });
    
    console.log(`✅ Notificaciones reparadas: ${repairedCount}`);
    
    if (repairedCount > 0) {
      // Guardar notificaciones reparadas
      localStorage.setItem('smart-student-notifications', JSON.stringify(repairedNotifications));
      
      // Limpiar cachés
      localStorage.removeItem('smart-student-notification-cache');
      localStorage.removeItem('smart-student-notification-counts');
      
      console.log('💾 Notificaciones guardadas correctamente');
      
      // Verificar reparación
      const verifyNotifications = repairedNotifications.filter(n => 
        n.targetUserRole === 'teacher' && 
        n.targetUsernames && 
        n.targetUsernames.includes(teacherName) &&
        (!n.readBy || !n.readBy.includes(teacherName))
      );
      
      console.log(`📈 Notificaciones válidas para profesor: ${verifyNotifications.length}`);
      
      verifyNotifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.taskTitle} (${notification.type})`);
      });
      
      return true;
    } else {
      console.log('ℹ️ No se encontraron notificaciones para reparar');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error reparando notificaciones:', error);
    return false;
  }
}

// Ejecutar reparación
console.log('🚀 Iniciando reparación...');
const success = repairTeacherNotifications();

if (success) {
  console.log('✅ Reparación exitosa');
  
  // Forzar actualización de UI
  ['notificationUpdate', 'notificationCountUpdate', 'taskNotificationUpdate'].forEach(event => {
    window.dispatchEvent(new CustomEvent(event, {
      detail: { timestamp: Date.now(), source: 'notification-repair' }
    }));
  });
  
  // Recargar página después de un momento
  setTimeout(() => {
    console.log('🔄 Recargando página...');
    window.location.reload();
  }, 1500);
  
} else {
  console.log('ℹ️ No se requirió reparación');
}

console.log('🎉 SCRIPT DE REPARACIÓN COMPLETADO');
