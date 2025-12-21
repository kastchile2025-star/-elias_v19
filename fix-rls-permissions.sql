-- 🔧 DIAGNÓSTICO Y CORRECCIÓN DE PERMISOS RLS
-- Ejecutar en el SQL Editor de Supabase

-- 1. VERIFICAR ESTADO ACTUAL DE LAS TABLAS
SELECT schemaname, tablename, hasinserts, hasupdates, hasdeletes, hasselects, hasrls
FROM pg_tables 
WHERE tablename IN ('grades', 'activities', 'attendance')
  AND schemaname = 'public';

-- 2. VERIFICAR POLÍTICAS EXISTENTES
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename IN ('grades', 'activities', 'attendance')
ORDER BY tablename, policyname;

-- 3. VERIFICAR SI RLS ESTÁ HABILITADO
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('grades', 'activities', 'attendance')
  AND schemaname = 'public';

-- 4. RECREAR POLÍTICAS PERMISIVAS PARA ASEGURAR BORRADO

-- Eliminar políticas existentes para grades
DROP POLICY IF EXISTS "grades_select_all" ON grades;
DROP POLICY IF EXISTS "grades_insert_all" ON grades;
DROP POLICY IF EXISTS "grades_update_all" ON grades;
DROP POLICY IF EXISTS "grades_delete_all" ON grades;

-- Crear políticas completamente permisivas para grades
CREATE POLICY "grades_select_all" ON grades FOR SELECT USING (true);
CREATE POLICY "grades_insert_all" ON grades FOR INSERT WITH CHECK (true);
CREATE POLICY "grades_update_all" ON grades FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "grades_delete_all" ON grades FOR DELETE USING (true);

-- Eliminar políticas existentes para activities
DROP POLICY IF EXISTS "activities_select_all" ON activities;
DROP POLICY IF EXISTS "activities_insert_all" ON activities;
DROP POLICY IF EXISTS "activities_update_all" ON activities;
DROP POLICY IF EXISTS "activities_delete_all" ON activities;

-- Crear políticas completamente permisivas para activities
CREATE POLICY "activities_select_all" ON activities FOR SELECT USING (true);
CREATE POLICY "activities_insert_all" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "activities_update_all" ON activities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "activities_delete_all" ON activities FOR DELETE USING (true);

-- Eliminar políticas existentes para attendance
DROP POLICY IF EXISTS "attendance_select_all" ON attendance;
DROP POLICY IF EXISTS "attendance_insert_all" ON attendance;
DROP POLICY IF EXISTS "attendance_update_all" ON attendance;
DROP POLICY IF EXISTS "attendance_delete_all" ON attendance;

-- Crear políticas completamente permisivas para attendance
CREATE POLICY "attendance_select_all" ON attendance FOR SELECT USING (true);
CREATE POLICY "attendance_insert_all" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update_all" ON attendance FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "attendance_delete_all" ON attendance FOR DELETE USING (true);

-- 5. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename IN ('grades', 'activities', 'attendance')
ORDER BY tablename, cmd;

-- 6. PROBAR BORRADO DIRECTO (OPCIONAL)
-- DESCOMENTA ESTAS LÍNEAS SOLO PARA PROBAR
/*
-- Contar registros antes
SELECT COUNT(*) as total_grades FROM grades WHERE year = 2025;

-- Intentar borrar un registro específico
DELETE FROM grades WHERE year = 2025 AND id = (
    SELECT id FROM grades WHERE year = 2025 LIMIT 1
);

-- Contar registros después
SELECT COUNT(*) as total_grades_after FROM grades WHERE year = 2025;
*/

-- 7. MENSAJE DE CONFIRMACIÓN
SELECT 'Políticas RLS actualizadas correctamente. Prueba el borrado desde la aplicación.' as mensaje;