// 🔧 PASO A PASO: Verificar por qué no aparecen las notificaciones
console.clear();
console.log('🔧 DIAGNÓSTICO: ¿Por qué no aparecen las notificaciones en la campana?');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Verificar que la función de parseo funciona
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

// 2️⃣ Verificar datos actuales
console.log('📊 VERIFICANDO DATOS ACTUALES:');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');

console.log(`👥 Usuarios: ${users.length}`);
console.log(`📝 Tareas: ${tasks.length}`);
console.log(`🔔 Notificaciones: ${notifications.length}`);

// 3️⃣ Buscar estudiante actual
const currentUser = users.find(u => u.username === 'felipe');
if (currentUser) {
  console.log(`\n👤 Usuario actual: ${currentUser.username} (${currentUser.displayName})`);
  console.log(`🎓 Role: ${currentUser.role}`);
  console.log(`📚 ID: ${currentUser.id}`);
} else {
  console.log('❌ No se encontró el usuario felipe');
}

// 4️⃣ Buscar tareas de "Todo el Curso"
console.log('\n📋 TAREAS DE "TODO EL CURSO":');
const courseTasks = tasks.filter(task => task.assignedTo === 'course');
console.log(`🎯 Tareas encontradas: ${courseTasks.length}`);

courseTasks.forEach((task, index) => {
  console.log(`\n${index + 1}. "${task.title}"`);
  console.log(`   📚 Course: ${task.courseSectionId || task.course}`);
  console.log(`   👨‍🏫 Creado por: ${task.createdBy}`);
  console.log(`   📅 Fecha: ${task.createdAt || task.dueDate}`);
  
  // Verificar si hay notificaciones para esta tarea
  const taskNotifications = notifications.filter(n => n.taskId === task.id);
  console.log(`   🔔 Notificaciones: ${taskNotifications.length}`);
  
  if (taskNotifications.length > 0) {
    taskNotifications.forEach(notif => {
      console.log(`      - Tipo: ${notif.type}, Destinatarios: [${notif.targetUsernames.join(', ')}]`);
    });
  }
});

// 5️⃣ Verificar notificaciones del usuario actual
if (currentUser) {
  console.log(`\n🔔 NOTIFICACIONES PARA ${currentUser.username}:`);
  const userNotifications = notifications.filter(n => 
    n.targetUsernames.includes(currentUser.username) || 
    n.targetUsernames.includes(currentUser.id)
  );
  
  console.log(`📬 Total para usuario: ${userNotifications.length}`);
  
  userNotifications.forEach((notif, index) => {
    console.log(`\n${index + 1}. ${notif.type} - "${notif.taskTitle}"`);
    console.log(`   📅 Timestamp: ${notif.timestamp}`);
    console.log(`   👥 Targets: [${notif.targetUsernames.join(', ')}]`);
    console.log(`   📖 Leída: ${notif.read} (readBy: [${notif.readBy.join(', ')}])`);
  });
  
  if (userNotifications.length === 0) {
    console.log('❌ NO HAY NOTIFICACIONES para este usuario');
    console.log('\n💡 POSIBLES CAUSAS:');
    console.log('1. Las notificaciones no se están creando');
    console.log('2. El usuario no está en targetUsernames');
    console.log('3. Las notificaciones están siendo filtradas');
  }
}

// 6️⃣ Verificar función getStudentsInCourse
console.log('\n🧪 PROBANDO getStudentsInCourse:');
if (courseTasks.length > 0) {
  const testTask = courseTasks[0];
  const courseId = testTask.courseSectionId || testTask.course;
  
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const courseData = getCourseDataFromCombinedId(courseId);
  
  if (courseData) {
    const { courseId: parsedCourseId, sectionId } = courseData;
    console.log(`📚 Parsing: ${courseId} -> ${parsedCourseId} + ${sectionId}`);
    
    const assignedStudentIds = studentAssignments
      .filter(assignment => assignment.courseId === parsedCourseId && assignment.sectionId === sectionId)
      .map(assignment => assignment.studentId);
    
    console.log(`🎯 Student IDs asignados: [${assignedStudentIds.join(', ')}]`);
    
    const studentsInCourse = assignedStudentIds
      .map(studentId => {
        const user = users.find(u => u.id === studentId && u.role === 'student');
        return user ? user.username : null;
      })
      .filter(username => username !== null);
    
    console.log(`👥 Usernames: [${studentsInCourse.join(', ')}]`);
    
    if (studentsInCourse.includes('felipe')) {
      console.log('✅ Felipe ESTÁ asignado al curso');
    } else {
      console.log('❌ Felipe NO está asignado al curso');
    }
  }
}

// 7️⃣ Simular creación de notificación
console.log('\n🧪 SIMULANDO CREACIÓN DE NOTIFICACIÓN:');
if (courseTasks.length > 0 && currentUser) {
  const testTask = courseTasks[0];
  
  // Simular la función createNewTaskNotifications
  console.log(`Simulando para tarea: "${testTask.title}"`);
  
  // Esta debería ser la lógica que usa TaskNotificationManager
  const courseId = testTask.courseSectionId || testTask.course;
  const courseData = getCourseDataFromCombinedId(courseId);
  
  if (courseData) {
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const { courseId: parsedCourseId, sectionId } = courseData;
    
    const assignedStudentIds = studentAssignments
      .filter(assignment => assignment.courseId === parsedCourseId && assignment.sectionId === sectionId)
      .map(assignment => assignment.studentId);
    
    const targetStudents = assignedStudentIds
      .map(studentId => {
        const user = users.find(u => u.id === studentId && u.role === 'student');
        return user ? { username: user.username, displayName: user.displayName || user.username } : null;
      })
      .filter(student => student !== null);
    
    console.log(`🎯 Estudiantes objetivo: [${targetStudents.map(s => s.username).join(', ')}]`);
    
    if (targetStudents.length > 0) {
      console.log('✅ Se encontraron estudiantes objetivo');
      console.log('💡 Las notificaciones DEBERÍAN crearse');
    } else {
      console.log('❌ NO se encontraron estudiantes objetivo');
      console.log('💡 Por eso no se crean notificaciones');
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🎯 PRÓXIMO PASO: Crear una nueva tarea desde el profesor para probar');
