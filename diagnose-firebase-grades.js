// Script de diagnóstico para ver qué cursos tienen calificaciones en Firebase

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Cargar credenciales
let credential;
const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
try {
  const secretsFile = fs.readFileSync(secretsPath, 'utf-8');
  const serviceAccount = JSON.parse(secretsFile);
  credential = admin.credential.cert(serviceAccount);
  console.log('✅ Credenciales cargadas desde .secrets/firebase-admin.json');
} catch (e) {
  console.error('❌ No se encontró archivo de credenciales:', e.message);
  process.exit(1);
}

admin.initializeApp({ credential });
const db = admin.firestore();

async function diagnose() {
  console.log('\n📊 DIAGNÓSTICO DE CALIFICACIONES EN FIREBASE\n');
  
  // 1. Obtener todos los documentos de courses
  const coursesSnap = await db.collection('courses').get();
  console.log(`📚 Total de documentos en courses/: ${coursesSnap.size}\n`);
  
  const courseIds = [];
  coursesSnap.forEach(doc => {
    courseIds.push(doc.id);
  });
  
  console.log('IDs de cursos encontrados:');
  courseIds.forEach(id => console.log(`  - ${id}`));
  
  // 2. Para cada curso, contar calificaciones
  console.log('\n📝 Conteo de calificaciones por curso:\n');
  
  for (const courseId of courseIds) {
    const gradesSnap = await db.collection('courses').doc(courseId).collection('grades').limit(5).get();
    const count = gradesSnap.size;
    
    if (count > 0) {
      // Obtener el conteo total
      const allGrades = await db.collection('courses').doc(courseId).collection('grades').get();
      console.log(`✅ ${courseId}: ${allGrades.size} calificaciones`);
      
      // Mostrar una muestra
      if (allGrades.size > 0) {
        const sample = allGrades.docs[0].data();
        console.log(`   Muestra: studentName=${sample.studentName}, sectionId=${sample.sectionId}, year=${sample.year}`);
      }
    }
  }
  
  console.log('\n✅ Diagnóstico completado');
}

diagnose().catch(console.error).finally(() => process.exit(0));
