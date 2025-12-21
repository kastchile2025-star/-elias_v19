// 🔧 SCRIPT DE DIAGNÓSTICO: Verificar notificaciones de "Todo el Curso"
// Copia y pega este código en la consola del navegador (F12)

console.clear();
console.log('🔧 DIAGNÓSTICO: Verificando notificaciones para "Todo el Curso"');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Verificar datos en localStorage
console.log('\n1️⃣ VERIFICANDO DATOS EN LOCALSTORAGE:');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

console.log(`📊 Usuarios totales: ${users.length}`);
console.log(`📋 Asignaciones de estudiantes: ${studentAssignments.length}`);
console.log(`📝 Tareas totales: ${tasks.length}`);

// 2️⃣ Buscar tareas asignadas a "Todo el Curso"
console.log('\n2️⃣ BUSCANDO TAREAS DE "TODO EL CURSO":');
const courseTasks = tasks.filter(task => task.assignedTo === 'course');
console.log(`🎯 Tareas de "Todo el Curso" encontradas: ${courseTasks.length}`);

courseTasks.forEach((task, index) => {
  console.log(`   ${index + 1}. "${task.title}" -> ${task.courseSectionId || task.course}`);
});

// 3️⃣ Simular creación de notificación para una tarea existente
if (courseTasks.length > 0) {
  console.log('\n3️⃣ SIMULANDO CREACIÓN DE NOTIFICACIÓN:');
  const testTask = courseTasks[0];
  const courseId = testTask.courseSectionId || testTask.course;
  
  console.log(`📌 Tarea seleccionada: "${testTask.title}"`);
  console.log(`📚 Course ID: "${courseId}"`);
  
  // Importar TaskNotificationManager (debe estar disponible globalmente)
  try {
    // Intentar acceder a TaskNotificationManager desde el contexto global
    if (typeof window !== 'undefined' && window.TaskNotificationManager) {
      console.log('✅ TaskNotificationManager disponible globalmente');
      
      // Simular creación de notificación
      window.TaskNotificationManager.createNewTaskNotifications(
        testTask.id,
        testTask.title,
        courseId,
        testTask.subject || 'Materia Test',
        testTask.createdBy || 'profesor.test',
        'Profesor Test',
        'assignment'
      );
      
      console.log('🎉 NOTIFICACIÓN CREADA - Verificar en localStorage:');
      const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
      console.log(`📬 Total notificaciones: ${notifications.length}`);
      
      const newTaskNotifications = notifications.filter(n => n.type === 'new_task' && n.taskId === testTask.id);
      console.log(`🎯 Notificaciones de nueva tarea: ${newTaskNotifications.length}`);
      
      if (newTaskNotifications.length > 0) {
        const notification = newTaskNotifications[0];
        console.log('📧 Notificación creada:', {
          id: notification.id,
          taskTitle: notification.taskTitle,
          course: notification.course,
          targetUsernames: notification.targetUsernames,
          type: notification.type
        });
        
        console.log(`👥 Destinatarios: [${notification.targetUsernames.join(', ')}]`);
        
        if (notification.targetUsernames.length > 0) {
          console.log('✅ ¡ÉXITO! La notificación tiene destinatarios para "Todo el Curso"');
        } else {
          console.log('❌ ERROR: La notificación no tiene destinatarios');
        }
      }
      
    } else {
      console.log('❌ TaskNotificationManager no disponible');
      console.log('💡 Necesitas importar el módulo o estar en la página correcta');
    }
    
  } catch (error) {
    console.error('❌ Error accediendo a TaskNotificationManager:', error);
  }
  
} else {
  console.log('⚠️ No se encontraron tareas de "Todo el Curso" para probar');
}

console.log('\n4️⃣ VERIFICACIÓN DE ESTUDIANTES POR CURSO:');
// Verificar qué estudiantes están asignados a cada curso
const courses = [...new Set(studentAssignments.map(a => `${a.courseId}-${a.sectionId}`))];
courses.forEach(courseId => {
  const studentsInCourse = studentAssignments
    .filter(a => `${a.courseId}-${a.sectionId}` === courseId)
    .map(a => {
      const user = users.find(u => u.id === a.studentId);
      return user ? user.username : a.studentId;
    });
  
  console.log(`📚 ${courseId}: [${studentsInCourse.join(', ')}] (${studentsInCourse.length} estudiantes)`);
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔧 DIAGNÓSTICO COMPLETADO');
console.log('📌 Para probar completamente, crear una nueva tarea desde el panel del profesor');
