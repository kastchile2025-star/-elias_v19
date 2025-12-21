// Script de prueba para validar la funcionalidad de entrega única
// Este script simula el comportamiento de un estudiante intentando entregar una tarea múltiples veces

console.log('=== PRUEBA DE VALIDACIÓN DE ENTREGA ÚNICA ===');

// Simular datos de usuario estudiante
const testStudent = {
  username: 'felipe',
  displayName: 'Felipe Estudiante',
  role: 'student',
  activeCourses: ['4to Básico']
};

// Simular una tarea
const testTask = {
  id: 'task_test_submission',
  title: 'Tarea de Prueba',
  description: 'Tarea para probar la validación de entrega única',
  subject: 'Lenguaje y Comunicación',
  course: '4to Básico',
  assignedBy: 'jorge',
  assignedByName: 'Jorge Profesor',
  assignedTo: 'course',
  dueDate: '2025-06-25T23:59',
  createdAt: new Date().toISOString(),
  status: 'pending',
  priority: 'medium'
};

// Simular comentarios existentes
const existingComments = [
  {
    id: 'comment_1',
    taskId: 'task_test_submission',
    studentUsername: 'felipe',
    studentName: 'Felipe Estudiante',
    comment: 'Primera entrega de la tarea',
    timestamp: new Date().toISOString(),
    isSubmission: true, // Este estudiante ya hizo una entrega
    attachments: []
  },
  {
    id: 'comment_2',
    taskId: 'task_test_submission',
    studentUsername: 'maria',
    studentName: 'María Estudiante',
    comment: 'Mi comentario sobre la tarea',
    timestamp: new Date().toISOString(),
    isSubmission: false, // Solo un comentario, no una entrega
    attachments: []
  }
];

// Función para verificar si un estudiante ya entregó
function hasStudentSubmitted(taskId, studentUsername, comments) {
  return comments.some(comment => 
    comment.taskId === taskId && 
    comment.studentUsername === studentUsername && 
    comment.isSubmission
  );
}

// Pruebas
console.log('1. Verificando si Felipe ya entregó la tarea:');
const felipeAlreadySubmitted = hasStudentSubmitted('task_test_submission', 'felipe', existingComments);
console.log(`   Resultado: ${felipeAlreadySubmitted ? 'SÍ' : 'NO'}`);
console.log(`   Esperado: SÍ`);
console.log(`   ✓ ${felipeAlreadySubmitted ? 'CORRECTO' : 'ERROR'}`);

console.log('\n2. Verificando si María ya entregó la tarea:');
const mariaAlreadySubmitted = hasStudentSubmitted('task_test_submission', 'maria', existingComments);
console.log(`   Resultado: ${mariaAlreadySubmitted ? 'SÍ' : 'NO'}`);
console.log(`   Esperado: NO`);
console.log(`   ✓ ${!mariaAlreadySubmitted ? 'CORRECTO' : 'ERROR'}`);

console.log('\n3. Verificando si un estudiante nuevo puede entregar:');
const newStudentSubmitted = hasStudentSubmitted('task_test_submission', 'carlos', existingComments);
console.log(`   Resultado: ${newStudentSubmitted ? 'SÍ' : 'NO'}`);
console.log(`   Esperado: NO`);
console.log(`   ✓ ${!newStudentSubmitted ? 'CORRECTO' : 'ERROR'}`);

console.log('\n=== RESUMEN ===');
const allTestsPassed = felipeAlreadySubmitted && !mariaAlreadySubmitted && !newStudentSubmitted;
console.log(`Estado general: ${allTestsPassed ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON'}`);

// Información adicional para los desarrolladores
console.log('\n=== INFORMACIÓN PARA DESARROLLADORES ===');
console.log('- La validación de entrega única está implementada en la función hasStudentSubmitted()');
console.log('- Se verifica antes de permitir marcar como entrega final');
console.log('- El checkbox de "Marcar como entrega final" se deshabilita si ya se entregó');
console.log('- El botón de envío también se deshabilita para entregas si ya se envió');
console.log('- Los estudiantes aún pueden hacer comentarios adicionales (sin marcar como entrega)');
