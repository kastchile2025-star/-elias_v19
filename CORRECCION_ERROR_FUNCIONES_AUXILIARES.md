# Corrección de Error: Funciones Auxiliares en el Panel de Tareas

## Descripción del Problema

Se detectó un error de referencia en la página de tareas: `ReferenceError: getAssignedStudentsForTask is not defined at TareasPage`. Este error ocurría porque las funciones auxiliares necesarias para mostrar los detalles de los estudiantes en las tareas y evaluaciones estaban definidas dentro de un IIFE (Immediately Invoked Function Expression) que no las exponía correctamente al ámbito del componente.

## Solución Implementada

1. Se eliminó el IIFE innecesario que encapsulaba las funciones auxiliares.
2. Se movieron las siguientes funciones al ámbito del componente principal `TareasPage`:
   - `getAssignedStudentsForTask`: Obtiene la lista de estudiantes asignados a una tarea o evaluación.
   - `getStudentSubmission`: Obtiene la información de entrega de un estudiante específico.
   - `getStudentEvaluationResult`: Obtiene los resultados de la evaluación para un estudiante específico.

3. Las funciones ahora pueden acceder a los estados del componente (como `comments`) correctamente, y son accesibles desde cualquier parte del componente `TareasPage`.

## Beneficios

1. Se corrigió el error de referencia que impedía el funcionamiento correcto del panel de tareas.
2. Se mejoró la estructura del código al colocar las funciones auxiliares en el lugar adecuado.
3. Se mantiene la funcionalidad de mostrar detalles de estudiantes en las tareas y evaluaciones para profesores.

## Nota Técnica

Las funciones auxiliares simulan la obtención de datos que en un entorno real vendrían de una base de datos. En una implementación completa, estas funciones deberían conectarse a una API para obtener los datos reales.
