# CORRECCIÓN DEL HOVER INDIVIDUAL EN OPCIONES DE LISTAS DESPLEGABLES

## Descripción del problema
En las listas desplegables de la pestaña de tareas del profesor, cuando se pasaba el cursor sobre una opción, todas las opciones cambiaban de color simultáneamente, lo que no proporcionaba una buena experiencia de usuario. Cada opción debe cambiar de forma independiente para indicar claramente cuál está siendo seleccionada.

## Solución implementada
Se han refinado los selectores CSS para asegurar que cada opción en las listas desplegables cambie a naranja claro de forma independiente cuando el cursor pasa sobre ella. Esto proporciona una mejor experiencia de usuario al indicar claramente qué opción está siendo seleccionada.

### Archivos modificados:

1. **Estilos de componentes Select**:
   - `/workspaces/SMART_STUDENT_HTML/src/styles/custom-select.css`: Se han refinado los selectores CSS para aislar el efecto de hover a cada ítem individual.

2. **Aplicación de clases específicas**:
   - `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx`: Se ha añadido la clase `individual-option` a cada `SelectItem` para aislar el efecto de hover.

### Cambios en los estilos:

```css
/* Clase específica para aislar el efecto hover a cada opción individual */
.individual-option {
  isolation: isolate;
  position: relative;
}

.individual-option:hover {
  background-color: rgb(255, 237, 213) !important; /* orange-100 */
  color: rgb(194, 65, 12) !important; /* orange-700 */
  z-index: 5 !important;
}

/* Asegurar que las opciones no afectadas mantengan su estado original */
.select-orange-hover:hover .individual-option:not(:hover) {
  background-color: transparent !important;
  color: inherit !important;
}
```

### Aplicación en los componentes:

```jsx
<SelectItem value="all" className="hover:bg-orange-100 hover:text-orange-700 individual-option">
  {translate('allCourses')}
</SelectItem>
{getAvailableCourses().map(course => (
  <SelectItem key={course} value={course} className="hover:bg-orange-100 hover:text-orange-700 individual-option">
    {course}
  </SelectItem>
))}
```

## Resultado
Ahora cada opción en las listas desplegables cambia a naranja claro de forma independiente cuando el cursor pasa sobre ella, proporcionando una mejor experiencia de usuario y una indicación clara de qué opción está siendo seleccionada.

Este cambio mejora la usabilidad de la interfaz del profesor en la sección de tareas/evaluaciones, especialmente al filtrar por curso.
