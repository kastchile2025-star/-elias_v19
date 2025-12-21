"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { isSupabaseEnabled, setForceIDB, isFirebaseEnabled } from '@/lib/sql-config';
import { sqlDB } from '@/lib/idb-sql';
import { firestoreDB } from '@/lib/firestore-database';
import { writeKPIsSnapshot } from '@/lib/kpis-snapshot';
import { writeStatsSnapshot, mergeMonthly, mergeSections } from '@/lib/stats-snapshot';
import { onSQLStatusChange, isSQLConnected, initializeSQL } from '@/lib/sql-init';

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

export interface AttendanceRecord {
  id: string;
  date: string; // ISO
  courseId: string | null;
  sectionId: string | null;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  present?: boolean;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  year: number;
}

const backend = () => (isFirebaseEnabled() ? (firestoreDB as any) : (sqlDB as any));
const attendanceAPI = {
  testConnection: () => backend().testConnection(),
  insertAttendance: (rows: AttendanceRecord[]) => (backend() as any).insertAttendance(rows),
  deleteAttendanceByYear: (year: number, onProgress?: (d: number) => void) => (backend() as any).deleteAttendanceByYear(year, onProgress),
  deleteAttendanceByDateCourseSection: (year: number, ymd: string, courseId: string | null, sectionId: string | null) => (backend() as any).deleteAttendanceByDateCourseSection(year, ymd, courseId, sectionId),
  deleteAttendanceById: (id: string) => (backend() as any).deleteAttendanceById(id),
  countAttendanceByYear: (year: number) => (backend() as any).countAttendanceByYear(year),
  countAllAttendance: () => (backend() as any).countAllAttendance(),
  getAttendanceByYear: (year: number) => (backend() as any).getAttendanceByYear(year),
  clearAllAttendance: () => (backend() as any).clearAllAttendance?.()
};

export function useAttendanceSQL() {
  const { toast } = useToast();
  const { translate } = useLanguage();
  // 🔧 Inicializar como conectado si Firebase está habilitado, o verificar IDB-SQL
  const [isConnected, setIsConnected] = useState(() => isFirebaseEnabled() || isSQLConnected());
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<UploadProgress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState<{ year: number; count: number } | null>(null);
  const [totalAttendance, setTotalAttendance] = useState<number>(0);
  // Throttle para evitar re-renders excesivos durante cargas masivas
  const lastUploadUpdateRef = useRef<number>(0);

  // Suscribirse a cambios de estado SQL global
  useEffect(() => {
    // 📖 PRIMERO: Cargar desde localStorage al inicializar (instantáneo)
    try {
      const currentYear = new Date().getFullYear();
      const cachedTotal = localStorage.getItem('attendance-counter-total');
      if (cachedTotal) {
        const total = Number(cachedTotal) || 0;
        setTotalAttendance(total);
        console.log(`📖 [INIT] Contador total asistencia recuperado desde localStorage: ${total}`);
      }
      
      const cachedYear = localStorage.getItem(`attendance-counter-year-${currentYear}`);
      if (cachedYear) {
        const count = Number(cachedYear) || 0;
        setAttendanceCount({ year: currentYear, count });
        console.log(`📖 [INIT] Contador asistencia año ${currentYear} recuperado desde localStorage: ${count}`);
      }
    } catch (e) {
      console.warn('⚠️ [INIT] Error recuperando contadores asistencia desde localStorage:', e);
    }
    
    const unsubscribe = onSQLStatusChange((status) => {
      const connected = status === 'connected';
      setIsConnected(connected);
      
      if (connected) {
        // Cargar contadores cuando se conecta (actualizar desde BD)
        const loadCounters = async () => {
          try {
            const { total } = await attendanceAPI.countAllAttendance();
            setTotalAttendance(total || 0);
            
            const currentYear = new Date().getFullYear();
            const { count, year } = await attendanceAPI.countAttendanceByYear(currentYear);
            setAttendanceCount({ year, count });
          } catch (e) {
            console.warn('Error loading attendance SQL counters:', e);
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
      const r = await attendanceAPI.testConnection();
      if (!r?.success) {
        setForceIDB(true);
      } else {
        setForceIDB(false);
      }
      setIsConnected(Boolean(r?.success));
      return Boolean(r?.success);
    } catch {
      setIsConnected(false);
      // Re-trigger global initialization on failure
      initializeSQL(true);
      return false;
    }
  }, []);

  const countByYear = useCallback(async (year: number) => {
    try {
      const r = await attendanceAPI.countAttendanceByYear(year);
      setAttendanceCount({ year: r.year, count: r.count });
      
      // 💾 PERSISTIR en localStorage para mantener entre cambios de pestaña
      try {
        localStorage.setItem(`attendance-counter-year-${year}`, String(r.count));
        console.log(`💾 Contador asistencia año ${year} guardado en localStorage: ${r.count}`);
      } catch (storageError) {
        console.warn('⚠️ No se pudo guardar contador asistencia año en localStorage:', storageError);
      }
      
      return r;
    } catch (e: any) {
      console.error('Error counting attendance by year:', e);
      
      // 📖 Intentar recuperar desde localStorage si falla la consulta
      try {
        const cached = localStorage.getItem(`attendance-counter-year-${year}`);
        if (cached) {
          const count = Number(cached) || 0;
          console.log(`📖 Recuperado contador asistencia año ${year} desde localStorage: ${count}`);
          setAttendanceCount({ year, count });
          return { count, year };
        }
      } catch {}
      
      return { year, count: 0 };
    }
  }, []);

  const countAll = useCallback(async () => {
    try {
      const r = await attendanceAPI.countAllAttendance();
      setTotalAttendance(r.total || 0);
      
      // 💾 PERSISTIR en localStorage para mantener entre cambios de pestaña
      try {
        localStorage.setItem('attendance-counter-total', String(r.total || 0));
        console.log(`💾 Contador total asistencia guardado en localStorage: ${r.total || 0}`);
      } catch (storageError) {
        console.warn('⚠️ No se pudo guardar contador total asistencia en localStorage:', storageError);
      }
      
      return r;
    } catch (e: any) {
      console.error('Error counting all attendance:', e);
      
      // 📖 Intentar recuperar desde localStorage si falla la consulta
      try {
        const cached = localStorage.getItem('attendance-counter-total');
        if (cached) {
          const total = Number(cached) || 0;
          console.log(`📖 Recuperado contador total asistencia desde localStorage: ${total}`);
          setTotalAttendance(total);
          return { total };
        }
      } catch {}
      
      return { total: 0 };
    }
  }, []);

  const resetProgress = useCallback(() => setUploadProgress(null), []);
  const resetDeleteProgress = useCallback(() => setDeleteProgress(null), []);

  const uploadAttendanceToSQL = useCallback(async (rows: AttendanceRecord[]) => {
    // Versión ultra-rápida: lotes grandes adaptativos, concurrencia controlada y throttling de UI
    if (!rows || rows.length === 0) return true;
    if (isUploading) return false;
    setIsUploading(true);
    try {
      if (!isConnected) await checkConnection();

      const startTime = Date.now();
      let success = 0, errors = 0, processed = 0;

      // Parámetros adaptativos
      const BATCH = 5000; // grandes para minimizar llamadas
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
        total: rows.length,
        phase: 'conectando',
        logs: ['🔌 Conectando a base de datos SQL...'],
        errors: 0,
        success: 0,
        startTime,
        elapsedTime: 0
      });

      // Breve respiro para render inicial
      await new Promise(r => setTimeout(r, 150));

      setUploadProgress(prev => prev && ({
        ...prev,
        phase: 'procesando',
        logs: pushLog(prev, `� Carga de asistencia iniciada con lotes de ${BATCH} y concurrencia x${CONCURRENCY}`)
      }));

      // Helpers de chunking y pool de concurrencia
      const chunks: AttendanceRecord[][] = [];
      for (let i = 0; i < rows.length; i += BATCH) chunks.push(rows.slice(i, i + BATCH));

      let nextChunkIdx = 0;
      const runOne = async (workerId: number) => {
        while (true) {
          const idx = nextChunkIdx++;
          if (idx >= chunks.length) return;
          const batch = chunks[idx];
          try {
            await attendanceAPI.insertAttendance(batch);
            success += batch.length;
          } catch (e: any) {
            errors += batch.length;
          } finally {
            processed += batch.length;
            const now = Date.now();
            // Throttle UI updates
            if (now - (lastUploadUpdateRef.current || 0) > LOG_EVERY_MS || processed === rows.length) {
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

      // Ejecutar el pool
      const workers: Promise<void>[] = [];
      for (let w = 0; w < CONCURRENCY; w++) workers.push(runOne(w));
      await Promise.all(workers);

      setUploadProgress(prev => prev && ({
        ...prev,
        phase: 'completado',
        current: rows.length,
        elapsedTime: Date.now() - startTime,
        logs: pushLog(prev, `✅ Carga completada: ${success} ok, ${errors} errores`)
      }));

      // Actualizar contadores (año inferido del primer registro)
      const y = rows[0]?.year ? Number(rows[0].year) : new Date().getFullYear();
      await Promise.all([countByYear(y), countAll()]);

      // Escribir snapshot rápido para Estadísticas: KPI + agregados mínimos para gráficos
      try {
        const yearRows = rows.filter(r => Number(r.year) === Number(y));
        const totalYear = yearRows.length || rows.length;
        const presentYear = yearRows.reduce((acc, r) => acc + ((r.present === true || r.status === 'present') ? 1 : 0), 0);
        const attendancePct = totalYear > 0 ? (presentYear / totalYear) * 100 : undefined;
        writeKPIsSnapshot(y, { year: y, lastUpdated: Date.now(), attendancePct });

        // Agregados mensuales y por sección para precargar gráficos
        const monthly: Record<string, { present: number; total: number }> = {};
        const sections: Array<{ courseId: string | null; sectionId: string | null; present: number; total: number }> = [];
        const secMap = new Map<string, { courseId: string | null; sectionId: string | null; present: number; total: number }>();
        for (const r of yearRows) {
          const ts = (() => {
            const v = (r as any).timestamp || r.date || (r as any).when;
            if (!v) return 0;
            if (typeof v === 'number') return v;
            if (typeof v === 'string') {
              if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T00:00:00').getTime();
              if (/^\d{2}-\d{2}-\d{4}$/.test(v)) { const [dd,mm,yyyy] = v.split('-').map(Number); return new Date(yyyy,(mm||1)-1,dd||1).getTime(); }
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) { const [dd,mm,yyyy] = v.split('/').map(Number); return new Date(yyyy,(mm||1)-1,dd||1).getTime(); }
              const t = Date.parse(v); return Number.isNaN(t) ? 0 : t;
            }
            return 0;
          })();
          if (!ts) continue;
          const d = new Date(ts);
          const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
          const isPresent = (r.present === true || r.status === 'present');
          const m = monthly[ym] || { present: 0, total: 0 };
          monthly[ym] = { present: m.present + (isPresent ? 1 : 0), total: m.total + 1 };

          const key = `${r.courseId || ''}:${r.sectionId || ''}`;
          const prev = secMap.get(key) || { courseId: r.courseId || null, sectionId: r.sectionId || null, present: 0, total: 0 };
          prev.present += isPresent ? 1 : 0;
          prev.total += 1;
          secMap.set(key, prev);
        }
        sections.push(...Array.from(secMap.values()));
        // Guardar fusionando con snapshot previo (por si hay cargas parciales)
        writeStatsSnapshot(y, {
          year: y,
          attendanceMonthly: monthly,
          sectionAgg: sections,
          lastUpdated: Date.now()
        });
      } catch {}

      // OPTIMIZADO: Disparar rebuild de estadísticas en background
      // Esto recalcula los KPIs y los guarda en stats_cache para cargas rápidas
      try {
        console.log(`🔄 [AttendanceSQL] Disparando rebuild de estadísticas para año ${y}...`);
        const rebuildResponse = await fetch('/api/stats/rebuild', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ year: y, what: ['attendance', 'grades'] })
        });
        
        if (rebuildResponse.ok) {
          const rebuildResult = await rebuildResponse.json();
          console.log(`✅ [AttendanceSQL] Stats rebuild completado en ${rebuildResult.duration}ms`);
          // Emitir evento para que la UI de estadísticas se actualice
          window.dispatchEvent(new CustomEvent('statsRebuildCompleted', { 
            detail: { year: y, ...rebuildResult } 
          }));
        } else {
          console.warn('⚠️ [AttendanceSQL] Stats rebuild falló, se usará caché anterior');
        }
      } catch (rebuildError) {
        console.warn('⚠️ [AttendanceSQL] Error en stats rebuild (no crítico):', rebuildError);
      }

      try {
        window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { year: y, added: success, total: success } }));
      } catch {}

      toast({ title: translate('attendanceSQLCompleted'), description: `${success} ${translate('attendanceSQLUploadedCount')}`, variant: 'default' });
      return true;
    } catch (e: any) {
      setUploadProgress(prev => prev && ({
        ...prev,
        phase: 'error',
        logs: [...(prev?.logs || []), `❌ ${e?.message || 'Error en carga'}`],
        elapsedTime: prev ? (Date.now() - prev.startTime) : 0
      }));
      toast({ title: translate('attendanceSQLUploadError'), description: e?.message || translate('attendanceSQLCheckConnection'), variant: 'destructive' });
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, isConnected, checkConnection, countByYear, countAll, toast, translate]);

  const deleteAttendanceByYear = useCallback(async (year: number) => {
    if (isDeleting) return false;
    setIsDeleting(true);
    try {
      if (!isConnected) await checkConnection();
      const startTime = Date.now();
      let total = 0;
      try { 
        const countResult = await attendanceAPI.countAttendanceByYear(year);
        // Firebase retorna número directo, SQL/IDB retorna { count: number }
        total = typeof countResult === 'number' ? countResult : (countResult?.count || 0);
      } catch {}
      setDeleteProgress({ current: 0, total, phase: 'conectando', logs: ['🔌 Conectando...', `🗑️ Eliminando asistencia ${year}`, `📊 Total a eliminar: ${total}`], errors: 0, success: 0, startTime, elapsedTime: 0 });
      await new Promise(r => setTimeout(r, 200));
      setDeleteProgress(prev => prev && ({ ...prev, phase: 'procesando' }));
      let currentDeleted = 0;
      const res = await (attendanceAPI as any).deleteAttendanceByYear(year, (d: number) => {
        currentDeleted = d;
        setDeleteProgress(prev => prev && ({ ...prev, current: d, success: d, elapsedTime: Date.now() - startTime }));
      });
      setDeleteProgress(prev => prev && ({ ...prev, phase: 'finalizando', current: total || res.deleted || currentDeleted || 0, success: res.deleted || currentDeleted || 0, elapsedTime: Date.now() - startTime }));
      await countByYear(year);
      await countAll();
      try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { year, deleted: res.deleted } })); } catch {}
      const remaining = (res as any)?.remaining ?? 0;
      const msg = remaining > 0
        ? `Eliminados ${res.deleted}. Aún quedan ${remaining} registros (revisar RLS/filtros).`
        : `${res.deleted} registros`;
      setDeleteProgress(prev => prev && ({ ...prev, phase: 'completado', logs: [...(prev?.logs||[]), remaining > 0 ? `⚠️ Quedan ${remaining} registros` : '✅ Borrado completado'] }));
      toast({ title: remaining > 0 ? translate('attendanceSQLPartialDelete') : translate('attendanceSQLDeleted'), description: msg, variant: remaining > 0 ? 'destructive' : 'default' });
      return true;
    } catch (e: any) {
      setDeleteProgress(prev => prev && ({ ...prev, phase: 'error', logs: [...(prev?.logs||[]), `❌ ${e?.message||'Error'}`] }));
      toast({ title: translate('attendanceSQLDeleteError'), description: e?.message || translate('attendanceSQLDeleteFailed'), variant: 'destructive' });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isConnected, checkConnection, countByYear, countAll, toast, translate]);

  const getAttendanceByYear = useCallback(async (year: number) => {
    try {
      const r = await attendanceAPI.getAttendanceByYear(year);
      // Firebase devuelve array directo, SQL/IDB devuelve { attendance: [] }
      if (Array.isArray(r)) {
        return r as AttendanceRecord[];
      }
      return (r?.attendance || []) as AttendanceRecord[];
    } catch {
      return [] as AttendanceRecord[];
    }
  }, []);

  const deleteAttendanceByDateCourseSection = useCallback(async (year: number, ymd: string, courseId: string | null, sectionId: string | null) => {
    try {
      if (!isConnected) await checkConnection();
      const res = await (attendanceAPI as any).deleteAttendanceByDateCourseSection(year, ymd, courseId, sectionId);
      await countByYear(year);
      await countAll();
      try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { year, deleted: res.deleted, date: ymd, courseId, sectionId } })); } catch {}
      return res;
    } catch (e: any) {
      toast({ title: translate('attendanceSQLClearDayError'), description: e?.message || translate('attendanceSQLClearDayFailed'), variant: 'destructive' });
      return { success: false, deleted: 0 };
    }
  }, [isConnected, checkConnection, countByYear, countAll, toast, translate]);

  const deleteAttendanceById = useCallback(async (id: string, year: number) => {
    try {
      if (!isConnected) await checkConnection();
      const res = await (attendanceAPI as any).deleteAttendanceById(id);
      await countByYear(year);
      await countAll();
      try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { year, deleted: res.deleted, id } })); } catch {}
      return res;
    } catch (e: any) {
      console.error('Error deleting attendance by ID:', e);
      return { success: false, deleted: 0 };
    }
  }, [isConnected, checkConnection, countByYear, countAll]);

  const upsertAttendance = useCallback(async (rows: AttendanceRecord[]) => {
    if (!rows || rows.length === 0) return { success: true };
    try {
      if (!isConnected) await checkConnection();
      await attendanceAPI.insertAttendance(rows);
      // Actualizar contadores por el año del primer registro
      const y = rows[0]?.year ? Number(rows[0].year) : new Date().getFullYear();
      await countByYear(y);
      await countAll();
      try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { year: y, upserted: rows.length } })); } catch {}
      return { success: true };
    } catch (e: any) {
      toast({ title: translate('attendanceSQLSaveError'), description: e?.message || translate('attendanceSQLSaveFailed'), variant: 'destructive' });
      return { success: false };
    }
  }, [isConnected, checkConnection, countByYear, countAll, toast, translate]);

  const getStorageInfo = useCallback(() => ({ sqlSize: 'N/D', totalRecords: totalAttendance, storageUsage: 'N/D' }), [totalAttendance]);

  const clearAllAttendance = useCallback(async () => {
    try {
      if (!isConnected) await checkConnection();
      if (!attendanceAPI.clearAllAttendance) return true; // backend IndexedDB ya se limpia con clearAllData de grades
      const res = await attendanceAPI.clearAllAttendance();
      await countAll();
      setAttendanceCount(null);
      try { window.dispatchEvent(new CustomEvent('sqlAttendanceUpdated', { detail: { clearedAll: true } })); } catch {}
      toast({ title: translate('attendanceSQLReset'), description: (res?.logs || []).join('\n') || translate('attendanceSQLResetClean'), variant: 'default' });
      return true;
    } catch (e: any) {
      toast({ title: translate('attendanceSQLResetError'), description: e?.message || translate('attendanceSQLResetFailed'), variant: 'destructive' });
      return false;
    }
  }, [isConnected, checkConnection, countAll, toast, translate]);

  // NUEVO: obtener stats precomputados del servidor (rápido)
  const getPrecomputedStats = useCallback(async (year: number) => {
    try {
      const response = await fetch(`/api/stats/summary?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (e) {
      console.warn('Failed to fetch precomputed stats:', e);
      return null;
    }
  }, []);

  return {
    // estado
    isConnected,
    uploadProgress,
    isUploading,
    deleteProgress,
    isDeleting,
    attendanceCount,
    totalAttendance,
    // acciones
    uploadAttendanceToSQL,
    deleteAttendanceByYear,
    // utilidades
    resetProgress,
    resetDeleteProgress,
    checkConnection,
    countAttendanceByYear: countByYear,
    countAllAttendance: countAll,
    getAttendanceByYear,
    deleteAttendanceByDateCourseSection,
    deleteAttendanceById,
    upsertAttendance,
    getStorageInfo,
    clearAllAttendance,
    getPrecomputedStats,
  };
}

export default useAttendanceSQL;
