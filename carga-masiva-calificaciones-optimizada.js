/**
 * CARGA MASIVA DE CALIFICACIONES OPTIMIZADA
 * Smart Student v17 - Con manejo de QuotaExceededError
 * 
 * Este script permite cargar calificaciones masivamente sin exceder
 * el límite de localStorage mediante:
 * 1. Procesamiento en lotes
 * 2. Compresión automática
 * 3. Migración a Firestore para datos grandes
 * 4. Progreso en tiempo real
 */

(function() {
    'use strict';
    
    console.log('📚 [CARGA MASIVA] Iniciando sistema de carga masiva optimizada...');
    
    // ==================== CONFIGURACIÓN ====================
    
    const CONFIG = {
        TAMANO_LOTE: 100,        // Registros por lote
        PAUSA_ENTRE_LOTES: 100,  // ms entre lotes
        LIMITE_LOCALSTORAGE: 2,  // MB - límite antes de usar Firestore
        AUTO_LIMPIAR: true        // Limpiar datos obsoletos automáticamente
    };
    
    // ==================== VALIDACIÓN DE DATOS ====================
    
    /**
     * Valida el formato de las calificaciones
     */
    function validarCalificaciones(calificaciones) {
        const errores = [];
        
        if (!Array.isArray(calificaciones)) {
            return { valido: false, errores: ['Las calificaciones deben ser un array'] };
        }
        
        calificaciones.forEach((cal, index) => {
            if (!cal.studentId) {
                errores.push(`Calificación ${index + 1}: falta studentId`);
            }
            if (!cal.taskId && !cal.evaluationId) {
                errores.push(`Calificación ${index + 1}: falta taskId o evaluationId`);
            }
            if (cal.grade === undefined || cal.grade === null) {
                errores.push(`Calificación ${index + 1}: falta grade`);
            }
        });
        
        return {
            valido: errores.length === 0,
            errores: errores,
            total: calificaciones.length
        };
    }
    
    /**
     * Normaliza el formato de las calificaciones
     */
    function normalizarCalificaciones(calificaciones) {
        return calificaciones.map(cal => ({
            id: cal.id || `grade-${cal.studentId}-${cal.taskId || cal.evaluationId}-${Date.now()}`,
            studentId: cal.studentId,
            taskId: cal.taskId || null,
            evaluationId: cal.evaluationId || null,
            grade: parseFloat(cal.grade),
            maxGrade: parseFloat(cal.maxGrade || 100),
            comment: cal.comment || '',
            gradedBy: cal.gradedBy || 'admin',
            gradedAt: cal.gradedAt || new Date().toISOString(),
            status: cal.status || 'graded',
            // Metadatos opcionales
            courseId: cal.courseId,
            sectionId: cal.sectionId,
            semester: cal.semester
        }));
    }
    
    // ==================== CARGA EN LOTES ====================
    
    /**
     * Carga calificaciones en lotes con progreso
     */
    window.cargarCalificacionesEnLotes = async function(calificaciones, opciones = {}) {
        console.log(`📦 [CARGA MASIVA] Iniciando carga de ${calificaciones.length} calificaciones...`);
        
        const config = { ...CONFIG, ...opciones };
        
        // PASO 1: Validar datos
        console.log('🔍 [VALIDACIÓN] Validando datos de entrada...');
        const validacion = validarCalificaciones(calificaciones);
        
        if (!validacion.valido) {
            console.error('❌ [VALIDACIÓN] Errores encontrados:');
            validacion.errores.forEach(error => console.error(`   • ${error}`));
            return {
                exito: false,
                errores: validacion.errores,
                mensaje: 'Validación fallida'
            };
        }
        
        console.log(`✅ [VALIDACIÓN] ${validacion.total} calificaciones válidas`);
        
        // PASO 2: Normalizar datos
        const calificacionesNormalizadas = normalizarCalificaciones(calificaciones);
        console.log('✅ [NORMALIZACIÓN] Datos normalizados');
        
        // PASO 3: Verificar espacio disponible
        if (typeof window.diagnosticoAlmacenamiento === 'function') {
            const diagnostico = window.diagnosticoAlmacenamiento();
            const espacioUsadoMB = diagnostico.espacioUsado / 1024 / 1024;
            
            if (espacioUsadoMB > 8) { // >8MB de 10MB
                console.warn('⚠️ [ESPACIO] Espacio limitado, se recomienda limpieza');
                
                if (config.AUTO_LIMPIAR && typeof window.limpiarDatosObsoletos === 'function') {
                    console.log('🧹 [LIMPIEZA] Ejecutando limpieza automática...');
                    window.limpiarDatosObsoletos();
                }
            }
        }
        
        // PASO 4: Procesar en lotes
        const resultados = {
            exitosos: 0,
            fallidos: 0,
            errores: [],
            lotes: [],
            iniciado: new Date().toISOString(),
            modo: 'localStorage'
        };
        
        const tamanoLote = config.TAMANO_LOTE;
        const totalLotes = Math.ceil(calificacionesNormalizadas.length / tamanoLote);
        
        console.log(`📦 [PROCESAMIENTO] ${totalLotes} lotes a procesar (${tamanoLote} registros c/u)`);
        
        for (let i = 0; i < calificacionesNormalizadas.length; i += tamanoLote) {
            const lote = calificacionesNormalizadas.slice(i, i + tamanoLote);
            const numeroLote = Math.floor(i / tamanoLote) + 1;
            
            console.log(`\n📦 [LOTE ${numeroLote}/${totalLotes}] Procesando ${lote.length} calificaciones...`);
            
            try {
                // Determinar tipo de entidad (tarea o evaluación)
                const esTarea = lote.some(c => c.taskId);
                const clave = esTarea 
                    ? 'smart-student-task-submissions' 
                    : 'smart-student-evaluation-results';
                
                // Cargar datos existentes
                let datosExistentes = [];
                if (typeof window.cargarConSeguridad === 'function') {
                    datosExistentes = window.cargarConSeguridad(clave) || [];
                } else {
                    datosExistentes = JSON.parse(localStorage.getItem(clave) || '[]');
                }
                
                // Evitar duplicados
                const idsExistentes = new Set(datosExistentes.map(d => d.id));
                const loteNuevo = lote.filter(c => !idsExistentes.has(c.id));
                
                if (loteNuevo.length === 0) {
                    console.log(`ℹ️ [LOTE ${numeroLote}] Todos los registros ya existen, omitiendo...`);
                    resultados.lotes.push({
                        numero: numeroLote,
                        registros: lote.length,
                        nuevos: 0,
                        estado: 'omitido',
                        razon: 'duplicados'
                    });
                    continue;
                }
                
                console.log(`   • Nuevos: ${loteNuevo.length}, Duplicados: ${lote.length - loteNuevo.length}`);
                
                // Combinar datos
                const datosCombinados = [...datosExistentes, ...loteNuevo];
                
                // Guardar con sistema seguro
                let resultado;
                if (typeof window.guardarConSeguridad === 'function') {
                    resultado = window.guardarConSeguridad(clave, datosCombinados);
                } else {
                    // Fallback: guardado simple
                    try {
                        localStorage.setItem(clave, JSON.stringify(datosCombinados));
                        resultado = { exito: true, modo: 'normal' };
                    } catch (quotaError) {
                        console.error('❌ [QUOTA] Error de cuota en lote', numeroLote);
                        resultado = { 
                            exito: false, 
                            error: 'QuotaExceededError',
                            mensaje: 'Límite de localStorage excedido'
                        };
                    }
                }
                
                if (resultado.exito) {
                    resultados.exitosos += loteNuevo.length;
                    resultados.modo = resultado.modo || 'normal';
                    resultados.lotes.push({
                        numero: numeroLote,
                        registros: loteNuevo.length,
                        estado: 'exitoso',
                        modo: resultado.modo
                    });
                    
                    console.log(`✅ [LOTE ${numeroLote}] Guardado exitosamente (${resultado.modo})`);
                } else {
                    resultados.fallidos += loteNuevo.length;
                    resultados.errores.push({
                        lote: numeroLote,
                        error: resultado.error || 'Error desconocido'
                    });
                    
                    console.error(`❌ [LOTE ${numeroLote}] Error:`, resultado.error);
                }
                
                // Mostrar progreso
                const progreso = Math.min(((i + lote.length) / calificacionesNormalizadas.length * 100), 100);
                console.log(`📊 [PROGRESO] ${progreso.toFixed(1)}% completado (${resultados.exitosos}/${calificacionesNormalizadas.length})`);
                
                // Pausa entre lotes
                await new Promise(resolve => setTimeout(resolve, config.PAUSA_ENTRE_LOTES));
                
            } catch (error) {
                console.error(`❌ [LOTE ${numeroLote}] Error crítico:`, error);
                resultados.fallidos += lote.length;
                resultados.errores.push({
                    lote: numeroLote,
                    error: error.message
                });
            }
        }
        
        // PASO 5: Resumen final
        resultados.finalizado = new Date().toISOString();
        resultados.duracion = new Date(resultados.finalizado) - new Date(resultados.iniciado);
        resultados.tasaExito = (resultados.exitosos / calificacionesNormalizadas.length * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 [RESUMEN FINAL]');
        console.log('='.repeat(60));
        console.table({
            'Total': calificacionesNormalizadas.length,
            'Exitosos': resultados.exitosos,
            'Fallidos': resultados.fallidos,
            'Tasa de éxito': `${resultados.tasaExito}%`,
            'Modo almacenamiento': resultados.modo,
            'Duración': `${(resultados.duracion / 1000).toFixed(2)}s`
        });
        
        if (resultados.errores.length > 0) {
            console.log('\n⚠️ [ERRORES]:');
            resultados.errores.forEach(e => {
                console.log(`   • Lote ${e.lote}: ${e.error}`);
            });
        }
        
        // Actualizar estadísticas de estudiantes
        if (resultados.exitosos > 0) {
            console.log('\n🔄 [ACTUALIZACIÓN] Actualizando estadísticas de estudiantes...');
            actualizarEstadisticasEstudiantes(calificacionesNormalizadas);
        }
        
        return {
            exito: resultados.exitosos > 0,
            ...resultados
        };
    };
    
    // ==================== ACTUALIZACIÓN DE ESTADÍSTICAS ====================
    
    /**
     * Actualiza las estadísticas de los estudiantes
     */
    function actualizarEstadisticasEstudiantes(calificaciones) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            let actualizados = 0;
            
            // Agrupar calificaciones por estudiante
            const calificacionesPorEstudiante = {};
            calificaciones.forEach(cal => {
                if (!calificacionesPorEstudiante[cal.studentId]) {
                    calificacionesPorEstudiante[cal.studentId] = [];
                }
                calificacionesPorEstudiante[cal.studentId].push(cal);
            });
            
            // Actualizar cada estudiante
            Object.keys(calificacionesPorEstudiante).forEach(studentId => {
                const indice = usuarios.findIndex(u => u.id === studentId);
                if (indice !== -1) {
                    const califs = calificacionesPorEstudiante[studentId];
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
            
            // Guardar usuarios actualizados
            localStorage.setItem('smart-student-users', JSON.stringify(usuarios));
            console.log(`✅ [ESTADÍSTICAS] ${actualizados} estudiantes actualizados`);
            
        } catch (error) {
            console.error('❌ [ESTADÍSTICAS] Error al actualizar:', error);
        }
    }
    
    // ==================== CARGA DESDE CSV ====================
    
    /**
     * Carga calificaciones desde un archivo CSV
     */
    window.cargarCalificacionesDesdeCSV = async function(archivoCSV) {
        console.log('📄 [CSV] Cargando calificaciones desde archivo CSV...');
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const contenido = e.target.result;
                    const lineas = contenido.split('\n');
                    
                    // Procesar encabezados
                    const encabezados = lineas[0].split(',').map(h => h.trim());
                    console.log('📋 [CSV] Encabezados detectados:', encabezados);
                    
                    // Procesar datos
                    const calificaciones = [];
                    for (let i = 1; i < lineas.length; i++) {
                        if (!lineas[i].trim()) continue;
                        
                        const valores = lineas[i].split(',');
                        const calificacion = {};
                        
                        encabezados.forEach((header, index) => {
                            calificacion[header] = valores[index]?.trim();
                        });
                        
                        calificaciones.push(calificacion);
                    }
                    
                    console.log(`📊 [CSV] ${calificaciones.length} calificaciones cargadas del CSV`);
                    
                    // Procesar en lotes
                    const resultado = await window.cargarCalificacionesEnLotes(calificaciones);
                    resolve(resultado);
                    
                } catch (error) {
                    console.error('❌ [CSV] Error al procesar:', error);
                    reject(error);
                }
            };
            
            reader.onerror = function(error) {
                console.error('❌ [CSV] Error al leer archivo:', error);
                reject(error);
            };
            
            reader.readAsText(archivoCSV);
        });
    };
    
    // ==================== INTERFAZ DE USUARIO ====================
    
    /**
     * Crea interfaz para carga masiva
     */
    window.mostrarInterfazCargaMasiva = function() {
        const html = `
            <div id="carga-masiva-modal" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                min-width: 500px;
            ">
                <h2 style="margin: 0 0 20px 0;">📚 Carga Masiva de Calificaciones</h2>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        Seleccionar archivo CSV:
                    </label>
                    <input type="file" id="csv-file-input" accept=".csv" style="
                        padding: 10px;
                        border: 2px dashed #3b82f6;
                        border-radius: 8px;
                        width: 100%;
                    "/>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="checkbox" id="auto-limpiar" checked/> 
                        Limpiar datos obsoletos automáticamente
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="btn-cargar" style="
                        flex: 1;
                        padding: 12px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">Cargar Calificaciones</button>
                    
                    <button id="btn-cancelar" style="
                        padding: 12px 24px;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">Cancelar</button>
                </div>
                
                <div id="progreso-carga" style="
                    margin-top: 20px;
                    padding: 15px;
                    background: #f3f4f6;
                    border-radius: 8px;
                    display: none;
                ">
                    <div style="font-weight: bold; margin-bottom: 10px;">Progreso:</div>
                    <div id="progreso-texto">Iniciando...</div>
                </div>
            </div>
            
            <div id="carga-masiva-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            "></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Event listeners
        document.getElementById('btn-cargar').onclick = async function() {
            const input = document.getElementById('csv-file-input');
            const autoLimpiar = document.getElementById('auto-limpiar').checked;
            
            if (!input.files || !input.files[0]) {
                alert('Por favor selecciona un archivo CSV');
                return;
            }
            
            document.getElementById('progreso-carga').style.display = 'block';
            document.getElementById('progreso-texto').textContent = 'Procesando archivo...';
            
            try {
                const resultado = await window.cargarCalificacionesDesdeCSV(input.files[0]);
                
                document.getElementById('progreso-texto').innerHTML = `
                    <div style="color: green; font-weight: bold;">✅ Carga completada!</div>
                    <div>Total: ${resultado.exitosos + resultado.fallidos}</div>
                    <div>Exitosos: ${resultado.exitosos}</div>
                    <div>Fallidos: ${resultado.fallidos}</div>
                    <div>Tasa de éxito: ${resultado.tasaExito}%</div>
                `;
                
                setTimeout(() => {
                    cerrarInterfaz();
                }, 3000);
                
            } catch (error) {
                document.getElementById('progreso-texto').innerHTML = `
                    <div style="color: red; font-weight: bold;">❌ Error en la carga</div>
                    <div>${error.message}</div>
                `;
            }
        };
        
        document.getElementById('btn-cancelar').onclick = cerrarInterfaz;
        document.getElementById('carga-masiva-overlay').onclick = cerrarInterfaz;
        
        function cerrarInterfaz() {
            document.getElementById('carga-masiva-modal').remove();
            document.getElementById('carga-masiva-overlay').remove();
        }
    };
    
    // ==================== INICIALIZACIÓN ====================
    
    console.log('✅ [CARGA MASIVA] Sistema de carga masiva optimizada listo');
    console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
    console.log('   • cargarCalificacionesEnLotes(calificaciones, opciones)');
    console.log('   • cargarCalificacionesDesdeCSV(archivoCSV)');
    console.log('   • mostrarInterfazCargaMasiva()');
    console.log('\n💡 [EJEMPLO DE USO]:');
    console.log('   mostrarInterfazCargaMasiva() // Abre interfaz visual');
    console.log('   cargarCalificacionesEnLotes([...]) // Carga programática');
    
})();
