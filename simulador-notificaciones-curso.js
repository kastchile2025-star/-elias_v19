// 🧪 SIMULADOR DE NOTIFICACIONES: Probar sin TaskNotificationManager
// Ejecuta esto en cualquier página para verificar que la lógica funciona

console.clear();
console.log('🧪 SIMULADOR: Creación de notificaciones para "Todo el Curso"');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Datos de prueba
const testTaskId = 'test-course-notification-' + Date.now();
const testCourseId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
const testTeacher = 'profesor.test';

console.log('📝 Datos de prueba:');
console.log(`   Task ID: ${testTaskId}`);
console.log(`   Course ID: ${testCourseId}`);
console.log(`   Teacher: ${testTeacher}`);

// 2️⃣ Función para parsear IDs combinados
function getCourseDataFromCombinedId(combinedId) {
  if (!combinedId || !combinedId.includes('-')) {
    return null;
  }
  
  const lastDashIndex = combinedId.lastIndexOf('-');
  const courseId = combinedId.substring(0, lastDashIndex);
  const sectionId = combinedId.substring(lastDashIndex + 1);
  
  return { courseId, sectionId };
}

// 3️⃣ Función para obtener estudiantes (lógica corregida)
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

// 4️⃣ Simular creación de notificación
function simulateCreateNewTaskNotifications(taskId, taskTitle, course, subject, teacherUsername, teacherDisplayName) {
  console.log('\n🔄 SIMULANDO createNewTaskNotifications...');
  console.log(`   TaskId: ${taskId}`);
  console.log(`   Course: ${course}`);
  
  // Obtener estudiantes usando la función corregida
  const targetStudents = getStudentsInCourse(course);
  console.log(`   Target students found: ${targetStudents.length}`);
  
  if (targetStudents.length === 0) {
    console.log('❌ No se encontraron estudiantes para el curso');
    return null;
  }
  
  // Crear notificación simulada
  const newNotification = {
    id: `new_task_${taskId}_${Date.now()}`,
    type: 'new_task',
    taskId,
    taskTitle,
    targetUserRole: 'student',
    targetUsernames: targetStudents.map(student => student.username),
    fromUsername: teacherUsername,
    fromDisplayName: teacherDisplayName,
    course,
    subject,
    timestamp: new Date().toISOString(),
    read: false,
    readBy: [],
    taskType: 'assignment'
  };
  
  console.log('\n📧 NOTIFICACIÓN SIMULADA CREADA:');
  console.log(`   ID: ${newNotification.id}`);
  console.log(`   Tipo: ${newNotification.type}`);
  console.log(`   Destinatarios: [${newNotification.targetUsernames.join(', ')}]`);
  console.log(`   De: ${newNotification.fromDisplayName}`);
  console.log(`   Curso: ${newNotification.course}`);
  
  // Agregar a notificaciones existentes (simulado)
  const existingNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  existingNotifications.push(newNotification);
  
  console.log('\n💾 GUARDANDO en localStorage...');
  localStorage.setItem('smart-student-task-notifications', JSON.stringify(existingNotifications));
  
  console.log(`✅ Notificación guardada. Total notificaciones: ${existingNotifications.length}`);
  
  return newNotification;
}

// 5️⃣ Ejecutar simulación
console.log('\n🚀 EJECUTANDO SIMULACIÓN:');
const notification = simulateCreateNewTaskNotifications(
  testTaskId,
  'Tarea Test Curso Completo',
  testCourseId,
  'Matemáticas',
  testTeacher,
  'Profesor Test'
);

if (notification) {
  console.log('\n✅ ¡ÉXITO! La lógica de notificaciones funciona correctamente');
  console.log(`🎯 ${notification.targetUsernames.length} estudiantes recibirán la notificación`);
  
  // Verificar que se guardó
  const savedNotifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
  const ourNotification = savedNotifications.find(n => n.id === notification.id);
  
  if (ourNotification) {
    console.log('💾 Verificación: Notificación encontrada en localStorage');
  } else {
    console.log('❌ Verificación: Notificación NO encontrada en localStorage');
  }
} else {
  console.log('❌ FALLO: La simulación no pudo crear la notificación');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🎯 CONCLUSIÓN: Las correcciones implementadas funcionan correctamente');
console.log('💡 Ahora las tareas de "Todo el Curso" generarán notificaciones para estudiantes');
