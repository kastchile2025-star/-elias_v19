# ⚙️ Carga Masiva de Profesores (Excel → JSON)

Este flujo te permite validar tu Excel, detectar errores comunes y generar un JSON listo para importar desde el Admin.

## 1) Preparar el archivo

- Las columnas esperadas son:
  - role, name, rut, email, username, password, course, section, subjects
- Puntos importantes:
  - `role` debe ser `teacher` (otras filas se ignoran)
  - `email` debe ser válido (no usar comas). Ej.: sandra.gomez@example.com (no sandra,gomez@...)
  - `rut` se valida con DV (advertencia si no coincide)
  - `course` y `section` no pueden estar vacíos
  - `subjects` usa códigos conocidos: MAT, LEN, CNT, HIST (o HIS), BIO, FIS, QUI, CPC, EDC, FIL

## 2) Validar y convertir

1. Abre en el navegador el archivo `public/analizador-carga-profesores.html`.
2. Pega el contenido de tu Excel (cópialo como texto) o carga el `.csv/.tsv`.
3. Pulsa "Validar y convertir".
4. Revisa el reporte: errores (debes corregirlos) y advertencias (opcionales).
5. Descarga el JSON con "Descargar JSON".

## 3) Importar en el Admin

- Ve a Admin → Configuración (módulo) → botón de "Importar BBDD con asignaciones".
- Selecciona el JSON descargado. Este JSON contiene:
  - `users` con profesores y sus `teachingAssignments` por asignatura/curso
  - `courses` y `sections` actuales (si estaban en el navegador) para referencia

> Nota: Las asignaciones a secciones por materia se resuelven en el sistema usando nombre de curso y sección. Si alguna sección no existe, podrás generarla en Configuración → Gestión de Cursos/Secciones.

## 4) Qué corrige este analizador

- Emails con coma (reporta error para corregir en Excel)
- Alias de asignaturas (HIS → HIST)
- RUT con formato: normaliza y valida DV (advertencia si no coincide)
- Agrupa múltiples filas por el mismo `username` para crear `teachingAssignments`

## 5) Errores típicos detectados en tu plantilla

- `sandra,gomez@example.com` → coma en email. Debe ser `sandra.gomez@example.com`.
- Códigos `HIS` y `HIST` mezclados → se unifica a "Historia, Geografía y Ciencias Sociales".
- Duplicidad por profesor/curso/sección/asignatura → se consolida en una sola estructura.

## 6) Importar directo (opcional)

En la misma herramienta hay un botón "Importar directo al navegador" que fusiona los `users` con el `localStorage` (clave `smart-student-users`). Úsalo para pruebas rápidas.

---

Si luego quieres integrar una lectura nativa de `.xlsx`, podemos añadir soporte con SheetJS. Por ahora el flujo TSV/CSV es el más estable y rápido.
