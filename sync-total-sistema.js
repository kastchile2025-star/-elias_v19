/**
 * 🔄 SINCRONIZACIÓN AUTOMÁTICA TOTAL DEL SISTEMA
 * 
 * Este script sincroniza TODOS los datos entre todas las pantallas:
 * - Gestión de Usuarios (perfil)
 * - Pestaña Tareas (filtros) 
 * - Todas las vistas del sistema
 */

console.log('🔄 SINCRONIZACIÓN AUTOMÁTICA TOTAL...');

function sincronizacionCompleta() {
    console.log('\n⚡ [SYNC TOTAL] Sincronizando todo el sistema...');
    
    try {
        // Cargar TODOS los datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
        
        console.log('📊 [DATOS CARGADOS]:');
        console.log(`   • Usuarios: ${users.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
        console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
        
        // PASO 1: Sincronizar TODOS los estudiantes
        console.log('\n🔄 [PASO 1] Sincronizando datos de TODOS los estudiantes...');
        
        const students = users.filter(u => u.role === 'student');
        let totalCambios = 0;
        
        students.forEach(student => {
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            
            if (assignmentsForStudent.length === 0) {
                // Sin asignaciones - limpiar datos
                if (student.activeCourses && student.activeCourses.length > 0) {
                    student.activeCourses = [];
                    student.sectionName = null;
                    totalCambios++;
                    console.log(`🧹 LIMPIADO: ${student.displayName || student.username} (sin asignaciones)`);
                }
            } else {
                // Con asignaciones - calcular datos correctos
                const correctActiveCourses = assignmentsForStudent.map(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const section = sections.find(s => s.id === assignment.sectionId);
                    return `${course?.name || 'Curso'} - Sección ${section?.name || 'A'}`;
                });
                
                // Calcular sectionName correcto (primera sección)
                let correctSectionName = null;
                if (assignmentsForStudent.length > 0) {
                    const firstSection = sections.find(s => s.id === assignmentsForStudent[0].sectionId);
                    correctSectionName = firstSection?.name || null;
                }
                
                // Verificar si necesita actualización
                const currentActiveCourses = JSON.stringify(student.activeCourses || []);
                const newActiveCourses = JSON.stringify(correctActiveCourses);
                const currentSectionName = student.sectionName;
                
                if (currentActiveCourses !== newActiveCourses || currentSectionName !== correctSectionName) {
                    student.activeCourses = correctActiveCourses;
                    student.sectionName = correctSectionName;
                    totalCambios++;
                    
                    console.log(`✅ ACTUALIZADO: ${student.displayName || student.username}`);
                    console.log(`   Cursos: ${currentActiveCourses} → ${newActiveCourses}`);
                    console.log(`   Sección: "${currentSectionName}" → "${correctSectionName}"`);
                }
            }
        });
        
        // PASO 2: Verificar estado específico de 5to Básico
        console.log('\n📚 [PASO 2] Verificando 5to Básico específicamente...');
        
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (quintoBasico) {
            const seccionesQuinto = sections.filter(s => s.courseId === quintoBasico.id);
            
            seccionesQuinto.forEach(seccion => {
                const estudiantesEnSeccion = studentAssignments
                    .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
                    .map(a => {
                        const student = users.find(u => u.id === a.studentId);
                        return student ? (student.displayName || student.username) : 'Desconocido';
                    });
                
                console.log(`   📖 Sección ${seccion.name}: ${estudiantesEnSeccion.join(', ') || 'Sin estudiantes'}`);
            });
        }
        
        // PASO 3: Guardar TODOS los cambios
        if (totalCambios > 0) {
            console.log(`\n💾 [PASO 3] Guardando ${totalCambios} cambios...`);
            
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-last-sync', new Date().toISOString());
            localStorage.setItem('smart-student-force-refresh', Date.now().toString());
            
            console.log('✅ Cambios guardados en localStorage');
        } else {
            console.log('\n✅ [PASO 3] No se necesitaron cambios');
        }
        
        // PASO 4: Disparar TODOS los eventos posibles
        console.log('\n🎯 [PASO 4] Disparando eventos para actualizar interfaz...');
        
        const allEvents = [
            // Eventos de storage
            { type: 'storage', key: 'smart-student-users', data: users },
            { type: 'storage', key: 'smart-student-student-assignments', data: studentAssignments },
            
            // Eventos custom
            'smart-student-refresh',
            'force-refresh',
            'student-assignments-updated',
            'profile-refresh',
            'users-updated',
            'data-sync-complete',
            'component-refresh'
        ];
        
        // Disparar eventos de storage
        allEvents.slice(0, 2).forEach(event => {
            window.dispatchEvent(new StorageEvent('storage', {
                key: event.key,
                newValue: JSON.stringify(event.data),
                storageArea: localStorage
            }));
        });
        
        // Disparar eventos custom
        allEvents.slice(2).forEach(eventName => {
            window.dispatchEvent(new CustomEvent(eventName, {
                detail: { 
                    timestamp: Date.now(),
                    source: 'total-sync',
                    changes: totalCambios
                }
            }));
        });
        
        console.log(`✅ ${allEvents.length} eventos disparados`);
        
        // PASO 5: Forzar actualización de componentes específicos
        console.log('\n🖥️ [PASO 5] Forzando actualización de componentes...');
        
        // Actualizar todos los elementos de formulario
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Clickear elementos de navegación para forzar re-render
        const navElements = document.querySelectorAll('[role="button"], button, a');
        navElements.forEach(element => {
            if (element.textContent.includes('Gestión') || element.textContent.includes('Tareas')) {
                element.dispatchEvent(new Event('focus', { bubbles: true }));
                element.dispatchEvent(new Event('blur', { bubbles: true }));
            }
        });
        
        console.log(`✅ ${formElements.length} elementos de formulario actualizados`);
        console.log(`✅ ${navElements.length} elementos de navegación actualizados`);
        
        return { success: true, changes: totalCambios };
        
    } catch (error) {
        console.error('❌ Error en sincronización total:', error);
        return { success: false, error };
    }
}

function verificarSincronizacion() {
    console.log('\n🔍 [VERIFICACIÓN] Estado final del sistema:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log('\n📋 [USUARIOS] Datos en perfil:');
    const students = users.filter(u => u.role === 'student');
    students.forEach(student => {
        console.log(`👤 ${student.displayName || student.username}:`);
        console.log(`   • activeCourses: ${JSON.stringify(student.activeCourses || [])}`);
        console.log(`   • sectionName: "${student.sectionName || 'null'}"`);
    });
    
    console.log('\n📋 [ASIGNACIONES] Datos en tabla:');
    const agrupados = {};
    studentAssignments.forEach(assignment => {
        const student = users.find(u => u.id === assignment.studentId);
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        
        if (student && course && section) {
            const key = `${course.name} - Sección ${section.name}`;
            if (!agrupados[key]) agrupados[key] = [];
            agrupados[key].push(student.displayName || student.username);
        }
    });
    
    Object.keys(agrupados).sort().forEach(grupo => {
        console.log(`📚 ${grupo}: ${agrupados[grupo].join(', ')}`);
    });
}

function forzarRecargaInterfaz() {
    console.log('\n🔄 [INTERFAZ] Forzando recarga de interfaz...');
    
    // Método 1: Recargar página después de 3 segundos
    console.log('⏰ Programando recarga automática en 3 segundos...');
    setTimeout(() => {
        console.log('🔄 Recargando página...');
        window.location.reload();
    }, 3000);
    
    // Método 2: Forzar eventos mientras tanto
    const elementos = document.querySelectorAll('*');
    let count = 0;
    elementos.forEach(el => {
        if (count < 50) { // Limitar para no sobrecargar
            el.dispatchEvent(new Event('refresh', { bubbles: true }));
            count++;
        }
    });
    
    console.log('✅ Eventos de recarga disparados');
    console.log('💡 La página se recargará automáticamente para aplicar todos los cambios');
}

// EJECUTAR SINCRONIZACIÓN COMPLETA
console.log('🚀 INICIANDO SINCRONIZACIÓN TOTAL...');

const resultado = sincronizacionCompleta();

if (resultado.success) {
    console.log('\n✅ SINCRONIZACIÓN TOTAL COMPLETADA');
    console.log(`📊 Total de cambios: ${resultado.changes}`);
    
    // Verificar estado final
    verificarSincronizacion();
    
    // Forzar recarga de interfaz
    forzarRecargaInterfaz();
    
} else {
    console.log('\n❌ ERROR EN SINCRONIZACIÓN TOTAL');
    console.error('Detalles:', resultado.error);
}

// Funciones disponibles
window.sincronizacionCompleta = sincronizacionCompleta;
window.verificarSincronizacion = verificarSincronizacion;
window.forzarRecargaInterfaz = forzarRecargaInterfaz;

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • sincronizacionCompleta() - Sincronizar todo el sistema');
console.log('   • verificarSincronizacion() - Verificar estado final');
console.log('   • forzarRecargaInterfaz() - Forzar recarga de interfaz');
