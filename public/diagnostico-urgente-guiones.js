/**
 * 🚨 DIAGNÓSTICO URGENTE - Por qué siguen apareciendo "—"
 * 
 * Este script verifica EXACTAMENTE qué está pasando.
 * 
 * USO:
 * Copia y pega TODO este código en la consola (F12)
 */

(async function() {
  console.clear();
  console.log('%c🚨 DIAGNÓSTICO URGENTE - Calificaciones', 'font-size: 20px; font-weight: bold; color: #f44336');
  console.log('═══════════════════════════════════════════════════════════\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const key = `smart-student-test-grades-${year}`;

  // 1. VERIFICAR DATOS EN LOCALSTORAGE
  console.log('📦 1. VERIFICANDO LOCALSTORAGE...\n');
  
  let grades = [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      console.log('%c❌ PROBLEMA CRÍTICO: LocalStorage VACÍO', 'font-size: 16px; color: #f44336; font-weight: bold');
      console.log(`   Clave buscada: "${key}"`);
      console.log('   \n🔧 SOLUCIÓN: Necesitas cargar el CSV de nuevo desde Admin > Configuración\n');
      
      // Ver si hay datos para otros años
      const allKeys = Object.keys(localStorage).filter(k => k.includes('test-grades'));
      if (allKeys.length > 0) {
        console.log('   ℹ️ Pero hay datos para otros años:');
        allKeys.forEach(k => {
          const data = JSON.parse(localStorage.getItem(k) || '[]');
          const y = k.match(/test-grades-(\d+)/)?.[1];
          console.log(`      - Año ${y}: ${data.length} registros`);
        });
        console.log(`   \n   💡 OPCIÓN: Cambiar año a uno que tenga datos, O cargar CSV para ${year}\n`);
      }
      
      return;
    }

    grades = JSON.parse(raw);
    console.log(`%c✅ ${grades.length} registros encontrados para año ${year}`, 'color: #4CAF50; font-weight: bold; font-size: 14px\n');

    // Muestra de datos
    console.log('   📋 PRIMEROS 3 REGISTROS:');
    const sample = grades.slice(0, 3).map(g => ({
      testId: g.testId,
      studentName: g.studentName,
      score: g.score,
      courseName: g.courseName,
      sectionName: g.sectionName,
      subjectName: g.subjectName,
      gradedAt: new Date(g.gradedAt).toLocaleDateString()
    }));
    console.table(sample);
    console.log('');

  } catch (err) {
    console.log('%c❌ ERROR al leer LocalStorage', 'color: #f44336; font-weight: bold');
    console.error(err);
    return;
  }

  // 2. VERIFICAR FILTROS ACTIVOS
  console.log('🔍 2. VERIFICANDO FILTROS EN LA PÁGINA...\n');

  const filters = {
    nivel: document.querySelector('[class*="badge"][class*="bg-blue"]')?.textContent || 'No seleccionado',
    semestre: document.querySelector('[class*="badge"]:has-text("Semestre")')?.textContent || 'No detectado',
    curso: Array.from(document.querySelectorAll('[class*="badge"]')).find(b => b.textContent.includes('Básico'))?.textContent || 'No seleccionado',
    seccion: 'Verificar badges azules activos'
  };

  console.log('   Filtros detectados:', filters);
  console.log('');

  // 3. VERIFICAR QUÉ CURSOS/SECCIONES TIENEN DATOS
  console.log('📊 3. DISTRIBUCIÓN DE DATOS POR CURSO/SECCIÓN...\n');

  const byCourseSection = {};
  grades.forEach(g => {
    const key = `${g.courseName || 'Sin curso'} ${g.sectionName || 'Sin sección'}`;
    if (!byCourseSection[key]) byCourseSection[key] = 0;
    byCourseSection[key]++;
  });

  const sorted = Object.entries(byCourseSection).sort((a, b) => b[1] - a[1]);
  
  console.log('   Top 10 cursos/secciones con más calificaciones:');
  sorted.slice(0, 10).forEach(([key, count], i) => {
    console.log(`   ${i + 1}. ${key}: ${count} calificaciones`);
  });
  console.log('');

  // 4. VERIFICAR 8vo BÁSICO B ESPECÍFICAMENTE
  console.log('🎯 4. VERIFICANDO 8vo BÁSICO B (de la captura)...\n');

  const filtered8voB = grades.filter(g => {
    const courseMatch = String(g.courseName || '').toLowerCase().includes('8vo') || 
                        String(g.courseName || '').toLowerCase().includes('octavo');
    const sectionMatch = String(g.sectionName || '').toLowerCase() === 'b';
    return courseMatch && sectionMatch;
  });

  if (filtered8voB.length === 0) {
    console.log('%c⚠️ NO HAY CALIFICACIONES para 8vo Básico B', 'color: #ff9800; font-weight: bold');
    console.log('   Esto explica por qué muestra "—"\n');
    console.log('   💡 SOLUCIÓN:');
    console.log('      1. Verifica que el CSV tenga datos para 8vo Básico B');
    console.log('      2. O selecciona otro curso que SÍ tenga datos\n');
  } else {
    console.log(`%c✅ ${filtered8voB.length} calificaciones encontradas para 8vo Básico B`, 'color: #4CAF50; font-weight: bold\n');
    
    // Por asignatura
    const bySubject = {};
    filtered8voB.forEach(g => {
      const subj = g.subjectName || 'Sin asignatura';
      if (!bySubject[subj]) bySubject[subj] = [];
      bySubject[subj].push(g);
    });

    console.log('   Por asignatura:');
    Object.entries(bySubject).forEach(([subj, list]) => {
      console.log(`      • ${subj}: ${list.length} calificaciones`);
    });
    console.log('');

    // Muestra específica para Ciencias Naturales
    const ciencias = bySubject['Ciencias Naturales'] || [];
    if (ciencias.length > 0) {
      console.log('   📋 CIENCIAS NATURALES (primeros 5):');
      console.table(ciencias.slice(0, 5).map(g => ({
        estudiante: g.studentName,
        score: g.score,
        testId: g.testId,
        fecha: new Date(g.gradedAt).toLocaleDateString()
      })));
      console.log('');
    }
  }

  // 5. VERIFICAR TAREAS PENDIENTES
  console.log('📝 5. VERIFICANDO TAREAS PENDIENTES...\n');

  const tasksKey = `smart-student-pending-tasks-${year}`;
  let tasks = [];
  try {
    const tasksRaw = localStorage.getItem(tasksKey);
    if (tasksRaw) {
      tasks = JSON.parse(tasksRaw);
      console.log(`   ✅ ${tasks.length} tareas pendientes encontradas\n`);

      const tasks8voB = tasks.filter(t => {
        const courseMatch = String(t.courseName || '').toLowerCase().includes('8vo') || 
                            String(t.courseName || '').toLowerCase().includes('octavo');
        const sectionMatch = String(t.sectionName || '').toLowerCase() === 'b';
        return courseMatch && sectionMatch;
      });

      if (tasks8voB.length > 0) {
        console.log(`   📌 ${tasks8voB.length} tareas para 8vo Básico B:`);
        tasks8voB.slice(0, 5).forEach((t, i) => {
          console.log(`      ${i + 1}. ${t.title || 'Sin título'} (ID: ${t.id})`);
        });
        console.log('');
      } else {
        console.log('   ⚠️ NO hay tareas para 8vo Básico B');
        console.log('   → El código usará modo fallback (mostrar por fecha)\n');
      }
    } else {
      console.log('   ℹ️ No hay tareas pendientes');
      console.log('   → El código usará modo fallback (mostrar por fecha)\n');
    }
  } catch {}

  // 6. COMPARAR IDs (SI HAY TAREAS)
  if (filtered8voB.length > 0 && tasks.length > 0) {
    console.log('🔍 6. COMPARANDO TESTID vs TASK ID...\n');

    const gradeIds = [...new Set(filtered8voB.map(g => String(g.testId)))].slice(0, 10);
    const taskIds = [...new Set(tasks.filter(t => {
      const courseMatch = String(t.courseName || '').toLowerCase().includes('8vo');
      const sectionMatch = String(t.sectionName || '').toLowerCase() === 'b';
      return courseMatch && sectionMatch;
    }).map(t => String(t.id)))].slice(0, 10);

    console.log('   📊 testIds en calificaciones:');
    gradeIds.forEach((id, i) => console.log(`      ${i + 1}. ${id}`));
    console.log('');

    console.log('   📊 ids en tareas:');
    taskIds.forEach((id, i) => console.log(`      ${i + 1}. ${id}`));
    console.log('');

    const matches = gradeIds.filter(gid => taskIds.includes(gid));
    if (matches.length === 0) {
      console.log('%c❌ NO HAY COINCIDENCIAS entre testId y task id', 'color: #f44336; font-weight: bold');
      console.log('   Esto explica por qué aparecen "—"\n');
      console.log('   💡 SOLUCIÓN:');
      console.log('      El código DEBERÍA usar fallback automáticamente');
      console.log('      Si no lo hace, hay un bug en la lógica de fallback\n');
    } else {
      console.log(`%c✅ ${matches.length} coincidencias encontradas`, 'color: #4CAF50; font-weight: bold\n');
    }
  }

  // 7. DIAGNÓSTICO FINAL
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c🎯 DIAGNÓSTICO FINAL', 'font-size: 16px; font-weight: bold; color: #2196F3');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (grades.length === 0) {
    console.log('%c❌ PROBLEMA: NO HAY DATOS EN LOCALSTORAGE', 'font-size: 14px; color: #f44336; font-weight: bold; background: #ffebee; padding: 10px');
    console.log('\n🔧 SOLUCIÓN INMEDIATA:\n');
    console.log('   1. Ve a Admin > Configuración');
    console.log('   2. Busca "Calificaciones en SQL/Firebase"');
    console.log('   3. Clic en "Cargar Calificaciones"');
    console.log('   4. Selecciona: public/test-data/calificaciones_reales_200.csv');
    console.log('   5. Espera el mensaje de éxito');
    console.log('   6. Vuelve a Calificaciones\n');
  } else if (filtered8voB.length === 0) {
    console.log('%c⚠️ PROBLEMA: NO HAY DATOS PARA 8vo BÁSICO B', 'font-size: 14px; color: #ff9800; font-weight: bold; background: #fff3e0; padding: 10px');
    console.log(`\n   Tienes ${grades.length} calificaciones, pero NINGUNA es para 8vo Básico B\n`);
    console.log('🔧 OPCIONES:\n');
    console.log('   A) Selecciona otro curso que SÍ tenga datos (ver lista arriba)');
    console.log('   B) Carga un CSV que incluya 8vo Básico B\n');
  } else {
    console.log('%c✅ HAY DATOS PERO NO SE MUESTRAN', 'font-size: 14px; color: #4CAF50; font-weight: bold; background: #e8f5e9; padding: 10px');
    console.log(`\n   LocalStorage: ${grades.length} calificaciones`);
    console.log(`   8vo Básico B: ${filtered8voB.length} calificaciones`);
    console.log('   Tabla: Muestra "—"\n');
    console.log('🔧 POSIBLES CAUSAS:\n');
    console.log('   1. El código de fallback NO se está ejecutando');
    console.log('   2. Los filtros están ocultando las filas');
    console.log('   3. Hay un bug en el renderizado\n');
    console.log('💡 PRUEBA ESTO:\n');
    console.log('   Ejecuta el siguiente comando para forzar modo fallback:\n');
    console.log('   localStorage.removeItem("smart-student-pending-tasks-2025");');
    console.log('   location.reload();\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');

})();
