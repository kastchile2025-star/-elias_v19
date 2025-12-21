# Corrección: Color del Botón "Adjuntar archivo"

## Problema
Los botones para "Adjuntar archivo" en la página de tareas estaban utilizando el estilo gris predeterminado (variant="outline"), pero según los requisitos de diseño deberían tener un estilo naranja para mantener la consistencia con otros elementos relacionados con tareas.

## Solución

Se modificaron los botones "Adjuntar archivo" en ambas ubicaciones para usar colores naranja en lugar de gris:

1. En el formulario principal de creación/edición de tareas
2. En el área de comentarios

### Cambios realizados:

```tsx
// Antes (estilo gris)
<Button
  type="button"
  variant="outline"
  onClick={() => document.getElementById('task-file-upload')?.click()}
  className="w-full"
>
  <Paperclip className="w-4 h-4 mr-2" />
  {translate('attachFile')}
</Button>

// Después (estilo naranja)
<Button
  type="button"
  onClick={() => document.getElementById('task-file-upload')?.click()}
  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700"
>
  <Paperclip className="w-4 h-4 mr-2" />
  {translate('attachFile')}
</Button>
```

## Resultados

- Los botones "Adjuntar archivo" ahora son visualmente consistentes con otros elementos relacionados con tareas que tienen estilo naranja.
- Se aplicaron estilos responsivos para modo claro y oscuro, asegurando buena visibilidad en ambos modos.
- Se mantiene la funcionalidad original del botón intacta.

## Archivos modificados

- `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx` - Se modificaron ambas instancias del botón "Adjuntar archivo"
