# Corrección de la Burbuja de Notificaciones

## Problema Identificado

La burbuja roja de notificaciones (contador) en el ícono de la campana desaparecía antes de tiempo. Específicamente:

1. **Comportamiento incorrecto**: La notificación de "Nueva tarea asignada" se marcaba como leída cuando el estudiante hacía clic en "Marcar todas como leídas" en el panel de notificaciones.

2. **Comportamiento esperado**: La notificación de "Nueva tarea asignada" solo debería marcarse como leída cuando el estudiante **entrega** la tarea, no al hacer clic en "Marcar todas como leídas".

## Causa del Problema

En el archivo `/src/components/common/notifications-panel.tsx`, la función que maneja "Marcar todas como leídas" estaba marcando **todas** las notificaciones de tareas como leídas, incluyendo las notificaciones de tipo `new_task`:

```typescript
// CÓDIGO PROBLEMÁTICO (ANTES)
if (
  notification.targetUsernames.includes(user.username) &&
  !notification.readBy.includes(user.username)
) {
  // Marcaba TODAS las notificaciones como leídas, incluyendo new_task
}
```

## Solución Implementada

Se modificó la lógica para excluir las notificaciones de tipo `new_task` cuando se hace clic en "Marcar todas como leídas":

```typescript
// CÓDIGO CORREGIDO (DESPUÉS)
if (
  notification.targetUsernames.includes(user.username) &&
  !notification.readBy.includes(user.username) &&
  notification.type !== 'new_task' // Excluir notificaciones de nueva tarea
) {
  // Solo marca como leídas las notificaciones que NO son new_task
}
```

## Comportamiento Actual

### Para Notificaciones de Nueva Tarea (`new_task`)
- ✅ **Se crean** cuando un profesor asigna una nueva tarea
- ✅ **Persisten** aunque el estudiante haga clic en "Marcar todas como leídas"
- ✅ **Solo se marcan como leídas** cuando el estudiante entrega la tarea (usando `markNewTaskNotificationAsReadOnSubmission`)

### Para Otras Notificaciones (calificaciones, comentarios, etc.)
- ✅ **Se marcan como leídas** normalmente con "Marcar todas como leídas"
- ✅ **Mantienen** su comportamiento original

## Archivos Modificados

1. **`/src/components/common/notifications-panel.tsx`**
   - Líneas 376-390: Agregada condición `notification.type !== 'new_task'` en la función de marcar todas como leídas

## Cálculo del Contador de la Burbuja

El contador rojo en el ícono de la campana se calcula en `/src/app/dashboard/page.tsx` como:

```typescript
// Para estudiantes
const totalCount = pendingTasksCount + unreadCommentsCount + taskNotificationsCount;
```

Donde:
- `taskNotificationsCount` = `TaskNotificationManager.getUnreadCountForUser(username, role)`
- Incluye las notificaciones de `new_task` no leídas hasta que se entregue la tarea

## Verificación del Fix

Se creó el archivo `/test-bubble-fix.html` para probar:

1. ✅ Estado inicial de notificaciones
2. ✅ Creación de tarea de prueba (genera notificación `new_task`)
3. ✅ Acción "Marcar todas como leídas" (NO debe afectar `new_task`)
4. ✅ Verificación de persistencia de la burbuja
5. ✅ Simulación de entrega de tarea (debe marcar `new_task` como leída)
6. ✅ Verificación de desaparición de la burbuja

## Resultado

- ✅ La burbuja roja permanece visible hasta que el estudiante entrega la tarea
- ✅ "Marcar todas como leídas" no afecta las notificaciones de nueva tarea
- ✅ Las demás notificaciones siguen funcionando normalmente
- ✅ El sistema mantiene la coherencia entre el panel y la burbuja de notificaciones

## Fecha de Implementación

26 de junio de 2025
