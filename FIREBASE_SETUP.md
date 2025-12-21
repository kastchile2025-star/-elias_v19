# 🔥 Guía de Configuración de Firebase para Carga Masiva

## Paso 1: Obtener la Configuración del Cliente (Client SDK)

1. Ve a [Firebase Console](https://console.firebase.google.com/project/superjf1234-e9cbc/settings/general)
2. Baja hasta la sección **"Tus apps"**
3. Si no tienes una app web registrada:
   - Haz clic en el ícono **</>** (Web)
   - Registra tu app con un nombre (ej: "Smart Student Web")
   - **NO** selecciones "También configurar Firebase Hosting"
4. Verás un bloque de código JavaScript similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "superjf1234-e9cbc.firebaseapp.com",
  projectId: "superjf1234-e9cbc",
  storageBucket: "superjf1234-e9cbc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Copia estos valores y pégalos en el archivo `.env.local`

## Paso 2: Configurar Firebase Admin SDK (para API Server-Side)

### Opción A: Usar Archivo de Cuenta de Servicio (Recomendado)

1. Ve a [Cuentas de Servicio](https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk)
2. Haz clic en **"Generar nueva clave privada"**
3. Se descargará un archivo JSON similar a:

```json
{
  "type": "service_account",
  "project_id": "superjf1234-e9cbc",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@superjf1234-e9cbc.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40superjf1234-e9cbc.iam.gserviceaccount.com"
}
```

4. Copia TODO el contenido del archivo JSON (en una sola línea) y pégalo en:
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"superjf1234-e9cbc",...}
```

### Opción B: Usar Variables Individuales

Si prefieres no copiar el JSON completo, puedes usar las variables individuales:

```env
FIREBASE_PROJECT_ID=superjf1234-e9cbc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@superjf1234-e9cbc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE:** La clave privada debe incluir los saltos de línea como `\n`

## Paso 3: Configurar Firestore Database

1. Ve a [Firestore Database](https://console.firebase.google.com/project/superjf1234-e9cbc/firestore)
2. Si no está creada, haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de producción"** o **"Modo de prueba"**
   - **Modo de prueba**: Acceso público (solo para desarrollo)
   - **Modo de producción**: Requiere reglas de seguridad
4. Selecciona la ubicación (recomendado: `us-central1` o la más cercana a tus usuarios)

## Paso 4: Configurar Reglas de Seguridad

Si usas modo de producción, configura las reglas de Firestore:

1. Ve a [Reglas de Firestore](https://console.firebase.google.com/project/superjf1234-e9cbc/firestore/rules)
2. Configura las reglas según tus necesidades:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura autenticada
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // O para desarrollo (menos seguro):
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Paso 5: Reiniciar el Servidor de Desarrollo

Después de configurar las variables de entorno:

```bash
# Detener el servidor actual (Ctrl+C)
# Reiniciar el servidor
npm run dev
```

## Paso 6: Verificar la Conexión

1. Ve a la pestaña **"Carga Masiva"** en tu aplicación
2. Deberías ver el badge **"✅ SQL"** en verde
3. El contador debería mostrar **"2025: 0 records | Total: 0 records"**

## Troubleshooting

### Error: "Firebase deshabilitado"
- Verifica que `NEXT_PUBLIC_USE_FIREBASE=true` en `.env.local`
- Reinicia el servidor con `npm run dev`

### Error: "Firebase configuración incompleta"
- Verifica que todas las variables `NEXT_PUBLIC_FIREBASE_*` estén configuradas
- Verifica que los valores sean correctos (sin espacios extras)

### Error: "Permission denied" en Firestore
- Verifica las reglas de seguridad de Firestore
- Asegúrate de estar autenticado en la aplicación

### Error: "FIREBASE_SERVICE_ACCOUNT_KEY" inválido
- Verifica que el JSON esté en una sola línea
- Verifica que no haya caracteres especiales mal escapados
- Intenta usar las variables individuales como alternativa

## Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
