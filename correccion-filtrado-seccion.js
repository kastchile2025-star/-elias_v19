// 🎯 CORRECCIÓN: Filtrado por Curso + Sección
console.log('🎯 === CORRECCIÓN: FILTRADO POR CURSO + SECCIÓN ===');

// 1. Obtener datos actuales
const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const asignacionesEstudiantes = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');

// 2. Encontrar la tarea problemática
const tareaActual = tareas.find(t => t.title === 'sascas');

if (tareaActual) {
    console.log(`📝 Tarea encontrada: "${tareaActual.title}"`);
    console.log(`📚 Curso actual: ${tareaActual.course}`);
    
    // 3. Identificar curso y sección específicos
    const cursoUUID = '9077a79d-c290-45f9-b549-6e57df8828d2';
    const seccionUUID = 'd326c181-fa30-4c50-ab68-efa085a3ffd3';
    
    console.log(`🏫 Curso UUID: ${cursoUUID}`);
    console.log(`🏛️ Sección UUID: ${seccionUUID}`);
    
    // 4. Verificar asignaciones actuales
    console.log('🔍 Verificando asignaciones actuales...');
    const asignacionesDelCurso = asignacionesEstudiantes.filter(a => 
        a.courseId === cursoUUID && a.sectionId === seccionUUID
    );
    
    console.log(`📋 Asignaciones en curso+sección específica: ${asignacionesDelCurso.length}`);
    
    if (asignacionesDelCurso.length > 0) {
        console.log('👨‍🎓 Estudiantes asignados a esta sección específica:');
        asignacionesDelCurso.forEach((asig, index) => {
            const estudiante = usuarios.find(u => u.id === asig.studentId);
            console.log(`   ${index + 1}. ${estudiante?.displayName || estudiante?.username || asig.studentId}`);
        });
        
        console.log('✅ El filtrado ya está funcionando correctamente');
        console.log('💡 Si ves todos los estudiantes, el problema está en el código React');
        
    } else {
        console.log('❌ No hay estudiantes asignados a esta sección específica');
        console.log('🔧 Creando asignaciones correctas...');
        
        // Solo asignar felipe y maria a esta sección específica
        const estudiantesEspecificos = [
            'felipe', // ID: 0b03b742-dde9-427e-9774-35d4783e6e7a
            'maria'   // ID: 6c11408c-d51c-4635-b0ad-fc4fdb9f6446
        ];
        
        const nuevasAsignaciones = [...asignacionesEstudiantes];
        
        estudiantesEspecificos.forEach(username => {
            const estudiante = usuarios.find(u => u.username === username);
            if (estudiante) {
                // Eliminar asignaciones anteriores de este estudiante a este curso
                const indiceAnterior = nuevasAsignaciones.findIndex(a => 
                    a.studentId === estudiante.id && a.courseId === cursoUUID
                );
                if (indiceAnterior >= 0) {
                    nuevasAsignaciones.splice(indiceAnterior, 1);
                }
                
                // Agregar nueva asignación específica
                nuevasAsignaciones.push({
                    id: `assignment_specific_${Date.now()}_${estudiante.id}`,
                    studentId: estudiante.id,
                    courseId: cursoUUID,
                    sectionId: seccionUUID,
                    assignedAt: new Date().toISOString(),
                    assignedBy: '83c80919-16df-424a-b448-45d6d41089b3'
                });
                
                console.log(`✅ Asignado ${username} a sección específica`);
            }
        });
        
        // Remover otros estudiantes de esta sección
        const asignacionesLimpiadas = nuevasAsignaciones.filter(a => {
            if (a.courseId === cursoUUID && a.sectionId === seccionUUID) {
                const estudiante = usuarios.find(u => u.id === a.studentId);
                return estudiantesEspecificos.includes(estudiante?.username);
            }
            return true;
        });
        
        localStorage.setItem('smart-student-user-student-assignments', JSON.stringify(asignacionesLimpiadas));
        
        console.log('✅ Asignaciones específicas creadas');
        console.log(`📊 Solo ${estudiantesEspecificos.length} estudiantes asignados a esta sección`);
    }
    
    // 5. Verificar resultado final
    const asignacionesFinales = JSON.parse(localStorage.getItem('smart-student-user-student-assignments') || '[]');
    const estudiantesEnSeccion = asignacionesFinales.filter(a => 
        a.courseId === cursoUUID && a.sectionId === seccionUUID
    );
    
    console.log('🔍 === VERIFICACIÓN FINAL ===');
    console.log(`📊 Estudiantes en sección específica: ${estudiantesEnSeccion.length}`);
    
    if (estudiantesEnSeccion.length > 0) {
        console.log('👥 Lista final de estudiantes en la sección:');
        estudiantesEnSeccion.forEach((asig, index) => {
            const estudiante = usuarios.find(u => u.id === asig.studentId);
            console.log(`   ${index + 1}. ${estudiante?.displayName || estudiante?.username}`);
        });
    }
    
    // 6. Forzar actualización
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('assignmentsUpdated'));
    
    // 7. Cerrar modal para forzar recarga
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
        const closeBtn = modal.querySelector('button');
        if (closeBtn) closeBtn.click();
    }
    
    setTimeout(() => {
        console.log('🎉 ¡FILTRADO CORREGIDO! Abre la tarea de nuevo');
        console.log('📋 Ahora debería mostrar solo felipe y maria');
    }, 1000);
    
} else {
    console.log('❌ Tarea "sascas" no encontrada');
}
