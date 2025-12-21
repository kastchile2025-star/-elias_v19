# 🔥 Configurar Reglas de Firestore - Solución Permisos

## Problema Actual
Los errores en consola indican:
```
FirebaseError: Missing or insufficient permissions
```

Esto significa que **Firestore está bloqueando** las operaciones de lectura/escritura porque las reglas de seguridad no permiten el acceso.

---

## ✅ Solución: Configurar Reglas de Firestore

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **`superjf1234-e9cbc`**
3. En el menú lateral, haz clic en **"Firestore Database"**
4. Ve a la pestaña **"Reglas" (Rules)**

---

### Paso 2: Configurar Reglas de Seguridad

Reemplaza las reglas actuales con estas reglas **TEMPORALES DE DESARROLLO**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // 🔥 REGLAS TEMPORALES PARA DESARROLLO
    // ⚠️ IMPORTANTE: Estas reglas permiten acceso completo
    // Para producción, debes implementar autenticación y restricciones
    
    // Permitir acceso completo a todas las colecciones principales
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Colecciones específicas del proyecto
    match /courses/{courseId} {
      allow read, write: if true;
    }
    
    match /1ro_basico/{docId} {
      allow read, write: if true;
    }
    
    match /activities/{activityId} {
      allow read, write: if true;
    }
    
    match /grades/{gradeId} {
      allow read, write: if true;
    }
    
    match /attendance/{attendanceId} {
      allow read, write: if true;
    }
    
    // Colecciones por año
    match /grades_{year}/{gradeId} {
      allow read, write: if true;
    }
    
    match /attendance_{year}/{attendanceId} {
      allow read, write: if true;
    }
    
    match /activities_{year}/{activityId} {
      allow read, write: if true;
    }
  }
}
```

---

### Paso 3: Publicar las Reglas

1. Haz clic en **"Publicar" (Publish)**
2. Confirma los cambios
3. Espera unos segundos para que se apliquen

---

### Paso 4: Verificar en tu Aplicación

1. **Refresca** la página de tu aplicación (F5)
2. Ve a **Admin → Configuración**
3. Intenta subir un archivo CSV de calificaciones
4. El botón **"Borrar SQL"** ahora debería funcionar sin errores

---

## 🔒 IMPORTANTE: Seguridad

### ⚠️ Advertencia

Estas reglas permiten **acceso completo sin autenticación**. Esto está bien para:
- ✅ Desarrollo local
- ✅ Pruebas internas
- ✅ Prototipos

### 🛡️ Para Producción

Cuando despliegues en producción, debes implementar reglas más seguras:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper: verificar que el usuario está autenticado
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función helper: verificar rol de administrador
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reglas por colección
    match /grades/{gradeId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /attendance/{attendanceId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /activities/{activityId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // Colecciones anuales
    match /grades_{year}/{gradeId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /attendance_{year}/{attendanceId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /activities_{year}/{activityId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

---

## 🧪 Verificar que Funciona

### En la Consola del Navegador (F12)

Ejecuta este comando para verificar la conexión:

```javascript
// Verificar estado de Firebase
console.log('🔥 Firebase habilitado:', process.env.NEXT_PUBLIC_USE_FIREBASE === 'true');
console.log('📦 Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

### Prueba de Carga

1. Descarga la plantilla CSV desde **"Descargar Plantilla CSV"**
2. Llena con datos de prueba (3-5 filas)
3. Sube el archivo con **"Subir a SQL"**
4. Deberías ver:
   - ✅ Modal de progreso
   - ✅ "X calificaciones guardadas"
   - ✅ Sin errores de permisos

---

## 📚 Referencias

- [Documentación de Reglas de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Guía de Seguridad de Firebase](https://firebase.google.com/docs/rules/basics)

---

## ❓ Preguntas Frecuentes

### ¿Por qué veo "0 registros" en la UI?

Si acabas de configurar Firebase, es normal. Una vez que subas datos con el botón "Subir a SQL", verás los registros.

### ¿Qué pasa si no configuro las reglas?

Sin reglas adecuadas, **todas las operaciones fallarán** con errores de permisos. Firebase bloquea todo por defecto para proteger tus datos.

### ¿Puedo usar Supabase en lugar de Firebase?

¡Sí! Para cambiar a Supabase:

1. Abre `.env.local`
2. Cambia `NEXT_PUBLIC_USE_FIREBASE=false`
3. Descomenta y configura las variables de Supabase:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```
4. Reinicia el servidor: `npm run dev`

---

## 🎯 Próximos Pasos

Una vez configuradas las reglas:

1. ✅ Sube datos de prueba
2. ✅ Verifica que el contador muestra los registros
3. ✅ Prueba el botón "Borrar SQL"
4. ✅ Revisa la pestaña "Calificaciones" en el dashboard

---

**¿Necesitas ayuda?** Revisa los logs de la consola del navegador (F12) para más detalles sobre cualquier error.
