const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
const secretsFile = fs.readFileSync(secretsPath, 'utf-8');
const serviceAccount = JSON.parse(secretsFile);
if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

(async () => {
  // Obtener TODAS las calificaciones de 1ro Medio
  const snap = await db.collection('courses').doc('1ro_medio').collection('grades').get();
  
  console.log('Total calificaciones en 1ro Medio:', snap.size);
  
  const studentsBySection = new Map();
  snap.forEach(doc => {
    const d = doc.data();
    const key = d.sectionId || 'unknown';
    if (!studentsBySection.has(key)) {
      studentsBySection.set(key, new Set());
    }
    studentsBySection.get(key).add(d.studentName);
  });
  
  console.log('\nEstudiantes únicos por sección:');
  studentsBySection.forEach((students, section) => {
    console.log(`  ${section}: ${students.size} estudiantes`);
  });
  
  // Listar todos los estudiantes de la sección A
  const sectionA = '38b8134b-1778-4437-a94d-d087223b597a';
  if (studentsBySection.has(sectionA)) {
    console.log('\nEstudiantes en sección A (UUID):');
    Array.from(studentsBySection.get(sectionA)).sort().forEach((n, i) => {
      console.log(`  ${i+1}. ${n}`);
    });
  }
  
  process.exit(0);
})();
