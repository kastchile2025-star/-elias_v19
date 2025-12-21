// 🔍 DEPURACIÓN DETALLADA: Analizar todas las tareas en localStorage
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔍 [DEBUG] Análisis detallado de tareas en localStorage...');
    console.log('=' .repeat(70));
    
    // Obtener datos del localStorage
    const storedTasks = localStorage.getItem('smart-student-tasks');
    
    if (!storedTasks) {
        console.log('❌ No hay tareas en localStorage');
        return;
    }
    
    const tasks = JSON.parse(storedTasks);
    console.log(`📊 Total de tareas encontradas: ${tasks.length}`);
    
    // Analizar TODAS las tareas
    tasks.forEach((task, index) => {
        console.log(`\n${index + 1}. "${task.title}" (ID: ${task.id})`);
        console.log(`   - Curso: "${task.course}"`);
        console.log(`   - Tipo: ${task.taskType}`);
        console.log(`   - Vencimiento: ${task.dueDate}`);
        console.log(`   - Descripción: "${task.description}"`);
        
        // Buscar "dfsdfds" específicamente
        if (task.title.toLowerCase().includes('dfsdfds') || 
            task.description?.toLowerCase().includes('dfsdfds') ||
            task.id.includes('dfsdfds')) {
            console.log(`   🎯 ¡ENCONTRADA LA EVALUACIÓN "dfsdfds"!`);
        }
        
        // Mostrar estructura completa de la tarea
        console.log(`   - Estructura completa:`, task);
    });
    
    // Buscar en resultados de evaluación
    console.log(`\n🔍 BUSCANDO EN RESULTADOS DE EVALUACIÓN:`);
    const storedEvaluationResults = localStorage.getItem('smart-student-evaluation-results');
    if (storedEvaluationResults) {
        const evaluationResults = JSON.parse(storedEvaluationResults);
        console.log(`📊 Total resultados de evaluación: ${evaluationResults.length}`);
        
        evaluationResults.forEach((result, index) => {
            console.log(`\n${index + 1}. Resultado evaluación:`);
            console.log(`   - Task ID: ${result.taskId}`);
            console.log(`   - Estudiante: ${result.studentUsername}`);
            console.log(`   - Completado: ${result.completedAt}`);
            console.log(`   - Porcentaje: ${result.percentage}%`);
            
            if (result.studentUsername === 'felipe') {
                console.log(`   🎯 ¡RESULTADO DE FELIPE!`);
            }
        });
    }
    
    // Buscar en comentarios
    console.log(`\n🔍 BUSCANDO EN COMENTARIOS:`);
    const storedComments = localStorage.getItem('smart-student-task-comments');
    if (storedComments) {
        const comments = JSON.parse(storedComments);
        console.log(`📊 Total comentarios: ${comments.length}`);
        
        comments.forEach((comment, index) => {
            console.log(`\n${index + 1}. Comentario:`);
            console.log(`   - Task ID: ${comment.taskId}`);
            console.log(`   - Estudiante: ${comment.studentUsername}`);
            console.log(`   - Contenido: "${comment.content}"`);
            console.log(`   - Es calificación: ${comment.isGrade}`);
            console.log(`   - Es entrega: ${comment.isSubmission}`);
            
            if (comment.studentUsername === 'felipe') {
                console.log(`   🎯 ¡COMENTARIO DE FELIPE!`);
            }
        });
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 Análisis detallado completado`);
    
    return {
        totalTasks: tasks.length,
        tasksData: tasks
    };
})();
