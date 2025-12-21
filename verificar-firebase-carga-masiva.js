/**
 * Script de Verificación de Conexión Firebase
 * 
 * Ejecutar en la consola del navegador después de cargar la app
 */

console.log('🔍 VERIFICACIÓN DE FIREBASE - CARGA MASIVA');
console.log('='.repeat(60));

// 1. Verificar variables de entorno
console.log('\n📋 1. Variables de Entorno:');
console.log('USE_FIREBASE:', process.env.NEXT_PUBLIC_USE_FIREBASE);
console.log('FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'superjf1234-e9cbc');
console.log('FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20) + '...');

// 2. Verificar inicialización de Firebase
console.log('\n🔥 2. Estado de Firebase:');
try {
  const { getApps } = await import('firebase/app');
  const apps = getApps();
  console.log('Apps inicializadas:', apps.length);
  if (apps.length > 0) {
    console.log('✅ Firebase App inicializada');
    console.log('Project ID:', apps[0].options.projectId);
  } else {
    console.log('⚠️ Firebase no inicializado aún');
  }
} catch (e) {
  console.error('❌ Error al verificar Firebase:', e);
}

// 3. Verificar Firestore
console.log('\n📊 3. Firestore:');
try {
  const { getFirestoreInstance } = await import('@/lib/firebase-config');
  const db = getFirestoreInstance();
  if (db) {
    console.log('✅ Firestore conectado');
  } else {
    console.log('⚠️ Firestore no disponible');
  }
} catch (e) {
  console.error('❌ Error al verificar Firestore:', e);
}

// 4. Verificar Analytics
console.log('\n📈 4. Analytics:');
try {
  const { getAnalyticsInstance } = await import('@/lib/firebase-config');
  const analytics = getAnalyticsInstance();
  if (analytics) {
    console.log('✅ Analytics inicializado');
  } else {
    console.log('⚠️ Analytics no disponible (puede ser normal en desarrollo)');
  }
} catch (e) {
  console.error('❌ Error al verificar Analytics:', e);
}

// 5. Verificar proveedor de base de datos
console.log('\n🗄️ 5. Proveedor de Base de Datos:');
try {
  const { getCurrentProvider } = await import('@/lib/sql-config');
  const provider = getCurrentProvider();
  console.log('Proveedor actual:', provider);
  
  if (provider === 'firebase') {
    console.log('✅ Usando Firebase + LocalStorage');
  } else if (provider === 'supabase') {
    console.log('ℹ️ Usando Supabase (SQL)');
  } else {
    console.log('ℹ️ Usando IndexedDB (local)');
  }
} catch (e) {
  console.error('❌ Error al verificar proveedor:', e);
}

// 6. Verificar contadores de calificaciones
console.log('\n🔢 6. Contadores de Calificaciones:');
try {
  const totalKey = 'grade-counter-total';
  const year2025Key = 'grade-counter-year-2025';
  
  const total = localStorage.getItem(totalKey);
  const year2025 = localStorage.getItem(year2025Key);
  
  console.log('Total de calificaciones:', total || '0');
  console.log('Calificaciones 2025:', year2025 || '0');
  
  if (total && parseInt(total) > 0) {
    console.log('✅ Hay calificaciones en el sistema');
  } else {
    console.log('ℹ️ No hay calificaciones cargadas aún');
  }
} catch (e) {
  console.error('❌ Error al verificar contadores:', e);
}

// 7. Instrucciones de prueba
console.log('\n📝 7. Prueba de Carga Masiva:');
console.log('1. Ve a /admin en tu navegador');
console.log('2. Abre la pestaña "Carga Masiva"');
console.log('3. Verifica que el estado muestre: "🔥 Firebase + LocalStorage"');
console.log('4. El botón debe decir: "Subir a Firebase"');
console.log('5. Descarga la plantilla CSV');
console.log('6. Llena con datos de prueba');
console.log('7. Sube el archivo y observa el progreso en tiempo real');

console.log('\n' + '='.repeat(60));
console.log('✅ VERIFICACIÓN COMPLETADA');
console.log('='.repeat(60));

// Resultado resumido
const resultado = {
  firebase_habilitado: process.env.NEXT_PUBLIC_USE_FIREBASE === 'true',
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'superjf1234-e9cbc',
  timestamp: new Date().toISOString()
};

console.log('\n📊 Resultado:', resultado);
