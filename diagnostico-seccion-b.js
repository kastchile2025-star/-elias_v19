/**
 * 🔍 DIAGNÓSTICO RÁPIDO - VERIFICAR SECCIÓN B
 * 
 * Script para verificar si Max aparece correctamente en Sección B
 */

console.log('🔍 DIAGNÓSTICO RÁPIDO - VERIFICANDO SECCIÓN B');

function verificarSeccionB() {
    console.log('\n📋 Verificando estado de Max en Sección B...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        // Encontrar 5to Básico
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (!quintoBasico) {
            console.error('❌ No se encontró curso "5to Básico"');
            return;
        }
        
        // Encontrar secciones
        const seccionA = sections.find(s => s.courseId === quintoBasico.id && s.name === 'A');
        const seccionB = sections.find(s => s.courseId === quintoBasico.id && s.name === 'B');
        
        console.log(`📚 Curso: ${quintoBasico.name} (ID: ${quintoBasico.id})`);
        console.log(`📖 Sección A: ${seccionA?.name} (ID: ${seccionA?.id})`);
        console.log(`📖 Sección B: ${seccionB?.name} (ID: ${seccionB?.id})`);
        
        // Encontrar estudiantes
        const gustavo = users.find(u => u.username === 'gustavo' || u.displayName?.toLowerCase() === 'gustavo');
        const max = users.find(u => u.username === 'max' || u.displayName?.toLowerCase() === 'max');
        
        if (gustavo && max) {
            console.log(`\n👤 Gustavo encontrado: ID ${gustavo.id}`);
            console.log(`👤 Max encontrado: ID ${max.id}`);
            
            // Verificar asignaciones actuales
            const asignacionGustavo = studentAssignments.find(a => 
                a.studentId === gustavo.id && a.courseId === quintoBasico.id
            );
            const asignacionMax = studentAssignments.find(a => 
                a.studentId === max.id && a.courseId === quintoBasico.id
            );
            
            console.log('\n📋 [ASIGNACIONES ACTUALES]:');
            if (asignacionGustavo) {
                const seccionGustavo = sections.find(s => s.id === asignacionGustavo.sectionId);
                console.log(`   • Gustavo → Sección ${seccionGustavo?.name} (ID: ${asignacionGustavo.sectionId})`);
            } else {
                console.log('   • Gustavo → Sin asignación ❌');
            }
            
            if (asignacionMax) {
                const seccionMax = sections.find(s => s.id === asignacionMax.sectionId);
                console.log(`   • Max → Sección ${seccionMax?.name} (ID: ${asignacionMax.sectionId})`);
            } else {
                console.log('   • Max → Sin asignación ❌');
            }
            
            // Verificar perfiles
            console.log('\n👤 [PERFILES ACTUALES]:');
            console.log(`   • Gustavo:`);
            console.log(`     - activeCourses: ${JSON.stringify(gustavo.activeCourses || [])}`);
            console.log(`     - sectionName: "${gustavo.sectionName || 'null'}"`);
            
            console.log(`   • Max:`);
            console.log(`     - activeCourses: ${JSON.stringify(max.activeCourses || [])}`);
            console.log(`     - sectionName: "${max.sectionName || 'null'}"`);
            
            // Análisis de problemas
            console.log('\n🔍 [ANÁLISIS]:');
            
            const gustavoEnA = asignacionGustavo?.sectionId === seccionA?.id;
            const maxEnB = asignacionMax?.sectionId === seccionB?.id;
            
            if (gustavoEnA && maxEnB) {
                console.log('✅ PERFECTO: Gustavo en Sección A, Max en Sección B');
                console.log('💡 El filtro debería funcionar correctamente');
            } else {
                console.log('❌ PROBLEMA DETECTADO:');
                if (!gustavoEnA) {
                    console.log(`   • Gustavo NO está en Sección A (está en ${sections.find(s => s.id === asignacionGustavo?.sectionId)?.name || 'ninguna'})`);
                }
                if (!maxEnB) {
                    console.log(`   • Max NO está en Sección B (está en ${sections.find(s => s.id === asignacionMax?.sectionId)?.name || 'ninguna'})`);
                }
            }
            
            // Simular filtrado
            console.log('\n🎯 [SIMULACIÓN DE FILTRADO]:');
            
            // Estudiantes para Sección A
            const estudiantesSeccionA = studentAssignments
                .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccionA?.id)
                .map(a => {
                    const student = users.find(u => u.id === a.studentId);
                    return student ? (student.displayName || student.username) : 'Desconocido';
                });
            
            // Estudiantes para Sección B
            const estudiantesSeccionB = studentAssignments
                .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccionB?.id)
                .map(a => {
                    const student = users.find(u => u.id === a.studentId);
                    return student ? (student.displayName || student.username) : 'Desconocido';
                });
            
            console.log(`   📖 Sección A debería mostrar: [${estudiantesSeccionA.join(', ') || 'Nadie'}]`);
            console.log(`   📖 Sección B debería mostrar: [${estudiantesSeccionB.join(', ') || 'Nadie'}]`);
            
        } else {
            console.error('❌ No se encontraron Gustavo o Max');
        }
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

// Ejecutar diagnóstico
verificarSeccionB();

// Función disponible
window.verificarSeccionB = verificarSeccionB;

console.log('\n🛠️ [FUNCIÓN DISPONIBLE]:');
console.log('   • verificarSeccionB() - Ejecutar diagnóstico nuevamente');
