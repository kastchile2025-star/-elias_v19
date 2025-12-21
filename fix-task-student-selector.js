/**
 * DIAGNÓSTICO Y CORRECCIÓN ESPECÍFICA: Estudiantes no aparecen en selector de tareas
 * 
 * Este script diagnostica y corrige específicamente el problema donde los estudiantes
 * no aparecen cuando un profesor intenta crear una tarea con "Estudiantes específicos"
 */

console.log('🔍 DIAGNÓSTICO ESPECÍFICO: Estudiantes en Selector de Tareas');
console.log('============================================================');

function diagnosticarSelectorEstudiantes() {
    try {
        // 1. Verificar autenticación del profesor
        const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
        const currentUser = auth.user;
        
        console.log('\n🔐 PASO 1: VERIFICAR PROFESOR ACTUAL');
        console.log('===================================');
        
        if (!currentUser) {
            console.log('❌ ERROR: No hay usuario logueado');
            console.log('💡 SOLUCIÓN: Haz login como profesor primero');
            return false;
        }
        
        console.log(`✅ Usuario: ${currentUser.displayName || currentUser.username}`);
        console.log(`   • ID: ${currentUser.id}`);
        console.log(`   • Username: ${currentUser.username}`);
        console.log(`   • Rol: ${currentUser.role}`);
        
        if (currentUser.role !== 'teacher' && currentUser.role !== 'profesor') {
            console.log('❌ ERROR: Usuario no es profesor');
            console.log('💡 SOLUCIÓN: Login con cuenta de profesor');
            return false;
        }

        // 2. Cargar todos los datos del sistema
        console.log('\n📊 PASO 2: CARGAR DATOS DEL SISTEMA');
        console.log('==================================');
        
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
        console.log(`   • Estudiantes: ${estudiantes.length}`);

        // 3. Verificar asignaciones del profesor
        console.log('\n👨‍🏫 PASO 3: ASIGNACIONES DEL PROFESOR');
        console.log('====================================');
        
        const asignacionesProfesor = teacherAssignments.filter(ta => 
            ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username
        );
        
        console.log(`   • Asignaciones encontradas: ${asignacionesProfesor.length}`);
        
        if (asignacionesProfesor.length === 0) {
            console.log('❌ PROBLEMA CRÍTICO: Profesor sin asignaciones de sección');
            console.log('💡 CAUSA: El profesor no está asignado a ninguna sección en Gestión de Usuarios');
            console.log('🔧 EJECUTANDO CORRECCIÓN AUTOMÁTICA...');
            return asignarProfesorATodasLasSecciones(currentUser, sections, teacherAssignments);
        }
        
        console.log('✅ Asignaciones del profesor:');
        asignacionesProfesor.forEach((asig, index) => {
            const seccion = sections.find(s => s.id === asig.sectionId);
            const curso = seccion ? courses.find(c => c.id === seccion.courseId) : null;
            console.log(`   ${index + 1}. ${curso?.name || 'Curso N/A'} - Sección ${seccion?.name || 'N/A'}: ${asig.subjectName}`);
        });

        // 4. Simular obtención de cursos disponibles (como en getAvailableCoursesWithNames)
        console.log('\n📚 PASO 4: CURSOS DISPONIBLES PARA EL PROFESOR');
        console.log('==============================================');
        
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
        
        console.log(`   • Cursos disponibles: ${cursosDisponibles.length}`);
        cursosDisponibles.forEach((curso, index) => {
            console.log(`   ${index + 1}. ${curso.name} (courseId: ${curso.courseId}, sectionId: ${curso.sectionId})`);
        });

        if (cursosDisponibles.length === 0) {
            console.log('❌ PROBLEMA: No se pueden generar cursos disponibles');
            console.log('💡 CAUSA: Las asignaciones del profesor no referencian secciones válidas');
            return false;
        }

        // 5. Para cada curso disponible, probar getStudentsForCourse
        console.log('\n🎯 PASO 5: SIMULAR getStudentsForCourse PARA CADA CURSO');
        console.log('====================================================');
        
        let problemaEncontrado = false;
        
        cursosDisponibles.forEach((curso, index) => {
            console.log(`\n   ${index + 1}. Probando: ${curso.name}`);
            console.log(`      • Course ID: ${curso.courseId}`);
            console.log(`      • Section ID: ${curso.sectionId}`);
            
            // Verificar que el profesor está asignado a esta sección específica
            const profesorAsignadoASeccion = teacherAssignments.some(ta => 
                (ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username) && 
                ta.sectionId === curso.sectionId
            );
            
            console.log(`      • ¿Profesor asignado a sección?: ${profesorAsignadoASeccion ? '✅' : '❌'}`);
            
            if (!profesorAsignadoASeccion) {
                console.log(`      ❌ PROBLEMA: Profesor no asignado a sección ${curso.sectionId}`);
                problemaEncontrado = true;
                return;
            }
            
            // Obtener estudiantes asignados a esta sección
            const estudiantesEnSeccion = studentAssignments
                .filter(sa => sa.sectionId === curso.sectionId)
                .map(sa => sa.studentId);
            
            console.log(`      • Estudiantes en sección: ${estudiantesEnSeccion.length}`);
            
            if (estudiantesEnSeccion.length === 0) {
                console.log(`      ❌ PROBLEMA: No hay estudiantes asignados a sección ${curso.sectionId}`);
                problemaEncontrado = true;
                return;
            }
            
            // Obtener datos completos de estudiantes
            const estudiantesCompletos = users.filter(u => 
                (u.role === 'student' || u.role === 'estudiante') && 
                estudiantesEnSeccion.includes(u.id)
            );
            
            console.log(`      • Estudiantes válidos: ${estudiantesCompletos.length}`);
            
            if (estudiantesCompletos.length === 0) {
                console.log(`      ❌ PROBLEMA: Estudiantes no encontrados en tabla users`);
                problemaEncontrado = true;
                return;
            }
            
            console.log(`      ✅ ÉXITO: ${estudiantesCompletos.length} estudiantes disponibles`);
            estudiantesCompletos.forEach((est, idx) => {
                console.log(`         ${idx + 1}. ${est.username} (@${est.displayName || est.name})`);
            });
        });

        // 6. Resultado del diagnóstico
        console.log('\n🎯 RESULTADO DEL DIAGNÓSTICO');
        console.log('============================');
        
        if (!problemaEncontrado) {
            console.log('✅ TODO PARECE ESTAR CORRECTO');
            console.log('💡 Si aún no aparecen estudiantes:');
            console.log('   1. Recarga la página completamente (Ctrl+F5)');
            console.log('   2. Abre consola y busca errores JavaScript');
            console.log('   3. Verifica que estás seleccionando el curso correcto');
            console.log('   4. Verifica que seleccionas "Estudiantes específicos"');
        } else {
            console.log('❌ PROBLEMAS ENCONTRADOS');
            console.log('🔧 Ejecutando corrección automática...');
            return corregirAsignacionesCompletas();
        }

        return !problemaEncontrado;

    } catch (error) {
        console.error('❌ ERROR en diagnóstico:', error);
        return false;
    }
}

// Función para asignar profesor a todas las secciones existentes
function asignarProfesorATodasLasSecciones(profesor, sections, teacherAssignments) {
    console.log('\n🔧 ASIGNANDO PROFESOR A TODAS LAS SECCIONES...');
    
    const materiasBasicas = ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales'];
    let asignacionesCreadas = 0;
    
    sections.forEach(seccion => {
        materiasBasicas.forEach(materia => {
            // Verificar si ya existe la asignación
            const existeAsignacion = teacherAssignments.some(ta => 
                (ta.teacherId === profesor.id || ta.teacherUsername === profesor.username) &&
                ta.sectionId === seccion.id && 
                ta.subjectName === materia
            );
            
            if (!existeAsignacion) {
                const ahora = new Date();
                teacherAssignments.push({
                    id: `ta-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    teacherId: profesor.id,
                    teacherUsername: profesor.username,
                    sectionId: seccion.id,
                    subjectName: materia,
                    assignedAt: ahora.toISOString(),
                    createdAt: ahora.toISOString(),
                    source: 'auto-fix-selector'
                });
                asignacionesCreadas++;
            }
        });
    });
    
    if (asignacionesCreadas > 0) {
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
        console.log(`✅ Creadas ${asignacionesCreadas} asignaciones para ${profesor.username}`);
        console.log('🔄 Ejecutando diagnóstico nuevamente...');
        return diagnosticarSelectorEstudiantes();
    }
    
    return false;
}

// Función para corrección completa de asignaciones
function corregirAsignacionesCompletas() {
    console.log('\n🔧 CORRECCIÓN COMPLETA DE ASIGNACIONES...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        let teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');
        
        console.log('1. Verificando estudiantes sin asignación a secciones...');
        
        let estudiantesCorregidos = 0;
        estudiantes.forEach((estudiante, index) => {
            const tieneAsignacion = studentAssignments.some(sa => sa.studentId === estudiante.id);
            
            if (!tieneAsignacion) {
                // Asignar a la primera sección disponible (distribución circular)
                const seccionIndex = index % sections.length;
                const seccionAsignada = sections[seccionIndex];
                
                if (seccionAsignada) {
                    const ahora = new Date();
                    studentAssignments.push({
                        id: `sa-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        studentId: estudiante.id,
                        courseId: seccionAsignada.courseId,
                        sectionId: seccionAsignada.id,
                        createdAt: ahora.toISOString(),
                        assignedAt: ahora.toISOString(),
                        source: 'auto-fix-complete'
                    });
                    
                    // Actualizar perfil del estudiante
                    const curso = courses.find(c => c.id === seccionAsignada.courseId);
                    if (curso) {
                        estudiante.activeCourses = [`${curso.name} - Sección ${seccionAsignada.name}`];
                    }
                    
                    estudiantesCorregidos++;
                    console.log(`   ✅ ${estudiante.username} -> ${curso?.name} - Sección ${seccionAsignada.name}`);
                }
            }
        });
        
        console.log('2. Verificando profesores sin asignaciones...');
        
        let profesoresCorregidos = 0;
        const materiasBasicas = ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales'];
        
        profesores.forEach(profesor => {
            const tieneAsignaciones = teacherAssignments.some(ta => 
                ta.teacherId === profesor.id || ta.teacherUsername === profesor.username
            );
            
            if (!tieneAsignaciones) {
                sections.forEach(seccion => {
                    materiasBasicas.forEach(materia => {
                        const ahora = new Date();
                        teacherAssignments.push({
                            id: `ta-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            teacherId: profesor.id,
                            teacherUsername: profesor.username,
                            sectionId: seccion.id,
                            subjectName: materia,
                            assignedAt: ahora.toISOString(),
                            createdAt: ahora.toISOString(),
                            source: 'auto-fix-complete'
                        });
                    });
                });
                profesoresCorregidos++;
                console.log(`   ✅ ${profesor.username} asignado a todas las secciones`);
            }
        });
        
        // Guardar cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
        
        console.log('\n🎉 CORRECCIÓN COMPLETADA:');
        console.log(`   ✅ Estudiantes corregidos: ${estudiantesCorregidos}`);
        console.log(`   ✅ Profesores corregidos: ${profesoresCorregidos}`);
        console.log(`   📊 Total asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`   📊 Total asignaciones profesores: ${teacherAssignments.length}`);
        
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('   1. 🔄 Recarga la página (Ctrl+F5)');
        console.log('   2. 👨‍🏫 Haz login como profesor');
        console.log('   3. 📝 Ve a Tareas > Nueva Tarea');
        console.log('   4. 🎯 Selecciona curso y "Estudiantes específicos"');
        console.log('   5. ✅ Los estudiantes deberían aparecer ahora');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en corrección completa:', error);
        return false;
    }
}

// Función para mostrar estado detallado por sección
function mostrarEstadoPorSeccion() {
    console.log('\n🏫 ESTADO DETALLADO POR SECCIÓN');
    console.log('==============================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    
    sections.forEach(seccion => {
        const curso = courses.find(c => c.id === seccion.courseId);
        const estudiantesEnSeccion = studentAssignments.filter(sa => sa.sectionId === seccion.id);
        const profesoresEnSeccion = teacherAssignments.filter(ta => ta.sectionId === seccion.id);
        
        console.log(`\n🏫 ${curso?.name || 'Curso N/A'} - Sección ${seccion.name}:`);
        console.log(`   📍 Section ID: ${seccion.id}`);
        console.log(`   👥 Estudiantes: ${estudiantesEnSeccion.length}`);
        console.log(`   👨‍🏫 Profesores: ${profesoresEnSeccion.length}`);
        
        if (estudiantesEnSeccion.length > 0) {
            console.log(`   📋 Estudiantes:`);
            estudiantesEnSeccion.forEach((sa, index) => {
                const estudiante = users.find(u => u.id === sa.studentId);
                console.log(`      ${index + 1}. ${estudiante?.username || 'N/A'} (${estudiante?.displayName || 'N/A'})`);
            });
        }
        
        if (profesoresEnSeccion.length > 0) {
            const profesoresUnicos = [...new Set(profesoresEnSeccion.map(ta => ta.teacherUsername))];
            console.log(`   📋 Profesores: ${profesoresUnicos.join(', ')}`);
        }
    });
}

// Función específica para limpiar fechas inválidas que causan RangeError
function limpiarFechasInvalidasUrgente() {
    console.log('🚨 LIMPIEZA URGENTE: Fechas inválidas que causan RangeError');
    console.log('=========================================================');
    
    try {
        const ahoraValido = new Date().toISOString();
        let cambiosRealizados = 0;

        // Limpiar usuarios
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        users.forEach(user => {
            if (!user.createdAt || isNaN(new Date(user.createdAt).getTime())) {
                user.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!user.updatedAt || isNaN(new Date(user.updatedAt).getTime())) {
                user.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Limpiar cursos
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        courses.forEach(course => {
            if (!course.createdAt || isNaN(new Date(course.createdAt).getTime())) {
                course.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!course.updatedAt || isNaN(new Date(course.updatedAt).getTime())) {
                course.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Limpiar secciones
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        sections.forEach(section => {
            if (!section.createdAt || isNaN(new Date(section.createdAt).getTime())) {
                section.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!section.updatedAt || isNaN(new Date(section.updatedAt).getTime())) {
                section.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Limpiar asignaciones de estudiantes
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        studentAssignments.forEach(assignment => {
            if (!assignment.createdAt || isNaN(new Date(assignment.createdAt).getTime())) {
                assignment.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!assignment.assignedAt || isNaN(new Date(assignment.assignedAt).getTime())) {
                assignment.assignedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Limpiar asignaciones de profesores
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        teacherAssignments.forEach(assignment => {
            if (!assignment.createdAt || isNaN(new Date(assignment.createdAt).getTime())) {
                assignment.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!assignment.assignedAt || isNaN(new Date(assignment.assignedAt).getTime())) {
                assignment.assignedAt = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Limpiar tareas que puedan tener fechas inválidas
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        tasks.forEach(task => {
            if (!task.createdAt || isNaN(new Date(task.createdAt).getTime())) {
                task.createdAt = ahoraValido;
                cambiosRealizados++;
            }
            if (!task.updatedAt || isNaN(new Date(task.updatedAt).getTime())) {
                task.updatedAt = ahoraValido;
                cambiosRealizados++;
            }
            if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
                task.dueDate = ahoraValido;
                cambiosRealizados++;
            }
        });

        // Guardar todos los cambios
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-courses', JSON.stringify(courses));
            localStorage.setItem('smart-student-sections', JSON.stringify(sections));
            localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
            localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
            localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));

            console.log(`✅ Se corrigieron ${cambiosRealizados} fechas inválidas`);
        } else {
            console.log('ℹ️ No se encontraron fechas inválidas');
        }

        console.log('🎉 Limpieza urgente completada');
        console.log('💡 RECARGA LA PÁGINA AHORA (Ctrl+F5) para eliminar el RangeError');
        
        return true;

    } catch (error) {
        console.error('❌ Error limpiando fechas:', error);
        return false;
    }
}

// EJECUTAR LIMPIEZA URGENTE PRIMERO
console.log('🚨 EJECUTANDO LIMPIEZA URGENTE DE FECHAS INVÁLIDAS...\n');
limpiarFechasInvalidasUrgente();

console.log('\n⏳ Esperando 2 segundos antes del diagnóstico...');
setTimeout(() => {
    console.log('\n🚀 Ejecutando diagnóstico del selector de estudiantes...\n');
    const resultado = diagnosticarSelectorEstudiantes();
}, 2000);

// Hacer funciones disponibles globalmente
window.diagnosticarSelectorEstudiantes = diagnosticarSelectorEstudiantes;
window.corregirAsignacionesCompletas = corregirAsignacionesCompletas;
window.mostrarEstadoPorSeccion = mostrarEstadoPorSeccion;
window.limpiarFechasInvalidasUrgente = limpiarFechasInvalidasUrgente;

console.log('\n🎯 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('• limpiarFechasInvalidasUrgente() - 🚨 URGENTE: Corregir fechas que causan RangeError');
console.log('• diagnosticarSelectorEstudiantes() - Diagnóstico completo del problema');
console.log('• corregirAsignacionesCompletas() - Corrección completa de asignaciones');
console.log('• mostrarEstadoPorSeccion() - Ver estado detallado por sección');
