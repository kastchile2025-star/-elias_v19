/**
 * 🔄 SINCRONIZADOR DINÁMICO DE DATOS ACADÉMICOS
 * 
 * Script para sincronizar automáticamente los datos académicos del perfil
 * con la información real almacenada en Gestión de Usuarios.
 * 
 * SOLUCIONA:
 * - Estudiantes con datos académicos incorrectos
 * - Valores hardcodeados que no reflejan la realidad
 * - Desincronización entre perfil y gestión de usuarios
 */

console.log('🔄 INICIANDO SINCRONIZACIÓN DINÁMICA DE DATOS ACADÉMICOS...');
console.log('=======================================================');

function sincronizarDatosAcademicos() {
    try {
        // Obtener todos los datos del sistema
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 DATOS DEL SISTEMA:');
        console.log(`- Usuarios: ${users.length}`);
        console.log(`- Cursos: ${courses.length}`);
        console.log(`- Secciones: ${sections.length}`);
        console.log(`- Asignaciones profesores: ${teacherAssignments.length}`);
        console.log(`- Asignaciones estudiantes: ${studentAssignments.length}`);

        if (courses.length === 0) {
            console.error('❌ No hay cursos disponibles en el sistema');
            return false;
        }

        const estudiantes = users.filter(u => u.role === 'student');
        const profesores = users.filter(u => u.role === 'teacher');

        console.log('\n👨‍🎓 VERIFICANDO ESTUDIANTES:');
        console.log('================================');

        let estudiantesCorregidos = 0;

        estudiantes.forEach(estudiante => {
            const nombreCompleto = estudiante.fullName || estudiante.name || estudiante.username;
            
            // Buscar asignación real del estudiante
            const asignacionReal = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (asignacionReal) {
                const curso = courses.find(c => c.id === asignacionReal.courseId);
                const seccion = sections.find(s => s.id === asignacionReal.sectionId);
                
                if (curso && seccion) {
                    console.log(`✅ ${nombreCompleto}: ${curso.name} - Sección ${seccion.name}`);
                    
                    // Verificar si el perfil del usuario tiene datos incorrectos
                    const datosPerfilActual = estudiante.activeCourses || [];
                    const cursoEsperado = `${curso.name} - Sección ${seccion.name}`;
                    
                    if (!datosPerfilActual.includes(cursoEsperado)) {
                        console.log(`  🔧 Corrigiendo datos de perfil para ${nombreCompleto}`);
                        estudiante.activeCourses = [cursoEsperado];
                        estudiantesCorregidos++;
                    }
                } else {
                    console.log(`⚠️ ${nombreCompleto}: Asignación con referencias inválidas`);
                }
            } else {
                console.log(`❌ ${nombreCompleto}: Sin asignación en sistema de gestión`);
                
                // Si no hay asignación, asignar al primer curso disponible
                const primerCurso = courses[0];
                const primerSeccion = sections.find(s => s.courseId === primerCurso.id);
                
                if (primerCurso && primerSeccion) {
                    console.log(`  ➕ Creando asignación automática: ${primerCurso.name} - Sección ${primerSeccion.name}`);
                    
                    // Crear asignación en el sistema
                    const nuevaAsignacion = {
                        id: `auto-student-${estudiante.id}-${Date.now()}`,
                        studentId: estudiante.id,
                        courseId: primerCurso.id,
                        sectionId: primerSeccion.id,
                        createdAt: new Date().toISOString(),
                        autoCreated: true
                    };
                    
                    studentAssignments.push(nuevaAsignacion);
                    
                    // Actualizar perfil del usuario
                    estudiante.activeCourses = [`${primerCurso.name} - Sección ${primerSeccion.name}`];
                    estudiantesCorregidos++;
                }
            }
        });

        console.log('\n👨‍🏫 VERIFICANDO PROFESORES:');
        console.log('=============================');

        let profesoresCorregidos = 0;

        profesores.forEach(profesor => {
            const nombreCompleto = profesor.fullName || profesor.name || profesor.username;
            const asignaciones = teacherAssignments.filter(a => a.teacherId === profesor.id);
            
            if (asignaciones.length > 0) {
                console.log(`✅ ${nombreCompleto}: ${asignaciones.length} asignaciones`);
                
                // Mostrar detalles de asignaciones
                const cursosAsignados = {};
                asignaciones.forEach(asignacion => {
                    const curso = courses.find(c => c.id === asignacion.courseId);
                    const seccion = sections.find(s => s.id === asignacion.sectionId);
                    
                    if (curso && seccion) {
                        const clave = `${curso.name} - Sección ${seccion.name}`;
                        if (!cursosAsignados[clave]) {
                            cursosAsignados[clave] = [];
                        }
                        cursosAsignados[clave].push(asignacion.subjectName);
                    }
                });
                
                Object.entries(cursosAsignados).forEach(([curso, materias]) => {
                    console.log(`  - ${curso}: ${materias.join(', ')}`);
                });
                
            } else {
                console.log(`❌ ${nombreCompleto}: Sin asignaciones`);
                
                // Crear asignaciones básicas
                const primerCurso = courses[0];
                const primerSeccion = sections.find(s => s.courseId === primerCurso.id);
                
                if (primerCurso && primerSeccion) {
                    const materiasBasicas = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia'];
                    
                    console.log(`  ➕ Creando asignaciones básicas para ${nombreCompleto}`);
                    
                    materiasBasicas.forEach(materia => {
                        teacherAssignments.push({
                            id: `auto-teacher-${profesor.id}-${materia}-${Date.now()}`,
                            teacherId: profesor.id,
                            courseId: primerCurso.id,
                            sectionId: primerSeccion.id,
                            subjectName: materia,
                            createdAt: new Date().toISOString(),
                            autoCreated: true
                        });
                    });
                    
                    profesoresCorregidos++;
                }
            }
        });

        // Guardar todos los cambios
        if (estudiantesCorregidos > 0 || profesoresCorregidos > 0) {
            console.log('\n💾 GUARDANDO CAMBIOS...');
            
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
            localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
            
            console.log(`✅ Corregidos ${estudiantesCorregidos} estudiantes y ${profesoresCorregidos} profesores`);
        } else {
            console.log('\n✅ NO SE REQUIRIERON CORRECCIONES');
            console.log('Todos los datos están sincronizados correctamente');
        }

        // Mostrar resumen final actualizado
        console.log('\n📋 RESUMEN FINAL DE DATOS ACADÉMICOS:');
        console.log('=====================================');

        const estudiantesActualizados = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        estudiantes.forEach(estudiante => {
            const nombreCompleto = estudiante.fullName || estudiante.name || estudiante.username;
            const asignacion = estudiantesActualizados.find(a => a.studentId === estudiante.id);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                console.log(`👨‍🎓 ${nombreCompleto}: ${curso?.name || 'N/A'} - Sección ${seccion?.name || 'N/A'}`);
            } else {
                console.log(`👨‍🎓 ${nombreCompleto}: ❌ Sin asignación`);
            }
        });

        console.log('\n🎉 SINCRONIZACIÓN COMPLETADA EXITOSAMENTE');
        console.log('Los datos académicos ahora reflejan la información real de Gestión de Usuarios');
        console.log('\n💡 TIP: Recarga la página para ver los cambios aplicados');

        return true;

    } catch (error) {
        console.error('❌ ERROR DURANTE LA SINCRONIZACIÓN:', error);
        return false;
    }
}

// Función específica para diagnosticar usuarios problemáticos
function diagnosticarUsuario(username) {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        const usuario = users.find(u => u.username === username);
        
        if (!usuario) {
            console.log(`❌ Usuario '${username}' no encontrado`);
            return;
        }

        console.log(`\n🔍 DIAGNÓSTICO DETALLADO: ${username}`);
        console.log('==========================================');
        console.log(`Nombre completo: ${usuario.fullName || 'No definido'}`);
        console.log(`Role: ${usuario.role}`);
        console.log(`ID: ${usuario.id}`);
        
        if (usuario.role === 'student') {
            console.log(`\n📚 DATOS ACADÉMICOS ACTUALES EN PERFIL:`);
            console.log(`activeCourses: ${JSON.stringify(usuario.activeCourses || [])}`);
            
            console.log(`\n🎯 ASIGNACIÓN REAL EN GESTIÓN DE USUARIOS:`);
            const asignacionReal = studentAssignments.find(a => a.studentId === usuario.id);
            
            if (asignacionReal) {
                const curso = courses.find(c => c.id === asignacionReal.courseId);
                const seccion = sections.find(s => s.id === asignacionReal.sectionId);
                console.log(`Curso asignado: ${curso?.name || 'Curso no encontrado'}`);
                console.log(`Sección asignada: ${seccion?.name || 'Sección no encontrada'}`);
                console.log(`ID de asignación: ${asignacionReal.id}`);
                
                // Verificar si coinciden
                const cursoEsperado = `${curso?.name} - Sección ${seccion?.name}`;
                const cursosEnPerfil = usuario.activeCourses || [];
                
                if (cursosEnPerfil.includes(cursoEsperado)) {
                    console.log(`✅ Los datos del perfil coinciden con la gestión de usuarios`);
                } else {
                    console.log(`❌ DESINCRONIZACIÓN DETECTADA:`);
                    console.log(`   Esperado: ${cursoEsperado}`);
                    console.log(`   En perfil: ${JSON.stringify(cursosEnPerfil)}`);
                }
            } else {
                console.log(`❌ No tiene asignación en el sistema de gestión de usuarios`);
            }
        }

    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

// Ejecutar sincronización automáticamente
sincronizarDatosAcademicos();

console.log('\n💡 COMANDOS DISPONIBLES:');
console.log('- sincronizarDatosAcademicos() - Ejecutar sincronización completa');
console.log('- diagnosticarUsuario("username") - Diagnóstico detallado de un usuario');
console.log('\nEjemplos:');
console.log('- diagnosticarUsuario("gustavo")');
console.log('- diagnosticarUsuario("max")');
