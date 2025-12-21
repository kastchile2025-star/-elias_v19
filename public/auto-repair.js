// Auto-reparación de notificaciones fantasma
// Este script se ejecuta automáticamente al cargar el dashboard

(function() {
    console.log('🔄 Verificando notificaciones fantasma...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndRepair);
    } else {
        checkAndRepair();
    }
    
    function checkAndRepair() {
        try {
            // Cargar datos actuales
            const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
            const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
            
            let ghostsFound = 0;
            let ghostNotifications = [];
            let validNotifications = [];
            
            // Verificar cada notificación
            for (const notification of notifications) {
                const taskExists = tasks.some(task => task.id === notification.taskId);
                if (!taskExists) {
                    ghostsFound++;
                    ghostNotifications.push(notification);
                } else {
                    validNotifications.push(notification);
                }
            }
            
            // Si hay notificaciones fantasma, eliminarlas automáticamente
            if (ghostsFound > 0) {
                console.log(`🚨 ${ghostsFound} notificaciones fantasma detectadas`);
                
                // Mostrar detalles de las notificaciones fantasma
                ghostNotifications.forEach(notification => {
                    console.log(`👻 Notificación fantasma: "${notification.taskTitle}" (ID: ${notification.taskId})`);
                });
                
                // Guardar solo las notificaciones válidas
                localStorage.setItem('smart-student-task-notifications', JSON.stringify(validNotifications));
                
                // Limpiar también comentarios huérfanos
                const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
                const validComments = comments.filter(comment => {
                    return tasks.some(task => task.id === comment.taskId);
                });
                
                localStorage.setItem('smart-student-task-comments', JSON.stringify(validComments));
                
                console.log('✅ Notificaciones fantasma eliminadas automáticamente');
                console.log(`   👻 Eliminadas: ${ghostsFound}`);
                console.log(`   ✅ Válidas: ${validNotifications.length}`);
                
                // Disparar eventos para actualizar la UI
                window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
                window.dispatchEvent(new CustomEvent('commentsUpdated'));
                
                // Mostrar notificación temporal al usuario
                if (typeof window !== 'undefined' && window.location.pathname.includes('dashboard')) {
                    showNotificationToUser(ghostsFound);
                }
            } else {
                console.log('✅ No se encontraron notificaciones fantasma');
            }
            
        } catch (error) {
            console.error('❌ Error durante la verificación automática:', error);
        }
    }
    
    function showNotificationToUser(ghostsRemoved) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <strong>🔧 Reparación Automática</strong><br>
            Se eliminaron ${ghostsRemoved} notificaciones fantasma.<br>
            Sistema sincronizado correctamente.
        `;
        
        // Agregar animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 5000);
    }
    
    // Verificar periódicamente cada 30 segundos
    setInterval(checkAndRepair, 30000);
    
    console.log('🔄 Auto-reparación de notificaciones activada');
})();
