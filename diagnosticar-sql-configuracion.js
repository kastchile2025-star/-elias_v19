// 🔧 DIAGNÓSTICO Y SOLUCIÓN: Configuración SQL en Panel Admin
// Ejecutar en la consola del navegador cuando estés en Admin → Configuración

console.log('🔍 DIAGNÓSTICO: Configuración SQL');
console.log('=' .repeat(80));

// 1. Verificar variables de entorno
console.log('\n📋 1. VARIABLES DE ENTORNO:');
console.log('─'.repeat(80));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ No configurada');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? `✅ ${supabaseKey.substring(0, 20)}...` : '❌ No configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ PROBLEMA IDENTIFICADO: Variables de entorno faltantes');
  console.log('\n💡 SOLUCIÓN:');
  console.log('1. Crea/edita el archivo .env.local en la raíz del proyecto:');
  console.log('\n   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui');
  console.log('\n2. Reinicia el servidor de desarrollo: npm run dev');
  console.log('\n3. Recarga la página');
  console.log('=' .repeat(80));
} else {
  // 2. Verificar conexión SQL
  console.log('\n📡 2. PRUEBA DE CONEXIÓN SQL:');
  console.log('─'.repeat(80));
  
  (async () => {
    try {
      // Importar módulos necesarios
      const { sqlDatabase } = await import('./src/lib/sql-database.ts');
      const { isSQLConnected, getSQLStatus } = await import('./src/lib/sql-init.ts');
      
      console.log('Estado SQL actual:', getSQLStatus());
      console.log('SQL conectado:', isSQLConnected() ? '✅ SÍ' : '❌ NO');
      
      console.log('\n🔄 Probando conexión directa...');
      const result = await sqlDatabase.testConnection();
      
      if (result.success) {
        console.log('✅ CONEXIÓN EXITOSA a Supabase');
        console.log('\n📊 Verificando tablas...');
        
        // Contar registros
        try {
          const totalGrades = await sqlDatabase.countAllGrades();
          const currentYear = new Date().getFullYear();
          const yearGrades = await sqlDatabase.countGradesByYear(currentYear);
          
          console.log(`\n📈 Calificaciones:`);
          console.log(`   Total: ${totalGrades.total} registros`);
          console.log(`   Año ${currentYear}: ${yearGrades.count} registros`);
          
          // Si la conexión es exitosa pero no se muestra en la UI
          if (!isSQLConnected()) {
            console.log('\n⚠️ PROBLEMA: La conexión funciona pero el estado global no se actualizó');
            console.log('💡 SOLUCIÓN: Reinicializar SQL...');
            
            const { initializeSQL } = await import('./src/lib/sql-init.ts');
            await initializeSQL(true);
            
            console.log('✅ SQL reinicializado. Recarga la página.');
          }
        } catch (e) {
          console.warn('⚠️ Error al contar registros:', e.message);
        }
      } else {
        console.error('❌ ERROR DE CONEXIÓN:', result.error);
        console.log('\n💡 POSIBLES CAUSAS:');
        console.log('1. Tablas faltantes en Supabase (grades, activities, attendance)');
        console.log('2. Políticas RLS mal configuradas');
        console.log('3. Variables de entorno incorrectas');
        console.log('\n🔧 CREAR TABLAS EN SUPABASE:');
        console.log('Ejecuta este SQL en Supabase SQL Editor:');
        console.log(`
-- Tabla de calificaciones
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
  graded_at TIMESTAMPTZ NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tarea', 'prueba', 'evaluacion')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('tarea', 'prueba', 'evaluacion')),
  title TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  course_id TEXT,
  section_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  start_at TIMESTAMPTZ,
  open_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  status TEXT,
  assigned_by_id TEXT,
  assigned_by_name TEXT,
  year INTEGER NOT NULL
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  course_id TEXT,
  section_id TEXT,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  present BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  year INTEGER NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_grades_year ON grades(year);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_year ON activities(year);
CREATE INDEX IF NOT EXISTS idx_attendance_year ON attendance(year);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);

-- Políticas RLS (permitir todo para anon - ajustar según necesidad)
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all for anon" ON grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for anon" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for anon" ON attendance FOR ALL USING (true) WITH CHECK (true);
        `);
      }
    } catch (e) {
      console.error('❌ Error durante diagnóstico:', e);
      console.log('\n💡 SOLUCIÓN: Asegúrate de estar en la página de Admin → Configuración');
      console.log('   y que el servidor esté ejecutándose (npm run dev)');
    }
  })();
}

console.log('\n🔄 3. REINICIAR MANUALMENTE (si es necesario):');
console.log('─'.repeat(80));
console.log('Si después de configurar las variables de entorno sigue sin funcionar:');
console.log('\n// Ejecuta esto en la consola:');
console.log(`
(async () => {
  const { initializeSQL } = await import('./src/lib/sql-init.ts');
  const success = await initializeSQL(true);
  console.log('Reinicialización SQL:', success ? '✅ Exitosa' : '❌ Fallida');
  if (success) {
    window.location.reload();
  }
})();
`);

console.log('\n📝 RESUMEN DE PASOS:');
console.log('─'.repeat(80));
console.log('1. Verifica variables de entorno en .env.local');
console.log('2. Crea las tablas en Supabase con el SQL proporcionado');
console.log('3. Reinicia el servidor de desarrollo');
console.log('4. Recarga la página de Admin → Configuración');
console.log('5. Verifica que el estado SQL muestre "✅ SQL Conectado"');
console.log('=' .repeat(80));
