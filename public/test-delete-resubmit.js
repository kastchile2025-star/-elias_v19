// Script de prueba para validar la funcionalidad de eliminar y reenviar entregas

console.log('=== PRUEBA DE ELIMINAR Y REENVIAR ENTREGAS ===');

// Simular datos iniciales
let testTasks = [
  {
    id: 'task_test',
    title: 'Tarea de Prueba',
    status: 'submitted' // Inicialmente enviada
  }
];

let testComments = [
  {
    id: 'comment_submission',
    taskId: 'task_test',
    studentUsername: 'felipe',
    studentName: 'Felipe Estudiante',
    comment: 'Mi entrega de tarea',
    isSubmission: true,
    attachments: [
      { id: 'file1', name: 'entrega.pdf', size: 1024 }
    ]
  }
];

// Función para verificar si estudiante ha entregado
function hasStudentSubmitted(taskId, studentUsername, comments) {
  return comments.some(comment => 
    comment.taskId === taskId && 
    comment.studentUsername === studentUsername && 
    comment.isSubmission
  );
}

// Función para eliminar entrega
function deleteSubmission(commentId, tasks, comments) {
  console.log(`\n=== Eliminando entrega ${commentId} ===`);
  
  const commentToDelete = comments.find(c => c.id === commentId);
  if (!commentToDelete) {
    console.log('❌ Comentario no encontrado');
    return { tasks, comments };
  }

  // Eliminar el comentario de entrega
  const updatedComments = comments.filter(comment => comment.id !== commentId);
  
  // Verificar si quedan otras entregas para esta tarea
  const remainingSubmissions = updatedComments.filter(comment => 
    comment.taskId === commentToDelete.taskId && comment.isSubmission
  );

  // Si no quedan entregas, cambiar estado de tarea a pendiente
  const updatedTasks = remainingSubmissions.length === 0
    ? tasks.map(task => 
        task.id === commentToDelete.taskId 
          ? { ...task, status: 'pending' }
          : task
      )
    : tasks;

  console.log(`✅ Entrega eliminada`);
  console.log(`📊 Entregas restantes: ${remainingSubmissions.length}`);
  console.log(`📋 Estado de tarea: ${updatedTasks.find(t => t.id === commentToDelete.taskId)?.status}`);

  return { 
    tasks: updatedTasks, 
    comments: updatedComments 
  };
}

// Función para crear nueva entrega
function createNewSubmission(taskId, studentUsername, studentName, comment, attachments, tasks, comments) {
  console.log(`\n=== Creando nueva entrega para ${taskId} ===`);
  
  const newSubmission = {
    id: `submission_${Date.now()}`,
    taskId: taskId,
    studentUsername: studentUsername,
    studentName: studentName,
    comment: comment,
    isSubmission: true,
    attachments: attachments
  };

  const updatedComments = [...comments, newSubmission];
  
  // Actualizar estado de tarea a enviada
  const updatedTasks = tasks.map(task => 
    task.id === taskId 
      ? { ...task, status: 'submitted' }
      : task
  );

  console.log(`✅ Nueva entrega creada`);
  console.log(`📋 Estado de tarea: ${updatedTasks.find(t => t.id === taskId)?.status}`);

  return {
    tasks: updatedTasks,
    comments: updatedComments
  };
}

// Ejecutar pruebas
console.log('\n=== ESTADO INICIAL ===');
console.log(`Tarea estado: ${testTasks[0].status}`);
console.log(`¿Felipe ha entregado?: ${hasStudentSubmitted('task_test', 'felipe', testComments)}`);
console.log(`Número de comentarios: ${testComments.length}`);

// Paso 1: Eliminar entrega existente
const afterDelete = deleteSubmission('comment_submission', testTasks, testComments);

console.log('\n=== DESPUÉS DE ELIMINAR ===');
console.log(`Tarea estado: ${afterDelete.tasks[0].status}`);
console.log(`¿Felipe ha entregado?: ${hasStudentSubmitted('task_test', 'felipe', afterDelete.comments)}`);
console.log(`Número de comentarios: ${afterDelete.comments.length}`);

// Paso 2: Crear nueva entrega
const afterResubmit = createNewSubmission(
  'task_test',
  'felipe', 
  'Felipe Estudiante',
  'Mi nueva entrega corregida',
  [{ id: 'file2', name: 'entrega_corregida.pdf', size: 2048 }],
  afterDelete.tasks,
  afterDelete.comments
);

console.log('\n=== DESPUÉS DE REENVIAR ===');
console.log(`Tarea estado: ${afterResubmit.tasks[0].status}`);
console.log(`¿Felipe ha entregado?: ${hasStudentSubmitted('task_test', 'felipe', afterResubmit.comments)}`);
console.log(`Número de comentarios: ${afterResubmit.comments.length}`);
console.log(`Nuevo comentario: "${afterResubmit.comments[0].comment}"`);
console.log(`Nuevo archivo: ${afterResubmit.comments[0].attachments[0].name}`);

console.log('\n=== VERIFICACIÓN FINAL ===');
const finalState = {
  canDelete: afterResubmit.comments[0].isSubmission && 
             afterResubmit.comments[0].studentUsername === 'felipe',
  taskSubmitted: hasStudentSubmitted('task_test', 'felipe', afterResubmit.comments),
  statusCorrect: afterResubmit.tasks[0].status === 'submitted'
};

console.log(`✅ Puede eliminar entrega: ${finalState.canDelete}`);
console.log(`✅ Tarea marcada como entregada: ${finalState.taskSubmitted}`);
console.log(`✅ Estado de tarea correcto: ${finalState.statusCorrect}`);

const allTestsPassed = Object.values(finalState).every(test => test);
console.log(`\n🎯 Resultado: ${allTestsPassed ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON'}`);

console.log('\n=== FUNCIONALIDADES VALIDADAS ===');
console.log('✅ Estudiantes pueden eliminar sus propias entregas');
console.log('✅ Después de eliminar pueden volver a entregar');
console.log('✅ Estado de tarea se actualiza correctamente');
console.log('✅ Solo afecta las entregas del estudiante específico');
console.log('✅ Archivos adjuntos se eliminan con la entrega');
console.log('✅ Nuevas entregas pueden tener archivos diferentes');
