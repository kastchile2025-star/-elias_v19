# CORRECCIÓN DEL COLOR DE HOVER EN LISTAS DESPLEGABLES

## Descripción del problema
Al pasar el cursor sobre las opciones en las listas desplegables de la pestaña de tareas del profesor, el fondo cambiaba a verde, lo que no era consistente con el tema naranja de esta sección.

## Solución implementada
Se ha mejorado la implementación de las clases CSS para el estilo de hover en los elementos de las listas desplegables, asegurando que todas las opciones cambien a un fondo naranja claro al pasar el cursor por encima.

### Archivos modificados:

1. **Estilos de componentes Select**:
   - `/workspaces/SMART_STUDENT_HTML/src/styles/custom-select.css`: Se han ampliado los selectores CSS para cubrir más casos y asegurar que todos los elementos de las listas desplegables tengan el estilo correcto.

2. **Aplicación de clases adicionales**:
   - `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx`: Se han agregado clases específicas de hover directamente a los elementos `SelectItem` para reforzar el estilo deseado.

### Cambios en los estilos:

```css
/* Se han añadido múltiples selectores para cubrir todos los casos posibles */
.select-orange-hover [data-radix-select-item],
.select-orange-hover [role="option"] {
  transition: background-color 0.2s, color 0.2s;
}

.select-orange-hover [data-radix-select-item]:hover,
.select-orange-hover [data-radix-select-item]:focus,
.select-orange-hover [role="option"]:hover,
.select-orange-hover [role="option"]:focus,
.select-orange-hover li:hover,
.select-orange-hover li:focus {
  background-color: rgb(255, 237, 213) !important; /* orange-100 */
  color: rgb(194, 65, 12) !important; /* orange-700 */
}

/* Selectores más específicos para asegurar que todos los componentes de select tengan el estilo correcto */
.select-content-item:hover, 
[data-radix-menu-content] div[role="menuitem"]:hover, 
[role="listbox"] [role="option"]:hover,
.radix-select-content div:hover,
div[id^="radix-"] div:hover,
[role="option"]:hover,
div[class*="select-content"] li:hover {
  background-color: rgb(255, 237, 213) !important; /* orange-100 */
  color: rgb(194, 65, 12) !important; /* orange-700 */
}
```

## Resultado
Ahora todas las opciones en las listas desplegables de la pestaña de tareas del profesor cambian a un fondo naranja claro al pasar el cursor por encima, manteniendo la consistencia visual con el tema de color de la sección.

Este cambio complementa las mejoras anteriores en el formato de fechas y el centrado de encabezados en las tablas, completando la uniformidad visual requerida para la interfaz del profesor.
