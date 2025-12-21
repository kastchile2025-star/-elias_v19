# ⚡ Solución Rápida - QuotaExceededError

## 🎯 Problema
Error al cargar calificaciones masivamente:
```
QuotaExceededError: Setting the value of 'smart-student-student-assignments' exceeded the quota
```

## ✅ Solución en 3 Pasos

### Paso 1: Cargar la Solución (30 segundos)

Abre la consola del navegador (F12) y pega este código:

```javascript
const script = document.createElement('script');
script.src = '/INICIAR-SOLUCION-QUOTA.js';
document.head.appendChild(script);
```

**Resultado esperado:**
```
✅ Sistema de Optimización de Almacenamiento cargado
✅ Sistema de Carga Masiva Optimizada cargado
🎉 Todos los componentes cargados correctamente!
```

### Paso 2: Verificar Estado (10 segundos)

```javascript
diagnosticoAlmacenamiento();
```

**Si el espacio usado es >7MB**, ejecuta limpieza:

```javascript
ejecutarLimpiezaAutomatica();
```

### Paso 3: Cargar Calificaciones

**Opción A: Interfaz Visual** (Recomendado)

```javascript
mostrarInterfazCargaMasiva();
```

Luego:
1. Selecciona tu archivo CSV
2. Haz clic en "Cargar Calificaciones"
3. ¡Listo! Verás el progreso en pantalla

**Opción B: Código Directo**

```javascript
const calificaciones = [
    { studentId: "student-1", taskId: "task-1", grade: 85, maxGrade: 100 },
    { studentId: "student-2", taskId: "task-1", grade: 90, maxGrade: 100 },
    // ... más calificaciones
];

await cargarCalificacionesEnLotes(calificaciones);
```

## 📋 Formato CSV

Tu archivo CSV debe tener estos campos:

```csv
studentId,taskId,grade,maxGrade,comment,gradedBy
student-1,task-1,85,100,Buen trabajo,teacher-1
student-2,task-1,90,100,Excelente,teacher-1
student-3,task-2,75,100,Puede mejorar,teacher-1
```

**Campos obligatorios:**
- `studentId`: ID del estudiante
- `taskId` o `evaluationId`: ID de la tarea/evaluación
- `grade`: Calificación

**Campos opcionales:**
- `maxGrade`: Calificación máxima (default: 100)
- `comment`: Comentario
- `gradedBy`: ID del profesor

## 🆘 Problemas Comunes

### ❌ "Scripts no se cargan"

**Solución:**
```javascript
// Cargar manualmente
const s1 = document.createElement('script');
s1.src = '/solucion-quota-exceeded-localStorage.js';
document.head.appendChild(s1);

setTimeout(() => {
    const s2 = document.createElement('script');
    s2.src = '/carga-masiva-calificaciones-optimizada.js';
    document.head.appendChild(s2);
}, 2000);
```

### ❌ "Sigue mostrando QuotaExceededError"

**Solución:**
```javascript
// 1. Limpiar datos obsoletos
limpiarDatosObsoletos();

// 2. Migrar datos grandes a Firestore
await migrarDatosGrandes();

// 3. Usar lotes más pequeños
await cargarCalificacionesEnLotes(calificaciones, {
    TAMANO_LOTE: 50  // Reducir tamaño
});
```

### ❌ "CSV no se procesa correctamente"

**Verificar formato:**
- Usar comas (,) como separador
- Primera fila debe tener encabezados
- No usar comillas a menos que el texto contenga comas
- Guardar en formato UTF-8

## 💡 Comandos Útiles

```javascript
// Ver ayuda
ayudaCargaMasiva();

// Ver espacio usado
(() => {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    console.log(`Espacio: ${(total / 1024 / 1024).toFixed(2)} MB`);
})();

// Ver estado del sistema
mostrarEstadoSistema();

// Limpiar todo localStorage (¡CUIDADO!)
// localStorage.clear(); // Solo en emergencia
```

## 📊 Monitoreo Durante la Carga

Durante la carga verás mensajes como:

```
📦 [LOTE 1/10] Procesando 100 calificaciones...
   • Nuevos: 98, Duplicados: 2
✅ [LOTE 1/10] Guardado exitosamente (compressed)
📊 [PROGRESO] 10.0% completado (98/980)
```

Esto es normal. Espera a que termine:

```
📊 [RESUMEN FINAL]
Total: 980
Exitosos: 980
Fallidos: 0
Tasa de éxito: 100.0%
```

## ⚡ Ejemplo Completo (Copy & Paste)

```javascript
// 1. CARGAR SOLUCIÓN
const script = document.createElement('script');
script.src = '/INICIAR-SOLUCION-QUOTA.js';
document.head.appendChild(script);

// 2. ESPERAR Y EJECUTAR (después de ver mensajes de éxito)
setTimeout(() => {
    // Ver estado
    diagnosticoAlmacenamiento();
    
    // Limpiar si es necesario
    // ejecutarLimpiezaAutomatica(); // Descomenta si >7MB usado
    
    // Abrir interfaz
    mostrarInterfazCargaMasiva();
}, 5000);
```

## 🎯 Ventajas de Esta Solución

✅ **Procesa miles de calificaciones** sin errores  
✅ **Compresión automática** para ahorrar espacio  
✅ **Migración a Firestore** si localStorage es insuficiente  
✅ **Progreso en tiempo real** con feedback visual  
✅ **Validación de datos** antes de procesar  
✅ **Recuperación de errores** automática  
✅ **Limpieza automática** de datos obsoletos  

## 📞 ¿Necesitas Más Ayuda?

Ver documentación completa: `SOLUCION_QUOTA_EXCEEDED_ERROR.md`

O ejecuta en consola:
```javascript
ayudaCargaMasiva(); // Ver ejemplos
```

---

**Tiempo estimado:** 2-5 minutos  
**Capacidad:** Miles de calificaciones  
**Requiere:** Navegador moderno (Chrome, Firefox, Edge)
