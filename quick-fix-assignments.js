/**
 * CORRECCIÓN RÁPIDA: Asegurar que existe la tabla smart-student-student-assignments
 * con todos los estudiantes correctamente asignados a secciones específicas
 */

console.log('⚡ CORRECCIÓN RÁPIDA: Asignaciones de Estudiantes a Secciones');
console.log('===========================================================');

function correccionRapidaAsignaciones() {
    try {
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        let sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        let teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');

        // PRIMERO: Limpiar fechas inválidas en todos los datos existentes
        console.log('🧹 Limpiando fechas inválidas...');
        const ahoraValido = new Date().toISOString();
        
        // Limpiar fechas en usuarios
        users.forEach(user => {
            if (!user.createdAt || isNaN(new Date(user.createdAt).getTime())) {
                user.createdAt = ahoraValido;
            }
            if (!user.updatedAt || isNaN(new Date(user.updatedAt).getTime())) {
                user.updatedAt = ahoraValido;
            }
        });

        // Limpiar fechas en cursos
        courses.forEach(course => {
            if (!course.createdAt || isNaN(new Date(course.createdAt).getTime())) {
                course.createdAt = ahoraValido;
            }
            if (!course.updatedAt || isNaN(new Date(course.updatedAt).getTime())) {
                course.updatedAt = ahoraValido;
            }
        });

        // Limpiar fechas en secciones
        sections.forEach(section => {
            if (!section.createdAt || isNaN(new Date(section.createdAt).getTime())) {
                section.createdAt = ahoraValido;
            }
            if (!section.updatedAt || isNaN(new Date(section.updatedAt).getTime())) {
                section.updatedAt = ahoraValido;
            }
        });

        // Limpiar fechas en asignaciones de estudiantes
        studentAssignments.forEach(assignment => {
            if (!assignment.createdAt || isNaN(new Date(assignment.createdAt).getTime())) {
                assignment.createdAt = ahoraValido;
            }
            if (!assignment.assignedAt || isNaN(new Date(assignment.assignedAt).getTime())) {
                assignment.assignedAt = ahoraValido;
            }
        });

        // Limpiar fechas en asignaciones de profesores
        teacherAssignments.forEach(assignment => {
            if (!assignment.createdAt || isNaN(new Date(assignment.createdAt).getTime())) {
                assignment.createdAt = ahoraValido;
            }
            if (!assignment.assignedAt || isNaN(new Date(assignment.assignedAt).getTime())) {
                assignment.assignedAt = ahoraValido;
            }
        });

        console.log('✅ Fechas limpiadas exitosamente');

        console.log('📊 Estado inicial:');
        console.log(`   • Usuarios: ${users.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);

        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');

        console.log(`   • Estudiantes: ${estudiantes.length}`);
        console.log(`   • Profesores: ${profesores.length}`);

        // 1. Crear cursos básicos si no existen
        const cursosNecesarios = [
            { id: 'curso-4to-basico', name: '4to Básico', level: 'básica' },
            { id: 'curso-5to-basico', name: '5to Básico', level: 'básica' }
        ];

        cursosNecesarios.forEach(cursoNecesario => {
            if (!courses.find(c => c.id === cursoNecesario.id)) {
                const ahora = new Date();
                courses.push({
                    ...cursoNecesario,
                    description: `Curso ${cursoNecesario.name}`,
                    createdAt: ahora.toISOString(),
                    updatedAt: ahora.toISOString(),
                    subjects: [],
                    autoCreated: true
                });
                console.log(`✅ Curso creado: ${cursoNecesario.name}`);
            }
        });

        // 2. Crear secciones básicas si no existen
        const seccionesNecesarias = [
            { courseId: 'curso-4to-basico', name: 'A', id: 'seccion-4to-a' },
            { courseId: 'curso-4to-basico', name: 'B', id: 'seccion-4to-b' },
            { courseId: 'curso-5to-basico', name: 'A', id: 'seccion-5to-a' },
            { courseId: 'curso-5to-basico', name: 'B', id: 'seccion-5to-b' }
        ];

        seccionesNecesarias.forEach(seccionNecesaria => {
            if (!sections.find(s => s.id === seccionNecesaria.id)) {
                const ahora = new Date();
                sections.push({
                    id: seccionNecesaria.id,
                    name: seccionNecesaria.name,
                    courseId: seccionNecesaria.courseId,
                    description: `Sección ${seccionNecesaria.name}`,
                    maxStudents: 30,
                    studentCount: 0,
                    createdAt: ahora.toISOString(),
                    updatedAt: ahora.toISOString(),
                    autoCreated: true
                });
                console.log(`✅ Sección creada: ${seccionNecesaria.courseId} - Sección ${seccionNecesaria.name}`);
            }
        });

        // 3. Asignar cada estudiante a una sección si no tiene asignación
        console.log('\n🎓 Procesando estudiantes...');
        let estudiantesAsignados = 0;

        estudiantes.forEach((estudiante, index) => {
            // Verificar si ya tiene asignación en student-assignments
            const tieneAsignacion = studentAssignments.find(sa => sa.studentId === estudiante.id);
            
            if (!tieneAsignacion) {
                // Distribuir estudiantes entre secciones
                const seccionIndex = index % seccionesNecesarias.length;
                const seccionSeleccionada = seccionesNecesarias[seccionIndex];
                
                // Crear asignación con fecha válida
                const ahora = new Date();
                const nuevaAsignacion = {
                    id: `sa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    studentId: estudiante.id,
                    courseId: seccionSeleccionada.courseId,
                    sectionId: seccionSeleccionada.id,
                    createdAt: ahora.toISOString(),
                    assignedAt: ahora.toISOString(),
                    source: 'quick-fix'
                };

                studentAssignments.push(nuevaAsignacion);

                // Actualizar perfil del estudiante
                const curso = courses.find(c => c.id === seccionSeleccionada.courseId);
                const seccion = sections.find(s => s.id === seccionSeleccionada.id);
                
                if (curso && seccion) {
                    estudiante.activeCourses = [`${curso.name} - Sección ${seccion.name}`];
                    
                    console.log(`   ✅ ${estudiante.username} -> ${curso.name} - Sección ${seccion.name}`);
                    estudiantesAsignados++;
                }
            } else {
                console.log(`   ℹ️ ${estudiante.username} ya tiene asignación`);
            }
        });

        // 4. Crear asignaciones de profesores básicas
        console.log('\n👨‍🏫 Procesando profesores...');
        let asignacionesProfesorCreadas = 0;

        const materiasBasicas = ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales'];

        profesores.forEach(profesor => {
            // Verificar si ya tiene asignaciones
            const tieneAsignaciones = teacherAssignments.some(ta => 
                ta.teacherId === profesor.id || ta.teacherUsername === profesor.username
            );

            if (!tieneAsignaciones) {
                // Asignar a todas las secciones con todas las materias
                seccionesNecesarias.forEach(seccionNecesaria => {
                    materiasBasicas.forEach(materia => {
                        const ahora = new Date();
                        const nuevaAsignacionProfesor = {
                            id: `ta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            teacherId: profesor.id,
                            teacherUsername: profesor.username,
                            sectionId: seccionNecesaria.id,
                            subjectName: materia,
                            assignedAt: ahora.toISOString(),
                            createdAt: ahora.toISOString(),
                            source: 'quick-fix'
                        };

                        teacherAssignments.push(nuevaAsignacionProfesor);
                        asignacionesProfesorCreadas++;
                    });
                });

                const curso4to = courses.find(c => c.id === 'curso-4to-basico');
                const curso5to = courses.find(c => c.id === 'curso-5to-basico');
                
                console.log(`   ✅ ${profesor.username} asignado a ${curso4to?.name} y ${curso5to?.name}`);
            } else {
                console.log(`   ℹ️ ${profesor.username} ya tiene asignaciones`);
            }
        });

        // 5. Guardar todos los cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));

        console.log('\n🎉 CORRECCIÓN COMPLETADA:');
        console.log(`   ✅ Estudiantes asignados: ${estudiantesAsignados}`);
        console.log(`   ✅ Asignaciones profesor creadas: ${asignacionesProfesorCreadas}`);
        console.log(`   📊 Total asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`   📊 Total asignaciones profesores: ${teacherAssignments.length}`);

        console.log('\n💡 PRÓXIMO PASO:');
        console.log('   🔄 Recarga la página y prueba crear una tarea');
        console.log('   🎯 Selecciona "Estudiantes específicos" - ahora deberían aparecer');

        return true;

    } catch (error) {
        console.error('❌ Error en corrección rápida:', error);
        return false;
    }
}

// Función para verificar el estado después de la corrección
function verificarEstadoFinal() {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

    console.log('\n🔍 VERIFICACIÓN DEL ESTADO FINAL:');
    console.log('================================');

    const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
    const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');

    console.log(`📊 Resumen:`);
    console.log(`   • Estudiantes: ${estudiantes.length}`);
    console.log(`   • Profesores: ${profesores.length}`);
    console.log(`   • Asignaciones estudiante-sección: ${studentAssignments.length}`);
    console.log(`   • Asignaciones profesor-sección: ${teacherAssignments.length}`);

    // Verificar cada estudiante
    console.log('\n👥 Estado de cada estudiante:');
    estudiantes.forEach((est, index) => {
        const asignacion = studentAssignments.find(sa => sa.studentId === est.id);
        
        if (asignacion) {
            const curso = courses.find(c => c.id === asignacion.courseId);
            const seccion = sections.find(s => s.id === asignacion.sectionId);
            console.log(`   ${index + 1}. ${est.username}: ✅ ${curso?.name} - Sección ${seccion?.name}`);
        } else {
            console.log(`   ${index + 1}. ${est.username}: ❌ Sin asignación`);
        }
    });

    // Verificar profesores
    console.log('\n👨‍🏫 Estado de cada profesor:');
    profesores.forEach((prof, index) => {
        const asignaciones = teacherAssignments.filter(ta => 
            ta.teacherId === prof.id || ta.teacherUsername === prof.username
        );
        console.log(`   ${index + 1}. ${prof.username}: ${asignaciones.length} asignaciones`);
    });

    // Verificar estructura por sección
    console.log('\n🏫 Estudiantes por sección:');
    sections.forEach(seccion => {
        const curso = courses.find(c => c.id === seccion.courseId);
        const estudiantesEnSeccion = studentAssignments.filter(sa => sa.sectionId === seccion.id);
        const profesoresEnSeccion = teacherAssignments.filter(ta => ta.sectionId === seccion.id);
        
        console.log(`   ${curso?.name} - Sección ${seccion.name}:`);
        console.log(`     👥 Estudiantes: ${estudiantesEnSeccion.length}`);
        console.log(`     👨‍🏫 Profesores: ${profesoresEnSeccion.length}`);
    });
}

// Función para limpiar fechas inválidas ÚNICAMENTE
function limpiarFechasInvalidas() {
    console.log('🧹 LIMPIANDO FECHAS INVÁLIDAS ÚNICAMENTE...');
    console.log('===========================================');
    
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

        // Guardar solo si hubo cambios
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-courses', JSON.stringify(courses));
            localStorage.setItem('smart-student-sections', JSON.stringify(sections));
            localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
            localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));

            console.log(`✅ Se corrigieron ${cambiosRealizados} fechas inválidas`);
        } else {
            console.log('ℹ️ No se encontraron fechas inválidas');
        }

        console.log('🎉 Limpieza de fechas completada');
        console.log('💡 Ahora puedes recargar la página sin errores');
        
        return true;

    } catch (error) {
        console.error('❌ Error limpiando fechas:', error);
        return false;
    }
}

// Ejecutar corrección automáticamente
console.log('🚀 Ejecutando corrección rápida...\n');

// Primero limpiar fechas inválidas
console.log('🔧 PASO 1: Limpiando fechas inválidas...');
limpiarFechasInvalidas();

// Luego ejecutar la corrección completa
console.log('\n🔧 PASO 2: Ejecutando corrección de asignaciones...');
const exito = correccionRapidaAsignaciones();

if (exito) {
    setTimeout(() => {
        verificarEstadoFinal();
    }, 1000);
}

// Hacer funciones disponibles globalmente
window.correccionRapidaAsignaciones = correccionRapidaAsignaciones;
window.verificarEstadoFinal = verificarEstadoFinal;
window.limpiarFechasInvalidas = limpiarFechasInvalidas;

console.log('\n🎯 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('• limpiarFechasInvalidas() - Solo corregir fechas problemáticas');
console.log('• correccionRapidaAsignaciones() - Corrección completa');
console.log('• verificarEstadoFinal() - Verificar estado después de corrección');
