-- ===========================================
-- TABLAS DE AGREGADOS PRECOMPUTADOS
-- ===========================================

-- KPIs por año (calificaciones y asistencia)
CREATE TABLE IF NOT EXISTS stats_kpis_year (
  year int PRIMARY KEY,
  students_count int,
  approved_count int,
  failed_count int,
  overall_avg_pct numeric(5,2),
  attendance_pct numeric(5,2),
  updated_at timestamptz DEFAULT now()
);

-- Agregados mensuales de asistencia (para el gráfico de tendencias)
CREATE TABLE IF NOT EXISTS stats_attendance_monthly (
  year int NOT NULL,
  month date NOT NULL, -- truncado al primer día del mes (2025-03-01, 2025-04-01, etc.)
  course_id uuid NULL,
  section_id uuid NULL,
  present bigint DEFAULT 0,
  total bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (year, month, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(section_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- Agregados por curso/sección (para comparación de cursos)
CREATE TABLE IF NOT EXISTS stats_attendance_section (
  year int NOT NULL,
  course_id uuid NULL,
  section_id uuid NULL,
  present bigint DEFAULT 0,
  total bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (year, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(section_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- ===========================================
-- ÍNDICES PARA ACELERAR CONSULTAS
-- ===========================================

-- Attendance: índices críticos
CREATE INDEX IF NOT EXISTS idx_att_year_date ON attendance (year, date);
CREATE INDEX IF NOT EXISTS idx_att_year_course_section_date ON attendance (year, course_id, section_id, date);
CREATE INDEX IF NOT EXISTS idx_att_student_year ON attendance (student_id, year);

-- Índice parcial para asistencias presentes (optimiza cálculos de %)
CREATE INDEX IF NOT EXISTS idx_att_year_present 
ON attendance (year, date) 
WHERE status = 'present' OR present = true;

-- Grades: índices críticos
CREATE INDEX IF NOT EXISTS idx_grade_year_student ON grades (year, student_id);
CREATE INDEX IF NOT EXISTS idx_grade_year_course_section ON grades (year, course_id, section_id);
CREATE INDEX IF NOT EXISTS idx_grade_year_graded_at ON grades (year, graded_at);

-- ===========================================
-- FUNCIONES PARA REFRESCAR AGREGADOS
-- ===========================================

-- Función: refrescar agregados de asistencia para un año
CREATE OR REPLACE FUNCTION refresh_attendance_stats_for_year(p_year int)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- 1) Agregados mensuales
  INSERT INTO stats_attendance_monthly (year, month, course_id, section_id, present, total, updated_at)
  SELECT
    a.year,
    date_trunc('month', a.date)::date AS month,
    a.course_id,
    a.section_id,
    SUM(CASE WHEN a.status = 'present' OR a.present IS TRUE THEN 1 ELSE 0 END) AS present,
    COUNT(*) AS total,
    now()
  FROM attendance a
  WHERE a.year = p_year
  GROUP BY a.year, date_trunc('month', a.date)::date, a.course_id, a.section_id
  ON CONFLICT (year, month, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(section_id, '00000000-0000-0000-0000-000000000000'::uuid)) 
  DO UPDATE SET 
    present = EXCLUDED.present, 
    total = EXCLUDED.total, 
    updated_at = now();

  -- 2) Agregados por curso/sección
  INSERT INTO stats_attendance_section (year, course_id, section_id, present, total, updated_at)
  SELECT
    a.year,
    a.course_id, 
    a.section_id,
    SUM(CASE WHEN a.status = 'present' OR a.present IS TRUE THEN 1 ELSE 0 END) AS present,
    COUNT(*) AS total,
    now()
  FROM attendance a
  WHERE a.year = p_year
  GROUP BY a.year, a.course_id, a.section_id
  ON CONFLICT (year, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(section_id, '00000000-0000-0000-0000-000000000000'::uuid)) 
  DO UPDATE SET 
    present = EXCLUDED.present, 
    total = EXCLUDED.total, 
    updated_at = now();

  -- 3) KPI de asistencia general del año
  INSERT INTO stats_kpis_year (year, attendance_pct, updated_at)
  SELECT
    p_year,
    CASE WHEN COUNT(*) > 0
         THEN ROUND(100.0 * SUM(CASE WHEN a.status = 'present' OR a.present IS TRUE THEN 1 ELSE 0 END) / COUNT(*), 2)
         ELSE NULL END,
    now()
  FROM attendance a
  WHERE a.year = p_year
  ON CONFLICT (year) DO UPDATE SET 
    attendance_pct = EXCLUDED.attendance_pct, 
    updated_at = now();
    
  RAISE NOTICE 'Attendance stats refreshed for year %', p_year;
END$$;

-- Función: refrescar KPIs de calificaciones para un año
CREATE OR REPLACE FUNCTION refresh_grades_kpis_for_year(p_year int, p_pass numeric DEFAULT 60)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_students_count int;
  v_approved_count int;
  v_failed_count int;
  v_overall_avg_pct numeric;
BEGIN
  -- Calcular KPIs de calificaciones
  SELECT
    COUNT(DISTINCT g.student_id),
    COUNT(*) FILTER (WHERE g.score >= p_pass OR (g.score <= 1 AND g.score * 100 >= p_pass)),
    COUNT(*) FILTER (WHERE g.score < p_pass OR (g.score <= 1 AND g.score * 100 < p_pass)),
    ROUND(AVG(CASE WHEN g.score <= 1 THEN g.score * 100 ELSE g.score END), 2)
  INTO v_students_count, v_approved_count, v_failed_count, v_overall_avg_pct
  FROM grades g
  WHERE g.year = p_year 
    AND g.score IS NOT NULL;

  -- Insertar o actualizar KPIs
  INSERT INTO stats_kpis_year (year, students_count, approved_count, failed_count, overall_avg_pct, updated_at)
  VALUES (p_year, v_students_count, v_approved_count, v_failed_count, v_overall_avg_pct, now())
  ON CONFLICT (year) DO UPDATE SET 
    students_count   = EXCLUDED.students_count,
    approved_count   = EXCLUDED.approved_count,
    failed_count     = EXCLUDED.failed_count,
    overall_avg_pct  = EXCLUDED.overall_avg_pct,
    updated_at       = now();
    
  RAISE NOTICE 'Grades KPIs refreshed for year %, pass threshold: %', p_year, p_pass;
END$$;

-- Función: refrescar todos los stats para un año
CREATE OR REPLACE FUNCTION refresh_all_stats_for_year(p_year int, p_pass numeric DEFAULT 60)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM refresh_attendance_stats_for_year(p_year);
  PERFORM refresh_grades_kpis_for_year(p_year, p_pass);
  RAISE NOTICE 'All stats refreshed for year %', p_year;
END$$;

-- ===========================================
-- TRIGGERS OPCIONALES (PARA AUTO-REFRESH)
-- ===========================================

-- Opcional: trigger para auto-refrescar stats cuando se insertan registros
-- (Cuidado: puede impactar performance en cargas masivas)
-- 
-- CREATE OR REPLACE FUNCTION trigger_refresh_attendance_stats()
-- RETURNS trigger
-- LANGUAGE plpgsql AS $$
-- BEGIN
--   -- Solo refrescar si han pasado más de 5 minutos desde la última actualización
--   IF NOT EXISTS (
--     SELECT 1 FROM stats_kpis_year 
--     WHERE year = COALESCE(NEW.year, OLD.year) 
--       AND updated_at > now() - interval '5 minutes'
--   ) THEN
--     PERFORM refresh_attendance_stats_for_year(COALESCE(NEW.year, OLD.year));
--   END IF;
--   RETURN COALESCE(NEW, OLD);
-- END$$;
-- 
-- CREATE TRIGGER trigger_att_stats_refresh
--   AFTER INSERT OR UPDATE OR DELETE ON attendance
--   FOR EACH ROW
--   WHEN (NEW.year IS DISTINCT FROM OLD.year OR NEW IS NULL OR OLD IS NULL)
--   EXECUTE FUNCTION trigger_refresh_attendance_stats();

-- ===========================================
-- COMANDOS DE USO
-- ===========================================

-- Para refrescar stats después de una carga masiva:
-- SELECT refresh_all_stats_for_year(2025);

-- Para ver los KPIs calculados:
-- SELECT * FROM stats_kpis_year WHERE year = 2025;

-- Para ver agregados mensuales:
-- SELECT * FROM stats_attendance_monthly WHERE year = 2025 ORDER BY month;

-- Para limpiar stats de un año:
-- DELETE FROM stats_attendance_monthly WHERE year = 2025;
-- DELETE FROM stats_attendance_section WHERE year = 2025;
-- DELETE FROM stats_kpis_year WHERE year = 2025;