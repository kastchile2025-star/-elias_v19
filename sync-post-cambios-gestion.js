/**
 * 🔄 SINCRONIZACIÓN AUTOMÁTICA DESPUÉS DE CAMBIOS EN GESTIÓN DE USUARIOS
 * 
 * Este script detecta y sincroniza automáticamente los cambios hechos en:
 * - Gestión de Usuarios → Asignaciones de estudiantes
 * - Actualiza inmediatamente la pestaña Tareas
 */

console.log('🔄 SINCRONIZACIÓN AUTOMÁTICA POST-CAMBIOS...');

function sincronizarDespuesDeCambios() {
    console.log('\n⚡ [SYNC] Detectando y sincronizando cambios recientes...');
    
    try {
        // 1. Cargar datos actuales
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log('📊 [ESTADO ACTUAL] Antes de sincronización:');
        console.log(`   • Total estudiantes: ${students.length}`);
        console.log(`   • Total asignaciones: ${studentAssignments.length}`);
        
        // 2. Mostrar estado actual de 5to Básico (que mencionaste)
        console.log('\n📚 [5TO BÁSICO] Estado actual:');
        const quinto = courses.find(c => c.name === '5to Básico');
        if (quinto) {
            const seccionesQuinto = sections.filter(s => s.courseId === quinto.id);
            seccionesQuinto.forEach(seccion => {
                const estudiantesEnSeccion = studentAssignments
                    .filter(a => a.courseId === quinto.id && a.sectionId === seccion.id)
                    .map(a => {
                        const student = students.find(s => s.id === a.studentId);
                        return student ? (student.displayName || student.username) : 'Desconocido';
                    });
                
                console.log(`   📖 Sección ${seccion.name}: ${estudiantesEnSeccion.length} estudiantes`);
                estudiantesEnSeccion.forEach(nombre => {
                    console.log(`      • ${nombre}`);
                });
            });
        }
        
        // 3. Sincronizar datos de users con assignments (la clave del problema)
        let cambiosRealizados = 0;
        
        console.log('\n🔄 [SINCRONIZACIÓN] Actualizando datos de usuarios...');
        
        students.forEach(student => {
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            
            // Calcular nuevos activeCourses basado en asignaciones reales
            const newActiveCourses = assignmentsForStudent.map(assignment => {
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                return `${course?.name || 'Curso'} - Sección ${section?.name || 'A'}`;
            });
            
            // Actualizar sectionName con la primera sección
            let newSectionName = null;
            if (assignmentsForStudent.length > 0) {
                const firstSection = sections.find(s => s.id === assignmentsForStudent[0].sectionId);
                newSectionName = firstSection?.name || null;
            }
            
            // Comparar y actualizar si hay cambios
            const currentCourses = JSON.stringify(student.activeCourses || []);
            const newCoursesStr = JSON.stringify(newActiveCourses);
            const currentSection = student.sectionName;
            
            if (currentCourses !== newCoursesStr || currentSection !== newSectionName) {
                student.activeCourses = newActiveCourses;
                student.sectionName = newSectionName;
                
                cambiosRealizados++;
                console.log(`✅ ACTUALIZADO: ${student.displayName || student.username}`);
                console.log(`   Cursos: ${currentCourses} → ${newCoursesStr}`);
                console.log(`   Sección: "${currentSection}" → "${newSectionName}"`);
            }
        });
        
        // 4. Guardar cambios si los hubo
        if (cambiosRealizados > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            console.log(`\n💾 [GUARDADO] ${cambiosRealizados} estudiantes actualizados`);
        } else {
            console.log('\n✅ [OK] Los datos ya estaban sincronizados');
        }
        
        // 5. Actualizar timestamps y disparar eventos
        const timestamp = new Date().toISOString();
        localStorage.setItem('smart-student-last-sync', timestamp);
        localStorage.setItem('smart-student-last-modified', timestamp);
        
        // 6. Disparar eventos para React
        const storageEvent = new StorageEvent('storage', {
            key: 'smart-student-users',
            newValue: JSON.stringify(users),
            storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
        
        const customEvents = [
            'smart-student-refresh',
            'force-refresh',
            'component-update',
            'student-assignments-changed'
        ];
        
        customEvents.forEach(eventName => {
            window.dispatchEvent(new CustomEvent(eventName, {
                detail: { 
                    timestamp: Date.now(),
                    source: 'gestion-usuarios-sync',
                    changes: cambiosRealizados
                }
            }));
        });
        
        console.log(`\n🎯 [EVENTOS] ${customEvents.length} eventos de actualización disparados`);
        
        return { success: true, changes: cambiosRealizados };
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return { success: false, error };
    }
}

// Función para mostrar el estado final después de la sincronización
function mostrarEstadoFinalCompleto() {
    console.log('\n📋 [ESTADO FINAL] Después de sincronización:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    const students = users.filter(u => u.role === 'student');
    
    // Mostrar agrupación por curso-sección
    const agrupacion = {};
    
    studentAssignments.forEach(assignment => {
        const student = students.find(s => s.id === assignment.studentId);
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        
        if (student && course && section) {
            const key = `${course.name} - Sección ${section.name}`;
            if (!agrupacion[key]) {
                agrupacion[key] = [];
            }
            agrupacion[key].push(student.displayName || student.username);
        }
    });
    
    console.log('\n🎯 [DISTRIBUCIÓN ACTUALIZADA]:');
    Object.keys(agrupacion).sort().forEach(grupo => {
        console.log(`\n📚 ${grupo}:`);
        agrupacion[grupo].forEach(nombre => {
            console.log(`   • ${nombre}`);
        });
    });
    
    // Verificar datos específicos de usuarios
    console.log('\n👥 [DATOS EN USERS] Verificación:');
    students.forEach(student => {
        console.log(`\n👤 ${student.displayName || student.username}:`);
        console.log(`   • activeCourses: ${JSON.stringify(student.activeCourses || [])}`);
        console.log(`   • sectionName: "${student.sectionName || 'null'}"`);
    });
}

// Función para forzar actualización del componente React
function forzarActualizacionComponente() {
    console.log('\n🔄 [REACT] Forzando actualización de componente...');
    
    // Intentar múltiples métodos de actualización
    
    // 1. Eventos de formulario
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // 2. Clicks en elementos activos
    const activeElements = document.querySelectorAll('[data-course], [data-section]');
    activeElements.forEach(el => {
        el.dispatchEvent(new Event('click', { bubbles: true }));
    });
    
    // 3. Focus/blur para triggear validación
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));
    });
    
    console.log(`   ✅ ${selects.length} selects actualizados`);
    console.log(`   ✅ ${activeElements.length} elementos activos actualizados`);
    console.log(`   ✅ ${inputs.length} inputs refrescados`);
    
    console.log('\n💡 [SIGUIENTE PASO]:');
    console.log('   1. Ve a la pestaña "Tareas"');
    console.log('   2. Selecciona "5to Básico" en el curso');
    console.log('   3. Cambia entre secciones A y B');
    console.log('   4. En "Estudiantes específicos" ahora deberías ver solo los de esa sección');
    console.log('\n⚠️  Si aún no se actualiza, recarga la página (F5)');
}

// Ejecutar sincronización automática
console.log('🚀 Ejecutando sincronización automática...');
const resultado = sincronizarDespuesDeCambios();

if (resultado.success) {
    console.log('\n✅ SINCRONIZACIÓN COMPLETADA');
    console.log(`   📊 Cambios realizados: ${resultado.changes}`);
    
    // Mostrar estado final
    mostrarEstadoFinalCompleto();
    
    // Forzar actualización de componente
    forzarActualizacionComponente();
    
} else {
    console.log('\n❌ ERROR en sincronización');
    console.error('   Detalles:', resultado.error);
}

// Hacer funciones disponibles globalmente
window.sincronizarDespuesDeCambios = sincronizarDespuesDeCambios;
window.mostrarEstadoFinalCompleto = mostrarEstadoFinalCompleto;
window.forzarActualizacionComponente = forzarActualizacionComponente;

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • sincronizarDespuesDeCambios() - Para sincronizar de nuevo');
console.log('   • mostrarEstadoFinalCompleto() - Para ver distribución actual');
console.log('   • forzarActualizacionComponente() - Para actualizar React');
