# Plan de Corrección: 10 Actividades → 5 Actividades (1ro Básico A, Lenguaje, 1er Semestre)

## 🔍 Diagnóstico del Problema

**Situación actual:** Sofía González muestra **10 burbujas** de actividades en lugar de **5**.

**Causa raíz:** Existen **actividades duplicadas** en Firebase con fechas diferentes debido a cargas anteriores con parser defectuoso:
- Antes: parseaba "15-03-2025" como UTC medianoche → se guardaba "14-03-2025 21:00 UTC-3"
- Ahora: parseamos "15-03-2025" con mediodía local → se guarda "15-03-2025 12:00 local"

Resultado: Para cada actividad del CSV existen **2 documentos** en Firebase:
- Uno con fecha 14-03 (antiguo, incorrecto)
- Uno con fecha 15-03 (nuevo, correcto)

El deduplicador actual usa la clave: `asignatura|día|tipo|título`
- Como los días son diferentes (14 vs 15), **NO los detecta como duplicados**
- Por eso 5 actividades × 2 fechas = 10 burbujas

## ✅ Solución

### Paso 1: Limpiar actividades antiguas (OBLIGATORIO)

Tienes 2 opciones:

#### Opción A: Limpieza desde Consola del Navegador (MÁS RÁPIDO)

1. Ve a Admin → Calificaciones en tu navegador
2. Abre la Consola de Desarrollo (F12 → pestaña Console)
3. Pega este código y presiona Enter:

```javascript
// Eliminar solo 1ro Básico A
async function deleteActivities2025(courseId = '1ro_basico', sectionId = 'a') {
  let deleted = 0, iteration = 0;
  while (iteration++ < 20) {
    console.log(`🔄 Iteración ${iteration}...`);
    const url = \`/api/firebase/delete-activities-by-year?year=2025&doit=1&paged=1&courseId=\${courseId}&sectionId=\${sectionId}&limit=500\`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    if (!data.ok || data.deleted === 0) break;
    deleted += data.deleted;
    console.log(\`   ✅ Eliminadas \${data.deleted} (total: \${deleted})\`);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(\`🎉 Completado: \${deleted} actividades eliminadas\`);
  return deleted;
}

await deleteActivities2025('1ro_basico', 'a');
```

4. Espera a que termine (verás el progreso en consola)

#### Opción B: Llamar al endpoint directamente (desde Postman/Thunder Client)

```
POST http://localhost:3000/api/firebase/delete-activities-by-year?year=2025&doit=1&paged=1&courseId=1ro_basico&sectionId=a&limit=500
```

Repite la llamada hasta que `deleted: 0`.

### Paso 2: Reimportar CSV (una sola vez)

1. Ve a Admin → Calificaciones → botón "Carga Masiva"
2. Selecciona el archivo `calificaciones_ejemplo_carga_masiva_100 - v2.csv`
3. Sube el archivo

**Ahora el importador:**
- ✅ Parsea fechas DD-MM-YYYY con mediodía local (no habrá 15→14)
- ✅ Crea UNA actividad por: curso + sección + asignatura + tipo + día
- ✅ Si ya existe, hace merge (no duplica)

### Paso 3: Validar resultado

1. Ve a Admin → Calificaciones
2. Filtros:
   - Año: 2025
   - Curso: 1ro Básico
   - Sección: A
   - Asignatura: Lenguaje y Comunicación
   - Semestre: 1er Semestre
   - Estudiante: Sofía González González

3. **Resultado esperado:** 5 burbujas de actividades:
   - 📝 Prueba | 15-03-2025 | Comprensión lectora: Cuentos infantiles
   - 📝 Tarea | 10-04-2025 | Escritura de oraciones simples
   - 📝 Prueba | 03-05-2025 | Vocales y consonantes
   - 📝 Evaluación | 22-05-2025 | Lectura de palabras frecuentes
   - 📝 Tarea | 12-06-2025 | Escritura de textos breves

### Paso 4: Debug (si aún ves más de 5)

1. En la consola del navegador:
```javascript
localStorage.setItem('debug-semester', '1');
```

2. Recarga la página

3. Busca en la consola estos logs:
   - `🧹 Dedup actividades: X → Y` → debería ser `7 → 5` o similar
   - `🔑 Dedup key:` → verás las claves de cada actividad
   - `⚠️ PROBLEMA: Después de dedup quedan X actividades` → si aparece, hay un problema

4. Compárteme esos logs para analizar

## 🔧 Cambios Técnicos Implementados

### 1. Parser de Fechas Robusto (`route.ts` línea 83)
```typescript
function parseFlexibleDate(input: string): Date | null {
  // Si trae hora, respetarla
  if (/[Tt]|:\d{2}/.test(raw)) {
    return new Date(raw);
  }
  
  // DD/MM/YYYY o YYYY-MM-DD → MEDIODÍA LOCAL
  const localNoon = new Date(y, m - 1, d, 12, 0, 0, 0);
  return localNoon;
}
```

### 2. Generador de Actividades Únicas (`route.ts` línea 520)
```typescript
const actKey = [courseId, sectionKey, toId(asignatura), type, day].join('|');
const activityId = toId(asignatura, type, day, sectionKey);
```

### 3. Deduplicador Mejorado (`page.tsx` línea 5298)
```typescript
const key = `${subjectKey}|${day}|${typeKey}|${titleKey}`;
// Ahora con logs detallados cuando debug-semester=1
```

### 4. Endpoint de Limpieza (`delete-activities-by-year/route.ts`)
```typescript
POST /api/firebase/delete-activities-by-year
  ?year=2025
  &doit=1
  &paged=1
  &courseId=1ro_basico
  &sectionId=a
  &limit=500
```

## 📝 Notas Importantes

1. **No borres calificaciones**, solo actividades. Las calificaciones (notas) están bien.

2. **Solo necesitas reimportar una vez** después de limpiar. El nuevo sistema no duplicará.

3. **Las actividades se comparten por curso+sección**, no por estudiante. Todos los estudiantes de 1ro Básico A verán las mismas 5 actividades de Lenguaje.

4. **Si importas el CSV de nuevo sin limpiar**, se harán merge con las existentes (no duplica), pero seguirán las viejas con fecha 14.

5. **Otros cursos/secciones:** Si también tienen el problema, repite el Paso 1 cambiando `courseId` y `sectionId`.

## 🆘 Troubleshooting

### "No se eliminó nada" (deleted: 0)
- Verifica que el curso y sección sean correctos
- Revisa en Firebase Console: `courses/1ro_basico/activities`

### "Aún veo 10 actividades después de reimportar"
- Olvidaste limpiar primero (Paso 1)
- Ejecuta la limpieza y recarga sin reimportar

### "Error 500 al eliminar"
- Problema de permisos Firebase
- Usa Firebase Console manual: elimina colección `courses/1ro_basico/activities` con filtro `year == 2025`

### "Las fechas siguen apareciendo como 14-03"
- Esas son las actividades viejas
- Debes ejecutar el Paso 1 (limpieza)
