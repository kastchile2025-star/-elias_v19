// 🔍 DIAGNÓSTICO: Comparación Burbujas vs Campana de Notificaciones
// Ejecutar en consola para identificar por qué los comentarios aparecen en burbujas pero no en campana

function debugBurbujaVsCampana() {
  console.clear();
  console.log('🔍 DIAGNÓSTICO: Burbujas vs Campana de Notificaciones');
  console.log('='.repeat(60));
  
  try {
    // Obtener datos del localStorage
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Obtener usuario actual (simulando estudiante)
    const students = users.filter(u => u.role === 'student');
    
    if (students.length === 0) {
      console.error('❌ No se encontraron estudiantes');
      return;
    }
    
    console.log('📊 DATOS DISPONIBLES:');
    console.log(`• Comentarios: ${comments.length}`);
    console.log(`• Tareas: ${tasks.length}`);
    console.log(`• Estudiantes: ${students.length}`);
    console.log();
    
    // Mostrar comentarios más recientes
    console.log('💬 COMENTARIOS RECIENTES:');
    const recentComments = comments
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 5);
    
    recentComments.forEach((comment, index) => {
      const task = tasks.find(t => t.id === comment.taskId);
      console.log(`${index + 1}. [${comment.timestamp}] Por: ${comment.authorUsername} (${comment.authorRole})`);
      console.log(`   Tarea: "${task?.title || 'Tarea no encontrada'}"`);
      console.log(`   Contenido: "${(comment.comment || '').substring(0, 50)}..."`);
      console.log(`   Leído por: [${comment.readBy?.join(', ') || 'nadie'}]`);
      console.log(`   Es entrega: ${comment.isSubmission}`);
      console.log();
    });
    
    // Simular la lógica de las burbujas (conteo básico)
    console.log('🔴 SIMULACIÓN LÓGICA DE BURBUJAS:');
    students.forEach(student => {
      console.log(`\n👤 Estudiante: ${student.username}`);
      
      // Lógica básica de burbujas: contar comentarios no leídos sin filtros complejos
      const bubbleCount = comments.filter(comment => {
        // No contar comentarios propios
        if (comment.studentUsername === student.username || comment.authorUsername === student.username) {
          return false;
        }
        
        // No contar entregas
        if (comment.isSubmission) {
          return false;
        }
        
        // No contar ya leídos
        if (comment.readBy?.includes(student.username)) {
          return false;
        }
        
        return true; // Mostrar todos los demás
      }).length;
      
      console.log(`🔴 Burbujas mostrarían: ${bubbleCount} comentarios`);
      
      // Simular la lógica compleja de la campana
      console.log('🔔 SIMULACIÓN LÓGICA DE CAMPANA:');
      
      const campanaComments = comments.filter(comment => {
        // No mostrar comentarios propios
        if (comment.studentUsername === student.username || comment.authorUsername === student.username) {
          console.log(`   🚫 Comentario propio - Filtrado`);
          return false;
        }
        
        // No mostrar entregas
        if (comment.isSubmission) {
          console.log(`   🚫 Es entrega - Filtrado`);
          return false;
        }
        
        // No mostrar ya leídos
        if (comment.readBy?.includes(student.username)) {
          console.log(`   🚫 Ya leído - Filtrado`);
          return false;
        }
        
        // Verificar tarea asociada
        const task = tasks.find(t => t.id === comment.taskId);
        if (!task) {
          console.log(`   🚫 Tarea no encontrada - Filtrado`);
          return false;
        }
        
        console.log(`   🔍 Verificando acceso a tarea "${task.title}" (${task.assignedTo})`);
        
        // Si es tarea específica
        if (task.assignedTo === 'student' && task.assignedStudentIds) {
          const hasAccess = task.assignedStudentIds.includes(student.id);
          console.log(`   ${hasAccess ? '✅' : '🚫'} Tarea específica: ${hasAccess ? 'Asignado' : 'NO asignado'}`);
          return hasAccess;
        }
        
        // Si es tarea de curso - usar lógica de checkStudentAssignmentToTask
        if (task.assignedTo === 'course') {
          const hasAccess = checkStudentAssignmentToTask(task, student.id, student.username);
          console.log(`   ${hasAccess ? '✅' : '🚫'} Tarea de curso: ${hasAccess ? 'Tiene acceso' : 'SIN acceso'}`);
          return hasAccess;
        }
        
        console.log(`   🚫 Tipo de asignación no reconocido - Filtrado`);
        return false;
      });
      
      console.log(`🔔 Campana mostraría: ${campanaComments.length} comentarios`);
      
      // Mostrar discrepancia
      if (bubbleCount !== campanaComments.length) {
        console.log(`⚠️ DISCREPANCIA DETECTADA: ${bubbleCount} burbujas vs ${campanaComments.length} campana`);
        console.log(`   Diferencia: ${bubbleCount - campanaComments.length} comentarios perdidos en campana`);
      } else {
        console.log(`✅ CONSISTENCIA: Ambos muestran ${bubbleCount} comentarios`);
      }
    });
    
    console.log('\n🔍 ANÁLISIS DE FUNCIÓN checkStudentAssignmentToTask:');
    
    // Verificar si la función existe en el contexto actual
    if (typeof window !== 'undefined' && window.checkStudentAssignmentToTask) {
      console.log('✅ Función checkStudentAssignmentToTask disponible en ventana');
    } else {
      console.log('❌ Función checkStudentAssignmentToTask NO disponible');
      console.log('📝 Definiendo función local...');
      
      // Definir función local para pruebas
      window.checkStudentAssignmentToTask = function(task, studentId, studentUsername) {
        console.log(`🔍 Verificando acceso de ${studentUsername} a "${task.title}"`);
        
        if (task.assignedTo === 'student' && task.assignedStudentIds) {
          const isAssigned = task.assignedStudentIds.includes(studentId);
          console.log(`🎯 Asignación directa: ${isAssigned ? '✅' : '❌'}`);
          return isAssigned;
        }
        
        if (task.assignedTo === 'course') {
          const taskCourseId = task.courseSectionId || task.course;
          
          if (!taskCourseId) {
            console.log(`⚠️ Tarea sin courseId`);
            return false;
          }
          
          const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
          const studentData = users.find(u => u.id === studentId || u.username === studentUsername);
          
          if (!studentData) {
            console.log(`❌ Estudiante no encontrado`);
            return false;
          }
          
          const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
          const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
          const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
          
          const matchingAssignment = studentAssignments.find(assignment => {
            if (assignment.studentId !== studentId) return false;
            
            const course = courses.find(c => c.id === assignment.courseId);
            const section = sections.find(s => s.id === assignment.sectionId);
            const compositeId = `${course?.id}-${section?.id}`;
            
            return compositeId === taskCourseId || assignment.courseId === taskCourseId;
          });
          
          if (matchingAssignment) {
            console.log(`✅ Acceso por asignación específica`);
            return true;
          }
          
          const isInActiveCourses = studentData.activeCourses?.includes(taskCourseId) || false;
          console.log(`🔄 Fallback activeCourses: ${isInActiveCourses ? '✅' : '❌'}`);
          
          return isInActiveCourses;
        }
        
        console.log(`❌ Sin acceso`);
        return false;
      };
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('📋 Recomendaciones:');
    console.log('1. Verificar que la función checkStudentAssignmentToTask esté disponible');
    console.log('2. Comprobar que la lógica de filtrado en campana sea consistente con burbujas');
    console.log('3. Revisar logs de consola durante navegación real');
    
    return {
      totalComments: comments.length,
      totalTasks: tasks.length,
      totalStudents: students.length,
      recentComments: recentComments.length
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return null;
  }
}

// Función para verificar el estado actual del componente
function verificarEstadoComponente() {
  console.clear();
  console.log('🔍 VERIFICACIÓN DE ESTADO DEL COMPONENTE');
  console.log('='.repeat(50));
  
  // Verificar si hay elementos de notificaciones en el DOM
  const notificationPanel = document.querySelector('[data-testid="notification-panel"]') || 
                           document.querySelector('.notification-panel') ||
                           document.querySelector('[class*="notification"]');
  
  console.log('🎯 ELEMENTOS DOM:');
  console.log(`Panel de notificaciones: ${notificationPanel ? '✅ Encontrado' : '❌ No encontrado'}`);
  
  if (notificationPanel) {
    console.log(`Clases: ${notificationPanel.className}`);
    console.log(`Contenido visible: ${notificationPanel.textContent?.substring(0, 100)}...`);
  }
  
  // Verificar elementos de comentarios
  const commentElements = document.querySelectorAll('[data-testid*="comment"], [class*="comment"]');
  console.log(`Elementos de comentarios: ${commentElements.length}`);
  
  // Verificar elementos de tareas
  const taskElements = document.querySelectorAll('[data-testid*="task"], [class*="task"]');
  console.log(`Elementos de tareas: ${taskElements.length}`);
  
  // Verificar burbujas de notificación
  const bubbles = document.querySelectorAll('[data-testid*="badge"], [class*="badge"], [class*="bubble"]');
  console.log(`Burbujas/badges: ${bubbles.length}`);
  
  bubbles.forEach((bubble, index) => {
    console.log(`  ${index + 1}. ${bubble.textContent} (${bubble.className})`);
  });
  
  // Verificar variables React/estado
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-class]');
  console.log(`Elementos React: ${reactElements.length}`);
  
  console.log('\n✅ VERIFICACIÓN COMPLETADA');
  
  return {
    notificationPanel: !!notificationPanel,
    commentElements: commentElements.length,
    taskElements: taskElements.length,
    bubbles: bubbles.length
  };
}

// Auto-ejecutar diagnóstico
console.log('🔍 Script de diagnóstico cargado. Funciones disponibles:');
console.log('• debugBurbujaVsCampana() - Comparación completa');
console.log('• verificarEstadoComponente() - Estado del DOM');
console.log('\n▶️ Ejecutando diagnóstico automático...');

debugBurbujaVsCampana();
