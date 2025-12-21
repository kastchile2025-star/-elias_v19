/**
 * 🔍 VERIFICACIÓN - LocalStorage vs Firebase
 * 
 * Muestra qué datos hay en LocalStorage vs Firebase/SQL
 * y por qué se usan ambos.
 * 
 * USO:
 * (function(){const s=document.createElement('script');s.src='/verificar-datos-localstorage-firebase.js';document.head.appendChild(s);})();
 */

(async function() {
  console.clear();
  console.log('%c🔍 VERIFICACIÓN - LocalStorage vs Firebase/SQL', 'font-size: 18px; font-weight: bold; color: #2196F3');
  console.log('═══════════════════════════════════════════════════════════\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;

  // ═══════════════════════════════════════════════════════════
  // 1. DATOS EN LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════
  console.log('📦 1. DATOS EN LOCALSTORAGE (Caché Local)\n');

  const lsKey = `smart-student-test-grades-${year}`;
  let lsData = [];
  let lsSize = 0;

  try {
    const raw = localStorage.getItem(lsKey);
    if (raw) {
      lsData = JSON.parse(raw);
      lsSize = new Blob([raw]).size;
    }

    if (lsData.length === 0) {
      console.log('%c❌ LocalStorage VACÍO', 'color: #f44336; font-weight: bold');
      console.log(`   Clave: "${lsKey}"`);
      console.log('   → Esto significa que NO se cargaron datos localmente\n');
    } else {
      console.log(`%c✅ ${lsData.length} registros`, 'color: #4CAF50; font-weight: bold');
      console.log(`   Tamaño: ${(lsSize / 1024).toFixed(2)} KB`);
      console.log(`   Clave: "${lsKey}"\n`);

      // Muestra de datos
      const sample = lsData.slice(0, 3).map(g => ({
        testId: g.testId,
        studentName: g.studentName,
        score: g.score,
        courseName: g.courseName,
        sectionName: g.sectionName,
        subjectName: g.subjectName
      }));

      console.log('   📋 MUESTRA (primeros 3 registros):');
      console.table(sample);
      console.log('');
    }
  } catch (err) {
    console.log('%c❌ ERROR al leer LocalStorage', 'color: #f44336; font-weight: bold');
    console.error(err);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. VERIFICAR FIREBASE/SQL (Simulado)
  // ═══════════════════════════════════════════════════════════
  console.log('☁️ 2. DATOS EN FIREBASE/SQL (Base de Datos)\n');

  console.log('⚠️ No puedo acceder directamente a Firebase desde este script.');
  console.log('Pero PUEDES verificarlo manualmente:\n');

  console.log('📌 Opción A: Verificar en Firebase Console');
  console.log('   1. Ve a: https://console.firebase.google.com/');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Firestore Database');
  console.log('   4. Busca la colección "grades" o "test_grades"');
  console.log('   5. Verifica que tenga registros para el año ' + year + '\n');

  console.log('📌 Opción B: Usar el hook useGradesSQL');
  console.log('   Si estás en la página de Calificaciones, el hook ya cargó los datos.');
  console.log('   Revisa la consola por logs como:');
  console.log('   "🔄 CARGA EN SEGUNDO PLANO: Intentar SQL/Firebase"\n');

  // ═══════════════════════════════════════════════════════════
  // 3. EXPLICAR POR QUÉ AMBOS
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c💡 ¿POR QUÉ USAR AMBOS?', 'font-size: 16px; font-weight: bold; color: #FF9800');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🏗️ ARQUITECTURA DUAL: LocalStorage + Firebase\n');

  console.log('📦 LocalStorage (Caché Local):');
  console.log('   ✅ Ventaja 1: VELOCIDAD - Carga en milisegundos');
  console.log('   ✅ Ventaja 2: OFFLINE - Funciona sin conexión');
  console.log('   ✅ Ventaja 3: UX - Interfaz responde instantáneamente');
  console.log('   ❌ Limitación: Solo disponible en este navegador\n');

  console.log('☁️ Firebase/SQL (Base de Datos):');
  console.log('   ✅ Ventaja 1: PERSISTENCIA - Datos permanentes');
  console.log('   ✅ Ventaja 2: COMPARTIDO - Acceso desde cualquier dispositivo');
  console.log('   ✅ Ventaja 3: BACKUP - No se pierden si borras navegador');
  console.log('   ❌ Limitación: Más lento (500-2000ms)\n');

  console.log('🔄 FLUJO DE SINCRONIZACIÓN:\n');

  console.log('1️⃣ Usuario carga CSV');
  console.log('   ↓');
  console.log('2️⃣ Se valida y procesa');
  console.log('   ↓');
  console.log('3️⃣ Se guarda en FIREBASE (persistente)');
  console.log('   ↓');
  console.log('4️⃣ Se guarda en LOCALSTORAGE (caché)');
  console.log('   ↓');
  console.log('5️⃣ Se emiten eventos');
  console.log('   ↓');
  console.log('6️⃣ Página Calificaciones recarga\n');

  // ═══════════════════════════════════════════════════════════
  // 4. CÓDIGO RELEVANTE
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c📝 CÓDIGO RELEVANTE', 'font-size: 14px; font-weight: bold; color: #9C27B0');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📄 Archivo: src/app/dashboard/calificaciones/page.tsx');
  console.log('   Línea 234-248: Carga inicial\n');

  console.log('```typescript');
  console.log('// 🚀 CARGA INSTANTÁNEA: LocalStorage PRIMERO');
  console.log('const localGrades = LocalStorageManager.getTestGradesForYear(selectedYear);');
  console.log('setGrades(localGrades); // ⚡ Muestra datos INMEDIATAMENTE');
  console.log('');
  console.log('// 🔄 CARGA EN SEGUNDO PLANO: Firebase/SQL después');
  console.log('if (isSQLConnected && getGradesByYear) {');
  console.log('  const sqlGrades = await getGradesByYear(selectedYear);');
  console.log('  if (sqlGrades.length > 0) {');
  console.log('    setGrades(sqlGrades); // 🔄 Actualiza si hay cambios');
  console.log('  }');
  console.log('}');
  console.log('```\n');

  // ═══════════════════════════════════════════════════════════
  // 5. COMPARACIÓN DE VELOCIDAD
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c⚡ COMPARACIÓN DE VELOCIDAD', 'font-size: 14px; font-weight: bold; color: #FF5722');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test de velocidad LocalStorage
  const start1 = performance.now();
  try {
    const test = localStorage.getItem(lsKey);
    if (test) JSON.parse(test);
  } catch {}
  const end1 = performance.now();
  const timeLS = (end1 - start1).toFixed(2);

  console.log(`📦 LocalStorage: ${timeLS}ms`);
  console.log(`   → ${lsData.length} registros en ${timeLS}ms`);
  console.log(`   → ${lsData.length > 0 ? (lsData.length / parseFloat(timeLS)).toFixed(0) : 0} registros/ms\n`);

  console.log('☁️ Firebase/SQL: ~500-2000ms (estimado)');
  console.log('   → Depende de conexión y tamaño de datos');
  console.log('   → Por eso se usa como "segundo plano"\n');

  // ═══════════════════════════════════════════════════════════
  // 6. DIAGNÓSTICO Y RECOMENDACIONES
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c🎯 DIAGNÓSTICO', 'font-size: 16px; font-weight: bold; color: #4CAF50');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (lsData.length > 0) {
    console.log('%c✅ TODO CORRECTO', 'font-size: 14px; color: #4CAF50; font-weight: bold\n');
    console.log(`LocalStorage tiene ${lsData.length} registros`);
    console.log('Firebase/SQL también debería tener los mismos datos\n');
    console.log('🔄 FLUJO ACTUAL:');
    console.log('   1. Página carga → Lee LocalStorage (5ms) ⚡');
    console.log('   2. Muestra datos inmediatamente');
    console.log('   3. En segundo plano, consulta Firebase (~1s)');
    console.log('   4. Si hay diferencias, actualiza\n');
    console.log('💡 ESTO ES CORRECTO Y ESPERADO');
    console.log('   No es un bug, es la arquitectura del sistema.\n');
  } else {
    console.log('%c⚠️ PROBLEMA: LocalStorage vacío', 'font-size: 14px; color: #ff9800; font-weight: bold\n');
    console.log('LocalStorage NO tiene datos');
    console.log('Esto significa que:');
    console.log('   1. No se cargó el CSV correctamente, O');
    console.log('   2. Se cargó en Firebase pero no se sincronizó a LocalStorage\n');
    console.log('💡 SOLUCIÓN:');
    console.log('   Recarga el CSV desde Admin > Configuración');
    console.log('   Esto guardará en AMBOS lugares\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 7. COMANDOS ÚTILES
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c💡 COMANDOS ÚTILES', 'font-size: 14px; font-weight: bold; color: #00BCD4');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📌 Ver TODOS los datos en LocalStorage:');
  console.log(`const allGrades = JSON.parse(localStorage.getItem('${lsKey}') || '[]');`);
  console.log('console.table(allGrades);\n');

  console.log('📌 Ver tamaño de TODOS los datos:');
  console.log('let totalSize = 0;');
  console.log('Object.keys(localStorage).forEach(key => {');
  console.log('  totalSize += localStorage.getItem(key).length;');
  console.log('});');
  console.log('console.log(`Total LocalStorage: ${(totalSize/1024).toFixed(2)} KB`);\n');

  console.log('📌 Limpiar caché (solo si necesario):');
  console.log(`localStorage.removeItem('${lsKey}');`);
  console.log('location.reload(); // Recargará desde Firebase\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Verificación completada - ' + new Date().toLocaleTimeString());
  console.log('═══════════════════════════════════════════════════════════\n');

  // Resumen final
  if (lsData.length > 0) {
    console.log('%c🎉 RESUMEN: Sistema funcionando como se diseñó', 'font-size: 14px; font-weight: bold; color: #4CAF50; background: #E8F5E9; padding: 10px;');
    console.log('\n   LocalStorage: Caché rápida ⚡');
    console.log('   Firebase/SQL: Fuente de verdad ☁️');
    console.log('   Ambos trabajan juntos para mejor rendimiento\n');
  } else {
    console.log('%c⚠️ ACCIÓN REQUERIDA: Cargar datos desde Admin', 'font-size: 14px; font-weight: bold; color: #FF9800; background: #FFF3E0; padding: 10px;');
    console.log('\n   Ve a Admin > Configuración > Cargar Calificaciones\n');
  }

})();
