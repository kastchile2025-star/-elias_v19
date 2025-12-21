// Debug específico para evaluaciones después de import masivo
console.log('🟣 DEPURACIÓN EVALUACIONES - Post Import');

console.log('\n1️⃣ EVALUACIONES EN LOCALSTORAGE:');
const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
console.log('Total evaluaciones:', evaluations.length);

console.log('\n2️⃣ EVALUATION RESULTS:');
const evalResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
console.log('Total evaluation-results:', evalResults.length);

console.log('\n3️⃣ TEST GRADES:');
const testGrades = JSON.parse(localStorage.getItem('test-grades') || '[]');
console.log('Total test-grades:', testGrades.length);

console.log('\n4️⃣ EVALUACIONES CON RESULTADOS EMBEBIDOS:');
evaluations.forEach((eval, idx) => {
  if (eval.evaluationResults && Object.keys(eval.evaluationResults).length > 0) {
    console.log(`\n📝 Evaluación ${idx + 1}:`);
    console.log(`- ID: ${eval.id}`);
    console.log(`- Título: ${eval.title}`);
    console.log(`- Status: ${eval.status}`);
    console.log(`- Fecha: ${eval.createdAt}`);
    console.log(`- Resultados embebidos:`, Object.keys(eval.evaluationResults).length);
    
    // Mostrar primer resultado
    const firstKey = Object.keys(eval.evaluationResults)[0];
    const firstResult = eval.evaluationResults[firstKey];
    console.log(`- Estructura primer resultado (${firstKey}):`, firstResult);
    
    // Verificar si hay TestGrades correspondientes
    const correspondingGrades = testGrades.filter(g => g.testId === eval.id);
    console.log(`- TestGrades correspondientes: ${correspondingGrades.length}`);
    
    if (correspondingGrades.length > 0) {
      console.log(`- Scores de TestGrades:`, correspondingGrades.map(g => `${g.studentName}: ${g.score}%`));
    } else {
      console.log(`- ❌ NO HAY TESTGRADES para esta evaluación`);
      
      // Debug: intentar generar manualmente TestGrade
      console.log(`- 🔧 Intentando generar TestGrade manualmente...`);
      Object.entries(eval.evaluationResults).forEach(([username, result]) => {
        console.log(`  - ${username}: ${JSON.stringify(result)}`);
      });
    }
  }
});

console.log('\n5️⃣ EVALUACIONES SIN RESULTADOS:');
const evalsWithoutResults = evaluations.filter(eval => !eval.evaluationResults || Object.keys(eval.evaluationResults).length === 0);
console.log(`Evaluaciones sin resultados embebidos: ${evalsWithoutResults.length}`);
evalsWithoutResults.forEach(eval => {
  console.log(`- ${eval.title} (${eval.id}) - Status: ${eval.status}`);
});

console.log('\n6️⃣ EVALUATION-RESULTS INDEPENDIENTES:');
evalResults.forEach((result, idx) => {
  console.log(`Result ${idx + 1}:`, result);
  
  // Verificar si hay TestGrade correspondiente
  const correspondingGrade = testGrades.find(g => g.testId === result.taskId && (g.studentId === result.studentId || g.studentName === result.studentUsername));
  if (correspondingGrade) {
    console.log(`  ✅ Tiene TestGrade: ${correspondingGrade.score}%`);
  } else {
    console.log(`  ❌ NO tiene TestGrade correspondiente`);
  }
});

console.log('\n7️⃣ TESTGRADES DE EVALUACIONES:');
const evaluationGrades = testGrades.filter(grade => {
  return evaluations.some(eval => eval.id === grade.testId);
});
console.log(`TestGrades que corresponden a evaluaciones: ${evaluationGrades.length}`);
evaluationGrades.forEach(grade => {
  console.log(`- ${grade.title}: ${grade.studentName} = ${grade.score}%`);
});

console.log('\n✅ Análisis de evaluaciones completo');

// Función helper para forzar sincronización
window.forceEvaluationSync = function() {
  console.log('🔄 Forzando sincronización de evaluaciones...');
  window.dispatchEvent(new StorageEvent('storage', { 
    key: 'smart-student-evaluation-results', 
    newValue: localStorage.getItem('smart-student-evaluation-results') 
  }));
  window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
  console.log('✅ Eventos disparados');
};

console.log('\n💡 Ejecuta: forceEvaluationSync() para forzar sincronización');
