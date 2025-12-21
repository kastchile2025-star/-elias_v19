// 🔍 DEPURACIÓN DIRECTA: Script para ejecutar directamente en la consola
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔍 [DEBUG] Iniciando depuración del estado del panel...');
    console.log('=' .repeat(70));
    
    // Usuario actual
    const currentUser = {
        username: 'felipe',
        role: 'student', 
        id: 'id-1753155697194-albsgnmuy',
        activeCourses: ['MATH101', 'PHYS201']
    };
    
    console.log('👤 Usuario:', currentUser);
    
    // Obtener datos del localStorage
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const storedEvaluationResults = localStorage.getItem('smart-student-evaluation-results');
    
    if (!storedTasks) {
        console.log('❌ No hay tareas en localStorage');
        return;
    }
    
    const tasks = JSON.parse(storedTasks);
    const comments = storedComments ? JSON.parse(storedComments) : [];
    const evaluationResults = storedEvaluationResults ? JSON.parse(storedEvaluationResults) : [];
    
    console.log(`📊 Datos encontrados:`);
    console.log(`   - Tareas: ${tasks.length}`);
    console.log(`   - Comentarios: ${comments.length}`);
    console.log(`   - Resultados evaluación: ${evaluationResults.length}`);
    
    // Filtrar tareas del estudiante
    const studentTasks = tasks.filter(task => 
        task.course && currentUser.activeCourses.includes(task.course)
    );
    
    console.log(`\n📋 Tareas del estudiante ${currentUser.username}: ${studentTasks.length}`);
    
    // Analizar cada tarea
    studentTasks.forEach((task, index) => {
        console.log(`\n${index + 1}. "${task.title}" (ID: ${task.id})`);
        console.log(`   - Tipo: ${task.taskType}`);
        console.log(`   - Vencimiento: ${task.dueDate}`);
        
        // Verificar si es evaluación
        const isEvaluation = task.taskType === 'evaluation' || 
                           task.title.toLowerCase().includes('eval') ||
                           task.title.toLowerCase().includes('evaluación');
        console.log(`   - ¿Es evaluación?: ${isEvaluation}`);
        
        // Verificar resultados de evaluación
        if (isEvaluation) {
            const result = evaluationResults.find(r => 
                r.taskId === task.id && r.studentUsername === currentUser.username
            );
            console.log(`   - ¿Tiene resultado de evaluación?: ${!!result}`);
            if (result) {
                console.log(`     → Completado: ${result.completedAt}`);
                console.log(`     → Porcentaje: ${result.percentage || 0}%`);
            }
            
            // Verificar con TaskNotificationManager
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, currentUser.username
                );
                console.log(`   - TaskNotificationManager completada: ${isCompleted}`);
            }
        }
        
        // Verificar calificaciones
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        console.log(`   - ¿Está calificada?: ${!!gradeComment}`);
        if (gradeComment) {
            console.log(`     → Calificación: "${gradeComment.content}"`);
        }
        
        // Verificar entregas
        const submission = comments.find(comment =>
            comment.taskId === task.id &&
            comment.studentUsername === currentUser.username &&
            comment.isSubmission
        );
        console.log(`   - ¿Fue entregada?: ${!!submission}`);
    });
    
    // Simular loadPendingTasks
    console.log(`\n📝 SIMULANDO loadPendingTasks:`);
    
    const now = new Date();
    const pendingTasks = [];
    
    studentTasks.forEach(task => {
        const isAssigned = task.course && currentUser.activeCourses.includes(task.course);
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        // Detectar evaluaciones
        const isEvaluation = task.taskType === 'evaluation' || 
                           task.title.toLowerCase().includes('eval') ||
                           task.title.toLowerCase().includes('evaluación');
        
        // Verificar calificación
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        console.log(`\n   Procesando "${task.title}":`);
        console.log(`     - Asignada: ${isAssigned}`);
        console.log(`     - No vencida: ${isApproaching}`);
        console.log(`     - Es evaluación: ${isEvaluation}`);
        console.log(`     - Está calificada: ${isGraded}`);
        
        if (isEvaluation) {
            // Para evaluaciones
            let isCompletedByNotification = false;
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                isCompletedByNotification = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, currentUser.username
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
            // Para tareas regulares
            if (isAssigned && isApproaching && !isGraded) {
                pendingTasks.push(task);
                console.log(`     → 📝 AÑADIDA A PENDIENTES`);
            } else {
                console.log(`     → ✅ FILTRADA (no pendiente)`);
            }
        }
    });
    
    console.log(`\n📊 RESULTADO PENDIENTES: ${pendingTasks.length} tareas`);
    pendingTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}" (${task.taskType})`);
    });
    
    // Simular loadUnreadComments
    console.log(`\n💬 SIMULANDO loadUnreadComments:`);
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== currentUser.username && 
        (!comment.readBy?.includes(currentUser.username)) && 
        !comment.isSubmission
    );
    console.log(`📊 RESULTADO COMENTARIOS: ${unreadComments.length} no leídos`);
    
    // Simular loadTaskNotifications
    console.log(`\n🔔 SIMULANDO loadTaskNotifications:`);
    let taskNotifications = 0;
    
    if (window.TaskNotificationManager?.getUnreadNotificationsForUser) {
        const allNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
            currentUser.username, currentUser.role, currentUser.id
        );
        
        console.log(`   📊 Notificaciones brutas: ${allNotifications.length}`);
        
        const filteredNotifications = allNotifications.filter(n => {
            if (n.type === 'new_task') {
                const gradeComment = comments.find(comment => 
                    comment.taskId === n.taskId && 
                    comment.studentUsername === currentUser.username && 
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
                            n.taskId, currentUser.username
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
    console.log(`\n🎯 EVALUACIÓN FINAL:`);
    console.log(`   📊 Comentarios no leídos: ${unreadComments.length}`);
    console.log(`   📊 Tareas pendientes: ${pendingTasks.length}`);
    console.log(`   📊 Notificaciones de tarea: ${taskNotifications}`);
    
    const shouldShowEmptyState = unreadComments.length === 0 && 
                                pendingTasks.length === 0 && 
                                taskNotifications === 0;
    
    console.log(`   🎯 ¿Debería mostrar "¡Todo al día!"?: ${shouldShowEmptyState}`);
    
    if (!shouldShowEmptyState) {
        console.log(`\n❌ PROBLEMAS DETECTADOS:`);
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
        console.log(`\n✅ ¡TODO CORRECTO! Debería aparecer "¡Todo al día!"`);
        
        // Forzar actualización
        console.log(`\n🔄 Forzando actualización del panel...`);
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        window.dispatchEvent(new CustomEvent('evaluationCompleted'));
        console.log(`✅ Eventos de actualización disparados`);
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Depuración completada`);
    
    return {
        unreadComments: unreadComments.length,
        pendingTasks: pendingTasks.length,
        taskNotifications: taskNotifications,
        shouldShowEmptyState: shouldShowEmptyState
    };
})();
