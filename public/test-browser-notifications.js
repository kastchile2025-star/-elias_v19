// Test script to run in browser console
// Copy and paste this into the browser console on the SMART STUDENT app

console.log('=== Testing Student Notification Flow ===');

// Check if we're logged in as a student
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
console.log('Current user:', currentUser);

if (currentUser.role === 'student') {
  // Get all notifications for this student
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  
  console.log('Total task notifications:', notifications.length);
  console.log('Total comments:', comments.length);
  
  // Filter unread notifications for current student
  const unreadNotifications = notifications.filter(n => 
    n.targetUsernames.includes(currentUser.username) && 
    !n.readBy.includes(currentUser.username)
  );
  
  // Filter unread comments for current student
  const unreadComments = comments.filter(comment => 
    comment.studentUsername !== currentUser.username && 
    (!comment.readBy?.includes(currentUser.username))
  );
  
  console.log('Unread task notifications:', unreadNotifications.length);
  console.log('Unread comments:', unreadComments.length);
  console.log('Total unread count should be:', unreadNotifications.length + unreadComments.length);
  
  // Show details
  unreadNotifications.forEach((n, i) => {
    console.log(`${i+1}. ${n.type}: ${n.taskTitle} (from ${n.fromDisplayName})`);
  });
  
  unreadComments.forEach((c, i) => {
    console.log(`${i+1}. Comment: ${c.comment.substring(0, 50)}... (from ${c.studentName})`);
  });
  
  // Test notification labels
  console.log('\n=== Testing Notification Labels ===');
  unreadNotifications.forEach(n => {
    let label = '';
    if (n.type === 'grade_received') {
      label = 'Revisar Calificación';
    } else if (n.type === 'teacher_comment') {
      label = 'Nuevo Comentario Profesor';
    } else {
      label = 'Nuevo Comentario';
    }
    console.log(`${n.type} -> "${label}"`);
  });
  
} else {
  console.log('Please log in as a student to test notifications');
}
