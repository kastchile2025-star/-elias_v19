# 🎬 GUÍA PASO A PASO - Verificar y Solucionar Calificaciones (0)

## 📋 Resumen Rápido

**Problema:** Badges mostrando `(0)` y tabla vacía después de carga masiva  
**Solución:** Fix aplicado en código + Scripts de verificación  
**Tiempo:** 2-5 minutos

---

## 🚀 PASO 1: Verificar el Fix (OBLIGATORIO)

### 1.1 Abre la Pestaña Calificaciones

- Ve a **Dashboard > Calificaciones**
- Asegúrate de estar en esa pestaña

### 1.2 Abre la Consola del Navegador

- **Windows/Linux:** Presiona `F12` o `Ctrl+Shift+I`
- **Mac:** Presiona `Cmd+Option+I`
- Haz clic en la pestaña **"Console"** (Consola)

### 1.3 Ejecuta el Script de Verificación

Copia y pega este comando en la consola y presiona Enter:

```javascript
(function(){const s=document.createElement('script');s.src='/verificar-fix-calificaciones.js';document.head.appendChild(s);})();
```

### 1.4 Lee el Resultado

El script te mostrará uno de estos resultados:

#### ✅ Resultado A: "TODO FUNCIONANDO CORRECTAMENTE"
```
✅ TODO FUNCIONANDO CORRECTAMENTE
   • LocalStorage tiene datos ✓
   • Badges muestran números ✓
   • Tabla tiene filas ✓

🎉 El fix está funcionando perfectamente!
```

**Acción:** ¡Nada! Ya funciona. Ve al **PASO 3** para probar más.

---

#### ⚠️ Resultado B: "HAY DATOS PERO LA UI ESTÁ VACÍA"
```
⚠️ HAY DATOS PERO LA UI ESTÁ VACÍA
   • LocalStorage: ✓ 200 registros
   • Badges: ✗ Todos en (0)
   • Tabla: ✗ Vacía

💡 SOLUCIONES:
```

**Acción:** El script te mostrará un comando. Cópialo y pégalo en la consola. Luego ve al **PASO 2**.

---

#### ❌ Resultado C: "NO HAY DATOS EN LOCALSTORAGE"
```
❌ NO HAY DATOS EN LOCALSTORAGE
   • LocalStorage: ✗ Vacío para año 2025
   
💡 ACCIÓN REQUERIDA:
1️⃣ Ir a Admin > Configuración
...
```

**Acción:** Ve al **PASO 2** para cargar los datos.

---

## 📤 PASO 2: Cargar Datos (Si No Hay Datos)

Solo necesitas este paso si el script de verificación dijo **"NO HAY DATOS"**.

### 2.1 Ve a Admin > Configuración

- En el menú lateral, haz clic en **"👤 Admin"**
- Luego haz clic en **"⚙️ Configuración"**

### 2.2 Busca la Sección de Calificaciones

- Desplázate hasta encontrar **"🗄️ Calificaciones en SQL/Firebase"**
- Es una sección con un botón **"📤 Cargar Calificaciones"**

### 2.3 Selecciona el Archivo CSV

- Haz clic en **"📤 Cargar Calificaciones"**
- Se abrirá un selector de archivos
- Navega a: `public/test-data/`
- Selecciona: **`calificaciones_reales_200.csv`**

### 2.4 Espera la Confirmación

Verás una barra de progreso:
```
🔄 Cargando calificaciones...
█████████████████████ 100%
```

Luego un mensaje de éxito:
```
✅ 200 calificaciones procesadas correctamente
```

### 2.5 Vuelve a Calificaciones

- Haz clic en **"📊 Calificaciones"** en el menú lateral
- Deberías ver los badges con números
- La tabla debería mostrar filas

### 2.6 Si Sigue Vacío

Ejecuta este comando en la consola:

```javascript
location.reload(); // F5 también funciona
```

---

## 🎯 PASO 3: Probar que Todo Funciona

### 3.1 Verificar Badges

Los badges deberían mostrar números como:

```
✅ Calificaciones: 2do Semestre (200)

📚 Por Curso:
   1ro Básico (15)
   2do Básico (12)
   3ro Básico (18)
   ...

🏫 Por Sección:
   1ro Básico A (8)
   1ro Básico B (7)
   2do Básico A (6)
   ...
```

### 3.2 Verificar Tabla

La tabla debería mostrar filas como:

| Estudiante | RUT | Curso | Sección | Materia | Calificación | Fecha |
|------------|-----|-------|---------|---------|--------------|-------|
| Juan Pérez | 12345678-9 | 1ro Básico | A | Matemática | 6.5 | 2025-01-15 |
| María García | 98765432-1 | 1ro Básico | A | Lenguaje | 7.0 | 2025-01-15 |
| ... | ... | ... | ... | ... | ... | ... |

### 3.3 Probar Filtros

Prueba hacer clic en:

- **Semestre:** Cambia entre "1er Semestre" y "2do Semestre"
  - Los números en badges deberían cambiar
  - La tabla debería filtrar

- **Curso:** Haz clic en "1ro Básico"
  - Solo debería mostrar calificaciones de 1ro Básico

- **Sección:** Haz clic en "A"
  - Solo debería mostrar calificaciones de sección A

### 3.4 Probar Cambio de Año

- En el selector de año (arriba a la derecha), cambia a otro año
- Si no hay datos para ese año, debería mostrar `(0)` (correcto)
- Cambia de vuelta al año 2025
- Debería mostrar los datos de nuevo

---

## 🔍 PASO 4: Verificar Logs (Opcional)

Si quieres ver lo que está pasando "por dentro":

### 4.1 Abre la Consola

- F12 → Pestaña "Console"

### 4.2 Recarga la Página

- F5 o `Ctrl+R` (Mac: `Cmd+R`)

### 4.3 Busca Estos Logs

Deberías ver:

```
📊 [Calificaciones] Carga inicial para año 2025:
   { totalLocal: 200, sinDemo: 200, isEmpty: false }

⚡ Carga instantánea: 200 calificaciones desde LocalStorage
```

Si ves:
```
⚠️ LocalStorage vacío - esperando SQL/Firebase
```
Ve al **PASO 2** (cargar datos).

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Problema 1: "El script no hace nada"

**Síntomas:**
- Ejecutas el comando del script de verificación
- No pasa nada, no aparece ningún mensaje

**Solución:**
```javascript
// Ejecuta directamente este código:
console.clear();
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
const key = `smart-student-test-grades-${year}`;
const data = JSON.parse(localStorage.getItem(key) || '[]');
console.log('Año:', year);
console.log('Registros:', data.length);
console.log('Badges:', Array.from(document.querySelectorAll('[class*="badge"]')).map(b => b.textContent).slice(0, 5));
console.log('Filas tabla:', document.querySelectorAll('table tbody tr').length);
```

---

### Problema 2: "Badges en (0) después de cargar CSV"

**Síntomas:**
- Cargaste el CSV correctamente
- Viste el mensaje de éxito
- Pero los badges siguen en (0)

**Solución:**
```javascript
// Forzar recarga de datos
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
const key = `smart-student-test-grades-${year}`;
window.dispatchEvent(new StorageEvent('storage', {
  key: key,
  newValue: localStorage.getItem(key),
  storageArea: localStorage
}));

// Esperar 1 segundo y recargar página
setTimeout(() => location.reload(), 1000);
```

---

### Problema 3: "Error en consola"

**Síntomas:**
- Ves mensajes rojos en la consola
- Texto como "Error:", "Uncaught", "TypeError", etc.

**Solución:**
1. **Copia TODO el error** (haz clic derecho → "Copy" en el error)
2. **Ejecuta el script de verificación** (PASO 1) para ver diagnóstico completo
3. **Reporta:**
   - El error completo
   - El resultado del script de verificación
   - Captura de pantalla de la página

---

### Problema 4: "Tabla vacía pero badges con números"

**Síntomas:**
- Badges muestran: `1ro Básico (15)`, `2do Básico (12)`, etc.
- Pero la tabla está vacía

**Solución:**
```javascript
// Verificar filtros
console.log('Filtros activos:');
console.log('Semestre:', document.querySelector('[aria-label*="Semestre"]')?.textContent);
console.log('Curso:', document.querySelector('[aria-label*="Curso"]')?.textContent);
console.log('Sección:', document.querySelector('[aria-label*="Sección"]')?.textContent);

// Resetear filtros: haz clic en los badges activos (azules) para desactivarlos
```

**O simplemente:**
- Haz clic en todos los badges azules/activos para desactivar los filtros
- La tabla debería mostrar todas las filas

---

### Problema 5: "Funciona pero lento"

**Síntomas:**
- Todo funciona
- Pero tarda 3-5 segundos en cargar

**Esto es NORMAL si:**
- Tienes muchos datos (>500 registros)
- Estás cargando desde SQL por primera vez

**Solución:**
- Después de la primera carga, debería ser instantáneo (usa LocalStorage)
- Si sigue lento, ejecuta:
  ```javascript
  const year = 2025;
  const key = `smart-student-test-grades-${year}`;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  console.log('Registros en LocalStorage:', data.length);
  ```
- Si dice "0 registros", los datos no se guardaron → reporta el problema

---

## 📊 Checklist Final

Marca cada item cuando lo completes:

### Verificación Básica
- [ ] Ejecuté el script de verificación (PASO 1)
- [ ] Vi el resultado del script (A, B, o C)
- [ ] Si era C, cargué el CSV (PASO 2)
- [ ] Los badges muestran números (no todos en 0)
- [ ] La tabla muestra filas con calificaciones

### Pruebas Funcionales
- [ ] Probé cambiar de semestre
- [ ] Probé filtrar por curso
- [ ] Probé filtrar por sección
- [ ] Probé cambiar de año
- [ ] Los filtros funcionan correctamente

### Verificación de Logs
- [ ] Abrí la consola y recargué (F5)
- [ ] Vi el log: "📊 [Calificaciones] Carga inicial..."
- [ ] Vi el log: "⚡ Carga instantánea: X calificaciones"
- [ ] No hay errores rojos en consola

---

## 🎉 ¡Todo Listo!

Si completaste todos los items del checklist, **el fix está funcionando correctamente**.

### Próximos Pasos

1. **Usa la aplicación normalmente** 📱
2. **Reporta cualquier comportamiento extraño** 🐛
3. **Disfruta de las calificaciones funcionando** ✅

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Ejecuta el script de verificación completo:**
   ```javascript
   (function(){const s=document.createElement('script');s.src='/verificar-fix-calificaciones.js';document.head.appendChild(s);})();
   ```

2. **Copia el resultado completo** (Ctrl+A en consola, Ctrl+C)

3. **Incluye:**
   - Resultado del script de verificación
   - Capturas de pantalla
   - Descripción de qué hiciste y qué pasó

4. **Reporta el problema** con toda la información

---

**¡Éxito! 🚀**

---

**Archivos Relacionados:**
- `RESUMEN_FIX_CALIFICACIONES.md` - Resumen ejecutivo
- `INDICE_FIX_CALIFICACIONES.md` - Índice completo de documentación
- `SOLUCION_INMEDIATA_CALIFICACIONES_CERO.md` - Soluciones temporales
- `FIX_CALIFICACIONES_CERO_COMPLETADO.md` - Detalles técnicos
