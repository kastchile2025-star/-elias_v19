// 🔬 DIAGNÓSTICO SIMPLE: Estado vacío tras evaluación
// Script minimalista para debug

function debugEmptyState() {
    console.log('🔬 [DEBUG] Verificando estado vacío...');
    
    // Obtener usuario actual
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    console.log('👤 Usuario actual:', currentUser.username, currentUser.role);
    
    if (currentUser.role !== 'student') {
        console.log('⚠️ Este debug es solo para estudiantes');
        return;
    }
    
    // 1. Verificar comentarios no leídos
    console.log('\n💬 1. COMENTARIOS NO LEÍDOS:');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== currentUser.username && 
        (!comment.readBy?.includes(currentUser.username)) && 
        !comment.isSubmission
    );
    console.log(`   Total: ${unreadComments.length}`);
    
    // 2. Verificar tareas pendientes
    console.log('\n📋 2. TAREAS PENDIENTES:');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const now = new Date();
    let pendingCount = 0;
    
    tasks.forEach(task => {
        const isAssigned = task.course && currentUser.activeCourses?.includes(task.course);
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        if (!isAssigned || !isApproaching) return;
        
        // Verificar si es evaluación
        const isEvaluation = task.taskType === 'evaluation' || task.title.toLowerCase().includes('eval');
        if (isEvaluation) {
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, currentUser.username
                );
                if (isCompleted) {
                    console.log(`   ✅ Evaluación completada (filtrada): ${task.title}`);
                    return;
                }
            }
        }
        
        // Verificar si tiene entrega o está calificada
        const hasSubmitted = comments.some(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isSubmission
        );
        
        // Verificar si está calificada
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        if (!hasSubmitted && !isGraded) {
            pendingCount++;
            console.log(`   📝 Pendiente: ${task.title} (${task.taskType})`);
        } else {
            console.log(`   ✅ No pendiente: ${task.title} (entregada: ${hasSubmitted}, calificada: ${isGraded})`);
        }
    });
    
    console.log(`   Total pendientes: ${pendingCount}`);
    
    // 3. Verificar notificaciones de tareas
    console.log('\n🔔 3. NOTIFICACIONES DE TAREAS:');
    let taskNotificationCount = 0;
    
    if (window.TaskNotificationManager?.getUnreadNotificationsForUser) {
        const rawNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
            currentUser.username,
            currentUser.role,
            currentUser.id
        );
        
        console.log(`   Raw notificaciones: ${rawNotifications.length}`);
        
        // Filtrar según la lógica del panel de notificaciones
        const filteredNotifications = rawNotifications.filter(n => {
            // Filtrar evaluaciones completadas
            if (n.type === 'new_task' && n.taskType === 'evaluation') {
                if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                    const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                        n.taskId, currentUser.username
                    );
                    if (isCompleted) {
                        console.log(`   ✅ Notificación de evaluación completada filtrada: ${n.taskTitle}`);
                        return false;
                    }
                }
            }
            
            // Filtrar tareas calificadas
            if (n.type === 'new_task' && n.taskType === 'assignment') {
                const gradeComment = comments.find(comment => 
                    comment.taskId === n.taskId && 
                    comment.studentUsername === currentUser.username && 
                    comment.isGrade
                );
                const isGraded = !!gradeComment;
                if (isGraded) {
                    console.log(`   ✅ Notificación de tarea calificada filtrada: ${n.taskTitle}`);
                    return false;
                }
            }
            
            return true;
        });
        
        taskNotificationCount = filteredNotifications.length;
        console.log(`   Notificaciones filtradas: ${taskNotificationCount}`);
        
        filteredNotifications.forEach((notif, i) => {
            console.log(`   ${i + 1}. ${notif.type}: ${notif.taskTitle || notif.taskId} (${notif.taskType})`);
        });
    } else {
        console.log('   ⚠️ TaskNotificationManager no disponible');
    }
    
    // 4. Resultado final
    console.log('\n🎯 4. RESULTADO FINAL:');
    const shouldShowEmpty = unreadComments.length === 0 && pendingCount === 0 && taskNotificationCount === 0;
    console.log(`   - Comentarios no leídos: ${unreadComments.length}`);
    console.log(`   - Tareas pendientes: ${pendingCount}`);
    console.log(`   - Notificaciones: ${taskNotificationCount}`);
    console.log(`   - ¿Mostrar estado vacío?: ${shouldShowEmpty}`);
    
    return {
        unreadComments: unreadComments.length,
        pendingTasks: pendingCount,
        taskNotifications: taskNotificationCount,
        shouldShowEmpty
    };
}

// También crear función para marcar evaluación como completada manualmente
function markEvaluationAsCompleted(taskId, studentUsername = null) {
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const username = studentUsername || currentUser.username;
    
    console.log(`🔧 [MANUAL] Marcando evaluación ${taskId} como completada para ${username}...`);
    
    // 1. Agregar a resultados de evaluación
    const evaluationResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
    
    const existingResult = evaluationResults.find(r => 
        r.taskId === taskId && r.studentUsername === username
    );
    
    if (!existingResult) {
        evaluationResults.push({
            taskId: taskId,
            studentUsername: username,
            score: 8,
            totalQuestions: 10,
            percentage: 80,
            completedAt: new Date().toISOString()
        });
        localStorage.setItem('smart-student-evaluation-results', JSON.stringify(evaluationResults));
        console.log('✅ Resultado de evaluación agregado');
    } else {
        console.log('ℹ️ Resultado ya existe');
    }
    
    // 2. Actualizar estado en userTasks
    const userTasksKey = `userTasks_${username}`;
    const userTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]');
    const taskIndex = userTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        userTasks[taskIndex].status = 'completed';
        userTasks[taskIndex].completedAt = new Date().toISOString();
        localStorage.setItem(userTasksKey, JSON.stringify(userTasks));
        console.log('✅ Estado de tarea actualizado');
    }
    
    // 3. Disparar eventos
    window.dispatchEvent(new Event('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('evaluationCompleted', {
        detail: { taskId, studentUsername: username }
    }));
    
    console.log('✅ Eventos disparados');
    
    // 4. Verificar estado después
    setTimeout(() => {
        console.log('\n📊 Estado después de marcar como completada:');
        debugEmptyState();
    }, 200);
}

// Auto-ejecutar si hay hash en URL
if (typeof window !== 'undefined' && window.location.hash === '#debug') {
    setTimeout(debugEmptyState, 1000);
}

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
    window.debugEmptyState = debugEmptyState;
    window.markEvaluationAsCompleted = markEvaluationAsCompleted;
}

console.log('🔬 Debug loaded. Use debugEmptyState() or markEvaluationAsCompleted(taskId) in console');
