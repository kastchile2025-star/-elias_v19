// 🔍 SCRIPT DE DEPURACIÓN: Estado vacío tras completar evaluación
// Este script simula la finalización de una evaluación y verifica por qué no aparece el estado vacío

// Función para simular el estado del usuario estudiante después de completar una evaluación
function debugEvaluationEmptyState() {
    console.log('🔍 [DEBUG] Iniciando depuración del estado vacío tras evaluación...');
    
    // Simular usuario estudiante
    const currentUser = {
        username: 'felipe',
        role: 'student',
        id: 'student_felipe',
        activeCourses: ['MATH101', 'PHYS201']
    };
    
    console.log('👤 Usuario actual:', currentUser);
    
    // 1. Verificar evaluaciones completadas
    console.log('\n📊 1. VERIFICANDO EVALUACIONES COMPLETADAS:');
    
    // Simular datos del localStorage de tareas
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const storedNotifications = localStorage.getItem('smart-student-notifications');
    const storedTaskNotifications = localStorage.getItem('smart-student-task-notifications');
    
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const evaluations = tasks.filter(t => t.taskType === 'evaluation' || t.title.toLowerCase().includes('eval'));
        
        console.log(`   - Total tareas: ${tasks.length}`);
        console.log(`   - Evaluaciones encontradas: ${evaluations.length}`);
        
        evaluations.forEach((eval, index) => {
            console.log(`   - Evaluación ${index + 1}: "${eval.title}" (ID: ${eval.id})`);
            
            // Verificar si está completada usando la misma lógica del código real
            if (window.TaskNotificationManager && window.TaskNotificationManager.isEvaluationCompletedByStudent) {
                const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(eval.id, currentUser.username);
                console.log(`     → Completada: ${isCompleted}`);
            } else {
                console.log('     → TaskNotificationManager no disponible');
            }
        });
    }
    
    // 2. Verificar comentarios no leídos
    console.log('\n💬 2. VERIFICANDO COMENTARIOS NO LEÍDOS:');
    
    if (storedComments) {
        const comments = JSON.parse(storedComments);
        const unreadComments = comments.filter(comment => 
            comment.studentUsername !== currentUser.username && // No son propios
            (!comment.readBy?.includes(currentUser.username)) && // No leídos
            !comment.isSubmission // No son entregas de otros estudiantes
        );
        
        console.log(`   - Total comentarios: ${comments.length}`);
        console.log(`   - Comentarios no leídos: ${unreadComments.length}`);
        
        if (unreadComments.length > 0) {
            console.log('   - Detalles de comentarios no leídos:');
            unreadComments.forEach((comment, index) => {
                console.log(`     ${index + 1}. Tarea: ${comment.taskId}, De: ${comment.author}, Fecha: ${comment.timestamp}`);
            });
        }
    }
    
    // 3. Verificar tareas pendientes
    console.log('\n📋 3. VERIFICANDO TAREAS PENDIENTES:');
    
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const comments = storedComments ? JSON.parse(storedComments) : [];
        const now = new Date();
        
        const pendingTasks = tasks.filter(task => {
            // Verificar asignación
            const isAssigned = task.course && currentUser.activeCourses.includes(task.course);
            
            // Verificar fecha de vencimiento
            const dueDate = new Date(task.dueDate);
            const isApproaching = dueDate > now;
            
            // Verificar si es evaluación completada
            const isEvaluation = task.taskType === 'evaluation' || task.title.toLowerCase().includes('eval');
            if (isEvaluation && window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(task.id, currentUser.username);
                if (isCompleted) {
                    console.log(`     ✅ Evaluación completada filtrada: ${task.title}`);
                    return false;
                }
            }
            
            // Verificar si fue entregada
            const hasSubmitted = comments.some(comment => 
                comment.taskId === task.id && 
                comment.studentUsername === currentUser.username && 
                comment.isSubmission
            );
            
            // Verificar si fue calificada (simulando la función isTaskAlreadyGraded)
            const gradeComment = comments.find(comment => 
                comment.taskId === task.id && 
                comment.studentUsername === currentUser.username && 
                comment.isGrade
            );
            const isGraded = !!gradeComment;
            
            const isPending = isAssigned && isApproaching && !isGraded && !hasSubmitted;
            
            if (isPending) {
                console.log(`     📝 Tarea pendiente: "${task.title}" (tipo: ${task.taskType})`);
                console.log(`        - Asignada: ${isAssigned}, Vigente: ${isApproaching}, Entregada: ${hasSubmitted}, Calificada: ${isGraded}`);
            }
            
            return isPending;
        });
        
        console.log(`   - Tareas pendientes totales: ${pendingTasks.length}`);
    }
    
    // 4. Verificar notificaciones de tareas
    console.log('\n🔔 4. VERIFICANDO NOTIFICACIONES DE TAREAS:');
    
    if (window.TaskNotificationManager && window.TaskNotificationManager.getUnreadNotificationsForUser) {
        try {
            const taskNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
                currentUser.username, 
                currentUser.role,
                currentUser.id
            );
            
            console.log(`   - Notificaciones de tareas no leídas: ${taskNotifications.length}`);
            
            if (taskNotifications.length > 0) {
                console.log('   - Detalles de notificaciones:');
                taskNotifications.forEach((notif, index) => {
                    console.log(`     ${index + 1}. Tipo: ${notif.type}, Tarea: ${notif.taskTitle || notif.taskId}, De: ${notif.fromUsername}`);
                });
            }
        } catch (error) {
            console.error('   - Error al obtener notificaciones:', error);
        }
    } else {
        console.log('   - TaskNotificationManager no disponible para notificaciones');
    }
    
    // 5. Verificar condición final del estado vacío
    console.log('\n🎯 5. EVALUACIÓN FINAL DEL ESTADO VACÍO:');
    
    // Simular las condiciones exactas del código
    const mockUnreadComments = []; // Esto debe calcularse con la lógica real
    const mockPendingTasks = []; // Esto debe calcularse con la lógica real
    const mockTaskNotifications = []; // Esto debe calcularse con la lógica real
    
    const shouldShowEmptyState = mockUnreadComments.length === 0 && 
                                mockPendingTasks.length === 0 && 
                                mockTaskNotifications.length === 0;
    
    console.log(`   - unreadComments.length: ${mockUnreadComments.length}`);
    console.log(`   - pendingTasks.length: ${mockPendingTasks.length}`);
    console.log(`   - taskNotifications.length: ${mockTaskNotifications.length}`);
    console.log(`   - ¿Debería mostrar estado vacío?: ${shouldShowEmptyState}`);
    
    // 6. Recomendaciones
    console.log('\n💡 6. RECOMENDACIONES:');
    console.log('   - Verificar que loadUnreadComments() se ejecute después de completar evaluación');
    console.log('   - Verificar que loadPendingTasks() filtre correctamente evaluaciones completadas');
    console.log('   - Verificar que loadTaskNotifications() limpie notificaciones de evaluaciones completadas');
    console.log('   - Verificar orden de ejecución de las funciones de carga');
    
    return {
        unreadComments: mockUnreadComments.length,
        pendingTasks: mockPendingTasks.length,
        taskNotifications: mockTaskNotifications.length,
        shouldShowEmptyState
    };
}

// Ejecutar automáticamente si se abre en el navegador
if (typeof window !== 'undefined') {
    // Esperar un poco para que se carguen los datos
    setTimeout(() => {
        debugEvaluationEmptyState();
    }, 1000);
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined') {
    module.exports = { debugEvaluationEmptyState };
}
