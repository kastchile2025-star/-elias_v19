
// Reparación inmediata de notificaciones fantasma
function repairGhostNotifications() {
    console.log('🔧 Reparando notificaciones fantasma...');
    
    try {
        // Cargar datos actuales
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        
        console.log('📊 Estado actual:');
        console.log('   📝 Tareas:', tasks.length);
        console.log('   🔔 Notificaciones:', notifications.length);
        console.log('   💬 Comentarios:', comments.length);
        
        let ghostsRemoved = 0;
        let orphansRemoved = 0;
        let validNotifications = [];
        let validComments = [];
        
        // Eliminar notificaciones fantasma
        for (const notification of notifications) {
            const taskExists = tasks.some(task => task.id === notification.taskId);
                ghostsRemoved++;
                console.log('👻 Eliminando notificación fantasma:', notification.taskTitle);
            } else {
                validNotifications.push(notification);
            }
        }
        
        // Eliminar comentarios huérfanos
        for (const comment of comments) {
            const taskExists = tasks.some(task => task.id === comment.taskId);
                orphansRemoved++;
                console.log('💬 Eliminando comentario huérfano:', comment.comment.substring(0, 40) + '...');
            } else {
                validComments.push(comment);
            }
        }
        
        // Guardar datos limpios
        localStorage.setItem('smart-student-task-notifications', JSON.stringify(validNotifications));
        localStorage.setItem('smart-student-task-comments', JSON.stringify(validComments));
        
        console.log('✅ Reparación completada:');
        console.log('   👻 Notificaciones fantasma eliminadas:', ghostsRemoved);
        console.log('   💬 Comentarios huérfanos eliminados:', orphansRemoved);
        console.log('   ✅ Notificaciones válidas:', validNotifications.length);
        console.log('   ✅ Comentarios válidos:', validComments.length);
        
        // Disparar eventos para actualizar UI
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        
        // Mostrar mensaje de éxito
        if (ghostsRemoved > 0 || orphansRemoved > 0) {
            alert('🎉 Reparación completada!

👻 Notificaciones fantasma eliminadas: ' + ghostsRemoved + '
💬 Comentarios huérfanos eliminados: ' + orphansRemoved + '

La página se recargará automáticamente.');
            
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

// Ejecutar reparación inmediatamente
repairGhostNotifications();
