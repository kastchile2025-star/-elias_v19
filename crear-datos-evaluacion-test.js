// 🧪 SCRIPT DE TESTING: Crear datos de evaluación para probar "Ver Detalle"
// Este script genera datos de ejemplo para verificar que el profesor puede ver los resultados

function crearDatosEvaluacionTest() {
  console.clear();
  console.log('🧪 CREANDO DATOS DE EVALUACIÓN PARA TESTING');
  console.log('='.repeat(50));
  
  // 1. Obtener usuarios y tareas actuales
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  
  console.log('👥 Usuarios disponibles:', users.length);
  console.log('📋 Tareas disponibles:', tasks.length);
  
  // 2. Buscar una tarea de evaluación
  const evaluationTask = tasks.find(t => t.taskType === 'evaluacion');
  
  if (!evaluationTask) {
    console.log('❌ No se encontró tarea de evaluación');
    console.log('🔧 Creando tarea de evaluación de ejemplo...');
    
    const newTask = {
      id: 'eval-test-' + Date.now(),
      title: 'Evaluación Específica 1',
      description: 'Evaluación Específica 1',
      taskType: 'evaluacion',
      status: 'pending',
      topic: 'sistema respiratorio',
      timeLimit: 10,
      numQuestions: 5,
      courseId: '9077a79d-c290-45f9-b549-6e57df8828d2',
      sectionId: 'd326c181-fa30-4c50-ab68-efa085a3ffd3',
      assignedTo: 'students',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    tasks.push(newTask);
    localStorage.setItem('smart-student-tasks', JSON.stringify(tasks, null, 2));
    console.log('✅ Tarea de evaluación creada:', newTask.title);
    evaluationTask = newTask;
  } else {
    console.log('✅ Tarea de evaluación encontrada:', evaluationTask.title);
  }
  
  console.log('📋 Detalles de la tarea:');
  console.log('• ID:', evaluationTask.id);
  console.log('• Título:', evaluationTask.title);
  console.log('• Tema:', evaluationTask.topic);
  console.log('• Preguntas:', evaluationTask.numQuestions);
  
  // 3. Buscar estudiante Felipe
  const felipe = users.find(u => u.username === 'felipe');
  
  if (!felipe) {
    console.log('❌ Usuario Felipe no encontrado');
    return;
  }
  
  console.log('👤 Estudiante encontrado:', felipe.displayName);
  
  // 4. Crear resultado de evaluación simulado con preguntas completas
  const sampleQuestions = [
    {
      question: '¿Cuál es la principal función del sistema respiratorio?',
      options: [
        'Transportar nutrientes',
        'Regular la temperatura corporal', 
        'Intercambiar gases (oxígeno y dióxido de carbono)',
        'Producir hormonas'
      ],
      correct: 2,
      explanation: 'El sistema respiratorio se encarga del intercambio gaseoso vital.',
      studentAnswer: 0, // Felipe eligió la opción incorrecta
      studentAnswerText: 'Transportar nutrientes',
      correctAnswer: 'Intercambiar gases (oxígeno y dióxido de carbono)',
      isCorrect: false
    },
    {
      question: '¿Dónde se produce el intercambio gaseoso en los pulmones?',
      options: [
        'En los bronquios',
        'En la tráquea',
        'En los alvéolos',
        'En el diafragma'
      ],
      correct: 2,
      explanation: 'Los alvéolos son pequeños sacos donde ocurre el intercambio gaseoso.',
      studentAnswer: 2, // Felipe eligió correctamente
      studentAnswerText: 'En los alvéolos',
      correctAnswer: 'En los alvéolos',
      isCorrect: true
    },
    {
      question: '¿Qué músculo es fundamental para la respiración?',
      options: [
        'El corazón',
        'El diafragma',
        'El estómago',
        'Los músculos del brazo'
      ],
      correct: 1,
      explanation: 'El diafragma es el músculo principal que controla la respiración.',
      studentAnswer: 1, // Felipe eligió correctamente
      studentAnswerText: 'El diafragma',
      correctAnswer: 'El diafragma',
      isCorrect: true
    },
    {
      question: '¿Por dónde entra el aire al cuerpo humano?',
      options: [
        'Por la boca únicamente',
        'Por la nariz únicamente',
        'Por la nariz y la boca',
        'Por los oídos'
      ],
      correct: 2,
      explanation: 'El aire puede ingresar tanto por la nariz como por la boca.',
      studentAnswer: 1, // Felipe eligió parcialmente incorrecto
      studentAnswerText: 'Por la nariz únicamente',
      correctAnswer: 'Por la nariz y la boca',
      isCorrect: false
    },
    {
      question: '¿Qué gas eliminamos cuando exhalamos?',
      options: [
        'Oxígeno',
        'Nitrógeno',
        'Dióxido de carbono',
        'Hidrógeno'
      ],
      correct: 2,
      explanation: 'Al exhalar, eliminamos dióxido de carbono, producto de desecho del metabolismo.',
      studentAnswer: 2, // Felipe eligió correctamente
      studentAnswerText: 'Dióxido de carbono',
      correctAnswer: 'Dióxido de carbono',
      isCorrect: true
    }
  ];
  
  // Calcular resultados
  const correctAnswers = sampleQuestions.filter(q => q.isCorrect).length;
  const totalQuestions = sampleQuestions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const evaluationResult = {
    taskId: evaluationTask.id,
    studentId: felipe.id,
    studentUsername: felipe.username,
    studentName: felipe.displayName,
    answers: [0, 2, 1, 1, 2], // Las respuestas que eligió Felipe
    questions: sampleQuestions, // Preguntas completas con resultados
    correctAnswers,
    totalQuestions,
    percentage,
    completedAt: new Date().toISOString(),
    timeUsed: 480, // 8 minutos en segundos
    timeExpired: false,
    task: {
      title: evaluationTask.title,
      topic: evaluationTask.topic,
      timeLimit: evaluationTask.timeLimit,
      numQuestions: evaluationTask.numQuestions
    }
  };
  
  // 5. Guardar resultado en localStorage
  const existingResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
  
  // Eliminar resultado anterior si existe para este estudiante y tarea
  const filteredResults = existingResults.filter(r => 
    !(r.taskId === evaluationTask.id && r.studentId === felipe.id)
  );
  
  filteredResults.push(evaluationResult);
  localStorage.setItem('smart-student-evaluation-results', JSON.stringify(filteredResults, null, 2));
  
  console.log('');
  console.log('✅ RESULTADO DE EVALUACIÓN CREADO:');
  console.log('• Estudiante:', felipe.displayName);
  console.log('• Tarea:', evaluationTask.title);
  console.log('• Respuestas correctas:', `${correctAnswers}/${totalQuestions}`);
  console.log('• Porcentaje:', `${percentage}%`);
  console.log('• Tiempo usado:', '8:00 min');
  console.log('• Preguntas con detalles:', sampleQuestions.length);
  
  console.log('');
  console.log('🔍 ESTRUCTURA DE DATOS VERIFICADA:');
  console.log('• questions array:', !!evaluationResult.questions);
  console.log('• first question:', !!evaluationResult.questions[0]);
  console.log('• studentAnswerText:', !!evaluationResult.questions[0].studentAnswerText);
  console.log('• correctAnswer:', !!evaluationResult.questions[0].correctAnswer);
  console.log('• isCorrect flags:', !!evaluationResult.questions[0].isCorrect);
  
  console.log('');
  console.log('🎯 PRÓXIMOS PASOS:');
  console.log('1. Ve a la pestaña Tareas como profesor');
  console.log('2. Selecciona la evaluación "' + evaluationTask.title + '"');
  console.log('3. Busca el estudiante Felipe en la lista');
  console.log('4. Haz clic en "Ver Detalle"');
  console.log('5. Deberías ver las 5 preguntas con respuestas del estudiante');
  
  return {
    success: true,
    taskId: evaluationTask.id,
    studentId: felipe.id,
    questionsCount: sampleQuestions.length,
    correctAnswers,
    percentage
  };
}

// Auto-ejecutar el script
console.log('🚀 Iniciando creación de datos de evaluación...');
crearDatosEvaluacionTest();
