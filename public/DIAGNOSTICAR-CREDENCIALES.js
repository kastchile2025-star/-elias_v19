/**
 * 🔍 DIAGNÓSTICO COMPLETO DE CREDENCIALES FIREBASE
 * 
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este código completo
 * 3. Presiona ENTER
 * 4. Espera los resultados
 */

console.log('%c🔍 INICIANDO DIAGNÓSTICO DE CREDENCIALES FIREBASE', 'background: #4CAF50; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('⏱️ Esperando resultados...\n');

// Test 1: Verificar endpoint de contadores
async function test1() {
  console.log('%c📊 TEST 1: Endpoint de contadores', 'background: #2196F3; color: white; padding: 5px;');
  try {
    const response = await fetch('/api/firebase/grade-counters?year=2025');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ ÉXITO: Endpoint funciona correctamente');
      console.log('📈 Datos recibidos:', data);
      return { success: true, data };
    } else {
      console.error('❌ ERROR:', response.status, response.statusText);
      console.error('📄 Detalles:', data);
      
      // Analizar el error específico
      if (data.error && data.error.includes('UNAUTHENTICATED')) {
        console.error('⚠️ DIAGNÓSTICO: Credenciales inválidas o expiradas');
        console.error('💡 SOLUCIÓN: Regenera las credenciales en Firebase Console');
        console.error('🔗 URL: https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk');
        return { success: false, issue: 'UNAUTHENTICATED', solution: 'regenerate_credentials' };
      } else if (data.error && data.error.includes('Could not load')) {
        console.error('⚠️ DIAGNÓSTICO: Credenciales no configuradas');
        console.error('💡 SOLUCIÓN: Configura FIREBASE_SERVICE_ACCOUNT_JSON en .env.local');
        return { success: false, issue: 'NOT_CONFIGURED', solution: 'configure_env' };
      } else {
        console.error('⚠️ DIAGNÓSTICO: Error desconocido');
        return { success: false, issue: 'UNKNOWN', error: data };
      }
    }
  } catch (error) {
    console.error('❌ FALLO EN LA CONEXIÓN:', error);
    return { success: false, issue: 'NETWORK_ERROR', error: error.message };
  }
}

// Test 2: Verificar estructura del endpoint de carga
async function test2() {
  console.log('\n%c📦 TEST 2: Endpoint de carga masiva', 'background: #2196F3; color: white; padding: 5px;');
  try {
    // Solo verificamos que el endpoint existe (no subimos archivo real)
    const formData = new FormData();
    formData.append('year', '2025');
    formData.append('dryRun', 'true'); // Flag para modo prueba
    
    const response = await fetch('/api/firebase/bulk-upload-grades', {
      method: 'POST',
      body: formData
    });
    
    const text = await response.text();
    
    if (text.includes('UNAUTHENTICATED')) {
      console.error('❌ ERROR: Endpoint de carga también falla con UNAUTHENTICATED');
      return { success: false, issue: 'UNAUTHENTICATED' };
    } else if (text.includes('file')) {
      console.log('✅ PARCIAL: Endpoint responde (espera archivo)');
      return { success: true, note: 'Endpoint activo' };
    } else {
      console.warn('⚠️ Respuesta inesperada del endpoint');
      console.log('📄 Respuesta:', text.substring(0, 200));
      return { success: 'partial', response: text.substring(0, 200) };
    }
  } catch (error) {
    console.error('❌ FALLO:', error);
    return { success: false, error: error.message };
  }
}

// Test 3: Verificar variables de entorno (lado cliente)
function test3() {
  console.log('\n%c🔐 TEST 3: Variables de entorno del cliente', 'background: #2196F3; color: white; padding: 5px;');
  
  const firebaseConfig = {
    apiKey: typeof NEXT_PUBLIC_FIREBASE_API_KEY !== 'undefined' ? '✅ Configurada' : '❌ Falta',
    authDomain: typeof NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN !== 'undefined' ? '✅ Configurada' : '❌ Falta',
    projectId: typeof NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'undefined' ? '✅ Configurada' : '❌ Falta',
    storageBucket: typeof NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET !== 'undefined' ? '✅ Configurada' : '❌ Falta',
    messagingSenderId: typeof NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID !== 'undefined' ? '✅ Configurada' : '❌ Falta',
    appId: typeof NEXT_PUBLIC_FIREBASE_APP_ID !== 'undefined' ? '✅ Configurada' : '❌ Falta',
  };
  
  console.table(firebaseConfig);
  
  const allConfigured = Object.values(firebaseConfig).every(v => v.includes('✅'));
  if (allConfigured) {
    console.log('✅ Todas las variables del cliente están configuradas');
    return { success: true };
  } else {
    console.warn('⚠️ Algunas variables del cliente faltan');
    return { success: false, missing: firebaseConfig };
  }
}

// Ejecutar todos los tests
(async function runAllTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Test 1
  results.tests.countersEndpoint = await test1();
  await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa entre tests
  
  // Test 2
  results.tests.uploadEndpoint = await test2();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 3
  results.tests.clientEnv = test3();
  
  // Resumen final
  console.log('\n%c📊 RESUMEN DEL DIAGNÓSTICO', 'background: #9C27B0; color: white; font-size: 14px; padding: 10px; border-radius: 5px;');
  
  const test1Success = results.tests.countersEndpoint.success === true;
  const test2Success = results.tests.uploadEndpoint.success === true || results.tests.uploadEndpoint.success === 'partial';
  const test3Success = results.tests.clientEnv.success === true;
  
  console.log('Test 1 (Contadores):', test1Success ? '✅ PASÓ' : '❌ FALLÓ');
  console.log('Test 2 (Carga):', test2Success ? '✅ PASÓ' : '❌ FALLÓ');
  console.log('Test 3 (Variables):', test3Success ? '✅ PASÓ' : '❌ FALLÓ');
  
  if (test1Success && test2Success && test3Success) {
    console.log('\n%c🎉 TODO FUNCIONA CORRECTAMENTE', 'background: #4CAF50; color: white; font-size: 16px; padding: 10px;');
    console.log('✅ Las credenciales de Firebase están correctamente configuradas');
    console.log('✅ Puedes proceder con la carga masiva de calificaciones');
  } else {
    console.log('\n%c⚠️ SE DETECTARON PROBLEMAS', 'background: #FF5722; color: white; font-size: 16px; padding: 10px;');
    
    if (!test1Success) {
      const issue = results.tests.countersEndpoint.issue;
      
      if (issue === 'UNAUTHENTICATED') {
        console.log('\n🔧 PROBLEMA: Credenciales inválidas o expiradas');
        console.log('💡 SOLUCIÓN:');
        console.log('1. Ve a: https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk');
        console.log('2. Haz clic en "Generate new private key"');
        console.log('3. Descarga el nuevo archivo JSON');
        console.log('4. Copia el contenido completo del JSON');
        console.log('5. Abre .env.local');
        console.log('6. Reemplaza el valor de FIREBASE_SERVICE_ACCOUNT_JSON=');
        console.log('7. Reinicia el servidor: pkill -f "next dev" && npm run dev');
      } else if (issue === 'NOT_CONFIGURED') {
        console.log('\n🔧 PROBLEMA: Credenciales no configuradas');
        console.log('💡 SOLUCIÓN:');
        console.log('1. Obtén el Service Account JSON de Firebase Console');
        console.log('2. Agrégalo a .env.local como FIREBASE_SERVICE_ACCOUNT_JSON');
        console.log('3. Reinicia el servidor');
      } else {
        console.log('\n🔧 PROBLEMA: Error desconocido');
        console.log('📄 Detalles:', results.tests.countersEndpoint);
      }
    }
    
    if (!test3Success) {
      console.log('\n⚠️ Variables de entorno del cliente incompletas');
      console.log('Esto puede afectar otras funcionalidades de Firebase');
    }
  }
  
  console.log('\n📋 Resultados completos guardados en:');
  console.log('window.firebaseDiagnosticResults');
  window.firebaseDiagnosticResults = results;
  
  return results;
})();
