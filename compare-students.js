// Comparar nombres de estudiantes entre Firebase y archivo de usuarios
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

// Leer archivo de usuarios
const usersFile = path.join(process.cwd(), 'public/test-data/users-consolidated-2025-CORREGIDO_v2.csv');
const content = fs.readFileSync(usersFile, 'utf-8');
const lines = content.split('\n').slice(1);

// Estudiantes del 1ro Medio A del archivo
const fileStudents = [];
lines.forEach(line => {
  const parts = line.split(',');
  if (parts.length >= 8) {
    const role = parts[0];
    const name = parts[1];
    const rut = parts[2];
    const course = parts[6];
    const section = parts[7];
    
    if (role === 'student' && course === '1ro Medio' && section === 'A') {
      fileStudents.push({ name: name.trim(), rut: rut.trim() });
    }
  }
});

(async () => {
  // Obtener estudiantes de Firebase
  const snap = await db.collection('courses').doc('1ro_medio').collection('grades')
    .where('sectionId', '==', '38b8134b-1778-4437-a94d-d087223b597a')
    .where('year', '==', 2025)
    .limit(1000)
    .get();
  
  const firebaseStudents = new Map();
  snap.forEach(doc => {
    const d = doc.data();
    if (!firebaseStudents.has(d.studentName)) {
      firebaseStudents.set(d.studentName, d.studentId);
    }
  });
  
  console.log('\n📊 COMPARACIÓN DE ESTUDIANTES\n');
  console.log('Estudiantes CON calificaciones visibles en UI (según imagen):');
  console.log('  ✅ Agustín, Amanda, Benjamín, Catalina, Diego, Emilia, Florencia');
  console.log('\nEstudiantes SIN calificaciones visibles en UI:');
  console.log('  ❌ Alberto, Andrés, Ángel, Antonia, Carolina, Constanza, etc.\n');
  
  console.log('='.repeat(80));
  console.log('NOMBRE EN ARCHIVO'.padEnd(35) + 'NOMBRE EN FIREBASE'.padEnd(35) + 'MATCH?');
  console.log('='.repeat(80));
  
  // Normalizar para comparar
  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  
  fileStudents.forEach(fs => {
    const fileNorm = normalize(fs.name);
    let match = null;
    
    // Buscar match en Firebase
    for (const [fbName, fbRut] of firebaseStudents) {
      const fbNorm = normalize(fbName);
      if (fileNorm === fbNorm) {
        match = fbName;
        break;
      }
    }
    
    const status = match ? '✅' : '❌';
    console.log(`${fs.name.padEnd(35)}${(match || 'NO ENCONTRADO').padEnd(35)}${status}`);
  });
  
  process.exit(0);
})();
