// Debug específico para verificar el proceso de deduplicación en la importación
console.log('🔧 DEBUG DEDUPLICACIÓN - Simulación del proceso');

// Simular la lógica de deduplicación que acabamos de implementar
function simulateDeduplication() {
  console.log('\n1️⃣ Estado antes de la importación:');
  
  // Obtener grades existentes
  const existingGrades = JSON.parse(localStorage.getItem('test-grades') || '[]');
  console.log('Grades existentes:', existingGrades.length);
  
  // Crear una copia de trabajo (como en el nuevo código)
  const updatedGrades = [...existingGrades];
  console.log('Copia de trabajo creada:', updatedGrades.length);
  
  // Simular algunos TestGrades nuevos que se crearían en una importación
  const newTestGrades = [
    {
      id: 'imp-test1-student1',
      testId: 'imp-test1',
      studentId: 'student1',
      studentName: 'Estudiante 1',
      score: 85,
      title: 'Prueba Importada 1',
      gradedAt: Date.now()
    },
    {
      id: 'imp-test1-student2', 
      testId: 'imp-test1',
      studentId: 'student2',
      studentName: 'Estudiante 2',
      score: 92,
      title: 'Prueba Importada 1',
      gradedAt: Date.now()
    }
  ];
  
  console.log('\n2️⃣ TestGrades a procesar:', newTestGrades.length);
  
  // Aplicar la nueva lógica de deduplicación
  let added = 0;
  let updated = 0;
  
  newTestGrades.forEach(newGrade => {
    const existingIndex = updatedGrades.findIndex(g => g.id === newGrade.id);
    
    if (existingIndex >= 0) {
      // Actualizar existente
      console.log(`Actualizando grade existente: ${newGrade.id}`);
      updatedGrades[existingIndex] = newGrade;
      updated++;
    } else {
      // Agregar nuevo
      console.log(`Agregando nuevo grade: ${newGrade.id}`);
      updatedGrades.push(newGrade);
      added++;
    }
  });
  
  console.log('\n3️⃣ Resultado de la deduplicación:');
  console.log('Grades agregados:', added);
  console.log('Grades actualizados:', updated);
  console.log('Total final:', updatedGrades.length);
  
  // Verificar duplicados en el resultado final
  const idCounts = new Map();
  updatedGrades.forEach(grade => {
    idCounts.set(grade.id, (idCounts.get(grade.id) || 0) + 1);
  });
  
  const duplicateIds = Array.from(idCounts.entries()).filter(([id, count]) => count > 1);
  console.log('IDs duplicados después de deduplicación:', duplicateIds.length);
  
  if (duplicateIds.length > 0) {
    console.log('🚨 DUPLICADOS ENCONTRADOS:');
    duplicateIds.forEach(([id, count]) => {
      console.log(`- ${id}: ${count} veces`);
    });
  } else {
    console.log('✅ No hay duplicados por ID');
  }
  
  // Verificar duplicados por testId + studentId
  const testStudentCounts = new Map();
  updatedGrades.forEach(grade => {
    const key = `${grade.testId}-${grade.studentId}`;
    testStudentCounts.set(key, (testStudentCounts.get(key) || 0) + 1);
  });
  
  const duplicateTestStudent = Array.from(testStudentCounts.entries()).filter(([key, count]) => count > 1);
  console.log('Duplicados por testId-studentId:', duplicateTestStudent.length);
  
  if (duplicateTestStudent.length > 0) {
    console.log('🚨 DUPLICADOS TESTID-STUDENTID:');
    duplicateTestStudent.slice(0, 5).forEach(([key, count]) => {
      console.log(`- ${key}: ${count} veces`);
    });
  } else {
    console.log('✅ No hay duplicados por testId-studentId');
  }
  
  return updatedGrades;
}

// Ejecutar simulación
const result = simulateDeduplication();

console.log('\n🔍 VERIFICACIÓN FINAL:');
console.log('Resultado de simulación disponible en variable "result"');
console.log('Puedes inspeccionar: result.filter(g => g.testId === "tu-test-id")');
