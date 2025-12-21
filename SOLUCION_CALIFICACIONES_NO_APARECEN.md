# ✅ SOLUCIÓN: Calificaciones no Aparecen Después de Carga Masiva

**Fecha:** 2025-10-17  
**Problema:** Después de cargar calificaciones masivamente desde Admin > Configuración, estas no aparecían en la pestaña Calificaciones.

---

## 🔍 Diagnóstico

### Problema Raíz
Los handlers de eventos en `page.tsx` dependían del flag `isSQLConnected` para recargar datos:

```typescript
// ❌ ANTES (problemático)
const onSQLGradesUpdated = async (e?: any) => {
  if (reloadingGradesRef.current) return;
  
  // ⚠️ Solo recargaba si isSQLConnected era true
  if (isSQLConnected && getGradesByYear) {
    // cargar desde SQL...
  } else {
    // fallback a LocalStorage
  }
};
```

**Problema:** Después de una carga masiva a Firebase/Firestore, el flag `isSQLConnected` podía ser `false` o el hook no actualizarse inmediatamente, causando que la página no recargara los datos.

---

## ✅ Solución Implementada

### 1. **Recarga Agresiva sin Dependencia de Flags**

Modificamos los handlers para que **SIEMPRE** intenten cargar desde SQL/Firebase primero, independientemente del estado del flag:

```typescript
// ✅ DESPUÉS (solución)
const onSQLGradesUpdated = async (e?: any) => {
  // ... validaciones de timestamp ...
  
  console.log('📊 SQL grades updated - refreshing calificaciones...', detail);
  
  // 🔥 SIEMPRE intentar SQL/Firebase primero
  setSqlFetchDone(false);
  setSqlFetchProgress(0);
  
  try {
    // Intentar getGradesByYear sin importar el flag
    if (getGradesByYear) {
      const rawSqlGrades = await getGradesByYear(selectedYear);
      
      if (rawSqlGrades && Array.isArray(rawSqlGrades) && rawSqlGrades.length > 0) {
        // ✅ Datos encontrados en SQL/Firebase
        const sqlGrades = rawSqlGrades.map(grade => ({
          ...grade,
          gradedAt: new Date(grade.gradedAt).getTime()
        }));
        setGrades(sqlGrades);
        console.log(`✅ ${sqlGrades.length} calificaciones cargadas desde SQL/Firebase`);
      } else {
        // Fallback automático a LocalStorage
        console.log('⚠️ SQL vacío, intentando LocalStorage...');
        // ... código de fallback ...
      }
    } else {
      // getGradesByYear no disponible, usar LocalStorage
      // ... código de fallback ...
    }
  } catch (error) {
    // En caso de error, usar LocalStorage
    // ... código de fallback ...
  } finally {
    setSqlFetchDone(true);
  }
};
```

### 2. **Indicador de Progreso en Tiempo Real**

Agregamos un evento `sqlImportProgress` que se emite durante la carga masiva:

**En `configuration.tsx`:**
```typescript
progressUnsubRef.current = onSnapshot(progressDoc, (snap) => {
  const d = snap.data() as any;
  // ... procesar progreso ...
  
  // Emitir evento público con progreso
  const pct = Math.round((current / Math.max(1, total)) * 100);
  const now = Date.now();
  
  if (pct !== progressLastSentRef.current && now - (progressLastSentRef.current || 0) > 300) {
    progressLastSentRef.current = pct;
    window.dispatchEvent(new CustomEvent('sqlImportProgress', {
      detail: {
        year: selectedYear,
        current,
        total,
        percent: pct,
        timestamp: Date.now(),
        source: 'firebase-admin'
      }
    }));
  }
});
```

**En `page.tsx`:**
```typescript
const onSqlImportProgress = (e: any) => {
  try {
    const d = (e as CustomEvent)?.detail || {};
    const pct = Number(d.percent || 0);
    setSqlFetchProgress(Math.max(0, Math.min(100, pct)));
    
    if (pct >= 100 || (Number(d.current || 0) >= Number(d.total || 0))) {
      setSqlFetchDone(true);
      setTimeout(() => setSqlFetchProgress(0), 800);
    } else {
      setSqlFetchDone(false);
    }
  } catch (err) {
    // ignore
  }
};
```

---

## 📝 Archivos Modificados

### 1. `src/components/admin/user-management/configuration.tsx`
- ✅ Añadido `progressLastSentRef` para throttling de eventos
- ✅ Emit evento `sqlImportProgress` desde onSnapshot de Firestore
- ✅ Throttle de 300ms para evitar spam de eventos

### 2. `src/app/dashboard/calificaciones/page.tsx`
- ✅ Handler `onSQLGradesUpdated` mejorado (siempre intenta SQL primero)
- ✅ Handler `onDataImported` mejorado (siempre intenta SQL primero)
- ✅ Handler `onDataUpdated` mejorado (siempre intenta SQL primero)
- ✅ Nuevo handler `onSqlImportProgress` para actualizar barra de progreso
- ✅ Registro de listener `sqlImportProgress` en useEffect

---

## 🎯 Comportamiento Actual

### Durante la Carga Masiva:

1. **Usuario sube CSV** en Admin > Configuración
2. **Modal de progreso** aparece mostrando avance
3. **Evento `sqlImportProgress`** se emite cada vez que cambia el porcentaje
4. **Página Calificaciones** (si está abierta) muestra indicador flotante:
   - Texto: "Sincronizando con BBDD"
   - Barra de progreso: 0% → 100%
   - Número de porcentaje: actualizado en tiempo real

5. **Al completar:**
   - Emit `sqlGradesUpdated` con datos finales
   - Emit `dataImported` para actualizar estadísticas
   - **Página recarga AUTOMÁTICAMENTE** los datos
   - Tabla muestra las nuevas calificaciones SIN necesidad de F5

---

## 🧪 Cómo Probar

Ver documento detallado: **`PRUEBA_CARGA_MASIVA_CALIFICACIONES.md`**

### Resumen Rápido:

```bash
# 1. Servidor corriendo
npm run dev

# 2. Abrir navegador
http://localhost:9002/dashboard/calificaciones

# 3. Cargar script de prueba (en consola del navegador)
const script = document.createElement('script');
script.src = '/test-bulk-import-flow.js';
document.head.appendChild(script);

# 4. Ir a Admin > Configuración
# 5. Cargar: public/test-data/calificaciones_reales_200.csv
# 6. Observar consola y volver a Calificaciones
# 7. Verificar que aparecen las 200 calificaciones
```

---

## ✅ Checklist de Verificación

- [x] Código modificado y guardado
- [x] Sin errores de TypeScript
- [x] Scripts de prueba creados
- [x] Documentación completa
- [ ] **Prueba end-to-end en navegador** ← SIGUIENTE PASO

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────┐
│  Admin > Configuración                  │
│  (Carga calificaciones_reales_200.csv) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  POST /api/firebase/bulk-upload-grades  │
│  - Parsea CSV                           │
│  - Escribe a Firestore                  │
│  - Actualiza doc 'imports/{jobId}'      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  onSnapshot(progressDoc)                │
│  - Detecta cambios en progreso          │
│  - Emit: sqlImportProgress (throttled)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Página Calificaciones                  │
│  Listener: onSqlImportProgress          │
│  - Actualiza sqlFetchProgress (%)       │
│  - Muestra indicador flotante           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Import completa                        │
│  - Emit: sqlGradesUpdated               │
│  - Emit: dataImported                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Handlers en Calificaciones             │
│  - onSQLGradesUpdated()                 │
│  - onDataImported()                     │
│  - Llaman getGradesByYear()             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  setGrades(nuevasCalificaciones)        │
│  → React re-renderiza tabla             │
│  → Usuario ve las 200 calificaciones    │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problema: Indicador no aparece
**Causa:** Evento `sqlImportProgress` no se emite  
**Solución:** Verificar que modal de admin esté suscrito a Firestore

### Problema: Datos no aparecen
**Causa:** Handlers no están recargando  
**Solución:** Verificar que eventos `sqlGradesUpdated` y `dataImported` se emitan

### Problema: Error en consola
**Causa:** TypeScript o build error  
**Solución:** Ejecutar `npm run dev` y revisar errores

---

## 📚 Referencias

- **Prueba Completa:** `PRUEBA_CARGA_MASIVA_CALIFICACIONES.md`
- **Script Diagnóstico:** `public/test-bulk-import-flow.js`
- **Verificación Rápida:** `public/quick-check.js`
- **CSV de Prueba:** `public/test-data/calificaciones_reales_200.csv`

---

## 🎯 Estado Final

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Indicador de Progreso | ✅ | Muestra "Sincronizando con BBDD" con % |
| Recarga Automática | ✅ | Siempre intenta SQL/Firebase primero |
| Eventos | ✅ | sqlImportProgress + throttling |
| Handlers | ✅ | Mejorados sin dependencia de flags |
| Fallback | ✅ | LocalStorage si SQL falla |
| Documentación | ✅ | Completa con scripts de prueba |
| **Prueba Real** | ⏳ | Pendiente ejecutar en navegador |

---

**Última actualización:** 2025-10-17  
**Desarrollador:** GitHub Copilot  
**Estado:** ✅ Listo para prueba
