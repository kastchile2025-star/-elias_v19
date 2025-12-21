// Debug script to check notification and user state
(function() {
  console.log('=== DEBUGGING NOTIFICATION AND USER STATE ===');
  
  // 1. Check users in localStorage
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  console.log('All users in localStorage:', users);
  
  // 2. Check students specifically
  const students = Object.entries(users).filter(([username, data]) => data.role === 'student');
  console.log('Students found:', students.length);
  students.forEach(([username, data]) => {
    console.log(`Student: ${username} (${data.displayName}) - Courses: ${data.activeCourses}`);
  });
  
  // 3. Check stored notifications
  const storedNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  console.log('Total stored notifications:', storedNotifications.length);
  console.log('All notifications:', storedNotifications);
  
  // 4. Check tasks
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  console.log('Total tasks:', tasks.length);
  tasks.forEach(task => {
    console.log(`Task: ${task.title} - Course: ${task.course} - Type: ${task.taskType || 'assignment'}`);
  });
  
  // 5. Check current user
  const currentUser = JSON.parse(localStorage.getItem('smart-student-current-user') || 'null');
  console.log('Current user:', currentUser);
  
  console.log('=== END DEBUG ===');
  );
  console.log('Unread notifications for Felipe:', unreadForFelipe.length);
  
  // 4. Show details of each notification
  felipeNotifications.forEach((notification, index) => {
    console.log(`Notification ${index + 1}:`, {
      id: notification.id,
      type: notification.type,
      taskTitle: notification.taskTitle,
      read: notification.read,
      readBy: notification.readBy,
      isReadByFelipe: notification.readBy.includes(felipeUsername)
    });
  });
  
  // 5. Test the notification manager functions
  console.log('\n=== TESTING NOTIFICATION MANAGER ===');
  
  // Import the notification manager (assuming it's globally available)
  if (window.TaskNotificationManager) {
    const unreadCount = window.TaskNotificationManager.getUnreadCountForUser(felipeUsername, 'student');
    console.log('Unread count from manager:', unreadCount);
    
    const unreadNotifications = window.TaskNotificationManager.getUnreadNotificationsForUser(felipeUsername, 'student');
    console.log('Unread notifications from manager:', unreadNotifications.length);
  } else {
    console.log('TaskNotificationManager not available globally');
  }
  
})();
