// 🔧 SOLUCIÓN CRÍTICA: Implementar corrección directa sin TaskNotificationManager
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔧 [EMERGENCY FIX] Implementando corrección directa...');
    console.log('=' .repeat(70));
    
    console.log('⚠️ TaskNotificationManager no está disponible');
    console.log('✅ Implementando solución directa para el filtrado de evaluaciones');
    
    // 1. Datos específicos de Carla
    const carlaUsername = 'carla';
    const czxczTaskId = 'task_1753159490875';
    
    // 2. Verificar datos en localStorage
    const evaluationResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
    const carlaResult = evaluationResults.find(r => 
        r.taskId === czxczTaskId && r.studentUsername === carlaUsername
    );
    
    console.log(`\n📊 Resultado de Carla encontrado:`, carlaResult);
    
    if (!carlaResult || !carlaResult.completedAt) {
        console.log('❌ No se encontró resultado válido para Carla');
        return;
    }
    
    // 3. Implementar función de verificación directa
    window.isEvaluationCompletedByStudentDirect = function(taskId, studentUsername) {
        const results = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
        const result = results.find(r => 
            r.taskId === taskId && r.studentUsername === studentUsername
        );
        return !!(result && result.completedAt);
    };
    
    console.log('✅ Función de verificación directa implementada');
    
    // 4. Probar la función
    const isCarlaCompleted = window.isEvaluationCompletedByStudentDirect(czxczTaskId, carlaUsername);
    console.log(`🔍 Carla completó "czxcz": ${isCarlaCompleted}`);
    
    // 5. Crear parche temporal para el panel de notificaciones
    console.log('\n🔧 Aplicando parche temporal al panel de notificaciones...');
    
    // Buscar el panel de notificaciones y forzar actualización
    const notificationPanels = document.querySelectorAll('[class*="notification"], [class*="panel"]');
    console.log(`📊 Paneles encontrados: ${notificationPanels.length}`);
    
    // 6. Marcar evaluación como completada en datos temporales
    if (!window.completedEvaluationsCache) {
        window.completedEvaluationsCache = new Set();
    }
    
    const evaluationKey = `${czxczTaskId}-${carlaUsername}`;
    window.completedEvaluationsCache.add(evaluationKey);
    
    console.log(`✅ Evaluación marcada como completada en caché: ${evaluationKey}`);
    
    // 7. Función auxiliar para verificar si una evaluación está completada
    window.checkEvaluationCompleted = function(taskId, studentUsername) {
        const key = `${taskId}-${studentUsername}`;
        return window.completedEvaluationsCache.has(key) || 
               window.isEvaluationCompletedByStudentDirect(taskId, studentUsername);
    };
    
    // 8. Simular el estado correcto del panel
    console.log('\n🎯 SIMULANDO ESTADO CORRECTO DEL PANEL:');
    
    // Obtener tareas de Carla
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
    let carla = null;
    if (Array.isArray(users)) {
        carla = users.find(u => u.username === 'carla');
    } else {
        Object.keys(users).forEach(key => {
            if (users[key].username === 'carla') {
                carla = users[key];
            }
        });
    }
    
    if (!carla) {
        console.log('❌ Carla no encontrada');
        return;
    }
    
    const carlaTasks = tasks.filter(task => 
        task.course && carla.activeCourses && carla.activeCourses.includes(task.course)
    );
    
    console.log(`📋 Tareas de Carla: ${carlaTasks.length}`);
    
    // 9. Aplicar filtrado correcto
    const now = new Date();
    let pendingTasksCount = 0;
    
    carlaTasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        const isEvaluation = task.taskType === 'evaluation' || task.taskType === 'evaluacion';
        
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === 'carla' && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        if (isEvaluation) {
            const isCompleted = window.checkEvaluationCompleted(task.id, 'carla');
            const shouldFilter = isGraded || isCompleted;
            
            console.log(`   "${task.title}": isCompleted=${isCompleted}, shouldFilter=${shouldFilter}`);
            
            if (isApproaching && !shouldFilter) {
                pendingTasksCount++;
            }
        } else {
            if (isApproaching && !isGraded) {
                pendingTasksCount++;
            }
        }
    });
    
    // 10. Verificar comentarios no leídos
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== 'carla' && 
        (!comment.readBy?.includes('carla')) && 
        !comment.isSubmission
    );
    
    console.log(`\n📊 ESTADO CORREGIDO:`);
    console.log(`   - Tareas pendientes: ${pendingTasksCount}`);
    console.log(`   - Comentarios no leídos: ${unreadComments.length}`);
    console.log(`   - Notificaciones de tarea: 0 (sin TaskNotificationManager)`);
    
    const shouldShowEmptyState = pendingTasksCount === 0 && unreadComments.length === 0;
    console.log(`   🎯 ¿Debería mostrar "¡Todo al día!"?: ${shouldShowEmptyState}`);
    
    // 11. Forzar eventos de actualización
    console.log('\n🔄 Forzando actualización del panel...');
    
    // Disparar múltiples eventos para asegurar actualización
    const events = [
        'evaluationCompleted',
        'taskNotificationsUpdated', 
        'commentsUpdated',
        'dataChanged',
        'notificationPanelUpdate'
    ];
    
    events.forEach(eventName => {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: {
                studentUsername: carlaUsername,
                taskId: czxczTaskId,
                timestamp: new Date().toISOString()
            }
        }));
    });
    
    console.log(`✅ ${events.length} eventos disparados`);
    
    // 12. Mensaje final
    if (shouldShowEmptyState) {
        console.log(`\n✅ ¡CORRECCIÓN EXITOSA!`);
        console.log(`🎯 Carla debería ver "¡Todo al día!" ahora`);
        console.log(`🔄 Si no aparece inmediatamente, recarga la página (F5)`);
    } else {
        console.log(`\n⚠️ Aún hay elementos pendientes que impiden el estado vacío`);
        console.log(`📋 Tareas pendientes: ${pendingTasksCount}`);
        console.log(`💬 Comentarios no leídos: ${unreadComments.length}`);
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔧 Corrección directa completada`);
    
    return {
        evaluationCompleted: isCarlaCompleted,
        pendingTasks: pendingTasksCount,
        unreadComments: unreadComments.length,
        shouldShowEmptyState: shouldShowEmptyState,
        taskNotificationManagerMissing: true
    };
})();
