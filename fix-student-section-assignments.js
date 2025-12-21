/**
 * SCRIPT DE CORRECCIÓN: Asignaciones de Estudiantes a Secciones
 * 
 * PROBLEMA: Los estudiantes importados no aparecen al crear tareas porque:
 * 1. No están asignados correctamente a secciones específicas
 * 2. Falta la conexión entre profesores, secciones y estudiantes
 * 3. La tabla smart-student-student-assignments está incompleta
 * 
 * SOLUCIÓN: Este script corrige las asignaciones y crea la estructura necesaria
 */

console.log('🔧 INICIANDO CORRECCIÓN DE ASIGNACIONES ESTUDIANTE-SECCIÓN...');
console.log('===========================================================');

function corregirAsignacionesEstudianteSeccion() {
    try {
        // 1. Cargar datos actuales
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 ESTADO INICIAL:');
        console.log(`   • Usuarios: ${users.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);

        // 2. Obtener estudiantes y profesores
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        const profesores = users.filter(u => u.role === 'teacher' || u.role === 'profesor');

        console.log(`\n👥 USUARIOS ENCONTRADOS:`);
        console.log(`   • Estudiantes: ${estudiantes.length}`);
        console.log(`   • Profesores: ${profesores.length}`);

        // 3. Mostrar datos actuales de los estudiantes
        console.log('\n📋 ESTUDIANTES ACTUALES:');
        estudiantes.forEach((est, index) => {
            console.log(`   ${index + 1}. ${est.username} (@${est.displayName || est.name})`);
            console.log(`      - activeCourses: ${JSON.stringify(est.activeCourses || [])}`);
            console.log(`      - assignedTeacher: ${est.assignedTeacher || 'ninguno'}`);
            console.log(`      - assignedTeachers: ${JSON.stringify(est.assignedTeachers || {})}`);
        });

        // 4. Verificar si ya existen asignaciones correctas
        if (studentAssignments.length > 0) {
            console.log('\n🔍 ASIGNACIONES EXISTENTES EN smart-student-student-assignments:');
            studentAssignments.forEach((asig, index) => {
                const estudiante = users.find(u => u.id === asig.studentId);
                const curso = courses.find(c => c.id === asig.courseId);
                const seccion = sections.find(s => s.id === asig.sectionId);
                
                console.log(`   ${index + 1}. ${estudiante?.username || 'Estudiante desconocido'}`);
                console.log(`      - Curso: ${curso?.name || 'Curso desconocido'}`);
                console.log(`      - Sección: ${seccion?.name || 'Sección desconocida'}`);
            });
        }

        // 5. Detectar estudiantes sin asignación correcta
        const estudiantesSinAsignacion = estudiantes.filter(est => {
            const tieneAsignacion = studentAssignments.some(asig => asig.studentId === est.id);
            return !tieneAsignacion;
        });

        console.log(`\n⚠️ ESTUDIANTES SIN ASIGNACIÓN CORRECTA: ${estudiantesSinAsignacion.length}`);

        if (estudiantesSinAsignacion.length === 0) {
            console.log('✅ TODOS los estudiantes ya tienen asignaciones correctas.');
            console.log('💡 Si aún no aparecen en el selector, verifica que:');
            console.log('   1. El profesor esté asignado a las mismas secciones');
            console.log('   2. Las asignaciones de profesores estén completas');
            return true;
        }

        // 6. Crear o verificar estructura de cursos y secciones
        console.log('\n🏗️ VERIFICANDO ESTRUCTURA DE CURSOS Y SECCIONES...');
        
        // Cursos básicos por defecto
        const cursosDefecto = [
            { id: 'curso-4to-basico', name: '4to Básico', level: 'básica' },
            { id: 'curso-5to-basico', name: '5to Básico', level: 'básica' },
            { id: 'curso-6to-basico', name: '6to Básico', level: 'básica' },
            { id: 'curso-1ro-basico', name: '1ro Básico', level: 'básica' },
            { id: 'curso-2do-basico', name: '2do Básico', level: 'básica' },
            { id: 'curso-3ro-basico', name: '3ro Básico', level: 'básica' }
        ];

        // Asegurar que existen los cursos necesarios
        cursosDefecto.forEach(cursoDefault => {
            if (!courses.find(c => c.id === cursoDefault.id)) {
                courses.push({
                    ...cursoDefault,
                    description: `Curso ${cursoDefault.name}`,
                    createdAt: new Date().toISOString(),
                    autoCreated: true
                });
                console.log(`   ➕ Curso creado: ${cursoDefault.name}`);
            }
        });

        // Secciones por defecto para cada curso
        const seccionesDefecto = ['A', 'B', 'C'];
        
        cursosDefecto.forEach(curso => {
            seccionesDefecto.forEach(nombreSeccion => {
                const seccionId = `seccion-${curso.name.toLowerCase().replace(/\s+/g, '-')}-${nombreSeccion.toLowerCase()}`;
                
                if (!sections.find(s => s.id === seccionId)) {
                    sections.push({
                        id: seccionId,
                        name: nombreSeccion,
                        courseId: curso.id,
                        description: `Sección ${nombreSeccion} de ${curso.name}`,
                        maxStudents: 30,
                        studentCount: 0,
                        createdAt: new Date().toISOString(),
                        autoCreated: true
                    });
                    console.log(`   ➕ Sección creada: ${curso.name} - Sección ${nombreSeccion}`);
                }
            });
        });

        // 7. Asignar estudiantes a secciones basándose en sus activeCourses actuales
        console.log('\n🔄 CREANDO ASIGNACIONES DE ESTUDIANTES...');
        
        let asignacionesCreadas = 0;
        
        estudiantesSinAsignacion.forEach(estudiante => {
            console.log(`\n   🎓 Procesando: ${estudiante.username}`);
            
            // Intentar obtener curso de activeCourses
            let cursoAsignado = null;
            let seccionAsignada = null;
            
            if (estudiante.activeCourses && estudiante.activeCourses.length > 0) {
                const cursoPerfil = estudiante.activeCourses[0];
                console.log(`      - Curso en perfil: "${cursoPerfil}"`);
                
                // Parsear formato "4to Básico - Sección A"
                const match = cursoPerfil.match(/^(.+?)\s*-\s*Sección\s*([A-Z])$/i);
                if (match) {
                    const nombreCurso = match[1].trim();
                    const nombreSeccion = match[2].toUpperCase();
                    
                    console.log(`      - Parseado: Curso="${nombreCurso}", Sección="${nombreSeccion}"`);
                    
                    // Buscar curso correspondiente
                    cursoAsignado = courses.find(c => c.name === nombreCurso);
                    if (cursoAsignado) {
                        // Buscar sección correspondiente
                        seccionAsignada = sections.find(s => 
                            s.courseId === cursoAsignado.id && s.name === nombreSeccion
                        );
                    }
                } else {
                    // Si no tiene formato de sección, asumir Sección A
                    const nombreCurso = cursoPerfil.trim();
                    cursoAsignado = courses.find(c => c.name === nombreCurso);
                    if (cursoAsignado) {
                        seccionAsignada = sections.find(s => 
                            s.courseId === cursoAsignado.id && s.name === 'A'
                        );
                    }
                }
            }
            
            // Si no se pudo determinar, asignar a 4to Básico Sección A por defecto
            if (!cursoAsignado || !seccionAsignada) {
                console.log(`      ⚠️ No se pudo determinar curso/sección, asignando a 4to Básico - Sección A`);
                cursoAsignado = courses.find(c => c.name === '4to Básico');
                seccionAsignada = sections.find(s => 
                    s.courseId === cursoAsignado?.id && s.name === 'A'
                );
            }
            
            if (cursoAsignado && seccionAsignada) {
                // Crear asignación en student-assignments
                const nuevaAsignacion = {
                    id: `student-assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    studentId: estudiante.id,
                    courseId: cursoAsignado.id,
                    sectionId: seccionAsignada.id,
                    createdAt: new Date().toISOString(),
                    autoAssigned: true,
                    source: 'fix-script'
                };
                
                studentAssignments.push(nuevaAsignacion);
                
                // Actualizar perfil del estudiante
                const cursoCompleto = `${cursoAsignado.name} - Sección ${seccionAsignada.name}`;
                estudiante.activeCourses = [cursoCompleto];
                
                // Actualizar contador de estudiantes en la sección
                const seccionIndex = sections.findIndex(s => s.id === seccionAsignada.id);
                if (seccionIndex >= 0) {
                    sections[seccionIndex].studentCount = (sections[seccionIndex].studentCount || 0) + 1;
                }
                
                console.log(`      ✅ Asignado a: ${cursoCompleto}`);
                asignacionesCreadas++;
            } else {
                console.log(`      ❌ Error: No se pudo crear asignación`);
            }
        });

        // 8. Verificar y crear asignaciones de profesores si es necesario
        console.log('\n👨‍🏫 VERIFICANDO ASIGNACIONES DE PROFESORES...');
        
        profesores.forEach(profesor => {
            console.log(`\n   🎓 Profesor: ${profesor.username} (${profesor.displayName || profesor.name})`);
            
            // Verificar si ya tiene asignaciones
            const asignacionesProfesor = teacherAssignments.filter(a => 
                a.teacherId === profesor.id || a.teacherUsername === profesor.username
            );
            
            console.log(`      - Asignaciones existentes: ${asignacionesProfesor.length}`);
            
            if (asignacionesProfesor.length === 0) {
                console.log(`      ⚠️ Profesor sin asignaciones, creando asignaciones básicas...`);
                
                // Crear asignaciones básicas para este profesor
                // Asignar a 4to y 5to Básico por defecto
                const cursosProfesor = ['4to Básico', '5to Básico'];
                const materiasBasicas = ['Matemáticas', 'Lenguaje y Comunicación', 'Ciencias Naturales'];
                
                cursosProfesor.forEach(nombreCurso => {
                    const curso = courses.find(c => c.name === nombreCurso);
                    if (curso) {
                        // Asignar a sección A
                        const seccion = sections.find(s => 
                            s.courseId === curso.id && s.name === 'A'
                        );
                        
                        if (seccion) {
                            materiasBasicas.forEach(materia => {
                                const nuevaAsignacionProfesor = {
                                    id: `teacher-assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    teacherId: profesor.id,
                                    teacherUsername: profesor.username,
                                    sectionId: seccion.id,
                                    subjectName: materia,
                                    assignedAt: new Date().toISOString(),
                                    autoAssigned: true
                                };
                                
                                teacherAssignments.push(nuevaAsignacionProfesor);
                                console.log(`         ➕ ${materia} en ${nombreCurso} - Sección A`);
                            });
                        }
                    }
                });
            }
        });

        // 9. Guardar todos los cambios
        console.log('\n💾 GUARDANDO CAMBIOS...');
        
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(teacherAssignments));

        // 10. Resumen final
        console.log('\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE!');
        console.log('=====================================');
        console.log(`✅ Asignaciones de estudiantes creadas: ${asignacionesCreadas}`);
        console.log(`📚 Cursos en sistema: ${courses.length}`);
        console.log(`🏫 Secciones en sistema: ${sections.length}`);
        console.log(`👥 Asignaciones estudiante-sección: ${studentAssignments.length}`);
        console.log(`👨‍🏫 Asignaciones profesor-sección: ${teacherAssignments.length}`);

        console.log('\n📊 VERIFICACIÓN FINAL:');
        const estudiantesConAsignacion = estudiantes.filter(est => 
            studentAssignments.some(asig => asig.studentId === est.id)
        );
        console.log(`   • Estudiantes con asignación: ${estudiantesConAsignacion.length}/${estudiantes.length}`);

        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. 🔄 Recarga la página completamente (Ctrl+F5)');
        console.log('2. 👨‍🏫 Haz login como profesor');
        console.log('3. 📝 Ve a Tareas > Nueva Tarea');
        console.log('4. 🎯 Selecciona un curso y "Estudiantes específicos"');
        console.log('5. ✅ Ahora deberían aparecer los estudiantes de esa sección');

        return true;

    } catch (error) {
        console.error('❌ ERROR durante la corrección:', error);
        console.log('🔍 Por favor revisa la consola para más detalles');
        return false;
    }
}

// Función para verificar el resultado
function verificarAsignaciones() {
    console.log('\n🔍 VERIFICANDO ASIGNACIONES DESPUÉS DE LA CORRECCIÓN...');
    console.log('=====================================================');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    
    const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
    
    console.log('📊 ESTADO ACTUAL:');
    estudiantes.forEach((est, index) => {
        const asignacion = studentAssignments.find(a => a.studentId === est.id);
        
        console.log(`\n${index + 1}. ${est.username} (@${est.displayName || est.name})`);
        
        if (asignacion) {
            const curso = courses.find(c => c.id === asignacion.courseId);
            const seccion = sections.find(s => s.id === asignacion.sectionId);
            
            console.log(`   ✅ Asignación oficial: ${curso?.name} - Sección ${seccion?.name}`);
            console.log(`   📋 Perfil muestra: ${JSON.stringify(est.activeCourses)}`);
            
            // Verificar si hay profesores asignados a esta sección
            const profesoresEnSeccion = teacherAssignments.filter(ta => ta.sectionId === asignacion.sectionId);
            console.log(`   👨‍🏫 Profesores en esta sección: ${profesoresEnSeccion.length}`);
            
        } else {
            console.log(`   ❌ Sin asignación oficial`);
            console.log(`   📋 Perfil muestra: ${JSON.stringify(est.activeCourses)}`);
        }
    });
    
    // Mostrar resumen por sección
    console.log('\n📊 RESUMEN POR SECCIÓN:');
    sections.forEach(seccion => {
        const curso = courses.find(c => c.id === seccion.courseId);
        const estudiantesEnSeccion = studentAssignments.filter(sa => sa.sectionId === seccion.id);
        const profesoresEnSeccion = teacherAssignments.filter(ta => ta.sectionId === seccion.id);
        
        console.log(`\n🏫 ${curso?.name} - Sección ${seccion.name}:`);
        console.log(`   👥 Estudiantes: ${estudiantesEnSeccion.length}`);
        console.log(`   👨‍🏫 Profesores: ${profesoresEnSeccion.length}`);
        
        if (profesoresEnSeccion.length > 0) {
            console.log(`   📚 Materias cubiertas: ${profesoresEnSeccion.map(p => p.subjectName).join(', ')}`);
        }
    });
}

// Ejecutar la corrección automáticamente
console.log('🚀 Ejecutando corrección automática...\n');
const resultado = corregirAsignacionesEstudianteSeccion();

if (resultado) {
    console.log('\n⏱️ Esperando 2 segundos antes de la verificación...');
    setTimeout(() => {
        verificarAsignaciones();
        
        console.log('\n🎯 COMANDOS DISPONIBLES:');
        console.log('========================');
        console.log('• corregirAsignacionesEstudianteSeccion() - Ejecutar corrección nuevamente');
        console.log('• verificarAsignaciones() - Verificar estado actual');
        console.log('• localStorage.clear() - Limpiar todo (¡CUIDADO!)');
        
    }, 2000);
}

// Hacer las funciones disponibles globalmente
window.corregirAsignacionesEstudianteSeccion = corregirAsignacionesEstudianteSeccion;
window.verificarAsignaciones = verificarAsignaciones;
