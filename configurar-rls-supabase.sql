-- 🔧 CONFIGURACIÓN RLS Y POLÍTICAS - SUPABASE
-- Ejecutar en SQL Editor de Supabase (solo las políticas)
-- Ya que las tablas están creadas, solo necesitamos configurar acceso

-- ============================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CREAR POLÍTICAS DE ACCESO PERMISIVAS (DESARROLLO)
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
-- INSERTAR DATOS DE PRUEBA
-- ============================================================

-- Insertar calificaciones de prueba
INSERT INTO public.grades (
    id, test_id, student_id, student_name, score, course_id, section_id, 
    subject_id, title, graded_at, year, type
) VALUES 
    ('test_grade_1', 'test_math_2025', 'student_ana', 'Ana Valenzuela', 85.5, '1ro_basico', 'seccion_a', 'matematicas', 'Prueba Matemáticas', NOW(), 2025, 'prueba'),
    ('test_grade_2', 'test_history_2025', 'student_carlos', 'Carlos Cubillos', 92.0, '3ro_basico', 'seccion_a', 'historia', 'Evaluación Historia', NOW(), 2025, 'evaluacion'),
    ('test_grade_3', 'test_science_2025', 'student_maria', 'María González', 78.5, '2do_basico', 'seccion_b', 'ciencias', 'Tarea Ciencias', NOW(), 2025, 'tarea')
ON CONFLICT (id) DO NOTHING;

-- Insertar actividades de prueba
INSERT INTO public.activities (
    id, task_type, title, subject_id, subject_name, course_id, section_id,
    created_at, year, assigned_by_id, assigned_by_name
) VALUES
    ('test_activity_1', 'tarea', 'Tarea de Matemáticas', 'matematicas', 'Matemáticas', '1ro_basico', 'seccion_a', NOW(), 2025, 'teacher_ana', 'Ana López'),
    ('test_activity_2', 'evaluacion', 'Evaluación de Historia', 'historia', 'Historia y Geografía', '3ro_basico', 'seccion_a', NOW(), 2025, 'teacher_sofia', 'Sofía Martínez'),
    ('test_activity_3', 'prueba', 'Prueba de Ciencias', 'ciencias', 'Ciencias Naturales', '2do_basico', 'seccion_b', NOW(), 2025, 'teacher_pedro', 'Pedro Ramirez')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Contar registros insertados
SELECT 'grades' AS tabla, COUNT(*) AS registros FROM public.grades
UNION ALL
SELECT 'activities' AS tabla, COUNT(*) AS registros FROM public.activities
UNION ALL  
SELECT 'attendance' AS tabla, COUNT(*) AS registros FROM public.attendance;

-- Verificar que las políticas se crearon
SELECT 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('grades', 'activities', 'attendance')
ORDER BY tablename, policyname;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ CONFIGURACIÓN RLS COMPLETADA';
    RAISE NOTICE '🔒 Políticas permisivas habilitadas';
    RAISE NOTICE '🧪 Datos de prueba insertados';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMO PASO: Probar conexión desde la aplicación';
END $$;