# Corrección: Formato de Fechas en Una Sola Línea

## Problema
En la vista de evaluación del profesor, las fechas no se mostraban correctamente en una sola línea, lo que causaba problemas de visualización y estética en la interfaz.

## Solución
Se modificó el formato de visualización de las fechas para que todas se muestren en una sola línea, utilizando la función `formatDateOneLine` en lugar de `formatDate` en los siguientes lugares:

1. En el diálogo de detalles de la evaluación, para la fecha de vencimiento:
   ```jsx
   <strong>{translate('taskDueDateLabel')}</strong> {formatDateOneLine(selectedTask.dueDate)}
   ```

2. En las tarjetas de tarea/evaluación en vista lista:
   ```jsx
   {translate('duePrefix')} {formatDateOneLine(task.dueDate)}
   ```

3. En las tarjetas de tarea/evaluación en vista por curso:
   ```jsx
   {translate('duePrefix')} {formatDateOneLine(task.dueDate)}
   ```

## Beneficios
- Mejora la visualización y estética de la interfaz
- Mantiene la consistencia en el formato de fechas en toda la aplicación
- Evita que las fechas ocupen más espacio del necesario y rompan el diseño

## Función de formateo utilizada
```javascript
const formatDateOneLine = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' ');
};
```

Este formato genera fechas del estilo: "18 jul 2025 17:09" en lugar del formato anterior que podía incluir saltos de línea.
