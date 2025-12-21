# 📅 Plantilla de Asistencia 2025 (Carga Masiva)

Este directorio incluye el archivo `attendance-template-2025.csv`, generado para realizar la carga masiva de asistencia en la app.

## Dónde usarla

- Admin → Configuración → Carga Masiva
  - Tarjeta: "Carga masiva: Asistencia (SQL)" o "Carga masiva: Asistencia (Firebase)" según tu backend.
  - El importador acepta CSV y Excel. Esta plantilla es CSV (UTF-8), delimitado por coma.

## Formato del archivo

Encabezados:

- `date` (YYYY-MM-DD)
- `course` (p. ej. "1ro Básico")
- `section` (p. ej. "A")
- `studentUsername` (username del estudiante)
- `rut` (opcional, acelera el match; formato 10.000.000-0 o sin puntos)
- `name` (solo informativo; el match se hace por rut/username)
- `status` (present | absent | late | excused)
- `comment` (opcional)

Ejemplo (primeras filas):

```
date,course,section,studentUsername,rut,name,status,comment
2025-03-03,1ro Básico,A,a.gonzalez0075,10000007-5,Agustín González Vega,present,
2025-03-03,1ro Básico,A,a.gonzalez0415,10000041-5,Alberto González Figueroa,present,
```

Notas:
- El importador mapea automáticamente equivalentes en español (Fecha/Curso/Sección/Estado) o inglés (date/course/section/status).
- Los valores de `status` en español como "Presente", "Ausente" o "Atraso" también son aceptados; internamente se normalizan a `present`, `absent`, `late`.

## Generación y fechas

- Rango: lunes a viernes desde 2025-03-01 hasta 2025-12-31.
- Una fila por estudiante y día hábil.
- Por defecto, `status = present` (puedes editar en Excel antes de subir o dejar que el sistema sobreescriba cuando marques asistencia diaria).

## Requisitos previos para importar

- Debes tener cargados los catálogos del año 2025: usuarios (estudiantes), cursos y secciones.
- Selecciona el año 2025 en la interfaz de Admin antes de subir.

## Consejos

- Si prefieres una plantilla en español con separador `;`, usa el botón "Descargar plantilla de asistencia" en la misma tarjeta; el importador soporta ambas variantes.
- Si el curso o la sección no coinciden exactamente por nombre, el importador intentará resolverlos por catálogo; asegúrate de que coincidan.

---

Ubicación del archivo:
- `public/test-data/attendance-template-2025.csv`

Script utilizado para generarlo:
- `scripts/generate-attendance-2025.js`
