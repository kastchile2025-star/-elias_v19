-- 🗄️ CONFIGURACIÓN SUPABASE PARA CARGA MASIVA
-- Ejecutar estos comandos en el SQL Editor de Supabase

-- 1. CREAR TABLAS NECESARIAS

-- Tabla de calificaciones (grades)
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  course_id TEXT,
  section_id TEXT,
  subject_id TEXT,
  title TEXT NOT NULL,
  graded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
  type TEXT NOT NULL CHECK (type IN ('tarea', 'prueba', 'evaluacion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividades (activities)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('tarea', 'prueba', 'evaluacion')),
  title TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  course_id TEXT,
  section_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE,
  open_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  assigned_by_id TEXT,
  assigned_by_name TEXT,
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030)
);

-- Tabla de asistencia (attendance)
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  course_id TEXT,
  section_id TEXT,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  present BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030)
);

-- 2. CREAR ÍNDICES PARA MEJOR RENDIMIENTO

-- Índices para grades
CREATE INDEX IF NOT EXISTS idx_grades_year ON grades(year);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_test_id ON grades(test_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_type ON grades(type);
CREATE INDEX IF NOT EXISTS idx_grades_graded_at ON grades(graded_at);

-- Índices para activities
CREATE INDEX IF NOT EXISTS idx_activities_year ON activities(year);
CREATE INDEX IF NOT EXISTS idx_activities_task_type ON activities(task_type);
CREATE INDEX IF NOT EXISTS idx_activities_course_id ON activities(course_id);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_by_id ON activities(assigned_by_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Índices para attendance
CREATE INDEX IF NOT EXISTS idx_attendance_year ON attendance(year);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS DE ACCESO (PERMISIVAS PARA DESARROLLO)

-- NOTA: En producción, ajustar estas políticas según tus necesidades de seguridad

-- Políticas para grades
DROP POLICY IF EXISTS "grades_select_all" ON grades;
DROP POLICY IF EXISTS "grades_insert_all" ON grades;
DROP POLICY IF EXISTS "grades_update_all" ON grades;
DROP POLICY IF EXISTS "grades_delete_all" ON grades;

CREATE POLICY "grades_select_all" ON grades FOR SELECT USING (true);
CREATE POLICY "grades_insert_all" ON grades FOR INSERT WITH CHECK (true);
CREATE POLICY "grades_update_all" ON grades FOR UPDATE USING (true);
CREATE POLICY "grades_delete_all" ON grades FOR DELETE USING (true);

-- Políticas para activities
DROP POLICY IF EXISTS "activities_select_all" ON activities;
DROP POLICY IF EXISTS "activities_insert_all" ON activities;
DROP POLICY IF EXISTS "activities_update_all" ON activities;
DROP POLICY IF EXISTS "activities_delete_all" ON activities;

CREATE POLICY "activities_select_all" ON activities FOR SELECT USING (true);
CREATE POLICY "activities_insert_all" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "activities_update_all" ON activities FOR UPDATE USING (true);
CREATE POLICY "activities_delete_all" ON activities FOR DELETE USING (true);

-- Políticas para attendance
DROP POLICY IF EXISTS "attendance_select_all" ON attendance;
DROP POLICY IF EXISTS "attendance_insert_all" ON attendance;
DROP POLICY IF EXISTS "attendance_update_all" ON attendance;
DROP POLICY IF EXISTS "attendance_delete_all" ON attendance;

CREATE POLICY "attendance_select_all" ON attendance FOR SELECT USING (true);
CREATE POLICY "attendance_insert_all" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update_all" ON attendance FOR UPDATE USING (true);
CREATE POLICY "attendance_delete_all" ON attendance FOR DELETE USING (true);

-- 5. CREAR FUNCIONES AUXILIARES

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_grades_updated_at ON grades;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;

CREATE TRIGGER update_grades_updated_at 
    BEFORE UPDATE ON grades 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at 
    BEFORE UPDATE ON attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERTAR DATOS DE PRUEBA (OPCIONAL)

-- Datos de prueba para grades
INSERT INTO grades (
  id, test_id, student_id, student_name, score, course_id, section_id, 
  subject_id, title, graded_at, year, type
) VALUES 
  ('test_grade_1', 'test_1', 'student_1', 'Ana Valenzuela', 85.5, 'course_1', 'section_a', 'math', 'Prueba Matemáticas', NOW(), 2025, 'prueba'),
  ('test_grade_2', 'test_2', 'student_2', 'Carlos Cubillos', 92.0, 'course_1', 'section_a', 'history', 'Evaluación Historia', NOW(), 2025, 'evaluacion')
ON CONFLICT (id) DO NOTHING;

-- Datos de prueba para activities  
INSERT INTO activities (
  id, task_type, title, subject_id, subject_name, course_id, section_id,
  created_at, year, assigned_by_id, assigned_by_name
) VALUES
  ('activity_1', 'tarea', 'Tarea de Matemáticas', 'math', 'Matemáticas', 'course_1', 'section_a', NOW(), 2025, 'teacher_1', 'Ana López'),
  ('activity_2', 'evaluacion', 'Evaluación de Historia', 'history', 'Historia', 'course_1', 'section_a', NOW(), 2025, 'teacher_2', 'Sofía Martínez')
ON CONFLICT (id) DO NOTHING;

-- 7. VERIFICACIÓN FINAL

-- Contar registros en cada tabla
SELECT 'grades' AS tabla, COUNT(*) AS registros FROM grades
UNION ALL
SELECT 'activities' AS tabla, COUNT(*) AS registros FROM activities  
UNION ALL
SELECT 'attendance' AS tabla, COUNT(*) AS registros FROM attendance;

-- Verificar estructura de grades
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'grades' 
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename IN ('grades', 'activities', 'attendance')
ORDER BY tablename, policyname;

-- 8. COMANDOS DE LIMPIEZA (SI NECESITAS EMPEZAR DE CERO)

/*
-- DESCOMENTA ESTAS LÍNEAS SOLO SI NECESITAS ELIMINAR TODO

DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS activities CASCADE; 
DROP TABLE IF EXISTS attendance CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

*/

-- ✅ CONFIGURACIÓN COMPLETADA
-- Próximo paso: Configurar variables de entorno en tu aplicación