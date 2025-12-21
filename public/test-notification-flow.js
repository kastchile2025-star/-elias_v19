// Test notification flow for student mode
console.log('=== Testing Notification Flow ===');

// Check current user
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
console.log('Current user:', currentUser);

if (currentUser.role !== 'student') {
  console.log('Not a student, switching to student mode...');
  // Switch to student Felipe
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  const felipe = users['felipe'];
  if (felipe) {
    localStorage.setItem('smart-student-user', JSON.stringify(felipe));
    console.log('Switched to student Felipe');
  }
}

// Check current notifications
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
console.log('Total notifications:', notifications.length);

const felipeNotifications = notifications.filter(n => 
  n.targetUsernames.includes('felipe') && !n.readBy.includes('felipe')
);
console.log('Unread notifications for Felipe:', felipeNotifications.length);

felipeNotifications.forEach(n => {
  console.log(`- ${n.type}: ${n.taskTitle} (${n.course})`);
});

// Check task comments
const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
const unreadComments = comments.filter(comment => 
  comment.studentUsername !== 'felipe' && 
  (!comment.readBy?.includes('felipe'))
);
console.log('Unread comments for Felipe:', unreadComments.length);

console.log('=== Total notification count should be:', felipeNotifications.length + unreadComments.length);

// Test marking a task as read
if (felipeNotifications.length > 0) {
  const firstNotification = felipeNotifications[0];
  console.log('Testing: marking task notifications as read for task:', firstNotification.taskId);
  
  // Simulate opening the task
  const updatedNotifications = notifications.map(notification => {
    if (
      notification.taskId === firstNotification.taskId &&
      notification.targetUsernames.includes('felipe') &&
      !notification.readBy.includes('felipe')
    ) {
      return {
        ...notification,
        readBy: [...notification.readBy, 'felipe'],
        read: notification.readBy.length + 1 >= notification.targetUsernames.length
      };
    }
    return notification;
  });
  
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(updatedNotifications));
  
  // Check count after marking as read
  const newUnreadNotifications = updatedNotifications.filter(n => 
    n.targetUsernames.includes('felipe') && !n.readBy.includes('felipe')
  );
  console.log('After marking as read, unread notifications:', newUnreadNotifications.length);
  console.log('New total count should be:', newUnreadNotifications.length + unreadComments.length);
  
  // Trigger update event
  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  
  console.log('Event triggered. Check if notification counter updated in UI.');
}
