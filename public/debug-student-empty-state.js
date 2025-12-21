// 🔍 DEPURACIÓN COMPLETA: Estado del panel de notificaciones para estudiantes
// Este script verifica por qué no aparece "¡Todo al día!" después de completar evaluaciones

function debugStudentEmptyState() {
    console.log('🔍 [DEBUG] Analizando estado completo del panel de notificaciones...');
    console.log('=' .repeat(70));
    
    // Simular datos del usuario estudiante
    const currentUser = {
        username: 'felipe',
        role: 'student', 
        id: 'id-1753155697194-albsgnmuy',
        activeCourses: ['MATH101', 'PHYS201']
    };
    
    console.log('👤 Usuario:', currentUser);
    
    // 1. VERIFICAR DATOS EN LOCALSTORAGE
    console.log('\n📊 1. DATOS EN LOCALSTORAGE:');
    
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const storedEvaluationResults = localStorage.getItem('smart-student-evaluation-results');
    const storedTaskNotifications = localStorage.getItem('smart-student-task-notifications');
    
    if (!storedTasks) {
        console.log('❌ No hay tareas en localStorage');
        return;
    }
    
    const tasks = JSON.parse(storedTasks);
    const comments = storedComments ? JSON.parse(storedComments) : [];
    const evaluationResults = storedEvaluationResults ? JSON.parse(storedEvaluationResults) : [];
    const taskNotifications = storedTaskNotifications ? JSON.parse(storedTaskNotifications) : [];
    
    console.log(`   📋 Total tareas: ${tasks.length}`);
    console.log(`   💬 Total comentarios: ${comments.length}`);
    console.log(`   📊 Total resultados evaluación: ${evaluationResults.length}`);
    console.log(`   🔔 Total notificaciones: ${taskNotifications.length}`);
    
    // 2. ANALIZAR TAREAS DEL ESTUDIANTE
    console.log('\n📋 2. ANÁLISIS DE TAREAS:');
    
    const studentTasks = tasks.filter(task => 
        task.course && currentUser.activeCourses.includes(task.course)
    );
    
    console.log(`   👨‍🎓 Tareas asignadas a ${currentUser.username}: ${studentTasks.length}`);
    
    studentTasks.forEach((task, index) => {
        console.log(`\n   ${index + 1}. "${task.title}" (ID: ${task.id})`);
        console.log(`      - Tipo: ${task.taskType}`);
        console.log(`      - Curso: ${task.course}`);
        console.log(`      - Vencimiento: ${task.dueDate}`);
        
        // Verificar si es evaluación
        const isEvaluation = task.taskType === 'evaluation' || 
                           task.title.toLowerCase().includes('eval') ||
                           task.title.toLowerCase().includes('evaluación');
        console.log(`      - ¿Es evaluación?: ${isEvaluation}`);
        
        if (isEvaluation) {
            // Verificar resultados de evaluación
            const result = evaluationResults.find(r => 
                r.taskId === task.id && r.studentUsername === currentUser.username
            );
            console.log(`      - ¿Tiene resultado?: ${!!result}`);
            if (result) {
                console.log(`        → Completado: ${result.completedAt}`);
                console.log(`        → Porcentaje: ${result.percentage || 0}%`);
            }
            
            // Verificar usando TaskNotificationManager
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, currentUser.username
                );
                console.log(`      - TaskNotificationManager dice completada: ${isCompleted}`);
            }
        }
        
        // Verificar si está calificada
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        console.log(`      - ¿Está calificada?: ${!!gradeComment}`);
        if (gradeComment) {
            console.log(`        → Calificación: ${gradeComment.content}`);
        }
        
        // Verificar si fue entregada
        const submission = comments.find(comment =>
            comment.taskId === task.id &&
            comment.studentUsername === currentUser.username &&
            comment.isSubmission
        );
        console.log(`      - ¿Fue entregada?: ${!!submission}`);
    });
    
    // 3. SIMULAR LOADPENDINGTASKS
    console.log('\n📝 3. SIMULACIÓN DE loadPendingTasks:');
    
    const now = new Date();
    const pendingTasks = studentTasks.filter(task => {
        const isAssigned = task.course && currentUser.activeCourses.includes(task.course);
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        // Detectar evaluaciones
        const isEvaluation = task.taskType === 'evaluation' || 
                           task.title.toLowerCase().includes('eval') ||
                           task.title.toLowerCase().includes('evaluación');
        
        // Verificar si está calificada
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        console.log(`   Procesando "${task.title}":`);
        console.log(`     - Asignada: ${isAssigned}`);
        console.log(`     - No vencida: ${isApproaching}`);
        console.log(`     - Es evaluación: ${isEvaluation}`);
        console.log(`     - Está calificada: ${isGraded}`);
        
        if (isEvaluation) {
            // Para evaluaciones, verificar completitud
            const isCompletedByNotification = window.TaskNotificationManager?.isEvaluationCompletedByStudent?.(
                task.id, currentUser.username
            );
            console.log(`     - Completada por notificación: ${isCompletedByNotification}`);
            
            const shouldFilter = isGraded || isCompletedByNotification;
            console.log(`     - ¿Debería filtrarse?: ${shouldFilter}`);
            
            return isAssigned && isApproaching && !shouldFilter;
        } else {
            // Para tareas regulares
            const shouldShow = isAssigned && isApproaching && !isGraded;
            console.log(`     - ¿Debería mostrarse?: ${shouldShow}`);
            return shouldShow;
        }
    });
    
    console.log(`\n   📊 RESULTADO: ${pendingTasks.length} tareas pendientes`);
    pendingTasks.forEach((task, index) => {
        console.log(`     ${index + 1}. "${task.title}" (${task.taskType})`);
    });
    
    // 4. SIMULAR LOADUNREADCOMMENTS
    console.log('\n💬 4. SIMULACIÓN DE loadUnreadComments:');
    
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== currentUser.username && // No son propios
        (!comment.readBy?.includes(currentUser.username)) && // No leídos
        !comment.isSubmission // No son entregas de otros estudiantes
    );
    
    console.log(`   📊 RESULTADO: ${unreadComments.length} comentarios no leídos`);
    
    // 5. SIMULAR LOADTASKNOTIFICATIONS
    console.log('\n🔔 5. SIMULACIÓN DE loadTaskNotifications:');
    
    let filteredNotifications = [];
    if (window.TaskNotificationManager?.getUnreadNotificationsForUser) {
        const allNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
            currentUser.username, currentUser.role, currentUser.id
        );
        
        console.log(`   📊 Notificaciones brutas: ${allNotifications.length}`);
        
        // Aplicar filtros como en el código real
        filteredNotifications = allNotifications.filter(n => {
            if (n.type === 'new_task') {
                // Verificar si la tarea está calificada
                const gradeComment = comments.find(comment => 
                    comment.taskId === n.taskId && 
                    comment.studentUsername === currentUser.username && 
                    comment.isGrade
                );
                const isGraded = !!gradeComment;
                
                console.log(`   Notificación "${n.taskTitle || n.taskId}": calificada=${isGraded}`);
                
                if (isGraded) {
                    console.log(`     → FILTRADA por estar calificada`);
                    return false;
                }
                
                if (n.taskType === 'evaluation') {
                    const isCompletedByNotification = window.TaskNotificationManager?.isEvaluationCompletedByStudent?.(
                        n.taskId, currentUser.username
                    );
                    if (isCompletedByNotification) {
                        console.log(`     → FILTRADA por estar completada`);
                        return false;
                    }
                }
            }
            return true;
        });
    }
    
    console.log(`   📊 RESULTADO: ${filteredNotifications.length} notificaciones de tarea`);
    
    // 6. EVALUACIÓN FINAL
    console.log('\n🎯 6. EVALUACIÓN FINAL:');
    
    const shouldShowEmptyState = unreadComments.length === 0 && 
                                pendingTasks.length === 0 && 
                                filteredNotifications.length === 0;
    
    console.log(`   📊 Comentarios no leídos: ${unreadComments.length}`);
    console.log(`   📊 Tareas pendientes: ${pendingTasks.length}`);
    console.log(`   📊 Notificaciones de tarea: ${filteredNotifications.length}`);
    console.log(`   🎯 ¿Debería mostrar "¡Todo al día!"?: ${shouldShowEmptyState}`);
    
    if (!shouldShowEmptyState) {
        console.log('\n❌ PROBLEMAS DETECTADOS:');
        if (unreadComments.length > 0) {
            console.log(`   - Hay ${unreadComments.length} comentarios no leídos`);
        }
        if (pendingTasks.length > 0) {
            console.log(`   - Hay ${pendingTasks.length} tareas pendientes:`);
            pendingTasks.forEach(task => {
                console.log(`     * "${task.title}" (${task.taskType})`);
            });
        }
        if (filteredNotifications.length > 0) {
            console.log(`   - Hay ${filteredNotifications.length} notificaciones de tarea`);
        }
    } else {
        console.log('\n✅ ¡TODO ESTÁ CORRECTO! Debería aparecer "¡Todo al día!"');
    }
    
    return {
        unreadComments: unreadComments.length,
        pendingTasks: pendingTasks.length,
        taskNotifications: filteredNotifications.length,
        shouldShowEmptyState
    };
}

// Función para forzar actualización
function forceUpdateNotificationsPanel() {
    console.log('\n🔄 Forzando actualización del panel...');
    
    // Disparar eventos
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('commentsUpdated'));
    window.dispatchEvent(new CustomEvent('evaluationCompleted'));
    
    console.log('✅ Eventos disparados');
}

// Función principal
function runCompleteDebug() {
    console.log('🚀 INICIANDO DEPURACIÓN COMPLETA DEL PANEL DE NOTIFICACIONES');
    console.log('=' .repeat(80));
    
    const result = debugStudentEmptyState();
    
    setTimeout(() => {
        console.log('\n🔄 Forzando actualización...');
        forceUpdateNotificationsPanel();
    }, 1000);
    
    return result;
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.debugStudentEmptyState = debugStudentEmptyState;
    window.runCompleteDebug = runCompleteDebug;
    window.forceUpdateNotificationsPanel = forceUpdateNotificationsPanel;
    
    console.log('🔧 Scripts de depuración cargados. Ejecuta:');
    console.log('   - runCompleteDebug() para análisis completo');
    console.log('   - debugStudentEmptyState() para análisis sin actualización');
    console.log('   - forceUpdateNotificationsPanel() para forzar actualización');
}

// Exportar
if (typeof module !== 'undefined') {
    module.exports = { 
        debugStudentEmptyState, 
        forceUpdateNotificationsPanel,
        runCompleteDebug 
    };
}
