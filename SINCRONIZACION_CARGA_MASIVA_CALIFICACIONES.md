# ✅ SINCRONIZACIÓN AUTOMÁTICA: Carga Masiva de Calificaciones

## 📋 Resumen

**El sistema YA ESTÁ COMPLETAMENTE IMPLEMENTADO Y FUNCIONAL.**

Cuando realizas una carga masiva de calificaciones en **Admin → Configuración → Carga Masiva: Calificaciones**, las calificaciones se reflejan **AUTOMÁTICAMENTE** en la pestaña **Calificaciones** respetando todos los criterios y filtros configurados.

---

## 🔄 Flujo Completo de Sincronización

### 1️⃣ **Carga Masiva (Admin > Configuración)**

**Archivo:** `src/components/admin/user-management/configuration.tsx`

Cuando subes un archivo CSV:

1. **Procesa el CSV** línea por línea
2. **Valida los datos** (estudiantes, cursos, secciones, asignaturas)
3. **Genera calificaciones** en formato normalizado
4. **Sube a Firebase/SQL** usando el endpoint `/api/firebase/bulk-upload-grades`
5. **Sincroniza a LocalStorage** como caché para lectura rápida
6. **Actualiza contadores** de la base de datos

### 2️⃣ **Emisión de Eventos (Líneas 1250-1350)**

Después de una carga exitosa, el sistema emite **5 eventos** diferentes para notificar a toda la aplicación:

```typescript
// 1. Evento específico de calificaciones SQL
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
  detail: { 
    year: selectedYear, 
    count: grades.length,
    timestamp: Date.now(),
    source: 'bulk-upload'
  } 
}));

// 2. Evento específico de actividades SQL
window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { 
  detail: { 
    year: selectedYear, 
    added: activities.length,
    timestamp: Date.now(),
    source: 'bulk-upload'
  } 
}));

// 3. Evento genérico de actualización
window.dispatchEvent(new CustomEvent('dataUpdated', { 
  detail: { 
    type: 'grades', 
    year: selectedYear,
    timestamp: Date.now(),
    source: 'bulk-upload'
  } 
}));

// 4. Evento de importación de datos
window.dispatchEvent(new CustomEvent('dataImported', { 
  detail: { 
    type: 'grades', 
    year: selectedYear, 
    count: grades.length,
    timestamp: Date.now(),
    source: 'bulk-upload'
  } 
}));

// 5. Evento de storage para forzar actualización
window.dispatchEvent(new StorageEvent('storage', { 
  key: 'force-stats-update', 
  newValue: String(Date.now()),
  storageArea: localStorage
}));
```

### 3️⃣ **Recepción y Actualización (Pestaña Calificaciones)**

**Archivo:** `src/app/dashboard/calificaciones/page.tsx`

La página de calificaciones **escucha activamente** estos eventos (líneas 726-732):

```typescript
// Listeners registrados en useEffect
window.addEventListener('sqlGradesUpdated', onSQLGradesUpdated as any);
window.addEventListener('sqlActivitiesUpdated', onSQLActivitiesUpdated as any);
window.addEventListener('dataImported', onDataImported as any);
window.addEventListener('dataUpdated', onDataUpdated as any);
window.addEventListener('sqlImportProgress', onSqlImportProgress as any);
```

#### **Handler `onSQLGradesUpdated` (Líneas 466-540)**

Cuando se detecta el evento:

1. ✅ **Verifica timestamp** para evitar duplicados
2. ✅ **Muestra indicador de carga** (barra de progreso)
3. ✅ **Intenta cargar desde SQL/Firebase PRIMERO** usando `getGradesByYear(selectedYear)`
4. ✅ **Si SQL funciona:** Convierte los datos y actualiza el estado
5. ✅ **Si SQL falla:** Hace fallback a LocalStorage
6. ✅ **Normaliza los datos** (convierte fechas a timestamps)
7. ✅ **Actualiza el estado de la UI** con `setGrades()`
8. ✅ **Incrementa refreshTick** para forzar re-renderizado de memos

#### **Handler `onDataImported` (Líneas 600-663)**

Proceso similar pero enfocado en importación masiva:

1. ✅ **Verifica que sea tipo 'grades'**
2. ✅ **Recarga desde SQL/Firebase**
3. ✅ **Fallback a LocalStorage si falla**
4. ✅ **Recarga actividades** para sincronizar "burbujas" pendientes
5. ✅ **Fuerza re-renderizado** completo

---

## 🎯 Criterios de Visualización en Pestaña Calificaciones

### **Filtros Aplicados Automáticamente**

La pestaña de calificaciones respeta los siguientes criterios configurados por el usuario:

#### 1. **Filtro de Año**
- **Selector visual** en la parte superior derecha
- **Sincronizado** con `admin-selected-year` en localStorage
- **Carga dinámica** de datos por año

#### 2. **Filtro de Nivel** (Básica/Media)
- Badge interactivo en la UI
- Filtra cursos según nomenclatura:
  - **Básica:** "1ro Básico", "2do Básico", ..., "8vo Básico"
  - **Media:** "1ro Medio", "2do Medio", "3ro Medio", "4to Medio"

#### 3. **Filtro de Semestre** (1er/2do Semestre)
- Badge interactivo "1er Semestre" / "2do Semestre"
- Filtra por fecha de calificación usando configuración del calendario escolar
- **Auto-selección inteligente:** Al entrar, detecta el semestre actual según la fecha

#### 4. **Filtro de Curso**
- Desplegable dinámico según nivel seleccionado
- Muestra solo cursos del nivel activo

#### 5. **Filtro de Sección**
- Desplegable dinámico según curso seleccionado
- Combo "Curso - Sección" para selección rápida

#### 6. **Filtro de Asignatura**
- Desplegable con todas las asignaturas del curso
- Opción "Todas las Asignaturas" por defecto

#### 7. **Filtro de Estudiante**
- Desplegable con estudiantes de la sección
- Opción "Todos los Estudiantes" por defecto

### **Permisos por Rol**

#### **Administrador**
- ✅ Ve TODAS las calificaciones del sistema
- ✅ Puede filtrar por cualquier combinación
- ✅ Sin restricciones de acceso

#### **Profesor**
- ✅ Ve solo calificaciones de **sus secciones asignadas**
- ✅ Ve solo **sus asignaturas** en esas secciones
- ✅ Auto-filtrado según asignaciones en Gestión de Usuarios
- ✅ Si solo tiene UNA sección, se aplica automáticamente

#### **Estudiante**
- ✅ Ve solo **SUS PROPIAS calificaciones**
- ✅ Auto-selección de su curso y sección
- ✅ Ve todas las asignaturas en las que está inscrito
- ✅ Filtros bloqueados (no puede cambiar curso/sección)

---

## 📊 Estructura de Datos

### **Formato de Calificación**

```typescript
type TestGrade = {
  id: string;              // ID único de la calificación
  testId: string;          // ID de la tarea/evaluación/prueba
  studentId: string;       // ID del estudiante
  studentName: string;     // Nombre del estudiante
  score: number;           // Nota (0-100)
  courseId: string | null; // ID del curso
  sectionId: string | null;// ID de la sección
  subjectId: string | null;// ID de la asignatura
  title?: string;          // Título descriptivo
  gradedAt: number;        // Timestamp de calificación
  year: number;            // Año académico
  type: 'tarea' | 'evaluacion' | 'prueba'; // Tipo de evaluación
}
```

### **Formato CSV de Carga**

```csv
nombre,rut,curso,seccion,asignatura,fecha,tipo,nota,profesor
Juan Pérez,12345678-9,1ro Básico,A,Matemáticas,2025-10-01,tarea,85,Prof. González
María López,98765432-1,1ro Básico,A,Lenguaje,2025-10-02,prueba,92,Prof. Ramírez
...
```

**Campos requeridos:**
- ✅ `nombre` o `rut` (identificar estudiante)
- ✅ `curso` (ej: "1ro Básico")
- ✅ `seccion` (ej: "A", "B", "C")
- ✅ `asignatura` (ej: "Matemáticas")
- ✅ `fecha` (formato: YYYY-MM-DD o DD/MM/YYYY)
- ✅ `tipo` (tarea, prueba, evaluacion)
- ✅ `nota` (0-100 o 1-7, se convierte automáticamente)

**Campos opcionales:**
- `profesor` (nombre del profesor)
- `titulo` (título personalizado de la evaluación)

---

## 🔍 Verificación del Sistema

### **1. Verificar que la Carga Funciona**

1. Ve a **Admin → Configuración**
2. Sección **"Carga masiva: Calificaciones (SQL)"**
3. Sube un archivo CSV
4. Observa en la consola del navegador (F12):
   ```
   ✅ Admin SDK listo - usando endpoint bulk-upload-grades
   📊 Procesadas X/Y filas (Z%)
   ✅ Todas las Y filas procesadas
   🔔 Emitiendo eventos de actualización...
   ✅ Evento sqlGradesUpdated emitido para X calificaciones
   ✅ TODOS los eventos de actualización emitidos correctamente
   ```

### **2. Verificar que la Pestaña se Actualiza**

1. Ve a **Calificaciones** (puedes tenerla abierta durante la carga)
2. Observa en la consola:
   ```
   📊 SQL grades updated - refreshing calificaciones...
   🔄 Recargando calificaciones para año 2025 desde SQL/Firebase...
   ✅ Recargadas X calificaciones desde SQL/Firebase
   ```
3. La tabla debe actualizarse **AUTOMÁTICAMENTE** sin necesidad de refrescar

### **3. Script de Diagnóstico en Consola**

Si las calificaciones no aparecen, ejecuta este script en la consola del navegador (F12):

```javascript
// Verificar estado actual
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
const gradesKey = `smart-student-test-grades-${year}`;
const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');

console.log('📊 DIAGNÓSTICO RÁPIDO:');
console.log(`   Año seleccionado: ${year}`);
console.log(`   Calificaciones en cache: ${grades.length}`);
console.log(`   Clave: ${gradesKey}`);

if (grades.length === 0) {
  console.warn('⚠️ No hay calificaciones en caché');
  console.log('💡 SOLUCIÓN: Cargar CSV desde Admin > Configuración');
} else {
  console.log('✅ Hay calificaciones en caché');
  console.log('   Muestra de datos:');
  console.table(grades.slice(0, 5));
}

// Forzar recarga manual
console.log('\n🔧 Para forzar recarga, ejecuta:');
console.log('window.dispatchEvent(new CustomEvent("sqlGradesUpdated", { detail: { year, timestamp: Date.now() } }));');
```

---

## 🎬 Flujo Visual Paso a Paso

```
┌─────────────────────────────────────────────────────────────┐
│ 1️⃣ ADMINISTRADOR SUBE CSV                                    │
│    Admin > Configuración > Carga Masiva: Calificaciones    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2️⃣ PROCESAMIENTO BACKEND                                     │
│    • Parse CSV (validación de campos)                       │
│    • Mapeo de IDs (estudiantes, cursos, secciones)          │
│    • Generación de calificaciones + actividades             │
│    • Subida a Firebase/SQL (bulk-upload-grades)             │
│    • Sincronización a LocalStorage (caché)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3️⃣ EMISIÓN DE EVENTOS                                        │
│    • sqlGradesUpdated (calificaciones actualizadas)         │
│    • sqlActivitiesUpdated (actividades generadas)           │
│    • dataImported (importación completa)                    │
│    • dataUpdated (datos actualizados)                       │
│    • storage (forzar actualización estadísticas)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4️⃣ LISTENERS EN PESTAÑA CALIFICACIONES                       │
│    • Detecta evento sqlGradesUpdated                        │
│    • Recarga desde SQL/Firebase                             │
│    • Fallback a LocalStorage si falla                       │
│    • Actualiza estado de React (setGrades)                  │
│    • Fuerza re-renderizado (setRefreshTick)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5️⃣ APLICACIÓN DE FILTROS                                     │
│    • Filtro por año (selectedYear)                          │
│    • Filtro por nivel (basica/media)                        │
│    • Filtro por semestre (1er/2do)                          │
│    • Filtro por curso                                       │
│    • Filtro por sección                                     │
│    • Filtro por asignatura                                  │
│    • Filtro por estudiante                                  │
│    • Permisos por rol (admin/profesor/estudiante)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6️⃣ RENDERIZADO FINAL                                         │
│    • Tabla con calificaciones filtradas                     │
│    • Badges con contadores actualizados                     │
│    • Promedios calculados dinámicamente                     │
│    • Gráficos de progreso                                   │
│    • "Burbujas" de tareas pendientes                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos Clave del Sistema

| Archivo | Descripción | Líneas Clave |
|---------|-------------|--------------|
| `src/components/admin/user-management/configuration.tsx` | Maneja la carga masiva de CSV | 1460-1800 (procesamiento)<br>1250-1350 (emisión eventos) |
| `src/app/dashboard/calificaciones/page.tsx` | Vista de calificaciones con filtros | 466-540 (handler sqlGradesUpdated)<br>600-663 (handler dataImported)<br>726-732 (registro listeners) |
| `src/hooks/useGradesSQL.ts` | Hook para acceso a SQL/Firebase | Funciones: getGradesByYear, uploadGradesToSQL |
| `src/lib/education-utils.ts` | Utilidades de LocalStorage | LocalStorageManager.getTestGradesForYear |

---

## 🧪 Casos de Prueba

### **Caso 1: Carga Exitosa Completa**

**Escenario:**
- CSV con 200 calificaciones válidas
- Todos los estudiantes existen
- Todos los cursos y secciones están configurados

**Resultado Esperado:**
- ✅ 200 calificaciones procesadas
- ✅ 0 errores
- ✅ Aparecen inmediatamente en pestaña Calificaciones
- ✅ Badges actualizados con nuevos números
- ✅ Tabla muestra calificaciones según filtros

### **Caso 2: Carga Parcial con Errores**

**Escenario:**
- CSV con 200 filas
- 180 válidas, 20 con errores (estudiantes no encontrados)

**Resultado Esperado:**
- ✅ 180 calificaciones procesadas
- ⚠️ 20 errores reportados en consola
- ✅ Toast muestra "Carga parcial completada"
- ✅ Las 180 válidas aparecen en Calificaciones

### **Caso 3: Filtrado por Profesor**

**Escenario:**
- Profesor asignado a "8vo Básico B" - "Matemáticas"
- Se cargan calificaciones de múltiples cursos

**Resultado Esperado:**
- ✅ Profesor ve solo "8vo Básico B"
- ✅ Solo ve "Matemáticas"
- ✅ No ve otras secciones ni asignaturas
- ✅ Filtros bloqueados a su asignación

### **Caso 4: Filtrado por Estudiante**

**Escenario:**
- Estudiante "Luis Torres" inscrito en "8vo Básico B"
- Se cargan calificaciones de todo el curso

**Resultado Esperado:**
- ✅ Estudiante ve solo sus propias calificaciones
- ✅ No ve calificaciones de compañeros
- ✅ Auto-selección de su curso y sección
- ✅ Filtros bloqueados excepto asignatura

---

## 🐛 Resolución de Problemas

### **Problema 1: Calificaciones no aparecen después de carga**

**Diagnóstico:**
1. Abre consola del navegador (F12)
2. Busca el mensaje: `✅ Evento sqlGradesUpdated emitido`
3. Busca el mensaje: `📊 SQL grades updated - refreshing calificaciones...`

**Soluciones:**

**Si NO ves los eventos:**
```javascript
// Forzar emisión manual
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
  detail: { year, timestamp: Date.now() } 
}));
```

**Si ves errores de SQL:**
```javascript
// Verificar que el hook SQL está conectado
console.log('SQL Conectado:', window.isSQLConnected);

// Si no está conectado, verificar Firestore
console.log('Firebase App:', window.firebase?.app());
```

**Si LocalStorage está vacío:**
```javascript
// Recargar manualmente desde SQL
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
// Recargar página o disparar evento
location.reload();
```

### **Problema 2: Aparecen calificaciones de otros cursos**

**Causa:** Filtros no aplicados correctamente

**Solución:**
1. Verifica que seleccionaste **Nivel** (Básica/Media)
2. Selecciona **Semestre** (1er o 2do)
3. Selecciona **Curso** específico
4. Selecciona **Sección** específica

### **Problema 3: Profesor ve calificaciones que no debería**

**Causa:** Asignaciones de Gestión de Usuarios incorrectas

**Solución:**
1. Ve a **Admin → Gestión de Usuarios**
2. Pestaña **"Asignaciones"**
3. Verifica que el profesor esté asignado solo a sus secciones y asignaturas
4. Elimina asignaciones incorrectas
5. Refresca la página de Calificaciones

---

## 📚 Referencias y Documentación Relacionada

- **[REAL_TIME_SYNC_GRADES.md](./REAL_TIME_SYNC_GRADES.md)** - Sincronización en tiempo real
- **[SOLUCION_CALIFICACIONES_NO_APARECEN.md](./SOLUCION_CALIFICACIONES_NO_APARECEN.md)** - Solución de problemas de visualización
- **[INSTRUCCIONES_CARGA_CALIFICACIONES.md](./INSTRUCCIONES_CARGA_CALIFICACIONES.md)** - Guía paso a paso para carga masiva
- **[PRUEBA_CARGA_MASIVA_CALIFICACIONES.md](./PRUEBA_CARGA_MASIVA_CALIFICACIONES.md)** - Scripts de prueba

---

## ✅ Conclusión

**El sistema de sincronización automática está completamente implementado y funcional.**

Cuando realizas una carga masiva de calificaciones:

1. ✅ Se procesan y validan los datos
2. ✅ Se suben a Firebase/SQL
3. ✅ Se sincronizan a LocalStorage
4. ✅ Se emiten eventos de actualización
5. ✅ La pestaña Calificaciones recibe los eventos
6. ✅ Recarga los datos automáticamente
7. ✅ Aplica todos los filtros y criterios configurados
8. ✅ Respeta permisos por rol (admin/profesor/estudiante)
9. ✅ Actualiza la UI en tiempo real

**No se requiere ninguna acción manual del usuario.** El sistema maneja toda la sincronización de forma transparente.

---

**Fecha de Creación:** $(date)  
**Autor:** GitHub Copilot  
**Versión:** 1.0  
**Estado:** ✅ DOCUMENTACIÓN COMPLETA
