# Carga masiva de calificaciones en Firestore (300k)

Esta guía explica cómo configurar Firebase (con cuenta Blaze) y ejecutar el importador `scripts/import-grades-firestore.js` para cargar cientos de miles de registros de manera segura y eficiente.

## 1) Crear/usar el proyecto Firebase (otra cuenta)

Si tu proyecto está en otro correo:
- Inicia sesión con esa cuenta y ve a la consola Firebase.
- Crea o selecciona el proyecto (p. ej. `superjf1234`).
- Activa Firestore en modo producción.
- Opcional: crea el Storage si vas a subir archivos.

## 2) Descargar la clave de servicio

En la consola del proyecto > Configuración del proyecto > Cuentas de servicio > Firebase Admin SDK > "Generar nueva clave privada". Guarda el JSON dentro de este repo, por ejemplo en `keys/superjf1234-service-account.json` (la carpeta `keys/` está recomendada en .gitignore si vas a versionar).

## 3) Variables de entorno

Copia `.env.firebase.template` a `.env.firebase` y completa una de las siguientes opciones:
- Recomendado: `GOOGLE_APPLICATION_CREDENTIALS` con la ruta absoluta del JSON.
- Alternativa: `FIREBASE_SERVICE_ACCOUNT_JSON` con el contenido del JSON.

En shells Linux:
```
export $(grep -v '^#' .env.firebase | xargs) 
```

## 4) Preparar el CSV

El script soporta encabezados flexibles (insensibles a acentos y mayúsculas). Nombres aceptados:
- nombre | student | studentName
- rut | studentId
- curso | course | courseId
- seccion | section | sectionId
- asignatura | subject | subjectId
- profesor | teacher | teacherName
- fecha | gradedAt | date
- tipo | type
- nota | score

Fechas: preferible `YYYY-MM-DD`. Notas: usa punto o coma, ambas se convierten.

## 5) Prueba en seco (opción --dry)

Para validar que todo parsea sin escribir en Firestore:
```
npm run import:grades -- --file=./datos/ejemplo.csv --year=2025 --dry
```

## 6) Ejecución real

```
npm run import:grades -- --file=./datos/grades-2025.csv --year=2025
```

El importador usa BulkWriter con reintentos automáticos y registro de progreso cada 5k. Inserta/mergea documentos en:
```
courses/{courseId}/grades/{docId}
```

## 7) Reglas y límites

- Plan Blaze requerido para altos QPS y cuotas superiores.
- BulkWriter maneja backoff y reintentos; si necesitas más throughput, puedes paralelizar por archivos (una instancia por CSV) pero evita escribir el mismo curso simultáneamente para no colisionar IDs.
- Mantén abierto el terminal hasta ver `Importación finalizada`.

## 8) Integración UI (pestaña Configuración)

- Para pruebas pequeñas desde la app, recomienda subir archivos chicos (<5k registros) y delegar cargas grandes a este script CLI.
- En Configuración, muestra el `projectId` activo y una verificación de conexión (puedes reutilizar `scripts/verificar-migracion-firebase.js`).

## 9) Problemas comunes

- `Faltan credenciales`: asegúrate de exportar las variables del `.env.firebase` en el terminal activo.
- `PERMISSION_DENIED`: revisa reglas de Firestore; para los scripts Admin no aplican, pero si usas SDK web sí.
- "Quota exceeded": reduce concurrencia (una ejecución a la vez) o divide el CSV.

---
Última actualización: 2025-10-12
