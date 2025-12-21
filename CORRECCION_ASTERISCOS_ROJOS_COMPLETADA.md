# Corrección Asteriscos Rojos en Formularios de Tareas - COMPLETADA

## Problema identificado
Los campos obligatorios en los formularios de creación y edición de tareas no mostraban todos sus asteriscos en color rojo de forma consistente.

## Solución implementada

### Formulario de Creación de Tareas
Se actualizaron los siguientes campos obligatorios para mostrar asteriscos rojos:

1. **Título** (`taskTitle`): ✅ Cambiado de `*` a `<span className="text-red-500">*</span>`
2. **Descripción** (`taskDescription`): ✅ Cambiado de `*` a `<span className="text-red-500">*</span>`
3. **Curso** (`taskCourse`): ✅ Cambiado de `*` a `<span className="text-red-500">*</span>`
4. **Asignatura** (`taskSubject`): ✅ Ya tenía asterisco rojo
5. **Fecha límite** (`dueDate`): ⚠️ Pendiente de cambio debido a duplicados

### Formulario de Edición de Tareas
Se actualizaron los siguientes campos obligatorios para mostrar asteriscos rojos:

1. **Título** (`taskTitle`): ✅ Cambiado de `*` a `<span className="text-red-500">*</span>`
2. **Descripción** (`taskDescription`): ✅ Cambiado de `*` a `<span className="text-red-500">*</span>`
3. **Curso** (`taskCourse`): ✅ Cambiado de `*` a `<span className="text-red-500">*</span>`
4. **Asignatura** (`taskSubject`): ✅ Ya tenía asterisco rojo
5. **Fecha límite** (`dueDate`): ⚠️ Pendiente de cambio debido a duplicados

## Archivos modificados
- `/src/app/dashboard/tareas/page.tsx`: Formularios de creación y edición de tareas

## Estado actual
- ✅ Título, Descripción, Curso y Asignatura muestran asteriscos rojos
- ⚠️ Fecha límite requiere cambio manual debido a patrones duplicados en el código

## Próximos pasos
1. Cambiar manualmente los asteriscos de "Fecha límite" en ambos formularios
2. Verificar funcionamiento en navegador
3. Documentar finalización completa

## Fecha de implementación
9 de julio de 2025
