// 🧪 SCRIPT DE PRUEBA: Simular evaluación completada y limpiar notificaciones
// Ejecutar en la consola del navegador en http://localhost:9002/dashboard

console.log('🧪 === SIMULACIÓN DE EVALUACIÓN COMPLETADA ===');

// 1. Verificar usuario actual
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
console.log('👤 Usuario actual:', currentUser);

if (currentUser.role !== 'student') {
    console.log('⚠️ Este script es solo para estudiantes. Usuario actual:', currentUser.role);
    console.log('💡 Cambia a modo estudiante para probar.');
} else {
    console.log('✅ Usuario es estudiante, procediendo con la simulación...');
    
    // 2. Limpiar todas las notificaciones pendientes
    console.log('🧹 Limpiando notificaciones existentes...');
    
    // Limpiar notificaciones de tareas
    const taskNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    console.log('📋 Notificaciones de tareas antes:', taskNotifications.length);
    
    // Filtrar notificaciones del usuario actual (eliminar las suyas)
    const cleanedNotifications = taskNotifications.filter(n => 
        n.toUsername !== currentUser.username && 
        n.fromUsername !== currentUser.username
    );
    localStorage.setItem('smart-student-task-notifications', JSON.stringify(cleanedNotifications));
    console.log('📋 Notificaciones de tareas después:', cleanedNotifications.length);
    
    // Limpiar comentarios no leídos
    const taskComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    console.log('💬 Comentarios antes:', taskComments.length);
    
    // Marcar todos los comentarios como leídos por el usuario actual
    const updatedComments = taskComments.map(comment => {
        if (!comment.readBy) comment.readBy = [];
        if (!comment.readBy.includes(currentUser.username)) {
            comment.readBy.push(currentUser.username);
        }
        return comment;
    });
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    console.log('💬 Comentarios actualizados (todos marcados como leídos)');
    
    // Limpiar tareas pendientes (simular que todas están completadas/calificadas)
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    console.log('📝 Tareas antes:', tasks.length);
    
    // Agregar calificaciones a todas las entregas del estudiante
    tasks.forEach(task => {
        const studentSubmissions = updatedComments.filter(c => 
            c.taskId === task.id && 
            c.studentUsername === currentUser.username && 
            c.isSubmission
        );
        
        studentSubmissions.forEach(submission => {
            if (!submission.grade) {
                submission.grade = {
                    id: `grade_${submission.id}_${Date.now()}`,
                    percentage: 95,
                    feedback: '¡Excelente trabajo! Has completado esta evaluación exitosamente.',
                    gradedBy: 'profesor_jorge',
                    gradedByName: 'Profesor Jorge',
                    gradedAt: new Date().toISOString()
                };
                console.log(`📊 Agregada calificación a tarea: ${task.title}`);
            }
        });
    });
    
    // Guardar comentarios actualizados con las calificaciones
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    
    console.log('✅ Simulación completada:');
    console.log('  - Todas las notificaciones del estudiante han sido limpiadas');
    console.log('  - Todos los comentarios marcados como leídos');
    console.log('  - Todas las tareas marcadas como calificadas');
    console.log('');
    console.log('🔔 Ahora abre la campana de notificaciones para ver el nuevo diseño vacío');
    console.log('');
    console.log('🔄 Para recargar la página y ver los cambios:');
    console.log('   window.location.reload()');
}

// Función auxiliar para recargar la página
window.testReloadPage = function() {
    console.log('🔄 Recargando página...');
    window.location.reload();
};

// Función auxiliar para verificar el estado actual
window.testCheckStatus = function() {
    const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    console.log('📊 ESTADO ACTUAL:');
    console.log('👤 Usuario:', user.username, '-', user.role);
    console.log('🔔 Notificaciones totales:', notifications.length);
    console.log('🔔 Notificaciones del usuario:', notifications.filter(n => n.toUsername === user.username).length);
    console.log('💬 Comentarios no leídos:', comments.filter(c => !c.readBy || !c.readBy.includes(user.username)).length);
    console.log('📝 Tareas sin calificar:', tasks.filter(t => {
        const submissions = comments.filter(c => c.taskId === t.id && c.studentUsername === user.username && c.isSubmission);
        return submissions.some(s => !s.grade);
    }).length);
};

console.log('');
console.log('🛠️ COMANDOS DISPONIBLES:');
console.log('  testReloadPage() - Recargar la página');
console.log('  testCheckStatus() - Verificar estado actual');
console.log('');
