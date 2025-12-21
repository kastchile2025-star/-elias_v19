// Debug específico para evaluaciones faltantes en tabla de calificaciones
console.log('🟣 DEPURACIÓN EVALUACIONES FALTANTES EN TABLA');

console.log('\n1️⃣ EVALUACIONES CON EVALUATION RESULTS:');
const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
const evaluationsWithResults = evaluations.filter(eval => eval.evaluationResults && Object.keys(eval.evaluationResults).length > 0);

console.log(`Total evaluaciones: ${evaluations.length}`);
console.log(`Evaluaciones con resultados: ${evaluationsWithResults.length}`);

evaluationsWithResults.forEach((evaluation, idx) => {
  console.log(`\n📊 Evaluación ${idx + 1}:`);
  console.log(`- ID: ${evaluation.id}`);
  console.log(`- Título: ${evaluation.title}`);
  console.log(`- Asignatura: ${evaluation.subject || evaluation.subjectName}`);
  console.log(`- Curso ID: ${evaluation.courseId}`);
  console.log(`- Sección ID: ${evaluation.sectionId}`);
  console.log(`- Fecha: ${evaluation.createdAt}`);
  console.log(`- Resultados:`, Object.keys(evaluation.evaluationResults).length, 'estudiantes');
  
  // Mostrar algunos resultados
  Object.entries(evaluation.evaluationResults).slice(0, 3).forEach(([username, result]) => {
    console.log(`  - ${username}: score=${result.score}, total=${result.totalQuestions}, pct=${result.completionPercentage}%`);
  });
});

console.log('\n2️⃣ TEST GRADES DE EVALUACIONES:');
const testGrades = JSON.parse(localStorage.getItem('test-grades') || '[]');
const evaluationGrades = testGrades.filter(grade => 
  evaluationsWithResults.some(eval => String(eval.id) === String(grade.testId))
);

console.log(`TestGrades de evaluaciones: ${evaluationGrades.length}`);

evaluationGrades.forEach(grade => {
  const correspondingEval = evaluationsWithResults.find(eval => String(eval.id) === String(grade.testId));
  console.log(`- ${grade.title}: ${grade.studentName} = ${grade.score}% (eval: ${correspondingEval?.title})`);
});

console.log('\n3️⃣ EVALUACIONES SIN TEST GRADES:');
const evalsWithoutGrades = evaluationsWithResults.filter(evaluation => 
  !testGrades.some(grade => String(grade.testId) === String(evaluation.id))
);

console.log(`Evaluaciones sin TestGrades: ${evalsWithoutGrades.length}`);

evalsWithoutGrades.forEach(evaluation => {
  console.log(`\n❌ ${evaluation.title}:`);
  console.log(`  - ID: ${evaluation.id}`);
  console.log(`  - Estudiantes con resultados: ${Object.keys(evaluation.evaluationResults).length}`);
  
  // Intentar generar TestGrades sintéticos como lo haría el nuevo código
  console.log(`  - Resultados que se podrían convertir:`);
  Object.entries(evaluation.evaluationResults).slice(0, 3).forEach(([username, result]) => {
    const total = Number(result.totalQuestions) || 10;
    const rawScore = Number(result.score);
    let pct = total > 0 ? (rawScore / total) * 100 : Number(result.completionPercentage) || 0;
    if (!isFinite(pct)) pct = 0;
    pct = Math.max(0, Math.min(100, pct));
    console.log(`    - ${username}: ${pct.toFixed(1)}% (score=${rawScore}/${total})`);
  });
});

console.log('\n4️⃣ VERIFICACIÓN DE ORDEN EN loadPendingTasksBySubject:');

// Simular la lógica de loadPendingTasksBySubject para una asignatura específica
const subjects = JSON.parse(localStorage.getItem('smart-student-subjects') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log('Asignaturas disponibles:', subjects.map(s => s.name));
console.log('Secciones disponibles:', sections.map(s => `${s.name} (ID: ${s.id})`));

// Ejemplo para Ciencias Naturales en sección A
const normSubj = (s) => {
  const base = String(s || 'General').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  return base.endsWith('s') ? base.slice(0, -1) : base;
};

const testSubject = 'Ciencias Naturales';
const testSectionId = 'A'; // Ajustar según tus datos

const key = `${normSubj(testSubject)}__${testSectionId}`;
console.log(`\nBuscando tareas para clave: "${key}"`);

// Simular loadPendingTasksBySubject
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const tests = JSON.parse(localStorage.getItem('smart-student-tests') || '[]');

const allActivities = [
  ...tasks.map(t => ({ ...t, taskType: t.taskType || 'tarea' })),
  ...evaluations.map(e => ({ ...e, taskType: 'evaluacion' })),
  ...tests.map(t => ({ ...t, taskType: 'prueba' }))
];

const filteredActivities = allActivities.filter(activity => {
  const activitySubject = activity.subject || activity.subjectName || '';
  const normalizedActivitySubject = normSubj(activitySubject);
  const normalizedTestSubject = normSubj(testSubject);
  const sectionMatch = String(activity.sectionId || '').toLowerCase() === testSectionId.toLowerCase();
  
  return normalizedActivitySubject === normalizedTestSubject && sectionMatch;
});

console.log(`Actividades encontradas para ${testSubject} en sección ${testSectionId}:`, filteredActivities.length);

filteredActivities.forEach((activity, idx) => {
  console.log(`${idx + 1}. ${activity.taskType.toUpperCase()}: ${activity.title}`);
  console.log(`   - ID: ${activity.id}`);
  console.log(`   - Fecha: ${activity.createdAt}`);
  
  if (activity.taskType === 'evaluacion' && activity.evaluationResults) {
    const studentCount = Object.keys(activity.evaluationResults).length;
    console.log(`   - ✅ Tiene evaluationResults para ${studentCount} estudiantes`);
    
    // Verificar si tiene TestGrades correspondientes
    const hasGrades = testGrades.some(g => String(g.testId) === String(activity.id));
    console.log(`   - TestGrades: ${hasGrades ? '✅ SÍ' : '❌ NO'}`);
  }
});

console.log('\n✅ Análisis completo. Con la nueva lógica sintética, las evaluaciones deberían aparecer en la tabla.');

// Función helper para forzar regeneración de TestGrades sintéticos
window.testSyntheticGrades = function() {
  console.log('🧪 Testeando generación de TestGrades sintéticos...');
  
  evalsWithoutGrades.slice(0, 1).forEach(evaluation => {
    console.log(`Procesando evaluación: ${evaluation.title}`);
    
    Object.entries(evaluation.evaluationResults).slice(0, 2).forEach(([username, result]) => {
      const total = Number(result.totalQuestions) || 10;
      const rawScore = Number(result.score);
      let pct = total > 0 ? (rawScore / total) * 100 : Number(result.completionPercentage) || 0;
      if (!isFinite(pct)) pct = 0;
      pct = Math.max(0, Math.min(100, pct));
      
      const syntheticGrade = {
        id: `synthetic-${evaluation.id}-${username}`,
        testId: String(evaluation.id),
        studentId: username, // Nota: en realidad necesitaríamos el studentId real
        studentName: username,
        score: Math.round(pct * 100) / 100,
        title: evaluation.title,
        gradedAt: new Date(result.completedAt || evaluation.createdAt || Date.now()).getTime(),
      };
      
      console.log(`TestGrade sintético generado:`, syntheticGrade);
    });
  });
};
