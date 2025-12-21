/**
 * 🔍 VERIFICAR CONFIGURACIÓN FIREBASE
 * Script de diagnóstico para validar que Firebase esté correctamente detectado
 */

(function() {
  console.log('🔍 [Verificación Firebase] Iniciando diagnóstico...');
  
  // 1. Verificar variables de entorno (Next.js las expone como strings)
  console.log('\n📋 Variables de entorno:');
  const firebaseVars = {
    USE_FIREBASE: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USE_FIREBASE,
    API_KEY: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Definida' : '❌ No definida',
    PROJECT_ID: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Definida' : '❌ No definida',
  };
  console.table(firebaseVars);
  
  // 2. Verificar bridge SQL global
  console.log('\n🔌 Bridge SQL Global:');
  if (window.sqlGlobal) {
    console.log('✅ window.sqlGlobal disponible');
    console.log('  - getCurrentProvider:', typeof window.sqlGlobal.getCurrentProvider);
    console.log('  - isFirebaseEnabled:', typeof window.sqlGlobal.isFirebaseEnabled);
    console.log('  - isSupabaseEnabled:', typeof window.sqlGlobal.isSupabaseEnabled);
    
    // Ejecutar funciones si están disponibles
    if (typeof window.sqlGlobal.getCurrentProvider === 'function') {
      const provider = window.sqlGlobal.getCurrentProvider();
      console.log('  📊 Proveedor detectado:', provider);
    }
    
    if (typeof window.sqlGlobal.isFirebaseEnabled === 'function') {
      const fbEnabled = window.sqlGlobal.isFirebaseEnabled();
      console.log('  🔥 Firebase habilitado:', fbEnabled);
    }
    
    if (typeof window.sqlGlobal.isSupabaseEnabled === 'function') {
      const sbEnabled = window.sqlGlobal.isSupabaseEnabled();
      console.log('  🟢 Supabase habilitado:', sbEnabled);
    }
  } else {
    console.log('❌ window.sqlGlobal NO disponible');
    console.log('   Espera a que la página Admin → Configuración cargue completamente');
  }
  
  // 3. Verificar localStorage
  console.log('\n💾 LocalStorage:');
  const forceIDB = localStorage.getItem('force-idb-mode');
  console.log('  - force-idb-mode:', forceIDB || '(no establecido)');
  
  // 4. Verificar Firebase en window
  console.log('\n🔥 Firebase en window:');
  if (typeof window.firebase !== 'undefined') {
    console.log('✅ Firebase SDK cargado globalmente');
  } else {
    console.log('ℹ️  Firebase no está en window (normal si usas imports modulares)');
  }
  
  // 5. Instrucciones
  console.log('\n📖 INSTRUCCIONES:');
  console.log('1. Verifica que NEXT_PUBLIC_USE_FIREBASE=true en .env.local');
  console.log('2. Verifica que tengas las credenciales de Firebase (API_KEY, PROJECT_ID, etc.)');
  console.log('3. Si el proveedor dice "idb", Firebase no está detectado correctamente');
  console.log('4. Ejecuta: window.sqlGlobal?.getCurrentProvider() para ver el proveedor actual');
  
  console.log('\n✅ [Verificación Firebase] Diagnóstico completado\n');
})();
