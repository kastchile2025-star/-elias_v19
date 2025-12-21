# 📊 Instrucciones: Carga Masiva de Calificaciones

## ⚠️ ERROR COMÚN: "Faltan campos requeridos: role, name"

Este error ocurre cuando **usas el botón equivocado** para subir las calificaciones.

---

## ✅ SOLUCIÓN: Usa la Sección Correcta

### 🎯 Ubicación Correcta en la Interfaz:

```
Módulo Admin → Configuración → Carga Masiva
```

### 📍 Sección a Usar:

Busca la tarjeta que dice:

```
🗄️ Carga masiva: Calificaciones (SQL)
```

**NO uses:**
- ❌ "Bulk upload by Excel" (esta es para usuarios)
- ❌ "Carga masiva por Excel" (esta es para usuarios)

---

## 📋 Pasos Correctos:

### 1️⃣ Descargar Plantilla CSV
En la sección **"Carga masiva: Calificaciones (SQL)"**:
- Haz clic en el botón **"Plantilla CSV"** (color ámbar/amarillo)
- Se descargará un archivo llamado `calificaciones_template.csv`

### 2️⃣ Preparar tu Archivo CSV
Tu archivo debe tener estas columnas **exactamente**:

```csv
nombre,rut,curso,seccion,asignatura,tipo,fecha,nota
Juan Pérez,12345678-9,1ro Básico,A,Matemáticas,tarea,2025-03-15,85
```

#### Campos Requeridos:
- **nombre**: Nombre completo del estudiante
- **rut**: RUT chileno con formato XX.XXX.XXX-X o sin puntos
- **curso**: Curso completo (ej: "1ro Básico", "2do Medio")
- **seccion**: Letra de la sección (A, B, C, etc.)
- **asignatura**: Nombre completo de la asignatura
  - Matemáticas
  - Lenguaje y Comunicación
  - Ciencias Naturales
  - Historia; Geografía y Ciencias Sociales (con punto y coma)
- **tipo**: Tipo de actividad (solo estos 3 valores válidos)
  - `tarea`
  - `prueba`
  - `evaluacion`
- **fecha**: Formato YYYY-MM-DD (ej: 2025-03-15)
- **nota**: Número entre 0 y 100

### 3️⃣ Subir el Archivo
En la sección **"Carga masiva: Calificaciones (SQL)"**:
- Haz clic en el botón **"Subir a SQL"** (color verde)
- Selecciona tu archivo CSV
- Espera a que termine el proceso

---

## 🎨 Identificación Visual de las Secciones:

### ❌ INCORRECTO - Sección de Usuarios:
```
┌─────────────────────────────────────┐
│ 📤 Bulk upload by Excel             │  ← NO usar para calificaciones
│ Download the template, fill in      │
│ the users...                        │
│                                     │
│ [Download template] [Upload Excel]  │  ← Estos botones son azules
└─────────────────────────────────────┘
```

### ✅ CORRECTO - Sección de Calificaciones:
```
┌─────────────────────────────────────┐
│ 🗄️ Carga masiva: Calificaciones     │  ← Usar esta sección
│    (SQL) ✅ SQL                     │
│                                     │
│ Registra calificaciones directa-    │
│ mente en la base de datos SQL...    │
│                                     │
│ [Plantilla CSV]  [Subir a SQL]      │  ← Plantilla: ámbar, Subir: verde
└─────────────────────────────────────┘
```

---

## 📂 Archivos de Prueba Disponibles:

En tu proyecto tienes dos archivos CSV listos para probar:

### 1. Calificaciones con Datos Reales
```
/workspaces/superjf_v16/public/test-data/calificaciones_reales_200.csv
```
- ✅ 200 registros
- ✅ Estudiantes reales del archivo TOTAL.xlsx
- ✅ Tipos válidos: tarea, prueba, evaluacion
- ✅ Distribución: 40% tareas, 30% pruebas, 30% evaluaciones

### 2. Calificaciones con Datos de Ejemplo
```
/workspaces/superjf_v16/public/test-data/calificaciones_prueba_200.csv
```
- ✅ 200 registros
- ✅ Datos de ejemplo ficticios
- ✅ Tipos válidos: tarea, prueba, evaluacion

---

## 🔍 Verificación Post-Carga:

Después de subir las calificaciones:

1. **Verifica el contador** en la misma sección:
   ```
   Calificaciones en Base de Datos
   2025: XXX registros • Total: XXX registros
   ```

2. **Ve a la pestaña Calificaciones**:
   - Las calificaciones deben aparecer **instantáneamente** (<1 segundo)
   - Verás un indicador de sincronización en la esquina inferior derecha
   - Los datos se cargarán desde LocalStorage primero
   - Luego se sincronizarán con SQL en segundo plano

---

## 🐛 Solución de Problemas:

### Error: "Faltan campos requeridos: role, name"
**Causa**: Estás usando el botón de carga de usuarios en lugar del de calificaciones.
**Solución**: Usa el botón "Subir a SQL" (verde) en la sección "Carga masiva: Calificaciones (SQL)".

### Error: "El archivo debe ser de tipo CSV"
**Causa**: Intentas subir un archivo Excel (.xlsx) en lugar de CSV.
**Solución**: Guarda tu archivo como CSV (delimitado por comas).

### No aparecen las calificaciones después de subir
**Causa**: Puede ser que no haya conexión SQL o los datos no coincidan con estudiantes.
**Solución**:
1. Verifica que el contador de calificaciones aumentó
2. Revisa la consola del navegador (F12) para ver logs
3. Verifica que los RUTs de los estudiantes existan en el sistema

---

## 📞 Resumen Rápido:

1. ✅ **Ir a**: Admin → Configuración → Carga Masiva
2. ✅ **Buscar**: "Carga masiva: Calificaciones (SQL)" con badge "✅ SQL"
3. ✅ **Usar**: Botón verde "Subir a SQL"
4. ✅ **Archivo**: CSV con columnas: nombre, rut, curso, seccion, asignatura, tipo, fecha, nota
5. ✅ **Tipos válidos**: tarea, prueba, evaluacion
6. ✅ **Resultado**: Calificaciones visibles instantáneamente en pestaña Calificaciones

---

## 📊 Rendimiento Esperado:

- **Carga inicial**: <100ms (desde LocalStorage)
- **Sincronización SQL**: 2-5 segundos en segundo plano
- **200 registros**: ~3-5 segundos de procesamiento total
- **Indicador visual**: Aparece automáticamente durante la sincronización

---

**¡Listo! Ahora puedes cargar tus calificaciones sin errores.** 🎉
