/**
 * 🔍 DIAGNÓSTICO DE CALIFICACIONES
 * 
 * Ejecuta este script en la consola del navegador (F12) para diagnosticar
 * por qué no aparecen las calificaciones después de la carga masiva.
 * 
 * CÓMO USAR:
 * 1. Abre el navegador en la página de Calificaciones
 * 2. Presiona F12 para abrir DevTools
 * 3. Ve a la pestaña "Console"
 * 4. Copia y pega todo este código
 * 5. Presiona Enter
 */

(function diagnosticarCalificaciones() {
  console.clear();
  console.log('%c🔍 DIAGNÓSTICO DE CALIFICACIONES', 'background: #4F46E5; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('');
  
  const year = 2025;
  const results = {
    localStorage: null,
    sessionStorage: null,
    total: 0,
    porCurso: {},
    porAsignatura: {},
    estudiantes: new Set(),
    problemas: []
  };
  
  // 1. Verificar LocalStorage
  console.log('%c📦 1. VERIFICANDO LOCALSTORAGE', 'background: #059669; color: white; padding: 5px; font-weight: bold;');
  try {
    const lsKey = `smart-student-test-grades-${year}`;
    const lsData = localStorage.getItem(lsKey);
    
    if (!lsData) {
      console.log(`   ❌ No hay datos en localStorage para clave: ${lsKey}`);
      results.problemas.push('LocalStorage vacío - este es el problema principal');
    } else {
      const grades = JSON.parse(lsData);
      results.localStorage = grades.length;
      console.log(`   ✅ LocalStorage contiene ${grades.length} calificaciones`);
      
      // Analizar por curso
      grades.forEach(g => {
        const curso = g.course || g.courseName || 'Sin curso';
        results.porCurso[curso] = (results.porCurso[curso] || 0) + 1;
        
        const asignatura = g.subject || g.subjectName || 'Sin asignatura';
        results.porAsignatura[asignatura] = (results.porAsignatura[asignatura] || 0) + 1;
        
        if (g.studentId || g.studentRut) {
          results.estudiantes.add(g.studentId || g.studentRut);
        }
      });
      
      console.log(`   📊 Distribución por curso:`, results.porCurso);
      console.log(`   📊 Distribución por asignatura:`, results.porAsignatura);
      console.log(`   👥 Estudiantes únicos: ${results.estudiantes.size}`);
    }
  } catch (error) {
    console.error('   ❌ Error al leer localStorage:', error);
    results.problemas.push('Error al parsear localStorage: ' + error.message);
  }
  
  // 2. Verificar SessionStorage
  console.log('');
  console.log('%c📦 2. VERIFICANDO SESSIONSTORAGE', 'background: #059669; color: white; padding: 5px; font-weight: bold;');
  try {
    const ssKey = `smart-student-test-grades-${year}`;
    const ssData = sessionStorage.getItem(ssKey);
    
    if (!ssData) {
      console.log(`   ⚠️  No hay datos en sessionStorage`);
    } else {
      const grades = JSON.parse(ssData);
      results.sessionStorage = grades.length;
      console.log(`   ✅ SessionStorage contiene ${grades.length} calificaciones`);
    }
  } catch (error) {
    console.log('   ⚠️  Error al leer sessionStorage:', error.message);
  }
  
  // 3. Verificar configuración del año
  console.log('');
  console.log('%c📅 3. VERIFICANDO AÑO SELECCIONADO', 'background: #059669; color: white; padding: 5px; font-weight: bold;');
  const selectedYear = localStorage.getItem('admin-selected-year');
  console.log(`   📅 Año en admin-selected-year: ${selectedYear || 'No configurado'}`);
  
  if (selectedYear != year) {
    results.problemas.push(`Año seleccionado (${selectedYear}) no coincide con año de calificaciones (${year})`);
  }
  
  // 4. Verificar otros años
  console.log('');
  console.log('%c📚 4. VERIFICANDO OTROS AÑOS', 'background: #059669; color: white; padding: 5px; font-weight: bold;');
  const otrosAnios = [];
  for (let y = 2020; y <= 2030; y++) {
    const key = `smart-student-test-grades-${y}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const count = JSON.parse(data).length;
        otrosAnios.push({ year: y, count });
      } catch {}
    }
  }
  
  if (otrosAnios.length > 0) {
    console.log('   📊 Calificaciones encontradas en otros años:');
    otrosAnios.forEach(({ year, count }) => {
      console.log(`      • ${year}: ${count} calificaciones`);
    });
  } else {
    console.log('   ⚠️  No se encontraron calificaciones en ningún año');
  }
  
  // 5. RESUMEN Y SOLUCIONES
  console.log('');
  console.log('%c📋 5. RESUMEN DEL DIAGNÓSTICO', 'background: #DC2626; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
  console.log('');
  
  results.total = results.localStorage || 0;
  
  if (results.total === 0) {
    console.log('%c❌ PROBLEMA CONFIRMADO: No hay calificaciones en LocalStorage', 'color: #DC2626; font-weight: bold; font-size: 14px;');
    console.log('');
    console.log('%c✅ SOLUCIÓN:', 'color: #059669; font-weight: bold; font-size: 14px;');
    console.log('');
    console.log('   1. El código ya fue corregido para guardar en LocalStorage automáticamente');
    console.log('   2. DEBES VOLVER A CARGAR EL ARCHIVO CSV desde Admin → Configuración');
    console.log('   3. Después de la carga, las calificaciones aparecerán en la página Calificaciones');
    console.log('');
    console.log('%c📝 PASOS A SEGUIR:', 'color: #7C3AED; font-weight: bold;');
    console.log('');
    console.log('   1. Ve a: Administrador → Gestión de Usuarios → Configuración');
    console.log('   2. En "Calificaciones SQL", haz clic en "Seleccionar archivo CSV"');
    console.log('   3. Selecciona: grades-consolidated-2025.csv');
    console.log('   4. Espera a que termine la carga (verás el progreso)');
    console.log('   5. Ve a: Calificaciones');
    console.log('   6. Selecciona: 1ro Básico A → Matemáticas → 2do Semestre');
    console.log('   7. Deberías ver a Sofía González González con sus notas');
    console.log('');
  } else {
    console.log('%c✅ LocalStorage contiene calificaciones', 'color: #059669; font-weight: bold; font-size: 14px;');
    console.log('');
    console.log(`   Total: ${results.total} calificaciones`);
    console.log(`   Estudiantes: ${results.estudiantes.size}`);
    console.log(`   Cursos: ${Object.keys(results.porCurso).length}`);
    console.log(`   Asignaturas: ${Object.keys(results.porAsignatura).length}`);
    console.log('');
    
    if (results.problemas.length > 0) {
      console.log('%c⚠️  PROBLEMAS DETECTADOS:', 'color: #D97706; font-weight: bold;');
      results.problemas.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p}`);
      });
    }
  }
  
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6B7280;');
  
  return results;
})();
