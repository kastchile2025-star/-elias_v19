# Pruebas (Profesor) con IA y Streaming SSE

Este documento resume las mejoras implementadas para la pestaña Pruebas del Profesor en la versión v10.

## 🚀 Qué se añadió
- Generación de preguntas con IA en servidor (compatible con mock cuando no hay Google API Key).
- Streaming de progreso en vivo desde el servidor al navegador mediante SSE (Server‑Sent Events).
- UI con barra de porcentaje y tooltip localizado (ES/EN); al 100% muestra un check verde “Lista/Ready”.
- Integración de OCR en el modal “Revisar” con textos localizados.

## 🔌 Endpoints
- POST `/api/tests/generate`
  - Genera el contenido en una llamada única (sin streaming). Útil para integraciones directas o pruebas.
  - Body JSON: `{ topic, bookTitle, language: 'es'|'en', questionCount, timeLimit }`

- GET `/api/tests/generate/stream`
  - Devuelve eventos SSE con el progreso y el resultado final.
  - Query: `?topic=...&bookTitle=...&language=es|en&questionCount=15&timeLimit=120`
  - Eventos:
    - `progress` → `{ percent: number, phase: 'phase1'|'phase2'|'phase3'|'phase4' }`
    - `done` → `{ ok: true, data: { evaluationTitle, questions[] } }`
    - `error` → `{ message }`

## 🧩 UI (Profesor > Pruebas)
- Al pulsar “Generar Prueba” se crea un item con `status: 'generating'` y `progress: 0`.
- Se abre un `EventSource` a `/api/tests/generate/stream` y se actualiza la barra con cada `progress`.
- En `done`, las preguntas del servidor se mapean al modelo local y el item pasa a `status: 'ready', progress: 100`.
- Si hay fallo del stream, se usa un generador local como fallback y se marca listo para no bloquear al usuario.

## 🌐 i18n
- Claves utilizadas para el historial de pruebas:
  - `testsReady` → Tooltip del check verde (ES: "Lista", EN: "Ready").
  - `testsProgressPhase1..4` → Tooltip de fases de progreso.
- El modal “Revisar” usa claves `testsReview*` (selector de archivo, OCR, mensajes y accesibilidad).

## 🧪 Cómo probar
1) En Dashboard > Pruebas, selecciona Curso, Sección, Asignatura y Tema.
2) Define cantidades de preguntas (TF/MC/MS; Desarrollo es local opcional).
3) Click “Generar Prueba”. Observa el progreso en vivo y el check final.
4) Click “Vista” para previsualizar y exportar PDF (paginación mejorada, sin cortes).
5) Click “Revisar (PDF/Imagen)” para probar OCR.

## 🛡️ Notas
- Si `GOOGLE_API_KEY` no está configurada, el servidor usa generación mock/fallback. El flujo y el streaming se mantienen.
- SSE es un canal servidor→cliente, eficiente y sencillo. Si se necesita bidireccionalidad, considerar WebSockets.
