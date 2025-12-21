// 🧪 TEST: Verificación de la corrección del panel de estudiantes
// Ejecutar en consola del navegador en http://localhost:9002/dashboard/tareas

console.log('🧪 === TEST: PANEL DE ESTUDIANTES - CORRECCIÓN APLICADA ===');

function testPanelEstudiantesFix() {
    console.log('🔍 Iniciando test de la corrección...');
    
    // 1. Verificar datos básicos
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    
    console.log(`👥 Total usuarios: ${usuarios.length}`);
    console.log(`📝 Total tareas: ${tareas.length}`);
    console.log(`👨‍🏫 Usuario actual: ${currentUser.displayName} (${currentUser.username})`);
    
    // 2. Encontrar estudiantes del curso
    const estudiantes = usuarios.filter(u => u.role === 'student');
    console.log(`👨‍🎓 Total estudiantes: ${estudiantes.length}`);
    
    // 3. Verificar tareas de curso completo
    const tareasDelCurso = tareas.filter(t => t.assignedTo === 'course');
    console.log(`📚 Tareas asignadas a curso completo: ${tareasDelCurso.length}`);
    
    if (tareasDelCurso.length === 0) {
        console.log('⚠️ No hay tareas asignadas a curso completo para probar');
        console.log('💡 Sugerencia: Crear una nueva tarea con "Asignar = Todo el curso"');
        return;
    }
    
    // 4. Probar con la primera tarea de curso
    const tarea = tareasDelCurso[0];
    console.log(`🧪 Probando con tarea: "${tarea.title}"`);
    console.log(`   • Curso: ${tarea.course}`);
    console.log(`   • Asignada por: ${tarea.assignedByName}`);
    console.log(`   • Tipo: ${tarea.assignedTo}`);
    
    // 5. Simular la función getStudentsFromCourseRelevantToTask (DESPUÉS de la corrección)
    const courseId = tarea.course;
    const teacherId = tarea.assignedById;
    
    console.log('🔍 Simulando getStudentsFromCourseRelevantToTask (DESPUÉS de corrección):');
    
    const estudiantesEncontrados = usuarios.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(courseId);
        
        // 🔧 NUEVA LÓGICA: Solo verificar que sea estudiante y esté en el curso
        if (isStudent && isInCourse) {
            console.log(`   ✅ ${u.username}: estudiante=${isStudent}, en curso=${isInCourse} → INCLUIDO`);
            return true;
        } else {
            console.log(`   ❌ ${u.username}: estudiante=${isStudent}, en curso=${isInCourse} → EXCLUIDO`);
            return false;
        }
    });
    
    console.log(`✅ Resultado: ${estudiantesEncontrados.length} estudiantes encontrados`);
    
    if (estudiantesEncontrados.length > 0) {
        console.log('📋 Lista de estudiantes que aparecerán en el panel:');
        estudiantesEncontrados.forEach((est, index) => {
            console.log(`   ${index + 1}. ${est.displayName || est.username} (${est.username})`);
        });
        console.log('🎉 ¡CORRECCIÓN EXITOSA! Los estudiantes aparecerán en el panel');
    } else {
        console.log('❌ PROBLEMA PERSISTE: No se encontraron estudiantes');
        console.log('🔍 Posibles causas:');
        console.log('   1. No hay estudiantes registrados');
        console.log('   2. Los estudiantes no están en el curso correcto');
        console.log('   3. Los IDs de curso no coinciden');
        
        // Diagnóstico adicional
        console.log('🔍 Diagnóstico adicional:');
        console.log(`   • Curso de la tarea: "${courseId}"`);
        console.log('   • Cursos de estudiantes:');
        estudiantes.forEach(est => {
            console.log(`     - ${est.username}: ${(est.activeCourses || []).join(', ')}`);
        });
    }
    
    // 6. Comparar con la lógica ANTERIOR (restrictiva)
    console.log('');
    console.log('🔄 === COMPARACIÓN CON LÓGICA ANTERIOR ===');
    const currentTeacherUsername = currentUser.username;
    
    const estudiantesLogicaAnterior = usuarios.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(courseId);
        
        // Lógica ANTERIOR (restrictiva)
        const isAssignedToTeacher = 
            (currentTeacherUsername && u.assignedTeacher === currentTeacherUsername) ||
            (currentTeacherUsername && u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentTeacherUsername)) ||
            (teacherId && u.assignedTeacherId === teacherId) ||
            (!u.assignedTeacher && !u.assignedTeachers && !u.assignedTeacherId);
        
        return isStudent && isInCourse && isAssignedToTeacher;
    });
    
    console.log(`📊 Comparación de resultados:`);
    console.log(`   • Lógica ANTERIOR (restrictiva): ${estudiantesLogicaAnterior.length} estudiantes`);
    console.log(`   • Lógica NUEVA (simple): ${estudiantesEncontrados.length} estudiantes`);
    console.log(`   • Mejora: +${estudiantesEncontrados.length - estudiantesLogicaAnterior.length} estudiantes`);
    
    if (estudiantesEncontrados.length > estudiantesLogicaAnterior.length) {
        console.log('🎉 ¡LA CORRECCIÓN ESTÁ FUNCIONANDO! Más estudiantes aparecen ahora');
    } else if (estudiantesEncontrados.length === estudiantesLogicaAnterior.length && estudiantesEncontrados.length > 0) {
        console.log('ℹ️ La corrección no cambió el resultado (ya funcionaba)');
    } else {
        console.log('⚠️ La corrección no resolvió el problema principal');
    }
}

function verificarCorrecionEnDOM() {
    console.log('🔍 === VERIFICACIÓN EN DOM ACTUAL ===');
    
    // Buscar el modal de tarea abierto
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.log('❌ No hay modal de tarea abierto');
        console.log('💡 Abre una tarea asignada a "Todo el curso" para probar');
        return;
    }
    
    // Buscar la sección del panel de estudiantes
    const panelEstudiantes = modal.querySelector('table');
    if (!panelEstudiantes) {
        console.log('❌ No se encontró tabla de estudiantes en el modal');
        return;
    }
    
    // Contar filas de estudiantes
    const filasEstudiantes = panelEstudiantes.querySelectorAll('tbody tr');
    const mensajeVacio = modal.textContent?.includes('No hay estudiantes asignados');
    
    console.log(`📊 Estado actual del panel:`);
    console.log(`   • Filas de estudiantes: ${filasEstudiantes.length}`);
    console.log(`   • Mensaje "No hay estudiantes": ${mensajeVacio ? 'SÍ' : 'NO'}`);
    
    if (filasEstudiantes.length > 0 && !mensajeVacio) {
        console.log('🎉 ¡PANEL FUNCIONANDO CORRECTAMENTE!');
        console.log('📋 Estudiantes mostrados:');
        filasEstudiantes.forEach((fila, index) => {
            const nombre = fila.querySelector('td')?.textContent || 'Sin nombre';
            console.log(`   ${index + 1}. ${nombre}`);
        });
    } else {
        console.log('❌ El panel sigue mostrando el problema');
        console.log('🔄 Intenta recargar la página y abrir la tarea de nuevo');
    }
}

// Exportar funciones
window.testPanelEstudiantesFix = testPanelEstudiantesFix;
window.verificarCorrecionEnDOM = verificarCorrecionEnDOM;

console.log('🎯 Funciones de test disponibles:');
console.log('  - testPanelEstudiantesFix()       // Test completo de la corrección');
console.log('  - verificarCorrecionEnDOM()       // Verificar estado actual del DOM');
console.log('');
console.log('💡 Ejecutar: testPanelEstudiantesFix()');
