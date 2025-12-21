// Script de reparación de notificaciones fantasma
// Ejecutar en la consola del navegador o incluir en la aplicación

function repairGhostNotifications() {
    console.log('🔧 Iniciando reparación de notificaciones fantasma...');
    
    try {
        // Cargar datos actuales
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        
        console.log('📊 Estado actual:');
        console.log(`   📝 Tareas: ${tasks.length}`);
        console.log(`   🔔 Notificaciones: ${notifications.length}`);
        console.log(`   💬 Comentarios: ${comments.length}`);
        
        let ghostsRemoved = 0;
        let orphansRemoved = 0;
        let validNotifications = [];
        let validComments = [];
        
        // Eliminar notificaciones fantasma
        for (const notification of notifications) {
            const taskExists = tasks.some(task => task.id === notification.taskId);
            if (!taskExists) {
                ghostsRemoved++;
                console.log(`👻 Eliminando notificación fantasma: "${notification.taskTitle}" (ID: ${notification.taskId})`);
            } else {
                validNotifications.push(notification);
            }
        }
        
        // Eliminar comentarios huérfanos
        for (const comment of comments) {
            const taskExists = tasks.some(task => task.id === comment.taskId);
            if (!taskExists) {
                orphansRemoved++;
                console.log(`💬 Eliminando comentario huérfano: "${comment.comment.substring(0, 40)}..." (TaskID: ${comment.taskId})`);
            } else {
                validComments.push(comment);
            }
        }
        
        // Guardar datos limpios
        localStorage.setItem('smart-student-task-notifications', JSON.stringify(validNotifications));
        localStorage.setItem('smart-student-task-comments', JSON.stringify(validComments));
        
        console.log('✅ Reparación completada:');
        console.log(`   👻 Notificaciones fantasma eliminadas: ${ghostsRemoved}`);
        console.log(`   💬 Comentarios huérfanos eliminados: ${orphansRemoved}`);
        console.log(`   ✅ Notificaciones válidas: ${validNotifications.length}`);
        console.log(`   ✅ Comentarios válidos: ${validComments.length}`);
        
        // Disparar eventos para actualizar UI
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        
        // Mostrar alerta de éxito
        if (ghostsRemoved > 0 || orphansRemoved > 0) {
            alert(`🎉 Reparación completada!\n\n👻 Notificaciones fantasma eliminadas: ${ghostsRemoved}\n💬 Comentarios huérfanos eliminados: ${orphansRemoved}\n\nEl problema ha sido resuelto. La página se recargará automáticamente.`);
            
            // Recargar página después de 2 segundos
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            alert('✅ Sistema limpio - No se encontraron problemas');
        }
        
        return {
            ghostsRemoved,
            orphansRemoved,
            validNotifications: validNotifications.length,
            validComments: validComments.length
        };
        
    } catch (error) {
        console.error('❌ Error durante la reparación:', error);
        alert('❌ Error durante la reparación. Revisar consola para más detalles.');
        return null;
    }
}

// Hacer la función disponible globalmente
window.repairGhostNotifications = repairGhostNotifications;

// Ejecutar inmediatamente si se detectan problemas
function autoRepairCheck() {
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    let ghostsFound = 0;
    for (const notification of notifications) {
        const taskExists = tasks.some(task => task.id === notification.taskId);
        if (!taskExists) ghostsFound++;
    }
    
    if (ghostsFound > 0) {
        console.log(`🚨 ${ghostsFound} notificaciones fantasma detectadas`);
        console.log('💡 Ejecuta repairGhostNotifications() para solucionarlo');
    }
}

// Ejecutar verificación automática
autoRepairCheck();

console.log('🔧 Script de reparación cargado. Ejecuta repairGhostNotifications() cuando sea necesario.');
