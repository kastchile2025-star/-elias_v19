// Test script to simulate grade notification scenario
(function() {
  console.log('=== TESTING GRADE NOTIFICATION SCENARIO ===');
  
  // 1. First, let's see current notifications
  const currentNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  console.log('Current notifications:', currentNotifications.length);
  
  // 2. Simulate a teacher grading Felipe's submission
  const felipeUsername = 'felipe_estudiante';
  const teacherUsername = 'jorge_profesor';
  const taskId = 'task_1719259200000'; // An existing task
  
  // Create a grade notification
  const gradeNotification = {
    id: `grade_${taskId}_${felipeUsername}_${Date.now()}`,
    type: 'grade_received',
    taskId: taskId,
    taskTitle: 'prueba',
    targetUserRole: 'student',
    targetUsernames: [felipeUsername],
    fromUsername: teacherUsername,
    fromDisplayName: 'Jorge Profesor',
    course: '4to Básico',
    subject: 'Ciencias Naturales',
    timestamp: new Date().toISOString(),
    read: false,
    readBy: [],
    grade: 85
  };
  
  // Add the notification
  const updatedNotifications = [...currentNotifications, gradeNotification];
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(updatedNotifications));
  
  console.log('Added grade notification for Felipe:', gradeNotification);
  
  // Trigger the notification update event
  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  
  console.log('Grade notification created. Felipe should see a notification for 85% grade.');
  console.log('When Felipe enters the tasks page, the notification should be marked as read.');
  
})();
