// 🌐 LIMPIEZA GLOBAL: Sincronizar limpieza entre todos los profesores
// Ejecutar este código en la consola del navegador de cualquier profesor

(function() {
  console.log("🌐 LIMPIEZA GLOBAL DE COMENTARIOS CRUZADOS");
  console.log("=" .repeat(70));
  
  // 1. Función de limpieza
  function cleanCrossTeacherComments() {
    const taskComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    console.log(`📊 Analizando ${taskComments.length} comentarios...`);
    
    let removedCount = 0;
    const cleanedComments = taskComments.filter(comment => {
      const authorUser = users.find(u => u.username === comment.studentUsername);
      
      // Si el autor es un profesor, eliminar
      if (authorUser && authorUser.role === 'teacher') {
        console.log(`🗑️ Eliminando comentario de profesor: ${comment.studentUsername}`);
        removedCount++;
        return false;
      }
      
      return true;
    });
    
    // Guardar solo si hubo cambios
    if (removedCount > 0) {
      localStorage.setItem('smart-student-task-comments', JSON.stringify(cleanedComments));
      
      // Disparar eventos de actualización
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('commentsUpdated'));
      window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
      
      console.log(`✅ Eliminados ${removedCount} comentarios problemáticos`);
      console.log(`📬 Comentarios restantes: ${cleanedComments.length}`);
      
      // Marcar como limpiado en este navegador
      localStorage.setItem('teacher-comments-cleaned', Date.now().toString());
      
      return true;
    } else {
      console.log("✅ No se encontraron comentarios problemáticos");
      return false;
    }
  }
  
  // 2. Ejecutar limpieza inicial
  console.log("🧹 Ejecutando limpieza inicial...");
  const wasCleanedNow = cleanCrossTeacherComments();
  
  // 3. Configurar sincronización automática
  console.log("🔄 Configurando sincronización automática...");
  
  // Listener para cambios en otros tabs/ventanas
  window.addEventListener('storage', function(e) {
    if (e.key === 'teacher-comments-cleaned' && e.newValue !== e.oldValue) {
      console.log("🔔 Detectado evento de limpieza desde otra ventana, sincronizando...");
      setTimeout(() => {
        cleanCrossTeacherComments();
      }, 500);
    }
  });
  
  // 4. Forzar limpieza periódica (cada 30 segundos por 5 minutos)
  let cleanupAttempts = 0;
  const maxAttempts = 10;
  
  const periodicCleanup = setInterval(() => {
    cleanupAttempts++;
    console.log(`🔄 Limpieza periódica #${cleanupAttempts}...`);
    
    const cleaned = cleanCrossTeacherComments();
    
    if (cleanupAttempts >= maxAttempts) {
      clearInterval(periodicCleanup);
      console.log("⏹️ Limpieza periódica completada");
    }
  }, 30000); // Cada 30 segundos
  
  // 5. Verificación final
  setTimeout(() => {
    console.log("");
    console.log("🔍 VERIFICACIÓN FINAL:");
    const finalComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    const teacherComments = finalComments.filter(comment => {
      const author = users.find(u => u.username === comment.studentUsername);
      return author && author.role === 'teacher';
    });
    
    if (teacherComments.length === 0) {
      console.log("🎉 ÉXITO: Sistema completamente limpio");
    } else {
      console.log(`⚠️ ATENCIÓN: Aún quedan ${teacherComments.length} comentarios problemáticos`);
    }
    
    console.log("=" .repeat(70));
  }, 2000);
  
  if (wasCleanedNow) {
    console.log("🚀 LIMPIEZA EJECUTADA - Recarga la página para ver cambios");
  } else {
    console.log("✅ SISTEMA YA LIMPIO");
  }
})();
