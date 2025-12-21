# Corrección de Traducción en Badges de Tareas y Evaluaciones

## Problema Identificado
Los badges que muestran el tipo de tarea ("Tarea" o "Evaluación") estaban utilizando texto hardcodeado en español, lo que provocaba que no se tradujeran correctamente cuando el usuario cambiaba el idioma a inglés.

## Solución Implementada
Se modificaron las tres instancias donde estos badges se renderizan para que utilicen el sistema de traducción mediante la función `translate()`:

1. En la vista de lista de tareas (primera instancia):
```tsx
// Antes
<Badge variant="outline" className={getTaskTypeColor(task.taskType || 'tarea')}>
  {task.taskType === 'evaluacion' ? 'Evaluación' : 'Tarea'}
</Badge>

// Después
<Badge variant="outline" className={getTaskTypeColor(task.taskType || 'tarea')}>
  {task.taskType === 'evaluacion' ? translate('evaluation') : translate('task')}
</Badge>
```

2. En la vista de tareas por curso (segunda instancia):
```tsx
// Antes
<Badge variant="outline" className={getTaskTypeColor(task.taskType || 'tarea')}>
  {task.taskType === 'evaluacion' ? 'Evaluación' : 'Tarea'}
</Badge>

// Después
<Badge variant="outline" className={getTaskTypeColor(task.taskType || 'tarea')}>
  {task.taskType === 'evaluacion' ? translate('evaluation') : translate('task')}
</Badge>
```

3. En el diálogo de detalle de tarea (tercera instancia):
```tsx
// Antes
<Badge variant="outline" className={getTaskTypeColor(selectedTask?.taskType || 'tarea')}>
  {selectedTask?.taskType === 'evaluacion' ? 'Evaluación' : 'Tarea'}
</Badge>

// Después
<Badge variant="outline" className={getTaskTypeColor(selectedTask?.taskType || 'tarea')}>
  {selectedTask?.taskType === 'evaluacion' ? translate('evaluation') : translate('task')}
</Badge>
```

## Archivos Modificados
- `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx`

## Ventajas de la Corrección
1. **Internacionalización completa**: Ahora los badges se traducirán correctamente cuando el usuario cambie el idioma.
2. **Consistencia**: Todas las etiquetas de la interfaz utilizan el sistema de traducción.
3. **Mantenibilidad**: Facilita cambios futuros en las traducciones, ya que están centralizadas en los archivos de idioma.

## Traducción de las Claves Utilizadas
- `"task"`: "Tarea" (español) / "Task" (inglés)
- `"evaluation"`: "Evaluación" (español) / "Evaluation" (inglés)

## Verificación
Para verificar el correcto funcionamiento:
1. Ejecutar la aplicación
2. Cambiar el idioma a inglés
3. Verificar que los badges muestren "Task" y "Evaluation" correctamente
4. Cambiar el idioma a español
5. Verificar que los badges muestren "Tarea" y "Evaluación" correctamente
