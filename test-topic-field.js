// Script de prueba para verificar que el campo topic se está procesando correctamente

const testGrade = {
  id: "test-123",
  testId: "lenguaje-tarea-1234567890",
  studentId: "10000000-8",
  studentName: "Test Student",
  score: 95,
  courseId: "1ro_basico",
  sectionId: "a",
  subjectId: "lenguaje-y-comunicacion",
  title: "Comprensión lectora: Cuentos infantiles",
  gradedAt: new Date().toISOString(),
  year: 2025,
  type: "tarea",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  topic: "Comprensión lectora: Cuentos infantiles" // ← CAMPO NUEVO
};

console.log("🧪 Test Grade Object:");
console.log(JSON.stringify(testGrade, null, 2));

console.log("\n✅ Campos incluidos:");
Object.keys(testGrade).forEach(key => {
  console.log(`  - ${key}: ${typeof testGrade[key]}`);
});

console.log("\n🔍 Campo 'topic' presente:", 'topic' in testGrade);
console.log("📝 Valor del topic:", testGrade.topic);

// Simular la función mapGrade de bulk-uploads.tsx
const mapGradeSimulation = (g) => {
  const mapped = {
    id: g.id,
    testId: g.testId,
    studentId: g.studentId,
    studentName: g.studentName,
    score: g.score,
    courseId: g.courseId,
    sectionId: g.sectionId,
    subjectId: g.subjectId,
    title: g.title,
    gradedAt: g.gradedAt,
    year: g.year,
    type: g.type,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
  
  // Agregar topic si existe
  if (g.topic) {
    mapped.topic = g.topic;
  }
  
  return mapped;
};

const mappedGrade = mapGradeSimulation(testGrade);

console.log("\n📦 Después del mapeo:");
console.log(JSON.stringify(mappedGrade, null, 2));
console.log("\n🔍 Campo 'topic' en objeto mapeado:", 'topic' in mappedGrade);

// Simular toFirestoreGrade (spread operator)
const toFirestoreGradeSimulation = (grade) => {
  return {
    ...grade,
    year: Number(grade.year),
    // Los Timestamps se agregarían aquí
  };
};

const firestoreGrade = toFirestoreGradeSimulation(mappedGrade);

console.log("\n🔥 Objeto final para Firebase:");
console.log(JSON.stringify(firestoreGrade, null, 2));
console.log("\n✅ Campo 'topic' llegará a Firebase:", 'topic' in firestoreGrade);
