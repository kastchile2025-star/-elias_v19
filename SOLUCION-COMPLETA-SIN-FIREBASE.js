/**
 * SOLUCIÓN COMPLETA - Sin Dependencia de Firebase
 * Smart Student v17
 * 
 * Esta solución trabaja 100% con localStorage optimizado
 * No requiere Firebase configurado
 * Resuelve el QuotaExceededError
 */

(function() {
    'use strict';
    
    console.log('🚀 [SOLUCIÓN SIN FIREBASE] Iniciando sistema optimizado...');
    
    // ==================== PASO 1: DESHABILITAR FIREBASE ====================
    
    console.log('\n📋 [1/5] Deshabilitando Firebase para evitar errores...');
    
    // Deshabilitar Firebase temporalmente
    if (typeof window !== 'undefined') {
        // Guardar configuración original
        const originalConfig = localStorage.getItem('smart-student-config');
        let config = {};
        
        try {
            config = JSON.parse(originalConfig || '{}');
        } catch (e) {
            config = {};
        }
        
        // Deshabilitar Firebase
        config.useFirebase = false;
        config.provider = 'localStorage';
        
        localStorage.setItem('smart-student-config', JSON.stringify(config));
        console.log('✅ Firebase deshabilitado temporalmente');
    }
    
    // ==================== PASO 2: LIMPIAR Y OPTIMIZAR ====================
    
    console.log('\n🧹 [2/5] Limpiando y optimizando localStorage...');
    
    function calcularTamano(key) {
        const item = localStorage.getItem(key);
        return item ? new Blob([item]).size : 0;
    }
    
    // Eliminar datos temporales y cache
    const keysTemporales = [];
    for (let key in localStorage) {
        if (key.includes('temp') || key.includes('cache') || 
            key.includes('debug') || key.includes('test') ||
            key.includes('demo') || key.includes('backup')) {
            keysTemporales.push(key);
        }
    }
    
    let espacioLiberado = 0;
    keysTemporales.forEach(key => {
        const tamano = calcularTamano(key);
        localStorage.removeItem(key);
        espacioLiberado += tamano;
    });
    
    console.log(`✅ Eliminadas ${keysTemporales.length} claves temporales`);
    console.log(`💾 Liberados ${(espacioLiberado / 1024 / 1024).toFixed(2)} MB`);
    
    // ==================== PASO 3: COMPRIMIR ASIGNACIONES ====================
    
    console.log('\n🗜️ [3/5] Comprimiendo asignaciones de estudiantes...');
    
    function comprimirAsignacion(a) {
        return {
            i: a.id || `${a.studentId}-${a.sectionId}`,
            s: a.studentId,
            c: a.courseId,
            sec: a.sectionId,
            a: a.isActive !== false ? 1 : 0,
            t: a.assignedAt ? new Date(a.assignedAt).getTime() : Date.now()
        };
    }
    
    function descomprimirAsignacion(c) {
        return {
            id: c.i,
            studentId: c.s,
            courseId: c.c,
            sectionId: c.sec,
            isActive: c.a === 1,
            assignedAt: new Date(c.t).toISOString()
        };
    }
    
    // Procesar asignaciones existentes
    const assignmentsKey = 'smart-student-student-assignments';
    let asignaciones = [];
    
    // Intentar cargar de diferentes fuentes
    try {
        const compressed = localStorage.getItem(assignmentsKey + '-compressed');
        if (compressed) {
            const data = JSON.parse(compressed);
            asignaciones = data.map(descomprimirAsignacion);
            console.log('📥 Cargadas asignaciones comprimidas existentes');
        } else {
            const normal = localStorage.getItem(assignmentsKey);
            if (normal) {
                asignaciones = JSON.parse(normal);
                console.log('📥 Cargadas asignaciones normales');
            }
        }
    } catch (e) {
        console.warn('⚠️ No se pudieron cargar asignaciones existentes');
    }
    
    // Eliminar duplicados
    if (asignaciones.length > 0) {
        const asignacionesUnicas = new Map();
        asignaciones.forEach(a => {
            const clave = `${a.studentId}-${a.sectionId}`;
            if (!asignacionesUnicas.has(clave)) {
                asignacionesUnicas.set(clave, a);
            }
        });
        
        asignaciones = Array.from(asignacionesUnicas.values());
        console.log(`✅ Eliminados duplicados: quedan ${asignaciones.length} asignaciones únicas`);
    }
    
    // Comprimir y guardar
    if (asignaciones.length > 0) {
        const tamanoOriginal = new Blob([JSON.stringify(asignaciones)]).size;
        const asignacionesComprimidas = asignaciones.map(comprimirAsignacion);
        const datosComprimidos = JSON.stringify(asignacionesComprimidas);
        const tamanoComprimido = new Blob([datosComprimidos]).size;
        
        try {
            localStorage.setItem(assignmentsKey + '-compressed', datosComprimidos);
            localStorage.setItem(assignmentsKey + '-mode', 'compressed');
            localStorage.removeItem(assignmentsKey); // Eliminar versión sin comprimir
            
            const ahorro = ((tamanoOriginal - tamanoComprimido) / tamanoOriginal * 100).toFixed(1);
            console.log(`✅ Comprimidas ${asignaciones.length} asignaciones`);
            console.log(`📉 ${(tamanoOriginal/1024).toFixed(2)} KB → ${(tamanoComprimido/1024).toFixed(2)} KB (${ahorro}% ahorro)`);
        } catch (quotaError) {
            console.error('❌ Error al guardar comprimido, reduciendo cantidad...');
            
            // Mantener solo las últimas 50 asignaciones
            const asignacionesReducidas = asignaciones
                .sort((a, b) => new Date(b.assignedAt || 0).getTime() - new Date(a.assignedAt || 0).getTime())
                .slice(0, 50);
            
            const comprimidasReducidas = asignacionesReducidas.map(comprimirAsignacion);
            localStorage.setItem(assignmentsKey + '-compressed', JSON.stringify(comprimidasReducidas));
            localStorage.setItem(assignmentsKey + '-mode', 'compressed');
            localStorage.removeItem(assignmentsKey);
            
            console.log(`⚠️ Reducidas a ${asignacionesReducidas.length} asignaciones más recientes`);
        }
    }
    
    // ==================== PASO 4: INTERCEPTAR FUNCIONES ====================
    
    console.log('\n🔧 [4/5] Configurando intercepción automática...');
    
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    
    Storage.prototype.setItem = function(key, value) {
        if (key === assignmentsKey) {
            try {
                const datos = JSON.parse(value);
                
                // Eliminar duplicados
                const unicos = new Map();
                datos.forEach(a => {
                    const clave = `${a.studentId}-${a.sectionId}`;
                    unicos.set(clave, a);
                });
                const datosUnicos = Array.from(unicos.values());
                
                // Comprimir
                const datosComprimidos = datosUnicos.map(comprimirAsignacion);
                
                // Guardar
                originalSetItem.call(this, key + '-compressed', JSON.stringify(datosComprimidos));
                originalSetItem.call(this, key + '-mode', 'compressed');
                
                console.log(`✅ [AUTO] Guardadas ${datosUnicos.length} asignaciones (comprimidas)`);
                return;
            } catch (error) {
                console.error('❌ [AUTO] Error en guardado:', error);
                throw new Error('Error al guardar asignaciones. Ejecuta: limpiezaTotalEmergencia()');
            }
        }
        
        // Para otras claves, usar método original
        try {
            return originalSetItem.call(this, key, value);
        } catch (quotaError) {
            console.error(`❌ QuotaError en clave: ${key}`);
            throw quotaError;
        }
    };
    
    Storage.prototype.getItem = function(key) {
        if (key === assignmentsKey) {
            const modo = originalGetItem.call(this, key + '-mode');
            if (modo === 'compressed') {
                try {
                    const datosComprimidos = JSON.parse(originalGetItem.call(this, key + '-compressed') || '[]');
                    const datosDescomprimidos = datosComprimidos.map(descomprimirAsignacion);
                    return JSON.stringify(datosDescomprimidos);
                } catch (e) {
                    console.error('❌ Error al descomprimir:', e);
                    return '[]';
                }
            }
        }
        return originalGetItem.call(this, key);
    };
    
    console.log('✅ Intercepción de localStorage configurada');
    
    // ==================== PASO 5: FUNCIONES DE UTILIDAD ====================
    
    console.log('\n🛠️ [5/5] Configurando funciones de utilidad...');
    
    // Función para ver estado del sistema
    window.verEstadoSistema = function() {
        console.log('\n📊 [ESTADO DEL SISTEMA]');
        
        let espacioTotal = 0;
        const analisis = {};
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('smart-student-')) {
                const tamano = calcularTamano(key);
                espacioTotal += tamano;
                
                let registros = 0;
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    if (Array.isArray(data)) {
                        registros = data.length;
                    }
                } catch(e) {}
                
                analisis[key] = {
                    tamanoKB: (tamano / 1024).toFixed(2),
                    registros: registros
                };
            }
        }
        
        console.log(`💾 Espacio total: ${(espacioTotal / 1024 / 1024).toFixed(2)} MB de ~10 MB`);
        console.table(analisis);
        
        return { espacioTotal, analisis };
    };
    
    // Función de limpieza total de emergencia
    window.limpiezaTotalEmergencia = function() {
        console.log('🆘 [LIMPIEZA TOTAL] Iniciando limpieza de emergencia...');
        
        const confirmacion = confirm(
            '⚠️ ADVERTENCIA ⚠️\n\n' +
            'Esto eliminará TODOS los datos excepto usuarios, cursos y secciones.\n\n' +
            '¿Estás seguro de continuar?'
        );
        
        if (!confirmacion) {
            console.log('❌ Limpieza cancelada');
            return;
        }
        
        const clavesEsenciales = [
            'smart-student-users',
            'smart-student-courses',
            'smart-student-sections',
            'smart-student-subjects',
            'smart-student-administrators',
            'smart-student-config'
        ];
        
        let eliminadas = 0;
        let espacioLiberado = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && 
                key.startsWith('smart-student-') && 
                !clavesEsenciales.includes(key)) {
                
                const tamano = calcularTamano(key);
                localStorage.removeItem(key);
                eliminadas++;
                espacioLiberado += tamano;
            }
        }
        
        console.log(`✅ Eliminadas ${eliminadas} claves`);
        console.log(`💾 Liberados ${(espacioLiberado / 1024 / 1024).toFixed(2)} MB`);
        console.log('🔄 Recarga la página para continuar');
        
        return { eliminadas, espacioLiberado };
    };
    
    // Función para crear asignaciones desde configuración actual
    window.crearAsignacionesDesdeConfiguracion = function() {
        console.log('🎯 [CREAR ASIGNACIONES] Generando desde configuración actual...');
        
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const cursos = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
            const secciones = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
            
            const estudiantes = usuarios.filter(u => 
                (u.role === 'student' || u.role === 'estudiante') && u.isActive !== false
            );
            
            console.log(`👥 ${estudiantes.length} estudiantes encontrados`);
            console.log(`📚 ${cursos.length} cursos disponibles`);
            console.log(`🏫 ${secciones.length} secciones disponibles`);
            
            if (cursos.length === 0 || secciones.length === 0) {
                console.error('❌ No hay cursos o secciones configurados');
                return { exito: false, mensaje: 'Falta configuración de cursos/secciones' };
            }
            
            const nuevasAsignaciones = [];
            
            estudiantes.forEach(estudiante => {
                let cursoAsignado = null;
                let seccionAsignada = null;
                
                // Método 1: Usar courseId y sectionId si existen
                if (estudiante.courseId && estudiante.sectionId) {
                    cursoAsignado = cursos.find(c => c.id === estudiante.courseId);
                    seccionAsignada = secciones.find(s => s.id === estudiante.sectionId);
                }
                
                // Método 2: Asignar por defecto
                if (!cursoAsignado) {
                    cursoAsignado = cursos[0];
                    const seccionesCurso = secciones.filter(s => s.courseId === cursoAsignado.id);
                    seccionAsignada = seccionesCurso[0];
                }
                
                if (cursoAsignado && seccionAsignada) {
                    nuevasAsignaciones.push({
                        id: `${estudiante.id}-${seccionAsignada.id}`,
                        studentId: estudiante.id,
                        courseId: cursoAsignado.id,
                        sectionId: seccionAsignada.id,
                        isActive: true,
                        assignedAt: new Date().toISOString()
                    });
                }
            });
            
            // Guardar (usará la intercepción automática para comprimir)
            localStorage.setItem(assignmentsKey, JSON.stringify(nuevasAsignaciones));
            
            console.log(`✅ Creadas ${nuevasAsignaciones.length} asignaciones`);
            console.log('💾 Guardadas automáticamente (comprimidas)');
            
            return {
                exito: true,
                asignacionesCreadas: nuevasAsignaciones.length,
                mensaje: 'Asignaciones creadas exitosamente'
            };
            
        } catch (error) {
            console.error('❌ Error al crear asignaciones:', error);
            return {
                exito: false,
                error: error.message,
                mensaje: 'Error al crear asignaciones'
            };
        }
    };
    
    // ==================== VERIFICACIÓN FINAL ====================
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ [SOLUCIÓN APLICADA] Sistema optimizado sin Firebase');
    console.log('='.repeat(60));
    
    const estado = window.verEstadoSistema();
    
    console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
    console.log('   • verEstadoSistema() - Ver estado actual');
    console.log('   • crearAsignacionesDesdeConfiguracion() - Generar asignaciones');
    console.log('   • limpiezaTotalEmergencia() - Limpieza de emergencia');
    
    console.log('\n💡 [SIGUIENTE PASO]:');
    if (estado.espacioTotal < 8 * 1024 * 1024) {
        console.log('   ✅ Espacio suficiente');
        console.log('   Ejecuta: crearAsignacionesDesdeConfiguracion()');
    } else {
        console.log('   ⚠️ Espacio limitado');
        console.log('   Ejecuta: limpiezaTotalEmergencia()');
    }
    
    console.log('\n📖 [NOTA]:');
    console.log('   Firebase ha sido deshabilitado temporalmente');
    console.log('   El sistema funciona 100% con localStorage optimizado');
    console.log('   No habrá más errores de credenciales de Firebase');
    
    console.log('\n' + '='.repeat(60));
    
})();
