// 🧪 SCRIPT DE PRUEBA: Simular profesor sin notificaciones pendientes
// Ejecutar en la consola del navegador en http://localhost:9002/dashboard

console.log('🧪 === SIMULACIÓN DE PROFESOR SIN NOTIFICACIONES ===');

// 1. Verificar usuario actual
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
console.log('👤 Usuario actual:', currentUser);

if (currentUser.role !== 'teacher') {
    console.log('⚠️ Este script es solo para profesores. Usuario actual:', currentUser.role);
    console.log('💡 Cambia a modo profesor para probar.');
} else {
    console.log('✅ Usuario es profesor, procediendo con la simulación...');
    
    // 2. Limpiar todas las notificaciones pendientes para el profesor
    console.log('🧹 Limpiando notificaciones de profesor...');
    
    // Limpiar notificaciones de tareas del profesor
    const taskNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    console.log('📋 Notificaciones de tareas antes:', taskNotifications.length);
    
    // Filtrar notificaciones dirigidas al profesor actual
    const cleanedNotifications = taskNotifications.filter(n => 
        n.toUsername !== currentUser.username
    );
    localStorage.setItem('smart-student-task-notifications', JSON.stringify(cleanedNotifications));
    console.log('📋 Notificaciones de tareas después:', cleanedNotifications.length);
    
    // Marcar todos los comentarios de estudiantes como leídos por el profesor
    const taskComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    console.log('💬 Comentarios antes:', taskComments.length);
    
    // Marcar como leídos todos los comentarios donde el profesor puede ver
    const updatedComments = taskComments.map(comment => {
        if (!comment.readBy) comment.readBy = [];
        
        // Si es un comentario de estudiante, marcarlo como leído por el profesor
        if (comment.studentUsername !== currentUser.username && 
            !comment.readBy.includes(currentUser.username)) {
            comment.readBy.push(currentUser.username);
        }
        
        return comment;
    });
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    console.log('💬 Comentarios actualizados (todos marcados como leídos por el profesor)');
    
    // Simular que todas las entregas han sido calificadas
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    console.log('📝 Tareas del profesor antes:', tasks.filter(t => t.assignedBy === currentUser.username).length);
    
    // Agregar calificaciones a todas las entregas pendientes
    const professorTasks = tasks.filter(task => task.assignedBy === currentUser.username);
    let gradedSubmissions = 0;
    
    professorTasks.forEach(task => {
        // Encontrar todas las entregas de estudiantes para esta tarea
        const studentSubmissions = updatedComments.filter(c => 
            c.taskId === task.id && 
            c.isSubmission && 
            c.studentUsername !== currentUser.username
        );
        
        studentSubmissions.forEach(submission => {
            if (!submission.grade) {
                submission.grade = {
                    id: `grade_${submission.id}_${Date.now()}`,
                    percentage: Math.floor(Math.random() * 20) + 80, // 80-100%
                    feedback: `Excelente trabajo en "${task.title}". Has demostrado una comprensión sólida del tema.`,
                    gradedBy: currentUser.username,
                    gradedByName: currentUser.displayName || currentUser.username,
                    gradedAt: new Date().toISOString()
                };
                gradedSubmissions++;
                console.log(`📊 Calificada entrega de ${submission.studentUsername} en: ${task.title}`);
            }
        });
    });
    
    // Guardar comentarios actualizados con las calificaciones
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    
    // Limpiar solicitudes de contraseña si el profesor es admin
    if (currentUser.role === 'admin' || currentUser.username === 'admin') {
        const passwordRequests = JSON.parse(localStorage.getItem('password-reset-requests') || '[]');
        const resolvedRequests = passwordRequests.map(req => ({
            ...req,
            status: 'approved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser.username
        }));
        localStorage.setItem('password-reset-requests', JSON.stringify(resolvedRequests));
        console.log('🔑 Solicitudes de contraseña resueltas');
    }
    
    console.log('✅ Simulación completada:');
    console.log(`  - ${cleanedNotifications.length} notificaciones del profesor limpiadas`);
    console.log('  - Todos los comentarios de estudiantes marcados como leídos');
    console.log(`  - ${gradedSubmissions} entregas calificadas`);
    console.log(`  - ${professorTasks.length} tareas del profesor gestionadas`);
    console.log('');
    console.log('🔔 Ahora abre la campana de notificaciones para ver el nuevo diseño para profesores');
    console.log('');
    console.log('🔄 Para recargar la página y ver los cambios:');
    console.log('   window.location.reload()');
}

// Función auxiliar para recargar la página
window.testReloadPageTeacher = function() {
    console.log('🔄 Recargando página...');
    window.location.reload();
};

// Función auxiliar para verificar el estado actual del profesor
window.testCheckTeacherStatus = function() {
    const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const teacherTasks = tasks.filter(t => t.assignedBy === user.username);
    const unreadComments = comments.filter(c => 
        !c.readBy || !c.readBy.includes(user.username)
    );
    const ungradedSubmissions = comments.filter(c => 
        c.isSubmission && !c.grade && 
        teacherTasks.some(t => t.id === c.taskId)
    );
    
    console.log('📊 ESTADO ACTUAL DEL PROFESOR:');
    console.log('👤 Usuario:', user.username, '-', user.role);
    console.log('🔔 Notificaciones para el profesor:', notifications.filter(n => n.toUsername === user.username).length);
    console.log('💬 Comentarios sin leer:', unreadComments.length);
    console.log('📝 Tareas asignadas por el profesor:', teacherTasks.length);
    console.log('📊 Entregas sin calificar:', ungradedSubmissions.length);
    console.log('');
    console.log('📋 Tareas del profesor:', teacherTasks.map(t => t.title));
};

// Función para simular nuevas entregas (testing)
window.testCreateNewSubmissions = function() {
    const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
    const teacherTasks = tasks.filter(t => t.assignedBy === user.username);
    
    if (teacherTasks.length > 0) {
        const task = teacherTasks[0];
        const newSubmission = {
            id: `comment_${Date.now()}`,
            taskId: task.id,
            studentUsername: 'maria',
            studentName: 'María García',
            comment: 'Aquí está mi entrega para la tarea. He completado todos los requisitos solicitados.',
            timestamp: new Date().toISOString(),
            isSubmission: true,
            readBy: []
        };
        
        comments.push(newSubmission);
        localStorage.setItem('smart-student-task-comments', JSON.stringify(comments));
        
        console.log('📝 Nueva entrega simulada de María para:', task.title);
        console.log('🔄 Recarga la página para ver la notificación');
    } else {
        console.log('⚠️ No hay tareas del profesor para simular entregas');
    }
};

console.log('');
console.log('🛠️ COMANDOS DISPONIBLES PARA PROFESORES:');
console.log('  testReloadPageTeacher() - Recargar la página');
console.log('  testCheckTeacherStatus() - Verificar estado del profesor');
console.log('  testCreateNewSubmissions() - Simular nueva entrega (testing)');
console.log('');
