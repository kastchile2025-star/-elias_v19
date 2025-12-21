/**
 * DIAGNÓSTICO Y CORRECCIÓN ESPECÍFICA: Estudiantes no aparecen en selector
 * Ejecutar este script en la consola del navegador para corregir las asignaciones
 */

console.log('🎯 CORRECCIÓN ESPECÍFICA: Estudiantes en Selector de Tareas');
console.log('==========================================================');

// Ejecutar corrección inmediatamente
(function() {
    try {
        // Obtener usuario actual (profesor logueado)
        const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
        const currentUser = auth.user;
        
        if (!currentUser) {
            console.log('❌ ERROR: No hay usuario logueado. Haz login como profesor primero.');
            return false;
        }
        
        console.log(`✅ Profesor logueado: ${currentUser.username} (${currentUser.displayName || currentUser.name})`);
        
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        let teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        console.log('\n📊 ESTADO ACTUAL:');
        console.log(`   • Usuarios: ${users.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
        
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');
        
        console.log(`   • Estudiantes: ${estudiantes.length}`);
        console.log(`   • Profesores: ${profesores.length}`);
        
        const ahoraValido = new Date().toISOString();
        let cambiosRealizados = 0;
        
        // PASO 1: Crear cursos y secciones si no existen
        console.log('\n📋 PASO 1: Verificando cursos y secciones...');
        
        const cursosNecesarios = [
            { id: 'curso-4to-basico', name: '4to Básico', level: 'básica' },
            { id: 'curso-5to-basico', name: '5to Básico', level: 'básica' }
        ];
        
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
                console.log(`   ✅ Curso creado: ${cursoNecesario.name}`);
                cambiosRealizados++;
            }
        });
        
        const seccionesNecesarias = [
            { courseId: 'curso-4to-basico', name: 'A', id: 'seccion-4to-a' },
            { courseId: 'curso-4to-basico', name: 'B', id: 'seccion-4to-b' },
            { courseId: 'curso-5to-basico', name: 'A', id: 'seccion-5to-a' },
            { courseId: 'curso-5to-basico', name: 'B', id: 'seccion-5to-b' }
        ];
        
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
                console.log(`   ✅ Sección creada: ${seccionNecesaria.courseId} - Sección ${seccionNecesaria.name}`);
                cambiosRealizados++;
            }
        });
        
        // PASO 2: Asignar estudiantes a secciones (CRÍTICO)
        console.log('\n📋 PASO 2: Asignando estudiantes a secciones...');
        
        let estudiantesAsignados = 0;
        estudiantes.forEach((estudiante, index) => {
            const tieneAsignacion = studentAssignments.find(sa => sa.studentId === estudiante.id);
            
            if (!tieneAsignacion) {
                // Distribuir estudiantes entre secciones de manera circular
                const seccionIndex = index % seccionesNecesarias.length;
                const seccionSeleccionada = seccionesNecesarias[seccionIndex];
                
                const nuevaAsignacion = {
                    id: `sa-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    studentId: estudiante.id,
                    courseId: seccionSeleccionada.courseId,
                    sectionId: seccionSeleccionada.id,
                    createdAt: ahoraValido,
                    assignedAt: ahoraValido,
                    source: 'selector-fix'
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
                // Verificar que la asignación existente tenga courseId y sectionId válidos
                const asignacion = tieneAsignacion;
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (!curso || !seccion) {
                    console.log(`   ⚠️ Asignación inválida para ${estudiante.username}, corrigiendo...`);
                    // Reasignar a una sección válida
                    const seccionIndex = index % seccionesNecesarias.length;
                    const seccionSeleccionada = seccionesNecesarias[seccionIndex];
                    
                    asignacion.courseId = seccionSeleccionada.courseId;
                    asignacion.sectionId = seccionSeleccionada.id;
                    asignacion.updatedAt = ahoraValido;
                    
                    const cursoCorregido = courses.find(c => c.id === seccionSeleccionada.courseId);
                    const seccionCorregida = sections.find(s => s.id === seccionSeleccionada.id);
                    
                    if (cursoCorregido && seccionCorregida) {
                        estudiante.activeCourses = [`${cursoCorregido.name} - Sección ${seccionCorregida.name}`];
                        console.log(`   ✅ ${estudiante.username} corregido -> ${cursoCorregido.name} - Sección ${seccionCorregida.name}`);
                        estudiantesAsignados++;
                    }
                } else {
                    console.log(`   ℹ️ ${estudiante.username} ya tiene asignación válida: ${curso.name} - Sección ${seccion.name}`);
                }
            }
        });
        
        // PASO 3: Asignar profesor actual a todas las secciones (CRÍTICO)
        console.log('\n📋 PASO 3: Asignando profesor a secciones...');
        
        const materiasBasicas = ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales'];
        let asignacionesProfesorCreadas = 0;
        
        // Verificar si el profesor actual tiene asignaciones
        const asignacionesProfesorActual = teacherAssignments.filter(ta => 
            ta.teacherId === currentUser.id || ta.teacherUsername === currentUser.username
        );
        
        console.log(`   • Asignaciones actuales del profesor: ${asignacionesProfesorActual.length}`);
        
        if (asignacionesProfesorActual.length === 0) {
            console.log(`   ⚠️ Profesor ${currentUser.username} sin asignaciones, creando...`);
            
            seccionesNecesarias.forEach(seccionNecesaria => {
                materiasBasicas.forEach(materia => {
                    const nuevaAsignacionProfesor = {
                        id: `ta-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        teacherId: currentUser.id,
                        teacherUsername: currentUser.username,
                        sectionId: seccionNecesaria.id,
                        subjectName: materia,
                        assignedAt: ahoraValido,
                        createdAt: ahoraValido,
                        source: 'selector-fix'
                    };
                    
                    teacherAssignments.push(nuevaAsignacionProfesor);
                    asignacionesProfesorCreadas++;
                });
            });
            
            console.log(`   ✅ ${currentUser.username} asignado a todas las secciones`);
        }
        
        // Asignar otros profesores también
        profesores.forEach(profesor => {
            if (profesor.id !== currentUser.id) {
                const tieneAsignaciones = teacherAssignments.some(ta => 
                    ta.teacherId === profesor.id || ta.teacherUsername === profesor.username
                );
                
                if (!tieneAsignaciones) {
                    seccionesNecesarias.forEach(seccionNecesaria => {
                        materiasBasicas.forEach(materia => {
                            const nuevaAsignacionProfesor = {
                                id: `ta-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                teacherId: profesor.id,
                                teacherUsername: profesor.username,
                                sectionId: seccionNecesaria.id,
                                subjectName: materia,
                                assignedAt: ahoraValido,
                                createdAt: ahoraValido,
                                source: 'selector-fix'
                            };
                            
                            teacherAssignments.push(nuevaAsignacionProfesor);
                            asignacionesProfesorCreadas++;
                        });
                    });
                    
                    console.log(`   ✅ ${profesor.username} asignado a todas las secciones`);
                }
            }
        });
        
        // PASO 4: Guardar cambios
        console.log('\n📋 PASO 4: Guardando cambios...');
        
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));
        
        // PASO 5: Verificar resultado
        console.log('\n🎉 ¡CORRECCIÓN COMPLETADA EXITOSAMENTE!');
        console.log('=======================================');
        console.log(`✅ Estudiantes asignados: ${estudiantesAsignados}`);
        console.log(`✅ Asignaciones profesor creadas: ${asignacionesProfesorCreadas}`);
        console.log(`📊 Total asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`📊 Total asignaciones profesores: ${teacherAssignments.length}`);
        
        // Verificar que el curso seleccionado "5to Básico Sección A" tenga estudiantes
        const cursoSeleccionado = courses.find(c => c.name === '5to Básico');
        const seccionSeleccionada = sections.find(s => s.name === 'A' && s.courseId === cursoSeleccionado?.id);
        
        if (cursoSeleccionado && seccionSeleccionada) {
            const estudiantesEnCursoSeleccionado = studentAssignments.filter(sa => 
                sa.courseId === cursoSeleccionado.id && sa.sectionId === seccionSeleccionada.id
            );
            
            console.log(`\n🎯 VERIFICACIÓN ESPECÍFICA para "5to Básico Sección A":`);
            console.log(`   • Course ID: ${cursoSeleccionado.id}`);
            console.log(`   • Section ID: ${seccionSeleccionada.id}`);
            console.log(`   • Estudiantes asignados: ${estudiantesEnCursoSeleccionado.length}`);
            
            if (estudiantesEnCursoSeleccionado.length > 0) {
                console.log(`   ✅ ¡PERFECTO! Estudiantes encontrados en el curso seleccionado`);
                estudiantesEnCursoSeleccionado.forEach((sa, index) => {
                    const estudiante = users.find(u => u.id === sa.studentId);
                    console.log(`      ${index + 1}. ${estudiante?.username} (${estudiante?.displayName || estudiante?.name})`);
                });
            } else {
                console.log(`   ❌ PROBLEMA: No hay estudiantes en el curso seleccionado`);
            }
        }
        
        console.log('\n🔄 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. 🔄 RECARGA LA PÁGINA (Ctrl+F5)');
        console.log('2. 📝 Ve a Tareas > Nueva Tarea');
        console.log('3. 🎯 Selecciona "5to Básico Sección A"');
        console.log('4. 📋 Elige "Estudiantes específicos"');
        console.log('5. ✅ Los estudiantes deberían aparecer ahora');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR durante la corrección:', error);
        return false;
    }
})();

console.log('\n🎯 CORRECCIÓN ESPECÍFICA EJECUTADA');
console.log('==================================');
console.log('Este script corrige las asignaciones de estudiantes a secciones.');
console.log('Recarga la página para ver los cambios.');
