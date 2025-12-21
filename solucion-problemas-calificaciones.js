// Solución para los problemas de calificaciones
// 1. Sincronizar notas reales de pruebas (80 y 55) que están en vista "revisar"
// 2. Restaurar burbujas moradas de evaluaciones que desaparecieron al crear pruebas

console.log('🔧 SOLUCIONANDO PROBLEMAS DE CALIFICACIONES...\n');

// PROBLEMA 1: Sincronizar notas reales de pruebas desde vista "revisar"
function sincronizarNotasPruebas() {
    console.log('📊 PROBLEMA 1: Sincronizando notas reales de pruebas...');
    
    try {
        // Buscar todas las claves de pruebas en localStorage
        const testKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('smart-student-tests')) {
                testKeys.push(key);
            }
        }
        
        console.log(`🔍 Encontradas ${testKeys.length} claves de pruebas:`, testKeys);
        
        // Cargar todas las pruebas
        const allTests = [];
        testKeys.forEach(key => {
            try {
                const tests = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(tests)) {
                    allTests.push(...tests.map(t => ({ ...t, sourceKey: key })));
                }
            } catch (e) {
                console.warn(`⚠️ Error cargando ${key}:`, e);
            }
        });
        
        console.log(`📋 Total de pruebas encontradas: ${allTests.length}`);
        
        // Buscar pruebas con resultados/respuestas de estudiantes
        const pruebasConResultados = allTests.filter(test => {
            return test.responses || test.results || test.studentResponses || 
                   test.submissions || test.answers || test.evaluationResults;
        });
        
        console.log(`✅ Pruebas con resultados: ${pruebasConResultados.length}`);
        
        // Cargar calificaciones actuales
        const currentGrades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        
        let notasAgregadas = 0;
        let notasActualizadas = 0;
        
        pruebasConResultados.forEach(test => {
            console.log(`\n🔍 Analizando prueba: "${test.title}" (ID: ${test.id})`);
            
            // Buscar diferentes formatos de resultados
            const resultSources = [
                test.responses,
                test.results, 
                test.studentResponses,
                test.submissions,
                test.answers,
                test.evaluationResults
            ].filter(Boolean);
            
            resultSources.forEach((results, idx) => {
                console.log(`  📊 Fuente ${idx + 1}: ${Object.keys(results || {}).length} entradas`);
                
                if (typeof results === 'object' && results !== null) {
                    Object.entries(results).forEach(([studentKey, result]) => {
                        try {
                            // Buscar estudiante
                            const student = users.find(u => 
                                u.username === studentKey || 
                                u.id === studentKey ||
                                u.displayName === studentKey
                            );
                            
                            if (!student) {
                                console.log(`    ❌ Estudiante no encontrado: ${studentKey}`);
                                return;
                            }
                            
                            // Extraer nota/puntaje
                            let score = null;
                            if (typeof result === 'object' && result !== null) {
                                // Buscar diferentes campos de puntaje
                                score = result.score || result.points || result.grade || 
                                       result.percentage || result.finalScore || result.nota;
                                
                                // Si es un porcentaje sobre total de preguntas
                                if (result.correctAnswers && result.totalQuestions) {
                                    score = (result.correctAnswers / result.totalQuestions) * 100;
                                }
                            } else if (typeof result === 'number') {
                                score = result;
                            }
                            
                            if (score === null || isNaN(score)) {
                                console.log(`    ⚠️ No se pudo extraer nota para ${student.displayName || studentKey}`);
                                return;
                            }
                            
                            // Normalizar puntaje a 0-100
                            let normalizedScore = Number(score);
                            if (normalizedScore > 100) {
                                // Podría ser escala diferente
                                if (normalizedScore <= 1000) {
                                    normalizedScore = normalizedScore / 10; // 0-1000 → 0-100
                                }
                            }
                            normalizedScore = Math.min(100, Math.max(0, normalizedScore));
                            
                            console.log(`    ✅ ${student.displayName}: ${normalizedScore}%`);
                            
                            // Verificar si ya existe esta calificación
                            const existingGrade = currentGrades.find(g => 
                                g.testId === test.id && g.studentId === student.id
                            );
                            
                            const gradeData = {
                                id: `${test.id}-${student.id}`,
                                testId: test.id,
                                studentId: student.id,
                                studentName: student.displayName || student.name || student.username,
                                score: Math.round(normalizedScore * 100) / 100,
                                courseId: test.courseId || null,
                                sectionId: test.sectionId || null,
                                subjectId: test.subjectId || test.subjectName || null,
                                title: test.title,
                                gradedAt: Date.now()
                            };
                            
                            if (existingGrade) {
                                // Actualizar si la nota es diferente
                                if (Math.abs(existingGrade.score - normalizedScore) > 0.1) {
                                    Object.assign(existingGrade, gradeData);
                                    notasActualizadas++;
                                    console.log(`    🔄 Actualizada: ${existingGrade.score}% → ${normalizedScore}%`);
                                }
                            } else {
                                // Agregar nueva calificación
                                currentGrades.push(gradeData);
                                notasAgregadas++;
                                console.log(`    ➕ Nueva calificación agregada: ${normalizedScore}%`);
                            }
                            
                        } catch (error) {
                            console.warn(`    ❌ Error procesando resultado de ${studentKey}:`, error);
                        }
                    });
                }
            });
        });
        
        // Guardar calificaciones actualizadas
        if (notasAgregadas > 0 || notasActualizadas > 0) {
            localStorage.setItem('smart-student-test-grades', JSON.stringify(currentGrades));
            console.log(`\n💾 Guardadas ${notasAgregadas} notas nuevas y ${notasActualizadas} actualizadas`);
            
            // Disparar evento de actualización
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-test-grades',
                newValue: JSON.stringify(currentGrades)
            }));
        } else {
            console.log('ℹ️ No se encontraron notas para sincronizar');
        }
        
    } catch (error) {
        console.error('❌ Error sincronizando notas de pruebas:', error);
    }
}

// PROBLEMA 2: Restaurar burbujas moradas de evaluaciones
function restaurarBurbujasEvaluaciones() {
    console.log('\n📊 PROBLEMA 2: Restaurando burbujas de evaluaciones...');
    
    try {
        // Cargar evaluaciones
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        
        console.log(`🔍 Evaluaciones encontradas: ${evaluations.length}`);
        console.log(`🔍 Tareas encontradas: ${tasks.length}`);
        
        // Buscar evaluaciones que podrían haber perdido su estado
        let evaluacionesRestauradas = 0;
        
        evaluations.forEach(eval => {
            console.log(`\n📋 Evaluación: "${eval.title}" (${eval.subject || 'Sin materia'})`);
            
            // Verificar estado de la evaluación
            if (eval.taskType !== 'evaluacion') {
                console.log(`  🔄 Corrigiendo taskType: ${eval.taskType} → evaluacion`);
                eval.taskType = 'evaluacion';
                evaluacionesRestauradas++;
            }
            
            // Asegurar que tiene los campos necesarios para mostrarse en calificaciones
            if (!eval.status) {
                eval.status = 'pending';
                console.log('  ✅ Status asignado: pending');
            }
            
            if (!eval.createdAt) {
                eval.createdAt = new Date().toISOString();
                console.log('  ✅ CreatedAt asignado');
            }
            
            // Buscar si existe una tarea equivalente que pueda estar interfiriendo
            const taskEquivalente = tasks.find(t => 
                t.title === eval.title && 
                t.subject === eval.subject &&
                t.taskType !== 'evaluacion'
            );
            
            if (taskEquivalente) {
                console.log(`  ⚠️ Encontrada tarea conflictiva: ${taskEquivalente.title} (${taskEquivalente.taskType})`);
                // Cambiar el tipo de la tarea conflictiva o marcarla como diferente
                if (taskEquivalente.taskType === 'prueba') {
                    console.log('  🔧 Renombrando prueba para evitar conflicto');
                    taskEquivalente.title = `${taskEquivalente.title} (Prueba)`;
                }
            }
        });
        
        // Verificar tareas que deberían ser evaluaciones
        tasks.forEach(task => {
            if (task.taskType === 'evaluacion' || 
                (task.title && task.title.toLowerCase().includes('evaluaci'))) {
                
                if (task.taskType !== 'evaluacion') {
                    console.log(`🔄 Tarea convertida a evaluación: ${task.title}`);
                    task.taskType = 'evaluacion';
                    evaluacionesRestauradas++;
                }
            }
        });
        
        // Guardar cambios
        if (evaluacionesRestauradas > 0) {
            localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
            localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
            
            console.log(`\n💾 Restauradas ${evaluacionesRestauradas} evaluaciones`);
            
            // Disparar eventos de actualización
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-evaluations',
                newValue: JSON.stringify(evaluations)
            }));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-tasks', 
                newValue: JSON.stringify(tasks)
            }));
        } else {
            console.log('ℹ️ No se encontraron evaluaciones para restaurar');
        }
        
    } catch (error) {
        console.error('❌ Error restaurando burbujas de evaluaciones:', error);
    }
}

// FUNCIÓN ADICIONAL: Verificar estructura de datos
function verificarEstructuraDatos() {
    console.log('\n🔍 VERIFICACIÓN: Estado actual de datos...');
    
    try {
        const grades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        
        console.log(`📊 Calificaciones totales: ${grades.length}`);
        console.log(`📋 Evaluaciones: ${evaluations.length}`);
        console.log(`📝 Tareas: ${tasks.length}`);
        
        // Mostrar algunas calificaciones de ejemplo
        console.log('\n📈 Últimas calificaciones:');
        grades.slice(-5).forEach(grade => {
            console.log(`  • ${grade.studentName}: ${grade.score}% en "${grade.title}"`);
        });
        
        // Mostrar evaluaciones por tipo
        console.log('\n📊 Evaluaciones por tipo:');
        const tiposEval = {};
        evaluations.forEach(eval => {
            const tipo = eval.taskType || 'sin_tipo';
            tiposEval[tipo] = (tiposEval[tipo] || 0) + 1;
        });
        Object.entries(tiposEval).forEach(([tipo, count]) => {
            console.log(`  • ${tipo}: ${count}`);
        });
        
        // Verificar burbujas N1 para Ciencias Naturales
        console.log('\n🔬 Verificando Ciencias Naturales N1:');
        const cienciasN1 = [...evaluations, ...tasks].filter(item => 
            (item.subject === 'Ciencias Naturales' || item.subjectName === 'Ciencias Naturales') &&
            item.taskType === 'evaluacion'
        ).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
        if (cienciasN1.length > 0) {
            console.log(`  ✅ Encontrada evaluación N1: "${cienciasN1[0].title}"`);
            console.log(`  📅 Creada: ${cienciasN1[0].createdAt}`);
            console.log(`  🏷️ Tipo: ${cienciasN1[0].taskType}`);
        } else {
            console.log('  ⚠️ No se encontró evaluación N1 de Ciencias Naturales');
        }
        
    } catch (error) {
        console.error('❌ Error verificando estructura:', error);
    }
}

// EJECUTAR SOLUCIONES
console.log('🚀 Ejecutando soluciones...\n');

// Solución 1: Sincronizar notas reales
sincronizarNotasPruebas();

// Solución 2: Restaurar burbujas de evaluaciones  
restaurarBurbujasEvaluaciones();

// Verificación final
verificarEstructuraDatos();

console.log('\n✅ SOLUCIÓN COMPLETADA');
console.log('🔄 Por favor, recarga la página de calificaciones para ver los cambios');

// Función para ejecutar manualmente si es necesario
window.solucionarCalificaciones = function() {
    sincronizarNotasPruebas();
    restaurarBurbujasEvaluaciones();
    verificarEstructuraDatos();
};

console.log('\n💡 TIP: Puedes ejecutar solucionarCalificaciones() en cualquier momento');
