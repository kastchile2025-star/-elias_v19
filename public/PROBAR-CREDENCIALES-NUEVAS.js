/**
 * 🔧 SCRIPT DE PRUEBA DE CREDENCIALES FIREBASE (NUEVAS)
 * 
 * CÓMO USAR:
 * 1. Abre la consola del navegador (F12)
 * 2. Pega este comando y presiona Enter:
 *    fetch('/PROBAR-CREDENCIALES-NUEVAS.js').then(r=>r.text()).then(eval);
 * 
 * 3. Espera los resultados (aparecerán en la consola)
 */

console.clear();
console.log('🔍 INICIANDO PRUEBA DE CREDENCIALES FIREBASE (NUEVAS)...\n');
console.log('📅 Fecha:', new Date().toLocaleString());
console.log('🌐 URL:', window.location.origin);
console.log('\n' + '='.repeat(70) + '\n');

// Test 1: Endpoint de contadores
console.log('🧪 TEST 1: Verificando endpoint de contadores Firebase...');
console.log('⏱️  Esperando respuesta del servidor...\n');

fetch('/api/firebase/grade-counters?year=2025')
  .then(response => {
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    console.log('\n' + '='.repeat(70));
    
    if (data.error) {
      console.error('❌ ERROR EN TEST 1:');
      console.error('📝 Mensaje:', data.error);
      console.log('\n🔍 Diagnóstico:');
      
      if (data.error.includes('UNAUTHENTICATED')) {
        console.warn('⚠️  Error de autenticación detectado');
        console.log('💡 Posibles causas:');
        console.log('   1. Las credenciales son inválidas o expiraron');
        console.log('   2. La cuenta de servicio fue deshabilitada');
        console.log('   3. El formato del private_key es incorrecto');
        console.log('\n✅ Solución:');
        console.log('   1. Verifica que el archivo JSON descargado sea el correcto');
        console.log('   2. Asegúrate de que el JSON esté completo en .env.local');
        console.log('   3. Reinicia el servidor: pkill -f "next dev" && npm run dev');
      } else if (data.error.includes('Could not load')) {
        console.warn('⚠️  No se pudieron cargar las credenciales');
        console.log('💡 Verifica que FIREBASE_SERVICE_ACCOUNT_JSON esté en .env.local');
      }
      
      console.log('\n📋 Detalles completos del error:');
      console.dir(data, { depth: null });
    } else {
      console.log('✅ ¡ÉXITO! Las credenciales funcionan correctamente');
      console.log('\n📊 Datos recibidos de Firebase:');
      console.log('   📚 Total de calificaciones:', data.totalGrades || 0);
      console.log('   👥 Total de estudiantes:', data.totalStudents || 0);
      console.log('   📖 Total de cursos:', data.totalCourses || 0);
      console.log('\n🎉 Firebase Admin SDK está configurado correctamente');
      console.log('✅ Puedes proceder con la carga masiva de calificaciones');
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
  })
  .catch(error => {
    console.log('\n' + '='.repeat(70));
    console.error('❌ ERROR DE RED O SERVIDOR:');
    console.error('📝 Mensaje:', error.message);
    console.log('\n💡 Verifica que el servidor esté ejecutándose en http://localhost:9002');
    console.log('\n' + '='.repeat(70) + '\n');
  });

console.log('⏳ Esperando resultados...');
console.log('💡 Los resultados aparecerán aquí en unos segundos');
