// Test: Crear tarea y verificar notificación pendiente de calificación

console.log('=== TEST: NOTIFICACIÓN PENDIENTE DE CALIFICACIÓN ===');

// Simular la creación de una tarea como profesor
function createTestTask() {
  // Obtener datos existentes
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  
  // Buscar un profesor y estudiantes
  const usernames = Object.keys(users);
  const teacher = usernames.find(u => users[u].role === 'teacher');
  const students = usernames.filter(u => users[u].role === 'student').slice(0, 2); // Tomar 2 estudiantes
  
  if (!teacher) {
    console.log('❌ No se encontró profesor en el sistema');
    return;
  }
  
  if (students.length === 0) {
    console.log('❌ No se encontraron estudiantes en el sistema');
    return;
  }
  
  console.log('👨‍🏫 Profesor:', teacher, '- Display:', users[teacher].displayName);
  console.log('👨‍🎓 Estudiantes:', students.map(s => `${s} (${users[s].displayName})`));
  
  // Crear una nueva tarea de prueba
  const newTask = {
    id: `test-task-${Date.now()}`,
    title: 'Test Evaluación - Notificación Pendiente',
    description: 'Esta es una evaluación de prueba para verificar las notificaciones pendientes',
    subject: 'Matemáticas',
    course: 'Curso A',
    assignedBy: teacher,
    assignedTo: students,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días
    createdAt: new Date().toISOString(),
    taskType: 'evaluation',
    evaluationConfig: {
      totalPoints: 100,
      passingScore: 70,
      showPointsToStudents: true,
      allowResubmission: false
    }
  };
  
  console.log('📝 Nueva tarea creada:', newTask);
  
  // Agregar tarea al localStorage
  tasks.push(newTask);
  localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
  
  // Simular la creación de la notificación pendiente (función del TaskNotificationManager)
  const pendingNotification = {
    id: `pending_grading_${newTask.id}_${Date.now()}`,
    type: 'pending_grading',
    taskId: newTask.id,
    taskTitle: newTask.title,
    targetUserRole: 'teacher',
    targetUsernames: [teacher],
    fromUsername: teacher,
    fromDisplayName: users[teacher].displayName || teacher,
    course: newTask.course,
    subject: newTask.subject,
    timestamp: new Date().toISOString(),
    read: false,
    readBy: [],
    taskType: newTask.taskType
  };
  
  notifications.push(pendingNotification);
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
  
  console.log('🔔 Notificación pendiente creada:', pendingNotification);
  
  // Verificar el conteo de notificaciones para el profesor
  const teacherNotifications = notifications.filter(n => 
    n.targetUserRole === 'teacher' && 
    n.targetUsernames.includes(teacher) &&
    !n.readBy.includes(teacher)
  );
  
  const pendingCount = teacherNotifications.filter(n => n.type === 'pending_grading').length;
  
  console.log('📊 Resumen:');
  console.log(`- Total notificaciones para ${teacher}: ${teacherNotifications.length}`);
  console.log(`- Notificaciones pendientes: ${pendingCount}`);
  console.log('✅ Test completado. Ve al dashboard como profesor para ver la burbuja.');
  
  // Disparar evento para actualizar el dashboard
  window.dispatchEvent(new Event('taskNotificationsUpdated'));
  
  return {
    taskId: newTask.id,
    teacherUsername: teacher,
    pendingCount: pendingCount
  };
}

// Ejecutar test
const result = createTestTask();

if (result) {
  console.log('\n=== INSTRUCCIONES ===');
  console.log('1. Ve al dashboard principal (/)');
  console.log('2. Inicia sesión como profesor:', result.teacherUsername);
  console.log('3. Verifica que la tarjeta "Gestión de Tareas" muestre una burbuja roja con el número de notificaciones pendientes');
  console.log('4. ID de tarea creada:', result.taskId);
}
