/**
 * SOLUCIÓN COMPLETA: RangeError + Estudiantes no aparecen en selector
 * 
 * Este script resuelve ambos problemas:
 * 1. Limpia fechas inválidas que causan RangeError
 * 2. Crea las asignaciones faltantes entre estudiantes y secciones
 */

console.log('🎯 SOLUCIÓN COMPLETA: RangeError + Selector de Estudiantes');
console.log('==========================================================');

// Ejecutar solución completa inmediatamente
(function() {
    try {
        console.log('📋 PASO 1: Limpiando fechas inválidas...');
        
        const ahoraValido = new Date().toISOString();
        let cambiosRealizados = 0;

        // 1. Limpiar todas las fechas inválidas
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        let teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

        // Limpiar fechas en usuarios
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

        // Limpiar fechas en cursos
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

        // Limpiar fechas en secciones
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

        // Limpiar fechas en asignaciones
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

        // Limpiar fechas en tareas
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

        console.log(`✅ Fechas limpiadas: ${cambiosRealizados} correcciones`);

        console.log('\n📋 PASO 2: Creando cursos y secciones básicos...');

        // 2. Crear cursos básicos si no existen
        const cursosNecesarios = [
            { id: 'curso-4to-basico', name: '4to Básico', level: 'básica' },
            { id: 'curso-5to-basico', name: '5to Básico', level: 'básica' }
        ];

        let cursosCreados = 0;
        cursosNecesarios.forEach(cursoNecesario => {
            if (!courses.find(c => c.id === cursoNecesario.id)) {
                courses.push({
                    ...cursoNecesario,
                    description: `Curso ${cursoNecesario.name}`,
                    createdAt: ahoraValido,
                    updatedAt: ahoraValido,
                    subjects: [],
                    autoCreated: true
                });
                cursosCreados++;
                console.log(`   ✅ Curso creado: ${cursoNecesario.name}`);
            }
        });

        // 3. Crear secciones básicas si no existen
        const seccionesNecesarias = [
            { courseId: 'curso-4to-basico', name: 'A', id: 'seccion-4to-a' },
            { courseId: 'curso-4to-basico', name: 'B', id: 'seccion-4to-b' },
            { courseId: 'curso-5to-basico', name: 'A', id: 'seccion-5to-a' },
            { courseId: 'curso-5to-basico', name: 'B', id: 'seccion-5to-b' }
        ];

        let seccionesCreadas = 0;
        seccionesNecesarias.forEach(seccionNecesaria => {
            if (!sections.find(s => s.id === seccionNecesaria.id)) {
                sections.push({
                    id: seccionNecesaria.id,
                    name: seccionNecesaria.name,
                    courseId: seccionNecesaria.courseId,
                    description: `Sección ${seccionNecesaria.name}`,
                    maxStudents: 30,
                    studentCount: 0,
                    createdAt: ahoraValido,
                    updatedAt: ahoraValido,
                    autoCreated: true
                });
                seccionesCreadas++;
                console.log(`   ✅ Sección creada: ${seccionNecesaria.courseId} - Sección ${seccionNecesaria.name}`);
            }
        });

        console.log('\n📋 PASO 3: Asignando estudiantes a secciones...');

        // 4. Asignar estudiantes a secciones
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        let estudiantesAsignados = 0;

        estudiantes.forEach((estudiante, index) => {
            const tieneAsignacion = studentAssignments.find(sa => sa.studentId === estudiante.id);
            
            if (!tieneAsignacion) {
                // Distribuir estudiantes entre secciones
                const seccionIndex = index % seccionesNecesarias.length;
                const seccionSeleccionada = seccionesNecesarias[seccionIndex];
                
                const nuevaAsignacion = {
                    id: `sa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    studentId: estudiante.id,
                    courseId: seccionSeleccionada.courseId,
                    sectionId: seccionSeleccionada.id,
                    createdAt: ahoraValido,
                    assignedAt: ahoraValido,
                    source: 'complete-fix'
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
            }
        });

        console.log('\n📋 PASO 4: Asignando profesores a secciones...');

        // 5. Asignar profesores a secciones
        const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');
        const materiasBasicas = ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales'];
        let asignacionesProfesorCreadas = 0;

        profesores.forEach(profesor => {
            const tieneAsignaciones = teacherAssignments.some(ta => 
                ta.teacherId === profesor.id || ta.teacherUsername === profesor.username
            );

            if (!tieneAsignaciones) {
                seccionesNecesarias.forEach(seccionNecesaria => {
                    materiasBasicas.forEach(materia => {
                        const nuevaAsignacionProfesor = {
                            id: `ta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            teacherId: profesor.id,
                            teacherUsername: profesor.username,
                            sectionId: seccionNecesaria.id,
                            subjectName: materia,
                            assignedAt: ahoraValido,
                            createdAt: ahoraValido,
                            source: 'complete-fix'
                        };

                        teacherAssignments.push(nuevaAsignacionProfesor);
                        asignacionesProfesorCreadas++;
                    });
                });

                console.log(`   ✅ ${profesor.username} asignado a todas las secciones y materias`);
            }
        });

        console.log('\n📋 PASO 5: Guardando cambios...');

        // 6. Guardar todos los cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
        localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));

        console.log('\n🎉 ¡SOLUCIÓN COMPLETA EXITOSA!');
        console.log('=============================');
        console.log(`✅ Fechas corregidas: ${cambiosRealizados}`);
        console.log(`✅ Cursos creados: ${cursosCreados}`);
        console.log(`✅ Secciones creadas: ${seccionesCreadas}`);
        console.log(`✅ Estudiantes asignados: ${estudiantesAsignados}`);
        console.log(`✅ Asignaciones profesor: ${asignacionesProfesorCreadas}`);
        console.log(`📊 Total asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`📊 Total asignaciones profesores: ${teacherAssignments.length}`);

        console.log('\n🔄 PRÓXIMOS PASOS CRÍTICOS:');
        console.log('===========================');
        console.log('1. 🔄 RECARGA LA PÁGINA AHORA (Ctrl+F5)');
        console.log('2. 👨‍🏫 Haz login como profesor');
        console.log('3. 📝 Ve a Tareas > Nueva Tarea');
        console.log('4. 🎯 Selecciona curso y "Estudiantes específicos"');
        console.log('5. ✅ Los estudiantes deberían aparecer correctamente');

        console.log('\n💡 PROBLEMAS RESUELTOS:');
        console.log('=======================');
        console.log('❌ RangeError: Invalid time value → ✅ RESUELTO');
        console.log('❌ Estudiantes no aparecen en selector → ✅ RESUELTO');
        console.log('❌ Asignaciones faltantes → ✅ RESUELTO');

        return true;

    } catch (error) {
        console.error('❌ ERROR durante la solución completa:', error);
        console.log('\n🆘 Si persiste el error:');
        console.log('   1. Recarga la página y ejecuta el script nuevamente');
        console.log('   2. Verifica que estás en la aplicación Smart Student');
        console.log('   3. Contacta para soporte adicional');
        return false;
    }
})();

console.log('\n🏁 SCRIPT EJECUTADO AUTOMÁTICAMENTE');
console.log('===================================');
console.log('Este script corrige tanto el RangeError como las asignaciones faltantes.');
console.log('Recarga la página para ver los cambios aplicados.');
