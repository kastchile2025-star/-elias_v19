/**
 * 🎯 TEST DEL FILTRADO ACTUAL
 * 
 * Este script simula exactamente lo que debería mostrar cada filtro
 * y te ayuda a identificar si el problema está en el frontend
 */

console.log('🎯 TESTING FILTRADO ACTUAL...');

function testearFiltradoCompleto() {
    console.log('\n🔍 [TEST] Simulando filtrado de estudiantes por curso-sección...');
    
    try {
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log('\n📊 RESUMEN DE DATOS:');
        console.log(`   • Total estudiantes: ${students.length}`);
        console.log(`   • Total asignaciones: ${studentAssignments.length}`);
        
        // Test por cada combinación curso-sección
        const combinacionesTest = [
            { curso: '4to Básico', seccion: 'A' },
            { curso: '4to Básico', seccion: 'B' },
            { curso: '5to Básico', seccion: 'A' },
            { curso: '5to Básico', seccion: 'B' }
        ];
        
        console.log('\n🎯 [SIMULACIÓN] Testando cada filtro...');
        
        combinacionesTest.forEach(test => {
            console.log(`\n📋 TEST: ${test.curso} - Sección ${test.seccion}`);
            
            // Buscar curso y sección
            const course = courses.find(c => c.name === test.curso);
            const section = sections.find(s => 
                s.courseId === course?.id && s.name === test.seccion
            );
            
            if (!course) {
                console.log(`   ❌ Curso "${test.curso}" no encontrado`);
                return;
            }
            
            if (!section) {
                console.log(`   ❌ Sección "${test.seccion}" no encontrada para curso "${test.curso}"`);
                return;
            }
            
            // Buscar estudiantes asignados
            const estudiantesEncontrados = studentAssignments
                .filter(a => a.courseId === course.id && a.sectionId === section.id)
                .map(assignment => {
                    const student = students.find(s => s.id === assignment.studentId);
                    return student ? (student.displayName || student.username) : 'Estudiante desconocido';
                });
            
            if (estudiantesEncontrados.length === 0) {
                console.log(`   📭 Sin estudiantes asignados`);
            } else {
                console.log(`   ✅ Estudiantes encontrados (${estudiantesEncontrados.length}):`);
                estudiantesEncontrados.forEach(nombre => {
                    console.log(`      • ${nombre}`);
                });
            }
            
            // Verificar IDs para debugging
            console.log(`   🔍 Debug - Course ID: ${course.id}`);
            console.log(`   🔍 Debug - Section ID: ${section.id}`);
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en test de filtrado:', error);
        return false;
    }
}

// Función para verificar el comportamiento del frontend
function verificarComportamientoFrontend() {
    console.log('\n🖥️ [FRONTEND] Verificando comportamiento de la interfaz...');
    
    // Intentar encontrar elementos del DOM relacionados con el filtro
    const selectCurso = document.querySelector('select[name*="course"], select[name*="curso"]');
    const selectAsignar = document.querySelector('select[name*="assign"], select[name*="asignar"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    console.log(`   📋 Elementos encontrados:`);
    console.log(`      • Select de curso: ${selectCurso ? 'SÍ' : 'NO'}`);
    console.log(`      • Select de asignación: ${selectAsignar ? 'SÍ' : 'NO'}`);
    console.log(`      • Checkboxes de estudiantes: ${checkboxes.length}`);
    
    if (selectCurso) {
        console.log(`      • Valor actual del curso: "${selectCurso.value}"`);
    }
    
    if (selectAsignar) {
        console.log(`      • Valor actual de asignación: "${selectAsignar.value}"`);
    }
    
    if (checkboxes.length > 0) {
        console.log(`   👥 Estudiantes mostrados en checkboxes:`);
        checkboxes.forEach((checkbox, index) => {
            const label = checkbox.nextElementSibling || checkbox.previousElementSibling;
            const texto = label ? label.textContent.trim() : `Checkbox ${index + 1}`;
            console.log(`      • ${texto} (${checkbox.checked ? 'MARCADO' : 'NO MARCADO'})`);
        });
    }
}

// Función para forzar re-render del componente
function forzarReRenderCompleto() {
    console.log('\n🔄 [RE-RENDER] Forzando actualización completa...');
    
    // 1. Actualizar timestamp
    localStorage.setItem('smart-student-last-update', new Date().toISOString());
    
    // 2. Disparar múltiples eventos
    const eventos = [
        'storage',
        'smart-student-update',
        'force-refresh',
        'component-refresh'
    ];
    
    eventos.forEach(evento => {
        window.dispatchEvent(new CustomEvent(evento, {
            detail: { 
                source: 'sync-fix',
                timestamp: Date.now(),
                type: 'student-assignments'
            }
        }));
    });
    
    // 3. Si hay elementos de formulario, triggear cambios
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    console.log(`   ✅ ${eventos.length} eventos disparados`);
    console.log(`   ✅ ${selects.length} selects actualizados`);
    console.log('   💡 Si no se actualiza, recarga la página (F5)');
}

// Ejecutar tests
console.log('🚀 Ejecutando tests de filtrado...');
testearFiltradoCompleto();

console.log('\n🛠️ [FUNCIONES ADICIONALES]:');
console.log('   • verificarComportamientoFrontend() - Para revisar elementos DOM');
console.log('   • forzarReRenderCompleto() - Para forzar actualización de componentes');
console.log('   • testearFiltradoCompleto() - Para repetir test de filtrado');

// Hacer funciones disponibles
window.testearFiltradoCompleto = testearFiltradoCompleto;
window.verificarComportamientoFrontend = verificarComportamientoFrontend;
window.forzarReRenderCompleto = forzarReRenderCompleto;
