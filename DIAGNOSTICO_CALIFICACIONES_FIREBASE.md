# 🔍 DIAGNÓSTICO: Calificaciones no se muestran desde Firebase

## 📋 Problema

Después de realizar la carga masiva de calificaciones a Firebase, la pestaña "Calificaciones" no muestra los datos cargados.

---

## 🧪 Pasos de Diagnóstico

### 1. **Verificar que la carga masiva se completó correctamente**

En la pestaña **Admin → Carga Masiva**, verifica que:

- ✅ El contador muestra registros cargados (ej: "**2025: 100 registros | Total: 100 registros**")
- ✅ El badge muestra "**🔥 Firebase + LS**"
- ✅ No hay mensajes de error

### 2. **Abrir la Consola del Navegador**

1. Presiona **F12** o **Ctrl+Shift+I** (Windows/Linux) o **Cmd+Option+I** (Mac)
2. Ve a la pestaña **"Console"**
3. Ve a la página **"Calificaciones"**
4. Observa los logs que aparecen

---

## 📊 Logs Esperados (Caso Exitoso)

Si todo funciona correctamente, deberías ver:

```
🔍 [Firebase] Consultando calificaciones para año 2025...
🔍 [Firebase] Intentando consulta con year como número: 2025
📊 [Firebase] Consulta con número retornó 100 documentos
✅ [Firebase] (CG) Total combinado: 100 calificaciones para año 2025
📋 [Firebase] Muestra de calificaciones (primeras 3):
  [
    {
      studentName: "Sofía González González",
      score: 85,
      courseId: "1ro_basico",
      sectionId: "1ro_basico_a",
      subjectId: "lenguaje",
      year: 2025
    },
    ...
  ]
📊 SQL retornó 100 calificaciones
✅ Actualizando a datos SQL: 100 calificaciones
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: "CollectionGroup no retornó resultados"

**Log:**
```
⚠️ [Firebase] CollectionGroup no retornó resultados, intentando fallback...
📚 [Firebase] Encontrados X cursos en Firebase
```

**Causa:** Las reglas de Firestore no permiten consultas `collectionGroup`.

**Solución:**

1. Ve a Firebase Console → **Firestore Database** → **Rules**
2. Asegúrate de que las reglas permitan leer la subcolección `grades`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura de cursos
    match /courses/{courseId} {
      allow read, write: if true; // O tus reglas específicas
      
      // Permitir lectura/escritura de calificaciones en subcolección
      match /grades/{gradeId} {
        allow read, write: if true; // O tus reglas específicas
      }
    }
  }
}
```

3. Haz clic en **"Publicar"**
4. Espera 30 segundos y recarga la página de Calificaciones

---

### Problema 2: "Años encontrados en calificaciones: []"

**Log:**
```
📚 [Firebase] Encontrados 5 cursos en Firebase
  📂 [Firebase] Curso 1ro_basico: 20 calificaciones
  📂 [Firebase] Curso 2do_basico: 20 calificaciones
  ...
🔍 [Firebase] Años encontrados en calificaciones: [2024, 2023]
✅ [Firebase] (Fallback) Total encontrado: 0 calificaciones para año 2025 (de 100 totales)
```

**Causa:** Las calificaciones se guardaron con un año diferente al esperado.

**Soluciones:**

#### Opción A: Verificar el campo `year` en Firebase Console

1. Ve a Firebase Console → **Firestore Database**
2. Navega a `courses/1ro_basico/grades` (o cualquier curso)
3. Abre un documento de calificación
4. Verifica el campo **`year`**:
   - ✅ Debe ser **número**: `2025` (sin comillas)
   - ❌ NO debe ser string: `"2025"` (con comillas)

#### Opción B: Cambiar el año seleccionado en el sistema

1. En la pestaña **Admin → Carga Masiva**, verifica el **selector de año** (esquina superior derecha)
2. Cambia al año que aparece en los logs (ej: 2024)
3. Ve a la pestaña **Calificaciones**
4. Verifica si ahora se muestran los datos

#### Opción C: Re-cargar con el año correcto

1. Edita el CSV de calificaciones
2. Asegúrate de que todas las filas correspondan al año actual (2025)
3. Borra las calificaciones existentes en Firebase:
   - Admin → Carga Masiva → **"Borrar SQL"**
4. Vuelve a cargar el CSV corregido

---

### Problema 3: "SQL not connected"

**Log:**
```
❌ SQL not connected, usando solo LocalStorage
```

**Causa:** Firebase no está habilitado correctamente.

**Solución:**

1. Verifica que el archivo `.env.local` tiene:
   ```
   NEXT_PUBLIC_USE_FIREBASE=true
   NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   ...
   ```

2. **Reinicia el servidor de desarrollo**:
   ```bash
   # Detén el servidor (Ctrl+C)
   # Vuelve a iniciarlo
   npm run dev
   ```

3. Recarga la página y verifica que el badge muestre "**🔥 Firebase + LS**"

---

### Problema 4: Calificaciones cargadas pero tabla vacía

**Situación:** Los logs muestran que se cargaron calificaciones, pero la tabla está vacía.

**Causa:** Los filtros de curso/sección/estudiante no coinciden con los datos.

**Solución:**

1. En la página de **Calificaciones**, verifica los filtros activos:
   - **Nivel**: ¿Está seleccionado "Básica" o "Media"?
   - **Curso**: ¿Está seleccionado el curso correcto (ej: "1ro Básico")?
   - **Sección**: ¿Está seleccionada la sección correcta (ej: "A")?

2. Intenta **quitar todos los filtros** (selecciona "Todos") para ver si aparecen datos

3. Verifica en la consola del navegador los IDs que se están usando:
   ```javascript
   // Ejecuta esto en la consola:
   const grades = JSON.parse(localStorage.getItem('smart-student-test-grades-2025') || '[]');
   console.log('Cursos en calificaciones:', new Set(grades.map(g => g.courseId)));
   console.log('Secciones en calificaciones:', new Set(grades.map(g => g.sectionId)));
   ```

4. Compara los IDs con los que aparecen en los filtros de la UI

---

## 🔧 Script de Diagnóstico Manual

Si los pasos anteriores no funcionan, ejecuta este script en la **Consola del Navegador**:

```javascript
(async function diagnosticarCalificaciones() {
  console.log('🔍 ========== DIAGNÓSTICO DE CALIFICACIONES ==========');
  
  // 1. Verificar año seleccionado
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  console.log(`📅 Año seleccionado: ${year}`);
  
  // 2. Verificar LocalStorage
  const lsKey = `smart-student-test-grades-${year}`;
  const lsGrades = JSON.parse(localStorage.getItem(lsKey) || '[]');
  console.log(`📦 LocalStorage (${lsKey}): ${lsGrades.length} calificaciones`);
  
  if (lsGrades.length > 0) {
    console.log('📋 Muestra de LocalStorage:', lsGrades[0]);
  }
  
  // 3. Verificar Firebase
  try {
    const { getFirestoreInstance } = await import('/src/lib/firebase-config.ts');
    const { collection, getDocs, query, collectionGroup, where } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    
    if (!db) {
      console.error('❌ Firebase no está inicializado');
      return;
    }
    
    console.log('✅ Firebase conectado');
    
    // Consultar calificaciones
    const snapshot = await getDocs(query(collectionGroup(db, 'grades'), where('year', '==', year)));
    console.log(`📊 Firebase: ${snapshot.size} calificaciones para año ${year}`);
    
    if (snapshot.size > 0) {
      const first = snapshot.docs[0].data();
      console.log('📋 Muestra de Firebase:', {
        studentName: first.studentName,
        score: first.score,
        courseId: first.courseId,
        sectionId: first.sectionId,
        subjectId: first.subjectId,
        year: first.year,
        typeOfYear: typeof first.year
      });
    }
    
    // Listar cursos
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    console.log(`📚 Cursos en Firebase: ${coursesSnapshot.size}`);
    coursesSnapshot.docs.forEach(doc => {
      console.log(`  - ${doc.id}`);
    });
    
  } catch (e) {
    console.error('❌ Error consultando Firebase:', e);
  }
  
  console.log('🔍 ========== FIN DIAGNÓSTICO ==========');
})();
```

---

## ✅ Solución Rápida (Si nada funciona)

Si después de todos los pasos anteriores las calificaciones no se muestran:

### Opción 1: Sincronizar Firebase → LocalStorage

```javascript
// Ejecuta esto en la consola del navegador:
(async function syncFirebaseToLS() {
  const { firestoreDB } = await import('/src/lib/firestore-database.ts');
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  
  console.log(`🔄 Sincronizando Firebase → LocalStorage para año ${year}...`);
  
  const grades = await firestoreDB.getGradesByYear(year);
  console.log(`✅ Obtenidas ${grades.length} calificaciones desde Firebase`);
  
  if (grades.length > 0) {
    localStorage.setItem(`smart-student-test-grades-${year}`, JSON.stringify(grades));
    console.log(`💾 Guardadas en LocalStorage: smart-student-test-grades-${year}`);
    console.log('🔄 Recarga la página para ver los cambios');
    
    // Forzar recarga
    window.location.reload();
  } else {
    console.warn('⚠️ No se encontraron calificaciones en Firebase para sincronizar');
  }
})();
```

### Opción 2: Recargar desde Admin

1. Ve a **Admin → Configuración → Carga Masiva**
2. Haz clic en el botón **"Actualizar"** (↻) junto a los contadores
3. Espera a que se actualicen los valores
4. Ve a la pestaña **"Calificaciones"**
5. Verifica si ahora se muestran los datos

---

## 📞 Soporte

Si después de seguir todos estos pasos el problema persiste, proporciona los siguientes datos:

1. **Screenshot de la consola del navegador** mostrando los logs
2. **Screenshot de Firebase Console** mostrando:
   - Estructura de `courses/{cursoId}/grades`
   - Un documento de ejemplo con todos sus campos
3. **Año seleccionado** en el sistema
4. **Cantidad de registros** que muestra el contador en "Carga Masiva"

---

**Última actualización:** Noviembre 4, 2025
