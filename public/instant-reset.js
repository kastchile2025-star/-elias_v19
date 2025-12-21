// 🔄 SCRIPT DE RESET INMEDIATO - Smart Student
// Ejecutar en la consola del navegador para reset completo

console.log('🔄 INICIANDO RESET COMPLETO DE SMART STUDENT');

// Función para reset inmediato
function resetAllDataNow() {
    console.log('📊 ESTADO ANTES DEL RESET:');
    
    // Mostrar datos actuales
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const notifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
    const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
    
    console.log(`📚 Tareas: ${tasks.length}`);
    console.log(`💬 Comentarios: ${comments.length}`);
    console.log(`🔔 Notificaciones: ${notifications.length}`);
    console.log(`📝 Evaluaciones: ${evaluations.length}`);
    
    // Lista completa de claves a eliminar
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
    
    console.log('🗑️ ELIMINANDO DATOS...');
    
    // Eliminar todas las claves
    keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`  ✅ Eliminado: ${key}`);
        }
    });
    
    // Reinicializar con arrays vacíos
    localStorage.setItem('smart-student-tasks', '[]');
    localStorage.setItem('smart-student-task-comments', '[]');
    localStorage.setItem('smart-student-notifications', '[]');
    localStorage.setItem('smart-student-evaluations', '[]');
    
    console.log('🔄 DATOS REINICIALIZADOS');
    
    // Disparar TODOS los eventos necesarios para actualizar la UI
    console.log('📡 DISPARANDO EVENTOS DE ACTUALIZACIÓN...');
    
    // Eventos de localStorage
    window.dispatchEvent(new Event('storage'));
    
    // Eventos personalizados
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));
    window.dispatchEvent(new CustomEvent('commentsUpdated'));
    
    // Eventos adicionales para el conteo de notificaciones
    document.dispatchEvent(new Event('commentsUpdated'));
    document.dispatchEvent(new CustomEvent('notificationsCleared'));
    
    console.log('✅ RESET COMPLETO FINALIZADO');
    console.log('🎉 TODOS LOS DATOS ELIMINADOS Y UI ACTUALIZADA');
    
    // Verificar estado final
    setTimeout(() => {
        console.log('📊 ESTADO DESPUÉS DEL RESET:');
        const finalTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const finalComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        const finalNotifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
        const finalEvaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        
        console.log(`📚 Tareas: ${finalTasks.length}`);
        console.log(`💬 Comentarios: ${finalComments.length}`);
        console.log(`🔔 Notificaciones: ${finalNotifications.length}`);
        console.log(`📝 Evaluaciones: ${finalEvaluations.length}`);
        
        if (finalTasks.length === 0 && finalComments.length === 0 && finalNotifications.length === 0 && finalEvaluations.length === 0) {
            console.log('✅ ÉXITO: Todos los datos han sido eliminados correctamente');
        } else {
            console.log('⚠️ ADVERTENCIA: Algunos datos podrían no haberse eliminado completamente');
        }
    }, 1000);
}

// Ejecutar reset inmediatamente
resetAllDataNow();

// También hacer disponible para ejecución manual
window.resetAllDataNow = resetAllDataNow;

console.log('💡 Para ejecutar nuevamente: resetAllDataNow()');
