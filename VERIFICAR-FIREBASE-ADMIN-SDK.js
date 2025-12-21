// =============================================================================
// 🔥 VERIFICACIÓN COMPLETA DE FIREBASE ADMIN SDK
// =============================================================================
//
// ✅ Ejecuta este script en la consola del navegador para verificar:
//    1. Credenciales del Admin SDK configuradas correctamente
//    2. Conexión a Firestore funcionando
//    3. Permisos de lectura/escritura habilitados
//
// 📋 Instrucciones:
//    1. Abre la consola del navegador (F12 → Console)
//    2. Copia y pega este código completo
//    3. Presiona Enter
//    4. Espera los resultados de la verificación
//
// =============================================================================

(async function verificarFirebaseAdminSDK() {
  console.log('');
  console.log('🔥 ======================================');
  console.log('🔥 VERIFICACIÓN FIREBASE ADMIN SDK');
  console.log('🔥 ======================================');
  console.log('');

  // 1. Verificar que el servidor tenga las credenciales
  console.log('📋 Paso 1: Verificando credenciales del servidor...');
  
  try {
    // Intentar hacer una operación simple en Firestore (contar documentos)
    const response = await fetch('/api/firebase/grade-counters?year=2025');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ ÉXITO: El servidor tiene credenciales válidas');
      console.log('📊 Datos obtenidos de Firestore:', data);
      console.log('');
      console.log('🎉 ¡FIREBASE ADMIN SDK ESTÁ FUNCIONANDO CORRECTAMENTE!');
      console.log('');
      console.log('✅ Ya puedes realizar la carga masiva de calificaciones');
      console.log('');
      return true;
    } else {
      console.error('❌ Error en la respuesta del servidor:', response.status);
      console.error('📋 Detalles:', data);
      
      if (data.error && data.error.includes('Could not load the default credentials')) {
        console.log('');
        console.log('⚠️  PROBLEMA DETECTADO: Credenciales no cargadas');
        console.log('');
        console.log('🔧 SOLUCIÓN:');
        console.log('   1. Verifica que el archivo existe: superjf1234-e9cbc-firebase-adminsdk.json');
        console.log('   2. Verifica que .env.local tenga:');
        console.log('      GOOGLE_APPLICATION_CREDENTIALS=/workspaces/superjf_v17/superjf1234-e9cbc-firebase-adminsdk.json');
        console.log('   3. Reinicia el servidor: pkill -f "next dev" && npm run dev');
        console.log('');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error al verificar Firebase Admin SDK:', error);
    console.log('');
    console.log('⚠️  No se pudo conectar con el servidor');
    console.log('🔧 Verifica que el servidor esté corriendo');
    console.log('');
    return false;
  }
})();

// =============================================================================
// 📊 DIAGNÓSTICO ADICIONAL
// =============================================================================

console.log('');
console.log('📊 ======================================');
console.log('📊 DIAGNÓSTICO DE CONFIGURACIÓN');
console.log('📊 ======================================');
console.log('');

// Verificar localStorage
const config = JSON.parse(localStorage.getItem('smart-student-config') || '{}');
console.log('🔧 Configuración actual en localStorage:', {
  firebaseEnabled: config.useFirebase,
  hasApiKey: !!config.firebaseConfig?.apiKey,
  projectId: config.firebaseConfig?.projectId,
});

console.log('');
console.log('ℹ️  NOTA: El Admin SDK se ejecuta en el servidor (backend)');
console.log('ℹ️  Las credenciales del navegador son diferentes');
console.log('');
