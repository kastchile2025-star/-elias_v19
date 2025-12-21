/**
 * 🔄 FORZAR ACTUALIZACIÓN INMEDIATA DEL PERFIL
 * 
 * Este script lee los cambios más recientes de "Gestión de Usuarios"
 * y los aplica INMEDIATAMENTE al perfil de estudiantes
 */

console.log('🔄 FORZAR ACTUALIZACIÓN INMEDIATA DEL PERFIL...');

function detectarCambiosRecientes() {
    console.log('\n🔍 [DETECCIÓN] Analizando cambios recientes en Gestión de Usuarios...');
    
    try {
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log('📊 [DATOS] Estado actual:');
        console.log(`   • Asignaciones: ${studentAssignments.length}`);
        console.log(`   • Usuarios: ${users.length}`);
        
        // Buscar cambios en las últimas horas
        const ahora = new Date();
        const ultimasHoras = new Date(ahora.getTime() - 24 * 60 * 60 * 1000); // Últimas 24h
        
        const cambiosRecientes = studentAssignments.filter(assignment => {
            const fechaCreacion = assignment.createdAt ? new Date(assignment.createdAt) : null;
            const fechaActualizacion = assignment.updatedAt ? new Date(assignment.updatedAt) : null;
            
            return (fechaCreacion && fechaCreacion > ultimasHoras) || 
                   (fechaActualizacion && fechaActualizacion > ultimasHoras);
        });
        
        console.log(`\n🕒 [CAMBIOS RECIENTES] ${cambiosRecientes.length} cambios detectados:`);
        
        cambiosRecientes.forEach(assignment => {
            const student = users.find(u => u.id === assignment.studentId);
            const course = courses.find(c => c.id === assignment.courseId);
            const section = sections.find(s => s.id === assignment.sectionId);
            
            if (student && course && section) {
                console.log(`   📝 ${student.displayName || student.username} → ${course.name} Sección ${section.name}`);
                console.log(`      Creado: ${assignment.createdAt || 'Sin fecha'}`);
                console.log(`      Actualizado: ${assignment.updatedAt || 'Sin fecha'}`);
            }
        });
        
        return { studentAssignments, users, courses, sections, cambiosRecientes };
        
    } catch (error) {
        console.error('❌ Error detectando cambios:', error);
        return null;
    }
}

function actualizarPerfilInmediato() {
    console.log('\n⚡ [ACTUALIZACIÓN] Forzando actualización inmediata del perfil...');
    
    const datos = detectarCambiosRecientes();
    if (!datos) return false;
    
    const { studentAssignments, users, courses, sections } = datos;
    
    try {
        let perfilesActualizados = 0;
        const students = users.filter(u => u.role === 'student');
        
        console.log('\n🔄 [SINCRONIZACIÓN] Actualizando TODOS los perfiles...');
        
        students.forEach(student => {
            // Buscar TODAS las asignaciones actuales del estudiante
            const asignacionesActuales = studentAssignments.filter(a => a.studentId === student.id);
            
            if (asignacionesActuales.length === 0) {
                // Sin asignaciones - limpiar perfil
                if (student.activeCourses && student.activeCourses.length > 0) {
                    student.activeCourses = [];
                    student.sectionName = null;
                    perfilesActualizados++;
                    console.log(`🧹 LIMPIADO: ${student.displayName || student.username}`);
                }
            } else {
                // Con asignaciones - actualizar perfil
                const nuevosActiveCourses = asignacionesActuales.map(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const section = sections.find(s => s.id === assignment.sectionId);
                    return `${course?.name || 'Curso'} - Sección ${section?.name || 'A'}`;
                });
                
                // Tomar la primera sección como sectionName
                const primeraSección = sections.find(s => s.id === asignacionesActuales[0].sectionId);
                const nuevoSectionName = primeraSección?.name || null;
                
                // Comparar con datos actuales del perfil
                const activeCursosActuales = JSON.stringify(student.activeCourses || []);
                const nuevosActiveCursosStr = JSON.stringify(nuevosActiveCourses);
                const sectionNameActual = student.sectionName;
                
                // Aplicar cambios si son diferentes
                if (activeCursosActuales !== nuevosActiveCursosStr || sectionNameActual !== nuevoSectionName) {
                    console.log(`\n🔄 ACTUALIZANDO PERFIL: ${student.displayName || student.username}`);
                    console.log(`   📋 Antes - activeCourses: ${activeCursosActuales}`);
                    console.log(`   📋 Después - activeCourses: ${nuevosActiveCursosStr}`);
                    console.log(`   📋 Antes - sectionName: "${sectionNameActual}"`);
                    console.log(`   📋 Después - sectionName: "${nuevoSectionName}"`);
                    
                    student.activeCourses = nuevosActiveCourses;
                    student.sectionName = nuevoSectionName;
                    perfilesActualizados++;
                } else {
                    console.log(`✅ SIN CAMBIOS: ${student.displayName || student.username} (ya está actualizado)`);
                }
            }
        });
        
        // Guardar cambios en localStorage
        if (perfilesActualizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-profile-last-update', new Date().toISOString());
            
            console.log(`\n💾 [GUARDADO] ${perfilesActualizados} perfiles actualizados`);
            
            // Disparar eventos específicos para perfiles
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-users',
                newValue: JSON.stringify(users),
                storageArea: localStorage
            }));
            
            // Eventos específicos para actualizar el perfil
            const eventosDeActualizacion = [
                'profile-updated',
                'users-synchronized',
                'student-profile-refresh',
                'force-profile-reload'
            ];
            
            eventosDeActualizacion.forEach(evento => {
                window.dispatchEvent(new CustomEvent(evento, {
                    detail: {
                        timestamp: Date.now(),
                        perfilesActualizados,
                        source: 'profile-force-update'
                    }
                }));
            });
            
            console.log(`🎯 [EVENTOS] ${eventosDeActualizacion.length} eventos de perfil disparados`);
            
        } else {
            console.log('\n✅ [OK] Todos los perfiles ya están actualizados');
        }
        
        return perfilesActualizados;
        
    } catch (error) {
        console.error('❌ Error actualizando perfiles:', error);
        return false;
    }
}

function mostrarEstadoActualPerfiles() {
    console.log('\n📋 [ESTADO ACTUAL] Perfiles después de actualización:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = users.filter(u => u.role === 'student');
    
    students.forEach(student => {
        console.log(`\n👤 ${student.displayName || student.username}:`);
        console.log(`   📚 Cursos activos: ${JSON.stringify(student.activeCourses || [])}`);
        console.log(`   📖 Sección: "${student.sectionName || 'Sin sección'}"`);
        console.log(`   🆔 ID: ${student.id}`);
    });
    
    // Mostrar específicamente Max
    const max = students.find(s => s.username === 'max' || s.displayName?.toLowerCase() === 'max');
    if (max) {
        console.log(`\n🎯 [ESPECÍFICO] Estado de Max:`);
        console.log(`   📚 activeCourses: ${JSON.stringify(max.activeCourses || [])}`);
        console.log(`   📖 sectionName: "${max.sectionName || 'null'}"`);
        console.log(`   💡 Debería aparecer como "5to Básico - Sección B" en el perfil`);
    }
}

function forzarRecargaPerfil() {
    console.log('\n🔄 [RECARGA] Forzando recarga del perfil...');
    
    // Navegar a perfil si no estamos ahí
    const perfilLink = document.querySelector('a[href*="perfil"], a[href*="profile"], [data-testid*="profile"]');
    if (perfilLink) {
        console.log('🔄 Navegando a perfil...');
        perfilLink.click();
    }
    
    // Disparar eventos en elementos específicos del perfil
    const profileElements = document.querySelectorAll('[class*="profile"], [class*="perfil"], [data-student-info]');
    profileElements.forEach(element => {
        element.dispatchEvent(new Event('refresh', { bubbles: true }));
        element.dispatchEvent(new Event('update', { bubbles: true }));
    });
    
    console.log(`✅ ${profileElements.length} elementos de perfil actualizados`);
    
    // Programar recarga completa si es necesario
    console.log('⏰ Programando recarga completa en 5 segundos...');
    setTimeout(() => {
        console.log('🔄 Recargando página para aplicar cambios de perfil...');
        window.location.reload();
    }, 5000);
}

// EJECUTAR ACTUALIZACIÓN INMEDIATA
console.log('🚀 INICIANDO ACTUALIZACIÓN INMEDIATA DE PERFILES...');

const cambiosDetectados = detectarCambiosRecientes();

if (cambiosDetectados) {
    const perfilesActualizados = actualizarPerfilInmediato();
    
    if (perfilesActualizados !== false) {
        console.log('\n✅ ACTUALIZACIÓN DE PERFILES COMPLETADA');
        
        // Mostrar estado actual
        mostrarEstadoActualPerfiles();
        
        // Forzar recarga del perfil
        forzarRecargaPerfil();
        
        console.log('\n💡 [RESULTADO ESPERADO]:');
        console.log('   • Max debería aparecer como "5to Básico - Sección B" en Gestión de Usuarios');
        console.log('   • El filtro de tareas debería mostrar solo Gustavo en Sección A y solo Max en Sección B');
        
    } else {
        console.log('\n❌ ERROR EN ACTUALIZACIÓN DE PERFILES');
    }
} else {
    console.log('\n❌ ERROR DETECTANDO CAMBIOS');
}

// Funciones disponibles
window.detectarCambiosRecientes = detectarCambiosRecientes;
window.actualizarPerfilInmediato = actualizarPerfilInmediato;
window.mostrarEstadoActualPerfiles = mostrarEstadoActualPerfiles;
window.forzarRecargaPerfil = forzarRecargaPerfil;

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • detectarCambiosRecientes() - Para detectar cambios');
console.log('   • actualizarPerfilInmediato() - Para forzar actualización');
console.log('   • mostrarEstadoActualPerfiles() - Para ver estado actual');
console.log('   • forzarRecargaPerfil() - Para recargar perfil');
