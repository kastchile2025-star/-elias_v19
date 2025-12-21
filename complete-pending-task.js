// 🎯 SCRIPT PARA COMPLETAR LA TAREA PENDIENTE
// Este script simula la entrega de la tarea "dfsdfds" para que Felipe pueda ver el estado vacío

function completePendingTask() {
    console.log('🎯 [COMPLETE] Completando tarea pendiente para Felipe...');
    
    const taskId = 'task_1753157246995'; // ID de la tarea "dfsdfds"
    const studentUsername = 'felipe';
    
    // 1. Obtener comentarios existentes
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const comments = storedComments ? JSON.parse(storedComments) : [];
    
    console.log(`📝 Comentarios actuales: ${comments.length}`);
    
    // 2. Crear comentario de entrega
    const submissionComment = {
        id: `comment_${Date.now()}`,
        taskId: taskId,
        author: studentUsername,
        studentUsername: studentUsername,
        content: 'Entrega completada - Simulación para testing',
        timestamp: new Date().toISOString(),
        isSubmission: true,
        readBy: [studentUsername]
    };
    
    // 3. Agregar el comentario de entrega
    comments.push(submissionComment);
    localStorage.setItem('smart-student-task-comments', JSON.stringify(comments));
    
    console.log('✅ Comentario de entrega agregado:', submissionComment);
    
    // 4. Verificar que la tarea ya no esté pendiente
    console.log('\n🔍 Verificando estado después de la entrega...');
    
    // Simular la verificación de tareas pendientes
    const storedTasks = localStorage.getItem('smart-student-tasks');
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            console.log(`📋 Tarea encontrada: "${task.title}"`);
            
            // Verificar si ahora tiene entrega
            const hasSubmission = comments.some(comment => 
                comment.taskId === taskId && 
                comment.studentUsername === studentUsername && 
                comment.isSubmission
            );
            
            console.log(`📤 ¿Tiene entrega?: ${hasSubmission}`);
            
            if (hasSubmission) {
                console.log('🎉 ¡La tarea ya no debería aparecer como pendiente!');
            }
        }
    }
    
    // 5. Disparar eventos para actualizar la UI
    console.log('\n🔄 Disparando eventos de actualización...');
    
    // Disparar evento de actualización de comentarios
    window.dispatchEvent(new CustomEvent('commentsUpdated', {
        detail: { taskId: taskId, studentUsername: studentUsername }
    }));
    
    // Disparar evento de actualización de notificaciones
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    
    console.log('✅ Eventos disparados. La UI debería actualizarse.');
    
    return {
        taskId,
        studentUsername,
        submissionAdded: true,
        commentId: submissionComment.id
    };
}

// Función para verificar el estado después de completar
function verifyEmptyState() {
    console.log('\n🎯 [VERIFY] Verificando estado vacío...');
    
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const storedTasks = localStorage.getItem('smart-student-tasks');
    
    if (!storedComments || !storedTasks) {
        console.log('❌ No se encontraron datos en localStorage');
        return false;
    }
    
    const comments = JSON.parse(storedComments);
    const tasks = JSON.parse(storedTasks);
    const currentUser = { username: 'felipe', activeCourses: ['MATH101', 'PHYS201'] };
    
    // Simular loadPendingTasks
    const now = new Date();
    const pendingTasks = tasks.filter(task => {
        const isAssigned = task.course && currentUser.activeCourses.includes(task.course);
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        const hasSubmitted = comments.some(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isSubmission
        );
        
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        return isAssigned && isApproaching && !isGraded && !hasSubmitted;
    });
    
    // Simular loadUnreadComments
    const unreadComments = comments.filter(comment => 
        comment.studentUsername !== currentUser.username && 
        (!comment.readBy?.includes(currentUser.username)) && 
        !comment.isSubmission
    );
    
    console.log(`📊 Estado después de completar:`);
    console.log(`   - Comentarios no leídos: ${unreadComments.length}`);
    console.log(`   - Tareas pendientes: ${pendingTasks.length}`);
    console.log(`   - Notificaciones de tareas: 0 (asumido)`);
    
    const shouldShowEmptyState = unreadComments.length === 0 && 
                                pendingTasks.length === 0;
    
    console.log(`🎯 ¿Debería mostrar estado vacío?: ${shouldShowEmptyState}`);
    
    if (shouldShowEmptyState) {
        console.log('🎉 ¡ÉXITO! El estado vacío debería aparecer ahora.');
    } else {
        console.log('❌ Aún hay elementos pendientes que impiden el estado vacío.');
        if (pendingTasks.length > 0) {
            console.log('📋 Tareas pendientes restantes:', pendingTasks.map(t => t.title));
        }
        if (unreadComments.length > 0) {
            console.log('💬 Comentarios no leídos restantes:', unreadComments.length);
        }
    }
    
    return shouldShowEmptyState;
}

// Función principal que ejecuta todo el proceso
function fixEmptyStateForFelipe() {
    console.log('🚀 INICIANDO PROCESO PARA MOSTRAR ESTADO VACÍO A FELIPE');
    console.log('=' .repeat(60));
    
    // Paso 1: Completar la tarea pendiente
    const result = completePendingTask();
    
    // Paso 2: Esperar un momento y verificar
    setTimeout(() => {
        verifyEmptyState();
        console.log('\n💡 Si el estado vacío no aparece automáticamente, actualiza la página.');
    }, 1000);
    
    return result;
}

// Ejecutar automáticamente si estamos en el navegador
if (typeof window !== 'undefined') {
    console.log('🔧 Script cargado. Ejecuta fixEmptyStateForFelipe() para resolver el problema.');
    // No ejecutar automáticamente para evitar cambios no deseados
}

// Exportar funciones
if (typeof module !== 'undefined') {
    module.exports = { 
        completePendingTask, 
        verifyEmptyState, 
        fixEmptyStateForFelipe 
    };
}
