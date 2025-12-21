# 📚 INSTRUCCIONES: Carga Masiva de Calificaciones a SQL

## 🎯 Objetivo
Subir las calificaciones del archivo `calificaciones_ejemplo_carga_masiva_100.csv` a la base de datos SQL (Supabase) del sistema.

## 📋 Archivos Necesarios
1. ✅ `calificaciones_ejemplo_carga_masiva_100.csv` - Calificaciones a cargar
2. ✅ `users-consolidated-2025-CORREGIDO.csv` - Datos de usuarios (estudiantes y profesores)

## 🚀 Método 1: Carga Directa (RECOMENDADO)

### Paso 1: Abrir el Módulo Admin
1. Navegar a la aplicación Smart Student
2. Ir a **Administrador** → **Carga Masiva**
3. Abrir la **Consola del Navegador** (presiona F12 o Ctrl+Shift+I)
4. Ir a la pestaña **Console**

### Paso 2: Copiar el Script
1. Abrir el archivo `CARGAR-CALIFICACIONES-SQL-DESDE-CSV.js`
2. Copiar TODO el contenido del archivo
3. Pegar en la consola del navegador
4. Presionar Enter

### Paso 3: Ejecutar la Carga
En la consola, ejecutar:
```javascript
await cargarCalificacionesDesdeArchivo()
```

### Paso 4: Seleccionar el Archivo CSV
1. Se abrirá un diálogo para seleccionar archivo
2. Seleccionar `calificaciones_ejemplo_carga_masiva_100.csv`
3. Esperar a que el proceso complete

### Paso 5: Verificar Resultados
La consola mostrará:
- ✅ Total de calificaciones procesadas
- ✅ Calificaciones exitosas
- ⚠️ Errores (si los hay)
- 📊 Estadísticas finales

## 🔄 Método 2: Carga Manual (Alternativo)

Si el Método 1 no funciona, puedes usar este método:

### Paso 1: Preparar Datos
Abrir el archivo CSV en un editor de texto y copiar todo el contenido.

### Paso 2: Ejecutar Script Manual
En la consola del navegador, ejecutar:
```javascript
await cargarCalificacionesASQL()
```

### Paso 3: Pegar Contenido CSV
Cuando se solicite, pegar el contenido completo del CSV de calificaciones.

### Paso 4: Confirmar Carga
Confirmar cuando se pregunte si deseas continuar con la carga.

## 📊 Qué Esperar

### Durante la Carga
```
📚 [CARGA SQL] Iniciando sistema de carga masiva a SQL...
✅ [SUPABASE] Cliente conectado
📦 [LOTE 1/2] Cargando 50 calificaciones...
✅ [LOTE 1/2] Cargado exitosamente
📊 [PROGRESO] 50.0% completado (50/100)
📦 [LOTE 2/2] Cargando 50 calificaciones...
✅ [LOTE 2/2] Cargado exitosamente
📊 [PROGRESO] 100.0% completado (100/100)
```

### Después de la Carga
```
📊 RESUMEN FINAL
═══════════════════════════════════════
Total procesado    : 100
Exitosos          : 100
Fallidos          : 0
Tasa de éxito     : 100.0%
═══════════════════════════════════════
```

## ✅ Verificación

### 1. Verificar en SQL
```javascript
// En la consola, ejecutar:
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm');
const supabase = createClient(
    'https://nzqgbxqpxijgdfkzwxpr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cWdieHFweGlqZ2Rma3p3eHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNTA2NDgsImV4cCI6MjA1NTcyNjY0OH0.cNQlN_BrLDr96uwDpKGXSzh9EvGZYcjCh5pGwu53KTQ'
);

const { data, error, count } = await supabase
    .from('grades')
    .select('*', { count: 'exact' })
    .eq('year', 2025);

console.log(`Total de calificaciones en SQL: ${count}`);
console.table(data.slice(0, 5)); // Mostrar primeras 5
```

### 2. Verificar en la Interfaz
1. Ir a **Admin** → **Carga Masiva**
2. En la sección **Carga Masiva: Calificaciones**
3. Verificar que muestre:
   - `✅ Migración SQL Completada`
   - `2025: X registros` (donde X debe ser ≥ 100)

### 3. Verificar en Vista de Profesor
1. Iniciar sesión como profesor
2. Ir a **Evaluación**
3. Verificar que aparezcan las calificaciones

## ⚠️ Solución de Problemas

### Error: "Estudiante no encontrado"
**Causa**: El RUT del estudiante no coincide con los datos en el sistema.

**Solución**:
1. Verificar que los usuarios estén cargados en el sistema
2. Ejecutar en consola:
```javascript
const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
console.log(`Total usuarios: ${usuarios.length}`);
console.log(`Estudiantes: ${usuarios.filter(u => u.role === 'student').length}`);
console.log(`Profesores: ${usuarios.filter(u => u.role === 'teacher').length}`);
```

### Error: "Profesor no encontrado"
**Causa**: No hay profesor asignado para esa combinación de asignatura/curso/sección.

**Solución**:
1. Verificar las asignaciones de profesores
2. Cargar primero el archivo `users-consolidated-2025-CORREGIDO.csv` en **Admin** → **Configuración** → **Carga Masiva Excel**

### Error: "QuotaExceededError"
**Causa**: Se excedió el límite de localStorage (10MB).

**Solución**:
Este script carga directamente a SQL, por lo que este error no debería ocurrir. Si ocurre:
```javascript
// Limpiar datos obsoletos
localStorage.clear();
location.reload();
// Volver a cargar usuarios y luego calificaciones
```

### Error: "Network Error" o "Connection Failed"
**Causa**: Problema de conexión con Supabase.

**Solución**:
1. Verificar conexión a internet
2. Verificar que las credenciales de Supabase sean correctas
3. Intentar nuevamente en unos minutos

## 📝 Notas Importantes

### Formato del CSV de Calificaciones
El CSV debe tener estas columnas:
- `nombre`: Nombre completo del estudiante
- `rut`: RUT del estudiante (formato: 10000000-8)
- `curso`: Curso (ej: "1ro Básico")
- `seccion`: Sección (ej: "A")
- `asignatura`: Nombre completo de la asignatura (ej: "Matemáticas")
- `tipo`: Tipo de evaluación ("prueba", "tarea", "evaluacion")
- `fecha`: Fecha en formato YYYY-MM-DD (ej: "2025-03-15")
- `nota`: Calificación numérica (ej: 85)

### Mapeo de Asignaturas
El sistema mapea automáticamente:
- "Lenguaje y Comunicación" → `LEN`
- "Matemáticas" → `MAT`
- "Ciencias Naturales" → `CNT`
- "Historia y Geografía" → `HIS`
- "Biología" → `BIO`
- "Física" → `FIS`
- "Química" → `QUI`
- "Filosofía" → `FIL`
- "Educación Ciudadana" → `EDC`

### Tipo de Evaluaciones
- `prueba` → evaluation
- `tarea` → assignment
- `evaluacion` / `evaluación` → evaluation

## 🎓 Consejos

1. **Hacer backup**: Antes de cargar, exportar datos existentes
2. **Probar con pocos registros**: Primero probar con 5-10 registros
3. **Verificar usuarios**: Asegurarse de que usuarios estén cargados primero
4. **Monitorear consola**: Estar atento a mensajes de error
5. **No cerrar navegador**: Mientras se realiza la carga

## 📞 Soporte

Si encuentras problemas:
1. Copiar los mensajes de error de la consola
2. Verificar el estado del sistema con los comandos de verificación
3. Revisar los archivos CSV para confirmar el formato

---

**Última actualización**: 3 de noviembre de 2025  
**Versión del sistema**: Smart Student v17
