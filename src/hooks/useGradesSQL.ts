import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { sqlDB } from '@/lib/idb-sql';
import { setForceIDB, isFirebaseEnabled } from '@/lib/sql-config';
import { firestoreDB } from '@/lib/firestore-database';
import { writeKPIsSnapshot } from '@/lib/kpis-snapshot';
import { getGradingConfig } from '@/lib/grading';
import { initializeSQL, onSQLStatusChange, isSQLConnected } from '@/lib/sql-init';

export type UploadPhase = 'conectando' | 'procesando' | 'finalizando' | 'completado' | 'error';

export interface UploadProgress {
  current: number;
  total: number;
  phase: UploadPhase;
  logs: string[];
  errors: number;
  success: number;
  startTime: number;
  elapsedTime: number;
}

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
  gradedAt: string;
  year: number;
  type: 'tarea' | 'prueba' | 'evaluacion';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  taskType: 'tarea' | 'prueba' | 'evaluacion';
  title: string;
  subjectId: string | null;
  subjectName?: string | null;
  courseId: string | null;
  sectionId: string | null;
  createdAt: string; // ISO
  startAt?: string | null;
  openAt?: string | null;
  dueDate?: string | null;
  status?: string | null;
  assignedById?: string | null;
  assignedByName?: string | null;
  year: number;
}

// (El backend ahora decide dinámicamente: Firestore si está habilitado, sino IndexedDB)
const backend = () => (isFirebaseEnabled() ? (firestoreDB as any) : (sqlDB as any));
const sqlDatabase = {
  testConnection: () => backend().testConnection(),
  insertGrades: (grades: GradeRecord[], onProgress?: (progress: { processed: number; total: number; currentBatch: number; totalBatches: number; errors: number; successRate: number }) => void) => backend().insertGrades(grades as any, onProgress),
  deleteGradesByYear: (year: number) => backend().deleteGradesByYear(year),
  clearAllData: () => backend().clearAllData(),
  countGradesByYear: (year: number) => backend().countGradesByYear(year),
  countAllGrades: () => backend().countAllGrades(),
  getGradesByYear: (year: number) => backend().getGradesByYear(year),
  // actividades
  insertActivities: (activities: ActivityRecord[], onProgress?: (progress: { processed: number; total: number; currentBatch: number; totalBatches: number; errors: number; successRate: number }) => void) => (backend() as any).insertActivities(activities, onProgress),
  getActivitiesByYear: (year: number, filters?: { courseId?: string | null; sectionId?: string | null; subjectId?: string | null }) => (backend() as any).getActivitiesByYear(year, filters),
  deleteActivitiesByYear: (year: number) => (backend() as any).deleteActivitiesByYear(year)
};

export function useGradesSQL() {
  const { toast } = useToast();
  const { translate } = useLanguage();
  // 🔧 Inicializar como conectado si Firebase está habilitado, o verificar IDB-SQL
  const [isConnected, setIsConnected] = useState(() => isFirebaseEnabled() || isSQLConnected());
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<UploadProgress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gradesCount, setGradesCount] = useState<{ year: number; count: number } | null>(null);
  const [totalGrades, setTotalGrades] = useState<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastUploadUpdateRef = useRef<number>(0); // Para throttling de UI updates

  // Suscribirse a cambios de estado SQL global
  useEffect(() => {
    // 📖 CARGAR contadores desde localStorage al iniciar (recuperación inmediata)
    try {
      const cachedTotal = localStorage.getItem('grade-counter-total');
      if (cachedTotal) {
        const total = Number(cachedTotal) || 0;
        setTotalGrades(total);
        console.log(`📖 [INIT] Contador total recuperado desde localStorage: ${total}`);
      }
      
      const currentYear = new Date().getFullYear();
      const cachedYear = localStorage.getItem(`grade-counter-year-${currentYear}`);
      if (cachedYear) {
        const count = Number(cachedYear) || 0;
        setGradesCount({ year: currentYear, count });
        console.log(`📖 [INIT] Contador de año ${currentYear} recuperado desde localStorage: ${count}`);
      }
    } catch (e) {
      console.warn('⚠️ [INIT] Error recuperando contadores desde localStorage:', e);
    }
    
    const unsubscribe = onSQLStatusChange((status) => {
      const connected = status === 'connected';
      setIsConnected(connected);
      
      if (connected) {
        // Cargar contadores cuando se conecta (actualizar desde BD)
        const loadCounters = async () => {
          try {
            const { total } = await sqlDatabase.countAllGrades();
            setTotalGrades(total);
            
            if (total > 0) {
              const currentYear = new Date().getFullYear();
              const { count } = await sqlDatabase.countGradesByYear(currentYear);
              setGradesCount({ year: currentYear, count });
            }
          } catch (e) {
            console.warn('Error loading SQL counters:', e);
          }
        };
        loadCounters();
      }
    });

    // Trigger initialization if not already done
    initializeSQL();

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const result = await sqlDatabase.testConnection();
      if (!result.success) {
        setForceIDB(true);
      } else {
        setForceIDB(false);
      }
      setIsConnected(result.success);
      return result.success;
    } catch (e: any) {
      setIsConnected(false);
      // Re-trigger global initialization on failure
      initializeSQL(true);
      throw new Error('No se pudo conectar a la base de datos SQL');
    }
  }, []);

  const countGradesByYear = useCallback(async (year: number) => {
    try {
      const res = await sqlDatabase.countGradesByYear(year);
      setGradesCount({ year: res.year, count: res.count });
      
      // 💾 PERSISTIR en localStorage para mantener entre cambios de pestaña
      try {
        localStorage.setItem(`grade-counter-year-${year}`, String(res.count));
        console.log(`💾 Contador de año ${year} guardado en localStorage: ${res.count}`);
      } catch (storageError) {
        console.warn('⚠️ No se pudo guardar contador de año en localStorage:', storageError);
      }
      
      return res;
    } catch (e: any) {
      console.error('Error counting grades by year:', e);
      
      // 📖 Intentar recuperar desde localStorage si falla la consulta
      try {
        const cached = localStorage.getItem(`grade-counter-year-${year}`);
        if (cached) {
          const count = Number(cached) || 0;
          console.log(`📖 Recuperado contador de año ${year} desde localStorage: ${count}`);
          setGradesCount({ year, count });
          return { count, year };
        }
      } catch {}
      
      return { count: 0, year };
    }
  }, []);

  const countAllGrades = useCallback(async () => {
    try {
      const res = await sqlDatabase.countAllGrades();
      setTotalGrades(res.total);
      
      // 💾 PERSISTIR en localStorage para mantener entre cambios de pestaña
      try {
        localStorage.setItem('grade-counter-total', String(res.total));
        console.log(`💾 Contador total guardado en localStorage: ${res.total}`);
      } catch (storageError) {
        console.warn('⚠️ No se pudo guardar contador total en localStorage:', storageError);
      }
      
      return res;
    } catch (e: any) {
      console.error('Error counting all grades:', e);
      
      // 📖 Intentar recuperar desde localStorage si falla la consulta
      try {
        const cached = localStorage.getItem('grade-counter-total');
        if (cached) {
          const total = Number(cached) || 0;
          console.log(`📖 Recuperado contador total desde localStorage: ${total}`);
          setTotalGrades(total);
          return { total };
        }
      } catch {}
      
      return { total: 0 };
    }
  }, []);

  const updateCountersAfterUpload = useCallback(async (year: number) => {
    await countGradesByYear(year);
    await countAllGrades();
  }, [countGradesByYear, countAllGrades]);

  const getGradesByYear = useCallback(async (year: number) => {
    try {
      const res = await sqlDatabase.getGradesByYear(year);
      
      // El backend puede devolver directamente un array (Firebase) o un objeto con .grades (IndexedDB/Supabase)
      let grades: any[];
      if (Array.isArray(res)) {
        grades = res;
      } else if (res && typeof res === 'object' && Array.isArray(res.grades)) {
        grades = res.grades;
      } else {
        console.warn(`⚠️ getGradesByYear returned invalid format for year ${year}:`, res);
        grades = [];
      }
      
      // 🔧 FALLBACK: Si Firebase retorna vacío, intentar localStorage
      if (grades.length === 0) {
        console.log(`⚠️ [getGradesByYear] Firebase vacío para ${year}, intentando localStorage...`);
        try {
          const { LocalStorageManager } = await import('@/lib/education-utils');
          const localGrades = LocalStorageManager.getTestGradesForYear(year) || [];
          if (Array.isArray(localGrades) && localGrades.length > 0) {
            console.log(`✅ [getGradesByYear] Recuperadas ${localGrades.length} calificaciones desde localStorage`);
            return localGrades;
          }
        } catch (lsError) {
          console.warn('[getGradesByYear] Error leyendo localStorage:', lsError);
        }
      }
      
      return grades;
    } catch (e: any) {
      console.error('Error getting grades by year:', e);
      
      // 🔧 FALLBACK en caso de error (ej: cuota excedida)
      console.log(`⚠️ [getGradesByYear] Error en Firebase, intentando localStorage como fallback...`);
      try {
        const { LocalStorageManager } = await import('@/lib/education-utils');
        const localGrades = LocalStorageManager.getTestGradesForYear(year) || [];
        if (Array.isArray(localGrades) && localGrades.length > 0) {
          console.log(`✅ [getGradesByYear] Fallback: ${localGrades.length} calificaciones desde localStorage`);
          return localGrades;
        }
      } catch (lsError) {
        console.warn('[getGradesByYear] Error en fallback localStorage:', lsError);
      }
      
      return [];
    }
  }, []);

  /**
   * 🔥 NUEVA: Obtiene calificaciones filtradas por curso y sección (OPTIMIZADO)
   */
  const getGradesByCourseAndSection = useCallback(async (
    courseId: string,
    sectionId: string | null,
    year: number,
    subjectId?: string | null
  ) => {
    try {
      // Solo Firebase soporta esta consulta optimizada
      if (isFirebaseEnabled()) {
        const res = await (backend() as any).getGradesByCourseAndSection(courseId, sectionId, year, subjectId);
        return Array.isArray(res) ? res : [];
      } else {
        // Fallback: cargar todo el año y filtrar en cliente
        console.warn('⚠️ Consulta optimizada no disponible en modo SQL, usando fallback');
        const allGrades = await getGradesByYear(year);
        return allGrades.filter((g: any) => {
          if (g.courseId !== courseId) return false;
          if (sectionId && g.sectionId !== sectionId) return false;
          if (subjectId && g.subjectId !== subjectId) return false;
          return true;
        });
      }
    } catch (e: any) {
      console.error('Error getting grades by course and section:', e);
      return [];
    }
  }, [getGradesByYear]);

  const resetProgress = useCallback(() => {
    setUploadProgress(null);
  }, []);
  const resetDeleteProgress = useCallback(() => {
    setDeleteProgress(null);
  }, []);

  const uploadGradesToSQL = useCallback(async (grades: GradeRecord[]) => {
    // Versión ultra-rápida: lotes grandes adaptativos, concurrencia controlada (igual que asistencia)
    if (!grades || grades.length === 0) return true;
    if (isUploading) return false;
    setIsUploading(true);
    
    const startTime = Date.now();
    
    try {
      // Conectar si no está conectado
      if (!isConnected) {
        await checkConnection();
      }
      
      let success = 0, errors = 0, processed = 0;
      
      // Parámetros adaptativos (igual que asistencia)
      const BATCH = 5000; // lotes grandes para minimizar llamadas
      const CONCURRENCY = 1; // supabase tolera más concurrencia
      const LOG_EVERY_MS = 600; // reducir spam de logs
      const MAX_LOGS = 120; // mantener liviano el modal
      
      const pushLog = (prev: UploadProgress | null, msg: string): string[] => {
        if (!prev) return [msg];
        const next = [...prev.logs, msg];
        if (next.length > MAX_LOGS) next.splice(0, next.length - MAX_LOGS);
        return next;
      };
      
      setUploadProgress({
        current: 0,
        total: grades.length,
        phase: 'conectando',
        logs: ['🔄 Conectando a base de datos SQL...'],
        errors: 0,
        success: 0,
        startTime,
        elapsedTime: 0
      });

      // Breve respiro para render inicial
      await new Promise(resolve => setTimeout(resolve, 150));

      setUploadProgress(prev => prev && {
        ...prev,
        phase: 'procesando',
        logs: pushLog(prev, `⚡ Carga de calificaciones iniciada con lotes de ${BATCH} y concurrencia x${CONCURRENCY}`)
      });

      // Helpers de chunking y pool de concurrencia
      const chunks: GradeRecord[][] = [];
      for (let i = 0; i < grades.length; i += BATCH) chunks.push(grades.slice(i, i + BATCH));

      let nextChunkIdx = 0;
      const runOne = async (workerId: number) => {
        while (true) {
          const idx = nextChunkIdx++;
          if (idx >= chunks.length) return;
          const batch = chunks[idx];
          try {
            await sqlDatabase.insertGrades(batch, (progress) => {
              // Capturar progreso interno pero no actualizar UI aquí (demasiado frecuente)
            });
            success += batch.length;
          } catch (e: any) {
            console.error(`Worker ${workerId} error en lote ${idx}:`, e);
            errors += batch.length;
          } finally {
            processed += batch.length;
            const now = Date.now();
            // Throttle UI updates
            if (now - (lastUploadUpdateRef.current || 0) > LOG_EVERY_MS || processed === grades.length) {
              lastUploadUpdateRef.current = now;
              const loteMsg = `✔️ Lote ${idx + 1}/${chunks.length}: ${batch.length} regs (ok: ${success}, err: ${errors})`;
              setUploadProgress(prev => prev && ({
                ...prev,
                current: processed,
                success,
                errors,
                elapsedTime: now - startTime,
                logs: pushLog(prev, loteMsg)
              }));
              // Ceder un micro-respiro al event loop
              await new Promise(r => setTimeout(r, 0));
            }
          }
        }
      };

      // Ejecutar el pool de workers concurrentes
      const workers: Promise<void>[] = [];
      for (let w = 0; w < CONCURRENCY; w++) workers.push(runOne(w));
      await Promise.all(workers);

      setUploadProgress(prev => prev && ({
        ...prev,
        phase: 'completado',
        current: grades.length,
        elapsedTime: Date.now() - startTime,
        logs: pushLog(prev, `✅ Carga completada: ${success} ok, ${errors} errores`)
      }));

      // Actualizar contadores y conectar
      const currentYear = new Date().getFullYear();
      await updateCountersAfterUpload(currentYear);
      setIsConnected(true);

      // 💾 Asegurar que los contadores se persistan después de la carga
      try {
        const yearCount = await countGradesByYear(currentYear);
        const totalCount = await countAllGrades();
        console.log(`💾 Contadores actualizados después de carga: año ${currentYear}=${yearCount.count}, total=${totalCount.total}`);
      } catch (e) {
        console.warn('⚠️ Error actualizando contadores después de carga:', e);
      }

      // 💾 NUEVO: Guardar también en localStorage como respaldo local
      // Esto permite que la UI muestre datos incluso si Firebase falla después
      try {
        const { LocalStorageManager } = await import('@/lib/education-utils');
        // Obtener calificaciones existentes en localStorage para no perderlas
        const existingGrades = LocalStorageManager.getTestGradesForYear(currentYear) || [];
        
        // Mapear los nuevos grades al formato de localStorage (TestGrade)
        const newLocalGrades = grades.map((g: GradeRecord) => ({
          testId: g.testId,
          studentId: g.studentId,
          studentName: g.studentName,
          grade: g.score, // En localStorage se usa 'grade' en vez de 'score'
          score: g.score,
          courseId: g.courseId,
          sectionId: g.sectionId,
          subjectId: g.subjectId,
          title: g.title,
          gradedAt: g.gradedAt,
          year: g.year,
          type: g.type,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt
        }));
        
        // Combinar: las nuevas sobrescriben las existentes por testId+studentId
        const mergedGrades = [...existingGrades];
        for (const ng of newLocalGrades) {
          const existingIdx = mergedGrades.findIndex(
            (eg: any) => eg.testId === ng.testId && eg.studentId === ng.studentId
          );
          if (existingIdx >= 0) {
            mergedGrades[existingIdx] = ng;
          } else {
            mergedGrades.push(ng);
          }
        }
        
        LocalStorageManager.setTestGradesForYear(currentYear, mergedGrades);
        console.log(`💾 [SYNC] ${newLocalGrades.length} calificaciones guardadas en localStorage como respaldo`);
      } catch (lsErr) {
        console.warn('⚠️ No se pudo guardar en localStorage (respaldo local):', lsErr);
      }

      // Guardar snapshot enriquecido para precarga de Estadísticas
      try {
        const { grades: yearGrades } = await sqlDatabase.getGradesByYear(currentYear);
        let approvedCount = 0;
        let failedCount = 0;
        let sumPct = 0;
        let n = 0;
        const pass = getGradingConfig().passPercent ?? 60;
        for (const g of yearGrades as any[]) {
          const raw = typeof g.score === 'number' ? g.score : (typeof g.grade === 'number' ? g.grade : undefined);
          if (raw == null) continue;
          const pct = raw <= 1 ? raw * 100 : Number(raw);
          if (!Number.isFinite(pct)) continue;
          n++; sumPct += pct;
          if (pct >= pass) approvedCount++; else failedCount++;
        }
        const overallAvgPct = n > 0 ? (sumPct / n) : undefined;
        writeKPIsSnapshot(currentYear, {
          year: currentYear,
          lastUpdated: Date.now(),
          overallAvgPct,
          approvedCount,
          failedCount
        });
      } catch {}

      // Avisar al componente padre CON TIMESTAMP
      try {
        console.log(`🔔 [HOOK] Disparando evento sqlGradesUpdated con ${success} calificaciones`);
        window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
          detail: {
            year: currentYear,
            gradesAdded: success,
            totalGrades: success,
            timestamp: Date.now(),
            source: 'useGradesSQL'
          }
        }));
        console.log(`✅ [HOOK] Evento sqlGradesUpdated disparado correctamente`);
      } catch (e) {
        console.warn('⚠️ [HOOK] Error disparando evento:', e);
      }

      toast({
        title: translate('gradesSQLSaved'),
        description: `${success} ${translate('gradesSQLUploadedSuccess')}${errors > 0 ? `, ${errors} ${translate('gradesSQLWithErrors')}` : ''}`,
        variant: errors > 0 ? 'destructive' : 'default'
      });
      return true;
    } catch (e: any) {
      setUploadProgress(prev => prev && {
        ...prev,
        phase: 'error',
        logs: [...(prev?.logs || []), `❌ Error: ${e?.message || 'Error desconocido'}`],
        elapsedTime: Date.now() - startTime
      });
      
      toast({
        title: translate('gradesSQLUploadError'),
        description: e?.message || translate('gradesSQLUnknownError'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [isConnected, isUploading, checkConnection, updateCountersAfterUpload, toast, translate]);

  const getActivitiesByYear = useCallback(async (year: number) => {
    try {
      const res = await sqlDatabase.getActivitiesByYear(year);
      
      // El backend puede devolver directamente un array o un objeto con .activities
      let activities: any[];
      if (Array.isArray(res)) {
        activities = res;
      } else if (res && typeof res === 'object' && Array.isArray((res as any).activities)) {
        activities = (res as any).activities;
      } else {
        console.warn(`⚠️ getActivitiesByYear returned invalid format for year ${year}:`, res);
        return [];
      }
      
      return activities;
    } catch (e: any) {
      console.error('Error getting activities by year:', e);
      return [];
    }
  }, []);

  const uploadActivitiesToSQL = useCallback(async (activities: ActivityRecord[]) => {
    if (!activities || activities.length === 0) return true;
    try {
      if (!isConnected) await checkConnection();
      const batchSize = 200;
      for (let i = 0; i < activities.length; i += batchSize) {
        const batch = activities.slice(i, i + batchSize);
        await sqlDatabase.insertActivities(batch as any);
        await new Promise(r => setTimeout(r, 10));
      }
      try {
        console.log(`🔔 [HOOK] Disparando evento sqlActivitiesUpdated con ${activities.length} actividades`);
        window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { 
          detail: { 
            year: activities[0]?.year,
            activitiesAdded: activities.length,
            timestamp: Date.now(),
            source: 'useGradesSQL'
          } 
        }));
        console.log(`✅ [HOOK] Evento sqlActivitiesUpdated disparado correctamente`);
      } catch (e) {
        console.warn('⚠️ [HOOK] Error disparando evento de actividades:', e);
      }
      toast({ title: translate('gradesSQLActivitiesSaved'), description: `${activities.length} ${translate('gradesSQLActivitiesCount')}`, variant: 'default' });
      return true;
    } catch (e: any) {
      toast({ title: translate('gradesSQLActivitiesError'), description: e?.message || translate('gradesSQLActivitiesFailed'), variant: 'destructive' });
      return false;
    }
  }, [isConnected, checkConnection, toast, translate]);

  const deleteGradesByYear = useCallback(async (year: number) => {
    if (isDeleting) return false;
    setIsDeleting(true);
    try {
      if (!isConnected) await checkConnection();

      // Preparar progreso de borrado
      const startTime = Date.now();
      let total = 0;
      try {
        const c = await sqlDatabase.countGradesByYear(year);
        total = c.count || 0;
      } catch {}
      setDeleteProgress({
        current: 0,
        total,
        phase: 'conectando',
        logs: ['🔌 Conectando a base de datos SQL...', `🗑️ Preparando borrado del año ${year}`],
        errors: 0,
        success: 0,
        startTime,
        elapsedTime: 0
      });

      await new Promise(r => setTimeout(r, 300));
      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'procesando',
        logs: [...prev.logs, '🧹 Eliminando actividades asociadas (burbujas)...']
      }));

      // 1) Borrar actividades del año (si el backend lo soporta)
      try {
        if ((sqlDatabase as any).deleteActivitiesByYear) {
          let actDeleted = 0;
          await (sqlDatabase as any).deleteActivitiesByYear(year, (d: number) => {
            actDeleted = d;
            setDeleteProgress(prev => prev && ({
              ...prev,
              logs: prev.logs.length % 10 === 0 ? [...prev.logs, `… ${actDeleted} actividades eliminadas`] : prev.logs
            }));
          });
        }
        setDeleteProgress(prev => prev && ({
          ...prev,
          logs: [...prev.logs, '✅ Actividades eliminadas']
        }));
        try { window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { detail: { year, deleted: true } })); } catch {}
      } catch (e: any) {
        setDeleteProgress(prev => prev && ({
          ...prev,
          errors: prev.errors + 1,
          logs: [...prev.logs, `⚠️ No se pudieron eliminar actividades: ${e?.message || 'desconocido'}`]
        }));
      }

      // 2) Borrar calificaciones del año usando endpoint API (y fallback seguro)
      setDeleteProgress(prev => prev && ({
        ...prev,
        logs: [...prev.logs, '🧹 Eliminando calificaciones vía API...']
      }));

      console.log(`🗑️ [HOOK] Iniciando borrado para año ${year}...`);

      let res: any = null;
      let usedFallback = false;
      const usingFirebase = isFirebaseEnabled();

      // Si Firebase está habilitado, saltar endpoint Supabase y usar método directo
      if (!usingFirebase) {
        console.log(`🗑️ [HOOK] Intentando endpoint API para borrar año ${year}...`);
        // Intentar primero el endpoint API (si existe y no es Firebase)
        try {
          const response = await fetch('/api/admin/delete-grades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year }),
          });

          if (response.ok) {
            const apiResult = await response.json();
            console.log(`✅ [HOOK] Resultado del endpoint API:`, apiResult);
            res = {
              success: apiResult.success,
              deleted: apiResult.deleted,
              beforeCount: apiResult.beforeCount,
              afterCount: apiResult.afterCount
            };
          } else {
            // Endpoint existe pero falló - usar fallback
            console.warn(`⚠️ [HOOK] Endpoint API respondió con error, usando fallback directo...`);
            usedFallback = true;
          }
        } catch (apiError: any) {
          // Endpoint no existe o error de red - usar fallback silenciosamente
          console.log(`ℹ️ [HOOK] Endpoint API no disponible, usando método directo...`);
          usedFallback = true;
        }
      } else {
        console.log(`🔥 [HOOK] Firebase habilitado, usando método directo sin intentar endpoint Supabase...`);
        usedFallback = true;
      }

      // Si el endpoint API no funcionó o Firebase está habilitado, usar método directo
      if (!res || usedFallback) {
        try {
          console.log(`🔄 [HOOK] Usando método directo deleteGradesByYear...`);
          // Con progreso: actualizar barra al ritmo de eliminados
          res = await (sqlDatabase as any).deleteGradesByYear(year, (deletedCount: number) => {
            setDeleteProgress(prev => prev && ({
              ...prev,
              current: Math.min(prev.total || 0, deletedCount),
              success: deletedCount,
              phase: 'procesando',
              logs: (deletedCount % 200 === 0) ? [...prev.logs, `… ${deletedCount} registros eliminados`] : prev.logs,
            }));
          });
          
          if (usedFallback) {
            setDeleteProgress(prev => prev && ({
              ...prev,
              logs: [...prev.logs, 'ℹ️ Usando método directo de borrado']
            }));
          }
        } catch (fallbackError: any) {
          console.error('❌ [HOOK] Error en método directo:', fallbackError);
          throw new Error(`Error al eliminar calificaciones: ${fallbackError?.message || 'Error desconocido'}`);
        }
      }

      // Verificar resultado
      if (!res || res.success === false) {
        throw new Error('No se pudieron eliminar las calificaciones correctamente');
      }

      console.log(`✅ [HOOK] Resultado final de borrado:`, res);

      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'finalizando',
        current: res.deleted || 0,
        success: res.deleted || 0,
        logs: [...prev.logs, `📉 Borradas: ${res.deleted || 0} calificaciones`, `🔍 Verificación: ${(res as any).actuallyDeleted || res.deleted || 0} realmente eliminadas`],
        elapsedTime: Date.now() - startTime
      }));

      // Verificar si hubo discrepancia entre borrado reportado y real
      if ((res as any).remaining && (res as any).remaining > 0) {
        setDeleteProgress(prev => prev && ({
          ...prev,
          logs: [...prev.logs, `⚠️ ADVERTENCIA: ${(res as any).remaining} registros no se pudieron eliminar`]
        }));
      }

      // Actualizar contadores
      console.log(`🔄 [HOOK] Actualizando contadores después del borrado...`);
      const countAfterYear = await countGradesByYear(year);
      console.log(`📊 [HOOK] Conteo por año después del borrado:`, countAfterYear);
      
      const countAfterAll = await countAllGrades();
      console.log(`📊 [HOOK] Conteo total después del borrado:`, countAfterAll);

      // Eventos
      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
        detail: { year, gradesDeleted: res.deleted, totalGrades: countAfterAll.total || 0 }
      }));

      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'completado',
        current: res.deleted || 0,
        elapsedTime: Date.now() - startTime,
        logs: [...prev.logs, '✅ Borrado completado']
      }));

      toast({
        title: translate('gradesSQLDeleteCompleted'),
        description: `${res.deleted} ${translate('gradesSQLDeletedFromYear')} ${year}`,
        variant: 'default'
      });
      return true;
    } catch (e: any) {
      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'error',
        logs: [...(prev?.logs || []), `❌ Error en borrado: ${e?.message || 'desconocido'}`],
        elapsedTime: prev ? (Date.now() - prev.startTime) : 0
      }));
      toast({
        title: translate('gradesSQLDeleteError'),
        description: e?.message || translate('gradesSQLDeleteFailed'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isConnected, checkConnection, countGradesByYear, countAllGrades, toast, translate]);

  /**
   * deleteAllGrades - Elimina TODAS las calificaciones de Firebase sin filtro de año
   * Diseñado para eliminar ~107K+ registros usando el nuevo endpoint API
   */
  const deleteAllGrades = useCallback(async () => {
    if (isDeleting) return false;
    setIsDeleting(true);
    try {
      if (!isConnected) await checkConnection();

      // Cargar el contador real de Firebase antes de iniciar
      const startTime = Date.now();
      let total = totalGrades || 0; // Valor inicial por si falla la carga
      
      setDeleteProgress({
        current: 0,
        total: 0,
        phase: 'conectando',
        logs: ['🔌 Conectando a Firebase...', '📊 Obteniendo conteo total de registros...'],
        errors: 0,
        success: 0,
        startTime,
        elapsedTime: 0
      });

      try {
        console.log('📊 [HOOK] Cargando contador total de Firebase...');
        const counterResponse = await fetch('/api/firebase/grade-counters');
        if (counterResponse.ok) {
          const counterData = await counterResponse.json();
          if (counterData.ok && counterData.totalGrades > 0) {
            total = counterData.totalGrades;
            setTotalGrades(total); // Actualizar estado del hook
            console.log(`📊 [HOOK] Total de registros a eliminar: ${total.toLocaleString()}`);
          }
        }
      } catch (counterError) {
        console.warn('⚠️ [HOOK] No se pudo cargar el contador de Firebase, usando valor actual:', counterError);
        // Continuar con el valor por defecto
      }

      // Actualizar progreso con el total cargado
      setDeleteProgress({
        current: 0,
        total,
        phase: 'conectando',
        logs: ['🔌 Conectando a Firebase...', '🗑️ Preparando eliminación de TODOS los registros', `⚠️ Se eliminarán aproximadamente ${total.toLocaleString()} registros`],
        errors: 0,
        success: 0,
        startTime,
        elapsedTime: 0
      });

      await new Promise(r => setTimeout(r, 300));
      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'procesando',
        logs: [...prev.logs, '🔥 Eliminando TODAS las calificaciones de Firebase...']
      }));

      console.log('🗑️ [HOOK] Iniciando eliminación total de Firebase...');

      const usingFirebase = isFirebaseEnabled();
      if (!usingFirebase) {
        throw new Error('Firebase no está habilitado. Esta función solo funciona con Firebase.');
      }

      // Modo paginado para evitar timeouts con grandes volúmenes
      let totalDeleted = 0;
      let more = true;
      let cursor: string | null = null;
      let iteration = 0;

      while (more) {
        iteration++;
        console.log(`🗑️ [HOOK] Iteración ${iteration}, eliminados hasta ahora: ${totalDeleted}`);
        
        setDeleteProgress(prev => prev && ({
          ...prev,
          logs: [...prev.logs, `🔄 Lote ${iteration}: procesando...`]
        }));

        const url = new URL('/api/firebase/delete-all-grades', window.location.origin);
        url.searchParams.set('doit', '1');
        url.searchParams.set('paged', '1');
        url.searchParams.set('limit', '1000');
        if (cursor) {
          url.searchParams.set('cursor', cursor);
        }

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Leer el texto de la respuesta primero para mejor manejo de errores
        const responseText = await response.text();
        
        if (!response.ok) {
          let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
          try {
            if (responseText && responseText.trim()) {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (parseError) {
            console.warn('⚠️ [HOOK] No se pudo parsear respuesta de error:', responseText?.substring(0, 200));
          }
          throw new Error(errorMessage);
        }

        // Parsear la respuesta JSON solo si hay contenido
        let result = { deleted: 0, more: false, nextCursor: null };
        try {
          if (responseText && responseText.trim()) {
            result = JSON.parse(responseText);
          } else {
            console.warn('⚠️ [HOOK] Respuesta vacía del servidor, asumiendo que no hay más registros');
            more = false;
            break;
          }
        } catch (parseError) {
          console.error('❌ [HOOK] Error parseando respuesta JSON:', parseError, 'Texto:', responseText?.substring(0, 200));
          throw new Error('El servidor devolvió una respuesta inválida. Por favor, intente de nuevo.');
        }
        totalDeleted += result.deleted || 0;
        more = result.more || false;
        cursor = result.nextCursor || null;

        setDeleteProgress(prev => prev && ({
          ...prev,
          current: totalDeleted,
          total, // Usar el total cargado al inicio
          success: totalDeleted,
          logs: [...prev.logs, `✅ Lote ${iteration}: ${result.deleted || 0} registros eliminados (Total: ${totalDeleted})`],
          elapsedTime: Date.now() - startTime
        }));

        // Pequeño delay entre lotes para no saturar
        if (more) {
          await new Promise(r => setTimeout(r, 200));
        }
      }

      console.log(`✅ [HOOK] Eliminación total completada: ${totalDeleted} registros eliminados`);

      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'finalizando',
        current: totalDeleted,
        success: totalDeleted,
        logs: [...prev.logs, `🎉 Eliminación completada: ${totalDeleted.toLocaleString()} registros eliminados en ${iteration} lotes`],
        elapsedTime: Date.now() - startTime
      }));

      // Actualizar contadores
      setTotalGrades(0);
      setGradesCount(null);

      // 💾 Limpiar contadores en localStorage
      try {
        const currentYear = new Date().getFullYear();
        localStorage.setItem('grade-counter-total', '0');
        localStorage.setItem(`grade-counter-year-${currentYear}`, '0');
        console.log(`💾 Contadores limpiados en localStorage después de eliminación total`);
      } catch (e) {
        console.warn('⚠️ Error limpiando contadores en localStorage:', e);
      }

      // Disparar evento de actualización
      try {
        window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
          detail: { 
            year: null, 
            totalDeleted,
            gradesCleared: true,
            totalGrades: 0
          }
        }));
      } catch {}

      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'completado',
        current: totalDeleted,
        elapsedTime: Date.now() - startTime,
        logs: [...prev.logs, '✅ Proceso completado exitosamente']
      }));

      toast({
        title: translate('gradesSQLTotalDeleteCompleted'),
        description: `${totalDeleted.toLocaleString()} ${translate('gradesSQLRecordsDeleted')}`,
        variant: 'default'
      });
      return true;
    } catch (e: any) {
      console.error('❌ [HOOK] Error en eliminación total:', e);
      setDeleteProgress(prev => prev && ({
        ...prev,
        phase: 'error',
        errors: (prev?.errors || 0) + 1,
        logs: [...(prev?.logs || []), `❌ Error: ${e?.message || 'Error desconocido'}`],
        elapsedTime: prev ? (Date.now() - prev.startTime) : 0
      }));
      toast({
        title: translate('gradesSQLTotalDeleteError'),
        description: e?.message || translate('gradesSQLTotalDeleteFailed'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isConnected, checkConnection, totalGrades, toast, translate]);

  const clearAllSQLData = useCallback(async () => {
    try {
      const res = await sqlDatabase.clearAllData();
      // Intentar limpiar actividades explícitamente si el backend lo soporta
      try { if ((sqlDatabase as any).clearAllActivities) await (sqlDatabase as any).clearAllActivities(); } catch (e) { console.warn('No se pudieron limpiar actividades SQL:', e); }
      setGradesCount(null);
      setTotalGrades(0);
      
      // Disparar evento para notificar a otras pestañas
      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {
        detail: { 
          year: null, 
          gradesCleared: true,
          totalGrades: 0
        }
      }));
      
      // Manejar tanto logs como error para compatibilidad con ambos backends
      const description = res.logs?.join('\n') || res.error || 'Operación completada';
      toast({
        title: res.success ? translate('gradesSQLReset') : translate('gradesSQLResetError'),
        description,
        variant: res.success ? 'default' : 'destructive'
      });
      return res.success;
    } catch (e: any) {
      toast({
        title: translate('gradesSQLResetError'),
        description: e?.message || translate('gradesSQLResetFailed'),
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, translate]);

  const getStorageInfo = useCallback(() => {
    // En IndexedDB no tenemos tamaño exacto; devolvemos contadores disponibles
    return {
      sqlSize: 'N/D',
      totalRecords: totalGrades,
      storageUsage: 'N/D'
    };
  }, [totalGrades]);

  return {
    isConnected,
    uploadProgress,
    isUploading,
    deleteProgress,
    isDeleting,
    gradesCount,
    totalGrades,
    uploadGradesToSQL,
    uploadActivitiesToSQL,
    deleteGradesByYear,
    deleteAllGrades,
    clearAllSQLData,
    resetProgress,
    resetDeleteProgress,
    checkConnection,
    countGradesByYear,
    countAllGrades,
    updateCountersAfterUpload,
    getGradesByYear,
    getGradesByCourseAndSection, // 🔥 NUEVA función optimizada
    getActivitiesByYear,
    getStorageInfo
  };
}