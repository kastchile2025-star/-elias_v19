/**
 * 🚨 SINCRONIZACIÓN MANUAL URGENTE
 * 
 * Detectar y aplicar los cambios que hiciste en Gestión de Usuarios
 * para Gustavo y Max inmediatamente.
 */

console.log('🚨 SINCRONIZACIÓN MANUAL URGENTE...');
console.log('===================================');

// Función para mostrar discrepancias específicas
function detectarCambiosPendientes() {
    try {
        console.log('🔍 DETECTANDO CAMBIOS PENDIENTES...');
        console.log('===================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 DATOS EN LOCALSTORAGE:');
        console.log(`   Usuarios: ${users.length}`);
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Asignaciones: ${studentAssignments.length}`);

        console.log('\n👥 ESTADO ACTUAL DE GUSTAVO Y MAX:');
        console.log('==================================');

        ['gustavo', 'max'].forEach(username => {
            const usuario = users.find(u => u.username === username);
            const asignacion = studentAssignments.find(a => a.studentId === usuario?.id);
            
            console.log(`\n👤 ${username.toUpperCase()}:`);
            
            if (usuario) {
                const perfilCurso = usuario.activeCourses?.[0] || 'Sin curso';
                console.log(`   👤 Perfil muestra: ${perfilCurso}`);
                
                if (asignacion) {
                    const curso = courses.find(c => c.id === asignacion.courseId);
                    const seccion = sections.find(s => s.id === asignacion.sectionId);
                    
                    if (curso && seccion) {
                        const gestionCurso = `${curso.name} - Sección ${seccion.name}`;
                        console.log(`   📋 Gestión dice: ${gestionCurso}`);
                        
                        if (perfilCurso !== gestionCurso) {
                            console.log(`   ❌ DESINCRONIZADO - Necesita actualización urgente`);
                            console.log(`   🔄 Cambio pendiente: "${perfilCurso}" → "${gestionCurso}"`);
                        } else {
                            console.log(`   ✅ Sincronizado`);
                        }
                    } else {
                        console.log(`   ⚠️ Curso o sección no encontrados en datos`);
                        console.log(`   🔍 Curso ID: ${asignacion.courseId}`);
                        console.log(`   🔍 Sección ID: ${asignacion.sectionId}`);
                    }
                } else {
                    console.log(`   ❌ No tiene asignación en gestión de usuarios`);
                }
            } else {
                console.log(`   ❌ Usuario no encontrado`);
            }
        });

        return { users, courses, sections, studentAssignments };

    } catch (error) {
        console.error('❌ Error detectando cambios:', error);
        return null;
    }
}

// Función para forzar actualización inmediata
function forzarActualizacionInmediata() {
    try {
        console.log('\n🔄 FORZANDO ACTUALIZACIÓN INMEDIATA...');
        console.log('=====================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        let actualizaciones = 0;
        const estudiantesTarget = ['gustavo', 'max'];
        
        estudiantesTarget.forEach(username => {
            const usuario = users.find(u => u.username === username);
            const asignacion = studentAssignments.find(a => a.studentId === usuario?.id);
            
            console.log(`\n🔧 Procesando: ${username}`);
            
            if (usuario && asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (curso && seccion) {
                    const cursoNuevo = `${curso.name} - Sección ${seccion.name}`;
                    const cursoAnterior = usuario.activeCourses?.[0] || 'Sin curso';
                    
                    console.log(`   📋 Gestión: ${cursoNuevo}`);
                    console.log(`   👤 Perfil: ${cursoAnterior}`);
                    
                    if (cursoAnterior !== cursoNuevo) {
                        // ACTUALIZAR INMEDIATAMENTE
                        usuario.activeCourses = [cursoNuevo];
                        actualizaciones++;
                        console.log(`   ✅ ACTUALIZADO: "${cursoAnterior}" → "${cursoNuevo}"`);
                    } else {
                        console.log(`   ✅ Ya actualizado`);
                    }
                } else {
                    console.log(`   ❌ Datos de curso/sección incompletos`);
                }
            } else {
                console.log(`   ❌ Usuario o asignación no encontrados`);
            }
        });

        // Guardar cambios
        if (actualizaciones > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            
            console.log(`\n🎉 ACTUALIZACIÓN COMPLETADA:`);
            console.log(`===========================`);
            console.log(`✅ Actualizaciones realizadas: ${actualizaciones}`);
            
            // Disparar eventos de actualización
            window.dispatchEvent(new CustomEvent('storage', {
                detail: { key: 'smart-student-users', type: 'manual-update' }
            }));
            
            window.dispatchEvent(new CustomEvent('localStorageUpdate', {
                detail: { type: 'profile-sync', count: actualizaciones }
            }));
            
            console.log('📡 Eventos de actualización disparados');
            
            // Forzar recarga si estamos en perfil
            if (window.location.pathname.includes('/perfil')) {
                console.log('🔄 Recargando página para mostrar cambios...');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
            
        } else {
            console.log('\n✅ No se necesitaron actualizaciones');
        }

        return actualizaciones;

    } catch (error) {
        console.error('❌ Error en actualización forzada:', error);
        return 0;
    }
}

// Función para verificar después de la actualización
function verificarDespuesActualizacion() {
    try {
        console.log('\n🔍 VERIFICACIÓN POST-ACTUALIZACIÓN:');
        console.log('===================================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        ['gustavo', 'max'].forEach(username => {
            const usuario = users.find(u => u.username === username);
            const asignacion = studentAssignments.find(a => a.studentId === usuario?.id);
            
            console.log(`\n👤 ${username.toUpperCase()} - RESULTADO FINAL:`);
            
            if (usuario && asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                const gestionCurso = `${curso?.name} - Sección ${seccion?.name}`;
                const perfilCurso = usuario.activeCourses?.[0] || 'Sin curso';
                
                console.log(`   📋 Gestión de Usuarios: ${gestionCurso}`);
                console.log(`   👤 Datos Académicos: ${perfilCurso}`);
                
                if (perfilCurso === gestionCurso) {
                    console.log(`   ✅ CORRECTO - Sincronizado exitosamente`);
                } else {
                    console.log(`   ❌ PROBLEMA - Aún desincronizado`);
                }
            } else {
                console.log(`   ❌ Datos no encontrados`);
            }
        });

    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

// ===================================
// 🚀 EJECUTAR SECUENCIA DE EMERGENCIA
// ===================================

console.log('🚀 INICIANDO SECUENCIA DE EMERGENCIA...');

// 1. Detectar cambios pendientes
detectarCambiosPendientes();

// 2. Forzar actualización inmediata
const cambios = forzarActualizacionInmediata();

// 3. Verificar resultado
verificarDespuesActualizacion();

console.log('\n💡 FUNCIONES DE EMERGENCIA:');
console.log('===========================');
console.log('- detectarCambiosPendientes() - Ver qué cambios faltan');
console.log('- forzarActualizacionInmediata() - Aplicar cambios ahora');
console.log('- verificarDespuesActualizacion() - Confirmar resultado');

console.log('\n🎯 RESULTADO DE EMERGENCIA:');
console.log('===========================');
if (cambios > 0) {
    console.log(`✅ ${cambios} perfil(es) sincronizado(s) exitosamente`);
    console.log('🔄 La página se recargará para mostrar los cambios');
} else {
    console.log('⚠️ No se detectaron cambios para aplicar');
    console.log('💡 Revisa que los cambios estén guardados en Gestión de Usuarios');
}
