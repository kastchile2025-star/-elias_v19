// 🔔 SIMULACIÓN EXACTA: Lógica de la Campana de Notificaciones
// Replica exactamente la función loadUnreadComments del notifications-panel.tsx

function simularCampanaNotificaciones() {
  console.clear();
  console.log('🔔 SIMULACIÓN EXACTA: Lógica de la Campana de Notificaciones');
  console.log('='.repeat(65));
  
  try {
    // Obtener datos exactamente como lo hace el componente
    const storedComments = localStorage.getItem('smart-student-task-comments');
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Usuario actual (Felipe)
    const user = users.find(u => u.username === 'felipe');
    
    if (!user) {
      console.error('❌ Usuario felipe no encontrado');
      return;
    }
    
    console.log(`👤 Usuario actual: ${user.username} (ID: ${user.id})`);
    console.log(`🔍 Datos disponibles:`);
    console.log(`   storedComments: ${storedComments ? 'SÍ' : 'NO'}`);
    console.log(`   storedTasks: ${storedTasks ? 'SÍ' : 'NO'}`);
    
    if (storedComments && storedTasks) {
      const comments = JSON.parse(storedComments);
      const tasks = JSON.parse(storedTasks);
      
      console.log(`📊 Processing ${comments.length} comments for student ${user.username}`);
      
      // Función checkStudentAssignmentToTask exacta del notifications-panel.tsx
      const checkStudentAssignmentToTask = (task, studentId, studentUsername) => {
        console.log(`🔍 [checkStudentAssignmentToTask] Verificando acceso para estudiante ${studentUsername} (ID: ${studentId}) a tarea "${task.title}"`);
        console.log(`📋 [checkStudentAssignmentToTask] Tarea asignada a: ${task.assignedTo}, curso: ${task.course || task.courseSectionId}`);
        
        // Si la tarea está asignada a estudiantes específicos
        if (task.assignedTo === 'student' && task.assignedStudentIds) {
          const isDirectlyAssigned = task.assignedStudentIds.includes(studentId);
          console.log(`🎯 [checkStudentAssignmentToTask] Estudiante ${studentUsername} directamente asignado: ${isDirectlyAssigned ? '✅' : '❌'}`);
          return isDirectlyAssigned;
        }
        
        // Si la tarea está asignada a todo el curso
        if (task.assignedTo === 'course') {
          const courseId = task.course || task.courseSectionId;
          
          if (!courseId) {
            console.log(`⚠️ [checkStudentAssignmentToTask] Tarea sin courseId definido`);
            return false;
          }
          
          // Obtener datos del estudiante
          const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
          const studentData = users.find(u => u.id === studentId || u.username === studentUsername);
          
          if (!studentData) {
            console.log(`❌ [checkStudentAssignmentToTask] Datos del estudiante no encontrados: ${studentUsername}`);
            return false;
          }
          
          // Obtener asignaciones específicas del estudiante
          const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
          const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
          const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
          
          // Para cada asignación del estudiante, verificar si coincide con el curso de la tarea
          for (const assignment of studentAssignments) {
            if (assignment.studentId === studentId) {
              const actualCourseId = assignment.courseId;
              const sectionId = assignment.sectionId;
              const isAssignedToTaskSection = (actualCourseId === courseId) || (`${actualCourseId}-${sectionId}` === courseId);
              
              console.log(`🏫 [checkStudentAssignmentToTask] Verificando curso ${actualCourseId} sección ${sectionId}`);
              console.log(`📊 [checkStudentAssignmentToTask] Estudiante ${studentUsername} asignado a esta sección: ${isAssignedToTaskSection ? '✅' : '❌'}`);
              
              if (isAssignedToTaskSection) {
                return true;
              }
            }
          }
          
          // Fallback: verificar en activeCourses del estudiante
          const isInActiveCourses = studentData.activeCourses?.includes(courseId) || false;
          console.log(`🔄 [checkStudentAssignmentToTask] Fallback activeCourses para ${studentUsername}: ${isInActiveCourses ? '✅' : '❌'}`);
          return isInActiveCourses;
        }
        
        // Compatibilidad con versiones anteriores
        if (task.assignedStudents && task.assignedStudents.includes(studentUsername)) {
          console.log(`🔄 [checkStudentAssignmentToTask] Fallback assignedStudents para ${studentUsername}: ✅`);
          return true;
        }
        
        console.log(`❌ [checkStudentAssignmentToTask] Estudiante ${studentUsername} no tiene acceso a la tarea "${task.title}"`);
        return false;
      };
      
      // Aplicar el filtrado exacto del notifications-panel.tsx
      const unread = comments.filter(comment => {
        // No mostrar comentarios propios (verificar tanto studentUsername como authorUsername)
        if (comment.studentUsername === user.username || comment.authorUsername === user.username) {
          console.log(`🚫 [loadUnreadComments] Comentario propio de ${user.username} - Filtrando`);
          return false;
        }
        
        // No mostrar entregas de otros estudiantes
        if (comment.isSubmission) {
          console.log(`🚫 [loadUnreadComments] Entrega de otro estudiante - Filtrando`);
          return false;
        }
        
        // Verificar si ya fue leído
        if (comment.readBy?.includes(user.username)) {
          console.log(`🚫 [loadUnreadComments] Comentario ya leído por ${user.username} - Filtrando`);
          return false;
        }
        
        // 🎯 FILTRO CRÍTICO: Verificar asignación específica para estudiantes
        const task = tasks.find(t => t.id === comment.taskId);
        if (!task) {
          console.log(`🚫 [loadUnreadComments] Tarea no encontrada para comentario: ${comment.taskId}`);
          return false;
        }
        
        console.log(`🔍 [loadUnreadComments] Procesando comentario en tarea "${task.title}" (assignedTo: ${task.assignedTo})`);
        console.log(`📝 [loadUnreadComments] Comentario por: ${comment.authorUsername || comment.studentUsername} (${comment.authorRole || 'student'})`);
        
        // Si es una tarea asignada a estudiantes específicos
        if (task.assignedTo === 'student' && task.assignedStudentIds) {
          const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
          const currentUser = users.find(u => u.username === user.username);
          
          if (!currentUser || !task.assignedStudentIds.includes(currentUser.id)) {
            console.log(`🚫 [loadUnreadComments] Estudiante ${user.username} NO asignado a tarea específica "${task.title}" - Filtrando comentario`);
            return false;
          }
          
          console.log(`✅ [loadUnreadComments] Estudiante ${user.username} SÍ asignado a tarea específica "${task.title}" - Mostrando comentario`);
          return true;
        }
        
        // Para tareas de curso completo, usar el filtro existente
        const isAssignedToTask = checkStudentAssignmentToTask(task, user.id, user.username);
        
        if (!isAssignedToTask) {
          console.log(`🚫 [loadUnreadComments] Estudiante ${user.username} NO asignado a tarea de curso "${task.title}" - Ocultando comentario`);
          return false;
        }
        
        console.log(`✅ [loadUnreadComments] Estudiante ${user.username} SÍ asignado a tarea de curso "${task.title}" - Mostrando comentario`);
        return true;
      }).map(comment => {
        // Find associated task for each comment for display
        const task = tasks.find(t => t.id === comment.taskId);
        return { ...comment, task };
      });
      
      console.log(`\n📊 RESULTADO FINAL:`);
      console.log(`Found ${unread.length} unread comments for student ${user.username} (after privacy filter)`);
      
      if (unread.length > 0) {
        console.log('\n📋 COMENTARIOS QUE LA CAMPANA DEBERÍA MOSTRAR:');
        unread.forEach((comment, index) => {
          console.log(`${index + 1}. "${(comment.comment || '').substring(0, 50)}..."`);
          console.log(`   Por: ${comment.authorUsername} en "${comment.task?.title}"`);
          console.log(`   Timestamp: ${comment.timestamp}`);
        });
      } else {
        console.log('\n📭 LA CAMPANA DEBERÍA ESTAR VACÍA');
        console.log('🚨 Esto explicaría por qué no ves comentarios en la campana');
      }
      
      // Verificar por qué el dashboard muestra 5 pero la campana 0
      console.log('\n🔄 ANÁLISIS DE DISCREPANCIA:');
      console.log(`• Dashboard (burbuja): muestra 5`);
      console.log(`• Campana (simulación): muestra ${unread.length}`);
      
      if (unread.length === 0) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO:');
        console.log('Los comentarios están siendo FILTRADOS correctamente por la campana');
        console.log('El problema está en que el dashboard NO está aplicando la misma lógica');
        console.log('\n📋 POSIBLES CAUSAS:');
        console.log('1. El dashboard aún usa lógica antigua (no corregida)');
        console.log('2. La página no se ha recargado para aplicar cambios');
        console.log('3. Los eventos de sincronización no están funcionando');
      }
      
      return {
        campanaCount: unread.length,
        dashboardCount: 5, // según imagen
        discrepancia: 5 - unread.length,
        comentariosVisibles: unread.map(c => ({
          autor: c.authorUsername,
          contenido: (c.comment || '').substring(0, 30),
          tarea: c.task?.title
        }))
      };
    } else {
      console.log('❌ No hay datos de comentarios o tareas almacenados');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error en simulación de campana:', error);
    return null;
  }
}

// Auto-ejecutar
console.log('🔔 Script de simulación de campana cargado');
console.log('▶️ Ejecutando simulación exacta...');

simularCampanaNotificaciones();
