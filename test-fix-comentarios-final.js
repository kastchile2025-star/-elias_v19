// Script final para probar la corrección de comentarios no leídos para estudiantes
// Ejecutar en la consola del navegador después de implementar las mejoras

console.log('🔍 PRUEBA FINAL: Comentarios No Leídos - Estudiante');
console.log('==================================================');

// Función para crear datos de prueba
function createTestData() {
  const testUser = {
    username: 'felipe_estudiante',
    role: 'student',
    id: 'felipe_123'
  };
  
  const testTask = {
    id: 'task_prueba_final',
    title: 'Prueba Final - Comentarios',
    assignedBy: 'profesor_martinez',
    course: '10A'
  };
  
  const testComments = [
    {
      id: 'comment_prueba_1',
      taskId: 'task_prueba_final',
      studentUsername: 'profesor_martinez',
      studentName: 'Prof. Martínez',
      comment: 'Excelente trabajo en el análisis histórico.',
      timestamp: new Date().toISOString(),
      isSubmission: false,
      userRole: 'teacher',
      readBy: [],
      isNew: true
    },
    {
      id: 'comment_prueba_2',
      taskId: 'task_prueba_final',
      studentUsername: 'profesor_martinez',
      studentName: 'Prof. Martínez',
      comment: 'Revisa las conclusiones, necesitan más profundidad.',
      timestamp: new Date().toISOString(),
      isSubmission: false,
      userRole: 'teacher',
      readBy: [],
      isNew: true
    }
  ];
  
  // Guardar datos
  localStorage.setItem('smart-student-user', JSON.stringify(testUser));
  
  const existingTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  existingTasks.push(testTask);
  localStorage.setItem('smart-student-tasks', JSON.stringify(existingTasks));
  
  const existingComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  testComments.forEach(comment => existingComments.push(comment));
  localStorage.setItem('smart-student-task-comments', JSON.stringify(existingComments));
  
  console.log('✅ Datos de prueba creados');
  console.log('👤 Usuario:', testUser.username);
  console.log('📝 Tarea:', testTask.title);
  console.log('💬 Comentarios:', testComments.length);
  
  return { testUser, testTask, testComments };
}

// Función para verificar el conteo inicial
function checkInitialCount() {
  const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  
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
  
  console.log('📊 Conteo inicial de comentarios no leídos:', unread.length);
  return unread.length;
}

// Función para simular marcado como leído
function simulateMarkAsRead(taskId, username) {
  console.log('🔧 Simulando marcado como leído...');
  
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  let updated = false;
  
  const updatedComments = comments.map((comment) => {
    if (
      comment.taskId === taskId && 
      !comment.isSubmission &&
      comment.studentUsername !== username &&
      (!comment.readBy?.includes(username))
    ) {
      updated = true;
      return {
        ...comment,
        isNew: false,
        readBy: [...(comment.readBy || []), username]
      };
    }
    return comment;
  });
  
  if (updated) {
    localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
    console.log('✅ Comentarios marcados como leídos');
    
    // Disparar eventos como lo hace la aplicación real
    document.dispatchEvent(new Event('commentsUpdated'));
    window.dispatchEvent(new CustomEvent('studentCommentsUpdated', { 
      detail: { 
        username: username,
        taskId: taskId,
        action: 'marked_as_read'
      } 
    }));
    
    console.log('📡 Eventos disparados');
  }
  
  return updated;
}

// Función para verificar el conteo final
function checkFinalCount() {
  // Esperar un poco para que los eventos se procesen
  setTimeout(() => {
    const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
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
    
    console.log('📊 Conteo final de comentarios no leídos:', unread.length);
    
    if (unread.length === 0) {
      console.log('✅ ¡ÉXITO! Los comentarios se marcaron correctamente como leídos');
    } else {
      console.log('❌ PROBLEMA: Algunos comentarios no se marcaron como leídos');
    }
  }, 500);
}

// Función para limpiar datos de prueba
function cleanup() {
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const filteredComments = comments.filter(c => !c.id.startsWith('comment_prueba_'));
  localStorage.setItem('smart-student-task-comments', JSON.stringify(filteredComments));
  
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const filteredTasks = tasks.filter(t => t.id !== 'task_prueba_final');
  localStorage.setItem('smart-student-tasks', JSON.stringify(filteredTasks));
  
  console.log('🧹 Datos de prueba limpiados');
}

// Función principal para ejecutar toda la prueba
function runFullTest() {
  console.log('🚀 Iniciando prueba completa...');
  
  // Paso 1: Crear datos de prueba
  const testData = createTestData();
  
  // Paso 2: Verificar conteo inicial
  const initialCount = checkInitialCount();
  
  // Paso 3: Simular marcado como leído
  const wasUpdated = simulateMarkAsRead(testData.testTask.id, testData.testUser.username);
  
  // Paso 4: Verificar conteo final
  checkFinalCount();
  
  // Paso 5: Programar limpieza
  setTimeout(() => {
    cleanup();
  }, 2000);
}

// Instrucciones
console.log('📋 INSTRUCCIONES:');
console.log('1. Ejecutar runFullTest() para prueba automática');
console.log('2. O ejecutar pasos individuales:');
console.log('   - createTestData()');
console.log('   - checkInitialCount()');
console.log('   - simulateMarkAsRead("task_prueba_final", "felipe_estudiante")');
console.log('   - checkFinalCount()');
console.log('   - cleanup()');
console.log('');
console.log('⚠️  IMPORTANTE: Ejecutar esto EN LA APLICACIÓN REAL para ver si los eventos');
console.log('    se propagan correctamente al dashboard.');

// Exportar funciones para uso manual
window.testComments = {
  runFullTest,
  createTestData,
  checkInitialCount,
  simulateMarkAsRead,
  checkFinalCount,
  cleanup
};
