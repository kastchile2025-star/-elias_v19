# Corrección de Color del Botón en Formularios de Evaluación

## Descripción del Problema

En la vista de creación y edición de tareas, cuando se seleccionaba el tipo "Evaluación", el botón de acción (crear/actualizar) mantenía el color naranja correspondiente a las tareas, en lugar de cambiar al color morado que identifica a las evaluaciones. Esto generaba inconsistencia visual en la interfaz.

## Solución Implementada

Se han realizado las siguientes modificaciones:

1. **Cambio Dinámico de Color del Botón**:
   - Se modificó el botón de creación para que utilice colores morados (`bg-purple-600 hover:bg-purple-700`) cuando el tipo seleccionado es "evaluacion".
   - Se mantiene el color naranja original (`bg-orange-500 hover:bg-orange-600`) cuando el tipo es "tarea".
   - El mismo comportamiento se implementó para el botón de actualización en el diálogo de edición.

2. **Uso de Traducciones Correctas**:
   - Se reemplazó el texto hardcodeado "Crear Evaluación" por la traducción dinámica `translate('createEvaluation')`.
   - Se agregó una nueva clave de traducción `updateEvaluation` en ambos archivos de idioma (español e inglés).
   - El botón de actualización ahora muestra "Actualizar Evaluación" o "Update Evaluation" según el idioma cuando se trata de una evaluación.

## Beneficios

1. **Consistencia Visual**: El color del botón ahora coincide con el esquema de colores de la aplicación (naranja para tareas, morado para evaluaciones).
2. **Mejor Experiencia de Usuario**: Proporciona retroalimentación visual sobre el tipo de elemento que se está creando o editando.
3. **Localización Completa**: Todas las cadenas de texto son traducibles y se manejan a través del sistema de traducciones.

## Archivos Modificados

1. `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx` - Se modificaron los botones para que cambien de color dinámicamente.
2. `/workspaces/SMART_STUDENT_HTML/src/locales/es.json` - Se agregó la clave "updateEvaluation".
3. `/workspaces/SMART_STUDENT_HTML/src/locales/en.json` - Se agregó la clave "updateEvaluation".

## Nota Técnica

Se utilizaron plantillas de cadena (template strings) con operadores ternarios para definir dinámicamente las clases CSS de los botones según el tipo de tarea seleccionado:

```javascript
className={`${formData.taskType === 'evaluacion' 
  ? 'bg-purple-600 hover:bg-purple-700' 
  : 'bg-orange-500 hover:bg-orange-600'} text-white`}
```

Esta implementación garantiza que el color del botón siempre corresponda al tipo de elemento que se está manejando.
