# Configuración Firebase Admin SDK para Carga Masiva de Calificaciones

## Problema Actual
El endpoint `/api/firebase/bulk-upload-grades` requiere **Firebase Admin SDK** con credenciales del servidor para:
- Bypassear reglas de seguridad de Firestore.
- Crear actividades y calificaciones sin `PERMISSION_DENIED`.
- Procesar cargas masivas de 11k+ registros de forma eficiente.

Actualmente el sistema cae a un **fallback cliente** que falla con permisos.

## Solución: Configurar Credenciales Admin

### Paso 1: Obtener Service Account JSON de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto.
3. Click en ⚙️ (Settings) → **Project settings**.
4. Tab **Service accounts**.
5. Click **Generate new private key** → Descargar JSON.

El archivo se ve así:
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...",
  "client_email": "firebase-adminsdk-xyz@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://...",
  "universe_domain": "googleapis.com"
}
```

### Paso 2: Agregar Variables de Entorno

#### Opción A: .env.local (Dev Container/Local)

Crea o edita `.env.local`:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"tu-proyecto-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-...@tu-proyecto.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://...","universe_domain":"googleapis.com"}'

# Cliente Firebase (ya existentes)
NEXT_PUBLIC_USE_FIREBASE=true
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
```

**⚠️ IMPORTANTE**: En `FIREBASE_SERVICE_ACCOUNT_JSON`:
- Toda una línea (sin saltos reales).
- `\n` dentro del `private_key` escapados como `\\n`.
- Comillas simples exteriores.

#### Opción B: Archivo Separado (Recomendado para Producción)

1. Guarda el JSON descargado como `.firebase-service-account.json` en la raíz del proyecto.
2. Agregar a `.gitignore`:
   ```
   .firebase-service-account.json
   ```
3. En `.env.local`:
   ```bash
   FIREBASE_PROJECT_ID=tu-proyecto-id
   GOOGLE_APPLICATION_CREDENTIALS=/workspaces/superjf_v16/.firebase-service-account.json
   ```

### Paso 3: Reiniciar Servidor

```bash
# En terminal dentro del dev container:
pkill -f "next dev"
npm run dev
```

### Paso 4: Verificar Configuración

Abre en el navegador:
```
http://localhost:9002/api/firebase/admin-diagnostics
```

**Respuesta esperada (correcto)**:
```json
{
  "firebase": {
    "hasProjectId": true,
    "projectIdSource": "FIREBASE_PROJECT_ID",
    "hasServiceAccountJSON": true,
    "hasGoogleAppCreds": false,
    "env": {
      "FIREBASE_PROJECT_ID": "tu-proyecto-id",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "tu-proyecto-id",
      "GOOGLE_CLOUD_PROJECT": null,
      "GCLOUD_PROJECT": null
    },
    "initialized": true,
    "adminAppCount": 1,
    "error": null
  }
}
```

**Respuesta incorrecta (sin credenciales)**:
```json
{
  "firebase": {
    "hasProjectId": false,
    "projectIdSource": null,
    "hasServiceAccountJSON": false,
    "hasGoogleAppCreds": false,
    "initialized": false,
    "adminAppCount": 0,
    "error": "Could not load the default credentials..."
  }
}
```

### Paso 5: Probar Carga Masiva

1. Ve a **Admin → Configuración → Carga Masiva: Calificaciones**.
2. Sube el CSV.
3. Observa en la consola del navegador:
   ```
   ✅ Admin SDK listo - usando endpoint bulk-upload-grades
   ```
4. El modal debe mostrar:
   ```
   Carga completada
   Importadas 11520 calificaciones. Actividades: 2560
   ```
5. Verifica en Firestore Console:
   - `courses/{courseId}/grades/*`
   - `courses/{courseId}/activities/*`

## Troubleshooting

### Error: "Unable to detect a Project Id"
- Falta `FIREBASE_PROJECT_ID` o `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- Reinicia el servidor tras agregar.

### Error: "Could not load the default credentials"
- Falta `FIREBASE_SERVICE_ACCOUNT_JSON` o `GOOGLE_APPLICATION_CREDENTIALS`.
- Si usas JSON inline, verifica escape de `\n` → `\\n`.
- Si usas archivo, verifica ruta absoluta y permisos de lectura.

### Error: "permission-precheck: PERMISSION_DENIED" (aún en consola cliente)
- El fallback cliente se ejecutó (endpoint Admin falló).
- Revisa `/api/firebase/admin-diagnostics` → debe ser `initialized: true`.
- Si hay error en diagnostics, corrige variables y reinicia.

### Carga dice "Usando fallback de carga"
- Diagnóstico detectó Admin no disponible.
- Verifica que `initialized: true` en diagnostics.
- Puede que no se haya reiniciado el servidor tras agregar vars.

## Variables de Entorno Requeridas (Resumen)

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `FIREBASE_PROJECT_ID` | Server | ID del proyecto Firebase |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server | JSON completo del service account (inline, escapado) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Server | *Alternativa*: ruta a archivo .json |
| `NEXT_PUBLIC_USE_FIREBASE` | Cliente | `true` para habilitar Firestore |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Cliente | ID del proyecto (debe coincidir) |
| (resto NEXT_PUBLIC_FIREBASE_*) | Cliente | Config web SDK |

## Siguientes Pasos Tras Configurar

Una vez funcionando:
1. **Opcional**: Añadir autenticación al endpoint (token de admin en header).
2. **Opcional**: Eliminar fallback cliente para evitar confusiones.
3. **Opcional**: Normalizar notas 1–7 → 0–100 en el endpoint si lo necesitas.
4. **Opcional**: Pre-scan del CSV para validar filas antes de subir.

## Recursos

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Authentication](https://cloud.google.com/docs/authentication/getting-started)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
