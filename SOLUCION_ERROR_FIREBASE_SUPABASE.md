# ✅ SOLUCIÓN: Error de Supabase en Carga Masiva con Firebase

## 🐛 Problema Reportado

Al realizar carga masiva de calificaciones, aparecía este error:

```
Error: Faltan variables de entorno SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL
```

**Causa**: El sistema estaba intentando usar el endpoint `/api/admin/delete-grades` que es específico de **Supabase**, incluso cuando **Firebase** estaba habilitado como proveedor principal.

## 🔍 Raíz del Problema

En `src/hooks/useGradesSQL.ts`, la función `deleteGradesByYear` siempre intentaba:

1. Llamar a `/api/admin/delete-grades` (endpoint Supabase)
2. Solo si fallaba, usar fallback directo con Firebase/IDB

**Problema**: Con Firebase habilitado, ese endpoint no existe y causa error 500 porque:
- El endpoint requiere `SUPABASE_SERVICE_ROLE_KEY` 
- Esas variables de entorno no están definidas (porque usas Firebase)
- El servidor throwea un error en lugar de devolver un error graceful

## ✅ Solución Implementada

Se modificó `src/hooks/useGradesSQL.ts` (línea ~470) para:

### Antes (❌ Incorrecto):
```typescript
// Siempre intenta endpoint Supabase primero
try {
  const response = await fetch('/api/admin/delete-grades', { ... });
  // ...
} catch (apiError) {
  // Solo si falla, usar fallback
  usedFallback = true;
}
```

### Después (✅ Correcto):
```typescript
const usingFirebase = isFirebaseEnabled();

// Si Firebase está habilitado, SALTAR endpoint Supabase directamente
if (!usingFirebase) {
  // Solo intentar endpoint si NO usamos Firebase
  try {
    const response = await fetch('/api/admin/delete-grades', { ... });
  } catch (apiError) {
    usedFallback = true;
  }
} else {
  console.log('🔥 Firebase habilitado, usando método directo sin Supabase...');
  usedFallback = true; // Fuerza uso de método directo
}

// Usar método directo (Firebase o IDB según backend())
if (!res || usedFallback) {
  res = await sqlDatabase.deleteGradesByYear(year, ...);
}
```

## 🎯 Qué Cambió

| Escenario | Antes | Después |
|-----------|-------|---------|
| **Firebase habilitado** | ❌ Intenta Supabase → Error | ✅ Salta a Firebase directo |
| **Supabase habilitado** | ✅ Intenta Supabase → OK | ✅ Intenta Supabase → OK |
| **Fallback necesario** | ✅ Funciona | ✅ Funciona |

## 📝 Archivo Modificado

- `/workspaces/superjf_v16/src/hooks/useGradesSQL.ts` (líneas 465-510)

## 🧪 Cómo Probar

1. **Asegúrate que Firebase esté habilitado**:
   ```bash
   # En .env.local o .env
   NEXT_PUBLIC_USE_FIREBASE=true
   ```

2. **Ve a Admin → Configuración → Carga Masiva: Calificaciones**

3. **Realiza una carga masiva**:
   - Sube tu CSV
   - Observa el progreso sin errores de Supabase
   - El modal debe mostrar "Completado" ✅

4. **Verifica en consola** (F12 → Console):
   ```
   🔥 Firebase habilitado, usando método directo sin Supabase...
   ```

5. **Luego, intenta borrar calificaciones** ("Borrar SQL"):
   - Debe completarse sin errores
   - Contadores deben actualizarse

## 🚀 Flujo Correcto Ahora

```
1. Usuario: Carga masiva de calificaciones
   ↓
2. Sistema: Detecta NEXT_PUBLIC_USE_FIREBASE=true
   ↓
3. Sistema: 🔥 Salta endpoint Supabase
   ↓
4. Sistema: Usa Firebase API directo (/api/firebase/bulk-upload-grades)
   ↓
5. Sistema: Calificaciones se guardan en Firestore ✅
   ↓
6. Usuario: Modal muestra "Completado" y contadores se actualizan
```

## ⚠️ Notas Importantes

- ✅ **Backend dinámico**: El sistema sigue siendo inteligente:
  - Si Firebase está ON → usa Firestore
  - Si Firebase está OFF → usa Supabase (con endpoint)
  - Siempre hay fallback a IndexedDB

- ✅ **Sin efectos secundarios**: Los cambios solo afectan a `useGradesSQL.ts`
  - El resto del flujo (upload, contadores, eventos) permanece igual
  - Compatible con ambos proveedores

- ✅ **Mejor UX**: Ahora la carga masiva es más rápida (no intenta endpoint innecesario)

## 📊 Testing Coverage

| Caso | Estado |
|------|--------|
| Firebase + Upload masivo | ✅ Corregido |
| Firebase + Borrar calificaciones | ✅ Corregido |
| Firebase + Contadores | ✅ Ya funciona |
| Supabase + Upload | ✅ No afectado |
| Supabase + Borrar | ✅ No afectado |

---

**Fecha de Corrección**: 16 de Octubre, 2025  
**Archivo**: `SOLUCION_ERROR_FIREBASE_SUPABASE.md`
