/**
 * 🔧 FIX DIRECTO PARA ESTUDIANTES ESPECÍFICOS
 * Script optimizado para solucionar el problema de sincronización inmediatamente
 */

console.log('🔧 EJECUTANDO FIX DIRECTO PARA ESTUDIANTES ESPECÍFICOS...');

function fixEstudiantesEspecificos() {
    console.log('\n⚡ [FIX DIRECTO] Sincronizando datos...');
    
    try {
        // Cargar todos los datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        console.log('📊 Datos cargados:');
        console.log(`   • Usuarios: ${users.length}`);
        console.log(`   • Asignaciones: ${studentAssignments.length}`);
        
        // Analizar 5to Básico específicamente
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (!quintoBasico) {
            console.log('❌ No se encontró 5to Básico');
            return false;
        }
        
        const seccionesQuinto = sections.filter(s => s.courseId === quintoBasico.id);
        
        console.log('\n📚 [ESTADO ACTUAL] 5to Básico:');
        seccionesQuinto.forEach(seccion => {
            const estudiantesAsignados = studentAssignments
                .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
                .map(a => {
                    const student = users.find(u => u.id === a.studentId);
                    return student ? (student.displayName || student.username) : 'Desconocido';
                });
            
            console.log(`   📖 Sección ${seccion.name}: ${estudiantesAsignados.join(', ') || 'Sin estudiantes'}`);
        });
        
        // SINCRONIZACIÓN FORZADA
        console.log('\n🔄 [SINCRONIZACIÓN] Actualizando datos de usuarios...');
        
        let cambios = 0;
        const students = users.filter(u => u.role === 'student');
        
        students.forEach(student => {
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            
            // Calcular activeCourses correcto
            const correctActiveCourses = assignmentsForStudent.map(assignment => {
                const course = courses.find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                return `${course?.name || 'Curso'} - Sección ${section?.name || 'A'}`;
            });
            
            // Calcular sectionName correcto
            let correctSectionName = null;
            if (assignmentsForStudent.length > 0) {
                const firstSection = sections.find(s => s.id === assignmentsForStudent[0].sectionId);
                correctSectionName = firstSection?.name || null;
            }
            
            // Aplicar cambios si es necesario
            const currentActiveCourses = JSON.stringify(student.activeCourses || []);
            const newActiveCourses = JSON.stringify(correctActiveCourses);
            
            if (currentActiveCourses !== newActiveCourses || student.sectionName !== correctSectionName) {
                student.activeCourses = correctActiveCourses;
                student.sectionName = correctSectionName;
                cambios++;
                
                console.log(`✅ ACTUALIZADO: ${student.displayName || student.username}`);
                console.log(`   Antes: ${currentActiveCourses}`);
                console.log(`   Después: ${newActiveCourses}`);
                console.log(`   Sección: "${student.sectionName}" → "${correctSectionName}"`);
            }
        });
        
        // Guardar cambios
        if (cambios > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            localStorage.setItem('smart-student-last-sync', new Date().toISOString());
            
            console.log(`\n💾 [GUARDADO] ${cambios} estudiantes actualizados`);
            
            // Disparar eventos para React
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-users',
                newValue: JSON.stringify(users),
                storageArea: localStorage
            }));
            
            // Eventos adicionales
            ['smart-student-refresh', 'force-refresh', 'student-assignments-updated'].forEach(event => {
                window.dispatchEvent(new CustomEvent(event, {
                    detail: { timestamp: Date.now(), changes: cambios }
                }));
            });
            
            console.log('🎯 [EVENTOS] Eventos de actualización disparados');
        } else {
            console.log('\n✅ [OK] No se necesitaron cambios');
        }
        
        // Mostrar estado final
        console.log('\n🎯 [RESULTADO FINAL] Lo que debería mostrar ahora:');
        seccionesQuinto.forEach(seccion => {
            const estudiantesEsperados = studentAssignments
                .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
                .map(a => {
                    const student = users.find(u => u.id === a.studentId);
                    return student ? (student.displayName || student.username) : 'Desconocido';
                });
            
            console.log(`📋 5to Básico - Sección ${seccion.name}:`);
            if (estudiantesEsperados.length === 0) {
                console.log('   📭 Sin estudiantes');
            } else {
                estudiantesEsperados.forEach(nombre => {
                    console.log(`   ☑️ ${nombre}`);
                });
            }
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en fix directo:', error);
        return false;
    }
}

function actualizarFormulario() {
    console.log('\n🖥️ [FORMULARIO] Actualizando interfaz...');
    
    // Buscar todos los selects y dispara eventos
    const selects = document.querySelectorAll('select');
    console.log(`   📋 Encontrados ${selects.length} selects`);
    
    selects.forEach((select, index) => {
        const valorActual = select.value;
        console.log(`   🔄 Actualizando select ${index + 1}: "${valorActual}"`);
        
        // Disparar múltiples eventos
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Re-establecer valor después de un momento
        setTimeout(() => {
            if (valorActual) {
                select.value = valorActual;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, 200);
    });
    
    // Actualizar checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`   ☑️ Encontrados ${checkboxes.length} checkboxes`);
    
    console.log('\n💡 [PRÓXIMOS PASOS]:');
    console.log('   1. Cambia el curso a otro y vuelve a "5to Básico Sección A"');
    console.log('   2. Verifica que solo aparezca Gustavo en "Estudiantes específicos"');
    console.log('   3. Cambia a "5to Básico Sección B"');
    console.log('   4. Verifica que solo aparezca Max en "Estudiantes específicos"');
    console.log('   5. Si no funciona, recarga la página (F5)');
}

// EJECUTAR FIX COMPLETO
console.log('🚀 INICIANDO FIX COMPLETO...');

const exito = fixEstudiantesEspecificos();

if (exito) {
    console.log('\n✅ FIX COMPLETADO EXITOSAMENTE');
    
    // Esperar un momento y actualizar formulario
    setTimeout(() => {
        actualizarFormulario();
    }, 500);
    
} else {
    console.log('\n❌ ERROR EN EL FIX');
}

// Funciones disponibles
window.fixEstudiantesEspecificos = fixEstudiantesEspecificos;
window.actualizarFormulario = actualizarFormulario;

console.log('\n🛠️ [FUNCIONES]:');
console.log('   • fixEstudiantesEspecificos() - Para ejecutar fix de nuevo');
console.log('   • actualizarFormulario() - Para actualizar interfaz');
