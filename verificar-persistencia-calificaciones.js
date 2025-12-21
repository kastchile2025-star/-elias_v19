// ✅ VERIFICACIÓN: Firebase con LocalStorage como Caché
// Ejecutar en la consola del navegador DESPUÉS de cargar el archivo CSV

console.clear();
console.log('═══════════════════════════════════════════════════════');
console.log('🔍 VERIFICACIÓN: Persistencia de Calificaciones');
console.log('═══════════════════════════════════════════════════════\n');

// 1. Verificar que LocalStorage tiene los datos
const verifyLocalStorage = () => {
  try {
    const year = 2025;
    const allGrades = JSON.parse(localStorage.getItem('test_grades') || '[]');
    const yearGrades = allGrades.filter(g => {
      const gradeYear = new Date(g.gradedAt).getFullYear();
      return gradeYear === year;
    });
    
    console.log('📦 LocalStorage (Caché):');
    console.log(`   Total de calificaciones: ${allGrades.length}`);
    console.log(`   Calificaciones año ${year}: ${yearGrades.length}`);
    
    if (yearGrades.length > 0) {
      console.log(`   ✅ LocalStorage tiene datos`);
      
      // Mostrar primeras 3 calificaciones
      console.log('\n   Primeras 3 calificaciones:');
      yearGrades.slice(0, 3).forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.studentName} - ${g.courseName}: ${g.score}%`);
      });
      
      return true;
    } else {
      console.log(`   ❌ LocalStorage vacío para año ${year}`);
      return false;
    }
  } catch (err) {
    console.error('❌ Error leyendo LocalStorage:', err);
    return false;
  }
};

// 2. Verificar que la UI muestra los datos
const verifyUI = () => {
  try {
    const rows = document.querySelectorAll('table tbody tr:not(.empty-row)');
    const count = rows.length;
    
    console.log('\n🖥️  UI (Tabla de Calificaciones):');
    console.log(`   Filas visibles en tabla: ${count}`);
    
    if (count > 0) {
      console.log(`   ✅ UI mostrando datos`);
      
      // Verificar que las filas tienen contenido
      const firstRow = rows[0];
      const cells = firstRow.querySelectorAll('td');
      if (cells.length > 0) {
        console.log(`   Primera fila: "${cells[0]?.textContent?.trim()}"`);
      }
      
      return true;
    } else {
      console.log(`   ❌ UI sin datos (tabla vacía)`);
      return false;
    }
  } catch (err) {
    console.error('❌ Error verificando UI:', err);
    return false;
  }
};

// 3. Verificar eventos emitidos
const verifyEvents = () => {
  console.log('\n📡 Eventos (Listeners activos):');
  
  // Instalar listeners para eventos futuros
  let eventCount = 0;
  
  const eventLogger = (eventName) => (e) => {
    eventCount++;
    console.log(`\n   🔔 Evento #${eventCount}: ${eventName}`);
    
    if (e.detail) {
      console.log(`      Detail:`, e.detail);
      
      if (e.detail.skipFirebaseReload !== undefined) {
        console.log(`      🔑 skipFirebaseReload: ${e.detail.skipFirebaseReload}`);
        if (e.detail.skipFirebaseReload) {
          console.log(`      ✅ Evento configurado para usar caché LocalStorage`);
        } else {
          console.log(`      ⚠️  Evento intentará leer de Firebase primero`);
        }
      }
    }
  };
  
  window.addEventListener('dataImported', eventLogger('dataImported'));
  window.addEventListener('sqlGradesUpdated', eventLogger('sqlGradesUpdated'));
  window.addEventListener('sqlActivitiesUpdated', eventLogger('sqlActivitiesUpdated'));
  
  console.log('   ✅ Listeners instalados para:');
  console.log('      - dataImported');
  console.log('      - sqlGradesUpdated');
  console.log('      - sqlActivitiesUpdated');
  console.log('\n   💡 Los eventos se mostrarán cuando ocurran...');
};

// 4. Monitorear cambios en la tabla
const monitorTableChanges = () => {
  console.log('\n👀 Monitor (Vigilando cambios en tabla):');
  
  let lastRowCount = document.querySelectorAll('table tbody tr:not(.empty-row)').length;
  console.log(`   Conteo inicial: ${lastRowCount} filas`);
  
  const checkInterval = setInterval(() => {
    const currentRowCount = document.querySelectorAll('table tbody tr:not(.empty-row)').length;
    
    if (currentRowCount !== lastRowCount) {
      const diff = currentRowCount - lastRowCount;
      const change = diff > 0 ? `+${diff}` : diff;
      
      console.log(`\n   📊 CAMBIO DETECTADO:`);
      console.log(`      Antes: ${lastRowCount} filas`);
      console.log(`      Ahora: ${currentRowCount} filas`);
      console.log(`      Cambio: ${change}`);
      
      if (currentRowCount === 0 && lastRowCount > 0) {
        console.log(`      ❌❌❌ DATOS DESAPARECIERON ❌❌❌`);
      } else if (currentRowCount > 0 && lastRowCount === 0) {
        console.log(`      ✅✅✅ DATOS APARECIERON ✅✅✅`);
      } else if (diff > 0) {
        console.log(`      ✅ Se agregaron ${diff} filas`);
      } else {
        console.log(`      ⚠️  Se quitaron ${Math.abs(diff)} filas`);
      }
      
      lastRowCount = currentRowCount;
    }
  }, 1000);
  
  console.log('   ✅ Monitor activo (revisando cada 1 segundo)');
  console.log('   💡 Ejecuta clearInterval(' + checkInterval + ') para detener');
  
  // Detener automáticamente después de 2 minutos
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('\n   ⏹️  Monitor detenido (2 minutos transcurridos)');
  }, 120000);
  
  return checkInterval;
};

// 5. Test completo
const runFullTest = async () => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🧪 Ejecutando test completo...\n');
  
  const lsOk = verifyLocalStorage();
  const uiOk = verifyUI();
  verifyEvents();
  const monitorId = monitorTableChanges();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESULTADOS:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   LocalStorage: ${lsOk ? '✅ OK' : '❌ FAIL'}`);
  console.log(`   UI Visible:   ${uiOk ? '✅ OK' : '❌ FAIL'}`);
  console.log(`   Monitor:      ✅ Activo`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (lsOk && uiOk) {
    console.log('✅✅✅ SISTEMA FUNCIONANDO CORRECTAMENTE ✅✅✅');
    console.log('\n💡 PRÓXIMO PASO:');
    console.log('   1. Espera que Firebase termine de sincronizar (~10 seg)');
    console.log('   2. Observa el monitor arriba');
    console.log('   3. Si el conteo de filas NO cambia → ✅ ÉXITO');
    console.log('   4. Si las filas desaparecen → ❌ Revisar código\n');
  } else {
    console.log('❌❌❌ PROBLEMAS DETECTADOS ❌❌❌');
    console.log('\n🔧 ACCIONES SUGERIDAS:');
    if (!lsOk) {
      console.log('   1. Verifica que el archivo CSV se cargó correctamente');
      console.log('   2. Revisa la consola por errores de parsing');
      console.log('   3. Confirma que el año seleccionado es 2025');
    }
    if (!uiOk) {
      console.log('   1. Navega a la pestaña "Calificaciones"');
      console.log('   2. Selecciona el año 2025 en el filtro');
      console.log('   3. Recarga la página si es necesario');
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  return { lsOk, uiOk, monitorId };
};

// 6. Helper para limpiar listeners
const cleanup = (monitorId) => {
  if (monitorId) {
    clearInterval(monitorId);
    console.log('✅ Monitor detenido');
  }
  // Los event listeners permanecen para debugging
  console.log('💡 Event listeners aún activos (útil para debugging)');
};

// Auto-ejecutar test completo
console.log('🚀 Iniciando verificación automática en 2 segundos...\n');
setTimeout(runFullTest, 2000);

// Exportar funciones útiles
window.__verifyGrades__ = {
  localStorage: verifyLocalStorage,
  ui: verifyUI,
  events: verifyEvents,
  monitor: monitorTableChanges,
  full: runFullTest,
  cleanup
};

console.log('💡 COMANDOS DISPONIBLES:');
console.log('   __verifyGrades__.localStorage()  - Ver datos en LocalStorage');
console.log('   __verifyGrades__.ui()            - Ver datos en UI');
console.log('   __verifyGrades__.events()        - Instalar event listeners');
console.log('   __verifyGrades__.monitor()       - Iniciar monitor de cambios');
console.log('   __verifyGrades__.full()          - Ejecutar test completo');
console.log('   __verifyGrades__.cleanup(id)     - Limpiar monitor');
console.log('');
