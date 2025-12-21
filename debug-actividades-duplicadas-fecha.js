// Debug para verificar actividades duplicadas por fecha
console.log('📅 DEPURACIÓN ACTIVIDADES DUPLICADAS POR FECHA');

console.log('\n1️⃣ EVALUACIONES POR FECHA:');
const evaluations = JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]');

// Agrupar evaluaciones por fecha
const evalsByDate = new Map();
evaluations.forEach(evaluation => {
  const date = evaluation.createdAt ? evaluation.createdAt.slice(0, 10) : 'sin-fecha';
  if (!evalsByDate.has(date)) evalsByDate.set(date, []);
  evalsByDate.get(date).push(evaluation);
});

console.log(`Total evaluaciones: ${evaluations.length}`);
console.log(`Fechas únicas: ${evalsByDate.size}`);

// Mostrar fechas con múltiples evaluaciones
const duplicateDates = Array.from(evalsByDate.entries()).filter(([date, evals]) => evals.length > 1);
console.log(`Fechas con múltiples evaluaciones: ${duplicateDates.length}`);

duplicateDates.forEach(([date, evals]) => {
  console.log(`\n📅 Fecha: ${date} (${evals.length} evaluaciones)`);
  evals.forEach((evaluation, idx) => {
    console.log(`  ${idx + 1}. ${evaluation.title} (ID: ${evaluation.id})`);
    console.log(`     - Subject: ${evaluation.subject || evaluation.subjectName}`);
    console.log(`     - Course: ${evaluation.courseId}, Section: ${evaluation.sectionId}`);
    
    if (evaluation.evaluationResults) {
      const studentCount = Object.keys(evaluation.evaluationResults).length;
      console.log(`     - Resultados: ${studentCount} estudiantes`);
      
      // Mostrar algunos resultados
      Object.entries(evaluation.evaluationResults).slice(0, 2).forEach(([username, result]) => {
        console.log(`       - ${username}: ${result.completionPercentage}%`);
      });
    } else {
      console.log(`     - ❌ Sin evaluationResults`);
    }
  });
});

console.log('\n2️⃣ ANÁLISIS DE TESTGRADES CORRESPONDIENTES:');
const testGrades = JSON.parse(localStorage.getItem('test-grades') || '[]');

duplicateDates.forEach(([date, evals]) => {
  console.log(`\n📊 TestGrades para fecha ${date}:`);
  
  evals.forEach(evaluation => {
    const correspondingGrades = testGrades.filter(grade => 
      String(grade.testId) === String(evaluation.id)
    );
    
    console.log(`  - ${evaluation.title}:`);
    console.log(`    TestGrades: ${correspondingGrades.length}`);
    
    if (correspondingGrades.length > 0) {
      correspondingGrades.forEach(grade => {
        console.log(`    - ${grade.studentName}: ${grade.score}%`);
      });
    } else {
      console.log(`    - ❌ Sin TestGrades correspondientes`);
    }
  });
});

console.log('\n3️⃣ VERIFICACIÓN EN loadPendingTasksBySubject:');

// Simular la función de normalización
const normSubj = (s) => {
  const base = String(s || 'General').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  return base.endsWith('s') ? base.slice(0, -1) : base;
};

// Para el caso específico: Ciencias Naturales, Sección A, 20/08/2025
const testSubject = 'Ciencias Naturales';
const testSection = 'A';
const testDate = '2025-08-20';

console.log(`\nBuscando actividades para: ${testSubject}, Sección ${testSection}, Fecha ${testDate}`);

const activitiesForDate = evaluations.filter(evaluation => {
  const evalSubject = evaluation.subject || evaluation.subjectName || '';
  const evalSection = String(evaluation.sectionId || '');
  const evalDate = evaluation.createdAt ? evaluation.createdAt.slice(0, 10) : '';
  
  const subjectMatch = normSubj(evalSubject) === normSubj(testSubject);
  const sectionMatch = evalSection.toLowerCase() === testSection.toLowerCase();
  const dateMatch = evalDate === testDate;
  
  return subjectMatch && sectionMatch && dateMatch;
});

console.log(`Actividades encontradas: ${activitiesForDate.length}`);

activitiesForDate.forEach((activity, idx) => {
  console.log(`${idx + 1}. ${activity.title} (ID: ${activity.id})`);
  
  if (activity.evaluationResults) {
    const scores = Object.values(activity.evaluationResults).map(r => r.completionPercentage);
    console.log(`   - Scores en evaluationResults: [${scores.join(', ')}]`);
  }
  
  const grades = testGrades.filter(g => String(g.testId) === String(activity.id));
  if (grades.length > 0) {
    const gradeScores = grades.map(g => g.score);
    console.log(`   - Scores en TestGrades: [${gradeScores.join(', ')}]`);
  } else {
    console.log(`   - ❌ Sin TestGrades`);
  }
});

console.log('\n4️⃣ ORDEN EN TABLA (simulación):');

// Simular el orden que tendría en loadPendingTasksBySubject
const key = `${normSubj(testSubject)}__${testSection}`;
console.log(`Clave para loadPendingTasksBySubject: "${key}"`);

// Simular ordenamiento por fecha de creación
const sortedActivities = [...activitiesForDate].sort((a, b) => {
  const dateA = new Date(a.createdAt || 0).getTime();
  const dateB = new Date(b.createdAt || 0).getTime();
  return dateA - dateB;
});

console.log(`Orden cronológico esperado:`);
sortedActivities.forEach((activity, idx) => {
  console.log(`N${idx + 1}: ${activity.title} (${activity.createdAt})`);
  
  // Verificar si aparecería en la tabla
  const hasResults = activity.evaluationResults && Object.keys(activity.evaluationResults).length > 0;
  const hasGrades = testGrades.some(g => String(g.testId) === String(activity.id));
  
  console.log(`    - Tiene evaluationResults: ${hasResults ? '✅' : '❌'}`);
  console.log(`    - Tiene TestGrades: ${hasGrades ? '✅' : '❌'}`);
  console.log(`    - Aparecería en tabla: ${hasResults || hasGrades ? '✅' : '❌'}`);
});

console.log('\n✅ Análisis completo. Con la nueva lógica, cada evaluación debería tener su propia actividad.');

// Helper para verificar mejora
window.verifyEvaluationFix = function() {
  console.log('🔍 Verificando corrección de evaluaciones duplicadas...');
  
  const evalsOnSameDate = activitiesForDate;
  console.log(`Evaluaciones en fecha problema: ${evalsOnSameDate.length}`);
  
  evalsOnSameDate.forEach(evaluation => {
    console.log(`\n📊 ${evaluation.title}:`);
    console.log(`  - ID único: ${evaluation.id}`);
    console.log(`  - Tiene resultados propios: ${!!evaluation.evaluationResults}`);
    
    if (evaluation.evaluationResults) {
      const students = Object.keys(evaluation.evaluationResults);
      console.log(`  - Estudiantes: ${students.length}`);
      students.forEach(student => {
        const result = evaluation.evaluationResults[student];
        console.log(`    - ${student}: ${result.completionPercentage}%`);
      });
    }
  });
};
