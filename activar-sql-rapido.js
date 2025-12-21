// 🚀 SOLUCIÓN RÁPIDA: Activar SQL inmediatamente
// Ejecutar en la consola del navegador (F12) en Admin → Configuración

console.log('🔧 ACTIVANDO SQL...');
console.log('=' .repeat(60));

(async () => {
  try {
    // 1. Verificar estado actual
    console.log('\n📊 1. Verificando estado actual...');
    const { isSQLConnected, getSQLStatus, initializeSQL } = await import('/src/lib/sql-init.ts');
    const { isSupabaseEnabled, setForceIDB } = await import('/src/lib/sql-config.ts');
    const { sqlDatabase } = await import('/src/lib/sql-database.ts');
    
    console.log('   Estado SQL:', getSQLStatus());
    console.log('   Conectado:', isSQLConnected() ? '✅' : '❌');
    console.log('   Supabase habilitado:', isSupabaseEnabled() ? '✅' : '❌');
    
    // 2. Determinar estrategia
    const hasSupabaseVars = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (hasSupabaseVars) {
      console.log('\n🔌 2. Detectado: Variables de Supabase configuradas');
      console.log('   Intentando conectar a Supabase...');
      
      // Probar conexión a Supabase
      const result = await sqlDatabase.testConnection();
      
      if (result.success) {
        console.log('   ✅ Supabase conectado correctamente');
        
        // Forzar reinicialización
        setForceIDB(false);
        await initializeSQL(true);
        
        console.log('\n✅ SQL ACTIVADO CON SUPABASE');
        console.log('   Recargando página en 2 segundos...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        console.warn('   ⚠️ Supabase no disponible:', result.error);
        console.log('\n💡 Cambiando a IndexedDB (almacenamiento local)...');
        
        setForceIDB(true);
        await initializeSQL(true);
        
        console.log('\n✅ SQL ACTIVADO CON INDEXEDDB');
        console.log('   ⚠️ NOTA: Los datos se guardan solo en este navegador');
        console.log('   Recargando página en 2 segundos...');
        setTimeout(() => window.location.reload(), 2000);
      }
    } else {
      console.log('\n📦 2. Sin variables de Supabase');
      console.log('   Usando IndexedDB (almacenamiento local)...');
      
      setForceIDB(true);
      await initializeSQL(true);
      
      console.log('\n✅ SQL ACTIVADO CON INDEXEDDB');
      console.log('   ⚠️ NOTA: Los datos se guardan solo en este navegador');
      console.log('   Recargando página en 2 segundos...');
      setTimeout(() => window.location.reload(), 2000);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR AL ACTIVAR SQL:', error);
    console.log('\n💡 SOLUCIONES ALTERNATIVAS:');
    console.log('1. Verifica que estés en Admin → Configuración');
    console.log('2. Recarga la página (F5) e intenta de nuevo');
    console.log('3. Revisa el archivo SOLUCION_SQL_NO_FUNCIONA.md para más detalles');
  }
})();

console.log('\n📝 NOTAS IMPORTANTES:');
console.log('─'.repeat(60));
console.log('• Si usas Supabase, asegúrate de tener las tablas creadas');
console.log('• Si usas IndexedDB, los datos son solo locales');
console.log('• Consulta SOLUCION_SQL_NO_FUNCIONA.md para configuración completa');
console.log('=' .repeat(60));
