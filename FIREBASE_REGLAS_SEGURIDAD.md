# 🔥 Firebase Firestore - Reglas de Seguridad de Producción

## 📋 Configuración para Consola Firebase

Copia estas reglas en **Firestore Database → Reglas** en la [Consola Firebase](https://console.firebase.google.com/)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    
    // Verificar si el usuario está autenticado
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Verificar rol del usuario
    function hasRole(role) {
      return isSignedIn() && 
             request.auth.token.role == role;
    }
    
    // Verificar si es admin o profesor
    function isAdminOrTeacher() {
      return isSignedIn() && 
             (request.auth.token.role == 'admin' || 
              request.auth.token.role == 'teacher');
    }
    
    // Verificar si es el estudiante propietario
    function isOwner(studentId) {
      return isSignedIn() && 
             request.auth.uid == studentId;
    }
    
    // ============================================
    // HEALTH CHECK (Pública para pruebas)
    // ============================================
    match /_health_check/{document=**} {
      allow read, write: if true;
    }
    
    // ============================================
    // COLECCIONES PRINCIPALES
    // ============================================
    
    // Cursos y subcolecciones
    match /courses/{courseId} {
      
      // Lectura del curso: todos los usuarios autenticados
      allow read: if isSignedIn();
      
      // Escritura del curso: solo admin
      allow write: if hasRole('admin');
      
      // --- CALIFICACIONES ---
      match /grades/{gradeId} {
        // Lectura: 
        // - Admin y profesores: todos los datos
        // - Estudiantes: solo sus propias calificaciones
        allow read: if isAdminOrTeacher() || 
                       isOwner(resource.data.studentId);
        
        // Escritura: solo admin y profesores
        allow create, update: if isAdminOrTeacher();
        
        // Eliminación: solo admin
        allow delete: if hasRole('admin');
      }
      
      // --- ASISTENCIA ---
      match /attendance/{attendanceId} {
        // Lectura:
        // - Admin y profesores: todos los datos
        // - Estudiantes: solo su propia asistencia
        allow read: if isAdminOrTeacher() || 
                       isOwner(resource.data.studentId);
        
        // Escritura: solo admin y profesores
        allow create, update: if isAdminOrTeacher();
        
        // Eliminación: solo admin
        allow delete: if hasRole('admin');
      }
      
      // --- ACTIVIDADES/TAREAS ---
      match /activities/{activityId} {
        // Lectura: todos los usuarios autenticados
        allow read: if isSignedIn();
        
        // Escritura: solo admin y profesores
        allow create, update: if isAdminOrTeacher();
        
        // Eliminación: solo admin
        allow delete: if hasRole('admin');
      }
      
      // --- ENTREGAS/SUBMISSIONS ---
      match /submissions/{submissionId} {
        // Lectura:
        // - Admin y profesores: todas las entregas
        // - Estudiantes: solo sus propias entregas
        allow read: if isAdminOrTeacher() || 
                       isOwner(resource.data.studentId);
        
        // Escritura:
        // - Profesores/admin: pueden calificar
        // - Estudiantes: solo pueden crear/editar sus propias entregas
        allow create: if isSignedIn();
        allow update: if isAdminOrTeacher() || 
                         isOwner(resource.data.studentId);
        
        // Eliminación: solo admin
        allow delete: if hasRole('admin');
      }
    }
    
    // ============================================
    // USUARIOS
    // ============================================
    match /users/{userId} {
      // Lectura:
      // - Admin: todos los usuarios
      // - Profesores: todos los usuarios
      // - Estudiantes: solo su propio perfil
      allow read: if isAdminOrTeacher() || 
                     isOwner(userId);
      
      // Escritura:
      // - Admin: puede editar cualquier usuario
      // - Usuarios: solo pueden editar su propio perfil (campos limitados)
      allow update: if hasRole('admin') || 
                       (isOwner(userId) && 
                        !request.resource.data.diff(resource.data).affectedKeys()
                          .hasAny(['role', 'email']));
      
      // Creación: solo admin
      allow create: if hasRole('admin');
      
      // Eliminación: solo admin
      allow delete: if hasRole('admin');
    }
    
    // ============================================
    // NOTIFICACIONES
    // ============================================
    match /notifications/{notificationId} {
      // Lectura: solo el destinatario o admin
      allow read: if isOwner(resource.data.userId) || 
                     hasRole('admin');
      
      // Escritura: admin, profesores, o el propio usuario (marcar como leída)
      allow create: if isAdminOrTeacher();
      allow update: if isOwner(resource.data.userId) || 
                       isAdminOrTeacher();
      
      // Eliminación: admin o el propio usuario
      allow delete: if isOwner(resource.data.userId) || 
                       hasRole('admin');
    }
    
    // ============================================
    // COMUNICACIONES/COMENTARIOS
    // ============================================
    match /communications/{communicationId} {
      // Lectura: participantes o admin
      allow read: if isSignedIn();
      
      // Escritura: cualquier usuario autenticado puede crear comentarios
      allow create: if isSignedIn();
      
      // Actualización: solo el autor o admin
      allow update: if isOwner(resource.data.authorId) || 
                       hasRole('admin');
      
      // Eliminación: solo admin
      allow delete: if hasRole('admin');
    }
    
    // ============================================
    // ESTADÍSTICAS/ANALYTICS (solo lectura para usuarios)
    // ============================================
    match /statistics/{statId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
    
    // ============================================
    // CONFIGURACIÓN DEL SISTEMA
    // ============================================
    match /system_config/{configId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
    
    // ============================================
    // BLOQUEAR TODO LO DEMÁS
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🔐 Explicación de las Reglas

### **Niveles de Acceso:**

#### 👑 **Admin**
- ✅ Lectura/Escritura completa en todas las colecciones
- ✅ Puede eliminar cualquier documento
- ✅ Puede gestionar usuarios y configuración

#### 👨‍🏫 **Profesor (Teacher)**
- ✅ Lectura de todos los datos académicos
- ✅ Escritura en calificaciones, asistencia y actividades
- ✅ Puede crear notificaciones y comentarios
- ❌ No puede eliminar documentos (solo admin)

#### 🎓 **Estudiante (Student)**
- ✅ Lectura de sus propios datos académicos
- ✅ Lectura de actividades/tareas asignadas
- ✅ Escritura de sus propias entregas (submissions)
- ❌ No puede ver datos de otros estudiantes

---

## 🧪 Reglas de Desarrollo (Temporales)

**Para desarrollo inicial**, puedes usar reglas permisivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ SOLO PARA DESARROLLO
    }
  }
}
```

**⚠️ IMPORTANTE:** Cambia a las reglas de producción antes de lanzar.

---

## 📊 Testing de Reglas

### En la Consola Firebase:

1. Ve a **Firestore Database → Reglas**
2. Clic en **Simulador de reglas**
3. Prueba estos escenarios:

#### **Estudiante lee sus calificaciones:**
```
Tipo: get
Ubicación: /courses/4to_basico_a/grades/grade_001
Auth: Autenticado (uid: student_123)
Token personalizado: { "role": "student" }
Datos del documento: { "studentId": "student_123" }
```
**Resultado esperado:** ✅ Permitido

#### **Estudiante lee calificaciones de otro:**
```
Tipo: get
Ubicación: /courses/4to_basico_a/grades/grade_002
Auth: Autenticado (uid: student_123)
Token personalizado: { "role": "student" }
Datos del documento: { "studentId": "student_456" }
```
**Resultado esperado:** ❌ Denegado

#### **Profesor crea calificación:**
```
Tipo: create
Ubicación: /courses/4to_basico_a/grades/grade_003
Auth: Autenticado (uid: teacher_001)
Token personalizado: { "role": "teacher" }
```
**Resultado esperado:** ✅ Permitido

---

## 🔄 Actualizar Reglas

### Método 1: Consola Web
1. [Consola Firebase](https://console.firebase.google.com/)
2. Tu proyecto → Firestore Database → Reglas
3. Pegar las reglas → Publicar

### Método 2: Firebase CLI
```bash
# Instalar CLI (si no lo tienes)
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto
firebase init firestore

# Editar firestore.rules y luego:
firebase deploy --only firestore:rules
```

---

## 🚨 Monitoreo de Seguridad

### Alertas Recomendadas:

1. **Reglas de Consola Firebase:**
   - Configurar alertas para intentos de acceso denegado
   - Monitorear patrones inusuales

2. **Firebase Functions (opcional):**
   - Crear funciones para auditar cambios sensibles
   - Logs de modificaciones en calificaciones

---

## 📝 Notas Importantes

1. **Sin autenticación por ahora:** Las reglas actuales asumen tokens personalizados con `role`. Si no usas Firebase Auth, mantén las reglas abiertas temporalmente (`allow read, write: if true`).

2. **Migración gradual:** Puedes implementar las reglas por fases:
   - Fase 1: Abiertas para desarrollo
   - Fase 2: Restricciones por colección
   - Fase 3: Reglas completas de producción

3. **Testing obligatorio:** Siempre prueba en el simulador antes de publicar cambios.

---

## 🔗 Recursos Adicionales

- [Documentación oficial de reglas](https://firebase.google.com/docs/firestore/security/get-started)
- [Ejemplos de reglas comunes](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Testing de reglas](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
