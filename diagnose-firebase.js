#!/usr/bin/env node

/**
 * Script simplificado para verificar Firebase y crear índice si es necesario
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico de Firebase/Firestore...\n');

try {
  const credPath = path.join(__dirname, 'firebase-adminsdk-credentials.json');
  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
  
  const db = admin.firestore();
  
  console.log(`✅ Conectado a Firebase Project: ${serviceAccount.project_id}\n`);
  
  // Paso 1: Verificar si existen cursos
  console.log('📚 Paso 1: Verificando colección "courses"...');
  db.collection('courses')
    .limit(5)
    .get()
    .then(coursesSnap => {
      console.log(`   Cursos encontrados: ${coursesSnap.size}`);
      
      if (coursesSnap.size === 0) {
        console.log('   ⚠️ No hay cursos en Firestore\n');
        console.log('💡 Esto significa que la carga masiva podría haber fallado.');
        console.log('   Verifica los logs del servidor cuando hiciste la carga.\n');
        process.exit(1);
      }
      
      // Mostrar cursos
      coursesSnap.forEach(doc => {
        console.log(`   - ${doc.id}`);
      });
      
      // Paso 2: Buscar calificaciones curso por curso
      console.log('\n📊 Paso 2: Buscando calificaciones por curso...\n');
      
      const promises = [];
      coursesSnap.forEach(courseDoc => {
        const courseId = courseDoc.id;
        promises.push(
          courseDoc.ref.collection('grades').get().then(gradesSnap => {
            return { courseId, count: gradesSnap.size };
          })
        );
      });
      
      return Promise.all(promises);
    })
    .then(results => {
      let totalGrades = 0;
      results.forEach(({ courseId, count }) => {
        if (count > 0) {
          console.log(`   ${courseId}: ${count} calificaciones`);
          totalGrades += count;
        }
      });
      
      console.log(`\n✅ Total de calificaciones: ${totalGrades}\n`);
      
      if (totalGrades === 0) {
        console.log('❌ No se encontraron calificaciones en Firebase');
        console.log('\n💡 Posibles causas:');
        console.log('  1. La carga masiva no se completó');
        console.log('  2. Los datos se guardaron en otra ubicación');
        console.log('  3. Hubo un error durante la escritura\n');
        console.log('📋 Revisa los logs del servidor durante la carga masiva\n');
      } else {
        console.log('🎉 ¡Las calificaciones están en Firebase!');
        console.log('\n💡 Si no se ven en la UI, el problema está en la lectura desde el frontend.\n');
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      
      if (error.code === 9 || error.message.includes('FAILED_PRECONDITION')) {
        console.log('\n💡 Error de índice faltante. Solución:');
        console.log('  1. Abre: https://console.firebase.google.com/project/superjf1234-e9cbc/firestore');
        console.log('  2. Ve a la pestaña "Datos"');
        console.log('  3. Si no existe la base de datos, créala en modo "Producción"');
        console.log('  4. Configura las reglas de seguridad para permitir lectura/escritura desde admin\n');
      }
      
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
}
