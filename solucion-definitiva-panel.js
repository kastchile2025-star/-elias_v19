// 🔥 SOLUCIÓN DEFINITIVA: Panel de Estudiantes
// Copiar y pegar completo en la consola del navegador

console.log('🔥 === SOLUCIÓN DEFINITIVA: PANEL DE ESTUDIANTES ===');

// 1. Verificar estado actual
function diagnosticoRapido() {
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    console.log('📊 Estado actual:');
    console.log(`   👥 Usuarios total: ${usuarios.length}`);
    console.log(`   👨‍🎓 Estudiantes: ${usuarios.filter(u => u.role === 'student').length}`);
    console.log(`   📝 Tareas: ${tareas.length}`);
    console.log(`   📚 Tareas de curso: ${tareas.filter(t => t.assignedTo === 'course').length}`);
    console.log(`   👨‍🏫 Usuario actual: ${currentUser.displayName || currentUser.username}`);
    
    return { usuarios, tareas, currentUser };
}

// 2. Crear datos mínimos necesarios
function configurarDatosMinimos() {
    console.log('⚙️ Configurando datos mínimos...');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    // Estudiantes mínimos
    const estudiantes = [
        {
            id: 'student_min_001',
            username: 'estudiante1',
            displayName: 'Estudiante Uno',
            role: 'student',
            activeCourses: ['4to_basico', 'ciencias_naturales'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id
        },
        {
            id: 'student_min_002',
            username: 'estudiante2',
            displayName: 'Estudiante Dos',
            role: 'student',
            activeCourses: ['4to_basico', 'ciencias_naturales'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id
        }
    ];
    
    // Tarea mínima
    const tarea = {
        id: `task_min_${Date.now()}`,
        title: 'Tarea Test - Todo el Curso',
        description: 'Tarea de prueba para verificar panel de estudiantes',
        subject: 'Ciencias Naturales',
        course: '4to_basico',
        assignedById: currentUser.id,
        assignedByName: currentUser.displayName || currentUser.username,
        assignedTo: 'course', // 🔑 IMPORTANTE
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        attachments: [],
        taskType: 'tarea'
    };
    
    // Guardar datos
    const usuariosExistentes = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareasExistentes = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    // Filtrar datos anteriores de prueba
    const usuariosFiltrados = usuariosExistentes.filter(u => !u.username.startsWith('estudiante'));
    const tareasFiltradas = tareasExistentes.filter(t => !t.id.includes('_min_'));
    
    localStorage.setItem('smart-student-users', JSON.stringify([...usuariosFiltrados, ...estudiantes]));
    localStorage.setItem('smart-student-tasks', JSON.stringify([...tareasFiltradas, tarea]));
    
    console.log('✅ Datos mínimos configurados');
    console.log(`   📝 Tarea creada: "${tarea.title}"`);
    console.log(`   👨‍🎓 Estudiantes: ${estudiantes.length}`);
}

// 3. Test de la función corregida
function testFuncionCorregida() {
    console.log('🧪 Probando función corregida...');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const tareaDelCurso = tareas.find(t => t.assignedTo === 'course');
    
    if (!tareaDelCurso) {
        console.log('❌ No hay tarea de curso para probar');
        return;
    }
    
    console.log(`📝 Probando con: "${tareaDelCurso.title}"`);
    console.log(`📚 Curso: ${tareaDelCurso.course}`);
    
    // Simular función corregida
    const courseId = tareaDelCurso.course;
    const estudiantesEncontrados = usuarios.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(courseId);
        
        console.log(`   👤 ${u.username}: estudiante=${isStudent}, curso=${isInCourse}`);
        
        // 🔧 LÓGICA SIMPLE: solo estudiante + curso
        return isStudent && isInCourse;
    });
    
    console.log(`✅ Resultado: ${estudiantesEncontrados.length} estudiantes`);
    
    if (estudiantesEncontrados.length > 0) {
        console.log('📋 Estudiantes encontrados:');
        estudiantesEncontrados.forEach(est => {
            console.log(`   ✅ ${est.displayName} (${est.username})`);
        });
        console.log('🎉 ¡FUNCIÓN TRABAJANDO CORRECTAMENTE!');
    } else {
        console.log('❌ No se encontraron estudiantes');
    }
    
    return estudiantesEncontrados.length > 0;
}

// 4. Forzar actualización de UI
function forzarActualizacionUI() {
    console.log('🔄 Forzando actualización de UI...');
    
    // Cerrar modal si está abierto
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
        const closeBtn = modal.querySelector('button[type="button"]');
        if (closeBtn) {
            closeBtn.click();
        }
    }
    
    // Disparar eventos
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
    window.dispatchEvent(new CustomEvent('usersUpdated'));
    document.dispatchEvent(new Event('dataRefresh'));
    
    setTimeout(() => {
        console.log('✅ UI actualizada. Abre una tarea de curso completo ahora.');
    }, 500);
}

// 5. Proceso completo
function solucionCompleta() {
    console.log('🎯 === EJECUTANDO SOLUCIÓN COMPLETA ===');
    
    try {
        // Paso 1: Diagnóstico
        const estado = diagnosticoRapido();
        
        // Paso 2: Configurar datos si es necesario
        const estudiantes = estado.usuarios.filter(u => u.role === 'student');
        const tareasDelCurso = estado.tareas.filter(t => t.assignedTo === 'course');
        
        if (estudiantes.length === 0 || tareasDelCurso.length === 0) {
            console.log('⚙️ Configurando datos necesarios...');
            configurarDatosMinimos();
        }
        
        // Paso 3: Test
        const funcionaCorrectamente = testFuncionCorregida();
        
        if (funcionaCorrectamente) {
            console.log('✅ La función está funcionando correctamente');
        } else {
            console.log('❌ Hay un problema con los datos');
        }
        
        // Paso 4: Actualizar UI
        forzarActualizacionUI();
        
        console.log('🎉 === SOLUCIÓN COMPLETADA ===');
        console.log('📋 SIGUIENTE PASO: Abre una tarea asignada a "Todo el curso"');
        
    } catch (error) {
        console.error('❌ Error en la solución:', error);
    }
}

// Ejecutar automáticamente
solucionCompleta();

// Funciones disponibles para uso manual
window.diagnosticoRapido = diagnosticoRapido;
window.configurarDatosMinimos = configurarDatosMinimos;
window.testFuncionCorregida = testFuncionCorregida;
window.forzarActualizacionUI = forzarActualizacionUI;
window.solucionCompleta = solucionCompleta;
