// ================================
// SCRIPT DE DIAGNÓSTICO SQL - CONSOLE NAVEGADOR
// Copia y pega este script en la consola del navegador para diagnosticar problemas
// ================================

console.log('🔧 INICIANDO DIAGNÓSTICO SQL COMPLETO...');

// 1. Verificar estado global SQL
console.log('\n📊 1. ESTADO GLOBAL SQL:');
console.log('isSQLConnected:', window.globalSQLState?.isSQLConnected);
console.log('isInitializing:', window.globalSQLState?.isInitializing);
console.log('error:', window.globalSQLState?.error);

// 2. Test de conexión manual
console.log('\n🔌 2. TEST DE CONEXIÓN MANUAL:');
async function testSQLConnection() {
  try {
    const { testConnection } = await import('/src/lib/sql-database.ts');
    const result = await testConnection();
    console.log('✅ Resultado testConnection:', result);
    return result.success;
  } catch (e) {
    console.error('❌ Error en testConnection:', e);
    return false;
  }
}

// 3. Contar registros en Supabase
console.log('\n📊 3. CONTEO DE REGISTROS:');
async function countRegistros() {
  try {
    const { sqlDatabase } = await import('/src/lib/sql-database.ts');
    
    const totalResult = await sqlDatabase.countAllGrades();
    console.log('📊 Total grades en DB:', totalResult.total);
    
    const currentYear = new Date().getFullYear();
    const yearResult = await sqlDatabase.countGradesByYear(currentYear);
    console.log(`📊 Grades del año ${currentYear}:`, yearResult.count);
    
    // Contar por años anteriores también
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      const yearCount = await sqlDatabase.countGradesByYear(year);
      console.log(`📊 Año ${year}:`, yearCount.count, 'registros');
    }
    
  } catch (e) {
    console.error('❌ Error contando registros:', e);
  }
}

// 4. Test de borrado (solo contar, no borrar)
console.log('\n🗑️ 4. TEST DE BORRADO (DRY RUN):');
async function testBorrado(year = new Date().getFullYear()) {
  try {
    const { sqlDatabase } = await import('/src/lib/sql-database.ts');
    
    console.log(`🗑️ Simulando borrado para año ${year}...`);
    
    // Contar antes
    const antes = await sqlDatabase.countGradesByYear(year);
    console.log(`📊 Registros ANTES del borrado: ${antes.count}`);
    
    if (antes.count === 0) {
      console.log('ℹ️ No hay registros para borrar');
      return;
    }
    
    // AQUI PODRIAMOS HACER EL BORRADO REAL:
    // const resultado = await sqlDatabase.deleteGradesByYear(year);
    // console.log('🗑️ Resultado del borrado:', resultado);
    
    console.log('ℹ️ BORRADO NO EJECUTADO - Solo prueba');
    
  } catch (e) {
    console.error('❌ Error en test de borrado:', e);
  }
}

// 5. Verificar estructura de datos de muestra
console.log('\n📋 5. VERIFICAR ESTRUCTURA DE DATOS:');
async function verEstructura() {
  try {
    const { sqlDatabase } = await import('/src/lib/sql-database.ts');
    
    const currentYear = new Date().getFullYear();
    const samples = await sqlDatabase.getGradesByYear(currentYear);
    
    if (samples.length > 0) {
      console.log('📋 Muestra de datos (primer registro):');
      console.log(JSON.stringify(samples[0], null, 2));
      console.log(`📊 Total registros retornados: ${samples.length}`);
    } else {
      console.log('ℹ️ No se encontraron registros para el año actual');
    }
    
  } catch (e) {
    console.error('❌ Error verificando estructura:', e);
  }
}

// 6. Ejecutar todas las pruebas
async function ejecutarDiagnostico() {
  console.log('\n🚀 EJECUTANDO DIAGNÓSTICO COMPLETO...\n');
  
  const isConnected = await testSQLConnection();
  if (!isConnected) {
    console.error('❌ SQL no conectado, abortando diagnóstico');
    return;
  }
  
  await countRegistros();
  await verEstructura();
  await testBorrado();
  
  console.log('\n✅ DIAGNÓSTICO COMPLETADO');
}

// Auto-ejecutar diagnóstico
ejecutarDiagnostico();

// Exportar funciones para uso manual
window.sqlDiagnostic = {
  testConnection: testSQLConnection,
  countRegistros,
  testBorrado,
  verEstructura,
  ejecutarCompleto: ejecutarDiagnostico
};

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('- window.sqlDiagnostic.testConnection()');
console.log('- window.sqlDiagnostic.countRegistros()');
console.log('- window.sqlDiagnostic.testBorrado(2024)');
console.log('- window.sqlDiagnostic.verEstructura()');
console.log('- window.sqlDiagnostic.ejecutarCompleto()');