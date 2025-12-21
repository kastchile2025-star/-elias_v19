// Script para migrar comentarios existentes y agregar studentUsername
console.log('🔄 [MIGRACIÓN] Actualizando comentarios existentes...');

function migrateComments() {
  try {
    const commentsData = localStorage.getItem('smart-student-task-comments');
    const usersData = localStorage.getItem('smart-student-users');
    
    if (!commentsData || !usersData) {
      console.log('❌ No se encontraron datos para migrar');
      return;
    }
    
    const comments = JSON.parse(commentsData);
    const users = JSON.parse(usersData);
    
    console.log(`📋 Migrando ${comments.length} comentarios...`);
    
    let migratedCount = 0;
    const updatedComments = comments.map(comment => {
      // Si ya tiene studentUsername, no hacer nada
      if (comment.studentUsername) {
        return comment;
      }
      
      // Buscar usuario por studentId para obtener username
      let studentUsername = '';
      
      if (comment.studentId) {
        const user = users.find(u => u.id === comment.studentId);
        if (user) {
          studentUsername = user.username;
        }
      }
      
      // Si no encontró por ID, intentar por studentName
      if (!studentUsername && comment.studentName) {
        const user = users.find(u => 
          u.displayName === comment.studentName || 
          u.username === comment.studentName
        );
        if (user) {
          studentUsername = user.username;
        }
      }
      
      // Si todavía no encontró, usar studentName como fallback
      if (!studentUsername) {
        studentUsername = comment.studentName || 'unknown';
      }
      
      migratedCount++;
      console.log(`✅ Migrado comentario ${comment.id}: ${comment.studentName} → ${studentUsername}`);
      
      return {
        ...comment,
        studentUsername: studentUsername,
        readBy: comment.readBy || [] // Agregar readBy si no existe
      };
    });
    
    // Guardar comentarios actualizados
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    
    console.log(`🎉 Migración completada: ${migratedCount} comentarios actualizados`);
    
    // Verificar si el comentario de arturo está ahora
    const arturoComment = updatedComments.find(c => 
      c.studentUsername === 'arturo' && 
      c.comment && c.comment.includes('dfsdfds')
    );
    
    if (arturoComment) {
      console.log('🎯 ¡Comentario de arturo encontrado después de migración!', arturoComment);
    } else {
      console.log('❌ Comentario de arturo aún no encontrado');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return false;
  }
}

// Ejecutar migración
if (typeof window !== 'undefined') {
  console.log('🌐 Ejecutando migración en navegador...');
  const success = migrateComments();
  
  if (success) {
    console.log('✅ Migración exitosa. Recarga la página para ver los cambios.');
    console.log('💡 O ejecuta: window.location.reload()');
  }
  
  // Hacer disponible globalmente
  window.migrateComments = migrateComments;
} else {
  console.log('🖥️ Para ejecutar en navegador, copia este código en la consola del DevTools');
}
