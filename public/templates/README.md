# Plantillas PPTX animadas

Coloca aquí `animated_base.pptx` para que la exportación de presentaciones conserve animaciones nativas de PowerPoint.

Requisitos del template:

- Diapositiva de portada con cuadros de texto enlazados a los placeholders:
  - `{cover.title}`
  - `{cover.course}`
  - `{cover.subject}`
  - `{cover.teacher}`
- Disposición de contenido para las diapositivas normales con:
  - Un cuadro de texto para `{title}` (título de la diapositiva)
  - Un único cuadro de texto de viñetas que contenga:
    
    ```
    {#points}
    {.}
    {/points}
    ```

Animaciones a configurar en PowerPoint (nativas):

- Título: Efecto "Aparecer" (Fade) al hacer clic.
- Cuadro de viñetas: mismo efecto "Aparecer" (Fade) con opción "Por párrafo" (By paragraph) y "Después del anterior" para que se revele punto por punto.
- Portada: aplicar el mismo efecto al título; los otros textos pueden estar en "Después del anterior".

Notas:

- El motor rellena datos y respeta las animaciones del archivo. No se crean diapositivas extra.
- Si este archivo no existe, la app cae en un modo de exportación sin animaciones usando pptxgenjs.
- También puedes subir un archivo `.pptx` personalizado desde la UI; si lo haces, tendrá prioridad sobre este archivo.
