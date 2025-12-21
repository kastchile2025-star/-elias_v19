// 🚨 DIAGNÓSTICO INMEDIATO - Conexión SQL en Configuración
// Ejecutar en la consola del navegador (F12 → Console)

console.log('🚨 DIAGNÓSTICO CONEXIÓN SQL - CONFIGURACIÓN');
console.log('=' .repeat(50));

// 1. VERIFICAR VARIABLES DE ENTORNO
console.log('\n1️⃣ VARIABLES DE ENTORNO:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`URL: ${supabaseUrl || '❌ FALTA'}`);
console.log(`KEY: ${supabaseKey ? '✅ PRESENTE' : '❌ FALTA'}`);

if (!supabaseUrl || !supabaseKey) {
    console.log('🚨 PROBLEMA: Variables de entorno no están disponibles');
    console.log('💡 SOLUCIÓN: Verificar que el deploy de Vercel se completó');
    return;
}

// 2. PROBAR CONEXIÓN DIRECTA A SUPABASE
console.log('\n2️⃣ PROBANDO CONEXIÓN SUPABASE:');

async function testDirectConnection() {
    try {
        // Crear cliente Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('✅ Cliente Supabase creado');
        
        // Probar conexión a tabla grades
        console.log('🔍 Probando acceso a tabla grades...');
        const { data, error, count } = await supabase
            .from('grades')
            .select('*', { count: 'exact' })
            .limit(5);
            
        if (error) {
            console.log('❌ ERROR EN GRADES:', error);
            console.log('📋 Mensaje:', error.message);
            console.log('📋 Código:', error.code);
            
            // Diagnóstico específico
            if (error.message.includes('not authorized') || error.code === 'PGRST301') {
                console.log('🚨 PROBLEMA: Políticas RLS no configuradas correctamente');
                console.log('💡 SOLUCIÓN: Ejecutar configurar-rls-supabase.sql');
            } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('🚨 PROBLEMA: Tabla grades no existe');
                console.log('💡 SOLUCIÓN: Crear tablas en Supabase');
            }
            return false;
        } else {
            console.log('✅ CONEXIÓN EXITOSA a grades');
            console.log(`📊 Registros encontrados: ${count}`);
            console.log('📋 Datos:', data);
            return true;
        }
        
    } catch (importError) {
        console.log('❌ ERROR IMPORTANDO SUPABASE:', importError);
        return false;
    }
}

// 3. VERIFICAR ESTADO DEL HOOK useGradesSQL
console.log('\n3️⃣ VERIFICANDO HOOK SQL:');

// Buscar elementos que indiquen el estado del hook
const sqlBadges = document.querySelectorAll('*');
let sqlStatus = 'desconocido';

Array.from(sqlBadges).forEach(el => {
    const text = el.textContent || '';
    if (text.includes('SQL ✓')) sqlStatus = 'conectado';
    if (text.includes('SQL ✗')) sqlStatus = 'desconectado';
});

console.log(`🔌 Estado SQL UI: ${sqlStatus}`);

// 4. EJECUTAR PRUEBA COMPLETA
testDirectConnection().then(connected => {
    console.log('\n📊 RESUMEN:');
    console.log(`Variables OK: ${supabaseUrl && supabaseKey ? '✅' : '❌'}`);
    console.log(`Conexión Supabase: ${connected ? '✅' : '❌'}`);
    console.log(`UI muestra: ${sqlStatus}`);
    
    if (!connected) {
        console.log('\n🚨 PROBLEMA DETECTADO:');
        console.log('La conexión SQL está fallando. Posibles causas:');
        console.log('1. Políticas RLS no configuradas');
        console.log('2. Tablas no tienen datos');
        console.log('3. Error en la configuración de Supabase');
        
        console.log('\n📋 SOLUCIONES:');
        console.log('1. Ejecutar configurar-rls-supabase.sql en Supabase');
        console.log('2. Verificar que las tablas existan');
        console.log('3. Refrescar la página después de configurar');
    } else {
        console.log('\n✅ Conexión OK - puede ser un problema del hook/UI');
        console.log('💡 Intenta refrescar la página');
    }
});

// 5. FUNCIÓN PARA FORZAR RECONEXIÓN
window.forzarReconexionSQL = async function() {
    console.log('🔄 FORZANDO RECONEXIÓN SQL...');
    
    // Limpiar localStorage relacionado con SQL
    const sqlKeys = Object.keys(localStorage).filter(key => 
        key.includes('sql') || key.includes('SQL')
    );
    
    sqlKeys.forEach(key => {
        console.log(`🗑️ Limpiando: ${key}`);
        localStorage.removeItem(key);
    });
    
    console.log('✅ Cache SQL limpiado');
    console.log('🔄 Refrescando página...');
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

console.log('\n💡 EJECUTA forzarReconexionSQL() si la conexión directa funciona pero la UI sigue mostrando desconectado');
console.log('=' .repeat(50));