# Corrección: Notificaciones no se descuentan al ver comentarios

## Problema

En la vista de profesor, cuando se hace clic en el botón "Ver comentario", "Ver Tarea", "Revisar Evaluación" o "Ver Resultados" en el panel de notificaciones, aunque el enlace lleva correctamente a la tarea o evaluación correspondiente, no se estaba descontando el número de notificaciones en la campana ni en la burbuja en la tarjeta de tareas.

## Solución

Se ha modificado el comportamiento de los enlaces en el panel de notificaciones para que, además de navegar a la tarea o evaluación correspondiente, también marquen las notificaciones como leídas. Se añadió un manejador de evento `onClick` a cada enlace que llama a los métodos apropiados del `TaskNotificationManager`.

### Cambios realizados:

1. **Para "Ver Comentario"**:
```tsx
<Link 
  href={`/dashboard/tareas?taskId=${comment.taskId}&commentId=${comment.id}&highlight=true`}
  className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
  onClick={() => {
    if (user) {
      // Marcar el comentario como leído cuando se hace clic
      TaskNotificationManager.markCommentsAsReadForTask(comment.taskId, user.username);
    }
  }}
>
  {translate('viewComment') || 'Ver Comentario'}
</Link>
```

2. **Para "Revisar Evaluación"**, "Ver Tarea" y "Ver Resultados":
```tsx
<Link 
  href={`/dashboard/tareas?taskId=${notif.taskId}&highlight=true`}
  className="inline-block mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
  onClick={() => {
    if (user) {
      // Marcar la notificación como leída cuando se hace clic
      TaskNotificationManager.markAsReadByUser(notif.id, user.username);
    }
  }}
>
  {translate('reviewEvaluation') || 'Revisar Evaluación'}
</Link>
```

## Resultados

- Ahora, cuando un profesor hace clic en los botones para ver comentarios, tareas o evaluaciones en el panel de notificaciones, se marcan como leídas automáticamente.
- El contador de notificaciones en la campana y en las tarjetas de tareas se actualiza correctamente después de hacer clic.
- Se mejora la experiencia del usuario al no mostrar notificaciones como "no leídas" cuando el profesor ya las ha visto.

## Archivos modificados

- `/workspaces/SMART_STUDENT_HTML/src/components/common/notifications-panel.tsx` - Se modificaron los enlaces de navegación para marcar las notificaciones como leídas al hacer clic.
