// Debug específico para duplicados de pruebas
console.log('🔍 ANÁLISIS DE DUPLICADOS EN PRUEBAS');

console.log('\n1️⃣ FUENTES DE PRUEBAS EN LOCALSTORAGE:');

// Listar todas las claves que empiecen con 'smart-student-tests'
const testKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('smart-student-tests')) {
    testKeys.push(key);
  }
}

console.log('Claves encontradas:', testKeys);

// Analizar contenido de cada clave
testKeys.forEach(key => {
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  console.log(`\n📁 ${key}: ${data.length} pruebas`);
  
  if (data.length > 0) {
    console.log('  Primeras 3 pruebas:', data.slice(0, 3).map(t => ({
      id: t.id,
      title: t.title,
      subject: t.subject || t.subjectName,
      createdAt: t.createdAt
    })));
  }
});

console.log('\n2️⃣ ANÁLISIS DE DUPLICADOS POR ID:');

// Combinar todas las pruebas
const allTests = [];
testKeys.forEach(key => {
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  if (Array.isArray(data)) {
    allTests.push(...data.map(t => ({ ...t, source: key })));
  }
});

console.log(`Total pruebas combinadas: ${allTests.length}`);

// Contar por ID
const idCounts = new Map();
allTests.forEach(test => {
  if (test.id) {
    const id = String(test.id);
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }
});

const duplicateIds = Array.from(idCounts.entries()).filter(([id, count]) => count > 1);
console.log(`IDs duplicados: ${duplicateIds.length}`);

duplicateIds.slice(0, 10).forEach(([id, count]) => {
  console.log(`\n🚨 ID duplicado: ${id} (${count} veces)`);
  const duplicates = allTests.filter(t => String(t.id) === id);
  duplicates.forEach((dup, idx) => {
    console.log(`  ${idx + 1}. Fuente: ${dup.source}, Título: ${dup.title}, Subject: ${dup.subject || dup.subjectName}`);
  });
});

console.log('\n3️⃣ ANÁLISIS POR CONTENIDO (título + subject + fecha):');

const contentMap = new Map();
allTests.forEach(test => {
  const key = `${test.title || ''}-${test.subject || test.subjectName || ''}-${String(test.createdAt || '').slice(0, 10)}`;
  if (!contentMap.has(key)) contentMap.set(key, []);
  contentMap.get(key).push(test);
});

const duplicateContent = Array.from(contentMap.entries()).filter(([key, tests]) => tests.length > 1);
console.log(`Contenido duplicado: ${duplicateContent.length} grupos`);

duplicateContent.slice(0, 5).forEach(([key, tests]) => {
  console.log(`\n📝 Contenido: ${key} (${tests.length} copias)`);
  tests.forEach((test, idx) => {
    console.log(`  ${idx + 1}. ID: ${test.id}, Fuente: ${test.source}`);
  });
});

console.log('\n4️⃣ TEST GRADES RELACIONADOS:');

const testGrades = JSON.parse(localStorage.getItem('test-grades') || '[]');
console.log(`Total TestGrades: ${testGrades.length}`);

// Analizar duplicados en TestGrades por testId
const gradesByTestId = new Map();
testGrades.forEach(grade => {
  const testId = String(grade.testId);
  if (!gradesByTestId.has(testId)) gradesByTestId.set(testId, []);
  gradesByTestId.get(testId).push(grade);
});

const duplicateGradesByTest = Array.from(gradesByTestId.entries()).filter(([testId, grades]) => {
  // Verificar si hay múltiples grades para el mismo estudiante
  const studentCounts = new Map();
  grades.forEach(g => {
    const key = String(g.studentId);
    studentCounts.set(key, (studentCounts.get(key) || 0) + 1);
  });
  return Array.from(studentCounts.values()).some(count => count > 1);
});

console.log(`TestIds con duplicados de estudiantes: ${duplicateGradesByTest.length}`);

duplicateGradesByTest.slice(0, 5).forEach(([testId, grades]) => {
  console.log(`\n🎯 TestID: ${testId}`);
  
  // Encontrar la prueba correspondiente
  const correspondingTest = allTests.find(t => String(t.id) === testId);
  if (correspondingTest) {
    console.log(`  Prueba: ${correspondingTest.title} (${correspondingTest.subject || correspondingTest.subjectName})`);
  }
  
  // Agrupar grades por estudiante
  const byStudent = new Map();
  grades.forEach(g => {
    const studentId = String(g.studentId);
    if (!byStudent.has(studentId)) byStudent.set(studentId, []);
    byStudent.get(studentId).push(g);
  });
  
  byStudent.forEach((studentGrades, studentId) => {
    if (studentGrades.length > 1) {
      console.log(`    👤 Estudiante ${studentId}: ${studentGrades.length} grades duplicados`);
      studentGrades.forEach((g, idx) => {
        console.log(`      ${idx + 1}. Score: ${g.score}, Fecha: ${new Date(g.gradedAt).toLocaleString()}`);
      });
    }
  });
});

console.log('\n✅ Análisis completo de duplicados');

// Helper para limpiar duplicados manualmente
window.cleanTestDuplicates = function() {
  console.log('🧹 Limpiando duplicados de pruebas...');
  
  // Deduplicar pruebas por ID
  const cleanTests = new Map();
  allTests.forEach(test => {
    if (test.id && !cleanTests.has(String(test.id))) {
      cleanTests.set(String(test.id), test);
    }
  });
  
  // Guardar solo en la clave principal
  const cleanedArray = Array.from(cleanTests.values());
  localStorage.setItem('smart-student-tests', JSON.stringify(cleanedArray));
  
  // Limpiar claves adicionales
  testKeys.forEach(key => {
    if (key !== 'smart-student-tests') {
      localStorage.removeItem(key);
      console.log(`Eliminada clave: ${key}`);
    }
  });
  
  console.log(`✅ Limpieza completa. Pruebas únicas guardadas: ${cleanedArray.length}`);
  
  // Recargar página para aplicar cambios
  setTimeout(() => window.location.reload(), 1000);
};

console.log('\n💡 Ejecuta: cleanTestDuplicates() para limpiar duplicados automáticamente');
