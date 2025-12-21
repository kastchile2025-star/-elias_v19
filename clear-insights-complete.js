// Script para limpiar completamente todos los insights del localStorage
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando insights del sistema...');

// Limpiar insights específicos
const insightKeys = [
  'smart-student-insights',
  'smart-student-ai-insights', 
  'insights-cache',
  'fallback-insights'
];

insightKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
  }
});

// Limpiar cualquier cosa que contenga "insight" en el nombre
let removedCount = 0;
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key && key.toLowerCase().includes('insight')) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
    removedCount++;
  }
}

console.log(`🎯 Limpieza completa: ${removedCount} elementos de insights eliminados`);
console.log('🔄 Recarga la página para verificar que no aparezcan insights falsos');