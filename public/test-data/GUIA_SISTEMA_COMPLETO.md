# 🏫 Sistema Educativo Completo - Guía de Carga Masiva

## 📊 Resumen del Sistema

Este sistema educativo completo incluye:

### 👥 Estudiantes
- **Total**: 1,080 estudiantes
- **Distribución**: 45 estudiantes por sección
- **Cursos**: 12 (1ro Básico a 4to Medio)
- **Secciones**: 2 por curso (A y B)
- **Archivo**: `estudiantes_sistema_completo.csv`

### 👨‍🏫 Profesores
- **Total**: 14 profesores
- **Asignaciones**: 268 asignaciones curso-sección-asignatura
- **Cobertura**: Todos los cursos y secciones
- **Archivo**: `profesores_sistema_completo.csv`

## 📁 Archivos Generados

### 1. `estudiantes_sistema_completo.csv`
Contiene 1,080 estudiantes distribuidos así:

| Curso | Sección A | Sección B | Total |
|-------|-----------|-----------|-------|
| 1ro Básico | 45 | 45 | 90 |
| 2do Básico | 45 | 45 | 90 |
| 3ro Básico | 45 | 45 | 90 |
| 4to Básico | 45 | 45 | 90 |
| 5to Básico | 45 | 45 | 90 |
| 6to Básico | 45 | 45 | 90 |
| 7mo Básico | 45 | 45 | 90 |
| 8vo Básico | 45 | 45 | 90 |
| 1ro Medio | 45 | 45 | 90 |
| 2do Medio | 45 | 45 | 90 |
| 3ro Medio | 45 | 45 | 90 |
| 4to Medio | 45 | 45 | 90 |
| **TOTAL** | **540** | **540** | **1,080** |

### 2. `profesores_sistema_completo.csv`
Contiene 14 profesores con sus asignaciones:

#### Profesores de Educación Básica y Media (10)
Enseñan en TODOS los cursos (1ro Básico a 4to Medio):

| Profesor | Asignatura | Código | Asignaciones |
|----------|------------|--------|--------------|
| Roberto Díaz Pérez | Matemáticas | MAT | 24 (12 cursos × 2 secciones) |
| Patricia González Vega | Lenguaje y Comunicación | LEN | 24 |
| Carlos Muñoz Silva | Ciencias Naturales | CNT | 24 |
| Andrea Soto Torres | Historia y Geografía | HIST | 24 |
| Miguel Vargas Rojas | Inglés | ING | 24 |
| Lorena Campos Morales | Educación Física | EFI | 24 |
| Sergio Herrera Castro | Música | MUS | 24 |
| Mónica Ramírez Núñez | Artes Visuales | ART | 24 |
| Francisco Reyes Jiménez | Tecnología | TEC | 24 |
| Claudia Flores Paredes | Religión | REL | 24 |

#### Profesores Especializados de Enseñanza Media (4)

| Profesor | Asignatura | Código | Cursos | Asignaciones |
|----------|------------|--------|--------|--------------|
| Fernando Lagos Medina | Biología | BIO | 1ro-4to Medio | 8 (4 cursos × 2 secciones) |
| Gloria Pinto Vidal | Física | FIS | 1ro-4to Medio | 8 |
| Héctor Moreno Ortiz | Química | QUI | 1ro-4to Medio | 8 |
| Isabel Rojas Contreras | Filosofía | FIL | 3ro-4to Medio | 4 (2 cursos × 2 secciones) |

## 🚀 Instrucciones de Carga (PASO A PASO)

### PASO 1: Preparar el Sistema (CRÍTICO)

Antes de cargar los archivos CSV, **DEBES** crear la estructura base:

#### 1.1. Crear los 12 Cursos
Ve a **Admin → Gestión de Usuarios → Cursos** y crea:

```
✅ 1ro Básico
✅ 2do Básico
✅ 3ro Básico
✅ 4to Básico
✅ 5to Básico
✅ 6to Básico
✅ 7mo Básico
✅ 8vo Básico
✅ 1ro Medio
✅ 2do Medio
✅ 3ro Medio
✅ 4to Medio
```

⚠️ **IMPORTANTE**: Los nombres deben ser **EXACTAMENTE** como se muestran arriba.

#### 1.2. Crear las 24 Secciones
Ve a **Admin → Gestión de Usuarios → Secciones** y crea:

Para cada curso, crea 2 secciones:
```
1ro Básico → Sección A
1ro Básico → Sección B
2do Básico → Sección A
2do Básico → Sección B
... (continúa para todos los cursos)
4to Medio → Sección A
4to Medio → Sección B
```

💡 **TIP**: El nombre de la sección solo debe ser la letra: `A` o `B`

### PASO 2: Cargar Profesores (PRIMERO)

1. Ve a **Admin → Configuración**
2. Busca la sección **"Carga Masiva Excel"**
3. Haz clic en **"Upload Excel"**
4. Selecciona: `profesores_sistema_completo.csv`
5. Espera a que se complete la carga (puede tomar 1-2 minutos)

**Resultado esperado:**
```
✅ 14 profesores creados
✅ 268 asignaciones creadas
✅ 0 errores
```

### PASO 3: Cargar Estudiantes (DESPUÉS)

1. Ve a **Admin → Configuración**
2. Busca la sección **"Carga Masiva Excel"**
3. Haz clic en **"Upload Excel"**
4. Selecciona: `estudiantes_sistema_completo.csv`
5. Espera a que se complete la carga (puede tomar 3-5 minutos)

**Resultado esperado:**
```
✅ 1,080 estudiantes creados
✅ Distribuidos en 24 secciones (45 por sección)
✅ Todos habilitados para todas las asignaturas
✅ 0 errores
```

## ✅ Verificación Post-Carga

### 1. Verificar Usuarios Totales
Ve a **Admin → Gestión de Usuarios**

Deberías ver:
- **1,080 estudiantes** (rol: student)
- **14 profesores** (rol: teacher)
- **Total: 1,094 usuarios**

### 2. Verificar Asignaciones de Profesores
Ve a **Admin → Gestión de Usuarios → Asignaciones**

Deberías ver:
- **268 asignaciones** profesor-sección-asignatura
- Cada profesor debe aparecer en múltiples secciones

### 3. Verificar Estudiantes por Curso
Filtra por cada curso en el módulo de gestión:

Cada curso debe tener:
- **90 estudiantes totales**
- **45 en sección A**
- **45 en sección B**

### 4. Prueba de Login

**Ejemplo de estudiante:**
- Username: (se auto-generó desde email)
- Password: `1234`

**Ejemplo de profesor:**
- Username: `r.diaz` (Roberto Díaz - Matemáticas)
- Password: `1234`

## 📋 Estructura de los Archivos CSV

### Columnas Obligatorias

```csv
role,name,rut,email,username,password,course,section,subjects
```

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `role` | Rol del usuario | `student` o `teacher` |
| `name` | Nombre completo | `Sofía González Pérez` |
| `rut` | RUT chileno válido | `11.001.001-9` |
| `email` | Email único | `sofia.gonzalez0001@colegio.cl` |
| `username` | Usuario (vacío = auto) | vacío o `s.gonzalez` |
| `password` | Contraseña | `1234` |
| `course` | Curso | `1ro Básico` |
| `section` | Sección | `A` o `B` |
| `subjects` | Asignaturas | vacío (todas) o `MAT,LEN` |

### Reglas Importantes

#### Para Estudiantes:
- ✅ Campo `subjects` **VACÍO** = Habilitado para **TODAS** las asignaturas
- ✅ Campo `username` vacío = Se genera automáticamente desde email
- ✅ RUT único y válido (con dígito verificador correcto)
- ✅ Email único por estudiante

#### Para Profesores:
- ✅ Mismo profesor puede aparecer en **múltiples filas** (diferentes asignaciones)
- ✅ Campo `subjects` con código de asignatura: `MAT`, `LEN`, `CNT`, etc.
- ✅ El sistema fusiona automáticamente filas del mismo profesor

## 🎓 Códigos de Asignaturas

### Asignaturas Básicas (Todos los cursos)
| Código | Asignatura |
|--------|------------|
| MAT | Matemáticas |
| LEN | Lenguaje y Comunicación |
| CNT | Ciencias Naturales |
| HIST | Historia, Geografía y Ciencias Sociales |
| ING | Inglés |
| EFI | Educación Física y Salud |
| MUS | Música |
| ART | Artes Visuales |
| TEC | Tecnología |
| REL | Religión |

### Asignaturas Especializadas (Enseñanza Media)
| Código | Asignatura | Cursos |
|--------|------------|--------|
| BIO | Biología | 1ro-4to Medio |
| FIS | Física | 1ro-4to Medio |
| QUI | Química | 1ro-4to Medio |
| FIL | Filosofía | 3ro-4to Medio |

## 🔧 Regenerar Archivos (Si es necesario)

Si necesitas regenerar los archivos CSV:

### Regenerar Estudiantes
```bash
cd /workspaces/superjf_v16/public/test-data
python3 generar_estudiantes.py
```

### Regenerar Profesores
```bash
cd /workspaces/superjf_v16/public/test-data
python3 generar_profesores.py
```

## ⚠️ Solución de Problemas

### Error: "Curso no encontrado"
**Causa**: No se creó el curso en el sistema
**Solución**: 
1. Ve a Admin → Gestión de Usuarios → Cursos
2. Crea el curso exactamente como aparece en el CSV
3. Ejemplo: `1ro Básico` (no "Primero Básico")

### Error: "Sección no encontrada"
**Causa**: No se creó la sección o no está asociada al curso
**Solución**:
1. Ve a Admin → Gestión de Usuarios → Secciones
2. Crea la sección `A` o `B`
3. Asóciala al curso correcto

### Error: "RUT inválido"
**Causa**: El dígito verificador del RUT no coincide
**Solución**: Los RUTs generados son válidos. Si modificaste el archivo, verifica el cálculo del DV.

### Error: "Username duplicado"
**Causa**: Dos usuarios tienen el mismo username
**Solución**: Deja el campo username vacío para que se auto-genere

### Carga muy lenta
**Causa**: Normal para 1,080 estudiantes
**Solución**: 
- Paciencia, puede tomar 3-5 minutos
- El navegador mostrará el progreso
- No cierres la ventana hasta que termine

## 💡 Consejos y Mejores Prácticas

### 1. Orden de Carga
Siempre respeta este orden:
1. Cursos
2. Secciones
3. Profesores
4. Estudiantes

### 2. Backup Antes de Cargar
Exporta tu base de datos actual:
- Admin → Configuración → Exportar Datos

### 3. Carga en Horarios de Baja Demanda
Carga los 1,080 estudiantes cuando el sistema tenga poco uso.

### 4. Verifica en Etapas
- Carga profesores → Verifica → Carga estudiantes

### 5. Usa Filtros en Gestión de Usuarios
Para revisar los datos cargados:
- Filtra por curso
- Filtra por sección
- Filtra por rol

## 📊 Estadísticas del Sistema Completo

### Usuarios
- 👥 **1,080 estudiantes**
- 👨‍🏫 **14 profesores**
- 📊 **Total: 1,094 usuarios**

### Estructura
- 🎓 **12 cursos** (1ro Básico - 4to Medio)
- 📚 **24 secciones** (2 por curso)
- 📖 **14 asignaturas** (10 básicas + 4 especializadas)

### Asignaciones
- 🔗 **268 asignaciones** profesor-sección-asignatura
- 📋 **160 asignaciones** en Educación Básica
- 📋 **108 asignaciones** en Educación Media

### Capacidad
- 👥 **45 estudiantes** por sección (capacidad máxima configurable)
- 🏫 **90 estudiantes** por curso
- 📚 Cada estudiante tiene acceso a **todas las asignaturas** de su curso

## 🎯 Casos de Uso

### Ver Estudiantes de un Curso
1. Admin → Gestión de Usuarios
2. Filtrar por curso: `1ro Básico`
3. Ver 90 estudiantes (45 A + 45 B)

### Ver Asignaciones de un Profesor
1. Admin → Gestión de Usuarios → Asignaciones
2. Buscar profesor: `Roberto Díaz`
3. Ver todas sus asignaciones (24 secciones)

### Crear Tareas para un Curso
1. Login como profesor (ej: `r.diaz` / `1234`)
2. Ir a Tareas → Crear Tarea
3. Seleccionar curso y sección
4. Los 45 estudiantes verán la tarea

### Registrar Asistencia
1. Login como profesor
2. Ir a Asistencia
3. Seleccionar curso y sección
4. Marcar asistencia de los 45 estudiantes

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía completa
2. Verifica la sección "Solución de Problemas"
3. Asegúrate de haber seguido el orden correcto de carga
4. Verifica que los cursos y secciones estén creados correctamente

---

**Última actualización**: 18 de Octubre de 2025
**Versión**: 1.0
**Sistema**: SmartStudent v16
