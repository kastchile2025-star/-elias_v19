// 🚀 SOLUCIÓN RÁPIDA: Activar SQL inmediatamente
// Ejecutar en la consola del navegador (F12) en Admin → Configuración

console.log('🔧 ACTIVANDO SQL... (bridge)');
console.log('=' .repeat(60));

(async () => {
  try {
    // 1. Verificar estado actual
    console.log('\n📊 1. Verificando estado actual...');
    const g = window.sqlGlobal || {};
    const { initializeSQL, isSQLConnected, getSQLStatus, isSupabaseEnabled, setForceIDB, sqlDatabase } = g;
    if (!initializeSQL || !isSQLConnected || !getSQLStatus) {
      console.warn('[activar-sql-rapido] Bridge no disponible aún. Reintentando en 500ms...');
      await new Promise(r => setTimeout(r, 500));
    }
    const G = window.sqlGlobal || {};
    const init = G.initializeSQL; const conn = G.isSQLConnected; const status = G.getSQLStatus; const supa = G.isSupabaseEnabled; const force = G.setForceIDB; const db = G.sqlDatabase;
    if (!init || !conn || !status) { throw new Error('Bridge SQL no disponible. Abre Admin → Configuración y espera 2s.'); }
    
  console.log('   Estado SQL:', status());
  console.log('   Conectado:', conn() ? '✅' : '❌');
  console.log('   Supabase habilitado:', supa ? supa() : '(n/d)');
    
    // 2. Determinar estrategia
  const hasSupabaseVars = true; // si el bridge expone Supabase, lo probamos igualmente
    
    if (hasSupabaseVars) {
      console.log('\n🔌 2. Detectado: Variables de Supabase configuradas');
      console.log('   Intentando conectar a Supabase...');
      
      // Probar conexión a Supabase
  const result = await db.testConnection();
      
      if (result.success) {
        console.log('   ✅ Supabase conectado correctamente');
        
        // Forzar reinicialización
  force && force(false);
  await init(true);
        
        console.log('\n✅ SQL ACTIVADO CON SUPABASE');
        console.log('   Recargando página en 2 segundos...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        console.warn('   ⚠️ Supabase no disponible:', result.error);
        console.log('\n💡 Cambiando a IndexedDB (almacenamiento local)...');
        
  force && force(true);
  await init(true);
        
        console.log('\n✅ SQL ACTIVADO CON INDEXEDDB');
        console.log('   ⚠️ NOTA: Los datos se guardan solo en este navegador');
        console.log('   Recargando página en 2 segundos...');
        setTimeout(() => window.location.reload(), 2000);
      }
    } else {
      console.log('\n📦 2. Sin variables de Supabase');
      console.log('   Usando IndexedDB (almacenamiento local)...');
      
  force && force(true);
  await init(true);
      
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
