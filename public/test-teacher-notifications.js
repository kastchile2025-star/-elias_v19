// Script de prueba para las notificaciones de profesor
console.log('=== TESTING TEACHER PENDING NOTIFICATIONS ===');

// Simular la creación de una tarea por un profesor
function testCreateTaskWithPendingNotification() {
  console.log('\n1. Testing task creation with pending notification...');
  
  const taskId = 'test_task_' + Date.now();
  const teacherUsername = 'jorge_profesor';
  
  // Simular la función de creación de notificación pendiente
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  
  const pendingNotification = {
    id: `pending_grading_${taskId}_${Date.now()}`,
    type: 'pending_grading',
    taskId: taskId,
    taskTitle: 'Test Evaluation',
    targetUserRole: 'teacher',
    targetUsernames: [teacherUsername],
    fromUsername: teacherUsername,
    fromDisplayName: 'Jorge Profesor',
    course: '4to Básico',
    subject: 'Ciencias Naturales',
    timestamp: new Date().toISOString(),
    read: false,
    readBy: [],
    taskType: 'evaluation'
  };
  
  notifications.push(pendingNotification);
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
  
  console.log('✓ Pending notification created:', pendingNotification.id);
  return taskId;
}

// Simular la eliminación de la notificación cuando todos están calificados
function testRemovePendingNotification(taskId) {
  console.log('\n2. Testing pending notification removal...');
  
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  const initialCount = notifications.length;
  
  const filteredNotifications = notifications.filter(notification => 
    !(notification.type === 'pending_grading' && notification.taskId === taskId)
  );
  
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(filteredNotifications));
  
  const removedCount = initialCount - filteredNotifications.length;
  console.log(`✓ Removed ${removedCount} pending notifications`);
}

// Ejecutar pruebas
const testTaskId = testCreateTaskWithPendingNotification();

// Mostrar notificaciones actuales
const currentNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
console.log('\nCurrent notifications count:', currentNotifications.length);
console.log('Pending grading notifications:', currentNotifications.filter(n => n.type === 'pending_grading').length);

// Simular eliminación después de 3 segundos
setTimeout(() => {
  testRemovePendingNotification(testTaskId);
  
  const finalNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  console.log('\nFinal notifications count:', finalNotifications.length);
  console.log('Pending grading notifications:', finalNotifications.filter(n => n.type === 'pending_grading').length);
  
  console.log('\n=== TEST COMPLETED ===');
}, 3000);

console.log('\n⏳ Waiting 3 seconds to test removal...');
