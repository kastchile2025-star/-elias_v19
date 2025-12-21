# 🧪 PRUEBA: Carga Masiva de Calificaciones

## ✅ Cambios Implementados

### 1. **Indicador de Progreso en Tiempo Real**
- ✅ Evento `sqlImportProgress` emitido desde el modal de admin
- ✅ Listener en página Calificaciones actualiza barra de progreso
- ✅ Muestra texto "Sincronizando con BBDD" con porcentaje real

### 2. **Recarga Automática Mejorada**
- ✅ `onSQLGradesUpdated` ahora SIEMPRE intenta SQL/Firebase primero (sin depender del flag `isSQLConnected`)
- ✅ `onDataImported` mejorado con misma lógica agresiva
- ✅ `onDataUpdated` mejorado con misma lógica agresiva
- ✅ Fallback automático a LocalStorage si SQL/Firebase no está disponible

---

## 🚀 Pasos para Probar

### Preparación

1. **Servidor de desarrollo debe estar corriendo**
   ```bash
   npm run dev
   ```
   ✅ Ya iniciado en puerto 9002

2. **Archivo CSV de prueba disponible**
   - Ruta: `public/test-data/calificaciones_reales_200.csv`
   - Contiene: 200 registros de calificaciones
   - Formato: ASCII-safe, sin caracteres especiales

---

### Prueba Paso a Paso

#### 1️⃣ **Abrir Pestaña Calificaciones**
   - Navega a: http://localhost:9002/dashboard/calificaciones
   - Abre la **Consola del Navegador** (F12)

#### 2️⃣ **Ejecutar Script de Diagnóstico**
   - En la consola, carga el script:
     ```javascript
     // Cargar script de prueba
     const script = document.createElement('script');
     script.src = '/test-bulk-import-flow.js';
     document.head.appendChild(script);
     ```
   - Verás logs indicando que los listeners están configurados

#### 3️⃣ **Estado Inicial**
   - Observa la tabla de calificaciones actual
   - Anota cuántas filas hay (probablemente 0 o vacío)
   - El script mostrará el estado inicial en consola

#### 4️⃣ **Ir a Admin > Configuración**
   - Clic en botón "👤 Administrador" en la esquina superior derecha
   - Navega a pestaña "Configuración"
   - Desplázate hasta sección "🗄️ Calificaciones en SQL/Firebase"

#### 5️⃣ **Cargar CSV de Prueba**
   - Clic en botón "📤 Cargar Calificaciones"
   - Selecciona archivo: `public/test-data/calificaciones_reales_200.csv`
   - **Observar:**
     - Modal de progreso debe aparecer
     - Barra de progreso debe avanzar (0% → 100%)
     - Logs en consola del navegador

#### 6️⃣ **Verificar Eventos en Consola**
   Durante la carga, deberías ver en la consola:
   ```
   🔔 EVENTO RECIBIDO: sqlImportProgress
      ⏳ Progreso: 25% (50/200)
   
   🔔 EVENTO RECIBIDO: sqlImportProgress
      ⏳ Progreso: 50% (100/200)
   
   🔔 EVENTO RECIBIDO: sqlImportProgress
      ⏳ Progreso: 75% (150/200)
   
   🔔 EVENTO RECIBIDO: sqlImportProgress
      ⏳ Progreso: 100% (200/200)
   
   🔔 EVENTO RECIBIDO: sqlGradesUpdated
      📊 Calificaciones procesadas: 200
   
   🔔 EVENTO RECIBIDO: dataImported
      📊 Calificaciones procesadas: 200
   ```

#### 7️⃣ **Volver a Pestaña Calificaciones**
   - Clic en "Calificaciones" en el menú
   - **Verificar:**
     - ✅ Indicador "Sincronizando con BBDD - XX%" debe aparecer en esquina inferior derecha
     - ✅ Barra de progreso debe moverse de 0% a 100%
     - ✅ Indicador debe desaparecer cuando termine
     - ✅ Tabla debe mostrar las 200 calificaciones cargadas

#### 8️⃣ **Verificar Datos en Tabla**
   - Debe haber ~200 filas
   - Estudiantes: Carla Benítez, Carla Campos, Miguel Álvarez, etc.
   - Asignatura: "Historia, Geografía y Ciencias Sociales"
   - Cursos: 6to Básico B, 7mo Básico, 8vo Básico
   - Tipos: evaluacion, tarea, prueba

---

## 🔍 Puntos Críticos a Verificar

### ✅ Visual
- [ ] Indicador flotante aparece en esquina inferior derecha
- [ ] Texto dice "Sincronizando con BBDD"
- [ ] Barra de progreso se llena gradualmente
- [ ] Porcentaje numérico se actualiza (0% → 100%)
- [ ] Indicador desaparece al completar
- [ ] Tabla muestra datos inmediatamente después

### ✅ Eventos (en Consola)
- [ ] `sqlImportProgress` se dispara múltiples veces
- [ ] `sqlGradesUpdated` se dispara al finalizar
- [ ] `dataImported` se dispara al finalizar
- [ ] Cada evento tiene `detail` con datos correctos

### ✅ Datos
- [ ] 200 calificaciones insertadas en Firebase/SQL
- [ ] Datos aparecen en tabla Calificaciones
- [ ] Filtros funcionan correctamente
- [ ] No hay errores en consola

---

## 🐛 Solución de Problemas

### Problema: No aparece el indicador de progreso
**Causa:** Evento `sqlImportProgress` no se está emitiendo
**Solución:**
1. Verifica en consola del modal de admin (pestaña Configuración)
2. Debe haber logs: `🔔 Emitiendo evento sqlImportProgress`
3. Si no aparece, revisa que `progressUnsubRef.current` esté suscrito

### Problema: Datos no aparecen en tabla
**Causa:** Eventos no llegan a la página Calificaciones
**Solución:**
1. Ejecuta en consola: `window.__cleanupTestListeners()`
2. Recarga la página Calificaciones
3. Ejecuta script de prueba nuevamente
4. Verifica que listeners estén registrados

### Problema: Error "Failed to parse CSV"
**Causa:** Formato del CSV incorrecto
**Solución:**
1. Usa el archivo: `public/test-data/calificaciones_reales_200.csv`
2. Verifica que sea UTF-8 sin BOM
3. Headers esperados: `nombre,rut,curso,seccion,asignatura,tipo,fecha,nota`

### Problema: Modal de progreso se cierra muy rápido
**Causa:** Carga muy rápida en Firebase
**Solución:**
- Esto es normal si Firebase procesa rápido
- El indicador en Calificaciones debería aparecer brevemente
- Los datos deberían aparecer igual

---

## 📊 Resultados Esperados

### Después de la Carga Exitosa:

```
✅ 200 calificaciones procesadas
✅ 12 actividades generadas (burbujas N1-N10)
✅ 0 errores
✅ Tabla muestra todas las filas
✅ Filtros funcionan (por curso, sección, asignatura)
✅ Indicador de progreso visible durante import
✅ Recarga automática sin necesidad de F5
```

---

## 🧹 Limpieza Después de la Prueba

```javascript
// En consola del navegador (pestaña Calificaciones)
window.__cleanupTestListeners();

// Para limpiar datos de prueba (OPCIONAL)
// Ir a Admin > Configuración > Borrar calificaciones del año 2025
```

---

## 📝 Notas Técnicas

### Flujo de Eventos

```
1. Usuario sube CSV en Admin > Configuración
   ↓
2. POST /api/firebase/bulk-upload-grades
   ↓
3. Firestore subscription (onSnapshot) recibe progreso
   ↓
4. Emit: sqlImportProgress (cada cambio de %)
   ↓
5. Página Calificaciones escucha y actualiza barra
   ↓
6. Al completar: emit sqlGradesUpdated + dataImported
   ↓
7. Handlers onSQLGradesUpdated / onDataImported
   ↓
8. Fetch SQL/Firebase → actualiza state grades
   ↓
9. React re-renderiza tabla con nuevos datos
```

### Archivos Modificados

- `src/components/admin/user-management/configuration.tsx`
  - Añadido: `progressLastSentRef` + emit `sqlImportProgress`
  
- `src/app/dashboard/calificaciones/page.tsx`
  - Añadido: listener `onSqlImportProgress`
  - Mejorado: `onSQLGradesUpdated` (siempre intenta SQL primero)
  - Mejorado: `onDataImported` (siempre intenta SQL primero)
  - Mejorado: `onDataUpdated` (siempre intenta SQL primero)

---

## ✅ Checklist Final

- [ ] Servidor dev corriendo (puerto 9002)
- [ ] Script de prueba cargado en consola
- [ ] CSV de prueba disponible
- [ ] Admin > Configuración accesible
- [ ] Carga completada sin errores
- [ ] Indicador de progreso visible
- [ ] 200 calificaciones aparecen en tabla
- [ ] Eventos visibles en consola
- [ ] No hay errores en consola del navegador

---

**Última actualización:** 2025-10-17  
**Estado:** ✅ Listo para probar
