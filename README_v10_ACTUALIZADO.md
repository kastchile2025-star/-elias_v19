# SMART STUDENT WEB v10 – Plataforma Integral de Gestión Estudiantil (Actualizado)

Versión v10 consolidada con asistencia unificada, notificaciones dinámicas, IA integrada y utilidades de exportación/importación. Este README refleja el estado real del proyecto en esta rama.

## 🚀 Resumen
- Framework: Next.js 15.4.1 (React 18 + TypeScript)
- Estilos/UI: Tailwind CSS, Radix UI, lucide-react, next-themes
- IA: Genkit + Google Generative AI (Gemini)
- Datos locales: localStorage + exportación/importación JSON
- Otros: Recharts, date-fns, Cloudinary, Tesseract.js
- Puerto dev: 9002 (con Turbopack)

## 📦 Scripts NPM
- dev: next dev --turbopack -p 9002
- build: next build
- start: next start
- lint: next lint
- typecheck: tsc --noEmit
- genkit:dev / genkit:watch (desarrollo de flujos IA)

## 🧭 Estructura clave
- src/app/dashboard/
  - asistencia/page.tsx → módulo de asistencia unificada (por curso-sección)
  - evaluacion/, tareas/, comunicaciones/, gestion-usuarios/, etc.
  - page.tsx → dashboard con burbujas y campana sincronizadas
- src/components/common/notifications-panel.tsx → panel de notificaciones (campana)
- src/lib/
  - notifications.ts → TaskNotificationManager (creación, lectura, limpieza)
  - ui-colors.ts → tokens/ayudas de color y ATTENDANCE_COLOR
  - notifications-sync-service.js (legacy util), tests-storage.ts, types.ts, utils.ts
- src/services/user.service.ts → servicio de usuarios con fallback a localStorage
- src/ai/
  - genkit.ts y flows/* (generate-quiz, mind-map, summary, evaluation-content)
- src/app/globals.css, tailwind.config.ts, next.config.ts

## 🔔 Notificaciones (tareas, comentarios, calificaciones)
- Lógica principal: `src/lib/notifications.ts` (TaskNotificationManager)
  - Eventos disparados: `taskNotificationsUpdated` (propio) y `storage`
- Panel UI: `src/components/common/notifications-panel.tsx`
  - Atiende cambios de localStorage y eventos personalizados
  - Incluye comunicaciones a estudiantes y conteo de asistencia pendiente
- Regla asistencia pendiente en campana: por cada curso-sección, la alerta existe si al menos un estudiante no tiene marcaje en el día.

## 🗓️ Asistencia unificada
- Vista: `src/app/dashboard/asistencia/page.tsx`
- ID de curso compuesto: `courseId-sectionId` (dos UUID concatenados)
- Criterio de “pendiente”: todos los estudiantes asignados a la sección deben estar marcados hoy para que desaparezca.
- Dispara eventos personalizados para refrescar dashboard/campana:
  - `updateDashboardCounts`, `notificationsUpdated` y evento `storage` sobre `smart-student-attendance`.

## 🎨 Sistema de colores
- Archivo fuente: `src/lib/ui-colors.ts`
- Token único para asistencia: `ATTENDANCE_COLOR = 'indigo'`
- Clases Tailwind predefinidas (no dinámicas) para evitar purga inesperada.

## 🧠 IA (Genkit + Gemini)
- Integración real en `src/ai/` con flujos en `src/ai/flows/*`
- Desarrollo local: `npm run genkit:dev` o `npm run genkit:watch`
- Sin clave se puede operar en modo simulación/fallback en UI donde aplica.

## 🔐 Variables de entorno (ejemplo)
Crea `.env.local` (no se versiona):
```
GOOGLE_API_KEY=tu_api_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
CLOUDINARY_CLOUD_NAME=...
```
Nota: también se aceptan `GOOGLE_AI_API_KEY` o `GEMINI_API_KEY` como alternativas, pero se recomienda `GOOGLE_API_KEY` para coincidir con el indicador de IA en la UI y los endpoints.

Allowed origins para server actions configurados en `next.config.ts`.

## 🗄️ Claves de almacenamiento local usadas (principales)
- smart-student-users
- smart-student-courses, smart-student-sections
- smart-student-student-assignments, smart-student-teacher-assignments
- smart-student-tasks, smart-student-task-comments, smart-student-task-notifications
- smart-student-evaluations, smart-student-evaluation-results
- smart-student-communications
- smart-student-attendance

Consejo: para pruebas, precarga datos en estas claves o usa los scripts y vistas de configuración/gestión.

## 📤 Exportación / 📥 Importación
- UI: `src/components/admin/user-management/configuration.tsx` (backup/restore consolidado)
- Script legacy ampliado: `enhanced-export-system.js`
- El restore incorpora asistencia, tareas, evaluaciones, comunicaciones y usuarios normalizados.

## ▶️ Ejecución local
1) Instalar dependencias
```
npm install
```
2) Levantar entorno dev (http://localhost:9002)
```
npm run dev
```

## 🧪 Verificaciones rápidas
- Panel/campana muestran el mismo número para asistencia pendiente tras marcar/desmarcar.
- Notificaciones de tareas: creación de tareas y comentarios generan y limpian entradas en `smart-student-task-notifications`.
- Fallbacks UI: si el contexto de auth falla, paneles leen `smart-student-user(s)` desde localStorage.

## 🛠️ Troubleshooting
- Si no aparecen pendientes: confirma `smart-student-student-assignments` y `smart-student-attendance` del día por sección.
- Si colores no aplican: revisa `ui-colors.ts` (evitar clases Tailwind no listadas).
- Si la campana no actualiza: verificar listeners a `storage`, `taskNotificationsUpdated`, `notificationsUpdated`.

## 🔄 Migración desde v9 (guía breve)
1) Exporta datos desde v9 (si aplica)
2) Actualiza código a v10 (este repo)
3) Importa backup desde Gestión de Usuarios
4) Verifica claves compuestas curso-sección en asistencia y tareas

## 📌 Créditos y alcance
- Autoría original: Felipe (superjf)
- Uso interno/educativo; ajusta licencia si publicarás.

---
Este documento sustituye README_v10.md de plantilla y referencia las rutas reales del código para operar y depurar v10.
