# 📚 Ejemplo Completo: Sistema Educativo con Múltiples Cursos

## 🎯 Objetivo

Este documento describe cómo crear un sistema educativo completo con:
- **3 Cursos** (1ro Básico, 2do Básico, 3ro Básico)
- **2 Secciones por curso** (A y B)
- **45 Estudiantes por sección** = 270 estudiantes totales
- **10 Profesores** (uno por asignatura, asignados a todos los cursos)

## 📋 Estructura Propuesta

### Cursos y Secciones

| Curso | Sección A | Sección B |
|-------|-----------|-----------|
| 1ro Básico | 45 estudiantes | 45 estudiantes |
| 2do Básico | 45 estudiantes | 45 estudiantes |
| 3ro Básico | 45 estudiantes | 45 estudiantes |
| **Total** | **135 estudiantes** | **135 estudiantes** |

### Profesores y Asignaturas

Cada profesor enseña su asignatura en **todos los cursos y secciones**:

| Profesor | Asignatura | Secciones Asignadas |
|----------|------------|---------------------|
| Roberto Díaz Pérez | Matemáticas (MAT) | 1A, 1B, 2A, 2B, 3A, 3B |
| Patricia González Vega | Lenguaje (LEN) | 1A, 1B, 2A, 2B, 3A, 3B |
| Carlos Muñoz Silva | Ciencias (CNT) | 1A, 1B, 2A, 2B, 3A, 3B |
| Andrea Soto Torres | Historia (HIST) | 1A, 1B, 2A, 2B, 3A, 3B |
| Miguel Vargas Rojas | Inglés (ING) | 1A, 1B, 2A, 2B, 3A, 3B |
| Lorena Campos Morales | Ed. Física (EFI) | 1A, 1B, 2A, 2B, 3A, 3B |
| Sergio Herrera Castro | Música (MUS) | 1A, 1B, 2A, 2B, 3A, 3B |
| Mónica Ramírez Núñez | Arte (ART) | 1A, 1B, 2A, 2B, 3A, 3B |
| Francisco Reyes Jiménez | Tecnología (TEC) | 1A, 1B, 2A, 2B, 3A, 3B |
| Claudia Flores Paredes | Religión (REL) | 1A, 1B, 2A, 2B, 3A, 3B |

**Total de asignaciones**: 10 profesores × 6 secciones = **60 asignaciones**

## 🚀 Pasos para Implementar

### 1. Crear la Estructura Base en el Sistema

#### A. Crear Cursos (Admin → Gestión de Usuarios → Cursos)

```
Curso 1: 1ro Básico
Curso 2: 2do Básico
Curso 3: 3ro Básico
```

#### B. Crear Secciones (Admin → Gestión de Usuarios → Secciones)

```
1ro Básico - Sección A
1ro Básico - Sección B
2do Básico - Sección A
2do Básico - Sección B
3ro Básico - Sección A
3ro Básico - Sección B
```

### 2. Preparar Archivos CSV

#### Archivo: `profesores_completo.csv`

Este archivo contiene las asignaciones de los 10 profesores a las 6 secciones:

```csv
role,name,rut,email,username,password,course,section,subjects
teacher,Roberto Díaz Pérez,15.000.001-6,roberto.diaz@colegio.cl,r.diaz,1234,1ro Básico,A,MAT
teacher,Roberto Díaz Pérez,15.000.001-6,roberto.diaz@colegio.cl,r.diaz,1234,1ro Básico,B,MAT
teacher,Roberto Díaz Pérez,15.000.001-6,roberto.diaz@colegio.cl,r.diaz,1234,2do Básico,A,MAT
teacher,Roberto Díaz Pérez,15.000.001-6,roberto.diaz@colegio.cl,r.diaz,1234,2do Básico,B,MAT
teacher,Roberto Díaz Pérez,15.000.001-6,roberto.diaz@colegio.cl,r.diaz,1234,3ro Básico,A,MAT
teacher,Roberto Díaz Pérez,15.000.001-6,roberto.diaz@colegio.cl,r.diaz,1234,3ro Básico,B,MAT
teacher,Patricia González Vega,15.000.002-4,patricia.gonzalez@colegio.cl,p.gonzalez,1234,1ro Básico,A,LEN
teacher,Patricia González Vega,15.000.002-4,patricia.gonzalez@colegio.cl,p.gonzalez,1234,1ro Básico,B,LEN
teacher,Patricia González Vega,15.000.002-4,patricia.gonzalez@colegio.cl,p.gonzalez,1234,2do Básico,A,LEN
teacher,Patricia González Vega,15.000.002-4,patricia.gonzalez@colegio.cl,p.gonzalez,1234,2do Básico,B,LEN
teacher,Patricia González Vega,15.000.002-4,patricia.gonzalez@colegio.cl,p.gonzalez,1234,3ro Básico,A,LEN
teacher,Patricia González Vega,15.000.002-4,patricia.gonzalez@colegio.cl,p.gonzalez,1234,3ro Básico,B,LEN
... (continúa para todos los profesores)
```

#### Archivo: `estudiantes_completo.csv`

Este archivo contiene 270 estudiantes distribuidos en 6 secciones:

```csv
role,name,rut,email,username,password,course,section,subjects
student,Ana López García,10.000.001-6,ana.lopez@colegio.cl,,1234,1ro Básico,A,
student,Carlos Pérez Silva,10.000.002-4,carlos.perez@colegio.cl,,1234,1ro Básico,A,
... (45 estudiantes para 1ro Básico A)
student,Pedro Sáez Cabrera,10.000.046-6,pedro.saez@colegio.cl,,1234,1ro Básico,B,
... (45 estudiantes para 1ro Básico B)
student,Nombre Estudiante,10.100.001-6,estudiante@colegio.cl,,1234,2do Básico,A,
... (45 estudiantes para 2do Básico A)
student,Nombre Estudiante,10.100.046-6,estudiante@colegio.cl,,1234,2do Básico,B,
... (45 estudiantes para 2do Básico B)
student,Nombre Estudiante,10.200.001-6,estudiante@colegio.cl,,1234,3ro Básico,A,
... (45 estudiantes para 3ro Básico A)
student,Nombre Estudiante,10.200.046-6,estudiante@colegio.cl,,1234,3ro Básico,B,
... (45 estudiantes para 3ro Básico B)
```

### 3. Cargar en el Sistema

#### Orden de Carga:

1. **PRIMERO**: Cargar `profesores_completo.csv`
   - Resultado: 10 profesores creados
   - 60 asignaciones creadas (10 × 6 secciones)

2. **SEGUNDO**: Cargar `estudiantes_completo.csv`
   - Resultado: 270 estudiantes creados
   - Distribuidos en 6 secciones (45 por sección)
   - Todos habilitados para todas las asignaturas

## 📊 Ventajas del Sistema

### Para Estudiantes
- ✅ Campo `subjects` vacío = Habilitados para **todas** las asignaturas automáticamente
- ✅ No es necesario especificar cada asignatura manualmente
- ✅ Pueden ver tareas y evaluaciones de todas las materias

### Para Profesores
- ✅ Un mismo profesor puede enseñar en **múltiples cursos y secciones**
- ✅ El sistema fusiona automáticamente las asignaciones del mismo profesor
- ✅ Las asignaciones se crean automáticamente al cargar el CSV

### Para Administradores
- ✅ Carga masiva rápida y eficiente
- ✅ Fácil actualización de asignaciones
- ✅ Validaciones automáticas (RUT, cursos, secciones)

## 🎓 Casos de Uso Comunes

### Caso 1: Profesor de asignatura específica en todos los cursos

**Ejemplo**: Profesor de Matemáticas enseña en 1ro, 2do y 3ro Básico (ambas secciones)

```csv
role,name,rut,email,username,password,course,section,subjects
teacher,Roberto Díaz,15.000.001-6,r.diaz@colegio.cl,r.diaz,1234,1ro Básico,A,MAT
teacher,Roberto Díaz,15.000.001-6,r.diaz@colegio.cl,r.diaz,1234,1ro Básico,B,MAT
teacher,Roberto Díaz,15.000.001-6,r.diaz@colegio.cl,r.diaz,1234,2do Básico,A,MAT
teacher,Roberto Díaz,15.000.001-6,r.diaz@colegio.cl,r.diaz,1234,2do Básico,B,MAT
teacher,Roberto Díaz,15.000.001-6,r.diaz@colegio.cl,r.diaz,1234,3ro Básico,A,MAT
teacher,Roberto Díaz,15.000.001-6,r.diaz@colegio.cl,r.diaz,1234,3ro Básico,B,MAT
```

### Caso 2: Profesor jefe (enseña múltiples asignaturas en un curso)

**Ejemplo**: Profesor jefe de 1ro Básico A enseña Lenguaje, Matemáticas e Historia

```csv
role,name,rut,email,username,password,course,section,subjects
teacher,María Jefe,15.100.001-6,m.jefe@colegio.cl,m.jefe,1234,1ro Básico,A,"LEN,MAT,HIST"
```

### Caso 3: Estudiante con asignaturas específicas (casos especiales)

**Ejemplo**: Estudiante solo toma Matemáticas y Lenguaje

```csv
role,name,rut,email,username,password,course,section,subjects
student,Juan Especial,10.000.999-9,juan@colegio.cl,j.especial,1234,1ro Básico,A,"MAT,LEN"
```

### Caso 4: Estudiante regular (todas las asignaturas)

**Ejemplo**: Estudiante toma todas las asignaturas del curso

```csv
role,name,rut,email,username,password,course,section,subjects
student,Ana Regular,10.000.001-6,ana@colegio.cl,a.regular,1234,1ro Básico,A,
```

## 🔍 Validaciones del Sistema

El sistema valida automáticamente:

1. **RUT válido** con dígito verificador correcto
2. **Curso existe** en el sistema
3. **Sección existe** y pertenece al curso especificado
4. **Asignaturas válidas** (si se especifican)
5. **Username único** o se auto-genera si está vacío
6. **Email válido** (formato correcto)

## 💡 Tips y Mejores Prácticas

### Organización de RUTs

Usa rangos diferentes para cada curso:
- **1ro Básico**: 10.000.001-6 a 10.000.090-3
- **2do Básico**: 10.100.001-6 a 10.100.090-3
- **3ro Básico**: 10.200.001-6 a 10.200.090-3
- **Profesores**: 15.000.001-6 a 15.000.010-5

### Nomenclatura de Usernames

- **Estudiantes**: Auto-generados desde email (ej: `ana.lopez`)
- **Profesores**: Formato `inicial.apellido` (ej: `r.diaz`)

### Estructura de Emails

- **Estudiantes**: `nombre.apellido@colegio.cl`
- **Profesores**: `nombre.apellido@colegio.cl`

## 📈 Escalabilidad

Este modelo escala fácilmente:

- **Agregar más cursos**: Crea nuevos cursos (4to Básico, 5to Básico, etc.)
- **Agregar más secciones**: Crea sección C, D, etc.
- **Agregar más profesores**: Simplemente añade filas al CSV de profesores
- **Agregar más estudiantes**: Añade filas al CSV de estudiantes

## 🎯 Resultado Final

Después de cargar ambos archivos tendrás:

- ✅ **270 estudiantes** distribuidos en 6 secciones
- ✅ **10 profesores** con asignaciones en todos los cursos
- ✅ **60 asignaciones** profesor-sección-asignatura
- ✅ Sistema completamente operativo para tareas, evaluaciones, calificaciones y asistencia

---

**Última actualización**: 18 de Octubre de 2025
