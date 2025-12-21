# Habilitación de Promedio de Asistencia Global (Curso)

## Descripción del Cambio
Se ha habilitado la visualización del "Promedio Asistencia" para el curso completo (vista global) en la pestaña de Calificaciones, tanto para administradores como para profesores. Anteriormente, esta tarjeta solo se mostraba o calculaba correctamente al filtrar por un estudiante específico.

## Archivos Modificados
- `src/app/dashboard/calificaciones/page.tsx`

## Detalles Técnicos
1.  **Condición de Renderizado:** Se eliminó la restricción `hasSemester` en la condición de visualización de la tarjeta de asistencia. Ahora se muestra siempre que haya un contexto de sección seleccionado (`hasSectionContext`), independientemente de si se ha seleccionado un semestre específico o "Todos los semestres".
2.  **Mejora en el Emparejamiento de Estudiantes:**
    - Se mejoró la población del conjunto `sectionStudents` para incluir versiones "limpias" de los RUTs (sin puntos ni guiones).
    - Se actualizó la lógica de filtrado de registros de asistencia para comparar también contra estos RUTs limpios. Esto mejora la compatibilidad con registros importados (CSV) que pueden tener formatos de RUT diferentes a los de la base de datos de usuarios.

## Resultado Esperado
- Al seleccionar un Curso y Sección (sin seleccionar un estudiante específico), aparecerá la tarjeta "Promedio Asistencia" con el promedio global del curso.
- El cálculo respetará el filtro de semestre si está activo, o mostrará el anual si se selecciona "Todos los semestres".
