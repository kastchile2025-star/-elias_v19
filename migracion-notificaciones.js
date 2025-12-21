// 🔄 MIGRACIÓN AUTOMÁTICA - Copia y pega en la consola del navegador
console.log('🔄 [MIGRACIÓN] Actualizando comentarios para mostrar notificaciones...');

// Función de migración completa
function migrateCommentsForNotifications() {
  try {
    const commentsData = localStorage.getItem('smart-student-task-comments');
    const usersData = localStorage.getItem('smart-student-users');
    
    if (!commentsData) {
      console.log('❌ No hay comentarios para migrar');
      return false;
    }
    
    const comments = JSON.parse(commentsData);
    let users = [];
    
    if (usersData) {
      users = JSON.parse(usersData);
    }
    
    console.log(`📋 Migrando ${comments.length} comentarios...`);
    
    let migratedCount = 0;
    const updatedComments = comments.map(comment => {
      let needsUpdate = false;
      let updatedComment = { ...comment };
      
      // 1. Agregar studentUsername si no existe
      if (!comment.studentUsername) {
        let studentUsername = '';
        
        // Intentar buscar por ID
        if (comment.studentId && users.length > 0) {
          const user = users.find(u => u.id === comment.studentId);
          if (user) {
            studentUsername = user.username;
          }
        }
        
        // Si no encontró por ID, usar studentName
        if (!studentUsername && comment.studentName) {
          // Mapeo manual para casos conocidos
          const nameToUsername = {
            'Arturo': 'arturo',
            'Jose': 'jose',
            'Maria': 'maria',
            'Felipe': 'felipin'
          };
          
          studentUsername = nameToUsername[comment.studentName] || comment.studentName.toLowerCase();
        }
        
        // Fallback: usar studentName como está
        if (!studentUsername) {
          studentUsername = comment.studentName || 'unknown';
        }
        
        updatedComment.studentUsername = studentUsername;
        needsUpdate = true;
      }
      
      // 2. Agregar readBy si no existe
      if (!comment.readBy) {
        updatedComment.readBy = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        migratedCount++;
        console.log(`✅ Migrado: ${comment.studentName} → ${updatedComment.studentUsername}`);
      }
      
      return updatedComment;
    });
    
    // Guardar comentarios actualizados
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    
    console.log(`🎉 Migración completada: ${migratedCount} comentarios actualizados`);
    
    // Verificar comentarios de arturo
    const arturoComments = updatedComments.filter(c => 
      c.studentUsername === 'arturo' && !c.isSubmission
    );
    
    console.log(`🎯 Comentarios de arturo encontrados: ${arturoComments.length}`);
    arturoComments.forEach((c, i) => {
      console.log(`   ${i+1}. "${c.comment}" (Tarea: ${c.taskId}, Leído: ${c.readBy?.length || 0})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return false;
  }
}

// Ejecutar migración
const success = migrateCommentsForNotifications();

if (success) {
  console.log('✅ Migración exitosa. Recargando página...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
} else {
  console.log('❌ Migración falló');
}
