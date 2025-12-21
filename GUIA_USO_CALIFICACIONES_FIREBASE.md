# 📘 GUÍA DE USO: Calificaciones con Firebase

## 🚀 Inicio Rápido

### Para Administradores

#### 1. Cargar Usuarios y Configuración Inicial
```
Dashboard → Admin → Configuración → Pestaña "Usuarios"
```
- Subir archivo: `users-consolidated-2025-CORREGIDO.csv`
- Verificar que se crearon estudiantes, profesores y administradores

#### 2. Cargar Calificaciones (Carga Masiva)
```
Dashboard → Admin → Configuración → Pestaña "Carga Masiva"
```
- Subir archivo: `calificaciones_ejemplo_carga_masiva_100.csv`
- Esperar confirmación: "✅ Carga completada"
- Las calificaciones se guardan directamente en Firebase

#### 3. Ver Calificaciones
```
Dashboard → Calificaciones
```
- **Indicador de conexión:** Busca badge `🔥 Firebase` en esquina superior derecha
- **Año:** Selector en la parte superior (navegación con flechas)
- **Filtros disponibles:**
  - Nivel: Básica / Media
  - Curso: 1ro Básico, 2do Básico, etc.
  - Sección: A, B, C, etc.
  - Asignatura: Matemáticas, Lenguaje, etc.
  - Semestre: 1er / 2do / Todos

## 🎯 Funciones Principales

### Filtrado por Sección (Consulta Optimizada)

Cuando seleccionas una **sección específica**:

```
Curso: 1ro Básico → Sección: A
```

El sistema automáticamente:
1. ✅ Ejecuta consulta optimizada a Firebase
2. ✅ Carga SOLO calificaciones de esa sección (no todo el año)
3. ✅ Muestra badge adicional: `⚡ Filtrado directo`
4. ✅ Mantiene badge `🔥 Firebase` visible

**Ventajas:**
- ⚡ Carga más rápida
- 📉 Menos datos transferidos (ahorro de costos Firebase)
- 🎯 Visualización precisa de la sección

### Visualización General

Cuando seleccionas **"Todas las secciones"**:

El sistema:
1. ✅ Carga todas las calificaciones del año
2. ✅ Permite filtrado rápido en memoria
3. ✅ Badge `⚡ Filtrado directo` desaparece (es normal)
4. ✅ Badge `🔥 Firebase` permanece visible

## 🔍 Indicadores Visuales

### Badge de Conexión (Siempre Visible)

| Badge | Significado |
|-------|-------------|
| `🔥 Firebase` | Conectado a Firebase - Datos en tiempo real |
| `🗄️ SQL` | Conectado a SQL - Datos en tiempo real |
| `💾 Local` | Modo offline - Datos desde cache local |

**⚠️ Importante:** Este badge NUNCA debe desaparecer si estás conectado a Firebase.

### Badge de Consulta Optimizada (Condicional)

| Badge | Cuándo aparece | Significado |
|-------|----------------|-------------|
| `⚡ Filtrado directo` | Al seleccionar sección específica | Solo se cargan datos de esa sección |

**💡 Tip:** Este badge tiene animación pulse para indicar consulta activa.

### Indicador de Progreso (Temporal)

Aparece en esquina inferior derecha durante la carga:

```
🔄 Sincronizando con BBDD
[██████████████░░░░] 70%
```

- Se muestra mientras carga datos
- Desaparece al completar (100%)
- No interfiere con el uso normal

## 📊 Tabla de Calificaciones

### Estructura de la Tabla

| Columna | Descripción |
|---------|-------------|
| Curso/Sección | Nombre del curso y sección (ej: "1ro Básico A") |
| Estudiante | Nombre completo del estudiante |
| N1, N2, N3... | Notas cronológicas (pruebas, tareas, evaluaciones) |
| N̄ (Promedio) | Promedio de todas las notas |

### Burbujas de Actividades

Las columnas N1, N2, N3... muestran burbujas de colores según el tipo:

| Color | Tipo de Actividad |
|-------|------------------|
| 🟡 Amarillo | Tarea |
| 🔵 Azul | Evaluación |
| 🟣 Morado | Prueba |

**Hover:** Pasa el mouse sobre una burbuja para ver detalles.

### Notas Calificadas

Las notas calificadas se muestran como números dentro de las burbujas:

| Nota | Color de Fondo | Significado |
|------|----------------|-------------|
| 70 | Verde | Aprobado |
| 50 | Amarillo | Justo |
| 30 | Rojo | Reprobado |

## 🎓 Para Profesores

### Ver Solo Mis Cursos

El sistema automáticamente filtra para mostrar solo:
- Secciones asignadas a ti
- Asignaturas que enseñas
- Estudiantes de tus cursos

**No necesitas configurar nada.** El filtrado es automático según tus asignaciones.

### Calificar Tareas/Evaluaciones

```
Dashboard → Tareas (o Evaluaciones)
```
1. Busca la tarea a calificar
2. Haz clic en "Calificar"
3. Ingresa las notas de los estudiantes
4. Guarda
5. Las notas aparecerán automáticamente en **Calificaciones**

## 👨‍🎓 Para Estudiantes

### Ver Mis Calificaciones

El sistema automáticamente:
- ✅ Muestra solo TU sección
- ✅ Muestra solo TUS notas
- ✅ Oculta notas de otros estudiantes

### Entender Mis Notas

```
N1, N2, N3... = Notas cronológicas (orden de fecha de creación)
N̄ = Tu promedio actual
```

**💡 Tip:** Haz clic en una nota para ver detalles de la tarea/evaluación.

## 🔧 Solución de Problemas

### Problema: Badge "Firebase" no aparece

**Causa posible:** Firebase no está habilitado

**Solución:**
1. Ve a `Admin → Configuración`
2. Busca opción "Usar SQL/Firebase"
3. Actívala si está desactivada
4. Recarga la página

### Problema: No veo calificaciones

**Verificar:**
1. ✅ ¿Se realizó la carga masiva? (Admin → Configuración → Carga Masiva)
2. ✅ ¿El año seleccionado es correcto? (verifica selector de año)
3. ✅ ¿Tienes permisos? (estudiantes solo ven sus notas)
4. ✅ ¿Hay filtros activos? (prueba "Todas las secciones")

### Problema: Calificaciones desactualizadas

**Solución:**
1. Presiona `F5` para recargar la página
2. Verifica que el badge `🔥 Firebase` esté visible
3. Cambia de filtro y vuelve (fuerza nueva consulta)

### Problema: Carga muy lenta

**Posibles causas:**
- Conexión a Internet lenta
- Muchos datos para el año seleccionado
- Sin consulta optimizada activa

**Solución:**
1. Selecciona una **sección específica** (activa consulta optimizada)
2. Verifica que aparezca badge `⚡ Filtrado directo`
3. Esto cargará solo datos de esa sección (más rápido)

## 📈 Mejores Prácticas

### Para Administradores

1. **Carga masiva al inicio del año**
   - Sube usuarios y calificaciones una vez
   - Firebase mantendrá sincronización automática

2. **Usa consultas optimizadas**
   - Filtra por sección específica cuando sea posible
   - Reduce costos de Firebase (menos lecturas)

3. **Revisa logs en consola**
   - Abre consola del navegador (F12)
   - Verifica mensajes de carga correcta

### Para Profesores

1. **Filtra por tus secciones**
   - Selecciona tu sección específica
   - Más rápido y focalizado

2. **Califica regularmente**
   - Las notas aparecen automáticamente en Calificaciones
   - No necesitas "sincronizar" nada

### Para Estudiantes

1. **Revisa regularmente**
   - Las notas se actualizan en tiempo real
   - Recarga la página para ver últimas notas

2. **Entiende tu progreso**
   - Mira el promedio (N̄) para saber tu situación general
   - Identifica áreas de mejora por asignatura

## 🆘 Soporte

Si encuentras un problema no listado aquí:

1. **Verifica la consola del navegador:**
   - Presiona `F12`
   - Ve a pestaña "Console"
   - Busca mensajes de error (en rojo)

2. **Ejecuta script de diagnóstico:**
   ```
   Archivo: test-consultas-optimizadas-calificaciones.js
   ```
   - Abre consola del navegador
   - Copia y pega el script
   - Sigue las instrucciones

3. **Revisa documentación técnica:**
   ```
   MEJORAS_CALIFICACIONES_FIREBASE_FILTROS.md
   ```

---

## 🎉 ¡Disfruta del sistema mejorado!

**Características destacadas:**
- ✅ Conexión Firebase siempre visible
- ✅ Consultas optimizadas automáticas
- ✅ Feedback visual claro
- ✅ Datos en tiempo real
- ✅ Rendimiento mejorado

**Versión:** superjf_v17  
**Fecha:** 4 de noviembre de 2025
