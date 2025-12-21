/**
 * 🔍 DIAGNÓSTICO - Por qué las calificaciones muestran "—"
 * 
 * Este script analiza los datos de calificaciones para encontrar
 * por qué la tabla muestra "—" en lugar de notas numéricas.
 * 
 * USO:
 * (function(){const s=document.createElement('script');s.src='/diagnosticar-calificaciones-vacias.js';document.head.appendChild(s);})();
 */

(function() {
  console.clear();
  console.log('%c🔍 DIAGNÓSTICO - Calificaciones Vacías (—)', 'font-size: 18px; font-weight: bold; color: #FF9800');
  console.log('═══════════════════════════════════════════════════════════\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const key = `smart-student-test-grades-${year}`;

  // ═══════════════════════════════════════════════════════════
  // 1. CARGAR Y ANALIZAR DATOS
  // ═══════════════════════════════════════════════════════════
  console.log('📦 1. CARGANDO DATOS DE LOCALSTORAGE...\n');

  let data = [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      console.log('%c❌ NO HAY DATOS EN LOCALSTORAGE', 'color: #f44336; font-weight: bold');
      console.log(`   Clave: "${key}"`);
      console.log('   💡 Necesitas cargar el CSV primero\n');
      return;
    }

    data = JSON.parse(raw);
    console.log(`%c✅ ${data.length} registros encontrados`, 'color: #4CAF50; font-weight: bold\n');

  } catch (err) {
    console.log('%c❌ ERROR al parsear datos', 'color: #f44336; font-weight: bold');
    console.error(err);
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // 2. ANALIZAR ESTRUCTURA DE LOS DATOS
  // ═══════════════════════════════════════════════════════════
  console.log('🔬 2. ANALIZANDO ESTRUCTURA DE DATOS...\n');

  // Tomar una muestra de 5 registros
  const sample = data.slice(0, 5);
  
  console.log('📋 MUESTRA DE DATOS (primeros 5 registros):');
  console.table(sample);
  console.log('');

  // Verificar qué campos tienen los datos
  const firstRecord = data[0] || {};
  const fields = Object.keys(firstRecord);
  
  console.log('📝 CAMPOS DISPONIBLES EN LOS DATOS:');
  console.log(fields);
  console.log('');

  // ═══════════════════════════════════════════════════════════
  // 3. BUSCAR CAMPOS DE CALIFICACIÓN
  // ═══════════════════════════════════════════════════════════
  console.log('🎯 3. BUSCANDO CAMPOS DE CALIFICACIÓN...\n');

  const possibleGradeFields = [
    'calificacion',
    'calificación',
    'nota',
    'grade',
    'score',
    'nota_final',
    'promedio'
  ];

  const foundGradeFields = possibleGradeFields.filter(field => 
    fields.some(f => f.toLowerCase().includes(field.toLowerCase()))
  );

  if (foundGradeFields.length === 0) {
    console.log('%c⚠️ NO SE ENCONTRÓ NINGÚN CAMPO DE CALIFICACIÓN', 'color: #ff9800; font-weight: bold');
    console.log('   Campos disponibles:', fields);
    console.log('\n   💡 Posibles problemas:');
    console.log('   1. El CSV no tiene columna de calificaciones');
    console.log('   2. La columna tiene un nombre diferente');
    console.log('   3. Los datos no se procesaron correctamente\n');
  } else {
    console.log('%c✅ Campos de calificación encontrados:', 'color: #4CAF50; font-weight: bold');
    foundGradeFields.forEach(field => {
      const actualField = fields.find(f => f.toLowerCase().includes(field.toLowerCase()));
      console.log(`   • ${actualField}`);
    });
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════
  // 4. ANALIZAR VALORES DE CALIFICACIÓN
  // ═══════════════════════════════════════════════════════════
  console.log('📊 4. ANALIZANDO VALORES DE CALIFICACIÓN...\n');

  const gradeField = fields.find(f => 
    f.toLowerCase() === 'calificacion' || 
    f.toLowerCase() === 'calificación' ||
    f.toLowerCase() === 'nota' ||
    f.toLowerCase() === 'grade'
  );

  if (!gradeField) {
    console.log('%c❌ NO SE PUDO IDENTIFICAR EL CAMPO DE CALIFICACIÓN', 'color: #f44336; font-weight: bold');
    console.log('   Campos disponibles:', fields);
    console.log('\n   🔧 SOLUCIÓN:');
    console.log('   Necesitas modificar el CSV o el código para usar el campo correcto\n');
    return;
  }

  console.log(`%c✅ Campo de calificación identificado: "${gradeField}"`, 'color: #4CAF50; font-weight: bold\n');

  // Analizar valores
  const gradeValues = data.map(record => record[gradeField]);
  const nullValues = gradeValues.filter(v => v === null || v === undefined);
  const emptyStrings = gradeValues.filter(v => v === '');
  const validNumbers = gradeValues.filter(v => typeof v === 'number' && !isNaN(v));
  const stringNumbers = gradeValues.filter(v => typeof v === 'string' && !isNaN(parseFloat(v)) && v !== '');
  const nonNumeric = gradeValues.filter(v => 
    v !== null && 
    v !== undefined && 
    v !== '' && 
    typeof v !== 'number' &&
    (typeof v !== 'string' || isNaN(parseFloat(v)))
  );

  console.log('📈 DISTRIBUCIÓN DE VALORES:');
  console.log(`   • Total registros: ${data.length}`);
  console.log(`   • Valores null/undefined: ${nullValues.length} (${(nullValues.length/data.length*100).toFixed(1)}%)`);
  console.log(`   • Strings vacíos: ${emptyStrings.length} (${(emptyStrings.length/data.length*100).toFixed(1)}%)`);
  console.log(`   • Números válidos: ${validNumbers.length} (${(validNumbers.length/data.length*100).toFixed(1)}%)`);
  console.log(`   • Strings numéricos: ${stringNumbers.length} (${(stringNumbers.length/data.length*100).toFixed(1)}%)`);
  console.log(`   • No numéricos: ${nonNumeric.length} (${(nonNumeric.length/data.length*100).toFixed(1)}%)`);
  console.log('');

  // Mostrar ejemplos de valores no numéricos
  if (nonNumeric.length > 0) {
    console.log('⚠️ EJEMPLOS DE VALORES NO NUMÉRICOS:');
    const uniqueNonNumeric = [...new Set(nonNumeric)].slice(0, 10);
    uniqueNonNumeric.forEach((val, i) => {
      console.log(`   ${i+1}. "${val}" (tipo: ${typeof val})`);
    });
    console.log('');
  }

  // Estadísticas de calificaciones válidas
  if (validNumbers.length > 0 || stringNumbers.length > 0) {
    const allValidGrades = [
      ...validNumbers,
      ...stringNumbers.map(s => parseFloat(s))
    ];

    const min = Math.min(...allValidGrades);
    const max = Math.max(...allValidGrades);
    const avg = allValidGrades.reduce((a, b) => a + b, 0) / allValidGrades.length;

    console.log('📊 ESTADÍSTICAS DE CALIFICACIONES VÁLIDAS:');
    console.log(`   • Mínima: ${min.toFixed(1)}`);
    console.log(`   • Máxima: ${max.toFixed(1)}`);
    console.log(`   • Promedio: ${avg.toFixed(1)}`);
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════
  // 5. VERIFICAR DATOS EN LA TABLA VISIBLE
  // ═══════════════════════════════════════════════════════════
  console.log('👁️ 5. VERIFICANDO DATOS EN LA TABLA VISIBLE...\n');

  const tableRows = document.querySelectorAll('table tbody tr');
  
  if (tableRows.length === 0) {
    console.log('%c⚠️ No hay filas visibles en la tabla', 'color: #ff9800');
    console.log('   💡 Selecciona filtros para ver estudiantes\n');
  } else {
    console.log(`%c✅ ${tableRows.length} filas visibles`, 'color: #4CAF50; font-weight: bold\n');

    // Analizar primera fila
    const firstRow = tableRows[0];
    const cells = Array.from(firstRow.querySelectorAll('td')).map(td => td.textContent.trim());
    
    console.log('📋 PRIMERA FILA DE LA TABLA:');
    console.log(cells);
    console.log('');

    // Contar cuántas celdas tienen "—"
    let dashCount = 0;
    tableRows.forEach(row => {
      const gradeCells = Array.from(row.querySelectorAll('td')).filter(td => td.textContent.trim() === '—');
      dashCount += gradeCells.length;
    });

    console.log(`📊 RESUMEN DE LA TABLA:`);
    console.log(`   • Total celdas con "—": ${dashCount}`);
    console.log(`   • Total filas: ${tableRows.length}`);
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════
  // 6. DIAGNÓSTICO FINAL Y RECOMENDACIONES
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c🎯 DIAGNÓSTICO FINAL', 'font-size: 16px; font-weight: bold; color: #2196F3');
  console.log('═══════════════════════════════════════════════════════════\n');

  const hasValidGrades = validNumbers.length > 0 || stringNumbers.length > 0;
  const mostlyNull = (nullValues.length + emptyStrings.length) > (data.length * 0.8);

  if (!hasValidGrades && mostlyNull) {
    console.log('%c❌ PROBLEMA: Los datos NO tienen calificaciones', 'font-size: 14px; color: #f44336; font-weight: bold\n');
    console.log('🔍 CAUSA PROBABLE:');
    console.log('   • El CSV no tiene la columna de calificaciones');
    console.log('   • O la columna está vacía');
    console.log('   • O el procesamiento del CSV falló\n');
    console.log('💡 SOLUCIÓN:\n');
    console.log('1️⃣ Verificar el archivo CSV:');
    console.log('   • Abre: public/test-data/calificaciones_reales_200.csv');
    console.log('   • Verifica que tenga una columna "calificacion" o "nota"');
    console.log('   • Verifica que tenga valores numéricos (6.5, 7.0, etc.)\n');
    console.log('2️⃣ Volver a cargar el CSV desde Admin > Configuración\n');
    console.log('3️⃣ Si el CSV está correcto, verificar el código de procesamiento\n');

  } else if (hasValidGrades && mostlyNull) {
    console.log('%c⚠️ PROBLEMA: ALGUNOS datos tienen calificaciones, otros NO', 'font-size: 14px; color: #ff9800; font-weight: bold\n');
    console.log('🔍 CAUSA PROBABLE:');
    console.log(`   • ${validNumbers.length + stringNumbers.length} registros SÍ tienen calificación`);
    console.log(`   • ${nullValues.length + emptyStrings.length} registros NO tienen calificación\n`);
    console.log('💡 SOLUCIÓN:\n');
    console.log('1️⃣ Verificar el CSV - puede tener filas incompletas');
    console.log('2️⃣ Filtrar por las secciones que SÍ tienen datos');
    console.log('3️⃣ Completar las calificaciones faltantes en el CSV\n');

  } else if (hasValidGrades && !mostlyNull) {
    console.log('%c✅ LOS DATOS SÍ TIENEN CALIFICACIONES', 'font-size: 14px; color: #4CAF50; font-weight: bold\n');
    console.log('🔍 ESTADÍSTICAS:');
    console.log(`   • ${validNumbers.length + stringNumbers.length} calificaciones válidas`);
    console.log(`   • ${nullValues.length + emptyStrings.length} valores vacíos\n`);

    if (tableRows.length === 0) {
      console.log('⚠️ PERO la tabla está vacía\n');
      console.log('💡 SOLUCIÓN:');
      console.log('   • Selecciona filtros (Nivel, Curso, Sección, Semestre)');
      console.log('   • Verifica que haya datos para esos filtros\n');
    } else if (dashCount > 0) {
      console.log('⚠️ PERO la tabla muestra "—"\n');
      console.log('💡 POSIBLES CAUSAS:');
      console.log('   1. El campo de calificación tiene nombre diferente en el código');
      console.log('   2. El código está buscando un campo que no existe');
      console.log('   3. Los datos no se están asociando correctamente\n');
      console.log('🔧 COMANDO PARA VERIFICAR:');
      console.log('   Ejecuta esto para ver qué datos se están mostrando:\n');
      console.log('   const rows = Array.from(document.querySelectorAll("table tbody tr"));');
      console.log('   const firstStudent = rows[0]?.querySelector("td")?.textContent;');
      console.log('   console.log("Primer estudiante:", firstStudent);\n');
    } else {
      console.log('%c🎉 TODO CORRECTO - Las calificaciones se muestran bien', 'font-size: 14px; color: #4CAF50; font-weight: bold\n');
    }

  } else {
    console.log('%c⚠️ ESTADO INDETERMINADO', 'font-size: 14px; color: #ff9800; font-weight: bold\n');
    console.log('💡 Ejecuta este script de nuevo o reporta el problema\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 7. COMANDO RÁPIDO PARA VER DATOS ESPECÍFICOS
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('%c💡 COMANDOS ÚTILES', 'font-size: 14px; font-weight: bold; color: #9C27B0');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📌 Ver 10 registros con calificación:');
  console.log(`const withGrades = data.filter(d => d.${gradeField});`);
  console.log('console.table(withGrades.slice(0, 10));\n');

  console.log('📌 Ver 10 registros SIN calificación:');
  console.log(`const withoutGrades = data.filter(d => !d.${gradeField});`);
  console.log('console.table(withoutGrades.slice(0, 10));\n');

  console.log('📌 Buscar calificaciones de un curso específico:');
  console.log('const curso = "8vo Básico"; // Cambiar según necesites');
  console.log('const filtered = data.filter(d => d.courseName === curso || d.course_name === curso);');
  console.log('console.table(filtered);\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Diagnóstico completado - ' + new Date().toLocaleTimeString());
  console.log('═══════════════════════════════════════════════════════════\n');

})();
