# 📈 PLAN DE ESCALAMIENTO: 108K Calificaciones (11MB)

## 🎯 Objetivo
Cargar 108,000 calificaciones (11MB) desde CSV a Firebase y visualizarlas eficientemente en la pestaña Calificaciones.

---

## ✅ Estado Actual (100 Registros)

### Flujo Funcional
```
CSV (100 filas)
    ↓
[EJECUTAR-CARGA-FIREBASE-RAPIDO.js]
    ↓
Firebase: courses/{courseId}/grades/{gradeId}
    ↓
[getGradesByYear] → collectionGroup query
    ↓
Pestaña Calificaciones (UI)
```

### Estructura en Firebase
```
courses/
  └── 1ro_bsico/
      └── grades/
          └── grade-{studentId}-{subject}-{date}/
              ├── year: 2025
              ├── courseId: "1ro_bsico"
              ├── sectionId: 21838  ← CORREGIDO
              ├── studentId: "du5j9n"
              ├── subject: "lenguaje_y_comunicacion"
              ├── grade: 85
              └── ... (25 campos más)
```

---

## 🚨 Desafíos con 108K Registros

### 1. **Carga Inicial (CSV → Firebase)**
- **Tiempo estimado**: ~15-20 minutos
- **Problema**: Script de navegador puede timeout
- **Solución**: Usar API backend `/api/firebase/upload-grades`

### 2. **Consulta en UI**
- **Problema**: `collectionGroup('grades').where('year', '==', 2025)` traería 108K docs
- **Impacto**: 
  - Tiempo de carga: ~10-15 segundos
  - Memoria del navegador: ~50-80MB
  - Límite de Firestore: 1MB por lectura (necesita múltiples requests)

### 3. **Filtrado por Sección**
- **Actual**: Se traen TODOS los registros del año, luego filtra en cliente
- **Problema**: Ineficiente con 108K registros
- **Solución**: Filtrar EN Firebase antes de traer

---

## 🔧 SOLUCIONES PROPUESTAS

### Solución 1: Carga via API Backend (RECOMENDADO)

**Crear endpoint:** `/api/firebase/bulk-upload-grades`

```typescript
// src/app/api/firebase/bulk-upload-grades/route.ts
export async function POST(req: NextRequest) {
  const { grades, year } = await req.json(); // Array de 108K calificaciones
  
  // Procesar en lotes de 500 (límite de Firebase batch)
  const BATCH_SIZE = 500;
  let processed = 0;
  
  for (let i = 0; i < grades.length; i += BATCH_SIZE) {
    const batch = grades.slice(i, i + BATCH_SIZE);
    await uploadBatchToFirebase(batch);
    processed += batch.length;
    
    // Enviar progreso al cliente via SSE o WebSocket
    sendProgress({ processed, total: grades.length });
  }
  
  return NextResponse.json({ success: true, processed });
}
```

**Ventajas:**
- ✅ No hay timeout del navegador
- ✅ Progreso en tiempo real
- ✅ Manejo de errores robusto
- ✅ Puede pausar/reanudar

---

### Solución 2: Consultas Optimizadas en UI

#### Opción A: Filtrar en Firebase (RECOMENDADO)

```typescript
// src/lib/firestore-database.ts
async getGradesByYearAndSection(year: number, sectionId: string) {
  const db = this.getDb();
  
  // Consulta MÁS específica - solo trae calificaciones de UNA sección
  const gradesRef = collectionGroup(db, 'grades');
  const q = query(
    gradesRef,
    where('year', '==', year),
    where('sectionId', '==', sectionId), // ← FILTRO ADICIONAL
    orderBy('gradedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => this.fromFirestoreGrade(doc.data()));
}
```

**Ventajas:**
- ✅ Solo trae ~1,000-2,000 registros por sección (vs 108K)
- ✅ Carga instantánea (~0.5-1 segundo)
- ✅ Menos memoria en navegador

**Requiere:**
- Índice compuesto en Firebase Console:
  ```
  Collection: grades (collectionGroup)
  Fields: year (Ascending), sectionId (Ascending), gradedAt (Descending)
  ```

#### Opción B: Paginación

```typescript
async getGradesPage(year: number, lastDoc?: any, pageSize = 50) {
  let q = query(
    collectionGroup(db, 'grades'),
    where('year', '==', year),
    orderBy('gradedAt', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  return {
    grades: snapshot.docs.map(doc => doc.data()),
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
}
```

---

### Solución 3: Caché Inteligente

```typescript
// src/lib/grades-cache.ts
class GradesCache {
  private cache = new Map<string, { data: any[], timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutos
  
  async getOrFetch(key: string, fetcher: () => Promise<any[]>) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data; // Cache hit
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}

// Uso en calificaciones/page.tsx
const gradesCache = new GradesCache();

const grades = await gradesCache.getOrFetch(
  `grades-${year}-${sectionId}`,
  () => getGradesByYearAndSection(year, sectionId)
);
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Corrección Actual (INMEDIATO)
- [x] Ejecutar `corregirSectionIdEnFirebase()` 
- [ ] Verificar que 100 calificaciones aparecen en UI
- [ ] Confirmar filtros funcionan correctamente

### Fase 2: Preparación para 108K (1-2 horas)
1. **Crear índice compuesto en Firebase Console:**
   ```
   Ir a: Firebase Console → Firestore → Indexes
   Agregar: grades (collectionGroup) → year, sectionId, gradedAt
   ```

2. **Actualizar `getGradesByYear` a `getGradesByYearAndSection`:**
   - Modificar `src/lib/firestore-database.ts`
   - Agregar parámetro `sectionId` a la consulta

3. **Actualizar UI para usar filtro específico:**
   - Modificar `src/app/dashboard/calificaciones/page.tsx`
   - Pasar `sectionId` seleccionada a la consulta

### Fase 3: Carga Masiva Backend (2-3 horas)
1. Crear endpoint `/api/firebase/bulk-upload-grades`
2. Implementar procesamiento por lotes
3. Agregar barra de progreso en UI
4. Probar con archivo de 108K registros

### Fase 4: Optimizaciones Finales (1 hora)
1. Implementar caché de calificaciones
2. Lazy loading de tabla (virtualización)
3. Pruebas de carga con datos reales

---

## 🎯 RESULTADO ESPERADO

### Con 108K Calificaciones

**Carga Inicial:**
- Tiempo: ~15-20 minutos (una sola vez)
- Método: API backend con progreso visual

**Visualización en UI:**
- Tiempo de carga: **~0.5-1 segundo** (solo sección filtrada)
- Registros mostrados: ~1,000-2,000 por sección
- Memoria usada: ~10-15MB (navegador)

**Filtrado:**
- Instantáneo (ya filtrado desde Firebase)
- Sin lag ni congelamiento de UI

---

## 🚀 COMANDOS PARA EJECUTAR AHORA

```bash
# 1. Corregir sectionId en 100 registros actuales (en consola navegador)
await corregirSectionIdEnFirebase()

# 2. Verificar que funciona
# - Ir a Calificaciones → 1ro Básico A
# - Deberían aparecer ~45 calificaciones

# 3. Si funciona, proceder con:
# - Crear índice en Firebase Console
# - Actualizar código para consultas filtradas
# - Cargar 108K registros via API backend
```

---

## 📊 COMPARACIÓN DE ENFOQUES

| Enfoque | Tiempo Carga | Tiempo Query | Memoria | Complejidad |
|---------|--------------|--------------|---------|-------------|
| **Actual (todo en memoria)** | N/A | 10-15s | 80MB | Baja |
| **Filtrado en Firebase** | N/A | 0.5-1s | 15MB | Media |
| **Paginación** | N/A | 0.3s | 5MB | Alta |
| **Caché + Filtrado** | N/A | 0.1s (cached) | 15MB | Media |

**Recomendación:** **Filtrado en Firebase** (Opción A) - mejor balance costo/beneficio.

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **AHORA**: Ejecutar `corregirSectionIdEnFirebase()` en consola
2. **Verificar**: Que las 100 calificaciones aparecen en UI
3. **Decidir**: Si proceder con escalamiento a 108K

¿Quieres que implemente la Solución 1 (API backend) o la Solución 2 (consultas optimizadas) primero?
