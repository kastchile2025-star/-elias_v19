// 🔄 SCRIPT DE RESET COMPLETO - Smart Student
// Este script elimina TODAS las tareas, comentarios, notificaciones y evaluaciones
// ⚠️ USAR CON EXTREMA PRECAUCIÓN - NO SE PUEDE DESHACER

console.log('🔄 SMART STUDENT - SCRIPT DE RESET COMPLETO');
console.log('⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de tareas');

// Función para crear respaldo antes del reset
function createBackup() {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            tasks: JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
            comments: JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]'),
            notifications: JSON.parse(localStorage.getItem('smart-student-notifications') || '[]'),
            evaluations: JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]')
        };

        console.log('💾 Respaldo creado:', backup);
        
        // Guardar en una variable global para recuperar si es necesario
        window.smartStudentBackup = backup;
        
        return backup;
    } catch (error) {
        console.error('❌ Error al crear respaldo:', error);
        return null;
    }
}

// Función para analizar datos antes del reset
function analyzeCurrentData() {
    try {
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        const notifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');

        console.log('📊 ANÁLISIS DE DATOS ACTUALES:');
        console.log(`📚 Tareas: ${tasks.length}`);
        console.log(`💬 Comentarios: ${comments.length}`);
        console.log(`🔔 Notificaciones: ${notifications.length}`);
        console.log(`📝 Evaluaciones: ${evaluations.length}`);

        // Agrupar tareas por profesor
        const tasksByTeacher = {};
        tasks.forEach(task => {
            const teacher = task.assignedBy || 'Sin asignar';
            if (!tasksByTeacher[teacher]) {
                tasksByTeacher[teacher] = [];
            }
            tasksByTeacher[teacher].push(task);
        });

        console.log('👨‍🏫 Tareas por profesor:');
        Object.keys(tasksByTeacher).forEach(teacher => {
            console.log(`  - ${teacher}: ${tasksByTeacher[teacher].length} tareas`);
        });

        // Analizar notificaciones por tipo
        const notificationsByType = {};
        notifications.forEach(notification => {
            const type = notification.type || 'Sin tipo';
            if (!notificationsByType[type]) {
                notificationsByType[type] = [];
            }
            notificationsByType[type].push(notification);
        });

        console.log('🔔 Notificaciones por tipo:');
        Object.keys(notificationsByType).forEach(type => {
            console.log(`  - ${type}: ${notificationsByType[type].length} notificaciones`);
        });

        return {
            tasks,
            comments,
            notifications,
            evaluations,
            tasksByTeacher,
            notificationsByType
        };
    } catch (error) {
        console.error('❌ Error al analizar datos:', error);
        return null;
    }
}

// Función principal de reset
function resetAllTasks(createBackupFirst = true) {
    console.log('🔄 Iniciando reset completo...');

    // Crear respaldo si se solicita
    let backup = null;
    if (createBackupFirst) {
        backup = createBackup();
        if (!backup) {
            console.error('❌ No se pudo crear respaldo. Abortando reset.');
            return false;
        }
    }

    try {
        // Lista de todas las claves de localStorage relacionadas con tareas Y notificaciones
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

        let removedKeys = [];

        console.log('🗑️ Eliminando datos...');

        // Remover cada clave
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                removedKeys.push(key);
                console.log(`  ✅ Eliminado: ${key}`);
            }
        });

        // Reinicializar con arrays vacíos
        localStorage.setItem('smart-student-tasks', '[]');
        localStorage.setItem('smart-student-task-comments', '[]');
        localStorage.setItem('smart-student-notifications', '[]');
        localStorage.setItem('smart-student-evaluations', '[]');

        console.log('🔄 Reinicializando datos...');

        // Disparar eventos para actualizar la UI (incluyendo conteo de notificaciones)
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        document.dispatchEvent(new Event('commentsUpdated'));
        document.dispatchEvent(new CustomEvent('notificationsCleared'));

        console.log('📡 Eventos de actualización disparados');

        console.log('✅ RESET COMPLETADO EXITOSAMENTE');
        console.log(`📊 Se eliminaron ${removedKeys.length} tipos de datos`);
        console.log('🎉 La aplicación ahora está completamente limpia');

        if (backup) {
            console.log('💾 Respaldo disponible en: window.smartStudentBackup');
        }

        return true;
    } catch (error) {
        console.error('❌ Error durante el reset:', error);
        return false;
    }
}

// Función para restaurar desde respaldo
function restoreFromBackup(backup = null) {
    try {
        const backupData = backup || window.smartStudentBackup;
        if (!backupData) {
            console.error('❌ No hay respaldo disponible');
            return false;
        }

        console.log('🔄 Restaurando desde respaldo...');

        localStorage.setItem('smart-student-tasks', JSON.stringify(backupData.tasks || []));
        localStorage.setItem('smart-student-task-comments', JSON.stringify(backupData.comments || []));
        localStorage.setItem('smart-student-notifications', JSON.stringify(backupData.notifications || []));
        localStorage.setItem('smart-student-evaluations', JSON.stringify(backupData.evaluations || []));

        // Disparar eventos para actualizar la UI
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));

        console.log('✅ RESTAURACIÓN COMPLETADA');
        return true;
    } catch (error) {
        console.error('❌ Error durante la restauración:', error);
        return false;
    }
}

// Función para reset selectivo por profesor
function resetTasksByTeacher(teacherUsername) {
    console.log(`🔄 Iniciando reset para profesor: ${teacherUsername}`);

    try {
        // Cargar datos actuales
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        const notifications = JSON.parse(localStorage.getItem('smart-student-notifications') || '[]');

        // Filtrar tareas del profesor
        const teacherTasks = tasks.filter(task => task.assignedBy === teacherUsername);
        const teacherTaskIds = teacherTasks.map(task => task.id);

        console.log(`📚 Encontradas ${teacherTasks.length} tareas del profesor ${teacherUsername}`);

        // Eliminar tareas del profesor
        const remainingTasks = tasks.filter(task => task.assignedBy !== teacherUsername);

        // Eliminar comentarios de las tareas del profesor
        const remainingComments = comments.filter(comment => !teacherTaskIds.includes(comment.taskId));

        // Eliminar notificaciones de las tareas del profesor
        const remainingNotifications = notifications.filter(notification => 
            !teacherTaskIds.includes(notification.taskId)
        );

        // Guardar datos filtrados
        localStorage.setItem('smart-student-tasks', JSON.stringify(remainingTasks));
        localStorage.setItem('smart-student-task-comments', JSON.stringify(remainingComments));
        localStorage.setItem('smart-student-notifications', JSON.stringify(remainingNotifications));

        // Disparar eventos para actualizar la UI
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('notificationSyncCompleted'));

        console.log(`✅ Reset completado para profesor ${teacherUsername}`);
        console.log(`📊 Eliminadas: ${teacherTasks.length} tareas, ${comments.length - remainingComments.length} comentarios, ${notifications.length - remainingNotifications.length} notificaciones`);

        return true;
    } catch (error) {
        console.error('❌ Error durante el reset selectivo:', error);
        return false;
    }
}

// Exponer funciones globalmente
window.smartStudentReset = {
    analyzeData: analyzeCurrentData,
    resetAll: resetAllTasks,
    resetByTeacher: resetTasksByTeacher,
    createBackup: createBackup,
    restoreFromBackup: restoreFromBackup
};

console.log('🚀 FUNCIONES DISPONIBLES:');
console.log('  - smartStudentReset.analyzeData() - Analizar datos actuales');
console.log('  - smartStudentReset.resetAll() - Reset completo (con respaldo)');
console.log('  - smartStudentReset.resetAll(false) - Reset completo (sin respaldo)');
console.log('  - smartStudentReset.resetByTeacher("username") - Reset selectivo por profesor');
console.log('  - smartStudentReset.createBackup() - Crear respaldo manual');
console.log('  - smartStudentReset.restoreFromBackup() - Restaurar desde respaldo');

console.log('');
console.log('💡 EJEMPLO DE USO:');
console.log('  1. smartStudentReset.analyzeData()');
console.log('  2. smartStudentReset.resetAll()');
console.log('  3. Verificar que todo esté limpio');

console.log('');
console.log('⚠️ RECUERDA: Todas las operaciones de reset son IRREVERSIBLES');
console.log('📝 Siempre crea un respaldo antes de hacer cambios importantes');
