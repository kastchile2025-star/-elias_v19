# ⚡ COMANDOS RÁPIDOS - Copiar y Pegar

## 1️⃣ Verificar Archivos de Configuración
```bash
cat .env.local | grep FIREBASE_PROJECT_ID
# Debe mostrar: superjf1234-e9cbc

ls -lh keys/
# Debe mostrar: superjf1234-service-account.json
```

## 2️⃣ Cargar Variables Backend
```bash
export $(grep -v '^#' .env.firebase | xargs)
echo "✅ Variables cargadas: $GOOGLE_APPLICATION_CREDENTIALS"
```

## 3️⃣ Verificar Conexión Firebase Admin
```bash
npm run firebase:check
```

## 4️⃣ Probar Importador (Modo Seco)
```bash
npm run import:grades -- --file=./datos-ejemplo.csv --year=2025 --dry
```

## 5️⃣ Importación Real (10 registros de prueba)
```bash
npm run import:grades -- --file=./datos-ejemplo.csv --year=2025
```

## 6️⃣ Verificar Datos en Firestore
```bash
node scripts/verificar-migracion-firebase.js
```

## 7️⃣ Reiniciar Servidor Dev
```bash
# En terminal donde corre dev: Ctrl+C
npm run dev
```

## 8️⃣ Limpiar Caché Navegador (consola del navegador)
```javascript
// Copiar y pegar en DevTools Console (F12)
localStorage.clear();
sessionStorage.clear();
console.log('✅ Caché limpiado. Recarga la página.');
```

## 9️⃣ Verificar Proyecto Activo (consola del navegador)
```javascript
console.log({
  project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 20) + '...',
  enabled: process.env.NEXT_PUBLIC_USE_FIREBASE
});
// Debe mostrar:
// { project: "superjf1234-e9cbc", apiKey: "AIzaSyCX9xW0DwSf-5B9...", enabled: "true" }
```

## 🔟 Importación Masiva (300k registros)
```bash
# Prueba en seco primero
npm run import:grades -- --file=./path/to/grades-300k.csv --year=2025 --dry

# Si todo OK, ejecutar real
npm run import:grades -- --file=./path/to/grades-300k.csv --year=2025
```

## 🆘 Troubleshooting Rápido

### Error: "Faltan credenciales"
```bash
# Verificar archivo
ls -lh keys/superjf1234-service-account.json

# Re-cargar variables
export $(grep -v '^#' .env.firebase | xargs)
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### Error: "Quota exceeded"
```bash
# 1. Verificar proyecto correcto
cat .env.local | grep PROJECT_ID

# 2. Reiniciar servidor
# Ctrl+C en terminal dev, luego:
npm run dev

# 3. Limpiar caché navegador (F12 → Application → Clear site data)
```

### Verificar Reglas Publicadas
```bash
# En Firebase Console → Firestore → Reglas
# Debe mostrar las reglas con:
# - allow read: if true (para courses)
# - allow write: if request.auth != null
```

## 📊 Monitoreo

### Ver Uso en Firebase Console
```
https://console.firebase.google.com/project/superjf1234-e9cbc/usage
```

### Ver Datos en Firestore
```
https://console.firebase.google.com/project/superjf1234-e9cbc/firestore
```

---
**Tip**: Guarda estos comandos para uso frecuente durante la migración.
