// Script de mantenimiento para evaluaciones completadas
console.log('🔧 MANTENIMIENTO: Asegurando que las evaluaciones completadas mantengan sus burbujas...\n');

function mantenerBurbujasEvaluaciones() {
    console.log('🟣 Aplicando lógica de mantenimiento para burbujas de evaluaciones...');
    
    try {
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        
        let cambiosRealizados = 0;
        
        // 1. Procesar evaluations
        evaluations.forEach(eval => {
            let cambio = false;
            
            // Asegurar que las evaluaciones completadas tengan estado 'reviewed'
            if (eval.taskType === 'evaluacion' && eval.status === 'finished') {
                eval.status = 'reviewed';
                cambio = true;
                console.log(`🔧 ${eval.title}: finished → reviewed`);
            }
            
            // Asegurar que las evaluaciones mantengan su tipo
            if (eval.title && eval.title.toLowerCase().includes('evaluaci') && eval.taskType !== 'evaluacion') {
                eval.taskType = 'evaluacion';
                cambio = true;
                console.log(`🔧 ${eval.title}: tipo corregido a evaluacion`);
            }
            
            if (cambio) cambiosRealizados++;
        });
        
        // 2. Procesar tasks
        tasks.forEach(task => {
            let cambio = false;
            
            // Asegurar que las evaluaciones completadas tengan estado 'reviewed'
            if (task.taskType === 'evaluacion' && task.status === 'finished') {
                task.status = 'reviewed';
                cambio = true;
                console.log(`🔧 ${task.title}: finished → reviewed`);
            }
            
            // Asegurar que las evaluaciones mantengan su tipo
            if (task.title && task.title.toLowerCase().includes('evaluaci') && task.taskType !== 'evaluacion') {
                task.taskType = 'evaluacion';
                cambio = true;
                console.log(`🔧 ${task.title}: tipo corregido a evaluacion`);
            }
            
            if (cambio) cambiosRealizados++;
        });
        
        // 3. Guardar cambios si es necesario
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
            localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
            
            // Disparar eventos
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-evaluations',
                newValue: JSON.stringify(evaluations)
            }));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-tasks',
                newValue: JSON.stringify(tasks)
            }));
            
            console.log(`✅ ${cambiosRealizados} evaluaciones corregidas`);
        } else {
            console.log('ℹ️ No se necesitaron correcciones');
        }
        
        // 4. Mostrar estado actual de evaluaciones por materia
        console.log('\n📊 Estado actual de evaluaciones:');
        
        const todasEvaluaciones = [
            ...evaluations.filter(e => e.taskType === 'evaluacion'),
            ...tasks.filter(t => t.taskType === 'evaluacion')
        ].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
        const porMateria = {};
        todasEvaluaciones.forEach(eval => {
            const materia = eval.subject || eval.subjectName || 'Sin materia';
            if (!porMateria[materia]) porMateria[materia] = [];
            porMateria[materia].push(eval);
        });
        
        Object.entries(porMateria).forEach(([materia, evals]) => {
            console.log(`\n📚 ${materia}:`);
            evals.forEach((eval, index) => {
                const tieneBurbuja = ['pending', 'submitted', 'reviewed', 'delivered', 'active'].includes(eval.status);
                const estado = tieneBurbuja ? '🟣 VISIBLE' : '❌ OCULTA';
                console.log(`   N${index + 1}: "${eval.title}" (${eval.status}) ${estado}`);
            });
        });
        
    } catch (error) {
        console.error('❌ Error en mantenimiento:', error);
    }
}

function configurarEventosMantenimiento() {
    console.log('\n⚙️ Configurando eventos de mantenimiento automático...');
    
    // Escuchar cuando se actualicen las evaluaciones
    window.addEventListener('storage', function(e) {
        if (e.key === 'smart-student-evaluation-results' || 
            e.key === 'smart-student-tasks' || 
            e.key === 'smart-student-evaluations') {
            
            // Aplicar mantenimiento después de cambios
            setTimeout(() => {
                console.log('🔧 Ejecutando mantenimiento automático...');
                mantenerBurbujasEvaluaciones();
            }, 1000);
        }
    });
    
    // Función global para ejecutar mantenimiento
    window.mantenerEvaluaciones = mantenerBurbujasEvaluaciones;
    
    console.log('✅ Sistema de mantenimiento configurado');
    console.log('💡 Usa mantenerEvaluaciones() para ejecutar manualmente');
}

function crearEvaluacionesEjemplo() {
    console.log('\n📝 Creando evaluaciones de ejemplo si no existen...');
    
    try {
        const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
        const materias = [
            'Lenguaje y Comunicación',
            'Ciencias Naturales',
            'Matemáticas',
            'Historia, Geografía y Ciencias Sociales'
        ];
        
        let creadas = 0;
        
        materias.forEach((materia, index) => {
            const existe = evaluations.find(eval => 
                eval.subject === materia || eval.subjectName === materia
            );
            
            if (!existe) {
                const nuevaEvaluacion = {
                    id: `eval-${materia.toLowerCase().replace(/\s+/g, '-')}-n1-${Date.now()}`,
                    title: `Evaluación N1 - ${materia}`,
                    description: `Primera evaluación del semestre de ${materia}`,
                    subject: materia,
                    subjectName: materia,
                    taskType: 'evaluacion',
                    status: 'reviewed', // Estado que mantiene la burbuja visible
                    createdAt: new Date(`2025-08-${15 + index}T10:00:00Z`).toISOString(),
                    dueDate: new Date(`2025-08-${25 + index}T23:59:59Z`).toISOString(),
                    assignedTo: 'course',
                    courseId: 'curso-4',
                    sectionId: 'seccion-4A',
                    assignedById: 'teacher-1',
                    assignedByName: 'Profesor',
                    priority: 'medium',
                    questions: [],
                    timeLimit: 60
                };
                
                evaluations.push(nuevaEvaluacion);
                creadas++;
                console.log(`✅ Creada: ${nuevaEvaluacion.title}`);
            }
        });
        
        if (creadas > 0) {
            localStorage.setItem('smart-student-evaluations', JSON.stringify(evaluations));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-evaluations',
                newValue: JSON.stringify(evaluations)
            }));
            
            console.log(`💾 ${creadas} evaluaciones creadas`);
        } else {
            console.log('ℹ️ Todas las evaluaciones ya existen');
        }
        
    } catch (error) {
        console.error('❌ Error creando evaluaciones:', error);
    }
}

// Ejecutar funciones
mantenerBurbujasEvaluaciones();
configurarEventosMantenimiento();
crearEvaluacionesEjemplo();

console.log('\n✅ SISTEMA DE MANTENIMIENTO ACTIVADO');
console.log('🟣 Las burbujas de evaluaciones completadas se mantendrán visibles');
console.log('🔄 Recarga la página de calificaciones para ver los cambios');

// Función de verificación rápida
window.verificarBurbujas = function() {
    console.log('\n🔍 VERIFICACIÓN RÁPIDA:');
    
    const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const todasEvaluaciones = [
        ...evaluations.filter(e => e.taskType === 'evaluacion'),
        ...tasks.filter(t => t.taskType === 'evaluacion')
    ];
    
    const lenguaje = todasEvaluaciones.find(e => 
        e.subject === 'Lenguaje y Comunicación' || e.subjectName === 'Lenguaje y Comunicación'
    );
    
    if (lenguaje) {
        const tieneBurbuja = ['pending', 'submitted', 'reviewed', 'delivered', 'active'].includes(lenguaje.status);
        console.log(`🟣 Lenguaje N1: "${lenguaje.title}" (${lenguaje.status}) ${tieneBurbuja ? '✅ VISIBLE' : '❌ OCULTA'}`);
    } else {
        console.log('❌ No se encontró evaluación de Lenguaje y Comunicación');
    }
};
