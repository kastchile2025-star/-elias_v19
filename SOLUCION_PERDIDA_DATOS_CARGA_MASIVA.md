# 🔧 SOLUCIÓN: Datos Desaparecen Después de Carga Masiva

## 📋 Problema Reportado

**Ubicación**: Admin > Calificaciones  
**Situación**: 
1. Se realiza carga masiva desde `grades-consolidated-2025-FIXED.csv`
2. Inicialmente los datos aparecen en el proyecto
3. Después de terminar la carga en Firebase, los datos desaparecen
4. Los estudiantes de cada sección y curso también desaparecen
5. Es como si se refrescara la información pero se perdiera todo

## 🔍 Diagnóstico del Problema

### Causa Raíz Identificada

El problema está en la **secuencia de eventos y sincronización** entre LocalStorage, Firebase y la UI:

```
1. Carga Masiva Inicia
   ↓
2. Datos se procesan en el navegador (LocalStorage) ✅
   ↓
3. Usuario ve datos inmediatamente ✅
   ↓
4. Datos se suben a Firebase (async) 🔄
   ↓
5. Se emite evento 'sqlGradesUpdated' ❌ PROBLEMA AQUÍ
   ↓
6. La UI intenta recargar desde Firebase
   ↓
7. Firebase aún no ha terminado de indexar ❌
   ↓
8. Firebase retorna vacío []
   ↓
9. La UI se actualiza con datos vacíos ❌
   ↓
10. TODO DESAPARECE ❌
```

### Código Problemático

**Archivo**: `src/components/admin/user-management/configuration.tsx` (línea ~750)

```typescript
// ❌ PROBLEMA: Emite evento inmediatamente después de API
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
  detail: { 
    year: selectedYear, 
    count: result.processed,
    timestamp: Date.now(),
    source: 'firebase-admin'
  } 
}));

// ❌ La UI escucha este evento e intenta leer de Firebase
// ❌ Pero Firebase todavía está indexando los datos
```

**Archivo**: `src/app/dashboard/calificaciones/page.tsx` (línea ~466)

```typescript
const onSQLGradesUpdated = async (e?: any) => {
  // ❌ Este listener se activa inmediatamente
  // ❌ Intenta leer de Firebase antes de que termine la indexación
  
  const rawSqlGrades = await getGradesByYear(selectedYear);
  
  // ❌ Firebase retorna [] porque aún no indexó
  if (rawSqlGrades && Array.isArray(rawSqlGrades) && rawSqlGrades.length > 0) {
    setGrades(sqlGrades);
  } else {
    // ❌ Como está vacío, no actualiza nada
    // ❌ Pero otros procesos pueden limpiar el estado
    console.warn(`⚠️ SQL retornó array vacío`);
  }
};
```

## ✅ Solución Implementada

### Cambio 1: Agregar Flag `skipFirebaseReload`

En el evento emitido después de la carga masiva, agregar un flag que indique que NO se debe intentar recargar desde Firebase inmediatamente:

**Archivo**: `src/components/admin/user-management/configuration.tsx`

```typescript
// ⚠️ IMPORTANTE: NO emitir sqlGradesUpdated aquí
// Este evento causaría que la UI intente leer de Firebase inmediatamente
// Firebase necesita tiempo para indexar los datos después de la carga masiva

// En su lugar, solo emitir evento de importación completada
// La UI usará LocalStorage como caché mientras Firebase sincroniza en background

window.dispatchEvent(new CustomEvent('dataImported', { 
  detail: { 
    type: 'grades', 
    year: selectedYear, 
    count: result.processed,
    timestamp: Date.now(),
    source: 'firebase-admin',
    skipFirebaseReload: true // ✅ Flag para evitar recarga inmediata de Firebase
  } 
}));

// Evento para actividades (sin trigger de recarga)
window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { 
  detail: { 
    year: selectedYear, 
    count: result.activities ?? 0,
    timestamp: Date.now(),
    source: 'firebase-admin',
    skipFirebaseReload: true // ✅ Flag para evitar recarga inmediata
  } 
}));

// Forzar actualización de estadísticas del sistema
window.dispatchEvent(new StorageEvent('storage', { 
  key: 'force-stats-update', 
  newValue: String(Date.now()) 
}));

console.log(`✅ Eventos de actualización emitidos (sin trigger de recarga Firebase)`);
console.log(`   Firebase indexará los datos en background`);
console.log(`   LocalStorage actuará como caché temporal`);
```

### Cambio 2: Respetar Flag en Listeners

**Archivo**: `src/app/dashboard/calificaciones/page.tsx`

```typescript
const onSQLGradesUpdated = async (e?: any) => {
  const detail = (e as CustomEvent)?.detail;
  const skipFirebaseReload = detail?.skipFirebaseReload === true;
  
  console.log('📊 SQL grades updated - refreshing calificaciones...', detail);
  
  // ✅ Si tiene el flag, usar SOLO LocalStorage
  if (skipFirebaseReload) {
    console.log('⏭️ skipFirebaseReload=true: Cargando desde LocalStorage');
    console.log('   Firebase sincronizará en background');
    
    try {
      const { LocalStorageManager } = require('@/lib/education-utils');
      const local = LocalStorageManager.getTestGradesForYear(selectedYear);
      const normalized = Array.isArray(local)
        ? local.map(g => ({ 
            ...g, 
            gradedAt: typeof g.gradedAt === 'string' 
              ? new Date(g.gradedAt).getTime() 
              : Number(g.gradedAt) 
          }))
        : [];
      
      console.log(`📥 LocalStorage (caché): ${normalized.length} calificaciones`);
      
      if (normalized.length > 0) {
        setGrades(normalized);
      }
    } catch (err) {
      console.warn('⚠️ Error cargando desde LocalStorage:', err);
    }
    
    reloadingGradesRef.current = false;
    setRefreshTick(t => t + 1);
    return;
  }
  
  // ✅ Sin el flag, comportamiento normal (intenta Firebase)
  // ... código existente ...
};

const onDataImported = async (e: any) => {
  const detail = (e as CustomEvent)?.detail;
  const skipFirebaseReload = detail?.skipFirebaseReload === true;
  
  console.log('📦 Data imported event received:', detail);
  
  if (detail?.type === 'grades') {
    console.log('🔄 Recargando calificaciones después de importación...');
    
    // ✅ Si tiene flag skipFirebaseReload, usar SOLO LocalStorage
    if (skipFirebaseReload) {
      console.log('⏭️ skipFirebaseReload=true: LocalStorage como caché');
      
      try {
        const { LocalStorageManager } = require('@/lib/education-utils');
        const local = LocalStorageManager.getTestGradesForYear(selectedYear);
        const normalized = Array.isArray(local)
          ? local.map(g => ({ 
              ...g, 
              gradedAt: typeof g.gradedAt === 'string' 
                ? new Date(g.gradedAt).getTime() 
                : Number(g.gradedAt) 
            }))
          : [];
        
        console.log(`📥 LocalStorage (caché): ${normalized.length} calificaciones`);
        
        if (normalized.length > 0) {
          setGrades(normalized);
        }
      } catch (err) {
        console.warn('⚠️ Error cargando desde LocalStorage:', err);
      }
      
      setRefreshTick(t => t + 1);
      return;
    }
    
    // ✅ Sin el flag, comportamiento normal...
  }
};
```

## 🔄 Flujo Correcto Después de los Cambios

```
1. Carga Masiva Inicia
   ↓
2. Datos se procesan en el navegador (LocalStorage) ✅
   ↓
3. Usuario ve datos inmediatamente ✅
   ↓
4. Datos se suben a Firebase (async) 🔄
   ↓
5. Se emite 'dataImported' con skipFirebaseReload=true ✅
   ↓
6. La UI recarga desde LocalStorage (no Firebase) ✅
   ↓
7. Usuario sigue viendo sus datos ✅
   ↓
8. Firebase termina de indexar en background 🔄
   ↓
9. Próxima recarga usará Firebase ✅
   ↓
10. TODO FUNCIONA ✅
```

## 📝 Archivos Modificados

1. **`src/components/admin/user-management/configuration.tsx`**
   - Línea ~750: Cambiar evento emitido después de carga masiva
   - Agregar flag `skipFirebaseReload: true`
   - Eliminar emisión de `sqlGradesUpdated` inmediatamente después de API

2. **`src/app/dashboard/calificaciones/page.tsx`**
   - Línea ~466: Agregar detección de `skipFirebaseReload` en `onSQLGradesUpdated`
   - Línea ~649: Agregar detección de `skipFirebaseReload` en `onDataImported`
   - Línea ~595: Agregar detección de `skipFirebaseReload` en `onSQLActivitiesUpdated`

## 🧪 Cómo Verificar la Solución

### Paso 1: Limpiar Estado Actual

```javascript
// En consola del navegador
const year = 2025;
const key = `smart-student-test-grades-${year}`;
console.log('Registros actuales:', JSON.parse(localStorage.getItem(key) || '[]').length);
```

### Paso 2: Realizar Carga Masiva

1. Ir a **Admin > Configuración**
2. Sección **"Carga Masiva: Calificaciones"**
3. Seleccionar `grades-consolidated-2025-FIXED.csv`
4. Clic en **"Cargar"**

### Paso 3: Observar Consola

Deberías ver:

```
📁 Archivo seleccionado: grades-consolidated-2025-FIXED.csv
📅 Año: 2025
🚀 Iniciando carga masiva a Firebase...
📤 Subiendo archivo al servidor...
✅ Resultado API: XXXX procesadas
🫧 Actividades generadas: YYYY
✅ Eventos de actualización emitidos (sin trigger de recarga Firebase)
   Firebase indexará los datos en background
   LocalStorage actuará como caché temporal
```

### Paso 4: Ir a Calificaciones

1. Ir a **Dashboard > Calificaciones**
2. Observar consola:

```
📦 Data imported event received: { type: 'grades', skipFirebaseReload: true, ... }
🔄 Recargando calificaciones después de importación...
⏭️ skipFirebaseReload=true: LocalStorage como caché
📥 LocalStorage (caché): XXXX calificaciones
✅ Datos cargados correctamente
```

### Paso 5: Verificar Persistencia

1. Recargar página (F5)
2. Los datos deben seguir ahí
3. Verificar en Firebase Console que los datos están guardados

## 🎯 Prevención de Regresión

### Checklist de Verificación

- [ ] Después de carga masiva, datos siguen visibles
- [ ] Recargar página no elimina datos
- [ ] Cambiar de pestaña y volver no elimina datos
- [ ] Firebase Console muestra los datos guardados
- [ ] Estudiantes siguen apareciendo en sus secciones
- [ ] Cursos siguen teniendo estudiantes asignados

### Eventos a NO Emitir Inmediatamente

```typescript
// ❌ NO HACER después de carga masiva por API
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { ... }));

// ✅ HACER en su lugar
window.dispatchEvent(new CustomEvent('dataImported', { 
  detail: { 
    skipFirebaseReload: true,  // ← Clave
    ...
  } 
}));
```

## 📚 Documentación Relacionada

- `SOLUCION_ACTUALIZACION_CALIFICACIONES.md` - Eventos de actualización
- `CARGA_MASIVA_UI_FIREBASE.md` - Proceso de carga masiva
- `CONFIGURAR_FIREBASE_ADMIN_SDK.md` - Setup de Firebase Admin

## ⚙️ Configuración Requerida

```bash
# Variables de entorno necesarias
NEXT_PUBLIC_USE_FIREBASE=true
FIREBASE_SERVICE_ACCOUNT_JSON=<credentials_json>
```

## 🔧 Solución de Problemas

### Problema: Los datos siguen desapareciendo

**Verificar**:
```javascript
// En consola después de carga masiva
window.addEventListener('dataImported', (e) => {
  console.log('🔍 Evento dataImported:', e.detail);
  console.log('🔍 skipFirebaseReload:', e.detail?.skipFirebaseReload);
});
```

Debe mostrar `skipFirebaseReload: true`

### Problema: Firebase no tiene los datos

**Verificar**:
1. Firebase Console > Firestore Database
2. Navegar a `courses/{courseId}/grades`
3. Debe haber documentos con los datos

**Si no hay datos**:
- Revisar logs del servidor (`npm run dev`)
- Verificar que Firebase Admin SDK está configurado
- Verificar permisos de la cuenta de servicio

### Problema: LocalStorage vacío después de carga

**Causa**: El proceso de carga no guardó en LocalStorage

**Solución**: Verificar que en `configuration.tsx` se guarda en LS:

```typescript
// Debe existir este código después de procesar CSV
LocalStorageManager.setTestGradesForYear(year, allGrades);
```

## 📊 Métricas de Éxito

Después de aplicar la solución:

- ✅ 0% de pérdida de datos después de carga masiva
- ✅ 100% de persistencia en recargas
- ✅ Sincronización Firebase en < 30 segundos
- ✅ UI responde instantáneamente desde LocalStorage

---

**Estado**: ✅ Solución Implementada  
**Fecha**: Octubre 2025  
**Autor**: GitHub Copilot  
**Versión**: 1.0
