// Debug script para notificaciones
console.log('=== DEBUG NOTIFICATIONS ===');

// Simular datos de localStorage
const tasks = [
  {
    id: 'task_1',
    title: 'Tarea de Prueba',
    course: 'course1',
    subject: 'Matemáticas',
    status: 'pending',
    assignedById: 'jorge'
  }
];

const notifications = [
  {
    id: 'task_pending_task_1_1720521600000',
    type: 'pending_grading',
    taskId: 'task_1',
    taskTitle: 'Tarea de Prueba',
    targetUserRole: 'teacher',
    targetUsernames: ['jorge'],
    fromUsername: 'system',
    fromDisplayName: 'Tarea Pendiente: Tarea de Prueba',
    teacherName: 'Jorge',
    course: 'course1',
    subject: 'Matemáticas',
    timestamp: '2025-07-09T12:00:00.000Z',
    read: false,
    readBy: [],
    taskType: 'assignment'
  }
];

// Test filtros
const username = 'jorge';
const userRole = 'teacher';

console.log('Testing filters for:', username, userRole);

const filtered = notifications.filter(notification => {
  console.log('Checking notification:', notification.type, 'from', notification.fromUsername, 'to', notification.targetUsernames);
  
  const basicFilters = notification.targetUserRole === userRole &&
    notification.targetUsernames.includes(username) &&
    !notification.readBy.includes(username) &&
    (notification.fromUsername !== username || notification.fromUsername === 'system');

  console.log('Basic filters result:', basicFilters);
  return basicFilters;
});

console.log('Filtered notifications:', filtered.length);
console.log('Result:', filtered);
