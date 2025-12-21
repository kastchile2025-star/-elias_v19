/**
 * 🔄 CAMBIAR ASIGNACIÓN DE MAX A CURSO ESPECÍFICO
 * 
 * Script para cambiar Max a un curso específico diferente.
 */

console.log('🔄 CAMBIANDO ASIGNACIÓN DE MAX...');
console.log('===============================');

function cambiarCursoMax() {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        // Mostrar todos los cursos disponibles
        console.log('📋 CURSOS DISPONIBLES:');
        console.log('======================');
        courses.forEach((curso, index) => {
            const seccionesCurso = sections.filter(s => s.courseId === curso.id);
            console.log(`${index + 1}. ${curso.name} (ID: ${curso.id})`);
            seccionesCurso.forEach((seccion, secIndex) => {
                console.log(`   ${String.fromCharCode(97 + secIndex)}. Sección ${seccion.name} (ID: ${seccion.id})`);
            });
        });

        console.log('\n💡 PARA CAMBIAR A MAX, ejecuta:');
        console.log('asignarMaxACurso(numeroCurso, numeroSeccion)');
        console.log('\nEjemplos:');
        console.log('- asignarMaxACurso(1, 1) = Primer curso, primera sección');
        console.log('- asignarMaxACurso(2, 1) = Segundo curso, primera sección');
        console.log('- asignarMaxACurso(3, 2) = Tercer curso, segunda sección');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

function asignarMaxACurso(numeroCurso, numeroSeccion) {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        // Validar parámetros
        if (numeroCurso < 1 || numeroCurso > courses.length) {
            console.error(`❌ Número de curso inválido. Debe estar entre 1 y ${courses.length}`);
            return false;
        }

        const cursoSeleccionado = courses[numeroCurso - 1];
        const seccionesCurso = sections.filter(s => s.courseId === cursoSeleccionado.id);

        if (numeroSeccion < 1 || numeroSeccion > seccionesCurso.length) {
            console.error(`❌ Número de sección inválido. Debe estar entre 1 y ${seccionesCurso.length}`);
            return false;
        }

        const seccionSeleccionada = seccionesCurso[numeroSeccion - 1];

        // Buscar Max
        const max = users.find(u => u.username === 'max');
        if (!max) {
            console.error('❌ Usuario Max no encontrado');
            return false;
        }

        console.log(`🎯 CAMBIANDO MAX A:`);
        console.log(`   Curso: ${cursoSeleccionado.name}`);
        console.log(`   Sección: ${seccionSeleccionada.name}`);

        // Eliminar asignación anterior de Max
        studentAssignments = studentAssignments.filter(a => a.studentId !== max.id);

        // Crear nueva asignación
        const nuevaAsignacion = {
            id: `max-new-${Date.now()}`,
            studentId: max.id,
            courseId: cursoSeleccionado.id,
            sectionId: seccionSeleccionada.id,
            createdAt: new Date().toISOString(),
            manualAssignment: true,
            assignedBy: 'script-manual'
        };

        studentAssignments.push(nuevaAsignacion);

        // Actualizar perfil de Max
        max.activeCourses = [`${cursoSeleccionado.name} - Sección ${seccionSeleccionada.name}`];

        // Guardar cambios
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-users', JSON.stringify(users));

        console.log(`✅ MAX ASIGNADO EXITOSAMENTE:`);
        console.log(`   Curso: ${cursoSeleccionado.name}`);
        console.log(`   Sección: ${seccionSeleccionada.name}`);
        console.log(`   Perfil actualizado: ${JSON.stringify(max.activeCourses)}`);
        console.log('\n💡 Recarga la página para ver los cambios');

        return true;

    } catch (error) {
        console.error('❌ Error al asignar curso:', error);
        return false;
    }
}

// Ejecutar automáticamente
cambiarCursoMax();
