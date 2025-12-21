# SMART STUDENT v12

Plataforma escolar en Next.js 15 (App Router) con integración de IA (Gemini/Genkit) para profesores y administradores. Esta versión consolida mejoras de rendimiento, estabilidad y UX, e incorpora generación de contenidos con IA para presentaciones, evaluaciones, resúmenes y mapas mentales.

## 🧭 Índice rápido
- Instalación y ejecución
- Variables de entorno (IA e imágenes)
- Módulos y funcionalidades clave
- IA: endpoints y flujos
- Traducciones (i18n)
- Novedades y mejoras de v12
- Solución de problemas

---

## 🚀 Instalación y ejecución
1) Requisitos
- Node.js 18+
- npm 9+

2) Instalar dependencias
```bash
npm install
```

3) Configurar entorno local
Crea un archivo `.env.local` con tus claves (ver sección Variables de entorno). Ejemplo mínimo:
```env
# Clave de IA (obligatoria)
GOOGLE_API_KEY=AIza...tu_clave_real
# Alternativas reconocidas por el código (opcional)
GOOGLE_AI_API_KEY=AIza...tu_clave_real
GEMINI_API_KEY=AIza...tu_clave_real
```

4) Iniciar desarrollo (puerto 9002 por defecto)
```bash
npm run dev
```

---

## 🔐 Variables de entorno
Archivo de referencia: `.env` (plantilla) y `.env.local` (tu configuración local, no versionado).

Obligatorias (IA)
- GOOGLE_API_KEY: clave de Google AI Studio (formato AIza...). El backend también acepta GOOGLE_AI_API_KEY o GEMINI_API_KEY y usa la primera disponible.

Opcionales (búsqueda de imágenes para Presentaciones/Comunicaciones)
- PHOTOM_API_KEY y PHOTOM_API_URL (o SMART_API_KEY / SMART_API_URL)
- PEXELS_API_KEY
- UNSPLASH_ACCESS_KEY
- GOOGLE_CSE_ID + GOOGLE_API_KEY (Google Custom Search)

Notas
- No compartas claves reales en commits ni en issues.
- Tras modificar .env.local, reinicia el servidor de desarrollo.

---

## 📚 Módulos y funcionalidades
Principales páginas en `src/app/dashboard`.

Mod Profesor
- Presentaciones (`/dashboard/slides`)
  - Generación con IA (contenido guiado por tema/asignatura e idioma ES/EN)
  - Descarga PPTX y DOCX (reporte detallado)
  - Diseños múltiples (temas visuales) y previsualización
  - Búsqueda de imágenes con proveedores externos o fallback sin API
  - Compartir presentación con estudiantes (notificación interna)
- Evaluación (`/dashboard/evaluacion` y APIs de generación)
  - Generación de preguntas (multiple choice, multiple select, verdadero/falso)
  - Distribución exacta de tipos y validación de JSON devuelto por la IA
  - Fallback local cuando la IA no está disponible
- Mapas mentales (`/dashboard/mapa-mental`)
  - Creación de mapas por tema (API `mind-map`)
- Tareas, Calificaciones, Asistencia, Comunicaciones y más
  - Paneles y flujos afinados; correcciones masivas de notificaciones, filtros y estados

Admin
- Gestión de usuarios/asignaciones, sincronizaciones y herramientas de soporte

Otras utilidades
- Exportaciones (PDF/PPTX/DOCX) con `pptxgenjs`, `docx`, `html2canvas` y `jspdf`
- OCR con `tesseract.js` (cuando aplica)

---

## 🤖 IA: endpoints y flujos
- Estado de IA: `GET /api/ai-status`
  - Verifica presencia/validez de GOOGLE_API_KEY y reporta estado
- Presentaciones: `POST /api/generate-slides`
  - Usa Genkit/Gemini con esquema Zod y reintentos; fallback local enriquecido si no hay clave
  - Enriquecimiento de imágenes vía `GET /api/search-images` + `GET /api/image-proxy`
- Preguntas de evaluación: `POST /api/generate-questions`
  - Genera cuestionarios con distribución exacta por tipo; fallback local sin IA
- Resúmenes/otros: `generate-summary`, `generate-evaluation`, `mind-map`, etc.

Modelos y librerías relevantes
- `@genkit-ai/googleai`, `@genkit-ai/next`, `@google/generative-ai`, `genkit`

---

## 🌍 Traducciones (i18n)
- Archivos: `src/locales/es.json` y `src/locales/en.json`
- Uso: `translate('key')` con fallback en ES/EN
- Corrección aplicada en v12: en la pestaña Presentaciones la etiqueta del hero usaba `slidesFeatureAi` (minúscula-i). Se corrigió a `slidesFeatureAI`, que existe en ambos locales.
  - Archivo actualizado: `src/app/dashboard/slides/page.tsx`
  - Clave en locales: `slidesFeatureAI`

Para añadir traducciones
1. Agrega la clave en `es.json` y `en.json`
2. Usa `translate('miNuevaClave')` en el componente

---

## 🆕 Novedades y mejoras v12 (resumen)
- Integración de IA unificada con claves alternativas (GOOGLE_API_KEY / GOOGLE_AI_API_KEY / GEMINI_API_KEY)
- Presentaciones con IA: esquema validado, reintentos, fallback local y proveedor de imágenes multi-fuente
- Exportaciones PPTX/PDF/DOCX más robustas y con estilos
- Correcciones extensivas en notificaciones (orden, estados, duplicados, conteos, burbujas)
- Estabilidad en paneles de tareas/evaluaciones/estudiantes y filtros por curso/sección
- Traducciones pulidas y claves unificadas en ES/EN
- Mejoras de UI/UX: layout, badges, hover, centrados, colores y accesibilidad
- Herramientas de admin/sincronización y scripts de soporte para datos reales

---

## 🛠️ Solución de problemas
Indicador de IA en rojo
- Causa: falta de `GOOGLE_API_KEY` o formato inválido
- Verifica `.env.local` y reinicia `npm run dev`
- Endpoint de diagnóstico: `/api/ai-status`

Imágenes que no cargan en Presentaciones
- Asegura tener al menos un proveedor configurado (Photom/Smart, Pexels, Unsplash o Google CSE)
- Sin claves, se usa un fallback público (Unsplash Featured) mediante proxy interno

Traducción faltante
- Agrega la clave en ambos locales y verifica su uso exacto en componentes

---

## 📄 Licencia y buenas prácticas
- No expongas claves reales en commits
- Usa `.env.local` durante desarrollo
- Mantén consistencia de tipos y ejecuta `npm run typecheck` para validar

---

## 📌 Atajos útiles
- Desarrollo: `npm run dev`
- Build: `npm run build`
- Inicio producción: `npm start`
- Typecheck: `npm run typecheck`

---

Hecho con Next.js, TypeScript y Genkit (Google AI).
