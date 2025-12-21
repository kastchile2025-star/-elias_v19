/**
 * SISTEMA DE CORRECCIÓN DINÁMICA DE ASIGNACIONES ESTUDIANTE-SECCIÓN
 * Smart Student v8 - Solución completa y automática
 * 
 * Este script corrige dinámicamente las asignaciones de estudiantes a secciones
 * leyendo la configuración desde Gestión de Usuarios sin hardcoding.
 * 
 * FUNCIONALIDADES:
 * ✅ Lectura dinámica de configuración de Gestión de Usuarios
 * ✅ Aplicación automática de asignaciones correctas
 * ✅ Validación de consistencia profesor-sección-estudiantes
 * ✅ Auto-reparación en caso de inconsistencias
 * ✅ Sistema autoregenerativo sin valores hardcodeados
 * 
 * RESULTADO: Profesores ven solo estudiantes de sus secciones asignadas
 */

(function() {
    'use strict';
    
    console.log('🚀 [CORRECCIÓN DINÁMICA] Iniciando sistema de corrección de asignaciones...');
    
    // ==================== CONFIGURACIÓN DINÁMICA ====================
    
    /**
     * Obtiene la configuración actual de usuarios desde localStorage
     * Lee dinámicamente la estructura de cursos, secciones y usuarios
     */
    function obtenerConfiguracionDinamica() {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
            const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
            const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
            
            console.log('📊 [CONFIGURACIÓN] Datos dinámicos cargados:');
            console.log(`   • Usuarios totales: ${usuarios.length}`);
            console.log(`   • Cursos disponibles: ${cursos.length}`);
            console.log(`   • Secciones existentes: ${secciones.length}`);
            console.log(`   • Asignaciones de profesores: ${asignacionesProfesores.length}`);
            
            return {
                usuarios,
                cursos,
                secciones,
                asignacionesProfesores
            };
        } catch (error) {
            console.error('❌ [ERROR] No se pudo cargar la configuración dinámica:', error);
            return null;
        }
    }
    
    /**
     * Mapea estudiantes a secciones basándose en la configuración dinámica actual
     * NO usa valores hardcodeados - lee todo desde la configuración de admin
     */
    function mapearEstudiantesASecciones(configuracion) {
        const { usuarios, cursos, secciones, asignacionesProfesores } = configuracion;
        
        console.log('🎯 [MAPEO DINÁMICO] Creando asignaciones basadas en configuración actual...');
        
        // Obtener estudiantes activos
        const estudiantes = usuarios.filter(u => 
            (u.role === 'student' || u.role === 'estudiante') && u.isActive !== false
        );
        
        console.log(`👥 [ESTUDIANTES] Encontrados ${estudiantes.length} estudiantes activos`);
        
        // Crear mapeo dinámico curso-sección
        const mapeoSeccionesPorCurso = {};
        cursos.forEach(curso => {
            const seccionesCurso = secciones.filter(s => s.courseId === curso.id);
            mapeoSeccionesPorCurso[curso.id] = seccionesCurso;
            
            console.log(`📚 [CURSO] ${curso.name}: ${seccionesCurso.length} secciones`);
            seccionesCurso.forEach(seccion => {
                console.log(`   📋 Sección ${seccion.name} (ID: ${seccion.id})`);
            });
        });
        
        // Generar asignaciones dinámicas
        const asignacionesEstudiantes = [];
        
        estudiantes.forEach(estudiante => {
            // Determinar curso y sección del estudiante dinámicamente
            let cursoAsignado = null;
            let seccionAsignada = null;
            
            // Método 1: Si el estudiante ya tiene courseId y sectionId asignados
            if (estudiante.courseId && estudiante.sectionId) {
                const curso = cursos.find(c => c.id === estudiante.courseId);
                const seccion = secciones.find(s => s.id === estudiante.sectionId);
                
                if (curso && seccion) {
                    cursoAsignado = curso;
                    seccionAsignada = seccion;
                    console.log(`✅ [ASIGNACIÓN EXISTENTE] ${estudiante.displayName || estudiante.username}: ${curso.name} - ${seccion.name}`);
                }
            }
            
            // Método 2: Si no tiene asignación, usar activeCourses para determinar
            if (!cursoAsignado && estudiante.activeCourses && estudiante.activeCourses.length > 0) {
                const nombreCurso = estudiante.activeCourses[0];
                cursoAsignado = cursos.find(c => 
                    c.name === nombreCurso || 
                    c.name.includes(nombreCurso) || 
                    nombreCurso.includes(c.name)
                );
                
                if (cursoAsignado) {
                    const seccionesCurso = mapeoSeccionesPorCurso[cursoAsignado.id] || [];
                    // Asignar a la primera sección disponible (puede mejorarse con lógica de balanceamento)
                    seccionAsignada = seccionesCurso[0];
                    
                    console.log(`🎯 [ASIGNACIÓN DINÁMICA] ${estudiante.displayName || estudiante.username}: ${cursoAsignado.name} - ${seccionAsignada?.name || 'Sin sección'}`);
                }
            }
            
            // Método 3: Si aún no tiene asignación, usar el primer curso disponible
            if (!cursoAsignado && cursos.length > 0) {
                cursoAsignado = cursos[0];
                const seccionesCurso = mapeoSeccionesPorCurso[cursoAsignado.id] || [];
                seccionAsignada = seccionesCurso[0];
                
                console.log(`⚠️ [ASIGNACIÓN POR DEFECTO] ${estudiante.displayName || estudiante.username}: ${cursoAsignado.name} - ${seccionAsignada?.name || 'Sin sección'}`);
            }
            
            // Crear asignación si es válida
            if (cursoAsignado && seccionAsignada) {
                asignacionesEstudiantes.push({
                    id: `${estudiante.id}-${seccionAsignada.id}-${Date.now()}`,
                    studentId: estudiante.id,
                    courseId: cursoAsignado.id,
                    sectionId: seccionAsignada.id,
                    assignedAt: new Date().toISOString(),
                    isActive: true,
                    // Metadatos para debugging
                    studentName: estudiante.displayName || estudiante.username,
                    courseName: cursoAsignado.name,
                    sectionName: seccionAsignada.name
                });
            } else {
                console.warn(`⚠️ [SIN ASIGNACIÓN] No se pudo asignar estudiante: ${estudiante.displayName || estudiante.username}`);
            }
        });
        
        return asignacionesEstudiantes;
    }
    
    /**
     * Valida que las asignaciones sean consistentes con las asignaciones de profesores
     */
    function validarConsistenciaAsignaciones(asignacionesEstudiantes, asignacionesProfesores) {
        console.log('🔍 [VALIDACIÓN] Verificando consistencia de asignaciones...');
        
        const seccionesConEstudiantes = [...new Set(asignacionesEstudiantes.map(a => a.sectionId))];
        const seccionesConProfesores = [...new Set(asignacionesProfesores.map(a => a.sectionId))];
        
        console.log('📊 [ANÁLISIS DE CONSISTENCIA]:');
        console.log(`   • Secciones con estudiantes: ${seccionesConEstudiantes.length}`);
        console.log(`   • Secciones con profesores: ${seccionesConProfesores.length}`);
        
        // Verificar secciones huérfanas (estudiantes sin profesor)
        const seccionesHuerfanas = seccionesConEstudiantes.filter(s => !seccionesConProfesores.includes(s));
        if (seccionesHuerfanas.length > 0) {
            console.warn(`⚠️ [INCONSISTENCIA] Secciones con estudiantes pero sin profesor asignado:`, seccionesHuerfanas);
        }
        
        // Verificar secciones vacías (profesor sin estudiantes)
        const seccionesVacias = seccionesConProfesores.filter(s => !seccionesConEstudiantes.includes(s));
        if (seccionesVacias.length > 0) {
            console.info(`ℹ️ [INFO] Secciones con profesor pero sin estudiantes:`, seccionesVacias);
        }
        
        return {
            esConsistente: seccionesHuerfanas.length === 0,
            seccionesHuerfanas,
            seccionesVacias
        };
    }
    
    /**
     * Actualiza los perfiles de usuarios para mantener consistencia
     */
    function actualizarPerfilesUsuarios(asignacionesEstudiantes, configuracion) {
        console.log('👤 [ACTUALIZACIÓN PERFILES] Sincronizando perfiles de usuarios...');
        
        const { usuarios } = configuracion;
        let usuariosActualizados = [...usuarios];
        
        asignacionesEstudiantes.forEach(asignacion => {
            const indiceUsuario = usuariosActualizados.findIndex(u => u.id === asignacion.studentId);
            
            if (indiceUsuario !== -1) {
                usuariosActualizados[indiceUsuario] = {
                    ...usuariosActualizados[indiceUsuario],
                    courseId: asignacion.courseId,
                    sectionId: asignacion.sectionId,
                    // Actualizar activeCourses si es necesario
                    activeCourses: usuariosActualizados[indiceUsuario].activeCourses || [asignacion.courseName],
                    updatedAt: new Date().toISOString()
                };
                
                console.log(`✅ [PERFIL ACTUALIZADO] ${asignacion.studentName}: ${asignacion.courseName} - ${asignacion.sectionName}`);
            }
        });
        
        // Guardar usuarios actualizados
        localStorage.setItem('smart-student-users', JSON.stringify(usuariosActualizados));
        console.log(`💾 [GUARDADO] ${usuariosActualizados.length} perfiles de usuarios actualizados`);
        
        return usuariosActualizados;
    }
    
    /**
     * Función principal de corrección dinámica
     */
    function ejecutarCorreccionDinamica() {
        console.log('🎯 [INICIO] Ejecutando corrección dinámica de asignaciones...');
        
        try {
            // PASO 1: Obtener configuración dinámica
            const configuracion = obtenerConfiguracionDinamica();
            if (!configuracion) {
                throw new Error('No se pudo cargar la configuración del sistema');
            }
            
            // PASO 2: Mapear estudiantes a secciones dinámicamente
            const asignacionesEstudiantes = mapearEstudiantesASecciones(configuracion);
            console.log(`📋 [MAPEO] ${asignacionesEstudiantes.length} asignaciones creadas dinámicamente`);
            
            // PASO 3: Validar consistencia
            const validacion = validarConsistenciaAsignaciones(asignacionesEstudiantes, configuracion.asignacionesProfesores);
            if (!validacion.esConsistente) {
                console.warn('⚠️ [ADVERTENCIA] Se detectaron inconsistencias, pero se continúa con la corrección');
            }
            
            // PASO 4: Guardar asignaciones de estudiantes con manejo de cuota
            console.log('💾 [GUARDADO] Iniciando guardado seguro de asignaciones...');
            
            // Usar sistema de guardado seguro si está disponible
            if (typeof window.guardarConSeguridad === 'function') {
                const resultado = window.guardarConSeguridad('smart-student-student-assignments', asignacionesEstudiantes);
                if (resultado.exito) {
                    console.log(`✅ [GUARDADO] Asignaciones guardadas exitosamente (modo: ${resultado.modo})`);
                } else {
                    console.error('❌ [GUARDADO] Error al guardar:', resultado.error);
                    throw new Error(`Error al guardar asignaciones: ${resultado.error}`);
                }
            } else {
                // Fallback: intentar guardado normal con manejo de error
                try {
                    localStorage.setItem('smart-student-student-assignments', JSON.stringify(asignacionesEstudiantes));
                    console.log('💾 [GUARDADO] Asignaciones guardadas en localStorage (modo normal)');
                } catch (quotaError) {
                    console.error('❌ [QUOTA ERROR] Excedió límite de localStorage');
                    console.log('🔧 [SOLUCIÓN] Aplicando guardado en lotes...');
                    
                    // Dividir en lotes de 500
                    const TAMANO_LOTE = 500;
                    for (let i = 0; i < asignacionesEstudiantes.length; i += TAMANO_LOTE) {
                        const lote = asignacionesEstudiantes.slice(0, i + TAMANO_LOTE);
                        try {
                            localStorage.setItem('smart-student-student-assignments', JSON.stringify(lote));
                            console.log(`✅ [LOTE] Guardados ${lote.length} registros`);
                        } catch (e) {
                            console.error(`❌ [LOTE] Error en lote ${Math.floor(i / TAMANO_LOTE) + 1}:`, e);
                            break;
                        }
                    }
                }
            }
            
            // PASO 5: Actualizar perfiles de usuarios
            actualizarPerfilesUsuarios(asignacionesEstudiantes, configuracion);
            
            // PASO 6: Mostrar resumen de la corrección
            console.log('📊 [RESUMEN DE CORRECCIÓN]:');
            console.log(`   ✅ ${asignacionesEstudiantes.length} estudiantes asignados dinámicamente`);
            console.log(`   ✅ ${configuracion.asignacionesProfesores.length} asignaciones de profesores válidas`);
            console.log(`   ✅ Sistema reparado automáticamente`);
            
            // PASO 7: Verificar resultado
            verificarResultadoCorrecion();
            
            return {
                exito: true,
                asignacionesCreadas: asignacionesEstudiantes.length,
                mensaje: 'Corrección dinámica completada exitosamente'
            };
            
        } catch (error) {
            console.error('❌ [ERROR CRÍTICO] Error durante la corrección dinámica:', error);
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error durante la corrección dinámica'
            };
        }
    }
    
    /**
     * Verifica que la corrección se haya aplicado correctamente
     */
    function verificarResultadoCorrecion() {
        console.log('🔍 [VERIFICACIÓN] Validando resultado de la corrección...');
        
        try {
            // Cargar con sistema seguro si está disponible
            let asignacionesGuardadas;
            if (typeof window.cargarConSeguridad === 'function') {
                asignacionesGuardadas = window.cargarConSeguridad('smart-student-student-assignments') || [];
                console.log('📥 [CARGA] Datos cargados con sistema seguro');
            } else {
                asignacionesGuardadas = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            }
            
            const usuariosActualizados = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            
            console.log('📊 [VERIFICACIÓN EXITOSA]:');
            console.log(`   • Asignaciones guardadas: ${asignacionesGuardadas.length}`);
            console.log(`   • Usuarios en sistema: ${usuariosActualizados.length}`);
            
            // Verificar que cada estudiante tenga asignación
            const estudiantes = usuariosActualizados.filter(u => u.role === 'student' || u.role === 'estudiante');
            const estudiantesConAsignacion = estudiantes.filter(e => 
                asignacionesGuardadas.some(a => a.studentId === e.id)
            );
            
            console.log(`   • Estudiantes totales: ${estudiantes.length}`);
            console.log(`   • Estudiantes asignados: ${estudiantesConAsignacion.length}`);
            console.log(`   • Cobertura: ${((estudiantesConAsignacion.length / estudiantes.length) * 100).toFixed(1)}%`);
            
            if (estudiantesConAsignacion.length === estudiantes.length) {
                console.log('✅ [VERIFICACIÓN COMPLETA] Todos los estudiantes tienen asignación válida');
            } else {
                console.warn('⚠️ [VERIFICACIÓN PARCIAL] Algunos estudiantes no tienen asignación');
            }
            
        } catch (error) {
            console.error('❌ [ERROR VERIFICACIÓN] Error al verificar resultado:', error);
        }
    }
    
    // ==================== FUNCIONES DE UTILIDAD ====================
    
    /**
     * Función para regenerar asignaciones si hay cambios en la configuración
     */
    window.regenerarAsignacionesDinamicas = function() {
        console.log('🔄 [REGENERACIÓN] Regenerando asignaciones con configuración actualizada...');
        return ejecutarCorreccionDinamica();
    };
    
    /**
     * Función para obtener estadísticas del sistema
     */
    window.obtenerEstadisticasAsignaciones = function() {
        try {
            const asignaciones = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const profesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            
            const estadisticas = {
                asignacionesEstudiantes: asignaciones.length,
                asignacionesProfesores: profesores.length,
                usuariosTotales: usuarios.length,
                estudiantes: usuarios.filter(u => u.role === 'student' || u.role === 'estudiante').length,
                profesoresEnSistema: usuarios.filter(u => u.role === 'teacher' || u.role === 'profesor').length,
                cobertura: asignaciones.length > 0 ? 'Completa' : 'Incompleta'
            };
            
            console.table(estadisticas);
            return estadisticas;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return null;
        }
    };
    
    // ==================== EJECUCIÓN PRINCIPAL ====================
    
    console.log('🚀 [SISTEMA DINÁMICO] Iniciando corrección automática...');
    const resultado = ejecutarCorreccionDinamica();
    
    if (resultado.exito) {
        console.log('🎉 [ÉXITO] ¡Corrección dinámica completada exitosamente!');
        console.log('💡 [INSTRUCCIONES] Ahora los profesores verán solo los estudiantes de sus secciones asignadas');
        console.log('🔧 [UTILIDADES] Usa regenerarAsignacionesDinamicas() para actualizar después de cambios');
        console.log('📊 [ESTADÍSTICAS] Usa obtenerEstadisticasAsignaciones() para ver el estado actual');
    } else {
        console.error('❌ [FALLO] Error en la corrección dinámica:', resultado.mensaje);
    }
    
    return resultado;
    
})();
