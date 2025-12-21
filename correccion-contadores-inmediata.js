// 🎯 CORRECCIÓN INMEDIATA: Sincronización de Contadores
// Ejecutar para corregir la discrepancia entre la lógica y la UI

function corregirContadoresInmediato() {
  console.clear();
  console.log('🎯 CORRECCIÓN INMEDIATA: Sincronización de Contadores');
  console.log('='.repeat(55));
  
  try {
    // Obtener datos
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Identificar usuario actual (Felipe según los logs)
    const currentUser = users.find(u => u.username === 'felipe');
    if (!currentUser) {
      console.error('❌ Usuario felipe no encontrado');
      return;
    }
    
    console.log(`👤 Usuario actual: ${currentUser.username} (${currentUser.name})`);
    console.log(`📊 Total comentarios en sistema: ${comments.length}`);
    
    // Aplicar el mismo filtrado que en el sistema corregido
    const comentariosVisibles = comments.filter(comment => {
      // No mostrar comentarios propios
      if (comment.studentUsername === currentUser.username || comment.authorUsername === currentUser.username) {
        console.log(`🚫 Comentario propio filtrado: ${comment.authorUsername || comment.studentUsername}`);
        return false;
      }
      
      // No mostrar entregas
      if (comment.isSubmission) {
        console.log(`🚫 Entrega filtrada`);
        return false;
      }
      
      // No mostrar ya leídos
      if (comment.readBy?.includes(currentUser.username)) {
        console.log(`🚫 Comentario ya leído filtrado`);
        return false;
      }
      
      // Verificar tarea
      const task = tasks.find(t => t.id === comment.taskId);
      if (!task) {
        console.log(`🚫 Tarea no encontrada`);
        return false;
      }
      
      // Para tareas de curso, verificar asignación específica
      if (task.assignedTo === 'course') {
        // Según los logs, Felipe tiene acceso por "asignación específica"
        const taskCourseId = task.courseSectionId || task.course;
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const hasAssignment = studentAssignments.some(assignment => {
          if (assignment.studentId !== currentUser.id) return false;
          
          const course = courses.find(c => c.id === assignment.courseId);
          const section = sections.find(s => s.id === assignment.sectionId);
          const compositeId = `${course?.id}-${section?.id}`;
          
          return compositeId === taskCourseId || assignment.courseId === taskCourseId;
        });
        
        if (!hasAssignment) {
          console.log(`🚫 Sin asignación a curso ${taskCourseId}`);
          return false;
        }
        
        console.log(`✅ Comentario visible: por ${comment.authorUsername} en "${task.title}"`);
        return true;
      }
      
      console.log(`✅ Comentario visible (fallback)`);
      return true;
    });
    
    console.log(`\n📊 RESULTADO ESPERADO:`);
    console.log(`• Comentarios visibles para ${currentUser.username}: ${comentariosVisibles.length}`);
    console.log(`• La burbuja DEBERÍA mostrar: ${comentariosVisibles.length}`);
    
    // Mostrar detalles de comentarios visibles
    if (comentariosVisibles.length > 0) {
      console.log(`\n📋 COMENTARIOS QUE DEBERÍA VER ${currentUser.username}:`);
      comentariosVisibles.forEach((comment, index) => {
        const task = tasks.find(t => t.id === comment.taskId);
        console.log(`${index + 1}. "${comment.comment || comment.content}" por ${comment.authorUsername} en "${task?.title}"`);
      });
    }
    
    // Intentar actualizar la interfaz manualmente
    console.log(`\n🔄 FORZANDO ACTUALIZACIÓN DE INTERFAZ...`);
    
    // Buscar elementos de contador en el DOM
    const badges = document.querySelectorAll('[class*="badge"], [data-testid*="badge"]');
    const counters = document.querySelectorAll('[class*="count"], [data-testid*="count"]');
    
    console.log(`Encontrados ${badges.length} badges y ${counters.length} contadores`);
    
    // Actualizar cualquier elemento que muestre "4"
    [...badges, ...counters].forEach(element => {
      if (element.textContent === '4') {
        console.log(`🔄 Actualizando elemento que mostraba "4" a "${comentariosVisibles.length}"`);
        element.textContent = comentariosVisibles.length.toString();
        element.style.backgroundColor = comentariosVisibles.length > 0 ? '#ef4444' : '#6b7280';
      }
    });
    
    // Disparar eventos de actualización
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('notificationsUpdated', {
      detail: { 
        type: 'force_update',
        count: comentariosVisibles.length,
        userId: currentUser.id
      }
    }));
    
    console.log(`\n✅ CORRECCIÓN APLICADA`);
    console.log(`📌 Si la burbuja sigue mostrando "4", recarga la página`);
    
    return {
      usuarioActual: currentUser.username,
      comentariosEsperados: comentariosVisibles.length,
      comentariosEncontrados: comments.length
    };
    
  } catch (error) {
    console.error('❌ Error en corrección inmediata:', error);
    return null;
  }
}

// Auto-ejecutar
console.log('🎯 Script de corrección inmediata cargado');
console.log('▶️ Ejecutando corrección...');

corregirContadoresInmediato();
