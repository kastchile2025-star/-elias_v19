// DIAGNÓSTICO COMPLETO DE BORRADO EN SUPABASE
// Ejecutar en la consola del navegador para verificar estado real

console.log('🔍 INICIANDO DIAGNÓSTICO DE BORRADO SUPABASE');

// 1. Verificar conexión SQL actual
const verificarConexionSQL = async () => {
  console.log('\n📡 1. VERIFICANDO CONEXIÓN SQL...');
  
  try {
    // Importar módulos SQL
    const { sqlDatabase } = await import('/src/lib/sql-database.ts');
    const { isSQLConnected } = await import('/src/lib/sql-init.ts');
    
    console.log('✅ Estado SQL conectado:', isSQLConnected());
    
    // Test connection
    const testResult = await sqlDatabase.testConnection();
    console.log('🔍 Test connection result:', testResult);
    
    return sqlDatabase;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error);
    return null;
  }
};

// 2. Contar registros ANTES del borrado
const contarRegistrosAntes = async (sqlDatabase, year = 2025) => {
  console.log('\n📊 2. CONTANDO REGISTROS ANTES DEL BORRADO...');
  
  try {
    // Contar por año específico
    const countByYear = await sqlDatabase.countGradesByYear(year);
    console.log(`📈 Registros para año ${year}:`, countByYear);
    
    // Contar todos los registros
    const countAll = await sqlDatabase.countAllGrades();
    console.log('📈 Total de todos los registros:', countAll);
    
    // Obtener algunos registros de muestra
    const sampleGrades = await sqlDatabase.getGradesByYear(year);
    console.log(`📋 Muestra de registros (${year}):`, sampleGrades.slice(0, 3));
    
    return { countByYear, countAll, sampleCount: sampleGrades.length };
  } catch (error) {
    console.error('❌ Error contando registros:', error);
    return null;
  }
};

// 3. Ejecutar borrado con logs detallados
const ejecutarBorradoConLogs = async (sqlDatabase, year = 2025) => {
  console.log('\n🗑️ 3. EJECUTANDO BORRADO CON LOGS DETALLADOS...');
  
  try {
    console.log(`🚀 Iniciando deleteGradesByYear(${year})...`);
    
    const resultado = await sqlDatabase.deleteGradesByYear(year);
    console.log('✅ Resultado completo del borrado:', resultado);
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en borrado:', error);
    return null;
  }
};

// 4. Verificar registros DESPUÉS del borrado
const verificarRegistrosDespues = async (sqlDatabase, year = 2025) => {
  console.log('\n📊 4. VERIFICANDO REGISTROS DESPUÉS DEL BORRADO...');
  
  try {
    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Contar por año específico
    const countByYear = await sqlDatabase.countGradesByYear(year);
    console.log(`📈 Registros restantes para año ${year}:`, countByYear);
    
    // Contar todos los registros
    const countAll = await sqlDatabase.countAllGrades();
    console.log('📈 Total de registros restantes:', countAll);
    
    // Verificar si realmente se borraron
    const sampleGrades = await sqlDatabase.getGradesByYear(year);
    console.log(`📋 Registros restantes (muestra):`, sampleGrades.slice(0, 3));
    
    return { countByYear, countAll, remainingCount: sampleGrades.length };
  } catch (error) {
    console.error('❌ Error verificando después:', error);
    return null;
  }
};

// 5. Verificación directa con Supabase client
const verificacionDirectaSupabase = async (year = 2025) => {
  console.log('\n🔍 5. VERIFICACIÓN DIRECTA CON SUPABASE CLIENT...');
  
  try {
    // Acceder al cliente Supabase directamente
    const { sqlDatabase } = await import('/src/lib/sql-database.ts');
    const client = sqlDatabase.connect();
    
    if (!client) {
      console.error('❌ No se pudo conectar al cliente Supabase');
      return null;
    }
    
    console.log('✅ Cliente Supabase conectado');
    
    // Consulta directa para verificar registros
    const { data, error, count } = await client
      .from('grades')
      .select('id, year, student_name, score', { count: 'exact' })
      .eq('year', year)
      .limit(5);
    
    if (error) {
      console.error('❌ Error en consulta directa:', error);
      return null;
    }
    
    console.log(`📊 Consulta directa - Registros encontrados (${year}):`, count);
    console.log('📋 Muestra de datos directos:', data);
    
    // Consulta de todos los registros
    const { count: totalCount, error: totalError } = await client
      .from('grades')
      .select('id', { count: 'exact', head: true });
    
    if (!totalError) {
      console.log('📊 Total de registros (consulta directa):', totalCount);
    }
    
    return { directCount: count, totalDirectCount: totalCount, sampleData: data };
  } catch (error) {
    console.error('❌ Error en verificación directa:', error);
    return null;
  }
};

// FUNCIÓN PRINCIPAL DE DIAGNÓSTICO
const ejecutarDiagnosticoCompleto = async (year = 2025) => {
  console.log('🚀 EJECUTANDO DIAGNÓSTICO COMPLETO DE BORRADO SUPABASE');
  console.log('================================================');
  
  const resultados = {};
  
  // 1. Verificar conexión
  const sqlDatabase = await verificarConexionSQL();
  if (!sqlDatabase) {
    console.log('❌ DIAGNÓSTICO ABORTADO: No se pudo conectar a SQL');
    return;
  }
  resultados.conexion = true;
  
  // 2. Contar antes
  resultados.antes = await contarRegistrosAntes(sqlDatabase, year);
  
  // 3. Ejecutar borrado
  resultados.borrado = await ejecutarBorradoConLogs(sqlDatabase, year);
  
  // 4. Verificar después
  resultados.despues = await verificarRegistrosDespues(sqlDatabase, year);
  
  // 5. Verificación directa
  resultados.directo = await verificacionDirectaSupabase(year);
  
  // RESUMEN FINAL
  console.log('\n📋 RESUMEN COMPLETO DEL DIAGNÓSTICO');
  console.log('=====================================');
  console.log('🔍 Resultados:', resultados);
  
  // Análisis de discrepancias
  if (resultados.antes && resultados.despues) {
    const registrosAntes = resultados.antes.countByYear?.count || 0;
    const registrosDespues = resultados.despues.countByYear?.count || 0;
    const registrosDirectos = resultados.directo?.directCount || 0;
    
    console.log(`\n📊 ANÁLISIS DE BORRADO (año ${year}):`);
    console.log(`   Registros ANTES: ${registrosAntes}`);
    console.log(`   Registros DESPUÉS: ${registrosDespues}`);
    console.log(`   Registros DIRECTOS: ${registrosDirectos}`);
    console.log(`   Registros eliminados: ${registrosAntes - registrosDespues}`);
    
    if (registrosDespues > 0) {
      console.log('⚠️ PROBLEMA: Los registros NO se eliminaron completamente');
    } else {
      console.log('✅ ÉXITO: Los registros se eliminaron correctamente');
    }
    
    if (registrosDirectos !== registrosDespues) {
      console.log('🔍 DISCREPANCIA: Diferencia entre consulta directa y función de conteo');
    }
  }
  
  return resultados;
};

// FUNCIÓN RÁPIDA PARA VERIFICAR ESTADO ACTUAL
const estadoRapido = async (year = 2025) => {
  console.log('⚡ VERIFICACIÓN RÁPIDA DEL ESTADO ACTUAL');
  const directos = await verificacionDirectaSupabase(year);
  return directos;
};

// Exponer funciones globalmente para uso en consola
window.diagnosticoSupabase = {
  completo: ejecutarDiagnosticoCompleto,
  rapido: estadoRapido,
  verificarConexion: verificarConexionSQL,
  contarAntes: contarRegistrosAntes,
  ejecutarBorrado: ejecutarBorradoConLogs,
  verificarDespues: verificarRegistrosDespues,
  consultaDirecta: verificacionDirectaSupabase
};

console.log('✅ DIAGNÓSTICO CARGADO');
console.log('💡 Usa: diagnosticoSupabase.completo(2025) para diagnóstico completo');
console.log('💡 Usa: diagnosticoSupabase.rapido(2025) para verificación rápida');