# ⚡ SOLUCIÓN INMEDIATA - Calificaciones en Cero

## 🔴 Problema Identificado

La página de Calificaciones muestra `(0)` en todos los badges porque:
1. Los datos no están cargándose correctamente al inicio
2. Hay un bug donde `setGrades([])` vacía las calificaciones cuando hay un error

## 🔧 Solución Inmediata (Sin esperar fix de código)

### Opción 1: Forzar Recarga con Script (30 segundos)

**Paso 1:** Abre la consola del navegador (F12)

**Paso 2:** Ejecuta este comando:
```javascript
(function(){const s=document.createElement('script');s.src='/forzar-recarga-calificaciones.js';document.head.appendChild(s);})();
```

**Paso 3:** Si aparecen las calificaciones, ¡listo! Si no, prueba Opción 2.

### Opción 2: Diagnóstico Completo

```javascript
(function(){const s=document.createElement('script');s.src='/diagnostico-carga-calificaciones.js';document.head.appendChild(s);})();
```

Esto te dirá exactamente qué está fallando.

### Opción 3: Recarga Manual de Página

A veces, simplemente recargar (F5) funciona después de que los datos se cargaron por primera vez.

---

## 🛠️ Fix de Código (Permanente)

El problema está en la línea 348 de `page.tsx`:

```typescript
// ❌ ANTES (problemático)
} catch { setGrades([]); }
```

Esto vacía las calificaciones cuando hay cualquier error. Necesita cambiarse a:

```typescript
// ✅ DESPUÉS (correcto)
} catch { 
  // NO vaciar - mantener estado actual
  console.warn('Error al cargar calificaciones para año', y);
}
```

---

## 📋 Checklist de Verificación

### 1. Verificar que HAY datos en LocalStorage

```javascript
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
const key = `smart-student-test-grades-${year}`;
const data = localStorage.getItem(key);
console.log(data ? `✅ ${JSON.parse(data).length} registros` : '❌ SIN DATOS');
```

### 2. Si NO hay datos, cargarlos

- Ir a **Admin > Configuración**
- Sección "🗄️ Calificaciones en SQL/Firebase"
- Clic en "📤 Cargar Calificaciones"
- Seleccionar: `public/test-data/calificaciones_reales_200.csv`
- Esperar a que termine
- Volver a Calificaciones

### 3. Verificar que la tabla muestra datos

```javascript
const rows = document.querySelectorAll('table tbody tr').length;
console.log(rows > 0 ? `✅ ${rows} filas` : '❌ TABLA VACÍA');
```

---

## 🎯 Comando Todo-en-Uno

Este comando hace diagnóstico + intento de recarga:

```javascript
(async function(){
  console.log('🔍 Diagnóstico y Recarga Automática\n');
  
  // 1. Verificar datos
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const key = `smart-student-test-grades-${year}`;
  const data = localStorage.getItem(key);
  
  if (!data) {
    console.log('❌ NO HAY DATOS - Necesitas cargar calificaciones desde Admin');
    return;
  }
  
  const grades = JSON.parse(data);
  console.log(`✅ Encontrados ${grades.length} registros\n`);
  
  // 2. Forzar eventos
  console.log('🔄 Forzando recarga...');
  
  window.dispatchEvent(new StorageEvent('storage', {
    key,
    newValue: data,
    storageArea: localStorage
  }));
  
  await new Promise(r => setTimeout(r, 500));
  
  window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
    detail: { year, count: grades.length, timestamp: Date.now() }
  }));
  
  await new Promise(r => setTimeout(r, 500));
  
  window.dispatchEvent(new CustomEvent('dataUpdated', {
    detail: { type: 'grades', year, timestamp: Date.now() }
  }));
  
  // 3. Verificar resultado
  await new Promise(r => setTimeout(r, 1000));
  
  const rows = document.querySelectorAll('table tbody tr').length;
  console.log(rows > 0 ? `\n✅ ÉXITO: ${rows} filas visibles` : '\n⚠️ Sigue vacío - Intenta F5');
})();
```

---

## 🚨 Si NADA Funciona

1. **Verificar que el CSV se cargó correctamente:**
   - En Admin > Configuración, verifica que veas el mensaje de éxito
   - Debería decir "200 calificaciones procesadas" o similar

2. **Verificar año seleccionado:**
   ```javascript
   console.log('Año:', localStorage.getItem('admin-selected-year'));
   ```
   Debe ser 2025 (o el año que usaste en el CSV)

3. **Recargar página completamente:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)
   - Esto limpia caché y recarga todo

4. **Último recurso - Limpiar y recargar:**
   ```javascript
   // Solo si NADA funciona y quieres empezar de cero
   Object.keys(localStorage).forEach(k => {
     if (k.includes('test-grades')) localStorage.removeItem(k);
   });
   location.reload();
   ```
   **⚠️ CUIDADO:** Esto borra todas las calificaciones

---

## 📞 Siguiente Paso

**Ejecuta AHORA el comando todo-en-uno** (arriba) y reporta el resultado.

Si dice "NO HAY DATOS", necesitas cargar el CSV primero.  
Si dice "ÉXITO", las calificaciones deberían aparecer.  
Si dice "Sigue vacío", necesitamos hacer el fix de código permanente.
