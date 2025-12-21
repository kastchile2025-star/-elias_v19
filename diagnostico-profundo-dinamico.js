/**
 * 🔍 DIAGNÓSTICO PROFUNDO DINÁMICO - Smart Student v9
 * 
 * Script completamente dinámico para detectar problemas en la asignación de tareas.
 * NO usa valores hardcodeados - analiza todo dinámicamente desde localStorage.
 * 
 * OBJETIVO: Identificar por qué las tareas llegan a estudiantes incorrectos
 */

console.clear();
console.log('🔍 DIAGNÓSTICO PROFUNDO DINÁMICO - SMART STUDENT v9');
console.log('='.repeat(70));

class DiagnosticoProfundo {
    constructor() {
        this.datos = {};
        this.problemas = [];
        this.recomendaciones = [];
    }

    // 📊 PASO 1: Cargar y analizar todos los datos del sistema
    cargarDatos() {
        console.log('\n📊 PASO 1: CARGANDO DATOS DEL SISTEMA...');
        
        try {
            this.datos = {
                users: JSON.parse(localStorage.getItem('smart-student-users') || '[]'),
                courses: JSON.parse(localStorage.getItem('smart-student-courses') || '[]'),
                sections: JSON.parse(localStorage.getItem('smart-student-sections') || '[]'),
                subjects: JSON.parse(localStorage.getItem('smart-student-subjects') || '[]'),
                tasks: JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
                studentAssignments: JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]'),
                teacherAssignments: JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]'),
                currentUser: JSON.parse(localStorage.getItem('smart-student-current-user') || 'null')
            };

            console.log('✅ Datos cargados exitosamente:');
            Object.entries(this.datos).forEach(([key, value]) => {
                const count = Array.isArray(value) ? value.length : (value ? 1 : 0);
                console.log(`   • ${key}: ${count}`);
            });

            return true;
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            this.problemas.push('Error crítico: No se pudieron cargar los datos del localStorage');
            return false;
        }
    }

    // 🎯 PASO 2: Analizar estructura del sistema educativo
    analizarEstructuraEducativa() {
        console.log('\n🎯 PASO 2: ANALIZANDO ESTRUCTURA EDUCATIVA...');
        
        const { courses, sections, subjects } = this.datos;
        
        // Mapear estructura curso → secciones → asignaturas
        const estructuraPorCurso = {};
        
        courses.forEach(curso => {
            const seccionesCurso = sections.filter(s => s.courseId === curso.id);
            const asignaturasCurso = subjects.filter(sub => sub.courseId === curso.id);
            
            estructuraPorCurso[curso.id] = {
                nombre: curso.name,
                secciones: seccionesCurso.map(s => ({
                    id: s.id,
                    nombre: s.name,
                    codigoCompleto: `${curso.id}-${s.id}`
                })),
                asignaturas: asignaturasCurso.map(a => ({
                    id: a.id,
                    nombre: a.name
                }))
            };
        });

        console.log('📚 ESTRUCTURA EDUCATIVA DETECTADA:');
        Object.entries(estructuraPorCurso).forEach(([cursoId, data]) => {
            console.log(`\n🏫 ${data.nombre} (ID: ${cursoId})`);
            console.log(`   📋 Secciones (${data.secciones.length}):`);
            data.secciones.forEach(seccion => {
                console.log(`      • ${seccion.nombre} (${seccion.codigoCompleto})`);
            });
            console.log(`   📚 Asignaturas (${data.asignaturas.length}):`);
            data.asignaturas.forEach(asignatura => {
                console.log(`      • ${asignatura.nombre}`);
            });
        });

        this.datos.estructuraEducativa = estructuraPorCurso;
        return estructuraPorCurso;
    }

    // 👥 PASO 3: Analizar asignaciones de estudiantes
    analizarAsignacionesEstudiantes() {
        console.log('\n👥 PASO 3: ANALIZANDO ASIGNACIONES DE ESTUDIANTES...');
        
        const { users, studentAssignments } = this.datos;
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        
        console.log(`📊 ESTADÍSTICAS DE ESTUDIANTES:`);
        console.log(`   • Total estudiantes: ${estudiantes.length}`);
        console.log(`   • Total asignaciones: ${studentAssignments.length}`);
        
        // Mapear asignaciones por estudiante
        const asignacionesPorEstudiante = {};
        
        estudiantes.forEach(estudiante => {
            const asignacionesEstudiante = studentAssignments.filter(a => a.studentId === estudiante.id);
            
            asignacionesPorEstudiante[estudiante.id] = {
                username: estudiante.username,
                displayName: estudiante.displayName || estudiante.name,
                asignaciones: asignacionesEstudiante.map(asig => {
                    const curso = this.datos.courses.find(c => c.id === asig.courseId);
                    const seccion = this.datos.sections.find(s => s.id === asig.sectionId);
                    
                    return {
                        courseId: asig.courseId,
                        sectionId: asig.sectionId,
                        cursoNombre: curso?.name || 'Curso desconocido',
                        seccionNombre: seccion?.name || 'Sección desconocida',
                        codigoCompleto: `${asig.courseId}-${asig.sectionId}`
                    };
                }),
                activeCourses: estudiante.activeCourses || [],
                problemas: []
            };

            // Detectar problemas en asignaciones
            if (asignacionesEstudiante.length === 0) {
                asignacionesPorEstudiante[estudiante.id].problemas.push('Sin asignaciones en student-assignments');
            }
            
            if (!estudiante.activeCourses || estudiante.activeCourses.length === 0) {
                asignacionesPorEstudiante[estudiante.id].problemas.push('Sin activeCourses definidos');
            }
        });

        console.log('\n📋 DETALLE DE ASIGNACIONES:');
        Object.values(asignacionesPorEstudiante).forEach(data => {
            console.log(`\n👤 ${data.username} (${data.displayName})`);
            
            if (data.asignaciones.length > 0) {
                console.log(`   ✅ Asignaciones dinámicas (${data.asignaciones.length}):`);
                data.asignaciones.forEach(asig => {
                    console.log(`      • ${asig.cursoNombre} - Sección ${asig.seccionNombre}`);
                    console.log(`        🔑 Código: ${asig.codigoCompleto}`);
                });
            }
            
            if (data.activeCourses.length > 0) {
                console.log(`   📚 ActiveCourses (${data.activeCourses.length}): [${data.activeCourses.join(', ')}]`);
            }
            
            if (data.problemas.length > 0) {
                console.log(`   ⚠️ Problemas detectados:`);
                data.problemas.forEach(problema => {
                    console.log(`      • ${problema}`);
                });
                this.problemas.push(`Estudiante ${data.username}: ${data.problemas.join(', ')}`);
            }
        });

        this.datos.asignacionesEstudiantes = asignacionesPorEstudiante;
        return asignacionesPorEstudiante;
    }

    // 📝 PASO 4: Analizar tareas del sistema
    analizarTareas() {
        console.log('\n📝 PASO 4: ANALIZANDO TAREAS DEL SISTEMA...');
        
        const { tasks } = this.datos;
        
        console.log(`📊 ESTADÍSTICAS DE TAREAS:`);
        console.log(`   • Total tareas: ${tasks.length}`);
        
        // Clasificar tareas por tipo de asignación
        const tareasPorTipo = {
            'course': tasks.filter(t => t.assignedTo === 'course'),
            'student': tasks.filter(t => t.assignedTo === 'student'),
            'otros': tasks.filter(t => !t.assignedTo || (t.assignedTo !== 'course' && t.assignedTo !== 'student'))
        };

        Object.entries(tareasPorTipo).forEach(([tipo, tareas]) => {
            console.log(`   • Tipo "${tipo}": ${tareas.length} tareas`);
        });

        // Analizar tareas de "Todo el Curso" (las problemáticas)
        console.log('\n🎯 ANÁLISIS DETALLADO DE TAREAS "TODO EL CURSO":');
        
        const tareasCurso = tareasPorTipo.course;
        const analisisTareas = {};

        tareasCurso.forEach(tarea => {
            const cursoAsignado = tarea.courseSectionId || tarea.course;
            
            if (!analisisTareas[cursoAsignado]) {
                analisisTareas[cursoAsignado] = {
                    tareas: [],
                    estudiantesDeberianVer: [],
                    problemas: []
                };
            }

            analisisTareas[cursoAsignado].tareas.push({
                id: tarea.id,
                titulo: tarea.title,
                creador: tarea.assignedByName || tarea.assignedById,
                fecha: new Date(tarea.createdAt).toLocaleDateString()
            });

            // Determinar qué estudiantes deberían ver esta tarea
            const estudiantesQueDeberianVer = this.determinarEstudiantesParaTarea(cursoAsignado);
            analisisTareas[cursoAsignado].estudiantesDeberianVer = estudiantesQueDeberianVer;

            // Detectar problemas en la asignación
            if (!cursoAsignado) {
                analisisTareas[cursoAsignado].problemas.push('Tarea sin curso asignado');
            }
        });

        console.log('\n📋 DETALLE POR CURSO-SECCIÓN:');
        Object.entries(analisisTareas).forEach(([cursoSeccion, data]) => {
            console.log(`\n🏫 ${cursoSeccion}:`);
            console.log(`   📝 Tareas (${data.tareas.length}):`);
            data.tareas.forEach(tarea => {
                console.log(`      • "${tarea.titulo}" (${tarea.fecha})`);
            });
            
            console.log(`   👥 Estudiantes que DEBERÍAN ver (${data.estudiantesDeberianVer.length}):`);
            data.estudiantesDeberianVer.forEach(est => {
                console.log(`      • ${est.username} (${est.displayName})`);
            });

            if (data.problemas.length > 0) {
                console.log(`   ⚠️ Problemas:`);
                data.problemas.forEach(problema => {
                    console.log(`      • ${problema}`);
                });
            }
        });

        this.datos.analisisTareas = analisisTareas;
        return analisisTareas;
    }

    // 🔍 FUNCIÓN AUXILIAR: Determinar estudiantes para una tarea
    determinarEstudiantesParaTarea(cursoSeccionId) {
        const { asignacionesEstudiantes } = this.datos;
        
        const estudiantesValidos = [];
        
        Object.values(asignacionesEstudiantes).forEach(estudiante => {
            // Verificar asignaciones dinámicas (método principal)
            const tieneAsignacionDinamica = estudiante.asignaciones.some(asig => 
                asig.codigoCompleto === cursoSeccionId ||
                asig.courseId === cursoSeccionId ||
                asig.sectionId === cursoSeccionId
            );

            // Verificar activeCourses (método fallback)
            const tieneActiveCourse = estudiante.activeCourses.includes(cursoSeccionId);

            if (tieneAsignacionDinamica || tieneActiveCourse) {
                estudiantesValidos.push({
                    username: estudiante.username,
                    displayName: estudiante.displayName,
                    metodo: tieneAsignacionDinamica ? 'asignación dinámica' : 'activeCourses'
                });
            }
        });

        return estudiantesValidos;
    }

    // 🧪 PASO 5: Simular función isStudentAssignedToTask
    simularFuncionAsignacion() {
        console.log('\n🧪 PASO 5: SIMULANDO FUNCIÓN isStudentAssignedToTask...');
        
        const { analisisTareas, asignacionesEstudiantes } = this.datos;
        
        console.log('🎯 PRUEBAS DE ASIGNACIÓN CRUZADA:');
        console.log('(Detectar si estudiantes ven tareas que no les corresponden)');

        const resultadosPruebas = {};

        // Para cada curso-sección, probar con estudiantes de otras secciones
        Object.entries(analisisTareas).forEach(([cursoSeccion, dataTareas]) => {
            resultadosPruebas[cursoSeccion] = {
                tareasCorrectas: 0,
                tareasIncorrectas: 0,
                detalles: []
            };

            // Probar cada tarea con todos los estudiantes
            dataTareas.tareas.forEach(tarea => {
                Object.values(asignacionesEstudiantes).forEach(estudiante => {
                    const deberiaVer = dataTareas.estudiantesDeberianVer.some(e => e.username === estudiante.username);
                    const puedeVer = this.simularIsStudentAssignedToTask(tarea.id, estudiante, cursoSeccion);

                    if (deberiaVer && puedeVer) {
                        resultadosPruebas[cursoSeccion].tareasCorrectas++;
                    } else if (!deberiaVer && puedeVer) {
                        resultadosPruebas[cursoSeccion].tareasIncorrectas++;
                        resultadosPruebas[cursoSeccion].detalles.push({
                            problema: 'ACCESO INCORRECTO',
                            estudiante: estudiante.username,
                            tarea: tarea.titulo,
                            razon: 'Estudiante puede ver tarea que no le corresponde'
                        });
                        this.problemas.push(`${estudiante.username} puede ver "${tarea.titulo}" de ${cursoSeccion} incorrectamente`);
                    } else if (deberiaVer && !puedeVer) {
                        resultadosPruebas[cursoSeccion].detalles.push({
                            problema: 'ACCESO DENEGADO',
                            estudiante: estudiante.username,
                            tarea: tarea.titulo,
                            razon: 'Estudiante no puede ver tarea que le corresponde'
                        });
                        this.problemas.push(`${estudiante.username} NO puede ver "${tarea.titulo}" de ${cursoSeccion} que le corresponde`);
                    }
                });
            });
        });

        console.log('\n📊 RESULTADOS DE PRUEBAS:');
        Object.entries(resultadosPruebas).forEach(([cursoSeccion, resultado]) => {
            console.log(`\n🏫 ${cursoSeccion}:`);
            console.log(`   ✅ Asignaciones correctas: ${resultado.tareasCorrectas}`);
            console.log(`   ❌ Asignaciones incorrectas: ${resultado.tareasIncorrectas}`);
            
            if (resultado.detalles.length > 0) {
                console.log(`   🔍 Problemas detectados:`);
                resultado.detalles.forEach(detalle => {
                    console.log(`      ${detalle.problema}: ${detalle.estudiante} → "${detalle.tarea}"`);
                    console.log(`         Razón: ${detalle.razon}`);
                });
            }
        });

        return resultadosPruebas;
    }

    // 🔍 FUNCIÓN AUXILIAR: Simular lógica de isStudentAssignedToTask
    simularIsStudentAssignedToTask(tareaId, estudiante, cursoSeccionTarea) {
        // Simular la lógica actual de la función
        
        // 1. Verificar asignaciones dinámicas
        const tieneAsignacionDinamica = estudiante.asignaciones.some(asig => 
            asig.codigoCompleto === cursoSeccionTarea ||
            asig.courseId === cursoSeccionTarea ||
            asig.sectionId === cursoSeccionTarea
        );

        if (tieneAsignacionDinamica) {
            return true;
        }

        // 2. Verificar activeCourses (fallback)
        const tieneActiveCourse = estudiante.activeCourses.includes(cursoSeccionTarea);
        
        return tieneActiveCourse;
    }

    // 🎯 PASO 6: Probar con usuario actual
    probarUsuarioActual() {
        console.log('\n🎯 PASO 6: PROBANDO CON USUARIO ACTUAL...');
        
        const { currentUser } = this.datos;
        
        if (!currentUser) {
            console.log('⚠️ No hay usuario logueado. Inicia sesión como estudiante para probar.');
            return null;
        }

        console.log(`👤 Usuario actual: ${currentUser.username} (${currentUser.role})`);

        if (currentUser.role !== 'student' && currentUser.role !== 'estudiante') {
            console.log('ℹ️ Usuario actual no es estudiante. Cambia a un estudiante para ver el problema.');
            return null;
        }

        const estudianteData = this.datos.asignacionesEstudiantes[currentUser.id];
        
        if (!estudianteData) {
            console.log('❌ No se encontraron datos de asignación para el usuario actual');
            return null;
        }

        console.log('\n📋 ANÁLISIS PARA USUARIO ACTUAL:');
        console.log(`👤 ${estudianteData.username} (${estudianteData.displayName})`);
        
        if (estudianteData.asignaciones.length > 0) {
            console.log(`✅ Asignaciones (${estudianteData.asignaciones.length}):`);
            estudianteData.asignaciones.forEach(asig => {
                console.log(`   • ${asig.cursoNombre} - Sección ${asig.seccionNombre} (${asig.codigoCompleto})`);
            });
        }

        console.log('\n🎯 TAREAS QUE DEBERÍA VER:');
        Object.entries(this.datos.analisisTareas).forEach(([cursoSeccion, data]) => {
            const deberiaVer = data.estudiantesDeberianVer.some(e => e.username === estudianteData.username);
            
            if (deberiaVer) {
                console.log(`✅ ${cursoSeccion}:`);
                data.tareas.forEach(tarea => {
                    console.log(`   • "${tarea.titulo}"`);
                });
            }
        });

        console.log('\n❌ TAREAS QUE NO DEBERÍA VER:');
        Object.entries(this.datos.analisisTareas).forEach(([cursoSeccion, data]) => {
            const deberiaVer = data.estudiantesDeberianVer.some(e => e.username === estudianteData.username);
            
            if (!deberiaVer && data.tareas.length > 0) {
                console.log(`❌ ${cursoSeccion}:`);
                data.tareas.forEach(tarea => {
                    console.log(`   • "${tarea.titulo}" 🚨 Si ves esta tarea, HAY UN PROBLEMA`);
                });
            }
        });

        return estudianteData;
    }

    // 📊 PASO 7: Generar reporte final
    generarReporteFinal() {
        console.log('\n📊 PASO 7: REPORTE FINAL...');
        console.log('='.repeat(50));

        if (this.problemas.length === 0) {
            console.log('🎉 ¡SISTEMA FUNCIONANDO CORRECTAMENTE!');
            console.log('✅ No se detectaron problemas en las asignaciones de tareas');
        } else {
            console.log('🚨 PROBLEMAS DETECTADOS:');
            console.log(`   Total problemas: ${this.problemas.length}`);
            
            this.problemas.forEach((problema, index) => {
                console.log(`   ${index + 1}. ${problema}`);
            });

            console.log('\n💡 RECOMENDACIONES:');
            this.generarRecomendaciones();
            this.recomendaciones.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }

        console.log('\n🔧 FUNCIONES DISPONIBLES PARA DEBUGGING:');
        console.log('   • diagnostico.probarConUsuario("username") - Cambiar y probar usuario');
        console.log('   • diagnostico.mostrarDetalleEstudiante("username") - Ver detalles específicos');
        console.log('   • diagnostico.compararAsignaciones() - Comparar métodos de asignación');
        
        return {
            problemas: this.problemas,
            recomendaciones: this.recomendaciones,
            datos: this.datos
        };
    }

    // 💡 Generar recomendaciones basadas en problemas detectados
    generarRecomendaciones() {
        if (this.problemas.some(p => p.includes('Sin asignaciones en student-assignments'))) {
            this.recomendaciones.push('Verificar que todos los estudiantes tengan asignaciones en smart-student-student-assignments');
        }

        if (this.problemas.some(p => p.includes('puede ver') && p.includes('incorrectamente'))) {
            this.recomendaciones.push('Revisar la función isStudentAssignedToTask - permite acceso incorrecto');
        }

        if (this.problemas.some(p => p.includes('NO puede ver') && p.includes('que le corresponde'))) {
            this.recomendaciones.push('Revisar la función getFilteredTasks - bloquea acceso correcto');
        }

        if (this.problemas.some(p => p.includes('Sin activeCourses'))) {
            this.recomendaciones.push('Actualizar activeCourses de estudiantes o migrar completamente a student-assignments');
        }
    }

    // 🔄 Función para cambiar usuario y probar
    probarConUsuario(username) {
        console.log(`\n🔄 CAMBIANDO A USUARIO: ${username}`);
        
        const { users } = this.datos;
        const usuario = users.find(u => u.username === username);
        
        if (!usuario) {
            console.log(`❌ Usuario "${username}" no encontrado`);
            return;
        }

        localStorage.setItem('smart-student-current-user', JSON.stringify(usuario));
        console.log(`✅ Usuario cambiado a: ${usuario.username}`);
        
        // Actualizar datos y probar
        this.datos.currentUser = usuario;
        setTimeout(() => {
            this.probarUsuarioActual();
        }, 500);
    }

    // 📋 Mostrar detalle específico de un estudiante
    mostrarDetalleEstudiante(username) {
        const estudiante = Object.values(this.datos.asignacionesEstudiantes).find(e => e.username === username);
        
        if (!estudiante) {
            console.log(`❌ Estudiante "${username}" no encontrado`);
            return;
        }

        console.log(`\n📋 DETALLE COMPLETO: ${username}`);
        console.log('='.repeat(40));
        console.log(JSON.stringify(estudiante, null, 2));
    }

    // 🔄 Ejecutar diagnóstico completo
    ejecutarDiagnosticoCompleto() {
        console.log('🚀 INICIANDO DIAGNÓSTICO PROFUNDO...');
        
        if (!this.cargarDatos()) {
            return null;
        }

        this.analizarEstructuraEducativa();
        this.analizarAsignacionesEstudiantes();
        this.analizarTareas();
        this.simularFuncionAsignacion();
        this.probarUsuarioActual();
        
        return this.generarReporteFinal();
    }
}

// 🚀 EJECUTAR DIAGNÓSTICO
const diagnostico = new DiagnosticoProfundo();
const resultado = diagnostico.ejecutarDiagnosticoCompleto();

// 🔧 Hacer disponible globalmente para debugging
window.diagnostico = diagnostico;

console.log('\n💡 INSTRUCCIONES:');
console.log('1. Revisa los problemas detectados arriba');
console.log('2. Ve a la pestaña "Tareas" y compara con las predicciones');
console.log('3. Usa diagnostico.probarConUsuario("username") para cambiar usuarios');
console.log('4. Reporta cualquier discrepancia entre predicción y realidad');
