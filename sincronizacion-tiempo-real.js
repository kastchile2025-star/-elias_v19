/**
 * 🔄 SINCRONIZACIÓN EN TIEMPO REAL
 * 
 * Este script fuerza la sincronización inmediata entre:
 * - Gestión de Usuarios (cambios en asignaciones)
 * - Pestaña Tareas (filtrado de estudiantes)
 */

console.log('🔄 SINCRONIZACIÓN EN TIEMPO REAL INICIADA...');

function sincronizarDatosCompleto() {
    console.log('\n⚡ [SINCRONIZACIÓN] Actualizando todos los datos...');
    
    try {
        // 1. Verificar estado actual
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log(`📊 Datos encontrados:`);
        console.log(`   • Asignaciones: ${studentAssignments.length}`);
        console.log(`   • Usuarios: ${users.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        
        // 2. Sincronizar datos de usuarios con asignaciones
        const students = users.filter(u => u.role === 'student');
        let cambiosRealizados = 0;
        
        console.log('\n🔄 [SYNC] Sincronizando datos de estudiantes...');
        
        students.forEach(student => {
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            
            if (assignmentsForStudent.length > 0) {
                // Actualizar activeCourses basado en asignaciones reales
                const newActiveCourses = assignmentsForStudent.map(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const section = sections.find(s => s.id === assignment.sectionId);
                    return `${course?.name || 'Curso'} - Sección ${section?.name || 'A'}`;
                });
                
                // Solo actualizar si hay cambios
                const currentCourses = JSON.stringify(student.activeCourses || []);
                const newCoursesStr = JSON.stringify(newActiveCourses);
                
                if (currentCourses !== newCoursesStr) {
                    student.activeCourses = newActiveCourses;
                    
                    // Actualizar sectionName con la primera sección encontrada
                    if (assignmentsForStudent.length > 0) {
                        const firstSection = sections.find(s => s.id === assignmentsForStudent[0].sectionId);
                        if (firstSection) {
                            student.sectionName = firstSection.name;
                        }
                    }
                    
                    cambiosRealizados++;
                    console.log(`✅ Sincronizado: ${student.displayName || student.username}`);
                    console.log(`   Antes: ${currentCourses}`);
                    console.log(`   Después: ${newCoursesStr}`);
                }
            } else {
                // Si no hay asignaciones, limpiar activeCourses
                if (student.activeCourses && student.activeCourses.length > 0) {
                    student.activeCourses = [];
                    student.sectionName = null;
                    cambiosRealizados++;
                    console.log(`🧹 Limpiado: ${student.displayName || student.username} (sin asignaciones)`);
                }
            }
        });
        
        // 3. Guardar cambios si los hubo
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            console.log(`\n💾 [GUARDADO] ${cambiosRealizados} cambios aplicados`);
        } else {
            console.log(`\n✅ [OK] Datos ya estaban sincronizados`);
        }
        
        // 4. Actualizar timestamp para forzar re-render
        localStorage.setItem('smart-student-last-sync', new Date().toISOString());
        
        // 5. Triggear eventos de storage para componentes React
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'smart-student-users',
            newValue: JSON.stringify(users),
            storageArea: localStorage
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'smart-student-student-assignments',
            newValue: JSON.stringify(studentAssignments),
            storageArea: localStorage
        }));
        
        console.log('\n🎯 [EVENTOS] Eventos de storage disparados para React');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return false;
    }
}

// Función para mostrar el estado después de sincronizar
function mostrarEstadoSincronizado() {
    console.log('\n📋 [ESTADO FINAL] Después de sincronización:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    const students = users.filter(u => u.role === 'student');
    
    // Agrupar por curso-sección
    const agrupados = {};
    
    studentAssignments.forEach(assignment => {
        const student = students.find(s => s.id === assignment.studentId);
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        
        if (student && course && section) {
            const key = `${course.name} - Sección ${section.name}`;
            if (!agrupados[key]) {
                agrupados[key] = [];
            }
            agrupados[key].push(student.displayName || student.username);
        }
    });
    
    if (Object.keys(agrupados).length === 0) {
        console.log('   ❌ No hay asignaciones encontradas');
        console.log('   💡 Verifica en "Gestión de Usuarios" → "Asignaciones"');
    } else {
        Object.keys(agrupados).forEach(grupo => {
            console.log(`\n📚 ${grupo}:`);
            agrupados[grupo].forEach(nombre => {
                console.log(`   • ${nombre}`);
            });
        });
    }
}

// Función para recargar componente React (si está disponible)
function recargarComponenteReact() {
    console.log('\n🔄 [REACT] Intentando recargar componente...');
    
    // Intentar triggear re-render forzado
    const event = new CustomEvent('force-refresh', {
        detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    // También intentar con eventos específicos del sistema
    const refreshEvent = new CustomEvent('smart-student-refresh', {
        detail: { 
            type: 'student-assignments',
            timestamp: Date.now()
        }
    });
    window.dispatchEvent(refreshEvent);
    
    console.log('   ✅ Eventos de recarga disparados');
    console.log('   💡 Si no se actualiza, prueba recargar la página (F5)');
}

// Ejecutar sincronización completa
console.log('🚀 Ejecutando sincronización...');
const exitoso = sincronizarDatosCompleto();

if (exitoso) {
    console.log('\n✅ SINCRONIZACIÓN COMPLETADA');
    
    // Mostrar estado final
    mostrarEstadoSincronizado();
    
    // Intentar recargar componente
    recargarComponenteReact();
    
    console.log('\n🎯 [SIGUIENTE PASO]:');
    console.log('   1. Ve a la pestaña "Tareas"');
    console.log('   2. Crea una nueva tarea o edita una existente');
    console.log('   3. Selecciona "Estudiantes específicos"');
    console.log('   4. Los estudiantes ahora deberían reflejar las asignaciones actuales');
    console.log('\n⚠️  Si aún no se actualiza:');
    console.log('   • Recarga la página (F5)');
    console.log('   • Verifica que las asignaciones están correctas en "Gestión de Usuarios"');
    
} else {
    console.log('\n❌ ERROR en sincronización');
    console.log('   Verifica que tengas datos válidos en localStorage');
}

// Hacer funciones disponibles globalmente
window.sincronizarDatosCompleto = sincronizarDatosCompleto;
window.mostrarEstadoSincronizado = mostrarEstadoSincronizado;
window.recargarComponenteReact = recargarComponenteReact;

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • sincronizarDatosCompleto() - Para sincronizar de nuevo');
console.log('   • mostrarEstadoSincronizado() - Para ver estado actual');
console.log('   • recargarComponenteReact() - Para forzar recarga de componente');
