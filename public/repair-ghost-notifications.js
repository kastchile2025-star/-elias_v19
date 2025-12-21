// 🔄 SCRIPT DE REPARACIÓN INMEDIATA DE NOTIFICACIONES FANTASMA
// Ejecutar este script en la consola del navegador (F12) para solucionar el problema inmediatamente

console.log('🔄 Iniciando reparación de notificaciones fantasma...');

function repairGhostNotifications() {
    try {
        // Cargar datos actuales
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        
        console.log('📊 Estado actual:');
        console.log(`   📝 Tareas: ${tasks.length}`);
        console.log(`   🔔 Notificaciones: ${notifications.length}`);
        console.log(`   💬 Comentarios: ${comments.length}`);
        
        let ghostsFound = 0;
        let validNotifications = [];
        let validComments = [];
        
        // Paso 1: Eliminar notificaciones fantasma
        console.log('\n🔍 Analizando notificaciones...');
        for (const notification of notifications) {
            const taskExists = tasks.some(task => task.id === notification.taskId);
            
            if (!taskExists) {
                ghostsFound++;
                console.log(`👻 Notificación fantasma encontrada: "${notification.taskTitle}" (TaskId: ${notification.taskId})`);
            } else {
                validNotifications.push(notification);
                console.log(`✅ Notificación válida: "${notification.taskTitle}"`);
            }
        }
        
        // Paso 2: Eliminar comentarios huérfanos
        console.log('\n🔍 Analizando comentarios...');
        let orphanComments = 0;
        for (const comment of comments) {
            const taskExists = tasks.some(task => task.id === comment.taskId);
            
            if (!taskExists) {
                orphanComments++;
                console.log(`💬 Comentario huérfano encontrado: "${comment.comment.substring(0, 50)}..." (TaskId: ${comment.taskId})`);
            } else {
                validComments.push(comment);
            }
        }
        
        // Paso 3: Guardar datos limpios
        if (ghostsFound > 0 || orphanComments > 0) {
            localStorage.setItem('smart-student-task-notifications', JSON.stringify(validNotifications));
            localStorage.setItem('smart-student-task-comments', JSON.stringify(validComments));
            
            console.log('\n✅ Reparación completada:');
            console.log(`   👻 Notificaciones fantasma eliminadas: ${ghostsFound}`);
            console.log(`   💬 Comentarios huérfanos eliminados: ${orphanComments}`);
            console.log(`   ✅ Notificaciones válidas mantenidas: ${validNotifications.length}`);
            console.log(`   ✅ Comentarios válidos mantenidos: ${validComments.length}`);
            
            // Disparar evento para actualizar la UI
            window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
            window.dispatchEvent(new CustomEvent('commentsUpdated'));
            
            console.log('\n🔄 Actualizando interfaz...');
            
            // Recargar página para mostrar cambios
            setTimeout(() => {
                location.reload();
            }, 1000);
            
        } else {
            console.log('\n✅ No se encontraron problemas. El sistema está sincronizado.');
        }
        
    } catch (error) {
        console.error('❌ Error durante la reparación:', error);
    }
}

// Ejecutar inmediatamente
repairGhostNotifications();

// También crear función global para uso posterior
window.repairGhostNotifications = repairGhostNotifications;

console.log('\n💡 Tip: Puedes ejecutar "repairGhostNotifications()" en cualquier momento para limpiar notificaciones fantasma.');
