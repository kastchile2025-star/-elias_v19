// 🔍 COMPARACIÓN: ¿Por qué funcionan "Estudiantes Específicos" pero no "Todo el Curso"?
console.clear();
console.log('🔍 COMPARANDO: Estudiantes Específicos vs Todo el Curso');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Obtener datos
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');

console.log(`📊 Datos: ${users.length} usuarios, ${tasks.length} tareas, ${notifications.length} notificaciones`);

// 2️⃣ Buscar estudiante felipe
const felipe = users.find(u => u.username === 'felipe');
if (!felipe) {
  console.log('❌ No se encontró felipe');
  return;
}

console.log(`\n👤 Felipe: ${felipe.username} (ID: ${felipe.id})`);

// 3️⃣ Analizar tareas de "Estudiantes Específicos" QUE SÍ FUNCIONAN
console.log('\n✅ TAREAS DE "ESTUDIANTES ESPECÍFICOS" (funcionan):');
const studentSpecificTasks = tasks.filter(task => task.assignedTo === 'student');

studentSpecificTasks.forEach((task, index) => {
  console.log(`\n${index + 1}. "${task.title}"`);
  console.log(`   📋 assignedTo: ${task.assignedTo}`);
  console.log(`   🎯 assignedStudentIds: [${task.assignedStudentIds?.join(', ') || 'none'}]`);
  
  // Verificar si felipe está asignado
  const felipeAssigned = task.assignedStudentIds?.includes(felipe.id);
  console.log(`   👤 Felipe asignado: ${felipeAssigned ? '✅' : '❌'}`);
  
  // Buscar notificaciones para esta tarea
  const taskNotifications = notifications.filter(n => n.taskId === task.id);
  console.log(`   🔔 Notificaciones totales: ${taskNotifications.length}`);
  
  const felipeNotifications = taskNotifications.filter(n => 
    n.targetUsernames.includes(felipe.username) || 
    n.targetUsernames.includes(felipe.id)
  );
  console.log(`   📬 Notificaciones para Felipe: ${felipeNotifications.length}`);
  
  if (felipeNotifications.length > 0) {
    felipeNotifications.forEach(notif => {
      console.log(`      📧 ${notif.type} - Targets: [${notif.targetUsernames.join(', ')}]`);
    });
  }
});

// 4️⃣ Analizar tareas de "Todo el Curso" QUE NO FUNCIONAN
console.log('\n❌ TAREAS DE "TODO EL CURSO" (no funcionan):');
const courseTasks = tasks.filter(task => task.assignedTo === 'course');

courseTasks.forEach((task, index) => {
  console.log(`\n${index + 1}. "${task.title}"`);
  console.log(`   📋 assignedTo: ${task.assignedTo}`);
  console.log(`   📚 course: ${task.course}`);
  console.log(`   📚 courseSectionId: ${task.courseSectionId}`);
  
  // Buscar notificaciones para esta tarea
  const taskNotifications = notifications.filter(n => n.taskId === task.id);
  console.log(`   🔔 Notificaciones totales: ${taskNotifications.length}`);
  
  taskNotifications.forEach(notif => {
    console.log(`      📧 ${notif.type} - From: ${notif.fromUsername} - Targets: [${notif.targetUsernames.join(', ')}]`);
  });
  
  const felipeNotifications = taskNotifications.filter(n => 
    n.targetUsernames.includes(felipe.username) || 
    n.targetUsernames.includes(felipe.id)
  );
  console.log(`   📬 Notificaciones para Felipe: ${felipeNotifications.length}`);
  
  // Verificar si Felipe debería estar asignado
  const courseId = task.courseSectionId || task.course;
  console.log(`   🔍 Verificando asignación de Felipe al curso: ${courseId}`);
  
  // Usar la función corregida
  function getCourseDataFromCombinedId(combinedId) {
    if (!combinedId) return null;
    
    const parts = combinedId.split('-');
    if (parts.length === 5) {
      // ID simple - buscar sección por defecto
      const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
      const assignmentsForCourse = studentAssignments.filter(assignment => assignment.courseId === combinedId);
      if (assignmentsForCourse.length > 0) {
        return { courseId: combinedId, sectionId: assignmentsForCourse[0].sectionId };
      }
      return null;
    } else if (parts.length === 10) {
      // ID combinado
      return { 
        courseId: parts.slice(0, 5).join('-'), 
        sectionId: parts.slice(5, 10).join('-') 
      };
    }
    return null;
  }
  
  const courseData = getCourseDataFromCombinedId(courseId);
  if (courseData) {
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const felipeAssignment = studentAssignments.find(assignment => 
      assignment.studentId === felipe.id &&
      assignment.courseId === courseData.courseId && 
      assignment.sectionId === courseData.sectionId
    );
    
    console.log(`   👤 Felipe debería estar asignado: ${felipeAssignment ? '✅' : '❌'}`);
    if (felipeAssignment) {
      console.log(`      📋 Assignment: courseId=${felipeAssignment.courseId}, sectionId=${felipeAssignment.sectionId}`);
    }
  } else {
    console.log(`   ❌ No se pudo parsear el courseId: ${courseId}`);
  }
});

// 5️⃣ Comparar la lógica de creación
console.log('\n🔍 ANÁLISIS DE DIFERENCIAS:');
console.log('✅ Estudiantes Específicos:');
console.log('   - assignedTo: "student"');
console.log('   - assignedStudentIds: [array de IDs]');
console.log('   - Lógica: if (task.assignedTo === "student" && task.assignedStudentIds)');

console.log('\n❌ Todo el Curso:');
console.log('   - assignedTo: "course"');
console.log('   - course/courseSectionId: string con ID');
console.log('   - Lógica: else { getStudentsInCourse(course) }');

// 6️⃣ Simular la lógica de createNewTaskNotifications
console.log('\n🧪 SIMULANDO createNewTaskNotifications:');

if (courseTasks.length > 0) {
  const testTask = courseTasks[0];
  console.log(`\nSimulando para: "${testTask.title}"`);
  
  console.log('📋 Verificando condición assignedTo === "student":');
  console.log(`   task.assignedTo: "${testTask.assignedTo}"`);
  console.log(`   task.assignedStudentIds: ${testTask.assignedStudentIds || 'undefined'}`);
  
  if (testTask.assignedTo === 'student' && testTask.assignedStudentIds) {
    console.log('   ✅ Entrará en rama de estudiantes específicos');
  } else {
    console.log('   ❌ NO entrará en rama de estudiantes específicos');
    console.log('   🔄 Entrará en rama de getStudentsInCourse');
    
    // Simular getStudentsInCourse
    const course = testTask.courseSectionId || testTask.course;
    console.log(`   🔍 Llamando getStudentsInCourse("${course}")`);
    
    // Esta es la lógica que debería ejecutarse
    console.log('   📝 Lógica que se ejecuta:');
    console.log('      1. getCourseDataFromCombinedId()');
    console.log('      2. Buscar asignaciones de estudiantes');
    console.log('      3. Filtrar por courseId y sectionId');
    console.log('      4. Convertir IDs a usernames');
  }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🎯 PRÓXIMO PASO: Verificar la implementación real de createNewTaskNotifications');
