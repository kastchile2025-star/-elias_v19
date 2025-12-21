// 🎯 VERIFICAR FORMATO FINAL DE NOTIFICACIONES EN UI
console.clear();
console.log('🎯 VERIFICACIÓN: Formato final de notificaciones en la UI');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ Obtener el usuario actual
const currentUser = JSON.parse(localStorage.getItem('smart-student-current-user') || '{}');
console.log(`👤 Usuario actual: ${currentUser.username} (${currentUser.role})`);

// 2️⃣ Obtener notificaciones del usuario
const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
const userNotifications = notifications.filter(n => 
  n.targetUsernames && n.targetUsernames.includes(currentUser.username)
);

console.log(`\n📬 Notificaciones para ${currentUser.username}: ${userNotifications.length}`);

if (userNotifications.length > 0) {
  console.log(`\n📋 FORMATO ESPERADO EN UI:`);
  console.log('   • Título de la tarea como encabezado');
  console.log('   • Curso y fecha como información secundaria');
  console.log('   • Badge del tipo de materia');
  
  console.log(`\n📧 TUS NOTIFICACIONES ACTUALES:`);
  
  userNotifications.forEach((notif, index) => {
    // Obtener información de la tarea
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const relatedTask = tasks.find(task => task.id === notif.taskId);
    
    console.log(`\n   ${index + 1}. NOTIFICACIÓN:`);
    console.log(`      🏷️  ID: ${notif.id}`);
    console.log(`      📋  Tipo: ${notif.type}`);
    
    // Campos para mostrar en UI
    console.log(`\n      📱 CAMPOS PARA UI:`);
    console.log(`         📝 taskTitle: "${notif.taskTitle || 'undefined'}"`);
    console.log(`         🏫 course: "${notif.course || 'undefined'}"`);
    console.log(`         📚 subject: "${notif.subject || 'undefined'}"`);
    console.log(`         🗓️ timestamp: "${notif.timestamp || 'undefined'}"`);
    console.log(`         👨‍🏫 fromDisplayName: "${notif.fromDisplayName || 'undefined'}"`);
    
    // Verificar campos de compatibilidad
    console.log(`\n      🔧 CAMPOS DE COMPATIBILIDAD:`);
    console.log(`         📝 title: ${notif.title ? `"${notif.title}"` : 'undefined'}`);
    console.log(`         💬 message: ${notif.message ? `"${notif.message}"` : 'undefined'}`);
    console.log(`         🗓️ createdAt: ${notif.createdAt ? `"${notif.createdAt}"` : 'undefined'}`);
    
    // Simular cómo se vería en la UI
    if (notif.taskTitle && notif.course && notif.timestamp) {
      const taskTitle = notif.taskTitle;
      const courseInfo = notif.course;
      const timestamp = new Date(notif.timestamp).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log(`\n      🎨 PREVIEW EN UI:`);
      console.log(`         📱 "${taskTitle}"`);
      console.log(`         📝 ${courseInfo} • ${timestamp}`);
      console.log(`         🏷️ Badge: "${notif.subject?.substring(0, 3).toUpperCase() || 'LEN'}"`);
      
      // Obtener nombre del curso más legible
      const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
      const courseData = courses.find(c => notif.course.includes(c.id));
      if (courseData) {
        console.log(`         📚 Curso legible: "${courseData.name}"`);
      }
      
    } else {
      console.log(`\n      ❌ FALTAN DATOS PARA UI COMPLETA`);
      const missing = [];
      if (!notif.taskTitle) missing.push('taskTitle');
      if (!notif.course) missing.push('course');
      if (!notif.timestamp) missing.push('timestamp');
      console.log(`         Faltantes: [${missing.join(', ')}]`);
    }
    
    // Verificar si la tarea relacionada es de "Todo el Curso"
    if (relatedTask) {
      console.log(`\n      📋 TAREA RELACIONADA:`);
      console.log(`         🎯 Tipo asignación: ${relatedTask.assignedTo}`);
      console.log(`         🏫 Course ID: ${relatedTask.course}`);
      console.log(`         📝 Título: ${relatedTask.title}`);
      
      if (relatedTask.assignedTo === 'course') {
        console.log(`         ✅ Esta es una tarea de "Todo el Curso"`);
      } else {
        console.log(`         ℹ️ Esta es una tarea de "Estudiantes Específicos"`);
      }
    }
  });
  
  // 3️⃣ Comparar formatos entre tipos
  const courseNotifications = userNotifications.filter(n => {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const task = tasks.find(t => t.id === n.taskId);
    return task && task.assignedTo === 'course';
  });
  
  const specificNotifications = userNotifications.filter(n => {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const task = tasks.find(t => t.id === n.taskId);
    return task && task.assignedTo === 'student';
  });
  
  console.log(`\n🔄 COMPARACIÓN DE FORMATOS:`);
  console.log(`   📊 Notificaciones "Todo el Curso": ${courseNotifications.length}`);
  console.log(`   📊 Notificaciones "Estudiantes Específicos": ${specificNotifications.length}`);
  
  if (courseNotifications.length > 0 && specificNotifications.length > 0) {
    const courseNotif = courseNotifications[0];
    const specificNotif = specificNotifications[0];
    
    console.log(`\n   🆚 COMPARACIÓN:`);
    console.log(`      Todo el Curso: "${courseNotif.taskTitle}" (${courseNotif.title ? 'CON title' : 'SIN title'})`);
    console.log(`      Específicos: "${specificNotif.taskTitle}" (${specificNotif.title ? 'CON title' : 'SIN title'})`);
    
    const sameFormat = (courseNotif.title !== undefined) === (specificNotif.title !== undefined);
    if (sameFormat) {
      console.log(`      ✅ FORMATOS CONSISTENTES`);
    } else {
      console.log(`      ❌ FORMATOS INCONSISTENTES`);
    }
  }
  
} else {
  console.log(`\n⚠️ No tienes notificaciones. Cambia a un usuario estudiante (felipe/maria)`);
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🎯 SIGUIENTE PASO: Ve a la campaña de notificaciones en la UI');
console.log('📱 Verifica que se muestren como en la imagen de referencia');
