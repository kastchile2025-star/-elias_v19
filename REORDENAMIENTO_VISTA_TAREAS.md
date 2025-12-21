# Cambio en el Orden de Elementos en la Vista Detallada de Tareas

## Descripción del Problema

En la vista detallada de tareas y evaluaciones para el rol de profesor, los elementos estaban organizados en un orden que no favorecía el flujo de trabajo óptimo. El orden anterior era:

1. Historial de comentarios y entregas
2. Panel de estudiantes (solo visible para profesores)
3. Sección para ingresar nuevos comentarios

Este orden no era ideal, ya que los profesores primero necesitan ver la información de los estudiantes para tener contexto antes de revisar los comentarios o agregar nuevos.

## Solución Implementada

Se ha reorganizado la estructura de la interfaz en la vista detallada de tareas/evaluaciones para seguir un orden más lógico y eficiente:

1. **Panel de estudiantes**: Ahora aparece primero, mostrando inmediatamente la lista de estudiantes asignados con su estado, calificación y opciones.
2. **Historial de comentarios**: Se muestra a continuación para revisar la comunicación previa relacionada con la tarea.
3. **Sección para agregar comentarios**: Se mantiene al final, permitiendo al profesor agregar comentarios con el contexto completo de la información anterior.

## Beneficios

1. **Flujo de trabajo mejorado**: El profesor puede primero ver el estado general de los estudiantes, luego revisar los comentarios existentes y finalmente hacer su aportación.

2. **Mejor experiencia de usuario**: La interfaz sigue ahora un flujo lógico que va desde la información general hacia las acciones específicas.

3. **Contexto completo antes de comentar**: El profesor dispone de toda la información necesaria (estado de estudiantes y comunicaciones previas) antes de escribir su comentario.

## Archivos Modificados

- `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx`: Se reordenaron los componentes en el diálogo de detalle de tareas.

## Nota Técnica

Se mantuvieron intactas todas las funcionalidades existentes, incluyendo:
- El comportamiento diferenciado según el tipo de tarea (normal o evaluación)
- Los permisos según el rol del usuario
- Las traducciones y mensajes informativos
- Las funcionalidades de calificación y gestión de entregas

Solo se modificó el orden visual de los componentes para mejorar la experiencia del usuario.
