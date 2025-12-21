/**
 * 🔥 PRUEBA RÁPIDA FIREBASE
 * Copia y pega este código en la consola del navegador (DevTools)
 * cuando estés en la página Admin → Configuración
 */

console.log('🔥 === DIAGNÓSTICO FIREBASE === 🔥\n');

// 1. Verificar bridge
if (!window.sqlGlobal) {
  console.error('❌ window.sqlGlobal no está disponible');
  console.log('   → Asegúrate de estar en Admin → Configuración');
} else {
  console.log('✅ Bridge SQL disponible\n');
  
  // 2. Verificar funciones
  console.log('📋 Funciones disponibles:');
  console.log('  - getCurrentProvider:', typeof window.sqlGlobal.getCurrentProvider);
  console.log('  - isFirebaseEnabled:', typeof window.sqlGlobal.isFirebaseEnabled);
  console.log('  - isSupabaseEnabled:', typeof window.sqlGlobal.isSupabaseEnabled);
  
  // 3. Ejecutar detección
  if (typeof window.sqlGlobal.getCurrentProvider === 'function') {
    const provider = window.sqlGlobal.getCurrentProvider();
    console.log('\n🎯 PROVEEDOR ACTUAL:', provider);
    
    if (provider === 'firebase') {
      console.log('✅ Firebase detectado correctamente');
    } else if (provider === 'supabase') {
      console.log('⚠️  Supabase detectado (pero dijiste que usas Firebase)');
    } else {
      console.log('ℹ️  Usando IndexedDB/LocalStorage como fallback');
      console.log('   Esto significa que Firebase NO está configurado');
    }
  }
  
  // 4. Verificar Firebase habilitado
  if (typeof window.sqlGlobal.isFirebaseEnabled === 'function') {
    const fbEnabled = window.sqlGlobal.isFirebaseEnabled();
    console.log('\n🔥 Firebase habilitado:', fbEnabled);
    
    if (!fbEnabled) {
      console.log('\n❌ PROBLEMA: Firebase NO está habilitado');
      console.log('   Verifica tu archivo .env.local:');
      console.log('   - NEXT_PUBLIC_USE_FIREBASE=true');
      console.log('   - NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key');
      console.log('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id');
      console.log('   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain');
      console.log('   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket');
      console.log('   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id');
      console.log('   - NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id');
      console.log('\n   Después de agregar/verificar las variables, reinicia el servidor:');
      console.log('   1. Ctrl+C en la terminal');
      console.log('   2. npm run dev');
    }
  }
}

console.log('\n🔥 === FIN DIAGNÓSTICO === 🔥');
