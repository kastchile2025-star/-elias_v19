# CORRECCIÓN DE ESPACIADO EN LISTAS DESPLEGABLES

## Descripción del problema
En las listas desplegables de la pestaña de tareas del profesor, el selector (ícono de check) estaba sobrepuesto al texto de la opción, lo que dificultaba la lectura y no proporcionaba una buena experiencia visual.

## Solución implementada
Se ha mejorado el espaciado entre el selector y el texto en las opciones de las listas desplegables, asegurando una presentación más limpia y profesional.

### Archivos modificados:

1. **Componente Select**:
   - `/workspaces/SMART_STUDENT_HTML/src/components/ui/select.tsx`: Se modificó el componente `SelectItem` para aumentar el padding izquierdo y añadir margen al texto.

2. **Estilos personalizados**:
   - `/workspaces/SMART_STUDENT_HTML/src/styles/custom-select.css`: Se añadieron estilos específicos para mejorar el espaciado en las listas desplegables.

3. **Aplicación de clases específicas**:
   - `/workspaces/SMART_STUDENT_HTML/src/app/dashboard/tareas/page.tsx`: Se añadió la clase `select-item-spaced` a los elementos `SelectItem` para aplicar el espaciado mejorado.

### Cambios en los estilos:

```css
/* Mejora del espaciado entre el selector y el texto en las opciones */
[data-radix-select-item] {
  padding-left: 2rem !important; /* Aumentamos el padding izquierdo */
}

[data-radix-select-item] span:first-child {
  left: 0.5rem !important; /* Ajustamos la posición del ícono de check */
}

.select-orange-hover [data-radix-select-item] span + span {
  margin-left: 0.5rem !important; /* Espacio entre el ícono y el texto */
}

/* Clase específica para mejorar el espaciado de los items */
.select-item-spaced {
  display: flex !important;
  align-items: center !important;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem !important;
  position: relative !important;
}
```

### Cambios en el componente SelectItem:

```jsx
<SelectPrimitive.Item
  ref={ref}
  className={cn(
    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-10 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    className
  )}
  {...props}
>
  <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
    <SelectPrimitive.ItemIndicator>
      <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
  </span>

  <SelectPrimitive.ItemText className="ml-1">{children}</SelectPrimitive.ItemText>
</SelectPrimitive.Item>
```

## Resultado
Ahora las opciones en las listas desplegables tienen un espaciado adecuado entre el selector (ícono de check) y el texto, lo que proporciona una experiencia visual más limpia y profesional.

Este cambio complementa las mejoras anteriores en el formato y comportamiento de las listas desplegables, completando la optimización de la interfaz para el rol de profesor.
