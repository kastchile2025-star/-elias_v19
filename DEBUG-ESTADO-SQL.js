// COMANDO DE DEBUG - Verificar Estado SQL
// Ejecutar en consola del navegador para ver el estado actual

(function debugSQLState() {
  console.log('🔍 VERIFICANDO ESTADO DEL SISTEMA SQL...');
  
  // 1. Verificar datos SQL almacenados
  const sqlKey = 'smart-student-sql-grades';
  const sqlData = localStorage.getItem(sqlKey);
  
  if (sqlData) {
    try {
      const parsed = JSON.parse(sqlData);
      const size = new Blob([sqlData]).size;
      console.log(`📊 Datos SQL encontrados:`);
      console.log(`   - Registros: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
      console.log(`   - Tamaño: ${(size/1024).toFixed(1)}KB`);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`   - Primer registro:`, parsed[0]);
        
        // Verificar años disponibles
        const years = [...new Set(parsed.map(g => g.year))];
        console.log(`   - Años disponibles:`, years);
        
        // Contar por año
        years.forEach(year => {
          const count = parsed.filter(g => g.year === year).length;
          console.log(`   - Año ${year}: ${count} registros`);
        });
      }
    } catch (e) {
      console.error('❌ Error parseando datos SQL:', e.message);
    }
  } else {
    console.log('❌ No hay datos SQL almacenados');
  }
  
  // 2. Verificar datos de calificaciones en la UI
  const currentGrades = document.querySelector('[data-testid="grades-table"]') || 
                        document.querySelector('table') ||
                        document.querySelector('.table');
  
  if (currentGrades) {
    const rows = currentGrades.querySelectorAll('tbody tr');
    console.log(`📋 Tabla de calificaciones encontrada: ${rows.length} filas visibles`);
  } else {
    console.log('❌ No se encontró tabla de calificaciones en la UI');
  }
  
  // 3. Verificar localStorage de calificaciones
  const currentYear = new Date().getFullYear();
  const localKey = `smart-student-test-grades-${currentYear}`;
  const localData = localStorage.getItem(localKey);
  
  if (localData) {
    try {
      const localGrades = JSON.parse(localData);
      console.log(`📁 LocalStorage calificaciones ${currentYear}: ${Array.isArray(localGrades) ? localGrades.length : 'N/A'} registros`);
    } catch (e) {
      console.error('❌ Error parseando localStorage calificaciones');
    }
  } else {
    console.log(`❌ No hay calificaciones en localStorage para ${currentYear}`);
  }
  
  // 4. Verificar eventos del sistema
  console.log(`🎯 Para probar sincronización, ejecuta:`);
  console.log(`   window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {detail: {year: ${currentYear}}}));`);
  
  // 5. Mostrar resumen
  console.log(`
📋 RESUMEN DEL ESTADO:
- SQL Data: ${sqlData ? '✅' : '❌'}
- UI Table: ${currentGrades ? '✅' : '❌'}  
- LocalStorage: ${localData ? '✅' : '❌'}

🔧 ACCIONES SUGERIDAS:
1. Si hay datos SQL pero no aparecen en la UI, refrescar la página
2. Si no hay datos SQL, realizar carga masiva desde Configuración
3. Verificar que el año seleccionado coincida con los datos
  `);
  
})();