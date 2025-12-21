-- =====================================================
-- Función RPC para borrar calificaciones por año
-- Esta función bypasea RLS cuando se ejecuta con service_role
-- =====================================================

-- Crear la función que borra calificaciones por año
CREATE OR REPLACE FUNCTION delete_grades_by_year(p_year INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios del owner (bypassing RLS)
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Borrar calificaciones del año especificado
  DELETE FROM public.grades
  WHERE year = p_year;
  
  -- Obtener el número de filas eliminadas
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Retornar el conteo
  RETURN deleted_count;
END;
$$;

-- Dar permisos de ejecución a usuarios autenticados y anon
GRANT EXECUTE ON FUNCTION delete_grades_by_year(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_grades_by_year(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION delete_grades_by_year(INTEGER) TO service_role;

-- =====================================================
-- Función RPC para borrar actividades por año
-- =====================================================

CREATE OR REPLACE FUNCTION delete_activities_by_year(p_year INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.activities
  WHERE year = p_year;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_activities_by_year(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_activities_by_year(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION delete_activities_by_year(INTEGER) TO service_role;

-- =====================================================
-- Función RPC para borrar asistencias por año
-- =====================================================

CREATE OR REPLACE FUNCTION delete_attendance_by_year(p_year INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.attendance
  WHERE year = p_year;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_attendance_by_year(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_attendance_by_year(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION delete_attendance_by_year(INTEGER) TO service_role;

-- =====================================================
-- Verificación
-- =====================================================
-- Para probar la función:
-- SELECT delete_grades_by_year(2025);
