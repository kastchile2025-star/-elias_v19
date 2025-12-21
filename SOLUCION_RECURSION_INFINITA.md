# 🔧 Solución: Error de Recursión Infinita en Carga Masiva

## 📋 Problema Identificado

Se detectó un error de **recursión infinita** (`Maximum call stack size exceeded`) causado por:

1. La función `deepClearAttendanceYear` dentro de `getSystemStatistics()` disparaba el evento `attendanceChanged`
2. Había **dos listeners** escuchando `attendanceChanged`:
   - Uno en la línea ~1875
   - Otro en la línea ~2366
3. Ambos listeners llamaban a `getSystemStatistics()` nuevamente
4. Esto creaba un **bucle infinito**: 
   ```
   getSystemStatistics() → deepClearAttendanceYear() → evento attendanceChanged 
   → listener → getSystemStatistics() → [BUCLE]
   ```

## ✅ Solución Implementada

**Archivo modificado**: `/workspaces/superjf_v17/src/components/admin/user-management/configuration.tsx`

**Cambio realizado** (línea ~2297):
- **ANTES**: `window.dispatchEvent(new CustomEvent('attendanceChanged', { detail: { action: 'deep-clear', year } }))`
- **DESPUÉS**: Se eliminó el dispatch del evento desde `deepClearAttendanceYear` con el comentario:
  ```typescript
  // 6. NO disparar evento aquí para evitar recursión infinita
  // El evento se disparará cuando sea necesario desde otras funciones
  ```

## 🎯 Resultado Esperado

Después de esta corrección:

1. ✅ La aplicación ya **no se congelará** al cargar la página de configuración
2. ✅ La **carga masiva de Excel** funcionará correctamente
3. ✅ No habrá más errores de `Maximum call stack size exceeded`
4. ✅ Las estadísticas del sistema se calcularán sin bucles infinitos

## 🧪 Cómo Probar

### Paso 1: Verificar que no hay más errores
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Refresca la página (F5)
4. **NO deberías ver** más mensajes de:
   - `Uncaught RangeError: Maximum call stack size exceeded`
   - `[DEBUG ASISTENCIA]` repitiéndose infinitamente

### Paso 2: Probar la carga masiva
1. Ve a **Módulo Admin** → **Configuración**
2. Busca la sección **"Carga masiva por Excel"**
3. Haz clic en **"Descargar plantilla"** para obtener el archivo de ejemplo
4. Llena el Excel con datos de prueba:
   ```
   role     | name          | rut          | email              | username    | password | course      | section | subjects
   student  | Juan Pérez    | 12345678-9   | juan@test.com      | juan.perez  | 1234     | 1ro Básico  | A       |
   teacher  | Ana López     | 11111111-1   | ana@test.com       | ana.lopez   | 1234     |             |         | MAT, LEN
   admin    | Admin Test    | 99999999-9   | admin@test.com     | admin       | 1234     |             |         |
   ```
5. Sube el archivo Excel
6. Debería procesarse correctamente y mostrar:
   - ✅ Un modal con el resumen de importación
   - ✅ Notificación de éxito
   - ✅ Los usuarios creados en el sistema

### Paso 3: Verificar logs en consola
Durante la carga deberías ver logs como:
```
🎬 [CARGA EXCEL] Handler ejecutado
📁 [CARGA EXCEL] Archivo seleccionado: users-template.xlsx
🚀 [CARGA EXCEL] Iniciando proceso de carga...
📦 [CARGA EXCEL] Importando biblioteca XLSX...
📖 [CARGA EXCEL] Leyendo archivo...
...
✅ [CARGA EXCEL] Usuarios guardados exitosamente
🎉 [CARGA EXCEL] Proceso completado exitosamente!
```

## 📝 Notas Adicionales

- La función `deepClearAttendanceYear` sigue funcionando para limpiar datos huérfanos
- Solo se removió el evento que causaba la recursión
- Los eventos de cambio de datos se disparan desde otras funciones cuando es necesario
- Esta corrección **no afecta** otras funcionalidades del sistema

## 🐛 Si Persisten Problemas

Si aún encuentras errores después de esta corrección:

1. Limpia el caché del navegador:
   - Chrome/Edge: Ctrl + Shift + Delete → "Cached images and files"
   - O en modo incógnito: Ctrl + Shift + N

2. Limpia localStorage (solo si es necesario):
   ```javascript
   // En consola del navegador
   localStorage.clear();
   location.reload();
   ```

3. Verifica que el archivo modificado se está usando:
   ```bash
   # En terminal
   npm run dev
   ```

4. Reporta el nuevo error con:
   - Captura de pantalla
   - Logs de consola completos
   - Pasos para reproducir
