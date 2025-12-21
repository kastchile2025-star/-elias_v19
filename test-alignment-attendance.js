// Script para verificar alineación del gráfico de asistencia
// Ejecutar en la consola del navegador en la página de estadísticas

console.log('=== VERIFICACIÓN DE ALINEACIÓN - GRÁFICO ASISTENCIA ===');

// Verificar que ambas series tengan la misma longitud
setTimeout(() => {
  // Buscar todos los SVG paths en el gráfico de asistencia
  const attendanceCharts = document.querySelectorAll('[data-section] svg path[d*="M"]');
  
  if (attendanceCharts.length > 0) {
    console.log(`✅ Encontrados ${attendanceCharts.length} gráficos de líneas`);
    
    attendanceCharts.forEach((path, index) => {
      const d = path.getAttribute('d');
      if (d) {
        // Contar puntos de datos en el path
        const moveCommands = (d.match(/M\s*[\d\.]*/g) || []).length;
        const curveCommands = (d.match(/C\s*[\d\.,\s]*/g) || []).length;
        
        console.log(`Gráfico ${index + 1}:`, {
          pathLength: d.length,
          moveCommands,
          curveCommands,
          startsAt: d.substring(0, 50) + '...',
          color: path.getAttribute('stroke')
        });
      }
    });
  } else {
    console.log('❌ No se encontraron gráficos de líneas');
  }
  
  // Verificar etiquetas de meses
  const monthLabels = document.querySelectorAll('.text-\\[10px\\]');
  console.log(`Etiquetas de meses encontradas: ${monthLabels.length}`);
  
  if (monthLabels.length > 0) {
    const positions = Array.from(monthLabels).map(label => ({
      text: label.textContent,
      left: label.style.left,
      position: label.getBoundingClientRect().left
    }));
    
    console.log('Posiciones de etiquetas:', positions);
  }
  
}, 1000);

console.log('=== FIN DE VERIFICACIÓN ===');