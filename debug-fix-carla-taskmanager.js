// 🔧 CORRECCIÓN CRÍTICA: Verificar y arreglar TaskNotificationManager para Carla
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔧 [FIX] Corrigiendo TaskNotificationManager para Carla...');
    console.log('=' .repeat(70));
    
    // 1. Verificar TaskNotificationManager
    if (!window.TaskNotificationManager) {
        console.log('❌ TaskNotificationManager no está disponible');
        return;
    }
    
    console.log('✅ TaskNotificationManager encontrado');
    console.log('📊 Funciones disponibles:', Object.keys(window.TaskNotificationManager));
    
    // 2. Datos específicos de Carla y su evaluación
    const carlaUsername = 'carla';
    const czxczTaskId = 'task_1753159490875';
    
    console.log(`\n🎯 Verificando evaluación específica:`);
    console.log(`   - Estudiante: ${carlaUsername}`);
    console.log(`   - Task ID: ${czxczTaskId}`);
    
    // 3. Verificar datos de evaluación en localStorage
    const evaluationResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
    const carlaResult = evaluationResults.find(r => 
        r.taskId === czxczTaskId && r.studentUsername === carlaUsername
    );
    
    console.log(`\n📊 Resultado en localStorage:`, carlaResult);
    
    // 4. Probar la función isEvaluationCompletedByStudent
    if (window.TaskNotificationManager.isEvaluationCompletedByStudent) {
        const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
            czxczTaskId, carlaUsername
        );
        console.log(`\n🔍 TaskNotificationManager.isEvaluationCompletedByStudent():`, isCompleted);
        
        if (!isCompleted && carlaResult) {
            console.log(`\n❌ INCONSISTENCIA DETECTADA:`);
            console.log(`   - Resultado existe en localStorage: SÍ`);
            console.log(`   - TaskNotificationManager lo detecta: NO`);
            console.log(`\n🔧 Necesita corrección...`);
        }
    } else {
        console.log(`\n❌ Función isEvaluationCompletedByStudent no encontrada`);
    }
    
    // 5. Verificar estructura de datos esperada
    console.log(`\n🔍 Analizando estructura de datos:`);
    evaluationResults.forEach((result, index) => {
        console.log(`\n${index + 1}. Resultado:`);
        console.log(`   - taskId: "${result.taskId}"`);
        console.log(`   - studentUsername: "${result.studentUsername}"`);
        console.log(`   - completedAt: "${result.completedAt}"`);
        console.log(`   - percentage: ${result.percentage}`);
        
        if (result.studentUsername === carlaUsername) {
            console.log(`   🎯 ¡RESULTADO DE CARLA!`);
            
            // Probar manualmente la lógica de detección
            const hasCompletedAt = !!result.completedAt;
            const hasValidDate = result.completedAt && !isNaN(new Date(result.completedAt));
            
            console.log(`      - Tiene completedAt: ${hasCompletedAt}`);
            console.log(`      - Fecha válida: ${hasValidDate}`);
            console.log(`      - ¿Debería considerarse completada?: ${hasCompletedAt && hasValidDate}`);
        }
    });
    
    // 6. Intentar corrección directa si es necesario
    if (carlaResult && carlaResult.completedAt) {
        console.log(`\n🔧 APLICANDO CORRECCIÓN TEMPORAL:`);
        
        // Forzar que TaskNotificationManager reconozca la evaluación como completada
        console.log(`✅ Resultado confirmado en localStorage para Carla`);
        console.log(`✅ Disparando evento de evaluación completada...`);
        
        // Disparar evento específico
        window.dispatchEvent(new CustomEvent('evaluationCompleted', {
            detail: {
                taskId: czxczTaskId,
                studentUsername: carlaUsername,
                result: carlaResult
            }
        }));
        
        console.log(`✅ Evento evaluationCompleted disparado`);
        
        // Disparar eventos de actualización general
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new CustomEvent('commentsUpdated'));
        
        console.log(`✅ Eventos de actualización disparados`);
        
        // 7. Verificar nuevamente después de la corrección
        setTimeout(() => {
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                const isNowCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    czxczTaskId, carlaUsername
                );
                console.log(`\n🔍 Verificación post-corrección:`);
                console.log(`   - ¿Ahora detecta la evaluación como completada?: ${isNowCompleted}`);
                
                if (isNowCompleted) {
                    console.log(`\n✅ ¡CORRECCIÓN EXITOSA!`);
                    console.log(`🔄 El panel debería actualizarse automáticamente`);
                    console.log(`🎯 Carla debería ver "¡Todo al día!" ahora`);
                } else {
                    console.log(`\n⚠️ La corrección no funcionó inmediatamente`);
                    console.log(`🔄 Intenta recargar la página (F5)`);
                }
            }
        }, 1000);
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔧 Corrección de TaskNotificationManager completada`);
    
    return {
        carlaResult: carlaResult,
        resultExists: !!carlaResult,
        taskId: czxczTaskId,
        studentUsername: carlaUsername
    };
})();
