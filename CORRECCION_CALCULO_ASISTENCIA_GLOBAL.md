# Corrección de Cálculo de Asistencia Global

## Problema Detectado
El usuario reportó que el promedio de asistencia para el curso completo se mostraba como "0%" (círculo rojo) o no se mostraba correctamente.
El análisis indicó que, aunque se encontraban registros, el conteo de estados (Presente, Ausente, etc.) podía estar fallando, resultando en un total de 0, lo que a su vez generaba un promedio de 0% en lugar de indicar "Sin datos".

## Solución Aplicada
1.  **Limpieza de Estados:** Se mejoró la limpieza de los valores de estado (`status`/`estado`) eliminando comillas simples y dobles (`'"`), además de espacios, antes de compararlos. Esto soluciona problemas comunes en la importación de CSVs donde los valores pueden venir entrecomillados (ej: `"present"`).
2.  **Guard de Total Cero:** Se reforzó la condición que verifica si el total de registros válidos es 0. Ahora, si `total === 0` (incluso si se encontraron registros brutos), se fuerza el estado a `null`. Esto asegura que la tarjeta muestre el estado "Sin datos" (gris con guión) en lugar de un engañoso "0%" rojo.

## Verificación
1.  Seleccione un Curso y Sección.
2.  Si hay datos de asistencia válidos para el período seleccionado, debería ver el porcentaje correcto (ej: 93%).
3.  Si no hay datos o los datos no son válidos, debería ver la tarjeta en gris con un guión "—", indicando claramente la ausencia de información calculable.
