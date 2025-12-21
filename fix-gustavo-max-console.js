/**
 * 🔧 CORRECCIÓN ESPECÍFICA PARA GUSTAVO Y MAX
 * 
 * Script para diagnosticar y corregir los datos académicos específicos
 * de los estudiantes que tienen problemas de sincronización.
 */

console.log('🔧 DIAGNÓSTICO Y CORRECCIÓN ESPECÍFICA...');
console.log('=========================================');

function corregirEstudiantesEspecificos() {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 DATOS DEL SISTEMA:');
        console.log(`- Usuarios: ${users.length}`);
        console.log(`- Cursos: ${courses.length}`);
        console.log(`- Secciones: ${sections.length}`);
        console.log(`- Asignaciones estudiantes: ${studentAssignments.length}`);

        // Buscar a Gustavo y Max
        const gustavo = users.find(u => u.username === 'gustavo');
        const max = users.find(u => u.username === 'max');

        const estudiantesProblematicos = [
            { user: gustavo, nombre: 'Gustavo' },
            { user: max, nombre: 'Max' }
        ].filter(item => item.user); // Solo incluir los que existen

        console.log(`\n🎯 ESTUDIANTES A REVISAR: ${estudiantesProblematicos.length}`);

        estudiantesProblematicos.forEach(({ user, nombre }) => {
            console.log(`\n👤 DIAGNÓSTICO DETALLADO: ${nombre} (${user.username})`);
            console.log('='.repeat(50));
            
            // Información básica del usuario
            console.log(`ID: ${user.id}`);
            console.log(`Nombre completo: ${user.fullName || 'No definido'}`);
            console.log(`Role: ${user.role}`);
            
            // Datos académicos en el perfil
            console.log(`\n📚 DATOS EN EL PERFIL:`);
            console.log(`activeCourses: ${JSON.stringify(user.activeCourses || [])}`);
            
            // Asignación en gestión de usuarios
            console.log(`\n🎯 ASIGNACIÓN EN GESTIÓN DE USUARIOS:`);
            const asignacionReal = studentAssignments.find(a => a.studentId === user.id);
            
            if (asignacionReal) {
                const curso = courses.find(c => c.id === asignacionReal.courseId);
                const seccion = sections.find(s => s.id === asignacionReal.sectionId);
                
                console.log(`✅ Asignación encontrada:`);
                console.log(`   Curso: ${curso?.name || 'Curso no encontrado'} (ID: ${asignacionReal.courseId})`);
                console.log(`   Sección: ${seccion?.name || 'Sección no encontrada'} (ID: ${asignacionReal.sectionId})`);
                console.log(`   ID de asignación: ${asignacionReal.id}`);
                console.log(`   Creado: ${asignacionReal.createdAt || 'No definido'}`);
                
                // Verificar si los datos del perfil coinciden
                const cursoEsperado = `${curso?.name} - Sección ${seccion?.name}`;
                const cursosEnPerfil = user.activeCourses || [];
                
                console.log(`\n🔍 VERIFICACIÓN DE SINCRONIZACIÓN:`);
                console.log(`   Esperado en perfil: "${cursoEsperado}"`);
                console.log(`   Actual en perfil: ${JSON.stringify(cursosEnPerfil)}`);
                
                if (cursosEnPerfil.includes(cursoEsperado)) {
                    console.log(`✅ Los datos están sincronizados correctamente`);
                } else {
                    console.log(`❌ DESINCRONIZACIÓN DETECTADA - APLICANDO CORRECCIÓN`);
                    
                    // Corregir los datos del perfil
                    user.activeCourses = [cursoEsperado];
                    console.log(`🔧 Actualizado activeCourses a: ["${cursoEsperado}"]`);
                }
                
            } else {
                console.log(`❌ No tiene asignación en gestión de usuarios`);
                
                // Mostrar cursos disponibles
                console.log(`\n📋 CURSOS DISPONIBLES EN EL SISTEMA:`);
                courses.forEach((curso, index) => {
                    const seccionesCurso = sections.filter(s => s.courseId === curso.id);
                    console.log(`   ${index + 1}. ${curso.name} (${seccionesCurso.length} secciones)`);
                    seccionesCurso.forEach(seccion => {
                        console.log(`      - Sección ${seccion.name} (ID: ${seccion.id})`);
                    });
                });
                
                // Preguntar si crear asignación automática
                console.log(`\n⚠️ ${nombre} necesita ser asignado a un curso manualmente desde Gestión de Usuarios`);
                console.log(`   O se puede crear una asignación temporal al primer curso disponible`);
                
                // Crear asignación temporal al primer curso
                if (courses.length > 0) {
                    const primerCurso = courses[0];
                    const primerSeccion = sections.find(s => s.courseId === primerCurso.id);
                    
                    if (primerSeccion) {
                        console.log(`\n🔧 Creando asignación temporal a: ${primerCurso.name} - Sección ${primerSeccion.name}`);
                        
                        const nuevaAsignacion = {
                            id: `temp-${user.id}-${Date.now()}`,
                            studentId: user.id,
                            courseId: primerCurso.id,
                            sectionId: primerSeccion.id,
                            createdAt: new Date().toISOString(),
                            temporary: true,
                            note: 'Asignación temporal - requiere configuración manual en Gestión de Usuarios'
                        };
                        
                        studentAssignments.push(nuevaAsignacion);
                        user.activeCourses = [`${primerCurso.name} - Sección ${primerSeccion.name}`];
                        
                        console.log(`✅ Asignación temporal creada`);
                    }
                }
            }
        });

        // Guardar cambios
        console.log(`\n💾 GUARDANDO CAMBIOS...`);
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        console.log(`✅ Cambios guardados exitosamente`);

        // Mostrar resumen final
        console.log(`\n📋 RESUMEN FINAL:`);
        estudiantesProblematicos.forEach(({ user, nombre }) => {
            const asignacion = studentAssignments.find(a => a.studentId === user.id);
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                console.log(`✅ ${nombre}: ${curso?.name} - Sección ${seccion?.name}`);
                
                if (asignacion.temporary) {
                    console.log(`   ⚠️ Asignación temporal - requiere configuración definitiva en Gestión de Usuarios`);
                }
            } else {
                console.log(`❌ ${nombre}: Sin asignación`);
            }
        });

        console.log(`\n🎉 CORRECCIÓN COMPLETADA`);
        console.log(`💡 Recarga la página para ver los cambios en el perfil`);
        
        return true;

    } catch (error) {
        console.error('❌ ERROR durante la corrección:', error);
        return false;
    }
}

// Función para mostrar el estado actual de todos los estudiantes
function mostrarEstadoEstudiantes() {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        const estudiantes = users.filter(u => u.role === 'student');

        console.log('\n👥 ESTADO ACTUAL DE TODOS LOS ESTUDIANTES:');
        console.log('==========================================');

        estudiantes.forEach((estudiante, index) => {
            const nombreCompleto = estudiante.fullName || estudiante.name || estudiante.username;
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            console.log(`\n${index + 1}. ${nombreCompleto} (${estudiante.username})`);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                console.log(`   📚 Gestión: ${curso?.name || 'N/A'} - Sección ${seccion?.name || 'N/A'}`);
                
                if (asignacion.temporary) {
                    console.log(`   ⚠️ Asignación temporal`);
                }
            } else {
                console.log(`   ❌ Sin asignación en gestión`);
            }
            
            const cursosEnPerfil = estudiante.activeCourses || [];
            console.log(`   👤 Perfil: ${JSON.stringify(cursosEnPerfil)}`);
        });

    } catch (error) {
        console.error('❌ Error al mostrar estado:', error);
    }
}

// Ejecutar corrección automáticamente
corregirEstudiantesEspecificos();

console.log('\n💡 COMANDOS DISPONIBLES:');
console.log('- corregirEstudiantesEspecificos() - Ejecutar corrección específica');
console.log('- mostrarEstadoEstudiantes() - Ver estado de todos los estudiantes');
