// 🔧 CORRECCIÓN INMEDIATA: Eliminar notificaciones cruzadas entre profesores
// Ejecutar este código en la consola del navegador (F12 → Console) para solucionar el problema

console.log('🔧 Iniciando corrección de notificaciones cruzadas entre profesores...');

try {
    // Obtener datos del sistema
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    console.log(`📊 Estado inicial: ${notifications.length} notificaciones totales`);
    
    let removedCount = 0;
    const originalLength = notifications.length;
    
    // Filtrar notificaciones problemáticas
    const cleanedNotifications = notifications.filter(notification => {
        // Solo procesar notificaciones de comentarios de profesores
        if (notification.type === 'teacher_comment') {
            const fromUser = users.find(u => u.username === notification.fromUsername);
            
            // Verificar si el emisor es un profesor
            if (fromUser && fromUser.role === 'teacher') {
                // Verificar cada destinatario
                const hasProblematicTargets = notification.targetUsernames.some(targetUsername => {
                    const targetUser = users.find(u => u.username === targetUsername);
                    
                    // Problema 1: El profesor se envía notificación a sí mismo
                    if (targetUsername === notification.fromUsername) {
                        console.log(`🗑️ Eliminando comentario propio: ${notification.fromUsername} → sí mismo`);
                        removedCount++;
                        return true;
                    }
                    
                    // Problema 2: El comentario va dirigido a otro profesor
                    if (targetUser && targetUser.role === 'teacher') {
                        console.log(`🗑️ Eliminando notificación cruzada: Profesor "${notification.fromUsername}" → Profesor "${targetUsername}"`);
                        removedCount++;
                        return true;
                    }
                    
                    return false;
                });
                
                // Si tiene destinatarios problemáticos, eliminar la notificación completa
                return !hasProblematicTargets;
            }
        }
        
        // Mantener todas las demás notificaciones
        return true;
    });
    
    // Guardar las notificaciones limpias
    localStorage.setItem('smart-student-task-notifications', JSON.stringify(cleanedNotifications));
    
    console.log(`✅ Corrección completada:`);
    console.log(`   📊 Notificaciones originales: ${originalLength}`);
    console.log(`   🗑️ Notificaciones problemáticas eliminadas: ${removedCount}`);
    console.log(`   📊 Notificaciones restantes: ${cleanedNotifications.length}`);
    
    // Disparar eventos para actualizar la UI
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));
        console.log(`🔄 Eventos de actualización disparados`);
    }
    
    if (removedCount > 0) {
        console.log(`\n🎉 ¡Problema solucionado! Se eliminaron ${removedCount} notificaciones cruzadas.`);
        console.log(`💡 Recarga la página del dashboard para ver los cambios reflejados.`);
    } else {
        console.log(`\n✅ ¡Excelente! No se encontraron notificaciones cruzadas problemáticas.`);
    }
    
} catch (error) {
    console.error('❌ Error durante la corrección:', error);
    console.log('💡 Intenta recargar la página y ejecutar el script nuevamente.');
}
