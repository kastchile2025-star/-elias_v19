# 🔧 Solución: Configurar Tablas en Supabase

## ❌ Problema Actual

El error `"Error al contar calificaciones"` indica que las tablas no existen en Supabase o no tienen los permisos correctos.

## ✅ Solución (3 Pasos)

### **Paso 1: Abrir Supabase Dashboard**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **dbontnbpekcfpznqkmby**
3. En el menú lateral, haz clic en **"SQL Editor"**

### **Paso 2: Ejecutar Script SQL**

1. En el SQL Editor, copia y pega el contenido completo del archivo:
   ```
   /workspaces/superjf_v15/sql/create-tables-supabase.sql
   ```

2. Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter`)

3. Deberías ver: `Success. No rows returned`

### **Paso 3: Verificar que las Tablas Existen**

Ejecuta esta consulta en el SQL Editor:

```sql
SELECT 
    'grades' as tabla, COUNT(*) as registros 
FROM public.grades
UNION ALL
SELECT 
    'activities', COUNT(*) 
FROM public.activities
UNION ALL
SELECT 
    'attendance', COUNT(*) 
FROM public.attendance;
```

Deberías ver algo como:

```
tabla       | registros
------------|----------
grades      | 0
activities  | 0
attendance  | 0
```

## 🎯 Qué Crea el Script

El script SQL crea:

✅ **3 Tablas:**
- `grades` - Calificaciones (tareas, pruebas, evaluaciones)
- `activities` - Actividades/burbujas
- `attendance` - Asistencia

✅ **Índices** para mejorar el rendimiento

✅ **Políticas RLS (Row Level Security)** que permiten:
- Lectura pública (SELECT)
- Inserción, actualización y eliminación con service_role

## 🔐 Permisos

Las políticas RLS configuradas permiten:

- ✅ **Lectura**: Cualquiera puede leer (SELECT)
- ✅ **Escritura**: Solo con service_role key (INSERT, UPDATE, DELETE)
- ✅ **Borrado Masivo**: El endpoint `/api/admin/delete-grades` usa service_role key

## 🧪 Después de Ejecutar el Script

1. **Recarga la página** del panel de administración
2. Prueba el botón **"Borrar SQL"** nuevamente
3. Debería funcionar correctamente ✅

## 📝 Alternativa: Crear Tablas Manualmente

Si prefieres crear las tablas manualmente:

1. Ve a: **Database → Tables**
2. Haz clic en **"Create a new table"**
3. Crea tabla `grades` con las columnas del script
4. Repite para `activities` y `attendance`

## ⚠️ Nota Importante

**El script es idempotente** (usa `IF NOT EXISTS`), por lo que puedes ejecutarlo múltiples veces sin problemas. No borrará datos existentes.

---

## 🆘 Si Persiste el Error

Si después de ejecutar el script SQL el error continúa:

1. Verifica que las variables de entorno estén correctas en `.env.local`
2. Reinicia el servidor: `Ctrl+C` → `npm run dev`
3. Verifica que el endpoint de diagnóstico funcione:
   - Abre: http://localhost:9002/api/admin/test-supabase
   - Deberías ver información sobre las tablas

---

**Una vez ejecutado el script SQL, el botón "Borrar SQL" funcionará correctamente.** 🎉
