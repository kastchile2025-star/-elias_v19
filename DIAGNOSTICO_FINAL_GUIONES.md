# 🎯 DIAGNÓSTICO FINAL - Por Qué Muestra "—"

## ✅ Lo que SÍ funciona:

1. **CSV correcto:** El archivo tiene columna "nota" con valores 0-100
2. **Procesamiento correcto:** El código busca el campo "nota" y lo convierte a "score"
3. **Datos cargados:** LocalStorage tiene los registros (por eso los badges muestran números)
4. **Tabla renderiza:** La tabla SÍ muestra estudiantes y asignaturas
5. **Lógica de renderizado correcta:** `{g ? <span>{g.score}</span> : <span>—</span>}`

## ❌ El Problema REAL:

**La variable `g` (calificación) es `undefined` para esas celdas.**

### ¿Por qué?

Mira estas líneas del código (3630-3700):

```typescript
// 1. Carga las tareas pendientes para alinear columnas N1..N10
const tasksOrder = loadPendingTasksBySubject.get(keyForOrder) || [];

// 2. Crea un array de 10 elementos (N1 a N10)
const arr: (TestGrade | undefined)[] = Array.from({ length: 10 }, () => undefined);

// 3. Para cada tarea pendiente, busca la calificación por testId
for (let i = 0; i < Math.min(10, tasksOrder.length); i++) {
  const t: any = tasksOrder[i];
  let listForId = t && byTestId.get(String(t.id));
  let tg = listForId && listForId.length > 0 ? listForId.shift() : undefined;
  arr[i] = tg; // ← Si no encuentra, queda undefined
}
```

**El problema:** Las calificaciones del CSV **NO tienen testId que coincida** con las tareas pendientes.

## 🔍 Causa Raíz:

### Escenario A: No hay tareas pendientes
- Si `tasksOrder` está vacío → fallback usa solo primeras 10 calificaciones por fecha
- Pero si el filtro de asignatura/sección no coincide, no hay match

### Escenario B: Las tareas existen pero testId no coincide
- CSV tiene: `testId: "test-001"`, `testId: "test-002"`, etc.
- Tareas pendientes tienen: `id: "abc123-uuid"`, `id: "def456-uuid"`, etc.
- `byTestId.get(String(t.id))` → NO encuentra nada → `undefined`

### Escenario C: Las calificaciones no están filtradas correctamente
- El código filtra por `normName(nameOf(g)) === normName(subjName)`
- Si el nombre de la asignatura no coincide EXACTAMENTE (ej: "Ciencias Naturales" vs "Ciencias Nat.") → no match

## 🎯 SOLUCIÓN:

### Opción 1: Ejecutar Script de Diagnóstico (RECOMENDADO)

```javascript
(function(){const s=document.createElement('script');s.src='/diagnosticar-calificaciones-vacias.js';document.head.appendChild(s);})();
```

Este script te dirá:
- ✅ Si hay calificaciones en LocalStorage
- ✅ Qué campos tienen las calificaciones
- ✅ Si los testId coinciden con las tareas
- ✅ Si los nombres de asignaturas coinciden

### Opción 2: Ver Datos Directamente

```javascript
// 1. Ver calificaciones del estudiante actual
const year = 2025;
const key = `smart-student-test-grades-${year}`;
const grades = JSON.parse(localStorage.getItem(key) || '[]');

// Filtrar por curso visible (ej: 8vo Básico B)
const filtered = grades.filter(g => 
  g.courseName === '8vo Básico' && 
  g.sectionName === 'B'
);

console.log('Calificaciones 8vo Básico B:', filtered);
console.table(filtered.slice(0, 10));

// 2. Ver tareas pendientes
const tasks = JSON.parse(localStorage.getItem('smart-student-pending-tasks-2025') || '[]');
const tasksFiltered = tasks.filter(t => 
  t.courseName === '8vo Básico' && 
  t.sectionName === 'B'
);

console.log('Tareas 8vo Básico B:', tasksFiltered);
console.table(tasksFiltered);

// 3. Comparar testId
console.log('\n🔍 COMPARACIÓN DE IDs:');
console.log('testIds en calificaciones:', filtered.map(g => g.testId).slice(0, 5));
console.log('ids en tareas:', tasksFiltered.map(t => t.id).slice(0, 5));
```

### Opción 3: Fix Temporal - Forzar Modo Fallback

Si el problema es que no coinciden los IDs, puedes forzar que use el modo fallback (primeras 10 por fecha):

```javascript
// Esto borra las tareas pendientes temporalmente
localStorage.removeItem('smart-student-pending-tasks-2025');

// Recarga la página
location.reload();

// Ahora debería mostrar las primeras 10 calificaciones por fecha
```

⚠️ **Esto es temporal** - al recargar las tareas se vuelven a cargar

## 📊 Checklist de Verificación:

- [ ] Ejecuté el script de diagnóstico
- [ ] Vi qué testIds tienen las calificaciones
- [ ] Vi qué ids tienen las tareas pendientes
- [ ] Los IDs coinciden (SÍ/NO): _______
- [ ] Los nombres de asignaturas coinciden (SÍ/NO): _______
- [ ] Probé forzar modo fallback (borrar tareas)

## 🔧 Fix Permanente (Si IDs No Coinciden):

Si el problema es que los testId del CSV no coinciden con los id de las tareas, necesitas:

**Opción A:** Regenerar las tareas con los mismos testId del CSV

**Opción B:** Modificar el CSV para usar los id de las tareas existentes

**Opción C:** Modificar el código para hacer matching más flexible:
- Por fecha + tipo + asignatura + sección (en lugar de solo por testId)

---

## 🚨 ACCIÓN INMEDIATA:

**1. Ejecuta AHORA el script de diagnóstico:**

```javascript
(function(){const s=document.createElement('script');s.src='/diagnosticar-calificaciones-vacias.js';document.head.appendChild(s);})();
```

**2. Copia el resultado COMPLETO** y repórtalo.

**3. Ejecuta el comando de comparación de IDs** (Opción 2 arriba) y comparte el resultado.

---

**Archivos Relacionados:**
- `public/diagnosticar-calificaciones-vacias.js` - Script completo de diagnóstico
- `PROBLEMA_CALIFICACIONES_GUIONES.md` - Guía general del problema
