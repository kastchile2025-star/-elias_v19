// Script para probar la corrección de comentarios no leídos para estudiantes
// Ejecutar en la consola del navegador

console.log('🔍 PRUEBA: Corrección de Comentarios No Leídos - Estudiante');
console.log('============================================================');

// Función para crear datos de prueba
function setupStudentCommentTest() {
  console.log('🔧 Configurando datos de prueba...');
  
  // Usuario estudiante
  const studentUser = {
    username: 'felipe_estudiante',
    role: 'student',
    id: 'felipe_123'
  };
  localStorage.setItem('smart-student-user', JSON.stringify(studentUser));
  
  // Tarea de prueba
  const testTask = {
    id: 'task_prueba_comentarios_estudiante',
    title: 'Prueba Comentarios Estudiante',
    assignedBy: 'profesor_martinez',
    course: '10A'
  };
  
  const existingTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  // Verificar si ya existe para no duplicar
  if (!existingTasks.find(t => t.id === testTask.id)) {
    existingTasks.push(testTask);
    localStorage.setItem('smart-student-tasks', JSON.stringify(existingTasks));
  }
  
  // Comentarios de prueba NO LEÍDOS
  const testComments = [
    {
      id: 'comment_prueba_estudiante_1',
      taskId: 'task_prueba_comentarios_estudiante',
      studentUsername: 'profesor_martinez',
      studentName: 'Prof. Martínez',
      comment: 'Excelente análisis Felipe, muy bien estructurado.',
      timestamp: new Date().toISOString(),
      isSubmission: false,
      userRole: 'teacher',
      readBy: [],
      isNew: true
    },
    {
      id: 'comment_prueba_estudiante_2',
      taskId: 'task_prueba_comentarios_estudiante',
      studentUsername: 'profesor_martinez',
      studentName: 'Prof. Martínez',
      comment: 'Revisa las conclusiones para agregar más detalle.',
      timestamp: new Date().toISOString(),
      isSubmission: false,
      userRole: 'teacher',
      readBy: [],
      isNew: true
    }
  ];
  
  const existingComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  
  // Limpiar comentarios de prueba anteriores
  const filteredComments = existingComments.filter(c => !c.id.startsWith('comment_prueba_estudiante_'));
  
  // Agregar nuevos comentarios
  testComments.forEach(comment => filteredComments.push(comment));
  localStorage.setItem('smart-student-task-comments', JSON.stringify(filteredComments));
  
  console.log('✅ Datos configurados:');
  console.log('👤 Usuario:', studentUser.username);
  console.log('📝 Tarea:', testTask.title);
  console.log('💬 Comentarios no leídos:', testComments.length);
  
  return { studentUser, testTask, testComments };
}

// Función para verificar conteo inicial
function checkInitialCount() {
  const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  
  // Replicar la lógica del dashboard
  let unread = comments.filter((comment) => 
    comment.studentUsername !== user.username && 
    (!comment.readBy?.includes(user.username)) &&
    !comment.isSubmission
  );

  unread = unread.filter((comment, idx, arr) =>
    arr.findIndex(c =>
      c.taskId === comment.taskId &&
      c.comment === comment.comment &&
      c.timestamp === comment.timestamp &&
      c.studentUsername === comment.studentUsername
    ) === idx
  );
  
  console.log('📊 Comentarios no leídos iniciales:', unread.length);
  
  if (unread.length > 0) {
    console.log('📝 Detalles:');
    unread.forEach((comment, index) => {
      console.log(`   ${index + 1}. "${comment.comment}" por ${comment.studentName}`);
    });
  }
  
  return unread.length;
}

// Función para simular clic en "Ver Comentario"
function simulateViewComment(commentId) {
  console.log(`🔔 Simulando clic en "Ver Comentario" para ID: ${commentId}`);
  
  const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  let hasUpdates = false;
  
  const updatedComments = comments.map((comment) => {
    if (comment.id === commentId && !comment.readBy?.includes(user.username)) {
      hasUpdates = true;
      console.log(`✅ Marcando como leído: "${comment.comment}"`);
      return {
        ...comment,
        isNew: false,
        readBy: [...(comment.readBy || []), user.username]
      };
    }
    return comment;
  });
  
  if (hasUpdates) {
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    
    // Disparar eventos como lo hace la aplicación real
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('updateDashboardCounts', {
        detail: { userRole: user.role, action: 'single_comment_read' }
      }));
    }, 100);
    
    window.dispatchEvent(new CustomEvent('studentCommentsUpdated', { 
      detail: { 
        username: user.username,
        taskId: 'task_prueba_comentarios_estudiante',
        commentId: commentId,
        action: 'single_comment_viewed'
      } 
    }));
    
    document.dispatchEvent(new Event('commentsUpdated'));
    
    console.log('📡 Eventos disparados para "Ver Comentario"');
  }
  
  return hasUpdates;
}

// Función para simular "Marcar todo como leído"
function simulateMarkAllRead() {
  console.log('🔔 Simulando "Marcar todo como leído"...');
  
  const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  let hasUpdates = false;
  
  const updatedComments = comments.map(comment => {
    if (!comment.readBy?.includes(user.username) && comment.studentUsername !== user.username) {
      hasUpdates = true;
      console.log(`✅ Marcando como leído: "${comment.comment}"`);
      return {
        ...comment,
        isNew: false,
        readBy: [...(comment.readBy || []), user.username]
      };
    }
    return comment;
  });
  
  if (hasUpdates) {
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    
    // Disparar eventos como lo hace la aplicación real
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('updateDashboardCounts', {
        detail: { userRole: user.role, action: 'mark_all_read' }
      }));
    }, 100);
    
    window.dispatchEvent(new CustomEvent('studentCommentsUpdated', { 
      detail: { 
        username: user.username,
        action: 'mark_all_read'
      } 
    }));
    
    document.dispatchEvent(new Event('commentsUpdated'));
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    
    console.log('📡 Eventos disparados para "Marcar todo como leído"');
  }
  
  return hasUpdates;
}

// Función para verificar conteo final
function checkFinalCount() {
  setTimeout(() => {
    const finalCount = checkInitialCount();
    
    if (finalCount === 0) {
      console.log('✅ ¡ÉXITO! Los comentarios se marcaron correctamente como leídos');
      console.log('🔔 La burbuja de notificaciones debería mostrar 0');
    } else {
      console.log('❌ PROBLEMA: Algunos comentarios no se marcaron como leídos');
      console.log(`🔔 La burbuja de notificaciones sigue mostrando ${finalCount}`);
    }
  }, 1000);
}

// Función para limpiar datos de prueba
function cleanup() {
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const filteredComments = comments.filter(c => !c.id.startsWith('comment_prueba_estudiante_'));
  localStorage.setItem('smart-student-task-comments', JSON.stringify(filteredComments));
  
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const filteredTasks = tasks.filter(t => t.id !== 'task_prueba_comentarios_estudiante');
  localStorage.setItem('smart-student-tasks', JSON.stringify(filteredTasks));
  
  console.log('🧹 Datos de prueba limpiados');
}

// PRUEBA COMPLETA AUTOMÁTICA
function runCompleteTest() {
  console.log('🚀 Ejecutando prueba completa...');
  
  // 1. Configurar datos
  const testData = setupStudentCommentTest();
  
  // 2. Verificar conteo inicial
  const initialCount = checkInitialCount();
  
  console.log('\n🔔 Probando "Ver Comentario" individual...');
  // 3. Probar "Ver Comentario" en el primer comentario
  simulateViewComment(testData.testComments[0].id);
  
  setTimeout(() => {
    const afterViewCount = checkInitialCount();
    console.log(`📊 Después de "Ver Comentario": ${afterViewCount} (debería ser ${initialCount - 1})`);
    
    console.log('\n🔔 Probando "Marcar todo como leído"...');
    // 4. Probar "Marcar todo como leído"
    simulateMarkAllRead();
    
    // 5. Verificar resultado final
    checkFinalCount();
    
    // 6. Limpiar después de un tiempo
    setTimeout(() => {
      cleanup();
    }, 3000);
    
  }, 1000);
}

// INSTRUCCIONES
console.log('📋 INSTRUCCIONES DE USO:');
console.log('');
console.log('1. PRUEBA AUTOMÁTICA COMPLETA:');
console.log('   runCompleteTest()');
console.log('');
console.log('2. PRUEBAS INDIVIDUALES:');
console.log('   setupStudentCommentTest()  // Crear datos');
console.log('   checkInitialCount()        // Ver conteo actual');
console.log('   simulateViewComment("comment_prueba_estudiante_1")  // Probar ver comentario');
console.log('   simulateMarkAllRead()      // Probar marcar todo');
console.log('   checkFinalCount()          // Ver resultado');
console.log('   cleanup()                  // Limpiar datos');
console.log('');
console.log('⚠️  IMPORTANTE: Ejecutar en la aplicación real con dashboard abierto');
console.log('🔔 Observar si la burbuja de notificaciones se actualiza correctamente');

// Exportar funciones
window.studentCommentTest = {
  runCompleteTest,
  setupStudentCommentTest,
  checkInitialCount,
  simulateViewComment,
  simulateMarkAllRead,
  checkFinalCount,
  cleanup
};
