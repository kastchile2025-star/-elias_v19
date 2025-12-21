// SCRIPT PARA RESTAURAR NOTIFICACIONES DE PROFESOR
console.log('🔧 RESTAURANDO NOTIFICACIONES DE PROFESOR...');

function restoreTeacherNotifications() {
  try {
    // Obtener usuario actual
    const userStr = localStorage.getItem('smart-student-user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || user.role !== 'teacher') {
      console.log('❌ Usuario no es profesor');
      return false;
    }
    
    console.log('👤 Profesor:', user.name);
    
    // Obtener tareas y evaluaciones
    const tasksStr = localStorage.getItem('smart-student-tasks');
    const tasks = tasksStr ? JSON.parse(tasksStr) : [];
    
    console.log('📚 Tareas encontradas:', tasks.length);
    
    // Obtener evaluaciones completadas
    const completedEvaluationsStr = localStorage.getItem('smart-student-completed-evaluations');
    const completedEvaluations = completedEvaluationsStr ? JSON.parse(completedEvaluationsStr) : [];
    
    console.log('✅ Evaluaciones completadas:', completedEvaluations.length);
    
    // Obtener comentarios/entregas
    const commentsStr = localStorage.getItem('smart-student-comments');
    const comments = commentsStr ? JSON.parse(commentsStr) : [];
    
    console.log('💬 Comentarios/entregas:', comments.length);
    
    // Obtener notificaciones existentes
    const notificationsStr = localStorage.getItem('smart-student-notifications');
    const existingNotifications = notificationsStr ? JSON.parse(notificationsStr) : [];
    
    console.log('🔔 Notificaciones existentes:', existingNotifications.length);
    
    // Generar notificaciones para tareas/evaluaciones pendientes
    const newNotifications = [];
    
    tasks.forEach(task => {
      console.log(`\n🔍 Procesando tarea: ${task.title} (${task.taskType})`);
      
      // Verificar si es una evaluación
      if (task.taskType === 'evaluacion' || task.taskType === 'evaluation') {
        console.log('📝 Es evaluación');
        
        // Contar estudiantes que han completado la evaluación
        const completedCount = completedEvaluations.filter(eval => eval.taskId === task.id).length;
        const assignedStudents = task.assignedTo ? task.assignedTo.split(',').map(s => s.trim()) : [];
        const totalStudents = assignedStudents.length;
        
        console.log(`   - Estudiantes asignados: ${totalStudents}`);
        console.log(`   - Estudiantes completados: ${completedCount}`);
        console.log(`   - Estudiantes pendientes: ${totalStudents - completedCount}`);
        
        // Si hay estudiantes pendientes, crear notificación
        if (completedCount < totalStudents) {
          const notification = {
            id: `pending_eval_${task.id}`,
            type: 'pending_grading',
            taskId: task.id,
            taskTitle: task.title,
            taskType: 'evaluation',
            targetUserRole: 'teacher',
            targetUsernames: [user.name],
            fromUsername: 'system',
            fromDisplayName: 'Sistema',
            timestamp: new Date().toISOString(),
            readBy: [],
            subject: task.subject || 'Ciencias Naturales',
            course: task.course || 'default'
          };
          
          newNotifications.push(notification);
          console.log(`   ✅ Creada notificación para evaluación pendiente`);
        }
      } else {
        console.log('📋 Es tarea regular');
        
        // Contar estudiantes que han entregado la tarea
        const submissions = comments.filter(comment => 
          comment.taskId === task.id && comment.isSubmission
        );
        const assignedStudents = task.assignedTo ? task.assignedTo.split(',').map(s => s.trim()) : [];
        const totalStudents = assignedStudents.length;
        
        console.log(`   - Estudiantes asignados: ${totalStudents}`);
        console.log(`   - Entregas recibidas: ${submissions.length}`);
        console.log(`   - Estudiantes pendientes: ${totalStudents - submissions.length}`);
        
        // Si hay estudiantes pendientes, crear notificación
        if (submissions.length < totalStudents) {
          const notification = {
            id: `pending_task_${task.id}`,
            type: 'pending_grading',
            taskId: task.id,
            taskTitle: task.title,
            taskType: 'assignment',
            targetUserRole: 'teacher',
            targetUsernames: [user.name],
            fromUsername: 'system',
            fromDisplayName: 'Sistema',
            timestamp: new Date().toISOString(),
            readBy: [],
            subject: task.subject || 'Ciencias Naturales',
            course: task.course || 'default'
          };
          
          newNotifications.push(notification);
          console.log(`   ✅ Creada notificación para tarea pendiente`);
        }
      }
    });
    
    console.log(`\n📊 Notificaciones nuevas a crear: ${newNotifications.length}`);
    
    if (newNotifications.length > 0) {
      // Eliminar notificaciones antiguas del profesor
      const cleanedNotifications = existingNotifications.filter(n => 
        !(n.targetUserRole === 'teacher' && n.targetUsernames && n.targetUsernames.includes(user.name))
      );
      
      console.log(`🧹 Notificaciones antiguas eliminadas: ${existingNotifications.length - cleanedNotifications.length}`);
      
      // Agregar nuevas notificaciones
      const finalNotifications = [...cleanedNotifications, ...newNotifications];
      
      // Guardar en localStorage
      localStorage.setItem('smart-student-notifications', JSON.stringify(finalNotifications));
      
      console.log(`✅ Notificaciones guardadas. Total: ${finalNotifications.length}`);
      
      // Limpiar cachés
      localStorage.removeItem('smart-student-notification-cache');
      localStorage.removeItem('smart-student-notification-counts');
      
      return true;
    } else {
      console.log('ℹ️ No hay notificaciones pendientes para crear');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error restaurando notificaciones:', error);
    return false;
  }
}

// Ejecutar restauración
console.log('🚀 Iniciando restauración...');
const success = restoreTeacherNotifications();

if (success) {
  console.log('✅ Restauración exitosa');
  
  // Forzar actualización de UI
  ['notificationUpdate', 'notificationCountUpdate', 'taskNotificationUpdate'].forEach(event => {
    window.dispatchEvent(new CustomEvent(event, {
      detail: { timestamp: Date.now(), source: 'notification-restore' }
    }));
  });
  
  // Recargar página después de un momento
  setTimeout(() => {
    console.log('🔄 Recargando página...');
    window.location.reload();
  }, 1500);
  
} else {
  console.log('ℹ️ No se requirió restauración');
}

console.log('🎉 SCRIPT COMPLETADO');
