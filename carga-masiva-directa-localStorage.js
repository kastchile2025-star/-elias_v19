/**
 * CARGA MASIVA DIRECTA A LOCALSTORAGE
 * Smart Student v17
 * 
 * Esta solución carga calificaciones masivamente DIRECTAMENTE en localStorage
 * sin depender del servidor ni Firebase
 * 
 * USAR CUANDO:
 * - Firebase está deshabilitado
 * - Necesitas cargar calificaciones sin backend
 * - Error: "Error del servidor (JSON): {}"
 */

(function() {
    'use strict';
    
    console.log('📚 [CARGA MASIVA DIRECTA] Sistema de carga masiva a localStorage iniciado');
    
    // ==================== CONFIGURACIÓN ====================
    
    const CONFIG = {
        TAMANO_LOTE: 100,
        PAUSA_ENTRE_LOTES: 50,
        AUTO_COMPRIMIR: true
    };
    
    // ==================== PARSEAR CSV ====================
    
    function parsearCSV(contenido) {
        const lineas = contenido.trim().split('\n');
        const encabezados = lineas[0].split(',').map(h => h.trim());
        
        const datos = [];
        for (let i = 1; i < lineas.length; i++) {
            if (!lineas[i].trim()) continue;
            
            const valores = lineas[i].split(',');
            const registro = {};
            
            encabezados.forEach((header, index) => {
                registro[header] = valores[index]?.trim() || '';
            });
            
            datos.push(registro);
        }
        
        return datos;
    }
    
    // ==================== VALIDAR CALIFICACIONES ====================
    
    function validarCalificaciones(calificaciones) {
        const errores = [];
        
        calificaciones.forEach((cal, index) => {
            const lineNum = index + 2; // +2 porque index 0 es línea 2 del CSV
            
            if (!cal.studentId && !cal.student_id) {
                errores.push(`Línea ${lineNum}: falta studentId`);
            }
            if (!cal.taskId && !cal.task_id && !cal.evaluationId && !cal.evaluation_id) {
                errores.push(`Línea ${lineNum}: falta taskId o evaluationId`);
            }
            if (!cal.grade && cal.grade !== 0) {
                errores.push(`Línea ${lineNum}: falta grade`);
            }
        });
        
        return errores;
    }
    
    // ==================== NORMALIZAR CALIFICACIONES ====================
    
    function normalizarCalificaciones(calificaciones) {
        return calificaciones.map((cal, index) => {
            // Soportar diferentes formatos de nombres de columnas
            const studentId = cal.studentId || cal.student_id || cal.StudentId;
            const taskId = cal.taskId || cal.task_id || cal.TaskId;
            const evaluationId = cal.evaluationId || cal.evaluation_id || cal.EvaluationId;
            const grade = parseFloat(cal.grade || cal.Grade || 0);
            const maxGrade = parseFloat(cal.maxGrade || cal.max_grade || cal.MaxGrade || 100);
            
            return {
                id: cal.id || `grade-${studentId}-${taskId || evaluationId}-${Date.now()}-${index}`,
                studentId: studentId,
                taskId: taskId || null,
                evaluationId: evaluationId || null,
                grade: grade,
                maxGrade: maxGrade,
                comment: cal.comment || cal.Comment || '',
                feedback: cal.feedback || cal.Feedback || '',
                gradedBy: cal.gradedBy || cal.graded_by || cal.GradedBy || 'admin',
                gradedAt: cal.gradedAt || cal.graded_at || new Date().toISOString(),
                submittedAt: cal.submittedAt || cal.submitted_at || new Date().toISOString(),
                status: cal.status || 'graded',
                // Campos adicionales
                courseId: cal.courseId || cal.course_id,
                sectionId: cal.sectionId || cal.section_id,
                semester: cal.semester || cal.Semester,
                year: cal.year || cal.Year || new Date().getFullYear()
            };
        });
    }
    
    // ==================== CARGAR EN LOTES ====================
    
    window.cargarCalificacionesMasivas = async function(archivo, opciones = {}) {
        console.log('📦 [CARGA MASIVA] Iniciando carga desde archivo...');
        
        const config = { ...CONFIG, ...opciones };
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const contenido = e.target.result;
                    console.log(`📄 Archivo leído: ${contenido.length} caracteres`);
                    
                    // PASO 1: Parsear CSV
                    console.log('🔍 [1/5] Parseando CSV...');
                    const datosCSV = parsearCSV(contenido);
                    console.log(`✅ ${datosCSV.length} registros encontrados`);
                    
                    // PASO 2: Validar
                    console.log('🔍 [2/5] Validando datos...');
                    const errores = validarCalificaciones(datosCSV);
                    
                    if (errores.length > 0) {
                        console.error('❌ Errores de validación encontrados:');
                        errores.slice(0, 10).forEach(err => console.error(`   • ${err}`));
                        if (errores.length > 10) {
                            console.error(`   ... y ${errores.length - 10} errores más`);
                        }
                        
                        const continuar = confirm(
                            `Se encontraron ${errores.length} errores de validación.\n\n` +
                            `Primeros errores:\n${errores.slice(0, 3).join('\n')}\n\n` +
                            `¿Deseas continuar de todos modos?`
                        );
                        
                        if (!continuar) {
                            reject(new Error(`Validación fallida: ${errores.length} errores`));
                            return;
                        }
                    } else {
                        console.log('✅ Validación exitosa');
                    }
                    
                    // PASO 3: Normalizar
                    console.log('🔄 [3/5] Normalizando datos...');
                    const calificacionesNormalizadas = normalizarCalificaciones(datosCSV);
                    console.log(`✅ ${calificacionesNormalizadas.length} calificaciones normalizadas`);
                    
                    // PASO 4: Determinar tipo de entidad
                    const esTarea = calificacionesNormalizadas.some(c => c.taskId);
                    const esEvaluacion = calificacionesNormalizadas.some(c => c.evaluationId);
                    
                    let clave = '';
                    if (esTarea) {
                        clave = 'smart-student-task-submissions';
                        console.log('📝 Tipo detectado: Entregas de tareas');
                    } else if (esEvaluacion) {
                        clave = 'smart-student-evaluation-results';
                        console.log('📊 Tipo detectado: Resultados de evaluaciones');
                    } else {
                        console.warn('⚠️ No se pudo determinar el tipo, usando task-submissions por defecto');
                        clave = 'smart-student-task-submissions';
                    }
                    
                    // PASO 5: Cargar en lotes
                    console.log(`📦 [4/5] Cargando en lotes de ${config.TAMANO_LOTE}...`);
                    
                    const resultados = {
                        exitosos: 0,
                        fallidos: 0,
                        duplicados: 0,
                        errores: [],
                        iniciado: new Date().toISOString()
                    };
                    
                    // Cargar datos existentes
                    let datosExistentes = [];
                    try {
                        const datosStr = localStorage.getItem(clave);
                        datosExistentes = datosStr ? JSON.parse(datosStr) : [];
                        console.log(`📥 Datos existentes: ${datosExistentes.length} registros`);
                    } catch (e) {
                        console.warn('⚠️ Error al cargar datos existentes:', e);
                        datosExistentes = [];
                    }
                    
                    // IDs existentes para evitar duplicados
                    const idsExistentes = new Set(datosExistentes.map(d => d.id));
                    
                    // Procesar en lotes
                    const tamanoLote = config.TAMANO_LOTE;
                    const totalLotes = Math.ceil(calificacionesNormalizadas.length / tamanoLote);
                    
                    for (let i = 0; i < calificacionesNormalizadas.length; i += tamanoLote) {
                        const lote = calificacionesNormalizadas.slice(i, i + tamanoLote);
                        const numeroLote = Math.floor(i / tamanoLote) + 1;
                        
                        console.log(`\n📦 [LOTE ${numeroLote}/${totalLotes}] Procesando ${lote.length} calificaciones...`);
                        
                        // Filtrar duplicados
                        const loteNuevo = lote.filter(c => {
                            if (idsExistentes.has(c.id)) {
                                resultados.duplicados++;
                                return false;
                            }
                            idsExistentes.add(c.id);
                            return true;
                        });
                        
                        if (loteNuevo.length === 0) {
                            console.log(`   ℹ️ Todos son duplicados, omitiendo...`);
                            continue;
                        }
                        
                        // Agregar al array
                        datosExistentes.push(...loteNuevo);
                        
                        // Intentar guardar
                        try {
                            localStorage.setItem(clave, JSON.stringify(datosExistentes));
                            resultados.exitosos += loteNuevo.length;
                            
                            const progreso = Math.min(((i + lote.length) / calificacionesNormalizadas.length * 100), 100);
                            console.log(`   ✅ Guardados ${loteNuevo.length} nuevos (${resultados.duplicados} duplicados omitidos)`);
                            console.log(`   📊 Progreso: ${progreso.toFixed(1)}% (${resultados.exitosos}/${calificacionesNormalizadas.length})`);
                            
                        } catch (quotaError) {
                            console.error(`   ❌ Error de cuota en lote ${numeroLote}`);
                            
                            // Si hay error de cuota, intentar comprimir
                            if (config.AUTO_COMPRIMIR) {
                                console.log('   🗜️ Intentando comprimir datos...');
                                
                                try {
                                    // Comprimir campos para ahorrar espacio
                                    const datosComprimidos = datosExistentes.map(d => ({
                                        id: d.id,
                                        sId: d.studentId,
                                        tId: d.taskId,
                                        eId: d.evaluationId,
                                        g: d.grade,
                                        mG: d.maxGrade,
                                        c: d.comment ? d.comment.substring(0, 100) : '', // Limitar comentarios
                                        gBy: d.gradedBy,
                                        gAt: new Date(d.gradedAt).getTime(),
                                        st: d.status
                                    }));
                                    
                                    localStorage.setItem(clave + '-compressed', JSON.stringify(datosComprimidos));
                                    localStorage.setItem(clave + '-mode', 'compressed');
                                    localStorage.removeItem(clave);
                                    
                                    console.log('   ✅ Datos comprimidos y guardados');
                                    resultados.exitosos += loteNuevo.length;
                                    
                                } catch (compressError) {
                                    console.error('   ❌ Error incluso con compresión:', compressError);
                                    resultados.fallidos += loteNuevo.length;
                                    resultados.errores.push({
                                        lote: numeroLote,
                                        error: 'QuotaExceededError incluso con compresión'
                                    });
                                    break; // Detener procesamiento
                                }
                            } else {
                                resultados.fallidos += loteNuevo.length;
                                resultados.errores.push({
                                    lote: numeroLote,
                                    error: quotaError.message
                                });
                                break;
                            }
                        }
                        
                        // Pausa entre lotes
                        if (i + tamanoLote < calificacionesNormalizadas.length) {
                            await new Promise(resolve => setTimeout(resolve, config.PAUSA_ENTRE_LOTES));
                        }
                    }
                    
                    // PASO 6: Resumen
                    resultados.finalizado = new Date().toISOString();
                    const duracion = new Date(resultados.finalizado) - new Date(resultados.iniciado);
                    resultados.duracion = duracion;
                    resultados.tasaExito = ((resultados.exitosos / calificacionesNormalizadas.length) * 100).toFixed(1);
                    
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 [RESUMEN FINAL - CARGA MASIVA]');
                    console.log('='.repeat(60));
                    console.table({
                        'Total procesado': calificacionesNormalizadas.length,
                        'Exitosos': resultados.exitosos,
                        'Duplicados omitidos': resultados.duplicados,
                        'Fallidos': resultados.fallidos,
                        'Tasa de éxito': `${resultados.tasaExito}%`,
                        'Duración': `${(duracion / 1000).toFixed(2)}s`,
                        'Guardado en': clave
                    });
                    
                    if (resultados.errores.length > 0) {
                        console.log('\n⚠️ Errores encontrados:');
                        resultados.errores.forEach(e => {
                            console.log(`   • Lote ${e.lote}: ${e.error}`);
                        });
                    }
                    
                    console.log('\n' + '='.repeat(60));
                    
                    // PASO 7: Actualizar estadísticas de estudiantes
                    console.log('\n🔄 [5/5] Actualizando estadísticas de estudiantes...');
                    actualizarEstadisticasEstudiantes(calificacionesNormalizadas);
                    
                    resolve({
                        exito: resultados.exitosos > 0,
                        ...resultados
                    });
                    
                } catch (error) {
                    console.error('❌ Error procesando archivo:', error);
                    reject(error);
                }
            };
            
            reader.onerror = function(error) {
                console.error('❌ Error leyendo archivo:', error);
                reject(error);
            };
            
            reader.readAsText(archivo);
        });
    };
    
    // ==================== ACTUALIZAR ESTADÍSTICAS ====================
    
    function actualizarEstadisticasEstudiantes(calificaciones) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            let actualizados = 0;
            
            // Agrupar por estudiante
            const porEstudiante = {};
            calificaciones.forEach(cal => {
                if (!porEstudiante[cal.studentId]) {
                    porEstudiante[cal.studentId] = [];
                }
                porEstudiante[cal.studentId].push(cal);
            });
            
            // Actualizar cada estudiante
            Object.keys(porEstudiante).forEach(studentId => {
                const indice = usuarios.findIndex(u => u.id === studentId);
                if (indice !== -1) {
                    const califs = porEstudiante[studentId];
                    const suma = califs.reduce((acc, c) => acc + c.grade, 0);
                    const promedio = suma / califs.length;
                    
                    usuarios[indice] = {
                        ...usuarios[indice],
                        totalGrades: (usuarios[indice].totalGrades || 0) + califs.length,
                        averageGrade: promedio,
                        lastGradedAt: new Date().toISOString()
                    };
                    
                    actualizados++;
                }
            });
            
            localStorage.setItem('smart-student-users', JSON.stringify(usuarios));
            console.log(`✅ ${actualizados} estudiantes actualizados`);
            
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
        }
    }
    
    // ==================== INTERFAZ VISUAL ====================
    
    window.mostrarInterfazCargaMasivaDirecta = function() {
        // Eliminar interfaz anterior si existe
        const existente = document.getElementById('carga-masiva-directa-modal');
        if (existente) existente.remove();
        
        const overlay = document.getElementById('carga-masiva-directa-overlay');
        if (overlay) overlay.remove();
        
        const html = `
            <div id="carga-masiva-directa-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div id="carga-masiva-directa-modal" style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    min-width: 500px;
                    max-width: 600px;
                ">
                    <h2 style="margin: 0 0 20px 0; color: #1f2937;">📚 Carga Masiva Directa</h2>
                    
                    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                            <strong>ℹ️ Modo sin Firebase:</strong> Las calificaciones se guardarán directamente en el navegador (localStorage).
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #374151;">
                            Seleccionar archivo CSV:
                        </label>
                        <input type="file" id="csv-file-input-directo" accept=".csv" style="
                            padding: 10px;
                            border: 2px dashed #3b82f6;
                            border-radius: 8px;
                            width: 100%;
                            cursor: pointer;
                        "/>
                        <small style="color: #6b7280; margin-top: 5px; display: block;">
                            Formato: studentId, taskId, grade, maxGrade, comment
                        </small>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <button id="btn-cargar-directo" style="
                            flex: 1;
                            padding: 12px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 14px;
                        ">📤 Cargar Calificaciones</button>
                        
                        <button id="btn-cancelar-directo" style="
                            padding: 12px 24px;
                            background: #6b7280;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Cancelar</button>
                    </div>
                    
                    <div id="progreso-carga-directa" style="
                        padding: 15px;
                        background: #f3f4f6;
                        border-radius: 8px;
                        display: none;
                    ">
                        <div style="font-weight: bold; margin-bottom: 10px; color: #1f2937;">Progreso:</div>
                        <div id="progreso-texto-directo" style="color: #374151;">Iniciando...</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Event listeners
        document.getElementById('btn-cargar-directo').onclick = async function() {
            const input = document.getElementById('csv-file-input-directo');
            
            if (!input.files || !input.files[0]) {
                alert('Por favor selecciona un archivo CSV');
                return;
            }
            
            const progresoDiv = document.getElementById('progreso-carga-directa');
            const progresoTexto = document.getElementById('progreso-texto-directo');
            
            progresoDiv.style.display = 'block';
            progresoTexto.textContent = 'Procesando archivo...';
            
            try {
                const resultado = await window.cargarCalificacionesMasivas(input.files[0]);
                
                progresoTexto.innerHTML = `
                    <div style="color: green; font-weight: bold; margin-bottom: 10px;">✅ Carga completada!</div>
                    <div style="color: #374151;">
                        <div>• Total: ${resultado.exitosos + resultado.fallidos}</div>
                        <div>• Exitosos: ${resultado.exitosos}</div>
                        <div>• Duplicados omitidos: ${resultado.duplicados}</div>
                        <div>• Fallidos: ${resultado.fallidos}</div>
                        <div>• Tasa de éxito: ${resultado.tasaExito}%</div>
                    </div>
                `;
                
                setTimeout(() => cerrarInterfaz(), 5000);
                
            } catch (error) {
                progresoTexto.innerHTML = `
                    <div style="color: red; font-weight: bold; margin-bottom: 10px;">❌ Error en la carga</div>
                    <div style="color: #374151;">${error.message}</div>
                `;
            }
        };
        
        document.getElementById('btn-cancelar-directo').onclick = cerrarInterfaz;
        document.getElementById('carga-masiva-directa-overlay').onclick = function(e) {
            if (e.target.id === 'carga-masiva-directa-overlay') {
                cerrarInterfaz();
            }
        };
        
        function cerrarInterfaz() {
            const modal = document.getElementById('carga-masiva-directa-modal');
            const overlay = document.getElementById('carga-masiva-directa-overlay');
            if (modal) modal.remove();
            if (overlay) overlay.remove();
        }
    };
    
    // ==================== INICIALIZACIÓN ====================
    
    console.log('✅ [CARGA MASIVA DIRECTA] Sistema listo');
    console.log('\n🛠️ FUNCIONES DISPONIBLES:');
    console.log('   • mostrarInterfazCargaMasivaDirecta() - Interfaz visual');
    console.log('   • cargarCalificacionesMasivas(archivo) - Carga programática');
    console.log('\n💡 EJEMPLO:');
    console.log('   mostrarInterfazCargaMasivaDirecta()');
    
})();
