# 🔧 REGENERAR CREDENCIALES DE FIREBASE

## ❌ PROBLEMA ACTUAL
```
Error: 16 UNAUTHENTICATED: Request had invalid authentication credentials
```

Esto significa que las credenciales que tenemos **NO SON VÁLIDAS** o **ESTÁN MAL FORMATEADAS**.

## ✅ SOLUCIÓN: Regenerar Service Account

### PASO 1: Ve a Firebase Console
```
https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk
```

### PASO 2: Regenerar la clave privada
1. Haz clic en el botón **"Generate new private key"** (Generar nueva clave privada)
2. Confirma que entiendes que la clave anterior dejará de funcionar
3. Se descargará un nuevo archivo JSON (ejemplo: `superjf1234-e9cbc-firebase-adminsdk-xxxxx.json`)

### PASO 3: Copiar el contenido del JSON

**OPCIÓN A - Reemplazar el archivo:**
1. Sube el nuevo archivo JSON a la raíz del proyecto
2. Renómbralo a: `superjf1234-e9cbc-firebase-adminsdk.json`
3. Reinicia el servidor: `npm run dev`

**OPCIÓN B - Variable de entorno (MÁS RÁPIDO):**
1. Abre el nuevo archivo JSON descargado
2. Copia TODO el contenido (desde `{` hasta `}`)
3. Abre el archivo `.env.local`
4. Reemplaza el valor de `FIREBASE_SERVICE_ACCOUNT_JSON=` con el nuevo JSON
5. **IMPORTANTE:** El JSON debe estar en UNA SOLA LÍNEA (sin saltos de línea)
6. Reinicia el servidor: `npm run dev`

### PASO 4: Verificar que funciona

Ejecuta en la consola del navegador:
```javascript
fetch('/api/firebase/grade-counters?year=2025')
  .then(r => r.json())
  .then(d => console.log('✅ FUNCIONA:', d))
  .catch(e => console.error('❌ ERROR:', e));
```

Si ves datos sin error "UNAUTHENTICATED", ¡LAS CREDENCIALES FUNCIONAN!

---

## 🔍 DIAGNÓSTICO TÉCNICO

**Causas más comunes del error 16 UNAUTHENTICATED:**

1. **Service Account deshabilitado/eliminado** - 90% probabilidad
2. **private_key mal formateado** - El `\n` debe estar como literal `\n`, no como salto de línea real
3. **Clave revocada** - Si regeneraste la clave anteriormente sin actualizarla aquí
4. **Permisos insuficientes** - El Service Account necesita rol "Firebase Admin SDK Administrator"

**Verificar en Firebase Console:**
- Project: `superjf1234-e9cbc`
- Service Account: `firebase-adminsdk-fbsvc@superjf1234-e9cbc.iam.gserviceaccount.com`
- Debe tener estado: ✅ **Enabled** (Habilitado)
- Debe tener rol: **Firebase Admin SDK Administrator Service Agent**

---

## ⚡ SCRIPTS DE RESPALDO

Si regenerar las credenciales no funciona, el problema puede ser de permisos:

### Verificar permisos del Service Account:
1. Ve a: https://console.cloud.google.com/iam-admin/iam?project=superjf1234-e9cbc
2. Busca: `firebase-adminsdk-fbsvc@superjf1234-e9cbc.iam.gserviceaccount.com`
3. Debe tener como mínimo:
   - ✅ **Cloud Datastore User**
   - ✅ **Firebase Admin SDK Administrator Service Agent**

Si no los tiene, agrégalos manualmente.

---

## 📞 AYUDA ADICIONAL

**Si después de regenerar las credenciales el error persiste:**

1. Verifica que el archivo `.env.local` se guardó correctamente
2. Reinicia el servidor completamente:
   ```bash
   pkill -f "next dev"
   npm run dev
   ```
3. Borra la caché de Next.js:
   ```bash
   rm -rf .next
   npm run dev
   ```
4. Verifica que no haya espacios o caracteres raros en el JSON

**Logs esperados después de configurar correctamente:**
```
✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_JSON
🔧 ProjectId detectado: superjf1234-e9cbc
✅ Firebase Admin inicializado correctamente
```

---

## 🎯 RESUMEN RÁPIDO

1. 🔑 **Regenera la clave:** https://console.firebase.google.com/project/superjf1234-e9cbc/settings/serviceaccounts/adminsdk
2. 📋 **Copia el JSON:** Contenido completo del archivo descargado
3. 📝 **Pega en .env.local:** Reemplaza `FIREBASE_SERVICE_ACCOUNT_JSON=...`
4. 🔄 **Reinicia servidor:** `pkill -f "next dev" && npm run dev`
5. ✅ **Prueba:** `fetch('/api/firebase/grade-counters?year=2025')`

**Tiempo estimado:** 2-3 minutos
