# 📊 Archivo de Calificaciones Completas 2025

## 📁 Archivo
**`grades-consolidated-2025-COMPLETO.csv`**

## 📝 Descripción
Archivo CSV completo con calificaciones para todo el año 2025, diseñado para ser la base de datos principal del sistema de calificaciones mediante carga masiva en Firebase.

## 📊 Contenido

### Estudiantes
- **Total:** 1,080 estudiantes únicos
- **Distribución:** 45 estudiantes por sección
- **Secciones:** A y B para cada curso
- **Cursos:** 1ro Básico a 4to Medio (12 cursos totales)

### Estructura de Datos

#### Educación Básica (1ro - 8vo Básico)
- **Estudiantes:** 720 (8 cursos × 2 secciones × 45 estudiantes)
- **Asignaturas por estudiante:** 4
  - Matemáticas
  - Lenguaje y Comunicación
  - Ciencias Naturales
  - Historia, Geografía y Ciencias Sociales
- **Registros totales:** 28,800

#### Educación Media (1ro - 4to Medio)
- **Estudiantes:** 360 (4 cursos × 2 secciones × 45 estudiantes)
- **Asignaturas por estudiante:** 8
  - Matemáticas
  - Lenguaje y Comunicación
  - Biología
  - Física
  - Química
  - Historia, Geografía y Ciencias Sociales
  - Filosofía
  - Educación Ciudadana
- **Registros totales:** 28,800

### Total de Registros
**57,600 calificaciones** (57,601 líneas incluyendo encabezado)

## 📅 Distribución Temporal

### Año Completo 2025
- **Semestre 1 (Marzo - Junio):** 28,800 registros (50%)
- **Semestre 2 (Julio - Diciembre):** 28,800 registros (50%)

### Actividades por Asignatura
Cada estudiante tiene **10 actividades evaluativas** por asignatura:
- **5 actividades en el primer semestre** (Marzo - Junio)
- **5 actividades en el segundo semestre** (Julio - Diciembre)

## 📝 Tipos de Evaluación

Distribución equitativa entre:
- **Tareas:** ~33%
- **Pruebas:** ~33%
- **Evaluaciones:** ~33%

## ✅ Características Clave

1. **Sin Duplicados:** Cada registro es único
   - No existen dos calificaciones con la misma combinación de:
     - RUT + Curso + Sección + Asignatura + Fecha + Tipo

2. **Estructura Consistente:**
   - Exactamente 10 actividades por asignatura para cada estudiante
   - 5 actividades en cada semestre

3. **Datos Realistas:**
   - Notas entre 60 y 100 puntos
   - Fechas aleatorias distribuidas en todo 2025
   - Profesores asignados por asignatura

4. **Formato Compatible:**
   - Compatible con el sistema de carga masiva
   - Formato CSV estándar con codificación UTF-8

## 🎯 Uso

### Carga Masiva en el Sistema

1. **Acceder al módulo de administración:**
   - Ir a: **Mod Admin** → **Configuración**

2. **Ubicar la sección de carga masiva:**
   - Buscar: **"Carga Masiva: Calificaciones"**

3. **Subir el archivo:**
   - Seleccionar: `grades-consolidated-2025-COMPLETO.csv`
   - El sistema procesará automáticamente 57,600 calificaciones

4. **Proceso automático:**
   - Creación de cursos en Firebase
   - Importación de calificaciones
   - Generación de actividades evaluativas
   - Actualización de contadores

5. **Verificación:**
   - Los datos estarán disponibles inmediatamente en:
     - Pestaña **Calificaciones**
     - Vista de profesores
     - Reportes y estadísticas

## 📋 Formato del Archivo

### Encabezado
```csv
Nombre,RUT,Curso,Sección,Asignatura,Profesor,Fecha,Tipo,Nota
```

### Ejemplo de Registros
```csv
Mateo González González,10000001-6,1ro Básico,A,Matemáticas,Pedro Rodríguez Silva,2025-03-15,tarea,77
Mateo González González,10000001-6,1ro Básico,A,Matemáticas,Roberto Díaz Fuentes,2025-03-29,tarea,66
Mateo González González,10000001-6,1ro Básico,A,Lenguaje y Comunicación,Juan García Torres,2025-03-14,tarea,84
```

### Campos

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre** | Nombre completo del estudiante | Mateo González González |
| **RUT** | RUT del estudiante | 10000001-6 |
| **Curso** | Nivel educativo | 1ro Básico |
| **Sección** | Sección del curso | A |
| **Asignatura** | Nombre de la asignatura | Matemáticas |
| **Profesor** | Nombre del profesor | Pedro Rodríguez Silva |
| **Fecha** | Fecha de la evaluación (YYYY-MM-DD) | 2025-03-15 |
| **Tipo** | Tipo de evaluación | tarea, prueba, evaluacion |
| **Nota** | Calificación (60-100) | 77 |

## 🔧 Regeneración

Si necesitas regenerar el archivo:

```bash
python3 generar_calificaciones_completas_2025.py
```

### Características del Script
- Genera datos únicos sin duplicados
- Seed fija (42) para reproducibilidad
- Validación automática de estructura
- Reporte de progreso durante generación

## 📊 Estadísticas Detalladas

### Por Curso

| Curso | Secciones | Estudiantes | Asignaturas | Actividades/Est | Registros |
|-------|-----------|-------------|-------------|-----------------|-----------|
| 1ro Básico | 2 | 90 | 4 | 40 | 3,600 |
| 2do Básico | 2 | 90 | 4 | 40 | 3,600 |
| 3ro Básico | 2 | 90 | 4 | 40 | 3,600 |
| 4to Básico | 2 | 90 | 4 | 40 | 3,600 |
| 5to Básico | 2 | 90 | 4 | 40 | 3,600 |
| 6to Básico | 2 | 90 | 4 | 40 | 3,600 |
| 7mo Básico | 2 | 90 | 4 | 40 | 3,600 |
| 8vo Básico | 2 | 90 | 4 | 40 | 3,600 |
| 1ro Medio | 2 | 45 | 8 | 80 | 7,200 |
| 2do Medio | 2 | 45 | 8 | 80 | 7,200 |
| 3ro Medio | 2 | 45 | 8 | 80 | 7,200 |
| 4to Medio | 2 | 45 | 8 | 80 | 7,200 |
| **TOTAL** | **24** | **1,080** | - | - | **57,600** |

### Por Asignatura

| Asignatura | Estudiantes | Registros |
|------------|-------------|-----------|
| Matemáticas | 1,080 | 10,800 |
| Lenguaje y Comunicación | 1,080 | 10,800 |
| Historia, Geografía y Ciencias Sociales | 1,080 | 10,800 |
| Ciencias Naturales | 720 | 7,200 |
| Biología | 360 | 3,600 |
| Física | 360 | 3,600 |
| Química | 360 | 3,600 |
| Filosofía | 360 | 3,600 |
| Educación Ciudadana | 360 | 3,600 |

## ⚠️ Importante

1. **No modificar manualmente:** El archivo está optimizado para carga masiva
2. **Respaldo:** Hacer backup antes de cualquier cambio
3. **Validación:** El sistema validará automáticamente al cargar
4. **Tiempo de carga:** La carga completa puede tomar varios minutos
5. **Conexión:** Mantener conexión estable durante la carga

## 🔍 Verificación Post-Carga

Después de la carga, verificar:

1. **Total de calificaciones:** Debe mostrar 57,600 registros
2. **Estudiantes:** 1,080 estudiantes únicos
3. **Distribución por curso:** Verificar en reportes
4. **Fechas:** Marzo a Diciembre 2025
5. **Sin errores:** Panel de calificaciones debe mostrar datos correctamente

---

**Generado:** Octubre 2025  
**Versión:** 1.0  
**Compatibilidad:** Sistema SmartStudent v17
