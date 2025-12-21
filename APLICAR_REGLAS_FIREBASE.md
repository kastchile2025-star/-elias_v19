# 🔥 Aplicar Reglas de Firebase - GUÍA RÁPIDA

## 🎯 Problema Actual
```
❌ FirebaseError: Missing or insufficient permissions
```

## ✅ Solución en 3 Pasos (2 minutos)

### Paso 1️⃣: Abrir Firebase Console
1. Ve a: https://console.firebase.google.com
2. Selecciona proyecto: **superjf1234-e9cbc**
3. Click en **Firestore Database** (menú izquierdo)
4. Click en pestaña **"Reglas"** o **"Rules"**

### Paso 2️⃣: Copiar y Pegar las Reglas

**OPCIÓN RÁPIDA (Para desarrollo - 30 segundos)**

Borra TODO el contenido actual y pega esto:

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

### Paso 3️⃣: Publicar
1. Click en botón **"Publicar"** (Publish) - botón azul arriba a la derecha
2. Confirma la publicación
3. Espera 30 segundos
4. **Refresca tu aplicación web** (F5)

---

## ✅ Verificación

Después de refrescar, en la consola del navegador deberías ver:

```
✅ [Firebase] Total de calificaciones: 100
✅ [Firebase] Total encontrado: 100 calificaciones para año 2025
📚 Encontrados 12 cursos en Firebase
```

Y **NO** deberías ver:
```
❌ Missing or insufficient permissions  ← Este error desaparece
```

---

## 🔐 Para Producción Después

Cuando estés listo para producción, reemplaza las reglas con las del archivo `firestore.rules` del proyecto, que incluyen:
- ✅ Autenticación requerida
- ✅ Control por roles (admin/teacher/student)
- ✅ Seguridad apropiada

**Pero por ahora, usa las reglas simples de arriba para continuar desarrollando.**

---

## 📱 Acceso Rápido

**Firebase Console Direct Link:**
```
https://console.firebase.google.com/project/superjf1234-e9cbc/firestore/rules
```

---

## ⏱️ Tiempo Total: 2 minutos
1. Abrir console (30 seg)
2. Pegar reglas (30 seg)
3. Publicar (30 seg)
4. Esperar + Refrescar (30 seg)

**¡Hazlo ahora y el error desaparecerá! 🚀**
