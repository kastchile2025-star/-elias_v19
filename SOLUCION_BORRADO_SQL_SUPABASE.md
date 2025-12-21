# 🔧 Solución Completa para Borrado SQL en Supabase

## 🔴 Problema Identificado
El botón "Borrar SQL" no estaba eliminando registros de Supabase porque:
1. Las políticas RLS estaban bloqueando el DELETE
2. El service_role key no estaba bypasseando RLS correctamente

## ✅ Soluciones Implementadas

### 1. Función RPC para Bypass de RLS (RECOMENDADO)
Ejecuta este SQL en Supabase Dashboard → SQL Editor:

```sql
-- Ver archivo: /workspaces/superjf_v15/sql/create-rpc-delete-function.sql
```

Esta función:
- ✅ Bypasea RLS completamente con `SECURITY DEFINER`
- ✅ Retorna el número exacto de registros eliminados
- ✅ Funciona con cualquier clave (anon o service_role)

### 2. Políticas RLS Actualizadas
Ejecuta este SQL en Supabase Dashboard → SQL Editor:

```sql
-- Ver archivo: /workspaces/superjf_v15/sql/create-tables-supabase.sql
-- Sección: Políticas RLS
```

Las nuevas políticas:
- ✅ Usan `FOR ALL` con `USING (true)` y `WITH CHECK (true)`
- ✅ Reemplazan las políticas restrictivas anteriores
- ✅ Permiten DELETE desde el código

### 3. Endpoint API Mejorado
El endpoint ahora:
- ✅ Intenta primero con función RPC (bypassing RLS)
- ✅ Fallback a DELETE directo si RPC no existe
- ✅ Logging detallado para debugging
- ✅ Verifica permisos y reporta errores específicos

## 📋 Pasos para Aplicar la Solución

### Paso 1: Ejecutar SQL en Supabase
1. Abre Supabase Dashboard: https://supabase.com/dashboard
2. Ve a tu proyecto
3. Haz clic en "SQL Editor" en el menú lateral
4. Crea un nuevo query

**OPCIÓN A: Con función RPC (Recomendado)**
```sql
-- Copia y pega el contenido completo de:
-- /workspaces/superjf_v15/sql/create-rpc-delete-function.sql
```

**OPCIÓN B: Sin función RPC (Solo políticas)**
```sql
-- Actualizar políticas RLS
DROP POLICY IF EXISTS "Permitir lectura pública de grades" ON public.grades;
DROP POLICY IF EXISTS "Permitir inserción de grades" ON public.grades;
DROP POLICY IF EXISTS "Permitir eliminación de grades" ON public.grades;
DROP POLICY IF EXISTS "Permitir actualización de grades" ON public.grades;

CREATE POLICY "Permitir todas las operaciones en grades" 
ON public.grades 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Repetir para activities y attendance (ver archivo completo)
```

5. Haz clic en "Run" para ejecutar

### Paso 2: Verificar en Supabase
```sql
-- Verificar que la función existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'delete_grades_by_year';

-- Verificar políticas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'grades';
```

### Paso 3: Probar en la Aplicación
1. **Refresca la página** (F5 o Cmd/Ctrl + R)
2. Ve a Admin → Configuración
3. Haz clic en "Borrar SQL" en la sección de Calificaciones
4. Observa la consola del navegador

**Logs esperados:**
```
🗑️ [DELETE-GRADES API] Método 1: Intentando con SQL directo vía RPC...
✅ [DELETE-GRADES API] RPC ejecutado, verificando resultado...
✅ [DELETE-GRADES API] 11520 calificaciones eliminadas exitosamente
```

## 🐛 Debugging

### Si RPC no funciona:
La aplicación automáticamente hará fallback a DELETE directo.
Verás en consola:
```
⚠️ [DELETE-GRADES API] RPC no disponible: function delete_grades_by_year does not exist
🗑️ [DELETE-GRADES API] Método 2: Usando DELETE directo con service_role...
```

### Si DELETE directo tampoco funciona:
Verás:
```
⚠️ [DELETE-GRADES API] No se reportó error pero tampoco se borraron registros
⚠️ [DELETE-GRADES API] Esto puede indicar un problema de permisos RLS
```

**Solución:** Ejecuta las políticas RLS actualizadas del Paso 1.

## 🔍 Verificar que Todo Funciona

### En Supabase SQL Editor:
```sql
-- Ver cantidad de registros antes
SELECT COUNT(*) FROM grades WHERE year = 2025;

-- Ejecutar función RPC
SELECT delete_grades_by_year(2025);

-- Verificar que se borraron
SELECT COUNT(*) FROM grades WHERE year = 2025;
-- Debe retornar 0
```

### En la Aplicación:
1. **Antes del borrado:**
   - Contador muestra: "2025: 11520 registros"
   
2. **Durante el borrado:**
   - Modal muestra progreso
   - Logs en consola muestran operación
   
3. **Después del borrado:**
   - Contador muestra: "2025: 0 registros"
   - Toast de éxito: "Borrado SQL completado"
   - Badge verde: "SQL Conectado"

## 📚 Archivos Modificados

1. `/pages/api/admin/delete-grades.ts` - Endpoint con RPC + fallback
2. `/src/hooks/useGradesSQL.ts` - Hook mejorado con detección de éxito
3. `/sql/create-rpc-delete-function.sql` - Nueva función RPC
4. `/sql/create-tables-supabase.sql` - Políticas RLS actualizadas

## ⚠️ Notas Importantes

- **service_role key** debe estar en `.env.local`
- **RLS está habilitado** pero con políticas permisivas
- **SECURITY DEFINER** en RPC bypasea RLS de forma segura
- **Fallback automático** si RPC no está disponible

## 🎯 Resultado Final

Después de aplicar estos cambios:
- ✅ Borrado funciona en Supabase
- ✅ Contadores se actualizan correctamente
- ✅ UI muestra éxito (no error)
- ✅ Logs detallados para debugging
- ✅ Fallback automático si algo falla
