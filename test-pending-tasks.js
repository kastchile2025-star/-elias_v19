// Script para probar la funcionalidad de tareas pendientes en Calificaciones
console.log('🧪 [TEST] Iniciando prueba de tareas pendientes de calificación...');

// Función para crear una tarea de prueba
function createTestTask() {
  try {
    // Cargar tareas existentes
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    // Crear nueva tarea de prueba
    const testTask = {
      id: `test-task-${Date.now()}`,
      title: 'Tarea de Prueba - Sistema Solar',
      description: 'Investigar sobre los planetas del sistema solar',
      subject: 'Ciencias Naturales',
      course: '4to Básico A',
      assignedById: 'prof123',
      assignedByName: 'Profesor Demo',
      assignedTo: 'course', // Todo el curso
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // En 7 días
      createdAt: new Date().toISOString(),
      status: 'pending', // Recién creada
      priority: 'medium',
      taskType: 'tarea'
    };
    
    // Agregar la tarea
    tasks.push(testTask);
    localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
    
    // Emitir evento para actualizar la UI
    window.dispatchEvent(new StorageEvent('storage', { 
      key: 'smart-student-tasks', 
      newValue: JSON.stringify(tasks) 
    }));
    
    console.log('✅ [TEST] Tarea de prueba creada:', testTask.title);
    console.log('🔍 [TEST] ID de tarea:', testTask.id);
    console.log('📋 [TEST] Tipo:', testTask.taskType);
    console.log('📅 [TEST] Fecha creación:', testTask.createdAt);
    
    return testTask;
  } catch (error) {
    console.error('❌ [TEST] Error creando tarea de prueba:', error);
  }
}

// Función para crear una evaluación de prueba
function createTestEvaluation() {
  try {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    const testEvaluation = {
      id: `test-eval-${Date.now()}`,
      title: 'Evaluación - Matemáticas Básicas',
      description: 'Evaluación de suma y resta',
      subject: 'Matemáticas',
      course: '4to Básico A',
      assignedById: 'prof123',
      assignedByName: 'Profesor Demo',
      assignedTo: 'course',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority: 'high',
      taskType: 'evaluacion',
      topic: 'Operaciones básicas',
      numQuestions: 10,
      timeLimit: 30
    };
    
    tasks.push(testEvaluation);
    localStorage.setItem('smart-student-tasks', JSON.stringify(tasks));
    
    window.dispatchEvent(new StorageEvent('storage', { 
      key: 'smart-student-tasks', 
      newValue: JSON.stringify(tasks) 
    }));
    
    console.log('✅ [TEST] Evaluación de prueba creada:', testEvaluation.title);
    console.log('🔍 [TEST] ID de evaluación:', testEvaluation.id);
    console.log('📊 [TEST] Tipo:', testEvaluation.taskType);
    console.log('⏱️ [TEST] Tiempo límite:', testEvaluation.timeLimit, 'minutos');
    
    return testEvaluation;
  } catch (error) {
    console.error('❌ [TEST] Error creando evaluación de prueba:', error);
  }
}

// Función para ver el estado actual
function checkCurrentState() {
  try {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const grades = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
    
    console.log('\n📊 [ESTADO ACTUAL]');
    console.log(`📋 Total tareas/evaluaciones: ${tasks.length}`);
    console.log(`📝 Total calificaciones: ${grades.length}`);
    
    // Mostrar tareas sin calificar
    const ungraded = tasks.filter(task => {
      return !grades.some(grade => grade.testId === task.id);
    });
    
    console.log(`🔔 Tareas sin calificar: ${ungraded.length}`);
    ungraded.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.taskType === 'tarea' ? '📝' : '📊'} ${task.title}`);
      console.log(`     Creada: ${new Date(task.createdAt).toLocaleString()}`);
      console.log(`     Estado: ${task.status}`);
    });
    
    return ungraded;
  } catch (error) {
    console.error('❌ [TEST] Error verificando estado:', error);
  }
}

// Función para limpiar tareas de prueba
function cleanTestTasks() {
  try {
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const filtered = tasks.filter(task => !task.id.startsWith('test-'));
    
    localStorage.setItem('smart-student-tasks', JSON.stringify(filtered));
    window.dispatchEvent(new StorageEvent('storage', { 
      key: 'smart-student-tasks', 
      newValue: JSON.stringify(filtered) 
    }));
    
    console.log('🧹 [TEST] Tareas de prueba eliminadas');
    return filtered;
  } catch (error) {
    console.error('❌ [TEST] Error limpiando tareas:', error);
  }
}

// Exportar funciones globalmente
window.createTestTask = createTestTask;
window.createTestEvaluation = createTestEvaluation;
window.checkCurrentState = checkCurrentState;
window.cleanTestTasks = cleanTestTasks;

// Ejecutar verificación inicial
console.log('\n🎯 [INSTRUCCIONES]');
console.log('1. Ejecuta createTestTask() para crear una tarea de prueba');
console.log('2. Ejecuta createTestEvaluation() para crear una evaluación de prueba');
console.log('3. Ve a Admin > Calificaciones para ver los círculos naranjas en N1, N2, etc.');
console.log('4. Haz hover sobre los círculos para ver los tooltips');
console.log('5. Ejecuta cleanTestTasks() para limpiar cuando termines');
console.log('6. Ejecuta checkCurrentState() para ver el estado actual\n');

checkCurrentState();
