#!/usr/bin/env node
/**
 * Script de diagnóstico para verificar la configuración de Firebase
 * Uso: node scripts/check-firebase.js
 */

require('dotenv').config({ path: '.env.local' });

const chalk = require('chalk');

console.log(chalk.bold.blue('\n🔍 Diagnóstico de Firebase\n'));

// Verificar variables de entorno del cliente
console.log(chalk.bold('1️⃣ Variables de entorno del Cliente (Frontend):'));
const clientVars = [
  'NEXT_PUBLIC_USE_FIREBASE',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

let clientOk = true;
clientVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('YOUR_')) {
    console.log(chalk.red(`   ❌ ${varName}: NO configurada`));
    clientOk = false;
  } else {
    const masked = varName.includes('KEY') || varName.includes('ID') 
      ? value.substring(0, 10) + '...' 
      : value;
    console.log(chalk.green(`   ✅ ${varName}: ${masked}`));
  }
});

// Verificar variables de entorno del servidor
console.log(chalk.bold('\n2️⃣ Variables de entorno del Servidor (Admin SDK):'));
const hasJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const hasFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;

let serverOk = false;
if (hasJson && !hasJson.includes('YOUR_')) {
  console.log(chalk.green('   ✅ FIREBASE_SERVICE_ACCOUNT_JSON: Configurado'));
  serverOk = true;
} else if (hasFile && !hasFile.includes('YOUR_')) {
  const fs = require('fs');
  if (fs.existsSync(hasFile)) {
    console.log(chalk.green(`   ✅ FIREBASE_SERVICE_ACCOUNT_FILE: ${hasFile} (existe)`));
    serverOk = true;
  } else {
    console.log(chalk.red(`   ❌ FIREBASE_SERVICE_ACCOUNT_FILE: ${hasFile} (NO existe)`));
  }
} else {
  console.log(chalk.red('   ❌ No hay credenciales del Admin SDK configuradas'));
  console.log(chalk.yellow('      Descarga el JSON desde Firebase Console > Cuentas de servicio'));
}

// Resumen
console.log(chalk.bold('\n📊 Resumen:\n'));
if (clientOk && serverOk) {
  console.log(chalk.green.bold('   ✅ TODO LISTO - Firebase está configurado correctamente'));
  console.log(chalk.blue('\n   Próximos pasos:'));
  console.log(chalk.blue('   1. Reinicia el servidor: npm run dev'));
  console.log(chalk.blue('   2. Ve a: http://localhost:9002/dashboard/calificaciones'));
  console.log(chalk.blue('   3. El indicador debe mostrar: 🟢 Activo • Firebase\n'));
} else {
  console.log(chalk.red.bold('   ❌ FALTAN CONFIGURACIONES'));
  if (!clientOk) {
    console.log(chalk.yellow('\n   Cliente: Edita .env.local con tus credenciales de Firebase Console'));
  }
  if (!serverOk) {
    console.log(chalk.yellow('   Servidor: Descarga el JSON de cuenta de servicio y configúralo en .env.local'));
  }
  console.log(chalk.blue('\n   Guía completa: docs/FIREBASE_SETUP.md\n'));
}
