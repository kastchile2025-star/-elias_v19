// SCRIPT DE DIAGNÓSTICO PARA NOTIFICACIONES DE PROFESOR
console.log('🔍 DIAGNÓSTICO DE NOTIFICACIONES DE PROFESOR');

function diagnoseTeacherNotifications() {
  try {
    // Obtener usuario actual
    const userStr = localStorage.getItem('smart-student-user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || user.role !== 'teacher') {
      console.log('❌ Usuario no es profesor');
      return;
    }
    
    console.log('👤 Profesor:', user.name);
    console.log('🆔 ID Profesor:', user.id);
    
    // Obtener notificaciones
    const notificationsStr = localStorage.getItem('smart-student-notifications');
    const notifications = notificationsStr ? JSON.parse(notificationsStr) : [];
    
    console.log('📊 Total notificaciones en localStorage:', notifications.length);
    
    // Analizar cada notificación
    notifications.forEach((notification, index) => {
      console.log(`\n📋 Notificación ${index + 1}:`);
      console.log('   🔗 ID:', notification.id);
      console.log('   📝 Tipo:', notification.type);
      console.log('   🎯 Target Role:', notification.targetUserRole);
      console.log('   👥 Target Usernames:', notification.targetUsernames);
      console.log('   📚 Task Title:', notification.taskTitle);
      console.log('   🔄 Task Type:', notification.taskType);
      console.log('   👤 From:', notification.fromUsername);
      console.log('   📅 Timestamp:', notification.timestamp);
      console.log('   👀 Read By:', notification.readBy);
      
      // Verificar si es para el profesor actual
      const isForTeacher = notification.targetUserRole === 'teacher';
      const isForThisUser = notification.targetUsernames && 
                           notification.targetUsernames.includes(user.name);
      const isUnread = !notification.readBy || 
                      !notification.readBy.includes(user.name);
      
      console.log(`   ✅ Es para profesor: ${isForTeacher}`);
      console.log(`   ✅ Es para este usuario: ${isForThisUser}`);
      console.log(`   ✅ No leída: ${isUnread}`);
      console.log(`   🎯 Debería aparecer: ${isForTeacher && isForThisUser && isUnread}`);
    });
    
    // Filtrar notificaciones para el profesor
    const teacherNotifications = notifications.filter(n => 
      n.targetUserRole === 'teacher' && 
      n.targetUsernames && 
      n.targetUsernames.includes(user.name) &&
      (!n.readBy || !n.readBy.includes(user.name))
    );
    
    console.log(`\n📈 RESUMEN:`);
    console.log(`   📊 Total notificaciones: ${notifications.length}`);
    console.log(`   👩‍🏫 Notificaciones para profesor: ${teacherNotifications.length}`);
    
    if (teacherNotifications.length > 0) {
      console.log(`\n📋 Notificaciones que deberían aparecer:`);
      teacherNotifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.taskTitle} (${notification.type})`);
      });
    }
    
    // Verificar TaskNotificationManager
    console.log('\n🔧 Verificando TaskNotificationManager...');
    
    // Simular la llamada del TaskNotificationManager
    const filteredNotifications = notifications.filter(notification => {
      const basicFilters = notification.targetUserRole === 'teacher' || 
                          (notification.targetUsernames && 
                           notification.targetUsernames.includes(user.name));
      
      console.log(`   🔍 Notification ${notification.id}: basicFilters=${basicFilters}`);
      
      if (!basicFilters) return false;
      
      const isUnread = !notification.readBy || !notification.readBy.includes(user.name);
      console.log(`   📖 Notification ${notification.id}: isUnread=${isUnread}`);
      
      return isUnread;
    });
    
    console.log(`\n📊 TaskNotificationManager resultado: ${filteredNotifications.length} notificaciones`);
    
    // Verificar tipos específicos
    const pendingGradingNotifications = filteredNotifications.filter(n => n.type === 'pending_grading');
    const taskCompletedNotifications = filteredNotifications.filter(n => n.type === 'task_completed');
    const taskSubmissionNotifications = filteredNotifications.filter(n => n.type === 'task_submission');
    
    console.log(`\n📋 Por tipo:`);
    console.log(`   📝 pending_grading: ${pendingGradingNotifications.length}`);
    console.log(`   ✅ task_completed: ${taskCompletedNotifications.length}`);
    console.log(`   📤 task_submission: ${taskSubmissionNotifications.length}`);
    
    return {
      total: notifications.length,
      forTeacher: teacherNotifications.length,
      filtered: filteredNotifications.length,
      pendingGrading: pendingGradingNotifications.length
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return null;
  }
}

// Ejecutar diagnóstico
const result = diagnoseTeacherNotifications();
console.log('\n🎉 DIAGNÓSTICO COMPLETADO');
