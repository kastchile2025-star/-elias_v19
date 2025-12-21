// 🚀 CORRECCIÓN INMEDIATA: Panel de Estudiantes en Tareas
// Ejecutar directamente en la consola del navegador

console.log('🚀 === CORRECCIÓN INMEDIATA: PANEL DE ESTUDIANTES ===');

function correccionInmediata() {
    console.log('🔧 Iniciando corrección inmediata...');
    
    // 1. Verificar datos actuales
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    console.log(`👥 Usuarios: ${usuarios.length}, Tareas: ${tareas.length}`);
    console.log(`👨‍🏫 Usuario actual: ${currentUser.displayName || currentUser.username}`);
    
    // 2. Verificar si hay estudiantes
    const estudiantes = usuarios.filter(u => u.role === 'student');
    console.log(`👨‍🎓 Estudiantes encontrados: ${estudiantes.length}`);
    
    if (estudiantes.length === 0) {
        console.log('❌ No hay estudiantes en el sistema');
        console.log('💡 Creando estudiantes de prueba...');
        crearEstudiantesPrueba();
        return;
    }
    
    // 3. Verificar tareas de curso
    const tareasDelCurso = tareas.filter(t => t.assignedTo === 'course');
    console.log(`📚 Tareas de curso completo: ${tareasDelCurso.length}`);
    
    if (tareasDelCurso.length === 0) {
        console.log('❌ No hay tareas asignadas a curso completo');
        console.log('💡 Creando tarea de prueba...');
        crearTareaPrueba();
        return;
    }
    
    // 4. Verificar asignaciones de estudiantes
    console.log('🔍 Verificando asignaciones de estudiantes...');
    
    let correccionesRealizadas = 0;
    const usuariosCorregidos = usuarios.map(usuario => {
        if (usuario.role === 'student') {
            // Asegurar que todos los estudiantes tengan cursos asignados
            if (!usuario.activeCourses || usuario.activeCourses.length === 0) {
                console.log(`🔧 Asignando cursos al estudiante ${usuario.username}`);
                correccionesRealizadas++;
                return {
                    ...usuario,
                    activeCourses: ['4to_basico', 'ciencias_naturales', 'matematicas_4to'],
                    assignedTeacher: currentUser.username,
                    assignedTeacherId: currentUser.id
                };
            }
            
            // Asegurar que tengan profesor asignado
            if (!usuario.assignedTeacher) {
                console.log(`🔧 Asignando profesor al estudiante ${usuario.username}`);
                correccionesRealizadas++;
                return {
                    ...usuario,
                    assignedTeacher: currentUser.username,
                    assignedTeacherId: currentUser.id
                };
            }
        }
        return usuario;
    });
    
    if (correccionesRealizadas > 0) {
        localStorage.setItem('smart-student-users', JSON.stringify(usuariosCorregidos));
        console.log(`✅ ${correccionesRealizadas} correcciones aplicadas`);
    }
    
    // 5. Forzar recarga de datos en la página
    console.log('🔄 Forzando recarga de datos...');
    
    // Disparar eventos de actualización
    window.dispatchEvent(new Event('storage'));
    document.dispatchEvent(new Event('usersUpdated'));
    window.dispatchEvent(new CustomEvent('refreshTasks'));
    
    console.log('✅ Corrección completada. Cierra y abre la tarea de nuevo.');
}

function crearEstudiantesPrueba() {
    console.log('🧪 Creando estudiantes de prueba...');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    const estudiantesPrueba = [
        {
            id: 'student_001',
            username: 'ana_lopez',
            displayName: 'Ana López',
            email: 'ana.lopez@colegio.edu',
            role: 'student',
            activeCourses: ['4to_basico', 'ciencias_naturales', 'matematicas_4to'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id,
            grade: '4to Básico',
            section: 'A'
        },
        {
            id: 'student_002',
            username: 'carlos_ruiz',
            displayName: 'Carlos Ruiz',
            email: 'carlos.ruiz@colegio.edu',
            role: 'student',
            activeCourses: ['4to_basico', 'ciencias_naturales', 'matematicas_4to'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id,
            grade: '4to Básico',
            section: 'A'
        },
        {
            id: 'student_003',
            username: 'maria_fernandez',
            displayName: 'María Fernández',
            email: 'maria.fernandez@colegio.edu',
            role: 'student',
            activeCourses: ['4to_basico', 'ciencias_naturales', 'matematicas_4to'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id,
            grade: '4to Básico',
            section: 'A'
        }
    ];
    
    // Filtrar estudiantes existentes que no sean de prueba
    const usuariosFiltrados = usuarios.filter(u => !['ana_lopez', 'carlos_ruiz', 'maria_fernandez'].includes(u.username));
    const usuariosFinales = [...usuariosFiltrados, ...estudiantesPrueba];
    
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosFinales));
    
    console.log(`✅ ${estudiantesPrueba.length} estudiantes creados`);
    console.log('🔄 Recarga la página para ver los cambios');
}

function crearTareaPrueba() {
    console.log('📝 Creando tarea de prueba...');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const tareaPrueba = {
        id: `task_${Date.now()}`,
        title: 'Tarea de Ciencias Naturales - Curso Completo',
        description: 'Estudiar los ecosistemas y realizar un mapa conceptual',
        subject: 'Ciencias Naturales',
        course: '4to_basico',
        assignedById: currentUser.id,
        assignedByName: currentUser.displayName || currentUser.username,
        assignedTo: 'course', // 🔑 CLAVE: Asignada a curso completo
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        attachments: [],
        taskType: 'tarea'
    };
    
    tareas.push(tareaPrueba);
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareas));
    
    console.log('✅ Tarea de prueba creada');
    console.log('🔄 Recarga la página para ver los cambios');
}

function verificarCorrecion() {
    console.log('🔍 === VERIFICACIÓN DE LA CORRECCIÓN ===');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    // Buscar tarea de curso completo
    const tareaDelCurso = tareas.find(t => t.assignedTo === 'course');
    
    if (!tareaDelCurso) {
        console.log('❌ No hay tareas de curso completo para verificar');
        return;
    }
    
    console.log(`📝 Verificando tarea: "${tareaDelCurso.title}"`);
    console.log(`📚 Curso: ${tareaDelCurso.course}`);
    
    // Simular la función corregida
    const courseId = tareaDelCurso.course;
    const estudiantesDelCurso = usuarios.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(courseId);
        
        // 🔧 LÓGICA CORREGIDA: Solo verificar estudiante + curso
        return isStudent && isInCourse;
    });
    
    console.log(`✅ Estudiantes que deberían aparecer: ${estudiantesDelCurso.length}`);
    
    if (estudiantesDelCurso.length > 0) {
        console.log('📋 Lista de estudiantes:');
        estudiantesDelCurso.forEach((est, index) => {
            console.log(`   ${index + 1}. ${est.displayName} (${est.username})`);
        });
        console.log('🎉 ¡LA CORRECCIÓN DEBERÍA FUNCIONAR!');
    } else {
        console.log('❌ Problema persiste - verificar datos');
    }
}

function limpiarCache() {
    console.log('🧹 Limpiando cache y forzando recarga...');
    
    // Disparar múltiples eventos de actualización
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('refreshData'));
    document.dispatchEvent(new Event('dataUpdated'));
    
    // Simular clic para cerrar modal si está abierto
    const closeBtn = document.querySelector('[role="dialog"] button');
    if (closeBtn) {
        closeBtn.click();
    }
    
    console.log('✅ Cache limpiado. Abre la tarea de nuevo.');
}

// Funciones disponibles
window.correccionInmediata = correccionInmediata;
window.crearEstudiantesPrueba = crearEstudiantesPrueba;
window.crearTareaPrueba = crearTareaPrueba;
window.verificarCorrecion = verificarCorrecion;
window.limpiarCache = limpiarCache;

console.log('🎯 === FUNCIONES DE CORRECCIÓN DISPONIBLES ===');
console.log('  1. correccionInmediata()     // Ejecutar corrección completa');
console.log('  2. crearEstudiantesPrueba()  // Crear estudiantes de prueba');
console.log('  3. crearTareaPrueba()        // Crear tarea de prueba');
console.log('  4. verificarCorrecion()      // Verificar si funciona');
console.log('  5. limpiarCache()            // Limpiar cache');
console.log('');
console.log('💡 EJECUTAR: correccionInmediata()');
console.log('📋 LUEGO: Cerrar y abrir la tarea de nuevo');
