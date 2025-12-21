/**
 * DIAGNÓSTICO ESPECÍFICO: Problema con Estudiantes Específicos en Creación de Tareas
 * 
 * Este script diagnóstica paso a paso por qué no aparecen estudiantes al crear tareas
 */

console.log('🔍 DIAGNÓSTICO COMPLETO: Estudiantes Específicos en Tareas');
console.log('========================================================');

function diagnosticarProblemaEstudiantesEspecificos() {
    try {
        // 1. Verificar autenticación
        const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
        const currentUser = auth.user;
        
        console.log('\n🔐 PASO 1: VERIFICAR AUTENTICACIÓN');
        console.log('==================================');
        
        if (!currentUser) {
            console.log('❌ ERROR: No hay usuario logueado');
            console.log('💡 SOLUCIÓN: Haz login primero en http://localhost:9002');
            return false;
        }
        
        console.log(`✅ Usuario logueado: ${currentUser.displayName || currentUser.username}`);
        console.log(`   • Rol: ${currentUser.role}`);
        console.log(`   • ID: ${currentUser.id}`);
        console.log(`   • Username: ${currentUser.username}`);
        
        if (currentUser.role !== 'teacher' && currentUser.role !== 'profesor') {
            console.log('❌ ERROR: El usuario no es un profesor');
            console.log('💡 SOLUCIÓN: Haz login con una cuenta de profesor');
            return false;
        }

        // 2. Cargar todos los datos
        console.log('\n📊 PASO 2: CARGAR DATOS DEL SISTEMA');
        console.log('===================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        console.log(`   • Usuarios totales: ${users.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
        
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');
        
        console.log(`   • Estudiantes: ${estudiantes.length}`);
        console.log(`   • Profesores: ${profesores.length}`);

        // 3. Verificar asignaciones del profesor actual
        console.log('\n👨‍🏫 PASO 3: VERIFICAR ASIGNACIONES DEL PROFESOR ACTUAL');
        console.log('====================================================');
        
        const asignacionesProfesor = teacherAssignments.filter(ta => 
            ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username
        );
        
        console.log(`   • Asignaciones encontradas: ${asignacionesProfesor.length}`);
        
        if (asignacionesProfesor.length === 0) {
            console.log('❌ PROBLEMA CRÍTICO: El profesor NO tiene asignaciones');
            console.log('💡 SOLUCIÓN: El profesor debe ser asignado a secciones en Admin > Gestión de Usuarios > Asignaciones');
            console.log('\n🔧 Para solucionarlo automáticamente, ejecuta:');
            console.log('   crearAsignacionesProfesorAutomaticas()');
            return false;
        }
        
        console.log('✅ El profesor tiene asignaciones:');
        asignacionesProfesor.forEach((asig, index) => {
            const seccion = sections.find(s => s.id === asig.sectionId);
            const curso = seccion ? courses.find(c => c.id === seccion.courseId) : null;
            
            console.log(`   ${index + 1}. ${curso?.name || 'Curso desconocido'} - Sección ${seccion?.name || 'N/A'}: ${asig.subjectName}`);
        });

        // 4. Verificar estudiantes en las secciones del profesor
        console.log('\n👥 PASO 4: VERIFICAR ESTUDIANTES EN LAS SECCIONES DEL PROFESOR');
        console.log('==============================================================');
        
        const seccionesDelProfesor = [...new Set(asignacionesProfesor.map(a => a.sectionId))];
        let totalEstudiantesEnSecciones = 0;
        
        seccionesDelProfesor.forEach(sectionId => {
            const seccion = sections.find(s => s.id === sectionId);
            const curso = seccion ? courses.find(c => c.id === seccion.courseId) : null;
            
            console.log(`\n🏫 Sección: ${curso?.name || 'Curso desconocido'} - Sección ${seccion?.name || 'N/A'}`);
            console.log(`   • ID de sección: ${sectionId}`);
            
            const estudiantesEnEstaSeccion = studentAssignments.filter(sa => sa.sectionId === sectionId);
            console.log(`   • Estudiantes asignados: ${estudiantesEnEstaSeccion.length}`);
            
            if (estudiantesEnEstaSeccion.length === 0) {
                console.log('   ❌ PROBLEMA: No hay estudiantes asignados a esta sección');
            } else {
                console.log('   ✅ Estudiantes encontrados:');
                estudiantesEnEstaSeccion.forEach((sa, index) => {
                    const estudiante = users.find(u => u.id === sa.studentId);
                    console.log(`      ${index + 1}. ${estudiante?.username || 'Estudiante desconocido'} (${estudiante?.displayName || 'Sin nombre'})`);
                });
                totalEstudiantesEnSecciones += estudiantesEnEstaSeccion.length;
            }
        });
        
        if (totalEstudiantesEnSecciones === 0) {
            console.log('\n❌ PROBLEMA CRÍTICO: No hay estudiantes asignados a las secciones del profesor');
            console.log('💡 SOLUCIÓN: Los estudiantes deben ser asignados a secciones en Admin > Gestión de Usuarios > Asignaciones');
            console.log('\n🔧 Para solucionarlo automáticamente, ejecuta:');
            console.log('   asignarEstudiantesASeccionesAutomaticamente()');
            return false;
        }

        // 5. Simular la función getStudentsForCourse
        console.log('\n🎯 PASO 5: SIMULAR FUNCIÓN getStudentsForCourse');
        console.log('===============================================');
        
        // Obtener cursos disponibles para el profesor (simulando getAvailableCoursesWithNames)
        const cursosDisponibles = [];
        asignacionesProfesor.forEach(asig => {
            const seccion = sections.find(s => s.id === asig.sectionId);
            const curso = seccion ? courses.find(c => c.id === seccion.courseId) : null;
            
            if (curso && seccion) {
                const cursoSeccionId = `${curso.id}-${seccion.id}`;
                const existe = cursosDisponibles.find(c => c.id === cursoSeccionId);
                
                if (!existe) {
                    cursosDisponibles.push({
                        id: cursoSeccionId,
                        name: `${curso.name} Sección ${seccion.name}`,
                        courseId: curso.id,
                        sectionId: seccion.id,
                        originalCourseName: curso.name,
                        sectionName: seccion.name
                    });
                }
            }
        });
        
        console.log(`   • Cursos disponibles para crear tareas: ${cursosDisponibles.length}`);
        
        if (cursosDisponibles.length === 0) {
            console.log('❌ PROBLEMA: No se pueden generar cursos disponibles');
            return false;
        }
        
        console.log('✅ Cursos disponibles:');
        cursosDisponibles.forEach((curso, index) => {
            console.log(`   ${index + 1}. ${curso.name} (ID: ${curso.id})`);
        });
        
        // 6. Probar getStudentsForCourse para cada curso disponible
        console.log('\n🧪 PASO 6: PROBAR OBTENER ESTUDIANTES PARA CADA CURSO');
        console.log('====================================================');
        
        let todoFunciona = true;
        
        cursosDisponibles.forEach((curso, index) => {
            console.log(`\n   ${index + 1}. Probando curso: ${curso.name}`);
            console.log(`      • Course ID: ${curso.courseId}`);
            console.log(`      • Section ID: ${curso.sectionId}`);
            
            // Verificar que el profesor está asignado a esta sección
            const profesorAsignadoASeccion = teacherAssignments.some(ta => 
                (ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username) && 
                ta.sectionId === curso.sectionId
            );
            
            console.log(`      • ¿Profesor asignado a sección?: ${profesorAsignadoASeccion ? '✅' : '❌'}`);
            
            if (!profesorAsignadoASeccion) {
                console.log(`      ❌ PROBLEMA: Profesor no asignado a sección ${curso.sectionId}`);
                todoFunciona = false;
                return;
            }
            
            // Obtener estudiantes de esta sección
            const estudiantesEnSeccion = studentAssignments
                .filter(sa => sa.sectionId === curso.sectionId)
                .map(sa => sa.studentId);
            
            console.log(`      • Estudiantes en sección: ${estudiantesEnSeccion.length}`);
            
            if (estudiantesEnSeccion.length === 0) {
                console.log(`      ❌ PROBLEMA: No hay estudiantes en sección ${curso.sectionId}`);
                todoFunciona = false;
                return;
            }
            
            // Obtener datos completos de estudiantes
            const estudiantesCompletos = users.filter(u => 
                (u.role === 'student' || u.role === 'estudiante') && 
                estudiantesEnSeccion.includes(u.id)
            );
            
            console.log(`      • Estudiantes completos encontrados: ${estudiantesCompletos.length}`);
            
            if (estudiantesCompletos.length === 0) {
                console.log(`      ❌ PROBLEMA: No se pudieron obtener datos de estudiantes`);
                todoFunciona = false;
                return;
            }
            
            console.log(`      ✅ ÉXITO: ${estudiantesCompletos.length} estudiantes disponibles para tareas`);
            estudiantesCompletos.forEach((est, idx) => {
                console.log(`         ${idx + 1}. ${est.username} (${est.displayName || est.name})`);
            });
        });

        // 7. Resultado final
        console.log('\n🎉 RESULTADO FINAL DEL DIAGNÓSTICO');
        console.log('==================================');
        
        if (todoFunciona) {
            console.log('✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE');
            console.log('💡 Si aún no aparecen estudiantes en el selector:');
            console.log('   1. Recarga la página completamente (Ctrl+F5)');
            console.log('   2. Verifica que estás seleccionando el curso correcto');
            console.log('   3. Verifica que estás seleccionando "Estudiantes específicos"');
            console.log('   4. Abre la consola del navegador para ver mensajes de debug');
        } else {
            console.log('❌ PROBLEMAS ENCONTRADOS EN LA CONFIGURACIÓN');
            console.log('🔧 Ejecuta las funciones de corrección sugeridas arriba');
        }

        return todoFunciona;

    } catch (error) {
        console.error('❌ ERROR durante el diagnóstico:', error);
        return false;
    }
}

// Función para crear asignaciones de profesor automáticamente
function crearAsignacionesProfesorAutomaticas() {
    console.log('\n🔧 CREANDO ASIGNACIONES DE PROFESOR AUTOMÁTICAMENTE...');
    
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    const currentUser = auth.user;
    
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'profesor')) {
        console.log('❌ Error: Necesitas estar logueado como profesor');
        return false;
    }
    
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    let teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    
    // Materias básicas
    const materiasBasicas = [
        'Matemáticas',
        'Lenguaje y Comunicación', 
        'Ciencias Naturales',
        'Historia, Geografía y Ciencias Sociales'
    ];
    
    // Cursos típicos
    const cursosComunes = ['4to Básico', '5to Básico', '6to Básico'];
    
    let asignacionesCreadas = 0;
    
    cursosComunes.forEach(nombreCurso => {
        const curso = courses.find(c => c.name === nombreCurso);
        if (curso) {
            const secciones = sections.filter(s => s.courseId === curso.id);
            
            secciones.forEach(seccion => {
                materiasBasicas.forEach(materia => {
                    // Verificar si ya existe la asignación
                    const existeAsignacion = teacherAssignments.some(ta => 
                        (ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username) &&
                        ta.sectionId === seccion.id && 
                        ta.subjectName === materia
                    );
                    
                    if (!existeAsignacion) {
                        teacherAssignments.push({
                            id: `teacher-auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            teacherId: currentUser.id,
                            teacherUsername: currentUser.username,
                            sectionId: seccion.id,
                            subjectName: materia,
                            assignedAt: new Date().toISOString(),
                            autoCreated: true
                        });
                        
                        console.log(`   ➕ ${nombreCurso} - Sección ${seccion.name}: ${materia}`);
                        asignacionesCreadas++;
                    }
                });
            });
        }
    });
    
    if (asignacionesCreadas > 0) {
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
        console.log(`✅ Creadas ${asignacionesCreadas} asignaciones de profesor`);
        console.log('🔄 Ejecuta diagnosticarProblemaEstudiantesEspecificos() nuevamente');
    } else {
        console.log('ℹ️ No se necesitaban crear asignaciones adicionales');
    }
    
    return asignacionesCreadas > 0;
}

// Función para asignar estudiantes a secciones automáticamente
function asignarEstudiantesASeccionesAutomaticamente() {
    console.log('\n🔧 ASIGNANDO ESTUDIANTES A SECCIONES AUTOMÁTICAMENTE...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
    
    let asignacionesCreadas = 0;
    
    estudiantes.forEach(estudiante => {
        // Verificar si ya tiene asignación
        const tieneAsignacion = studentAssignments.some(sa => sa.studentId === estudiante.id);
        
        if (!tieneAsignacion) {
            // Asignar a 4to Básico Sección A por defecto
            const curso = courses.find(c => c.name === '4to Básico');
            const seccion = sections.find(s => s.courseId === curso?.id && s.name === 'A');
            
            if (curso && seccion) {
                studentAssignments.push({
                    id: `student-auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    studentId: estudiante.id,
                    courseId: curso.id,
                    sectionId: seccion.id,
                    createdAt: new Date().toISOString(),
                    autoAssigned: true
                });
                
                // Actualizar perfil del estudiante
                estudiante.activeCourses = [`${curso.name} - Sección ${seccion.name}`];
                
                console.log(`   ➕ ${estudiante.username} -> ${curso.name} - Sección ${seccion.name}`);
                asignacionesCreadas++;
            }
        }
    });
    
    if (asignacionesCreadas > 0) {
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        console.log(`✅ Asignados ${asignacionesCreadas} estudiantes a secciones`);
        console.log('🔄 Ejecuta diagnosticarProblemaEstudiantesEspecificos() nuevamente');
    } else {
        console.log('ℹ️ Todos los estudiantes ya tienen asignaciones');
    }
    
    return asignacionesCreadas > 0;
}

// Ejecutar diagnóstico automáticamente
console.log('🚀 Ejecutando diagnóstico automático...\n');
const resultado = diagnosticarProblemaEstudiantesEspecificos();

// Hacer funciones disponibles globalmente
window.diagnosticarProblemaEstudiantesEspecificos = diagnosticarProblemaEstudiantesEspecificos;
window.crearAsignacionesProfesorAutomaticas = crearAsignacionesProfesorAutomaticas;
window.asignarEstudiantesASeccionesAutomaticamente = asignarEstudiantesASeccionesAutomaticamente;

console.log('\n🎯 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('• diagnosticarProblemaEstudiantesEspecificos() - Ejecutar diagnóstico completo');
console.log('• crearAsignacionesProfesorAutomaticas() - Crear asignaciones de profesor');
console.log('• asignarEstudiantesASeccionesAutomaticamente() - Asignar estudiantes a secciones');
