# Ajuste de Tamaño de Burbujas de Calificaciones

## Descripción del Cambio
Se ha reducido el tamaño de las burbujas de calificaciones en la vista filtrada (cuando se selecciona un estudiante específico) para mejorar el espaciado entre ellas.

## Archivos Modificados
- `src/app/dashboard/calificaciones/page.tsx`

## Detalles Técnicos
- Se cambió la clase `min-w-[2.5rem]` por `min-w-[2rem]`.
- Se redujo el padding horizontal de `px-2` a `px-1.5`.
- Esto aplica tanto a las calificaciones individuales (N1-N10) como al promedio.
- Aplica tanto a la renderización estándar (tabla) como a la virtualizada.

## Condición de Aplicación
El cambio solo afecta cuando `studentFilter !== 'all'`, es decir, cuando se está visualizando el detalle de un estudiante específico dentro de un curso/sección.
