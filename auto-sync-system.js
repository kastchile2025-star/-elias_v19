/**
 * 🔄 SISTEMA AUTOMÁTICO DE SINCRONIZACIÓN
 * 
 * Este script detecta cambios en Gestión de Usuarios y actualiza
 * automáticamente los Datos Académicos en tiempo real.
 */

console.log('🔄 ACTIVANDO SINCRONIZACIÓN AUTOMÁTICA...');
console.log('==========================================');

// 1. Función para leer el estado actual antes de los cambios
function capturarEstadoActual() {
    try {
        console.log('📊 ESTADO ACTUAL DE TODOS LOS ESTUDIANTES:');
        console.log('==========================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        const estudiantes = users.filter(u => u.role === 'student');
        
        console.log(`📋 Encontrados: ${estudiantes.length} estudiantes`);
        
        estudiantes.forEach((estudiante, index) => {
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            const perfilCurso = estudiante.activeCourses?.[0] || 'Sin curso asignado';
            
            console.log(`\n${index + 1}. ${estudiante.username.toUpperCase()}:`);
            console.log(`   👤 Perfil muestra: ${perfilCurso}`);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (curso && seccion) {
                    const gestionCurso = `${curso.name} - Sección ${seccion.name}`;
                    console.log(`   📋 Gestión dice: ${gestionCurso}`);
                    
                    if (perfilCurso === gestionCurso) {
                        console.log(`   ✅ SINCRONIZADO`);
                    } else {
                        console.log(`   ❌ DESINCRONIZADO - Necesita actualización`);
                    }
                } else {
                    console.log(`   ⚠️ Datos incompletos en gestión`);
                }
            } else {
                console.log(`   ❌ Sin asignación en gestión de usuarios`);
            }
        });

        return { users, courses, sections, studentAssignments, estudiantes };

    } catch (error) {
        console.error('❌ Error capturando estado:', error);
        return null;
    }
}

// 2. Función para detectar y aplicar cambios desde gestión
function sincronizarDesdeGestion() {
    try {
        console.log('\n🔄 EJECUTANDO SINCRONIZACIÓN...');
        console.log('================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        let cambiosRealizados = 0;
        const estudiantes = users.filter(u => u.role === 'student');
        
        estudiantes.forEach(estudiante => {
            console.log(`\n🔍 Procesando: ${estudiante.username}`);
            
            // Buscar asignación en gestión de usuarios
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (curso && seccion) {
                    const cursoGestion = `${curso.name} - Sección ${seccion.name}`;
                    const cursoPerfil = estudiante.activeCourses?.[0] || 'Sin curso';
                    
                    console.log(`   📋 Gestión: ${cursoGestion}`);
                    console.log(`   👤 Perfil: ${cursoPerfil}`);
                    
                    if (cursoPerfil !== cursoGestion) {
                        // ACTUALIZAR PERFIL
                        estudiante.activeCourses = [cursoGestion];
                        cambiosRealizados++;
                        console.log(`   ✅ ACTUALIZADO: "${cursoPerfil}" → "${cursoGestion}"`);
                    } else {
                        console.log(`   ✅ Ya sincronizado`);
                    }
                } else {
                    console.log(`   ⚠️ Curso o sección no encontrados`);
                }
            } else {
                console.log(`   ❌ Sin asignación en gestión`);
            }
        });

        // Guardar cambios si los hay
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            
            console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA:`);
            console.log(`=============================`);
            console.log(`✅ Estudiantes actualizados: ${cambiosRealizados}`);
            
            // Disparar evento de actualización
            const evento = new CustomEvent('profileDataUpdate', {
                detail: { 
                    type: 'sync-from-management',
                    updatedCount: cambiosRealizados,
                    timestamp: new Date().toISOString()
                }
            });
            window.dispatchEvent(evento);
            
            console.log('📡 Evento de actualización disparado');
            
            // Forzar recarga del componente actual
            if (window.location.pathname.includes('/perfil')) {
                console.log('🔄 Recargando perfil para mostrar cambios...');
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
            
        } else {
            console.log('\n✅ Todos los perfiles ya están sincronizados');
        }

        return cambiosRealizados;

    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return 0;
    }
}

// 3. Función específica para verificar Gustavo después del cambio
function verificarGustavoDespuesCambio() {
    try {
        console.log('\n🎯 VERIFICACIÓN ESPECÍFICA DE GUSTAVO:');
        console.log('=====================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        const gustavo = users.find(u => u.username === 'gustavo');
        const asignacion = studentAssignments.find(a => a.studentId === gustavo?.id);
        
        if (gustavo && asignacion) {
            const curso = courses.find(c => c.id === asignacion.courseId);
            const seccion = sections.find(s => s.id === asignacion.sectionId);
            
            console.log(`👤 GUSTAVO:`);
            console.log(`   📋 Gestión dice: ${curso?.name} - Sección ${seccion?.name}`);
            console.log(`   👤 Perfil muestra: ${gustavo.activeCourses?.[0] || 'Sin curso'}`);
            
            const cursoEsperado = `${curso?.name} - Sección ${seccion?.name}`;
            const cursoActual = gustavo.activeCourses?.[0];
            
            if (cursoActual === cursoEsperado) {
                console.log(`   ✅ PERFECTO - Datos sincronizados correctamente`);
            } else {
                console.log(`   ❌ PROBLEMA - Los datos no coinciden`);
                console.log(`   💡 Ejecuta: sincronizarDesdeGestion() para corregir`);
            }
        } else {
            console.log(`❌ Gustavo o su asignación no encontrados`);
        }

    } catch (error) {
        console.error('❌ Error verificando Gustavo:', error);
    }
}

// 4. Sistema de monitoreo automático
function activarMonitoreoAutomatico() {
    try {
        console.log('\n🔧 ACTIVANDO MONITOREO AUTOMÁTICO...');
        console.log('====================================');
        
        // Interceptar cambios en localStorage para detectar modificaciones
        if (!window.autoSyncActive) {
            const originalSetItem = localStorage.setItem;
            
            localStorage.setItem = function(key, value) {
                const resultado = originalSetItem.call(this, key, value);
                
                // Si cambian las asignaciones de estudiantes, sincronizar automáticamente
                if (key === 'smart-student-student-assignments') {
                    console.log('🔔 Detectado cambio en asignaciones - Auto-sincronizando...');
                    setTimeout(() => {
                        sincronizarDesdeGestion();
                    }, 200);
                }
                
                return resultado;
            };
            
            window.autoSyncActive = true;
            console.log('✅ Monitoreo automático activado');
            console.log('🔔 Los cambios en Gestión de Usuarios se sincronizarán automáticamente');
        } else {
            console.log('✅ Monitoreo automático ya estaba activo');
        }

    } catch (error) {
        console.error('❌ Error activando monitoreo:', error);
    }
}

// ===============================
// 🚀 EJECUTAR SECUENCIA COMPLETA
// ===============================

console.log('🚀 INICIANDO SISTEMA COMPLETO...');

// 1. Mostrar estado actual
const estadoActual = capturarEstadoActual();

// 2. Ejecutar sincronización
const cambios = sincronizarDesdeGestion();

// 3. Verificar Gustavo específicamente
verificarGustavoDespuesCambio();

// 4. Activar monitoreo automático
activarMonitoreoAutomatico();

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('- sincronizarDesdeGestion() - Forzar sincronización manual');
console.log('- verificarGustavoDespuesCambio() - Verificar específicamente a Gustavo');
console.log('- capturarEstadoActual() - Ver estado de todos los estudiantes');

console.log('\n🎯 RESULTADO:');
console.log('=============');
if (cambios > 0) {
    console.log(`✅ ${cambios} perfil(es) actualizado(s) exitosamente`);
    console.log('🔄 Los cambios se están aplicando automáticamente');
} else {
    console.log('✅ Todos los perfiles ya estaban actualizados');
}
console.log('🔔 Sistema automático activado para futuros cambios en Gestión de Usuarios');

console.log('\n🚨 IMPORTANTE:');
console.log('==============');
console.log('Ahora cuando hagas cambios en Gestión de Usuarios,');
console.log('los perfiles se actualizarán AUTOMÁTICAMENTE sin necesidad de scripts.');
