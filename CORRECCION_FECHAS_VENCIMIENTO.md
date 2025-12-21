# Restricción de Fechas de Vencimiento para Tareas y Evaluaciones

## Descripción del Problema

En la vista de creación y edición de tareas y evaluaciones para el rol de profesor, se permitía seleccionar fechas pasadas como fecha límite o de caducidad, lo que no tiene sentido lógico ya que las tareas y evaluaciones deben tener fechas de vencimiento en el futuro.

## Solución Implementada

Se han realizado las siguientes modificaciones:

1. **Validación de fecha al guardar**:
   - Se añadió validación para verificar que la fecha límite sea posterior a la fecha actual al crear una nueva tarea o evaluación.
   - Se implementó la misma validación al editar tareas o evaluaciones existentes.
   - Se muestra un mensaje de error utilizando la traducción existente "dueDateMustBeFuture" si se intenta guardar con una fecha pasada.

2. **Restricción en el selector de fechas**:
   - Se agregó el atributo `min` a los inputs de tipo datetime-local para evitar la selección de fechas pasadas.
   - Se creó una función auxiliar `getMinDateTimeString()` que genera el formato ISO correcto para la fecha actual.

## Beneficios

1. Mejora la experiencia del usuario al prevenir la creación de tareas con fechas ilógicas.
2. Reduce errores de usuario al bloquear directamente las fechas pasadas en el selector.
3. Proporciona retroalimentación clara cuando se intenta guardar una tarea con fecha inválida.

## Archivos Modificados

- `src/app/dashboard/tareas/page.tsx`: Se modificaron las funciones `handleCreateTask` y `handleUpdateTask` para incluir la validación de fecha futura, y se añadió la función `getMinDateTimeString()` para establecer el valor mínimo en los inputs de fecha.

## Nota Técnica

La validación se realiza en dos niveles:
1. A nivel de UI con el atributo `min` del input para prevenir la selección de fechas pasadas.
2. A nivel de lógica de negocio verificando que la fecha sea posterior a la actual antes de guardar los cambios.

Este enfoque de doble validación asegura que incluso si hay manipulación del HTML o el usuario utiliza un navegador que no soporte el atributo `min`, la validación en el backend evitará que se guarden fechas inválidas.
