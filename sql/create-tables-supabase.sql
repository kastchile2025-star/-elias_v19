-- =====================================================
-- Script para crear tablas en Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =====================================================

-- Tabla: grades (calificaciones)
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
    graded_at TIMESTAMPTZ NOT NULL,
    year INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('tarea', 'prueba', 'evaluacion')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_grades_year ON public.grades(year);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_test_id ON public.grades(test_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_section ON public.grades(course_id, section_id);

-- Tabla: activities (actividades/burbujas)
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL CHECK (task_type IN ('tarea', 'prueba', 'evaluacion')),
    title TEXT NOT NULL,
    subject_id TEXT,
    subject_name TEXT,
    course_id TEXT,
    section_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_at TIMESTAMPTZ,
    open_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    status TEXT,
    assigned_by_id TEXT,
    assigned_by_name TEXT,
    year INTEGER NOT NULL
);

-- Índices para activities
CREATE INDEX IF NOT EXISTS idx_activities_year ON public.activities(year);
CREATE INDEX IF NOT EXISTS idx_activities_course_section ON public.activities(course_id, section_id);

-- Tabla: attendance (asistencia)
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL,
    course_id TEXT,
    section_id TEXT,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    present BOOLEAN,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    year INTEGER NOT NULL
);

-- Índices para attendance
CREATE INDEX IF NOT EXISTS idx_attendance_year ON public.attendance(year);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_course_section ON public.attendance(course_id, section_id);

-- =====================================================
-- Políticas RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Estas políticas permiten todas las operaciones.
-- El service_role key bypassea RLS por defecto, pero las definimos por seguridad.

-- Políticas para grades
DROP POLICY IF EXISTS "Permitir lectura pública de grades" ON public.grades;
DROP POLICY IF EXISTS "Permitir inserción de grades" ON public.grades;
DROP POLICY IF EXISTS "Permitir eliminación de grades" ON public.grades;
DROP POLICY IF EXISTS "Permitir actualización de grades" ON public.grades;

CREATE POLICY "Permitir todas las operaciones en grades" 
ON public.grades 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas para activities
DROP POLICY IF EXISTS "Permitir lectura pública de activities" ON public.activities;
DROP POLICY IF EXISTS "Permitir inserción de activities" ON public.activities;
DROP POLICY IF EXISTS "Permitir eliminación de activities" ON public.activities;
DROP POLICY IF EXISTS "Permitir actualización de activities" ON public.activities;

CREATE POLICY "Permitir todas las operaciones en activities" 
ON public.activities 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas para attendance
DROP POLICY IF EXISTS "Permitir lectura pública de attendance" ON public.attendance;
DROP POLICY IF EXISTS "Permitir inserción de attendance" ON public.attendance;
DROP POLICY IF EXISTS "Permitir eliminación de attendance" ON public.attendance;
DROP POLICY IF EXISTS "Permitir actualización de attendance" ON public.attendance;

CREATE POLICY "Permitir todas las operaciones en attendance" 
ON public.attendance 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- =====================================================
-- Verificación
-- =====================================================
-- Ejecutar estas consultas para verificar que todo funciona:

-- SELECT COUNT(*) FROM public.grades;
-- SELECT COUNT(*) FROM public.activities;
-- SELECT COUNT(*) FROM public.attendance;
