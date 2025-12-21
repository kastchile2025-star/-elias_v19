# Corrección de Estilos en la Vista de Evaluación

## Problemas Identificados
1. El color de hover en las listas desplegables cambiaba a verde en lugar de naranja, lo que no era consistente con la paleta de colores de la aplicación.
2. Las columnas de fecha en las tablas de estudiantes eran demasiado estrechas, lo que dificultaba la lectura de las fechas.

## Soluciones Implementadas

### 1. Corrección del Color de Hover en Listas Desplegables
- Se aplicaron las clases CSS personalizadas `select-orange-hover` a todos los componentes `SelectContent`
- Se aplicaron las clases CSS personalizadas `select-orange-hover-trigger` a todos los componentes `SelectTrigger`
- Las clases personalizadas definen un color de hover naranja claro que es consistente con el esquema de color de la aplicación

### 2. Mejora de la Visualización de Fechas
- Se aumentó el ancho mínimo de las celdas de fecha en las tablas a 150px
- Se aumentó el ancho máximo a 200px para permitir una mejor visualización
- Se añadió la clase `min-w-[150px]` a los encabezados de las columnas de fecha
- Se mejoró el formato de texto de las fechas agregando la clase `font-medium` para mayor legibilidad

## Resultado
- Las listas desplegables ahora muestran un color de hover naranja claro en lugar de verde
- Las fechas en las tablas de estudiantes son más fáciles de leer gracias al mayor ancho de columna y el formato mejorado
- La interfaz es más consistente visualmente y ofrece una mejor experiencia de usuario

## Archivos Modificados
- `/src/app/dashboard/tareas/page.tsx`
- `/src/styles/date-formats.css`
