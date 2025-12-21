# SMART STUDENT WEB v9 - Sistema Avanzado de Gestión Estudiantil

Este documento introduce la versión v9 de la plataforma, enfocada en consolidar asistencia, notificaciones dinámicas y exportación/importación completa.

## Novedades clave en v9

- Asistencia unificada por curso-sección (independiente del profesor).
- “Limpiar marcas” actualiza el calendario y elimina los estados del día.
- Notificaciones:
  - La campana incluye la sección “Asistencia” con el mismo color que la Tarjeta de Asistencia.
  - La burbuja global de notificaciones suma las asistencias pendientes.
  - “Asistencia pendiente” solo desaparece cuando TODOS los estudiantes de la sección tienen marcaje en el día.
  - Actualización en tiempo real al marcar asistencia (sin recargar).
- Colores centralizados y dinámicos en `src/lib/ui-colors.ts` (sin hardcodear).
- Exportación/Importación incluye comunicaciones creadas por profesores y registros de asistencia.

## Ubicación de cambios principales

- Panel de notificaciones: `src/components/common/notifications-panel.tsx`
  - Cálculo de “Asistencia pendiente” por curso-sección validando que todos los estudiantes estén marcados hoy.
- Dashboard: `src/app/dashboard/page.tsx`
  - Burbuja de Asistencia y conteo dentro de la campana usan el mismo criterio de “todos marcados hoy”.
- Asistencia: `src/app/dashboard/asistencia/page.tsx`
  - Asistencia única por estudiante-fecha-cursoSección.
  - Limpieza de marcas y dispatch de eventos para actualizar UI.
- Colores UI: `src/lib/ui-colors.ts`
  - Helpers centralizados para clases Tailwind por color.
- Export/Import: `enhanced-export-system.js`
  - Incluye comunicaciones y asistencia en backups restaurables.

## Cómo ejecutar localmente

```bash
npm install
npm run dev
```

- Dev server: normalmente en http://localhost:3000/
- Requiere datos en localStorage (usuarios, cursos, secciones, asignaciones) para visualizar correctamente.

## Consejos de uso

- Marcar asistencia para todos los estudiantes de la sección eliminará la notificación pendiente del día.
- La campana y la tarjeta de Asistencia muestran el total de secciones con asistencia incompleta hoy.
- Para pruebas, verifica/ajusta en localStorage:
  - `smart-student-student-assignments` (asignación estudiante → sección)
  - `smart-student-teacher-assignments` (asignación profesor → sección)
  - `smart-student-attendance` (registros del día)

## Troubleshooting rápido

- Si no ves pendientes de asistencia, confirma que existan estudiantes asignados a la sección y que no todos estén marcados hoy.
- Si los colores no coinciden, verifica `src/lib/ui-colors.ts` y la `colorClass` de la tarjeta de Asistencia.
- Si la campana no refleja cambios, asegúrate de que se emitan eventos de storage al marcar asistencia.

## Créditos

- Proyecto: SMART STUDENT WEB v9
- Autoría: superjf789 y colaboradores
