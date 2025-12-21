# Guía Rápida: Configuración Firebase Blaze (superjf1234-e9cbc)

## ✅ Cambios Aplicados
1. ✅ Actualizado `.env.local` con nuevo proyecto Blaze
2. ✅ Habilitada persistencia de caché en `firebase-config.ts`
3. ✅ Creado `.env.firebase` para scripts de backend
4. ✅ Documentación `SOLUCION_QUOTA_EXCEEDED.md` actualizada

## 🚀 Próximos Pasos (15 minutos)

### 1. Descargar Cuenta de Servicio (Backend)
Para scripts de importación masiva (300k registros):

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar proyecto: **Superjf1234**
3. ⚙️ Configuración del proyecto → **Cuentas de servicio**
4. **Generar nueva clave privada** → Descargar JSON
5. Crear carpeta y mover el archivo:
   ```bash
   mkdir -p keys
   mv ~/Downloads/superjf1234-*.json keys/superjf1234-service-account.json
   ```

### 2. Configurar Variables de Backend
Editar `.env.firebase` y actualizar la ruta:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/workspaces/superjf_v15/keys/superjf1234-service-account.json
```

### 3. Configurar Reglas de Firestore (IMPORTANTE)
Evita el "Quota exceeded" configurando reglas seguras:

1. Firebase Console → **Firestore Database** → **Reglas**
2. Reemplazar con:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /courses/{courseId} {
         allow read: if true;
         allow write: if request.auth != null;
         
         match /grades/{gradeId} {
           allow read: if request.auth != null;
           allow write: if request.auth != null;
         }
         
         match /attendance/{attendanceId} {
           allow read: if request.auth != null;
           allow write: if request.auth != null;
         }
       }
       
       match /health/{doc} {
         allow read, write: if false;
       }
     }
   }
   ```
3. **Publicar**

### 4. Verificar Conexión
```bash
# Cargar variables
export $(grep -v '^#' .env.firebase | xargs)

# Verificar Admin SDK
npm run firebase:check
```

Deberías ver:
```
Firebase Admin conectado ✅
projectId: superjf1234-e9cbc
service account: firebase-adminsdk-...@superjf1234-e9cbc.iam.gserviceaccount.com
Colecciones raíz detectadas: []
```

### 5. Reiniciar Servidor de Desarrollo
```bash
# Detener servidor actual (Ctrl+C)
npm run dev
```

Abrir: http://localhost:9002

### 6. Limpiar Caché del Navegador
1. F12 (DevTools)
2. Application → Storage → **Clear site data**
3. Recargar página

### 7. Verificar Proyecto Activo
En la consola del navegador:
```javascript
console.log('Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
// Debe mostrar: superjf1234-e9cbc
```

## 📊 Preparar Carga Masiva (300k)

### Formato CSV Requerido
Encabezados flexibles (sin acentos/mayúsculas):
- `nombre` | `student` | `studentName`
- `rut` | `studentId`
- `curso` | `course` | `courseId`
- `seccion` | `section` | `sectionId` (opcional)
- `asignatura` | `subject` | `subjectId` (opcional)
- `profesor` | `teacher` | `teacherName` (opcional)
- `fecha` | `gradedAt` | `date` (formato: YYYY-MM-DD)
- `tipo` | `type` (evaluacion/tarea/prueba)
- `nota` | `score` (número: 1.0-7.0)

### Ejemplo CSV
```csv
nombre,rut,curso,fecha,nota
Juan Pérez,12345678-9,Matemáticas 1A,2025-01-15,6.5
María González,98765432-1,Historia 2B,2025-01-16,7.0
```

### Prueba en Seco (sin escribir)
```bash
npm run import:grades -- --file=./datos/test.csv --year=2025 --dry
```

### Importación Real
```bash
npm run import:grades -- --file=./datos/grades-2025.csv --year=2025
```

**Progreso**: Se mostrará cada 5,000 registros.  
**Duración estimada**: 300k registros ≈ 10-15 minutos.

## 🔍 Verificar Datos Importados
```bash
node scripts/verificar-migracion-firebase.js
```

## ⚠️ Solución de Problemas

### "Faltan credenciales"
```bash
# Verificar que las variables estén cargadas
echo $GOOGLE_APPLICATION_CREDENTIALS
# Si está vacío, cargar de nuevo:
export $(grep -v '^#' .env.firebase | xargs)
```

### "Quota exceeded" persiste
1. Verificar plan Blaze: Console → Uso y facturación
2. Esperar 1-2 minutos después de publicar reglas
3. Limpiar caché del navegador
4. Reiniciar servidor dev

### "PERMISSION_DENIED"
- Verificar reglas de Firestore (paso 3)
- Para Admin SDK, las reglas NO aplican
- Para SDK web, autenticación requerida

## 📞 Siguiente Sesión
Una vez completados estos pasos:
1. Compartir resultado de `npm run firebase:check`
2. Confirmar que el servidor carga sin "Quota exceeded"
3. Preparar CSV para importación de prueba (100-500 registros)
4. Ejecutar carga masiva completa (300k)

---
**Proyecto**: superjf1234-e9cbc (Plan Blaze)  
**Actualizado**: 2025-10-12
