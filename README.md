# SMART STUDENT WEB v14 – Plataforma Integral de Gestión Estudiantil

**Versión v14** centrada en **Evaluaciones Inteligentes Específicas por Tema** y **Optimización de Almacenamiento**. Esta versión revoluciona el módulo de evaluación del administrador para generar preguntas específicas basadas en IA real, eliminando respuestas genéricas y proporcionando evaluaciones educativas de alta calidad.

![SMART STUDENT v14](https://via.placeholder.com/800x200/1a1a1a/ffffff?text=SMART+STUDENT+v14)

> **📋 Ver documentación completa**: [README_v14.md](README_v14.md)

## 🚀 Principales Novedades v14

### 🧠 Evaluaciones Inteligentes
- ✅ **IA Real Configurada**: Google AI API completamente funcional
- ✅ **Preguntas Específicas**: Eliminadas respuestas genéricas
- ✅ **Contenido Educativo**: Base de conocimientos por materia
- ✅ **50+ Temas**: Sistema Respiratorio, Célula, Fracciones, etc.

### 💾 Optimización de Almacenamiento  
- ✅ **QuotaExceededError Resuelto**: Sistema auto-reparación
- ✅ **Límites Inteligentes**: Máximo 50 evaluaciones por usuario
- ✅ **Limpieza Automática**: Prevención proactiva de errores

### 🔧 Mejoras Técnicas
- ✅ **Validación Robusta**: Debug detallado para troubleshooting
- ✅ **API Mejoradas**: Extracción PDF y generación dinámica
- ✅ **Recuperación Automática**: Fallback en caso de errores

## ⚡ Inicio Rápido

```bash
# Clonar e instalar
git clone https://github.com/jorgecastros687-lang/superjf_v14.git
cd superjf_v14
npm install

# Configurar IA (requerido)
echo "GOOGLE_API_KEY=tu_api_key_aqui" > .env.local

# Ejecutar
npm run dev
# http://localhost:9002
```

## 📊 Transformación de Evaluaciones

**Antes v13** ❌:
```
¿Qué elementos incluye este libro de Ciencias Naturales?
A) Opción A  B) Opción B  C) Opción C  D) Opción D
```

**Después v14** ✅:
```
¿Cuáles son los órganos principales del sistema respiratorio?
A) Pulmones y tráquea  B) Estómago e hígado  
C) Corazón y arterias  D) Riñones y vejiga
```

## 🛠 Comandos Principales

```bash
npm run dev              # Desarrollo (puerto 9002)
npm run build           # Construir para producción
npm run genkit:dev      # Servidor IA Genkit
```

## 📞 Soporte y Documentación

- **📋 Documentación Completa**: [README_v14.md](README_v14.md)
- **🔧 Repositorio**: [GitHub superjf_v14](https://github.com/jorgecastros687-lang/superjf_v14)
- **🐛 Issues**: Reportar problemas en GitHub Issues

---

**SMART STUDENT v14** - Transformando la educación con IA inteligente y evaluaciones específicas por tema.

*Desarrollado con ❤️ para la comunidad educativa*
```

## 📊 Transformación de Evaluaciones

**Antes v13** ❌:
```
¿Qué elementos incluye este libro de Ciencias Naturales?
A) Opción A  B) Opción B  C) Opción C  D) Opción D
```

**Después v14** ✅:
```
¿Cuáles son los órganos principales del sistema respiratorio?
A) Pulmones y tráquea  B) Estómago e hígado  
C) Corazón y arterias  D) Riñones y vejiga
```
### 1. Notificaciones
- Reparación temprana (`notification-guard.js` + `NotificationSyncService.repairStoredNotifications`) que:
  - Rellena `targetUsernames` perdidos reconstruyendo estudiantes por curso.
  - Limita tamaño activo (límite duro 3000) y archiva versiones minimizadas (`*-archive`).
  - Poda iterativa si se excede cuota de localStorage con estrategias escalonadas.
  - Fallback extremo garantizando persistencia de últimos eventos críticos.

### 2. Estadísticas (Admin → pestaña “Estadísticas”)
- Filtro de Año persistente (`admin-selected-year`) con navegación ± y validación de catálogo anual.
- Normalización de cursos por nivel con deduplicación inteligente (manejo de tildes / variantes: "Primer", "1º", "1er" → 1ro).
- KPI adicional: Secciones (dinámico con filtros activos y año).
- Filtro de Asignatura (paridad futura con pestaña Calificaciones / Submissions) aplicado a actividad reciente y agregados.
- Eliminación de generación demo automática (solo datos reales cargados por año).
- Soporte de claves segmentadas por año para cursos, secciones y (en progreso) asistencia: `smart-student-*-<YYYY>`.

### 3. Almacenamiento y Rendimiento
- Poda preventiva y archivo de notificaciones para evitar overflow + recuperación en caliente tras `QuotaExceededError`.
- Minimización de campos redundantes (`fromDisplayName`, `readBy` vacíos) para aligerar payloads.

### 4. Robustez de Datos / Preparativos Asistencia
- Infraestructura en `useAdminKPIs` para lectura por año y filtrado jerárquico nivel→curso→sección.
- Ampliación/mapping de cursos y secciones para datos históricos y futuros (nombres vs IDs).
- (WIP) Extensión de parser de asistencia para múltiples formatos y agregación.

### 5. UX / Accesibilidad
- Indicadores visuales para periodo bloqueado en años pasados.
- Tooltips y `aria-label` en controles de cambio de año y periodos.
- Botones de curso/ sección con truncado controlado y estados activos contrastados.

### 6. Scripts utilitarios nuevos
- `public/notification-guard.js` – Saneamiento previo de notificaciones.
- Limpieza / sincronización: `sync-admin-data.js`, `clear-demo-data.js`, `force-reload-fix.js`, `fix-targetusernames-immediately.js`.

> Nota: El gráfico temporal diario, zoom Y y lógica de calendario escolar de v12 se mantienen intactos.

## 🧭 Estructura clave
- `src/app/dashboard/estadisticas/page.tsx`
  - Implementa el gráfico temporal multi-serie, zoom y selector mejorado.
  - KPIs y asistencia temporal alineados a calendario.
- `src/components/common/notifications-panel.tsx` → campana de notificaciones.
- `src/lib/notifications.ts` → TaskNotificationManager.
- `src/lib/ui-colors.ts` → tokens de color.
- `src/ai/` → Genkit + flows de IA.

## 🔔 Notificaciones (tareas, comentarios, calificaciones)
- Lógica principal: `src/lib/notifications.ts` (evento `taskNotificationsUpdated` + `storage`).
- Panel UI: `src/components/common/notifications-panel.tsx`.
- Reglas de asistencia pendiente por curso-sección visibles en campana.

## � Calificaciones (nuevo comportamiento – Oct 2025)
- Semestre por defecto (auto):
  - Si existe calendario de semestres configurado en Admin para el año actual, se selecciona automáticamente S1 o S2 según la fecha de hoy.
  - Si no hay calendario, se usa el fallback por mes: Ene–Jun = 1er Semestre; Jul–Dic = 2do Semestre.
  - La auto-selección ocurre una sola vez al entrar para el año actual; luego puedes cambiar el semestre manualmente.
- Overlay de carga enfocado (rol estudiante):
  - Al entrar a Calificaciones, muestra una superposición de carga mientras:
    1) se fija el semestre (S1/S2),
    2) se auto-detecta el curso-sección del estudiante, y
    3) finaliza la carga inicial de notas desde SQL (o su intento).
  - Cierra suavemente cuando todo está listo o tras un máximo de ~8s como fallback para no bloquear la vista.
  - No se muestra para Admin/Profesor.
- Consideraciones:
  - Si no hay conexión SQL, el overlay cierra rápido y se muestran notas locales (si existen) sin bloquear.
  - El filtrado para estudiante queda inmediatamente en su propia sección + semestre actual para una percepción de carga instantánea.

## �🗓️ Asistencia (estado actual)
- Vista principal: `src/app/dashboard/asistencia/page.tsx`.
- Estadísticas: cálculo dinámico (en ajuste) se basará en claves segmentadas por año (`smart-student-attendance-YYYY`) + calendario escolar (`admin-calendar-YYYY`).
- Próximos pasos: integración de rangos personalizados de semestre, conteos por estudiante y normalización de registros masivos (Fecha / Estado / Curso / Sección) → KPI de asistencia.
- Vista: `src/app/dashboard/asistencia/page.tsx` (por curso-sección `courseId-sectionId`).
- Dispara eventos para refrescar dashboard/campana: `updateDashboardCounts`, `notificationsUpdated`, `storage`.

## 🧠 IA (Genkit + Gemini)
- Flujos en `src/ai/flows/*`. Desarrollo local: `npm run genkit:dev` o `npm run genkit:watch`.
- Modo simulación/fallback sin clave donde aplica.

## 🔐 Variables de entorno (ejemplo)
Crea `.env.local` (no se versiona):
```
GOOGLE_API_KEY=tu_api_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
CLOUDINARY_CLOUD_NAME=...
```

## 🗄️ Claves de almacenamiento local (principales)
- smart-student-users
- smart-student-courses, smart-student-sections
- smart-student-student-assignments, smart-student-teacher-assignments
- smart-student-tasks, smart-student-task-comments, smart-student-task-notifications
- smart-student-evaluations, smart-student-evaluation-results
- smart-student-communications
- smart-student-attendance

## 📤 Exportación / 📥 Importación
- UI consolidada: `src/components/admin/user-management/configuration.tsx`.
- Soporta respaldo/restore de asistencia, tareas, evaluaciones, comunicaciones y usuarios.

## ▶️ Ejecución local
1) Instala dependencias
```
npm install
```
2) Levanta el entorno dev (http://localhost:9002)
```
npm run dev
```

## 🧪 Verificaciones rápidas v13
- Notificaciones nuevas crecen sin exceder límite duro (ver consola logs de poda si se stress-test).
- Al cambiar el Año desaparecen cursos/secciones inexistentes y se resetean filtros inválidos.
- KPI “Secciones” refleja cambios al alternar filtros (nivel / curso / sección / año).
- Filtro de Asignatura modifica actividad reciente.
- Poda de notificaciones: forzar llenado >3000 ítems y verificar archivo minimizado.
- “Comparación de Cursos”: eje X por días; cambia entre Notas/Asistencia; zoom Y funciona; leyenda refleja filtros.
- Campana y dashboard muestran el mismo conteo de asistencia pendiente tras marcar/desmarcar.
- Notificaciones de tareas: creación/comentarios crean y limpian entradas en `smart-student-task-notifications`.

## 🛠️ Troubleshooting
- Asistencia siempre en 0%: confirmar datos en `smart-student-attendance-<AÑO>` y formato de fecha (se está ampliando parser dd-mm-yyyy). Ver consola `[Asistencia][Diagnóstico]`.
- Notificaciones no aparecen: revisar que `notification-guard.js` cargue antes que `notification-sync-service.js` en `layout.tsx`.
- Filtros de año no persisten: inspeccionar `localStorage.getItem('admin-selected-year')`.
- Sin datos en gráfico temporal: confirma `admin-calendar-YYYY` y datos en las claves locales; el gráfico muestra una serie demo si no hay señal para validar UI.
- Colores: revisar `ui-colors.ts` (evitar clases Tailwind no listadas).
- Campana: verificar listeners a `storage` y eventos personalizados.

## 🕒 Historial de Versiones
### v15 (Oct 2025)
- Calificaciones: semestre por defecto (según calendario o mes actual) y overlay de carga inicial para estudiante esperando la primera lectura desde SQL y filtros automáticos.
- Estadísticas: loader inicial más largo y priming/caches por año para interacciones fluidas tras el primer render.
### v13 (Sept 2025)
- Reparación y poda avanzada de notificaciones; filtro Año + Asignatura; KPI Secciones; normalización de cursos/secciones; scripts de saneamiento.
### v12 (Ago 2025)
- Gráfico temporal “Comparación de Cursos”, zoom Y, calendario escolar, selector Notas/Asistencia mejorado.
### v11
- Pendientes de Calificación, heurísticas curso-sección, i18n ampliado.
### v10
- Asistencia unificada, notificaciones dinámicas, IA (Genkit + Gemini), export/import reforzada.

## 📜 Créditos y alcance
- Autoría original: Felipe (superjf)
- Uso interno/educativo; ajusta licencia si publicarás.

---
Este README refleja el estado actual (v13) de la plataforma.
