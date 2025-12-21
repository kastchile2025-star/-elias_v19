// 🔍 SCRIPT DE DEBUG AVANZADO PARA TASKNOTIFICATIONMANAGER
// Ejecutar en la consola del navegador para analizar el problema

console.log('🔍 ADVANCED TASKNOTIFICATIONMANAGER DEBUG');
console.log('=========================================');

const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
const allNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');

console.log('👤 Usuario actual:', currentUser?.username, '| Rol:', currentUser?.role);
console.log('📋 Total notificaciones en localStorage:', allNotifications.length);

// Mostrar todas las notificaciones para entender la estructura
allNotifications.forEach((notif, index) => {
    console.log(`📝 Notificación ${index + 1}:`, {
        id: notif.id,
        type: notif.type,
        taskTitle: notif.taskTitle,
        fromUsername: notif.fromUsername,
        targetUserRole: notif.targetUserRole,
        targetUsernames: notif.targetUsernames,
        readBy: notif.readBy,
        timestamp: notif.timestamp
    });
});

if (currentUser && currentUser.role === 'teacher') {
    console.log('\n🔍 ANALIZANDO FILTROS PARA PROFESOR:', currentUser.username);
    
    allNotifications.forEach((notif, index) => {
        const targetRoleMatch = notif.targetUserRole === 'teacher';
        const targetUsernameMatch = notif.targetUsernames?.includes(currentUser.username);
        const notReadByUser = !notif.readBy?.includes(currentUser.username);
        const notFromSelf = notif.fromUsername !== currentUser.username;
        const isSystemNotif = notif.fromUsername === 'system';
        const isTeacherComment = notif.type === 'teacher_comment';
        
        console.log(`\n📝 Notificación ${index + 1} (${notif.type}):`);
        console.log(`  ✅ targetUserRole === 'teacher': ${targetRoleMatch}`);
        console.log(`  ✅ targetUsernames includes '${currentUser.username}': ${targetUsernameMatch}`);
        console.log(`  ✅ not read by user: ${notReadByUser}`);
        console.log(`  ✅ not from self: ${notFromSelf} (from: ${notif.fromUsername})`);
        console.log(`  ✅ is system notification: ${isSystemNotif}`);
        console.log(`  ✅ is teacher comment: ${isTeacherComment}`);
        
        // Aplicar la lógica de filtro corregida
        let shouldInclude = targetRoleMatch && targetUsernameMatch && notReadByUser;
        
        if (isTeacherComment && notif.fromUsername === currentUser.username) {
            shouldInclude = false;
            console.log(`  ❌ EXCLUDED: Teacher's own comment`);
        } else {
            console.log(`  ✅ INCLUDED: Passes all filters`);
        }
        
        console.log(`  🎯 FINAL RESULT: ${shouldInclude ? 'INCLUDED' : 'EXCLUDED'}`);
    });
    
    // Verificar qué devuelve TaskNotificationManager
    if (window.TaskNotificationManager) {
        console.log('\n🔔 TaskNotificationManager Results:');
        const unreadNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(currentUser.username, 'teacher');
        const count = window.TaskNotificationManager.getUnreadCountForUser(currentUser.username, 'teacher');
        
        console.log('📊 Unread notifications:', unreadNotifications);
        console.log('🔢 Count returned:', count);
    }
}
