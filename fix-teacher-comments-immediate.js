// 🔧 SOLUCIÓN INMEDIATA: Limpiar comentarios cruzados entre profesores
// Ejecutar este código en la consola del navegador (F12 → Console)

(function() {
  console.log("🚀 LIMPIEZA INMEDIATA DE COMENTARIOS CRUZADOS ENTRE PROFESORES");
  console.log("=" .repeat(70));
  
  // 1. Obtener datos
  const taskComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  
  console.log("📊 ESTADO INICIAL:");
  console.log(`   💬 Total comentarios: ${taskComments.length}`);
  console.log(`   👨‍🏫 Profesores: ${teachers.map(t => t.username).join(', ')}`);
  console.log(`   👩‍🎓 Estudiantes: ${students.map(s => s.username).join(', ')}`);
  console.log("");
  
  // 2. Identificar comentarios problemáticos
  console.log("🔍 IDENTIFICANDO COMENTARIOS PROBLEMÁTICOS...");
  
  let problematicComments = 0;
  let fixedComments = 0;
  let removedComments = 0;
  
  // Analizar cada comentario
  const cleanedComments = taskComments.filter(comment => {
    const authorUser = users.find(u => u.username === comment.studentUsername);
    
    // Si el autor es un profesor, esto es problemático
    if (authorUser && authorUser.role === 'teacher') {
      problematicComments++;
      console.log(`🚨 Comentario problemático encontrado:`);
      console.log(`   De: ${comment.studentUsername} (profesor)`);
      console.log(`   Tarea: ${comment.taskId}`);
      console.log(`   Comentario: ${comment.comment?.substring(0, 50)}...`);
      console.log(`   Leído por: ${comment.readBy ? comment.readBy.join(', ') : 'Nadie'}`);
      
      // OPCIÓN 1: Eliminar completamente (RECOMENDADO para comentarios entre profesores)
      console.log(`   🗑️ ELIMINANDO comentario cruzado entre profesores`);
      removedComments++;
      return false; // Eliminar este comentario
      
      // OPCIÓN 2: Intentar reasignar (descomentarizar si prefieres esta opción)
      /*
      // Buscar la tarea para ver a qué estudiantes pertenece
      const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
      const relatedTask = tasks.find(t => t.id === comment.taskId);
      
      if (relatedTask && relatedTask.assignedStudents && relatedTask.assignedStudents.length > 0) {
        // Reasignar a los estudiantes de la tarea
        console.log(`   🔧 Intentando reasignar a estudiantes: ${relatedTask.assignedStudents.join(', ')}`);
        
        // Crear comentarios separados para cada estudiante
        relatedTask.assignedStudents.forEach(studentUsername => {
          const student = users.find(u => u.username === studentUsername);
          if (student && student.role === 'student') {
            const fixedComment = {
              ...comment,
              id: `comment_fixed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              studentUsername: studentUsername,
              studentName: student.displayName || studentUsername,
              studentId: student.id,
              readBy: [] // Resetear lecturas
            };
            
            taskComments.push(fixedComment);
            fixedComments++;
            console.log(`     ✅ Comentario reasignado a: ${studentUsername}`);
          }
        });
      }
      
      removedComments++;
      return false; // Eliminar el comentario original problemático
      */
    }
    
    // Mantener comentarios válidos (de estudiantes)
    return true;
  });
  
  console.log("");
  console.log("📊 RESUMEN DE LIMPIEZA:");
  console.log(`   🚨 Comentarios problemáticos encontrados: ${problematicComments}`);
  console.log(`   🗑️ Comentarios eliminados: ${removedComments}`);
  console.log(`   🔧 Comentarios reasignados: ${fixedComments}`);
  console.log(`   📬 Comentarios finales: ${cleanedComments.length}`);
  console.log("");
  
  // 3. Guardar cambios
  if (removedComments > 0 || fixedComments > 0) {
    localStorage.setItem('smart-student-task-comments', JSON.stringify(cleanedComments));
    console.log("💾 CAMBIOS GUARDADOS");
    
    // 4. Actualizar interfaz
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('commentsUpdated'));
    document.dispatchEvent(new Event('commentsUpdated'));
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    
    console.log("🔄 EVENTOS DISPARADOS");
  }
  
  // 5. Verificación final
  console.log("");
  console.log("🔍 VERIFICACIÓN FINAL:");
  const finalComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const remainingTeacherComments = finalComments.filter(comment => {
    const author = users.find(u => u.username === comment.studentUsername);
    return author && author.role === 'teacher';
  });
  
  if (remainingTeacherComments.length === 0) {
    console.log("✅ ÉXITO: No quedan comentarios cruzados entre profesores");
    console.log("🔔 Los profesores ahora solo verán comentarios de sus estudiantes asignados");
  } else {
    console.log(`⚠️ ATENCIÓN: Aún quedan ${remainingTeacherComments.length} comentarios de profesores`);
  }
  
  console.log("");
  console.log("🎉 LIMPIEZA COMPLETADA");
  console.log("📱 Recarga las páginas de los profesores para ver los cambios");
  console.log("=" .repeat(70));
})();
