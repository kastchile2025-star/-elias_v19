// Script para diagnosticar problema con comentarios no leídos de estudiantes
// Este script simula el problema reportado y ayuda a identificar la causa

console.log('🔍 DIAGNÓSTICO: Comentarios no leídos de estudiantes');
console.log('================================================');

// Simular datos de prueba
const testData = {
  user: {
    username: 'felipe_estudiante',
    role: 'student',
    id: 'felipe_123'
  },
  tasks: [
    {
      id: 'task_historia_1',
      title: 'Ensayo sobre la Revolución Industrial',
      assignedBy: 'profesor_martinez',
      course: '10A'
    }
  ],
  comments: [
    {
      id: 'comment_1',
      taskId: 'task_historia_1',
      studentUsername: 'profesor_martinez',
      studentName: 'Prof. Martínez',
      comment: 'Muy buen trabajo Felipe, pero necesitas mejorar las conclusiones.',
      timestamp: new Date().toISOString(),
      isSubmission: false,
      userRole: 'teacher',
      readBy: [], // COMENTARIO NO LEÍDO
      isNew: true
    },
    {
      id: 'comment_2',
      taskId: 'task_historia_1',
      studentUsername: 'profesor_martinez',
      studentName: 'Prof. Martínez',
      comment: 'Revisa las fuentes bibliográficas que te mencioné.',
      timestamp: new Date().toISOString(),
      isSubmission: false,
      userRole: 'teacher',
      readBy: [], // COMENTARIO NO LEÍDO
      isNew: true
    }
  ]
};

// Función para simular el conteo inicial del dashboard
function countUnreadComments(user, comments) {
  console.log('\n📊 CONTEO INICIAL DE COMENTARIOS NO LEÍDOS');
  console.log('==========================================');
  
  let unread = comments.filter((comment) => 
    comment.studentUsername !== user.username && // No contar los propios comentarios
    (!comment.readBy?.includes(user.username)) &&
    !comment.isSubmission // Excluir comentarios de entrega
  );

  // Eliminar duplicados
  unread = unread.filter((comment, idx, arr) =>
    arr.findIndex(c =>
      c.taskId === comment.taskId &&
      c.comment === comment.comment &&
      c.timestamp === comment.timestamp &&
      c.studentUsername === comment.studentUsername
    ) === idx
  );
  
  console.log(`👤 Usuario: ${user.username} (${user.role})`);
  console.log(`📝 Total comentarios: ${comments.length}`);
  console.log(`📩 Comentarios no leídos: ${unread.length}`);
  
  unread.forEach((comment, index) => {
    console.log(`   ${index + 1}. "${comment.comment}" por ${comment.studentName}`);
  });
  
  return unread.length;
}

// Función para simular la acción de marcar comentarios como leídos
function markCommentsAsRead(taskId, username, comments) {
  console.log('\n🔧 SIMULANDO MARCADO COMO LEÍDO');
  console.log('===============================');
  
  let updated = false;
  
  // Simular la lógica de markCommentsAsReadForTask
  const updatedComments = comments.map((comment) => {
    if (
      comment.taskId === taskId && 
      !comment.isSubmission &&  // No marcar entregas, solo comentarios
      comment.studentUsername !== username && // No marcar comentarios propios
      (!comment.readBy?.includes(username))
    ) {
      updated = true;
      console.log(`✅ Marcando como leído: "${comment.comment}" por ${comment.studentName}`);
      return {
        ...comment,
        isNew: false,
        readBy: [...(comment.readBy || []), username]
      };
    }
    return comment;
  });
  
  console.log(`🔄 Comentarios actualizados: ${updated ? 'SÍ' : 'NO'}`);
  return updatedComments;
}

// Función para simular la lógica del event listener
function handleCommentsUpdated(user, comments) {
  console.log('\n🔄 SIMULANDO handleCommentsUpdated');
  console.log('=================================');
  
  if (user?.role === 'student') {
    console.log('📚 Recargando comentarios no leídos para estudiante...');
    
    let unread = comments.filter((comment) => 
      comment.studentUsername !== user.username && 
      (!comment.readBy?.includes(user.username)) &&
      !comment.isSubmission
    );

    // Eliminar duplicados
    unread = unread.filter((comment, idx, arr) =>
      arr.findIndex((c) =>
        c.taskId === comment.taskId &&
        c.comment === comment.comment &&
        c.timestamp === comment.timestamp &&
        c.studentUsername === comment.studentUsername
      ) === idx
    );
    
    console.log(`📊 Nuevos comentarios no leídos: ${unread.length}`);
    return unread.length;
  }
  
  return 0;
}

// EJECUTAR DIAGNÓSTICO
console.log('\n🚀 INICIANDO DIAGNÓSTICO');
console.log('========================');

// 1. Contar comentarios no leídos inicialmente
const initialCount = countUnreadComments(testData.user, testData.comments);

// 2. Simular que el estudiante abre la tarea
console.log('\n👁️ ESTUDIANTE ABRE LA TAREA');
console.log('===========================');
const updatedComments = markCommentsAsRead('task_historia_1', testData.user.username, testData.comments);

// 3. Simular el evento de actualización
const newCount = handleCommentsUpdated(testData.user, updatedComments);

// 4. Verificar si el problema se resuelve
console.log('\n🎯 RESULTADO DEL DIAGNÓSTICO');
console.log('============================');
console.log(`📊 Comentarios no leídos ANTES: ${initialCount}`);
console.log(`📊 Comentarios no leídos DESPUÉS: ${newCount}`);
console.log(`✅ Problema resuelto: ${newCount === 0 ? 'SÍ' : 'NO'}`);

if (newCount > 0) {
  console.log('\n❌ PROBLEMA DETECTADO');
  console.log('=====================');
  console.log('Los comentarios no se están descontando correctamente.');
  console.log('Posibles causas:');
  console.log('1. El evento "commentsUpdated" no se está disparando');
  console.log('2. El dashboard no está escuchando el evento correctamente');
  console.log('3. Los comentarios no se están marcando como leídos correctamente');
  console.log('4. Hay un problema con el timing del evento');
} else {
  console.log('\n✅ LÓGICA CORRECTA');
  console.log('==================');
  console.log('La lógica de marcado funciona correctamente.');
  console.log('El problema podría estar en:');
  console.log('1. El evento no se está disparando en el momento correcto');
  console.log('2. El dashboard no está recibiendo el evento');
  console.log('3. Hay un problema con el timing de actualización');
}

// Función para probar en consola del navegador
function testInBrowser() {
  console.log('\n🌐 PARA PROBAR EN EL NAVEGADOR');
  console.log('==============================');
  console.log('1. Copia y pega este código en la consola del navegador');
  console.log('2. Abre la aplicación como estudiante');
  console.log('3. Verifica que hay comentarios no leídos en el dashboard');
  console.log('4. Abre una tarea con comentarios');
  console.log('5. Verifica si los comentarios se marcan como leídos');
  console.log('6. Verifica si el contador del dashboard se actualiza');
}

testInBrowser();
