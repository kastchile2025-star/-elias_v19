// SCRIPT PARA CONSOLA DEL NAVEGADOR - Copiar datos de 2024 a 2025
// Ejecuta este código en la consola del navegador (F12 > Consola)

(function() {
  console.log('🔄 Iniciando copia de datos de 2024 a 2025...');
  
  // Función para copiar datos de un año a otro
  function copyYearData(keyBase, fromYear, toYear) {
    const fromKey = `${keyBase}-${fromYear}`;
    const toKey = `${keyBase}-${toYear}`;
    
    try {
      const data = localStorage.getItem(fromKey);
      if (data) {
        // Adaptar fechas del año anterior al año actual
        let parsedData = JSON.parse(data);
        
        // Función recursiva para adaptar fechas
        function adaptDates(obj) {
          if (Array.isArray(obj)) {
            return obj.map(adaptDates);
          } else if (obj && typeof obj === 'object') {
            const adapted = {};
            for (const [key, value] of Object.entries(obj)) {
              if (['createdAt', 'updatedAt', 'when', 'date', 'timestamp', 'submittedAt'].includes(key)) {
                // Adaptar fechas
                if (typeof value === 'number') {
                  const date = new Date(value);
                  date.setFullYear(toYear);
                  adapted[key] = date.getTime();
                } else if (typeof value === 'string' && value.includes('2024')) {
                  adapted[key] = value.replace(/2024/g, toYear.toString());
                } else {
                  adapted[key] = value;
                }
              } else if (typeof value === 'string' && value.includes('2024')) {
                adapted[key] = value.replace(/2024/g, toYear.toString());
              } else {
                adapted[key] = adaptDates(value);
              }
            }
            return adapted;
          } else {
            return obj;
          }
        }
        
        const adaptedData = adaptDates(parsedData);
        localStorage.setItem(toKey, JSON.stringify(adaptedData));
        console.log(`✅ Copiados ${Array.isArray(adaptedData) ? adaptedData.length : 'datos'} registros de ${fromKey} a ${toKey}`);
        return true;
      } else {
        console.log(`⚠️ No se encontraron datos en ${fromKey}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error copiando ${fromKey}:`, error);
      return false;
    }
  }
  
  // Copiar los principales tipos de datos
  const keysToCopy = [
    'smart-student-submissions',
    'smart-student-tasks', 
    'smart-student-attendance',
    'smart-student-admin-courses',
    'smart-student-admin-sections'
  ];
  
  let successCount = 0;
  
  keysToCopy.forEach(key => {
    if (copyYearData(key, 2024, 2025)) {
      successCount++;
    }
  });
  
  console.log(`🎉 Proceso completado. ${successCount}/${keysToCopy.length} tipos de datos copiados exitosamente.`);
  console.log('🔄 Recarga la página para ver los cambios en el gráfico de comparación.');
  
  // Mostrar resumen de datos creados
  console.log('\n📊 Resumen de datos para 2025:');
  keysToCopy.forEach(key => {
    const data = localStorage.getItem(`${key}-2025`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        console.log(`  • ${key}-2025: ${count} registros`);
      } catch {}
    }
  });
})();

// Para ejecutar manualmente: copia y pega todo este código en la consola del navegador
