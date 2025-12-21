# Configuración de Firebase (Cliente + Admin)

Esta guía conecta la pestaña de Carga Masiva con Firestore usando el SDK de Admin en los endpoints del servidor y el SDK de cliente en el navegador.

## 1) Variables de entorno

Crea un archivo `.env.local` (no se commitea) tomando como base `.env.local.example`.

Frontend (Cliente):
- NEXT_PUBLIC_USE_FIREBASE=true
- NEXT_PUBLIC_FIREBASE_API_KEY=...
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
- NEXT_PUBLIC_FIREBASE_APP_ID=...

Backend (Admin SDK): elige UNA opción
- Opción A: FIREBASE_SERVICE_ACCOUNT_JSON con el JSON en una sola línea
- Opción B: FIREBASE_SERVICE_ACCOUNT_FILE con la ruta absoluta del archivo JSON
- (Opcional) FIREBASE_PROJECT_ID para fijar el projectId

Reinicia el servidor de desarrollo tras cambiar `.env.local`.

## 2) Estructura en Firestore

Los endpoints guardan calificaciones en subcolecciones por curso:
- courses/{courseId}/grades/{docId}
- courses/{courseId}/activities/{activityId}
- Progreso de importación: imports/{jobId}

No necesitas composites para los conteos usados:
- collectionGroup('grades').where('year','==',AÑO) – índice de campo simple automático
- Aggregate count() – soportado por Admin SDK recientes

## 3) Seguridad

- El SDK de Admin ignora reglas de seguridad (permite tareas administrativas desde el servidor). Asegúrate de proteger el acceso a estos endpoints en producción (auth/rol admin). En dev local no es crítico.
- No comitas la cuenta de servicio. Usa variables de entorno o un archivo ignorado por git (ya está en `.gitignore`).

## 4) Endpoints relevantes

- POST /api/firebase/bulk-upload-grades: carga masiva desde CSV (usa Admin SDK)
- GET  /api/firebase/grade-counters?year=YYYY: contadores por año y total
- POST /api/firebase/delete-grades-by-year?year=YYYY&doit=1: borrado por año (modo completo o paginado)
- POST /api/firebase/delete-all-grades?doit=1: borrado total
- GET  /api/firebase/health: verificación rápida de credenciales y acceso a Firestore

## 5) Verificación rápida

1) Visita /api/firebase/health en el navegador: debe responder { ok: true, projectId, canRead: true }
2) En la pestaña Admin → Carga Masiva:
   - Sube un CSV pequeño. Verás el modal de progreso y el documento de imports/{jobId} actualizándose.
   - Usa el botón "Actualizar" para refrescar contadores; también se consultan vía /api/firebase/grade-counters.

## 6) Consejos de operación

- Archivos >50K filas pueden tardar varios minutos. El endpoint usa lotes de 200 y registra progreso en imports/{jobId}.
- Si el fetch devuelve timeout o respuesta vacía, la UI activará un sondeo de contadores para confirmar la carga en segundo plano.
- Para borrar datos masivos, usa los endpoints de delete en modo paginado para evitar timeouts.

## 7) Problemas comunes

- 500 "Firebase Admin no inicializado": revisa FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_FILE.
- "permission denied" en cliente: recuerda que el cliente usa reglas; el servidor (Admin) no. Ajusta reglas solo si harás lecturas desde el cliente.
- Counters en 0: espera unos segundos y pulsa "Actualizar"; las agregaciones pueden tardar levemente tras escrituras masivas.
