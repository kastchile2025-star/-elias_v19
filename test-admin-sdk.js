// Script de prueba para verificar Firebase Admin SDK
console.log('🔍 Verificando configuración de Firebase Admin SDK...\n');

// 1. Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('  FIREBASE_SERVICE_ACCOUNT_FILE:', process.env.FIREBASE_SERVICE_ACCOUNT_FILE);
console.log('  NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('');

// 2. Verificar existencia del archivo
const fs = require('fs');
const path = require('path');

const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || './firebase-adminsdk-credentials.json';
const fullPath = path.join(process.cwd(), filePath);

console.log('📁 Verificando archivo de credenciales:');
console.log('  Ruta:', fullPath);

if (fs.existsSync(fullPath)) {
  console.log('  ✅ Archivo existe');
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const credentials = JSON.parse(content);
    console.log('  ✅ JSON válido');
    console.log('  📦 project_id:', credentials.project_id);
    console.log('  📧 client_email:', credentials.client_email);
    console.log('  🔑 private_key:', credentials.private_key ? '✅ Presente' : '❌ Faltante');
  } catch (error) {
    console.log('  ❌ Error al leer/parsear archivo:', error.message);
  }
} else {
  console.log('  ❌ Archivo NO existe');
}

console.log('\n✅ Verificación completada');
