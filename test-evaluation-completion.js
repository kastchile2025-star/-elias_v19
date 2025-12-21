// 🧪 SCRIPT DE PRUEBA: Simular completar evaluación y verificar estado vacío
// Este script prueba el flujo completo de finalización de evaluación

console.log('🧪 [TEST] Iniciando prueba de finalización de evaluación...');

// Función para simular datos de prueba
function setupTestData() {
    console.log('📝 [SETUP] Configurando datos de prueba...');
    
    // Usuario estudiante de prueba
    const testUser = {
        username: 'felipe',
        role: 'student',
        id: 'student_felipe',
        displayName: 'Felipe González',
        activeCourses: ['MATH101']
    };
    
    // Evaluación de prueba
    const testTask = {
        id: 'eval_test_123',
        title: 'Evaluación de Álgebra Básica',
        taskType: 'evaluation',
        course: 'MATH101',
        subject: 'Matemáticas',
        assignedBy: 'teacher',
        assignedTo: 'course',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Simular localStorage inicial
    localStorage.setItem('smart-student-user', JSON.stringify(testUser));
    
    // Agregar tarea a las tareas globales
    const existingTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const taskExists = existingTasks.some(t => t.id === testTask.id);
    if (!taskExists) {
        existingTasks.push(testTask);
        localStorage.setItem('smart-student-tasks', JSON.stringify(existingTasks));
    }
    
    // Agregar tarea a las tareas del usuario
    const userTasksKey = `userTasks_${testUser.username}`;
    const userTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]');
    const userTaskExists = userTasks.some(t => t.id === testTask.id);
    if (!userTaskExists) {
        userTasks.push({...testTask});
        localStorage.setItem(userTasksKey, JSON.stringify(userTasks));
    }
    
    // Crear notificación de nueva evaluación para el estudiante
    if (window.TaskNotificationManager) {
        window.TaskNotificationManager.createNewTaskNotification(
            testTask.id,
            testTask.title,
            'evaluation',
            testTask.course,
            testTask.subject,
            'teacher',
            'Profesor García',
            [testUser.username]
        );
    }
    
    console.log('✅ [SETUP] Datos de prueba configurados:');
    console.log('   - Usuario:', testUser.username);
    console.log('   - Evaluación:', testTask.title);
    console.log('   - ID de tarea:', testTask.id);
    
    return { testUser, testTask };
}

// Función para verificar estado antes de completar
function checkStateBeforeCompletion(testUser, testTask) {
    console.log('\n🔍 [BEFORE] Estado ANTES de completar evaluación:');
    
    // Verificar comentarios no leídos
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const comments = storedComments ? JSON.parse(storedComments) : [];
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== testUser.username && 
        (!comment.readBy?.includes(testUser.username)) && 
        !comment.isSubmission
    );
    console.log(`   - Comentarios no leídos: ${unreadComments.length}`);
    
    // Verificar tareas pendientes
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
    const now = new Date();
    const pendingTasks = tasks.filter(task => {
        const isAssigned = task.course && testUser.activeCourses.includes(task.course);
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        const isEvaluation = task.taskType === 'evaluation' || task.title.toLowerCase().includes('eval');
        if (isEvaluation && window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
            const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(task.id, testUser.username);
            if (isCompleted) return false;
        }
        
        return isAssigned && isApproaching;
    });
    console.log(`   - Tareas pendientes: ${pendingTasks.length}`);
    pendingTasks.forEach((task, i) => {
        console.log(`     ${i + 1}. ${task.title} (${task.taskType})`);
    });
    
    // Verificar notificaciones de tareas
    let taskNotifications = [];
    if (window.TaskNotificationManager?.getUnreadNotificationsForUser) {
        taskNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
            testUser.username,
            testUser.role,
            testUser.id
        );
    }
    console.log(`   - Notificaciones de tareas: ${taskNotifications.length}`);
    taskNotifications.forEach((notif, i) => {
        console.log(`     ${i + 1}. ${notif.type}: ${notif.taskTitle || notif.taskId}`);
    });
    
    const shouldShowEmpty = unreadComments.length === 0 && pendingTasks.length === 0 && taskNotifications.length === 0;
    console.log(`   - ¿Debería mostrar estado vacío?: ${shouldShowEmpty}`);
    
    return { unreadComments, pendingTasks, taskNotifications, shouldShowEmpty };
}

// Función para simular completar la evaluación
function simulateEvaluationCompletion(testUser, testTask) {
    console.log('\n🚀 [COMPLETE] Simulando finalización de evaluación...');
    
    // Resultados de la evaluación
    const evaluationResults = {
        score: 8,
        totalQuestions: 10,
        completionPercentage: 80,
        timeSpent: 1200 // 20 minutos
    };
    
    // 1. Actualizar estado de la tarea del usuario
    const userTasksKey = `userTasks_${testUser.username}`;
    const userTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]');
    const taskIndex = userTasks.findIndex(task => task.id === testTask.id);
    
    if (taskIndex !== -1) {
        userTasks[taskIndex].status = 'completed';
        userTasks[taskIndex].completedAt = new Date().toISOString();
        userTasks[taskIndex].score = evaluationResults.score;
        userTasks[taskIndex].completionPercentage = evaluationResults.completionPercentage;
        localStorage.setItem(userTasksKey, JSON.stringify(userTasks));
        console.log('✅ [COMPLETE] Estado de tarea actualizado a "completed"');
    }
    
    // 2. Crear notificación para el profesor
    if (window.TaskNotificationManager?.createEvaluationCompletedNotification) {
        window.TaskNotificationManager.createEvaluationCompletedNotification(
            testTask.id,
            testTask.title,
            testTask.course,
            testTask.subject,
            testUser.username,
            testUser.displayName,
            'teacher',
            evaluationResults
        );
        console.log('✅ [COMPLETE] Notificación de evaluación completada creada');
    }
    
    // 3. Disparar eventos (simulando lo que hace la página de evaluación)
    window.dispatchEvent(new Event('taskNotificationsUpdated'));
    console.log('✅ [COMPLETE] Evento taskNotificationsUpdated disparado');
    
    window.dispatchEvent(new CustomEvent('evaluationCompleted', {
        detail: {
            taskId: testTask.id,
            studentUsername: testUser.username,
            score: evaluationResults.score,
            completionPercentage: evaluationResults.completionPercentage,
            completedAt: new Date().toISOString()
        }
    }));
    console.log('✅ [COMPLETE] Evento evaluationCompleted disparado');
    
    return evaluationResults;
}

// Función para verificar estado después de completar
function checkStateAfterCompletion(testUser, testTask) {
    console.log('\n🔍 [AFTER] Estado DESPUÉS de completar evaluación:');
    
    // Dar tiempo para que los eventos se procesen
    return new Promise((resolve) => {
        setTimeout(() => {
            // Verificar comentarios no leídos
            const storedComments = localStorage.getItem('smart-student-task-comments');
            const comments = storedComments ? JSON.parse(storedComments) : [];
            const unreadComments = comments.filter(comment => 
                comment.studentUsername !== testUser.username && 
                (!comment.readBy?.includes(testUser.username)) && 
                !comment.isSubmission
            );
            console.log(`   - Comentarios no leídos: ${unreadComments.length}`);
            
            // Verificar tareas pendientes
            const storedTasks = localStorage.getItem('smart-student-tasks');
            const tasks = storedTasks ? JSON.parse(storedTasks) : [];
            const now = new Date();
            const pendingTasks = tasks.filter(task => {
                const isAssigned = task.course && testUser.activeCourses.includes(task.course);
                const dueDate = new Date(task.dueDate);
                const isApproaching = dueDate > now;
                
                const isEvaluation = task.taskType === 'evaluation' || task.title.toLowerCase().includes('eval');
                if (isEvaluation && window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                    const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(task.id, testUser.username);
                    if (isCompleted) {
                        console.log(`     ✅ Evaluación completada filtrada: ${task.title}`);
                        return false;
                    }
                }
                
                return isAssigned && isApproaching;
            });
            console.log(`   - Tareas pendientes: ${pendingTasks.length}`);
            pendingTasks.forEach((task, i) => {
                console.log(`     ${i + 1}. ${task.title} (${task.taskType})`);
            });
            
            // Verificar notificaciones de tareas
            let taskNotifications = [];
            if (window.TaskNotificationManager?.getUnreadNotificationsForUser) {
                taskNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(
                    testUser.username,
                    testUser.role,
                    testUser.id
                );
                
                // Filtrar evaluaciones completadas específicamente
                taskNotifications = taskNotifications.filter(notification => {
                    if (notification.type === 'new_task' && notification.taskType === 'evaluation') {
                        const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                            notification.taskId, testUser.username
                        );
                        if (isCompleted) {
                            console.log(`     ✅ Notificación de evaluación completada filtrada: ${notification.taskTitle}`);
                            return false;
                        }
                    }
                    return true;
                });
            }
            console.log(`   - Notificaciones de tareas: ${taskNotifications.length}`);
            taskNotifications.forEach((notif, i) => {
                console.log(`     ${i + 1}. ${notif.type}: ${notif.taskTitle || notif.taskId}`);
            });
            
            const shouldShowEmpty = unreadComments.length === 0 && pendingTasks.length === 0 && taskNotifications.length === 0;
            console.log(`   - ¿Debería mostrar estado vacío?: ${shouldShowEmpty}`);
            
            resolve({ unreadComments, pendingTasks, taskNotifications, shouldShowEmpty });
        }, 500); // Esperar 500ms para que se procesen los eventos
    });
}

// Función principal de prueba
async function runEvaluationCompletionTest() {
    console.log('🧪 [TEST] ========================================');
    console.log('🧪 [TEST] PRUEBA DE FINALIZACIÓN DE EVALUACIÓN');
    console.log('🧪 [TEST] ========================================');
    
    try {
        // 1. Configurar datos de prueba
        const { testUser, testTask } = setupTestData();
        
        // 2. Verificar estado inicial
        const beforeState = checkStateBeforeCompletion(testUser, testTask);
        
        // 3. Completar evaluación
        const results = simulateEvaluationCompletion(testUser, testTask);
        
        // 4. Verificar estado final
        const afterState = await checkStateAfterCompletion(testUser, testTask);
        
        // 5. Análisis de resultados
        console.log('\n📊 [ANALYSIS] ANÁLISIS DE RESULTADOS:');
        console.log('   ANTES:', {
            unreadComments: beforeState.unreadComments.length,
            pendingTasks: beforeState.pendingTasks.length,
            taskNotifications: beforeState.taskNotifications.length,
            shouldShowEmpty: beforeState.shouldShowEmpty
        });
        console.log('   DESPUÉS:', {
            unreadComments: afterState.unreadComments.length,
            pendingTasks: afterState.pendingTasks.length,
            taskNotifications: afterState.taskNotifications.length,
            shouldShowEmpty: afterState.shouldShowEmpty
        });
        
        // 6. Conclusiones
        console.log('\n🎯 [CONCLUSION] CONCLUSIONES:');
        if (afterState.shouldShowEmpty) {
            console.log('✅ ÉXITO: El estado vacío se muestra correctamente después de completar la evaluación');
        } else {
            console.log('❌ PROBLEMA: El estado vacío NO se muestra después de completar la evaluación');
            console.log('   Posibles causas:');
            if (afterState.unreadComments.length > 0) {
                console.log(`   - Comentarios no leídos: ${afterState.unreadComments.length}`);
            }
            if (afterState.pendingTasks.length > 0) {
                console.log(`   - Tareas pendientes: ${afterState.pendingTasks.length}`);
            }
            if (afterState.taskNotifications.length > 0) {
                console.log(`   - Notificaciones de tareas: ${afterState.taskNotifications.length}`);
            }
        }
        
        return {
            success: afterState.shouldShowEmpty,
            beforeState,
            afterState,
            results
        };
        
    } catch (error) {
        console.error('❌ [ERROR] Error durante la prueba:', error);
        return { success: false, error };
    }
}

// Auto-ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Esperar un poco para que se carguen las dependencias
    setTimeout(() => {
        runEvaluationCompletionTest().then(result => {
            console.log('\n🏁 [FINAL] Prueba finalizada:', result.success ? 'ÉXITO' : 'FALLÓ');
        });
    }, 2000);
}

// Exportar para uso manual
if (typeof module !== 'undefined') {
    module.exports = { 
        runEvaluationCompletionTest,
        setupTestData,
        simulateEvaluationCompletion,
        checkStateBeforeCompletion,
        checkStateAfterCompletion
    };
}
