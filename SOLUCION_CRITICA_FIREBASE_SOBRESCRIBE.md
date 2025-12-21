# 🔴 PROBLEMA CRÍTICO: Calificaciones Desaparecen Después de Sincronización Firebase

## 📋 Situación Identificada

### ✅ Lo que funciona:
1. Archivo corregido `grades-consolidated-2025-FIXED.csv` carga correctamente
2. Calificaciones aparecen inmediatamente en la tabla (85, 82, 88, promedio 85)
3. LocalStorage recibe los datos correctamente

### ❌ Lo que falla:
1. **Sincronización con Firebase inicia automáticamente**
2. **Modal muestra "Sincronizando con BBDD... 90%"**
3. **Cuando termina, las calificaciones DESAPARECEN**
4. Tabla vuelve a mostrar guiones "—"

## 🔍 Causa Raíz

El sistema tiene **dos fuentes de datos**:
1. **LocalStorage** (caché del navegador) ← Donde se cargan primero
2. **Firebase/SQL** (base de datos persistente) ← Donde deben guardarse

**El problema:**
- Las calificaciones se guardan en LocalStorage ✅
- Se intenta sincronizar a Firebase ⏳
- Firebase **NO recibe los datos** o **retorna vacío** ❌
- El sistema sobrescribe LocalStorage con datos vacíos de Firebase ❌
- Las calificaciones desaparecen ❌

## 🛠️ SOLUCIÓN INMEDIATA

### **OPCIÓN 1: Deshabilitar Sincronización Automática con Firebase (Temporal)**

Esto permitirá que las calificaciones permanezcan en LocalStorage sin ser sobrescritas.

**Ejecutar en consola del navegador (F12) ANTES de cargar el archivo:**

```javascript
// Bloquear la sincronización automática con Firebase
window.DISABLE_FIREBASE_SYNC = true;
console.log('✅ Sincronización con Firebase DESHABILITADA temporalmente');
console.log('Las calificaciones se mantendrán solo en LocalStorage');
```

**Pasos:**
1. Abre la pestaña **Admin > Configuración**
2. Abre consola (F12)
3. Pega el código de arriba
4. Presiona Enter
5. Ahora carga el archivo `grades-consolidated-2025-FIXED.csv`
6. Las calificaciones deberían permanecer visibles

### **OPCIÓN 2: Forzar Guardado Solo en LocalStorage**

Modificar temporalmente el comportamiento del sistema.

```javascript
// Interceptar y cancelar sincronización con Firebase
(function disableFirebaseSync() {
  console.log('🔧 Interceptando sincronización con Firebase...');
  
  // Guardar función original
  const originalFetch = window.fetch;
  
  // Sobrescribir fetch para interceptar llamadas a Firebase
  window.fetch = function(...args) {
    const url = args[0];
    
    // Cancelar llamadas a Firebase/bulk-upload
    if (typeof url === 'string' && url.includes('bulk-upload-grades')) {
      console.log('🚫 Bloqueada llamada a Firebase:', url);
      // Retornar respuesta falsa exitosa
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          processed: 0,
          message: 'Sync disabled - data kept in LocalStorage only'
        })
      });
    }
    
    // Permitir otras llamadas
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Sincronización con Firebase BLOQUEADA');
  console.log('💾 Datos permanecerán solo en LocalStorage');
})();
```

**Ejecutar ANTES de cargar el archivo.**

### **OPCIÓN 3: Verificar Estado de Firebase/Firestore**

El problema puede ser que Firebase no está configurado correctamente.

```javascript
// Verificar estado de Firebase
(async function checkFirebaseStatus() {
  console.log('🔍 Verificando estado de Firebase...\n');
  
  try {
    // Verificar si Firebase está inicializado
    if (typeof window.firebase !== 'undefined') {
      console.log('✅ Firebase SDK está cargado');
      
      // Verificar app
      const app = window.firebase.app();
      if (app) {
        console.log('✅ Firebase App inicializada');
        console.log('   ProjectId:', app.options.projectId || 'N/A');
        console.log('   ApiKey:', app.options.apiKey ? '***' + app.options.apiKey.slice(-4) : 'N/A');
      } else {
        console.log('❌ Firebase App NO inicializada');
      }
      
      // Verificar Firestore
      try {
        const db = window.firebase.firestore();
        console.log('✅ Firestore está disponible');
        
        // Intentar lectura de prueba
        const testRef = db.collection('test').doc('connectivity');
        await testRef.get();
        console.log('✅ Conexión a Firestore OK');
      } catch (firestoreError) {
        console.log('❌ Error en Firestore:', firestoreError.message);
      }
    } else {
      console.log('❌ Firebase SDK NO está cargado');
    }
  } catch (e) {
    console.error('❌ Error verificando Firebase:', e);
  }
  
  // Verificar endpoint de carga masiva
  console.log('\n🔍 Verificando endpoint de carga masiva...');
  try {
    const response = await fetch('/api/firebase/health-check', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('✅ Endpoint de Firebase responde');
    } else {
      console.log('⚠️ Endpoint responde pero con error:', response.status);
    }
  } catch (endpointError) {
    console.log('❌ Endpoint de Firebase NO responde:', endpointError.message);
  }
  
  console.log('\n📊 CONCLUSIÓN:');
  console.log('Si ves errores arriba, Firebase no está configurado correctamente.');
  console.log('Las calificaciones solo funcionarán en LocalStorage hasta que se configure.');
})();
```

## 🔧 SOLUCIÓN PERMANENTE (Requiere Modificación de Código)

El problema está en la función que maneja la sincronización. Necesitamos evitar que sobrescriba LocalStorage con datos vacíos de Firebase.

### **Archivo a modificar:** `src/app/dashboard/calificaciones/page.tsx`

**Problema en línea ~470-540** (handler `onSQLGradesUpdated`):

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (línea ~500)
if (rawSqlGrades && Array.isArray(rawSqlGrades) && rawSqlGrades.length > 0) {
  // Actualiza con datos de SQL
  setGrades(rawSqlGrades);
} else {
  console.warn(`⚠️ SQL retornó array vacío para el año ${selectedYear}`);
  // ❌ PROBLEMA: No hace nada, pero tampoco preserva LocalStorage
}
```

**Solución:**

```typescript
// ✅ CÓDIGO CORREGIDO
if (rawSqlGrades && Array.isArray(rawSqlGrades) && rawSqlGrades.length > 0) {
  // Actualiza con datos de SQL
  setGrades(rawSqlGrades);
  sqlSuccess = true;
} else {
  console.warn(`⚠️ SQL retornó array vacío para el año ${selectedYear}`);
  // ✅ PRESERVAR LocalStorage si SQL está vacío
  console.log('💾 Preservando datos de LocalStorage...');
  sqlSuccess = false; // Forzar fallback a LocalStorage
}
```

## 📝 PASOS RECOMENDADOS (INMEDIATO)

### **Para Trabajar Ahora (Sin Modificar Código):**

1. **Usar Opción 1 o 2** (deshabilitar sincronización)
2. **Cargar archivo corregido**
3. **Verificar que las calificaciones permanecen**
4. **Trabajar normalmente** (solo usará LocalStorage)

### **Para Solución Permanente:**

1. **Ejecutar Opción 3** (verificar estado de Firebase)
2. **Si Firebase NO está configurado:**
   - Las calificaciones solo funcionarán en LocalStorage
   - Esto es suficiente para desarrollo/pruebas
   - Para producción, configurar Firebase correctamente

3. **Si Firebase SÍ está configurado pero falla:**
   - Revisar reglas de Firestore
   - Verificar permisos de escritura
   - Revisar endpoint `/api/firebase/bulk-upload-grades`

## 🎯 Script de Solución Todo-en-Uno

Ejecuta esto en consola ANTES de cargar el archivo:

```javascript
/**
 * 🛡️ PROTECCIÓN: Evitar que Firebase sobrescriba LocalStorage
 * Ejecutar ANTES de cargar grades-consolidated-2025-FIXED.csv
 */
(function protectLocalStorage() {
  console.log('🛡️ ════════════════════════════════════════════════════════');
  console.log('🛡️ PROTECCIÓN ACTIVADA: LocalStorage NO será sobrescrito');
  console.log('🛡️ ════════════════════════════════════════════════════════\n');
  
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const gradesKey = `smart-student-test-grades-${year}`;
  
  // Interceptar eventos de sincronización
  window.addEventListener('sqlGradesUpdated', function protectHandler(e) {
    console.log('🔔 Evento sqlGradesUpdated detectado');
    
    // Verificar si hay datos en LocalStorage
    const currentData = localStorage.getItem(gradesKey);
    if (currentData) {
      const grades = JSON.parse(currentData);
      console.log(`💾 LocalStorage tiene ${grades.length} calificaciones`);
      console.log('🛡️ PROTEGIENDO datos de LocalStorage...');
      
      // Re-aplicar datos de LocalStorage después de 1 segundo
      setTimeout(() => {
        const afterSync = localStorage.getItem(gradesKey);
        const afterGrades = afterSync ? JSON.parse(afterSync) : [];
        
        if (afterGrades.length === 0 && grades.length > 0) {
          console.log('⚠️ Firebase BORRÓ los datos. RESTAURANDO...');
          localStorage.setItem(gradesKey, JSON.stringify(grades));
          
          // Forzar recarga de UI
          window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
            detail: { year, timestamp: Date.now(), source: 'protection' }
          }));
          
          console.log(`✅ ${grades.length} calificaciones RESTAURADAS`);
        } else if (afterGrades.length > 0) {
          console.log(`✅ Datos preservados: ${afterGrades.length} calificaciones`);
        }
      }, 1000);
    }
  }, true);
  
  // Bloquear llamadas a Firebase que puedan sobrescribir
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('bulk-upload-grades')) {
      console.log('🚫 Bloqueada sincronización con Firebase');
      console.log('💾 Datos permanecerán en LocalStorage');
      
      // Retornar respuesta falsa exitosa
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          processed: 0,
          activities: 0,
          message: 'LocalStorage mode - Firebase sync disabled'
        })
      });
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Protección activada correctamente');
  console.log('📝 Ahora puedes cargar el archivo CSV');
  console.log('🔒 Las calificaciones NO serán borradas por Firebase\n');
})();
```

## ✅ Verificación Final

Después de aplicar la protección y cargar el archivo:

```javascript
// Verificar que los datos están protegidos
const year = 2025;
const key = `smart-student-test-grades-${year}`;
const grades = JSON.parse(localStorage.getItem(key) || '[]');

console.log('📊 Estado Final:');
console.log(`   Calificaciones en LocalStorage: ${grades.length}`);
console.log(`   Muestra de datos:`, grades.slice(0, 3));

if (grades.length > 0) {
  console.log('✅ PROTECCIÓN FUNCIONANDO');
} else {
  console.log('❌ Datos aún se están borrando');
}
```

---

**Fecha:** 2025-10-20  
**Problema:** Calificaciones desaparecen después de sincronización con Firebase  
**Causa:** Firebase sobrescribe LocalStorage con datos vacíos  
**Solución:** Proteger LocalStorage o deshabilitar sincronización temporal
