/**
 * 🔍 DIAGNÓSTICO DINÁMICO: Análisis de Datos Reales del Sistema
 * 
 * Este script analiza completamente los datos que están configurados
 * en "Gestión de Usuarios" para entender la distribución actual de estudiantes
 * por cursos y secciones, sin hacer cambios, solo mostrando la realidad.
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DINÁMICO DEL SISTEMA...');

function diagnosticoDinamico() {
    console.log('\n🔍 [DIAGNÓSTICO DINÁMICO] Analizando datos reales del sistema...');
    
    try {
        // Cargar todos los datos del sistema
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');
        
        console.log('\n📊 [RESUMEN GENERAL]:');
        console.log(`   • Total usuarios: ${users.length}`);
        console.log(`   • Estudiantes: ${students.length}`);
        console.log(`   • Profesores: ${teachers.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones estudiante-curso-sección: ${studentAssignments.length}`);
        console.log(`   • Asignaciones profesor-sección-materia: ${teacherAssignments.length}`);
        
        // 1. ANÁLISIS DE CURSOS
        console.log('\n📚 [CURSOS DISPONIBLES]:');
        if (courses.length === 0) {
            console.log('❌ NO HAY CURSOS configurados en el sistema');
        } else {
            courses.forEach((course, index) => {
                const sectionsInCourse = sections.filter(s => s.courseId === course.id);
                console.log(`\n   ${index + 1}. 📖 ${course.name}:`);
                console.log(`      • ID: ${course.id}`);
                console.log(`      • Nivel: ${course.level || 'No definido'}`);
                console.log(`      • Secciones: ${sectionsInCourse.length}`);
                
                sectionsInCourse.forEach(section => {
                    const studentsInSection = studentAssignments.filter(a => a.sectionId === section.id);
                    console.log(`        - Sección ${section.name}: ${studentsInSection.length} estudiantes`);
                });
            });
        }
        
        // 2. ANÁLISIS DE ESTUDIANTES
        console.log('\n👥 [ESTUDIANTES Y SUS ASIGNACIONES]:');
        if (students.length === 0) {
            console.log('❌ NO HAY ESTUDIANTES en el sistema');
        } else {
            students.forEach((student, index) => {
                console.log(`\n   ${index + 1}. 👤 ${student.displayName || student.username}:`);
                console.log(`      • ID: ${student.id}`);
                console.log(`      • Username: ${student.username}`);
                
                // Buscar asignación oficial en student-assignments
                const officialAssignment = studentAssignments.find(a => a.studentId === student.id);
                
                if (officialAssignment) {
                    const course = courses.find(c => c.id === officialAssignment.courseId);
                    const section = sections.find(s => s.id === officialAssignment.sectionId);
                    
                    console.log(`      • ✅ ASIGNACIÓN OFICIAL:`);
                    console.log(`        - Curso: ${course?.name || 'Curso desconocido'}`);
                    console.log(`        - Sección: ${section?.name || 'Sección desconocida'}`);
                    console.log(`        - CourseId: ${officialAssignment.courseId}`);
                    console.log(`        - SectionId: ${officialAssignment.sectionId}`);
                } else {
                    console.log(`      • ❌ SIN ASIGNACIÓN OFICIAL`);
                }
                
                // Mostrar datos legacy del estudiante
                console.log(`      • ActiveCourses legacy: [${student.activeCourses?.join(', ') || 'VACÍO'}]`);
                console.log(`      • SectionName legacy: ${student.sectionName || 'UNDEFINED'}`);
                console.log(`      • AssignedTeacher legacy: ${student.assignedTeacher || 'UNDEFINED'}`);
            });
        }
        
        // 3. ANÁLISIS POR CURSO-SECCIÓN
        console.log('\n🎯 [DISTRIBUCIÓN POR CURSO-SECCIÓN]:');
        
        const distribucionActual = {};
        
        studentAssignments.forEach(assignment => {
            const student = students.find(s => s.id === assignment.studentId);
            const course = courses.find(c => c.id === assignment.courseId);
            const section = sections.find(s => s.id === assignment.sectionId);
            
            if (student && course && section) {
                const key = `${course.name} - Sección ${section.name}`;
                if (!distribucionActual[key]) {
                    distribucionActual[key] = {
                        courseId: course.id,
                        sectionId: section.id,
                        estudiantes: []
                    };
                }
                distribucionActual[key].estudiantes.push(student.displayName || student.username);
            }
        });
        
        if (Object.keys(distribucionActual).length === 0) {
            console.log('❌ NO HAY DISTRIBUCIÓN configurada (student-assignments vacío)');
        } else {
            Object.keys(distribucionActual).forEach(grupo => {
                const info = distribucionActual[grupo];
                console.log(`\n📖 ${grupo}:`);
                console.log(`   • CourseId: ${info.courseId}`);
                console.log(`   • SectionId: ${info.sectionId}`);
                console.log(`   • Estudiantes (${info.estudiantes.length}):`);
                info.estudiantes.forEach(nombre => {
                    console.log(`     - ${nombre}`);
                });
            });
        }
        
        // 4. ANÁLISIS DE DATOS INCONSISTENTES
        console.log('\n⚠️ [ANÁLISIS DE INCONSISTENCIAS]:');
        
        const problemas = [];
        
        // Estudiantes sin asignación oficial
        const estudiantesSinAsignacion = students.filter(s => 
            !studentAssignments.some(a => a.studentId === s.id)
        );
        
        if (estudiantesSinAsignacion.length > 0) {
            problemas.push(`${estudiantesSinAsignacion.length} estudiantes sin asignación oficial`);
            console.log(`❌ Estudiantes sin asignación oficial:`);
            estudiantesSinAsignacion.forEach(s => 
                console.log(`   - ${s.displayName || s.username}`)
            );
        }
        
        // Asignaciones huérfanas (estudiante no existe)
        const asignacionesHuerfanas = studentAssignments.filter(a => 
            !students.some(s => s.id === a.studentId)
        );
        
        if (asignacionesHuerfanas.length > 0) {
            problemas.push(`${asignacionesHuerfanas.length} asignaciones huérfanas (estudiante no existe)`);
        }
        
        // Asignaciones con curso inexistente
        const asignacionesCursoInvalido = studentAssignments.filter(a => 
            !courses.some(c => c.id === a.courseId)
        );
        
        if (asignacionesCursoInvalido.length > 0) {
            problemas.push(`${asignacionesCursoInvalido.length} asignaciones con curso inexistente`);
        }
        
        // Asignaciones con sección inexistente
        const asignacionesSeccionInvalida = studentAssignments.filter(a => 
            !sections.some(s => s.id === a.sectionId)
        );
        
        if (asignacionesSeccionInvalida.length > 0) {
            problemas.push(`${asignacionesSeccionInvalida.length} asignaciones con sección inexistente`);
        }
        
        if (problemas.length === 0) {
            console.log('✅ No se detectaron inconsistencias en los datos');
        } else {
            console.log('❌ PROBLEMAS DETECTADOS:');
            problemas.forEach(problema => console.log(`   • ${problema}`));
        }
        
        // 5. RECOMENDACIONES DINÁMICAS
        console.log('\n💡 [RECOMENDACIONES]:');
        
        if (studentAssignments.length === 0) {
            console.log('🔧 ACCIÓN REQUERIDA: No hay asignaciones estudiante-curso-sección');
            console.log('   • Ve a "Gestión de Usuarios" → pestaña "Asignaciones"');
            console.log('   • Asigna cada estudiante a un curso y sección específicos');
            console.log('   • Esto permitirá el filtrado dinámico correcto');
        } else if (estudiantesSinAsignacion.length > 0) {
            console.log('🔧 ACCIÓN REQUERIDA: Algunos estudiantes necesitan asignación');
            console.log('   • Ve a "Gestión de Usuarios" → pestaña "Asignaciones"');
            console.log('   • Asigna los estudiantes faltantes a sus cursos y secciones');
        } else {
            console.log('✅ El sistema está configurado correctamente');
            console.log('💡 El filtrado dinámico debería funcionar correctamente');
            console.log('🧪 Prueba crear una tarea y seleccionar "Estudiantes específicos"');
        }
        
        return {
            estudiantes: students.length,
            asignaciones: studentAssignments.length,
            distribucion: distribucionActual,
            problemas: problemas.length
        };
        
    } catch (error) {
        console.error('❌ Error durante el diagnóstico dinámico:', error);
        return null;
    }
}

// Función para mostrar la estructura de cursos disponibles para profesores
function mostrarCursosDisponiblesProfesor() {
    console.log('\n📚 [CURSOS DISPONIBLES PARA PROFESOR] Simulando getAvailableCoursesWithNames()...');
    
    try {
        // Esta función simula lo que hace getAvailableCoursesWithNames()
        const currentUser = JSON.parse(localStorage.getItem('smart-student-current-user') || '{}');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log(`👤 Profesor actual: ${currentUser.displayName || currentUser.username || 'No definido'}`);
        console.log(`🆔 ID del profesor: ${currentUser.id || 'No definido'}`);
        
        if (!currentUser.id) {
            console.log('❌ No hay profesor logueado');
            return [];
        }
        
        // Buscar asignaciones del profesor actual
        const profesorAsignaciones = teacherAssignments.filter(assignment => 
            assignment.teacherId === currentUser.id
        );
        
        console.log(`📋 Asignaciones del profesor: ${profesorAsignaciones.length}`);
        
        if (profesorAsignaciones.length === 0) {
            console.log('❌ Este profesor no tiene asignaciones de sección-materia');
            return [];
        }
        
        // Generar lista de cursos combinados
        const cursosDisponibles = [];
        
        profesorAsignaciones.forEach(assignment => {
            const section = sections.find(s => s.id === assignment.sectionId);
            const course = courses.find(c => c.id === section?.courseId);
            
            if (course && section) {
                const cursoCombinadoId = `${course.id}-${section.id}`;
                const cursoExistente = cursosDisponibles.find(c => c.id === cursoCombinadoId);
                
                if (!cursoExistente) {
                    cursosDisponibles.push({
                        id: cursoCombinadoId,
                        courseId: course.id,
                        name: `${course.name} Sección ${section.name}`,
                        originalCourseName: course.name,
                        sectionName: section.name,
                        sectionId: section.id
                    });
                }
            }
        });
        
        console.log(`🎯 Cursos-secciones disponibles: ${cursosDisponibles.length}`);
        cursosDisponibles.forEach((curso, index) => {
            console.log(`\n   ${index + 1}. ${curso.name}:`);
            console.log(`      • ID combinado: ${curso.id}`);
            console.log(`      • CourseId: ${curso.courseId}`);
            console.log(`      • SectionId: ${curso.sectionId}`);
        });
        
        return cursosDisponibles;
        
    } catch (error) {
        console.error('❌ Error al mostrar cursos disponibles:', error);
        return [];
    }
}

// Ejecutar diagnóstico automáticamente
console.log('🚀 Ejecutando diagnóstico dinámico...');
const resultado = diagnosticoDinamico();

if (resultado) {
    console.log('\n✅ DIAGNÓSTICO DINÁMICO COMPLETADO');
    console.log(`📊 Resumen: ${resultado.estudiantes} estudiantes, ${resultado.asignaciones} asignaciones, ${resultado.problemas} problemas`);
    
    console.log('\n🔧 FUNCIONES DISPONIBLES:');
    console.log('   • diagnosticoDinamico() - Para re-ejecutar el análisis');
    console.log('   • mostrarCursosDisponiblesProfesor() - Para ver cursos del profesor actual');
    
    // Mostrar también los cursos disponibles
    mostrarCursosDisponiblesProfesor();
} else {
    console.log('\n❌ ERROR en el diagnóstico dinámico');
}
