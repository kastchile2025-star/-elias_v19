# 📋 INSTRUCCIONES DE PRUEBA: Persistencia de Calificaciones

## 🎯 Objetivo
Verificar que las calificaciones cargadas masivamente desde CSV **persisten después de que Firebase termina de sincronizar**.

## 📁 Archivos de Prueba

### 1. CSV Corregido (Usar este)
```
public/test-data/grades-consolidated-2025-FIXED.csv
```
- ✅ Formato de fechas correcto (YYYY-MM-DD)
- ✅ 247 calificaciones de prueba
- ✅ Datos de estudiantes y cursos válidos

### 2. Script de Verificación
```
verificar-persistencia-calificaciones.js
```

## 🚀 Pasos de Prueba

### Paso 1: Preparar el Sistema

1. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

2. **Abrir la aplicación en el navegador:**
```
http://localhost:3000
```

3. **Iniciar sesión como administrador:**
   - Usuario: admin@example.com
   - Contraseña: admin123 (o la que tengas configurada)

### Paso 2: Cargar Usuarios (Si no están cargados)

1. Ir a **Configuración → Gestión de Usuarios**
2. Click en **"Subir archivo"** (sección Usuarios)
3. Seleccionar: `public/test-data/users-consolidated-2025-CORREGIDO.csv`
4. Esperar mensaje: ✅ "Usuarios cargados correctamente"

### Paso 3: Abrir Consola del Navegador

1. Presionar **F12** (o Ctrl+Shift+I en Linux)
2. Ir a la pestaña **Console**
3. Limpiar la consola: Click en el icono 🚫 o ejecutar `console.clear()`

### Paso 4: Instalar Script de Verificación

1. Copiar TODO el contenido de `verificar-persistencia-calificaciones.js`
2. Pegar en la consola del navegador
3. Presionar **Enter**
4. Deberías ver:
```
═══════════════════════════════════════════════════════
🔍 VERIFICACIÓN: Persistencia de Calificaciones
═══════════════════════════════════════════════════════

💡 COMANDOS DISPONIBLES:
   __verifyGrades__.localStorage()  - Ver datos en LocalStorage
   __verifyGrades__.ui()            - Ver datos en UI
   ...

🚀 Iniciando verificación automática en 2 segundos...
```

### Paso 5: Cargar Calificaciones

1. Ir a **Configuración → Gestión de Usuarios**
2. Scroll hasta **"Carga Masiva de Calificaciones"**
3. Click en **"Subir archivo CSV de Calificaciones"**
4. Seleccionar: `public/test-data/grades-consolidated-2025-FIXED.csv`
5. **NO CERRAR LA CONSOLA** - observa los logs

### Paso 6: Observar la Consola

**Deberías ver esta secuencia:**

```javascript
// 1. Upload iniciado
📤 Procesando archivo de calificaciones...

// 2. Datos guardados en LocalStorage
✅ 247 calificaciones guardadas en LocalStorage

// 3. Upload a Firebase iniciado
🔄 Subiendo a Firebase...

// 4. Evento emitido CON FLAG
🔔 Evento #1: dataImported
   Detail: {
     type: 'grades',
     year: 2025,
     count: 247,
     skipFirebaseReload: true  // 🔑 ESTO ES CLAVE
   }
   🔑 skipFirebaseReload: true
   ✅ Evento configurado para usar caché LocalStorage

// 5. Monitor detecta datos
📊 Monitor (Vigilando cambios en tabla):
   Conteo inicial: 247 filas
```

### Paso 7: Navegar a Calificaciones

1. Click en la pestaña **"Calificaciones"** (menú izquierdo)
2. Seleccionar año **2025** en el filtro
3. **Observar la consola - deberías ver:**

```javascript
📊 SQL grades updated - refreshing calificaciones...
⏭️ skipFirebaseReload=true: Cargando directamente desde LocalStorage
📥 LocalStorage (caché): 247 calificaciones para 2025
```

### Paso 8: Esperar Sincronización Firebase

**CRÍTICO:** Espera 10-15 segundos mientras Firebase sincroniza en background

**La consola debería mostrar:**
```javascript
👀 Monitor (Vigilando cambios en tabla):
   Conteo inicial: 247 filas

// Después de 5 segundos...
// Después de 10 segundos...
// Después de 15 segundos...

// NO DEBERÍA VER ESTO:
❌❌❌ DATOS DESAPARECIERON ❌❌❌  // Si ves esto, hay un problema
```

### Paso 9: Verificación Final

Ejecutar en la consola:
```javascript
__verifyGrades__.full()
```

**Resultado esperado:**
```
═══════════════════════════════════════════════════════
📊 RESULTADOS:
═══════════════════════════════════════════════════════
   LocalStorage: ✅ OK
   UI Visible:   ✅ OK
   Monitor:      ✅ Activo
═══════════════════════════════════════════════════════

✅✅✅ SISTEMA FUNCIONANDO CORRECTAMENTE ✅✅✅
```

## 🔍 Qué Verificar

### ✅ Comportamiento Correcto

1. **Inmediatamente después del upload:**
   - LocalStorage tiene 247 calificaciones
   - UI muestra 247 filas en la tabla
   - Consola muestra `skipFirebaseReload: true`

2. **Después de 10 segundos (Firebase sincronizado):**
   - UI SIGUE mostrando 247 filas (NO desaparecen)
   - Monitor NO reporta cambios negativos
   - LocalStorage sigue teniendo los datos

3. **Al refrescar la página:**
   - Datos siguen visibles
   - Firebase ya tiene los datos indexados
   - Sistema funciona normalmente

### ❌ Comportamiento Incorrecto (Problemas)

1. **Datos desaparecen después del upload:**
   - Monitor reporta: `❌❌❌ DATOS DESAPARECIERON`
   - UI muestra 0 filas después de tener 247
   - Indica que el flag `skipFirebaseReload` no está funcionando

2. **LocalStorage vacío:**
   - `__verifyGrades__.localStorage()` retorna 0 calificaciones
   - Indica problema en el parseo del CSV o guardado

3. **UI no muestra datos:**
   - Tabla vacía a pesar de LocalStorage lleno
   - Indica problema en el listener de eventos

## 🐛 Debugging

### Si los datos desaparecen:

1. **Verificar que el flag se emite correctamente:**
```javascript
window.addEventListener('dataImported', (e) => {
  console.log('Event detail:', e.detail);
  console.log('Has skipFirebaseReload?', 'skipFirebaseReload' in e.detail);
  console.log('Value:', e.detail.skipFirebaseReload);
});
```

2. **Verificar que el listener lo procesa:**
```javascript
// En calificaciones/page.tsx, buscar en consola:
"⏭️ skipFirebaseReload=true: Cargando directamente desde LocalStorage"

// Si NO aparece, el flag no se está procesando
```

3. **Verificar versión de archivos:**
```javascript
// En configuration.tsx, buscar cerca de línea 733:
console.log('Buscando: skipFirebaseReload: true');

// En calificaciones/page.tsx, buscar cerca de línea 475:
console.log('Buscando: const skipFirebaseReload = detail?.skipFirebaseReload');
```

### Si LocalStorage está vacío:

1. **Verificar parseo del CSV:**
```javascript
// Ejecutar antes de subir el archivo
window.addEventListener('dataImported', (e) => {
  console.log('Calificaciones procesadas:', e.detail.count);
  
  const ls = JSON.parse(localStorage.getItem('test_grades') || '[]');
  console.log('LocalStorage count:', ls.length);
});
```

2. **Verificar formato de fechas:**
```javascript
const grades = JSON.parse(localStorage.getItem('test_grades') || '[]');
grades.slice(0, 3).forEach(g => {
  console.log('Fecha:', g.gradedAt, 'Tipo:', typeof g.gradedAt);
  console.log('Válida?', !isNaN(new Date(g.gradedAt).getTime()));
});
```

## 📊 Comandos Útiles

### Inspeccionar LocalStorage
```javascript
// Ver todas las calificaciones
const grades = JSON.parse(localStorage.getItem('test_grades') || '[]');
console.log(`Total: ${grades.length}`);

// Filtrar por año
const year2025 = grades.filter(g => new Date(g.gradedAt).getFullYear() === 2025);
console.log(`Año 2025: ${year2025.length}`);

// Ver primera calificación
console.log(grades[0]);
```

### Verificar UI
```javascript
// Contar filas visibles
const rows = document.querySelectorAll('table tbody tr:not(.empty-row)');
console.log(`Filas en tabla: ${rows.length}`);

// Ver contenido de primera fila
const firstRow = rows[0];
if (firstRow) {
  console.log('Primera fila:', firstRow.textContent);
}
```

### Limpiar y reintentar
```javascript
// Limpiar LocalStorage
localStorage.removeItem('test_grades');
console.log('✅ LocalStorage limpiado');

// Recargar página
location.reload();
```

## 📝 Notas Importantes

1. **NO uses el archivo `grades-consolidated-2025.csv` original**
   - Tiene formato de fechas incorrecto (DD-MM-YYYY)
   - Usa siempre `grades-consolidated-2025-FIXED.csv`

2. **Firebase tarda ~5-15 segundos en indexar**
   - Es normal que Firebase no retorne datos inmediatamente
   - Por eso usamos LocalStorage como caché

3. **El flag `skipFirebaseReload` es temporal**
   - Solo se usa durante carga masiva
   - Consultas normales usan Firebase primero

4. **LocalStorage tiene límite de ~5-10MB**
   - Para 247 registros: ~100-200KB
   - Para 100k registros: considerar IndexedDB futuro

## ✅ Checklist de Prueba

- [ ] Servidor de desarrollo corriendo
- [ ] Sesión iniciada como admin
- [ ] Usuarios cargados (users-consolidated-2025-CORREGIDO.csv)
- [ ] Consola del navegador abierta
- [ ] Script de verificación instalado
- [ ] CSV de calificaciones cargado (grades-consolidated-2025-FIXED.csv)
- [ ] Monitor activo observando cambios
- [ ] Navegado a pestaña Calificaciones
- [ ] Año 2025 seleccionado en filtro
- [ ] Esperado 15 segundos
- [ ] Datos siguen visibles (NO desaparecieron)
- [ ] Test `__verifyGrades__.full()` ejecutado
- [ ] Resultado: ✅✅✅ SISTEMA FUNCIONANDO CORRECTAMENTE

## 🎉 Éxito

Si TODOS los checks están ✅, el sistema funciona correctamente:

1. ✅ Calificaciones se guardan en Firebase (persistencia)
2. ✅ Calificaciones se guardan en LocalStorage (caché)
3. ✅ UI lee de LocalStorage durante upload masivo
4. ✅ UI NO pierde datos cuando Firebase termina de sincronizar
5. ✅ Sistema soporta 100k+ registros por año

---

**Fecha:** 2025-01-09  
**Versión:** 1.0  
**Estado:** ✅ Listo para prueba
