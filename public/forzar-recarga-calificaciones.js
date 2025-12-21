/**
 * 🔧 SOLUCIÓN RÁPIDA: Forzar recarga de calificaciones
 * 
 * Ejecutar en consola del navegador (pestaña Calificaciones)
 */

(function solucionRapida() {
  console.log('🔧 ========================================');
  console.log('🔧 SOLUCIÓN: Forzar Recarga de Calificaciones');
  console.log('🔧 ========================================\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  console.log(`📅 Año: ${year}\n`);

  // 1. Verificar datos en LocalStorage
  console.log('1️⃣ VERIFICANDO DATOS:');
  const gradesKey = `smart-student-test-grades-${year}`;
  const gradesData = localStorage.getItem(gradesKey);
  
  if (!gradesData) {
    console.log(`   ❌ NO HAY DATOS en ${gradesKey}`);
    console.log('\n   💡 SOLUCIÓN:');
    console.log('   1. Ve a Admin > Configuración');
    console.log('   2. Carga: public/test-data/calificaciones_reales_200.csv');
    console.log('   3. Vuelve aquí y ejecuta este script otra vez');
    return;
  }

  try {
    const grades = JSON.parse(gradesData);
    console.log(`   ✅ Encontrados ${grades.length} registros en LocalStorage`);
    
    if (grades.length === 0) {
      console.log('   ⚠️ Los datos existen pero el array está vacío');
      return;
    }

    // Mostrar muestra
    console.log('   Muestra:', grades[0]);

    // 2. Forzar evento de storage
    console.log('\n2️⃣ FORZANDO RECARGA:');
    console.log('   Emitiendo evento storage...');
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: gradesKey,
      newValue: gradesData,
      storageArea: localStorage
    }));

    // 3. Forzar evento SQL
    setTimeout(() => {
      console.log('   Emitiendo evento sqlGradesUpdated...');
      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
        detail: {
          year,
          count: grades.length,
          timestamp: Date.now(),
          source: 'force-reload'
        }
      }));
    }, 500);

    // 4. Forzar evento dataUpdated
    setTimeout(() => {
      console.log('   Emitiendo evento dataUpdated...');
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: {
          type: 'grades',
          year,
          timestamp: Date.now(),
          source: 'force-reload'
        }
      }));
    }, 1000);

    // 5. Verificar resultado
    setTimeout(() => {
      console.log('\n3️⃣ VERIFICANDO RESULTADO:');
      const table = document.querySelector('table tbody');
      const rows = table ? table.querySelectorAll('tr').length : 0;
      
      if (rows > 0) {
        console.log(`   ✅ ÉXITO: ${rows} filas visibles en la tabla`);
      } else {
        console.log('   ⚠️ La tabla sigue vacía');
        console.log('\n   💡 SOLUCIÓN ALTERNATIVA:');
        console.log('   Recargar la página (F5)');
      }
    }, 2000);

  } catch (e) {
    console.log('   ❌ Error al parsear datos:', e.message);
  }

  console.log('\n🔧 ========================================\n');
})();
