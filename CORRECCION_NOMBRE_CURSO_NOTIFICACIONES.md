# Corrección Nombre Curso en Notificaciones de Estudiantes

## Problema
En el panel de notificaciones para estudiantes, en la sección "Comentarios No Leídos", se mostraba el código del curso en lugar del nombre completo del curso.

**Ejemplo del problema:**
```
[Tarea: tarea ciencias (4to_basico)]
```

**Debería mostrar:**
```
[Tarea: tarea ciencias (4to Básico)]
```

## Solución Implementada

### Archivo Modificado
- `/src/components/common/notifications-panel.tsx`

### Cambio Realizado
**Antes:**
```tsx
[Tarea: {comment.task?.title || 'Sin título'} ({comment.task?.course || 'Sin curso'})]
```

**Después:**
```tsx
[Tarea: {comment.task?.title || 'Sin título'} ({comment.task?.course ? TaskNotificationManager.getCourseNameById(comment.task.course) : 'Sin curso'})]
```

### Función Utilizada
Se utilizó la función existente `TaskNotificationManager.getCourseNameById()` que:
- Convierte códigos de curso (ej: "4to_basico") a nombres completos (ej: "4to Básico")
- Ya está implementada y en uso en otras partes del sistema
- Maneja correctamente todos los cursos disponibles

## Resultado
✅ **Corrección exitosa**: Ahora las notificaciones muestran el nombre completo del curso en lugar del código.

**Ejemplo del resultado:**
```
[Tarea: tarea ciencias (4to Básico)]
[12/07/25, 16:23]
```

## Ubicación del Cambio
- **Línea**: ~1396 en notifications-panel.tsx
- **Sección**: Comentarios No Leídos para estudiantes
- **Contexto**: Formato de información de tarea

## Fecha de Implementación
12 de julio de 2025

## Estado
✅ **COMPLETADO** - La corrección está aplicada y funcionando correctamente.
