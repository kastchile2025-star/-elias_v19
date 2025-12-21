// 🔧 REPARAR: Crear notificaciones faltantes para tareas existentes
console.clear();
console.log('🔧 REPARANDO: Creando notificaciones faltantes para tareas de "Todo el Curso"');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Función corregida de parseo
function getCourseDataFromCombinedId(combinedId) {
  if (!combinedId || !combinedId.includes('-')) {
    return null;
  }
  
  const parts = combinedId.split('-');
  if (parts.length !== 10) {
    return null;
  }
  
  const courseId = parts.slice(0, 5).join('-');
  const sectionId = parts.slice(5, 10).join('-');
  
  return { courseId, sectionId };
}

// 2️⃣ Función para obtener estudiantes
function getStudentsInCourse(course) {
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  
  const courseData = getCourseDataFromCombinedId(course);
  if (!courseData) return [];
  
  const { courseId, sectionId } = courseData;
  
  const assignedStudentIds = studentAssignments
    .filter(assignment => assignment.courseId === courseId && assignment.sectionId === sectionId)
    .map(assignment => assignment.studentId);
  
  const studentsInCourse = assignedStudentIds
    .map(studentId => {
      const user = allUsers.find(u => u.id === studentId && u.role === 'student');
      return user ? { username: user.username, displayName: user.displayName || user.username } : null;
    })
    .filter(student => student !== null);
  
  return studentsInCourse;
}

// 3️⃣ Obtener datos
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');

// 4️⃣ Encontrar tareas de curso sin notificaciones para estudiantes
const courseTasks = tasks.filter(task => task.assignedTo === 'course');

console.log(`📋 Tareas de "Todo el Curso": ${courseTasks.length}`);

let notificationsCreated = 0;

courseTasks.forEach((task, index) => {
  console.log(`\n${index + 1}. Procesando "${task.title}"`);
  
  // Verificar si ya tiene notificaciones new_task
  const existingNewTaskNotifications = notifications.filter(n => 
    n.taskId === task.id && n.type === 'new_task'
  );
  
  if (existingNewTaskNotifications.length > 0) {
    console.log(`   ✅ Ya tiene ${existingNewTaskNotifications.length} notificaciones new_task`);
    return;
  }
  
  console.log(`   🔧 Creando notificaciones faltantes...`);
  
  // Obtener estudiantes del curso
  const courseId = task.courseSectionId || task.course;
  const targetStudents = getStudentsInCourse(courseId);
  
  console.log(`   👥 Estudiantes encontrados: [${targetStudents.map(s => s.username).join(', ')}]`);
  
  if (targetStudents.length > 0) {
    // Crear notificación new_task
    const newNotification = {
      id: `new_task_${task.id}_${Date.now()}`,
      type: 'new_task',
      taskId: task.id,
      taskTitle: task.title,
      targetUserRole: 'student',
      targetUsernames: targetStudents.map(student => student.username),
      fromUsername: task.createdBy || 'profesor',
      fromDisplayName: task.createdBy || 'Profesor',
      course: courseId,
      subject: task.subject || 'Materia',
      timestamp: task.createdAt || new Date().toISOString(),
      read: false,
      readBy: [],
      taskType: 'assignment'
    };
    
    // Agregar a notificaciones
    notifications.push(newNotification);
    notificationsCreated++;
    
    console.log(`   ✅ Notificación creada para [${newNotification.targetUsernames.join(', ')}]`);
  } else {
    console.log(`   ❌ No se encontraron estudiantes para el curso`);
  }
});

// 5️⃣ Guardar notificaciones actualizadas
if (notificationsCreated > 0) {
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
  console.log(`\n🎉 ¡REPARACIÓN COMPLETADA!`);
  console.log(`📬 ${notificationsCreated} notificaciones creadas`);
  console.log(`📊 Total notificaciones: ${notifications.length}`);
  
  // Disparar evento para actualizar la UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  }
  
  console.log(`\n🔔 ¡Ve a la campana de notificaciones para ver las nuevas notificaciones!`);
} else {
  console.log(`\nℹ️ No se crearon notificaciones adicionales`);
}

// 6️⃣ Verificar notificaciones para felipe
console.log(`\n🔍 VERIFICANDO NOTIFICACIONES PARA FELIPE:`);
const felipeNotifications = notifications.filter(n => 
  n.targetUsernames.includes('felipe') && n.type === 'new_task'
);

console.log(`📬 Notificaciones new_task para felipe: ${felipeNotifications.length}`);
felipeNotifications.forEach((notif, index) => {
  console.log(`   ${index + 1}. "${notif.taskTitle}" (${notif.course})`);
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🎯 PRÓXIMO PASO: Actualizar la campana de notificaciones');
