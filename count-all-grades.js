const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
const secretsFile = fs.readFileSync(secretsPath, 'utf-8');
const serviceAccount = JSON.parse(secretsFile);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function count() {
  console.log('\n📊 CONTEO DE CALIFICACIONES EN FIREBASE\n');
  
  const courses = ['1ro_basico', '2do_basico', '1ro_medio', '2do_medio'];
  
  for (const course of courses) {
    const snap = await db.collection('courses').doc(course).collection('grades').get();
    console.log(`${course}: ${snap.size} calificaciones`);
    
    // Contar por sección
    const sections = new Map();
    snap.forEach(doc => {
      const d = doc.data();
      const sid = d.sectionId || 'unknown';
      sections.set(sid, (sections.get(sid) || 0) + 1);
    });
    
    console.log('  Por sección:');
    sections.forEach((count, sid) => {
      console.log(`    ${sid}: ${count}`);
    });
    console.log('');
  }
}

count().catch(console.error).finally(() => process.exit(0));
