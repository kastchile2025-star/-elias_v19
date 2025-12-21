# � CARGA MASIVA DE CALIFICACIONES A FIREBASE - PASOS SIMPLES

## ✅ Preparación (HECHO)
- ✅ Estás en Admin → Carga Masiva
- ✅ Tienes el archivo: `calificaciones_ejemplo_carga_masiva_100.csv`
- ✅ Tienes el archivo: `users-consolidated-2025-CORREGIDO.csv`

---

## 📝 PASOS A SEGUIR

### PASO 1: Abrir Consola del Navegador
1. Presiona **F12** (o clic derecho → Inspeccionar)
2. Ve a la pestaña **Console**
3. Verás una consola negra con texto

### PASO 2: Copiar el Script
1. Abre el archivo: **`EJECUTAR-CARGA-FIREBASE-RAPIDO.js`** ⚠️
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)

### PASO 3: Pegar en la Consola
1. Haz clic en la consola del navegador
2. Pega el script (Ctrl+V)
3. Presiona **Enter**
4. Verás mensajes de colores confirmando que está listo

### PASO 4: Ejecutar la Carga
En la consola, escribe exactamente:
```javascript
await cargarCalificacionesFirebase()
```
Presiona **Enter**

### PASO 5: Seleccionar Archivo
1. Se abrirá un diálogo para seleccionar archivo
2. Busca y selecciona: `calificaciones_ejemplo_carga_masiva_100.csv`
3. Haz clic en **Abrir**

### PASO 6: Confirmar Carga
1. La consola mostrará cuántas calificaciones se cargarán
2. Aparecerá un mensaje: "¿Continuar con la carga de X calificaciones a Firebase?"
3. Haz clic en **Aceptar**

### PASO 7: Esperar
La consola mostrará el progreso:
```
Lote 1/1... 
✅ Lote 1 cargado exitosamente
```

### PASO 8: Verificar Resultado
Verás un resumen como este:
```
📊 RESUMEN FINAL
═══════════════════════════════════
CSV Leídos              : 100
Transformados           : 100
Cargados exitosamente   : 100
Fallidos                : 0
Total en Firebase 2025  : 100
═══════════════════════════════════
✅ ¡CARGA COMPLETADA!
```

### PASO 9: Actualizar la Interfaz
1. En la página de Admin → Carga Masiva
2. Haz clic en el botón **🔄 Actualizar**
3. Verás: `2025: 100 registros` (o el número que cargaste)

---

## ✅ VERIFICACIÓN

### Opción 1: Desde la Interfaz
1. En la sección "Calificaciones en SQL" (que realmente es Firebase)
2. Debe aparecer: `2025: X registros`
3. El estado debe cambiar a: `✅ Migración SQL Completada`

### Opción 2: Desde la Consola
En la consola del navegador, ejecuta:
```javascript
await verificarCalificacionesFirebase()
```

Esto mostrará:
- Total de calificaciones en Firebase
- Muestra de los primeros registros
- Distribución por curso

---

## ⚠️ SI ALGO SALE MAL

### Error: "Estudiante no encontrado"
**Solución**: Primero debes cargar los usuarios
1. Ve a Admin → Configuración
2. En "Carga Masiva Excel"
3. Sube el archivo: `users-consolidated-2025-CORREGIDO.csv`
4. Espera a que complete
5. Luego intenta cargar las calificaciones nuevamente

### Error: "No se seleccionó archivo"
**Solución**: 
- Asegúrate de hacer clic en "Abrir" en el diálogo de archivo
- No canceles la selección

### Error: "Network Error"
**Solución**:
- Verifica tu conexión a internet
- Espera 1 minuto y vuelve a intentar

### Las calificaciones no aparecen en la interfaz
**Solución**:
1. Haz clic en el botón "Actualizar" 🔄
2. Recarga la página (F5)
3. Si sigue sin aparecer, ejecuta en consola:
```javascript
await verificarCalificacionesFirebase()
```

---

## 🎓 NOTAS IMPORTANTES

1. **Primera vez**: Asegúrate de haber cargado primero el archivo de usuarios
2. **Tiempo estimado**: 1-2 minutos para 100 calificaciones (Firebase es rápido!)
3. **No cierres el navegador**: Mientras se realiza la carga
4. **Internet requerido**: Necesitas conexión estable

---

## 📞 COMANDOS ÚTILES

### Ver calificaciones en Firebase
```javascript
await verificarCalificacionesFirebase()
```

### Limpiar y volver a cargar (si hay error)
```javascript
await limpiarCalificacionesFirebase()
// Luego volver a ejecutar:
await cargarCalificacionesFirebase()
```

---

**¿Todo listo?** Empieza desde el **PASO 1** ⬆️
