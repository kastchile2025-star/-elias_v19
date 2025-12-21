#!/usr/bin/env node

/**
 * Script de prueba de conexión a Firebase
 * Verifica que las credenciales estén correctamente configuradas
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔥 Probando conexión a Firebase...\n');

try {
  // Buscar el archivo de credenciales
  const credPath = path.join(__dirname, 'firebase-adminsdk-credentials.json');
  
  if (!fs.existsSync(credPath)) {
    console.error('❌ No se encontró el archivo de credenciales:', credPath);
    process.exit(1);
  }
  
  console.log('✅ Archivo de credenciales encontrado:', credPath);
  
  // Leer y parsear el archivo
  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  console.log('✅ Credenciales parseadas correctamente');
  console.log('   Project ID:', serviceAccount.project_id);
  console.log('   Client Email:', serviceAccount.client_email);
  
  // Inicializar Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  }
  
  // Probar conexión a Firestore
  const db = admin.firestore();
  console.log('✅ Firestore conectado');
  
  // Intentar escribir un documento de prueba
  const testRef = db.collection('_test').doc('connection');
  
  testRef.set({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    message: 'Prueba de conexión exitosa',
  })
    .then(() => {
      console.log('✅ Escritura a Firestore exitosa');
      
      // Leer el documento
      return testRef.get();
    })
    .then((doc) => {
      if (doc.exists) {
        console.log('✅ Lectura de Firestore exitosa');
        console.log('   Datos:', doc.data());
        
        // Eliminar el documento de prueba
        return testRef.delete();
      } else {
        throw new Error('El documento no existe');
      }
    })
    .then(() => {
      console.log('✅ Eliminación del documento de prueba exitosa');
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! Firebase está correctamente configurado.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en las operaciones de Firestore:', error);
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error al probar Firebase:', error.message);
  console.error(error);
  process.exit(1);
}
