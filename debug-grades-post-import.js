// Test para verificar la lógica de calificaciones después de import masivo
console.log('🔍 DEPURACIÓN CALIFICACIONES MASIVAS - Post Import');

// 1. Verificar datos en localStorage después del import
console.log('\n📊 DATOS EN LOCALSTORAGE:');

const testGrades = JSON.parse(localStorage.getItem('test-grades') || '[]');
console.log('TestGrades totales:', testGrades.length);
console.log('TestGrades primeros 3:', testGrades.slice(0, 3));

const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');
console.log('Evaluaciones totales:', evaluations.length);
console.log('Evaluaciones primeras 3:', evaluations.slice(0, 3));

const tests = JSON.parse(localStorage.getItem('smart-student-tests') || '[]');
console.log('Pruebas totales:', tests.length);
console.log('Pruebas primeras 3:', tests.slice(0, 3));

const evalResults = JSON.parse(localStorage.getItem('smart-student-evaluation-results') || '[]');
console.log('Evaluation Results totales:', evalResults.length);
console.log('Evaluation Results primeros 3:', evalResults.slice(0, 3));

// 2. Verificar duplicados en TestGrades
console.log('\n🔍 ANÁLISIS DE DUPLICADOS:');

const gradeCounts = new Map();
testGrades.forEach(grade => {
  const key = `${grade.testId}-${grade.studentId}`;
  gradeCounts.set(key, (gradeCounts.get(key) || 0) + 1);
});

const duplicates = Array.from(gradeCounts.entries()).filter(([key, count]) => count > 1);
console.log('Duplicados encontrados:', duplicates.length);
duplicates.slice(0, 5).forEach(([key, count]) => {
  console.log(`- ${key}: ${count} veces`);
  const duplicateGrades = testGrades.filter(g => `${g.testId}-${g.studentId}` === key);
  console.log('  Scores:', duplicateGrades.map(g => g.score));
});

// 3. Verificar correlación entre actividades y TestGrades
console.log('\n🔗 CORRELACIÓN ACTIVIDADES vs TESTGRADES:');

// Evaluaciones
const evalMap = new Map();
evaluations.forEach(eval => {
  evalMap.set(eval.id, eval);
});

console.log('Evaluaciones con TestGrades:');
let evalWithGrades = 0;
let evalWithoutGrades = 0;

evaluations.forEach(eval => {
  const hasGrades = testGrades.some(g => g.testId === eval.id);
  if (hasGrades) {
    evalWithGrades++;
  } else {
    evalWithoutGrades++;
    console.log(`- Evaluación sin grades: ${eval.title} (${eval.id})`);
  }
});

console.log(`Evaluaciones CON grades: ${evalWithGrades}`);
console.log(`Evaluaciones SIN grades: ${evalWithoutGrades}`);

// Pruebas
console.log('\nPruebas con TestGrades:');
let testWithGrades = 0;
let testWithoutGrades = 0;

tests.forEach(test => {
  const hasGrades = testGrades.some(g => g.testId === test.id);
  if (hasGrades) {
    testWithGrades++;
  } else {
    testWithoutGrades++;
    console.log(`- Prueba sin grades: ${test.title} (${test.id})`);
  }
});

console.log(`Pruebas CON grades: ${testWithGrades}`);
console.log(`Pruebas SIN grades: ${testWithoutGrades}`);

// 4. Verificar estructura de evaluationResults embebidos
console.log('\n🧩 EVALUATION RESULTS EMBEBIDOS:');

evaluations.forEach(eval => {
  if (eval.evaluationResults && Object.keys(eval.evaluationResults).length > 0) {
    console.log(`Evaluación ${eval.title}:`);
    console.log(`- ID: ${eval.id}`);
    console.log(`- Resultados embebidos:`, Object.keys(eval.evaluationResults).length);
    const firstResult = Object.values(eval.evaluationResults)[0];
    console.log(`- Estructura primer resultado:`, firstResult);
    
    // Verificar si hay TestGrade correspondiente
    const hasCorrespondingGrades = Object.keys(eval.evaluationResults).some(username => {
      return testGrades.some(g => g.testId === eval.id && (g.studentName === username || g.studentId === username));
    });
    console.log(`- Tiene TestGrades correspondientes: ${hasCorrespondingGrades}`);
  }
});

// 5. Verificar TestGrades recientes (últimos 5 minutos)
console.log('\n⏰ TESTGRADES RECIENTES:');

const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
const recentGrades = testGrades.filter(g => g.gradedAt > fiveMinutesAgo);
console.log(`TestGrades creados en últimos 5 min: ${recentGrades.length}`);

recentGrades.slice(0, 10).forEach(grade => {
  console.log(`- ${grade.title}: ${grade.studentName} = ${grade.score}% (${new Date(grade.gradedAt).toLocaleString()})`);
});

console.log('\n✅ Análisis completo');
