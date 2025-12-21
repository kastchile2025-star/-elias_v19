-- 🗄️ CONFIGURACIÓN ESPECÍFICA SUPABASE
-- Proyecto: dbontnbpekcfpznqkmby.supabase.co
-- Ejecutar en: https://dbontnbpekcfpznqkmby.supabase.co/project/default/sql

-- ============================================================
-- PASO 1: CREAR TABLAS REQUERIDAS
-- ============================================================

-- Tabla principal: grades (calificaciones)
CREATE TABLE IF NOT EXISTS public.grades (
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

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS public.activities (
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

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS public.attendance (
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

-- ============================================================
-- PASO 2: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================

-- Índices para grades
CREATE INDEX IF NOT EXISTS idx_grades_year ON public.grades(year);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_test_id ON public.grades(test_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON public.grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_type ON public.grades(type);
CREATE INDEX IF NOT EXISTS idx_grades_graded_at ON public.grades(graded_at);

-- Índices para activities
CREATE INDEX IF NOT EXISTS idx_activities_year ON public.activities(year);
CREATE INDEX IF NOT EXISTS idx_activities_task_type ON public.activities(task_type);
CREATE INDEX IF NOT EXISTS idx_activities_course_id ON public.activities(course_id);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_by_id ON public.activities(assigned_by_id);

-- Índices para attendance
CREATE INDEX IF NOT EXISTS idx_attendance_year ON public.attendance(year);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- ============================================================
-- PASO 3: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASO 4: CREAR POLÍTICAS DE ACCESO
-- ============================================================

-- POLÍTICAS PARA GRADES
DROP POLICY IF EXISTS "grades_select_all" ON public.grades;
DROP POLICY IF EXISTS "grades_insert_all" ON public.grades;
DROP POLICY IF EXISTS "grades_update_all" ON public.grades;
DROP POLICY IF EXISTS "grades_delete_all" ON public.grades;

CREATE POLICY "grades_select_all" 
    ON public.grades FOR SELECT 
    USING (true);

CREATE POLICY "grades_insert_all" 
    ON public.grades FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "grades_update_all" 
    ON public.grades FOR UPDATE 
    USING (true);

CREATE POLICY "grades_delete_all" 
    ON public.grades FOR DELETE 
    USING (true);

-- POLÍTICAS PARA ACTIVITIES
DROP POLICY IF EXISTS "activities_select_all" ON public.activities;
DROP POLICY IF EXISTS "activities_insert_all" ON public.activities;
DROP POLICY IF EXISTS "activities_update_all" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_all" ON public.activities;

CREATE POLICY "activities_select_all" 
    ON public.activities FOR SELECT 
    USING (true);

CREATE POLICY "activities_insert_all" 
    ON public.activities FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "activities_update_all" 
    ON public.activities FOR UPDATE 
    USING (true);

CREATE POLICY "activities_delete_all" 
    ON public.activities FOR DELETE 
    USING (true);

-- POLÍTICAS PARA ATTENDANCE
DROP POLICY IF EXISTS "attendance_select_all" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert_all" ON public.attendance;
DROP POLICY IF EXISTS "attendance_update_all" ON public.attendance;
DROP POLICY IF EXISTS "attendance_delete_all" ON public.attendance;

CREATE POLICY "attendance_select_all" 
    ON public.attendance FOR SELECT 
    USING (true);

CREATE POLICY "attendance_insert_all" 
    ON public.attendance FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "attendance_update_all" 
    ON public.attendance FOR UPDATE 
    USING (true);

CREATE POLICY "attendance_delete_all" 
    ON public.attendance FOR DELETE 
    USING (true);

-- ============================================================
-- PASO 5: CREAR FUNCIONES DE UTILIDAD
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;

CREATE TRIGGER update_grades_updated_at 
    BEFORE UPDATE ON public.grades 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at 
    BEFORE UPDATE ON public.attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PASO 6: INSERTAR DATOS DE PRUEBA
-- ============================================================

-- Limpiar datos de prueba existentes
DELETE FROM public.grades WHERE id LIKE 'test_%';
DELETE FROM public.activities WHERE id LIKE 'test_%';

-- Insertar datos de prueba para grades
INSERT INTO public.grades (
    id, test_id, student_id, student_name, score, course_id, section_id, 
    subject_id, title, graded_at, year, type
) VALUES 
    ('test_grade_1', 'test_math_2025', 'student_ana', 'Ana Valenzuela', 85.5, '1ro_basico', 'seccion_a', 'matematicas', 'Prueba Matemáticas Enero', NOW(), 2025, 'prueba'),
    ('test_grade_2', 'test_history_2025', 'student_carlos', 'Carlos Cubillos', 92.0, '3ro_basico', 'seccion_a', 'historia', 'Evaluación Historia', NOW(), 2025, 'evaluacion'),
    ('test_grade_3', 'test_science_2025', 'student_maria', 'María González', 78.5, '2do_basico', 'seccion_b', 'ciencias', 'Tarea Ciencias Naturales', NOW(), 2025, 'tarea')
ON CONFLICT (id) DO UPDATE SET
    score = EXCLUDED.score,
    updated_at = NOW();

-- Insertar datos de prueba para activities
INSERT INTO public.activities (
    id, task_type, title, subject_id, subject_name, course_id, section_id,
    created_at, year, assigned_by_id, assigned_by_name, status
) VALUES
    ('test_activity_1', 'tarea', 'Tarea de Matemáticas', 'matematicas', 'Matemáticas', '1ro_basico', 'seccion_a', NOW(), 2025, 'teacher_ana', 'Ana López', 'active'),
    ('test_activity_2', 'evaluacion', 'Evaluación de Historia', 'historia', 'Historia, Geografía y Ciencias Sociales', '3ro_basico', 'seccion_a', NOW(), 2025, 'teacher_sofia', 'Sofía Martínez', 'active'),
    ('test_activity_3', 'prueba', 'Prueba de Ciencias', 'ciencias', 'Ciencias Naturales', '2do_basico', 'seccion_b', NOW(), 2025, 'teacher_pedro', 'Pedro Ramirez', 'pending')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();

-- ============================================================
-- PASO 7: VERIFICACIÓN FINAL
-- ============================================================

-- Contar registros en cada tabla
SELECT 
    'grades' AS tabla, 
    COUNT(*) AS total_registros,
    COUNT(*) FILTER (WHERE year = 2025) AS registros_2025
FROM public.grades
UNION ALL
SELECT 
    'activities' AS tabla, 
    COUNT(*) AS total_registros,
    COUNT(*) FILTER (WHERE year = 2025) AS registros_2025
FROM public.activities  
UNION ALL
SELECT 
    'attendance' AS tabla, 
    COUNT(*) AS total_registros,
    COUNT(*) FILTER (WHERE year = 2025) AS registros_2025
FROM public.attendance;

-- Verificar estructura de la tabla grades
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'grades' 
ORDER BY ordinal_position;

-- Verificar políticas RLS activas
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('grades', 'activities', 'attendance')
ORDER BY tablename, policyname;

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('grades', 'activities', 'attendance')
ORDER BY tablename, indexname;

-- ============================================================
-- ✅ CONFIGURACIÓN COMPLETADA
-- ============================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ CONFIGURACIÓN SUPABASE COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '📊 Tablas creadas: grades, activities, attendance';
    RAISE NOTICE '🔒 RLS habilitado con políticas permisivas';
    RAISE NOTICE '⚡ Índices optimizados creados';
    RAISE NOTICE '🧪 Datos de prueba insertados';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Ejecutar diagnostico-produccion-vercel.js en tu sitio';
    RAISE NOTICE '2. Verificar conexión SQL en Admin → Configuración';
    RAISE NOTICE '3. Probar carga masiva con archivo CSV pequeño';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Proyecto: https://dbontnbpekcfpznqkmby.supabase.co';
END $$;