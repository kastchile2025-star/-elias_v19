// COMANDO DE EMERGENCIA - LIMPIEZA DE ALMACENAMIENTO
// Copia y pega este código en la consola del navegador si tienes problemas de almacenamiento

(function() {
  console.log('🚨 INICIANDO LIMPIEZA DE EMERGENCIA DE ALMACENAMIENTO...');
  
  // 1. Mostrar uso actual de almacenamiento
  const getAllStorageSize = () => {
    let total = 0;
    const details = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = new Blob([localStorage[key]]).size;
        total += size;
        details.push({ key, size: (size / 1024).toFixed(1) + 'KB' });
      }
    }
    
    return { total: (total / 1024).toFixed(1) + 'KB', details };
  };
  
  const before = getAllStorageSize();
  console.log('📊 ANTES - Uso total de localStorage:', before.total);
  console.table(before.details.sort((a, b) => parseFloat(b.size) - parseFloat(a.size)));
  
  // 2. Limpiar datos temporales y de caché
  const tempKeys = Object.keys(localStorage).filter(key => 
    key.includes('temp') || 
    key.includes('demo') || 
    key.includes('cache') ||
    key.includes('_backup') ||
    key.includes('session') ||
    key.startsWith('debug-') ||
    key.startsWith('test-')
  );
  
  console.log('🗑️ Eliminando datos temporales:', tempKeys);
  tempKeys.forEach(key => localStorage.removeItem(key));
  
  // 3. Comprimir datos SQL existentes
  const sqlKey = 'smart-student-sql-grades';
  const sqlData = localStorage.getItem(sqlKey);
  if (sqlData) {
    try {
      const parsed = JSON.parse(sqlData);
      if (Array.isArray(parsed)) {
        console.log(`📦 Comprimiendo ${parsed.length} registros SQL...`);
        
        // Comprimir eliminando espacios
        const compressed = JSON.stringify(parsed);
        const originalSize = new Blob([sqlData]).size;
        const compressedSize = new Blob([compressed]).size;
        
        localStorage.setItem(sqlKey, compressed);
        
        console.log(`✅ SQL comprimido: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB`);
      }
    } catch (e) {
      console.error('❌ Error comprimiendo datos SQL:', e);
    }
  }
  
  // 4. Limpiar sessionStorage también
  const sessionKeys = Object.keys(sessionStorage);
  console.log('🗑️ Limpiando sessionStorage:', sessionKeys);
  sessionStorage.clear();
  
  // 5. Mostrar resultado final
  const after = getAllStorageSize();
  console.log('📊 DESPUÉS - Uso total de localStorage:', after.total);
  console.log(`✅ Liberado: ${(parseFloat(before.total) - parseFloat(after.total)).toFixed(1)}KB`);
  
  // 6. Sugerencias adicionales
  console.log(`
🔧 COMANDOS ADICIONALES DISPONIBLES:

// Ver datos SQL actuales:
JSON.parse(localStorage.getItem('smart-student-sql-grades') || '[]').length

// Eliminar SOLO datos SQL (mantener otros datos):
localStorage.removeItem('smart-student-sql-grades')

// Backup de datos SQL antes de eliminar:
const backup = localStorage.getItem('smart-student-sql-grades')
console.log('Backup guardado en variable "backup"')

// Restaurar desde backup:
localStorage.setItem('smart-student-sql-grades', backup)

// Ver top 10 elementos más grandes:
Object.keys(localStorage).map(key => ({
  key, 
  size: new Blob([localStorage[key]]).size
})).sort((a,b) => b.size - a.size).slice(0,10)
  `);
  
  console.log('✅ LIMPIEZA COMPLETADA');
})();