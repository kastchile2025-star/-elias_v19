// ⚡ SCRIPT DE RESET INMEDIATO - COPIAR Y PEGAR EN LA CONSOLA
// Elimina TODAS las tareas, notificaciones y badge de notificaciones

console.log('🔄 RESET INMEDIATO INICIADO');

// Claves a eliminar
const keysToRemove = [
    'smart-student-tasks',
    'smart-student-task-comments', 
    'smart-student-notifications',
    'smart-student-evaluations',
    'smart-student-task-assignments',
    'smart-student-submissions',
    'smart-student-grades',
    'smart-student-teacher-feedback',
    'smart-student-task-notifications',
    'notification-counts',
    'task-notification-counts'
];

// Eliminar datos
keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Eliminado: ${key}`);
    }
});

// Reinicializar
localStorage.setItem('smart-student-tasks', '[]');
localStorage.setItem('smart-student-task-comments', '[]');
localStorage.setItem('smart-student-notifications', '[]');
localStorage.setItem('smart-student-evaluations', '[]');

// Disparar eventos
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));
window.dispatchEvent(new CustomEvent('commentsUpdated'));
document.dispatchEvent(new Event('commentsUpdated'));
document.dispatchEvent(new CustomEvent('notificationsCleared'));

console.log('✅ RESET COMPLETADO - Badge de notificaciones debería desaparecer');

// Verificar después de 1 segundo
setTimeout(() => {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const notifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
    console.log(`📊 Verificación: ${tasks.length} tareas, ${notifications.length} notificaciones`);
    
    if (tasks.length === 0 && notifications.length === 0) {
        console.log('🎉 ÉXITO: Todos los datos eliminados correctamente');
    } else {
        console.log('⚠️ Algunos datos podrían persistir');
    }
}, 1000);
