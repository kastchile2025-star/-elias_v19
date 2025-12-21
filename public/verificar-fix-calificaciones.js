/**
 * ✅ SCRIPT DE VERIFICACIÓN - Fix Calificaciones (0)
 * 
 * Este script verifica si el fix está funcionando correctamente.
 * 
 * USO:
 * 1. Cargar en consola del navegador:
 *    (function(){const s=document.createElement('script');s.src='/verificar-fix-calificaciones.js';document.head.appendChild(s);})();
 * 
 * 2. O ejecutar directamente este archivo en la pestaña Calificaciones
 */

(function() {
  console.clear();
  console.log('%c🔍 VERIFICACIÓN FIX CALIFICACIONES', 'font-size: 18px; font-weight: bold; color: #4CAF50');
  console.log('═══════════════════════════════════════════════════════════\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const key = `smart-student-test-grades-${year}`;

  // ═══════════════════════════════════════════════════════════
  // 1. VERIFICAR DATOS EN LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════
  console.log('📦 1. VERIFICANDO LOCALSTORAGE...');
  
  let data = [];
  try {
    const raw = localStorage.getItem(key);
    data = raw ? JSON.parse(raw) : [];
    
    if (data.length === 0) {
      console.log('%c❌ LocalStorage VACÍO', 'color: #f44336; font-weight: bold');
      console.log(`   Clave buscada: "${key}"`);
      console.log('   💡 ACCIÓN: Cargar CSV desde Admin > Configuración');
      console.log('   Archivo: public/test-data/calificaciones_reales_200.csv\n');
      
      // Listar otras claves que existen
      const otherKeys = Object.keys(localStorage)
        .filter(k => k.includes('test-grades'))
        .map(k => {
          const y = k.match(/test-grades-(\d+)/)?.[1];
          const len = JSON.parse(localStorage.getItem(k) || '[]').length;
          return { año: y, registros: len };
        });
      
      if (otherKeys.length > 0) {
        console.log('   ℹ️ Pero hay datos para otros años:');
        console.table(otherKeys);
        console.log(`   💡 Cambia el año selector o carga datos para ${year}\n`);
      }
    } else {
      console.log(`%c✅ ${data.length} registros encontrados`, 'color: #4CAF50; font-weight: bold');
      
      // Mostrar muestra
      const sample = data.slice(0, 3).map(g => ({
        testId: g.testId,
        studentId: g.studentId,
        calificacion: g.calificacion,
        curso: g.courseName || g.course_name
      }));
      console.table(sample);
      console.log(`   (mostrando 3 de ${data.length})\n`);
    }
  } catch (err) {
    console.log('%c❌ ERROR al parsear LocalStorage', 'color: #f44336; font-weight: bold');
    console.error(err);
    console.log('   💡 ACCIÓN: Ejecutar limpieza y recarga\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 2. VERIFICAR UI - BADGES
  // ═══════════════════════════════════════════════════════════
  console.log('🏷️ 2. VERIFICANDO BADGES...');
  
  const allBadges = Array.from(document.querySelectorAll('[class*="badge"]'))
    .map(b => b.textContent.trim())
    .filter(t => /\(\d+\)/.test(t)); // Solo badges con números
  
  if (allBadges.length === 0) {
    console.log('%c❌ No se encontraron badges', 'color: #f44336; font-weight: bold');
    console.log('   💡 ¿Estás en la página de Calificaciones?\n');
  } else {
    const zeros = allBadges.filter(b => b.includes('(0)'));
    const nonZeros = allBadges.filter(b => !b.includes('(0)'));
    
    if (zeros.length === allBadges.length) {
      console.log(`%c⚠️ TODOS los badges muestran (0)`, 'color: #ff9800; font-weight: bold');
      console.log(`   Total badges: ${allBadges.length}`);
      console.log('   💡 PROBLEMA: Datos no se están cargando en React state\n');
    } else if (nonZeros.length > 0) {
      console.log(`%c✅ Badges con datos: ${nonZeros.length}/${allBadges.length}`, 'color: #4CAF50; font-weight: bold');
      console.log('   Ejemplos:', nonZeros.slice(0, 5).join(', '));
      if (zeros.length > 0) {
        console.log(`   ℹ️ Badges en (0): ${zeros.length} - Normal si no hay datos para esas secciones\n`);
      } else {
        console.log('');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3. VERIFICAR TABLA
  // ═══════════════════════════════════════════════════════════
  console.log('📊 3. VERIFICANDO TABLA...');
  
  const tableRows = document.querySelectorAll('table tbody tr');
  const rowCount = tableRows.length;
  
  if (rowCount === 0) {
    console.log('%c❌ Tabla VACÍA', 'color: #f44336; font-weight: bold');
    
    // Verificar si hay mensaje "Sin registros"
    const noDataMsg = Array.from(document.querySelectorAll('td'))
      .find(td => td.textContent.includes('Sin registros') || td.textContent.includes('No hay'));
    
    if (noDataMsg) {
      console.log('   ℹ️ Mensaje mostrado: "' + noDataMsg.textContent.trim() + '"');
      console.log('   💡 Esto es normal si no hay datos para los filtros actuales\n');
    } else {
      console.log('   💡 PROBLEMA: Tabla renderizada pero sin filas\n');
    }
  } else {
    console.log(`%c✅ ${rowCount} filas visibles`, 'color: #4CAF50; font-weight: bold\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 4. VERIFICAR REACT STATE (si es posible)
  // ═══════════════════════════════════════════════════════════
  console.log('⚛️ 4. VERIFICANDO REACT STATE...');
  
  try {
    const reactRoot = document.querySelector('[data-testid], [data-component], main, #__next');
    
    if (reactRoot) {
      // Buscar props en el elemento React
      const reactKey = Object.keys(reactRoot).find(k => k.startsWith('__react'));
      
      if (reactKey) {
        console.log('%c✅ React detectado', 'color: #4CAF50');
        console.log('   ℹ️ Para ver el state completo, usa React DevTools\n');
      } else {
        console.log('%c⚠️ No se pudo acceder al state de React', 'color: #ff9800');
        console.log('   ℹ️ Usa React DevTools para inspeccionar el state\n');
      }
    }
  } catch (err) {
    console.log('%c⚠️ No se pudo verificar React state', 'color: #ff9800');
    console.log('   ℹ️ Esto es normal, usa React DevTools\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 5. DIAGNÓSTICO Y RECOMENDACIONES
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c📋 DIAGNÓSTICO FINAL', 'font-size: 16px; font-weight: bold; color: #2196F3');
  console.log('═══════════════════════════════════════════════════════════\n');

  const hasData = data.length > 0;
  const hasBadges = allBadges.length > 0 && allBadges.some(b => !b.includes('(0)'));
  const hasRows = rowCount > 0;

  // Caso 1: TODO OK
  if (hasData && hasBadges && hasRows) {
    console.log('%c✅ TODO FUNCIONANDO CORRECTAMENTE', 'font-size: 14px; color: #4CAF50; font-weight: bold');
    console.log('   • LocalStorage tiene datos ✓');
    console.log('   • Badges muestran números ✓');
    console.log('   • Tabla tiene filas ✓\n');
    console.log('🎉 El fix está funcionando perfectamente!\n');
  }
  // Caso 2: Hay datos pero UI vacía
  else if (hasData && !hasBadges && !hasRows) {
    console.log('%c⚠️ HAY DATOS PERO LA UI ESTÁ VACÍA', 'font-size: 14px; color: #ff9800; font-weight: bold');
    console.log('   • LocalStorage: ✓ ' + data.length + ' registros');
    console.log('   • Badges: ✗ Todos en (0)');
    console.log('   • Tabla: ✗ Vacía\n');
    console.log('💡 SOLUCIONES:\n');
    console.log('1️⃣ Forzar recarga de React state:');
    console.log('   window.dispatchEvent(new StorageEvent("storage", {');
    console.log('     key: "' + key + '",');
    console.log('     newValue: localStorage.getItem("' + key + '"),');
    console.log('     storageArea: localStorage');
    console.log('   }));\n');
    console.log('2️⃣ O simplemente recarga la página:');
    console.log('   location.reload();\n');
  }
  // Caso 3: No hay datos
  else if (!hasData) {
    console.log('%c❌ NO HAY DATOS EN LOCALSTORAGE', 'font-size: 14px; color: #f44336; font-weight: bold');
    console.log('   • LocalStorage: ✗ Vacío para año ' + year);
    console.log('   • Badges: ' + (hasBadges ? '✓' : '✗'));
    console.log('   • Tabla: ' + (hasRows ? '✓' : '✗') + '\n');
    console.log('💡 ACCIÓN REQUERIDA:\n');
    console.log('1️⃣ Ir a Admin > Configuración');
    console.log('2️⃣ Sección "🗄️ Calificaciones en SQL/Firebase"');
    console.log('3️⃣ Clic en "📤 Cargar Calificaciones"');
    console.log('4️⃣ Seleccionar archivo CSV (ej: calificaciones_reales_200.csv)');
    console.log('5️⃣ Esperar mensaje de éxito');
    console.log('6️⃣ Volver a Calificaciones\n');
  }
  // Caso 4: Datos parciales
  else {
    console.log('%c⚠️ ESTADO MIXTO', 'font-size: 14px; color: #ff9800; font-weight: bold');
    console.log('   • LocalStorage: ' + (hasData ? '✓' : '✗'));
    console.log('   • Badges: ' + (hasBadges ? '✓' : '✗'));
    console.log('   • Tabla: ' + (hasRows ? '✓' : '✗') + '\n');
    console.log('💡 Esto puede ser normal si:');
    console.log('   • Los filtros están ocultando algunas filas');
    console.log('   • Solo hay datos para algunos cursos/secciones');
    console.log('   • La carga SQL está en progreso\n');
    console.log('Espera unos segundos y verifica de nuevo.\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 6. COMANDO RÁPIDO DE FIX
  // ═══════════════════════════════════════════════════════════
  if (hasData && !hasRows) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('%c⚡ COMANDO RÁPIDO DE FIX', 'font-size: 14px; font-weight: bold; color: #FF5722');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Ejecuta este comando para forzar la recarga:\n');
    console.log('%ccopy(\'window.dispatchEvent(new StorageEvent("storage", { key: "' + key + '", newValue: localStorage.getItem("' + key + '"), storageArea: localStorage })); setTimeout(() => location.reload(), 500);\')', 'background: #eee; padding: 10px; border-radius: 5px;');
    console.log('\n(El comando fue copiado al portapapeles - pégalo en consola)\n');
    
    try {
      navigator.clipboard.writeText(
        'window.dispatchEvent(new StorageEvent("storage", { key: "' + key + '", newValue: localStorage.getItem("' + key + '"), storageArea: localStorage })); setTimeout(() => location.reload(), 500);'
      );
    } catch {}
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Verificación completada - ' + new Date().toLocaleTimeString());
  console.log('═══════════════════════════════════════════════════════════\n');

})();
