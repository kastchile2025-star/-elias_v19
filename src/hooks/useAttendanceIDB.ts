/**
 * Hook para gestionar asistencia con IndexedDB como almacenamiento principal
 * Proporciona migración automática desde localStorage y fallback transparente
 */

import { useState, useEffect, useCallback } from 'react';
import { attendanceIDB, AttendanceRecord } from '@/lib/attendance-idb';
import { LocalStorageManager } from '@/lib/education-utils';

interface UseAttendanceIDBResult {
  // Estados
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Datos
  attendance: AttendanceRecord[];
  attendanceStats: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  } | null;
  monthlyData: Map<string, { present: number; absent: number; late: number; total: number }> | null;
  
  // Acciones
  refreshData: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<{ success: boolean; migrated: number; logs: string[] }>;
  saveAttendance: (records: AttendanceRecord[]) => Promise<{ success: boolean; inserted: number }>;
  clearData: () => Promise<void>;
}

export function useAttendanceIDB(year?: number): UseAttendanceIDBResult {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<UseAttendanceIDBResult['attendanceStats']>(null);
  const [monthlyData, setMonthlyData] = useState<UseAttendanceIDBResult['monthlyData']>(null);
  
  const targetYear = year || new Date().getFullYear();
  
  // Verificar si IndexedDB está disponible
  useEffect(() => {
    const checkIDB = async () => {
      try {
        const { success } = await attendanceIDB.testConnection();
        setIsReady(success);
        if (!success) {
          setError('IndexedDB no está disponible en este navegador');
        }
      } catch (e) {
        setIsReady(false);
        setError(e instanceof Error ? e.message : 'Error desconocido');
      }
    };
    checkIDB();
  }, []);
  
  // Cargar datos cuando esté listo
  const loadData = useCallback(async () => {
    if (!isReady) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Verificar si hay datos en IndexedDB
      const { count } = await attendanceIDB.countAttendanceByYear(targetYear);
      
      // 2. Si no hay datos, intentar migrar desde localStorage
      if (count === 0) {
        console.log(`[useAttendanceIDB] No hay datos en IndexedDB para ${targetYear}, migrando desde localStorage...`);
        
        const localData = LocalStorageManager.getAttendanceForYear?.(targetYear) || [];
        
        if (Array.isArray(localData) && localData.length > 0) {
          // Transformar y guardar
          const records: AttendanceRecord[] = localData.map((r: any) => ({
            id: r.id || `att-${r.studentId}-${r.sectionId}-${String(r.date).slice(0, 10)}`,
            date: r.date,
            courseId: r.courseId || '',
            sectionId: r.sectionId || '',
            studentId: r.studentId || '',
            status: r.status || 'present',
            comment: r.comment,
            year: targetYear,
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: r.updatedAt || new Date().toISOString(),
          }));
          
          await attendanceIDB.bulkInsertAttendance(records);
          console.log(`[useAttendanceIDB] Migrados ${records.length} registros a IndexedDB`);
        }
      }
      
      // 3. Cargar datos desde IndexedDB
      const { attendance: data } = await attendanceIDB.getAttendanceByYear(targetYear);
      setAttendance(data);
      
      // 4. Calcular estadísticas
      const stats = await attendanceIDB.getAttendanceStats(targetYear);
      setAttendanceStats(stats);
      
      // 5. Cargar datos mensuales
      const monthly = await attendanceIDB.getMonthlyAttendance(targetYear);
      setMonthlyData(monthly);
      
    } catch (e) {
      console.error('[useAttendanceIDB] Error cargando datos:', e);
      setError(e instanceof Error ? e.message : 'Error cargando datos');
      
      // Fallback a localStorage
      try {
        const localData = LocalStorageManager.getAttendanceForYear?.(targetYear) || [];
        if (Array.isArray(localData)) {
          setAttendance(localData as any);
          
          // Calcular stats manualmente
          const presentCount = localData.filter((r: any) => r.status === 'present').length;
          const absentCount = localData.filter((r: any) => r.status === 'absent').length;
          const lateCount = localData.filter((r: any) => r.status === 'late').length;
          const total = localData.length;
          
          setAttendanceStats({
            totalRecords: total,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: total > 0 ? Math.round(((presentCount + lateCount) / total) * 1000) / 10 : 0,
          });
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [isReady, targetYear]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);
  
  // Función para migrar manualmente desde localStorage
  const migrateFromLocalStorage = useCallback(async () => {
    if (!isReady) {
      return { success: false, migrated: 0, logs: ['IndexedDB no está disponible'] };
    }
    
    try {
      const result = await attendanceIDB.migrateFromLocalStorage(targetYear, LocalStorageManager);
      if (result.success && result.migrated > 0) {
        await loadData(); // Recargar datos después de migrar
      }
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, migrated: 0, logs: [`Error: ${msg}`] };
    }
  }, [isReady, targetYear, loadData]);
  
  // Función para guardar nuevos registros
  const saveAttendance = useCallback(async (records: AttendanceRecord[]) => {
    if (!isReady) {
      return { success: false, inserted: 0 };
    }
    
    try {
      const result = await attendanceIDB.bulkInsertAttendance(records);
      await loadData(); // Recargar datos después de guardar
      return { success: result.success, inserted: result.inserted };
    } catch (e) {
      console.error('[useAttendanceIDB] Error guardando:', e);
      return { success: false, inserted: 0 };
    }
  }, [isReady, loadData]);
  
  // Función para limpiar datos
  const clearData = useCallback(async () => {
    if (!isReady) return;
    
    try {
      await attendanceIDB.deleteAttendanceByYear(targetYear);
      setAttendance([]);
      setAttendanceStats(null);
      setMonthlyData(null);
    } catch (e) {
      console.error('[useAttendanceIDB] Error limpiando:', e);
    }
  }, [isReady, targetYear]);
  
  return {
    isReady,
    isLoading,
    error,
    attendance,
    attendanceStats,
    monthlyData,
    refreshData,
    migrateFromLocalStorage,
    saveAttendance,
    clearData,
  };
}

export default useAttendanceIDB;
