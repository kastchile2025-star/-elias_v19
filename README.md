# SMART STUDENT WEB — Plataforma Integral de Gestión Estudiantil (v14)

**Versión:** v14 — Evaluaciones Inteligentes Específicas por Tema y Optimización de Almacenamiento.

---

## ✨ Resumen rápido
- **Objetivo:** Generar evaluaciones educativas específicas por tema usando IA (Genkit + Gemini) y mejorar la robustez del almacenamiento local.
- **Stack:** Next.js 15 (React 18 + TypeScript), Tailwind CSS, Radix UI, Genkit + Google Generative AI (Gemini), Cloudinary, Tesseract.js.
- **Dev:** puerto 9002 (Turbopack).

---

## 🧠 Novedades principales (v14)
- **Evaluaciones por tema:** Prompts y flujos IA optimizados para producir preguntas específicas y pedagógicamente relevantes.
- **Base de conocimientos educativa:** Conteúdos por materia/tema para mejorar la calidad de las preguntas.
- **Manejo de QuotaExceededError:** Límites, limpieza preventiva y fallback para evitar pérdidas de datos por localStorage.
- **Validaciones y UX:** Verificación robusta de curso/asignatura/tema y feedback claro al usuario.

---

## ⚙️ Instalación rápida
```bash
git clone <repo>
cd <repo>
npm install
cp .env.example .env.local
# Añade tu API key de Google AI en .env.local
npm run dev
# http://localhost:9002
```

### Variables de entorno importantes
```bash
GOOGLE_API_KEY=tu_google_ai_api_key
NEXT_PUBLIC_API_URL=http://localhost:9002
CLOUDINARY_CLOUD_NAME=...
```

---

## 📁 Estructura clave (resumen)
- `src/ai/` → Flujos y configuración IA (Genkit)
- `src/app/dashboard/evaluacion/` → Módulo de generación de evaluaciones
- `src/api/extract-pdf-content/` → Extracción y parsing de PDF
- `src/lib/` → Utilidades y datos (e.g., books-data)

---

## 🛠 Comandos útiles
- `npm run dev` — Desarrollo (Turbopack)
- `npm run build` — Construir producción
- `npm run genkit:dev` — Genkit local (IA)
- `npm run lint` / `npm run typecheck`

---

## 🤝 Contribuir
1. Fork
2. `git checkout -b feature/mi-cambio`
3. Hacer commits claros
4. Crear PR

---

## ❗ Notas y troubleshooting
- Si ves **QuotaExceededError**, el sistema intenta reducir y recuperar datos automáticamente; para recuperación manual puedes limpiar claves específicas de `localStorage`.
- Verifica que `GOOGLE_API_KEY` esté presente para generar contenido IA real.

---

## 📄 Licencia
MIT — ver `LICENSE`.

---

¿Quieres que formatee este README con más secciones (Ej.: ejemplos de API, pantallazos, tabla de KPIs) o lo dejamos así por ahora? ❤️