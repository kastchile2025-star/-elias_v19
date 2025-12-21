// Verificación final del sistema de notificaciones pendientes

console.log('=== VERIFICACIÓN FINAL: SISTEMA COMPLETO ===');

function finalSystemCheck() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const currentUserStr = localStorage.getItem('smart-student-current-user');
  
  console.log('📊 ESTADO DEL SISTEMA:');
  console.log(`- Usuarios: ${Object.keys(users).length}`);
  console.log(`- Tareas: ${tasks.length}`);
  console.log(`- Notificaciones: ${notifications.length}`);
  console.log(`- Comentarios: ${comments.length}`);
  
  // Verificar usuarios por rol
  const usersByRole = {};
  Object.values(users).forEach(user => {
    usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
  });
  
  console.log('👥 USUARIOS POR ROL:');
  Object.entries(usersByRole).forEach(([role, count]) => {
    console.log(`- ${role}: ${count}`);
  });
  
  // Verificar notificaciones pendientes
  const pendingGradingNotifications = notifications.filter(n => n.type === 'pending_grading');
  console.log(`\n🔔 NOTIFICACIONES PENDIENTES: ${pendingGradingNotifications.length}`);
  
  if (pendingGradingNotifications.length > 0) {
    console.log('Detalles:');
    pendingGradingNotifications.forEach((notif, index) => {
      const teacher = notif.targetUsernames[0];
      const task = tasks.find(t => t.id === notif.taskId);
      console.log(`${index + 1}. Profesor: ${teacher}, Tarea: "${notif.taskTitle}" (${notif.taskType || 'assignment'})`);
      console.log(`   Leída por: [${notif.readBy.join(', ') || 'nadie'}]`);
    });
  }
  
  // Verificar entregas sin calificar
  const ungraded = comments.filter(c => 
    c.isSubmission === true && 
    (!c.grade || c.grade === null || c.grade === undefined)
  );
  
  console.log(`\n📝 ENTREGAS SIN CALIFICAR: ${ungraded.length}`);
  
  if (ungraded.length > 0) {
    console.log('Detalles:');
    const ungradedByTask = {};
    ungraded.forEach(submission => {
      if (!ungradedByTask[submission.taskId]) {
        ungradedByTask[submission.taskId] = [];
      }
      ungradedByTask[submission.taskId].push(submission);
    });
    
    Object.entries(ungradedByTask).forEach(([taskId, submissions]) => {
      const task = tasks.find(t => t.id === taskId);
      console.log(`- Tarea: "${task?.title || 'Desconocida'}" (${submissions.length} entregas)`);
      submissions.forEach(sub => {
        console.log(`  · ${sub.studentName} - ${new Date(sub.timestamp).toLocaleString()}`);
      });
    });
  }
  
  // Verificar estado para cada profesor
  const teachers = Object.keys(users).filter(u => users[u].role === 'teacher');
  
  console.log('\n👨‍🏫 ESTADO POR PROFESOR:');
  teachers.forEach(teacherUsername => {
    const teacherNotifications = notifications.filter(n => 
      n.targetUserRole === 'teacher' && 
      n.targetUsernames.includes(teacherUsername) &&
      !n.readBy.includes(teacherUsername)
    );
    
    const teacherTasks = tasks.filter(t => t.assignedBy === teacherUsername);
    const teacherTaskIds = teacherTasks.map(t => t.id);
    const ungradedForTeacher = comments.filter(c => 
      c.isSubmission === true && 
      teacherTaskIds.includes(c.taskId) &&
      (!c.grade || c.grade === null || c.grade === undefined)
    );
    
    const pendingNotifications = teacherNotifications.filter(n => n.type === 'pending_grading');
    const totalForBubble = pendingNotifications.length + ungradedForTeacher.length;
    
    console.log(`${teacherUsername} (${users[teacherUsername].displayName}):`);
    console.log(`  - Tareas asignadas: ${teacherTasks.length}`);
    console.log(`  - Notificaciones pendientes: ${pendingNotifications.length}`);
    console.log(`  - Entregas sin calificar: ${ungradedForTeacher.length}`);
    console.log(`  - Total para burbuja: ${totalForBubble}`);
    
    if (totalForBubble > 0) {
      console.log(`  ✅ La burbuja DEBE mostrarse con: ${totalForBubble}`);
    } else {
      console.log(`  ⭕ La burbuja NO debe mostrarse`);
    }
  });
  
  // Usuario actual
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    console.log(`\n👤 USUARIO ACTUAL: ${currentUser.username} (${currentUser.role})`);
    
    if (currentUser.role === 'teacher') {
      const myNotifications = notifications.filter(n => 
        n.targetUserRole === 'teacher' && 
        n.targetUsernames.includes(currentUser.username) &&
        !n.readBy.includes(currentUser.username)
      );
      
      const myTasks = tasks.filter(t => t.assignedBy === currentUser.username);
      const myTaskIds = myTasks.map(t => t.id);
      const myUngraded = comments.filter(c => 
        c.isSubmission === true && 
        myTaskIds.includes(c.taskId) &&
        (!c.grade || c.grade === null || c.grade === undefined)
      );
      
      const myPending = myNotifications.filter(n => n.type === 'pending_grading');
      const myTotal = myPending.length + myUngraded.length;
      
      console.log(`🎯 Para el dashboard actual:`);
      console.log(`   - Notificaciones pendientes: ${myPending.length}`);
      console.log(`   - Entregas sin calificar: ${myUngraded.length}`);
      console.log(`   - Total burbuja: ${myTotal}`);
      
      if (myTotal > 0) {
        console.log(`   🔴 LA BURBUJA DEBE APARECER CON: ${myTotal}`);
      } else {
        console.log(`   ⚪ LA BURBUJA NO DEBE APARECER`);
      }
    }
  }
  
  console.log('\n🔧 ACCIONES RECOMENDADAS:');
  console.log('1. Ve al dashboard principal');
  console.log('2. Verifica que la burbuja aparezca según los números arriba');
  console.log('3. Si no aparece, verifica que el usuario esté logueado como profesor');
  console.log('4. Usa las funciones de debug para más detalles');
  
  return {
    totalPendingNotifications: pendingGradingNotifications.length,
    totalUngradedSubmissions: ungraded.length,
    teachers: teachers.length
  };
}

// Función para crear datos de prueba mínimos
function createMinimalTestData() {
  console.log('🧪 Creando datos de prueba mínimos...');
  
  // Verificar si ya hay un profesor
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
  const teachers = Object.keys(users).filter(u => users[u].role === 'teacher');
  
  if (teachers.length === 0) {
    console.log('❌ No hay profesores en el sistema. Creando uno...');
    
    const testTeacher = {
      username: 'profesor.test',
      displayName: 'Profesor Test',
      role: 'teacher',
      activeCourses: ['Curso Test'],
      teachingAssignments: [
        { subject: 'Matemáticas', course: 'Curso Test' }
      ]
    };
    
    users['profesor.test'] = testTeacher;
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    console.log('✅ Profesor de prueba creado: profesor.test');
  }
  
  // Crear tarea de prueba con notificación pendiente
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  
  const testTask = {
    id: `minimal-test-${Date.now()}`,
    title: 'Tarea de Prueba - Notificación Pendiente',
    description: 'Tarea creada para probar las notificaciones pendientes',
    subject: 'Matemáticas',
    course: 'Curso Test',
    assignedBy: teachers[0] || 'profesor.test',
    assignedTo: 'course',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    taskType: 'evaluation',
    status: 'pending'
  };
  
  tasks.push(testTask);
  localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
  
  const pendingNotification = {
    id: `pending_grading_${testTask.id}_${Date.now()}`,
    type: 'pending_grading',
    taskId: testTask.id,
    taskTitle: testTask.title,
    targetUserRole: 'teacher',
    targetUsernames: [testTask.assignedBy],
    fromUsername: testTask.assignedBy,
    fromDisplayName: users[testTask.assignedBy]?.displayName || testTask.assignedBy,
    course: testTask.course,
    subject: testTask.subject,
    timestamp: new Date().toISOString(),
    read: false,
    readBy: [],
    taskType: testTask.taskType
  };
  
  notifications.push(pendingNotification);
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
  
  console.log('✅ Datos de prueba mínimos creados');
  console.log(`   - Tarea: "${testTask.title}"`);
  console.log(`   - Profesor: ${testTask.assignedBy}`);
  console.log(`   - Notificación pendiente creada`);
  
  return testTask.assignedBy;
}

// Ejecutar verificación
const systemStatus = finalSystemCheck();

console.log('\n' + '='.repeat(50));
console.log('📋 RESUMEN EJECUTIVO:');
console.log(`✅ Sistema de notificaciones: ${systemStatus.totalPendingNotifications > 0 ? 'ACTIVO' : 'Sin notificaciones'}`);
console.log(`✅ Entregas pendientes: ${systemStatus.totalUngradedSubmissions}`);
console.log(`✅ Profesores en sistema: ${systemStatus.teachers}`);

if (systemStatus.totalPendingNotifications === 0 && systemStatus.totalUngradedSubmissions === 0) {
  console.log('\n⚠️ No hay datos de prueba. ¿Crear datos mínimos?');
  console.log('Ejecuta: createMinimalTestData()');
  
  // Hacer disponible globalmente
  window.createMinimalTestData = createMinimalTestData;
}

// Hacer disponible para debugging
window.finalSystemCheck = finalSystemCheck;
