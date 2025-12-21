// 🔧 DIAGNÓSTICO Y SOLUCIÓN: Configuración SQL en Panel Admin
// Ejecutar en la consola del navegador cuando estés en Admin → Configuración

console.log('🔍 DIAGNÓSTICO: Configuración SQL (bridge)');
console.log('='.repeat(80));

// 1) Verificar disponibilidad del bridge expuesto por la UI
console.log('\n📋 1. BRIDGE DISPONIBLE:');
console.log('─'.repeat(80));

(async () => {
  try {
    if (!window.sqlGlobal) {
      console.warn('Bridge window.sqlGlobal no disponible aún. Esperando 800ms...');
      await new Promise(r => setTimeout(r, 800));
    }
    const G = window.sqlGlobal || {};
    const { sqlDatabase, isSQLConnected, getSQLStatus, initializeSQL, isSupabaseEnabled, setForceIDB } = G;
    if (!sqlDatabase || !isSQLConnected || !getSQLStatus) {
      throw new Error('Bridge SQL no disponible. Abre Admin → Configuración y espera ~2s.');
    }

    console.log('Bridge OK:', Object.keys(G));
    const status = getSQLStatus();
    console.log('Estado SQL actual:', status);
    console.log('SQL conectado:', isSQLConnected() ? '✅ SÍ' : '❌ NO');

    // 2) Probar conexión real si el proveedor Supabase está habilitado
    console.log('\n📡 2. PRUEBA DE CONEXIÓN SQL:');
    console.log('─'.repeat(80));

    let tested = { success: false, error: 'no-test' };
    try { tested = await sqlDatabase.testConnection(); } catch (e) { tested = { success: false, error: e?.message || String(e) }; }

    if (tested.success) {
      console.log('✅ CONEXIÓN EXITOSA a Supabase');
      try {
        const totalGrades = await sqlDatabase.countAllGrades();
        const currentYear = new Date().getFullYear();
        const yearGrades = await sqlDatabase.countGradesByYear(currentYear);
        console.log('📈 Calificaciones totales:', totalGrades?.total ?? 'N/A');
        console.log(`📈 Año ${currentYear}:`, yearGrades?.count ?? 'N/A');
      } catch {}
      if (!isSQLConnected()) {
        console.log('⚠️ Conexión exitosa pero estado global no actualizado → reinicializando...');
        try { await initializeSQL(true); console.log('✅ Reinicializado. Recarga la página.'); } catch {}
      }
    } else {
      console.warn('❌ PRUEBA FALLIDA:', tested.error);
      console.log('\n💡 POSIBLES CAUSAS:');
      console.log('1) Supabase no configurado en variables públicas');
      console.log('2) Tablas/RLS no creadas');
      console.log('3) Red/bloqueo de CORS');

      // Ofrecer fallback a IndexedDB si no hay Supabase
      try {
        const supaEnabled = typeof isSupabaseEnabled === 'function' ? isSupabaseEnabled() : false;
        if (!supaEnabled && typeof setForceIDB === 'function') {
          console.log('\n🔁 Activando fallback IndexedDB y reinicializando...');
          setForceIDB(true);
          const ok = await initializeSQL(true);
          console.log('Estado tras fallback:', ok ? '✅ Activo (IDB)' : '❌ Falló reinicialización');
        }
      } catch {}

      console.log('\n🛠️ CREAR TABLAS EN SUPABASE (si aplica):');
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

console.log('\n📝 RESUMEN DE PASOS:');
console.log('─'.repeat(80));
console.log('1) Abre Admin → Configuración y espera ver el log "[SQL-Bridge]"');
console.log('2) Ejecuta: const s=document.createElement("script"); s.src="/diagnosticar-sql-configuracion.js"; document.head.appendChild(s)');
console.log('3) Si falla Supabase, el script intentará activar IndexedDB como fallback');
console.log('4) Si deseas forzar IndexedDB: window.sqlGlobal.setForceIDB(true); await window.sqlGlobal.initializeSQL(true); location.reload()');
console.log('='.repeat(80));
