/**
 * INICIALIZACIÓN RÁPIDA - SOLUCIÓN QUOTAEXCEEDEDERROR
 * Smart Student v17
 * 
 * Ejecuta este script para cargar automáticamente todos los componentes
 * necesarios para resolver el problema de QuotaExceededError
 */

(function() {
    'use strict';
    
    console.log('🚀 [INIT] Inicializando solución para QuotaExceededError...');
    console.log('⏳ Por favor espera mientras se cargan los componentes...');
    
    const SCRIPTS = [
        {
            nombre: 'Sistema de Optimización de Almacenamiento',
            url: '/solucion-quota-exceeded-localStorage.js',
            verificacion: () => typeof window.guardarConSeguridad === 'function'
        },
        {
            nombre: 'Sistema de Carga Masiva Optimizada',
            url: '/carga-masiva-calificaciones-optimizada.js',
            verificacion: () => typeof window.cargarCalificacionesEnLotes === 'function'
        }
    ];
    
    let scriptsCompletados = 0;
    const totalScripts = SCRIPTS.length;
    
    async function cargarScript(scriptInfo) {
        return new Promise((resolve, reject) => {
            console.log(`📥 [${scriptsCompletados + 1}/${totalScripts}] Cargando: ${scriptInfo.nombre}...`);
            
            const script = document.createElement('script');
            script.src = scriptInfo.url;
            
            script.onload = () => {
                // Esperar un poco para que el script se ejecute
                setTimeout(() => {
                    if (scriptInfo.verificacion()) {
                        console.log(`✅ [${scriptsCompletados + 1}/${totalScripts}] ${scriptInfo.nombre} cargado correctamente`);
                        scriptsCompletados++;
                        resolve();
                    } else {
                        console.warn(`⚠️ [${scriptsCompletados + 1}/${totalScripts}] ${scriptInfo.nombre} cargado pero no verificado`);
                        scriptsCompletados++;
                        resolve(); // Continuar de todos modos
                    }
                }, 500);
            };
            
            script.onerror = () => {
                console.error(`❌ [${scriptsCompletados + 1}/${totalScripts}] Error al cargar: ${scriptInfo.nombre}`);
                reject(new Error(`No se pudo cargar ${scriptInfo.nombre}`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    async function inicializar() {
        try {
            // Cargar scripts secuencialmente
            for (const scriptInfo of SCRIPTS) {
                await cargarScript(scriptInfo);
                // Pausa entre scripts
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('🎉 [ÉXITO] Todos los componentes cargados correctamente!');
            console.log('='.repeat(60));
            
            // Ejecutar diagnóstico inicial
            console.log('\n🔍 [DIAGNÓSTICO INICIAL]');
            if (typeof window.diagnosticoAlmacenamiento === 'function') {
                const diagnostico = window.diagnosticoAlmacenamiento();
                
                // Sugerencias basadas en diagnóstico
                const espacioUsadoMB = diagnostico.espacioUsado / 1024 / 1024;
                
                console.log('\n💡 [SUGERENCIAS]:');
                
                if (espacioUsadoMB > 7) {
                    console.log('   ⚠️ ESPACIO LIMITADO (>7MB usado)');
                    console.log('   Recomendación: Ejecutar limpiarDatosObsoletos()');
                } else if (espacioUsadoMB > 5) {
                    console.log('   ⚠️ ESPACIO MODERADO (>5MB usado)');
                    console.log('   Recomendación: Considerar limpieza preventiva');
                } else {
                    console.log('   ✅ ESPACIO SUFICIENTE (<5MB usado)');
                    console.log('   Sistema listo para carga masiva');
                }
                
                if (diagnostico.problemas.length > 0) {
                    console.log('\n   📋 PROBLEMAS DETECTADOS:');
                    diagnostico.problemas.forEach(p => {
                        console.log(`      • ${p.clave}: ${p.problema}`);
                    });
                    console.log('   Recomendación: Ejecutar migrarDatosGrandes()');
                }
            }
            
            // Mostrar funciones disponibles
            console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
            console.log('\n   📊 DIAGNÓSTICO Y MONITOREO:');
            console.log('      • diagnosticoAlmacenamiento() - Análisis completo del almacenamiento');
            console.log('      • mostrarEstadoSistema() - Estado general del sistema');
            
            console.log('\n   🧹 MANTENIMIENTO:');
            console.log('      • limpiarDatosObsoletos() - Limpiar datos antiguos (>30 días)');
            console.log('      • migrarDatosGrandes() - Migrar datos grandes a Firestore');
            
            console.log('\n   💾 ALMACENAMIENTO:');
            console.log('      • guardarConSeguridad(clave, datos) - Guardar con manejo de cuota');
            console.log('      • cargarConSeguridad(clave) - Cargar con soporte de compresión');
            
            console.log('\n   📚 CARGA MASIVA:');
            console.log('      • mostrarInterfazCargaMasiva() - Abrir interfaz visual');
            console.log('      • cargarCalificacionesEnLotes(calificaciones) - Carga programática');
            console.log('      • cargarCalificacionesDesdeCSV(archivo) - Carga desde CSV');
            
            console.log('\n📖 [GUÍA RÁPIDA]:');
            console.log('   1. Ejecutar: diagnosticoAlmacenamiento()');
            console.log('   2. Si hay problemas: limpiarDatosObsoletos()');
            console.log('   3. Para carga masiva: mostrarInterfazCargaMasiva()');
            console.log('   4. O usar: cargarCalificacionesEnLotes([...])');
            
            console.log('\n📄 [DOCUMENTACIÓN]:');
            console.log('   Ver: SOLUCION_QUOTA_EXCEEDED_ERROR.md para guía completa');
            
            console.log('\n' + '='.repeat(60));
            
            // Crear función de ayuda
            window.ayudaCargaMasiva = function() {
                console.log('\n📚 [AYUDA - CARGA MASIVA]');
                console.log('\n1️⃣ OPCIÓN 1: INTERFAZ VISUAL (Más fácil)');
                console.log('   mostrarInterfazCargaMasiva()');
                console.log('   → Abre una ventana donde puedes cargar un archivo CSV');
                
                console.log('\n2️⃣ OPCIÓN 2: CARGA PROGRAMÁTICA');
                console.log('   const calificaciones = [');
                console.log('       { studentId: "s1", taskId: "t1", grade: 85 },');
                console.log('       { studentId: "s2", taskId: "t1", grade: 90 }');
                console.log('   ];');
                console.log('   await cargarCalificacionesEnLotes(calificaciones);');
                
                console.log('\n3️⃣ OPCIÓN 3: DESDE CSV');
                console.log('   const input = document.getElementById("mi-input-file");');
                console.log('   await cargarCalificacionesDesdeCSV(input.files[0]);');
                
                console.log('\n📋 FORMATO CSV:');
                console.log('   studentId,taskId,grade,maxGrade,comment');
                console.log('   student-1,task-1,85,100,Buen trabajo');
                console.log('   student-2,task-1,90,100,Excelente');
                
                console.log('\n💡 CONSEJOS:');
                console.log('   • Revisa espacio antes: diagnosticoAlmacenamiento()');
                console.log('   • Limpia si es necesario: limpiarDatosObsoletos()');
                console.log('   • Usa lotes pequeños si hay problemas (50-100 registros)');
            };
            
            console.log('\n💡 [TIP] Ejecuta ayudaCargaMasiva() para ver ejemplos de uso');
            
            // Ofrecer ejecutar limpieza automática si es necesario
            if (typeof window.diagnosticoAlmacenamiento === 'function') {
                const diagnostico = window.diagnosticoAlmacenamiento();
                const espacioUsadoMB = diagnostico.espacioUsado / 1024 / 1024;
                
                if (espacioUsadoMB > 7) {
                    console.log('\n⚠️ [ACCIÓN RECOMENDADA] Espacio limitado detectado');
                    console.log('   ¿Deseas ejecutar limpieza automática?');
                    console.log('   Ejecuta: ejecutarLimpiezaAutomatica()');
                    
                    window.ejecutarLimpiezaAutomatica = async function() {
                        console.log('🧹 [LIMPIEZA AUTO] Iniciando limpieza automática...');
                        
                        // Limpiar datos obsoletos
                        if (typeof window.limpiarDatosObsoletos === 'function') {
                            console.log('📋 [1/2] Limpiando datos obsoletos...');
                            const resultadoLimpieza = window.limpiarDatosObsoletos();
                            console.log(`✅ [1/2] ${resultadoLimpieza.eliminados} registros eliminados`);
                        }
                        
                        // Migrar datos grandes si es necesario
                        const diagnosticoActual = window.diagnosticoAlmacenamiento();
                        if (diagnosticoActual.problemas.length > 0) {
                            console.log('📋 [2/2] Migrando datos grandes...');
                            if (typeof window.migrarDatosGrandes === 'function') {
                                const resultadoMigracion = await window.migrarDatosGrandes();
                                console.log('✅ [2/2] Migración completada');
                                console.table(resultadoMigracion);
                            }
                        } else {
                            console.log('✅ [2/2] No es necesario migrar datos');
                        }
                        
                        console.log('\n🎉 [LIMPIEZA COMPLETA] Sistema optimizado!');
                        console.log('   Ahora puedes proceder con la carga masiva');
                        console.log('   Ejecuta: mostrarInterfazCargaMasiva()');
                    };
                }
            }
            
        } catch (error) {
            console.error('\n❌ [ERROR] Error durante la inicialización:', error);
            console.log('\n🔧 [SOLUCIÓN] Intenta:');
            console.log('   1. Recargar la página');
            console.log('   2. Verificar que los archivos existen:');
            console.log('      - solucion-quota-exceeded-localStorage.js');
            console.log('      - carga-masiva-calificaciones-optimizada.js');
            console.log('   3. Cargar manualmente cada script');
        }
    }
    
    // Iniciar
    inicializar();
    
})();
