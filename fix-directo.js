// 🎯 CORRECCIÓN DIRECTA - Ejecutar inmediatamente
console.log('🎯 === CORRECCIÓN DIRECTA ===');

// 1. Obtener datos actuales
const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

console.log(`📊 Datos actuales: ${usuarios.length} usuarios, ${tareas.length} tareas`);

// 2. Encontrar tarea problemática (la que no muestra estudiantes)
const tareaProblematica = tareas.find(t => t.course === '9077a79d-c290-45f9-b549-6e57df8828d2');

if (tareaProblematica) {
    console.log(`📝 Tarea encontrada: "${tareaProblematica.title}"`);
    
    // 3. Cambiar el curso de la tarea a un nombre simple
    const tareaCorregida = {
        ...tareaProblematica,
        course: 'ciencias_naturales_4to'
    };
    
    // 4. Actualizar la tarea en el array
    const tareasCorregidas = tareas.map(t => 
        t.id === tareaProblematica.id ? tareaCorregida : t
    );
    
    // 5. Asegurar que los estudiantes tengan este curso
    const usuariosCorregidos = usuarios.map(u => {
        if (u.role === 'student') {
            const cursosActuales = u.activeCourses || [];
            if (!cursosActuales.includes('ciencias_naturales_4to')) {
                return {
                    ...u,
                    activeCourses: [...cursosActuales, 'ciencias_naturales_4to']
                };
            }
        }
        return u;
    });
    
    // 6. Guardar cambios
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareasCorregidas));
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosCorregidos));
    
    console.log('✅ CORRECCIÓN APLICADA:');
    console.log('   📝 Tarea actualizada con curso: ciencias_naturales_4to');
    console.log('   👨‍🎓 Estudiantes actualizados con el nuevo curso');
    
    // 7. Verificar resultado
    const estudiantesEncontrados = usuariosCorregidos.filter(u => 
        u.role === 'student' && u.activeCourses?.includes('ciencias_naturales_4to')
    );
    
    console.log(`🎉 RESULTADO: ${estudiantesEncontrados.length} estudiantes ahora en el curso`);
    
    // 8. Forzar actualización
    window.dispatchEvent(new Event('storage'));
    
    console.log('🔄 Cierra el modal de tarea y ábrelo de nuevo');
    
} else {
    console.log('❌ No se encontró la tarea problemática');
}

// 9. Cerrar modal actual si está abierto
const modal = document.querySelector('[role="dialog"]');
if (modal) {
    const closeBtn = modal.querySelector('button');
    if (closeBtn) {
        closeBtn.click();
        console.log('✅ Modal cerrado automáticamente');
    }
}
