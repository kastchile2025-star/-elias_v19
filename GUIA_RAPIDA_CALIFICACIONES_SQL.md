# 🎯 Guía Rápida: Solución Inmediata para Carga Masiva de Calificaciones

## 🚨 Problema Detectado

Tu sistema muestra **"0 registros"** en calificaciones SQL y el botón "Borrar SQL" puede generar errores de permisos en Firebase Firestore.

---

## ✅ Solución en 3 Pasos

### Paso 1: Configurar Reglas de Firestore (5 minutos)

1. **Accede a Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Proyecto: `superjf1234-e9cbc`

2. **Ve a Firestore Database:**
   - Menú lateral → **Firestore Database**
   - Pestaña → **Reglas (Rules)**

3. **Pega estas reglas:**
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

4. **Haz clic en "Publicar" (Publish)**

⚠️ **Nota:** Estas son reglas de desarrollo. Ver `CONFIGURAR_FIRESTORE_REGLAS.md` para reglas de producción.

---

### Paso 2: Crear Colecciones en Firestore (1 minuto)

Firebase necesita que las colecciones existan antes de usarlas:

1. En **Firestore Database**, haz clic en **"Iniciar colección"**
2. Crea estas colecciones (una por una):
   - `grades` (con un documento de prueba)
   - `activities` (con un documento de prueba)
   - `attendance` (con un documento de prueba)

**Documento de prueba para cada una:**
```json
{
  "test": true,
  "created_at": "2025-10-14"
}
```

---

### Paso 3: Probar la Carga (2 minutos)

1. **Refresca tu aplicación** (F5)
2. Ve a **Admin → Configuración**
3. Encuentra la sección **"Carga masiva: Calificaciones (SQL)"**

4. **Descarga la plantilla CSV:**
   - Haz clic en **"Descargar Plantilla CSV"**

5. **Llena la plantilla con datos de prueba:**
   ```csv
   nombre,rut,curso,seccion,asignatura,fecha,tipo,nota,profesor
   Juan Pérez,12345678-9,1ro Básico,A,Matemáticas,2025-10-01,tarea,85,Prof. González
   María Silva,98765432-1,1ro Básico,A,Matemáticas,2025-10-01,tarea,92,Prof. González
   ```

6. **Sube el archivo:**
   - Haz clic en **"Subir a SQL"**
   - Selecciona tu archivo CSV
   - Observa el progreso en el modal

7. **Verifica:**
   - Deberías ver: **"2025: 2 registros"**
   - Sin errores en consola

---

## 🔍 Verificación Rápida

### En la Consola del Navegador (F12):

```javascript
// Verificar configuración
console.log('Firebase habilitado:', process.env.NEXT_PUBLIC_USE_FIREBASE);
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

### En Firebase Console:

1. Ve a **Firestore Database → Datos**
2. Deberías ver las colecciones con datos
3. Ejemplo: `grades` → documentos con las calificaciones subidas

---

## 📊 Datos de Prueba Completos

Si necesitas más datos para probar, usa este CSV:

```csv
nombre,rut,curso,seccion,asignatura,fecha,tipo,nota,profesor
Juan Pérez,12345678-9,1ro Básico,A,Matemáticas,2025-10-01,tarea,85,Prof. González
María Silva,98765432-1,1ro Básico,A,Matemáticas,2025-10-01,tarea,92,Prof. González
Pedro López,11111111-1,1ro Básico,A,Lenguaje,2025-10-02,prueba,78,Prof. Martínez
Ana Torres,22222222-2,1ro Básico,B,Ciencias,2025-10-03,evaluacion,90,Prof. Rodríguez
Carlos Ruiz,33333333-3,2do Básico,A,Historia,2025-10-04,tarea,88,Prof. Fernández
```

---

## ❌ Solución de Problemas Comunes

### Error: "Missing or insufficient permissions"

**Solución:** Verifica que las reglas de Firestore estén publicadas (Paso 1)

### Error: "Curso no encontrado"

**Solución:** Primero crea cursos y secciones en tu sistema antes de subir calificaciones

### Error: "Estudiante no encontrado"

**Solución:** Los estudiantes deben existir en el sistema. Crea usuarios de tipo "estudiante" primero

### Los contadores siguen en "0"

**Solución:** 
1. Abre la consola del navegador (F12)
2. Busca errores específicos
3. Verifica que el archivo CSV tenga el formato correcto

---

## 🎯 Flujo Correcto de Uso

1. **Configuración Inicial:**
   - ✅ Crear cursos (ej: "1ro Básico", "2do Básico")
   - ✅ Crear secciones (ej: "A", "B", "C")
   - ✅ Crear estudiantes
   - ✅ Configurar Firestore (reglas + colecciones)

2. **Carga de Calificaciones:**
   - ✅ Descargar plantilla
   - ✅ Llenar con datos reales
   - ✅ Subir CSV
   - ✅ Verificar contador

3. **Gestión:**
   - ✅ Ver calificaciones en dashboard
   - ✅ Borrar por año si es necesario
   - ✅ Exportar datos para respaldo

---

## 📞 ¿Siguen los problemas?

Si después de seguir estos pasos sigues teniendo problemas:

1. **Revisa la consola del navegador** (F12) para errores específicos
2. **Verifica Firebase Console** para confirmar que los datos se guardan
3. **Consulta** `CONFIGURAR_FIRESTORE_REGLAS.md` para más detalles

---

## 🚀 Funcionalidades Disponibles

Una vez configurado correctamente, tendrás:

- ✅ Carga masiva de calificaciones por CSV
- ✅ Almacenamiento en Firebase Firestore
- ✅ Contadores en tiempo real
- ✅ Borrado por año
- ✅ Exportación de datos
- ✅ Visualización en dashboard
- ✅ Sin límites de localStorage

---

**Estado Actual de tu Sistema:**
- Firebase habilitado: ✅ Sí
- Project ID: `superjf1234-e9cbc`
- Registros actuales: **0** (normal si acabas de configurar)
- Siguiente paso: **Configurar reglas de Firestore**
