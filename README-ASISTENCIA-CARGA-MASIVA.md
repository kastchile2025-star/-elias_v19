# 📋 Proceso de Carga Masiva de Asistencia - Firebase

## 📁 Archivo Generado

**Nombre:** `asistencia-2-estudiantes-1ro-basico-A-2025.csv`

### 👥 Estudiantes Incluidos
- **Sofía González Martínez** (RUT: 10000000-8, Username: s.gonzalez0000)
- **Matías López Silva** (RUT: 10000001-6, Username: m.lopez0001)

### 📊 Estadísticas del Archivo

| Información | Detalle |
|-------------|---------|
| **Total de registros** | 402 registros |
| **Estudiantes** | 2 estudiantes |
| **Curso** | 1ro Básico A |
| **Período** | Marzo a Diciembre 2025 |
| **Días totales por estudiante** | 201 días hábiles |
| **Fecha inicial** | 2025-03-03 |
| **Fecha final** | 2025-12-19 |

### 📈 Distribución de Estados

#### Sofía González Martínez:
- ✅ **Presente:** 179 días (89.1%)
- ⏰ **Atrasado:** 12 días (6.0%)
- ❌ **Ausente:** 8 días (4.0%)
- 📋 **Justificado:** 2 días (1.0%)

#### Matías López Silva:
- ✅ **Presente:** 168 días (83.6%)
- ⏰ **Atrasado:** 18 días (9.0%)
- ❌ **Ausente:** 10 días (5.0%)
- 📋 **Justificado:** 5 días (2.5%)

---

## 📝 Formato del Archivo CSV

### Estructura de Columnas

```csv
date,course,section,studentUsername,rut,name,status,comment
```

### Descripción de Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `date` | String | Fecha en formato YYYY-MM-DD | `2025-03-03` |
| `course` | String | Nombre del curso | `1ro Básico` |
| `section` | String | Sección del curso | `A` |
| `studentUsername` | String | Username único del estudiante | `s.gonzalez0000` |
| `rut` | String | RUT del estudiante con formato | `10000000-8` |
| `name` | String | Nombre completo del estudiante | `Sofía González Martínez` |
| `status` | String | Estado de asistencia | `present`, `late`, `absent`, `excused` |
| `comment` | String | Comentario opcional | `Llegó tarde`, `Inasistencia justificada` |

### Estados de Asistencia Válidos

| Estado | Descripción | Uso |
|--------|-------------|-----|
| `present` | Presente | Estudiante asistió normalmente |
| `late` | Atrasado | Estudiante llegó tarde |
| `absent` | Ausente | Estudiante no asistió sin justificativo |
| `excused` | Justificado | Ausencia con justificativo (médico, etc.) |

---

## 🔄 Proceso de Carga Masiva en Firebase

### Paso 1: Acceder al Módulo Admin
1. Inicia sesión como administrador
2. Ve a **Módulo Admin** (menú lateral)
3. Selecciona la pestaña **"Carga Masiva"**

### Paso 2: Sección de Asistencia
1. Dentro de "Carga Masiva", busca la tarjeta **"📅 Carga masiva: Asistencia (Firebase)"**
2. Verás el contador actual de registros de asistencia en Firebase

### Paso 3: Cargar el Archivo CSV
1. Haz clic en el botón **"Subir a Firebase"** (ícono de nube con flecha arriba)
2. Selecciona el archivo: `asistencia-2-estudiantes-1ro-basico-A-2025.csv`
3. El sistema validará el formato del archivo

### Paso 4: Progreso de Carga
El modal mostrará:
- ✅ **Fase actual:** Conectando / Procesando / Finalizando
- 📊 **Barra de progreso:** Porcentaje completado
- 📝 **Logs en tiempo real:** Detalles del proceso
- ✅ **Registros exitosos:** Cantidad procesada
- ❌ **Errores:** Si los hubiera

### Paso 5: Verificación
Una vez completada la carga:
1. El contador se actualizará automáticamente
2. Verás un mensaje de éxito con el total de registros cargados
3. Los datos estarán disponibles inmediatamente en la pestaña **"Asistencia"**

---

## 🔍 Validaciones del Sistema

### Validaciones Automáticas

El sistema verifica:

1. ✅ **Formato de fecha:** Debe ser YYYY-MM-DD válido
2. ✅ **Estudiante existe:** El `studentUsername` debe existir en el sistema
3. ✅ **Curso y sección válidos:** Deben coincidir con los del estudiante
4. ✅ **Estado válido:** Solo acepta: `present`, `late`, `absent`, `excused`
5. ✅ **RUT coincide:** El RUT debe corresponder al username
6. ✅ **Sin duplicados:** No permite registros duplicados de la misma fecha/estudiante

### Manejo de Errores

- **Registros inválidos:** Se omiten y se registran en los logs
- **Duplicados:** Se actualizan con los nuevos valores
- **Estudiantes no encontrados:** Se registra error pero continúa con los demás

---

## 📚 Estructura en Firebase

### Colección: `courses/{courseId}/attendance`

Cada registro de asistencia se guarda en:
```
courses/
  └── {courseId}/
      └── attendance/
          └── {attendanceId}
              ├── date: "2025-03-03"
              ├── courseId: "1ro-basico"
              ├── sectionId: "A"
              ├── studentId: "s.gonzalez0000"
              ├── status: "present"
              ├── present: true
              ├── comment: ""
              ├── year: 2025
              ├── createdAt: timestamp
              └── updatedAt: timestamp
```

### Índices Recomendados

Para optimizar consultas:
```
- Índice compuesto: (year, date)
- Índice compuesto: (studentId, year)
- Índice compuesto: (courseId, sectionId, year)
```

---

## ⚙️ Características Técnicas

### Procesamiento en Lotes
- **Tamaño de lote:** 200 registros
- **Procesamiento paralelo:** Múltiples cursos simultáneamente
- **Actualización en tiempo real:** Progress bar actualizado cada 5 segundos

### Sincronización
- **Firestore Listener:** Escucha cambios en tiempo real
- **LocalStorage Cache:** Almacena contadores para rendimiento
- **Actualización automática:** Los contadores se actualizan sin recargar

### Optimizaciones
- **Batch writes:** Agrupa múltiples operaciones
- **Error recovery:** Continúa aunque falle un lote
- **Deduplicación:** Evita registros duplicados

---

## 🧪 Pruebas Recomendadas

### 1. Carga Inicial
✅ Cargar el archivo completo (402 registros)
✅ Verificar que el contador muestre 402 registros
✅ Verificar que ambos estudiantes aparezcan en el sistema

### 2. Verificación en Pestaña Asistencia
✅ Ir a la pestaña "Asistencia"
✅ Seleccionar 1ro Básico A
✅ Ver que aparezcan los 2 estudiantes
✅ Seleccionar diferentes fechas (marzo, julio, diciembre)
✅ Verificar que los estados se muestren correctamente

### 3. Actualización de Registros
✅ Modificar algunos registros en el CSV
✅ Volver a cargar el archivo
✅ Verificar que los registros se actualizaron

### 4. Manejo de Errores
✅ Intentar cargar con un username inexistente
✅ Verificar que muestre error pero continúe con los válidos
✅ Verificar los logs de error

---

## 📌 Notas Importantes

### Días Hábiles
- El archivo solo incluye días **lunes a viernes**
- Se excluyen automáticamente sábados y domingos
- Se excluyen feriados nacionales de Chile 2025

### Semestres 2025
- **Primer Semestre:** Marzo a Junio (88 días aprox.)
- **Segundo Semestre:** Julio a Diciembre (113 días aprox.)
- **Total año:** 201 días hábiles por estudiante

### Feriados Excluidos
- 29 de marzo: Viernes Santo
- 1 de mayo: Día del Trabajo
- 21 de mayo: Glorias Navales
- 29 de junio: San Pedro y San Pablo
- 16 de julio: Virgen del Carmen
- 15 de agosto: Asunción
- 18-19 de septiembre: Fiestas Patrias
- 12 de octubre: Encuentro de Dos Mundos
- 31 de octubre: Iglesias Evangélicas
- 1 de noviembre: Todos los Santos
- 8 de diciembre: Inmaculada Concepción

---

## 🎯 Próximos Pasos

1. ✅ **Archivo generado:** `asistencia-2-estudiantes-1ro-basico-A-2025.csv`
2. ⏳ **Pendiente:** Cargar el archivo en el sistema
3. ⏳ **Pendiente:** Verificar en la pestaña Asistencia
4. ⏳ **Pendiente:** Replicar el proceso en la pestaña Asistencia

---

**Fecha de generación:** 25 de noviembre de 2025
**Script utilizado:** `generate-attendance-2-students.js`
