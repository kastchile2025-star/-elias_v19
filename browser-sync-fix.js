// 🔄 COPIÁ Y PEGÁ ESTE CÓDIGO EN LA CONSOLA DEL NAVEGADOR
// =====================================================================

/**
 * SISTEMA DINÁMICO PARA ACTUALIZACIÓN AUTOMÁTICA
 * Este script lee los cambios que hiciste en Gestión de Usuarios
 * y actualiza automáticamente los Datos Académicos en los perfiles.
 */

console.log('🔄 ACTIVANDO SISTEMA DINÁMICO COMPLETO...');
console.log('=========================================');

// 1. Función para sincronizar desde gestión de usuarios a perfiles
function sincronizarCambiosGestion() {
    try {
        console.log('📊 LEYENDO GESTIÓN DE USUARIOS...');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log(`📋 Datos encontrados:`);
        console.log(`   Usuarios: ${users.length}`);
        console.log(`   Asignaciones: ${studentAssignments.length}`);
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);

        console.log('\n🔍 PROCESANDO CADA ESTUDIANTE...');
        
        let actualizados = 0;
        const estudiantes = users.filter(u => u.role === 'student');
        
        estudiantes.forEach(estudiante => {
            console.log(`\n👤 Procesando: ${estudiante.username}`);
            
            // Buscar asignación actual en gestión
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (curso && seccion) {
                    const cursoCompleto = `${curso.name} - Sección ${seccion.name}`;
                    const cursoAnterior = estudiante.activeCourses?.[0] || 'Sin curso';
                    
                    console.log(`   📚 Gestión dice: ${cursoCompleto}`);
                    console.log(`   📖 Perfil tiene: ${cursoAnterior}`);
                    
                    if (cursoAnterior !== cursoCompleto) {
                        // Actualizar perfil
                        estudiante.activeCourses = [cursoCompleto];
                        actualizados++;
                        console.log(`   ✅ ACTUALIZADO: ${cursoAnterior} → ${cursoCompleto}`);
                    } else {
                        console.log(`   ✅ Ya está sincronizado`);
                    }
                } else {
                    console.log(`   ⚠️ Asignación apunta a curso/sección inexistente`);
                }
            } else {
                console.log(`   ❌ Sin asignación en gestión de usuarios`);
            }
        });

        // Guardar cambios
        if (actualizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA:`);
            console.log(`   Estudiantes actualizados: ${actualizados}`);
            
            // Disparar evento para que el componente se actualice
            const event = new CustomEvent('localStorageUpdate', {
                detail: { type: 'student-sync', count: actualizados }
            });
            window.dispatchEvent(event);
            
            console.log('📡 Evento de actualización disparado');
            
            // Forzar recarga de la página en 1 segundo
            console.log('🔄 Recargando página para mostrar cambios...');
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            console.log('\n✅ Todos los estudiantes ya están sincronizados');
        }

        return actualizados;

    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return 0;
    }
}

// 2. Función para mostrar estado antes de sincronizar
function mostrarEstadoAntes() {
    try {
        console.log('\n📊 ESTADO ANTES DE SINCRONIZAR:');
        console.log('==============================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        const estudiantes = users.filter(u => u.role === 'student');
        
        estudiantes.forEach((estudiante, index) => {
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            const perfilCurso = estudiante.activeCourses?.[0] || 'Sin curso';
            
            console.log(`\n${index + 1}. ${estudiante.username.toUpperCase()}:`);
            console.log(`   📖 Perfil actual: ${perfilCurso}`);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                const gestionCurso = `${curso?.name} - Sección ${seccion?.name}`;
                
                console.log(`   📋 Gestión dice: ${gestionCurso}`);
                
                if (perfilCurso === gestionCurso) {
                    console.log(`   ✅ YA SINCRONIZADO`);
                } else {
                    console.log(`   ❌ NECESITA ACTUALIZACIÓN`);
                }
            } else {
                console.log(`   ⚠️ Sin asignación en gestión`);
            }
        });

    } catch (error) {
        console.error('❌ Error mostrando estado:', error);
    }
}

// 3. Función específica para Gustavo y Max
function verificarGustavoYMax() {
    try {
        console.log('\n🎯 ESTADO GUSTAVO Y MAX:');
        console.log('========================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        ['gustavo', 'max'].forEach(username => {
            const usuario = users.find(u => u.username === username);
            const asignacion = studentAssignments.find(a => a.studentId === usuario?.id);
            
            console.log(`\n👤 ${username.toUpperCase()}:`);
            
            if (usuario && asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                const gestionCurso = `${curso?.name} - Sección ${seccion?.name}`;
                const perfilCurso = usuario.activeCourses?.[0] || 'Sin curso';
                
                console.log(`   📋 Gestión: ${gestionCurso}`);
                console.log(`   📖 Perfil: ${perfilCurso}`);
                
                if (perfilCurso === gestionCurso) {
                    console.log(`   ✅ SINCRONIZADO`);
                } else {
                    console.log(`   ❌ DESINCRONIZADO - Se corregirá automáticamente`);
                }
            } else {
                console.log(`   ❌ Usuario o asignación no encontrados`);
            }
        });

    } catch (error) {
        console.error('❌ Error verificando Gustavo y Max:', error);
    }
}

// ===============================
// 🚀 EJECUTAR SECUENCIA COMPLETA
// ===============================

console.log('🚀 INICIANDO PROCESO...');

// 1. Mostrar estado antes
mostrarEstadoAntes();

// 2. Verificar Gustavo y Max específicamente  
verificarGustavoYMax();

// 3. Ejecutar sincronización
console.log('\n🔄 EJECUTANDO SINCRONIZACIÓN...');
const actualizados = sincronizarCambiosGestion();

console.log('\n💡 RESULTADO FINAL:');
console.log('==================');
if (actualizados > 0) {
    console.log(`✅ ${actualizados} estudiante(s) actualizado(s)`);
    console.log('🔄 La página se recargará automáticamente para mostrar los cambios');
} else {
    console.log('✅ Todos los datos ya estaban sincronizados');
    console.log('💡 Ve al perfil de Gustavo y Max para confirmar que muestren los datos correctos');
}
