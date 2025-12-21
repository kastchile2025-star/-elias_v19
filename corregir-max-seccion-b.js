/**
 * 🔧 CORRECCIÓN ESPECÍFICA: MOVER MAX A SECCIÓN B
 * 
 * Script para corregir la asignación de Max de 5to Básico Sección A → Sección B
 */

console.log('🔧 CORRECCIÓN ESPECÍFICA - MOVIENDO MAX A SECCIÓN B...');

function corregirAsignacionMax() {
    console.log('\n⚡ [CORRECCIÓN] Moviendo Max de Sección A a Sección B...');
    
    try {
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        // Buscar 5to Básico
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (!quintoBasico) {
            console.log('❌ No se encontró 5to Básico');
            return false;
        }
        
        // Buscar secciones
        const seccionA = sections.find(s => s.courseId === quintoBasico.id && s.name === 'A');
        const seccionB = sections.find(s => s.courseId === quintoBasico.id && s.name === 'B');
        
        if (!seccionA || !seccionB) {
            console.log('❌ No se encontraron las secciones A y B');
            return false;
        }
        
        // Buscar Max
        const max = users.find(u => u.username === 'max' || u.displayName?.toLowerCase() === 'max');
        if (!max) {
            console.log('❌ No se encontró el usuario Max');
            return false;
        }
        
        console.log(`✅ Datos encontrados:`);
        console.log(`   • 5to Básico ID: ${quintoBasico.id}`);
        console.log(`   • Sección A ID: ${seccionA.id}`);
        console.log(`   • Sección B ID: ${seccionB.id}`);
        console.log(`   • Max ID: ${max.id}`);
        
        // Buscar asignación actual de Max
        const asignacionMaxIndex = studentAssignments.findIndex(a => 
            a.studentId === max.id && a.courseId === quintoBasico.id
        );
        
        if (asignacionMaxIndex === -1) {
            console.log('❌ No se encontró asignación de Max en 5to Básico');
            return false;
        }
        
        const asignacionMax = studentAssignments[asignacionMaxIndex];
        
        console.log(`\n📋 [ASIGNACIÓN ACTUAL] Max:`);
        console.log(`   • Curso: ${quintoBasico.name}`);
        console.log(`   • Sección actual: ${asignacionMax.sectionId === seccionA.id ? 'A' : 'B'}`);
        console.log(`   • ID asignación: ${asignacionMax.id}`);
        
        // CORRECCIÓN: Mover Max a Sección B
        if (asignacionMax.sectionId === seccionA.id) {
            console.log('\n🔄 [MOVIENDO] Max de Sección A → Sección B...');
            
            // Actualizar la asignación
            studentAssignments[asignacionMaxIndex].sectionId = seccionB.id;
            studentAssignments[asignacionMaxIndex].updatedAt = new Date().toISOString();
            studentAssignments[asignacionMaxIndex].updatedBy = 'manual-correction';
            
            console.log('✅ Asignación de Max actualizada en tabla student-assignments');
            
            // Actualizar datos en users
            const maxUserIndex = users.findIndex(u => u.id === max.id);
            if (maxUserIndex !== -1) {
                users[maxUserIndex].activeCourses = ['5to Básico - Sección B'];
                users[maxUserIndex].sectionName = 'B';
                console.log('✅ Datos de Max actualizados en users');
            }
            
        } else {
            console.log('✅ Max ya está en Sección B');
        }
        
        // Guardar cambios
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-last-sync', new Date().toISOString());
        
        console.log('\n💾 [GUARDADO] Cambios guardados en localStorage');
        
        // Disparar eventos
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'smart-student-student-assignments',
            newValue: JSON.stringify(studentAssignments),
            storageArea: localStorage
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'smart-student-users',
            newValue: JSON.stringify(users),
            storageArea: localStorage
        }));
        
        ['smart-student-refresh', 'force-refresh', 'assignment-corrected'].forEach(event => {
            window.dispatchEvent(new CustomEvent(event, {
                detail: { 
                    timestamp: Date.now(),
                    action: 'move-max-to-section-b',
                    studentId: max.id
                }
            }));
        });
        
        console.log('🎯 [EVENTOS] Eventos de actualización disparados');
        
        // Verificar resultado
        console.log('\n🎯 [VERIFICACIÓN] Estado después de la corrección:');
        
        const estudiantesSeccionA = studentAssignments
            .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccionA.id)
            .map(a => {
                const student = users.find(u => u.id === a.studentId);
                return student ? (student.displayName || student.username) : 'Desconocido';
            });
        
        const estudiantesSeccionB = studentAssignments
            .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccionB.id)
            .map(a => {
                const student = users.find(u => u.id === a.studentId);
                return student ? (student.displayName || student.username) : 'Desconocido';
            });
        
        console.log(`📖 Sección A: ${estudiantesSeccionA.join(', ') || 'Sin estudiantes'}`);
        console.log(`📖 Sección B: ${estudiantesSeccionB.join(', ') || 'Sin estudiantes'}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en corrección:', error);
        return false;
    }
}

function verificarEstadoFinal() {
    console.log('\n🔍 [VERIFICACIÓN FINAL] Estado de 5to Básico:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    const quintoBasico = courses.find(c => c.name === '5to Básico');
    const seccionesQuinto = sections.filter(s => s.courseId === quintoBasico?.id);
    
    seccionesQuinto.forEach(seccion => {
        const estudiantes = studentAssignments
            .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
            .map(a => {
                const student = users.find(u => u.id === a.studentId);
                return student ? (student.displayName || student.username) : 'Desconocido';
            });
        
        console.log(`📋 5to Básico - Sección ${seccion.name}:`);
        if (estudiantes.length === 0) {
            console.log('   📭 Sin estudiantes');
        } else {
            estudiantes.forEach(nombre => console.log(`   ☑️ ${nombre}`));
        }
    });
    
    console.log('\n🎯 [RESULTADO ESPERADO EN FILTRO]:');
    console.log('   • Al seleccionar "5to Básico Sección A" → Solo Gustavo');
    console.log('   • Al seleccionar "5to Básico Sección B" → Solo Max');
}

// EJECUTAR CORRECCIÓN
console.log('🚀 EJECUTANDO CORRECCIÓN DE MAX...');

const exitoso = corregirAsignacionMax();

if (exitoso) {
    console.log('\n✅ CORRECCIÓN COMPLETADA');
    
    // Verificar estado final
    verificarEstadoFinal();
    
    console.log('\n💡 [SIGUIENTE PASO]:');
    console.log('   1. Recarga la página (F5)');
    console.log('   2. Ve a "Crear Nueva Tarea"');
    console.log('   3. Selecciona "5to Básico Sección A" → Solo debería aparecer Gustavo');
    console.log('   4. Selecciona "5to Básico Sección B" → Solo debería aparecer Max');
    
} else {
    console.log('\n❌ ERROR EN CORRECCIÓN');
}

// Funciones disponibles
window.corregirAsignacionMax = corregirAsignacionMax;
window.verificarEstadoFinal = verificarEstadoFinal;

console.log('\n🛠️ [FUNCIONES]:');
console.log('   • corregirAsignacionMax() - Para ejecutar corrección de nuevo');
console.log('   • verificarEstadoFinal() - Para verificar estado final');
