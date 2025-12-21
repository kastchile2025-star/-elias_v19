// 🔧 VERIFICACIÓN FINAL: Sincronización Burbujas vs Campana
// Ejecutar después de las correcciones para confirmar que ambos sistemas sean consistentes

function verificacionSincronizacionFinal() {
  console.clear();
  console.log('🔧 VERIFICACIÓN FINAL: Sincronización Burbujas vs Campana');
  console.log('='.repeat(65));
  
  try {
    // Obtener datos del localStorage
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    console.log('📊 DATOS DISPONIBLES:');
    console.log(`• Comentarios: ${comments.length}`);
    console.log(`• Tareas: ${tasks.length}`);
    console.log(`• Usuarios: ${users.length}`);
    console.log();
    
    // Función checkStudentAssignmentToTask actualizada
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
      
      if (task.assignedStudents && task.assignedStudents.includes(studentUsername)) {
        console.log(`🔄 Fallback assignedStudents: ✅`);
        return true;
      }
      
      console.log(`❌ Sin acceso`);
      return false;
    };
    
    // Función de filtrado uniforme
    const filtrarComentariosUnificado = (comments, tasks, student) => {
      return comments.filter(comment => {
        // No mostrar comentarios propios (verificar tanto studentUsername como authorUsername)
        if (comment.studentUsername === student.username || comment.authorUsername === student.username) {
          return false;
        }
        
        // No mostrar entregas de otros estudiantes
        if (comment.isSubmission) {
          return false;
        }
        
        // No mostrar ya leídos
        if (comment.readBy?.includes(student.username)) {
          return false;
        }
        
        // Verificar tarea asociada
        const task = tasks.find(t => t.id === comment.taskId);
        if (!task) {
          return false;
        }
        
        console.log(`🔍 Procesando comentario en tarea "${task.title}" (assignedTo: ${task.assignedTo})`);
        console.log(`📝 Comentario por: ${comment.authorUsername || comment.studentUsername} (${comment.authorRole || 'student'})`);
        
        // Si es tarea específica para estudiantes
        if (task.assignedTo === 'student' && task.assignedStudentIds) {
          const hasAccess = task.assignedStudentIds.includes(student.id);
          console.log(`${hasAccess ? '✅' : '🚫'} Tarea específica: ${hasAccess ? 'Asignado' : 'NO asignado'}`);
          return hasAccess;
        }
        
        // Para tareas de curso completo, usar el filtro estricto
        if (task.assignedTo === 'course') {
          const hasAccess = checkStudentAssignmentToTask(task, student.id, student.username);
          console.log(`${hasAccess ? '✅' : '🚫'} Tarea de curso: ${hasAccess ? 'Tiene acceso' : 'SIN acceso'}`);
          return hasAccess;
        }
        
        console.log(`🚫 Tipo de asignación no reconocido - Filtrado`);
        return false;
      });
    };
    
    // Probar con cada estudiante
    const students = users.filter(u => u.role === 'student');
    
    console.log('🎯 VERIFICACIÓN POR ESTUDIANTE:');
    students.forEach(student => {
      console.log(`\n👤 Estudiante: ${student.username} (${student.name})`);
      console.log('-'.repeat(50));
      
      // Aplicar filtrado unificado
      const comentariosVisibles = filtrarComentariosUnificado(comments, tasks, student);
      
      console.log(`📬 RESULTADO UNIFICADO: ${comentariosVisibles.length} comentarios visibles`);
      
      if (comentariosVisibles.length > 0) {
        console.log('📋 Comentarios que DEBERÍAN aparecer en ambos lugares:');
        comentariosVisibles.forEach((comment, index) => {
          const task = tasks.find(t => t.id === comment.taskId);
          const author = comment.authorUsername || comment.teacherUsername || comment.studentUsername || 'Autor desconocido';
          const taskType = task?.assignedTo === 'course' ? '🏫 TODO EL CURSO' : '🎯 ESPECÍFICA';
          const content = comment.comment || comment.content || comment.text || 'Sin contenido';
          
          console.log(`  ${index + 1}. ${taskType} "${task?.title || 'Sin título'}"`);
          console.log(`     Por: ${author} (${comment.authorRole || 'rol desconocido'})`);
          console.log(`     Texto: "${content.substring(0, 40)}..."`);
        });
      } else {
        console.log('📭 No hay comentarios visibles para este estudiante');
      }
    });
    
    // Verificar comentarios más recientes
    console.log('\n🕐 COMENTARIOS RECIENTES (últimos 5):');
    const recentComments = comments
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 5);
    
    recentComments.forEach((comment, index) => {
      const task = tasks.find(t => t.id === comment.taskId);
      console.log(`${index + 1}. [${comment.timestamp}] "${task?.title || 'Sin título'}"`);
      console.log(`   Por: ${comment.authorUsername || comment.studentUsername} (${comment.authorRole || 'unknown'})`);
      console.log(`   Tipo tarea: ${task?.assignedTo || 'unknown'}`);
      console.log(`   Leído por: [${comment.readBy?.join(', ') || 'nadie'}]`);
    });
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('📋 PASOS SIGUIENTES:');
    console.log('1. Recargar la página para aplicar cambios');
    console.log('2. Verificar que las burbujas y campana muestren el mismo número');
    console.log('3. Crear un nuevo comentario del profesor para confirmar funcionamiento');
    
    return {
      totalStudents: students.length,
      totalComments: comments.length,
      recentComments: recentComments.length,
      estudiantesConComentarios: students.filter(student => 
        filtrarComentariosUnificado(comments, tasks, student).length > 0
      ).length
    };
    
  } catch (error) {
    console.error('❌ Error en verificación final:', error);
    return null;
  }
}

// Función para forzar recarga de contadores
function forzarActualizacionContadores() {
  console.log('🔄 Forzando actualización de contadores...');
  
  // Disparar eventos de actualización
  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  window.dispatchEvent(new CustomEvent('notificationsUpdated', {
    detail: { type: 'force_update' }
  }));
  
  console.log('✅ Eventos disparados - Los contadores deberían actualizarse');
}

// Auto-ejecutar
console.log('🔧 Script de verificación final cargado. Funciones disponibles:');
console.log('• verificacionSincronizacionFinal() - Verificación completa');
console.log('• forzarActualizacionContadores() - Forzar actualización de UI');
console.log('\n▶️ Ejecutando verificación automática...');

verificacionSincronizacionFinal();
