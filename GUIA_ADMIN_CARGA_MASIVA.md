# 👨‍💼 GUÍA PARA ADMINISTRADORES: Carga Masiva de Calificaciones

## 🎯 Objetivo

Esta guía explica paso a paso cómo cargar calificaciones de forma masiva y verificar que aparezcan correctamente en la pestaña de Calificaciones, respetando los criterios de filtrado.

---

## 📋 Antes de Comenzar

### **Requisitos Previos:**

✅ **1. Datos Maestros Configurados:**
- Cursos creados (ej: 1ro Básico, 2do Básico, ..., 8vo Básico)
- Secciones creadas (ej: A, B, C)
- Estudiantes registrados en el sistema
- Asignaturas configuradas

✅ **2. Estudiantes Asignados:**
- Cada estudiante debe estar asignado a un curso y sección
- Verificar en: **Admin > Gestión de Usuarios > Asignaciones**

✅ **3. Calendario Configurado:**
- Semestres definidos con fechas de inicio/fin
- Verificar en: **Admin > Configuración > Calendario Escolar**

---

## 📥 PASO 1: Preparar Archivo CSV

### **1.1 Descargar Plantilla**

1. Ve a **Admin > Configuración**
2. Busca la sección **"Carga masiva: Calificaciones (SQL)"**
3. Haz clic en el botón **"📄 Descargar Plantilla"** (color ámbar/amarillo)
4. Se descargará: `calificaciones_template.csv`

### **1.2 Llenar la Plantilla**

Abre el archivo CSV en Excel, Google Sheets o cualquier editor de texto.

**Formato del CSV:**

```csv
nombre,rut,curso,seccion,asignatura,fecha,tipo,nota,profesor
Juan Pérez,12345678-9,1ro Básico,A,Matemáticas,2025-10-01,tarea,85,María González
María López,98765432-1,1ro Básico,A,Lenguaje,2025-10-02,prueba,92,Pedro Ramírez
Carlos Díaz,11223344-5,3ro Básico,B,Ciencias,2025-10-03,evaluacion,78,Ana Torres
```

**Campos:**

| Campo | Obligatorio | Formato | Ejemplo | Notas |
|-------|-------------|---------|---------|-------|
| **nombre** | Sí* | Texto | "Juan Pérez" | Nombre completo del estudiante |
| **rut** | Sí* | 12345678-9 | "12345678-9" | RUT con formato chileno |
| **curso** | Sí | Texto | "1ro Básico" | Debe existir en el sistema |
| **seccion** | Sí | A, B, C | "A" | Debe existir para ese curso |
| **asignatura** | Sí | Texto | "Matemáticas" | Se crea automáticamente si no existe |
| **fecha** | Sí | YYYY-MM-DD | "2025-10-01" | Fecha de la calificación |
| **tipo** | Sí | tarea/prueba/evaluacion | "tarea" | Tipo de evaluación |
| **nota** | Sí | 0-100 o 1-7 | 85 o 6.5 | Se convierte automáticamente |
| **profesor** | No | Texto | "María González" | Nombre del profesor (opcional) |

*Nota: Puedes usar solo `nombre` O solo `rut` para identificar al estudiante, pero al menos uno debe estar presente.

### **1.3 Validar Datos**

Antes de subir, verifica:

- ✅ Todos los estudiantes existen en el sistema
- ✅ Todos los cursos existen en el sistema
- ✅ Todas las secciones existen para esos cursos
- ✅ Las fechas están en formato correcto
- ✅ Los tipos son: tarea, prueba o evaluacion
- ✅ Las notas están en el rango correcto (0-100 o 1-7)

---

## 📤 PASO 2: Cargar el Archivo

### **2.1 Ir al Módulo Admin**

1. Haz clic en el botón **"👤 Administrador"** (esquina superior derecha)
2. Selecciona la pestaña **"Configuración"**
3. Desplázate hasta la sección **"Carga masiva: Calificaciones (SQL)"**

### **2.2 Verificar Estado del Sistema**

Antes de cargar, verifica los indicadores:

- **Badge SQL:** Debe mostrar "✅ SQL" (verde)
- **Contador de año:** "2025: X registros" (muestra registros existentes)
- **Contador total:** "Total: Y registros"

### **2.3 Subir el Archivo**

1. Haz clic en el botón **"📤 Subir a SQL"** (color verde)
2. Selecciona tu archivo CSV
3. **No cierres la ventana durante el proceso**

### **2.4 Observar el Progreso**

Un modal aparecerá mostrando:

```
📊 Carga Masiva: Calificaciones → Firebase/SQL

Procesando calificaciones
━━━━━━━━━━━━━━━━ 100%         247/247 ✓ 0 ✗

Registro de Actividad    13 eventos

✅ Resultados API: 247 procesadas
🫧 Actividades generadas: 33
❌ Errores: 0

Procesadas 247/247 calificaciones. Generando actividades...
📦 Procesamiento en servidor finalizado
🔄 Actualizando estadísticas locales...
```

**Indicadores:**
- **Barra de progreso:** Muestra el avance del procesamiento
- **Resultados API:** Cuántas calificaciones se procesaron exitosamente
- **Actividades generadas:** Cuántas tareas/evaluaciones únicas se crearon
- **Errores:** Si hubo filas con problemas

### **2.5 Revisar Consola (Opcional)**

Abre la consola del navegador (F12) para ver logs detallados:

```
✅ Admin SDK listo - usando endpoint bulk-upload-grades
📊 Procesadas 247/247 filas (100.0%)
✅ Todas las 247 filas procesadas
🔔 Emitiendo eventos de actualización...
✅ Evento sqlGradesUpdated emitido para 247 calificaciones
✅ TODOS los eventos de actualización emitidos correctamente
```

### **2.6 Confirmar Éxito**

El modal mostrará:
- ✅ "Completado" o "Carga completada"
- ✅ Toast con resumen: "Importadas X calificaciones y Y actividades a Firebase"
- ✅ Contador actualizado: "2025: 247 registros" (o el nuevo total)

El modal se cierra automáticamente después de 1.5 segundos.

---

## 📊 PASO 3: Verificar en Pestaña Calificaciones

### **3.1 Navegar a Calificaciones**

1. Haz clic en **"Calificaciones"** en el menú superior
2. La página debería mostrar los datos **AUTOMÁTICAMENTE** (sin necesidad de refrescar)

### **3.2 Verificar Indicadores Visuales**

#### **Badges en la Parte Superior:**

La UI debe mostrar badges con números actualizados:

```
📅 Año: 2025  [←] [2025 ▼] [→]    🗄️ SQL ✓

Niveles:  [Básica] [Media]

Cursos:   [1ro Básico (90)] [2do Básico (90)] [3ro Básico (80)] ...

Secciones: [A (45)] [B (45)]

Asignaturas: [Ciencias Naturales] [Historia] [Lenguaje] [Matemáticas]

Estudiantes: [Agustín Soto Vega] [Alberto Soto Figueroa] ...

Semestre: [1er Semestre] [2do Semestre]
```

**Lo que significa:**
- Los números entre paréntesis indican **cuántas calificaciones hay** para ese filtro
- Si todos muestran **0** o no hay números, hay un problema

#### **Tabla de Calificaciones:**

Debajo de los filtros debe aparecer una tabla con:

```
Curso/Sección | Estudiante        | Asignatura      | N1 | N2 | N3 | ... | Promedio
─────────────────────────────────────────────────────────────────────────────────
3ro Básico B  | Agustín Soto Vega | Ciencias Nat... | 85 | 92 | —  | ... | 88.5
3ro Básico B  | Alberto Soto F.   | Ciencias Nat... | 78 | 83 | —  | ... | 80.5
...
```

### **3.3 Probar Filtros**

#### **Filtro por Semestre:**

1. Haz clic en **"1er Semestre"**
2. La tabla debe mostrar solo calificaciones del primer semestre
3. Los números en badges deben actualizarse
4. Haz clic en **"2do Semestre"**
5. La tabla debe cambiar para mostrar solo segundo semestre

#### **Filtro por Nivel:**

1. Haz clic en **"Básica"**
2. Deben aparecer solo cursos de básica (1ro-8vo Básico)
3. Haz clic en **"Media"**
4. Deben aparecer solo cursos de media (1ro-4to Medio)

#### **Filtro por Curso:**

1. Selecciona un curso específico (ej: "3ro Básico")
2. La tabla debe filtrar solo estudiantes de ese curso
3. Los badges de secciones deben actualizarse

#### **Filtro por Sección:**

1. Selecciona una sección (ej: "B")
2. La tabla debe mostrar solo estudiantes de esa sección

#### **Filtro por Asignatura:**

1. Selecciona una asignatura (ej: "Matemáticas")
2. Las columnas de la tabla deben mostrar solo calificaciones de esa asignatura

---

## 🔍 PASO 4: Diagnóstico de Problemas

### **Si las calificaciones NO aparecen:**

#### **Opción 1: Verificación Visual Rápida**

1. Revisa los badges:
   - ¿Muestran números?
   - ¿Están todos en 0?
2. Revisa la tabla:
   - ¿Hay filas?
   - ¿Dice "Sin estudiantes"?
3. Revisa los filtros:
   - ¿Está seleccionado un nivel?
   - ¿Está seleccionado un semestre?

#### **Opción 2: Script de Diagnóstico**

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Copia y pega el contenido de: `verificar-sincronizacion-calificaciones.js`
4. Presiona Enter
5. Lee el diagnóstico completo

El script te dirá exactamente:
- ✅ Cuántas calificaciones hay en caché
- ✅ Si estás en la pestaña correcta
- ✅ Cuántas filas hay en la tabla
- ✅ Si hay problemas de filtros
- ✅ Cómo solucionarlo

#### **Opción 3: Forzar Recarga Manual**

Si el diagnóstico indica que hay datos pero no se muestran:

```javascript
// Copiar y pegar en consola (F12)
const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
  detail: { year, timestamp: Date.now() } 
}));
console.log('✅ Recarga forzada. Verifica la tabla.');
```

Espera 2 segundos y verifica la tabla.

---

## 🎓 Criterios de Visualización Según Rol

### **Como Administrador (tú):**

- ✅ Ves **TODAS** las calificaciones del sistema
- ✅ Sin restricciones de curso, sección o asignatura
- ✅ Puedes filtrar por cualquier combinación
- ✅ Puedes ver calificaciones de cualquier año

**Ejemplo de vista:**
```
Niveles: [Básica] [Media]  ← Ambos disponibles
Cursos: [1ro Básico] ... [8vo Básico] [1ro Medio] ... [4to Medio]  ← Todos
Secciones: [A] [B] [C]  ← Todas
Asignaturas: [Todas]  ← Todas
Estudiantes: [Todos]  ← Todos
```

### **Si te logueas como Profesor:**

- ✅ Verás solo calificaciones de **tus secciones asignadas**
- ✅ Verás solo **tus asignaturas** en esas secciones
- ✅ Los filtros se aplicarán automáticamente

**Ejemplo de vista (Profesor de 8vo Básico B - Matemáticas):**
```
Niveles: [Básica]  ← Bloqueado en Básica
Cursos: [8vo Básico]  ← Solo tu curso
Secciones: [B]  ← Solo tu sección
Asignaturas: [Matemáticas]  ← Solo tu asignatura
Estudiantes: [Lista de estudiantes de 8vo B]
```

### **Si te logueas como Estudiante:**

- ✅ Verá solo **sus propias calificaciones**
- ✅ Auto-selección de su curso y sección
- ✅ Filtros bloqueados (no puede cambiar curso/sección)

**Ejemplo de vista (Estudiante Luis Torres de 8vo Básico B):**
```
Niveles: [Básica]  ← Bloqueado
Cursos: [8vo Básico]  ← Bloqueado
Secciones: [B]  ← Bloqueado
Asignaturas: [Todas]  ← Puede filtrar
Estudiantes: [Luis Torres]  ← Solo él
```

---

## 📋 Checklist Final

Después de cargar calificaciones masivamente, verifica:

### **En Admin > Configuración:**
- [ ] El contador muestra el nuevo total de registros
- [ ] El badge muestra "✅ SQL"
- [ ] No hay mensajes de error

### **En Pestaña Calificaciones:**
- [ ] Los badges muestran números (no todos en 0)
- [ ] La tabla muestra filas con calificaciones
- [ ] Los filtros funcionan correctamente
- [ ] Puedes cambiar de semestre
- [ ] Puedes cambiar de curso/sección
- [ ] Los promedios se calculan correctamente

### **Pruebas de Rol:**
- [ ] Como admin, ves todas las calificaciones
- [ ] Como profesor, ves solo tus asignaciones
- [ ] Como estudiante, ves solo tus calificaciones

---

## 🆘 Soporte

Si después de seguir esta guía las calificaciones no aparecen:

1. **Ejecuta el script de diagnóstico** (verificar-sincronizacion-calificaciones.js)
2. **Lee la documentación técnica** (SINCRONIZACION_CARGA_MASIVA_CALIFICACIONES.md)
3. **Revisa los logs de consola** (F12 > Console)
4. **Verifica asignaciones** (Admin > Gestión de Usuarios > Asignaciones)
5. **Contacta a soporte técnico** con:
   - Salida del script de diagnóstico
   - Capturas de pantalla
   - Logs de consola

---

**Fecha:** $(date)  
**Versión:** Smart Student v16  
**Destinatario:** Administradores del Sistema
