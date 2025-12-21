// 🚀 DIAGNÓSTICO PRODUCCIÓN - Carga Masiva Vercel
// Ejecutar en la consola del navegador en tu sitio de producción

console.log('🚀 DIAGNÓSTICO PRODUCCIÓN - CARGA MASIVA VERCEL');
console.log('=' .repeat(60));
console.log(`🌐 Entorno: ${window.location.hostname}`);
console.log(`⏰ Fecha: ${new Date().toLocaleString()}`);

// 1. VERIFICAR VARIABLES DE ENTORNO EN PRODUCCIÓN
console.log('\n1️⃣ VARIABLES DE ENTORNO EN PRODUCCIÓN:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

console.log(`✅ SUPABASE_URL: ${supabaseUrl || '❌ NO CONFIGURADA'}`);
console.log(`✅ SUPABASE_KEY: ${supabaseKey ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
console.log(`✅ GOOGLE_API_KEY: ${googleKey ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);

if (!supabaseUrl || !supabaseKey) {
    console.log('🚨 PROBLEMA: Variables de Supabase no configuradas en Vercel');
    console.log('📋 SOLUCIÓN: Verificar Environment Variables en Vercel Dashboard');
    return;
}

// 2. PROBAR CONEXIÓN A SUPABASE EN PRODUCCIÓN
console.log('\n2️⃣ CONEXIÓN A SUPABASE:');

async function testProductionSupabase() {
    try {
        console.log('🔗 Probando conexión a Supabase...');
        
        // Importar Supabase client
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('✅ Cliente Supabase creado');
        
        // Probar acceso a cada tabla requerida
        const tables = ['grades', 'activities', 'attendance'];
        const results = {};
        
        for (const table of tables) {
            try {
                const { data, error, count } = await supabase
                    .from(table)
                    .select('id', { head: true, count: 'exact' })
                    .limit(1);
                
                if (error) {
                    results[table] = { status: 'error', message: error.message };
                    console.log(`❌ Tabla "${table}": ${error.message}`);
                } else {
                    results[table] = { status: 'ok', count: count || 0 };
                    console.log(`✅ Tabla "${table}": OK (${count || 0} registros)`);
                }
            } catch (e) {
                results[table] = { status: 'exception', message: e.message };
                console.log(`❌ Tabla "${table}": Excepción - ${e.message}`);
            }
        }
        
        // Resumen de conexión
        const tablesOk = Object.values(results).filter(r => r.status === 'ok').length;
        console.log(`\n📊 Resumen: ${tablesOk}/${tables.length} tablas accesibles`);
        
        if (tablesOk === tables.length) {
            console.log('🎉 ¡CONEXIÓN EXITOSA! Todas las tablas están disponibles');
            return true;
        } else {
            console.log('⚠️ Algunas tablas no están disponibles - revisar configuración Supabase');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Error grave en conexión:', error);
        return false;
    }
}

// 3. VERIFICAR SISTEMA DE CARGA MASIVA
console.log('\n3️⃣ SISTEMA DE CARGA MASIVA:');

async function testMassiveLoad() {
    try {
        // Verificar si estamos en la página correcta
        const isAdminPage = window.location.pathname.includes('dashboard');
        console.log(`📍 Página actual: ${isAdminPage ? 'Dashboard ✅' : 'Otra página ⚠️'}`);
        
        if (!isAdminPage) {
            console.log('💡 Ve a /dashboard para probar la carga masiva');
            return;
        }
        
        // Buscar elementos de UI relacionados con SQL
        const sqlElements = document.querySelectorAll('*[content*="SQL"], *:contains("SQL")');
        console.log(`🎛️ Elementos SQL en UI: ${sqlElements.length} encontrados`);
        
        // Verificar indicador de conexión SQL
        const sqlBadges = document.querySelectorAll('.bg-green-100, .bg-red-100');
        const connectionIndicator = Array.from(sqlBadges).find(el => 
            el.textContent.includes('SQL') || el.textContent.includes('✓') || el.textContent.includes('✗')
        );
        
        if (connectionIndicator) {
            const isConnected = connectionIndicator.textContent.includes('✓');
            console.log(`🔌 Indicador conexión SQL: ${isConnected ? '✅ Conectado' : '❌ Desconectado'}`);
        } else {
            console.log('🔍 Indicador de conexión SQL no encontrado - revisar UI');
        }
        
    } catch (error) {
        console.log('❌ Error verificando sistema carga masiva:', error);
    }
}

// 4. DATOS ACTUALES DEL SISTEMA
console.log('\n4️⃣ DATOS ACTUALES:');

try {
    const gradesLocal = JSON.parse(localStorage.getItem('smart-student-test-grades') || '[]');
    const gradesSQL = JSON.parse(localStorage.getItem('smart-student-sql-grades') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    console.log(`📊 Calificaciones LocalStorage: ${gradesLocal.length}`);
    console.log(`🗄️ Calificaciones SQL cache: ${gradesSQL.length}`);
    console.log(`👥 Usuarios: ${users.length}`);
    console.log(`📝 Tareas: ${tasks.length}`);
    
    // Verificar año actual
    const currentYear = new Date().getFullYear();
    const gradesThisYear = gradesLocal.filter(g => g.year === currentYear);
    console.log(`📅 Calificaciones ${currentYear}: ${gradesThisYear.length}`);
    
} catch (error) {
    console.log('❌ Error verificando datos locales:', error);
}

// 5. EJECUTAR DIAGNÓSTICOS
async function runFullDiagnosis() {
    console.log('\n🔍 EJECUTANDO DIAGNÓSTICO COMPLETO...');
    
    const supabaseOk = await testProductionSupabase();
    await testMassiveLoad();
    
    console.log('\n📋 RESUMEN DIAGNÓSTICO:');
    console.log(`Variables configuradas: ${supabaseUrl && supabaseKey ? '✅' : '❌'}`);
    console.log(`Conexión Supabase: ${supabaseOk ? '✅' : '❌'}`);
    
    if (supabaseUrl && supabaseKey && supabaseOk) {
        console.log('\n🎉 ¡SISTEMA LISTO PARA CARGA MASIVA!');
        console.log('📋 Próximos pasos:');
        console.log('   1. Ve a Admin → Configuración');
        console.log('   2. Busca "Carga masiva: Calificaciones (SQL)"');
        console.log('   3. Verifica badge verde "✅ SQL"');
        console.log('   4. Prueba con archivo CSV pequeño');
    } else {
        console.log('\n⚠️ REQUIERE CONFIGURACIÓN:');
        if (!supabaseUrl || !supabaseKey) {
            console.log('   - Configurar variables en Vercel');
        }
        if (!supabaseOk) {
            console.log('   - Crear tablas en Supabase con setup-supabase-calificaciones.sql');
            console.log('   - Verificar políticas RLS');
        }
    }
}

// Ejecutar diagnóstico automáticamente
runFullDiagnosis();

// 6. FUNCIONES AUXILIARES PARA TESTING
window.testSupabaseConnection = testProductionSupabase;
window.rerunDiagnosis = runFullDiagnosis;

// 7. CREAR DATOS DE PRUEBA SI ES NECESARIO
window.createTestData = async function() {
    console.log('🧪 CREANDO DATOS DE PRUEBA...');
    
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const testGrade = {
            id: `test_${Date.now()}`,
            test_id: 'prueba_diagnostico',
            student_id: 'student_test',
            student_name: 'Estudiante Prueba',
            score: 95,
            course_id: 'curso_test',
            section_id: 'seccion_a',
            subject_id: 'matematicas',
            title: 'Prueba de Diagnóstico',
            graded_at: new Date().toISOString(),
            year: new Date().getFullYear(),
            type: 'prueba'
        };
        
        const { data, error } = await supabase
            .from('grades')
            .insert([testGrade]);
            
        if (error) {
            console.log('❌ Error creando datos de prueba:', error.message);
        } else {
            console.log('✅ Datos de prueba creados exitosamente');
        }
        
    } catch (error) {
        console.log('❌ Error:', error);
    }
};

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('   testSupabaseConnection() - Probar conexión');
console.log('   rerunDiagnosis() - Ejecutar diagnóstico nuevamente');
console.log('   createTestData() - Crear datos de prueba');
console.log('=' .repeat(60));