// 🔍 VERIFICACIÓN ESPECÍFICA - Configuración Supabase
// Ejecutar en la consola del navegador después de recargar la página

console.log('🔍 VERIFICACIÓN ESPECÍFICA - SUPABASE CONFIGURADO');
console.log('=' .repeat(60));

// 1. VERIFICAR VARIABLES DE ENTORNO
console.log('\n1️⃣ VARIABLES DE ENTORNO:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`✅ SUPABASE_URL: ${supabaseUrl || '❌ NO ENCONTRADA'}`);
console.log(`✅ SUPABASE_KEY: ${supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ NO ENCONTRADA'}`);

if (supabaseUrl && supabaseKey) {
    console.log('✅ Variables de entorno configuradas correctamente');
} else {
    console.log('❌ Faltan variables de entorno - reinicia el servidor');
    return;
}

// 2. PROBAR CONEXIÓN A SUPABASE
console.log('\n2️⃣ PROBANDO CONEXIÓN A SUPABASE:');

async function testSupabaseConnection() {
    try {
        // Crear cliente Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('🔗 Cliente Supabase creado');
        
        // Probar conexión básica
        const { data, error } = await supabase
            .from('grades')
            .select('id', { head: true, count: 'exact' })
            .limit(1);
            
        if (error) {
            console.log('❌ Error de conexión:', error.message);
            
            // Diagnóstico específico del error
            if (error.message.includes('relation "grades" does not exist')) {
                console.log('🚨 PROBLEMA: La tabla "grades" no existe en Supabase');
                console.log('📋 SOLUCIÓN: Ejecutar setup-supabase-calificaciones.sql');
            } else if (error.message.includes('not authorized') || error.message.includes('RLS')) {
                console.log('🚨 PROBLEMA: Problemas de permisos RLS');
                console.log('📋 SOLUCIÓN: Configurar políticas RLS en Supabase');
            } else {
                console.log('🚨 PROBLEMA: Error desconocido de conexión');
            }
        } else {
            console.log('✅ Conexión exitosa a Supabase');
            console.log('✅ Tabla "grades" existe y es accesible');
        }
        
        // Probar otras tablas
        const tables = ['activities', 'attendance'];
        for (const table of tables) {
            try {
                const { error: tableError } = await supabase
                    .from(table)
                    .select('id', { head: true, count: 'exact' })
                    .limit(1);
                    
                if (tableError) {
                    console.log(`❌ Tabla "${table}": ${tableError.message}`);
                } else {
                    console.log(`✅ Tabla "${table}": Accesible`);
                }
            } catch (e) {
                console.log(`❌ Tabla "${table}": Error - ${e.message}`);
            }
        }
        
    } catch (importError) {
        console.log('❌ Error importando Supabase client:', importError);
        console.log('💡 Asegúrate de estar en la página del dashboard del proyecto');
    }
}

// Ejecutar prueba de conexión
testSupabaseConnection();

// 3. VERIFICAR ESTADO DEL HOOK SQL
console.log('\n3️⃣ VERIFICANDO HOOK SQL:');
setTimeout(() => {
    try {
        // Verificar si el sistema detecta SQL como disponible
        const sqlConfigDetected = supabaseUrl && supabaseKey;
        console.log(`Hook SQL habilitado: ${sqlConfigDetected ? '✅ SÍ' : '❌ NO'}`);
        
        // Verificar localStorage para debugging
        const sqlConfig = localStorage.getItem('smart-student-sql-config');
        console.log(`Configuración SQL en localStorage: ${sqlConfig ? '✅ Presente' : '❌ Ausente'}`);
        
    } catch (error) {
        console.log('❌ Error verificando hook:', error);
    }
}, 1000);

// 4. FUNCIÓN PARA CREAR TABLAS DESDE LA CONSOLA
window.crearTablasSupabase = async function() {
    console.log('🔨 CREANDO TABLAS EN SUPABASE...');
    
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // SQL para crear tablas
        const createTablesSQL = `
            -- Crear tabla grades
            CREATE TABLE IF NOT EXISTS grades (
              id TEXT PRIMARY KEY,
              test_id TEXT NOT NULL,
              student_id TEXT NOT NULL,
              student_name TEXT NOT NULL,
              score NUMERIC NOT NULL,
              course_id TEXT,
              section_id TEXT,
              subject_id TEXT,
              title TEXT NOT NULL,
              graded_at TIMESTAMP WITH TIME ZONE NOT NULL,
              year INTEGER NOT NULL,
              type TEXT CHECK (type IN ('tarea', 'prueba', 'evaluacion')),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Crear tabla activities
            CREATE TABLE IF NOT EXISTS activities (
              id TEXT PRIMARY KEY,
              task_type TEXT NOT NULL,
              title TEXT NOT NULL,
              subject_id TEXT,
              subject_name TEXT,
              course_id TEXT,
              section_id TEXT,
              created_at TIMESTAMP WITH TIME ZONE NOT NULL,
              start_at TIMESTAMP WITH TIME ZONE,
              open_at TIMESTAMP WITH TIME ZONE,
              due_date TIMESTAMP WITH TIME ZONE,
              status TEXT,
              assigned_by_id TEXT,
              assigned_by_name TEXT,
              year INTEGER NOT NULL
            );
            
            -- Habilitar RLS
            ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
            ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
            
            -- Crear políticas permisivas
            CREATE POLICY IF NOT EXISTS "grades_all" ON grades FOR ALL USING (true);
            CREATE POLICY IF NOT EXISTS "activities_all" ON activities FOR ALL USING (true);
        `;
        
        console.log('⚠️ NOTA: No se puede ejecutar SQL DDL desde el cliente');
        console.log('📋 Por favor, ejecuta este SQL manualmente en Supabase Dashboard → SQL Editor:');
        console.log(createTablesSQL);
        
    } catch (error) {
        console.log('❌ Error:', error);
    }
};

// 5. PRÓXIMOS PASOS
console.log('\n5️⃣ PRÓXIMOS PASOS:');
console.log('1. Si ves errores de "relation not exists", ejecuta setup-supabase-calificaciones.sql');
console.log('2. Ve a https://dbontnbpekcfpznqkmby.supabase.co/project/default/sql');
console.log('3. Ejecuta el script setup-supabase-calificaciones.sql');
console.log('4. Regresa y ejecuta este script nuevamente');
console.log('5. Prueba la carga masiva en Admin → Configuración');

console.log('\n💡 TIP: Ejecuta crearTablasSupabase() para ver el SQL necesario');
console.log('=' .repeat(60));