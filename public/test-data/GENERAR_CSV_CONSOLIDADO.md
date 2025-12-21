# 📋 CSV CONSOLIDADO 2025 - Estudiantes y Profesores

## 🎯 Objetivo
Crear un archivo CSV con:
- **1,080 estudiantes** (1ro Básico A/B hasta 4to Medio A/B, 45 por sección)
- **32 profesores** (máximo 4 clases cada uno: 1 materia × 2 cursos × 2 secciones)

## 📝 Estructura del CSV

```csv
role,name,rut,email,username,password,course,section,subjects
student,Ana López Martínez,12345678-9,ana.lopez@student.cl,ana.lopez5678,temporal123,1ro Básico,A,
teacher,Carlos Rodríguez,98765432-1,carlos.rodriguez@school.cl,carlos.rodriguez,temporal123,,,MAT
```

## 🔧 Columnas

### Para Estudiantes (role=student)
- **role**: `student`
- **name**: Nombre completo
- **rut**: RUT chileno válido con dígito verificador
- **email**: correo@student.cl
- **username**: inicial.apellido + últimos 4 dígitos del RUT
- **password**: `temporal123` (cambiar en primer login)
- **course**: Nombre del curso (ej: "1ro Básico", "2do Medio")
- **section**: Letra de sección (A o B)
- **subjects**: vacío (se heredan todas las materias del curso)

### Para Profesores (role=teacher)
- **role**: `teacher`
- **name**: Nombre completo
- **rut**: RUT chileno válido
- **email**: correo@school.cl
- **username**: nombre.apellido
- **password**: `temporal123`
- **course**: vacío (se asigna via subjects)
- **section**: vacío (se asigna via subjects)
- **subjects**: Materias asignadas separadas por coma (ej: "MAT, LEN")

## 📊 Distribución de Profesores

32 profesores para 8 materias × 4 clases cada uno:

### Materias Principales (4 profesores por materia)
- **Matemáticas (MAT)**: 4 profesores
- **Lenguaje (LEN)**: 4 profesores
- **Historia (HIS)**: 4 profesores
- **Ciencias Naturales (CNT)**: 4 profesores

### Materias Secundarias (4 profesores por materia)
- **Inglés (ING)**: 4 profesores
- **Educación Física (EFI)**: 4 profesores
- **Música (MUS)**: 4 profesores
- **Artes Visuales (ART)**: 4 profesores

## 🔢 Asignación de Clases por Profesor

Cada profesor tiene **4 clases** = **1 materia × 2 cursos × 2 secciones (A/B)**

Ejemplo Matemáticas:
- **Profesor 1 MAT**: 1ro Básico A/B, 2do Básico A/B (4 clases)
- **Profesor 2 MAT**: 3ro Básico A/B, 4to Básico A/B (4 clases)
- **Profesor 3 MAT**: 5to Básico A/B, 6to Básico A/B (4 clases)
- **Profesor 4 MAT**: 7mo Básico A/B, 8vo Básico A/B (4 clases)

(Patrón se repite para Media)

## ✅ Proceso de Uso

1. **Generar CSV**: ejecutar el script generador
2. **Subir a la app**: Configuración → Carga Masiva Excel → seleccionar CSV
3. **Verificar**:
   - Cursos y Secciones: todas con 45/45 estudiantes
   - Asignaciones: 128 asignaciones de profesor (32 × 4)
   - Gestión de Usuarios: badges de curso/sección visibles

## 🚀 Script de Generación

Ver `generate-consolidated-csv.js`
