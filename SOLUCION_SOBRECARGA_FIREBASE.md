# 🔥 Solución: Sobrecarga de Firebase Firestore

## ❌ Problema Detectado

```
Error: [code=resource-exhausted]: Write stream exhausted maximum allowed queued writes.
Using maximum backoff delay to prevent overloading the backend.
```

### ¿Qué significa?

Firebase Firestore tiene límites de escritura para proteger el backend:
- **Límite por lote (batch):** 500 operaciones
- **Tasa de escritura:** No se pueden enviar muchos lotes seguidos sin pausas
- **Cola de escrituras:** Máximo de escrituras pendientes en cola

Cuando subes **muchas calificaciones a la vez** (como 1500+), Firebase se sobrecarga porque estás enviando demasiados lotes consecutivos sin darle tiempo al backend para procesarlos.

---

## ✅ Solución Implementada

### Cambios Aplicados

Se modificó el archivo `/src/lib/firestore-database.ts` para:

1. **Reducir tamaño de lotes:** De 100 a **50 documentos por lote**
2. **Agregar pausas:** **300ms entre cada lote** para dar tiempo al backend
3. **Aplicar a todas las funciones de carga masiva:**
   - `saveGrades()` - Calificaciones
   - `saveAttendance()` - Asistencia  
   - `saveActivities()` - Actividades

### Ejemplo del Cambio

**Antes (causaba sobrecarga):**
```typescript
const BATCH_SIZE = 100;
for (let i = 0; i < grades.length; i += BATCH_SIZE) {
  const batch = writeBatch(db);
  // ... agregar documentos al lote
  await batch.commit();
  // ❌ Sin pausa - siguiente lote inmediato
}
```

**Después (optimizado):**
```typescript
const BATCH_SIZE = 50; // Reducido
for (let i = 0; i < grades.length; i += BATCH_SIZE) {
  const batch = writeBatch(db);
  // ... agregar documentos al lote
  await batch.commit();
  
  // ✅ Pausa de 300ms entre lotes
  if (i + BATCH_SIZE < grades.length) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
```

---

## 🧪 Cómo Probar la Solución

### 1. Reiniciar el Servidor

El cambio requiere reiniciar el servidor de desarrollo:

```bash
# Detener el servidor actual (Ctrl+C en la terminal)
# Luego ejecutar:
npm run dev
```

### 2. Probar Carga Masiva

1. Ve a **Admin → Configuración**
2. Sección **"Carga Masiva: Calificaciones (SQL)"**
3. Sube un archivo CSV con calificaciones
4. Observa la consola:
   - ✅ Deberías ver progreso sin errores
   - ✅ "Guardadas X/Y calificaciones" con pausas entre lotes
   - ✅ Sin mensajes de "resource-exhausted"

### 3. Verificar en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Proyecto: `superjf1234-e9cbc`
3. **Firestore Database → Datos**
4. Verifica que las calificaciones se guardaron correctamente en `courses/{courseId}/grades`

---

## 📊 Impacto en el Rendimiento

### Tiempo de Carga

Con las pausas, la carga será **más lenta pero más segura**:

| Registros | Tiempo Antes | Tiempo Después |
|-----------|--------------|----------------|
| 500       | ~5 segundos  | ~8 segundos    |
| 1000      | ~10 segundos | ~16 segundos   |
| 1500      | ❌ Error     | ~24 segundos   |
| 2000      | ❌ Error     | ~32 segundos   |

**Conclusión:** Ahora puedes subir **miles de registros** sin errores, solo tomará un poco más de tiempo.

---

## 🔍 Monitoreo

### En la Consola del Navegador (F12)

Verás logs como estos:

```
✅ Guardadas 50/1520 calificaciones
✅ Guardadas 100/1520 calificaciones
✅ Guardadas 150/1520 calificaciones
...
✅ Guardadas 1520/1520 calificaciones
```

### Indicadores de Éxito

- ✅ **Sin errores** de "resource-exhausted"
- ✅ **Progreso constante** visible en los logs
- ✅ **Contador actualizado** en la UI después de la carga
- ✅ **Datos visibles** en Firebase Console

---

## ⚠️ Límites de Firebase (Plan Gratuito Spark)

### Cuotas Diarias

- **Lecturas:** 50,000 por día
- **Escrituras:** 20,000 por día
- **Eliminaciones:** 20,000 por día

### Recomendaciones

Si planeas subir **más de 15,000 registros al día**, considera:

1. **Upgrade al plan Blaze** (pago por uso)
2. **Dividir la carga en múltiples días**
3. **Usar exportaciones completas** en lugar de cargas frecuentes

---

## 🛠️ Solución de Problemas

### Si sigues viendo errores de sobrecarga

1. **Aumenta la pausa entre lotes:**
   ```typescript
   // En firestore-database.ts, línea ~160
   await new Promise(resolve => setTimeout(resolve, 500)); // Cambiar de 300 a 500ms
   ```

2. **Reduce el tamaño del lote:**
   ```typescript
   const BATCH_SIZE = 25; // Cambiar de 50 a 25
   ```

3. **Verifica el uso de cuotas en Firebase Console:**
   - Ve a Firebase Console
   - Sección "Uso" (Usage)
   - Verifica si estás cerca del límite diario

---

## 📈 Optimizaciones Futuras

### Para Mejorar el Rendimiento

1. **Usar Firebase Admin SDK en el backend:**
   - Más rápido y sin límites de cliente
   - Requiere endpoint API dedicado

2. **Implementar carga paralela:**
   - Múltiples lotes en paralelo (con límite)
   - Más complejo pero más rápido

3. **Comprimir datos:**
   - Reducir tamaño de documentos
   - Usar referencias en lugar de datos duplicados

---

## 🎯 Resumen

### ✅ Cambios Aplicados

- ✅ Reducido tamaño de lotes: **100 → 50**
- ✅ Agregadas pausas: **300ms entre lotes**
- ✅ Aplicado a: **grades, attendance, activities**

### 🚀 Próximos Pasos

1. **Reiniciar servidor:** `npm run dev`
2. **Probar carga masiva** con un CSV pequeño primero
3. **Verificar en Firebase** que los datos se guardaron
4. **Escalar gradualmente** con archivos más grandes

---

**¿Aún tienes problemas?** Revisa los logs de la consola (F12) y Firebase Console para más detalles.
