// Script para probar el zoom del gráfico de asistencia
// Ejecutar en la consola del navegador en la página de estadísticas

console.log('=== PRUEBA DE ZOOM EN GRÁFICO DE ASISTENCIA ===');

// Verificar mes actual
const currentMonth = new Date().getMonth();
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
console.log(`Mes actual: ${monthNames[currentMonth]} (${currentMonth})`);

// Calcular rango de zoom
const zoomStart = Math.max(0, currentMonth - 1);
const zoomEnd = Math.min(11, currentMonth + 1);
console.log(`Rango de zoom: ${monthNames[zoomStart]} - ${monthNames[zoomEnd]} (${zoomStart}-${zoomEnd})`);

// Verificar que el botón de zoom esté presente
const zoomButton = document.querySelector('button[title*="Zoom"]');
if (zoomButton) {
  console.log('✅ Botón de zoom encontrado');
  console.log('Estado actual:', zoomButton.title);
} else {
  console.log('❌ Botón de zoom no encontrado');
}

// Simular clic en el botón de zoom
if (zoomButton) {
  console.log('Simulando clic en botón de zoom...');
  zoomButton.click();
  
  setTimeout(() => {
    console.log('Estado después del zoom:', zoomButton.title);
  }, 100);
}

console.log('=== FIN DE PRUEBA ===');