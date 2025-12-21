# 📊 Instrucciones: Carga Masiva de Calificaciones (300k)

## ⚠️ Importante: Usa CLI en lugar de la Pestaña de Configuración

Para cargas masivas grandes (300k registros), **NO uses** la pestaña de Configuración del admin. En su lugar, usa el **script CLI** que es mucho más eficiente y confiable.

## 🚀 Método Recomendado: Script CLI

### 1. Preparar el CSV

Formato requerido (encabezados flexibles):
```csv
nombre,rut,curso,seccion,asignatura,profesor,fecha,tipo,nota
Juan Pérez,12345678-9,Matemáticas 1A,A,Álgebra,Prof. García,2025-01-15,evaluacion,6.5
María González,98765432-1,Historia 2B,B,Historia Universal,Prof. Rodríguez,2025-01-16,tarea,7.0
```

**Columnas aceptadas** (el script detecta automáticamente):
- `nombre` | `student` | `studentName`
- `rut` | `studentId`
- `curso` | `course` | `courseId`
- `seccion` | `section` | `sectionId` (opcional)
- `asignatura` | `subject` | `subjectId` (opcional)
- `profesor` | `teacher` | `teacherName` (opcional)
- `fecha` | `gradedAt` | `date` (formato: YYYY-MM-DD o DD/MM/YYYY)
- `tipo` | `type` (evaluacion/tarea/prueba)
- `nota` | `score` (número 1.0-7.0, acepta punto o coma)

### 2. Cargar Variables de Entorno

```bash
export $(grep -v '^#' .env.firebase | xargs)
```

### 3. Verificar Conexión (Opcional)

```bash
npm run firebase:check
```

Debe mostrar:
```
Firebase Admin conectado ✅
projectId: superjf1234-e9cbc
service account: firebase-adminsdk-fbsvc@...
Colecciones raíz detectadas: [ 'courses' ]
```

### 4. Prueba en Seco (Recomendado)

```bash
npm run import:grades -- --file=./ruta/a/tu-archivo.csv --year=2025 --dry
```

Esto **NO escribe** en Firestore, solo valida el CSV.

### 5. Importación Real

```bash
npm run import:grades -- --file=./ruta/a/tu-archivo.csv --year=2025
```

**Progreso**: Se muestra cada 5,000 registros.  
**Duración estimada**: 300k registros ≈ 10-15 minutos.

## 📈 Monitoreo Durante la Carga

### Ver Progreso en Terminal
```
🚀 Iniciando importación a Firestore
Encabezados: nombre, rut, curso, ...
⏳ Encolados: 5000 (procesados: 5000)
⏳ Encolados: 10000 (procesados: 10000)
...
✅ Importación finalizada
{ processed: 300000, enqueued: 300000, ok: 300000, bad: 0 }
```

### Ver en Firebase Console
1. Ir a: https://console.firebase.google.com/project/superjf1234-e9cbc/firestore
2. Ver colección `courses/{courseId}/grades`
3. Monitorear uso: https://console.firebase.google.com/project/superjf1234-e9cbc/usage

## 🔧 Solución de Problemas

### Error: "Faltan credenciales"
```bash
# Verificar que la variable está cargada
echo $GOOGLE_APPLICATION_CREDENTIALS

# Si está vacío, re-cargar
export $(grep -v '^#' .env.firebase | xargs)
```

### Error: "Quota exceeded"
- Verifica que el plan Blaze esté activo
- Espera unos minutos y reintenta
- Divide el CSV en archivos más pequeños (100k cada uno)

### Importación Lenta
- Normal para 300k registros
- No cierres la terminal hasta que termine
- El BulkWriter maneja reintentos automáticamente

## 📊 Después de la Importación

### Verificar Datos con Admin SDK
```bash
npm run firebase:check -- --write
```

Debe mostrar la colección `courses` con datos.

### Verificar en Firebase Console
1. Firestore Database → Datos
2. Navegar a `courses/{courseId}/grades`
3. Ver documentos importados

### Ver en la App Web
1. Reiniciar servidor: `npm run dev`
2. Ir a: http://localhost:9002
3. Login como admin
4. Navegar a sección de calificaciones

## 🎯 Rendimiento Esperado

| Registros | Tiempo Estimado | Throughput |
|-----------|-----------------|------------|
| 1,000 | ~20 segundos | 50/seg |
| 10,000 | ~3 minutos | 55/seg |
| 100,000 | ~30 minutos | 55/seg |
| 300,000 | ~90 minutos | 55/seg |

*Con BulkWriter y throttling automático*

## ⚙️ Por qué NO usar la Pestaña de Configuración

1. **Timeout del navegador**: Las cargas grandes (>10k) pueden timeout
2. **Límites del SDK web**: Menos eficiente que Admin SDK
3. **Sin reintentos**: Si falla, pierdes progreso
4. **Bloquea la UI**: El navegador se congela durante la carga

El script CLI:
- ✅ Usa Admin SDK (sin límites de cuota web)
- ✅ BulkWriter con reintentos automáticos
- ✅ Streaming de CSV (no carga todo en memoria)
- ✅ Progreso en tiempo real
- ✅ No bloquea el navegador

---

**TL;DR**: Para 300k registros, usa el script CLI:

```bash
export $(grep -v '^#' .env.firebase | xargs)
npm run import:grades -- --file=./grades.csv --year=2025 --dry  # Prueba
npm run import:grades -- --file=./grades.csv --year=2025         # Real
```

¿Preguntas? Ver: `INICIO_AQUI.md` o `GUIA_CONFIGURACION_FIREBASE_BLAZE.md`
