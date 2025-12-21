/**
 * SISTEMA DE EXPORTACIÓN MEJORADA CON CONFIGURACIÓN DE ASIGNACIONES
 * Smart Student v8 - Solución de persistencia completa
 * 
 * Este script mejora el sistema de exportación/importación para incluir
 * automáticamente la configuración de asignaciones, evitando que el problema
 * se repita tras importar una base de datos.
 * 
 * FUNCIONALIDADES:
 * ✅ Exportación enriquecida con metadatos de asignaciones
 * ✅ Importación con aplicación automática de configuración
 * ✅ Validador post-importación automático
 * ✅ Sistema de versiones para compatibilidad
 * ✅ Auto-reparación en caso de inconsistencias
 * 
 * RESULTADO: El problema no vuelve a ocurrir tras exportar/importar
 */

(function() {
    'use strict';
    
    console.log('📦 [EXPORTACIÓN MEJORADA] Iniciando sistema de exportación con asignaciones...');
    
    // ==================== CONFIGURACIÓN DE VERSIONES ====================
    
    const VERSION_EXPORTACION = '2.4.0';
    const VERSIONES_COMPATIBLES = ['1.0.0', '2.0.0', '2.1.0', '2.2.0', '2.3.0', '2.4.0'];
    
    /**
     * Genera metadatos completos para la exportación
     */
    function generarMetadatosExportacion() {
        const fechaExportacion = new Date().toISOString();
        const configuracion = obtenerConfiguracionCompleta();
        
        return {
            version: VERSION_EXPORTACION,
            fechaExportacion,
            tipoExportacion: 'completa-con-asignaciones',
            estadisticas: {
                usuarios: configuracion.usuarios.length,
                estudiantes: configuracion.estudiantes.length,
                profesores: configuracion.profesores.length,
                administradores: configuracion.administradores.length,
                cursos: configuracion.cursos.length,
                secciones: configuracion.secciones.length,
                asignacionesEstudiantes: configuracion.asignacionesEstudiantes.length,
                asignacionesProfesores: configuracion.asignacionesProfesores.length,
                comunicaciones: (configuracion.comunicaciones || []).length,
                tareas: configuracion.tareas.length,
                comentariosTarea: configuracion.comentariosTarea.length,
                notificacionesTarea: configuracion.notificacionesTarea.length,
                evaluaciones: configuracion.evaluaciones.length,
                resultadosEvaluacion: (configuracion.resultadosEvaluacion || []).length,
                registrosAsistencia: configuracion.asistencia.length,
                testGradesVariantes: configuracion.testGradesStorage ? Object.keys(configuracion.testGradesStorage).length : 0,
                clavesAdicionales: configuracion.additionalStorage ? Object.keys(configuracion.additionalStorage).length : 0
            },
            configuracionSistema: obtenerConfiguracionSistema(),
            validacionIntegridad: generarHashIntegridad(configuracion)
        };
    }
    
    /**
     * Obtiene toda la configuración del sistema de forma completa
     */
    function obtenerConfiguracionCompleta() {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
            const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
            const materias = JSON.parse(localStorage.getItem('smart-student-subjects') || '[]');
            const asignacionesEstudiantes = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
            const administradores = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');
            const configuracionSistema = JSON.parse(localStorage.getItem('smart-student-config') || '{}');
            // Nuevas colecciones
            const comunicaciones = JSON.parse(localStorage.getItem('smart-student-communications') || '[]');
            const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
            const comentariosTarea = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
            const notificacionesTarea = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
            const evaluaciones = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
            // Incluir resultados de evaluaciones (calificaciones)
            const resultadosEvaluacion = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
            const asistencia = JSON.parse(localStorage.getItem('smart-student-attendance') || '[]');
            // Semestres académicos (globales)
            let semesters = null;
            try { semesters = JSON.parse(localStorage.getItem('smart-student-semesters') || 'null'); } catch { semesters = null; }

            // NUEVO: Pruebas creadas por profesores (almacenadas por usuario)
            const pruebasPorUsuario = recolectarPruebasPorUsuario();
            const totalPruebas = Object.values(pruebasPorUsuario).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);

            // NUEVO: Variantes de Test Grades y claves adicionales por año (2023-2025)
            const testGradesStorage = recolectarTestGradesStorage();
            const additionalStorage = recolectarClavesAdicionales(['2023', '2024', '2025']);

            // NUEVO: Configuraciones del Calendario Admin por año
            const calendarConfigs = (() => {
                const configs = {};
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('admin-calendar-')) {
                            const year = key.replace('admin-calendar-', '');
                            const raw = localStorage.getItem(key);
                            if (!raw) continue;
                            try { configs[year] = JSON.parse(raw); } catch { configs[year] = raw; }
                        }
                    }
                } catch (e) { /* ignore */ }
                return configs;
            })();
            
            return {
                usuarios,
                estudiantes: usuarios.filter(u => u.role === 'student' || u.role === 'estudiante'),
                profesores: usuarios.filter(u => u.role === 'teacher' || u.role === 'profesor'),
                administradores,
                cursos,
                secciones,
                materias,
                asignacionesEstudiantes,
                asignacionesProfesores,
                configuracionSistema,
                // Nuevas colecciones
                comunicaciones,
                tareas,
                comentariosTarea,
                notificacionesTarea,
                evaluaciones,
                resultadosEvaluacion,
                asistencia,
                // Nueva colección exportable
                pruebasPorUsuario,
                totalPruebas,
                calendarConfigs,
                semesters,
                testGradesStorage,
                additionalStorage
            };
        } catch (error) {
            console.error('❌ [ERROR] Error al obtener configuración completa:', error);
            return {};
        }
    }

    /**
     * Recolecta todas las pruebas de profesores guardadas por usuario.
     * Busca en localStorage claves con prefijo 'smart-student-tests' y arma un diccionario { username: TestItem[] }.
     */
    function recolectarPruebasPorUsuario() {
        const PREFIJO = 'smart-student-tests';
        const mapa = {};
        try {
            // 1) Recorremos todas las claves y tomamos las que correspondan
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;
                if (key === PREFIJO || key.startsWith(PREFIJO + '_')) {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    // Caso: clave global sin sufijo → intentar inferir username por owner
                    if (key === PREFIJO) {
                        if (Array.isArray(data)) {
                            data.forEach(item => {
                                const userKey = normalizarUsername(item?.ownerUsername) || 'global';
                                if (!mapa[userKey]) mapa[userKey] = [];
                                mapa[userKey].push(item);
                            });
                        }
                    } else {
                        // Clave por usuario: smart-student-tests_username
                        const username = key.substring(PREFIJO.length + 1);
                        const userKey = normalizarUsername(username) || 'global';
                        mapa[userKey] = Array.isArray(data) ? data : [];
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ [EXPORT] No se pudo recolectar pruebas por usuario:', e);
        }
        return mapa;
    }

    function normalizarUsername(u) {
        if (!u) return '';
        try { return String(u).trim().toLowerCase(); } catch { return ''; }
    }
    
    /**
     * Recolecta todas las variantes de almacenamiento de test-grades
     * Devuelve un mapa { key: rawString }
     */
    function recolectarTestGradesStorage() {
        const mapa = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;
                if (key.startsWith('smart-student-test-grades') || key === 'test-grades' || key.startsWith('test-grades-')) {
                    const val = localStorage.getItem(key);
                    // Guardar valor crudo para reponer exactamente como estaba
                    mapa[key] = val;
                }
            }
        } catch (e) {
            console.warn('⚠️ [EXPORT] No se pudo recolectar test-grades:', e);
        }
        return mapa;
    }

    /**
     * Recolecta claves adicionales por año y otras smart-student-* no cubiertas explícitamente
     * Devuelve un mapa { key: rawString }
     */
    function recolectarClavesAdicionales(years = []) {
        const mapa = {};
        try {
            const aniosRegex = years.length ? new RegExp(`-(?:${years.join('|')})$`) : null;
            const clavesExplicitas = new Set([
                'smart-student-users',
                'smart-student-courses',
                'smart-student-sections',
                'smart-student-subjects',
                'smart-student-administrators',
                'smart-student-config',
                'smart-student-student-assignments',
                'smart-student-teacher-assignments',
                'smart-student-communications',
                'smart-student-tasks',
                'smart-student-task-comments',
                'smart-student-task-notifications',
                'smart-student-evaluations',
                'smart-student-evaluation-results',
                'smart-student-attendance',
                'smart-student-semesters'
            ]);
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;
                const isSmart = key.startsWith('smart-student-');
                const matchesYear = aniosRegex ? aniosRegex.test(key) : /(2023|2024|2025)/.test(key);
                if (isSmart && matchesYear && !clavesExplicitas.has(key)) {
                    mapa[key] = localStorage.getItem(key);
                }
            }
        } catch (e) {
            console.warn('⚠️ [EXPORT] No se pudieron recolectar claves adicionales:', e);
        }
        return mapa;
    }

    // ==================== HELPERS SQL-BACKUP (derivado de localStorage) ====================
    function toISODate(value) {
        try {
            if (!value) return new Date().toISOString();
            if (typeof value === 'number') {
                const d = new Date(value);
                return isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
            }
            const d = new Date(value);
            return isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
        } catch { return new Date().toISOString(); }
    }

    function ensureYearField(record, fallbackYear) {
        const y = Number(record?.year || fallbackYear || new Date().getFullYear());
        return Number.isFinite(y) ? y : new Date().getFullYear();
    }

    function normalizarCalificacionesParaAnio(year) {
        const clamp = (n) => { const x = Number(n); if (!isFinite(x)) return 0; return Math.max(0, Math.min(100, x)); };
        const grades = leerTestGradesParaAnio(year);
        return grades.map((g, idx) => {
            const gradedAtISO = toISODate(g?.gradedAt || g?.date || g?.createdAt);
            const testId = String(g?.testId ?? g?.id ?? '');
            const studentId = String(g?.studentId ?? g?.username ?? g?.studentUsername ?? '');
            const tipo = (function(){ const t = String(g?.taskType || g?.type || '').toLowerCase(); return (t==='tarea'||t==='prueba'||t==='evaluacion') ? t : 'prueba'; })();
            return {
                id: String(g?.id || `${year}-${testId}-${studentId}-${idx}`),
                testId,
                studentId,
                studentName: String(g?.studentName ?? ''),
                score: clamp(g?.score ?? g?.grade ?? g?.percentage),
                courseId: g?.courseId != null ? String(g.courseId) : null,
                sectionId: g?.sectionId != null ? String(g.sectionId) : null,
                subjectId: g?.subjectId != null ? String(g.subjectId) : null,
                title: String(g?.title ?? g?.name ?? 'Nota'),
                gradedAt: gradedAtISO,
                year: Number(year),
                type: tipo,
                createdAt: gradedAtISO,
                updatedAt: gradedAtISO
            };
        });
    }

    function normalizarAsistenciaParaAnio(year) {
        const rows = maybeExpandAttendanceRows(year, leerAsistenciaParaAnio(year));
        return rows.map((r, idx) => {
            const created = toISODate(r?.createdAt || r?.date);
            const updated = toISODate(r?.updatedAt || r?.date);
            return {
                id: String(r?.id || `${year}-att-${idx}`),
                date: toISODate(r?.date || created),
                courseId: r?.courseId != null ? String(r.courseId) : null,
                sectionId: r?.sectionId != null ? String(r.sectionId) : null,
                studentId: String(r?.studentId ?? r?.username ?? ''),
                status: (function(){ const s = String(r?.status || '').toLowerCase(); return (s==='present'||s==='absent'||s==='late'||s==='excused')? s : (r?.present===false?'absent':'present'); })(),
                present: typeof r?.present === 'boolean' ? r.present : undefined,
                comment: r?.comment || undefined,
                createdAt: created,
                updatedAt: updated,
                year: Number(year)
            };
        });
    }

    function buildActivitiesByYearFromLocal(years) {
        const tasks = leerJSON('smart-student-tasks', []) || [];
        const evals = leerJSON('smart-student-evaluations', []) || [];
        const byYear = {};
        const push = (y, rec) => { if (!byYear[y]) byYear[y] = []; byYear[y].push(rec); };
        const mapTask = (t) => {
            const baseDate = toISODate(t?.createdAt || t?.openAt || t?.startAt || t?.dueDate);
            const y = new Date(baseDate).getFullYear();
            return {
                id: String(t?.id || `task-${y}-${Math.random().toString(36).slice(2)}`),
                taskType: (function(){ const tt = String(t?.taskType || '').toLowerCase(); if (tt==='assignment') return 'tarea'; if (tt==='evaluation') return 'evaluacion'; if (tt==='test'||tt==='prueba') return 'prueba'; return 'tarea'; })(),
                title: String(t?.title || 'Actividad'),
                subjectId: t?.subjectId != null ? String(t.subjectId) : null,
                subjectName: t?.subjectName != null ? String(t.subjectName) : null,
                courseId: t?.courseId != null ? String(t.courseId) : null,
                sectionId: t?.sectionId != null ? String(t.sectionId) : null,
                createdAt: baseDate,
                startAt: t?.startAt ? toISODate(t.startAt) : null,
                openAt: t?.openAt ? toISODate(t.openAt) : null,
                dueDate: t?.dueDate ? toISODate(t.dueDate) : null,
                status: t?.status != null ? String(t.status) : null,
                assignedById: t?.assignedById != null ? String(t.assignedById) : null,
                assignedByName: t?.assignedByName != null ? String(t.assignedByName) : null,
                year: ensureYearField(t, y)
            };
        };
        const mapEval = (e) => {
            const baseDate = toISODate(e?.createdAt || e?.openAt || e?.startAt || e?.dueDate);
            const y = new Date(baseDate).getFullYear();
            return {
                id: String(e?.id || `eval-${y}-${Math.random().toString(36).slice(2)}`),
                taskType: 'evaluacion',
                title: String(e?.title || 'Evaluación'),
                subjectId: e?.subjectId != null ? String(e.subjectId) : null,
                subjectName: e?.subjectName != null ? String(e.subjectName) : null,
                courseId: e?.courseId != null ? String(e.courseId) : null,
                sectionId: e?.sectionId != null ? String(e.sectionId) : null,
                createdAt: baseDate,
                startAt: e?.startAt ? toISODate(e.startAt) : null,
                openAt: e?.openAt ? toISODate(e.openAt) : null,
                dueDate: e?.dueDate ? toISODate(e.dueDate) : null,
                status: e?.status != null ? String(e.status) : null,
                assignedById: e?.assignedById != null ? String(e.assignedById) : null,
                assignedByName: e?.assignedByName != null ? String(e.assignedByName) : null,
                year: ensureYearField(e, y)
            };
        };
        try {
            tasks.forEach(t => { const rec = mapTask(t); if (years.includes(String(rec.year))) push(String(rec.year), rec); });
        } catch {}
        try {
            evals.forEach(e => { const rec = mapEval(e); if (years.includes(String(rec.year))) push(String(rec.year), rec); });
        } catch {}
        return byYear;
    }
    
    /**
     * Obtiene la configuración del sistema
     */
    function obtenerConfiguracionSistema() {
        try {
            return JSON.parse(localStorage.getItem('smart-student-config') || '{}');
        } catch (error) {
            return {};
        }
    }
    
    /**
     * Genera un hash de integridad para validar la exportación
     */
    function generarHashIntegridad(configuracion) {
        const datosIntegridad = {
            usuariosCount: configuracion.usuarios.length,
            cursosCount: configuracion.cursos.length,
            seccionesCount: configuracion.secciones.length,
            asignacionesCount: configuracion.asignacionesEstudiantes.length,
            pruebasProfesores: configuracion.totalPruebas || 0,
            evalResultsCount: (configuracion.resultadosEvaluacion || []).length
        };
        
        // Hash simple basado en counts y timestamp
        const hash = btoa(JSON.stringify(datosIntegridad) + Date.now()).substring(0, 16);
        return hash;
    }
    
    // ==================== FUNCIONES DE EXPORTACIÓN ====================
    
    /**
     * Exporta toda la base de datos con configuración de asignaciones incluida
     */
    function exportarBBDDConAsignaciones() {
        console.log('📤 [EXPORTACIÓN] Iniciando exportación completa con asignaciones...');
        
        try {
            // Paso 1: Obtener configuración completa
            const configuracion = obtenerConfiguracionCompleta();
            
            // Paso 2: Verificar que hay datos para exportar
            if (configuracion.usuarios.length === 0) {
                throw new Error('No hay datos de usuarios para exportar');
            }
            
            // Paso 3: Aplicar corrección dinámica antes de exportar
            console.log('🔄 [PRE-EXPORTACIÓN] Aplicando corrección dinámica antes de exportar...');
            aplicarCorreccionPreExportacion(configuracion);
            
            // Paso 4: Recargar configuración actualizada
            const configuracionActualizada = obtenerConfiguracionCompleta();
            
            // Paso 5: Preparar datos de exportación con enriquecimiento
            // Paso 5.1: Construir sqlBackup desde localStorage (sin depender de backend async)
            const yearsSQL = detectarAniosDeLocalStorage([2023, 2024, 2025]).map(String);
            const gradesByYear = {};
            const attendanceByYear = {};
            yearsSQL.forEach(y => {
                try {
                    const g = normalizarCalificacionesParaAnio(Number(y));
                    if (Array.isArray(g) && g.length) gradesByYear[y] = g;
                } catch {}
                try {
                    const a = normalizarAsistenciaParaAnio(Number(y));
                    if (Array.isArray(a) && a.length) attendanceByYear[y] = a;
                } catch {}
            });
            // Actividades por año derivadas
            const actsByYear = buildActivitiesByYearFromLocal(yearsSQL);

            const sqlBackup = {
                meta: {
                    provider: 'from-localstorage',
                    years: yearsSQL,
                    totalGrades: Object.values(gradesByYear).reduce((acc, arr) => acc + (arr?.length || 0), 0),
                    totalActivities: Object.values(actsByYear).reduce((acc, arr) => acc + (arr?.length || 0), 0),
                    totalAttendance: Object.values(attendanceByYear).reduce((acc, arr) => acc + (arr?.length || 0), 0),
                    exportedAt: new Date().toISOString()
                },
                gradesByYear,
                activitiesByYear: actsByYear,
                attendanceByYear
            };

            const datosExportacion = {
                // Metadatos de la exportación
                metadatos: generarMetadatosExportacion(),
                
                // Datos principales
                'smart-student-users': configuracionActualizada.usuarios,
                'smart-student-courses': configuracionActualizada.cursos,
                'smart-student-sections': configuracionActualizada.secciones,
                'smart-student-subjects': configuracionActualizada.materias,
                'smart-student-administrators': configuracionActualizada.administradores,
                'smart-student-config': configuracionActualizada.configuracionSistema,
                
                // NOVEDAD: Configuración de asignaciones incluida
                'smart-student-student-assignments': configuracionActualizada.asignacionesEstudiantes,
                'smart-student-teacher-assignments': configuracionActualizada.asignacionesProfesores,
                
                // NUEVO: Datos académicos adicionales
                'smart-student-communications': configuracionActualizada.comunicaciones,
                'smart-student-tasks': configuracionActualizada.tareas,
                'smart-student-task-comments': configuracionActualizada.comentariosTarea,
                'smart-student-task-notifications': configuracionActualizada.notificacionesTarea,
                'smart-student-evaluations': configuracionActualizada.evaluaciones,
                // Incluir resultados de evaluación (notas/calificaciones)
                'smart-student-evaluation-results': configuracionActualizada.resultadosEvaluacion,
                'smart-student-attendance': configuracionActualizada.asistencia,
                // Incluir configuraciones de calendario por año
                'calendarConfigs': configuracionActualizada.calendarConfigs,
                // Incluir semestres académicos (globales)
                'smart-student-semesters': configuracionActualizada.semesters,
                
                // NUEVO: Pruebas por profesor (diccionario username -> TestItem[])
                'smart-student-tests-by-user': configuracionActualizada.pruebasPorUsuario,
                // NUEVO: Almacenamiento crudo consolidado (test-grades y claves por año u otras variantes)
                'additionalStorage': {
                    ...(configuracionActualizada.testGradesStorage || {}),
                    ...(configuracionActualizada.additionalStorage || {})
                },

                // NUEVO: Bloque SQL de respaldo derivado (grades/activities/attendance por año)
                'sqlBackup': sqlBackup,
                
                // Configuración de mapeo dinámico
                configuracionAsignaciones: {
                    mapeoEstudiantesSeccion: generarMapeoEstudiantesSeccion(configuracionActualizada),
                    mapleoProfesoresSeccion: generarMapeoProfesoresSeccion(configuracionActualizada),
                    reglasAsignacion: obtenerReglasAsignacion()
                }
            };
            
            // Paso 6: Validar integridad de datos
            const validacion = validarIntegridadExportacion(datosExportacion);
            if (!validacion.esValido) {
                console.warn('⚠️ [ADVERTENCIA] Problemas de integridad detectados:', validacion.problemas);
            }
            
            // Paso 7: Crear archivo de exportación
            const nombreArchivo = `smart-student-backup-complete-${new Date().toISOString().split('T')[0]}.json`;
            const blob = new Blob([JSON.stringify(datosExportacion, null, 2)], { type: 'application/json' });
            
            // Paso 8: Descargar archivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ [EXPORTACIÓN EXITOSA] Base de datos exportada con asignaciones incluidas');
            console.log(`📁 Archivo generado: ${nombreArchivo}`);
            console.log('📊 Estadísticas de exportación:', datosExportacion.metadatos.estadisticas);
            
            return {
                exito: true,
                archivo: nombreArchivo,
                estadisticas: datosExportacion.metadatos.estadisticas,
                mensaje: 'Exportación completa con asignaciones exitosa'
            };
            
        } catch (error) {
            console.error('❌ [ERROR EXPORTACIÓN] Error durante la exportación:', error);
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error durante la exportación'
            };
        }
    }
    
    /**
     * Aplica corrección dinámica antes de exportar para asegurar consistencia
     */
    function aplicarCorreccionPreExportacion(configuracion) {
        console.log('🔧 [PRE-EXPORTACIÓN] Aplicando corrección dinámica...');
        
        // Si existe el script de corrección dinámica, ejecutarlo
        if (typeof window.regenerarAsignacionesDinamicas === 'function') {
            window.regenerarAsignacionesDinamicas();
        } else {
            // Aplicar corrección básica
            aplicarCorreccionBasica(configuracion);
        }
    }
    
    /**
     * Aplica una corrección básica si no está disponible la función dinámica
     */
    function aplicarCorreccionBasica(configuracion) {
        console.log('🔧 [CORRECCIÓN BÁSICA] Aplicando asignaciones básicas...');
        
        const asignacionesEstudiantes = [];
        
        configuracion.estudiantes.forEach(estudiante => {
            if (estudiante.courseId && estudiante.sectionId) {
                asignacionesEstudiantes.push({
                    id: `${estudiante.id}-${estudiante.sectionId}-${Date.now()}`,
                    studentId: estudiante.id,
                    courseId: estudiante.courseId,
                    sectionId: estudiante.sectionId,
                    assignedAt: new Date().toISOString(),
                    isActive: true
                });
            }
        });
        
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(asignacionesEstudiantes));
        console.log(`✅ [CORRECCIÓN BÁSICA] ${asignacionesEstudiantes.length} asignaciones aplicadas`);
    }
    
    /**
     * Genera mapeo de estudiantes a secciones para incluir en la exportación
     */
    function generarMapeoEstudiantesSeccion(configuracion) {
        const mapeo = {};
        
        configuracion.asignacionesEstudiantes.forEach(asignacion => {
            if (!mapeo[asignacion.sectionId]) {
                mapeo[asignacion.sectionId] = [];
            }
            mapeo[asignacion.sectionId].push({
                studentId: asignacion.studentId,
                courseId: asignacion.courseId,
                assignedAt: asignacion.assignedAt
            });
        });
        
        return mapeo;
    }
    
    /**
     * Genera mapeo de profesores a secciones
     */
    function generarMapeoProfesoresSeccion(configuracion) {
        const mapeo = {};
        
        configuracion.asignacionesProfesores.forEach(asignacion => {
            if (!mapeo[asignacion.sectionId]) {
                mapeo[asignacion.sectionId] = [];
            }
            mapeo[asignacion.sectionId].push({
                teacherId: asignacion.teacherId,
                subjectName: asignacion.subjectName,
                assignedAt: asignacion.assignedAt
            });
        });
        
        return mapeo;
    }
    
    /**
     * Obtiene las reglas de asignación configuradas
     */
    function obtenerReglasAsignacion() {
        return {
            maxEstudiantesPorSeccion: 30,
            permitirMultiplesProfesoresPorMateria: false,
            asignacionAutomatica: true,
            validarConsistenciaAlImportar: true
        };
    }
    
    /**
     * Valida la integridad de los datos de exportación
     */
    function validarIntegridadExportacion(datosExportacion) {
        const problemas = [];
        
        // Validar que hay usuarios
        if (!datosExportacion['smart-student-users'] || datosExportacion['smart-student-users'].length === 0) {
            problemas.push('No hay usuarios en la exportación');
        }
        
        // Validar que hay asignaciones
        if (!datosExportacion['smart-student-student-assignments'] || datosExportacion['smart-student-student-assignments'].length === 0) {
            problemas.push('No hay asignaciones de estudiantes en la exportación');
        }
        
        // Validar consistencia de asignaciones
        const usuarios = datosExportacion['smart-student-users'] || [];
        const asignaciones = datosExportacion['smart-student-student-assignments'] || [];
        
        const estudiantesIds = usuarios.filter(u => u.role === 'student' || u.role === 'estudiante').map(u => u.id);
        const estudiantesConAsignacion = asignaciones.map(a => a.studentId);
        
        const estudiantesSinAsignacion = estudiantesIds.filter(id => !estudiantesConAsignacion.includes(id));
        if (estudiantesSinAsignacion.length > 0) {
            problemas.push(`${estudiantesSinAsignacion.length} estudiantes sin asignación`);
        }
        
        return {
            esValido: problemas.length === 0,
            problemas
        };
    }
    
    // ==================== FUNCIONES DE IMPORTACIÓN ====================
    
    /**
     * Importa base de datos con aplicación automática de asignaciones
     */
    function importarBBDDConAsignaciones(archivoContent) {
        console.log('📥 [IMPORTACIÓN] Iniciando importación con aplicación automática de asignaciones...');
        
        try {
            // Paso 1: Parsear datos del archivo
            const datosImportacion = JSON.parse(archivoContent);
            
            // Paso 2: Validar compatibilidad de versión
            const validacionVersion = validarVersionCompatible(datosImportacion);
            if (!validacionVersion.esCompatible) {
                console.warn('⚠️ [VERSIÓN] Problema de compatibilidad:', validacionVersion.mensaje);
            }
            
            // Paso 3: Aplicar datos al localStorage
            aplicarDatosImportacion(datosImportacion);
            
            // Paso 4: Aplicar configuración de asignaciones si está disponible
            if (datosImportacion.configuracionAsignaciones) {
                console.log('🎯 [CONFIGURACIÓN] Aplicando configuración de asignaciones...');
                aplicarConfiguracionAsignaciones(datosImportacion.configuracionAsignaciones);
            }
            
            // Paso 5: Validación post-importación automática
            const validacionPost = validarPostImportacion();
            if (!validacionPost.esValido) {
                console.warn('⚠️ [POST-VALIDACIÓN] Problemas detectados:', validacionPost.problemas);
                
                // Auto-reparación en caso de problemas
                console.log('🔧 [AUTO-REPARACIÓN] Aplicando corrección automática...');
                aplicarAutoReparacion();
            }
            
            console.log('✅ [IMPORTACIÓN EXITOSA] Base de datos importada con asignaciones aplicadas');
            
            return {
                exito: true,
                mensaje: 'Importación completa con asignaciones exitosa',
                estadisticas: obtenerEstadisticasPostImportacion()
            };
            
        } catch (error) {
            console.error('❌ [ERROR IMPORTACIÓN] Error durante la importación:', error);
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error durante la importación'
            };
        }
    }
    
    /**
     * Valida si la versión del archivo es compatible
     */
    function validarVersionCompatible(datosImportacion) {
        if (!datosImportacion.metadatos || !datosImportacion.metadatos.version) {
            return {
                esCompatible: true,
                mensaje: 'Archivo sin metadatos de versión, asumiendo compatibilidad'
            };
        }
        
        const versionArchivo = datosImportacion.metadatos.version;
        if (VERSIONES_COMPATIBLES.includes(versionArchivo)) {
            return {
                esCompatible: true,
                mensaje: `Versión ${versionArchivo} compatible`
            };
        }
        
        return {
            esCompatible: false,
            mensaje: `Versión ${versionArchivo} no compatible. Versiones soportadas: ${VERSIONES_COMPATIBLES.join(', ')}`
        };
    }
    
    /**
     * Aplica los datos de importación al localStorage
     */
    function aplicarDatosImportacion(datosImportacion) {
        console.log('💾 [APLICACIÓN] Aplicando datos importados al localStorage...');
        
    const claves = [
            'smart-student-users',
            'smart-student-courses',
            'smart-student-sections',
            'smart-student-subjects',
            'smart-student-administrators',
            'smart-student-config',
            'smart-student-student-assignments',
            'smart-student-teacher-assignments',
            // Nuevas colecciones
            'smart-student-communications',
            'smart-student-tasks',
            'smart-student-task-comments',
            'smart-student-task-notifications',
            'smart-student-evaluations',
        'smart-student-evaluation-results',
            'smart-student-attendance',
            // Semestres académicos
            'smart-student-semesters'
        ];
        
        claves.forEach(clave => {
            if (datosImportacion[clave]) {
                localStorage.setItem(clave, JSON.stringify(datosImportacion[clave]));
                console.log(`   ✅ ${clave}: ${datosImportacion[clave].length || 'aplicado'}`);
            }
        });

        // Restaurar pruebas por usuario
        try {
            const testsByUser = datosImportacion['smart-student-tests-by-user'];
            if (testsByUser && typeof testsByUser === 'object') {
                const PREFIJO = 'smart-student-tests';
                Object.keys(testsByUser).forEach(username => {
                    const userKey = (username && username !== 'global') ? `${PREFIJO}_${username}` : PREFIJO;
                    const arr = Array.isArray(testsByUser[username]) ? testsByUser[username] : [];
                    localStorage.setItem(userKey, JSON.stringify(arr));
                    console.log(`   ✅ ${userKey}: ${arr.length}`);
                });
            }
        } catch (e) {
            console.warn('⚠️ [IMPORT] No se pudieron restaurar las pruebas por usuario:', e);
        }

            // Restaurar configuraciones de calendario admin por año
            try {
                const calendarConfigs = datosImportacion['calendarConfigs'];
                if (calendarConfigs && typeof calendarConfigs === 'object') {
                    let restored = 0;
                    Object.entries(calendarConfigs).forEach(([year, cfg]) => {
                        try {
                            const y = String(year).trim();
                            if (!/^[0-9]{4}$/.test(y)) return;
                            const key = `admin-calendar-${y}`;
                            const value = typeof cfg === 'string' ? cfg : JSON.stringify(cfg);
                            localStorage.setItem(key, value);
                            restored++;
                        } catch {}
                    });
                    console.log(`   ✅ Calendarios restaurados: ${restored}`);
                }
            } catch (e) {
                /* ignorar */
            }

        // Restaurar claves adicionales crudas (incluye test-grades variantes y colecciones por año)
        try {
            const additional = datosImportacion['additionalStorage'];
            if (additional && typeof additional === 'object') {
                let restored = 0;
                Object.entries(additional).forEach(([key, raw]) => {
                    try {
                        if (typeof raw === 'string') {
                            localStorage.setItem(key, raw);
                        } else {
                            localStorage.setItem(key, JSON.stringify(raw));
                        }
                        restored++;
                    } catch {}
                });
                console.log(`   ✅ additionalStorage restaurado: ${restored} claves`);
            }
        } catch (e) {
            console.warn('⚠️ [IMPORT] No se pudieron restaurar additionalStorage:', e);
        }

        // Intentar migración a SQL (calificaciones y asistencia) por año tras restaurar
        let categoriasMigradasPorSQLBackup = { grades: false, activities: false, attendance: false };

        // Restaurar bloque SQL si viene incluido (inserción directa en backend; operaciones best-effort sin await)
        try {
            const sqlBackup = datosImportacion && datosImportacion.sqlBackup ? datosImportacion.sqlBackup : null;
            if (sqlBackup && typeof sqlBackup === 'object') {
                const backend = (window.sqlDatabase || window.sqlDB || null);
                const usingBackend = backend && typeof backend === 'object';
                const { gradesByYear, activitiesByYear, attendanceByYear } = sqlBackup;
                if (usingBackend) {
                    // Cargar calificaciones
                    if (gradesByYear && backend.insertGrades) {
                        try {
                            Object.entries(gradesByYear).forEach(([year, arr]) => {
                                if (!Array.isArray(arr) || arr.length === 0) return;
                                const batchSize = 1000;
                                for (let i = 0; i < arr.length; i += batchSize) {
                                    const batch = arr.slice(i, i + batchSize);
                                    try { backend.insertGrades(batch); } catch (e) { console.warn('insertGrades fallo (lote)', e); }
                                }
                            });
                            categoriasMigradasPorSQLBackup.grades = true;
                            try { window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { detail: { imported: true } })); } catch {}
                        } catch (e) { console.warn('⚠️ [IMPORT] No se pudieron insertar grades desde sqlBackup:', e); }
                    }
                    // Cargar actividades
                    if (activitiesByYear && backend.insertActivities) {
                        try {
                            Object.entries(activitiesByYear).forEach(([year, arr]) => {
                                if (!Array.isArray(arr) || arr.length === 0) return;
                                const batchSize = 1000;
                                for (let i = 0; i < arr.length; i += batchSize) {
                                    const batch = arr.slice(i, i + batchSize);
                                    try { backend.insertActivities(batch); } catch (e) { console.warn('insertActivities fallo (lote)', e); }
                                }
                            });
                            categoriasMigradasPorSQLBackup.activities = true;
                            try { window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { detail: { imported: true } })); } catch {}
                        } catch (e) { console.warn('⚠️ [IMPORT] No se pudieron insertar activities desde sqlBackup:', e); }
                    }
                    // Cargar asistencia
                    if (attendanceByYear && backend.insertAttendance) {
                        try {
                            Object.entries(attendanceByYear).forEach(([year, arr]) => {
                                if (!Array.isArray(arr) || arr.length === 0) return;
                                const batchSize = 2000;
                                for (let i = 0; i < arr.length; i += batchSize) {
                                    const batch = arr.slice(i, i + batchSize).map(r => ({ ...r, year: ensureYearField(r, year) }));
                                    try { backend.insertAttendance(batch); } catch (e) { console.warn('insertAttendance fallo (lote)', e); }
                                }
                            });
                            categoriasMigradasPorSQLBackup.attendance = true;
                            try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { imported: true } })); } catch {}
                        } catch (e) { console.warn('⚠️ [IMPORT] No se pudieron insertar attendance desde sqlBackup:', e); }
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ [IMPORT] Procesamiento de sqlBackup falló:', e);
        }

        // Intentar migración a SQL (calificaciones, actividades y asistencia) por año tras restaurar, evitando duplicados si ya se insertó desde sqlBackup
        try {
            migrarSQLPostImport(categoriasMigradasPorSQLBackup);
        } catch (e) {
            console.warn('⚠️ [IMPORT] Migración a SQL no disponible:', e);
        }
    }

    /**
     * Detecta años presentes y migra calificaciones (test-grades) y asistencia a SQL si backend está disponible
     */
    function migrarSQLPostImport(flags) {
        const backend = (window.sqlDatabase || window.sqlDB || null);
        if (!backend || (typeof backend !== 'object')) {
            console.log('ℹ️ [SQL] Backend SQL no disponible, omitiendo migración');
            return;
        }
        const canInsertGrades = typeof backend.insertGrades === 'function';
        const canInsertAttendance = typeof backend.insertAttendance === 'function';
        const canInsertActivities = typeof backend.insertActivities === 'function';
        if (!canInsertGrades && !canInsertAttendance && !canInsertActivities) {
            console.log('ℹ️ [SQL] insertGrades/insertAttendance/insertActivities no disponibles');
            return;
        }

        const years = detectarAniosDeLocalStorage([2023, 2024, 2025]);
        if (years.length === 0) return;

        console.log('🗄️ [SQL] Migrando datos a SQL para años:', years);
        const toISO = (v) => { try { const d = new Date(typeof v === 'number' ? v : (v || Date.now())); return isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString(); } catch { return new Date().toISOString(); } };
        const clamp = (n) => { const x = Number(n); if (!isFinite(x)) return 0; return Math.max(0, Math.min(100, x)); };

        // Migrar calificaciones
        if (canInsertGrades && !(flags && flags.grades)) {
            try {
                let totalGrades = 0;
                years.forEach((y) => {
                    const grades = leerTestGradesParaAnio(y);
                    if (!grades || grades.length === 0) return;
                    const normalized = grades.map((g, idx) => {
                        const testId = String(g?.testId ?? g?.id ?? '');
                        const studentId = String(g?.studentId ?? g?.username ?? g?.studentUsername ?? '');
                        const gradedAtISO = toISO(g?.gradedAt || g?.date || g?.createdAt);
                        return {
                            id: String(g?.id || `${y}-${testId}-${studentId}-${idx}`),
                            testId,
                            studentId,
                            studentName: String(g?.studentName ?? ''),
                            score: clamp(g?.score ?? g?.grade ?? g?.percentage),
                            courseId: g?.courseId != null ? String(g.courseId) : null,
                            sectionId: g?.sectionId != null ? String(g.sectionId) : null,
                            subjectId: g?.subjectId != null ? String(g.subjectId) : null,
                            title: String(g?.title ?? g?.name ?? 'Nota'),
                            gradedAt: gradedAtISO,
                            year: Number(y),
                            type: (function() { const t = String(g?.taskType || g?.type || '').toLowerCase(); return (t==='tarea'||t==='prueba'||t==='evaluacion') ? t : 'prueba'; })(),
                            createdAt: gradedAtISO,
                            updatedAt: gradedAtISO
                        };
                    });
                    // Insertar por lotes
                    const batchSize = 1000;
                    for (let i = 0; i < normalized.length; i += batchSize) {
                        const batch = normalized.slice(i, i + batchSize);
                        try { backend.insertGrades(batch); totalGrades += batch.length; }
                        catch (e) { console.warn('Error insertando lote de calificaciones SQL', { year: y, from: i }, e); }
                    }
                });
                if (totalGrades) {
                    console.log(`🗄️ [SQL] Calificaciones migradas: ${totalGrades}`);
                    try { window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { detail: { migrated: totalGrades } })); } catch {}
                }
            } catch (e) {
                console.warn('⚠️ [SQL] Migración de calificaciones falló:', e);
            }
        }

        // Migrar asistencia
        if (canInsertAttendance && !(flags && flags.attendance)) {
            try {
                let totalAtt = 0;
                years.forEach((y) => {
                    const rows = maybeExpandAttendanceRows(y, leerAsistenciaParaAnio(y));
                    if (!rows || rows.length === 0) return;
                    const batchSize = 2000;
                    for (let i = 0; i < rows.length; i += batchSize) {
                        const batch = rows.slice(i, i + batchSize).map((r) => ({ ...r, year: Number(y) }));
                        try { backend.insertAttendance(batch); totalAtt += batch.length; }
                        catch (e) { console.warn('Error insertando lote de asistencia SQL', { year: y, from: i }, e); }
                    }
                });
                if (totalAtt) {
                    console.log(`🗄️ [SQL] Asistencia migrada: ${totalAtt}`);
                    try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { migrated: totalAtt } })); } catch {}
                }
            } catch (e) {
                console.warn('⚠️ [SQL] Migración de asistencia falló:', e);
            }
        }

        // Migrar actividades (derivadas de tareas y evaluaciones)
        if (canInsertActivities && !(flags && flags.activities)) {
            try {
                const yearStrs = years.map(String);
                const actsByYear = buildActivitiesByYearFromLocal(yearStrs);
                let totalActs = 0;
                Object.entries(actsByYear).forEach(([y, arr]) => {
                    if (!Array.isArray(arr) || arr.length === 0) return;
                    const batchSize = 1000;
                    for (let i = 0; i < arr.length; i += batchSize) {
                        const batch = arr.slice(i, i + batchSize).map(r => ({ ...r, year: ensureYearField(r, y) }));
                        try { backend.insertActivities(batch); totalActs += batch.length; }
                        catch (e) { console.warn('Error insertando lote de actividades SQL', { year: y, from: i }, e); }
                    }
                });
                if (totalActs) {
                    console.log(`🗄️ [SQL] Actividades migradas: ${totalActs}`);
                    try { window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { detail: { migrated: totalActs } })); } catch {}
                }
            } catch (e) {
                console.warn('⚠️ [SQL] Migración de actividades falló:', e);
            }
        }
    }

    function detectarAniosDeLocalStorage(preferidos = []) {
        const set = new Set(preferidos.filter(n => Number.isFinite(n)));
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i) || '';
                const m = key.match(/smart-student-(?:courses|sections|subjects|students|teachers|teacher-assignments|student-assignments|attendance|attendance-summary|test-grades)-(\d{4})$/);
                if (m) { const y = parseInt(m[1], 10); if (y>=2000 && y<=2100) set.add(y); }
                const m2 = key.match(/(?:test-grades|test-grades-compact|test-grades-sharded)-(\d{4})$/);
                if (m2) { const y = parseInt(m2[1], 10); if (y>=2000 && y<=2100) set.add(y); }
            }
        } catch {}
        return Array.from(set.values()).sort();
    }

    function leerJSON(key, fallback = null) {
        try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    }

    function leerTestGradesParaAnio(year) {
        // Preferir clave oficial por año
        const candidates = [
            `smart-student-test-grades-${year}`,
            `test-grades-${year}`
        ];
        for (const k of candidates) {
            const arr = leerJSON(k, null);
            if (Array.isArray(arr)) return arr;
        }
        // Fallback: algunos ambientes guardan todo en una lista global sin sufijo
        const globalArr = leerJSON('smart-student-test-grades', null) || leerJSON('test-grades', null);
        if (Array.isArray(globalArr)) return globalArr.filter(g => String(g?.year||'') === String(year));
        return [];
    }

    function leerAsistenciaParaAnio(year) {
        // Puede ser expandido o compacto; si es compacto, no podemos convertir a filas sin librería, se omite
        const expanded = leerJSON(`smart-student-attendance-${year}`, null);
        if (Array.isArray(expanded)) return expanded;
        // Intentar expandir forma compacta si existe (mínimo: excepciones con studentId/courseId/sectionId)
        const compact = leerJSON(`smart-student-attendance-compact-${year}`, null) || leerJSON(`smart-student-attendance-summary-${year}`, null);
        if (compact && compact.rows && Array.isArray(compact.rows)) return compact.rows;
        return [];
    }

    // ==================== EXPANSIÓN DE ASISTENCIA (compacta -> filas completas) ====================
    function getCalendarConfigForYear(year) {
        try {
            const raw = localStorage.getItem(`admin-calendar-${year}`);
            if (!raw) return null;
            try { return JSON.parse(raw); } catch { return raw; }
        } catch { return null; }
    }

    function parseLocalYMD(ymd) {
        try { const [yy, mm, dd] = String(ymd).split('-').map(Number); return new Date(yy, (mm||1)-1, dd||1); } catch { return null; }
    }

    function listWorkingDaysForYear(year, cfg) {
        const days = [];
        try {
            const start = new Date(Number(year), 0, 1);
            const end = new Date(Number(year), 11, 31);
            const holidays = Array.isArray(cfg?.holidays) ? cfg.holidays : [];
            const inRange = (date, range) => {
                if (!range?.start || !range?.end) return false;
                const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                const a = parseLocalYMD(range.start); const b = parseLocalYMD(range.end);
                if (!a || !b) return false; const [min, max] = a.getTime() <= b.getTime() ? [a.getTime(), b.getTime()] : [b.getTime(), a.getTime()];
                return t >= min && t <= max;
            };
            const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const d = new Date(start);
            while (d <= end) {
                const dow = d.getDay();
                const ymd = keyOf(d);
                const isWeekday = dow >= 1 && dow <= 5;
                if (isWeekday && !inRange(d, cfg?.summer) && !inRange(d, cfg?.winter) && !holidays.includes(ymd)) {
                    days.push(ymd);
                }
                d.setDate(d.getDate() + 1);
            }
        } catch { /* ignore */ }
        return days;
    }

    function getStudentsForYear(year) {
        // Preferir lista por año si existe, si no, usar usuarios globales con courseId/sectionId
        let arr = leerJSON(`smart-student-students-${year}`, null);
        if (Array.isArray(arr) && arr.length) return arr.filter(s => s && (s.courseId || s.sectionId));
        const users = leerJSON('smart-student-users', []);
        return Array.isArray(users) ? users.filter(u => (u.role==='student'||u.role==='estudiante') && (u.courseId && u.sectionId)) : [];
    }

    function indexAttendanceByDateStudent(rows) {
        const idx = new Set();
        try {
            rows.forEach(r => {
                const ymd = (r?.date || '').slice(0,10);
                if (!ymd) return;
                const sid = String(r?.studentId || '');
                if (!sid) return;
                idx.add(`${ymd}::${sid}`);
            });
        } catch { /* ignore */ }
        return idx;
    }

    function maybeExpandAttendanceRows(year, rows) {
        try {
            const cfg = getCalendarConfigForYear(year) || {};
            const workDays = listWorkingDaysForYear(year, cfg);
            const students = getStudentsForYear(year);
            if (!Array.isArray(workDays) || workDays.length === 0 || !Array.isArray(students) || students.length === 0) return rows;

            const existing = indexAttendanceByDateStudent(rows);
            const additions = [];
            const createdNow = new Date().toISOString();
            for (let i = 0; i < workDays.length; i++) {
                const ymd = workDays[i];
                for (let j = 0; j < students.length; j++) {
                    const s = students[j];
                    const sid = String(s?.id || s?.studentId || s?.username || '');
                    if (!sid) continue;
                    const key = `${ymd}::${sid}`;
                    if (existing.has(key)) continue; // ya hay un registro (ausente/tarde/etc.)
                    additions.push({
                        id: `${year}-${ymd}-${sid}`,
                        date: `${ymd}T00:00:00.000Z`,
                        courseId: s?.courseId != null ? String(s.courseId) : null,
                        sectionId: s?.sectionId != null ? String(s.sectionId) : null,
                        studentId: sid,
                        status: 'present',
                        present: true,
                        createdAt: createdNow,
                        updatedAt: createdNow,
                        year: Number(year)
                    });
                }
            }
            if (additions.length) {
                console.log(`🧩 [ASISTENCIA] Expansión generó ${additions.length} filas 'present' para ${year}`);
                return rows.concat(additions);
            }
        } catch (e) {
            console.warn('⚠️ [ASISTENCIA] No se pudo expandir asistencia:', e);
        }
        return rows;
    }
    
    /**
     * Aplica la configuración específica de asignaciones
     */
    function aplicarConfiguracionAsignaciones(configuracionAsignaciones) {
        // Aplicar reglas de asignación
        if (configuracionAsignaciones.reglasAsignacion) {
            const configActual = JSON.parse(localStorage.getItem('smart-student-config') || '{}');
            const configActualizada = {
                ...configActual,
                ...configuracionAsignaciones.reglasAsignacion
            };
            localStorage.setItem('smart-student-config', JSON.stringify(configActualizada));
        }
        
        console.log('✅ [CONFIGURACIÓN] Configuración de asignaciones aplicada');
    }
    
    /**
     * Valida el estado del sistema después de la importación
     */
    function validarPostImportacion() {
        const problemas = [];
        
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const asignacionesEstudiantes = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
            
            // Validar que hay datos
            if (usuarios.length === 0) {
                problemas.push('No hay usuarios después de la importación');
            }
            
            if (asignacionesEstudiantes.length === 0) {
                problemas.push('No hay asignaciones de estudiantes después de la importación');
            }
            
            // Validar consistencia
            const estudiantes = usuarios.filter(u => u.role === 'student' || u.role === 'estudiante');
            const estudiantesAsignados = asignacionesEstudiantes.map(a => a.studentId);
            const estudiantesSinAsignacion = estudiantes.filter(e => !estudiantesAsignados.includes(e.id));
            
            if (estudiantesSinAsignacion.length > 0) {
                problemas.push(`${estudiantesSinAsignacion.length} estudiantes sin asignación después de importar`);
            }
            
        } catch (error) {
            problemas.push('Error al validar datos después de la importación: ' + error.message);
        }
        
        return {
            esValido: problemas.length === 0,
            problemas
        };
    }
    
    /**
     * Aplica auto-reparación en caso de problemas post-importación
     */
    function aplicarAutoReparacion() {
        console.log('🔧 [AUTO-REPARACIÓN] Iniciando auto-reparación...');
        
        // Si está disponible la función de corrección dinámica, usarla
        if (typeof window.regenerarAsignacionesDinamicas === 'function') {
            window.regenerarAsignacionesDinamicas();
        } else {
            // Aplicar reparación básica
            aplicarReparacionBasica();
        }
        
        console.log('✅ [AUTO-REPARACIÓN] Auto-reparación completada');
    }
    
    /**
     * Aplica una reparación básica del sistema
     */
    function aplicarReparacionBasica() {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const estudiantes = usuarios.filter(u => u.role === 'student' || u.role === 'estudiante');
            
            const asignacionesReparacion = estudiantes.map((estudiante, index) => ({
                id: `repair-${estudiante.id}-${Date.now()}-${index}`,
                studentId: estudiante.id,
                courseId: estudiante.courseId || 'default-course',
                sectionId: estudiante.sectionId || 'default-section',
                assignedAt: new Date().toISOString(),
                isActive: true
            })).filter(a => a.courseId !== 'default-course' && a.sectionId !== 'default-section');
            
            if (asignacionesReparacion.length > 0) {
                localStorage.setItem('smart-student-student-assignments', JSON.stringify(asignacionesReparacion));
                console.log(`🔧 [REPARACIÓN] ${asignacionesReparacion.length} asignaciones reparadas`);
            }
        } catch (error) {
            console.error('❌ [ERROR REPARACIÓN] Error en auto-reparación:', error);
        }
    }
    
    /**
     * Obtiene estadísticas después de la importación
     */
    function obtenerEstadisticasPostImportacion() {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const asignacionesEstudiantes = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const asignacionesProfesores = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
            
            return {
                usuariosImportados: usuarios.length,
                estudiantesAsignados: asignacionesEstudiantes.length,
                profesoresAsignados: asignacionesProfesores.length,
                estadoSistema: 'Operativo'
            };
        } catch (error) {
            return {
                usuariosImportados: 0,
                estudiantesAsignados: 0,
                profesoresAsignados: 0,
                estadoSistema: 'Error'
            };
        }
    }
    
    // ==================== FUNCIONES DE VALIDACIÓN MANUAL ====================
    
    /**
     * Función para validar asignaciones manualmente
     */
    function validarAsignacionesManualmente() {
        console.log('🔍 [VALIDACIÓN MANUAL] Iniciando validación manual del sistema...');
        
        try {
            const configuracion = obtenerConfiguracionCompleta();
            
            console.log('📊 [VALIDACIÓN] Estadísticas del sistema:');
            console.table({
                'Usuarios totales': configuracion.usuarios.length,
                'Estudiantes': configuracion.estudiantes.length,
                'Profesores': configuracion.profesores.length,
                'Administradores': configuracion.administradores.length,
                'Cursos': configuracion.cursos.length,
                'Secciones': configuracion.secciones.length,
                'Asignaciones estudiantes': configuracion.asignacionesEstudiantes.length,
                'Asignaciones profesores': configuracion.asignacionesProfesores.length,
                'Comunicaciones': (configuracion.comunicaciones || []).length
            });
            
            // Validar consistencia de asignaciones
            const problemasDetectados = [];
            
            // Verificar estudiantes sin asignación
            const estudiantesSinAsignacion = configuracion.estudiantes.filter(e => 
                !configuracion.asignacionesEstudiantes.some(a => a.studentId === e.id)
            );
            
            if (estudiantesSinAsignacion.length > 0) {
                problemasDetectados.push({
                    tipo: 'Estudiantes sin asignación',
                    cantidad: estudiantesSinAsignacion.length,
                    detalles: estudiantesSinAsignacion.map(e => e.displayName || e.username)
                });
            }
            
            // Verificar profesores sin asignación
            const profesoresSinAsignacion = configuracion.profesores.filter(p => 
                !configuracion.asignacionesProfesores.some(a => a.teacherId === p.id)
            );
            
            if (profesoresSinAsignacion.length > 0) {
                problemasDetectados.push({
                    tipo: 'Profesores sin asignación',
                    cantidad: profesoresSinAsignacion.length,
                    detalles: profesoresSinAsignacion.map(p => p.displayName || p.username)
                });
            }
            
            // Verificar secciones huérfanas
            const seccionesConEstudiantes = [...new Set(configuracion.asignacionesEstudiantes.map(a => a.sectionId))];
            const seccionesConProfesores = [...new Set(configuracion.asignacionesProfesores.map(a => a.sectionId))];
            const seccionesHuerfanas = seccionesConEstudiantes.filter(s => !seccionesConProfesores.includes(s));
            
            if (seccionesHuerfanas.length > 0) {
                problemasDetectados.push({
                    tipo: 'Secciones con estudiantes pero sin profesor',
                    cantidad: seccionesHuerfanas.length,
                    detalles: seccionesHuerfanas
                });
            }
            
            // Mostrar resultados
            if (problemasDetectados.length === 0) {
                console.log('✅ [VALIDACIÓN EXITOSA] No se detectaron problemas en el sistema');
            } else {
                console.warn('⚠️ [PROBLEMAS DETECTADOS]:');
                problemasDetectados.forEach(problema => {
                    console.warn(`   • ${problema.tipo}: ${problema.cantidad}`);
                    console.warn(`     Detalles:`, problema.detalles);
                });
            }
            
            return {
                esValido: problemasDetectados.length === 0,
                problemas: problemasDetectados,
                estadisticas: configuracion
            };
            
        } catch (error) {
            console.error('❌ [ERROR VALIDACIÓN] Error durante la validación:', error);
            return {
                esValido: false,
                error: error.message
            };
        }
    }
    
    // ==================== FUNCIONES PÚBLICAS ====================
    
    // Exportar funciones al scope global para uso desde la consola y otros componentes
    window.exportarBBDDConAsignaciones = exportarBBDDConAsignaciones;
    window.importarBBDDConAsignaciones = importarBBDDConAsignaciones;
    window.validarAsignacionesManualmente = validarAsignacionesManualmente;
    
    // Función utilitaria para cargar archivo desde input
    window.cargarYProcesarArchivo = function(inputElement) {
        const archivo = inputElement.files[0];
        if (!archivo) {
            console.error('❌ [ERROR] No se seleccionó ningún archivo');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const contenido = e.target.result;
            importarBBDDConAsignaciones(contenido);
        };
        reader.readAsText(archivo);
    };
    
    // ==================== INICIALIZACIÓN ====================
    
    console.log('✅ [SISTEMA EXPORTACIÓN] Sistema de exportación mejorada inicializado');
    console.log('📚 [FUNCIONES DISPONIBLES]:');
    console.log('   • exportarBBDDConAsignaciones() - Exportar con asignaciones');
    console.log('   • importarBBDDConAsignaciones(contenido) - Importar con aplicación automática');
    console.log('   • validarAsignacionesManualmente() - Validar estado del sistema');
    console.log('   • cargarYProcesarArchivo(inputElement) - Cargar desde input file');
    
    return {
        exportar: exportarBBDDConAsignaciones,
        importar: importarBBDDConAsignaciones,
        validar: validarAsignacionesManualmente,
        version: VERSION_EXPORTACION
    };
    
})();
