// 🔧 Script de Reparación Inmediata - Formato Notificaciones Estudiante
// Este script corrige las notificaciones para que muestren el título en lugar del ID

console.log('🔧 Iniciando reparación de formato de notificaciones...');

function repairStudentNotificationFormat() {
    try {
        // 1. Obtener datos del localStorage
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');

        console.log('📊 Estado inicial:');
        console.log(`   Usuario: ${currentUser.username} (${currentUser.role})`);
        console.log(`   Notificaciones: ${notifications.length}`);
        console.log(`   Tareas: ${tasks.length}`);

        // 2. Filtrar notificaciones del usuario actual
        const userNotifications = notifications.filter(notif => 
            notif.targetUsernames?.includes(currentUser.username) || 
            notif.toUsername === currentUser.username
        );

        console.log(`📋 Notificaciones del usuario: ${userNotifications.length}`);

        // 3. Reparar notificaciones problemáticas
        let repairedCount = 0;
        const repairedNotifications = notifications.map(notif => {
            // Solo procesar notificaciones de tareas
            if ((notif.type === 'new_task' || notif.type === 'task_created') && 
                (notif.targetUsernames?.includes(currentUser.username) || notif.toUsername === currentUser.username)) {
                
                // Verificar si el título está mal (es un ID o está vacío)
                const titleIsId = !notif.taskTitle || 
                                notif.taskTitle === notif.id || 
                                notif.taskTitle.includes('-') || 
                                notif.taskTitle.length > 30;

                if (titleIsId) {
                    // Buscar la tarea correspondiente
                    const task = tasks.find(t => t.id === notif.taskId);
                    
                    if (task) {
                        console.log(`🔧 Reparando notificación: ${notif.id}`);
                        console.log(`   Antes: "${notif.taskTitle}"`);
                        console.log(`   Después: "${task.title}"`);
                        
                        notif.taskTitle = task.title;
                        
                        // Completar otros campos si faltan
                        if (!notif.course && task.course) notif.course = task.course;
                        if (!notif.subject && task.subject) notif.subject = task.subject;
                        if (!notif.taskType && task.taskType) notif.taskType = task.taskType;
                        
                        repairedCount++;
                    } else {
                        console.warn(`⚠️ No se encontró tarea para ID: ${notif.taskId}`);
                    }
                }
            }
            
            return notif;
        });

        // 4. Guardar cambios
        if (repairedCount > 0) {
            localStorage.setItem('smart-student-task-notifications', JSON.stringify(repairedNotifications));
            
            console.log(`✅ Reparación completada: ${repairedCount} notificaciones corregidas`);
            
            // Disparar eventos para actualizar la UI
            window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
            window.dispatchEvent(new Event('storage'));
            
            console.log('📡 Eventos de actualización disparados');
        } else {
            console.log('ℹ️ No se encontraron notificaciones que requieran reparación');
        }

        // 5. Verificar resultado
        const verifyNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const verifyUserNotifications = verifyNotifications.filter(notif => 
            (notif.type === 'new_task' || notif.type === 'task_created') &&
            (notif.targetUsernames?.includes(currentUser.username) || notif.toUsername === currentUser.username)
        );

        console.log('🔍 Verificación final:');
        verifyUserNotifications.forEach((notif, index) => {
            const hasValidTitle = notif.taskTitle && !notif.taskTitle.includes('-') && notif.taskTitle.length < 50;
            console.log(`   ${index + 1}. ${hasValidTitle ? '✅' : '❌'} "${notif.taskTitle}"`);
        });

        return repairedCount;

    } catch (error) {
        console.error('❌ Error en la reparación:', error);
        return 0;
    }
}

// Ejecutar reparación
const result = repairStudentNotificationFormat();

if (result > 0) {
    console.log('🎉 ¡Reparación exitosa! Recarga la página para ver los cambios.');
} else {
    console.log('ℹ️ No se requirieron cambios o no se pudieron aplicar.');
}

// Función adicional para crear una notificación de prueba con formato correcto
function createTestNotification() {
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    
    const testNotification = {
        id: `test_notification_${Date.now()}`,
        type: 'new_task',
        taskId: 'test_task_id',
        taskTitle: 'Tarea de Prueba - Formato Correcto',
        targetUserRole: 'student',
        targetUsernames: [currentUser.username],
        fromUsername: 'sistema',
        fromDisplayName: 'Sistema de Prueba',
        course: '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3',
        subject: 'Matemáticas',
        timestamp: new Date().toISOString(),
        read: false,
        readBy: [],
        taskType: 'assignment'
    };
    
    notifications.push(testNotification);
    localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
    
    console.log('🧪 Notificación de prueba creada con formato correcto');
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
}

console.log('🔧 Script de reparación completado. Usa createTestNotification() para crear una notificación de prueba.');
