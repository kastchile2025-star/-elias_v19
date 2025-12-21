# Corrección: Descuento de Notificaciones de Comentarios

## Problema

Las notificaciones de comentarios de los profesores no se estaban descontando correctamente cuando un estudiante veía una tarea, ya sea:
1. Accediendo directamente a la tarea desde la página principal
2. Haciendo clic en "Ver Comentario" desde el panel de notificaciones

El estudiante veía el comentario pero la notificación permanecía como no leída en la campana.

## Solución Implementada

### 1. Mejora en `markCommentsAsReadForTask` (src/lib/notifications.ts)

Se ha mejorado la función `markCommentsAsReadForTask` para que además de marcar los comentarios como leídos, también marque como leídas las notificaciones asociadas de tipo `teacher_comment`:

```typescript
static markCommentsAsReadForTask(taskId: string, username: string): void {
  // Código existente para marcar comentarios como leídos...
  
  if (updated) {
    // Guardado de comentarios...
    
    // NUEVO: Marcar también las notificaciones relacionadas como leídas
    const notifications = this.getNotifications();
    let notificationsUpdated = false;
    
    const updatedNotifications = notifications.map(notification => {
      if (
        notification.taskId === taskId && 
        notification.type === 'teacher_comment' &&
        notification.targetUsernames.includes(username) &&
        !notification.readBy.includes(username)
      ) {
        notificationsUpdated = true;
        return {
          ...notification,
          readBy: [...notification.readBy, username],
          read: notification.targetUsernames.length === 1 ? true : notification.read
        };
      }
      return notification;
    });
    
    if (notificationsUpdated) {
      this.saveNotifications(updatedNotifications);
    }
  }
}
```

### 2. Marcado automático de notificaciones al abrir una tarea (src/app/dashboard/tareas/page.tsx)

Se ha modificado el `useEffect` que se ejecuta al abrir el diálogo de tarea para que marque automáticamente los comentarios y notificaciones asociadas como leídos:

```typescript
useEffect(() => {
  if (!showTaskDialog) {
    setHighlightedCommentId(null);
  } else {
    // Recargar comentarios...
    
    // NUEVO: Marcar comentarios como leídos si es estudiante
    if (user?.role === 'student' && selectedTask) {
      TaskNotificationManager.markCommentsAsReadForTask(selectedTask.id, user.username);
    }
  }
}, [showTaskDialog, selectedTask, user]);
```

## Resultado Esperado

1. Cuando un estudiante recibe un comentario del profesor en una tarea, aparece una notificación en la campana.

2. Ahora, si el estudiante:
   - Hace clic en "Ver Comentario" desde la notificación
   - O abre la tarea directamente desde la lista de tareas

3. La notificación de comentario se marcará automáticamente como leída y:
   - Ya no aparecerá como no leída en la campana
   - Se descontará del contador de notificaciones
   - Se reflejará tanto en la campana como en la tarjeta de tareas en la página de inicio

Este cambio completa la funcionalidad requerida para que las notificaciones de comentarios se comporten correctamente en toda la plataforma.
