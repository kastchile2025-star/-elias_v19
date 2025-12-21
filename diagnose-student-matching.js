const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Cargar credenciales
const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
const secretsFile = fs.readFileSync(secretsPath, 'utf-8');
const serviceAccount = JSON.parse(secretsFile);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function diagnose() {
  console.log('\n📊 DIAGNÓSTICO DE MATCHING DE ESTUDIANTES - 1ro Medio A\n');
  
  // Obtener calificaciones de 1ro Medio
  const gradesSnap = await db.collection('courses').doc('1ro_medio').collection('grades')
    .where('year', '==', 2025)
    .limit(500)
    .get();
  
  console.log(`📝 Total calificaciones encontradas: ${gradesSnap.size}\n`);
  
  // Agrupar por studentId y studentName
  const studentMap = new Map();
  gradesSnap.forEach(doc => {
    const d = doc.data();
    const key = `${d.studentId}|${d.studentName}`;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentId: d.studentId,
        studentName: d.studentName,
        sectionId: d.sectionId,
        count: 0
      });
    }
    studentMap.get(key).count++;
  });
  
  // Mostrar estudiantes únicos
  console.log('👥 Estudiantes únicos con calificaciones:');
  const students = Array.from(studentMap.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
  
  // Filtrar solo sección A
  const sectionAStudents = students.filter(s => {
    // El sectionId podría ser 'a', 'A', o un UUID
    const sid = String(s.sectionId || '').toLowerCase();
    return sid === 'a' || sid.includes('a') || sid.length > 10; // UUID tiene más de 10 chars
  });
  
  console.log(`\n📋 Estudiantes en sección que podrían ser "A" (total: ${sectionAStudents.length}):\n`);
  
  sectionAStudents.slice(0, 20).forEach((s, i) => {
    console.log(`${i+1}. ${s.studentName}`);
    console.log(`   studentId: "${s.studentId}"`);
    console.log(`   sectionId: "${s.sectionId}"`);
    console.log(`   calificaciones: ${s.count}`);
    console.log('');
  });
  
  // Mostrar todos los sectionIds únicos
  const sectionIds = new Set();
  students.forEach(s => sectionIds.add(s.sectionId));
  console.log('\n🔑 SectionIds únicos encontrados:');
  sectionIds.forEach(sid => console.log(`  - "${sid}"`));
}

diagnose().catch(console.error).finally(() => process.exit(0));
