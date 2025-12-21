// 🔍 SCRIPT DE DEBUG PARA EJECUTAR EN LA CONSOLA DEL NAVEGADOR
// Copia y pega esto en la consola del dashboard cuando estés logueado como profesor

console.log('🔍 DEBUGGING NOTIFICATION COUNT DISCREPANCY');
console.log('===========================================');

// 1. Usuario actual
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
console.log('👤 Usuario actual:', currentUser?.username, '| Rol:', currentUser?.role);

if (!currentUser || currentUser.role !== 'teacher') {
    console.error('❌ Debes estar logueado como profesor para este debug');
} else {
    // 2. Obtener notificaciones de tareas
    const taskNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    console.log('📋 Total notificaciones en localStorage:', taskNotifications.length);

    // 3. Filtrar notificaciones para este profesor
    const teacherNotifications = taskNotifications.filter(notif => 
        notif.targetUsernames?.includes(currentUser.username) && 
        !notif.readBy?.includes(currentUser.username)
    );
    
    console.log('📋 Notificaciones no leídas para profesor:', teacherNotifications.length);
    
    // 4. Desglozar por tipo
    const byType = {};
    teacherNotifications.forEach(notif => {
        byType[notif.type] = (byType[notif.type] || 0) + 1;
    });
    
    console.log('📊 Desglose por tipo:', byType);
    
    // 5. Mostrar detalles de task_submission (Tareas Completadas)
    const taskSubmissions = teacherNotifications.filter(n => n.type === 'task_submission');
    console.log('📝 Notificaciones task_submission (Tareas Completadas):', taskSubmissions.length);
    
    if (taskSubmissions.length > 0) {
        console.log('Detalles de task_submission:');
        taskSubmissions.forEach((notif, index) => {
            console.log(`  ${index + 1}. ${notif.fromDisplayName} - ${notif.taskTitle} - ${new Date(notif.timestamp).toLocaleString()}`);
        });
    }
    
    // 6. Verificar qué cuenta el TaskNotificationManager
    if (window.TaskNotificationManager) {
        const managerCount = window.TaskNotificationManager.getUnreadCountForUser(currentUser.username, 'teacher');
        console.log('🔔 TaskNotificationManager cuenta:', managerCount);
        
        // 7. Comparar con lo que vemos en el panel
        const panelVisible = document.querySelector('[data-section="completed-tasks"]');
        if (panelVisible) {
            const panelCount = panelVisible.textContent.match(/\((\d+)\)/);
            console.log('👁️ Panel muestra tareas completadas:', panelCount ? panelCount[1] : 'No encontrado');
        }
    }
    
    // 8. Verificar entregas y comentarios
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const teacherTasks = tasks.filter(task => task.assignedBy === currentUser.username);
    const teacherTaskIds = teacherTasks.map(task => task.id);
    
    const pendingSubmissions = comments.filter(comment => 
        comment.isSubmission === true && 
        teacherTaskIds.includes(comment.taskId) &&
        comment.studentUsername !== currentUser.username &&
        (!comment.grade || comment.grade === null || comment.grade === undefined)
    );
    
    const studentComments = comments.filter(comment => 
        !comment.isSubmission &&
        teacherTaskIds.includes(comment.taskId) &&
        comment.studentUsername !== currentUser.username &&
        !comment.readBy?.includes(currentUser.username)
    );
    
    console.log('💼 Contadores del dashboard:');
    console.log('  - Entregas pendientes (sin calificar):', pendingSubmissions.length);
    console.log('  - Comentarios de estudiantes no leídos:', studentComments.length);
    console.log('  - Notificaciones de tareas (TaskNotificationManager):', managerCount);
    
    const expectedTotal = pendingSubmissions.length + studentComments.length + (managerCount || 0);
    console.log('🎯 TOTAL ESPERADO:', expectedTotal);
    
    // 9. Verificar la burbuja actual
    const notificationBadge = document.querySelector('.badge');
    const currentBadgeCount = notificationBadge ? parseInt(notificationBadge.textContent) || 0 : 0;
    console.log('🔴 Burbuja actual muestra:', currentBadgeCount);
    
    if (currentBadgeCount !== expectedTotal) {
        console.error(`❌ DISCREPANCIA: Burbuja muestra ${currentBadgeCount}, debería mostrar ${expectedTotal}`);
        console.log('🔍 Posibles causas:');
        console.log('  1. TaskNotificationManager no cuenta correctamente task_submission');
        console.log('  2. Las notificaciones task_submission están marcadas como leídas incorrectamente');
        console.log('  3. El targetUsernames no incluye al profesor correcto');
        console.log('  4. Hay un problema en el cálculo del dashboard');
    } else {
        console.log('✅ Los contadores coinciden');
    }
}
