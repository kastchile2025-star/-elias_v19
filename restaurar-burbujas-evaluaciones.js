// Script específico para restaurar burbujas moradas de evaluaciones
console.log('🟣 RESTAURANDO BURBUJAS MORADAS DE EVALUACIONES...\n');

function restaurarEvaluacionN1() {
    console.log('📊 Restaurando evaluación N1 de Ciencias Naturales...');
    
    try {
        // Cargar datos actuales
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const grades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
        
        console.log(`📋 Evaluaciones: ${evaluations.length}`);
        console.log(`📝 Tareas: ${tasks.length}`);
        console.log(`📊 Calificaciones: ${grades.length}`);
        
        // Buscar evaluación de Ciencias Naturales
        const evaluacionCiencias = evaluations.find(eval => 
            eval.subject === 'Ciencias Naturales' || 
            eval.subjectName === 'Ciencias Naturales'
        );
        
        if (evaluacionCiencias) {
            console.log(`✅ Encontrada evaluación: "${evaluacionCiencias.title}"`);
            console.log(`   Tipo actual: ${evaluacionCiencias.taskType}`);
            console.log(`   Estado: ${evaluacionCiencias.status}`);
            console.log(`   Fecha: ${evaluacionCiencias.createdAt}`);
            
            // Asegurar que es tipo evaluación
            if (evaluacionCiencias.taskType !== 'evaluacion') {
                evaluacionCiencias.taskType = 'evaluacion';
                console.log('🔧 Corregido taskType a "evaluacion"');
            }
            
            // Asegurar estado activo
            if (!evaluacionCiencias.status || evaluacionCiencias.status === 'finished') {
                evaluacionCiencias.status = 'pending';
                console.log('🔧 Estado cambiado a "pending"');
            }
            
            // Asegurar que tiene fecha de creación temprana (para ser N1)
            if (!evaluacionCiencias.createdAt) {
                // Fecha temprana para que sea N1
                evaluacionCiencias.createdAt = new Date('2025-08-15T10:00:00Z').toISOString();
                console.log('🔧 Fecha de creación asignada (temprana para N1)');
            }
            
        } else {
            console.log('⚠️ No se encontró evaluación de Ciencias Naturales');
            console.log('🔧 Creando evaluación N1...');
            
            // Crear evaluación N1 de Ciencias Naturales
            const nuevaEvaluacion = {
                id: `eval-ciencias-n1-${Date.now()}`,
                title: 'Evaluación N1 - Ciencias Naturales',
                description: 'Primera evaluación del semestre',
                subject: 'Ciencias Naturales',
                subjectName: 'Ciencias Naturales',
                taskType: 'evaluacion',
                status: 'pending',
                createdAt: new Date('2025-08-15T10:00:00Z').toISOString(),
                dueDate: new Date('2025-08-30T23:59:59Z').toISOString(),
                assignedTo: 'course',
                courseId: 'curso-4', // 4to Básico
                sectionId: 'seccion-4A', // Sección A
                assignedById: 'teacher-1',
                assignedByName: 'Profesor',
                priority: 'medium',
                questions: [],
                timeLimit: 60
            };
            
            evaluations.unshift(nuevaEvaluacion); // Agregar al inicio para ser N1
            console.log('✅ Evaluación N1 creada');
        }
        
        // Verificar conflictos con pruebas
        const pruebasCiencias = tasks.filter(task => 
            (task.subject === 'Ciencias Naturales' || task.subjectName === 'Ciencias Naturales') &&
            task.taskType === 'prueba'
        );
        
        if (pruebasCiencias.length > 0) {
            console.log(`⚠️ Encontradas ${pruebasCiencias.length} pruebas de Ciencias Naturales que podrían conflictar:`);
            pruebasCiencias.forEach((prueba, index) => {
                console.log(`   [${index + 1}] "${prueba.title}" - ${prueba.createdAt}`);
                
                // Ajustar fecha para que las pruebas vengan después de las evaluaciones
                if (prueba.createdAt <= new Date('2025-08-15T10:00:00Z').toISOString()) {
                    prueba.createdAt = new Date('2025-08-16T10:00:00Z').toISOString();
                    console.log(`   🔧 Fecha ajustada para que venga después de evaluaciones`);
                }
            });
        }
        
        // Verificar y corregir orden cronológico
        console.log('\n📅 Verificando orden cronológico...');
        
        // Todas las evaluaciones de Ciencias Naturales
        const todasEvaluacionesCiencias = [
            ...evaluations.filter(e => e.subject === 'Ciencias Naturales' || e.subjectName === 'Ciencias Naturales'),
            ...tasks.filter(t => (t.subject === 'Ciencias Naturales' || t.subjectName === 'Ciencias Naturales') && t.taskType === 'evaluacion')
        ].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
        console.log('📊 Evaluaciones de Ciencias Naturales en orden:');
        todasEvaluacionesCiencias.forEach((eval, index) => {
            console.log(`   N${index + 1}: "${eval.title}" - ${eval.createdAt} (${eval.taskType})`);
        });
        
        // Guardar cambios
        localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
        localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
        
        // Disparar eventos para actualizar la UI
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'smart-student-evaluations',
            newValue: JSON.stringify(evaluations)
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'smart-student-tasks',
            newValue: JSON.stringify(tasks)
        }));
        
        console.log('\n💾 Cambios guardados');
        console.log('✅ Evaluación N1 de Ciencias Naturales restaurada');
        
    } catch (error) {
        console.error('❌ Error restaurando evaluación N1:', error);
    }
}

function verificarBurbujasMoradas() {
    console.log('\n🔍 Verificando burbujas moradas en calificaciones...');
    
    try {
        // Simular la lógica que usa la página de calificaciones para mostrar burbujas
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        
        // Combinar y filtrar evaluaciones activas
        const todasLasTareas = [
            ...tasks.map(t => ({ ...t, source: 'tasks' })),
            ...evaluations.map(e => ({ ...e, source: 'evaluations' }))
        ];
        
        // Filtrar por estado activo
        const tareasActivas = todasLasTareas.filter(task => {
            const status = String(task.status || '').toLowerCase();
            return ['pending', 'active', 'submitted', 'reviewed', 'delivered'].includes(status);
        });
        
        console.log(`📊 Tareas activas: ${tareasActivas.length}`);
        
        // Agrupar por materia
        const porMateria = {};
        tareasActivas.forEach(task => {
            const materia = task.subject || task.subjectName || 'General';
            if (!porMateria[materia]) porMateria[materia] = [];
            porMateria[materia].push(task);
        });
        
        console.log('\n📋 Tareas por materia:');
        Object.entries(porMateria).forEach(([materia, tareas]) => {
            console.log(`\n📚 ${materia}: ${tareas.length} tareas`);
            
            // Ordenar por fecha de creación
            tareas.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            
            tareas.forEach((tarea, index) => {
                const tipo = tarea.taskType;
                const emoji = tipo === 'evaluacion' ? '🟣' : tipo === 'prueba' ? '🔵' : '🟠';
                console.log(`   N${index + 1} ${emoji} ${tarea.title} (${tipo}) - ${tarea.createdAt}`);
            });
        });
        
        // Verificar específicamente Ciencias Naturales N1
        const cienciasNaturales = porMateria['Ciencias Naturales'] || [];
        if (cienciasNaturales.length > 0) {
            const n1 = cienciasNaturales[0];
            console.log(`\n🔬 Ciencias Naturales N1:`);
            console.log(`   📋 Título: ${n1.title}`);
            console.log(`   🏷️ Tipo: ${n1.taskType}`);
            console.log(`   🟣 ¿Es evaluación?: ${n1.taskType === 'evaluacion' ? 'SÍ' : 'NO'}`);
            console.log(`   📅 Fecha: ${n1.createdAt}`);
            console.log(`   📊 Estado: ${n1.status}`);
            
            if (n1.taskType === 'evaluacion') {
                console.log('✅ La burbuja morada debería aparecer');
            } else {
                console.log('❌ La burbuja NO será morada (no es evaluación)');
            }
        } else {
            console.log('\n⚠️ No se encontraron tareas de Ciencias Naturales');
        }
        
    } catch (error) {
        console.error('❌ Error verificando burbujas:', error);
    }
}

function limpiarConflictos() {
    console.log('\n🧹 Limpiando posibles conflictos...');
    
    try {
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        
        // Buscar tareas duplicadas o conflictivas
        const duplicados = [];
        const vistos = new Set();
        
        tasks.forEach((task, index) => {
            const clave = `${task.title}-${task.subject}-${task.taskType}`;
            if (vistos.has(clave)) {
                duplicados.push({ index, task });
            } else {
                vistos.add(clave);
            }
        });
        
        if (duplicados.length > 0) {
            console.log(`⚠️ Encontrados ${duplicados.length} posibles duplicados:`);
            duplicados.forEach(({ index, task }) => {
                console.log(`   [${index}] "${task.title}" (${task.taskType}) - ${task.subject}`);
            });
            
            // Preguntar si eliminar duplicados (en entorno real)
            console.log('💡 Los duplicados se mantienen para revisión manual');
        } else {
            console.log('✅ No se encontraron duplicados');
        }
        
    } catch (error) {
        console.error('❌ Error limpiando conflictos:', error);
    }
}

// Ejecutar funciones
restaurarEvaluacionN1();
verificarBurbujasMoradas();
limpiarConflictos();

console.log('\n✅ RESTAURACIÓN DE BURBUJAS MORADAS COMPLETADA');
console.log('🔄 Recarga la página de calificaciones para ver las burbujas moradas');

// Función para ejecutar manualmente
window.restaurarBurbujas = function() {
    restaurarEvaluacionN1();
    verificarBurbujasMoradas();
    limpiarConflictos();
};
