// =============================================================================
// 🎯 PRUEBA RÁPIDA DE CREDENCIALES DE FIREBASE ADMIN SDK
// =============================================================================
//
// ✅ Ejecuta este script en la consola del navegador para verificar que
//    las credenciales de Firebase Admin SDK están funcionando correctamente.
//
// 📋 Instrucciones:
//    1. Abre la consola del navegador (F12 → Console)
//    2. Copia y pega este código
//    3. Presiona Enter
//    4. Observa el resultado
//
// =============================================================================

(async function testFirebaseAdminCredentials() {
  console.log('');
  console.log('🔥 ======================================');
  console.log('🔥 PRUEBA DE CREDENCIALES FIREBASE');
  console.log('🔥 ======================================');
  console.log('');
  console.log('⏳ Intentando conectar con Firebase Admin SDK...');
  console.log('');
  
  try {
    // Hacer una prueba simple: obtener contadores de calificaciones
    const response = await fetch('/api/firebase/grade-counters?year=2025');
    const data = await response.json();
    
    console.log('📊 Respuesta del servidor:', response.status, response.statusText);
    console.log('📋 Datos recibidos:', data);
    console.log('');
    
    if (response.ok) {
      console.log('✅ ¡ÉXITO! Las credenciales de Firebase Admin SDK funcionan correctamente');
      console.log('✅ El servidor puede conectarse a Firestore');
      console.log('');
      console.log('🎉 Ya puedes realizar la carga masiva de calificaciones');
      console.log('');
      return true;
    } else {
      console.error('❌ Error:', data.error || 'Error desconocido');
      console.error('📋 Detalles:', data.details || 'Sin detalles');
      console.log('');
      
      if (data.error && data.error.includes('UNAUTHENTICATED')) {
        console.log('⚠️  PROBLEMA: Credenciales no válidas o sin permisos');
        console.log('');
        console.log('🔧 POSIBLES SOLUCIONES:');
        console.log('   1. Verifica que el Service Account tenga el rol "Firebase Admin SDK Administrator Service Agent"');
        console.log('   2. Ve a: https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk');
        console.log('   3. Verifica que la clave privada (private_key) en el JSON sea correcta');
        console.log('   4. Si el problema persiste, genera una nueva clave desde la consola de Firebase');
        console.log('');
      } else if (data.error && data.error.includes('Could not load')) {
        console.log('⚠️  PROBLEMA: Credenciales no cargadas');
        console.log('');
        console.log('🔧 SOLUCIÓN:');
        console.log('   1. Verifica que .env.local tenga FIREBASE_SERVICE_ACCOUNT_JSON configurado');
        console.log('   2. Reinicia el servidor: pkill -f "next dev" && npm run dev');
        console.log('');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error al probar credenciales:', error);
    console.log('');
    console.log('⚠️  No se pudo conectar con el servidor');
    console.log('🔧 Verifica que el servidor esté corriendo (npm run dev)');
    console.log('');
    return false;
  }
})();

// =============================================================================
