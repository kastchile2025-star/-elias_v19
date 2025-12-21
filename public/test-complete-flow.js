// Comprehensive test for grade notification flow
(function() {
  console.log('=== COMPREHENSIVE GRADE NOTIFICATION TEST ===');
  
  const felipeUsername = 'felipe_estudiante';
  const teacherUsername = 'jorge_profesor';
  
  // 1. Clear existing notifications to start fresh
  console.log('1. Clearing existing notifications...');
  localStorage.setItem('smart-student-task-notifications', '[]');
  
  // 2. Create a grade notification
  console.log('2. Creating grade notification...');
  const gradeNotification = {
    id: `grade_test_${Date.now()}`,
    type: 'grade_received',
    taskId: 'task_1719259200000',
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
  
  localStorage.setItem('smart-student-task-notifications', JSON.stringify([gradeNotification]));
  
  // 3. Trigger notification update
  console.log('3. Triggering notification update...');
  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  
  // 4. Wait a moment, then check notification count
  setTimeout(() => {
    console.log('4. Checking notification state after creation...');
    
    // Check if notification panel shows the notification
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    console.log('Total notifications:', notifications.length);
    console.log('Notification details:', notifications[0]);
    
    // 5. Simulate entering tasks page (this should mark notification as read)
    console.log('5. Simulating tasks page entry...');
    
    // Simulate the markGradeNotificationsAsReadOnTasksView function
    const updatedNotifications = notifications.map(notification => {
      if (
        notification.type === 'grade_received' &&
        notification.targetUsernames.includes(felipeUsername) &&
        !notification.readBy.includes(felipeUsername)
      ) {
        return {
          ...notification,
          readBy: [...notification.readBy, felipeUsername],
          read: true
        };
      }
      return notification;
    });
    
    localStorage.setItem('smart-student-task-notifications', JSON.stringify(updatedNotifications));
    
    // 6. Trigger notification update again
    console.log('6. Triggering notification update after marking as read...');
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    
    // 7. Final check
    setTimeout(() => {
      console.log('7. Final notification state check...');
      const finalNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
      console.log('Final notifications:', finalNotifications.length);
      if (finalNotifications.length > 0) {
        console.log('First notification read status:', {
          read: finalNotifications[0].read,
          readBy: finalNotifications[0].readBy
        });
      }
      
      console.log('✅ Test completed. Felipe should now see the notification count decrease.');
    }, 500);
    
  }, 500);
  
})();
