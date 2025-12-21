// 🔄 Script de Forzar Actualización - Panel de Notificaciones
// Este script fuerza la actualización del panel y verifica la sincronización

console.log('🔄 Forzando actualización del panel de notificaciones...');

function forceNotificationPanelUpdate() {
    try {
        console.log('📡 Disparando eventos de actualización...');
        
        // Disparar múltiples eventos para asegurar actualización
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('notificationsChanged'));
        
        // Forzar rerender del componente React
        if (window.React && window.React.createElement) {
            console.log('⚛️ Disparando evento React...');
            window.dispatchEvent(new CustomEvent('react-force-update'));
        }
        
        console.log('✅ Eventos disparados');
        
        // Verificar estado del panel
        setTimeout(() => {
            const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
            const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
            
            const userNotifications = notifications.filter(notif => 
                (notif.type === 'new_task' || notif.type === 'task_created') &&
                (notif.targetUsernames?.includes(currentUser.username) || notif.toUsername === currentUser.username)
            );
            
            console.log('🔍 Estado después de actualización:');
            console.log(`   Usuario: ${currentUser.username} (${currentUser.role})`);
            console.log(`   Notificaciones del usuario: ${userNotifications.length}`);
            
            userNotifications.forEach((notif, index) => {
                console.log(`   ${index + 1}. "${notif.taskTitle}"`);
                console.log(`      ID: ${notif.id}`);
                console.log(`      TaskId: ${notif.taskId}`);
                console.log(`      Tipo: ${notif.type}`);
                console.log(`      Curso: ${notif.course}`);
                console.log(`      Materia: ${notif.subject}`);
            });
            
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al forzar actualización:', error);
    }
}

function clearNotificationCache() {
    console.log('🧹 Limpiando caché de notificaciones...');
    
    // Limpiar posibles cachés del componente
    ['notification-cache', 'panel-cache', 'student-cache'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    
    console.log('✅ Caché limpiado');
}

function debugNotificationDisplay() {
    console.log('🔍 Depurando visualización de notificaciones...');
    
    // Buscar elementos del panel en el DOM
    const notificationPanels = document.querySelectorAll('[data-testid*="notification"], .notification, [class*="notification"]');
    console.log(`📱 Elementos de notificación encontrados: ${notificationPanels.length}`);
    
    // Buscar texto que contenga IDs largos
    const textElements = document.querySelectorAll('*');
    let foundIssues = 0;
    
    textElements.forEach(element => {
        const text = element.textContent || '';
        if (text.includes('-') && text.length > 30 && text.match(/[a-f0-9-]{30,}/)) {
            console.warn('⚠️ Posible ID mostrado en lugar de título:', text);
            console.log('   Elemento:', element);
            foundIssues++;
        }
    });
    
    if (foundIssues === 0) {
        console.log('✅ No se encontraron IDs mostrados incorrectamente');
    } else {
        console.log(`❌ Se encontraron ${foundIssues} posibles problemas de visualización`);
    }
}

function completeNotificationFix() {
    console.log('🎯 Ejecutando corrección completa...');
    
    // 1. Limpiar caché
    clearNotificationCache();
    
    // 2. Forzar actualización
    forceNotificationPanelUpdate();
    
    // 3. Esperar y verificar
    setTimeout(() => {
        debugNotificationDisplay();
        console.log('🎉 Corrección completa finalizada');
        console.log('💡 Si aún ves problemas, recarga la página (F5)');
    }, 1000);
}

// Ejecutar corrección completa
completeNotificationFix();

console.log('🔄 Script de actualización forzada completado.');
