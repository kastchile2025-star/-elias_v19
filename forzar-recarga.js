/**
 * 🔄 FORZAR RECARGA DE CALIFICACIONES
 * 
 * Dispara un evento de storage change para forzar la recarga
 */

(function() {
  console.clear();
  console.log('%c🔄 FORZAR RECARGA', 'font-size: 20px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(60) + '\n');

  const year = 2025;
  const key = `smart-student-test-grades-${year}`;
  
  // Leer los datos actuales de localStorage
  const data = localStorage.getItem(key);
  
  if (!data) {
    console.log('%c❌ No hay datos en localStorage', 'color: #EF4444;');
    return;
  }

  const parsed = JSON.parse(data);
  console.log(`📊 Datos en localStorage: ${parsed.length} calificaciones`);
  
  // Verificar que tienen UUIDs correctos
  const conLetraA = parsed.filter((c) => c.sectionId === 'a');
  const conUUID = parsed.filter((c) => c.sectionId && c.sectionId.includes('-'));
  
  console.log(`   ❌ Con sectionId='a': ${conLetraA.length}`);
  console.log(`   ✅ Con UUID correcto: ${conUUID.length}\n`);

  if (conLetraA.length > 0) {
    console.log('%c⚠️ HAY CALIFICACIONES CON sectionId="a"', 'color: #EF4444; font-weight: bold;');
    console.log('Ejecuta fix-calificaciones-urgente.js primero');
    return;
  }

  // Disparar evento de storage para forzar recarga en la página
  console.log('🔄 Disparando evento de storage...');
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: key,
    oldValue: null,
    newValue: data,
    url: window.location.href,
    storageArea: localStorage
  }));

  console.log('%c✅ Evento disparado', 'color: #10B981; font-weight: bold;');
  console.log('\n💡 Si no funciona, recarga la página (F5)');

  // También intentar disparar el evento personalizado que podría estar escuchando
  setTimeout(() => {
    console.log('\n🔄 Recargando la página automáticamente en 2 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, 1000);

})();
