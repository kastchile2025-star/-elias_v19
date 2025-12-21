// Script para diagnosticar y limpiar evaluaciones duplicadas por fecha
// Ejecutar en consola del navegador

console.log('🔍 DIAGNÓSTICO: Evaluaciones con fechas duplicadas');

// 1. Verificar evaluaciones actuales
const evalData = localStorage.getItem('smart-student-evaluations-2025');
if (evalData) {
  const evaluations = JSON.parse(evalData);
  console.log(`📊 Total evaluaciones almacenadas: ${evaluations.length}`);
  
  // Agrupar por fecha para encontrar duplicados
  const byDate = {};
  evaluations.forEach(eval => {
    const date = eval.createdAt?.slice(0, 10) || eval.dueDate?.slice(0, 10) || 'sin-fecha';
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(eval);
  });
  
  console.log('\n📅 Evaluaciones agrupadas por fecha:');
  Object.entries(byDate).forEach(([date, evals]) => {
    console.log(`${date}: ${evals.length} evaluaciones`);
    if (evals.length > 1) {
      console.log('  🚨 DUPLICADOS DETECTADOS:');
      evals.forEach((eval, i) => {
        console.log(`    ${i+1}. ID: ${eval.id}, Título: ${eval.title}`);
        if (eval.evaluationResults) {
          Object.entries(eval.evaluationResults).forEach(([student, result]) => {
            console.log(`       ${student}: ${result.completionPercentage}%`);
          });
        }
      });
    }
  });
  
  // Verificar específicamente 20/08/2025
  const aug20 = byDate['2025-08-20'];
  if (aug20 && aug20.length > 1) {
    console.log('\n🎯 CASO ESPECÍFICO 20/08/2025:');
    console.log(`Encontradas ${aug20.length} evaluaciones para esta fecha`);
    aug20.forEach((eval, i) => {
      console.log(`Evaluación ${i+1}: ID ${eval.id}`);
      if (eval.evaluationResults && eval.evaluationResults['sofia.castro']) {
        const result = eval.evaluationResults['sofia.castro'];
        console.log(`  Sofia Castro: ${result.completionPercentage}%`);
      }
    });
  } else {
    console.log('\n❌ No se encontraron múltiples evaluaciones para 20/08/2025');
    console.log('Esto indica que el problema del agrupamiento persiste');
  }
} else {
  console.log('❌ No hay evaluaciones almacenadas');
}

// 2. Verificar TestGrades
const testGrades = localStorage.getItem('test-grades-2025');
if (testGrades) {
  const grades = JSON.parse(testGrades);
  const evaluationGrades = grades.filter(g => 
    g.testId && g.testId.startsWith('imp-') && 
    g.subjectName === 'Ciencias Naturales' &&
    g.studentName === 'Sofia Castro'
  );
  
  console.log(`\n📈 TestGrades de Sofia Castro en Ciencias Naturales: ${evaluationGrades.length}`);
  evaluationGrades.forEach(grade => {
    const date = grade.date || 'sin-fecha';
    console.log(`${date}: ${grade.score}% (TestID: ${grade.testId})`);
  });
}

// 3. Función de limpieza (opcional)
window.limpiarEvaluacionesDuplicadas = function() {
  console.log('\n🧹 LIMPIANDO datos existentes...');
  
  // Eliminar datos antiguos
  localStorage.removeItem('smart-student-evaluations-2025');
  localStorage.removeItem('test-grades-2025');
  localStorage.removeItem('smart-student-tasks-2025');
  localStorage.removeItem('smart-student-tests-2025');
  
  console.log('✅ Datos eliminados. Ahora puedes hacer un nuevo import masivo.');
  console.log('💡 Las nuevas evaluaciones usarán claves individuales y no se agruparán por fecha.');
};

console.log('\n💡 Para limpiar datos y empezar de nuevo, ejecuta: limpiarEvaluacionesDuplicadas()');
console.log('📝 Después haz el import masivo nuevamente para aplicar las correcciones.');
