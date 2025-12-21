# 📚 Carga Masiva de Estudiantes y Profesores

Este directorio contiene archivos CSV listos para usar en la funcionalidad de **Carga Masiva Excel** del módulo de Administración.

## 📁 Archivos Disponibles

### 1. `estudiantes_45_por_seccion.csv`
- **Contenido**: 90 estudiantes (45 por sección A y 45 por sección B)
- **Curso**: 1ro Básico
- **Secciones**: A y B
- **Campo `subjects`**: Vacío (se habilitarán TODAS las asignaturas automáticamente)
- **Passwords**: Todos tienen `1234`

### 2. `profesores_por_asignatura.csv`
- **Contenido**: 10 profesores (uno por cada asignatura principal)
- **Asignaturas cubiertas**:
  - **MAT** (Matemáticas) - Roberto Díaz Pérez
  - **LEN** (Lenguaje y Comunicación) - Patricia González Vega
  - **CNT** (Ciencias Naturales) - Carlos Muñoz Silva
  - **HIST** (Historia, Geografía y Ciencias Sociales) - Andrea Soto Torres
  - **ING** (Inglés) - Miguel Vargas Rojas
  - **EFI** (Educación Física) - Lorena Campos Morales
  - **MUS** (Música) - Sergio Herrera Castro
  - **ART** (Artes Visuales) - Mónica Ramírez Núñez
  - **TEC** (Tecnología) - Francisco Reyes Jiménez
  - **REL** (Religión) - Claudia Flores Paredes
- **Asignaciones**: Cada profesor está asignado a ambas secciones (A y B) del 1ro Básico
- **Passwords**: Todos tienen `1234`

## 🚀 Instrucciones de Uso

### Paso 1: Preparar el Sistema

Antes de cargar los archivos CSV, asegúrate de:

1. **Crear el Curso** en Admin → Gestión de Usuarios → Cursos:
   - Nombre: `1ro Básico`
   - Año: El año actual seleccionado

2. **Crear las Secciones** en Admin → Gestión de Usuarios → Secciones:
   - Sección A (asociada a 1ro Básico)
   - Sección B (asociada a 1ro Básico)

3. **Verificar que las asignaturas estén configuradas** en el sistema

### Paso 2: Cargar Profesores (PRIMERO)

1. Ve a **Admin → Configuración**
2. Busca la sección **"Carga Masiva Excel"**
3. Haz clic en **"Upload Excel"**
4. Selecciona el archivo: `profesores_por_asignatura.csv`
5. Espera a que se complete la carga
6. Verifica en el resumen que se crearon:
   - ✅ 10 profesores
   - ✅ 20 asignaciones (10 profesores × 2 secciones)

### Paso 3: Cargar Estudiantes (DESPUÉS)

1. Ve a **Admin → Configuración**
2. Busca la sección **"Carga Masiva Excel"**
3. Haz clic en **"Upload Excel"**
4. Selecciona el archivo: `estudiantes_45_por_seccion.csv`
5. Espera a que se complete la carga
6. Verifica en el resumen que se crearon:
   - ✅ 90 estudiantes
   - ✅ 45 en sección A
   - ✅ 45 en sección B
   - ✅ Todos habilitados para todas las asignaturas

## 📊 Estructura de los Archivos CSV

### Columnas Obligatorias

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `role` | Rol del usuario | `student`, `teacher`, `admin` |
| `name` | Nombre completo | `Ana López García` |
| `rut` | RUT chileno | `10.000.001-6` |
| `email` | Correo electrónico | `ana.lopez@colegio.cl` |
| `username` | Usuario (vacío = auto-generado) | `a.lopez` o vacío |
| `password` | Contraseña | `1234` |
| `course` | Curso asignado | `1ro Básico` |
| `section` | Sección | `A`, `B` |
| `subjects` | Asignaturas (separadas por coma) | `MAT, LEN` o vacío |

### Reglas Importantes

1. **Estudiantes**:
   - Si `subjects` está **vacío** → Se habilitan **TODAS** las asignaturas del curso
   - Si `subjects` tiene valores → Solo se habilitan esas asignaturas específicas
   - Ejemplos: `MAT,LEN,CNT` o dejar vacío

2. **Profesores**:
   - El campo `subjects` debe contener las **abreviaturas** de las asignaturas
   - Un mismo profesor puede aparecer en **múltiples filas** con diferentes cursos/secciones
   - Las asignaciones se crearán automáticamente

3. **Username Auto-generado**:
   - Si `username` está vacío, se genera automáticamente:
     - Desde email: `ana.lopez@colegio.cl` → `ana.lopez`
     - Desde nombre + RUT: `Ana López` + `10000001` → `ana0001`

## 🎯 Códigos de Asignaturas

| Código | Asignatura Completa |
|--------|---------------------|
| MAT | Matemáticas |
| LEN | Lenguaje y Comunicación |
| CNT | Ciencias Naturales |
| HIST | Historia, Geografía y Ciencias Sociales |
| ING | Inglés |
| EFI | Educación Física |
| MUS | Música |
| ART | Artes Visuales |
| TEC | Tecnología |
| REL | Religión |
| BIO | Biología |
| FIS | Física |
| QUI | Química |
| FIL | Filosofía |

## ✅ Verificación Post-Carga

Después de cargar ambos archivos, verifica:

1. **Usuarios Creados**:
   - Ve a Admin → Gestión de Usuarios
   - Deberías ver 90 estudiantes + 10 profesores = 100 usuarios

2. **Asignaciones de Profesores**:
   - Ve a Admin → Gestión de Usuarios → Asignaciones
   - Deberías ver 20 asignaciones (10 profesores × 2 secciones)

3. **Prueba de Login**:
   - Intenta iniciar sesión con un estudiante: `ana.lopez` / `1234`
   - Intenta iniciar sesión con un profesor: `r.diaz` / `1234`

## 🔧 Personalización

### Para Crear tu Propio Archivo

1. **Duplica** uno de los archivos existentes
2. **Modifica** los datos según tus necesidades:
   - Cambia nombres, RUTs, emails
   - Ajusta el curso y sección
   - Modifica las asignaturas asignadas
3. **Guarda** como archivo CSV
4. **Carga** en el sistema siguiendo las instrucciones

### Consejos

- Usa un **editor de hojas de cálculo** (Excel, Google Sheets, LibreOffice Calc)
- Exporta como **CSV** con separador de coma (`,`)
- Asegúrate de que los RUTs sean **válidos** (dígito verificador correcto)
- Usa **emails únicos** para cada usuario
- Los **usernames** pueden dejarse vacíos para que se generen automáticamente

## ⚠️ Solución de Problemas

### Error: "Curso no encontrado"
- **Solución**: Crea primero el curso en Admin → Gestión de Usuarios → Cursos

### Error: "Sección no encontrada"
- **Solución**: Crea primero las secciones en Admin → Gestión de Usuarios → Secciones

### Error: "Username duplicado"
- **Solución**: Asegúrate de que cada usuario tenga un username único o déjalo vacío para auto-generación

### Error: "RUT inválido"
- **Solución**: Verifica que el dígito verificador del RUT sea correcto

## 📝 Notas Adicionales

- **Orden de carga**: Siempre carga **primero los profesores** y **después los estudiantes**
- **Duplicados**: El sistema permite múltiples filas del mismo profesor para diferentes asignaciones
- **Actualización**: Al volver a cargar profesores, se limpiarán sus asignaciones previas y se reconstruirán
- **Passwords**: Todos los usuarios de estos archivos tienen password `1234` por defecto

---

**Última actualización**: 18 de Octubre de 2025
