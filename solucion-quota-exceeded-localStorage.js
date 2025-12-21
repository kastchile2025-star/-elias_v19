/**
 * SOLUCIÓN PARA QuotaExceededError EN localStorage
 * Smart Student v17 - Optimización de almacenamiento
 * 
 * PROBLEMA:
 * - localStorage tiene límite de ~5-10MB
 * - Carga masiva de calificaciones excede el límite
 * - Error: "Setting the value of 'smart-student-student-assignments' exceeded the quota"
 * 
 * SOLUCIONES IMPLEMENTADAS:
 * 1. Compresión de datos en localStorage
 * 2. Migración automática a Firestore para datos grandes
 * 3. Paginación de carga masiva
 * 4. Limpieza automática de datos obsoletos
 */

(function() {
    'use strict';
    
    console.log('🔧 [QUOTA FIX] Iniciando solución para QuotaExceededError...');
    
    // ==================== UTILIDADES DE COMPRESIÓN ====================
    
    /**
     * Comprime datos eliminando información redundante
     */
    function comprimirAsignaciones(asignaciones) {
        return asignaciones.map(a => ({
            id: a.id,
            sId: a.studentId,
            cId: a.courseId,
            secId: a.sectionId,
            active: a.isActive !== false ? 1 : 0,
            at: a.assignedAt ? new Date(a.assignedAt).getTime() : Date.now()
        }));
    }
    
    /**
     * Descomprime datos al formato original
     */
    function descomprimirAsignaciones(asignacionesComprimidas) {
        return asignacionesComprimidas.map(a => ({
            id: a.id,
            studentId: a.sId,
            courseId: a.cId,
            sectionId: a.secId,
            isActive: a.active === 1,
            assignedAt: new Date(a.at).toISOString()
        }));
    }
    
    /**
     * Calcula el tamaño de un objeto en bytes
     */
    function calcularTamano(obj) {
        return new Blob([JSON.stringify(obj)]).size;
    }
    
    /**
     * Obtiene el espacio usado en localStorage
     */
    function obtenerEspacioUsado() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
    
    // ==================== SISTEMA DE ALMACENAMIENTO INTELIGENTE ====================
    
    /**
     * Guarda datos en localStorage con manejo de cuota
     */
    window.guardarConSeguridad = function(clave, datos) {
        try {
            const datosJSON = JSON.stringify(datos);
            const tamano = new Blob([datosJSON]).size;
            const espacioDisponible = 10 * 1024 * 1024; // 10MB estimado
            const espacioUsado = obtenerEspacioUsado();
            
            console.log('💾 [STORAGE] Información de almacenamiento:');
            console.log(`   • Espacio usado: ${(espacioUsado / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   • Tamaño a guardar: ${(tamano / 1024).toFixed(2)} KB`);
            console.log(`   • Espacio disponible: ${((espacioDisponible - espacioUsado) / 1024 / 1024).toFixed(2)} MB`);
            
            // Si el tamaño excede 1MB, usar compresión
            if (tamano > 1024 * 1024) {
                console.warn('⚠️ [STORAGE] Datos grandes detectados, aplicando compresión...');
                
                if (clave === 'smart-student-student-assignments') {
                    const datosComprimidos = comprimirAsignaciones(datos);
                    const tamanoComprimido = calcularTamano(datosComprimidos);
                    
                    console.log(`📉 [COMPRESIÓN] Reducción: ${(tamano / 1024).toFixed(2)} KB → ${(tamanoComprimido / 1024).toFixed(2)} KB`);
                    console.log(`   • Ahorro: ${(((tamano - tamanoComprimido) / tamano) * 100).toFixed(1)}%`);
                    
                    localStorage.setItem(clave + '-compressed', JSON.stringify(datosComprimidos));
                    localStorage.setItem(clave + '-mode', 'compressed');
                    
                    return { exito: true, modo: 'compressed', tamano: tamanoComprimido };
                }
            }
            
            // Intentar guardar normalmente
            try {
                localStorage.setItem(clave, datosJSON);
                return { exito: true, modo: 'normal', tamano: tamano };
            } catch (quotaError) {
                console.error('❌ [QUOTA] Error de cuota, intentando migración a Firestore...');
                return migrarAFirestore(clave, datos);
            }
            
        } catch (error) {
            console.error('❌ [STORAGE] Error al guardar:', error);
            return { exito: false, error: error.message };
        }
    };
    
    /**
     * Recupera datos con soporte para compresión
     */
    window.cargarConSeguridad = function(clave) {
        try {
            const modo = localStorage.getItem(clave + '-mode');
            
            if (modo === 'compressed') {
                const datosComprimidos = JSON.parse(localStorage.getItem(clave + '-compressed') || '[]');
                const datos = descomprimirAsignaciones(datosComprimidos);
                console.log(`📥 [STORAGE] Datos descomprimidos: ${datos.length} registros`);
                return datos;
            }
            
            if (modo === 'firestore') {
                console.log('☁️ [STORAGE] Datos en Firestore, cargando...');
                return cargarDesdeFirestore(clave);
            }
            
            // Modo normal
            return JSON.parse(localStorage.getItem(clave) || '[]');
            
        } catch (error) {
            console.error('❌ [STORAGE] Error al cargar:', error);
            return [];
        }
    };
    
    // ==================== MIGRACIÓN A FIRESTORE ====================
    
    /**
     * Migra datos grandes a Firestore
     */
    async function migrarAFirestore(clave, datos) {
        console.log('☁️ [FIRESTORE] Iniciando migración a Firestore...');
        
        try {
            // Verificar si Firebase está disponible
            if (typeof window.firebase === 'undefined' || !window.firebase.firestore) {
                console.error('❌ [FIRESTORE] Firebase no está disponible');
                return { exito: false, error: 'Firebase no disponible' };
            }
            
            const db = window.firebase.firestore();
            const coleccion = clave.replace('smart-student-', '');
            
            console.log(`📤 [FIRESTORE] Migrando ${datos.length} registros a colección: ${coleccion}`);
            
            // Dividir en lotes de 500 (límite de Firestore)
            const TAMANO_LOTE = 500;
            let loteActual = 0;
            
            for (let i = 0; i < datos.length; i += TAMANO_LOTE) {
                const lote = datos.slice(i, i + TAMANO_LOTE);
                const batch = db.batch();
                
                lote.forEach(item => {
                    const docRef = db.collection(coleccion).doc(item.id);
                    batch.set(docRef, item);
                });
                
                await batch.commit();
                loteActual++;
                
                const progreso = ((i + lote.length) / datos.length * 100).toFixed(1);
                console.log(`📊 [FIRESTORE] Progreso: ${progreso}% (Lote ${loteActual})`);
            }
            
            // Guardar metadatos en localStorage
            localStorage.setItem(clave + '-mode', 'firestore');
            localStorage.setItem(clave + '-migrated-at', new Date().toISOString());
            localStorage.setItem(clave + '-count', datos.length.toString());
            
            // Limpiar localStorage
            localStorage.removeItem(clave);
            localStorage.removeItem(clave + '-compressed');
            
            console.log(`✅ [FIRESTORE] Migración exitosa: ${datos.length} registros`);
            
            return { 
                exito: true, 
                modo: 'firestore', 
                registros: datos.length,
                coleccion: coleccion
            };
            
        } catch (error) {
            console.error('❌ [FIRESTORE] Error en migración:', error);
            
            // Fallback: guardar solo IDs esenciales en localStorage
            console.log('🔄 [FALLBACK] Guardando solo datos esenciales...');
            return guardarDatosEsenciales(clave, datos);
        }
    }
    
    /**
     * Carga datos desde Firestore
     */
    async function cargarDesdeFirestore(clave) {
        try {
            if (typeof window.firebase === 'undefined' || !window.firebase.firestore) {
                console.error('❌ [FIRESTORE] Firebase no está disponible');
                return [];
            }
            
            const db = window.firebase.firestore();
            const coleccion = clave.replace('smart-student-', '');
            
            console.log(`📥 [FIRESTORE] Cargando datos de: ${coleccion}`);
            
            const snapshot = await db.collection(coleccion).get();
            const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log(`✅ [FIRESTORE] ${datos.length} registros cargados`);
            
            return datos;
            
        } catch (error) {
            console.error('❌ [FIRESTORE] Error al cargar:', error);
            return [];
        }
    }
    
    /**
     * Guarda solo datos esenciales como fallback
     */
    function guardarDatosEsenciales(clave, datos) {
        try {
            console.log('💡 [FALLBACK] Guardando solo datos esenciales...');
            
            if (clave === 'smart-student-student-assignments') {
                // Guardar solo IDs y relaciones esenciales
                const datosEsenciales = datos.map(a => ({
                    i: a.id,
                    s: a.studentId,
                    c: a.courseId,
                    sec: a.sectionId
                }));
                
                localStorage.setItem(clave + '-essential', JSON.stringify(datosEsenciales));
                localStorage.setItem(clave + '-mode', 'essential');
                
                console.log(`✅ [FALLBACK] ${datosEsenciales.length} registros esenciales guardados`);
                
                return { exito: true, modo: 'essential', registros: datosEsenciales.length };
            }
            
            return { exito: false, error: 'Tipo de datos no soportado para fallback' };
            
        } catch (error) {
            console.error('❌ [FALLBACK] Error:', error);
            return { exito: false, error: error.message };
        }
    }
    
    // ==================== SISTEMA DE PAGINACIÓN PARA CARGA MASIVA ====================
    
    /**
     * Procesa asignaciones en lotes para evitar QuotaExceededError
     */
    window.procesarAsignacionesEnLotes = async function(asignaciones, tamanoLote = 100) {
        console.log(`📦 [LOTES] Procesando ${asignaciones.length} asignaciones en lotes de ${tamanoLote}...`);
        
        const resultados = {
            exitosos: 0,
            fallidos: 0,
            lotes: []
        };
        
        for (let i = 0; i < asignaciones.length; i += tamanoLote) {
            const lote = asignaciones.slice(i, i + tamanoLote);
            const numeroLote = Math.floor(i / tamanoLote) + 1;
            
            console.log(`📦 [LOTE ${numeroLote}] Procesando ${lote.length} asignaciones...`);
            
            try {
                // Procesar lote actual
                const asignacionesExistentes = window.cargarConSeguridad('smart-student-student-assignments') || [];
                const asignacionesCombinadas = [...asignacionesExistentes, ...lote];
                
                const resultado = window.guardarConSeguridad('smart-student-student-assignments', asignacionesCombinadas);
                
                if (resultado.exito) {
                    resultados.exitosos += lote.length;
                    resultados.lotes.push({
                        numero: numeroLote,
                        registros: lote.length,
                        estado: 'exitoso',
                        modo: resultado.modo
                    });
                    
                    console.log(`✅ [LOTE ${numeroLote}] Procesado exitosamente (${resultado.modo})`);
                } else {
                    resultados.fallidos += lote.length;
                    console.error(`❌ [LOTE ${numeroLote}] Error:`, resultado.error);
                }
                
                // Pausa breve entre lotes
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ [LOTE ${numeroLote}] Error:`, error);
                resultados.fallidos += lote.length;
            }
            
            // Mostrar progreso
            const progreso = ((i + lote.length) / asignaciones.length * 100).toFixed(1);
            console.log(`📊 [PROGRESO] ${progreso}% completado`);
        }
        
        console.log('📋 [RESUMEN]:');
        console.table({
            'Total': asignaciones.length,
            'Exitosos': resultados.exitosos,
            'Fallidos': resultados.fallidos,
            'Tasa de éxito': `${((resultados.exitosos / asignaciones.length) * 100).toFixed(1)}%`
        });
        
        return resultados;
    };
    
    // ==================== LIMPIEZA AUTOMÁTICA ====================
    
    /**
     * Limpia datos obsoletos para liberar espacio
     */
    window.limpiarDatosObsoletos = function() {
        console.log('🧹 [LIMPIEZA] Iniciando limpieza de datos obsoletos...');
        
        const DIAS_ANTIGUEDAD = 30;
        const fechaLimite = Date.now() - (DIAS_ANTIGUEDAD * 24 * 60 * 60 * 1000);
        
        try {
            // Limpiar asignaciones antiguas
            const asignaciones = window.cargarConSeguridad('smart-student-student-assignments') || [];
            const asignacionesActivas = asignaciones.filter(a => {
                const fecha = new Date(a.assignedAt).getTime();
                return fecha > fechaLimite || a.isActive !== false;
            });
            
            const eliminados = asignaciones.length - asignacionesActivas.length;
            
            if (eliminados > 0) {
                window.guardarConSeguridad('smart-student-student-assignments', asignacionesActivas);
                console.log(`🧹 [LIMPIEZA] ${eliminados} asignaciones antiguas eliminadas`);
            } else {
                console.log('✅ [LIMPIEZA] No hay datos obsoletos');
            }
            
            // Mostrar espacio liberado
            const espacioFinal = obtenerEspacioUsado();
            console.log(`💾 [ESPACIO] Espacio usado: ${(espacioFinal / 1024 / 1024).toFixed(2)} MB`);
            
            return {
                exito: true,
                eliminados: eliminados,
                espacioUsado: espacioFinal
            };
            
        } catch (error) {
            console.error('❌ [LIMPIEZA] Error:', error);
            return { exito: false, error: error.message };
        }
    };
    
    // ==================== DIAGNÓSTICO Y MONITOREO ====================
    
    /**
     * Diagnóstico completo del almacenamiento
     */
    window.diagnosticoAlmacenamiento = function() {
        console.log('🔍 [DIAGNÓSTICO] Analizando almacenamiento...');
        
        const diagnostico = {
            espacioUsado: obtenerEspacioUsado(),
            elementos: {},
            problemas: [],
            recomendaciones: []
        };
        
        // Analizar cada elemento en localStorage
        const claves = [
            'smart-student-users',
            'smart-student-courses',
            'smart-student-sections',
            'smart-student-student-assignments',
            'smart-student-teacher-assignments',
            'smart-student-tasks',
            'smart-student-evaluations',
            'smart-student-communications'
        ];
        
        claves.forEach(clave => {
            try {
                const datos = localStorage.getItem(clave);
                if (datos) {
                    const tamano = new Blob([datos]).size;
                    const registros = JSON.parse(datos).length || 0;
                    
                    diagnostico.elementos[clave] = {
                        tamano: tamano,
                        tamanoMB: (tamano / 1024 / 1024).toFixed(2),
                        registros: registros,
                        modo: localStorage.getItem(clave + '-mode') || 'normal'
                    };
                    
                    // Detectar problemas
                    if (tamano > 2 * 1024 * 1024) { // >2MB
                        diagnostico.problemas.push({
                            clave: clave,
                            problema: 'Tamaño grande',
                            tamano: (tamano / 1024 / 1024).toFixed(2) + ' MB'
                        });
                        
                        diagnostico.recomendaciones.push(`Migrar '${clave}' a Firestore o aplicar compresión`);
                    }
                }
            } catch (error) {
                diagnostico.problemas.push({
                    clave: clave,
                    problema: 'Error al leer',
                    error: error.message
                });
            }
        });
        
        console.log('📊 [RESUMEN]:');
        console.log(`   • Espacio usado: ${(diagnostico.espacioUsado / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   • Elementos analizados: ${Object.keys(diagnostico.elementos).length}`);
        console.log(`   • Problemas detectados: ${diagnostico.problemas.length}`);
        
        if (diagnostico.problemas.length > 0) {
            console.log('\n⚠️ [PROBLEMAS]:');
            diagnostico.problemas.forEach(p => {
                console.log(`   • ${p.clave}: ${p.problema} ${p.tamano || ''}`);
            });
        }
        
        if (diagnostico.recomendaciones.length > 0) {
            console.log('\n💡 [RECOMENDACIONES]:');
            diagnostico.recomendaciones.forEach(r => {
                console.log(`   • ${r}`);
            });
        }
        
        console.log('\n📋 [DETALLE POR ELEMENTO]:');
        console.table(diagnostico.elementos);
        
        return diagnostico;
    };
    
    // ==================== MIGRACIÓN AUTOMÁTICA EXISTENTE ====================
    
    /**
     * Migra automáticamente datos grandes existentes
     */
    window.migrarDatosGrandes = async function() {
        console.log('🚀 [MIGRACIÓN AUTO] Iniciando migración automática de datos grandes...');
        
        const LIMITE_MB = 1; // 1MB
        const resultados = [];
        
        const claves = [
            'smart-student-student-assignments',
            'smart-student-tasks',
            'smart-student-evaluations',
            'smart-student-communications'
        ];
        
        for (const clave of claves) {
            try {
                const datos = localStorage.getItem(clave);
                if (datos) {
                    const tamano = new Blob([datos]).size;
                    
                    if (tamano > LIMITE_MB * 1024 * 1024) {
                        console.log(`📤 [MIGRACIÓN] ${clave}: ${(tamano / 1024 / 1024).toFixed(2)} MB`);
                        
                        const datosObj = JSON.parse(datos);
                        const resultado = window.guardarConSeguridad(clave, datosObj);
                        
                        resultados.push({
                            clave: clave,
                            tamanoOriginal: (tamano / 1024 / 1024).toFixed(2) + ' MB',
                            modo: resultado.modo,
                            exito: resultado.exito
                        });
                    }
                }
            } catch (error) {
                console.error(`❌ [MIGRACIÓN] Error en ${clave}:`, error);
                resultados.push({
                    clave: clave,
                    error: error.message,
                    exito: false
                });
            }
        }
        
        console.log('📊 [RESULTADOS MIGRACIÓN]:');
        console.table(resultados);
        
        return resultados;
    };
    
    // ==================== INICIALIZACIÓN ====================
    
    console.log('✅ [QUOTA FIX] Sistema de optimización de almacenamiento cargado');
    console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
    console.log('   • guardarConSeguridad(clave, datos) - Guardar con manejo de cuota');
    console.log('   • cargarConSeguridad(clave) - Cargar con soporte de compresión');
    console.log('   • procesarAsignacionesEnLotes(asignaciones, tamanoLote) - Carga masiva');
    console.log('   • limpiarDatosObsoletos() - Liberar espacio');
    console.log('   • diagnosticoAlmacenamiento() - Análisis completo');
    console.log('   • migrarDatosGrandes() - Migración automática a Firestore');
    
    // Ejecutar diagnóstico inicial
    console.log('\n🔍 [DIAGNÓSTICO INICIAL]');
    window.diagnosticoAlmacenamiento();
    
})();
