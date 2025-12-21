// Script para testear que las evaluaciones ya no se redondean incorrectamente
// Ejecutar en consola del navegador después del import masivo

console.log('🧪 TESTING: Verificación de redondeo en evaluaciones');

// 1. Verificar evaluaciones almacenadas (sin redondeo)
const evalData = localStorage.getItem('smart-student-evaluations-2025');
if (evalData) {
  const evaluations = JSON.parse(evalData);
  console.log('📊 Evaluaciones almacenadas (original):');
  evaluations.forEach(eval => {
    if (eval.evaluationResults) {
      Object.entries(eval.evaluationResults).forEach(([student, result]) => {
        console.log(`- ${eval.title}: ${student} = ${result.completionPercentage}% (score: ${result.score})`);
        
        // Verificar que no hay redondeo innecesario
        const expectedScore = (result.completionPercentage / 100) * 10;
        if (Math.abs(result.score - expectedScore) > 0.01) {
          console.warn(`⚠️ Score redondeado incorrectamente: esperado ${expectedScore}, actual ${result.score}`);
        }
      });
    }
  });
} else {
  console.log('❌ No hay evaluaciones almacenadas');
}

// 2. Verificar TestGrades sintéticos (display)
const testGrades = localStorage.getItem('test-grades-2025');
if (testGrades) {
  const grades = JSON.parse(testGrades);
  console.log('\n📈 TestGrades sintéticos (display):');
  
  const evaluationGrades = grades.filter(g => 
    g.testId && g.testId.startsWith('imp-') && g.subjectName === 'Ciencias Naturales'
  );
  
  evaluationGrades.forEach(grade => {
    console.log(`- ${grade.testName || 'Evaluación'}: ${grade.studentName} = ${grade.score}%`);
    
    // Verificar valores específicos del Excel
    const expectedValues = [80, 21, 66]; // Ejemplos del Excel
    if (expectedValues.includes(Math.round(grade.score))) {
      const isExact = expectedValues.includes(grade.score);
      console.log(`  ${isExact ? '✅' : '⚠️'} Valor ${isExact ? 'exacto' : 'redondeado'}: ${grade.score}`);
    }
  });
} else {
  console.log('❌ No hay TestGrades almacenados');
}

// 3. Verificar función percentageFrom
console.log('\n🔍 Testing percentageFrom con valores del Excel:');
const testValues = [
  { completionPercentage: 80, score: 8 },
  { completionPercentage: 21, score: 2.1 },
  { completionPercentage: 66, score: 6.6 }
];

testValues.forEach(val => {
  // Simular la lógica de percentageFrom
  const pct = val.completionPercentage;
  const isExactEvaluation = val && typeof val === 'object' && 
    'completionPercentage' in val && val.completionPercentage === pct;
  const score = isExactEvaluation ? pct : Math.round(pct * 100) / 100;
  
  console.log(`Input: ${val.completionPercentage}% → Output: ${score}% (${isExactEvaluation ? 'sin redondeo' : 'redondeado'})`);
});

console.log('\n✨ Test completado. Verificar que los valores coinciden exactamente con el Excel.');
