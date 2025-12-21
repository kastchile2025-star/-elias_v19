# Corrección Conteo Duplicado de Notificaciones - Profesor

## Problema
El profesor veía un conteo incorrecto en el badge de notificaciones:
- **Panel de notificaciones**: Mostraba "Tareas Pendientes (1)" 
- **Badge**: Mostraba "2" en lugar de "1"

## Causa del Problema
Había duplicación en el conteo para profesores porque se estaban sumando:

```typescript
// ANTES - Conteo duplicado:
pendingTasksCount + pendingTaskSubmissionsCount + unreadStudentCommentsCount + taskNotificationsCount
```

Donde:
- `pendingTasksCount`: Contaba tareas con `status === 'pending'` (desde `loadPendingTeacherTasks`)
- `taskNotificationsCount`: Contaba notificaciones de tipo `pending_grading` del sistema (desde `TaskNotificationManager`)

**Ambos contadores estaban contando las mismas tareas pendientes** → Duplicación

## Solución Implementada

### Cambio en el Dashboard (`/src/app/dashboard/page.tsx`)

**Línea ~601 - Badge de notificaciones:**
```typescript
// DESPUÉS - Sin duplicación:
const totalCount = user.role === 'teacher'
  ? pendingTaskSubmissionsCount + unreadStudentCommentsCount + taskNotificationsCount
  : pendingTasksCount + unreadCommentsCount + taskNotificationsCount;
```

**Línea ~624 - Badge de la tarjeta de tareas:**
```typescript
// DESPUÉS - Sin duplicación:
const totalTaskCount = user?.role === 'teacher'
  ? pendingTaskSubmissionsCount + unreadStudentCommentsCount + taskNotificationsCount
  : pendingTasksCount + unreadCommentsCount + taskNotificationsCount;
```

### Explicación del Conteo Correcto

**Para Profesores:**
- `pendingTaskSubmissionsCount`: Entregas de estudiantes pendientes de calificar
- `unreadStudentCommentsCount`: Comentarios de estudiantes no leídos
- `taskNotificationsCount`: Notificaciones del sistema (incluye tareas pendientes)

**Para Estudiantes:**
- `pendingTasksCount`: Tareas asignadas pendientes de completar
- `unreadCommentsCount`: Comentarios del profesor no leídos
- `taskNotificationsCount`: Notificaciones de calificaciones recibidas

## Resultado
- ✅ **Conteo correcto**: 1 tarea pendiente = badge "1"
- ✅ **Sin duplicación**: Las tareas pendientes se cuentan solo una vez (en `taskNotificationsCount`)
- ✅ **Lógica mantenida**: Cada tipo de notificación se cuenta apropiadamente

## Archivos Modificados
- `/src/app/dashboard/page.tsx` - Líneas 601 y 624

## Fecha de Corrección
9 de julio de 2025
