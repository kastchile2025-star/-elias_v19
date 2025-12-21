# Corrección: Color del Botón "Adjuntar archivo" en Evaluaciones

## Problema

Los botones para "Adjuntar archivo" estaban utilizando el estilo naranja tanto para tareas como para evaluaciones. Sin embargo, según los requisitos de diseño, estos botones deben usar un estilo morado cuando están en el contexto de una evaluación para mantener la consistencia visual con otros elementos relacionados con evaluaciones.

## Solución

Se modificó la lógica para que los botones "Adjuntar archivo" cambien dinámicamente de color según el contexto:

1. Naranja para tareas (sin cambios)
2. Morado para evaluaciones (nuevo)

### Cambios realizados:

Los dos botones "Adjuntar archivo" ahora implementan una lógica condicional para determinar qué estilo de color aplicar:

1. En el formulario principal de creación/edición:
```tsx
<Button
  type="button"
  onClick={() => document.getElementById('task-file-upload')?.click()}
  className={`w-full ${formData.taskType === 'evaluacion' 
    ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
    : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700'
  }`}
>
  <Paperclip className="w-4 h-4 mr-2" />
  {translate('attachFile')}
</Button>
```

2. En el área de comentarios de la vista de detalles:
```tsx
<Button
  type="button"
  onClick={() => document.getElementById('comment-file-upload')?.click()}
  className={`w-full ${selectedTask?.taskType === 'evaluacion'
    ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
    : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700'
  }`}
  size="sm"
>
  <Paperclip className="w-4 h-4 mr-2" />
  {translate('attachFile')}
</Button>
```

## Resultados

- Los botones "Adjuntar archivo" ahora son visualmente consistentes con el resto del sistema de colores:
  - Naranja para tareas
  - Morado para evaluaciones
- Se mantiene la consistencia visual en toda la interfaz de usuario.
- Se mantiene la funcionalidad original del botón intacta.

## Archivos modificados

- `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx` - Se modificaron ambas instancias del botón "Adjuntar archivo" para usar lógica condicional de color
