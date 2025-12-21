# 🔥 CONFIGURACIÓN FIREBASE - Carga Masiva

## Estado Actual
- ✅ **Cliente Firebase**: Configurado en `.env.local`
- ⚠️ **Admin SDK**: Pendiente de configurar credenciales de cuenta de servicio

## Pasos para Activar la Carga Masiva a Firebase

### Paso 1: Obtener Credenciales del Admin SDK

1. Ve a [Firebase Console](https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk)

2. En el menú lateral, click en **⚙️ Configuración del proyecto**

3. Ve a la pestaña **"Cuentas de servicio"**

4. En la sección "Firebase Admin SDK", click en el botón **"Generar nueva clave privada"**

5. Se descargará un archivo JSON con las credenciales

### Paso 2: Configurar las Credenciales

**Opción A: Archivo JSON (Recomendado para desarrollo)**

1. Crea una carpeta `.secrets` en la raíz del proyecto:
   ```bash
   mkdir -p .secrets
   ```

2. Copia el archivo JSON descargado a `.secrets/firebase-admin.json`:
   ```bash
   mv ~/Downloads/superjf1234-e9cbc-*.json .secrets/firebase-admin.json
   ```

3. Asegúrate de que `.secrets/` esté en `.gitignore` (ya debería estarlo)

**Opción B: Variables de Entorno (Para producción/Vercel)**

Edita el archivo `.env.local` y añade las credenciales del JSON:

```bash
# Del archivo JSON, copia estos valores:
FIREBASE_PROJECT_ID=superjf1234-e9cbc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@superjf1234-e9cbc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...(contenido completo)...\n-----END PRIVATE KEY-----\n"
```

O alternativamente, el JSON completo en una sola línea:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"superjf1234-e9cbc","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### Paso 3: Reiniciar el Servidor de Desarrollo

```bash
# Detener el servidor actual (Ctrl+C) y reiniciar
npm run dev
```

### Paso 4: Verificar la Configuración

1. Abre la aplicación en el navegador
2. Ve a **Gestión de Usuarios** → **Carga Masiva**
3. El indicador de estado debe mostrar:
   - **Calificaciones**: "✅ Firebase" (verde)
   - **Asistencia**: "✅ Firebase" (verde)

## Verificar desde la Consola del Navegador

```javascript
// Verificar configuración del cliente Firebase
console.log('Firebase habilitado:', typeof window !== 'undefined' && localStorage.getItem('firebase-enabled'));

// Ver proveedor actual
fetch('/api/firebase/health')
  .then(r => r.json())
  .then(data => console.log('Estado Firebase:', data));
```

## Solución de Problemas

### "Firebase Admin no puede autenticarse"
- Verifica que las credenciales del Admin SDK estén correctamente configuradas
- Asegúrate de que el archivo `.secrets/firebase-admin.json` existe y tiene el formato correcto
- Revisa que las variables de entorno no tengan espacios adicionales

### "Desconectado" en Asistencia
- Esto indica que el Admin SDK no está inicializado correctamente
- Revisa los logs del servidor (terminal donde corre `npm run dev`)
- Busca mensajes que comiencen con "✅ [Firebase Admin]" o "❌ [Firebase Admin]"

### Los contadores muestran 0
- Después de configurar Firebase, los contadores se actualizarán al subir datos
- Click en "🔄 Actualizar" para forzar la recarga de contadores

## Estructura de Archivos de Configuración

```
peloduro_v7/
├── .env.local                      # Variables de entorno (CREADO ✅)
├── .secrets/
│   └── firebase-admin.json         # Credenciales Admin SDK (PENDIENTE ⚠️)
├── src/
│   ├── lib/
│   │   ├── firebase-config.ts      # Configuración cliente Firebase
│   │   ├── firebase-admin.ts       # Configuración Admin SDK (servidor)
│   │   └── database-config.ts      # Detección de proveedor BD
│   └── app/api/firebase/
│       ├── bulk-upload-grades/     # API carga masiva calificaciones
│       └── bulk-upload-attendance/ # API carga masiva asistencia
```

## Reglas de Firestore

Para que la carga masiva funcione, las reglas de Firestore deben permitir escritura. Ve a [Firestore Rules](https://console.firebase.google.com/project/superjf1234-e9cbc/firestore/rules) y verifica que tengas reglas como:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // O para desarrollo (TEMPORAL, no usar en producción):
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Resumen de Credenciales Configuradas

| Variable | Estado | Valor |
|----------|--------|-------|
| `NEXT_PUBLIC_USE_FIREBASE` | ✅ | `true` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | `AIzaSyCX9xW0DwSf...` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | `superjf1234-e9cbc` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | ⚠️ | Pendiente |
| `.secrets/firebase-admin.json` | ⚠️ | Pendiente |

---

📌 **Siguiente paso**: Genera las credenciales del Admin SDK desde Firebase Console y colócalas en `.secrets/firebase-admin.json`
