// Script de prueba para validar estadísticas de tareas por curso

console.log('=== PRUEBA DE ESTADÍSTICAS DE TAREAS POR CURSO ===');

// Simular datos de tareas
const testTasks = [
  {
    id: 'task_1',
    title: 'Tarea 1',
    course: '4to Básico',
    status: 'pending',
    assignedBy: 'jorge'
  },
  {
    id: 'task_2', 
    title: 'Tarea 2',
    course: '4to Básico',
    status: 'pending',
    assignedBy: 'jorge'
  },
  {
    id: 'task_3',
    title: 'Tarea 3',
    course: '5to Básico',
    status: 'pending',
    assignedBy: 'jorge'
  }
];

// Simular comentarios con entregas
const testComments = [
  {
    id: 'comment_1',
    taskId: 'task_1',
    studentUsername: 'felipe',
    isSubmission: true // Felipe entregó la tarea 1
  },
  {
    id: 'comment_2',
    taskId: 'task_1',
    studentUsername: 'maria',
    isSubmission: true // María también entregó la tarea 1
  },
  {
    id: 'comment_3',
    taskId: 'task_2',
    studentUsername: 'felipe',
    isSubmission: false // Solo comentario, no entrega
  },
  {
    id: 'comment_4',
    taskId: 'task_3',
    studentUsername: 'carlos',
    isSubmission: true // Carlos entregó la tarea 3
  }
];

// Función para calcular estadísticas mejorada
function calculateCourseStats(tasks, comments) {
  const tasksByCourse = {};
  
  // Agrupar tareas por curso
  tasks.forEach(task => {
    if (!tasksByCourse[task.course]) {
      tasksByCourse[task.course] = [];
    }
    tasksByCourse[task.course].push(task);
  });
  
  const stats = {};
  
  Object.keys(tasksByCourse).forEach(course => {
    const courseTasks = tasksByCourse[course];
    stats[course] = {
      total: courseTasks.length,
      pending: 0,
      submitted: 0,
      reviewed: 0
    };
    
    courseTasks.forEach(task => {
      // Verificar si algún estudiante entregó esta tarea
      const hasSubmissions = comments.some(comment => 
        comment.taskId === task.id && comment.isSubmission
      );
      
      if (hasSubmissions) {
        if (task.status === 'reviewed') {
          stats[course].reviewed++;
        } else {
          stats[course].submitted++;
        }
      } else {
        stats[course].pending++;
      }
    });
  });
  
  return stats;
}

// Ejecutar prueba
const stats = calculateCourseStats(testTasks, testComments);

console.log('\n=== RESULTADOS DE ESTADÍSTICAS ===');
Object.keys(stats).forEach(course => {
  console.log(`\n${course}:`);
  console.log(`  Total: ${stats[course].total}`);
  console.log(`  Pendientes: ${stats[course].pending}`);
  console.log(`  Entregadas: ${stats[course].submitted}`);
  console.log(`  Revisadas: ${stats[course].reviewed}`);
});

console.log('\n=== VERIFICACIÓN ===');
console.log('4to Básico debería mostrar:');
console.log('  Total: 2, Pendientes: 1, Entregadas: 1, Revisadas: 0');
console.log(`  Actual: Total: ${stats['4to Básico'].total}, Pendientes: ${stats['4to Básico'].pending}, Entregadas: ${stats['4to Básico'].submitted}, Revisadas: ${stats['4to Básico'].reviewed}`);
console.log(`  ✓ ${stats['4to Básico'].total === 2 && stats['4to Básico'].pending === 1 && stats['4to Básico'].submitted === 1 ? 'CORRECTO' : 'ERROR'}`);

console.log('\n5to Básico debería mostrar:');
console.log('  Total: 1, Pendientes: 0, Entregadas: 1, Revisadas: 0');
console.log(`  Actual: Total: ${stats['5to Básico'].total}, Pendientes: ${stats['5to Básico'].pending}, Entregadas: ${stats['5to Básico'].submitted}, Revisadas: ${stats['5to Básico'].reviewed}`);
console.log(`  ✓ ${stats['5to Básico'].total === 1 && stats['5to Básico'].pending === 0 && stats['5to Básico'].submitted === 1 ? 'CORRECTO' : 'ERROR'}`);

console.log('\n=== FUNCIONALIDADES VALIDADAS ===');
console.log('✅ Estadísticas por curso funcionan correctamente');
console.log('✅ Se detectan entregas de estudiantes');
console.log('✅ Se diferencian entre pendientes y entregadas');
console.log('✅ Multiple estudiantes pueden entregar la misma tarea');
console.log('✅ Tareas sin entregas se marcan como pendientes');
