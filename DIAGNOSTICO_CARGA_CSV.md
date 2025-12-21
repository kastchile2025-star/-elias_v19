# 🔍 Diagnóstico: Problema con Carga Masiva de Calificaciones

## 🚨 Problema Actual

**Síntoma**: Al intentar cargar un archivo CSV de 11,529 registros, se obtiene:
- ✅ Archivo parseado correctamente (11,529 filas)
- ❌ **"Files con error: 11520"** (casi todas las filas)
- ❌ **"0 calificaciones procesadas correctamente"**
- ❌ **"0 actividades generadas"**

## 🎯 Causa Probable

El CSV no está pasando las validaciones de campos obligatorios. Los problemas más comunes son:

### 1. **Encabezados del CSV no coinciden**
El código busca columnas con nombres como:
- `nombre`, `name`, `estudiante`, `student`, `alumno`
- `rut`, `id`, `cedula`, `identificacion`
- `curso`, `course`, `grade`, `nivel`, `grado`
- `seccion`, `sección`, `section`, `sala`
- `asignatura`, `subject`, `materia`, `subject_name`
- `nota`, `score`, `calificacion`, `grade`, `puntos`, `calificación`
- `fecha`, `date`, `timestamp`
- `tipo`, `type`, `categoria`, `category`

### 2. **Campos vacíos o mal formateados**
- Faltan nombres de estudiantes o RUTs
- Faltan cursos, asignaturas o notas
- Las notas no están en formato válido (0-100)

### 3. **Estudiantes no registrados en el sistema**
- Los estudiantes del CSV no existen en el año seleccionado

## 🧪 Cómo Diagnosticar

### Paso 1: Recargar la página
```
1. Refresca la página (F5)
2. Abre la consola del navegador (F12)
3. Ve a la pestaña "Console"
```

### Paso 2: Intentar la carga de nuevo
```
1. Ve a: Dashboard → Gestión de Usuarios → Configuración
2. Sube el archivo CSV de nuevo
3. Observa los logs en la consola
```

### Paso 3: Revisar los logs detallados

Ahora verás logs como estos:

```javascript
📁 Archivo cargado: Calificaciones_2025_FULL.csv (1073.1KB)
📄 Primeras 3 filas: [...]

📝 Fila 2: {
  nombre: "Juan Pérez",
  rut: "12345678-9",
  curso: "7° Básico",
  seccion: "A",
  asignatura: "Matemática",
  fecha: "2025-03-15",
  tipo: "Prueba",
  nota: "85"
}
📋 Headers del CSV: ["nombre", "rut", "curso", "seccion", "asignatura", "fecha", "tipo", "nota"]
📋 Valores completos de la fila: {...}

🔍 Procesando 11529 filas...
```

**SI VES ERRORES**, busca mensajes como:

```javascript
❌ Fila 2: Falta Curso=, Asignatura=Matemática, Nota=85
// Indica que el campo "Curso" está vacío

❌ Fila 3: Falta Nombre o RUT
// Indica que falta el nombre o RUT del estudiante

❌ Fila 4: Estudiante no encontrado (Juan Pérez)
// El estudiante no está registrado en el sistema
```

## ✅ Soluciones Comunes

### Solución 1: Verificar Encabezados del CSV

Abre el CSV en Excel/LibreOffice y verifica que tenga estas columnas:

**Opción A - Nombres en Español:**
```
nombre | rut | curso | seccion | asignatura | fecha | tipo | nota
```

**Opción B - Nombres en Inglés:**
```
name | id | course | section | subject | date | type | score
```

**Opción C - Mix (también funciona):**
```
estudiante | rut | curso | sección | materia | fecha | categoria | calificacion
```

### Solución 2: Verificar Formato de Datos

Asegúrate de que:

#### **Nombres/RUT**:
- No estén vacíos
- El RUT tenga formato válido: `12345678-9`

#### **Curso**:
- Coincida exactamente con los cursos registrados
- Ejemplo: `7° Básico`, `1° Medio`, etc.

#### **Asignatura**:
- Ejemplo: `Matemática`, `Lenguaje`, `Ciencias`, etc.
- Si no existe, se creará automáticamente

#### **Nota**:
- Formato: número entre 0 y 100
- Válidos: `85`, `85.5`, `85,5`, `70%`, `17/20`
- Inválidos: `Aprobado`, `MB` (usar número)

#### **Fecha**:
- Formato: `YYYY-MM-DD`, `DD/MM/YYYY`, `DD-MM-YYYY`
- Ejemplo: `2025-03-15`, `15/03/2025`, `15-03-2025`

### Solución 3: Verificar Estudiantes Registrados

Los estudiantes del CSV **deben estar registrados** en el sistema para el año seleccionado.

**Cómo verificar:**
1. Ve a: Dashboard → Gestión de Usuarios → Configuración
2. Scroll hasta "Todos los Usuarios del Sistema"
3. Filtra por "Alumnos" y el año correspondiente
4. Verifica que los estudiantes del CSV estén en la lista

**Si faltan estudiantes:**
1. Regístralos primero usando "Registrar Usuario" o "Carga Masiva de Usuarios"
2. Luego intenta la carga de calificaciones de nuevo

### Solución 4: Archivo CSV de Ejemplo

Crea un CSV de prueba con estos datos:

```csv
nombre,rut,curso,seccion,asignatura,fecha,tipo,nota
Juan Pérez,12345678-9,7° Básico,A,Matemática,2025-03-15,Prueba,85
María González,98765432-1,7° Básico,A,Matemática,2025-03-15,Prueba,92
Carlos López,11223344-5,7° Básico,B,Lenguaje,2025-03-16,Tarea,78
```

Guárdalo como `test.csv` y pruébalo. Si funciona, compara con tu archivo original.

## 📊 Validaciones que se Realizan

El sistema valida:

1. ✅ **Campos obligatorios**:
   - Nombre O RUT (al menos uno)
   - Curso
   - Asignatura  
   - Nota

2. ✅ **Formato de nota**:
   - Número entre 0 y 100
   - Soporta: `85`, `85.5`, `85,5`, `70%`, `17/20`

3. ✅ **Estudiante existe**:
   - Por RUT (preferido)
   - Por nombre (si RUT no está disponible)

4. ✅ **Curso existe**:
   - Debe estar registrado en el sistema

5. ✅ **Asignatura**:
   - Si no existe, se crea automáticamente

## 🐛 Logs Detallados (Nueva Funcionalidad)

Con las actualizaciones recientes, verás:

```javascript
// Headers del CSV
📋 Headers del CSV: ["nombre", "rut", "curso", ...]

// Valores de las primeras 3 filas
📋 Valores completos de la fila: { nombre: "...", rut: "...", ... }

// Errores específicos (primeras 5 filas)
❌ Fila 2: Falta Curso=, Asignatura=Matemática, Nota=85
❌ Fila 3: Estudiante no encontrado (Juan Pérez)
❌ Fila 4: Nota fuera de rango (0-100): 150

// Resumen final
⚠️ Filas con error: 11520
📋 Primeros 10 errores: [...]
✅ 0 calificaciones procesadas correctamente
🫧 0 actividades generadas
```

## 🔧 Acciones Inmediatas

1. **Recarga la página** (F5)
2. **Abre la consola** (F12 → Console)
3. **Sube el CSV de nuevo**
4. **Copia los logs** que aparecen
5. **Identifica el error específico**:
   - ¿Qué campo falta?
   - ¿Qué formato está mal?
   - ¿Qué estudiante no se encuentra?

## 💡 Recomendaciones

### Si el CSV tiene muchos errores:

1. **Exporta los usuarios actuales**:
   - Usa "Exportar Usuarios" para ver el formato correcto

2. **Crea un CSV pequeño de prueba**:
   - 5-10 registros para verificar el formato

3. **Prueba con registros conocidos**:
   - Usa estudiantes que sabes que existen en el sistema

4. **Verifica el encoding**:
   - Guarda el CSV como UTF-8
   - Evita caracteres especiales problemáticos

### Si solo algunas filas fallan:

1. Los logs mostrarán exactamente qué filas tienen problemas
2. Corrige esas filas específicas en el CSV
3. Vuelve a intentar la carga

## 📞 Próximos Pasos

Una vez que identifiques el problema en los logs:

1. **Corrige el CSV** según el error encontrado
2. **Prueba de nuevo** con el CSV corregido
3. **Verifica en la consola** que ahora sí se procesen las calificaciones:
   ```
   ✅ 11529 calificaciones procesadas correctamente
   🫧 X actividades generadas
   ```
4. **Confirma en Supabase** que los datos se guardaron

---

**Estado Actual**: ⏳ Esperando logs de diagnóstico
**Próxima Acción**: Revisar logs en consola y compartir resultados
