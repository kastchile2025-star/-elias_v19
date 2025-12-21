/**
 * Script para verificar la estructura de asistencia en Firebase
 */

const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

async function testAttendanceStructure() {
  try {
    console.log('🔧 Inicializando Firebase Admin...');
    
    // Cargar credenciales
    const credPath = path.join(__dirname, '.secrets', 'firebase-admin.json');
    const credJson = await fs.readFile(credPath, 'utf-8');
    const serviceAccount = JSON.parse(credJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    const db = admin.firestore();
    
    console.log('\n📚 Consultando cursos...');
    const coursesSnapshot = await db.collection('courses').limit(3).get();
    console.log(`✅ Encontrados ${coursesSnapshot.size} cursos (mostrando 3)`);
    
    for (const courseDoc of coursesSnapshot.docs) {
      console.log(`\n📖 Curso: ${courseDoc.id}`);
      
      const attRef = db.collection(`courses/${courseDoc.id}/attendance`);
      const attSnapshot = await attRef.limit(5).get();
      
      console.log(`   └─ Asistencia: ${attSnapshot.size} registros (mostrando 5)`);
      
      attSnapshot.forEach((doc, idx) => {
        const data = doc.data();
        console.log(`   ${idx + 1}. ID: ${doc.id}`);
        console.log(`      ├─ Fecha: ${data.dateString || data.date?.toDate?.()}`);
        console.log(`      ├─ Estudiante: ${data.studentUsername || data.studentId}`);
        console.log(`      ├─ Curso: ${data.course || data.courseId}`);
        console.log(`      ├─ Sección: ${data.section || data.sectionId || 'N/A'}`);
        console.log(`      ├─ Estado: ${data.status}`);
        console.log(`      ├─ Año: ${data.year}`);
        console.log(`      └─ Comentario: ${data.comment || 'N/A'}`);
      });
    }
    
    // Probar query por año
    console.log('\n🔍 Probando consulta por año 2025...');
    let totalFound = 0;
    
    const coursesAll = await db.collection('courses').get();
    for (const courseDoc of coursesAll.docs) {
      const attRef = db.collection(`courses/${courseDoc.id}/attendance`);
      const q = attRef.where('year', '==', 2025);
      const attSnapshot = await q.get();
      totalFound += attSnapshot.size;
    }
    
    console.log(`✅ Total de registros de asistencia para 2025: ${totalFound}`);
    
    console.log('\n✅ Test completado!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAttendanceStructure();
