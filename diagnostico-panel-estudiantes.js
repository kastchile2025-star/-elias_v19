// 🔍 DIAGNÓSTICO: Panel de Estudiantes en Tareas - Asignación a Curso Completo
// Ejecutar en la consola del navegador en http://localhost:9002/dashboard/tareas

console.log('🔍 === DIAGNÓSTICO: PANEL DE ESTUDIANTES EN TAREAS ===');

function diagnosticarPanelEstudiantes() {
    console.log('📊 Iniciando diagnóstico del panel de estudiantes...');
    
    // 1. Verificar datos en localStorage
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const comentarios = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
    console.log(`👥 Total usuarios: ${usuarios.length}`);
    console.log(`📝 Total tareas: ${tareas.length}`);
    console.log(`💬 Total comentarios: ${comentarios.length}`);
    
    // 2. Analizar usuarios
    const estudiantes = usuarios.filter(u => u.role === 'student');
    const profesores = usuarios.filter(u => u.role === 'teacher');
    
    console.log(`👨‍🎓 Estudiantes: ${estudiantes.length}`);
    console.log(`👨‍🏫 Profesores: ${profesores.length}`);
    
    if (estudiantes.length > 0) {
        console.log('📋 Estructura de estudiantes:');
        estudiantes.forEach((est, index) => {
            console.log(`   ${index + 1}. ${est.displayName || est.username}`);
            console.log(`      • ID: ${est.id}`);
            console.log(`      • Username: ${est.username}`);
            console.log(`      • Cursos: ${(est.activeCourses || []).join(', ')}`);
            console.log(`      • Profesor asignado: ${est.assignedTeacher || 'N/A'}`);
            console.log(`      • Profesores por materia: ${JSON.stringify(est.assignedTeachers || {})}`);
            console.log(`      • ID profesor asignado: ${est.assignedTeacherId || 'N/A'}`);
        });
    }
    
    // 3. Analizar tareas del curso
    const tareasDelCurso = tareas.filter(t => t.assignedTo === 'course');
    console.log(`📚 Tareas asignadas a curso completo: ${tareasDelCurso.length}`);
    
    if (tareasDelCurso.length > 0) {
        console.log('📋 Detalles de tareas de curso:');
        tareasDelCurso.forEach((tarea, index) => {
            console.log(`   ${index + 1}. "${tarea.title}"`);
            console.log(`      • ID: ${tarea.id}`);
            console.log(`      • Curso: ${tarea.course}`);
            console.log(`      • Asignada por ID: ${tarea.assignedById}`);
            console.log(`      • Asignada por: ${tarea.assignedByName}`);
            console.log(`      • Tipo asignación: ${tarea.assignedTo}`);
        });
    }
    
    // 4. Simular la función getStudentsFromCourseRelevantToTask
    if (tareasDelCurso.length > 0) {
        const tarea = tareasDelCurso[0];
        console.log(`🧪 Simulando getStudentsFromCourseRelevantToTask para: "${tarea.title}"`);
        
        const courseId = tarea.course;
        const teacherId = tarea.assignedById;
        
        // Obtener profesor actual (simular)
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
        const currentTeacherUsername = currentUser.username;
        
        console.log(`📝 Parámetros de búsqueda:`);
        console.log(`   • Course ID: ${courseId}`);
        console.log(`   • Teacher ID: ${teacherId}`);
        console.log(`   • Current teacher username: ${currentTeacherUsername}`);
        
        const estudiantesEncontrados = usuarios.filter(u => {
            const isStudent = u.role === 'student';
            const isInCourse = u.activeCourses?.includes(courseId);
            
            // Verificar asignación al profesor actual
            const isAssignedToTeacher = 
                // Método 1: assignedTeacher (string con username)
                (currentTeacherUsername && u.assignedTeacher === currentTeacherUsername) ||
                // Método 2: assignedTeachers (objeto con asignaturas)
                (currentTeacherUsername && u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentTeacherUsername)) ||
                // Método 3: assignedTeacherId (si existe, comparar con teacher ID)
                (teacherId && u.assignedTeacherId === teacherId) ||
                // Método 4: Si no hay asignaciones específicas, incluir todos
                (!u.assignedTeacher && !u.assignedTeachers && !u.assignedTeacherId);
            
            console.log(`👤 ${u.username}: estudiante=${isStudent}, curso=${isInCourse}, asignado=${isAssignedToTeacher}`);
            
            return isStudent && isInCourse && isAssignedToTeacher;
        });
        
        console.log(`✅ Estudiantes que deberían aparecer: ${estudiantesEncontrados.length}`);
        if (estudiantesEncontrados.length === 0) {
            console.log('❌ PROBLEMA IDENTIFICADO: No se encontraron estudiantes para la tarea');
            console.log('🔍 Posibles causas:');
            console.log('   1. Los estudiantes no están en el curso correcto');
            console.log('   2. Los estudiantes no están asignados al profesor correcto');
            console.log('   3. Los IDs de curso no coinciden');
            console.log('   4. Los IDs de profesor no coinciden');
        } else {
            estudiantesEncontrados.forEach(est => {
                console.log(`   ✅ ${est.displayName || est.username} (${est.username})`);
            });
        }
    }
    
    // 5. Verificar coincidencias de IDs
    console.log('🔍 Verificando coincidencias de IDs...');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    console.log(`👨‍🏫 Usuario actual: ${currentUser.displayName || currentUser.username} (ID: ${currentUser.id})`);
    
    // Verificar si hay tareas del profesor actual
    const tareasDelProfesor = tareas.filter(t => 
        t.assignedById === currentUser.id || 
        t.assignedByName === currentUser.displayName ||
        t.assignedByName === currentUser.username
    );
    
    console.log(`📚 Tareas del profesor actual: ${tareasDelProfesor.length}`);
    
    if (tareasDelProfesor.length === 0) {
        console.log('❌ PROBLEMA: El profesor actual no tiene tareas asignadas');
        console.log('🔍 Verificando todas las tareas para encontrar discrepancias...');
        
        tareas.forEach(tarea => {
            console.log(`📝 Tarea "${tarea.title}": assignedById=${tarea.assignedById}, assignedByName=${tarea.assignedByName}`);
        });
    }
}

function corregirAsignacionEstudiantes() {
    console.log('🔧 === CORRECCIÓN: ASIGNACIÓN DE ESTUDIANTES ===');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    if (!currentUser.username) {
        console.log('❌ No hay usuario actual logueado');
        return;
    }
    
    console.log(`👨‍🏫 Corrigiendo asignaciones para profesor: ${currentUser.displayName}`);
    
    // Corregir asignaciones de estudiantes
    let correcciones = 0;
    const usuariosCorregidos = usuarios.map(usuario => {
        if (usuario.role === 'student') {
            // Si el estudiante no tiene asignaciones específicas, asignarlo al profesor actual
            if (!usuario.assignedTeacher && !usuario.assignedTeachers && !usuario.assignedTeacherId) {
                console.log(`🔧 Asignando estudiante ${usuario.username} al profesor ${currentUser.username}`);
                correcciones++;
                return {
                    ...usuario,
                    assignedTeacher: currentUser.username,
                    assignedTeacherId: currentUser.id
                };
            }
        }
        return usuario;
    });
    
    if (correcciones > 0) {
        localStorage.setItem('smart-student-users', JSON.stringify(usuariosCorregidos));
        console.log(`✅ ${correcciones} estudiantes corregidos y asignados al profesor actual`);
        console.log('🔄 Recarga la página para ver los cambios');
    } else {
        console.log('ℹ️ No se necesitaron correcciones');
    }
}

function crearDatosPrueba() {
    console.log('🧪 === CREANDO DATOS DE PRUEBA ===');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    if (!currentUser.username) {
        console.log('❌ No hay usuario actual logueado');
        return;
    }
    
    // Crear estudiantes de prueba
    const estudiantesPrueba = [
        {
            id: 'est_prueba_001',
            username: 'felipe_prueba',
            displayName: 'Felipe Estudiante Prueba',
            role: 'student',
            activeCourses: ['ciencias_5to', 'matematicas_5to'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id
        },
        {
            id: 'est_prueba_002',
            username: 'maria_prueba',
            displayName: 'María González Prueba',
            role: 'student',
            activeCourses: ['ciencias_5to', 'matematicas_5to'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id
        },
        {
            id: 'est_prueba_003',
            username: 'carlos_prueba',
            displayName: 'Carlos Rodríguez Prueba',
            role: 'student',
            activeCourses: ['ciencias_5to', 'matematicas_5to'],
            assignedTeacher: currentUser.username,
            assignedTeacherId: currentUser.id
        }
    ];
    
    // Agregar a usuarios existentes
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const usuariosFiltrados = usuarios.filter(u => !u.username.includes('_prueba'));
    const usuariosFinales = [...usuariosFiltrados, ...estudiantesPrueba];
    
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosFinales));
    
    console.log(`✅ ${estudiantesPrueba.length} estudiantes de prueba creados`);
    console.log('📋 Estudiantes creados:');
    estudiantesPrueba.forEach(est => {
        console.log(`   • ${est.displayName} (${est.username})`);
    });
    
    // Crear tarea de prueba
    const tareaPrueba = {
        id: `task_prueba_${Date.now()}`,
        title: 'Tarea de Prueba - Curso Completo',
        description: 'Esta es una tarea de prueba asignada a todo el curso',
        subject: 'Ciencias Naturales',
        course: 'ciencias_5to',
        assignedById: currentUser.id,
        assignedByName: currentUser.displayName || currentUser.username,
        assignedTo: 'course',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        attachments: [],
        taskType: 'tarea'
    };
    
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    tareas.push(tareaPrueba);
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareas));
    
    console.log('✅ Tarea de prueba creada');
    console.log('🔄 Recarga la página para ver los cambios');
}

function limpiarDatosPrueba() {
    console.log('🧹 === LIMPIANDO DATOS DE PRUEBA ===');
    
    // Limpiar usuarios de prueba
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const usuariosLimpiados = usuarios.filter(u => !u.username.includes('_prueba'));
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosLimpiados));
    
    // Limpiar tareas de prueba
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const tareasLimpiadas = tareas.filter(t => !t.id.includes('_prueba'));
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareasLimpiadas));
    
    console.log('✅ Datos de prueba limpiados');
    console.log('🔄 Recarga la página para ver los cambios');
}

// Exportar funciones para uso en consola
window.diagnosticarPanelEstudiantes = diagnosticarPanelEstudiantes;
window.corregirAsignacionEstudiantes = corregirAsignacionEstudiantes;
window.crearDatosPrueba = crearDatosPrueba;
window.limpiarDatosPrueba = limpiarDatosPrueba;

console.log('🎯 Funciones disponibles:');
console.log('  - diagnosticarPanelEstudiantes()     // Analizar el problema');
console.log('  - corregirAsignacionEstudiantes()    // Corregir asignaciones');
console.log('  - crearDatosPrueba()                 // Crear datos de prueba');
console.log('  - limpiarDatosPrueba()               // Limpiar datos de prueba');
console.log('');
console.log('💡 Empezar con: diagnosticarPanelEstudiantes()');
