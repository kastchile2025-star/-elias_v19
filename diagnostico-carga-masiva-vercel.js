// 🔍 DIAGNÓSTICO COMPLETO: Problemas de Carga Masiva
// Ejecutar en la consola del navegador en tu proyecto

console.log('🔍 DIAGNÓSTICO COMPLETO - CARGA MASIVA DE CALIFICACIONES');
console.log('=' .repeat(60));

// 1. VERIFICAR CONFIGURACIÓN DE VARIABLES DE ENTORNO
console.log('\n1️⃣ CONFIGURACIÓN DE VARIABLES DE ENTORNO:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ FALTA'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Configurada' : '❌ FALTA'}`);

if (!supabaseUrl || !supabaseKey) {
    console.log('🚨 PROBLEMA PRINCIPAL: Faltan variables de entorno de Supabase');
    console.log('📋 SOLUCIÓN: Configurar en .env.local y en Vercel');
}

// 2. VERIFICAR ESTADO DE CONEXIÓN SQL
console.log('\n2️⃣ ESTADO DE CONEXIÓN SQL:');
try {
    // Verificar si SQL está habilitado
    const sqlEnabled = supabaseUrl && supabaseKey;
    console.log(`SQL Habilitado: ${sqlEnabled ? '✅ SÍ' : '❌ NO - Usando IndexedDB'}`);
    
    // Verificar configuración guardada
    const sqlConfig = localStorage.getItem('smart-student-sql-config');
    console.log(`Configuración SQL guardada: ${sqlConfig ? '✅ SÍ' : '❌ NO'}`);
    
} catch (error) {
    console.log('❌ Error verificando SQL:', error);
}

// 3. VERIFICAR DATOS ACTUALES
console.log('\n3️⃣ DATOS DE CALIFICACIONES ACTUALES:');
try {
    // Calificaciones en LocalStorage/IndexedDB
    const gradesLocal = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
    const gradesSQL = JSON.parse(localStorage.getItem('smart-student-sql-grades') || '[]');
    
    console.log(`📊 Calificaciones LocalStorage: ${gradesLocal.length} registros`);
    console.log(`🗄️ Calificaciones SQL (cache): ${gradesSQL.length} registros`);
    
    if (gradesLocal.length > 0) {
        console.log('📅 Última calificación local:', gradesLocal[gradesLocal.length - 1]);
    }
    
} catch (error) {
    console.log('❌ Error verificando datos:', error);
}

// 4. VERIFICAR MÓDULO DE CARGA MASIVA
console.log('\n4️⃣ ESTADO DEL MÓDULO DE CARGA MASIVA:');
try {
    // Verificar si el hook SQL está disponible
    const moduleCheck = window.location.href.includes('dashboard') ? 'Dashboard disponible' : 'Fuera del dashboard';
    console.log(`🖥️ Ubicación: ${moduleCheck}`);
    
    // Verificar elementos de UI
    const sqlSection = document.querySelector('[data-testid="sql-grades-section"]') || 
                      document.querySelector('*[content*="SQL"]') ||
                      document.querySelector('*:contains("SQL")');
    
    console.log(`🎛️ Sección SQL en UI: ${sqlSection ? '✅ Encontrada' : '❌ No encontrada'}`);
    
} catch (error) {
    console.log('❌ Error verificando UI:', error);
}

// 5. VERIFICAR ERRORES DE CONEXIÓN
console.log('\n5️⃣ DIAGNÓSTICO DE ERRORES:');
try {
    // Revisar errores en consola
    const errors = [];
    
    if (!supabaseUrl) errors.push('Falta NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) errors.push('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    const gradesCount = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]').length;
    if (gradesCount === 0) errors.push('No hay calificaciones en el sistema');
    
    if (errors.length > 0) {
        console.log('🚨 ERRORES DETECTADOS:');
        errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    } else {
        console.log('✅ No se detectaron errores críticos');
    }
    
} catch (error) {
    console.log('❌ Error en diagnóstico:', error);
}

// 6. RECOMENDACIONES ESPECÍFICAS
console.log('\n6️⃣ RECOMENDACIONES:');

if (!supabaseUrl || !supabaseKey) {
    console.log('🎯 ACCIÓN REQUERIDA: Configurar Supabase');
    console.log('   1. Crear proyecto en supabase.com');
    console.log('   2. Obtener URL y ANON_KEY del proyecto');
    console.log('   3. Configurar variables de entorno:');
    console.log('      NEXT_PUBLIC_SUPABASE_URL=tu_url');
    console.log('      NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key');
    console.log('   4. Crear tablas necesarias (grades, activities, attendance)');
    console.log('   5. Configurar políticas RLS');
} else {
    console.log('✅ Variables configuradas - verificar conexión de red');
}

console.log('\n📋 SIGUIENTE PASO: Revisar SOLUCION_CARGA_MASIVA_VERCEL.md');
console.log('=' .repeat(60));

// FUNCIÓN PARA EXPORTAR DATOS (si necesitas hacer backup)
window.exportarDatosBackup = function() {
    console.log('💾 Exportando datos para backup...');
    
    const data = {
        timestamp: new Date().toISOString(),
        grades: JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]'),
        tasks: JSON.parse(localStorage.getItem('smart-student-tasks') || '[]'),
        users: JSON.parse(localStorage.getItem('smart-student-users') || '[]'),
        evaluations: JSON.parse(localStorage.getItem('smart-student-evaluations') || '[]'),
        tests: JSON.parse(localStorage.getItem('smart-student-tests') || '[]')
    };
    
    console.log('📊 Datos exportados:', {
        grades: data.grades.length,
        tasks: data.tasks.length,
        users: data.users.length,
        evaluations: data.evaluations.length,
        tests: data.tests.length
    });
    
    // Crear y descargar archivo
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_calificaciones_${new Date().toISOString().slice(0, 19).replace(/[: ]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup descargado');
};

console.log('\n💡 TIP: Ejecuta exportarDatosBackup() para hacer backup de datos antes de migrar');