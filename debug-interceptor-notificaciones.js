// 🔧 DEBUG DIRECTO: Interceptar createNewTaskNotifications
console.clear();
console.log('🔧 DEBUG: Interceptando createNewTaskNotifications');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Verificar si TaskNotificationManager está disponible
if (typeof window !== 'undefined' && window.TaskNotificationManager) {
  console.log('✅ TaskNotificationManager encontrado');
  
  // 2️⃣ Guardar la función original
  const originalCreateNewTaskNotifications = window.TaskNotificationManager.createNewTaskNotifications;
  
  // 3️⃣ Interceptar la función con logging detallado
  window.TaskNotificationManager.createNewTaskNotifications = function(
    taskId, taskTitle, course, subject, teacherUsername, teacherDisplayName, taskType
  ) {
    console.log('\n🚨 INTERCEPTADO: createNewTaskNotifications');
    console.log('📊 Parámetros recibidos:');
    console.log(`   taskId: ${taskId}`);
    console.log(`   taskTitle: ${taskTitle}`);
    console.log(`   course: ${course}`);
    console.log(`   subject: ${subject}`);
    console.log(`   teacherUsername: ${teacherUsername}`);
    console.log(`   teacherDisplayName: ${teacherDisplayName}`);
    console.log(`   taskType: ${taskType}`);
    
    // 4️⃣ Verificar la tarea en localStorage
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const currentTask = tasks.find(task => task.id === taskId);
    
    if (currentTask) {
      console.log('\n📋 Tarea encontrada en localStorage:');
      console.log(`   assignedTo: ${currentTask.assignedTo}`);
      console.log(`   assignedStudentIds: ${currentTask.assignedStudentIds}`);
      console.log(`   course: ${currentTask.course}`);
      console.log(`   courseSectionId: ${currentTask.courseSectionId}`);
      
      // 5️⃣ Simular la lógica de decisión
      if (currentTask.assignedTo === 'student' && currentTask.assignedStudentIds) {
        console.log('\n✅ RAMA: Estudiantes específicos');
        console.log(`   Estudiantes asignados: [${currentTask.assignedStudentIds.join(', ')}]`);
      } else {
        console.log('\n🔄 RAMA: Todo el curso');
        console.log(`   Llamando getStudentsInCourse("${course}")`);
        
        // 6️⃣ Simular getStudentsInCourse manualmente
        console.log('\n🧪 SIMULANDO getStudentsInCourse:');
        
        function debugGetCourseDataFromCombinedId(combinedId) {
          console.log(`   📋 Parsing: "${combinedId}"`);
          
          if (!combinedId) {
            console.log('   ❌ ID vacío');
            return null;
          }
          
          const parts = combinedId.split('-');
          console.log(`   🔍 Parts: ${parts.length} [${parts.join(', ')}]`);
          
          if (parts.length === 5) {
            console.log('   📝 ID simple detectado');
            const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
            const assignmentsForCourse = studentAssignments.filter(assignment => assignment.courseId === combinedId);
            
            if (assignmentsForCourse.length > 0) {
              const sectionId = assignmentsForCourse[0].sectionId;
              console.log(`   ✅ Fallback sección: ${sectionId}`);
              return { courseId: combinedId, sectionId };
            } else {
              console.log('   ❌ No se encontraron asignaciones para ID simple');
              return null;
            }
          } else if (parts.length === 10) {
            console.log('   📝 ID combinado detectado');
            const courseId = parts.slice(0, 5).join('-');
            const sectionId = parts.slice(5, 10).join('-');
            console.log(`   ✅ Parsed: courseId=${courseId}, sectionId=${sectionId}`);
            return { courseId, sectionId };
          } else {
            console.log(`   ❌ Formato inesperado: ${parts.length} partes`);
            return null;
          }
        }
        
        const courseData = debugGetCourseDataFromCombinedId(course);
        
        if (courseData) {
          const { courseId, sectionId } = courseData;
          console.log(`   🎯 Buscando estudiantes para: courseId=${courseId}, sectionId=${sectionId}`);
          
          const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
          const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
          
          const assignedStudentIds = studentAssignments
            .filter(assignment => assignment.courseId === courseId && assignment.sectionId === sectionId)
            .map(assignment => assignment.studentId);
          
          console.log(`   📊 Student IDs encontrados: [${assignedStudentIds.join(', ')}]`);
          
          const targetStudents = assignedStudentIds
            .map(studentId => {
              const user = users.find(u => u.id === studentId && u.role === 'student');
              return user ? { username: user.username, displayName: user.displayName || user.username } : null;
            })
            .filter(student => student !== null);
          
          console.log(`   👥 Target students: [${targetStudents.map(s => s.username).join(', ')}]`);
          
          if (targetStudents.length > 0) {
            console.log('   ✅ Se encontraron estudiantes objetivo');
          } else {
            console.log('   ❌ NO se encontraron estudiantes objetivo');
          }
        } else {
          console.log('   ❌ No se pudo parsear el courseId');
        }
      }
    } else {
      console.log('\n❌ Tarea NO encontrada en localStorage');
    }
    
    console.log('\n🔄 Ejecutando función original...');
    
    // 7️⃣ Llamar a la función original
    const result = originalCreateNewTaskNotifications.call(this, 
      taskId, taskTitle, course, subject, teacherUsername, teacherDisplayName, taskType
    );
    
    console.log('✅ Función original ejecutada');
    
    // 8️⃣ Verificar notificaciones creadas
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const newTaskNotifications = notifications.filter(n => n.taskId === taskId && n.type === 'new_task');
    
    console.log(`\n📬 Notificaciones creadas para taskId ${taskId}: ${newTaskNotifications.length}`);
    newTaskNotifications.forEach(notif => {
      console.log(`   📧 Targets: [${notif.targetUsernames.join(', ')}]`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    
    return result;
  };
  
  console.log('🎯 Interceptor instalado. Crea una nueva tarea para ver el debug.');
  
} else {
  console.log('❌ TaskNotificationManager no disponible');
  console.log('💡 Ve a la página de tareas (/dashboard/tareas) e inténtalo de nuevo');
}

console.log('\n📝 Instrucciones:');
console.log('1. Ejecuta este script en la página de tareas');
console.log('2. Crea una nueva tarea asignada a "Todo el Curso"');
console.log('3. Observa los logs detallados en la consola');
