// Script para sincronizar calificaciones de Firebase a localStorage
// Ejecutar en consola del navegador

(async function() {
  console.log('🔄 Sincronizando calificaciones de Firebase a localStorage...');
  
  try {
    // Obtener el año actual
    const year = Number(localStorage.getItem('admin-selected-year')) || new Date().getFullYear();
    console.log(`📅 Año seleccionado: ${year}`);
    
    // Ver cuántas calificaciones hay en localStorage
    const lsKey = `smart-student-test-grades-${year}`;
    const existingLS = localStorage.getItem(lsKey);
    let existingGrades = [];
    
    try {
      existingGrades = existingLS ? JSON.parse(existingLS) : [];
    } catch (e) {
      console.warn('⚠️ Error parseando localStorage:', e);
    }
    
    console.log(`📊 Calificaciones en localStorage: ${existingGrades.length}`);
    
    // Si ya hay datos en localStorage, mostrar info
    if (existingGrades.length > 0) {
      console.log('✅ Ya hay datos en localStorage. Primeros 3:');
      console.log(existingGrades.slice(0, 3).map(g => ({
        title: g.title,
        studentName: g.studentName,
        score: g.score || g.grade
      })));
      
      console.log('\n💡 Para forzar recarga desde Firebase, ejecuta:');
      console.log('localStorage.removeItem("smart-student-test-grades-' + year + '")');
      console.log('location.reload()');
    } else {
      console.log('⚠️ localStorage vacío. Los datos deberían cargarse automáticamente desde Firebase.');
      console.log('Si Firebase tiene cuota agotada, necesitas esperar o usar datos locales.');
    }
    
  } catch (e) {
    console.error('❌ Error:', e);
  }
})();
