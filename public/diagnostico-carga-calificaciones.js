/**
 * 🔍 DIAGNÓSTICO COMPLETO: Por qué no cargan las calificaciones
 * 
 * Ejecutar en consola del navegador (pestaña Calificaciones)
 */

(async function diagnosticoCompleto() {
  console.log('🔍 ========================================');
  console.log('🔍 DIAGNÓSTICO: Carga de Calificaciones');
  console.log('🔍 ========================================\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  console.log(`📅 Año seleccionado: ${year}\n`);

  // 1. Verificar LocalStorage
  console.log('1️⃣ VERIFICANDO LOCALSTORAGE:');
  
  const keys = [
    `smart-student-test-grades-${year}`,
    'smart-student-test-grades',
    'smart-student-users',
    'smart-student-courses',
    'smart-student-sections',
    'smart-student-subjects'
  ];

  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        console.log(`   ✅ ${key}: ${count} registros`);
        
        // Mostrar muestra si es calificaciones
        if (key.includes('grades') && Array.isArray(parsed) && parsed.length > 0) {
          console.log(`      Muestra:`, parsed[0]);
        }
      } else {
        console.log(`   ⚠️ ${key}: NO EXISTE`);
      }
    } catch (e) {
      console.log(`   ❌ ${key}: Error al parsear`);
    }
  });

  // 2. Verificar estado de React
  console.log('\n2️⃣ VERIFICANDO ESTADO DE REACT:');
  
  // Buscar el contenedor de la tabla
  const table = document.querySelector('table');
  if (table) {
    const tbody = table.querySelector('tbody');
    const rows = tbody ? tbody.querySelectorAll('tr') : [];
    console.log(`   Filas visibles: ${rows.length}`);
    
    if (rows.length === 0) {
      console.log('   ⚠️ LA TABLA ESTÁ VACÍA - Este es el problema');
    } else {
      console.log('   ✅ Hay filas en la tabla');
    }
  } else {
    console.log('   ⚠️ No se encontró la tabla');
  }

  // 3. Verificar filtros activos
  console.log('\n3️⃣ VERIFICANDO FILTROS:');
  
  // Buscar badges de filtros
  const badges = document.querySelectorAll('[class*="badge"]');
  console.log(`   Badges de filtro visibles: ${badges.length}`);
  
  badges.forEach((badge, i) => {
    if (badge.textContent && badge.textContent.includes('(0)')) {
      console.log(`   ⚠️ Badge ${i + 1}: "${badge.textContent}" - VACÍO`);
    }
  });

  // 4. Verificar hooks SQL
  console.log('\n4️⃣ VERIFICANDO HOOKS SQL:');
  
  // Intentar acceder al hook si está expuesto
  if (window.__sqlGradesHook) {
    console.log('   ✅ Hook SQL disponible');
    console.log('   Estado:', window.__sqlGradesHook);
  } else {
    console.log('   ℹ️ Hook SQL no expuesto (normal)');
  }

  // 5. Simular recarga de datos
  console.log('\n5️⃣ SIMULANDO RECARGA DE DATOS:');
  
  try {
    // Disparar evento de recarga
    console.log('   Emitiendo evento sqlGradesUpdated...');
    window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
      detail: {
        year,
        count: 200,
        timestamp: Date.now(),
        source: 'diagnostic'
      }
    }));
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Verificar si cambió algo
    const tableAfter = document.querySelector('table tbody');
    const rowsAfter = tableAfter ? tableAfter.querySelectorAll('tr').length : 0;
    console.log(`   Filas después del evento: ${rowsAfter}`);
    
  } catch (e) {
    console.log('   ❌ Error al simular recarga:', e.message);
  }

  // 6. Verificar función de carga
  console.log('\n6️⃣ VERIFICANDO FUNCIÓN DE CARGA:');
  
  try {
    const { LocalStorageManager } = require('@/lib/education-utils');
    const grades = LocalStorageManager.getTestGradesForYear(year);
    console.log(`   LocalStorageManager.getTestGradesForYear(${year}):`, 
                Array.isArray(grades) ? `${grades.length} registros` : 'ERROR');
    
    if (Array.isArray(grades) && grades.length > 0) {
      console.log('   ✅ Los datos EXISTEN en LocalStorage');
      console.log('   Muestra:', grades[0]);
    } else {
      console.log('   ⚠️ LocalStorageManager no encuentra datos');
    }
  } catch (e) {
    console.log('   ⚠️ No se pudo importar LocalStorageManager (normal en browser)');
    console.log('   Verificando manualmente...');
    
    // Verificación manual
    const manualKey = `smart-student-test-grades-${year}`;
    const manualData = localStorage.getItem(manualKey);
    if (manualData) {
      try {
        const parsed = JSON.parse(manualData);
        console.log(`   ✅ Datos encontrados manualmente: ${parsed.length} registros`);
      } catch {
        console.log('   ❌ Error al parsear datos manuales');
      }
    } else {
      console.log('   ❌ No hay datos en', manualKey);
    }
  }

  // 7. Diagnóstico de problema
  console.log('\n7️⃣ DIAGNÓSTICO:');
  
  const gradesKey = `smart-student-test-grades-${year}`;
  const hasData = localStorage.getItem(gradesKey) !== null;
  const tableEmpty = document.querySelector('table tbody tr') === null;
  
  if (hasData && tableEmpty) {
    console.log('   🔴 PROBLEMA IDENTIFICADO:');
    console.log('   - Los datos EXISTEN en LocalStorage');
    console.log('   - La tabla está VACÍA');
    console.log('   - El componente NO está cargando los datos correctamente');
    console.log('\n   💡 SOLUCIÓN:');
    console.log('   1. Verificar que el useEffect de carga se ejecute');
    console.log('   2. Verificar que grades.length > 0 después de setGrades()');
    console.log('   3. Revisar filtros que puedan estar ocultando todo');
  } else if (!hasData) {
    console.log('   🔴 PROBLEMA: NO HAY DATOS');
    console.log('   - LocalStorage está vacío para el año', year);
    console.log('\n   💡 SOLUCIÓN:');
    console.log('   1. Cargar calificaciones desde Admin > Configuración');
    console.log('   2. Archivo: public/test-data/calificaciones_reales_200.csv');
  } else {
    console.log('   🟢 TODO PARECE NORMAL');
    console.log('   - Hay datos en LocalStorage');
    console.log('   - La tabla tiene filas');
  }

  // 8. Acción sugerida
  console.log('\n8️⃣ ACCIÓN SUGERIDA:');
  
  if (hasData && tableEmpty) {
    console.log('   Ejecuta esto para forzar recarga:');
    console.log(`   
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'smart-student-test-grades-${year}',
        newValue: localStorage.getItem('smart-student-test-grades-${year}'),
        storageArea: localStorage
      }));
    `);
  }

  console.log('\n🔍 ========================================\n');
})();
