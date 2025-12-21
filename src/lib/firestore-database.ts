// Firestore Database Service - Equivalente a sql-database.ts
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentData,
  writeBatch,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseEnabled } from './firebase-config';

// ========================= MODO OFFLINE AUTOMÁTICO =========================
// Se activa cuando Firebase devuelve error de cuota
let quotaExceededMode = false;
let quotaExceededTimestamp: number | null = null;
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos de espera antes de reintentar

export function isQuotaExceeded(): boolean {
  if (!quotaExceededMode) return false;
  
  // Verificar si ya pasó el cooldown
  if (quotaExceededTimestamp && Date.now() - quotaExceededTimestamp > QUOTA_COOLDOWN_MS) {
    console.log('🔄 [Firebase] Cooldown de cuota terminado, reintentando conexión...');
    quotaExceededMode = false;
    quotaExceededTimestamp = null;
    return false;
  }
  
  return true;
}

export function setQuotaExceeded(exceeded: boolean): void {
  if (exceeded && !quotaExceededMode) {
    quotaExceededMode = true;
    quotaExceededTimestamp = Date.now();
    console.error('🚫 [Firebase] CUOTA EXCEDIDA - Cambiando a modo offline por 5 minutos');
    
    // Disparar evento para notificar a la UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('firebaseQuotaExceeded', { detail: { timestamp: Date.now() } }));
    }
  } else if (!exceeded) {
    quotaExceededMode = false;
    quotaExceededTimestamp = null;
  }
}

// Función helper para detectar errores de cuota
function isQuotaError(error: any): boolean {
  if (!error) return false;
  const message = String(error.message || error.code || error).toLowerCase();
  return message.includes('quota') || 
         message.includes('resource-exhausted') || 
         message.includes('exceeded') ||
         message.includes('rate limit');
}

// ========================= CACHÉ EN MEMORIA =========================
// Evita consultas repetidas que causan "Quota exceeded"
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private static DEFAULT_TTL = 60 * 1000; // 1 minuto por defecto
  private static GRADES_TTL = 5 * 60 * 1000; // 5 minutos para calificaciones
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`🗑️ [Cache] Expirado: ${key}`);
      return null;
    }
    
    console.log(`✅ [Cache] Hit: ${key} (${Math.round((entry.expiresAt - Date.now()) / 1000)}s restantes)`);
    return entry.data as T;
  }
  
  set<T>(key: string, data: T, ttl: number = QueryCache.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    console.log(`💾 [Cache] Guardado: ${key} (TTL: ${Math.round(ttl / 1000)}s)`);
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log(`🗑️ [Cache] Limpiado completamente`);
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        console.log(`🗑️ [Cache] Invalidado: ${key}`);
      }
    }
  }
  
  static get GRADES_CACHE_TTL() {
    return this.GRADES_TTL;
  }
}

const queryCache = new QueryCache();

// Throttle para evitar múltiples consultas simultáneas
const pendingQueries = new Map<string, Promise<any>>();

// Timeout para consultas de Firestore (evita bloqueos cuando no hay conexión)
const FIRESTORE_QUERY_TIMEOUT = 5000; // 5 segundos

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  // Si la cuota está excedida, retornar fallback inmediatamente
  if (isQuotaExceeded()) {
    console.warn('⚠️ [Firestore] Cuota excedida, usando fallback local');
    return fallback;
  }
  
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`⚠️ [Firestore] Timeout después de ${ms}ms, usando fallback`);
      resolve(fallback);
    }, ms);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (e: any) {
    clearTimeout(timeoutId!);
    
    // Detectar error de cuota y activar modo offline
    if (isQuotaError(e)) {
      setQuotaExceeded(true);
    }
    
    console.warn('⚠️ [Firestore] Error en consulta:', e?.message || e);
    return fallback;
  }
}

async function deduplicateQuery<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
  // Si ya hay una consulta pendiente con la misma key, esperarla
  const pending = pendingQueries.get(key);
  if (pending) {
    console.log(`⏳ [Dedupe] Esperando consulta existente: ${key}`);
    return pending as Promise<T>;
  }
  
  // Ejecutar consulta y registrarla como pendiente
  const promise = queryFn().finally(() => {
    pendingQueries.delete(key);
  });
  
  pendingQueries.set(key, promise);
  return promise;
}
// =====================================================================

// Interfaces compatibles con tu sistema actual
export interface GradeRecord {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  score: number;
  courseId: string | null;
  sectionId: string | null;
  subjectId: string | null;
  title: string;
  gradedAt: string; // ISO
  year: number;
  type: 'tarea' | 'prueba' | 'evaluacion';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO
  courseId: string | null;
  sectionId: string | null;
  course?: string; // Nombre original del curso (ej: "1ro Básico")
  section?: string; // Nombre original de la sección (ej: "A")
  studentId: string;
  status: string;
  present: boolean;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  year: number;
}

export interface ActivityRecord {
  id: string;
  taskType: string;
  title: string;
  subjectId: string | null;
  subjectName: string | null;
  courseId: string | null;
  sectionId: string | null;
  createdAt: string;
  startAt: string | null;
  openAt: string | null;
  dueDate: string | null;
  status: string;
  assignedById: string | null;
  assignedByName: string | null;
  year: number;
  topic?: string | null; // Campo opcional para tema de la actividad
}

/**
 * Servicio de base de datos Firestore
 * Reemplaza a SQLDatabaseService manteniendo la misma API
 */
export class FirestoreDatabaseService {
  private static _instance: FirestoreDatabaseService | null = null;

  static instance() {
    if (!this._instance) this._instance = new FirestoreDatabaseService();
    return this._instance;
  }

  private getDb() {
    const db = getFirestoreInstance();
    if (!db) {
      console.error('❌ Firestore no está inicializado. Verifica:');
      console.error('  1. NEXT_PUBLIC_USE_FIREBASE=true en .env.local');
      console.error('  2. Credenciales de Firebase configuradas');
      console.error('  3. Reiniciar el servidor de desarrollo');
      throw new Error('Firestore no está inicializado');
    }
    return db;
  }

  /**
   * Test de conexión a Firestore con timeout
   * OPTIMIZACIÓN: Si Firebase ya está inicializado, asumimos conectado para evitar bloqueos
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isFirebaseEnabled()) {
        return { success: false, error: 'Firestore no está habilitado' };
      }

      // Intentar obtener la instancia de DB - si funciona, estamos conectados
      try {
        const db = this.getDb();
        if (db) {
          console.log('✅ [Firestore] Instancia de DB obtenida, conexión asumida exitosa');
          return { success: true };
        }
      } catch (dbErr: any) {
        console.warn('⚠️ [Firestore] Error obteniendo instancia DB:', dbErr?.message);
      }

      return { success: false, error: 'No se pudo obtener instancia de Firestore' };
    } catch (error: any) {
      console.error('Error en testConnection:', error);
      return { 
        success: false, 
        error: `Firestore error: ${error.message || String(error)}` 
      };
    }
  }

  // ==================== GRADES ====================

  /**
   * Guarda múltiples calificaciones (batch con límite de 100 por lote)
   */
  async saveGrades(grades: GradeRecord[]): Promise<{ success: boolean; error?: string }> {
    try {
      const db = this.getDb();
      const BATCH_SIZE = 20; // 🔥 REDUCIDO a 20 para evitar "resource-exhausted"
      let processed = 0;

      // 🆕 Paso 1: Asegurar que todos los cursos existen en Firebase
      const uniqueCourseIds = new Set<string>();
      grades.forEach(grade => {
        if (grade.courseId) {
          uniqueCourseIds.add(grade.courseId);
        }
      });

      console.log(`📚 Asegurando ${uniqueCourseIds.size} cursos en Firebase...`);
      for (const courseId of uniqueCourseIds) {
        try {
          const courseRef = doc(db, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (!courseDoc.exists()) {
            // Crear el curso en Firebase si no existe
            await setDoc(courseRef, {
              id: courseId,
              name: courseId, // Placeholder - se actualizará con datos reales si están disponibles
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            });
            console.log(`✅ Curso creado en Firebase: ${courseId}`);
          }
        } catch (courseError) {
          console.warn(`⚠️ No se pudo crear curso ${courseId}:`, courseError);
        }
      }

      // Paso 2: Guardar calificaciones en lotes MUY pequeños con pausas largas
      for (let i = 0; i < grades.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = grades.slice(i, i + BATCH_SIZE);

        for (const grade of chunk) {
          const courseId = grade.courseId || 'sin_curso';
          const gradeRef = doc(db, `courses/${courseId}/grades`, grade.id);
          
          const firestoreGrade = this.toFirestoreGrade(grade);
          batch.set(gradeRef, firestoreGrade, { merge: true });
        }

        await batch.commit();
        processed += chunk.length;
        
        // 🔇 Log cada 100 registros para no saturar consola
        if (processed % 100 === 0 || processed === grades.length) {
          console.log(`✅ Guardadas ${processed}/${grades.length} calificaciones`);
        }
        
        // ⏱️ Pausa de 600ms entre lotes para evitar "resource-exhausted"
        if (i + BATCH_SIZE < grades.length) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }

      // 🔧 Invalidar caché de calificaciones después de guardar
      queryCache.invalidate('grades');

      return { success: true };
    } catch (error: any) {
      console.error('Error guardando calificaciones:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene calificaciones por año
   * 🔧 PAGINACIÓN COMPLETA: Usa cursores para recuperar TODOS los documentos sin límite fijo
   * 🔧 TIMEOUT: Incluye timeout para evitar bloqueos cuando Firebase no responde
   * 🔧 CUOTA: Retorna array vacío si la cuota está excedida
   */
  async getGradesByYear(year: number): Promise<GradeRecord[]> {
    // 🚫 Si la cuota está excedida, retornar inmediatamente
    if (isQuotaExceeded()) {
      console.warn('⚠️ [Firebase] Cuota excedida, saltando getGradesByYear');
      return [];
    }
    
    const cacheKey = `grades-year-${year}`;
    
    // 1. Verificar caché en memoria
    const cached = queryCache.get<GradeRecord[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 2. Deduplicar consultas simultáneas
    return deduplicateQuery(cacheKey, async () => {
      try {
        const db = this.getDb();
        console.log(`🔍 [Firebase] Consultando calificaciones para año ${year} con paginación...`);

        // Helper para extraer courseId del path del documento
        const extractCourseIdFromPath = (docRef: any): string => {
          try {
            const pathSegments = docRef.ref?.path?.split('/') || [];
            const coursesIdx = pathSegments.indexOf('courses');
            if (coursesIdx >= 0 && coursesIdx + 1 < pathSegments.length) {
              return pathSegments[coursesIdx + 1];
            }
          } catch {}
          return '';
        };

        // 🔧 PAGINACIÓN: Recuperar TODOS los documentos usando cursores
        const PAGE_SIZE = 10000; // Tamaño de página para cada consulta
        const results: Array<{ data: any; courseId: string }> = [];
        let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
        let pageCount = 0;
        let hasMorePages = true;
        
        // Intentar primero con year como número
        console.log(`🔍 [Firebase] Consulta paginada con year = ${year} (número)`);
        
        while (hasMorePages) {
          try {
            pageCount++;
            const constraints: QueryConstraint[] = [
              where('year', '==', year),
              orderBy('__name__'), // Necesario para paginación con startAfter
              limit(PAGE_SIZE)
            ];
            
            if (lastDoc) {
              constraints.push(startAfter(lastDoc));
            }
            
            // Aplicar timeout para evitar bloqueos
            const snap = await withTimeout(
              getDocs(query(
                collectionGroup(db, 'grades'),
                ...constraints
              )),
              FIRESTORE_QUERY_TIMEOUT,
              { docs: [], size: 0, forEach: () => {} } as any
            );
            
            if (!snap || snap.size === 0) {
              if (pageCount === 1) {
                console.warn(`⚠️ [Firebase] Primera página vacía o timeout`);
              }
              hasMorePages = false;
              continue;
            }
            
            console.log(`📄 [Firebase] Página ${pageCount}: ${snap.size} documentos`);
            
            snap.forEach((d: any) => {
              const courseIdFromPath = extractCourseIdFromPath(d);
              results.push({ data: d.data(), courseId: courseIdFromPath });
            });
            
            // Si recibimos menos documentos que el tamaño de página, terminamos
            if (snap.size < PAGE_SIZE) {
              hasMorePages = false;
            } else {
              lastDoc = snap.docs[snap.docs.length - 1];
            }
            
            // Límite de seguridad: máximo 10 páginas (100,000 documentos)
            if (pageCount >= 10) {
              console.warn(`⚠️ [Firebase] Alcanzado límite de páginas (${pageCount}). Total parcial: ${results.length}`);
              hasMorePages = false;
            }
          } catch (e: any) {
            if (e?.code === 'resource-exhausted') {
              console.error(`🚫 [Firebase] Cuota excedida en página ${pageCount}`);
              throw e;
            }
            console.warn(`⚠️ [Firebase] Error en página ${pageCount}:`, e?.message);
            hasMorePages = false;
          }
        }

        // Si no hay resultados con número, intentar con string (una sola vez)
        if (results.length === 0) {
          console.log(`🔍 [Firebase] Reintentando con year = "${year}" (string)`);
          try {
            const snap = await withTimeout(
              getDocs(query(
                collectionGroup(db, 'grades'), 
                where('year', '==', String(year)),
                limit(PAGE_SIZE)
              )),
              FIRESTORE_QUERY_TIMEOUT,
              { docs: [], size: 0, forEach: () => {} } as any
            );
            if (snap && snap.size > 0) {
              console.log(`📊 [Firebase] Consulta con string retornó ${snap.size} documentos`);
              snap.forEach((d: any) => {
                const courseIdFromPath = extractCourseIdFromPath(d);
                results.push({ data: d.data(), courseId: courseIdFromPath });
              });
            }
          } catch (e: any) {
            if (e?.code === 'resource-exhausted') {
              console.error(`🚫 [Firebase] Cuota excedida`);
              throw e;
            }
            console.warn(`⚠️ [Firebase] Error en consulta string:`, e?.message);
          }
        }

        // Procesar resultados
        if (results.length > 0) {
          const byId = new Map<string, any>();
          for (const r of results) {
            const gradeData = { ...r.data };
            if (!gradeData.courseId && r.courseId) {
              gradeData.courseId = r.courseId;
            }
            const id = String(gradeData.id || `${gradeData.studentId}-${gradeData.testId}-${gradeData.gradedAt || ''}`);
            if (!byId.has(id)) byId.set(id, gradeData);
          }
          const normalized = Array.from(byId.values()).map((g: any) => this.fromFirestoreGrade(g));
          normalized.sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());
          console.log(`✅ [Firebase] Total: ${normalized.length} calificaciones para año ${year} (${pageCount} páginas)`);
          
          // 💾 Guardar en caché (5 minutos)
          queryCache.set(cacheKey, normalized, QueryCache.GRADES_CACHE_TTL);
          
          return normalized as GradeRecord[];
        }
        
        console.warn(`⚠️ [Firebase] No se encontraron calificaciones para año ${year}`);
        
        // Guardar array vacío en caché para evitar re-consultas inmediatas
        queryCache.set(cacheKey, [], 30 * 1000); // 30 segundos para arrays vacíos
        
        return [];
      } catch (error: any) {
        console.error('❌ [Firebase] Error obteniendo calificaciones:', error?.message || error);
        
        // 🚫 Detectar error de cuota y activar modo offline
        if (isQuotaError(error)) {
          setQuotaExceeded(true);
          return [];
        }
        
        // Si es error de cuota, no guardar en caché para reintentar después
        if (error?.code !== 'resource-exhausted') {
          queryCache.set(cacheKey, [], 10 * 1000); // 10 segundos en caso de error
        }
        
        return [];
      }
    });
  }

  /**
   * 🔥 PAGINACIÓN COMPLETA: Obtiene calificaciones filtradas por curso y sección
   * Usa cursores para recuperar TODOS los documentos y maneja variantes de sectionId
   */
  async getGradesByCourseAndSection(
    courseId: string,
    sectionId: string | null,
    year: number,
    subjectId?: string | null
  ): Promise<GradeRecord[]> {
    const cacheKey = `grades-course-${courseId}-${sectionId || 'all'}-${year}-${subjectId || 'all'}`;
    
    // 1. Verificar caché en memoria
    const cached = queryCache.get<GradeRecord[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 2. Deduplicar consultas simultáneas
    return deduplicateQuery(cacheKey, async () => {
      try {
        const db = this.getDb();
        console.log(`🔍 [Firebase] Consulta paginada por curso/sección`, { courseId, sectionId, year, subjectId });

        // Helper interno para estandarizar salida desde snapshots
        const buildRecord = (d: any): GradeRecord => {
          const data = d.data();
          if (!data.courseId) {
            try { data.courseId = d.ref?.parent?.parent?.id ?? data.courseId ?? null; } catch {}
          }
          return this.fromFirestoreGrade(data);
        };

        // Normalizar sectionId: puede ser letra ("a", "A") o formato completo ("2do_medio_a")
        const letter = sectionId && sectionId.length <= 2 ? String(sectionId).toLowerCase() : null;
        
        // Generar variantes de sectionId para buscar (maneja inconsistencias en datos)
        const sectionVariants: string[] = [];
        if (letter) {
          sectionVariants.push(letter);           // "a"
          sectionVariants.push(letter.toUpperCase()); // "A"
        }
        if (sectionId && sectionId.length > 2) {
          sectionVariants.push(sectionId.toLowerCase()); // "2do_medio_a"
          sectionVariants.push(sectionId);              // Original
        }

        // 🔧 PAGINACIÓN: Recuperar TODOS los documentos
        const PAGE_SIZE = 10000;
        let allResults: GradeRecord[] = [];
        let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
        let pageCount = 0;
        let hasMorePages = true;
        
        // Consulta principal con la primera variante de sectionId
        const primarySection = sectionVariants[0] || null;
        
        while (hasMorePages) {
          try {
            pageCount++;
            const constraints: QueryConstraint[] = [
              where('year', '==', year),
              orderBy('__name__'),
              limit(PAGE_SIZE)
            ];
            
            if (primarySection) {
              constraints.splice(1, 0, where('sectionId', '==', primarySection));
            }
            if (subjectId) {
              constraints.splice(primarySection ? 2 : 1, 0, where('subjectId', '==', subjectId));
            }
            
            if (lastDoc) {
              constraints.push(startAfter(lastDoc));
            }
            
            const snap = await withTimeout(
              getDocs(query(collectionGroup(db, 'grades'), ...constraints)),
              FIRESTORE_QUERY_TIMEOUT,
              { docs: [], size: 0, forEach: () => {} } as any
            );
            
            console.log(`📄 [Firebase] Página ${pageCount}: ${snap.size} documentos`);
            
            const pageResults = snap.docs.map(buildRecord);
            allResults = allResults.concat(pageResults);
            
            if (snap.size < PAGE_SIZE) {
              hasMorePages = false;
            } else {
              lastDoc = snap.docs[snap.docs.length - 1];
            }
            
            // Límite de seguridad: máximo 5 páginas para consultas filtradas
            if (pageCount >= 5) {
              console.warn(`⚠️ [Firebase] Alcanzado límite de páginas (${pageCount})`);
              hasMorePages = false;
            }
          } catch (e: any) {
            if (e?.code === 'resource-exhausted') {
              console.error(`🚫 [Firebase] Cuota excedida en página ${pageCount}`);
              throw e;
            }
            // Si requiere índice, continuar con fallback
            const msg = e?.message || '';
            if (/requires an index/i.test(msg) || e?.code === 'failed-precondition') {
              console.warn(`⚠️ [Firebase] Consulta requiere índice - intentando fallback`);
              break;
            }
            console.warn(`⚠️ [Firebase] Error en página ${pageCount}:`, e?.message);
            hasMorePages = false;
          }
        }

        // Si no hay resultados con la variante principal, probar otras variantes
        if (allResults.length === 0 && sectionVariants.length > 1) {
          for (let i = 1; i < sectionVariants.length; i++) {
            const variant = sectionVariants[i];
            console.log(`🔄 [Firebase] Reintentando con sectionId = "${variant}"`);
            
            try {
              const constraints: QueryConstraint[] = [
                where('year', '==', year),
                where('sectionId', '==', variant),
                limit(PAGE_SIZE)
              ];
              if (subjectId) {
                constraints.splice(2, 0, where('subjectId', '==', subjectId));
              }
              
              const snap = await withTimeout(
                getDocs(query(collectionGroup(db, 'grades'), ...constraints)),
                FIRESTORE_QUERY_TIMEOUT,
                { docs: [], size: 0, forEach: () => {} } as any
              );
              
              if (snap.size > 0) {
                console.log(`✅ [Firebase] Variante "${variant}" retornó ${snap.size} documentos`);
                allResults = snap.docs.map(buildRecord);
                break;
              }
            } catch (e: any) {
              if (e?.code === 'resource-exhausted') throw e;
              console.warn(`⚠️ [Firebase] Error con variante "${variant}":`, e?.message);
            }
          }
        }

        // Ordenar en cliente
        allResults.sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());
        
        console.log(`✅ [Firebase] Total: ${allResults.length} calificaciones (${pageCount} páginas)`);
        
        // 💾 Guardar en caché
        queryCache.set(cacheKey, allResults, QueryCache.GRADES_CACHE_TTL);
        
        return allResults;
      } catch (error: any) {
        console.error('❌ [Firebase] Error en consulta:', error?.message || error);
        
        if (error?.code !== 'resource-exhausted') {
          queryCache.set(cacheKey, [], 10 * 1000);
        }
        
        return [];
      }
    });
  }

  /**
   * Obtiene calificaciones por estudiante
   */
  async getGradesByStudent(studentId: string, year?: number): Promise<GradeRecord[]> {
    try {
      const db = this.getDb();
      const allGrades: GradeRecord[] = [];

      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      
      for (const courseDoc of coursesSnapshot.docs) {
        const courseId = courseDoc.id;
        const gradesRef = collection(db, `courses/${courseId}/grades`);
        const constraints: QueryConstraint[] = [where('studentId', '==', studentId)];
        
        if (year) constraints.push(where('year', '==', year));
        
        const q = query(gradesRef, ...constraints, orderBy('gradedAt', 'desc'));
        const gradesSnapshot = await getDocs(q);
        
        gradesSnapshot.forEach(doc => {
          const data = doc.data();
          // 🔥 IMPORTANTE: Asegurar que courseId está en los datos
          if (!data.courseId) {
            data.courseId = courseId;
          }
          allGrades.push(this.fromFirestoreGrade(data));
        });
      }

      return allGrades;
    } catch (error) {
      console.error('Error obteniendo calificaciones por estudiante:', error);
      return [];
    }
  }

  /**
   * Elimina todas las calificaciones de un año
   */
  async deleteGradesByYear(
    year: number,
    onProgress?: (deleted: number) => void
  ): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      const db = this.getDb();
      let deleted = 0;

      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      
      for (const courseDoc of coursesSnapshot.docs) {
        const gradesRef = collection(db, `courses/${courseDoc.id}/grades`);
        const q = query(gradesRef, where('year', '==', year));
        const gradesSnapshot = await getDocs(q);
        if (gradesSnapshot.size === 0) continue;

        // Eliminar en lotes más pequeños para evitar límites y actualizar progreso
        const docs = gradesSnapshot.docs;
        const CHUNK = 200;
        for (let i = 0; i < docs.length; i += CHUNK) {
          const part = docs.slice(i, i + CHUNK);
          const batch = writeBatch(db);
          for (const d of part) {
            batch.delete(d.ref);
          }
          await batch.commit();
          deleted += part.length;
          try { onProgress?.(deleted); } catch {}
        }
      }

      return { success: true, deleted };
    } catch (error: any) {
      console.error('Error eliminando calificaciones:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  }

  // ==================== ATTENDANCE ====================

  /**
   * Guarda registros de asistencia (batch con límite de 100 por lote)
   */
  async saveAttendance(records: AttendanceRecord[]): Promise<{ success: boolean; error?: string }> {
    try {
      const db = this.getDb();
      const BATCH_SIZE = 50; // Reducido a 50 para evitar sobrecarga
      let processed = 0;

      // Dividir en lotes pequeños
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = records.slice(i, i + BATCH_SIZE);

        for (const record of chunk) {
          const courseId = record.courseId || 'sin_curso';
          const attRef = doc(db, `courses/${courseId}/attendance`, record.id);
          
          const firestoreRecord = this.toFirestoreAttendance(record);
          batch.set(attRef, firestoreRecord, { merge: true });
        }

        await batch.commit();
        processed += chunk.length;
        console.log(`✅ Guardados ${processed}/${records.length} registros de asistencia`);
        
        // ⏱️ Pausa de 300ms entre lotes para evitar sobrecarga
        if (i + BATCH_SIZE < records.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error guardando asistencia:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene asistencia por año (con timeout para evitar bloqueos)
   */
  async getAttendanceByYear(year: number): Promise<AttendanceRecord[]> {
    // 🚫 Si la cuota está excedida, retornar inmediatamente
    if (isQuotaExceeded()) {
      console.warn('⚠️ [Firebase] Cuota excedida, saltando getAttendanceByYear');
      return [];
    }
    
    // Verificar cache primero
    const cacheKey = `attendance_year_${year}`;
    const cached = queryCache.get<AttendanceRecord[]>(cacheKey);
    if (cached) {
      console.log(`✅ [Cache] Usando asistencia cacheada para año ${year}:`, cached.length, 'registros');
      return cached;
    }

    try {
      console.log('🔍 getAttendanceByYear - Buscando registros para año:', year);
      const db = this.getDb();
      const allAttendance: AttendanceRecord[] = [];
      const seenIds = new Set<string>();

      // Agregar timeout para evitar bloqueos cuando Firebase no responde
      const coursesSnapshot = await withTimeout(
        getDocs(collection(db, 'courses')),
        FIRESTORE_QUERY_TIMEOUT,
        { docs: [], size: 0 } as any
      );
      
      if (coursesSnapshot.size === 0) {
        console.warn('⚠️ [Firestore] No se pudieron obtener cursos (timeout o sin datos)');
        return [];
      }
      
      console.log('📚 Cursos encontrados en Firestore:', coursesSnapshot.size);
      
      // Limitar a procesar máximo 20 cursos para evitar timeouts largos
      const coursesToProcess = coursesSnapshot.docs.slice(0, 20);
      
      for (const courseDoc of coursesToProcess) {
        try {
          const courseId = courseDoc.id;
          const attRef = collection(db, `courses/${courseId}/attendance`);
          
          // Buscar con year como número (con timeout individual)
          const qNum = query(attRef, where('year', '==', year));
          const attSnapshotNum = await withTimeout(
            getDocs(qNum),
            3000, // 3 segundos por curso
            { docs: [] } as any
          );
          
          // También buscar con year como string (por si fue guardado así)
          const qStr = query(attRef, where('year', '==', String(year)));
          const attSnapshotStr = await withTimeout(
            getDocs(qStr),
            3000,
            { docs: [] } as any
          );
          
          // Combinar resultados evitando duplicados
          const allDocs = [...(attSnapshotNum.docs || []), ...(attSnapshotStr.docs || [])];
          
          if (allDocs.length > 0) {
            console.log(`📊 Curso ${courseId}: ${allDocs.length} registros de asistencia encontrados`);
          }
          
          allDocs.forEach(doc => {
            const docId = doc.id;
            if (!seenIds.has(docId)) {
              seenIds.add(docId);
              allAttendance.push(this.fromFirestoreAttendance(doc.data()));
            }
          });
        } catch (e) {
          console.warn('⚠️ Error al leer asistencia del curso:', courseDoc.id, e);
        }
      }

      console.log('✅ Total de registros de asistencia recuperados:', allAttendance.length);
      
      // Guardar en cache solo si hay datos
      if (allAttendance.length > 0) {
        queryCache.set(cacheKey, allAttendance, 60000); // 1 minuto de cache
      }
      
      return allAttendance;
    } catch (error: any) {
      console.error('❌ Error en getAttendanceByYear:', error);
      
      // 🚫 Detectar error de cuota y activar modo offline
      if (isQuotaError(error)) {
        setQuotaExceeded(true);
      }
      
      return [];
    }
  }

  /**
   * Elimina registros de asistencia por año
   */
  async deleteAttendanceByYear(year: number, onProgress?: (deleted: number) => void): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      const db = this.getDb();
      let deleted = 0;
      const seenIds = new Set<string>();

      console.log(`🗑️ [Firebase] Iniciando eliminación de asistencia para el año ${year}`);
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      console.log(`📚 [Firebase] Encontrados ${coursesSnapshot.size} cursos para revisar`);
      
      for (const courseDoc of coursesSnapshot.docs) {
        const attRef = collection(db, `courses/${courseDoc.id}/attendance`);
        
        // Buscar con year como número
        const qNum = query(attRef, where('year', '==', year));
        const attSnapshotNum = await getDocs(qNum);
        
        // También buscar con year como string (por si fue guardado así)
        const qStr = query(attRef, where('year', '==', String(year)));
        const attSnapshotStr = await getDocs(qStr);
        
        // Combinar resultados evitando duplicados
        const allDocs = [...attSnapshotNum.docs, ...attSnapshotStr.docs].filter(d => {
          if (seenIds.has(d.id)) return false;
          seenIds.add(d.id);
          return true;
        });
        
        console.log(`📋 [Firebase] Curso ${courseDoc.id}: ${allDocs.length} registros de asistencia para el año ${year} (num: ${attSnapshotNum.size}, str: ${attSnapshotStr.size})`);
        
        if (allDocs.length === 0) continue;
        
        // Procesar en lotes para evitar límites de Firestore
        const CHUNK = 200;
        
        for (let i = 0; i < allDocs.length; i += CHUNK) {
          const part = allDocs.slice(i, i + CHUNK);
          const batch = writeBatch(db);
          
          for (const d of part) {
            batch.delete(d.ref);
          }
          
          await batch.commit();
          deleted += part.length;
          
          console.log(`✅ [Firebase] Batch eliminado: ${part.length} registros (Total: ${deleted})`);
          
          // Callback de progreso
          try { onProgress?.(deleted); } catch {}
        }
      }

      console.log(`🎯 [Firebase] Eliminación completada: ${deleted} registros eliminados del año ${year}`);
      return { success: true, deleted };
    } catch (error: any) {
      console.error('Error eliminando asistencia:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  }

  /**
   * Elimina registros de asistencia por fecha, curso y sección específicos
   */
  async deleteAttendanceByDateCourseSection(year: number, ymd: string, courseId: string | null, sectionId: string | null): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      const db = this.getDb();
      let deleted = 0;

      console.log('🗑️ deleteAttendanceByDateCourseSection - Params:', { year, ymd, courseId, sectionId });

      // Normalizar la fecha para comparación
      const targetDate = ymd.slice(0, 10); // YYYY-MM-DD

      // Si no hay courseId, buscar en todos los cursos
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      
      for (const courseDoc of coursesSnapshot.docs) {
        // Si se especifica courseId, solo procesar ese curso
        if (courseId && courseDoc.id !== courseId) {
          continue;
        }

        const attRef = collection(db, `courses/${courseDoc.id}/attendance`);
        
        // Query simple solo por año (no requiere índice compuesto)
        const q = query(attRef, where('year', '==', year));
        const attSnapshot = await getDocs(q);
        
        if (attSnapshot.size === 0) continue;
        
        // Filtrar en memoria por fecha y sección
        const docsToDelete = attSnapshot.docs.filter(doc => {
          const data = doc.data();
          
          // Comparar fecha
          let docDate = '';
          if (data.date?.toDate) {
            docDate = data.date.toDate().toISOString().slice(0, 10);
          } else if (typeof data.date === 'string') {
            docDate = data.date.slice(0, 10);
          }
          
          if (docDate !== targetDate) {
            return false;
          }
          
          // Comparar sección si se especifica
          if (sectionId && data.sectionId !== sectionId) {
            return false;
          }
          
          return true;
        });
        
        console.log(`📊 Curso ${courseDoc.id}: ${docsToDelete.length} registros encontrados para eliminar`);
        
        if (docsToDelete.length === 0) continue;
        
        // Eliminar en lotes
        const CHUNK = 200;
        
        for (let i = 0; i < docsToDelete.length; i += CHUNK) {
          const part = docsToDelete.slice(i, i + CHUNK);
          const batch = writeBatch(db);
          
          for (const d of part) {
            batch.delete(d.ref);
          }
          
          await batch.commit();
          deleted += part.length;
        }
      }

      console.log(`✅ Total de registros eliminados: ${deleted}`);
      return { success: true, deleted };
    } catch (error: any) {
      console.error('❌ Error eliminando asistencia por fecha/curso/sección:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  }

  async deleteAttendanceById(id: string): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      const db = this.getDb();
      console.log('🗑️ deleteAttendanceById - ID:', id);

      // El ID tiene el formato: att-{studentId}-{sectionId}-{dayKey}
      // Necesitamos buscar en todos los cursos porque no sabemos el courseId desde el ID
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      
      for (const courseDoc of coursesSnapshot.docs) {
        const attRef = doc(db, `courses/${courseDoc.id}/attendance/${id}`);
        const attDoc = await getDoc(attRef);
        
        if (attDoc.exists()) {
          await deleteDoc(attRef);
          console.log(`✅ Registro de asistencia eliminado: ${id}`);
          return { success: true, deleted: 1 };
        }
      }

      console.log(`⚠️ No se encontró el registro de asistencia: ${id}`);
      return { success: true, deleted: 0 };
    } catch (error: any) {
      console.error('❌ Error eliminando asistencia por ID:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  }

  // ==================== ACTIVITIES ====================

  /**
   * Guarda actividades (batch con límite de 100 por lote)
   */
  async saveActivities(activities: ActivityRecord[]): Promise<{ success: boolean; error?: string }> {
    try {
      const db = this.getDb();
      const BATCH_SIZE = 20; // 🔥 REDUCIDO a 20 para evitar "resource-exhausted"
      let processed = 0;

      // Pre-chequeo de permisos específico para detectar temprano errores de reglas.
      // Esto evita procesar miles de actividades antes de descubrir un PERMISSION_DENIED genérico.
      try {
        const permRef = doc(db, '_perm_checks', 'activities_write');
        await setDoc(permRef, { ts: Timestamp.now(), scope: 'activities' }, { merge: true });
      } catch (permErr: any) {
        console.error('❌ Firestore: permiso de escritura denegado para actividades (pre-check).', permErr);
        return { success: false, error: `permission-precheck: ${permErr?.message || 'PERMISSION_DENIED'}` };
      }

      // 🆕 Paso 1: Asegurar que todos los cursos existen en Firebase
      const uniqueCourseIds = new Set<string>();
      activities.forEach(activity => {
        if (activity.courseId) {
          uniqueCourseIds.add(activity.courseId);
        }
      });

      console.log(`📚 Asegurando ${uniqueCourseIds.size} cursos en Firebase (actividades)...`);
      for (const courseId of uniqueCourseIds) {
        try {
          const courseRef = doc(db, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (!courseDoc.exists()) {
            // Crear el curso en Firebase si no existe
            await setDoc(courseRef, {
              id: courseId,
              name: courseId, // Placeholder
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            });
            console.log(`✅ Curso creado en Firebase: ${courseId}`);
          }
        } catch (courseError) {
          console.warn(`⚠️ No se pudo crear curso ${courseId}:`, courseError);
        }
      }

      // Paso 2: Guardar actividades en lotes MUY pequeños con pausas largas
      for (let i = 0; i < activities.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = activities.slice(i, i + BATCH_SIZE);

        for (const activity of chunk) {
          const courseId = activity.courseId || 'sin_curso';
          const actRef = doc(db, `courses/${courseId}/activities`, activity.id);
          
          const firestoreActivity = this.toFirestoreActivity(activity);
          batch.set(actRef, firestoreActivity, { merge: true });
        }

        await batch.commit();
        processed += chunk.length;
        
        // 🔇 Log cada 100 registros para no saturar consola
        if (processed % 100 === 0 || processed === activities.length) {
          console.log(`✅ Guardadas ${processed}/${activities.length} actividades`);
        }
        
        // ⏱️ Pausa de 600ms entre lotes para evitar "resource-exhausted"
        if (i + BATCH_SIZE < activities.length) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error guardando actividades:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== CONVERSIONES ====================

  private toFirestoreGrade(grade: GradeRecord): DocumentData {
    return {
      ...grade,
      year: Number(grade.year), // Asegurar que year sea número
      gradedAt: Timestamp.fromDate(new Date(grade.gradedAt)),
      createdAt: Timestamp.fromDate(new Date(grade.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(grade.updatedAt)),
    };
  }

  private fromFirestoreGrade(data: DocumentData): GradeRecord {
    return {
      ...data,
      gradedAt: data.gradedAt?.toDate?.()?.toISOString() || data.gradedAt,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as GradeRecord;
  }

  private toFirestoreAttendance(record: AttendanceRecord): DocumentData {
    // Firestore no acepta valores undefined, debemos convertirlos a null o excluirlos
    const cleanRecord: any = {};
    
    for (const [key, value] of Object.entries(record)) {
      if (value !== undefined) {
        cleanRecord[key] = value;
      }
    }
    
    // Asegurar que los campos críticos estén presentes
    // Preservar campos originales del CSV (course/curso, section/seccion) para matching posterior
    const result = {
      ...cleanRecord,
      id: record.id,
      courseId: record.courseId || null,
      sectionId: record.sectionId || null,
      studentId: record.studentId || null,
      status: record.status,
      year: record.year || new Date().getFullYear(),
      date: Timestamp.fromDate(new Date(record.date)),
      createdAt: record.createdAt ? Timestamp.fromDate(new Date(record.createdAt)) : Timestamp.now(),
      updatedAt: record.updatedAt ? Timestamp.fromDate(new Date(record.updatedAt)) : Timestamp.now(),
      comment: record.notes ?? record.comment ?? null,
      // 🎯 Preservar nombres de curso/sección para matching por nombre
      course: (record as any).course || (record as any).curso || null,
      section: (record as any).section || (record as any).seccion || null,
    };
    
    return result;
  }

  private fromFirestoreAttendance(data: DocumentData): AttendanceRecord {
    // Mapear los campos de la carga masiva al formato esperado
    const status = data.status || data.estado || 'present';
    const present = status === 'present' || status === 'Presente' || status === 'presente';
    
    const result = {
      id: data.id,
      date: data.date?.toDate?.()?.toISOString() || data.dateString || data.date || data.fecha,
      courseId: data.courseId || null,
      sectionId: data.sectionId || null,
      // 🎯 Nombres originales del curso/sección (para matching por nombre)
      course: data.course || data.curso || null,
      section: data.section || data.seccion || null,
      // Campos adicionales del CSV para identificación
      rut: data.rut || null,
      username: data.username || data.studentUsername || null,
      studentId: data.studentUsername || data.studentId || data.username || '',
      status: status,
      present: present,
      comment: data.comment || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      year: data.year || new Date().getFullYear(),
    } as AttendanceRecord;
    
    return result;
  }

  private toFirestoreActivity(activity: ActivityRecord): DocumentData {
    return {
      ...activity,
      createdAt: Timestamp.fromDate(new Date(activity.createdAt)),
      startAt: activity.startAt ? Timestamp.fromDate(new Date(activity.startAt)) : null,
      openAt: activity.openAt ? Timestamp.fromDate(new Date(activity.openAt)) : null,
      dueDate: activity.dueDate ? Timestamp.fromDate(new Date(activity.dueDate)) : null,
    };
  }

  private fromFirestoreActivity(data: DocumentData): ActivityRecord {
    const sanitize = (v: any) => typeof v === 'string' ? v.normalize('NFC').replace(/\s+/g, ' ').trim() : v;
    const isLikelyMojibake = (s: string) => /\b(ao|anos|organos|alimentacin|evaluacion|rganos|estacin|estaciones|cin)\b/i.test(s);
    const repairBasic = (s: string): string => {
      return s
  .replace(/\bano(s?)\b/gi, 'año$1')
  .replace(/\b(del|el|al|un|este|cada|por) ao\b/gi, (_, det) => `${det} año`)
  .replace(/\bao\b/gi, 'año')
        .replace(/\borganos\b/gi, 'órganos')
        .replace(/rganos/gi, 'órganos')
        .replace(/alimentacin/gi, 'alimentación')
        .replace(/evaluacion/gi, 'evaluación')
        .replace(/estacion(es?)/gi, 'estación$1')
        .replace(/cin(\b)/gi, 'ción$1');
    };
    const toISO = (value: any) => {
      if (value?.toDate) {
        try { return value.toDate().toISOString(); } catch { return null; }
      }
      return value ?? null;
    };

    const out = {
      ...data,
      createdAt: toISO(data.createdAt) || new Date().toISOString(),
      startAt: toISO(data.startAt),
      openAt: toISO(data.openAt),
      dueDate: toISO(data.dueDate),
    } as ActivityRecord;

    // Sanitización conservadora
    if (out.title) {
      out.title = sanitize(out.title);
      if (isLikelyMojibake(out.title)) out.title = repairBasic(out.title);
    }
    if ((out as any).subjectName) {
      (out as any).subjectName = sanitize((out as any).subjectName);
      if (isLikelyMojibake((out as any).subjectName)) (out as any).subjectName = repairBasic((out as any).subjectName);
    }
    // 🌟 NUEVO: Sanitizar topic si existe
    if ((out as any).topic) {
      (out as any).topic = sanitize((out as any).topic);
      if (isLikelyMojibake((out as any).topic)) (out as any).topic = repairBasic((out as any).topic);
    }

    return out;
  }

    /**
   * Obtiene estadísticas de uso
   * Nota: Esta función intenta contar documentos pero puede fallar por permisos.
   * Los errores se manejan silenciosamente y se devuelven ceros.
   */
  async getStats(): Promise<{
    grades: number;
    attendance: number;
    activities: number;
  }> {
    try {
      const db = this.getDb();
      let grades = 0, attendance = 0, activities = 0;

      // Intentar contar calificaciones desde la estructura de cursos
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        
        for (const courseDoc of coursesSnapshot.docs) {
          const courseId = courseDoc.id;
          try {
            const gradesSnap = await getDocs(collection(db, `courses/${courseId}/grades`));
            grades += gradesSnap.size;
          } catch (e) {
            // Silenciar errores de permisos en subcolecciones
          }
        }
      } catch (e) {
        // Silenciar errores de lectura de cursos
      }

      // Intentar contar asistencia desde la colección principal
      try {
        const attSnap = await getDocs(collection(db, 'attendance'));
        attendance = attSnap.size;
      } catch (e) {
        // Silenciar errores de permisos
      }

      // Intentar contar actividades desde la colección principal
      try {
        const actSnap = await getDocs(collection(db, 'activities'));
        activities = actSnap.size;
      } catch (e) {
        // Silenciar errores de permisos
      }

      return { grades, attendance, activities };
    } catch (error) {
      // Error general - devolver ceros sin loggear
      return { grades: 0, attendance: 0, activities: 0 };
    }
  }

  // ==================== MÉTODOS ADICIONALES PARA COMPATIBILIDAD ====================

  /**
   * Inserta calificaciones con callback de progreso
   */
  async insertGrades(grades: GradeRecord[], onProgress?: (progress: any) => void): Promise<{ success: boolean; error?: string }> {
    return this.saveGrades(grades);
  }

  /**
   * Cuenta calificaciones por año
   */
  async countGradesByYear(year: number): Promise<{ count: number; year: number }> {
    try {
      const grades = await this.getGradesByYear(year);
      return { count: grades.length, year };
    } catch (error) {
      console.error('Error counting grades by year:', error);
      return { count: 0, year };
    }
  }

  /**
   * Cuenta todas las calificaciones
   */
  async countAllGrades(): Promise<{ total: number }> {
    try {
      console.log('🔢 [Firebase] Contando todas las calificaciones...');
      const stats = await this.getStats();
      console.log(`✅ [Firebase] Total de calificaciones: ${stats.grades}`);
      return { total: stats.grades };
    } catch (error) {
      console.error('❌ [Firebase] Error counting all grades:', error);
      return { total: 0 };
    }
  }

  /**
   * Limpia todos los datos
   */
  async clearAllData(): Promise<{ success: boolean; logs: string[]; error?: string }> {
    const logs: string[] = [];
    try {
      const db = this.getDb();
      logs.push('🗑️ Iniciando limpieza completa del sistema...');
      console.log('🗑️ Iniciando limpieza completa del sistema...');
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      logs.push(`📚 Encontrados ${coursesSnapshot.docs.length} cursos para limpiar`);
      console.log(`📚 Encontrados ${coursesSnapshot.docs.length} cursos para limpiar`);

      // 1) Borrar subcolecciones de cada curso (grades, attendance, activities) y luego el documento del curso
      let processedCourses = 0;
      for (const courseDoc of coursesSnapshot.docs) {
        const courseId = courseDoc.id;

        // Utilidad: borrar todos los documentos de una subcolección en chunks
        const deleteSubcollection = async (path: string, collectionName: string) => {
          try {
            const coll = collection(db, path);
            const snap = await getDocs(coll);
            if (snap.size === 0) return 0;
            
            const CHUNK = 50; // 🔥 REDUCIDO de 200 a 50 para evitar resource-exhausted
            const docs = snap.docs;
            let deleted = 0;
            
            for (let i = 0; i < docs.length; i += CHUNK) {
              const part = docs.slice(i, i + CHUNK);
              const batch = writeBatch(db);
              for (const d of part) batch.delete(d.ref);
              await batch.commit();
              deleted += part.length;
              
              // ⏱️ Pausa de 400ms entre lotes para evitar "resource-exhausted"
              if (i + CHUNK < docs.length) {
                await new Promise(resolve => setTimeout(resolve, 400));
              }
            }
            
            console.log(`  ✅ ${collectionName}: ${deleted} registros eliminados`);
            return deleted;
          } catch (e) {
            console.warn(`[Firestore clearAllData] No se pudo limpiar subcolección ${path}:`, e);
            return 0;
          }
        };

        console.log(`\n🔄 Procesando curso: ${courseId}`);
        await deleteSubcollection(`courses/${courseId}/grades`, 'Calificaciones');
        await deleteSubcollection(`courses/${courseId}/attendance`, 'Asistencia');
        await deleteSubcollection(`courses/${courseId}/activities`, 'Actividades');

        // Finalmente eliminar el documento del curso
        try {
          await deleteDoc(doc(db, 'courses', courseId));
          processedCourses++;
          console.log(`✅ Curso eliminado: ${courseId} (${processedCourses}/${coursesSnapshot.docs.length})`);
        } catch (e) {
          console.warn(`[Firestore clearAllData] No se pudo eliminar el curso ${courseId}:`, e);
        }
        
        // ⏱️ Pausa de 800ms entre cursos para evitar sobrecarga
        if (processedCourses < coursesSnapshot.docs.length) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      // 2) Intentar limpiar colecciones de estructura y usuarios si existieran
      console.log('\n🗑️ Limpiando colecciones del sistema...');
      const maybeCollections = [
        'users',
        'students',
        'teachers',
        'administrators',
        'sections',
        'subjects',
        'teacher-assignments',
        'student-assignments',
        'assignments'
      ];

      for (const collName of maybeCollections) {
        try {
          const snap = await getDocs(collection(db, collName));
          if (snap.size === 0) {
            console.log(`  ⚪ ${collName}: vacía`);
            continue;
          }
          
          const CHUNK = 50; // 🔥 REDUCIDO de 300 a 50 para evitar resource-exhausted
          const docs = snap.docs;
          let deleted = 0;
          
          for (let i = 0; i < docs.length; i += CHUNK) {
            const part = docs.slice(i, i + CHUNK);
            const batch = writeBatch(db);
            for (const d of part) batch.delete(d.ref);
            await batch.commit();
            deleted += part.length;
            
            // ⏱️ Pausa de 400ms entre lotes
            if (i + CHUNK < docs.length) {
              await new Promise(resolve => setTimeout(resolve, 400));
            }
          }
          
          console.log(`  ✅ ${collName}: ${deleted} registros eliminados`);
          
          // ⏱️ Pausa de 500ms entre colecciones
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (e) {
          // Si la colección no existe o hay permisos restringidos, registrar y continuar
          console.info(`  ⚠️ ${collName}: no disponible o ya vacía`);
        }
      }

      console.log('\n✅ Limpieza completa del sistema finalizada');
      logs.push('✅ Limpieza completa del sistema finalizada');
      return { success: true, logs };
    } catch (error: any) {
      console.error('❌ Error en limpieza del sistema:', error);
      logs.push(`❌ Error: ${error.message}`);
      return { success: false, logs, error: error.message };
    }
  }

  /**
   * Inserta registros de asistencia con callback de progreso
   */
  async insertAttendance(records: AttendanceRecord[], onProgress?: (progress: any) => void): Promise<{ success: boolean; error?: string }> {
    return this.saveAttendance(records);
  }

  /**
   * Cuenta registros de asistencia por año
   */
  async countAttendanceByYear(year: number): Promise<number> {
    const records = await this.getAttendanceByYear(year);
    return records.length;
  }

  /**
   * Cuenta todos los registros de asistencia
   */
  async countAllAttendance(): Promise<number> {
    const stats = await this.getStats();
    return stats.attendance;
  }

  /**
   * Inserta actividades con callback de progreso
   */
  async insertActivities(activities: ActivityRecord[], onProgress?: (progress: any) => void): Promise<{ success: boolean; error?: string }> {
    return this.saveActivities(activities);
  }

  /**
   * Obtiene actividades por año con filtros opcionales.
   * Filtros soportados: courseId (optimiza recorrido), sectionId, subjectId.
   * Compatibilidad: la firma anterior (solo año) sigue funcionando.
   */
  async getActivitiesByYear(year: number, filters?: { courseId?: string | null; sectionId?: string | null; subjectId?: string | null }): Promise<{ activities: ActivityRecord[] }> {
    try {
      const db = this.getDb();
      const allActivities: ActivityRecord[] = [];
      const sanitize = (v: any) => typeof v === 'string' ? v.normalize('NFC').replace(/\s+/g, ' ').trim() : v;
      const isLikelyMojibake = (s: string) => /\b(ao|anos|organos|alimentacin|evaluacion|rganos|estacin|estaciones|cin)\b/i.test(s);
      const repairBasic = (s: string): string => {
        // Reglas muy conservadoras para no sobrecorregir
        return s
          .replace(/\bano(s?)\b/gi, 'año$1')
          .replace(/\borganos\b/gi, 'órganos')
          .replace(/rganos/gi, 'órganos')
          .replace(/alimentacin/gi, 'alimentación')
          .replace(/evaluacion/gi, 'evaluación')
          .replace(/estacion(es?)/gi, 'estación$1')
          .replace(/cin(\b)/gi, 'ción$1');
      };

      const { courseId, sectionId, subjectId } = filters || {};

      // Si se especifica courseId, limitar a ese curso para reducir lecturas
      const courseDocs = [] as any[];
      if (courseId) {
        const specific = await withTimeout(
          getDoc(doc(db, 'courses', String(courseId))),
          FIRESTORE_QUERY_TIMEOUT,
          null as any
        );
        if (specific && specific.exists()) courseDocs.push(specific);
        else return { activities: [] }; // curso inexistente o timeout: retornar vacío
      } else {
        const coursesSnapshot = await withTimeout(
          getDocs(collection(db, 'courses')),
          FIRESTORE_QUERY_TIMEOUT,
          { docs: [] } as any
        );
        courseDocs.push(...coursesSnapshot.docs);
      }

      for (const courseDoc of courseDocs) {
        const cId = courseDoc.id;
        const activitiesRef = collection(db, `courses/${cId}/activities`);
        const constraints: QueryConstraint[] = [where('year', '==', year)];
        if (sectionId) constraints.push(where('sectionId', '==', sectionId));
        if (subjectId) constraints.push(where('subjectId', '==', subjectId));
        const q = query(activitiesRef, ...constraints);
        const snap = await withTimeout(
          getDocs(q),
          FIRESTORE_QUERY_TIMEOUT,
          { forEach: () => {} } as any
        );
        snap.forEach(docSnap => {
          const raw = this.fromFirestoreActivity(docSnap.data());
          // Sanitización ligera y reparación mínima (solo si parece mojibake)
          raw.title = sanitize(raw.title);
          if (raw.subjectName) raw.subjectName = sanitize(raw.subjectName);
          if (raw.title && isLikelyMojibake(raw.title)) raw.title = repairBasic(raw.title);
          if (raw.subjectName && isLikelyMojibake(raw.subjectName)) raw.subjectName = repairBasic(raw.subjectName);
          // 🌟 NUEVO: Sanitizar topic si existe
          if (raw.topic) {
            raw.topic = sanitize(raw.topic);
            if (isLikelyMojibake(raw.topic)) raw.topic = repairBasic(raw.topic);
          }
          allActivities.push(raw);
        });
      }

      return { activities: allActivities };
    } catch (error) {
      console.error('Error obteniendo actividades (con filtros opcionales):', error);
      return { activities: [] };
    }
  }

  async deleteActivitiesByYear(year: number, onProgress?: (deleted: number) => void): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      const db = this.getDb();
      let deleted = 0;

      const coursesSnapshot = await withTimeout(
        getDocs(collection(db, 'courses')),
        FIRESTORE_QUERY_TIMEOUT,
        { docs: [] } as any
      );

      for (const courseDoc of coursesSnapshot.docs) {
        const activitiesRef = collection(db, `courses/${courseDoc.id}/activities`);
        const activitiesSnapshot = await withTimeout(
          getDocs(query(activitiesRef, where('year', '==', year))),
          FIRESTORE_QUERY_TIMEOUT,
          { docs: [], size: 0 } as any
        );
        if (activitiesSnapshot.size === 0) continue;

        const docs = activitiesSnapshot.docs;
        const CHUNK = 200;
        for (let i = 0; i < docs.length; i += CHUNK) {
          const part = docs.slice(i, i + CHUNK);
          const batch = writeBatch(db);
          for (const d of part) {
            batch.delete(d.ref);
          }
          await batch.commit();
          deleted += part.length;
          try { onProgress?.(deleted); } catch {}
        }
      }

      return { success: true, deleted };
    } catch (error: any) {
      console.error('Error eliminando actividades:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  }
}

// Instancia singleton
export const firestoreDB = FirestoreDatabaseService.instance();
