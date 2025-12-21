# 📊 Instrucciones para Cargar Calificaciones 2025

## 📋 Archivo Generado

**Archivo:** `grades-2025-COMPLETO-REAL.csv`

Este archivo contiene **57,600 calificaciones** para los **1,080 estudiantes** del sistema durante todo el año 2025.

---

## ✅ Características del Archivo

### 👥 Cobertura de Estudiantes
- **1,080 estudiantes únicos**
- Todos los cursos de Básica y Media
- Secciones A y B de cada curso

### 📚 Asignaturas Reales del Proyecto

#### Educación Básica (1ro - 8vo Básico)
| Código | Asignatura | Registros |
|--------|-----------|-----------|
| **MAT** | Matemáticas | 10,800 |
| **LEN** | Lenguaje y Comunicación | 10,800 |
| **CNT** | Ciencias Naturales | 7,200 |
| **HIS** | Historia y Geografía | 10,800 |

#### Educación Media (1ro - 4to Medio)
| Código | Asignatura | Registros |
|--------|-----------|-----------|
| **MAT** | Matemáticas | - |
| **LEN** | Lenguaje y Comunicación | - |
| **BIO** | Biología | 3,600 |
| **FIS** | Física | 3,600 |
| **QUI** | Química | 3,600 |
| **HIS** | Historia y Geografía | - |
| **FIL** | Filosofía | 3,600 |
| **EDC** | Educación Ciudadana | 3,600 |

### 📝 Distribución de Actividades
- **Tareas:** 19,034 registros (33.3%)
- **Evaluaciones:** 19,415 registros (33.7%)
- **Pruebas:** 19,151 registros (33.0%)

### 📅 Distribución por Semestres
- **1er Semestre** (Marzo - Junio): 5 calificaciones por asignatura
- **2do Semestre** (Julio - Diciembre): 5 calificaciones por asignatura

### 📊 Calificaciones
- **Rango:** 50 - 100 puntos
- **Distribución:** Aleatoria realista
- **Fechas:** Distribuidas en fechas reales de cada semestre

---

## 🚀 Cómo Cargar el Archivo

### Opción 1: Carga Manual (Recomendado)

1. **Abre la aplicación en tu navegador:**
   ```
   http://localhost:9002/dashboard
   ```

2. **Dirígete a Admin > Carga Masiva o similar**
   - Busca la opción para cargar archivos CSV

3. **Selecciona el archivo:**
   ```
   /workspaces/superjf_v16/public/test-data/grades-2025-COMPLETO-REAL.csv
   ```

4. **Elige el tipo:** "Calificaciones" o "Grades"

5. **Haz clic en Cargar/Upload**

6. **Espera a que finalice** (puede tomar unos momentos con 57,600 registros)

### Opción 2: Carga por Consola del Navegador

1. **Abre F12** para abrir la consola

2. **Pega y ejecuta:**
   ```javascript
   fetch('/api/upload-grades', {
     method: 'POST',
     body: formData,
     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
   }).then(r => r.json()).then(console.log)
   ```

### Opción 3: Desde Firebase Admin

Si tienes acceso directo a Firebase:

1. Copia los registros del CSV
2. Importa manualmente a Firestore en la colección `grades_2025`
3. Asegúrate de usar la estructura correcta

---

## 📋 Estructura del CSV

```csv
studentId,studentName,course,section,subject,subjectId,taskType,score,gradedAt,taskId,title
s.gonzalez0008,"Sofía González González","1ro Básico","A","Matemáticas","MAT","prueba",90,2025-03-27T00:00:00.000Z,"task-1","Matemáticas - Prueba 1 (1er Sem)"
...
```

### Campos:
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **studentId** | ID único del estudiante | s.gonzalez0008 |
| **studentName** | Nombre completo | Sofía González González |
| **course** | Nivel/Curso | 1ro Básico |
| **section** | Sección | A |
| **subject** | Nombre de asignatura | Matemáticas |
| **subjectId** | Código de asignatura | MAT |
| **taskType** | Tipo de actividad | tarea, evaluacion, prueba |
| **score** | Puntaje (50-100) | 90 |
| **gradedAt** | Fecha ISO 8601 | 2025-03-27T00:00:00.000Z |
| **taskId** | ID único de tarea | task-1 |
| **title** | Título descriptivo | Matemáticas - Prueba 1 (1er Sem) |

---

## ✨ Validación Post-Carga

Después de cargar el archivo, verifica:

1. **En Calificaciones:**
   - Selecciona 2025 como año
   - Verifica que aparezcan las calificaciones
   - Filtra por asignatura y semestre

2. **En Reportes:**
   - Genera reportes por estudiante
   - Verifica promedios
   - Comprueba que hay datos para todo el año

3. **En Estadísticas:**
   - Total de calificaciones cargadas: 57,600
   - Estudiantes con calificaciones: 1,080
   - Asignaturas cubiertas: 4-8 por nivel

---

## 🔍 Troubleshooting

### Error: "Archivo no encontrado"
- Verifica que el archivo esté en `/workspaces/superjf_v16/public/test-data/`
- Comprueba que el nombre sea exacto: `grades-2025-COMPLETO-REAL.csv`

### Error: "Formato incorrecto"
- Asegúrate de que el CSV tenga las columnas correctas
- Verifica que no hay espacios extras en los campos

### Error: "Estudiante no encontrado"
- Los studentId (usernames) deben coincidir con los de `users-consolidated-2025-CORREGIDO.csv`
- Si falta algún estudiante, carga primero ese archivo de usuarios

### Slow / Timeout
- El archivo es grande (10M, 57,600 registros)
- Espera más tiempo o carga en partes si es necesario
- Intenta en horarios de menos carga del servidor

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que los estudiantes estén cargados primero
2. Revisa los logs del servidor
3. Intenta cargar una porción del archivo primero
4. Verifica permisos de usuario (debe ser Admin)

---

## ✅ Checklist Final

- [ ] Archivo descargado: `grades-2025-COMPLETO-REAL.csv`
- [ ] Ubicación confirmada en `/public/test-data/`
- [ ] Estudiantes cargados previamente (1,080)
- [ ] Asignaturas creadas en el sistema
- [ ] Permisos de Admin configurados
- [ ] Archivo cargado exitosamente
- [ ] Calificaciones visibles en la plataforma
- [ ] Promedios calculados correctamente

---

**¡Listo para usar!** 🎉
