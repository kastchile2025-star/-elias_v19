// 🔧 SCRIPT DE VERIFICACIÓN Y LIMPIEZA INMEDIATA
// Ejecutar este código en la consola del navegador (F12 → Console)

(function() {
  console.log("🚀 VERIFICACIÓN Y LIMPIEZA INMEDIATA DE NOTIFICACIONES CRUZADAS");
  console.log("=" .repeat(70));
  
  // 1. Obtener datos del sistema
  const notifications = JSON.parse(localStorage.getItem("smart-student-task-notifications") || "[]");
  const users = JSON.parse(localStorage.getItem("smart-student-users") || "[]");
  
  const teachers = users.filter(u => u.role === "teacher");
  const students = users.filter(u => u.role === "student");
  
  console.log("📊 ESTADO DEL SISTEMA:");
  console.log(`   📬 Total notificaciones: ${notifications.length}`);
  console.log(`   👨‍🏫 Profesores: ${teachers.length} (${teachers.map(t => t.username).join(', ')})`);
  console.log(`   👩‍🎓 Estudiantes: ${students.length} (${students.map(s => s.username).join(', ')})`);
  console.log("");
  
  // 2. Análisis detallado de notificaciones teacher_comment
  const teacherCommentNotifications = notifications.filter(n => n.type === "teacher_comment");
  console.log(`🔍 ANÁLISIS DE COMENTARIOS DE PROFESORES (${teacherCommentNotifications.length} notificaciones):`);
  
  let problemasEncontrados = 0;
  const notificacionesProblematicas = [];
  
  teacherCommentNotifications.forEach((notif, index) => {
    const fromUser = users.find(u => u.username === notif.fromUsername);
    const isFromTeacher = fromUser && fromUser.role === "teacher";
    
    if (isFromTeacher) {
      // Verificar destinatarios
      const teacherTargets = notif.targetUsernames.filter(target => 
        teachers.some(t => t.username === target || t.id === target)
      );
      
      const studentTargets = notif.targetUsernames.filter(target => {
        const targetUser = users.find(u => u.username === target || u.id === target);
        return targetUser && targetUser.role === "student";
      });
      
      console.log(`   ${index + 1}. De: ${notif.fromUsername} | Para: ${notif.targetUsernames.join(', ')} | Tarea: ${notif.taskTitle}`);
      console.log(`      📋 Estudiantes: ${studentTargets.length} | Profesores: ${teacherTargets.length}`);
      
      if (teacherTargets.length > 0) {
        console.log(`      🚨 PROBLEMA: Esta notificación tiene profesores como destinatarios!`);
        console.log(`      🎯 Profesores destinatarios: ${teacherTargets.join(', ')}`);
        problemasEncontrados++;
        notificacionesProblematicas.push(notif);
      } else {
        console.log(`      ✅ OK: Solo va a estudiantes`);
      }
      console.log("");
    }
  });
  
  console.log(`🚨 RESUMEN: ${problemasEncontrados} problemas encontrados`);
  console.log("");
  
  if (problemasEncontrados > 0) {
    console.log("🔧 APLICANDO CORRECCIÓN AUTOMÁTICA...");
    
    // 3. Eliminar todas las notificaciones problemáticas
    const notificacionesLimpias = notifications.filter(notif => {
      if (notif.type === "teacher_comment") {
        const fromUser = users.find(u => u.username === notif.fromUsername);
        if (fromUser && fromUser.role === "teacher") {
          // Verificar si tiene profesores como destinatarios
          const hasTeacherTargets = notif.targetUsernames.some(target => 
            teachers.some(t => t.username === target || t.id === target)
          );
          
          if (hasTeacherTargets) {
            console.log(`   🗑️ ELIMINANDO: ${notif.fromUsername} → ${notif.targetUsernames.join(', ')} (${notif.taskTitle})`);
            return false; // Eliminar esta notificación
          }
        }
      }
      return true; // Mantener todas las demás
    });
    
    // 4. Guardar cambios
    localStorage.setItem("smart-student-task-notifications", JSON.stringify(notificacionesLimpias));
    
    console.log(`✅ LIMPIEZA COMPLETADA:`);
    console.log(`   📬 Notificaciones originales: ${notifications.length}`);
    console.log(`   📬 Notificaciones después de limpieza: ${notificacionesLimpias.length}`);
    console.log(`   🗑️ Notificaciones eliminadas: ${notifications.length - notificacionesLimpias.length}`);
    
    // 5. Actualizar interfaz
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("taskNotificationsUpdated"));
    window.dispatchEvent(new CustomEvent("notificationSyncCompleted"));
    
    console.log("");
    console.log("🎉 PROBLEMA RESUELTO!");
    console.log("📱 Recarga las páginas de los profesores para ver los cambios");
    console.log("🔔 Las notificaciones de comentarios ahora solo aparecerán a los estudiantes");
    
  } else {
    console.log("✅ NO SE ENCONTRARON PROBLEMAS");
    console.log("🔔 El sistema de notificaciones está funcionando correctamente");
  }
  
  console.log("");
  console.log("=" .repeat(70));
})();
