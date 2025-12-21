/**
 * PARCHE DE EMERGENCIA - QuotaExceededError
 * Solución inmediata para el error de cuota en localStorage
 * 
 * USAR ESTE SCRIPT CUANDO:
 * - El error ocurre al ejecutar fix-dynamic-student-assignments.js
 * - localStorage está lleno
 * - Necesitas una solución RÁPIDA
 */

(function() {
    'use strict';
    
    console.log('🚨 [PARCHE EMERGENCIA] Aplicando corrección inmediata para QuotaExceededError...');
    
    // ==================== PASO 1: LIMPIAR ESPACIO ====================
    
    console.log('\n🧹 [PASO 1/4] Liberando espacio en localStorage...');
    
    // Función para calcular tamaño
    function calcularTamano(key) {
        const item = localStorage.getItem(key);
        return item ? new Blob([item]).size : 0;
    }
    
    // Analizar espacio usado
    const analisis = {};
    let totalBytes = 0;
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('smart-student-')) {
            const tamano = calcularTamano(key);
            analisis[key] = {
                tamano: tamano,
                tamanoKB: (tamano / 1024).toFixed(2),
                registros: 0
            };
            
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data)) {
                    analisis[key].registros = data.length;
                }
            } catch (e) {}
            
            totalBytes += tamano;
        }
    }
    
    console.log(`📊 [ANÁLISIS] Espacio total usado: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.table(analisis);
    
    // Identificar datos a limpiar
    const candidatosLimpieza = [];
    
    // 1. Datos temporales
    const temporales = [
        'smart-student-temp',
        'smart-student-cache',
        'smart-student-session'
    ];
    
    temporales.forEach(key => {
        if (localStorage.getItem(key)) {
            candidatosLimpieza.push({ key, razon: 'temporal', prioridad: 1 });
        }
    });
    
    // 2. Datos duplicados o antiguos en student-assignments
    const assignmentsKey = 'smart-student-student-assignments';
    const assignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
    
    if (assignments.length > 0) {
        console.log(`📋 [ASIGNACIONES] Encontradas ${assignments.length} asignaciones`);
        
        // Eliminar duplicados
        const asignacionesUnicas = new Map();
        assignments.forEach(a => {
            const clave = `${a.studentId}-${a.sectionId}`;
            if (!asignacionesUnicas.has(clave) || new Date(a.assignedAt) > new Date(asignacionesUnicas.get(clave).assignedAt)) {
                asignacionesUnicas.set(clave, a);
            }
        });
        
        const asignacionesLimpias = Array.from(asignacionesUnicas.values());
        const eliminados = assignments.length - asignacionesLimpias.length;
        
        if (eliminados > 0) {
            console.log(`🧹 [LIMPIEZA] Eliminando ${eliminados} asignaciones duplicadas...`);
            localStorage.setItem(assignmentsKey, JSON.stringify(asignacionesLimpias));
            console.log(`✅ [LIMPIEZA] ${asignacionesLimpias.length} asignaciones únicas guardadas`);
            
            // Recalcular espacio
            totalBytes = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalBytes += calcularTamano(key);
                }
            }
            console.log(`📊 [ESPACIO LIBERADO] Ahora: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
        } else {
            console.log('✅ [LIMPIEZA] No hay duplicados');
        }
    }
    
    // ==================== PASO 2: COMPRESIÓN SIMPLE ====================
    
    console.log('\n🗜️ [PASO 2/4] Aplicando compresión...');
    
    // Función de compresión simple
    function comprimirAsignacion(asignacion) {
        return {
            i: asignacion.id,
            s: asignacion.studentId,
            c: asignacion.courseId,
            sec: asignacion.sectionId,
            a: asignacion.isActive !== false ? 1 : 0,
            t: asignacion.assignedAt ? new Date(asignacion.assignedAt).getTime() : Date.now()
        };
    }
    
    function descomprimirAsignacion(comprimida) {
        return {
            id: comprimida.i,
            studentId: comprimida.s,
            courseId: comprimida.c,
            sectionId: comprimida.sec,
            isActive: comprimida.a === 1,
            assignedAt: new Date(comprimida.t).toISOString()
        };
    }
    
    // Comprimir asignaciones
    const asignacionesActuales = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
    
    if (asignacionesActuales.length > 0) {
        const tamanoOriginal = calcularTamano(assignmentsKey);
        const asignacionesComprimidas = asignacionesActuales.map(comprimirAsignacion);
        
        // Guardar versión comprimida
        localStorage.setItem(assignmentsKey + '-compressed', JSON.stringify(asignacionesComprimidas));
        const tamanoComprimido = calcularTamano(assignmentsKey + '-compressed');
        
        const ahorro = ((tamanoOriginal - tamanoComprimido) / tamanoOriginal * 100).toFixed(1);
        console.log(`📉 [COMPRESIÓN] ${(tamanoOriginal / 1024).toFixed(2)} KB → ${(tamanoComprimido / 1024).toFixed(2)} KB`);
        console.log(`💾 [AHORRO] ${ahorro}% de espacio liberado`);
        
        // Eliminar versión sin comprimir
        localStorage.removeItem(assignmentsKey);
        localStorage.setItem(assignmentsKey + '-mode', 'compressed');
        
        console.log('✅ [COMPRESIÓN] Asignaciones comprimidas y guardadas');
    }
    
    // ==================== PASO 3: REEMPLAZAR FUNCIONES ====================
    
    console.log('\n🔧 [PASO 3/4] Reemplazando funciones de guardado/carga...');
    
    // Interceptar localStorage.setItem para smart-student-student-assignments
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    
    Storage.prototype.setItem = function(key, value) {
        if (key === 'smart-student-student-assignments') {
            try {
                console.log('🔄 [INTERCEPT] Interceptando guardado de asignaciones...');
                
                // Parsear datos
                const datos = JSON.parse(value);
                
                // Comprimir
                const datosComprimidos = datos.map(comprimirAsignacion);
                
                // Guardar versión comprimida
                originalSetItem.call(this, key + '-compressed', JSON.stringify(datosComprimidos));
                originalSetItem.call(this, key + '-mode', 'compressed');
                
                const tamanoOriginal = new Blob([value]).size;
                const tamanoComprimido = new Blob([JSON.stringify(datosComprimidos)]).size;
                
                console.log(`✅ [GUARDADO] ${datos.length} asignaciones comprimidas`);
                console.log(`   Ahorro: ${((tamanoOriginal - tamanoComprimido) / tamanoOriginal * 100).toFixed(1)}%`);
                
                return;
            } catch (error) {
                console.warn('⚠️ [INTERCEPT] Error en compresión, intentando guardado normal:', error);
                // Intentar guardar sin comprimir como último recurso
                try {
                    originalSetItem.call(this, key, value);
                } catch (quotaError) {
                    console.error('❌ [QUOTA] No hay espacio suficiente');
                    throw new Error('QuotaExceeded: Ejecuta limpiezaEmergencia() para liberar espacio');
                }
            }
        }
        
        // Para otras claves, usar método original
        return originalSetItem.call(this, key, value);
    };
    
    Storage.prototype.getItem = function(key) {
        if (key === 'smart-student-student-assignments') {
            const modo = originalGetItem.call(this, key + '-mode');
            
            if (modo === 'compressed') {
                console.log('🔄 [INTERCEPT] Cargando asignaciones comprimidas...');
                const datosComprimidos = JSON.parse(originalGetItem.call(this, key + '-compressed') || '[]');
                const datosDescomprimidos = datosComprimidos.map(descomprimirAsignacion);
                console.log(`✅ [CARGA] ${datosDescomprimidos.length} asignaciones descomprimidas`);
                return JSON.stringify(datosDescomprimidos);
            }
        }
        
        return originalGetItem.call(this, key);
    };
    
    console.log('✅ [INTERCEPT] Funciones de guardado/carga interceptadas');
    
    // ==================== PASO 4: FUNCIÓN DE LIMPIEZA EMERGENCIA ====================
    
    console.log('\n🆘 [PASO 4/4] Configurando función de limpieza de emergencia...');
    
    window.limpiezaEmergencia = function() {
        console.log('🆘 [LIMPIEZA EMERGENCIA] Ejecutando limpieza agresiva...');
        
        let espacioLiberado = 0;
        
        // 1. Eliminar datos temporales y cache
        const keysTemporales = [];
        for (let key in localStorage) {
            if (key.includes('temp') || key.includes('cache') || key.includes('session') || 
                key.includes('debug') || key.includes('test') || key.includes('demo')) {
                keysTemporales.push(key);
            }
        }
        
        keysTemporales.forEach(key => {
            const tamano = calcularTamano(key);
            localStorage.removeItem(key);
            espacioLiberado += tamano;
            console.log(`🗑️ Eliminado: ${key} (${(tamano / 1024).toFixed(2)} KB)`);
        });
        
        // 2. Comprimir todas las colecciones grandes
        const coleccionesGrandes = [
            'smart-student-tasks',
            'smart-student-communications',
            'smart-student-task-comments',
            'smart-student-notifications'
        ];
        
        coleccionesGrandes.forEach(key => {
            const datos = localStorage.getItem(key);
            if (datos) {
                const tamanoAntes = new Blob([datos]).size;
                
                if (tamanoAntes > 500 * 1024) { // >500KB
                    try {
                        const array = JSON.parse(datos);
                        // Mantener solo los últimos 100 registros
                        const reducido = array.slice(-100);
                        localStorage.setItem(key, JSON.stringify(reducido));
                        
                        const tamanoDepues = calcularTamano(key);
                        espacioLiberado += (tamanoAntes - tamanoDepues);
                        
                        console.log(`📦 Reducido: ${key}`);
                        console.log(`   ${array.length} → ${reducido.length} registros`);
                        console.log(`   ${(tamanoAntes / 1024).toFixed(2)} KB → ${(tamanoDepues / 1024).toFixed(2)} KB`);
                    } catch (e) {
                        console.warn(`⚠️ Error al reducir ${key}:`, e);
                    }
                }
            }
        });
        
        console.log(`\n✅ [EMERGENCIA] Limpieza completada`);
        console.log(`💾 Espacio liberado: ${(espacioLiberado / 1024 / 1024).toFixed(2)} MB`);
        
        // Recalcular espacio total
        let totalFinal = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalFinal += calcularTamano(key);
            }
        }
        console.log(`📊 Espacio usado ahora: ${(totalFinal / 1024 / 1024).toFixed(2)} MB`);
        
        return {
            liberado: espacioLiberado,
            espacioFinal: totalFinal
        };
    };
    
    // ==================== VERIFICACIÓN FINAL ====================
    
    console.log('\n✅ [PARCHE APLICADO] Sistema de protección contra QuotaExceededError activado');
    console.log('\n📋 [QUÉ SE APLICÓ]:');
    console.log('   ✅ Limpieza de duplicados');
    console.log('   ✅ Compresión automática de asignaciones');
    console.log('   ✅ Intercepción de guardado/carga');
    console.log('   ✅ Función de emergencia disponible');
    
    console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
    console.log('   • limpiezaEmergencia() - Limpieza agresiva de datos');
    
    console.log('\n💡 [SIGUIENTE PASO]:');
    console.log('   Ahora puedes ejecutar tu script sin el error de cuota:');
    console.log('   window.regenerarAsignacionesDinamicas()');
    
    // Calcular espacio final
    let espacioFinal = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            espacioFinal += calcularTamano(key);
        }
    }
    console.log(`\n📊 [ESPACIO FINAL] ${(espacioFinal / 1024 / 1024).toFixed(2)} MB de ~10 MB`);
    
    if (espacioFinal > 8 * 1024 * 1024) {
        console.warn('\n⚠️ [ADVERTENCIA] Espacio aún limitado (>8MB)');
        console.log('   Recomendación: Ejecuta limpiezaEmergencia()');
    } else {
        console.log('✅ [LISTO] Espacio suficiente para continuar');
    }
    
})();
