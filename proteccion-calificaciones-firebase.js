/**
 * 🛡️ PROTECCIÓN COMPLETA: Evitar que Firebase borre las calificaciones
 * 
 * PROBLEMA:
 * - Cargas el CSV y las calificaciones aparecen ✅
 * - Firebase sincroniza automáticamente ⏳
 * - Las calificaciones DESAPARECEN ❌
 * 
 * SOLUCIÓN:
 * Este script protege LocalStorage de ser sobrescrito por Firebase
 * 
 * USO:
 * 1. Abre Admin > Configuración
 * 2. Abre consola del navegador (F12)
 * 3. Copia y pega este script COMPLETO
 * 4. Presiona Enter
 * 5. Verás mensaje "✅ Protección activada"
 * 6. AHORA sube el archivo grades-consolidated-2025-FIXED.csv
 * 7. Las calificaciones permanecerán visibles
 */

(function activarProteccionCompleta() {
  console.clear();
  console.log('🛡️ ════════════════════════════════════════════════════════');
  console.log('🛡️ ACTIVANDO PROTECCIÓN CONTRA BORRADO DE CALIFICACIONES');
  console.log('🛡️ ════════════════════════════════════════════════════════\n');
  
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const gradesKey = `smart-student-test-grades-${year}`;
  
  // ══════════════════════════════════════════════════════════
  // 1. INTERCEPTAR FETCH PARA BLOQUEAR FIREBASE
  // ══════════════════════════════════════════════════════════
  
  console.log('🔧 1. Interceptando llamadas a Firebase...');
  
  const originalFetch = window.fetch;
  let firebaseCallsBlocked = 0;
  
  window.fetch = function(...args) {
    const url = args[0];
    
    // Bloquear llamadas a Firebase bulk-upload
    if (typeof url === 'string' && url.includes('bulk-upload-grades')) {
      firebaseCallsBlocked++;
      console.log(`🚫 [${firebaseCallsBlocked}] Bloqueada sincronización con Firebase`);
      console.log('   💾 Datos permanecerán solo en LocalStorage');
      
      // Retornar respuesta falsa exitosa para no romper el flujo
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          processed: 0,
          activities: 0,
          totalErrors: 0,
          message: 'LocalStorage mode - Firebase sync disabled by protection script'
        }),
        text: () => Promise.resolve('{"success":true}')
      });
    }
    
    // Permitir otras llamadas
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Interceptor de Firebase instalado\n');
  
  // ══════════════════════════════════════════════════════════
  // 2. PROTEGER LOCALSTORAGE DE SOBRESCRITURA
  // ══════════════════════════════════════════════════════════
  
  console.log('🔧 2. Protegiendo LocalStorage...');
  
  // Guardar snapshot de datos actuales
  let protectedData = null;
  const currentData = localStorage.getItem(gradesKey);
  if (currentData) {
    protectedData = JSON.parse(currentData);
    console.log(`💾 Datos actuales protegidos: ${protectedData.length} calificaciones`);
  }
  
  // Monitorear eventos de sincronización
  let eventCount = 0;
  
  const protectionHandler = function(e) {
    eventCount++;
    console.log(`🔔 [${eventCount}] Evento de sincronización detectado:`, e.type);
    
    // Verificar datos después de sincronización
    setTimeout(() => {
      const afterSync = localStorage.getItem(gradesKey);
      const afterGrades = afterSync ? JSON.parse(afterSync) : [];
      
      console.log(`   📊 Datos después de sincronización: ${afterGrades.length} calificaciones`);
      
      // Si los datos fueron borrados, restaurar
      if (afterGrades.length === 0 && protectedData && protectedData.length > 0) {
        console.log('   ⚠️ ¡Firebase BORRÓ los datos!');
        console.log('   🔄 RESTAURANDO desde snapshot protegido...');
        
        localStorage.setItem(gradesKey, JSON.stringify(protectedData));
        
        // Forzar actualización de UI
        window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
          detail: { 
            year, 
            timestamp: Date.now(), 
            source: 'protection-restore',
            count: protectedData.length
          }
        }));
        
        console.log(`   ✅ ${protectedData.length} calificaciones RESTAURADAS`);
      } else if (afterGrades.length > 0) {
        // Actualizar snapshot si hay datos nuevos
        protectedData = afterGrades;
        console.log(`   ✅ Datos preservados correctamente: ${afterGrades.length}`);
      }
    }, 500);
  };
  
  // Registrar listeners para múltiples eventos
  const eventsToProtect = [
    'sqlGradesUpdated',
    'sqlActivitiesUpdated',
    'dataImported',
    'dataUpdated',
    'sqlMigrationCompleted'
  ];
  
  eventsToProtect.forEach(eventName => {
    window.addEventListener(eventName, protectionHandler, true);
  });
  
  console.log(`✅ ${eventsToProtect.length} eventos protegidos\n`);
  
  // ══════════════════════════════════════════════════════════
  // 3. MONITOREAR CAMBIOS EN LOCALSTORAGE
  // ══════════════════════════════════════════════════════════
  
  console.log('🔧 3. Instalando monitor de LocalStorage...');
  
  // Interceptar setItem para prevenir borrado accidental
  const originalSetItem = Storage.prototype.setItem;
  
  Storage.prototype.setItem = function(key, value) {
    if (key === gradesKey) {
      const newData = value ? JSON.parse(value) : [];
      console.log(`💾 LocalStorage.setItem('${key}') → ${newData.length} calificaciones`);
      
      // Si intentan guardar un array vacío y tenemos datos protegidos, bloquear
      if (newData.length === 0 && protectedData && protectedData.length > 0) {
        console.log('   🚫 BLOQUEADO: Intento de guardar array vacío');
        console.log(`   🛡️ Manteniendo datos protegidos: ${protectedData.length} calificaciones`);
        
        // Guardar datos protegidos en su lugar
        return originalSetItem.call(this, key, JSON.stringify(protectedData));
      }
      
      // Si hay datos nuevos, actualizar snapshot
      if (newData.length > 0) {
        protectedData = newData;
        console.log('   ✅ Snapshot actualizado');
      }
    }
    
    return originalSetItem.call(this, key, value);
  };
  
  console.log('✅ Monitor de LocalStorage instalado\n');
  
  // ══════════════════════════════════════════════════════════
  // 4. VERIFICAR ESTADO ACTUAL
  // ══════════════════════════════════════════════════════════
  
  console.log('📊 ESTADO ACTUAL DEL SISTEMA:');
  console.log('   ─────────────────────────────────────────────────────\n');
  console.log(`   📅 Año: ${year}`);
  console.log(`   🔑 Clave: ${gradesKey}`);
  console.log(`   💾 Calificaciones protegidas: ${protectedData ? protectedData.length : 0}`);
  console.log(`   🚫 Llamadas a Firebase bloqueadas: ${firebaseCallsBlocked}`);
  console.log(`   🔔 Eventos monitoreados: ${eventsToProtect.length}`);
  
  // ══════════════════════════════════════════════════════════
  // 5. INSTRUCCIONES FINALES
  // ══════════════════════════════════════════════════════════
  
  console.log('\n✅ ════════════════════════════════════════════════════════');
  console.log('✅ PROTECCIÓN ACTIVADA CORRECTAMENTE');
  console.log('✅ ════════════════════════════════════════════════════════\n');
  
  console.log('📝 INSTRUCCIONES:');
  console.log('   1. Ahora puedes cargar el archivo CSV');
  console.log('   2. Usa: grades-consolidated-2025-FIXED.csv');
  console.log('   3. Las calificaciones aparecerán en la tabla');
  console.log('   4. Firebase NO podrá borrarlas');
  console.log('   5. Los datos permanecerán en LocalStorage\n');
  
  console.log('⚠️ IMPORTANTE:');
  console.log('   • Esta protección solo dura mientras la página esté abierta');
  console.log('   • Si recargas la página (F5), debes ejecutar este script de nuevo');
  console.log('   • Los datos están solo en LocalStorage (no en Firebase)\n');
  
  console.log('🔍 COMANDOS ÚTILES:');
  console.log('   • Ver datos: JSON.parse(localStorage.getItem("' + gradesKey + '"))');
  console.log('   • Contar: JSON.parse(localStorage.getItem("' + gradesKey + '")).length');
  console.log('   • Desactivar protección: location.reload()\n');
  
  // ══════════════════════════════════════════════════════════
  // 6. RETORNAR OBJETO DE CONTROL
  // ══════════════════════════════════════════════════════════
  
  window.proteccionCalificaciones = {
    activa: true,
    year,
    llamadasBloqueadas: () => firebaseCallsBlocked,
    datosProtegidos: () => protectedData ? protectedData.length : 0,
    verDatos: () => protectedData,
    desactivar: () => {
      console.log('⚠️ Desactivando protección...');
      window.fetch = originalFetch;
      Storage.prototype.setItem = originalSetItem;
      console.log('✅ Protección desactivada. Recarga la página para restablecer.');
    },
    estado: () => {
      console.log('📊 ESTADO DE PROTECCIÓN:');
      console.log(`   Activa: ${window.proteccionCalificaciones.activa ? 'SÍ' : 'NO'}`);
      console.log(`   Año: ${year}`);
      console.log(`   Llamadas bloqueadas: ${firebaseCallsBlocked}`);
      console.log(`   Datos protegidos: ${protectedData ? protectedData.length : 0} calificaciones`);
    }
  };
  
  console.log('💡 Objeto de control: window.proteccionCalificaciones');
  console.log('   Usa: proteccionCalificaciones.estado() para ver el estado\n');
  
  return window.proteccionCalificaciones;
})();
