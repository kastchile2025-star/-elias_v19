# Ajuste Formato Comentarios No Leídos - Módulo Estudiante

## Modificación Realizada
Se modificó el formato de la información en la sección "Comentarios No Leídos" para que coincida con el mismo formato que las notificaciones superiores, manteniendo consistencia visual en todo el panel.

### Ubicación
- **Módulo**: Estudiante
- **Sección**: Campana notificaciones → Comentarios No Leídos
- **Objetivo**: Unificar el formato visual con las notificaciones de tareas

## Cambio Implementado

### Archivo Modificado
- `/src/components/common/notifications-panel.tsx`

### Estructura Anterior
```tsx
┌─────────────────────────────────────────┐
│ 💬 jorge                        [CNT]   │
│    listo                               │
│    Tarea: tarea ciencias (4to Básico)  │
│    [12/07/25, 16:42]                  │
│    Ver Comentario                     │
└─────────────────────────────────────────┘
```

### Nueva Estructura (Formato Consistente)
```tsx
┌─────────────────────────────────────────┐
│ 💬 tarea ciencias          12/07/25, 16:42│
│    listo                               │
│    4to Básico • Ciencias Naturales    │
│    Ver Comentario                     │
└─────────────────────────────────────────┘
```

### Cambio de Código

**Antes:**
```tsx
<div className="flex-1">
  <div className="flex items-center justify-between mb-1">
    <p className="font-medium text-sm text-foreground">
      {comment.studentName}
    </p>
    <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300">
      {comment.task?.subject ? getCourseAbbreviation(comment.task.subject) : 'CNT'}
    </Badge>
  </div>
  <p className="text-sm text-muted-foreground mb-1">
    {comment.comment}
  </p>
  <p className="text-xs text-white mb-1">
    Tarea: {comment.task?.title || 'Sin título'} ({comment.task?.course ? TaskNotificationManager.getCourseNameById(comment.task.course) : 'Sin curso'})
  </p>
  <p className="text-xs text-muted-foreground mb-2">
    [{formatDate(comment.timestamp)}]
  </p>
  {createSafeCommentLink(comment.taskId, comment.id, translate('viewComment'))}
</div>
```

**Después:**
```tsx
<div className="flex-1">
  <div className="flex items-center justify-between">
    <p className="font-medium text-sm">
      {comment.task?.title || 'Sin título'}
    </p>
    <p className="text-xs text-muted-foreground">
      {formatDate(comment.timestamp)}
    </p>
  </div>
  <p className="text-sm text-muted-foreground mt-1">
    {comment.comment}
  </p>
  <p className="text-xs font-medium mt-1">
    {comment.task?.course ? TaskNotificationManager.getCourseNameById(comment.task.course) : 'Sin curso'} • {comment.task?.subject || 'Sin materia'}
  </p>
  {createSafeCommentLink(comment.taskId, comment.id, translate('viewComment'))}
</div>
```

## Cambios Específicos

### 1. Estructura del Encabezado
- **Antes**: Mostraba nombre del estudiante + badge de materia
- **Después**: Muestra título de la tarea + fecha (igual que notificaciones superiores)

### 2. Posición de la Fecha
- **Antes**: Fecha en línea separada con corchetes `[12/07/25, 16:42]`
- **Después**: Fecha en la esquina superior derecha (formato consistente)

### 3. Información del Curso
- **Antes**: Formato `Tarea: nombre (curso)` en texto blanco
- **Después**: Formato `Curso • Materia` en línea inferior (igual que notificaciones)

### 4. Eliminación de Elementos
- Removido el badge de materia del encabezado
- Removido el formato con corchetes para la fecha
- Removido el texto redundante "Tarea:"

## Beneficios del Cambio

✅ **Consistencia Visual**: Mismo formato que las notificaciones de tareas nuevas

✅ **Mejor Jerarquía**: Título de la tarea como elemento principal

✅ **Información Clara**: Curso y materia separados por bullet point

✅ **Fecha Accesible**: Fecha en posición estándar (esquina superior derecha)

✅ **Contenido Destacado**: El comentario del estudiante se mantiene visible

## Resultado Final

### Formato Unificado
Ahora tanto las notificaciones de tareas nuevas como los comentarios no leídos siguen la misma estructura:

```
┌─────────────────────────────────────────┐
│ 🔔 tarea 2                 12/07/25, 16:02│
│    Nueva tarea asignada por jorge      │
│    4to Básico • Ciencias Naturales    │
│    Ver Tarea                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💬 tarea ciencias          12/07/25, 16:42│
│    listo                               │
│    4to Básico • Ciencias Naturales    │
│    Ver Comentario                     │
└─────────────────────────────────────────┘
```

## Ubicación del Cambio
- **Archivo**: `/src/components/common/notifications-panel.tsx`
- **Líneas**: ~1359-1375 (sección Comentarios No Leídos para estudiantes)
- **Función**: Renderizado de comentarios no leídos con formato consistente

## Fecha de Implementación
12 de julio de 2025

## Estado
✅ **COMPLETADO** - El formato está unificado y funcionando correctamente.
