// COMANDO INMEDIATO - Limpiar Backups y Liberar Espacio
// Ejecutar inmediatamente en la consola del navegador

(function() {
  console.log('🚨 LIMPIEZA INMEDIATA DE BACKUPS Y DATOS GRANDES...');
  
  // 1. Eliminar todos los backups existentes
  const backupKeys = Object.keys(localStorage).filter(key => 
    key.includes('_backup') || key.includes('backup_')
  );
  
  console.log(`🗑️ Eliminando ${backupKeys.length} archivos de backup...`);
  let totalFreed = 0;
  
  backupKeys.forEach(key => {
    const size = new Blob([localStorage[key] || '']).size;
    totalFreed += size;
    console.log(`🗑️ Eliminando: ${key} (${(size/1024).toFixed(1)}KB)`);
    localStorage.removeItem(key);
  });
  
  // 2. Eliminar datos grandes (>500KB)
  const largeKeys = Object.keys(localStorage).filter(key => {
    const size = new Blob([localStorage[key] || '']).size;
    return size > 500 * 1024 && key !== 'smart-student-sql-grades'; // Mantener SQL principal
  });
  
  console.log(`🗑️ Eliminando ${largeKeys.length} archivos grandes...`);
  largeKeys.forEach(key => {
    const size = new Blob([localStorage[key] || '']).size;
    totalFreed += size;
    console.log(`🗑️ Eliminando grande: ${key} (${(size/1024).toFixed(1)}KB)`);
    localStorage.removeItem(key);
  });
  
  // 3. Limpiar datos temporales
  const tempKeys = Object.keys(localStorage).filter(key => 
    key.includes('temp') || 
    key.includes('demo') || 
    key.includes('cache') ||
    key.includes('debug') ||
    key.includes('test-') ||
    key.startsWith('temp')
  );
  
  console.log(`🗑️ Eliminando ${tempKeys.length} archivos temporales...`);
  tempKeys.forEach(key => {
    const size = new Blob([localStorage[key] || '']).size;
    totalFreed += size;
    localStorage.removeItem(key);
  });
  
  // 4. Limpiar sessionStorage completamente
  const sessionSize = Object.keys(sessionStorage).reduce((total, key) => 
    total + new Blob([sessionStorage[key] || '']).size, 0);
  
  if (sessionSize > 0) {
    console.log(`🗑️ Limpiando sessionStorage: ${(sessionSize/1024).toFixed(1)}KB`);
    sessionStorage.clear();
    totalFreed += sessionSize;
  }
  
  // 5. Mostrar espacio liberado
  console.log(`✅ LIMPIEZA COMPLETADA`);
  console.log(`📊 Espacio liberado: ${(totalFreed/1024/1024).toFixed(2)}MB`);
  
  // 6. Mostrar estado actual
  const currentUsage = Object.keys(localStorage).reduce((total, key) => 
    total + new Blob([localStorage[key] || '']).size, 0);
  
  console.log(`📊 Uso actual de localStorage: ${(currentUsage/1024/1024).toFixed(2)}MB`);
  
  // 7. Verificar datos SQL
  const sqlData = localStorage.getItem('smart-student-sql-grades');
  if (sqlData) {
    try {
      const parsed = JSON.parse(sqlData);
      const sqlSize = new Blob([sqlData]).size;
      console.log(`📊 Datos SQL: ${Array.isArray(parsed) ? parsed.length : 0} registros (${(sqlSize/1024).toFixed(1)}KB)`);
    } catch (e) {
      console.log('❌ Error verificando datos SQL:', e.message);
    }
  } else {
    console.log('📊 No hay datos SQL almacenados');
  }
  
  console.log(`
🔧 RECOMENDACIONES:
1. Ahora puedes intentar la carga/eliminación SQL nuevamente
2. Si persiste el error, considera dividir los datos en lotes más pequeños
3. El sistema ahora es más agresivo limpiando automáticamente
4. Los backups automáticos han sido deshabilitados para evitar duplicar el uso de memoria
  `);
  
})();