# Corrección de Conteo Duplicado en Notificaciones de Profesor

## Problema Identificado
En el dashboard del profesor se estaba haciendo un **conteo duplicado** de notificaciones por entregas de estudiantes:

**Antes (INCORRECTO)**:
- `pendingTaskSubmissionsCount`: Contaba entregas pendientes de calificación
- `taskNotificationsCount`: Incluía notificaciones `task_submission` (mismas entregas)
- **Resultado**: La misma entrega se contaba 2 veces

**Escenario Real**:
- 1 estudiante entrega 1 tarea → **3 notificaciones mostradas**
  - 1 por `pendingTaskSubmissionsCount` (entrega de Felipe)
  - 1 por `taskNotificationsCount` (notificación `task_submission` de Felipe) ← **DUPLICADO**
  - 1 por alguna otra notificación del sistema

**Después (CORRECTO)**:
- `pendingTaskSubmissionsCount`: Cuenta entregas pendientes
- `taskNotificationsCount`: **EXCLUYE** notificaciones `task_submission` para profesores
- **Resultado**: Cada entrega se cuenta solo 1 vez

## Análisis del Problema

### Doble Conteo de Entregas

**Dashboard**:
```typescript
// Ambos contadores incluían la misma información
pendingTaskSubmissionsCount = 1  // Entrega de Felipe
taskNotificationsCount = 1       // Notificación task_submission de Felipe (DUPLICADO)
```

**TaskNotificationManager**:
```typescript
// Cuando un estudiante entregaba, se creaban:
// 1. Una entrada en task-comments (contada en pendingTaskSubmissionsCount)
// 2. Una notificación task_submission (contada en taskNotificationsCount)
```

### Raíz del Problema
- `createTaskSubmissionNotification()` crea notificaciones de tipo `task_submission`
- `pendingTaskSubmissionsCount` cuenta entregas desde `task-comments`
- Ambos representan **el mismo evento** (entrega de estudiante)

## Solución Implementada

### 1. Exclusión en TaskNotificationManager
```typescript
// ANTES (INCORRECTO)
static getUnreadCountForUser(username: string, userRole: 'student' | 'teacher'): number {
  return this.getUnreadNotificationsForUser(username, userRole).length;
}

// DESPUÉS (CORRECTO)  
static getUnreadCountForUser(username: string, userRole: 'student' | 'teacher'): number {
  const unreadNotifications = this.getUnreadNotificationsForUser(username, userRole);
  
  // Para profesores, excluir notificaciones de tipo 'task_submission' 
  // ya que estas se cuentan por separado en pendingTaskSubmissionsCount
  if (userRole === 'teacher') {
    return unreadNotifications.filter(n => n.type !== 'task_submission').length;
  }
  
  return unreadNotifications.length;
}
```

### 2. Contadores Dashboard (ya corregidos previamente)
```typescript
// Para profesores: SOLO entregas pendientes + notificaciones (SIN duplicados de task_submission)
const totalCount = user.role === 'teacher'
  ? pendingTaskSubmissionsCount + taskNotificationsCount
```

### 3. Tipos de Notificaciones para Profesores
**Ahora se cuentan por separado**:
- `pendingTaskSubmissionsCount`: Entregas que necesitan calificación
- `taskNotificationsCount`: Solo notificaciones que NO sean `task_submission`:
  - `grade_received`
  - `teacher_comment` 
  - `task_completed`
  - `pending_grading`
  - etc.

## Resultado Esperado

**Escenario**: 1 estudiante entrega, otros estudiantes aún no han entregado

**Antes**: 3 notificaciones
- 1 por entrega de Felipe (`pendingTaskSubmissionsCount`)
- 1 por notificación `task_submission` de Felipe (`taskNotificationsCount`) ← **DUPLICADO**
- 1 por otra notificación del sistema

**Después**: 1-2 notificaciones máximo
- 1 por entrega de Felipe que necesita calificación
- +1 solo si hay otras notificaciones reales (no relacionadas con entregas)

## Archivos Modificados
- `/src/lib/notifications.ts`
  - Función `getUnreadCountForUser()` - Excluye `task_submission` para profesores
- `/src/app/dashboard/page.tsx` (corregido previamente)
  - Contadores principales y burbuja de tarjeta

## Fecha de Implementación
26/06/2025

## Estado
✅ **Completado** - El conteo duplicado de entregas ha sido eliminado
✅ **Verificado** - Las notificaciones `task_submission` ya no se cuentan dos veces para profesores
