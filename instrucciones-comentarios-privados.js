/**
 * CORRECCIÓN: Comentarios Privados para Tareas de Estudiantes Específicos
 * 
 * PROBLEMA: Cuando un profesor crea una tarea para estudiantes específicos,
 * los comentarios son visibles para todos los estudiantes del curso.
 * 
 * SOLUCIÓN: Filtrar comentarios para que solo sean visibles entre:
 * - El profesor que asignó la tarea
 * - Los estudiantes específicos asignados a esa tarea
 */

console.log('🔧 CORRECCIÓN: Comentarios Privados para Estudiantes Específicos');
console.log('================================================================');

console.log('\n📋 PROBLEMA IDENTIFICADO:');
console.log('=========================');
console.log('• Profesor crea tarea para estudiantes específicos (ej: solo Felipe y María)');
console.log('• Profesor y Felipe escriben comentarios en esa tarea');
console.log('• Carlos (que NO está asignado) puede ver todos los comentarios');
console.log('• Los comentarios deberían ser privados solo entre profesor y estudiantes asignados');

console.log('\n🎯 OBJETIVO:');
console.log('============');
console.log('• Comentarios en tareas específicas solo visibles para:');
console.log('  - El profesor que asignó la tarea');
console.log('  - Los estudiantes específicos asignados');
console.log('• Comentarios en tareas de "todo el curso" siguen siendo públicos');

console.log('\n🔧 SOLUCIÓN - CÓDIGO A IMPLEMENTAR:');
console.log('===================================');

console.log('\n📁 ARCHIVO: /workspaces/superjf_v8/src/app/dashboard/tareas/page.tsx');

console.log('\n1️⃣ AGREGAR FUNCIÓN HELPER (línea ~1500, después de otras funciones helper):');
console.log(`
    // 🔧 NUEVA FUNCIÓN: Verificar si un estudiante está asignado a una tarea específica
    const isStudentAssignedToTask = (taskId: string, studentId: string, studentUsername: string): boolean => {
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return false;
      
      // Si la tarea está asignada a todo el curso
      if (task.assignedTo === 'course') {
        return true;
      }
      
      // Si la tarea está asignada a estudiantes específicos
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        return task.assignedStudentIds.includes(studentId);
      }
      
      // Compatibilidad con versiones anteriores
      if (task.assignedStudents && task.assignedStudents.includes(studentUsername)) {
        return true;
      }
      
      return false;
    };
`);

console.log('\n2️⃣ MODIFICAR FILTRO DE COMENTARIOS (línea ~4872-4886):');

console.log('\n🔴 CÓDIGO ACTUAL (PROBLEMÁTICO):');
console.log(`
    .filter(comment => {
        // PROFESOR: solo comentarios (no entregas)
        if (user?.role === 'teacher') return !comment.isSubmission;
        // ESTUDIANTE: solo su entrega y todos los comentarios
        if (user?.role === 'student') {
          if (comment.isSubmission) {
            return comment.studentId === user.id;
          }
          return true; // ← PROBLEMA: Muestra TODOS los comentarios
        }
        // Otros roles: solo comentarios
        return !comment.isSubmission;
    })
`);

console.log('\n🟢 CÓDIGO CORREGIDO (SOLUCIÓN):');
console.log(`
    .filter(comment => {
        // PROFESOR: solo comentarios (no entregas)
        if (user?.role === 'teacher') return !comment.isSubmission;
        
        // ESTUDIANTE: aplicar filtros de privacidad
        if (user?.role === 'student') {
          // Para entregas: solo mostrar la propia
          if (comment.isSubmission) {
            return comment.studentId === user.id;
          }
          
          // Para comentarios: verificar si el estudiante está asignado a la tarea
          const isAssigned = isStudentAssignedToTask(comment.taskId, user.id, user.username);
          
          // Solo mostrar comentarios si el estudiante está asignado a la tarea
          return isAssigned;
        }
        
        // Otros roles: solo comentarios
        return !comment.isSubmission;
    })
`);

console.log('\n📝 PASOS PARA APLICAR:');
console.log('======================');
console.log('1. Abrir: /workspaces/superjf_v8/src/app/dashboard/tareas/page.tsx');
console.log('2. Buscar línea ~1500 y agregar la función helper');
console.log('3. Buscar línea ~4872-4886 y reemplazar el filtro');
console.log('4. Guardar archivo');
console.log('5. Recargar página para probar');

console.log('\n🧪 CASOS DE PRUEBA:');
console.log('===================');
console.log('Después de aplicar la corrección, probar estos escenarios:');
console.log('');
console.log('📋 ESCENARIO 1: Tarea específica (assignedTo: "student")');
console.log('  • Profesor crea tarea solo para Felipe y María');
console.log('  • Felipe debe ver todos los comentarios de esa tarea');
console.log('  • María debe ver todos los comentarios de esa tarea');
console.log('  • Carlos NO debe ver comentarios de esa tarea');
console.log('  • Profesor debe ver todos los comentarios');
console.log('');
console.log('📋 ESCENARIO 2: Tarea de curso (assignedTo: "course")');
console.log('  • Profesor crea tarea para todo el curso');
console.log('  • TODOS los estudiantes deben ver comentarios (sin cambios)');
console.log('  • Comportamiento actual se mantiene');

console.log('\n✅ BENEFICIOS DE LA CORRECCIÓN:');
console.log('==============================');
console.log('• 🔒 Privacidad: Comentarios privados entre profesor y estudiantes asignados');
console.log('• 🎯 Precisión: Solo estudiantes relevantes ven la discusión');
console.log('• 📚 Compatibilidad: Tareas de curso completo funcionan igual');
console.log('• 🚀 Escalabilidad: Funciona con cualquier cantidad de estudiantes específicos');

console.log('\n🔧 INSTRUCCIONES TÉCNICAS:');
console.log('==========================');
console.log('La función isStudentAssignedToTask verifica:');
console.log('1. Si task.assignedTo === "course" → Permite acceso (tarea pública)');
console.log('2. Si task.assignedTo === "student" → Verifica task.assignedStudentIds');
console.log('3. Incluye compatibilidad con task.assignedStudents (versiones anteriores)');
console.log('');
console.log('El filtro aplicado solo afecta a estudiantes:');
console.log('• Profesores siguen viendo todos los comentarios (excepto entregas)');
console.log('• Estudiantes solo ven comentarios de tareas donde están asignados');
console.log('• Entregas siguen siendo privadas (cada estudiante ve solo la suya)');

console.log('\n🎉 IMPLEMENTACIÓN COMPLETADA');
console.log('============================');
console.log('Sigue los pasos arriba para aplicar la corrección al código.');
