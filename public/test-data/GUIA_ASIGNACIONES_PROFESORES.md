# 🎓 Guía de Asignación de Profesores - Carga Masiva

## 📋 Archivos Generados

Has generado 2 archivos CSV para asignar profesores a todas las asignaturas:

### 1. `profesores_nuevos.csv` (9 profesores)
Crea los usuarios de profesores en el sistema.

### 2. `asignaciones_profesores.csv` (128 asignaciones) ⭐ **ESTE ES EL PRINCIPAL**
Asigna cada profesor a sus cursos, secciones y asignaturas específicas.

---

## 🎯 Proceso de Carga (2 Pasos)

### PASO 1: Crear Profesores (si aún no existen)

**Ve a:** `Admin → Configuración → Carga Masiva Excel`

1. Haz clic en **"Upload Excel"** (el primer botón)
2. Selecciona el archivo: `profesores_nuevos.csv`
3. Espera la confirmación: **"9 usuarios creados"**

**Profesores que se crearán:**

| Código | Nombre | Usuario | Contraseña |
|--------|--------|---------|------------|
| **CNT** | Carlos Muñoz Silva | `c.munoz` | 1234 |
| **HIS** | Andrea Soto Torres | `a.soto` | 1234 |
| **LEN** | Patricia González Vega | `p.gonzalez` | 1234 |
| **MAT** | Roberto Díaz Pérez | `r.diaz` | 1234 |
| **BIO** | Fernando Lagos Medina | `f.lagos` | 1234 |
| **FIS** | Gloria Pinto Vidal | `g.pinto` | 1234 |
| **QUI** | Héctor Moreno Ortiz | `h.moreno` | 1234 |
| **FIL** | Isabel Rojas Contreras | `i.rojas` | 1234 |
| **EDC** | Miguel Vargas Rojas | `m.vargas` | 1234 |

---

### PASO 2: Asignar Profesores a Asignaturas ⭐ **IMPORTANTE**

**Ve a:** `Admin → Configuración → Carga Masiva Asignaciones Profesores`

> ⚠️ **NOTA:** Busca el botón que dice **"Asignaciones de Profesores"** o **"Teacher Assignments"**, NO el botón de carga masiva de usuarios.

1. Haz clic en el botón de **"Carga Masiva Asignaciones"**
2. Selecciona el archivo: `asignaciones_profesores.csv`
3. Espera la confirmación: **"128 asignaciones creadas"**

---

## 📊 ¿Qué se creará?

### Educación Básica (1ro a 8vo)
Cada curso tiene **2 secciones (A y B)** con **4 asignaturas**:

```
1ro Básico - Sección A:
  • CNT (Ciencias Naturales) → c.munoz
  • HIS (Historia...) → a.soto
  • LEN (Lenguaje...) → p.gonzalez
  • MAT (Matemáticas) → r.diaz

1ro Básico - Sección B:
  • CNT → c.munoz
  • HIS → a.soto
  • LEN → p.gonzalez
  • MAT → r.diaz

... (se repite para 2do, 3ro, 4to, 5to, 6to, 7mo, 8vo Básico)
```

**Total Básica:** 8 cursos × 2 secciones × 4 asignaturas = **64 asignaciones**

---

### Educación Media (1ro a 4to)
Cada curso tiene **2 secciones (A y B)** con **8 asignaturas**:

```
1ro Medio - Sección A:
  • BIO (Biología) → f.lagos
  • FIS (Física) → g.pinto
  • QUI (Química) → h.moreno
  • HIS (Historia...) → a.soto
  • LEN (Lenguaje...) → p.gonzalez
  • MAT (Matemáticas) → r.diaz
  • FIL (Filosofía) → i.rojas
  • EDC (Educación Ciudadana) → m.vargas

1ro Medio - Sección B:
  • BIO → f.lagos
  • FIS → g.pinto
  • QUI → h.moreno
  • HIS → a.soto
  • LEN → p.gonzalez
  • MAT → r.diaz
  • FIL → i.rojas
  • EDC → m.vargas

... (se repite para 2do, 3ro, 4to Medio)
```

**Total Media:** 4 cursos × 2 secciones × 8 asignaturas = **64 asignaciones**

---

## ✅ Verificación Post-Carga

### 1. Verificar en Admin → Asignaciones

Ve a: **Admin → Gestión de Usuarios → Asignaciones**

Deberías ver algo como:

```
📖 1ro Básico - Sección A (4 asignaturas)
   • CNT - Ciencias Naturales
     👨‍🏫 Carlos Muñoz Silva (c.munoz)
   
   • HIS - Historia, Geografía y Ciencias Sociales
     👨‍🏫 Andrea Soto Torres (a.soto)
   
   • LEN - Lenguaje y Comunicación
     👨‍🏫 Patricia González Vega (p.gonzalez)
   
   • MAT - Matemáticas
     👨‍🏫 Roberto Díaz Pérez (r.diaz)
```

### 2. Probar Login de Profesores

Prueba con cualquiera de estos usuarios:

- **Usuario:** `r.diaz` / **Contraseña:** `1234` (Matemáticas)
- **Usuario:** `p.gonzalez` / **Contraseña:** `1234` (Lenguaje)
- **Usuario:** `c.munoz` / **Contraseña:** `1234` (Ciencias)

### 3. Verificar Asignaciones del Profesor

Una vez que inicies sesión como profesor, deberías ver:

- **Mis Cursos:** Lista de todos los cursos y secciones asignados
- **Mis Asignaturas:** La materia que enseñas
- **Mis Estudiantes:** 45 estudiantes por cada sección

---

## 🔍 Troubleshooting

### Problema: "Profesor no encontrado"

**Causa:** Los profesores aún no existen en el sistema.

**Solución:**
1. Primero carga `profesores_nuevos.csv` (PASO 1)
2. Luego carga `asignaciones_profesores.csv` (PASO 2)

---

### Problema: "Curso no encontrado"

**Causa:** El nombre del curso en el CSV no coincide con el sistema.

**Solución:** Verifica que los cursos estén creados exactamente como:
- `1ro Básico`, `2do Básico`, ..., `8vo Básico`
- `1ro Medio`, `2do Medio`, `3ro Medio`, `4to Medio`

**Comando de verificación (consola del navegador):**
```javascript
const year = new Date().getFullYear();
const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
console.table(courses.map(c => ({ id: c.id, nombre: c.name })));
```

---

### Problema: "No encuentro el botón de Asignaciones"

**Solución:** El botón está en la sección de Configuración, debajo del botón de "Carga Masiva Excel". Busca:

```
📋 Carga Masiva Excel
   [Upload Excel]  ← Primer botón (para usuarios)

📋 Asignaciones de Profesores
   [Upload Excel]  ← Segundo botón (para asignaciones) ⭐ USA ESTE
```

---

## 📊 Resumen de Archivos

```
┌──────────────────────────────────────────────────────────────┐
│  📄 ARCHIVOS GENERADOS                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. profesores_nuevos.csv                                    │
│     ├─ 9 profesores                                          │
│     ├─ Campos: role, name, rut, email, username, password   │
│     └─ Uso: Crear usuarios profesores                       │
│                                                              │
│  2. asignaciones_profesores.csv ⭐ PRINCIPAL                 │
│     ├─ 128 asignaciones                                      │
│     ├─ Campos: teacherUsername, teacherEmail, course,       │
│     │          section, subjects                            │
│     └─ Uso: Asignar profesores a asignaturas                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Estado Final Esperado

Después de cargar ambos archivos:

```
✅ 9 profesores creados
✅ 128 asignaciones profesor-asignatura
✅ Todas las asignaturas tienen profesor asignado
✅ Sistema completo y operativo
```

### Estadísticas del Sistema Completo:

```
┌─────────────────────────────────────────┐
│  🏫 SISTEMA EDUCATIVO COMPLETO          │
├─────────────────────────────────────────┤
│  👥 Estudiantes:           1,080        │
│  👨‍🏫 Profesores:               9        │
│  📚 Asignaciones:            128        │
│  🎓 Cursos:                   12        │
│  📖 Secciones:                24        │
│  🏫 Asignaturas Únicas:        9        │
└─────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

Una vez completada la carga:

1. ✅ **Profesores creados y asignados**
2. ✅ **Estudiantes distribuidos en secciones**
3. 🎯 **Sistema listo para:**
   - Crear tareas
   - Tomar asistencia
   - Registrar calificaciones
   - Publicar evaluaciones

---

## 📱 Comandos Útiles (Consola del Navegador)

### Verificar profesores:
```javascript
const year = new Date().getFullYear();
const teachers = JSON.parse(localStorage.getItem(`smart-student-teachers-${year}`) || '[]');
console.table(teachers.map(t => ({ 
  username: t.username, 
  nombre: t.displayName 
})));
```

### Verificar asignaciones:
```javascript
const year = new Date().getFullYear();
const assignments = JSON.parse(localStorage.getItem(`smart-student-teacher-assignments-${year}`) || '[]');
console.log(`Total asignaciones: ${assignments.length}`);
console.table(assignments.slice(0, 10)); // Ver primeras 10
```

---

**¡Sistema listo para iniciar operaciones educativas!** 🎉
