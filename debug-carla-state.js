// 🔍 DEPURACIÓN ESPECÍFICA: Verificar estado de Carla
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔍 [DEBUG] Verificando estado específico de Carla...');
    console.log('=' .repeat(70));
    
    // Usuario actual (Carla)
    const currentUser = {
        username: 'carla',
        role: 'student'
    };
    
    console.log('👤 Usuario actual:', currentUser);
    
    // Obtener datos del localStorage
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const storedComments = localStorage.getItem('smart-student-task-comments') || '[]';
    const storedEvaluationResults = localStorage.getItem('smart-student-evaluation-results') || '[]';
    const storedUsers = localStorage.getItem('smart-student-users');
    
    if (!storedTasks) {
        console.log('❌ No hay tareas en localStorage');
        return;
    }
    
    const tasks = JSON.parse(storedTasks);
    const comments = JSON.parse(storedComments);
    const evaluationResults = JSON.parse(storedEvaluationResults);
    const users = JSON.parse(storedUsers || '[]');
    
    console.log(`📊 Datos encontrados:`);
    console.log(`   - Tareas: ${tasks.length}`);
    console.log(`   - Comentarios: ${comments.length}`);
    console.log(`   - Resultados evaluación: ${evaluationResults.length}`);
    console.log(`   - Usuarios: ${users.length}`);
    
    // Buscar a Carla en usuarios
    let carla = null;
    if (Array.isArray(users)) {
        carla = users.find(u => u.username === 'carla');
    } else {
        // Es objeto
        Object.keys(users).forEach(key => {
            if (users[key].username === 'carla') {
                carla = users[key];
            }
        });
    }
    
    if (!carla) {
        console.log('❌ Carla no encontrada en usuarios');
        return;
    }
    
    console.log(`\n👤 Datos de Carla:`, carla);
    
    // Filtrar tareas de Carla
    const carlaTasks = tasks.filter(task => 
        task.course && carla.activeCourses && carla.activeCourses.includes(task.course)
    );
    
    console.log(`\n📋 Tareas de Carla: ${carlaTasks.length}`);
    carlaTasks.forEach((task, index) => {
        console.log(`\n${index + 1}. "${task.title}" (ID: ${task.id})`);
        console.log(`   - Tipo: ${task.taskType}`);
        console.log(`   - Curso: ${task.course}`);
        console.log(`   - Vencimiento: ${task.dueDate}`);
        
        // Verificar si es evaluación
        const isEvaluation = task.taskType === 'evaluation' || task.taskType === 'evaluacion';
        console.log(`   - ¿Es evaluación?: ${isEvaluation}`);
        
        if (isEvaluation) {
            // Buscar resultado de evaluación
            const result = evaluationResults.find(r => 
                r.taskId === task.id && r.studentUsername === 'carla'
            );
            console.log(`   - ¿Tiene resultado?: ${!!result}`);
            if (result) {
                console.log(`     → Completado: ${result.completedAt}`);
                console.log(`     → Porcentaje: ${result.percentage}%`);
            }
            
            // Verificar con TaskNotificationManager
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, 'carla'
                );
                console.log(`   - TaskNotificationManager completada: ${isCompleted}`);
            }
        }
        
        // Verificar calificaciones
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === 'carla' && 
            comment.isGrade
        );
        console.log(`   - ¿Está calificada?: ${!!gradeComment}`);
    });
    
    // Simular loadPendingTasks para Carla
    console.log(`\n📝 SIMULANDO loadPendingTasks para Carla:`);
    
    const now = new Date();
    const pendingTasks = [];
    
    carlaTasks.forEach(task => {
        const isAssigned = true; // Ya están filtradas por curso
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        const isEvaluation = task.taskType === 'evaluation' || task.taskType === 'evaluacion';
        
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === 'carla' && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        console.log(`\n   Procesando "${task.title}":`);
        console.log(`     - Asignada: ${isAssigned}`);
        console.log(`     - No vencida: ${isApproaching}`);
        console.log(`     - Es evaluación: ${isEvaluation}`);
        console.log(`     - Está calificada: ${isGraded}`);
        
        if (isEvaluation) {
            let isCompletedByNotification = false;
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                isCompletedByNotification = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, 'carla'
                );
            }
            console.log(`     - Completada por notificación: ${isCompletedByNotification}`);
            
            const shouldFilter = isGraded || isCompletedByNotification;
            console.log(`     - ¿Debería filtrarse?: ${shouldFilter}`);
            
            if (isAssigned && isApproaching && !shouldFilter) {
                pendingTasks.push(task);
                console.log(`     → 📝 AÑADIDA A PENDIENTES`);
            } else {
                console.log(`     → ✅ FILTRADA (no pendiente)`);
            }
        } else {
            if (isAssigned && isApproaching && !isGraded) {
                pendingTasks.push(task);
                console.log(`     → 📝 AÑADIDA A PENDIENTES`);
            } else {
                console.log(`     → ✅ FILTRADA (no pendiente)`);
            }
        }
    });
    
    // Simular loadUnreadComments para Carla
    console.log(`\n💬 SIMULANDO loadUnreadComments para Carla:`);
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== 'carla' && 
        (!comment.readBy?.includes('carla')) && 
        !comment.isSubmission
    );
    console.log(`📊 RESULTADO COMENTARIOS: ${unreadComments.length} no leídos`);
    
    // Simular loadTaskNotifications para Carla
    console.log(`\n🔔 SIMULANDO loadTaskNotifications para Carla:`);
    let taskNotifications = 0;
    
    if (window.TaskNotificationManager?.getUnreadNotificationsForUser) {
        const carlaUser = carla;
        const allNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
            'carla', 'student', carlaUser.id || 'carla'
        );
        
        console.log(`   📊 Notificaciones brutas: ${allNotifications.length}`);
        
        const filteredNotifications = allNotifications.filter(n => {
            if (n.type === 'new_task') {
                const gradeComment = comments.find(comment => 
                    comment.taskId === n.taskId && 
                    comment.studentUsername === 'carla' && 
                    comment.isGrade
                );
                const isGraded = !!gradeComment;
                
                if (isGraded) {
                    console.log(`   ✅ Notificación filtrada: "${n.taskTitle}" (calificada)`);
                    return false;
                }
                
                if (n.taskType === 'evaluation') {
                    let isCompletedByNotification = false;
                    if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                        isCompletedByNotification = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                            n.taskId, 'carla'
                        );
                    }
                    if (isCompletedByNotification) {
                        console.log(`   ✅ Notificación filtrada: "${n.taskTitle}" (evaluación completada)`);
                        return false;
                    }
                }
                
                console.log(`   📝 Notificación conservada: "${n.taskTitle}"`);
            }
            return true;
        });
        
        taskNotifications = filteredNotifications.length;
    }
    
    console.log(`📊 RESULTADO NOTIFICACIONES: ${taskNotifications} de tarea`);
    
    // Evaluación final
    console.log(`\n🎯 EVALUACIÓN FINAL PARA CARLA:`);
    console.log(`   📊 Comentarios no leídos: ${unreadComments.length}`);
    console.log(`   📊 Tareas pendientes: ${pendingTasks.length}`);
    console.log(`   📊 Notificaciones de tarea: ${taskNotifications}`);
    
    const shouldShowEmptyState = unreadComments.length === 0 && 
                                pendingTasks.length === 0 && 
                                taskNotifications === 0;
    
    console.log(`   🎯 ¿Debería mostrar "¡Todo al día!" para Carla?: ${shouldShowEmptyState}`);
    
    if (!shouldShowEmptyState) {
        console.log(`\n❌ PROBLEMAS DETECTADOS PARA CARLA:`);
        if (unreadComments.length > 0) {
            console.log(`   - ${unreadComments.length} comentarios no leídos impiden el estado vacío`);
        }
        if (pendingTasks.length > 0) {
            console.log(`   - ${pendingTasks.length} tareas pendientes impiden el estado vacío:`);
            pendingTasks.forEach(task => {
                console.log(`     * "${task.title}" (${task.taskType})`);
            });
        }
        if (taskNotifications > 0) {
            console.log(`   - ${taskNotifications} notificaciones de tarea impiden el estado vacío`);
        }
    } else {
        console.log(`\n✅ ¡TODO CORRECTO! Carla debería ver "¡Todo al día!"`);
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Depuración de Carla completada`);
    
    return {
        usuario: 'carla',
        unreadComments: unreadComments.length,
        pendingTasks: pendingTasks.length,
        taskNotifications: taskNotifications,
        shouldShowEmptyState: shouldShowEmptyState
    };
})();
