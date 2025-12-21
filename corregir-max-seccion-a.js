/**
 * 🔧 CORRECCIÓN: Mover Max a 5to Básico Sección A
 * 
 * Este script corrige la asignación de Max para que aparezca en Sección A
 * como muestra la interfaz de Gestión de Usuarios
 */

console.log('🔧 CORRECCIÓN: Moviendo Max a 5to Básico Sección A');

function corregirMaxSeccionA() {
    console.log('\n⚡ [CORRECCIÓN] Iniciando actualización de Max...');
    
    try {
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        // Buscar Max
        const max = users.find(u => u.role === 'student' && (u.displayName === 'max' || u.username === 'max'));
        if (!max) {
            console.log('❌ No se encontró el usuario Max');
            return { success: false, error: 'Usuario Max no encontrado' };
        }
        
        console.log(`👤 Max encontrado (ID: ${max.id})`);
        console.log(`   Datos actuales: activeCourses = ${JSON.stringify(max.activeCourses)}`);
        
        // Buscar 5to Básico y sus secciones
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        const seccionA = sections.find(s => s.courseId === quintoBasico.id && s.name === 'A');
        const seccionB = sections.find(s => s.courseId === quintoBasico.id && s.name === 'B');
        
        if (!quintoBasico || !seccionA || !seccionB) {
            console.log('❌ No se encontraron los cursos/secciones necesarios');
            return { success: false, error: 'Cursos o secciones no encontrados' };
        }
        
        console.log(`📖 5to Básico (ID: ${quintoBasico.id})`);
        console.log(`   📚 Sección A (ID: ${seccionA.id})`);
        console.log(`   📚 Sección B (ID: ${seccionB.id})`);
        
        // PASO 1: Actualizar perfil de usuario (activeCourses)
        console.log('\n🔄 [PASO 1] Actualizando perfil de Max...');
        
        max.activeCourses = ["5to Básico - Sección A"];
        max.sectionName = "A";
        
        console.log(`✅ Perfil actualizado: activeCourses = ${JSON.stringify(max.activeCourses)}`);
        
        // PASO 2: Actualizar asignaciones de estudiante
        console.log('\n🔄 [PASO 2] Actualizando asignaciones...');
        
        // Eliminar asignación a Sección B
        const asignacionB = studentAssignments.find(a => 
            a.studentId === max.id && 
            a.courseId === quintoBasico.id && 
            a.sectionId === seccionB.id
        );
        
        if (asignacionB) {
            const indexB = studentAssignments.indexOf(asignacionB);
            studentAssignments.splice(indexB, 1);
            console.log('🗑️ Eliminada asignación a Sección B');
        }
        
        // Agregar/verificar asignación a Sección A
        const asignacionA = studentAssignments.find(a => 
            a.studentId === max.id && 
            a.courseId === quintoBasico.id && 
            a.sectionId === seccionA.id
        );
        
        if (!asignacionA) {
            const nuevaAsignacion = {
                studentId: max.id,
                courseId: quintoBasico.id,
                sectionId: seccionA.id,
                assignedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            studentAssignments.push(nuevaAsignacion);
            console.log('✅ Creada nueva asignación a Sección A');
        } else {
            console.log('✅ Asignación a Sección A ya existe');
        }
        
        // PASO 3: Guardar cambios
        console.log('\n💾 [PASO 3] Guardando cambios...');
        
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        // Disparar eventos de actualización
        const eventos = [
            { key: 'smart-student-users', data: users },
            { key: 'smart-student-student-assignments', data: studentAssignments }
        ];
        
        eventos.forEach(evento => {
            window.dispatchEvent(new StorageEvent('storage', {
                key: evento.key,
                newValue: JSON.stringify(evento.data),
                storageArea: localStorage
            }));
        });
        
        // Eventos personalizados
        const eventosCustom = [
            'user-profile-updated',
            'student-assignments-updated',
            'max-moved-to-section-a',
            'force-refresh'
        ];
        
        eventosCustom.forEach(evento => {
            window.dispatchEvent(new CustomEvent(evento, {
                detail: {
                    timestamp: Date.now(),
                    studentId: max.id,
                    newSection: 'A',
                    course: '5to Básico'
                }
            }));
        });
        
        console.log(`✅ Cambios guardados y ${eventos.length + eventosCustom.length} eventos disparados`);
        
        // PASO 4: Verificar resultado
        console.log('\n🔍 [VERIFICACIÓN] Estado después de la corrección:');
        
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
        
        console.log(`📖 5to Básico Sección A: [${estudiantesSeccionA.join(', ')}]`);
        console.log(`📖 5to Básico Sección B: [${estudiantesSeccionB.join(', ')}]`);
        
        if (estudiantesSeccionA.includes('max')) {
            console.log('✅ ÉXITO: Max ahora está en Sección A');
        } else {
            console.log('❌ ERROR: Max no aparece en Sección A');
        }
        
        return { 
            success: true, 
            seccionA: estudiantesSeccionA,
            seccionB: estudiantesSeccionB
        };
        
    } catch (error) {
        console.error('❌ Error en corrección:', error);
        return { success: false, error };
    }
}

// Ejecutar corrección
console.log('🚀 EJECUTANDO CORRECCIÓN...');

const resultado = corregirMaxSeccionA();

if (resultado.success) {
    console.log('\n✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
    console.log(`📊 Resultado:`);
    console.log(`   • 5to Básico Sección A: ${resultado.seccionA.length} estudiantes`);
    console.log(`   • 5to Básico Sección B: ${resultado.seccionB.length} estudiantes`);
    
    console.log('\n💡 [PRÓXIMOS PASOS]:');
    console.log('   1. Ve al modo profesor → Tareas → Crear Nueva Tarea');
    console.log('   2. Selecciona "5to Básico Sección A"');
    console.log('   3. En "Asignar a" selecciona "Estudiantes específicos"');
    console.log('   4. Deberías ver TANTO Gustavo COMO Max');
    
} else {
    console.log('\n❌ ERROR EN CORRECCIÓN');
    console.error('Detalles:', resultado.error);
}

// Hacer función disponible
window.corregirMaxSeccionA = corregirMaxSeccionA;

console.log('\n🛠️ [FUNCIÓN DISPONIBLE]: corregirMaxSeccionA()');
