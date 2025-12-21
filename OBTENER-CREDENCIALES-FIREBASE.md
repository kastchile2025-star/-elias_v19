![v](image-1.png)# 🔥 Cómo Obtener las Credenciales de Firebase

## Paso 1: Obtener la configuración Web SDK (API Key, App ID, etc.)

Desde donde estás ahora en la consola de Firebase:

1. **Baja en la misma página** donde estás (Configuración > General)
2. Busca la sección **"Tus aplicaciones"** o **"Your apps"**
3. Si no tienes una app web creada:
   - Click en el botón **"</>"** (ícono de código web)
   - Dale un nombre (ejemplo: "SuperJF Web")
   - Click en "Registrar app"
4. Verás un código JavaScript como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "superjf1234-e9cbc.firebaseapp.com",
  projectId: "superjf1234-e9cbc",
  storageBucket: "superjf1234-e9cbc.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Necesitas copiar estos valores:**
- `apiKey` → Para `NEXT_PUBLIC_FIREBASE_API_KEY`
- `messagingSenderId` → Para `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → Para `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Paso 2: Generar la Clave de Cuenta de Servicio (Service Account Key)

1. En la consola de Firebase, ve a:
   - **Configuración del proyecto** (el ícono de engranaje ⚙️)
   - Click en **"Cuentas de servicio"** o **"Service accounts"** (en el menú superior)

2. En la parte inferior verás:
   - **"SDK Admin de Firebase"** o **"Firebase Admin SDK"**
   - Click en el botón **"Generar nueva clave privada"** o **"Generate new private key"**

3. Se descargará un archivo JSON con este formato:

```json
{
  "type": "service_account",
  "project_id": "superjf1234-e9cbc",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@superjf1234-e9cbc.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Este archivo completo es lo que necesitas para `FIREBASE_SERVICE_ACCOUNT_KEY`**

---

## Paso 3: Actualizar .env.local

Una vez que tengas todos los valores, **copia todo el JSON de la cuenta de servicio EN UNA SOLA LÍNEA** (elimina los saltos de línea del archivo).

Ejemplo de cómo debe quedar en `.env.local`:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"superjf1234-e9cbc","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxxx@superjf1234-e9cbc.iam.gserviceaccount.com",...}
```

⚠️ **IMPORTANTE**: Los `\n` dentro de las comillas deben convertirse a `\\n` (doble barra invertida).

---

## 🎯 Resumen de lo que necesitas:

| Variable | De dónde obtenerlo |
|----------|-------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | firebaseConfig.apiKey (Paso 1) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | firebaseConfig.messagingSenderId (Paso 1) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | firebaseConfig.appId (Paso 1) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Archivo JSON completo (Paso 2) |

---

## 📝 Después de actualizar .env.local:

1. Guarda el archivo
2. Ejecuta: `node verify-firebase-config.js`
3. Verifica que todos tengan ✅
4. Reinicia el servidor: `npm run dev`
5. Prueba la carga masiva

---

¿Necesitas ayuda con algún paso específico?
