// 🔧 Test de borrado SQL directo
// Ejecutar en la consola del navegador para diagnosticar el problema

console.log('🔧 TEST DE BORRADO SQL DIRECTO');
console.log('=' .repeat(50));

async function testDirectDelete() {
    try {
        // Obtener configuración de Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('📋 Configuración Supabase:');
        console.log('URL:', supabaseUrl);
        console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variables de entorno de Supabase no configuradas');
        }
        
        // Importar dinámicamente Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('✅ Cliente Supabase creado');
        
        // Probar conexión básica
        console.log('\n🔌 Probando conexión...');
        const { data: testData, error: testError } = await supabase
            .from('grades')
            .select('count', { count: 'exact', head: true })
            .limit(0);
            
        if (testError) {
            console.error('❌ Error de conexión:', testError);
            return;
        }
        
        console.log('✅ Conexión exitosa');
        
        // Contar registros del año 2025
        console.log('\n📊 Contando registros del año 2025...');
        const { count: beforeCount, error: countError } = await supabase
            .from('grades')
            .select('*', { count: 'exact', head: true })
            .eq('year', 2025);
            
        if (countError) {
            console.error('❌ Error contando:', countError);
            return;
        }
        
        console.log(`📊 Registros encontrados: ${beforeCount || 0}`);
        
        if ((beforeCount || 0) === 0) {
            console.log('ℹ️ No hay registros para borrar');
            return;
        }
        
        // Probar SELECT específico
        console.log('\n🔍 Obteniendo muestra de registros...');
        const { data: sampleData, error: sampleError } = await supabase
            .from('grades')
            .select('id, student_name, year, score')
            .eq('year', 2025)
            .limit(3);
            
        if (sampleError) {
            console.error('❌ Error obteniendo muestra:', sampleError);
        } else {
            console.log('📋 Muestra de registros:', sampleData);
        }
        
        // Intentar borrar UNO SOLO primero
        console.log('\n🗑️ Intentando borrar UN SOLO registro...');
        const { data: deleteData, error: deleteError, count: deleteCount } = await supabase
            .from('grades')
            .delete({ count: 'exact' })
            .eq('year', 2025)
            .limit(1);
            
        console.log('🗑️ Resultado del DELETE:');
        console.log('  Data:', deleteData);
        console.log('  Count:', deleteCount);
        console.log('  Error:', deleteError);
        
        if (deleteError) {
            console.error('❌ Error en DELETE:', deleteError);
            console.error('❌ Código de error:', deleteError.code);
            console.error('❌ Mensaje:', deleteError.message);
            console.error('❌ Detalles:', deleteError.details);
            console.error('❌ Hint:', deleteError.hint);
            
            // Verificar si es problema de permisos
            if (deleteError.code === '42501' || deleteError.message.includes('permission')) {
                console.log('\n🔐 DIAGNÓSTICO: Problema de permisos RLS');
                console.log('💡 Solución: Ejecutar el script configurar-rls-supabase.sql');
            }
            
            return;
        }
        
        console.log('✅ Borrado de prueba exitoso');
        
        // Verificar si realmente se borró
        const { count: afterCount, error: afterError } = await supabase
            .from('grades')
            .select('*', { count: 'exact', head: true })
            .eq('year', 2025);
            
        if (afterError) {
            console.error('❌ Error verificando después del borrado:', afterError);
        } else {
            console.log(`📊 Registros después del borrado: ${afterCount || 0}`);
            console.log(`📉 Diferencia: ${(beforeCount || 0) - (afterCount || 0)}`);
        }
        
    } catch (error) {
        console.error('❌ Error general en test:', error);
    }
}

// Ejecutar el test
testDirectDelete();

console.log('\n💡 Este script diagnostica problemas de borrado SQL');
console.log('💡 Revisa los logs arriba para identificar el problema');