// Verificar notificaciones pendientes de calificación en el dashboard

console.log('=== VERIFICACIÓN DE NOTIFICACIONES PENDIENTES ===');

// Obtener datos del localStorage
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
const currentUserStr = localStorage.getItem('smart-student-current-user');

console.log('Total notifications:', notifications.length);

if (currentUserStr) {
  const currentUser = JSON.parse(currentUserStr);
  console.log('Current user:', currentUser);
  
  if (currentUser.role === 'teacher') {
    console.log('\n=== NOTIFICACIONES PARA PROFESOR ===');
    
    // Filtrar notificaciones para el profesor actual
    const teacherNotifications = notifications.filter(n => 
      n.targetUserRole === 'teacher' && 
      n.targetUsernames.includes(currentUser.username)
    );
    
    console.log('Total notifications for teacher:', teacherNotifications.length);
    
    // Filtrar notificaciones pendientes de calificación
    const pendingGradingNotifications = teacherNotifications.filter(n => 
      n.type === 'pending_grading' && 
      !n.readBy.includes(currentUser.username)
    );
    
    console.log('Pending grading notifications:', pendingGradingNotifications.length);
    
    if (pendingGradingNotifications.length > 0) {
      console.log('\nPending grading notifications details:');
      pendingGradingNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. Task: "${notif.taskTitle}" (${notif.taskType || 'assignment'})`);
        console.log(`   Course: ${notif.course}, Subject: ${notif.subject}`);
        console.log(`   Created: ${notif.timestamp}`);
        console.log(`   Read by: [${notif.readBy.join(', ')}]`);
      });
    }
    
    // Verificar otras notificaciones del profesor
    const otherNotifications = teacherNotifications.filter(n => 
      n.type !== 'pending_grading' && 
      !n.readBy.includes(currentUser.username)
    );
    
    console.log('\nOther unread notifications:', otherNotifications.length);
    if (otherNotifications.length > 0) {
      otherNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. Type: ${notif.type}, Task: "${notif.taskTitle}"`);
      });
    }
    
    console.log('\n=== RESUMEN CONTADOR NOTIFICACIONES ===');
    console.log('Pending grading:', pendingGradingNotifications.length);
    console.log('Other notifications:', otherNotifications.length);
    console.log('Total unread for dashboard:', pendingGradingNotifications.length + otherNotifications.length);
    
  } else {
    console.log('Current user is not a teacher, role:', currentUser.role);
  }
} else {
  console.log('No current user found');
}

console.log('\n=== TODAS LAS NOTIFICACIONES PENDIENTES ===');
const allPendingGrading = notifications.filter(n => n.type === 'pending_grading');
console.log('Total pending grading notifications in system:', allPendingGrading.length);

if (allPendingGrading.length > 0) {
  console.log('\nAll pending grading notifications:');
  allPendingGrading.forEach((notif, index) => {
    console.log(`${index + 1}. Teacher: ${notif.targetUsernames[0]}, Task: "${notif.taskTitle}"`);
    console.log(`   Type: ${notif.taskType || 'assignment'}, Read by: [${notif.readBy.join(', ')}]`);
  });
}
