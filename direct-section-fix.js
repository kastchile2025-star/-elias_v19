/**
 * CORRECCIÓN ESPECÍFICA: Asignar estudiantes a sección a75b7e0e-1130-486a-ae5e-6f7233e002bf
 * Script directo que funciona con los datos existentes
 */

console.log('🎯 CORRECCIÓN DIRECTA: Asignando estudiantes a sección específica');
console.log('================================================================');

// Ejecutar corrección inmediatamente con datos reales
(function() {
    try {
        // Datos específicos de la sección que está seleccionada
        const sectionIdObjetivo = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
        const courseIdObjetivo = '0880d4ca-7232-42dc-abef-1223e00a5c6e';
        
        console.log(`🎯 OBJETIVO: Asignar estudiantes a sección ${sectionIdObjetivo}`);
        console.log(`📚 CURSO: ${courseIdObjetivo}`);
        
        // Cargar datos
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        console.log('\n📊 ESTADO ACTUAL:');
        console.log(`   • Usuarios totales: ${users.length}`);
        console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
        
        const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
        console.log(`   • Estudiantes: ${estudiantes.length}`);
        
        // Verificar estudiantes en la sección específica
        const estudiantesEnSeccionObjetivo = studentAssignments.filter(sa => 
            sa.sectionId === sectionIdObjetivo
        );
        
        console.log(`   • Estudiantes en sección objetivo: ${estudiantesEnSeccionObjetivo.length}`);
        
        if (estudiantesEnSeccionObjetivo.length > 0) {
            console.log('✅ Ya hay estudiantes en la sección objetivo');
            estudiantesEnSeccionObjetivo.forEach((sa, index) => {
                const estudiante = users.find(u => u.id === sa.studentId);
                console.log(`   ${index + 1}. ${estudiante?.username} (${estudiante?.displayName || estudiante?.name})`);
            });
            return true;
        }
        
        console.log('\n🔧 ASIGNANDO ESTUDIANTES A LA SECCIÓN OBJETIVO...');
        
        const ahoraValido = new Date().toISOString();
        let estudiantesAsignados = 0;
        
        // Asignar TODOS los estudiantes a la sección específica que necesitas
        estudiantes.forEach((estudiante, index) => {
            const tieneAsignacion = studentAssignments.find(sa => sa.studentId === estudiante.id);
            
            if (!tieneAsignacion) {
                // Crear nueva asignación para la sección específica
                const nuevaAsignacion = {
                    id: `sa-direct-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    studentId: estudiante.id,
                    courseId: courseIdObjetivo,
                    sectionId: sectionIdObjetivo,
                    createdAt: ahoraValido,
                    assignedAt: ahoraValido,
                    source: 'direct-section-fix'
                };
                
                studentAssignments.push(nuevaAsignacion);
                console.log(`   ✅ ${estudiante.username} asignado a sección objetivo`);
                estudiantesAsignados++;
            } else {
                // Si ya tiene asignación, verificar si es a la sección correcta
                const asignacion = tieneAsignacion;
                if (asignacion.sectionId !== sectionIdObjetivo) {
                    console.log(`   🔄 Moviendo ${estudiante.username} a sección objetivo`);
                    asignacion.courseId = courseIdObjetivo;
                    asignacion.sectionId = sectionIdObjetivo;
                    asignacion.updatedAt = ahoraValido;
                    estudiantesAsignados++;
                } else {
                    console.log(`   ℹ️ ${estudiante.username} ya está en sección objetivo`);
                }
            }
        });
        
        // Guardar cambios
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        
        console.log('\n🎉 ¡CORRECCIÓN COMPLETADA!');
        console.log('==========================');
        console.log(`✅ Estudiantes asignados/movidos: ${estudiantesAsignados}`);
        console.log(`📊 Total asignaciones: ${studentAssignments.length}`);
        
        // Verificar resultado
        const estudiantesEnSeccionFinal = studentAssignments.filter(sa => 
            sa.sectionId === sectionIdObjetivo
        );
        
        console.log(`\n🎯 VERIFICACIÓN FINAL:`);
        console.log(`   • Estudiantes en sección ${sectionIdObjetivo}: ${estudiantesEnSeccionFinal.length}`);
        
        if (estudiantesEnSeccionFinal.length > 0) {
            console.log('   ✅ ¡PERFECTO! Estudiantes asignados correctamente:');
            estudiantesEnSeccionFinal.forEach((sa, index) => {
                const estudiante = users.find(u => u.id === sa.studentId);
                console.log(`      ${index + 1}. ${estudiante?.username} (${estudiante?.displayName || estudiante?.name})`);
            });
        } else {
            console.log('   ❌ PROBLEMA: Aún no hay estudiantes en la sección');
        }
        
        console.log('\n🔄 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. 🔄 CIERRA el modal de "Crear Nueva Tarea"');
        console.log('2. 🔄 RECARGA LA PÁGINA (Ctrl+F5)');
        console.log('3. 📝 Ve a Tareas > Nueva Tarea');
        console.log('4. 🎯 Selecciona "5to Básico Sección A"');
        console.log('5. 📋 Elige "Estudiantes específicos"');
        console.log('6. ✅ Los estudiantes deberían aparecer ahora');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR durante la corrección:', error);
        return false;
    }
})();

console.log('\n🎯 CORRECCIÓN DIRECTA EJECUTADA');
console.log('===============================');
console.log('Este script asigna estudiantes directamente a la sección que necesitas.');
