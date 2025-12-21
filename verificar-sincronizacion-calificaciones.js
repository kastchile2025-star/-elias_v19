/**
 * 🔍 VERIFICACIÓN RÁPIDA: Sincronización Carga Masiva → Pestaña Calificaciones
 * 
 * PROPÓSITO:
 * Este script verifica que el sistema de sincronización automática esté funcionando correctamente.
 * 
 * USO:
 * 1. Abre la consola del navegador (F12) en cualquier pestaña
 * 2. Copia y pega este script completo
 * 3. Presiona Enter
 * 4. Lee el diagnóstico completo
 * 
 * CUÁNDO USAR:
 * - Después de realizar una carga masiva
 * - Si las calificaciones no aparecen en la pestaña
 * - Para verificar el estado del sistema
 */

(function verificarSincronizacionCalificaciones() {
  console.clear();
  console.log('🔍 ════════════════════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN: Sincronización Carga Masiva → Calificaciones');
  console.log('🔍 ════════════════════════════════════════════════════════\n');

  // ═══════════════════════════════════════════════════════════
  // 1. CONFIGURACIÓN Y ESTADO ACTUAL
  // ═══════════════════════════════════════════════════════════
  console.log('📋 1. CONFIGURACIÓN ACTUAL:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const year = Number(localStorage.getItem('admin-selected-year')) || new Date().getFullYear();
  const gradesKey = `smart-student-test-grades-${year}`;
  const activitiesKey = `smart-student-activities-${year}`;
  
  console.log(`   📅 Año seleccionado: ${year}`);
  console.log(`   🔑 Clave de calificaciones: "${gradesKey}"`);
  console.log(`   🔑 Clave de actividades: "${activitiesKey}"`);
  
  // ═══════════════════════════════════════════════════════════
  // 2. VERIFICAR DATOS EN LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════
  console.log('\n📦 2. DATOS EN LOCALSTORAGE (CACHÉ):');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  let grades = [];
  let activities = [];
  
  try {
    const gradesRaw = localStorage.getItem(gradesKey);
    grades = gradesRaw ? JSON.parse(gradesRaw) : [];
    console.log(`   ✅ Calificaciones: ${grades.length} registros`);
    
    if (grades.length > 0) {
      const sample = grades[0];
      console.log(`   📝 Muestra de datos:`);
      console.log(`      • ID: ${sample.id || 'N/A'}`);
      console.log(`      • Estudiante: ${sample.studentName || 'N/A'}`);
      console.log(`      • Nota: ${sample.score || 'N/A'}`);
      console.log(`      • Tipo: ${sample.type || sample.taskType || 'N/A'}`);
      console.log(`      • Fecha: ${sample.gradedAt ? new Date(sample.gradedAt).toLocaleDateString() : 'N/A'}`);
    } else {
      console.log(`   ⚠️ NO hay calificaciones en caché`);
    }
  } catch (e) {
    console.error(`   ❌ Error al leer calificaciones:`, e.message);
  }
  
  try {
    const activitiesRaw = localStorage.getItem(activitiesKey);
    activities = activitiesRaw ? JSON.parse(activitiesRaw) : [];
    console.log(`   ✅ Actividades: ${activities.length} registros`);
  } catch (e) {
    console.log(`   ⚠️ No se pudieron leer actividades:`, e.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 3. VERIFICAR ESTRUCTURA DE LA PÁGINA ACTUAL
  // ═══════════════════════════════════════════════════════════
  console.log('\n🖥️ 3. ESTADO DE LA UI:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const isCalificacionesPage = window.location.pathname.includes('calificaciones');
  console.log(`   📍 Página actual: ${window.location.pathname}`);
  console.log(`   ${isCalificacionesPage ? '✅' : '⚠️'} ${isCalificacionesPage ? 'Estás en la pestaña Calificaciones' : 'No estás en la pestaña Calificaciones'}`);
  
  if (isCalificacionesPage) {
    // Verificar elementos visibles
    const badges = document.querySelectorAll('[class*="badge"]');
    const tableRows = document.querySelectorAll('table tbody tr');
    const cards = document.querySelectorAll('[class*="card"]');
    
    console.log(`   📊 Elementos detectados:`);
    console.log(`      • Badges: ${badges.length}`);
    console.log(`      • Filas en tabla: ${tableRows.length}`);
    console.log(`      • Cards: ${cards.length}`);
    
    if (tableRows.length === 0 && grades.length > 0) {
      console.log(`\n   ⚠️ PROBLEMA DETECTADO:`);
      console.log(`      Hay ${grades.length} calificaciones en caché pero 0 filas en la tabla.`);
      console.log(`      Esto puede deberse a:`);
      console.log(`      1. Filtros muy restrictivos (nivel/semestre/curso/sección)`);
      console.log(`      2. Permisos de rol (profesor/estudiante)`);
      console.log(`      3. Datos no sincronizados correctamente`);
    } else if (tableRows.length > 0) {
      console.log(`\n   ✅ La tabla muestra ${tableRows.length} filas`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // 4. VERIFICAR EVENTOS REGISTRADOS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔔 4. SISTEMA DE EVENTOS:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const eventosEsperados = [
    'sqlGradesUpdated',
    'sqlActivitiesUpdated',
    'dataImported',
    'dataUpdated',
    'storage'
  ];
  
  console.log(`   📋 Eventos que debe escuchar la pestaña Calificaciones:`);
  eventosEsperados.forEach(evento => {
    console.log(`      • ${evento}`);
  });
  
  console.log(`\n   ℹ️ Los listeners se registran cuando se carga la página`);
  console.log(`      Si acabas de cargar datos, la página ya debería haberlos detectado.`);
  
  // ═══════════════════════════════════════════════════════════
  // 5. PRUEBA DE SINCRONIZACIÓN MANUAL
  // ═══════════════════════════════════════════════════════════
  console.log('\n🧪 5. PRUEBA DE SINCRONIZACIÓN:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  if (isCalificacionesPage) {
    console.log(`   🚀 Forzando recarga de calificaciones...`);
    
    try {
      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
        detail: { 
          year: year, 
          timestamp: Date.now(),
          source: 'manual-test',
          count: grades.length
        } 
      }));
      
      console.log(`   ✅ Evento 'sqlGradesUpdated' disparado correctamente`);
      console.log(`   ⏳ Esperando respuesta del sistema...`);
      console.log(`      (Verifica la consola en los próximos segundos)`);
      
      // Programar verificación
      setTimeout(() => {
        console.log(`\n   📊 RESULTADO DE LA PRUEBA:`);
        const newTableRows = document.querySelectorAll('table tbody tr');
        
        if (newTableRows.length > 0) {
          console.log(`   ✅ ÉXITO: La tabla ahora muestra ${newTableRows.length} filas`);
        } else if (grades.length === 0) {
          console.log(`   ⚠️ NO HAY DATOS: El caché está vacío`);
          console.log(`      Necesitas cargar calificaciones desde Admin > Configuración`);
        } else {
          console.log(`   ⚠️ PROBLEMA: Hay datos pero no se muestran`);
          console.log(`      Posibles causas:`);
          console.log(`      1. Filtros demasiado restrictivos`);
          console.log(`      2. Permisos de rol limitando la vista`);
          console.log(`      3. Error en el listener o handler`);
        }
      }, 2000);
      
    } catch (e) {
      console.error(`   ❌ Error al disparar evento:`, e.message);
    }
  } else {
    console.log(`   ℹ️ No estás en la pestaña Calificaciones`);
    console.log(`      Ve a la pestaña Calificaciones y ejecuta este script de nuevo.`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 6. RESUMEN Y ACCIONES SUGERIDAS
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 6. RESUMEN Y ACCIONES:');
  console.log('   ═════════════════════════════════════════════════════\n');
  
  if (grades.length === 0) {
    console.log(`   ❌ PROBLEMA: No hay calificaciones en el sistema`);
    console.log(`\n   💡 SOLUCIÓN:`);
    console.log(`      1. Ve a Admin > Configuración`);
    console.log(`      2. Busca "Carga masiva: Calificaciones (SQL)"`);
    console.log(`      3. Descarga la plantilla CSV`);
    console.log(`      4. Llena la plantilla con datos`);
    console.log(`      5. Sube el archivo`);
    console.log(`      6. Espera a que termine el proceso`);
    console.log(`      7. Vuelve a la pestaña Calificaciones`);
  } else if (!isCalificacionesPage) {
    console.log(`   ℹ️ ACCIÓN REQUERIDA:`);
    console.log(`      Navega a la pestaña Calificaciones para verificar la sincronización.`);
  } else {
    const tableRows = document.querySelectorAll('table tbody tr');
    
    if (tableRows.length > 0) {
      console.log(`   ✅ SISTEMA FUNCIONANDO CORRECTAMENTE`);
      console.log(`\n   📊 Estado:`);
      console.log(`      • ${grades.length} calificaciones en caché`);
      console.log(`      • ${tableRows.length} filas visibles en tabla`);
      console.log(`      • Sincronización: OK`);
    } else {
      console.log(`   ⚠️ POSIBLE PROBLEMA DE FILTROS`);
      console.log(`\n   💡 SOLUCIÓN:`);
      console.log(`      1. Verifica los filtros de la página:`);
      console.log(`         • Nivel (Básica/Media): ¿Está seleccionado?`);
      console.log(`         • Semestre (1er/2do): ¿Está seleccionado?`);
      console.log(`         • Curso: ¿Hay uno seleccionado?`);
      console.log(`         • Sección: ¿Hay una seleccionada?`);
      console.log(`      2. Prueba seleccionar "Todos" en cada filtro`);
      console.log(`      3. Si eres profesor, verifica tus asignaciones en Gestión de Usuarios`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // 7. COMANDOS ÚTILES
  // ═══════════════════════════════════════════════════════════
  console.log('\n🛠️ 7. COMANDOS ÚTILES:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  console.log(`   📋 Ver todas las calificaciones en caché:`);
  console.log(`      console.table(JSON.parse(localStorage.getItem('${gradesKey}') || '[]'))`);
  
  console.log(`\n   🔄 Forzar recarga manual:`);
  console.log(`      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { detail: { year: ${year}, timestamp: Date.now() } }))`);
  
  console.log(`\n   🗑️ Limpiar caché (para probar carga desde SQL):`);
  console.log(`      localStorage.removeItem('${gradesKey}')`);
  
  console.log(`\n   📊 Ver contadores del sistema:`);
  console.log(`      Object.keys(localStorage).filter(k => k.includes('grade')).forEach(k => console.log(k + ':', localStorage.getItem(k)?.length || 0))`);
  
  console.log('\n🔍 ════════════════════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN COMPLETADA');
  console.log('🔍 ════════════════════════════════════════════════════════\n');
  
  // Retornar objeto útil para inspección
  return {
    year,
    gradesCount: grades.length,
    activitiesCount: activities.length,
    isCalificacionesPage,
    tableRows: isCalificacionesPage ? document.querySelectorAll('table tbody tr').length : 'N/A',
    grades: grades.slice(0, 5), // Muestra primeras 5
    forzarRecarga: () => {
      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
        detail: { year, timestamp: Date.now(), source: 'manual' } 
      }));
      console.log('✅ Evento disparado. Verifica la consola en 2 segundos.');
    }
  };
})();
