# ELIMINACIÓN DEL SELECTOR EN LISTAS DESPLEGABLES

## Descripción del problema
En las listas desplegables de la pestaña de tareas del profesor, aparecía un selector (ícono de check) junto a las opciones, lo cual no era necesario y ocupaba espacio adicional.

## Solución implementada
Se ha eliminado el selector (ícono de check) de las listas desplegables, proporcionando una interfaz más limpia y directa para la selección de opciones. Se aplicó una doble estrategia:

1. Modificación del componente React para ocultar el indicador
2. Aplicación de estilos CSS globales para asegurar que el selector quede completamente oculto
3. Ajuste del espaciado para mantener una apariencia coherente

### Archivos modificados:

1. **Componente Select**:
   - `/workspaces/SMART_STUDENT_HTML/src/components/ui/select.tsx`: Se modificó el componente `SelectItem` para ocultar el ícono de check y ajustar el espaciado.

2. **Estilos personalizados**:
   - `/workspaces/SMART_STUDENT_HTML/src/styles/custom-select.css`: Se actualizaron los estilos para eliminar el espacio reservado para el ícono y ajustar el padding.

### Cambios en el componente:

```jsx
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-3 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {/* Selector oculto pero conservando la estructura */}
    <span className="hidden">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
```

### Cambios en los estilos:

```css
/* Ajustar el espaciado para opciones sin selector */
[data-radix-select-item] {
  padding-left: 1rem !important; /* Reducimos el padding izquierdo al eliminar el ícono */
}

/* Ocultar completamente cualquier indicador de ítem (check) */
[data-radix-select-item-indicator],
.radix-select-item-indicator,
[class*="ItemIndicator"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Ocultar completamente el indicador de selección */
[data-radix-select-item] [data-radix-select-item-indicator] {
  display: none !important;
}

/* Clase específica para mejorar el espaciado de los items en la lista desplegable */
.select-item-spaced {
  display: flex !important;
  align-items: center !important;
  padding: 0.5rem 1rem !important;
  position: relative !important;
}
```

## Resultado
Las opciones en las listas desplegables ahora se muestran sin el ícono de check, proporcionando una interfaz más limpia y directa para la selección de opciones. El espaciado ha sido ajustado para mantener una presentación ordenada y profesional.

Este cambio completa las mejoras en la presentación y comportamiento de las listas desplegables, optimizando la experiencia de usuario para el rol de profesor.
