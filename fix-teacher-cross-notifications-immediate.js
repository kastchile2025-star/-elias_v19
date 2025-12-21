// 🔧 SOLUCIÓN INMEDIATA: Limpiar notificaciones cruzadas entre profesores
// Ejecutar este script en la consola del navegador

console.log("🚀 INICIANDO LIMPIEZA DE NOTIFICACIONES CRUZADAS ENTRE PROFESORES...");

// 1. Obtener todos los datos
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');

console.log(`📊 Estado inicial:`, {
  totalNotifications: notifications.length,
  totalUsers: users.length
});

// 2. Identificar profesores
const teachers = users.filter(u => u.role === 'teacher');
console.log(`👨‍🏫 Profesores encontrados:`, teachers.map(t => t.username));

// 3. Filtrar notificaciones problemáticas
const problematicNotifications = notifications.filter(notif => {
  if (notif.type === 'teacher_comment') {
    // Verificar si el emisor es profesor
    const fromUser = users.find(u => u.username === notif.fromUsername);
    if (fromUser && fromUser.role === 'teacher') {
      // Verificar si tiene destinatarios que son otros profesores
      const teacherTargets = notif.targetUsernames.filter(target => 
        teachers.some(t => t.username === target || t.id === target)
      );
      return teacherTargets.length > 0;
    }
  }
  return false;
});

console.log(`🚨 Notificaciones problemáticas encontradas: ${problematicNotifications.length}`);
problematicNotifications.forEach(notif => {
  console.log(`   - ${notif.type} de ${notif.fromUsername} → ${notif.targetUsernames.join(', ')} (${notif.taskTitle})`);
});

// 4. Limpiar notificaciones cruzadas entre profesores
const cleanNotifications = notifications.filter(notif => {
  if (notif.type === 'teacher_comment') {
    // Verificar si el emisor es profesor
    const fromUser = users.find(u => u.username === notif.fromUsername);
    if (fromUser && fromUser.role === 'teacher') {
      // Filtrar solo destinatarios estudiantes
      const studentTargets = notif.targetUsernames.filter(target => {
        const targetUser = users.find(u => u.username === target || u.id === target);
        return targetUser && targetUser.role === 'student';
      });
      
      if (studentTargets.length > 0) {
        // Actualizar la notificación para que solo vaya a estudiantes
        notif.targetUsernames = studentTargets;
        notif.targetUserRole = 'student';
        return true;
      } else {
        // Eliminar completamente si no hay estudiantes objetivo
        return false;
      }
    }
  }
  return true;
});

// 5. Guardar cambios
localStorage.setItem('smart-student-task-notifications', JSON.stringify(cleanNotifications));

console.log(`✅ LIMPIEZA COMPLETADA:`, {
  notificacionesOriginales: notifications.length,
  notificacionesLimpias: cleanNotifications.length,
  notificacionesEliminadas: notifications.length - cleanNotifications.length
});

// 6. Disparar eventos para actualizar la UI
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));

console.log("🎉 SOLUCIÓN APLICADA. Recarga la página para ver los cambios.");
