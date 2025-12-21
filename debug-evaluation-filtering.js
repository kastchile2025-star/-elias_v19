// 🔍 SCRIPT ESPECÍFICO: Depurar filtrado de evaluaciones completadas
// Este script verifica por qué la evaluación "dfsdfds" no se está filtrando correctamente

function debugEvaluationFiltering() {
    console.log('🔍 [DEBUG] Verificando filtrado de evaluaciones completadas...');
    console.log('=' .repeat(60));
    
    // Obtener datos
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const storedEvaluationResults = localStorage.getItem('smart-student-evaluation-results');
    
    if (!storedTasks) {
        console.log('❌ No se encontraron tareas en localStorage');
        return;
    }
    
    const tasks = JSON.parse(storedTasks);
    const evaluationResults = storedEvaluationResults ? JSON.parse(storedEvaluationResults) : [];
    
    console.log(`📊 Total tareas: ${tasks.length}`);
    console.log(`📊 Total resultados de evaluación: ${evaluationResults.length}`);
    
    // Buscar la evaluación específica
    const targetTask = tasks.find(task => 
        task.title.toLowerCase().includes('dfsdfds') || 
        task.id === 'task_1753157246995'
    );
    
    if (!targetTask) {
        console.log('❌ No se encontró la tarea/evaluación "dfsdfds"');
        return;
    }
    
    console.log('\n🎯 TAREA ENCONTRADA:');
    console.log('📋 Título:', targetTask.title);
    console.log('🆔 ID:', targetTask.id);
    console.log('📝 Tipo:', targetTask.taskType);
    console.log('📚 Curso:', targetTask.course);
    console.log('📅 Vencimiento:', targetTask.dueDate);
    
    // Verificar detección como evaluación
    console.log('\n🔍 VERIFICACIÓN DE DETECCIÓN COMO EVALUACIÓN:');
    
    const isEvaluationByType = targetTask.taskType === 'evaluation';
    const isEvaluationByTitle = targetTask.title.toLowerCase().includes('eval');
    const isEvaluationByTitleEs = targetTask.title.toLowerCase().includes('evaluación');
    const isEvaluationByExam = targetTask.title.toLowerCase().includes('examen');
    
    console.log(`   ✓ Por taskType === 'evaluation': ${isEvaluationByType}`);
    console.log(`   ✓ Por título contiene 'eval': ${isEvaluationByTitle}`);
    console.log(`   ✓ Por título contiene 'evaluación': ${isEvaluationByTitleEs}`);
    console.log(`   ✓ Por título contiene 'examen': ${isEvaluationByExam}`);
    
    const isDetectedAsEvaluation = isEvaluationByType || isEvaluationByTitle || isEvaluationByTitleEs || isEvaluationByExam;
    console.log(`🎯 ¿Detectada como evaluación?: ${isDetectedAsEvaluation}`);
    
    // Verificar si está completada
    console.log('\n🏁 VERIFICACIÓN DE COMPLETITUD:');
    
    const felipeResults = evaluationResults.filter(result => 
        result.studentUsername === 'felipe' && result.taskId === targetTask.id
    );
    
    console.log(`📊 Resultados de Felipe para esta evaluación: ${felipeResults.length}`);
    
    if (felipeResults.length > 0) {
        felipeResults.forEach((result, index) => {
            console.log(`   ${index + 1}. Completado: ${result.completedAt}`);
            console.log(`      Porcentaje: ${result.percentage || 0}%`);
            console.log(`      Respuestas: ${result.answers ? result.answers.length : 0}`);
        });
        
        // Verificar usando TaskNotificationManager
        if (window.TaskNotificationManager && window.TaskNotificationManager.isEvaluationCompletedByStudent) {
            const isCompletedByManager = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                targetTask.id, 
                'felipe'
            );
            console.log(`🎯 TaskNotificationManager dice que está completada: ${isCompletedByManager}`);
        } else {
            console.log('❌ TaskNotificationManager no está disponible');
        }
    } else {
        console.log('❌ No se encontraron resultados de evaluación para Felipe');
    }
    
    // Simular el filtrado completo
    console.log('\n🔄 SIMULACIÓN DEL FILTRADO COMPLETO:');
    
    const user = { username: 'felipe', activeCourses: ['MATH101', 'PHYS201'] };
    const now = new Date();
    
    const isAssigned = targetTask.course && user.activeCourses.includes(targetTask.course);
    const dueDate = new Date(targetTask.dueDate);
    const isApproaching = dueDate > now;
    
    console.log(`   ✓ Asignada: ${isAssigned}`);
    console.log(`   ✓ No vencida: ${isApproaching}`);
    console.log(`   ✓ Es evaluación: ${isDetectedAsEvaluation}`);
    
    if (isDetectedAsEvaluation) {
        const isCompleted = felipeResults.length > 0;
        console.log(`   ✓ Completada: ${isCompleted}`);
        
        const shouldBeFiltered = isCompleted;
        console.log(`🎯 ¿Debería ser filtrada?: ${shouldBeFiltered}`);
        
        if (shouldBeFiltered) {
            console.log('✅ La evaluación DEBERÍA ser filtrada y NO aparecer en pendientes');
        } else {
            console.log('⏳ La evaluación NO debería ser filtrada y SÍ debe aparecer en pendientes');
        }
    } else {
        console.log('❌ No fue detectada como evaluación, se procesará como tarea normal');
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    if (!isDetectedAsEvaluation) {
        console.log('   🔧 La tarea no está siendo detectada como evaluación');
        console.log('   💡 Verificar que taskType sea "evaluation" o título contenga palabras clave');
    }
    
    if (isDetectedAsEvaluation && felipeResults.length > 0) {
        console.log('   ✅ La evaluación está completada y debería ser filtrada');
        console.log('   🔧 Si sigue apareciendo, verificar la lógica de filtrado en loadPendingTasks');
    }
    
    return {
        taskFound: !!targetTask,
        isDetectedAsEvaluation,
        hasResults: felipeResults.length > 0,
        shouldBeFiltered: isDetectedAsEvaluation && felipeResults.length > 0
    };
}

// Función para forzar la actualización del panel
function forceRefreshNotificationsPanel() {
    console.log('\n🔄 Forzando actualización del panel de notificaciones...');
    
    // Disparar eventos de actualización
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('commentsUpdated'));
    
    console.log('✅ Eventos disparados. El panel debería actualizarse.');
}

// Función principal
function debugAndFixEvaluationFiltering() {
    console.log('🚀 INICIANDO DEPURACIÓN DEL FILTRADO DE EVALUACIONES');
    console.log('=' .repeat(70));
    
    const result = debugEvaluationFiltering();
    
    console.log('\n🔄 Forzando actualización...');
    forceRefreshNotificationsPanel();
    
    console.log('\n📋 RESUMEN:');
    console.log(`   - Tarea encontrada: ${result.taskFound}`);
    console.log(`   - Detectada como evaluación: ${result.isDetectedAsEvaluation}`);
    console.log(`   - Tiene resultados: ${result.hasResults}`);
    console.log(`   - Debería ser filtrada: ${result.shouldBeFiltered}`);
    
    return result;
}

// Ejecutar automáticamente
if (typeof window !== 'undefined') {
    console.log('🔧 Script de depuración de evaluaciones cargado.');
    console.log('📞 Ejecuta debugAndFixEvaluationFiltering() para analizar el problema.');
}

// Exportar
if (typeof module !== 'undefined') {
    module.exports = { 
        debugEvaluationFiltering, 
        forceRefreshNotificationsPanel,
        debugAndFixEvaluationFiltering 
    };
}
