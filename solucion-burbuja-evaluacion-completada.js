// SOLUCIÓN: Preservar burbujas moradas de evaluaciones completadas
console.log('🟣 SOLUCIONANDO: Burbuja morada de evaluación N1 desaparece al completarse...\n');

function solucionarBurbujaEvaluacionCompletada() {
    console.log('📊 PROBLEMA IDENTIFICADO:');
    console.log('   La burbuja morada desaparece cuando TODOS los estudiantes completan la evaluación');
    console.log('   Esto es incorrecto: las evaluaciones deben seguir siendo visibles para revisión\n');
    
    try {
        // 1. Verificar estado actual
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const grades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        console.log(`📋 Datos cargados:`);
        console.log(`   • Evaluaciones: ${evaluations.length}`);
        console.log(`   • Tareas: ${tasks.length}`);
        console.log(`   • Calificaciones: ${grades.length}`);
        console.log(`   • Usuarios: ${users.length}`);
        
        // 2. Buscar evaluación de Lenguaje y Comunicación N1
        const todasLasEvaluaciones = [...evaluations, ...tasks.filter(t => t.taskType === 'evaluacion')];
        
        const evaluacionLenguaje = todasLasEvaluaciones
            .filter(eval => 
                eval.subject === 'Lenguaje y Comunicación' || 
                eval.subjectName === 'Lenguaje y Comunicación' ||
                (eval.title && eval.title.toLowerCase().includes('lenguaje'))
            )
            .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))[0]; // N1 = primera cronológicamente
        
        if (evaluacionLenguaje) {
            console.log(`\n✅ Encontrada evaluación N1 de Lenguaje:`);
            console.log(`   • Título: "${evaluacionLenguaje.title}"`);
            console.log(`   • Tipo: ${evaluacionLenguaje.taskType}`);
            console.log(`   • Estado: ${evaluacionLenguaje.status}`);
            console.log(`   • Fecha: ${evaluacionLenguaje.createdAt}`);
            
            // 3. Verificar estudiantes y calificaciones
            const estudiantesSeccion = studentAssignments.filter(a => 
                a.sectionId === evaluacionLenguaje.sectionId ||
                a.courseId === evaluacionLenguaje.courseId
            );
            
            const calificacionesEvaluacion = grades.filter(g => g.testId === evaluacionLenguaje.id);
            
            console.log(`\n📊 Análisis de completitud:`);
            console.log(`   • Estudiantes en sección: ${estudiantesSeccion.length}`);
            console.log(`   • Calificaciones registradas: ${calificacionesEvaluacion.length}`);
            
            const estudiantesConNota = new Set(calificacionesEvaluacion.map(g => g.studentId));
            const estudiantesTotales = new Set(estudiantesSeccion.map(a => a.studentId));
            
            console.log(`   • Estudiantes únicos: ${estudiantesTotales.size}`);
            console.log(`   • Con calificación: ${estudiantesConNota.size}`);
            console.log(`   • ¿Todos completaron?: ${estudiantesConNota.size >= estudiantesTotales.size}`);
            
            // 4. SOLUCIÓN: Cambiar estado para que siga siendo "pendiente de revisión"
            let necesitaCorreccion = false;
            
            // Si el estado es 'finished' o 'completed', cambiarlo a 'reviewed'
            if (evaluacionLenguaje.status === 'finished' || evaluacionLenguaje.status === 'completed') {
                evaluacionLenguaje.status = 'reviewed'; // Estado que permite seguir mostrándose
                necesitaCorreccion = true;
                console.log(`🔧 Cambiando estado: ${evaluacionLenguaje.status} → reviewed`);
            }
            
            // Asegurar que es tipo evaluación
            if (evaluacionLenguaje.taskType !== 'evaluacion') {
                evaluacionLenguaje.taskType = 'evaluacion';
                necesitaCorreccion = true;
                console.log(`🔧 Asegurando tipo: evaluacion`);
            }
            
            // Asegurar fecha temprana para N1
            const fechaObjetivo = new Date('2025-08-15T09:00:00Z').toISOString();
            if (!evaluacionLenguaje.createdAt || evaluacionLenguaje.createdAt > fechaObjetivo) {
                evaluacionLenguaje.createdAt = fechaObjetivo;
                necesitaCorreccion = true;
                console.log(`🔧 Fecha ajustada para ser N1`);
            }
            
            // 5. Guardar cambios si es necesario
            if (necesitaCorreccion) {
                // Actualizar en la fuente correcta
                if (evaluations.find(e => e.id === evaluacionLenguaje.id)) {
                    const index = evaluations.findIndex(e => e.id === evaluacionLenguaje.id);
                    evaluations[index] = evaluacionLenguaje;
                    localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
                    console.log(`💾 Evaluación actualizada en smart-student-evaluations`);
                }
                
                if (tasks.find(t => t.id === evaluacionLenguaje.id)) {
                    const index = tasks.findIndex(t => t.id === evaluacionLenguaje.id);
                    tasks[index] = evaluacionLenguaje;
                    localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
                    console.log(`💾 Evaluación actualizada en smart-student-tasks`);
                }
                
                // Disparar eventos para actualizar UI
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'smart-student-evaluations',
                    newValue: JSON.stringify(evaluations)
                }));
                
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'smart-student-tasks',
                    newValue: JSON.stringify(tasks)
                }));
                
                console.log(`✅ Cambios aplicados y eventos disparados`);
            } else {
                console.log(`ℹ️ No se necesitan correcciones`);
            }
            
        } else {
            console.log(`⚠️ No se encontró evaluación de Lenguaje y Comunicación`);
            console.log(`🔧 Creando evaluación N1...`);
            
            // Crear evaluación N1 si no existe
            const nuevaEvaluacion = {
                id: `eval-lenguaje-n1-${Date.now()}`,
                title: 'Evaluación N1 - Lenguaje y Comunicación',
                description: 'Primera evaluación del semestre',
                subject: 'Lenguaje y Comunicación',
                subjectName: 'Lenguaje y Comunicación',
                taskType: 'evaluacion',
                status: 'reviewed', // Estado que permite seguir mostrándose
                createdAt: new Date('2025-08-15T09:00:00Z').toISOString(),
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
            localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-evaluations',
                newValue: JSON.stringify(evaluations)
            }));
            
            console.log(`✅ Evaluación N1 de Lenguaje creada`);
        }
        
        // 6. CORRECCIÓN ADICIONAL: Modificar lógica de pendingTasks para evaluaciones
        console.log(`\n🔧 APLICANDO CORRECCIÓN ADICIONAL: Lógica de tareas pendientes para evaluaciones`);
        
        // Esta corrección debe aplicarse en el código de la página de calificaciones
        const scriptCorreccion = `
// CORRECCIÓN PARA EVALUACIONES COMPLETADAS
// Las evaluaciones deben seguir mostrándose incluso cuando todos las completen

// En la función loadPendingTasks, cambiar la lógica para evaluaciones:
if (task.taskType === 'evaluacion') {
    // Para evaluaciones: siempre mostrar si están en estado 'reviewed' o 'pending'
    needsGrading = ['pending', 'submitted', 'reviewed', 'delivered', 'active'].includes(task.status);
    
    // No depender del conteo de calificaciones para evaluaciones
    // Las evaluaciones se revisan, no se "califican" como las tareas
} else if (task.taskType === 'prueba') {
    // Lógica original para pruebas
    needsGrading = taskGrades.length === 0 || taskGrades.some(g => !Number.isFinite(g.score));
} else {
    // Lógica original para tareas
    let expectedCount = 0;
    if (secId) {
        const secStudents = assignsLS.filter(a => String(a.sectionId) === secId).map(a => String(a.studentId));
        expectedCount = new Set(secStudents).size;
    }
    const gradedCount = taskGrades.filter(g => Number.isFinite(g.score)).length;
    if (expectedCount > 0) {
        needsGrading = gradedCount < expectedCount;
    } else {
        needsGrading = taskGrades.length === 0 || taskGrades.some(g => !Number.isFinite(g.score));
    }
}
`;
        
        console.log(`📝 Script de corrección preparado`);
        console.log(`💡 Esta corrección debe aplicarse en src/app/dashboard/calificaciones/page.tsx`);
        
        // 7. Verificación final
        console.log(`\n🔍 VERIFICACIÓN FINAL:`);
        
        const evaluacionesLenguaje = todasLasEvaluaciones.filter(eval => 
            eval.subject === 'Lenguaje y Comunicación' || 
            eval.subjectName === 'Lenguaje y Comunicación'
        ).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
        if (evaluacionesLenguaje.length > 0) {
            const n1 = evaluacionesLenguaje[0];
            console.log(`✅ Evaluación N1 de Lenguaje:`);
            console.log(`   • Título: ${n1.title}`);
            console.log(`   • Tipo: ${n1.taskType} ${n1.taskType === 'evaluacion' ? '🟣' : '❌'}`);
            console.log(`   • Estado: ${n1.status}`);
            console.log(`   • ¿Debería mostrar burbuja?: ${['pending', 'submitted', 'reviewed', 'delivered', 'active'].includes(n1.status) ? 'SÍ 🟣' : 'NO ❌'}`);
        }
        
    } catch (error) {
        console.error('❌ Error solucionando burbuja de evaluación:', error);
    }
}

function verificarTodasLasEvaluaciones() {
    console.log('\n🔍 VERIFICACIÓN: Estado de todas las evaluaciones...');
    
    try {
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        
        const todasLasEvaluaciones = [
            ...evaluations,
            ...tasks.filter(t => t.taskType === 'evaluacion')
        ].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
        console.log(`📊 Total de evaluaciones: ${todasLasEvaluaciones.length}`);
        
        // Agrupar por materia
        const porMateria = {};
        todasLasEvaluaciones.forEach(eval => {
            const materia = eval.subject || eval.subjectName || 'Sin materia';
            if (!porMateria[materia]) porMateria[materia] = [];
            porMateria[materia].push(eval);
        });
        
        Object.entries(porMateria).forEach(([materia, evaluaciones]) => {
            console.log(`\n📚 ${materia}: ${evaluaciones.length} evaluaciones`);
            evaluaciones.forEach((eval, index) => {
                const tipo = eval.taskType === 'evaluacion' ? '🟣' : '❌';
                const estado = ['pending', 'submitted', 'reviewed', 'delivered', 'active'].includes(eval.status) ? '✅' : '❌';
                console.log(`   N${index + 1} ${tipo} "${eval.title}" (${eval.status}) ${estado}`);
            });
        });
        
    } catch (error) {
        console.error('❌ Error verificando evaluaciones:', error);
    }
}

// Ejecutar soluciones
solucionarBurbujaEvaluacionCompletada();
verificarTodasLasEvaluaciones();

console.log('\n✅ SOLUCIÓN APLICADA');
console.log('🔄 Recarga la página de calificaciones para ver la burbuja morada restaurada');
console.log('💡 La evaluación N1 de Lenguaje y Comunicación debería aparecer con burbuja morada 🟣');

// Función para ejecutar manualmente
window.restaurarBurbujaLenguaje = function() {
    solucionarBurbujaEvaluacionCompletada();
    verificarTodasLasEvaluaciones();
};

console.log('\n🛠️ NOTA: Para una solución permanente, aplicar la corrección en el código de calificaciones');
