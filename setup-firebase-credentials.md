# 🔥 Configuración URGENTE de Credenciales Firebase

## ⚠️ ERROR ACTUAL
El sistema no puede autenticarse con Firebase porque faltan las credenciales reales.

## 📋 SOLUCIÓN RÁPIDA - Sigue estos pasos:

### 1️⃣ Obtener la Configuración Web de Firebase

Ve a esta URL exacta:
**https://console.firebase.google.com/project/superjf1234-e9cbc/settings/general**

1. Desplázate hacia abajo hasta **"Tus apps"**
2. Si ya tienes una app web, haz clic en ella
3. Si NO tienes app web:
   - Haz clic en el ícono **</>** (Web)
   - Dale un nombre: "Smart Student Web"
   - **NO** marques "Firebase Hosting"
   - Haz clic en "Registrar app"

4. Verás un código JavaScript como este:

```javascript
// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "superjf1234-e9cbc.firebaseapp.com",
  projectId: "superjf1234-e9cbc",
  storageBucket: "superjf1234-e9cbc.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 2️⃣ Actualizar el archivo .env.local

Abre el archivo `.env.local` y reemplaza estas líneas:

```env
# ANTES (con placeholders):
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key-here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# DESPUÉS (con tus valores reales de firebaseConfig):
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 3️⃣ Obtener la Cuenta de Servicio (Para el Servidor)

Ve a esta URL:
**https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk**

1. Haz clic en el botón **"Generar nueva clave privada"**
2. Se descargará un archivo JSON (ej: `superjf1234-e9cbc-firebase-adminsdk-xxxxx.json`)
3. Abre ese archivo con un editor de texto
4. Copia TODO el contenido del archivo (debe ser un objeto JSON grande)
5. En `.env.local`, reemplaza esta línea:

```env
# ANTES:
FIREBASE_SERVICE_ACCOUNT_KEY={}

# DESPUÉS (todo en UNA sola línea, sin saltos de línea):
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"superjf1234-e9cbc","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...","client_email":"firebase-adminsdk-fbsvc@superjf1234-e9cbc.iam.gserviceaccount.com",...}
```

**IMPORTANTE**: 
- Debe estar en UNA sola línea
- NO agregues espacios ni saltos de línea
- Mantén los `\n` dentro de la private_key tal como están

### 4️⃣ Verificar Firestore Database

Ve a:
**https://console.firebase.google.com/project/superjf1234-e9cbc/firestore**

- Si dice "Crea tu base de datos":
  1. Haz clic en "Crear base de datos"
  2. Selecciona "Comenzar en **modo de prueba**" (para desarrollo)
  3. Selecciona ubicación: **us-central1** (o la más cercana)
  4. Haz clic en "Habilitar"

- Si ya existe la base de datos, verifica que esté en modo activo

### 5️⃣ Reiniciar el Servidor

**MUY IMPORTANTE**: Después de editar `.env.local`, debes reiniciar el servidor:

```bash
# En la terminal, presiona Ctrl+C para detener el servidor
# Luego ejecuta:
npm run dev
```

### 6️⃣ Verificar que Funciona

1. Ve a tu aplicación en: **Gestión de Usuarios > Carga Masiva**
2. Deberías ver:
   - Badge **"✅ SQL"** en verde (no rojo)
   - Contadores funcionando
   - Botón "Subir a SQL" habilitado

---

## 🆘 Si tienes problemas:

### Problema: "Permission denied" en Firestore
**Solución**: Ve a las reglas de Firestore y configúralas en modo prueba:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Problema: Sigue sin funcionar después de configurar
**Solución**: 
1. Verifica que NO haya espacios extra en las variables
2. Verifica que la clave JSON esté en UNA sola línea
3. Reinicia el servidor con `npm run dev`
4. Limpia la caché del navegador (Ctrl+Shift+R)

### Problema: Error "Invalid format"
**Solución**: La clave privada debe mantener los `\n`:
```
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
```

---

## 📞 Necesitas más ayuda?

Comparte el error exacto que aparece en la consola después de:
1. Configurar las credenciales
2. Reiniciar el servidor
3. Intentar subir un archivo

