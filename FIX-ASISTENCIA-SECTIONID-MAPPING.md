# 🔧 Fix: Mapeo correcto de sectionId en Carga Masiva de Asistencia

## 📋 Problema Identificado

Después de realizar la carga masiva de asistencia desde el CSV, los registros se guardaban correctamente en Firebase pero **NO aparecían en la pestaña de Asistencia** para ningún estudiante.

### Causa Raíz

El endpoint de carga masiva (`/api/firebase/bulk-upload-attendance`) estaba guardando los registros con el campo `section: "A"` (string) pero **NO** estaba guardando el campo `sectionId` (ID numérico/alfanumérico).

La pestaña de Asistencia filtra los registros usando `sectionId`, por lo tanto, al no tener este campo, los registros no podían ser asociados correctamente con los estudiantes de cada sección.

## 🛠️ Solución Implementada

### 1. Endpoint API Modificado
**Archivo:** `/workspaces/peloduro_v2/src/app/api/firebase/bulk-upload-attendance/route.ts`

#### Cambios:
1. **Construcción de mapa de secciones:**
   - El endpoint ahora recibe `sections` y `courses` desde el formData
   - Construye un mapa `"Curso|Sección" → sectionId`
   - Ejemplo: `"1ro Básico|A" → "123"`

2. **Mapeo durante procesamiento:**
   - Para cada fila del CSV, busca el `sectionId` correcto usando el mapa
   - Si no encuentra el mapeo, registra una advertencia pero continúa el proceso

3. **Guardado en Firebase:**
   - Ahora guarda **AMBOS** campos:
     - `section: "A"` (nombre legible)
     - `sectionId: "123"` (ID para filtros)

```typescript
// Antes
const attendanceData: any = {
  section: seccion || null,
  // ... otros campos
};

// Después
const attendanceData: any = {
  section: seccion || null,
  sectionId: sectionId, // 🎯 NUEVO: ID correcto desde mapa
  // ... otros campos
};
```

### 2. Componente Frontend Modificado
**Archivo:** `/workspaces/peloduro_v2/src/components/admin/user-management/bulk-uploads.tsx`

#### Cambios:
1. **Envío de datos adicionales:**
   - El componente ahora lee cursos y secciones desde localStorage
   - Los envía junto con el archivo CSV en el FormData
   
```typescript
// NUEVO: Incluir datos para mapeo
const sections = LocalStorageManager.getSectionsForYear(selectedYear) || [];
const courses = LocalStorageManager.getCoursesForYear(selectedYear) || [];
formData.append('sections', JSON.stringify(sections));
formData.append('courses', JSON.stringify(courses));
```

## ✅ Resultado

Ahora cuando se realiza la carga masiva de asistencia:

1. ✅ Los registros se guardan con `sectionId` correcto
2. ✅ La pestaña de Asistencia puede filtrar correctamente por sección
3. ✅ Los estudiantes aparecen con su asistencia correspondiente
4. ✅ Los estados (presente, ausente, atrasado, justificado) se muestran correctamente

## 🔍 Verificación

Para verificar que el fix funciona:

1. **Eliminar datos anteriores:**
   ```
   - Ir a Carga Masiva > Asistencia Firebase
   - Eliminar todos los registros del año 2025
   ```

2. **Cargar archivo nuevamente:**
   ```
   - Usar el archivo: asistencia-2-estudiantes-SISTEMA-ACTUAL.csv
   - Verificar que la carga se complete exitosamente
   ```

3. **Verificar en Asistencia:**
   ```
   - Ir a pestaña Asistencia
   - Seleccionar: Año 2025, Curso: 1ro Básico, Sección: A
   - Seleccionar fecha: 2025-03-03 (o cualquier fecha del CSV)
   - DEBEN aparecer los 2 estudiantes con sus estados correspondientes
   ```

## 📊 Estructura de Datos en Firebase

### Antes del Fix
```
courses/
  1ro_basico/
    attendance/
      2025-03-03-1ro_basico-a-s.gonzalez0008/
        id: "..."
        date: Timestamp
        courseId: "1ro_basico"
        section: "A"  ← Solo texto
        studentUsername: "s.gonzalez0008"
        status: "present"
```

### Después del Fix
```
courses/
  1ro_basico/
    attendance/
      2025-03-03-1ro_basico-a-s.gonzalez0008/
        id: "..."
        date: Timestamp
        courseId: "1ro_basico"
        section: "A"       ← Nombre legible
        sectionId: "123"   ← 🎯 ID para filtros
        studentUsername: "s.gonzalez0008"
        status: "present"
```

## 🚨 Consideraciones Importantes

1. **Nombres exactos:** Los nombres de curso y sección en el CSV **DEBEN** coincidir exactamente con los del sistema (incluyendo mayúsculas, espacios y acentos).

2. **Datos en localStorage:** El sistema asume que los cursos y secciones ya están cargados en localStorage para el año seleccionado.

3. **Registros antiguos:** Los registros cargados **ANTES** del fix NO tienen `sectionId`. Para corregirlos, se debe:
   - Eliminar registros antiguos
   - Volver a cargar con el CSV actualizado

4. **⚠️ CRÍTICO - Orden de prioridad:** La función de lectura DEBE priorizar `sectionId` sobre `section`:
   ```typescript
   // ✅ CORRECTO
   sectionId: data.sectionId || data.section || null
   
   // ❌ INCORRECTO - causará que los filtros no funcionen
   sectionId: data.section || data.sectionId || null
   ```

5. **Recarga necesaria:** Después de aplicar el fix, es necesario **recargar la página** de Asistencia para que los cambios surtan efecto.

### 3. Función de Lectura desde Firebase Corregida
**Archivo:** `/workspaces/peloduro_v2/src/lib/firestore-database.ts`

#### Problema Adicional Encontrado:
La función `fromFirestoreAttendance` estaba priorizando el campo `section` (nombre "A") sobre `sectionId` (ID numérico).

```typescript
// Antes - INCORRECTO
sectionId: data.section || data.sectionId || null,

// Después - CORRECTO
sectionId: data.sectionId || data.section || null,
```

Ahora prioriza el `sectionId` numérico para que coincida con los filtros de la pestaña Asistencia.

## 📝 Archivos Modificados

1. `/workspaces/peloduro_v2/src/app/api/firebase/bulk-upload-attendance/route.ts` (líneas 317-385)
2. `/workspaces/peloduro_v2/src/components/admin/user-management/bulk-uploads.tsx` (líneas 1350-1371)
3. `/workspaces/peloduro_v2/src/lib/firestore-database.ts` (línea 949) ⚠️ **CRÍTICO**

## 🎯 Próximos Pasos

1. Probar la carga masiva con el archivo corregido
2. Verificar que los datos aparezcan en la pestaña Asistencia
3. Si funciona correctamente, eliminar archivos CSV obsoletos:
   - `asistencia-2-estudiantes-1ro-basico-A-2025.csv` (usernames incorrectos)

---

**Fecha del Fix:** 2025-11-25  
**Issue:** Registros de asistencia no aparecen después de carga masiva  
**Solución:** Agregar mapeo de `sectionId` en el proceso de carga masiva
