# 🚨 GUÍA: Solucionar Pérdida de Datos en Carga Masiva

## 📋 Problema

Después de realizar la carga masiva de calificaciones desde `grades-consolidated-2025-FIXED.csv`:
1. ✅ Los datos aparecen inicialmente
2. ❌ Luego desaparecen cuando termina la carga de Firebase
3. ❌ Los estudiantes de secciones y cursos también desaparecen
4. ❌ Es como si se refrescara la información pero se perdiera todo

## 🔍 Paso 1: Diagnosticar el Problema

### Opción A: Script de Diagnóstico Automático

1. **Abrir la consola del navegador**:
   - Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux)
   - Presiona `Cmd+Option+I` (Mac)
   - Ve a la pestaña "Console"

2. **Copiar y ejecutar el script de diagnóstico**:
   ```bash
   # En VS Code, abre el archivo:
   diagnostico-perdida-datos-carga-masiva.js
   
   # Copia TODO el contenido
   # Pega en la consola del navegador
   # Presiona Enter
   ```

3. **Observar el reporte**:
   - Verá el estado de LocalStorage
   - Verá el estado de Firebase
   - Los listeners quedarán activos para monitorear eventos

### Opción B: Verificación Manual

Ejecuta en la consola:

```javascript
// Ver estado actual
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
const grades = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');

console.log('📊 Calificaciones:', grades.length);
console.log('📚 Cursos:', courses.length);
console.log('👨‍🎓 Estudiantes:', students.length);
```

## 🛠️ Paso 2: Verificar la Solución Está Implementada

La solución ya debería estar implementada en el código. Verifica:

```bash
# En el terminal de VS Code
cd /workspaces/superjf_v16
grep -n "skipFirebaseReload: true" src/components/admin/user-management/configuration.tsx
```

Deberías ver al menos 2 líneas que contienen `skipFirebaseReload: true`.

Si NO ves ninguna, necesitas aplicar la solución (ver Paso 3).

## 🔧 Paso 3: Aplicar la Solución (Si No Está)

### Cambio en configuration.tsx

**Archivo**: `src/components/admin/user-management/configuration.tsx`

Busca la línea (~746) donde se emite el evento después de la carga:

```typescript
// ❌ ANTES (INCORRECTO)
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
  detail: { 
    year: selectedYear, 
    count: result.processed,
    timestamp: Date.now(),
    source: 'firebase-admin'
  } 
}));
```

Reemplaza por:

```typescript
// ✅ DESPUÉS (CORRECTO)
window.dispatchEvent(new CustomEvent('dataImported', { 
  detail: { 
    type: 'grades', 
    year: selectedYear, 
    count: result.processed,
    timestamp: Date.now(),
    source: 'firebase-admin',
    skipFirebaseReload: true // ← Esto previene la recarga inmediata
  } 
}));
```

### Cambio en page.tsx

**Archivo**: `src/app/dashboard/calificaciones/page.tsx`

Los listeners ya deberían tener soporte para `skipFirebaseReload`. Verifica en la línea ~466:

```typescript
const onSQLGradesUpdated = async (e?: any) => {
  const detail = (e as CustomEvent)?.detail;
  const skipFirebaseReload = detail?.skipFirebaseReload === true;
  
  // Si tiene el flag, usar LocalStorage en vez de Firebase
  if (skipFirebaseReload) {
    console.log('⏭️ skipFirebaseReload=true: Usando LocalStorage');
    // ... cargar desde LocalStorage
    return;
  }
  
  // Comportamiento normal...
};
```

## 🧪 Paso 4: Probar la Solución

### Pre-requisitos

1. **Verificar que hay cursos y estudiantes**:
   ```javascript
   // En consola
   const year = 2025;
   const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
   const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
   console.log('Cursos:', courses.length);
   console.log('Estudiantes:', students.length);
   ```

   Si alguno es 0, primero debes cargar esos datos:
   - **Cursos**: Admin > Configuración > Gestión de Cursos
   - **Estudiantes**: Admin > Configuración > Gestión de Estudiantes

### Prueba de Carga Masiva

1. **Abrir Admin > Configuración**

2. **Ejecutar script de diagnóstico** (mantener consola abierta)

3. **Ir a sección "Carga Masiva: Calificaciones"**

4. **Seleccionar archivo**: `grades-consolidated-2025-FIXED.csv`

5. **Observar la consola durante la carga**:
   
   Deberías ver:
   ```
   📁 Archivo seleccionado: grades-consolidated-2025-FIXED.csv
   🚀 Iniciando carga masiva a Firebase...
   ✅ Resultado API: 247 procesadas
   ✅ Eventos de actualización emitidos (sin trigger de recarga Firebase)
      Firebase indexará los datos en background
      LocalStorage actuará como caché temporal
   
   📦 EVENTO: dataImported
   ✅ skipFirebaseReload=true (CORRECTO)
      → La UI NO intentará recargar desde Firebase inmediatamente
      → Usará LocalStorage como caché
   ```

6. **Ir a Dashboard > Calificaciones**

7. **Verificar que los datos están presentes**:
   - Deberías ver las calificaciones cargadas
   - Los filtros deberían funcionar
   - Los estudiantes deben aparecer

8. **Recargar la página (F5)**:
   - Los datos deben seguir ahí
   - No deben desaparecer

## ❌ Paso 5: Si los Datos Siguen Desapareciendo

### Diagnosticar Causa

En la consola, busca el mensaje:

```
💾 CAMBIO EN LOCALSTORAGE: Calificaciones
Nuevos registros: 0
❌ ALERTA: LocalStorage fue vaciado!
```

Si ves esto, significa que algo está vaciando el LocalStorage. Busca QUÉ evento ocurrió justo antes:

- `sqlGradesUpdated` sin `skipFirebaseReload`
- `dataImported` sin `skipFirebaseReload`
- Algún otro evento personalizado

### Soluciones Específicas

#### Problema: Firebase retorna vacío

**Síntomas**:
```
🔄 Recargando calificaciones para año 2025...
⚠️ SQL retornó array vacío para el año 2025
```

**Causa**: Firebase aún no terminó de indexar los datos.

**Solución**: El código YA tiene la solución con `skipFirebaseReload: true`. Verifica que esté implementado.

#### Problema: Evento sqlGradesUpdated sin flag

**Síntomas**:
```
📊 EVENTO: sqlGradesUpdated
⚠️ skipFirebaseReload=false o undefined (PROBLEMA)
```

**Solución**: Cambiar en `configuration.tsx` para que emita `dataImported` en vez de `sqlGradesUpdated`.

#### Problema: LocalStorage se vacía en el catch

**Síntomas**:
```javascript
// En page.tsx
catch (err) {
  setGrades([]); // ❌ Esto vacía los datos!
}
```

**Solución**: Cambiar para que NO vacíe en caso de error:

```javascript
catch (err) {
  console.warn('Error cargando datos:', err);
  // NO setGrades([]) - mantener estado actual
}
```

## 📊 Paso 6: Verificación Final

### Checklist Completo

Ejecuta estos comandos en la consola después de la carga:

```javascript
// 1. Verificar LocalStorage
const year = 2025;
const grades = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
console.log('✅ Calificaciones en LS:', grades.length);

// 2. Verificar Firebase (requiere Firebase habilitado)
const { getFirestoreInstance } = await import('/src/lib/firebase-config.js');
const { collection, getDocs, query, where } = await import('firebase/firestore');
const db = getFirestoreInstance();
const coursesSnap = await getDocs(collection(db, 'courses'));
let totalGrades = 0;
for (const courseDoc of coursesSnap.docs) {
  const gradesSnap = await getDocs(
    query(collection(db, `courses/${courseDoc.id}/grades`), where('year', '==', year))
  );
  totalGrades += gradesSnap.size;
}
console.log('✅ Calificaciones en Firebase:', totalGrades);

// 3. Verificar que no se vacíe al recargar
location.reload();
// Después de recargar, ejecutar el paso 1 de nuevo
```

### Métricas de Éxito

- ✅ LocalStorage tiene > 0 calificaciones después de carga
- ✅ Firebase tiene > 0 calificaciones (verificar en Console)
- ✅ Recargar página NO elimina los datos
- ✅ Ir a Calificaciones muestra los datos
- ✅ Los filtros funcionan correctamente
- ✅ Los estudiantes aparecen en sus secciones

## 🆘 Soporte Adicional

### Documentos de Referencia

1. **SOLUCION_PERDIDA_DATOS_CARGA_MASIVA.md**
   - Explicación técnica completa del problema
   - Cambios de código detallados
   - Flujos antes y después

2. **SOLUCION_ACTUALIZACION_CALIFICACIONES.md**
   - Sistema de eventos de actualización
   - Listeners de la UI
   - Sincronización Firebase

3. **CARGA_MASIVA_UI_FIREBASE.md**
   - Proceso completo de carga masiva
   - Ventajas del método Firebase
   - Solución de problemas

### Scripts Útiles

```bash
# Ver todos los scripts de diagnóstico disponibles
ls -la *.js | grep diagnostico

# Scripts específicos:
# - diagnostico-perdida-datos-carga-masiva.js (principal)
# - diagnostico-carga-masiva-vercel.js (para Vercel)
# - forzar-actualizacion-calificaciones.js (forzar recarga)
```

### Comandos de Emergencia

Si todo falla y necesitas recuperar los datos:

```javascript
// 1. Verificar backup en Firebase
// (requiere acceso a Firebase Console)

// 2. Re-cargar archivo CSV
// Ve a Admin > Configuración > Carga Masiva
// Selecciona el archivo de nuevo

// 3. Sincronizar desde Firebase
const year = 2025;
await window.sincronizarFirebaseLocalStorage(year);

// 4. Forzar recarga completa
location.reload();
```

## 📞 Reportar Problema

Si después de seguir todos estos pasos el problema persiste, recopila:

1. **Logs de la consola** durante la carga masiva
2. **Screenshots** del modal de progreso
3. **Estado de LocalStorage** (ejecutar script de diagnóstico)
4. **Estado de Firebase** (Firebase Console)
5. **Versión del navegador** y sistema operativo

Incluye en el reporte:
- ¿En qué paso exactamente desaparecen los datos?
- ¿Qué evento aparece justo antes en la consola?
- ¿El flag `skipFirebaseReload` aparece como `true`?

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
**Estado**: ✅ Solución Implementada
