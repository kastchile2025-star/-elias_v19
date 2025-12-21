/**
 * 🎬 SIMULADOR DE CARGA MASIVA
 * 
 * Este script simula una carga masiva completa para probar
 * el flujo de eventos sin necesidad de subir un archivo real.
 * 
 * USO:
 * 1. Abre la pestaña Calificaciones
 * 2. Abre la consola del navegador (F12)
 * 3. Copia y pega este script
 * 4. Observa cómo aparece el indicador y se actualiza
 */

(async function simulateBulkImport() {
  console.log('🎬 ========================================');
  console.log('🎬 SIMULADOR DE CARGA MASIVA');
  console.log('🎬 ========================================\n');

  // Configuración
  const TOTAL_RECORDS = 200;
  const SIMULATION_DURATION = 5000; // 5 segundos
  const UPDATE_INTERVAL = 200; // Actualizar cada 200ms
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;

  console.log('⚙️ CONFIGURACIÓN:');
  console.log(`   Total registros: ${TOTAL_RECORDS}`);
  console.log(`   Duración: ${SIMULATION_DURATION}ms`);
  console.log(`   Intervalo: ${UPDATE_INTERVAL}ms`);
  console.log(`   Año: ${year}\n`);

  // Fase 1: Progreso gradual
  console.log('📈 FASE 1: Simulando progreso de carga...\n');

  let current = 0;
  const totalSteps = Math.floor(SIMULATION_DURATION / UPDATE_INTERVAL);
  const increment = Math.ceil(TOTAL_RECORDS / totalSteps);

  const progressInterval = setInterval(() => {
    current = Math.min(current + increment, TOTAL_RECORDS);
    const percent = Math.round((current / TOTAL_RECORDS) * 100);

    console.log(`   ⏳ Progreso: ${percent}% (${current}/${TOTAL_RECORDS})`);

    // Emitir evento de progreso
    window.dispatchEvent(new CustomEvent('sqlImportProgress', {
      detail: {
        year,
        current,
        total: TOTAL_RECORDS,
        percent,
        timestamp: Date.now(),
        source: 'simulation'
      }
    }));

    if (current >= TOTAL_RECORDS) {
      clearInterval(progressInterval);
      console.log('\n✅ Progreso completado al 100%\n');
      
      // Fase 2: Emitir eventos de finalización
      setTimeout(() => {
        console.log('📢 FASE 2: Emitiendo eventos de finalización...\n');

        // Evento 1: sqlGradesUpdated
        console.log('   🔔 Emitiendo: sqlGradesUpdated');
        window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
          detail: {
            year,
            count: TOTAL_RECORDS,
            gradesAdded: TOTAL_RECORDS,
            totalGrades: TOTAL_RECORDS,
            timestamp: Date.now(),
            source: 'simulation'
          }
        }));

        // Evento 2: sqlActivitiesUpdated
        setTimeout(() => {
          console.log('   🔔 Emitiendo: sqlActivitiesUpdated');
          window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', {
            detail: {
              year,
              added: 12,
              timestamp: Date.now(),
              source: 'simulation'
            }
          }));
        }, 300);

        // Evento 3: dataImported
        setTimeout(() => {
          console.log('   🔔 Emitiendo: dataImported');
          window.dispatchEvent(new CustomEvent('dataImported', {
            detail: {
              type: 'grades',
              year,
              count: TOTAL_RECORDS,
              timestamp: Date.now(),
              source: 'simulation'
            }
          }));
        }, 600);

        // Evento 4: dataUpdated
        setTimeout(() => {
          console.log('   🔔 Emitiendo: dataUpdated');
          window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: {
              type: 'grades',
              year,
              timestamp: Date.now(),
              source: 'simulation'
            }
          }));

          // Resumen final
          setTimeout(() => {
            console.log('\n✅ SIMULACIÓN COMPLETADA\n');
            console.log('📊 RESUMEN:');
            console.log(`   - ${TOTAL_RECORDS} calificaciones procesadas`);
            console.log('   - 12 actividades generadas');
            console.log('   - 4 eventos emitidos');
            console.log('   - 0 errores\n');
            
            console.log('🔍 VERIFICAR:');
            console.log('   1. ¿Apareció el indicador "Sincronizando con BBDD"?');
            console.log('   2. ¿La barra de progreso llegó al 100%?');
            console.log('   3. ¿El indicador desapareció después?');
            console.log('   4. ¿Se intentó recargar los datos? (ver logs)');
            console.log('\n🎬 ========================================\n');
          }, 1000);
        }, 900);
      }, 500);
    }
  }, UPDATE_INTERVAL);

  // Mensaje inicial
  console.log('⏳ Iniciando simulación...');
  console.log('👀 Observa la esquina inferior derecha de la pantalla');
  console.log('📺 Deberías ver aparecer el indicador de progreso\n');
})();
