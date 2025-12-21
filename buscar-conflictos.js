/**
 * 🔍 BUSCAR DATOS DUPLICADOS O CONFLICTIVOS
 */

(function() {
  console.clear();
  console.log('%c🔍 BUSCAR DATOS CONFLICTIVOS', 'font-size: 20px; font-weight: bold; color: #3B82F6');
  console.log('═'.repeat(70) + '\n');

  const year = 2025;

  // Buscar TODAS las claves que contienen "grades"
  const gradesKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('grade') || key.includes('test') || key.includes('califica'))) {
      gradesKeys.push(key);
    }
  }

  console.log(`📋 Claves encontradas relacionadas con calificaciones (${gradesKeys.length}):\n`);
  
  gradesKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (!value) return;
    
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        console.log(`📌 ${key}:`);
        console.log(`   Total elementos: ${parsed.length}`);
        
        if (parsed.length > 0 && parsed[0].sectionId) {
          const sectionIds = new Set(parsed.map(g => g.sectionId));
          const conA = parsed.filter(g => g.sectionId === 'a').length;
          const conUUID = parsed.filter(g => g.sectionId && g.sectionId.includes('-')).length;
          
          console.log(`   SectionIds únicos: ${Array.from(sectionIds).slice(0, 3)}`);
          console.log(`   Con 'a': ${conA}, con UUID: ${conUUID}`);
        }
        console.log('');
      }
    } catch {
      // No es JSON o no es array
    }
  });

  console.log('\n' + '═'.repeat(70));
  console.log('%c💡 RECOMENDACIÓN', 'color: #F59E0B; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(70) + '\n');

  const mainKey = `smart-student-test-grades-${year}`;
  const mainData = JSON.parse(localStorage.getItem(mainKey) || '[]');
  const conA = mainData.filter((g) => g.sectionId === 'a').length;
  
  if (conA === 0) {
    console.log(`✅ La clave principal (${mainKey}) tiene TODOS los UUIDs correctos`);
    console.log('\n🔧 SOLUCIÓN: El problema es que la página no está cargando desde esta clave');
    console.log('   Opción 1: Ctrl+Shift+R (recarga forzada sin caché)');
    console.log('   Opción 2: Cierra y abre el navegador');
    console.log('   Opción 3: Limpia caché del navegador (F12 → Application → Clear storage)');
  } else {
    console.log(`❌ La clave principal (${mainKey}) TODAVÍA tiene ${conA} con sectionId='a'`);
    console.log('   Ejecuta fix-calificaciones-urgente.js de nuevo');
  }

})();
