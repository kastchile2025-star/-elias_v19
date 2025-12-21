#!/usr/bin/env node

/**
 * Script de verificación de configuración de Firebase
 * Ejecutar con: node verify-firebase-config.js
 */

console.log('🔍 Verificando configuración de Firebase...\n');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const checks = [];

// 1. Verificar que USE_FIREBASE esté habilitado
const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE;
checks.push({
  name: 'NEXT_PUBLIC_USE_FIREBASE',
  value: useFirebase,
  status: useFirebase === 'true' ? '✅' : '❌',
  required: true
});

// 2. Verificar credenciales del cliente (Web SDK)
const clientVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

clientVars.forEach(varName => {
  const value = process.env[varName];
  const isPlaceholder = !value || 
    value.includes('your-') || 
    value.includes('here') ||
    value.includes('TODO');
  
  checks.push({
    name: varName,
    value: value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'NO CONFIGURADO',
    status: (value && !isPlaceholder) ? '✅' : '❌',
    required: true
  });
});

// 3. Verificar credenciales del servidor (Admin SDK)
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let serviceAccountValid = false;

if (serviceAccountKey) {
  try {
    const parsed = JSON.parse(serviceAccountKey);
    serviceAccountValid = Boolean(
      parsed.type === 'service_account' &&
      parsed.project_id &&
      parsed.private_key &&
      parsed.client_email
    );
  } catch (e) {
    serviceAccountValid = false;
  }
}

checks.push({
  name: 'FIREBASE_SERVICE_ACCOUNT_KEY',
  value: serviceAccountKey ? 
    (serviceAccountValid ? 'JSON válido' : 'JSON INVÁLIDO') : 
    'NO CONFIGURADO',
  status: serviceAccountValid ? '✅' : '❌',
  required: true
});

// Mostrar resultados
console.log('📋 Resultados de la verificación:\n');
console.log('Variable                              | Estado | Valor');
console.log('--------------------------------------|--------|------------------');

let allPassed = true;
checks.forEach(check => {
  const name = check.name.padEnd(37);
  const status = check.status;
  console.log(`${name} | ${status}     | ${check.value}`);
  
  if (check.required && check.status === '❌') {
    allPassed = false;
  }
});

console.log('\n');

if (allPassed) {
  console.log('✅ ¡Todas las configuraciones están correctas!');
  console.log('');
  console.log('Próximo paso: Reinicia el servidor con `npm run dev`');
} else {
  console.log('❌ Hay configuraciones faltantes o incorrectas.');
  console.log('');
  console.log('📖 Instrucciones:');
  console.log('1. Lee el archivo: setup-firebase-credentials.md');
  console.log('2. Obtén tus credenciales desde Firebase Console');
  console.log('3. Actualiza el archivo .env.local');
  console.log('4. Vuelve a ejecutar este script: node verify-firebase-config.js');
  process.exit(1);
}

console.log('\n🔗 Enlaces útiles:');
console.log('• Firebase Console: https://console.firebase.google.com/project/superjf1234-e9cbc');
console.log('• Configuración Web: https://console.firebase.google.com/project/superjf1234-e9cbc/settings/general');
console.log('• Cuenta de Servicio: https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk');
console.log('• Firestore: https://console.firebase.google.com/project/superjf1234-e9cbc/firestore');
console.log('');
