// Test completo del flujo de notificaciones pendientes

console.log('=== TEST COMPLETO: FLUJO NOTIFICACIONES PENDIENTES ===');

function completeNotificationTest() {
  // 1. Limpiar datos existentes para test limpio
  console.log('🧹 Limpiando datos existentes...');
  
  // 2. Verificar usuarios existentes
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  const usernames = Object.keys(users);
  const teachers = usernames.filter(u => users[u].role === 'teacher');
  const students = usernames.filter(u => users[u].role === 'student');
  
  console.log(`👥 Usuarios encontrados: ${teachers.length} profesores, ${students.length} estudiantes`);
  
  if (teachers.length === 0 || students.length === 0) {
    console.log('❌ No hay suficientes usuarios para el test');
    return false;
  }
  
  const teacherUsername = teachers[0];
  const studentUsernames = students.slice(0, 2);
  
  console.log(`👨‍🏫 Profesor de prueba: ${teacherUsername} (${users[teacherUsername].displayName})`);
  console.log(`👨‍🎓 Estudiantes: ${studentUsernames.map(s => `${s} (${users[s].displayName})`).join(', ')}`);
  
  // 3. Crear tarea de evaluación
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const newTask = {
    id: `test-pending-${Date.now()}`,
    title: 'Evaluación Final - Test Notificaciones',
    description: 'Evaluación para probar el sistema de notificaciones pendientes',
    subject: 'Programación',
    course: 'Curso Test',
    assignedBy: teacherUsername,
    assignedTo: studentUsernames,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    taskType: 'evaluation',
    evaluationConfig: {
      totalPoints: 100,
      passingScore: 70,
      showPointsToStudents: true,
      allowResubmission: false
    }
  };
  
  tasks.push(newTask);
  localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
  console.log('📝 Tarea creada:', newTask.title);
  
  // 4. Crear notificación pendiente de calificación
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  const pendingNotification = {
    id: `pending_grading_${newTask.id}_${Date.now()}`,
    type: 'pending_grading',
    taskId: newTask.id,
    taskTitle: newTask.title,
    targetUserRole: 'teacher',
    targetUsernames: [teacherUsername],
    fromUsername: teacherUsername,
    fromDisplayName: users[teacherUsername].displayName || teacherUsername,
    course: newTask.course,
    subject: newTask.subject,
    timestamp: new Date().toISOString(),
    read: false,
    readBy: [],
    taskType: newTask.taskType
  };
  
  notifications.push(pendingNotification);
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
  console.log('🔔 Notificación pendiente creada');
  
  // 5. Simular entregas de estudiantes (sin calificar)
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  
  studentUsernames.forEach((studentUsername, index) => {
    const submission = {
      id: `submission_${newTask.id}_${studentUsername}_${Date.now() + index}`,
      taskId: newTask.id,
      studentUsername: studentUsername,
      studentName: users[studentUsername].displayName || studentUsername,
      comment: `Entrega de ${users[studentUsername].displayName || studentUsername} para la evaluación`,
      timestamp: new Date(Date.now() + index * 1000).toISOString(),
      isSubmission: true,
      isNew: false,
      readBy: []
      // Nota: NO tiene campo 'grade' - esto indica que está pendiente de calificar
    };
    
    comments.push(submission);
    console.log(`📤 Entrega simulada de: ${users[studentUsername].displayName}`);
  });
  
  localStorage.setItem('smart-student-task-comments', JSON.stringify(comments));
  
  // 6. Verificar conteos
  const teacherNotifications = notifications.filter(n => 
    n.targetUserRole === 'teacher' && 
    n.targetUsernames.includes(teacherUsername) &&
    !n.readBy.includes(teacherUsername)
  );
  
  const pendingGradingNotifications = teacherNotifications.filter(n => n.type === 'pending_grading');
  const pendingSubmissions = comments.filter(c => 
    c.isSubmission === true && 
    c.taskId === newTask.id &&
    (!c.grade || c.grade === null || c.grade === undefined)
  );
  
  console.log('\n📊 RESUMEN DEL TEST:');
  console.log(`✅ Tarea creada: ${newTask.title}`);
  console.log(`✅ Notificaciones pendientes: ${pendingGradingNotifications.length}`);
  console.log(`✅ Entregas sin calificar: ${pendingSubmissions.length}`);
  console.log(`✅ Total notificaciones para burbuja: ${pendingGradingNotifications.length + pendingSubmissions.length}`);
  
  // 7. Disparar evento para actualizar dashboard
  window.dispatchEvent(new Event('taskNotificationsUpdated'));
  
  console.log('\n🎯 INSTRUCCIONES:');
  console.log('1. Ve al dashboard principal');
  console.log(`2. Inicia sesión como: ${teacherUsername}`);
  console.log('3. Verifica la burbuja roja en "Gestión de Tareas"');
  console.log('4. Debería mostrar:', pendingGradingNotifications.length + pendingSubmissions.length);
  
  return {
    taskId: newTask.id,
    teacher: teacherUsername,
    students: studentUsernames,
    expectedCount: pendingGradingNotifications.length + pendingSubmissions.length
  };
}

// Función para simular calificación y verificar que la burbuja desaparece
function simulateGrading(taskId, studentUsername) {
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  
  // Buscar la entrega del estudiante
  const submissionIndex = comments.findIndex(c => 
    c.taskId === taskId && 
    c.studentUsername === studentUsername && 
    c.isSubmission === true
  );
  
  if (submissionIndex !== -1) {
    // Agregar calificación
    comments[submissionIndex].grade = 85;
    comments[submissionIndex].feedback = 'Excelente trabajo!';
    localStorage.setItem('smart-student-task-comments', JSON.stringify(comments));
    
    console.log(`✅ Calificación agregada para ${studentUsername}: 85 puntos`);
    
    // Verificar si todos los estudiantes han sido calificados
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      const allSubmissions = comments.filter(c => c.taskId === taskId && c.isSubmission === true);
      const gradedSubmissions = allSubmissions.filter(c => c.grade !== undefined && c.grade !== null);
      
      console.log(`📊 Progreso: ${gradedSubmissions.length}/${allSubmissions.length} estudiantes calificados`);
      
      if (gradedSubmissions.length === allSubmissions.length) {
        // Eliminar notificación pendiente
        const updatedNotifications = notifications.filter(n => 
          !(n.type === 'pending_grading' && n.taskId === taskId)
        );
        
        localStorage.setItem('smart-student-task-notifications', JSON.stringify(updatedNotifications));
        console.log('🗑️ Notificación pendiente eliminada - todos los estudiantes calificados');
        
        // Disparar evento
        window.dispatchEvent(new Event('taskNotificationsUpdated'));
      }
    }
  } else {
    console.log(`❌ No se encontró entrega para ${studentUsername}`);
  }
}

// Ejecutar test principal
const testResult = completeNotificationTest();

// Botones de prueba adicionales
if (testResult) {
  console.log('\n🔧 FUNCIONES DE PRUEBA DISPONIBLES:');
  console.log(`- simulateGrading('${testResult.taskId}', '${testResult.students[0]}') - Calificar primer estudiante`);
  console.log(`- simulateGrading('${testResult.taskId}', '${testResult.students[1]}') - Calificar segundo estudiante`);
  
  // Hacer funciones disponibles globalmente
  window.testResult = testResult;
  window.simulateGrading = simulateGrading;
}
