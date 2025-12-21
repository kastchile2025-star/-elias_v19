// Script de debugging para verificar el contador de notificaciones
console.log('=== DEBUGGING NOTIFICATION COUNTER ===');

// Verificar datos en localStorage
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');

console.log('Total users:', users.length);
console.log('Total comments:', comments.length);
console.log('Total tasks:', tasks.length);
console.log('Total notifications:', notifications.length);

// Buscar al usuario profesor actual
const currentUser = users.find(u => u.role === 'teacher');
if (currentUser) {
  console.log('Current teacher user:', currentUser.username);
  
  // Filtrar tareas asignadas por este profesor
  const teacherTasks = tasks.filter(task => task.assignedBy === currentUser.username);
  console.log('Tasks assigned by this teacher:', teacherTasks.length);
  
  if (teacherTasks.length > 0) {
    console.log('Teacher tasks:');
    teacherTasks.forEach(task => {
      console.log(`- ${task.title} (ID: ${task.id})`);
    });
  }
  
  const teacherTaskIds = teacherTasks.map(task => task.id);
  
  // Filtrar entregas sin calificar
  const submissions = comments.filter(comment => 
    comment.isSubmission && 
    teacherTaskIds.includes(comment.taskId) &&
    !comment.grade
  );
  
  console.log('Ungraded submissions:', submissions.length);
  if (submissions.length > 0) {
    console.log('Submissions detail:');
    submissions.forEach(sub => {
      const task = tasks.find(t => t.id === sub.taskId);
      console.log(`- ${sub.studentName} submitted "${task?.title}" at ${sub.timestamp}, grade: ${sub.grade ? 'YES' : 'NO'}`);
    });
  }
  
  // Verificar notificaciones de tareas
  const teacherNotifications = notifications.filter(n => 
    n.targetUserRole === 'teacher' &&
    n.targetUsernames.includes(currentUser.username) &&
    !n.readBy.includes(currentUser.username)
  );
  
  console.log('Unread task notifications for teacher:', teacherNotifications.length);
  if (teacherNotifications.length > 0) {
    console.log('Teacher notifications:');
    teacherNotifications.forEach(notif => {
      console.log(`- ${notif.type}: ${notif.taskTitle} from ${notif.fromDisplayName} at ${notif.timestamp}`);
    });
  }
  
  console.log('=== SUMMARY ===');
  console.log('Ungraded submissions:', submissions.length);
  console.log('Unread task notifications:', teacherNotifications.length);
  console.log('Total expected count:', submissions.length + teacherNotifications.length);
} else {
  console.log('No teacher user found in localStorage');
}

console.log('=== END DEBUG ===');
