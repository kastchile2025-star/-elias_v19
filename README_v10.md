# SMART STUDENT WEB v10 – Plataforma Integral de Gestión Estudiantil

> Versión enfocada en consolidación, rendimiento, mantenibilidad y preparación para escalamiento multi-entorno.

## 🚀 Resumen Ejecutivo
SMART STUDENT WEB v10 unifica las mejoras de v7 (reparación + IA) y v9 (asistencia unificada + notificaciones dinámicas) y agrega una capa de optimizaciones estructurales para facilitar:
- Rendimiento en carga inicial y paneles dinámicos.
- Consistencia de colores y semántica visual (sin hardcodear).
- Extensibilidad futura (módulos desacoplados para asistencia, notificaciones, exportación, IA, limpieza de datos).
- Migración asistida desde v9 (sin perder historial local almacenado en localStorage / backups exportados).

## 🆕 Novedades Clave v10
(Asumido / Plantilla – ajusta si necesitas antes de publicar)
- ♻️ Refactor de scripts de mantenimiento: agrupados en carpeta /scripts (antes dispersos).
- ⚡ Carga diferida (lazy) de módulos pesados del panel de notificaciones y asistencia.
- 🧠 Capa IA desacoplada con adaptador (permite cambiar proveedor Gemini → otro sin tocar UI).
- 🎯 Normalización de claves en localStorage y eventos personalizados (`smart-student:event:*`).
- 📦 Export/Import mejorado: checksum y validación de esquema antes de aplicar restauraciones.
- 🎨 Sistema de colores central (heredado v9) + tokens semánticos listos para dark mode.
- 🔐 Manejo de API keys más seguro: soporte `.env.local` y fallback a modo simulación.
- 📊 Métricas internas (listener de eventos) para depurar flujos de sincronización.

Si alguna de estas funciones aún no está implementada en tu copia local, utiliza esta sección como checklist para completar la versión v10.

## 🧩 Arquitectura (Visión Rápida)
| Capa | Rol | Notas |
|------|-----|-------|
| UI / Pages | Interfaz (Next.js / React) | Dashboard, Asistencia, Notificaciones |
| Servicios | Lógica negocio (asistencia, notifs, IA, export) | Adaptadores y helpers |
| Datos Locales | localStorage + backups | Claves normalizadas `smart-student-*` |
| Integraciones | Gemini / Firebase / Cloudinary | Encapsuladas en módulos independientes |

## 📁 Estructura sugerida (fragmento)
```
src/
  app/
    dashboard/
      asistencia/
      notificaciones/
  components/
  lib/
    ui-colors.ts
    storage/
    ia/
scripts/          # Scripts operativos/refactor v10
```

## ⚙️ Instalación
```bash
npm install
npm run dev
# http://localhost:3000 o puerto configurado
```

## 🔑 Variables de Entorno (ejemplo)
Crea `.env.local`:
```
GEMINI_API_KEY=tu_api_key
FIREBASE_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
```
Sin GEMINI_API_KEY se activa modo simulación IA.

## 🧠 Integración IA (Adaptador)
Interfaz propuesta:
```ts
interface AIAdapter {
  analyzeSystemState(input: SystemSnapshot): Promise<AIRecommendation[]>;
  summarizeRepairs(log: RepairLog[]): Promise<string>;
}
```
Implementación por defecto: `GeminiAdapter`. Puedes añadir `OpenAIAdapter` o `LocalMockAdapter`.

## 🕒 Asistencia (Criterio)
"Asistencia pendiente" por sección = existe ≥1 estudiante sin marcaje hoy. La notificación desaparece solo cuando todos marcados.

## 🔔 Notificaciones
- Campana agrupa: tareas, comentarios, asistencia, (opcional) alertas IA.
- Burbujas usan mismo origen de cálculo; evita duplicar lógica en UI.

## 🧼 Mantenimiento / Scripts
Incluye (o mover hacia):
- Limpieza de notificaciones fantasma.
- Limpieza de comentarios huérfanos.
- Reparación inmediata + log estructurado.
- Export/Import validado.

## 📦 Export / Import v10
Mejoras sugeridas:
- Validación de versión (`meta.version = 10`).
- Hash SHA-256 del payload para integridad.
- Migrador incremental (v9 → v10) que re-mapea claves si cambió nomenclatura.

## 🔄 Migración desde v9
1. Exporta backup con herramienta v9 (si existe `enhanced-export-system.js`).
2. Actualiza código a v10 (o clona repo v10).
3. Importa backup en panel de mantenimiento.
4. Ejecuta script migrador (si detecta `meta.version === 9`).

## 🧪 Tests (Sugeridos)
- Asistencia: cálculo secciones pendientes.
- Notificaciones: conteo unificado tras evento de marcado.
- IA: fallback modo simulación sin clave.
- Export: rechaza esquema inválido.

## 🛠 Scripts NPM (ejemplo a definir)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export:data": "node scripts/export-system.js",
    "repair": "node scripts/repair-system.js"
  }
}
```
(Ajusta según tu `package.json`).

## 🧩 Colores (Tokens)
Ubicación: `src/lib/ui-colors.ts`.
Usar funciones utilitarias (p.ej. `getColorVariant('attendance','pending')`). Evitar hardcode.

## 🚧 Roadmap Futuro (Propuesto)
- Modo offline completo (cache persistente + sync diferido).
- Panel de métricas internas.
- Dark mode automático.
- Web Push real para notificaciones fuera de foco.

## 🤝 Contribución
1. Crea rama: `feat/...` o `fix/...`
2. Commit descriptivo (Convencional Commit recomendado).
3. PR con checklist (migraciones, pruebas, QA visual).

## 🪪 Licencia
Propietario / Autor original: Felipe (superjf). Uso interno / educativo (ajusta si deseas licencia abierta).

## 📝 Notas
Este README v10 sirve como guía y plantilla. Actualiza las secciones marcadas como "asumido" con los detalles reales implementados en tu código.

---
**Objetivo v10**: Base sólida y extensible para próximas versiones (v11+), manteniendo integridad de datos y claridad operativa.
