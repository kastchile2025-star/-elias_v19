// 🔍 DEBUG: Verificar carga de comentarios no leídos en panel de notificaciones
// Ejecutar en consola del navegador mientras estás logueado como estudiante

function debugUnreadCommentsPanel() {
  console.clear();
  console.log('🔍 DEBUG: Carga de Comentarios No Leídos en Panel');
  console.log('='.repeat(55));
  
  try {
    // Obtener datos del localStorage
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    console.log('📊 DATOS DISPONIBLES:');
    console.log(`• Comentarios: ${comments.length}`);
    console.log(`• Tareas: ${tasks.length}`);
    console.log(`• Usuarios: ${users.length}`);
    console.log(`• Asignaciones: ${studentAssignments.length}`);
    console.log();
    
    // Identificar usuario actual (simulamos Felipe)
    const currentUsername = 'felipe'; // Cambiar por el estudiante logueado
    const currentUser = users.find(u => u.username === currentUsername && u.role === 'student');
    
    if (!currentUser) {
      console.error(`❌ Usuario ${currentUsername} no encontrado`);
      return;
    }
    
    console.log(`👤 USUARIO ACTUAL: ${currentUser.name} (${currentUser.username})`);
    console.log(`🆔 ID: ${currentUser.id}`);
    console.log();
    
    // Replicar exactamente la lógica de loadUnreadComments
    console.log('🔄 SIMULANDO loadUnreadComments():');
    console.log('-'.repeat(40));
    
    const unread = comments.filter(comment => {
      console.log(`\n📝 Procesando comentario ID: ${comment.id}`);
      console.log(`   Por: ${comment.authorUsername || comment.studentUsername} (${comment.authorRole || 'rol desconocido'})`);
      console.log(`   Contenido: "${comment.comment}"`);
      
      // No mostrar comentarios propios
      if (comment.studentUsername === currentUser.username || comment.authorUsername === currentUser.username) {
        console.log(`   🚫 FILTRADO: Comentario propio`);
        return false;
      }
      
      // No mostrar entregas de otros estudiantes
      if (comment.isSubmission) {
        console.log(`   🚫 FILTRADO: Es una entrega`);
        return false;
      }
      
      // Verificar si ya fue leído
      if (comment.readBy?.includes(currentUser.username)) {
        console.log(`   🚫 FILTRADO: Ya leído por ${currentUser.username}`);
        return false;
      }
      
      // Verificar tarea asociada
      const task = tasks.find(t => t.id === comment.taskId);
      if (!task) {
        console.log(`   🚫 FILTRADO: Tarea no encontrada (${comment.taskId})`);
        return false;
      }
      
      console.log(`   📋 Tarea: "${task.title}" (assignedTo: ${task.assignedTo})`);
      
      // Si es una tarea asignada a estudiantes específicos
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        const isAssigned = task.assignedStudentIds.includes(currentUser.id);
        console.log(`   ${isAssigned ? '✅' : '🚫'} Tarea específica: ${isAssigned ? 'Asignado' : 'NO asignado'}`);
        return isAssigned;
      }
      
      // Para tareas de curso completo
      if (task.assignedTo === 'course') {
        const taskCourseId = task.courseSectionId || task.course;
        console.log(`   🏫 Tarea de curso: ${taskCourseId}`);
        
        // Verificar asignación usando student-assignments
        const hasAccess = studentAssignments.some(assignment => {
          if (assignment.studentId !== currentUser.id) return false;
          
          const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
          const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
          
          const course = courses.find(c => c.id === assignment.courseId);
          const section = sections.find(s => s.id === assignment.sectionId);
          const compositeId = `${course?.id}-${section?.id}`;
          
          const matches = compositeId === taskCourseId || assignment.courseId === taskCourseId;
          
          if (matches) {
            console.log(`   ✅ Match encontrado: ${compositeId} === ${taskCourseId}`);
          }
          
          return matches;
        });
        
        console.log(`   ${hasAccess ? '✅' : '🚫'} Acceso a tarea de curso: ${hasAccess ? 'SÍ' : 'NO'}`);
        return hasAccess;
      }
      
      console.log(`   🚫 FILTRADO: Tipo de tarea no manejado`);
      return false;
    });
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`Comentarios no leídos encontrados: ${unread.length}`);
    
    if (unread.length > 0) {
      console.log('\n📝 COMENTARIOS VISIBLES:');
      unread.forEach((comment, index) => {
        const task = tasks.find(t => t.id === comment.taskId);
        console.log(`${index + 1}. "${comment.comment}" por ${comment.authorUsername || comment.studentUsername}`);
        console.log(`   En tarea: "${task?.title}"`);
      });
    } else {
      console.log('\n❌ NO HAY COMENTARIOS VISIBLES');
      console.log('Posibles causas:');
      console.log('• Todos los comentarios son propios del usuario');
      console.log('• Todos los comentarios ya fueron leídos');
      console.log('• El usuario no tiene acceso a las tareas de los comentarios');
      console.log('• No hay comentarios en el sistema');
    }
    
    // Verificar estado actual del panel
    console.log('\n🖥️ ESTADO DEL PANEL DE NOTIFICACIONES:');
    const notificationPanel = document.querySelector('[data-radix-popper-content-wrapper]');
    if (notificationPanel) {
      const unreadSection = notificationPanel.querySelector('div:has(h3[class*="text-blue-800"]):has(> h3:contains("Comentarios No Leídos"))');
      console.log(`Panel encontrado: ${notificationPanel ? '✅' : '❌'}`);
      console.log(`Sección de comentarios no leídos: ${unreadSection ? '✅' : '❌'}`);
    } else {
      console.log('Panel de notificaciones no está abierto');
    }
    
    return {
      totalComments: comments.length,
      unreadComments: unread.length,
      currentUser: currentUser.username
    };
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return null;
  }
}

// Función para simular la carga de comentarios con un usuario específico
function simularCargaComentarios(username) {
  console.clear();
  console.log(`🎮 SIMULANDO CARGA PARA: ${username}`);
  console.log('='.repeat(40));
  
  try {
    // Simular el código exacto de notifications-panel.tsx
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const storedTasks = localStorage.getItem('smart-student-tasks');
    
    if (!storedComments || !storedTasks) {
      console.error('❌ No hay datos de comentarios o tareas');
      return;
    }
    
    const comments = JSON.parse(storedComments);
    const tasks = JSON.parse(storedTasks);
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const currentUser = users.find(u => u.username === username && u.role === 'student');
    
    if (!currentUser) {
      console.error(`❌ Usuario ${username} no encontrado`);
      return;
    }
    
    console.log(`Processing ${comments.length} comments for student ${currentUser.username}`);
    
    // Función helper para verificar asignación (copiada del código real)
    const checkStudentAssignmentToTask = (task, studentId, studentUsername) => {
      console.log(`🔍 Verificando acceso de ${studentUsername} a "${task.title}"`);
      
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        const isDirectlyAssigned = task.assignedStudentIds.includes(studentId);
        console.log(`🎯 Asignación directa: ${isDirectlyAssigned ? '✅' : '❌'}`);
        return isDirectlyAssigned;
      }
      
      if (task.assignedTo === 'course') {
        const taskCourseId = task.courseSectionId || task.course;
        
        if (!taskCourseId) {
          console.log(`⚠️ Tarea sin courseId`);
          return false;
        }
        
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const assignments = studentAssignments.filter(a => a.studentId === studentId);
        console.log(`   Estudiante tiene ${assignments.length} asignaciones`);
        
        // Obtener información de cursos disponibles
        const availableCourses = [];
        assignments.forEach(assignment => {
          const course = courses.find(c => c.id === assignment.courseId);
          const section = sections.find(s => s.id === assignment.sectionId);
          if (course && section) {
            availableCourses.push({
              id: `${course.id}-${section.id}`,
              courseId: course.id,
              sectionId: section.id,
              courseName: course.name,
              sectionName: section.name
            });
          }
        });
        
        console.log(`   Cursos disponibles:`, availableCourses);
        console.log(`   Buscando match con: ${taskCourseId}`);
        
        const isAssignedToTaskSection = availableCourses.some(courseData => {
          return courseData.id === taskCourseId || courseData.courseId === taskCourseId;
        });
        
        console.log(`   ${isAssignedToTaskSection ? '✅' : '❌'} Acceso a tarea de curso`);
        return isAssignedToTaskSection;
      }
      
      return false;
    };
    
    // Aplicar filtrado exacto del código real
    const unread = comments.filter(comment => {
      // No mostrar comentarios propios
      if (comment.studentUsername === currentUser.username || comment.authorUsername === currentUser.username) {
        return false;
      }
      
      // No mostrar entregas de otros estudiantes
      if (comment.isSubmission) {
        return false;
      }
      
      // Verificar si ya fue leído
      if (comment.readBy?.includes(currentUser.username)) {
        return false;
      }
      
      // Verificar tarea asociada
      const task = tasks.find(t => t.id === comment.taskId);
      if (!task) {
        console.log(`🚫 Tarea no encontrada para comentario: ${comment.taskId}`);
        return false;
      }
      
      console.log(`🔍 Procesando comentario en tarea "${task.title}" (assignedTo: ${task.assignedTo})`);
      console.log(`📝 Comentario por: ${comment.authorUsername || comment.studentUsername} (${comment.authorRole || 'student'})`);
      
      // Si es una tarea asignada a estudiantes específicos
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        if (!task.assignedStudentIds.includes(currentUser.id)) {
          console.log(`🚫 Estudiante ${currentUser.username} NO asignado a tarea específica "${task.title}"`);
          return false;
        }
        
        console.log(`✅ Estudiante ${currentUser.username} SÍ asignado a tarea específica "${task.title}"`);
        return true;
      }
      
      // Para tareas de curso completo, usar el filtro existente
      const isAssignedToTask = checkStudentAssignmentToTask(task, currentUser.id, currentUser.username);
      
      if (!isAssignedToTask) {
        console.log(`🚫 Estudiante ${currentUser.username} NO asignado a tarea de curso "${task.title}"`);
        return false;
      }
      
      console.log(`✅ Estudiante ${currentUser.username} SÍ asignado a tarea de curso "${task.title}"`);
      return true;
    }).map(comment => {
      const task = tasks.find(t => t.id === comment.taskId);
      return { ...comment, task };
    });
    
    console.log(`Found ${unread.length} unread comments for student ${currentUser.username} (after privacy filter)`);
    
    if (unread.length > 0) {
      console.log('\n📝 COMENTARIOS ENCONTRADOS:');
      unread.forEach((comment, index) => {
        console.log(`${index + 1}. "${comment.comment}" por ${comment.authorUsername || comment.studentUsername}`);
        console.log(`   En: "${comment.task.title}"`);
      });
    }
    
    return unread;
    
  } catch (error) {
    console.error('❌ Error en simulación:', error);
    return null;
  }
}

// Auto-ejecutar
console.log('🔍 Script de debug cargado. Funciones disponibles:');
console.log('• debugUnreadCommentsPanel() - Debug completo del panel');
console.log('• simularCargaComentarios("username") - Simular carga exacta del código');
console.log('\n▶️ Ejecutando debug automático...');
debugUnreadCommentsPanel();
