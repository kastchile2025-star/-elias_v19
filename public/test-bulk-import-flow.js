/**
 * 🧪 SCRIPT DE PRUEBA: Flujo completo de carga masiva de calificaciones
 * 
 * USO:
 * 1. Abre la consola del navegador en la pestaña Calificaciones
 * 2. Copia y pega este script
 * 3. Observa los logs en tiempo real
 * 4. Verifica que los eventos se emitan y la UI se actualice
 */

(function testBulkImportFlow() {
  console.log('🧪 ========================================');
  console.log('🧪 PRUEBA: Flujo de carga masiva');
  console.log('🧪 ========================================\n');

  // Estado inicial
  console.log('📊 ESTADO INICIAL:');
  console.log('  - Año actual:', localStorage.getItem('admin-selected-year') || 'no configurado');
  
  try {
    const gradesKey = `smart-student-test-grades-${localStorage.getItem('admin-selected-year')}`;
    const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
    console.log(`  - Calificaciones en LocalStorage: ${grades.length}`);
  } catch (e) {
    console.log('  - Calificaciones en LocalStorage: error al leer');
  }

  // Configurar listeners para todos los eventos relevantes
  console.log('\n🎧 CONFIGURANDO LISTENERS:');
  
  const events = [
    'sqlGradesUpdated',
    'sqlActivitiesUpdated', 
    'dataImported',
    'dataUpdated',
    'sqlImportProgress'
  ];

  const listeners = {};
  
  events.forEach(eventName => {
    const handler = (e) => {
      const detail = e.detail || {};
      console.log(`\n🔔 EVENTO RECIBIDO: ${eventName}`);
      console.log('   Detail:', JSON.stringify(detail, null, 2));
      
      if (eventName === 'sqlImportProgress') {
        const pct = detail.percent || 0;
        console.log(`   ⏳ Progreso: ${pct}% (${detail.current || 0}/${detail.total || 0})`);
      }
      
      if (eventName === 'sqlGradesUpdated' || eventName === 'dataImported') {
        console.log(`   📊 Calificaciones procesadas: ${detail.count || detail.gradesAdded || 'N/D'}`);
      }
    };
    
    listeners[eventName] = handler;
    window.addEventListener(eventName, handler);
    console.log(`  ✅ Listener para '${eventName}' registrado`);
  });

  // Verificar conexión SQL
  console.log('\n🔌 VERIFICANDO CONEXIÓN SQL:');
  if (window.__sql) {
    console.log('  ✅ Hook SQL expuesto en window.__sql');
    console.log('  - isConnected:', window.__sql.isConnected);
    console.log('  - uploadProgress:', window.__sql.uploadProgress);
  } else {
    console.log('  ⚠️ Hook SQL no expuesto en window (esto es normal)');
  }

  // Simular evento de prueba
  console.log('\n🧪 SIMULANDO EVENTO DE PRUEBA:');
  console.log('  Emitiendo sqlImportProgress al 50%...');
  
  window.dispatchEvent(new CustomEvent('sqlImportProgress', {
    detail: {
      year: 2025,
      current: 100,
      total: 200,
      percent: 50,
      timestamp: Date.now(),
      source: 'test-script'
    }
  }));

  setTimeout(() => {
    console.log('\n  Emitiendo sqlImportProgress al 100%...');
    window.dispatchEvent(new CustomEvent('sqlImportProgress', {
      detail: {
        year: 2025,
        current: 200,
        total: 200,
        percent: 100,
        timestamp: Date.now(),
        source: 'test-script'
      }
    }));
  }, 1000);

  setTimeout(() => {
    console.log('\n  Emitiendo sqlGradesUpdated con 200 calificaciones...');
    window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
      detail: {
        year: 2025,
        count: 200,
        gradesAdded: 200,
        totalGrades: 200,
        timestamp: Date.now(),
        source: 'test-script'
      }
    }));
  }, 2000);

  // Cleanup function
  window.__cleanupTestListeners = () => {
    console.log('\n🧹 LIMPIANDO LISTENERS DE PRUEBA:');
    events.forEach(eventName => {
      window.removeEventListener(eventName, listeners[eventName]);
      console.log(`  ✅ Listener '${eventName}' removido`);
    });
    console.log('\n✅ Limpieza completada');
  };

  console.log('\n✅ SCRIPT DE PRUEBA CONFIGURADO');
  console.log('📝 INSTRUCCIONES:');
  console.log('  1. Ve a Admin > Configuración');
  console.log('  2. Carga el archivo: public/test-data/calificaciones_reales_200.csv');
  console.log('  3. Observa esta consola para ver los eventos en tiempo real');
  console.log('  4. Verifica que el indicador "Sincronizando con BBDD" aparezca');
  console.log('  5. Verifica que las 200 calificaciones aparezcan en la tabla');
  console.log('\n🧹 Para limpiar los listeners: window.__cleanupTestListeners()');
  console.log('\n🧪 ========================================\n');
})();
