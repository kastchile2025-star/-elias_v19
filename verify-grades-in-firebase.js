#!/usr/bin/env node

/**
 * Script para verificar datos en Firebase/Firestore
 * Lee las calificaciones del año 2025 y muestra estadísticas
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando calificaciones en Firebase...\n');

try {
  // Cargar credenciales
  const credPath = path.join(__dirname, 'firebase-adminsdk-credentials.json');
  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  
  // Inicializar Firebase
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
  
  const db = admin.firestore();
  const year = 2025;
  
  console.log(`📅 Buscando calificaciones para el año ${year}...\n`);
  
  // Método 1: Usar collectionGroup para buscar en todas las subcolecciones "grades"
  db.collectionGroup('grades')
    .where('year', '==', year)
    .get()
    .then(snapshot => {
      console.log(`✅ Total de calificaciones encontradas: ${snapshot.size}\n`);
      
      if (snapshot.size === 0) {
        console.log('❌ No se encontraron calificaciones en Firebase para el año 2025');
        console.log('\n💡 Posibles causas:');
        console.log('  1. La carga masiva falló silenciosamente');
        console.log('  2. Los datos se guardaron en un año diferente');
        console.log('  3. Las credenciales apuntan a un proyecto diferente\n');
        process.exit(1);
      }
      
      // Agrupar por curso
      const porCurso = {};
      const porAsignatura = {};
      const estudiantes = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Contar por curso
        const curso = data.courseId || 'sin_curso';
        porCurso[curso] = (porCurso[curso] || 0) + 1;
        
        // Contar por asignatura
        const asignatura = data.subjectId || 'sin_asignatura';
        porAsignatura[asignatura] = (porAsignatura[asignatura] || 0) + 1;
        
        // Contar estudiantes únicos
        if (data.studentId) {
          estudiantes.add(data.studentId);
        }
      });
      
      console.log('📊 Estadísticas:\n');
      
      console.log('📚 Por Curso:');
      Object.entries(porCurso)
        .sort((a, b) => b[1] - a[1])
        .forEach(([curso, count]) => {
          console.log(`  ${curso}: ${count} calificaciones`);
        });
      
      console.log('\n📖 Por Asignatura:');
      Object.entries(porAsignatura)
        .sort((a, b) => b[1] - a[1])
        .forEach(([asignatura, count]) => {
          console.log(`  ${asignatura}: ${count} calificaciones`);
        });
      
      console.log(`\n👥 Estudiantes únicos: ${estudiantes.size}`);
      
      // Mostrar primeras 5 calificaciones como ejemplo
      console.log('\n📋 Primeras 5 calificaciones:\n');
      let count = 0;
      snapshot.forEach(doc => {
        if (count < 5) {
          const data = doc.data();
          console.log(`${count + 1}. ${data.studentName} - ${data.title || data.subjectId}`);
          console.log(`   Nota: ${data.score} | Fecha: ${data.gradedAt?.toDate?.() || data.gradedAt}`);
          console.log(`   Curso: ${data.courseId} | Tipo: ${data.type}\n`);
          count++;
        }
      });
      
      console.log('✅ Verificación completada exitosamente\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error al consultar Firestore:', error);
      console.error('\n💡 Detalles del error:', error.message);
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error en el script:', error.message);
  process.exit(1);
}
