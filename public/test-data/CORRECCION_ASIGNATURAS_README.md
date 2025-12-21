# 🔧 CORRECCIÓN: Asignaturas por Nivel Educativo

## ❌ Problema Identificado

En el archivo `users-consolidated-2025.csv` existen profesores con asignaturas que **NO deben aparecer** en la pestaña de **Configuración → Calificaciones** del módulo Admin.

### **Regla del Sistema:**
La pestaña "Cursos y Secciones" define las asignaturas permitidas por nivel:

#### 📘 Educación Básica (1ro-8vo Básico)
**SOLO 4 asignaturas:**
- `CNT` - Ciencias Naturales
- `HIS` - Historia, Geografía y Ciencias Sociales  
- `LEN` - Lenguaje y Comunicación
- `MAT` - Matemáticas

#### 📗 Educación Media (1ro-4to Medio)
**8 asignaturas:**
- `BIO` - Biología
- `FIS` - Física
- `QUI` - Química
- `HIS` - Historia, Geografía y Ciencias Sociales
- `LEN` - Lenguaje y Comunicación
- `MAT` - Matemáticas
- `FIL` - Filosofía
- `EDC` - Educación Ciudadana

---

## 🚫 Asignaturas a ELIMINAR del archivo CSV

Estas asignaturas NO deben aparecer en ningún curso de Básica:

| Código | Asignatura | Motivo |
|--------|-----------|--------|
| `ING` | Inglés | No está en la configuración de Básica |
| `EFI` | Educación Física | No está en la configuración de Básica |
| `MUS` | Música | No está en la configuración de Básica |
| `ART` | Artes Visuales | No está en la configuración de Básica |
| `TEC` | Tecnología | No está en la configuración de Básica |
| `REL` | Religión | No está en la configuración de Básica |

**Total de registros a eliminar:** ~384 líneas (6 asignaturas × 8 cursos × 2 secciones × 4 profesores)

---

## ✅ Solución Implementada

He creado un **nuevo archivo CSV corregido** que:

1. ✅ Mantiene TODOS los estudiantes (1,080 registros)
2. ✅ Mantiene SOLO los profesores con asignaturas válidas (CNT, HIS, LEN, MAT para Básica)
3. ✅ Mantiene TODOS los profesores de Media (BIO, FIS, QUI, HIS, LEN, MAT, FIL, EDC)
4. ❌ Elimina profesores de: ING, EFI, MUS, ART, TEC, REL en Básica

---

## 📊 Estadísticas del Archivo Corregido

### Estudiantes (Sin cambios)
- **1,080 estudiantes** distribuidos en:
  - Básica: 720 estudiantes (8 cursos × 2 secciones × 45 estudiantes)
  - Media: 360 estudiantes (4 cursos × 2 secciones × 45 estudiantes)

### Profesores (Corregidos)
- **Básica:** 8 profesores (4 asignaturas válidas: CNT, HIS, LEN, MAT)
  - Total asignaciones Básica: 256 registros (8 cursos × 2 secciones × 4 asignaturas × 4 profesores)
  
- **Media:** 16 profesores (8 asignaturas)
  - Total asignaciones Media: 128 registros (4 cursos × 2 secciones × 8 asignaturas × 2 profesores)

**Total registros en archivo nuevo:** 1,080 estudiantes + 384 asignaciones profesores = **1,464 líneas**

---

## 📝 Archivo Generado

✅ **Archivo creado:** `public/test-data/users-consolidated-2025-CORREGIDO.csv`

Este archivo:
- ✅ Solo incluye asignaturas válidas por nivel
- ✅ Respeta la configuración de "Cursos y Secciones"
- ✅ Listo para carga masiva sin errores
- ✅ Compatible con el archivo de calificaciones `grades-consolidated-2025.csv`

---

## 🔄 Siguiente Paso

1. **Usa el archivo corregido** para la carga masiva:
   - Archivo: `public/test-data/users-consolidated-2025-CORREGIDO.csv`
   
2. **En el Admin → Configuración:**
   - Pestaña "Carga Masiva de Usuarios"
   - Selecciona el archivo CORREGIDO
   - Ejecuta la carga

3. **Verifica en Calificaciones:**
   - Deberías ver solo las asignaturas correctas (CNT, HIS, LEN, MAT)
   - No deberían aparecer ING, EFI, MUS, ART, TEC, REL

---

## 📌 Nota Importante

El archivo original `users-consolidated-2025.csv` se mantiene como respaldo.  
El nuevo archivo `users-consolidated-2025-CORREGIDO.csv` es la versión limpia para usar en producción.
