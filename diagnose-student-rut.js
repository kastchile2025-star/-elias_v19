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

async function diagnose() {
  console.log('\n📊 DIAGNÓSTICO - ESTUDIANTES EN 1ro Medio A\n');
  
  const sectionId = '38b8134b-1778-4437-a94d-d087223b597a'; // 1ro Medio A
  
  // Obtener todas las calificaciones de esta sección
  const gradesSnap = await db.collection('courses').doc('1ro_medio').collection('grades')
    .where('sectionId', '==', sectionId)
    .where('year', '==', 2025)
    .get();
  
  console.log(`📝 Total calificaciones en 1ro Medio A: ${gradesSnap.size}\n`);
  
  // Obtener estudiantes únicos con sus RUTs
  const studentMap = new Map();
  gradesSnap.forEach(doc => {
    const d = doc.data();
    const rut = d.studentId || '';
    const name = d.studentName || '';
    if (!studentMap.has(rut)) {
      studentMap.set(rut, { rut, name, count: 0 });
    }
    studentMap.get(rut).count++;
  });
  
  console.log(`👥 Estudiantes únicos: ${studentMap.size}\n`);
  
  // Listar todos ordenados por nombre
  const students = Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  console.log('Lista completa de estudiantes con calificaciones:');
  students.forEach((s, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${s.name.padEnd(35)} RUT: ${s.rut.padEnd(12)} (${s.count} notas)`);
  });
}

diagnose().catch(console.error).finally(() => process.exit(0));
