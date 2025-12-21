"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  GraduationCap,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGradesSQL } from '@/hooks/useGradesSQL';
import { useAttendanceSQL } from '@/hooks/useAttendanceSQL';
import GradesImportProgress from '@/components/admin/GradesImportProgress';
import GradesDeleteProgress from '@/components/admin/GradesDeleteProgress';
import { LocalStorageManager, EducationCodeGenerator } from '@/lib/education-utils';
import { getCurrentProvider } from '@/lib/sql-config';
import { toPercentFromConfigured } from '@/lib/grading';
import { getSubjectColor } from '@/lib/subjects-colors';
import { cleanRut } from '@/lib/rut';

export default function BulkUploads() {
  const { toast } = useToast();
  const { translate } = useLanguage();

  // Estados básicos
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const saved = Number(localStorage.getItem('admin-selected-year') || '');
    return Number.isFinite(saved) && saved > 0 ? saved : new Date().getFullYear();
  });

  const [availableYears, setAvailableYears] = useState<number[]>(() => 
    LocalStorageManager.listYears()
  );

  const [gradesProgress, setGradesProgress] = useState<{ current: number; total: number; created: number; errors: number; phase: string; logs: string[]; startTime: number }>({
    current: 0,
    total: 0,
    created: 0,
    errors: 0,
    phase: 'Esperando archivo',
    logs: [],
    startTime: 0,
  });

  const [attendanceProgress, setAttendanceProgress] = useState<{
    current: number;
    total: number;
    phase: string;
    logs: string[];
    errors: number;
    success: number;
    startTime: number;
    elapsedTime: number;
  }>({
    current: 0,
    total: 0,
    phase: 'Esperando archivo',
    logs: [],
    errors: 0,
    success: 0,
    startTime: 0,
    elapsedTime: 0,
  });

  // Persistir año seleccionado en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('admin-selected-year', String(selectedYear));
    } catch (e) {
      console.warn('No se pudo guardar el año seleccionado:', e);
    }
    setAvailableYears(LocalStorageManager.listYears());
  }, [selectedYear]);

  // SQL Hooks
  const {
    isConnected: isSQLConnected,
    uploadProgress: sqlProgress,
    isUploading: isSQLUploading,
    deleteProgress: sqlDeleteProgress,
    gradesCount,
    totalGrades,
    uploadGradesToSQL,
    uploadActivitiesToSQL,
    deleteGradesByYear: deleteSQLByYear,
    deleteAllGrades: deleteAllSQLGrades,
    clearAllSQLData,
    resetProgress,
    resetDeleteProgress,
    countGradesByYear,
    countAllGrades,
    checkConnection,
  } = useGradesSQL();

  const {
    isConnected: isAttendanceSQLConnected,
    uploadProgress: attSQLProgress,
    isUploading: isAttSQLUploading,
    deleteProgress: attDeleteProgress,
    attendanceCount: attYearCount,
    totalAttendance: attTotal,
    uploadAttendanceToSQL,
    deleteAttendanceByYear: deleteAttendanceSQLByYear,
    resetProgress: resetAttProgress,
    resetDeleteProgress: resetAttDeleteProgress,
    countAttendanceByYear,
    countAllAttendance,
  } = useAttendanceSQL();

  // Estados locales
  const [dbProvider, setDbProvider] = useState<string>('');
  const isFirebaseMode = dbProvider === 'firebase';
  const isIDBMode = dbProvider === 'idb';
  
  // Inicializar contadores desde localStorage con el año seleccionado guardado
  const [firebaseYearCountOverride, setFirebaseYearCountOverride] = useState<number | null>(() => {
    try {
      const savedYear = Number(localStorage.getItem('admin-selected-year') || '');
      const year = Number.isFinite(savedYear) && savedYear > 0 ? savedYear : new Date().getFullYear();
      const saved = localStorage.getItem(`grade-counter-year-${year}`);
      const count = saved ? Number(saved) : null;
      return (count !== null && Number.isFinite(count)) ? count : null;
    } catch {
      return null;
    }
  });
  
  const [firebaseTotalOverride, setFirebaseTotalOverride] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('grade-counter-total');
      const total = saved ? Number(saved) : null;
      return (total !== null && Number.isFinite(total)) ? total : null;
    } catch {
      return null;
    }
  });
  
  const [attendanceYearCountOverride, setAttendanceYearCountOverride] = useState<number | null>(() => {
    try {
      const savedYear = Number(localStorage.getItem('admin-selected-year') || '');
      const year = Number.isFinite(savedYear) && savedYear > 0 ? savedYear : new Date().getFullYear();
      const saved = localStorage.getItem(`attendance-counter-year-${year}`);
      const count = saved ? Number(saved) : null;
      const validCount = (count !== null && Number.isFinite(count)) ? count : null;
      console.log(`🔄 [INIT] Cargando contador asistencia año ${year} desde localStorage:`, validCount);
      return validCount;
    } catch {
      return null;
    }
  });
  
  const [attendanceTotalOverride, setAttendanceTotalOverride] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('attendance-counter-total');
      const total = saved ? Number(saved) : null;
      const validTotal = (total !== null && Number.isFinite(total)) ? total : null;
      console.log('🔄 [INIT] Cargando contador total asistencia desde localStorage:', validTotal);
      return validTotal;
    } catch {
      return null;
    }
  });
  
  // 🔴 Estado para error de autenticación Firebase Admin
  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);
  
  const [showDeleteSQLProgress, setShowDeleteSQLProgress] = useState(false);
  const [isDeletingAllGrades, setIsDeletingAllGrades] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [showAttendanceSQLModal, setShowAttendanceSQLModal] = useState(false);
  const [showAttendanceDeleteSQLProgress, setShowAttendanceDeleteSQLProgress] = useState(false);
  const [showConfirmDeleteAllSQL, setShowConfirmDeleteAllSQL] = useState(false);
  const [showConfirmDeleteGradesByYear, setShowConfirmDeleteGradesByYear] = useState(false);
  const [showConfirmDeleteAttendanceSQL, setShowConfirmDeleteAttendanceSQL] = useState(false);

  // 🔄 FUNCIÓN PARA OBTENER CONTADORES DE ASISTENCIA DESDE FIREBASE (antes de los useEffect)
  const getFirebaseAttendanceCounters = useCallback(async (year: number) => {
    try {
      const res = await fetch(`/api/firebase/attendance-counters?year=${encodeURIComponent(year)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 🔴 Detectar error de autenticación de Firebase Admin
      if (data?.authError) {
        // 🔧 FIX: Usar console.warn en lugar de console.error - no es crítico si Firebase no está configurado
        console.warn('⚠️ [Attendance Counters] Firebase Admin no configurado:', data.message);
        setFirebaseAuthError(data.message || 'Firebase Admin no puede autenticarse. Regenera las credenciales en Firebase Console.');
        return { yearCount: 0, total: 0, authError: true, message: data.message };
      }
      
      // Limpiar error si la autenticación funciona
      setFirebaseAuthError(null);

      const yearCount = Number(data?.yearCount || 0);
      const totalAttendance = Number(data?.totalAttendance || 0);

      // Actualizar estados locales del componente
      if (typeof data?.yearCount === 'number') setAttendanceYearCountOverride(yearCount);
      if (typeof data?.totalAttendance === 'number') setAttendanceTotalOverride(totalAttendance);

      // 💾 Guardar en localStorage para cache instantáneo
      try {
        localStorage.setItem(`attendance-counter-year-${year}`, String(yearCount));
        localStorage.setItem('attendance-counter-total', String(totalAttendance));
        console.log(`💾 Contadores asistencia guardados en localStorage: año ${year}=${yearCount}, total=${totalAttendance}`);
      } catch (e) {
        console.warn('⚠️ Error guardando contadores asistencia en localStorage:', e);
      }

      // 🔄 IMPORTANTE: También actualizar los estados del hook para mantener sincronización
      try {
        await countAttendanceByYear(year);
        await countAllAttendance();
        console.log('✅ Estados del hook de asistencia actualizados correctamente');
      } catch (hookError) {
        console.warn('⚠️ Error actualizando estados del hook de asistencia:', hookError);
      }

      return { yearCount, total: totalAttendance };
    } catch (e) {
      console.warn('[Attendance Counters] No se pudo obtener contadores desde API Firebase:', e);
      const yr = await countAttendanceByYear(year);
      const tt = await countAllAttendance();
      const yc = yr?.count ?? 0;
      const tot = tt?.total ?? 0;
      // Mantener valores actuales en caso de error para evitar parpadeos
      try {
        if (Number.isFinite(yc)) setAttendanceYearCountOverride((prev) => (prev ?? yc));
        if (Number.isFinite(tot)) setAttendanceTotalOverride((prev) => (prev ?? tot));
      } catch {}
      return { yearCount: yc, total: tot };
    }
  }, [countAttendanceByYear, countAllAttendance, setAttendanceYearCountOverride, setAttendanceTotalOverride]);

  // Detectar proveedor de BD
  useEffect(() => {
    setDbProvider(getCurrentProvider());
    // Forzar verificación de conexión (especialmente en IndexedDB)
    try { void checkConnection(); } catch {}
    
    // 📖 CARGAR contadores desde localStorage inmediatamente (sin esperar consultas)
    try {
      const cachedTotal = localStorage.getItem('grade-counter-total');
      if (cachedTotal) {
        const total = Number(cachedTotal) || 0;
        setFirebaseTotalOverride(total);
        console.log(`📖 [BULK-UPLOADS] Contador total cargado desde localStorage: ${total}`);
      }
      
      const currentYear = selectedYear;
      const cachedYear = localStorage.getItem(`grade-counter-year-${currentYear}`);
      if (cachedYear) {
        const count = Number(cachedYear) || 0;
        setFirebaseYearCountOverride(count);
        console.log(`📖 [BULK-UPLOADS] Contador de año ${currentYear} cargado desde localStorage: ${count}`);
      }
    } catch (e) {
      console.warn('⚠️ [BULK-UPLOADS] Error cargando contadores desde localStorage:', e);
    }
  }, []);

  // Cargar contadores al montar y cuando cambie el año
  useEffect(() => {
    // 📖 CALIFICACIONES: Cargar desde localStorage PRIMERO (instantáneo)
    try {
      const cachedYear = localStorage.getItem(`grade-counter-year-${selectedYear}`);
      if (cachedYear) {
        const count = Number(cachedYear);
        if (Number.isFinite(count)) {
          setFirebaseYearCountOverride(count);
          console.log(`📖 [YEAR-CHANGE] Contador de año ${selectedYear} cargado desde localStorage: ${count}`);
        }
      }
    } catch (e) {
      console.warn('⚠️ Error cargando contador de año desde localStorage:', e);
    }
    
    // 📖 ASISTENCIA: Cargar desde localStorage PRIMERO (instantáneo)
    try {
      const cachedAttYear = localStorage.getItem(`attendance-counter-year-${selectedYear}`);
      if (cachedAttYear) {
        const count = Number(cachedAttYear);
        if (Number.isFinite(count)) {
          setAttendanceYearCountOverride(count);
          console.log(`📖 [YEAR-CHANGE] Contador asistencia año ${selectedYear} cargado desde localStorage: ${count}`);
        }
      }
    } catch (e) {
      console.warn('⚠️ Error cargando contador asistencia año desde localStorage:', e);
    }
    
    // Luego actualizar CALIFICACIONES desde BD (en segundo plano)
    if (isSQLConnected) {
      countGradesByYear(selectedYear).then((res) => {
        if (res && res.count !== undefined) {
          setFirebaseYearCountOverride(res.count);
          // 💾 Guardar en localStorage
          try {
            localStorage.setItem(`grade-counter-year-${selectedYear}`, String(res.count));
          } catch {}
          console.log(`🔄 [YEAR-CHANGE] Contador de año ${selectedYear} actualizado desde BD: ${res.count}`);
        }
      }).catch(e => {
        console.warn('⚠️ Error actualizando contador de año desde BD:', e);
      });
      
      countAllGrades().then((res) => {
        if (res && res.total !== undefined) {
          setFirebaseTotalOverride(res.total);
          // 💾 Guardar en localStorage
          try {
            localStorage.setItem('grade-counter-total', String(res.total));
          } catch {}
          console.log(`🔄 [YEAR-CHANGE] Contador total actualizado desde BD: ${res.total}`);
        }
      }).catch(e => {
        console.warn('⚠️ Error actualizando contador total desde BD:', e);
      });
    }
    
    // Luego actualizar ASISTENCIA desde BD/Firebase (en segundo plano)
    if (isFirebaseMode) {
      // Modo Firebase: usar API de contadores
      getFirebaseAttendanceCounters(selectedYear).catch(e => {
        console.warn('⚠️ Error actualizando contadores asistencia desde Firebase:', e);
      });
    } else if (isAttendanceSQLConnected) {
      // Modo SQL/IDB: usar hooks
      countAttendanceByYear(selectedYear).then((res) => {
        if (res && res.count !== undefined) {
          setAttendanceYearCountOverride(res.count);
          try {
            localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(res.count));
          } catch {}
          console.log(`🔄 [YEAR-CHANGE] Contador asistencia año ${selectedYear} actualizado desde BD: ${res.count}`);
        }
      }).catch(e => {
        console.warn('⚠️ Error actualizando contador asistencia año desde BD:', e);
      });
      
      countAllAttendance().then((res) => {
        if (res && res.total !== undefined) {
          setAttendanceTotalOverride(res.total);
          try {
            localStorage.setItem('attendance-counter-total', String(res.total));
          } catch {}
          console.log(`🔄 [YEAR-CHANGE] Contador total asistencia actualizado desde BD: ${res.total}`);
        }
      }).catch(e => {
        console.warn('⚠️ Error actualizando contador total asistencia desde BD:', e);
      });
    }
  }, [isSQLConnected, isAttendanceSQLConnected, isFirebaseMode, selectedYear, countGradesByYear, countAllGrades, countAttendanceByYear, countAllAttendance, getFirebaseAttendanceCounters]);

  // 🔄 RECARGA AUTOMÁTICA: Recargar contadores cada vez que el componente se hace visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isSQLConnected) {
        console.log('🔄 Pestaña Carga Masiva visible - Recargando contadores...');
        
        // 📖 Cargar desde localStorage PRIMERO (instantáneo)
        try {
          const cachedYear = localStorage.getItem(`grade-counter-year-${selectedYear}`);
          if (cachedYear) {
            const count = Number(cachedYear);
            if (Number.isFinite(count)) {
              setFirebaseYearCountOverride(count);
              console.log(`📖 [VISIBILITY] Contador de año ${selectedYear} cargado desde localStorage: ${count}`);
            }
          }
          
          const cachedTotal = localStorage.getItem('grade-counter-total');
          if (cachedTotal) {
            const total = Number(cachedTotal);
            if (Number.isFinite(total)) {
              setFirebaseTotalOverride(total);
              console.log(`📖 [VISIBILITY] Contador total cargado desde localStorage: ${total}`);
            }
          }
        } catch (e) {
          console.warn('⚠️ Error cargando contadores desde localStorage:', e);
        }
        
        // Luego actualizar desde BD (en segundo plano)
        countGradesByYear(selectedYear).then((res) => {
          if (res && res.count !== undefined) {
            setFirebaseYearCountOverride(res.count);
            console.log(`🔄 [VISIBILITY] Contador de año actualizado desde BD: ${res.count}`);
          }
        }).catch(e => {
          console.warn('⚠️ Error actualizando contador de año:', e);
        });
        
        countAllGrades().then((res) => {
          if (res && res.total !== undefined) {
            setFirebaseTotalOverride(res.total);
            console.log(`🔄 [VISIBILITY] Contador total actualizado desde BD: ${res.total}`);
          }
        }).catch(e => {
          console.warn('⚠️ Error actualizando contador total:', e);
        });
      }
      if (!document.hidden && (isFirebaseMode || isAttendanceSQLConnected)) {
        console.log('🔄 Pestaña Carga Masiva visible - Recargando contadores de asistencia...');
        
        // 📖 Cargar desde localStorage PRIMERO (instantáneo)
        try {
          const cachedYear = localStorage.getItem(`attendance-counter-year-${selectedYear}`);
          if (cachedYear) {
            const count = Number(cachedYear);
            if (Number.isFinite(count)) {
              setAttendanceYearCountOverride(count);
              console.log(`📖 [VISIBILITY] Contador asistencia año ${selectedYear} cargado desde localStorage: ${count}`);
            }
          }
          
          const cachedTotal = localStorage.getItem('attendance-counter-total');
          if (cachedTotal) {
            const total = Number(cachedTotal);
            if (Number.isFinite(total)) {
              setAttendanceTotalOverride(total);
              console.log(`📖 [VISIBILITY] Contador total asistencia cargado desde localStorage: ${total}`);
            }
          }
        } catch (e) {
          console.warn('⚠️ Error cargando contadores asistencia desde localStorage:', e);
        }
        
        // Luego actualizar desde Firebase o BD (en segundo plano)
        if (isFirebaseMode) {
          getFirebaseAttendanceCounters(selectedYear).catch(e => {
            console.warn('⚠️ Error actualizando contadores asistencia desde Firebase:', e);
          });
        } else {
          countAttendanceByYear(selectedYear).then((res) => {
            if (res && res.count !== undefined) {
              setAttendanceYearCountOverride(res.count);
              console.log(`🔄 [VISIBILITY] Contador asistencia año actualizado desde BD: ${res.count}`);
            }
          }).catch(e => {
            console.warn('⚠️ Error actualizando contador asistencia año:', e);
          });
          
          countAllAttendance().then((res) => {
            if (res && res.total !== undefined) {
              setAttendanceTotalOverride(res.total);
              console.log(`🔄 [VISIBILITY] Contador total asistencia actualizado desde BD: ${res.total}`);
            }
          }).catch(e => {
            console.warn('⚠️ Error actualizando contador total asistencia:', e);
          });
        }
      }
    };

    // Recargar inmediatamente al montar
    if (isSQLConnected) {
      console.log('✅ Componente Carga Masiva montado - Cargando contadores iniciales...');
      
      // 📖 Cargar desde localStorage PRIMERO
      try {
        const cachedYear = localStorage.getItem(`grade-counter-year-${selectedYear}`);
        if (cachedYear) {
          const count = Number(cachedYear);
          if (Number.isFinite(count)) {
            setFirebaseYearCountOverride(count);
            console.log(`📖 [MOUNT] Contador de año ${selectedYear} cargado desde localStorage: ${count}`);
          }
        }
        
        const cachedTotal = localStorage.getItem('grade-counter-total');
        if (cachedTotal) {
          const total = Number(cachedTotal);
          if (Number.isFinite(total)) {
            setFirebaseTotalOverride(total);
            console.log(`📖 [MOUNT] Contador total cargado desde localStorage: ${total}`);
          }
        }
      } catch (e) {
        console.warn('⚠️ Error cargando contadores desde localStorage:', e);
      }
      
      // Luego actualizar desde BD
      countGradesByYear(selectedYear);
      countAllGrades();
    }
    if (isFirebaseMode || isAttendanceSQLConnected) {
      console.log('✅ Componente Carga Masiva montado - Cargando contadores iniciales de asistencia...');
      
      // 📖 Cargar desde localStorage PRIMERO
      try {
        const cachedYear = localStorage.getItem(`attendance-counter-year-${selectedYear}`);
        if (cachedYear) {
          const count = Number(cachedYear);
          if (Number.isFinite(count)) {
            setAttendanceYearCountOverride(count);
            console.log(`📖 [MOUNT] Contador asistencia año ${selectedYear} cargado desde localStorage: ${count}`);
          }
        }
        
        const cachedTotal = localStorage.getItem('attendance-counter-total');
        if (cachedTotal) {
          const total = Number(cachedTotal);
          if (Number.isFinite(total)) {
            setAttendanceTotalOverride(total);
            console.log(`📖 [MOUNT] Contador total asistencia cargado desde localStorage: ${total}`);
          }
        }
      } catch (e) {
        console.warn('⚠️ Error cargando contadores asistencia desde localStorage:', e);
      }
      
      // Luego actualizar desde Firebase o BD
      if (isFirebaseMode) {
        getFirebaseAttendanceCounters(selectedYear).catch(e => {
          console.warn('⚠️ Error cargando contadores asistencia desde Firebase:', e);
        });
      } else {
        countAttendanceByYear(selectedYear);
        countAllAttendance();
      }
    }

    // Escuchar cambios de visibilidad de la pestaña del navegador
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSQLConnected, isAttendanceSQLConnected, isFirebaseMode, selectedYear, countGradesByYear, countAllGrades, countAttendanceByYear, countAllAttendance, getFirebaseAttendanceCounters]);

  // Helper de traducción
  const t = (k: string, fallback?: string) => {
    try {
      const val = translate ? translate(k) : undefined;
      if (val == null || val === '') return fallback || k;
      return val;
    } catch {
      return fallback || k;
    }
  };

  // Parseo de CSV helper
  const parseCSVforSQL = (text: string) => {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').filter((l) => l.trim());

    const detectDelimiter = (line: string): string => {
      const delimiters = [';', ',', '\t', '|'];
      let maxCount = 0;
      let bestDelimiter = ',';

      for (const delim of delimiters) {
        const count = line.split(delim).length - 1;
        if (count > maxCount) {
          maxCount = count;
          bestDelimiter = delim;
        }
      }

      return bestDelimiter;
    };

    const delimiter = lines.length > 0 ? detectDelimiter(lines[0]) : ',';
    console.log(`🔧 Delimitador CSV detectado: "${delimiter}"`);

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i += 2;
          } else {
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }

      result.push(current.trim());

      return result.map((field) => {
        field = field.trim();
        if (field.startsWith('"') && field.endsWith('"')) {
          field = field.slice(1, -1).replace(/""/g, '"');
        }
        return field;
      });
    };

    if (lines.length === 0) {
      throw new Error('El archivo CSV está vacío');
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    if (headers.length === 0) {
      throw new Error('No se encontraron columnas en el archivo CSV');
    }

    const rows = lines.slice(1).map((line, index) => {
      const fields = parseCSVLine(line);
      const row: any = {};

      headers.forEach((header, i) => {
        row[header] = fields[i] || '';
      });

      const hasData = Object.values(row).some((val) => String(val).trim() !== '');
      if (!hasData && line.trim() !== '') {
        console.warn(`Fila ${index + 2} parece estar vacía o mal formateada: "${line}"`);
      }

      return row;
    });

    console.log(`📊 CSV parseado: ${headers.length} columnas, ${rows.length} filas`);
    console.log(`📋 Headers encontrados:`, headers);
    console.log(`📄 Primeras 3 filas:`, rows.slice(0, 3));

    return { headers, rows };
  };

  // Funciones de descarga de plantillas
  const downloadGradesTemplate = () => {
    const headers = ['nombre', 'rut', 'curso', 'seccion', 'asignatura', 'tipo', 'fecha', 'nota'];
    const blob = new Blob([headers.join(',') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plantilla-calificaciones.csv';
    a.click();
  };

  const downloadAttendanceTemplate = () => {
    // Headers compatibles con la API (soporta español e inglés)
    const headers = ['date', 'course', 'section', 'username', 'rut', 'name', 'status', 'comment'];
    const blob = new Blob([headers.join(',') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plantilla-asistencia.csv';
    a.click();
  };

  const downloadAttendanceStudentsTemplate = () => {
    const headers = ['nombre', 'rut', 'curso', 'seccion'];
    const blob = new Blob([headers.join(',') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plantilla-estudiantes-asistencia.csv';
    a.click();
  };

  const exportStudentAssignmentsExcel = async () => {
    try {
      const year = selectedYear;
      const students = LocalStorageManager.getStudentsForYear(year) || [];
      const teachers = LocalStorageManager.getTeachersForYear(year) || [];
      const courses = LocalStorageManager.getCoursesForYear(year) || [];
      const sections = LocalStorageManager.getSectionsForYear(year) || [];
      const teacherAssignments = LocalStorageManager.getTeacherAssignmentsForYear(year) || [];

      const courseById = new Map<string, any>(courses.map((c: any) => [String(c.id), c]));
      const sectionById = new Map<string, any>(sections.map((s: any) => [String(s.id), s]));
      const teacherById = new Map<string, any>(teachers.map((t: any) => [String(t.id), t]));

      const studentsBySection = new Map<string, any[]>();
      for (const s of students) {
        if (!s.sectionId) continue;
        if (!studentsBySection.has(s.sectionId)) studentsBySection.set(s.sectionId, []);
        studentsBySection.get(s.sectionId)!.push(s);
      }

      const headers = ['Nombre', 'RUT', 'Curso', 'Sección', 'Asignatura', 'Profesor'];
      const rows: string[][] = [];

      for (const a of teacherAssignments) {
        const section = sectionById.get(String(a.sectionId)) as any;
        const course = section ? (courseById.get(String(section.courseId)) as any) : null;
        const teacher = teacherById.get(String(a.teacherId)) as any;
        const subject = a.subjectName || '';
        if (!section || !course || !teacher) continue;

        const studentsInSection = studentsBySection.get(String(section.id)) || [];
        for (const st of studentsInSection) {
          rows.push([st.name || '', st.rut || '', course.name || '', section.name || '', subject, teacher.name || teacher.username || '']);
        }
      }

      if (rows.length === 0) {
        toast({
          title: t('noAssignmentsFound', 'Sin asignaciones'),
          description: t(
            'noAssignmentsFoundDesc',
            'No se encontraron asignaciones de profesores o estudiantes en secciones para este año.'
          ),
          variant: 'destructive',
        });
        return;
      }

      const XLSX = await import('xlsx');
      const aoa = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!autofilter'] = { ref: `A1:F${rows.length + 1}` } as any;
      ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 9 }, { wch: 22 }, { wch: 22 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Asignaciones ${year}`);
      XLSX.writeFile(wb, `asignaciones-${year}.xlsx`);

      toast({
        title: t('downloadAssignments', 'Descargar Asignaciones'),
        description: t('assignmentsGenerated', 'Asignaciones generadas') + `: ${rows.length}`,
      });
    } catch (e) {
      console.error('[EXPORT ASSIGNMENTS] Error:', e);
      toast({
        title: t('error', 'Error'),
        description: t('couldNotExport', 'No se pudo generar el archivo de asignaciones'),
        variant: 'destructive',
      });
    }
  };

  // Función para obtener contadores de Firebase
  const getFirebaseCounters = async (year: number) => {
    try {
      const res = await fetch(`/api/firebase/grade-counters?year=${encodeURIComponent(year)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const yearCount = Number(data?.yearCount || 0);
      const totalGrades = Number(data?.totalGrades || 0);
      
      // Actualizar estados locales del componente
      if (typeof data?.yearCount === 'number') setFirebaseYearCountOverride(yearCount);
      if (typeof data?.totalGrades === 'number') setFirebaseTotalOverride(totalGrades);
      
      // 💾 Guardar en localStorage para cache instantáneo
      try {
        localStorage.setItem(`grade-counter-year-${year}`, String(yearCount));
        localStorage.setItem('grade-counter-total', String(totalGrades));
        console.log(`💾 Contadores calificaciones guardados en localStorage: año ${year}=${yearCount}, total=${totalGrades}`);
      } catch (e) {
        console.warn('⚠️ Error guardando contadores calificaciones en localStorage:', e);
      }
      
      // 🔄 IMPORTANTE: También actualizar los estados del hook para mantener sincronización
      try {
        await countGradesByYear(year);
        await countAllGrades();
        console.log('✅ Estados del hook de calificaciones actualizados correctamente');
      } catch (hookError) {
        console.warn('⚠️ Error actualizando estados del hook de calificaciones:', hookError);
      }
      
      return { yearCount, total: totalGrades };
    } catch (e) {
      console.warn('[Counters] No se pudo obtener contadores desde API Firebase:', e);
      const yr = await countGradesByYear(year);
      const tt = await countAllGrades();
      const yc = yr?.count ?? 0;
      const tot = tt?.total ?? 0;
      // Mantener valores actuales en caso de error para evitar parpadeos
      try {
        if (Number.isFinite(yc)) setFirebaseYearCountOverride((prev) => (prev ?? yc));
        if (Number.isFinite(tot)) setFirebaseTotalOverride((prev) => (prev ?? tot));
      } catch {}
      return { yearCount: yc, total: tot };
    }
  };

  // Función para sondear contadores después de la carga
  const pollGradesCountersAfterUpload = async (opts?: { timeoutMs?: number; intervalMs?: number }) => {
    const timeoutMs = opts?.timeoutMs ?? 12 * 60 * 1000; // 12 minutos
    const intervalMs = opts?.intervalMs ?? 15 * 1000; // 15s
    const start = Date.now();

    try {
      // Medir baseline
      const baseline = await getFirebaseCounters(selectedYear);
      let lastYear = baseline.yearCount;
      let lastTotal = baseline.total;

      console.log(`🔎 [Sondeo] Iniciando verificación de contadores. Baseline año ${selectedYear}: ${lastYear}, total: ${lastTotal}`);
      toast({ title: t('verifyingBackgroundUpload', 'Verificando carga en segundo plano'), description: t('updatingCounters', 'Actualizando contadores desde Firebase...'), variant: 'default' });

      while (Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, intervalMs));
        const now = await getFirebaseCounters(selectedYear);
        const y = now.yearCount;
        const tt = now.total;
        console.log(`🔁 [Sondeo] Año ${selectedYear}: ${y} (antes ${lastYear}) • Total: ${tt} (antes ${lastTotal})`);

        // Si detectamos incremento, damos por buena la carga
        if (y > lastYear || tt > lastTotal) {
          toast({ title: t('uploadDetected', 'Carga detectada en Firebase'), description: `${t('year', 'Año')} ${selectedYear}: ${y} • Total: ${tt}`, variant: 'default' });
          console.log('✅ [Sondeo] Cambios detectados en contadores. Sondeo finalizado.');
          return true;
        }
      }

      // Tiempo agotado, informar pero no como error crítico
      toast({ title: t('verificationComplete', 'Verificación finalizada'), description: t('noChangesDetected', 'No se detectaron cambios automáticos. Puedes usar "Actualizar" para forzar la lectura desde Firebase.'), variant: 'default' });
      console.warn('⏱️ [Sondeo] Tiempo agotado sin cambios en contadores.');
      return false;
    } catch (e) {
      console.error('⚠️ [Sondeo] Error durante la verificación de contadores:', e);
      return false;
    }
  };

  const handleRefreshCounters = async () => {
    console.log('🔄 Actualizando contadores manualmente...');
    
    // Mostrar toast de inicio
    toast({
      title: t('refreshingCounters', 'Actualizando contadores'),
      description: t('pleaseWait', 'Por favor espera...'),
    });
    
    try {
      // Intentar obtener desde Firebase API primero
      const res = await getFirebaseCounters(selectedYear);
      
      // También forzar actualización directa desde SQL para asegurar sincronización
      await countGradesByYear(selectedYear);
      await countAllGrades();
      
      // Mostrar resultado exitoso
      toast({
        title: t('countersUpdated', 'Contadores actualizados'),
        description: `${t('year', 'Año')} ${selectedYear}: ${res.yearCount.toLocaleString()} • Total: ${res.total.toLocaleString()}`,
      });
    } catch (error: any) {
      console.error('Error al actualizar contadores:', error);
      toast({
        title: t('error', 'Error'),
        description: t('couldNotUpdateCounters', 'No se pudieron actualizar los contadores'),
        variant: 'destructive',
      });
    }
  };

  // ==================== FUNCIONES PARA ASISTENCIA ====================

  const handleRefreshAttendanceCounters = async () => {
    console.log('🔄 Actualizando contadores de asistencia manualmente...');
    
    toast({
      title: t('refreshingCounters', 'Actualizando contadores'),
      description: t('pleaseWait', 'Por favor espera...'),
    });
    
    try {
      if (isFirebaseMode) {
        // 🔥 Para Firebase: forzar recarga completa desde API sin cache
        console.log('🔥 Forzando recarga desde Firebase API...');
        const res = await fetch(`/api/firebase/attendance-counters?year=${encodeURIComponent(selectedYear)}&_t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        const yearCount = Number(data?.yearCount || 0);
        const totalAttendance = Number(data?.totalAttendance || 0);
        
        // Actualizar estados locales
        setAttendanceYearCountOverride(yearCount);
        setAttendanceTotalOverride(totalAttendance);
        
        // Actualizar localStorage
        localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(yearCount));
        localStorage.setItem('attendance-counter-total', String(totalAttendance));
        
        console.log(`✅ Contadores actualizados desde Firebase: año=${yearCount}, total=${totalAttendance}`);
        
        toast({
          title: t('countersUpdated', 'Contadores actualizados'),
          description: `${t('year', 'Año')} ${selectedYear}: ${yearCount.toLocaleString()} • Total: ${totalAttendance.toLocaleString()}`,
        });
      } else {
        // Para SQL/IDB: usar hooks
        const res = await getFirebaseAttendanceCounters(selectedYear);
        await countAttendanceByYear(selectedYear);
        await countAllAttendance();
        
        toast({
          title: t('countersUpdated', 'Contadores actualizados'),
          description: `${t('year', 'Año')} ${selectedYear}: ${res.yearCount.toLocaleString()} • Total: ${res.total.toLocaleString()}`,
        });
      }
    } catch (error: any) {
      console.error('Error al actualizar contadores de asistencia:', error);
      toast({
        title: t('error', 'Error'),
        description: t('couldNotUpdateCounters', 'No se pudieron actualizar los contadores'),
        variant: 'destructive',
      });
    }
  };

  // ==================== FIN FUNCIONES PARA ASISTENCIA ====================

  // Handler para subir calificaciones a SQL/Firebase
  const handleUploadGradesSQL = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const uploadStartTime = Date.now();
    
    try {
      // 🔧 FIX: Inicializar progreso inmediatamente al abrir el modal
      setGradesProgress({
        current: 0,
        total: 0,
        created: 0,
        errors: 0,
        phase: 'Preparando...',
        logs: [`📂 Archivo seleccionado: ${file.name}`],
        startTime: uploadStartTime,
      });
      setShowSQLModal(true);
      
      // 🔥 Detectar si Firebase está habilitado
      const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
      
      if (useFirebase) {
        console.log('🔥 Firebase habilitado - Usando API para carga masiva');
        
        let progressUnsubscribe: (() => void) | undefined = undefined;
        
        try {
          // Usar API endpoint con Firebase Admin SDK
          const formData = new FormData();
          formData.append('file', file);
          formData.append('year', String(selectedYear));
          
          // Generar un jobId único para monitorear el progreso
          const jobId = `import-grades-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          formData.append('jobId', jobId);
          
          // 🎯 NUEVO: Incluir datos de cursos y secciones para mapeo correcto (igual que asistencia)
          try {
            const sections = LocalStorageManager.getSectionsForYear(selectedYear) || [];
            const courses = LocalStorageManager.getCoursesForYear(selectedYear) || [];
            formData.append('sections', JSON.stringify(sections));
            formData.append('courses', JSON.stringify(courses));
            console.log(`📚 Enviando ${courses.length} cursos y ${sections.length} secciones para mapeo de calificaciones`);
          } catch (mapError) {
            console.warn('⚠️ No se pudieron cargar cursos/secciones para calificaciones:', mapError);
          }
          
          console.log('📦 Preparando envío de archivo:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            year: selectedYear,
            jobId
          });
          
          // Inicializar con valores seguros para evitar NaN
          setGradesProgress(prev => ({ 
            ...prev,
            current: 0, 
            total: 100, 
            created: 0, 
            errors: 0, 
            phase: t('uploadingFile', 'Subiendo archivo a servidor...'),
            logs: [...prev.logs, '📤 Subiendo archivo al servidor...'],
          }));
          
          // 🔥 Configurar listener de progreso en tiempo real desde Firestore
          // NOTA: Este listener es OPCIONAL - si falla, la carga continúa sin monitoreo en tiempo real
          const setupProgressListener = async () => {
            try {
              // Envolver imports dinámicos en try-catch individual para manejar errores de carga de chunks
              let doc: any, onSnapshot: any, setDoc: any, getFirestoreInstance: any;
              try {
                const firestoreModule = await import('firebase/firestore');
                doc = firestoreModule.doc;
                onSnapshot = firestoreModule.onSnapshot;
                setDoc = firestoreModule.setDoc;
                const configModule = await import('@/lib/firebase-config');
                getFirestoreInstance = configModule.getFirestoreInstance;
              } catch (importError) {
                console.warn('⚠️ No se pudieron cargar módulos de Firebase (chunk error):', importError);
                console.warn('⚠️ La carga continuará sin monitoreo de progreso en tiempo real');
                return; // Salir silenciosamente
              }
              
              const db = getFirestoreInstance();
              if (!db) {
                console.warn('⚠️ Firestore no disponible para monitoreo de progreso');
                return;
              }
              
              console.log(`🎯 Configurando listener para documento: imports/${jobId}`);
              
              // Crear documento inicial para asegurar que existe
              const progressRef = doc(db, `imports/${jobId}`);
              await setDoc(progressRef, {
                processed: 0,
                total: 0,
                errors: 0,
                percent: 0,
                status: 'initializing',
                message: t('startingUpload', 'Iniciando carga...'),
                createdAt: new Date().toISOString()
              });
              
              console.log('✅ Documento inicial creado en Firestore');
              
              progressUnsubscribe = onSnapshot(progressRef, (snapshot) => {
                console.log(`📡 Snapshot recibido: exists=${snapshot.exists()}, metadata.hasPendingWrites=${snapshot.metadata.hasPendingWrites}`);
                
                if (snapshot.exists()) {
                  const data = snapshot.data();
                  console.log('📊 RAW DATA desde Firestore:', JSON.stringify(data, null, 2));
                  
                  // Calcular el porcentaje real basado en los datos recibidos
                  const processed = Number(data.processed) || 0;
                  const totalFromData = Number(data.total) || Number(data.totalRows) || 0;
                  const safTotal = totalFromData > 0 ? Math.max(totalFromData, processed) : (processed > 0 ? processed : 1);
                  const percent = data.percent || (safTotal > 0 ? Math.round((processed / safTotal) * 100) : 0);
                  
                  console.log(`🔢 Valores parseados: processed=${processed}, totalFromData=${totalFromData}, safTotal=${safTotal}, percent=${percent}`);
                  
                  const saved = Number((data as any).saved) || processed;
                  setGradesProgress({
                    current: saved,
                    total: safTotal,
                    created: saved,
                    errors: Number(data.errors) || 0,
                    phase: data.message || data.status || t('processing', 'Procesando...')
                  });
                  
                  console.log(`📈 UI actualizada: ${percent}% (${processed}/${safTotal} registros, ${data.errors || 0} errores)`);
                  
                  // Si se completó, detener el listener después de un momento
                  if (data.status === 'completed' || data.status === 'failed') {
                    console.log('✅ Carga de calificaciones completada, actualizando UI...');
                    // 🔧 FIX: Actualizar phase a 'completado' o 'error' para que canClose funcione
                    setGradesProgress({
                      current: saved,
                      total: safTotal,
                      created: saved,
                      errors: Number(data.errors) || 0,
                      phase: data.status === 'completed' ? 'completado' : 'error'
                    });
                    setTimeout(() => {
                      const unsub = progressUnsubscribe;
                      if (unsub && typeof unsub === 'function') {
                        try {
                          unsub();
                        } catch (err) {
                          console.warn('⚠️ Error al detener listener:', err);
                        }
                      }
                      progressUnsubscribe = undefined;
                    }, 2000);
                  }
                }
              }, (error) => {
                console.error('❌ Error en listener de progreso:', error);
              });
            } catch (error) {
              console.error('❌ Error configurando listener de progreso:', error);
              // No lanzar error - el listener es opcional, la carga puede continuar sin él
            }
          };
          
          // Iniciar listener antes de enviar el archivo (NO bloquea si falla)
          // Usamos .catch() para que el error no detenga la carga principal
          setupProgressListener().catch((err) => {
            console.warn('⚠️ No se pudo configurar el listener de progreso en tiempo real:', err.message);
            console.warn('⚠️ La carga continuará sin monitoreo en tiempo real');
          });
          
          console.log('📡 Enviando fetch a /api/firebase/bulk-upload-grades...');
          
          // Crear AbortController para timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('⏱️ Request timeout después de 15 minutos');
          }, 900000); // 15 minutos timeout para archivos grandes
          
          let response;
          try {
            response = await fetch('/api/firebase/bulk-upload-grades', {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            console.error('❌ Error en fetch:', fetchError);
            
            if (fetchError.name === 'AbortError') {
              throw new Error(t('uploadTimeout', 'La carga tomó demasiado tiempo y fue cancelada (timeout de 15 minutos).'));
            }
            
            throw new Error(`${t('networkError', 'Error de red al conectar con el servidor')}: ${fetchError.message}`);
          }
          
          console.log('📨 Respuesta recibida, status:', response.status);
          
          // Clonar la respuesta antes de leerla
          const responseClone = response.clone();
          
          if (!response.ok) {
            let errorMessage = t('uploadProcessError', 'Error al procesar la carga');
            let errorDetails = null;
            
            try {
              const error = await responseClone.json();
              errorMessage = error.error || error.message || errorMessage;
              errorDetails = error.details || null;
              console.error('❌ Error del servidor (JSON):', error);
            } catch (jsonError) {
              try {
                const textError = await response.text();
                const status = response.status;
                const isGatewayTimeoutLike = [0, 408, 499, 500, 502, 503, 504].includes(status);
                const noContent = !textError || textError.trim().length === 0;

                if (isGatewayTimeoutLike && noContent) {
                  console.warn('⚠️ Respuesta no OK sin cuerpo. Iniciando sondeo...');
                  toast({ 
                    title: t('processingOnServer', 'Procesando en servidor'), 
                    description: t('verifyingCounters', 'Verificando contadores desde Firebase...'), 
                    variant: 'default' 
                  });
                  setGradesProgress(prev => ({
                    ...prev,
                    phase: t('monitoringProgress', 'Procesando en servidor... Monitoreando progreso desde Firebase')
                  }));
                  void pollGradesCountersAfterUpload();
                  e.target.value = '';
                  return;
                }
                
                // Detectar si la respuesta es HTML (error de servidor/proxy)
                if (textError && textError.trim().startsWith('<')) {
                  console.error('❌ Servidor devolvió HTML en lugar de JSON:', textError.substring(0, 200));
                  errorMessage = status === 404 
                    ? t('apiNotFound', 'API no encontrada. Verifica que el servidor esté corriendo correctamente.')
                    : t('serverError', 'Error del servidor. Por favor, recarga la página e intenta nuevamente.');
                  errorDetails = `Status: ${status}, Response: HTML`;
                } else {
                  errorMessage = textError || errorMessage;
                }
              } catch (textError) {
                console.warn('⚠️ No se pudo leer la respuesta:', textError);
              }
            }
            
            const fullErrorMessage = errorDetails 
              ? `${errorMessage}\n\n${t('details', 'Detalles')}: ${errorDetails}`
              : errorMessage;
            
            throw new Error(fullErrorMessage);
          }
          
          console.log('📦 Parseando respuesta exitosa...');
          let result: any = null;
          let responseText = '';
          try {
            responseText = await response.text();
            console.log('📝 Respuesta en texto (primeros 200 chars):', responseText.substring(0, 200));
            if (responseText && responseText.trim().length > 0) {
              // Verificar si es HTML en lugar de JSON
              if (responseText.trim().startsWith('<')) {
                console.error('❌ Respuesta OK pero contiene HTML en lugar de JSON');
                throw new Error(t('serverReturnedHtml', 'El servidor devolvió una respuesta inesperada. Por favor, recarga la página e intenta nuevamente.'));
              }
              try { result = JSON.parse(responseText); } catch (parseErr) {
                console.error('❌ Error parseando JSON:', parseErr);
                throw new Error(t('invalidJsonResponse', 'Respuesta del servidor no es JSON válido'));
              }
            }
          } catch (parseError: any) {
            console.warn('⚠️ No se pudo leer el cuerpo de la respuesta:', parseError?.message || parseError);
            // Re-lanzar si es un error que creamos nosotros
            if (parseError?.message?.includes('servidor')) {
              throw parseError;
            }
          }

          if (!result) {
            console.warn('⚠️ Respuesta sin JSON válido. Mantener modal abierto para monitoreo...');
            setGradesProgress(prev => ({ ...prev, phase: t('monitoringProgress', 'Procesando en servidor... Monitoreando progreso...') }));
            e.target.value = '';
            return;
          }
          
          console.log('✅ Respuesta recibida del servidor:', result);
          setGradesProgress({ 
            current: (result.saved ?? result.processed) || 0, 
            total: (result.saved ?? result.processed) || 1, 
            created: (result.saved ?? result.processed) || 0, 
            errors: result.totalErrors || 0, 
            phase: 'completado'
          });
          
          toast({
            title: result.totalErrors > 0 ? t('partialUploadComplete', 'Carga parcial completada') : t('uploadComplete', 'Carga completada'),
            description: result.message,
            variant: result.totalErrors > 0 ? 'destructive' : 'default'
          });
          
          // Actualizar contadores desde Firebase
          console.log('🔄 Actualizando contadores desde Firebase...');
          try {
            await getFirebaseCounters(selectedYear);
            console.log('✅ Contadores de Firebase actualizados correctamente');
          } catch (countError) {
            console.error('⚠️ Error al actualizar contadores:', countError);
          }
          
          // 🔧 FIX: No cerrar automáticamente - dejar que el usuario cierre con el botón
          // El modal mostrará el botón "Cerrar" porque phase='completado'
          console.log('✅ Carga de calificaciones completada. El usuario puede cerrar el modal.');
          
          // Limpiar listener de Firestore
          const unsub = progressUnsubscribe;
          if (unsub && typeof unsub === 'function') {
            try {
              unsub();
            } catch (err) {
              console.warn('⚠️ Error al detener listener:', err);
            }
          }
          
          e.target.value = '';
          return;
        } catch (firebaseError: any) {
          const errorMsg = firebaseError?.message || t('unknownError', 'Error desconocido al procesar el archivo');
          const isEmptyError = !errorMsg || errorMsg.trim() === '';
          
          if (!isEmptyError) {
            console.error('❌ Error en carga Firebase:', firebaseError);
          }
          
          toast({
            title: t('bulkUploadError', 'Error en carga masiva'),
            description: isEmptyError ? t('networkTimeoutVerifying', 'Error de red o timeout. Verificando contadores en servidor...') : errorMsg,
            variant: 'destructive'
          });
          
          // Limpiar listener de progreso si existe
          const unsub = progressUnsubscribe;
          if (unsub && typeof unsub === 'function') {
            try {
              (unsub as any)();
            } catch (err) {
              console.warn('⚠️ Error al limpiar listener:', err);
            }
          }
          
          // Activamos sondeo para reflejar cambios si ocurren
          try {
            console.warn('🔁 Activando verificación de contadores tras error de respuesta...');
            void pollGradesCountersAfterUpload();
          } catch {}
          
          setShowSQLModal(false);
          
          if (!isEmptyError) {
            throw firebaseError;
          }
        }
      }
      
      // Modo SQL / IndexedDB: parsear CSV en cliente y enviar a hook
      console.log('🗄️ SQL/IndexedDB habilitado - Procesando CSV en cliente');
      try {
        // Asegurar conexión mínima
        try { await checkConnection(); } catch {}

        const text = await file.text();
        const { headers, rows } = parseCSVforSQL(text);
        console.log('📄 CSV leído para SQL:', { headers, sample: rows.slice(0, 2) });

        // Ayudantes locales
        const toId = (s: string | null | undefined): string | null => {
          if (!s) return null;
          return String(s).toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '');
        };
        const parseDate = (input: string): Date | null => {
          const s = String(input || '').trim();
          if (!s) return null;
          const t = s.replaceAll('.', '/').replaceAll('-', '/');
          const ymd = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
          const dmy = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
          let iso = '';
          if (ymd.test(t)) iso = t.replaceAll('/', '-');
          else if (dmy.test(t)) {
            const [d, m, y] = t.split('/');
            iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            const d = new Date(s);
            if (!isNaN(d.getTime())) return d; else return null;
          }
          const d = new Date(iso);
          return isNaN(d.getTime()) ? null : d;
        };
        const parseScore = (v: string): number | null => {
          if (v == null) return null;
          const n = Number(String(v).replace(',', '.'));
          return Number.isFinite(n) ? n : null;
        };

        // Mapear filas a GradeRecord[]
        const list: any[] = [];
        const totalRows = rows.length; // Total de filas en el CSV
        let skippedRows = 0; // Filas omitidas por datos inválidos
        
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i] as any;
          const nombre = r['nombre'] || r['student'] || r['studentname'] || '';
          const rut = r['rut'] || r['studentid'] || r['id'] || '';
          const curso = r['curso'] || r['course'] || r['courseid'] || '';
          const seccion = r['seccion'] || r['section'] || r['sectionid'] || '';
          const asignatura = r['asignatura'] || r['subject'] || r['subjectid'] || '';
          const tipoStr = (r['tipo'] || r['type'] || 'evaluacion').toString().toLowerCase();
          const notaStr = r['nota'] || r['score'] || '';
          const fechaStr = r['fecha'] || r['gradedat'] || r['date'] || '';
          const tema = r['tema'] || r['topic'] || r['theme'] || ''; // Campo OPCIONAL

          if (!nombre || !rut || !curso || !notaStr || !fechaStr) {
            skippedRows++;
            continue;
          }
          const score = parseScore(notaStr);
          const date = parseDate(fechaStr);
          if (score == null || !date) {
            skippedRows++;
            continue;
          }
          const type = ['tarea', 'prueba', 'evaluacion'].includes(tipoStr) ? (tipoStr as any) : 'evaluacion';

          const courseId = toId(curso);
          const sectionId = toId(seccion);
          const subjectId = asignatura ? toId(asignatura) : null;
          // testId incluye curso+sección para evitar que actividades de diferentes cursos compartan el mismo ID
          const testId = toId(`${courseId}_${sectionId || 'all'}_${subjectId || 'general'}_${type}_${date.getTime()}`)!;
          const id = toId(`${rut}_${courseId}_${testId}`)!;
          const iso = date.toISOString();
          const nowIso = new Date().toISOString();

          // Construir el título: usar tema si existe, sino usar asignatura + fecha
          const title = tema ? String(tema).trim() : `${asignatura || 'Evaluación'} ${iso.slice(0,10)}`;

          const gradeRecord: any = {
            id,
            testId,
            studentId: String(rut),
            studentName: String(nombre),
            score: Number(score),
            courseId,
            sectionId,
            subjectId,
            title,
            gradedAt: iso,
            year: selectedYear,
            type,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          // Agregar tema solo si existe (campo opcional)
          if (tema && String(tema).trim()) {
            gradeRecord.topic = String(tema).trim();
          }

          list.push(gradeRecord);
        }

        if (list.length === 0) {
          throw new Error(t('noValidRowsGrades', 'No se encontraron filas válidas en el CSV. Verifica que tenga las columnas requeridas: nombre, rut, curso, nota, fecha.'));
        }

        console.log(`🧮 Registros construidos para SQL: ${list.length} de ${totalRows} (${skippedRows} omitidos)`);
        
        // 🔧 FIX: Actualizar progreso antes de subir - mostrar total del CSV y errores
        setGradesProgress(prev => ({
          ...prev,
          current: 0,
          total: totalRows, // Total de filas en el CSV
          created: 0,
          errors: skippedRows, // Filas con datos inválidos
          phase: t('uploadingToSQL', 'Subiendo a base de datos local...'),
          logs: [
            ...prev.logs, 
            `📊 ${totalRows} filas en CSV | ${list.length} válidas | ${skippedRows} omitidas`
          ],
        }));
        
        // 🔧 FIX: Obtener conteo ANTES de la carga para calcular cuántos se insertaron realmente
        let countBeforeUpload = 0;
        try {
          const beforeResult = await countGradesByYear(selectedYear);
          countBeforeUpload = beforeResult?.count || 0;
          console.log(`📊 Registros antes de carga: ${countBeforeUpload}`);
        } catch (e) {
          console.warn('⚠️ No se pudo obtener conteo previo:', e);
        }
        
        const ok = await uploadGradesToSQL(list as any);
        if (ok) {
          // 🔧 FIX: Actualizar contadores y overrides ANTES de mostrar completado
          try {
            const yearResult = await countGradesByYear(selectedYear);
            const totalResult = await countAllGrades();
            
            console.log('📊 Contadores actualizados:', { yearResult, totalResult });
            
            // 🔧 FIX: Calcular registros realmente insertados
            const countAfterUpload = yearResult?.count || 0;
            const actualInserted = countAfterUpload - countBeforeUpload;
            const insertErrors = list.length - actualInserted;
            const totalErrors = skippedRows + insertErrors;
            
            console.log(`📊 Insertados realmente: ${actualInserted} de ${list.length} (${insertErrors} duplicados/errores)`);
            
            // Actualizar overrides para que la UI se actualice inmediatamente
            if (yearResult && yearResult.count !== undefined) {
              setFirebaseYearCountOverride(yearResult.count);
              localStorage.setItem(`grades-counter-year-${selectedYear}`, String(yearResult.count));
            }
            if (totalResult && totalResult.total !== undefined) {
              setFirebaseTotalOverride(totalResult.total);
              localStorage.setItem('grades-counter-total', String(totalResult.total));
            }
            
            console.log('✅ Contadores de calificaciones actualizados');
            
            // 🔧 FIX: Actualizar progreso a completado con números REALES
            setGradesProgress(prev => ({
              ...prev,
              current: totalRows,
              total: totalRows,
              created: actualInserted, // Registros REALMENTE insertados
              errors: totalErrors,     // Omitidos + duplicados/errores de inserción
              phase: 'completado',
              logs: [
                ...prev.logs, 
                `✅ Carga completada: ${actualInserted} registros guardados` + 
                (totalErrors > 0 ? ` | ${totalErrors} no insertados (${skippedRows} inválidos, ${insertErrors} duplicados)` : '')
              ],
            }));
            
            // Toast con información clara
            const toastDesc = totalErrors > 0 
              ? `${actualInserted} guardados, ${totalErrors} errores`
              : `${actualInserted} registros`;
            toast({ title: t('uploadComplete', 'Carga completada'), description: toastDesc, variant: 'default' });
            
          } catch (countErr) {
            console.warn('⚠️ Error actualizando contadores:', countErr);
            
            // Fallback: usar list.length si no pudimos calcular
            setGradesProgress(prev => ({
              ...prev,
              current: totalRows,
              total: totalRows,
              created: list.length,
              errors: skippedRows,
              phase: 'completado',
              logs: [
                ...prev.logs, 
                `✅ Carga completada: ${list.length} registros procesados` + 
                (skippedRows > 0 ? ` | ${skippedRows} omitidos` : '')
              ],
            }));
            toast({ title: t('uploadComplete', 'Carga completada'), description: `${list.length} registros`, variant: 'default' });
          }
          
          // 🔧 FIX: NO cerrar automáticamente - dejar que el usuario cierre con el botón
          console.log('✅ Carga SQL de calificaciones completada. El usuario puede cerrar el modal.');
        } else {
          throw new Error(t('uploadFailed', 'Error al guardar en base de datos'));
        }
      } catch (err: any) {
        console.error('❌ Error en modo SQL:', err);
        setGradesProgress(prev => ({
          ...prev,
          phase: `❌ Error: ${err?.message || 'Error desconocido'}`,
          errors: 1,
          logs: [...prev.logs, `❌ Error: ${err?.message || 'Error desconocido'}`],
        }));
        toast({ title: t('sqlUploadError', 'Error en carga SQL'), description: err?.message || 'CSV inválido', variant: 'destructive' });
      }
      // 🔧 FIX: Removido el finally que cerraba el modal inmediatamente
      
    } catch (e: any) {
      console.error('❌ Error en carga SQL:', e);
      toast({
        title: t('sqlUploadError', 'Error en carga SQL'),
        description: e?.message || t('checkCSVFormat', 'Revisa el formato del archivo CSV'),
        variant: 'destructive',
      });
      setShowSQLModal(false);
    } finally {
      e.target.value = '';
    }
  };

  // Handler para subir asistencia a SQL/Firebase
  const handleUploadAttendanceSQL = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    try {
      // 🔧 FIX: Inicializar startTime inmediatamente al abrir el modal
      const uploadStartTime = Date.now();
      
      // 🔥 Detectar si Firebase está habilitado ANTES de actualizar el progreso
      const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
      const modeLabel = useFirebase ? '🔥 Firebase' : '🗄️ SQL Local';
      console.log(`📦 Modo de carga detectado: ${modeLabel}`);
      
      setAttendanceProgress({
        current: 0,
        total: 0,
        phase: 'Preparando...',
        logs: [`📄 Iniciando carga de asistencia...`, `📡 Modo: ${modeLabel}`],
        errors: 0,
        success: 0,
        startTime: uploadStartTime,
        elapsedTime: 0
      });
      setShowAttendanceSQLModal(true);
      
      if (useFirebase) {
        console.log('🔥 Firebase habilitado - Usando API para carga masiva de asistencia');
        
        let progressUnsubscribe: (() => void) | undefined = undefined;
        
        try {
          // Usar API endpoint con Firebase Admin SDK
          const formData = new FormData();
          formData.append('file', file);
          formData.append('year', String(selectedYear));
          
          // Generar un jobId único para monitorear el progreso
          const jobId = `import-attendance-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          formData.append('jobId', jobId);
          
          // 🎯 NUEVO: Incluir datos de cursos y secciones para mapeo correcto
          try {
            const sections = LocalStorageManager.getSectionsForYear(selectedYear) || [];
            const courses = LocalStorageManager.getCoursesForYear(selectedYear) || [];
            formData.append('sections', JSON.stringify(sections));
            formData.append('courses', JSON.stringify(courses));
            console.log(`📚 Enviando ${courses.length} cursos y ${sections.length} secciones para mapeo`);
          } catch (mapError) {
            console.warn('⚠️ No se pudieron cargar cursos/secciones:', mapError);
          }
          
          console.log('📦 Preparando envío de archivo de asistencia:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            year: selectedYear,
            jobId
          });
          
          // Inicializar con valores seguros
          const uploadStartTime = Date.now();
          setAttendanceProgress({
            current: 0,
            total: 100,
            phase: t('uploadingFile', 'Subiendo archivo a servidor...'),
            logs: ['📤 Subiendo archivo al servidor...'],
            errors: 0,
            success: 0,
            startTime: uploadStartTime,
            elapsedTime: 0
          });
          
          // 🔥 Configurar listener de progreso en tiempo real desde Firestore
          const setupProgressListener = async () => {
            try {
              const { doc, onSnapshot, setDoc } = await import('firebase/firestore');
              const { getFirestoreInstance } = await import('@/lib/firebase-config');
              
              const db = getFirestoreInstance();
              if (!db) {
                console.warn('⚠️ Firestore no disponible para monitoreo de progreso');
                return;
              }
              
              console.log(`🎯 Configurando listener para documento de asistencia: imports/${jobId}`);
              
              // Crear documento inicial
              const progressRef = doc(db, `imports/${jobId}`);
              await setDoc(progressRef, {
                processed: 0,
                total: 0,
                errors: 0,
                percent: 0,
                status: 'initializing',
                message: t('startingUpload', 'Iniciando carga...'),
                createdAt: new Date().toISOString()
              });
              
              console.log('✅ Documento inicial de asistencia creado en Firestore');
              
              // Actualizar logs
              setAttendanceProgress(prev => ({
                ...prev,
                logs: [...prev.logs, '✅ Documento de progreso creado', '🔄 Esperando procesamiento...'].slice(-50)
              }));
              
              progressUnsubscribe = onSnapshot(progressRef, (snapshot) => {
                console.log(`📡 Snapshot asistencia recibido: exists=${snapshot.exists()}`);
                
                if (snapshot.exists()) {
                  const data = snapshot.data();
                  console.log('📊 RAW DATA asistencia desde Firestore:', JSON.stringify(data, null, 2));
                  
                  const processed = Number(data.processed) || 0;
                  const totalFromData = Number(data.total) || Number(data.totalRows) || 0;
                  const safTotal = totalFromData > 0 ? Math.max(totalFromData, processed) : (processed > 0 ? processed : 1);
                  const percent = data.percent || (safTotal > 0 ? Math.round((processed / safTotal) * 100) : 0);
                  
                  console.log(`🔢 Valores parseados asistencia: processed=${processed}, totalFromData=${totalFromData}, safTotal=${safTotal}, percent=${percent}`);
                  
                  const saved = Number((data as any).saved) || processed;
                  const errCount = Number(data.errors) || 0;
                  const successCount = saved - errCount;
                  
                  setAttendanceProgress(prev => ({
                    current: saved,
                    total: safTotal,
                    phase: data.message || data.status || t('processing', 'Procesando...'),
                    logs: [
                      ...prev.logs,
                      `📊 Progreso: ${saved}/${safTotal} (${percent}%)`,
                      ...(errCount > 0 ? [`⚠️ Errores encontrados: ${errCount}`] : []),
                      ...(data.message ? [`ℹ️ ${data.message}`] : [])
                    ].slice(-50), // Mantener últimos 50 logs
                    errors: errCount,
                    success: successCount,
                    startTime: prev.startTime,
                    elapsedTime: Date.now() - prev.startTime
                  }));
                  
                  console.log(`📈 UI asistencia actualizada: ${percent}% (${processed}/${safTotal} registros, ${errCount} errores)`);
                  
                  if (data.status === 'completed' || data.status === 'failed') {
                    console.log('✅ Carga de asistencia completada, actualizando UI...');
                    // 🔧 FIX: Actualizar phase a 'completado' o 'error' para que canClose funcione
                    setAttendanceProgress(prev => ({
                      ...prev,
                      current: saved,
                      total: safTotal,
                      phase: data.status === 'completed' ? 'completado' : 'error',
                      logs: [
                        ...prev.logs,
                        data.status === 'completed' 
                          ? `✅ ${t('uploadComplete', 'Carga completada')}: ${saved} ${t('records', 'registros')}`
                          : `❌ ${t('uploadFailed', 'Error en la carga')}`
                      ].slice(-50),
                      errors: errCount,
                      success: successCount,
                      elapsedTime: Date.now() - prev.startTime
                    }));
                    setTimeout(() => {
                      const unsub = progressUnsubscribe;
                      if (unsub && typeof unsub === 'function') {
                        try {
                          unsub();
                        } catch (err) {
                          console.warn('⚠️ Error al detener listener:', err);
                        }
                      }
                      progressUnsubscribe = undefined;
                    }, 2000);
                  }
                }
              }, (error) => {
                console.error('❌ Error en listener de progreso de asistencia:', error);
              });
            } catch (error) {
              console.error('❌ Error configurando listener de progreso de asistencia:', error);
              // No lanzar error - el listener es opcional, la carga puede continuar sin él
            }
          };
          
          // Iniciar listener antes de enviar el archivo (NO bloquea si falla)
          // Usamos .catch() para que el error no detenga la carga principal
          setupProgressListener().catch((err) => {
            console.warn('⚠️ No se pudo configurar el listener de progreso en tiempo real:', err.message);
            console.warn('⚠️ La carga continuará sin monitoreo en tiempo real');
            // 🔧 FIX: Informar al usuario que el monitoreo en tiempo real no está disponible
            setAttendanceProgress(prev => ({
              ...prev,
              logs: [
                ...prev.logs,
                '⚠️ Monitoreo en tiempo real no disponible',
                '📡 Subiendo archivo... esperando respuesta del servidor'
              ].slice(-50)
            }));
          });
          
          console.log('📡 Enviando fetch a /api/firebase/bulk-upload-attendance...');
          
          // 🔧 FIX: Actualizar progreso para mostrar que está subiendo
          setAttendanceProgress(prev => ({
            ...prev,
            phase: '📤 Subiendo archivo al servidor...',
            logs: [...prev.logs, '📤 Enviando archivo al servidor...'].slice(-50)
          }));
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('⏱️ Request timeout después de 15 minutos');
          }, 900000);
          
          let response;
          try {
            response = await fetch('/api/firebase/bulk-upload-attendance', {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            console.error('❌ Error en fetch de asistencia:', fetchError);
            
            // 🔧 FIX: Actualizar progreso con el error para que el usuario lo vea
            const errorMsg = fetchError.name === 'AbortError' 
              ? t('uploadTimeout', 'La carga tomó demasiado tiempo y fue cancelada (timeout de 15 minutos).')
              : `${t('networkError', 'Error de red al conectar con el servidor')}: ${fetchError.message}`;
            
            setAttendanceProgress(prev => ({
              ...prev,
              phase: `❌ ${errorMsg}`,
              logs: [...prev.logs, `❌ Error de conexión: ${fetchError.message}`].slice(-50)
            }));
            
            throw new Error(errorMsg);
          }
          
          console.log('📨 Respuesta de asistencia recibida, status:', response.status);
          
          const responseClone = response.clone();
          
          if (!response.ok) {
            let errorMessage = t('uploadProcessError', 'Error al procesar la carga');
            let errorDetails = null;
            
            try {
              const error = await responseClone.json();
              errorMessage = error.error || error.message || errorMessage;
              errorDetails = error.details || null;
              console.error('❌ Error del servidor de asistencia (JSON):', error);
            } catch (jsonError) {
              try {
                const textError = await response.text();
                errorMessage = textError || errorMessage;
              } catch (textError) {
                console.warn('⚠️ No se pudo leer la respuesta:', textError);
              }
            }
            
            // 🔧 NO lanzar error - el procesamiento puede continuar via Firestore listener
            // Mostrar advertencia pero mantener el modal abierto para monitorear progreso
            console.warn('⚠️ Respuesta HTTP no-ok, pero el procesamiento puede continuar via Firestore');
            
            setAttendanceProgress(prev => ({
              ...prev,
              phase: `⚠️ Error HTTP (${response.status}): ${errorMessage.substring(0, 100)}... Monitoreando progreso...`,
              logs: [
                ...prev.logs,
                `⚠️ Error HTTP ${response.status}: ${errorMessage.substring(0, 150)}`,
                '⏳ El procesamiento puede continuar en el servidor...',
                '📊 Monitoreando progreso via Firestore...'
              ].slice(-50)
            }));
            
            toast({
              title: '⚠️ ' + t('httpError', 'Error de respuesta HTTP'),
              description: `${errorMessage.substring(0, 100)}... El procesamiento puede continuar en segundo plano.`,
              variant: 'destructive',
            });
            
            // NO lanzar error - dejar que el listener de Firestore continúe monitoreando
            e.target.value = '';
            return;
          }
          
          let result: any = null;
          try {
            const responseText = await response.text();
            console.log('📝 Respuesta de asistencia en texto (primeros 200 chars):', responseText.substring(0, 200));
            if (responseText && responseText.trim().length > 0) {
              // Verificar si es HTML en lugar de JSON
              if (responseText.trim().startsWith('<')) {
                console.error('❌ Respuesta OK pero contiene HTML en lugar de JSON');
                throw new Error(t('serverReturnedHtml', 'El servidor devolvió una respuesta inesperada. Por favor, recarga la página e intenta nuevamente.'));
              }
              try { result = JSON.parse(responseText); } catch (parseErr) {
                console.error('❌ Error parseando JSON de asistencia:', parseErr);
              }
            }
          } catch (parseError: any) {
            console.warn('⚠️ No se pudo leer el cuerpo de la respuesta de asistencia:', parseError?.message || parseError);
            // Re-lanzar si es un error que creamos nosotros
            if (parseError?.message?.includes('servidor')) {
              throw parseError;
            }
          }

          if (!result) {
            console.warn('⚠️ Respuesta sin JSON válido. Mantener modal abierto para monitoreo...');
            setAttendanceProgress(prev => ({ 
              ...prev, 
              phase: t('monitoringProgress', 'Procesando en servidor... Monitoreando progreso...'),
              logs: [...prev.logs, '⚙️ Procesando en servidor...'].slice(-50)
            }));
            e.target.value = '';
            return;
          }
          
          console.log('✅ Respuesta de asistencia recibida del servidor:', result);
          const finalSaved = (result.saved ?? result.processed) || 0;
          const finalErrors = result.totalErrors || result.errors || 0;
          setAttendanceProgress(prev => ({ 
            current: finalSaved, 
            total: finalSaved || 1, 
            phase: 'completado',
            logs: [
              ...prev.logs,
              `✅ Carga completada: ${finalSaved} registros`,
              ...(finalErrors > 0 ? [`⚠️ Total de errores: ${finalErrors}`] : ['✅ Sin errores']),
              // 🔧 MEJORA: Mostrar desglose por año si existe
              ...(result.savedByYear ? [`📅 Por año: ${Object.entries(result.savedByYear).map(([y, c]) => `${y}: ${c}`).join(', ')}`] : []),
              '🔄 Actualizando contadores...'
            ],
            errors: finalErrors,
            success: finalSaved - finalErrors,
            startTime: prev.startTime,
            elapsedTime: Date.now() - prev.startTime
          }));
          
          toast({
            title: result.totalErrors > 0 ? t('partialUploadComplete', 'Carga parcial completada') : t('uploadComplete', 'Carga completada'),
            description: result.message,
            variant: result.totalErrors > 0 ? 'destructive' : 'default'
          });
          
          // 🔧 MEJORA: Actualizar contadores para todos los años procesados
          console.log('🔄 Actualizando contadores de asistencia desde Firebase...');
          try {
            // Siempre actualizar el año seleccionado
            await getFirebaseAttendanceCounters(selectedYear);
            
            // Si el resultado incluye años procesados, actualizar cada uno
            if (result.savedByYear && typeof result.savedByYear === 'object') {
              const processedYears = Object.keys(result.savedByYear).map(Number).filter(y => y !== selectedYear);
              for (const yr of processedYears) {
                console.log(`🔄 Actualizando contador para año ${yr}...`);
                await getFirebaseAttendanceCounters(yr);
              }
            }
            
            console.log('✅ Contadores de asistencia de Firebase actualizados correctamente');
          } catch (countError) {
            console.error('⚠️ Error al actualizar contadores de asistencia:', countError);
          }
          
          // 🔧 FIX: No cerrar automáticamente - dejar que el usuario cierre con el botón
          // El modal mostrará el botón "Cerrar" porque phase='completado'
          console.log('✅ Carga de asistencia completada. El usuario puede cerrar el modal.');

        } catch (error: any) {
          console.error('❌ Error en carga Firebase de asistencia:', error);
          
          // 🔧 No cerrar el modal inmediatamente - el procesamiento puede continuar en el servidor
          // Mostrar el error en el progreso y permitir que el usuario vea si continúa
          setAttendanceProgress(prev => ({
            ...prev,
            phase: `⚠️ Error HTTP: ${error?.message || 'Error desconocido'}. El procesamiento puede continuar en el servidor...`,
            logs: [
              ...prev.logs,
              `❌ Error: ${error?.message || 'Error desconocido'}`,
              '⏳ Monitoreando si el procesamiento continúa en el servidor...'
            ].slice(-50)
          }));
          
          toast({
            title: t('attendanceUploadError', 'Error en carga asistencia'),
            description: `${error?.message || t('checkCSVFormat', 'Revisa el formato del archivo CSV')}. El procesamiento puede continuar en segundo plano.`,
            variant: 'destructive',
          });
          
          // No cerrar el modal - dejar que el listener de Firestore actualice el progreso
          // Si después de 10 segundos no hay progreso, cerrar automáticamente
          setTimeout(() => {
            setAttendanceProgress(prev => {
              // Si el progreso está en 0 o no ha avanzado, cerrar el modal
              if (prev.current === 0 || prev.phase.includes('⚠️ Error HTTP')) {
                console.log('⏱️ Sin progreso después del error, cerrando modal...');
                setShowAttendanceSQLModal(false);
                return { 
                  current: 0, 
                  total: 0, 
                  phase: 'Esperando archivo',
                  logs: [],
                  errors: 0,
                  success: 0,
                  startTime: 0,
                  elapsedTime: 0
                };
              }
              // Si hay progreso, mantener el modal abierto
              console.log('📊 Hay progreso después del error, manteniendo modal abierto');
              return prev;
            });
          }, 10000);
        }
      } else {
        // Modo SQL / IndexedDB: parsear CSV en cliente y enviar a hook
        console.log('🗄️ SQL/IndexedDB habilitado - Procesando CSV de asistencia en cliente');
        
        // 🔧 FIX: Actualizar progreso inmediatamente para que el usuario vea que está procesando
        setAttendanceProgress(prev => ({
          ...prev,
          phase: 'Leyendo archivo CSV...',
          logs: [...prev.logs, '📂 Leyendo contenido del archivo...'].slice(-50)
        }));
        
        try {
          // Asegurar conexión mínima
          try { await checkConnection(); } catch {}

          const text = await file.text();
          console.log('📄 Archivo leído, tamaño:', text.length, 'caracteres');
          
          // 🔧 FIX: Actualizar progreso después de leer el archivo
          setAttendanceProgress(prev => ({
            ...prev,
            phase: 'Analizando CSV...',
            logs: [...prev.logs, `📄 Archivo leído: ${text.length} caracteres`].slice(-50)
          }));
          
          const { headers, rows } = parseCSVforSQL(text);
          console.log('📄 CSV de asistencia leído para SQL:', { headers, sample: rows.slice(0, 2) });

          // Ayudantes locales
          const toId = (s: string | null | undefined): string | null => {
            if (!s) return null;
            return String(s).toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '');
          };
          const parseDate = (input: string): Date | null => {
            const s = String(input || '').trim();
            if (!s) return null;
            const t = s.replaceAll('.', '/').replaceAll('-', '/');
            const ymd = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
            const dmy = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
            let iso = '';
            if (ymd.test(t)) iso = t.replaceAll('/', '-');
            else if (dmy.test(t)) {
              const [d, m, y] = t.split('/');
              iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            } else {
              const d = new Date(s);
              if (!isNaN(d.getTime())) return d; else return null;
            }
            const d = new Date(iso);
            return isNaN(d.getTime()) ? null : d;
          };

          // Actualizar progreso
          const uploadStartTime = Date.now();
          setAttendanceProgress(prev => ({
            ...prev,
            current: 0,
            total: rows.length,
            phase: t('parsingCSV', 'Procesando CSV...'),
            logs: [...prev.logs, `📄 ${rows.length} filas encontradas en CSV`].slice(-50),
            errors: 0,
            success: 0,
            startTime: prev.startTime || uploadStartTime, // Preservar el startTime original
            elapsedTime: 0
          }));

          // Mapear filas a AttendanceRecord[]
          const list: any[] = [];
          let parseErrors = 0;
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i] as any;
            // Columnas esperadas: fecha, rut/studentId, curso, seccion, estado/status, comentario (opcional)
            const fechaStr = r['fecha'] || r['date'] || '';
            const rut = r['rut'] || r['studentid'] || r['student_id'] || r['id'] || '';
            const nombre = r['nombre'] || r['student'] || r['studentname'] || r['student_name'] || '';
            const curso = r['curso'] || r['course'] || r['courseid'] || r['course_id'] || '';
            const seccion = r['seccion'] || r['section'] || r['sectionid'] || r['section_id'] || '';
            const estadoStr = (r['estado'] || r['status'] || 'present').toString().toLowerCase().trim();
            const comentario = r['comentario'] || r['comment'] || r['observacion'] || '';

            if (!fechaStr || !rut) {
              parseErrors++;
              continue;
            }
            const date = parseDate(fechaStr);
            if (!date) {
              parseErrors++;
              continue;
            }

            // Normalizar estado
            let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
            if (['absent', 'ausente', 'a', 'falta', '0', 'no'].includes(estadoStr)) {
              status = 'absent';
            } else if (['late', 'tarde', 'atrasado', 't', 'atraso'].includes(estadoStr)) {
              status = 'late';
            } else if (['excused', 'justificado', 'j', 'excusa', 'justificada'].includes(estadoStr)) {
              status = 'excused';
            } else if (['present', 'presente', 'p', '1', 'si', 'sí', 'yes'].includes(estadoStr)) {
              status = 'present';
            }

            const courseId = toId(curso);
            const sectionId = toId(seccion);
            const iso = date.toISOString();
            const ymd = iso.slice(0, 10);
            const year = date.getFullYear();
            const nowIso = new Date().toISOString();
            const id = toId(`${rut}_${courseId || 'all'}_${ymd}`)!;

            list.push({
              id,
              date: iso,
              courseId,
              sectionId,
              studentId: String(rut),
              studentName: nombre || rut,
              status,
              present: status === 'present' || status === 'late',
              comment: comentario || null,
              createdAt: nowIso,
              updatedAt: nowIso,
              year: year || selectedYear,
            });

            // Actualizar progreso cada 500 registros
            if (i > 0 && i % 500 === 0) {
              setAttendanceProgress(prev => ({
                ...prev,
                current: i,
                phase: `${t('parsing', 'Parseando')} ${i}/${rows.length}...`,
                elapsedTime: Date.now() - uploadStartTime
              }));
            }
          }

          if (list.length === 0) {
            throw new Error(t('noValidRows', 'No se encontraron filas válidas en el CSV. Verifica que tenga las columnas requeridas: fecha, rut, curso, seccion, estado.'));
          }

          console.log(`🧮 Registros de asistencia construidos para SQL: ${list.length}`);
          setAttendanceProgress(prev => ({
            ...prev,
            current: 0,
            total: list.length,
            phase: t('uploadingToSQL', 'Subiendo a base de datos local...'),
            logs: [...prev.logs, `✅ ${list.length} registros válidos`, parseErrors > 0 ? `⚠️ ${parseErrors} filas ignoradas` : ''],
            elapsedTime: Date.now() - uploadStartTime
          }));

          // Subir a IndexedDB
          const ok = await uploadAttendanceToSQL(list as any);
          
          if (ok) {
            // Actualizar contadores
            await countAttendanceByYear(selectedYear);
            await countAllAttendance();
            
            setAttendanceProgress(prev => ({
              ...prev,
              current: list.length,
              total: list.length,
              phase: 'completado', // 🔧 FIX: Usar valor exacto para que canClose detecte correctamente
              logs: [...prev.logs, `✅ ${list.length} registros guardados en IndexedDB`].slice(-50),
              success: list.length,
              elapsedTime: Date.now() - (prev.startTime || uploadStartTime)
            }));
            
            toast({ 
              title: t('uploadComplete', 'Carga completada'), 
              description: `${list.length} ${t('attendanceRecords', 'registros de asistencia')}`, 
              variant: 'default' 
            });
            
            // 🔧 FIX: NO cerrar automáticamente - dejar que el usuario vea el resultado y cierre con el botón
            // El modal mostrará el botón "Cerrar" porque phase='completado'
            console.log('✅ Carga SQL de asistencia completada. El usuario puede cerrar el modal.');
          } else {
            throw new Error(t('uploadFailed', 'Error al guardar en base de datos'));
          }
        } catch (err: any) {
          console.error('❌ Error en modo SQL asistencia:', err);
          setAttendanceProgress(prev => ({
            ...prev,
            phase: `❌ Error: ${err?.message || 'Error desconocido'}`,
            logs: [...prev.logs, `❌ ${err?.message || 'CSV inválido'}`]
          }));
          toast({ 
            title: t('sqlUploadError', 'Error en carga SQL'), 
            description: err?.message || 'CSV inválido', 
            variant: 'destructive' 
          });
          setTimeout(() => {
            setShowAttendanceSQLModal(false);
          }, 3000);
        }
      }
    } catch (e: any) {
      console.error('❌ Error en carga asistencia:', e);
      
      // 🔧 Mostrar error pero no cerrar inmediatamente - el procesamiento puede continuar
      setAttendanceProgress(prev => ({
        ...prev,
        phase: `⚠️ Error: ${e?.message || 'Error desconocido'}. Verificando si continúa...`,
        logs: [
          ...prev.logs,
          `❌ Error externo: ${e?.message || 'Error desconocido'}`,
          '⏳ Verificando si el procesamiento continúa...'
        ].slice(-50)
      }));
      
      toast({
        title: t('attendanceUploadError', 'Error en carga asistencia'),
        description: `${e?.message || t('checkCSVFormat', 'Revisa el formato del archivo CSV')}`,
        variant: 'destructive',
      });
      
      // Esperar 5 segundos antes de cerrar para ver si hay progreso
      setTimeout(() => {
        setAttendanceProgress(prev => {
          if (prev.current === 0) {
            setShowAttendanceSQLModal(false);
            return { 
              current: 0, total: 0, phase: 'Esperando archivo',
              logs: [], errors: 0, success: 0, startTime: 0, elapsedTime: 0
            };
          }
          return prev;
        });
      }, 5000);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Panel de Estado: Configuración Completada Firebase + LocalStorage */}
      {isFirebaseMode && (
        <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-6 h-6 mr-2" />
              ✅ {translate('firebaseConfigCompleted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Firebase Credentials */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-200 mb-1">
                      🔥 {translate('firebaseCredentials')}
                    </h4>
                    <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                      <li>✓ {translate('firebaseApiKeyConfigured')}</li>
                      <li>✓ {translate('firebaseServiceAccountConfigured')}</li>
                      <li>✓ {translate('firebaseProject')}: <code className="bg-emerald-100 dark:bg-emerald-900 px-1 rounded">superjf1234-e9cbc</code></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* LocalStorage Cache */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-1">
                      💾 {translate('localStorageAsCache')}
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>✓ {translate('localStorageInstantLoad')}</li>
                      <li>✓ {translate('localStorageBackgroundSync')}</li>
                      <li>✓ {translate('localStorageNoRepeatQueries')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Optimizaciones */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-purple-800 dark:text-purple-200 mb-1">
                      ⚡ {translate('firebaseOptimizations')}
                    </h4>
                    <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                      <li>✓ {translate('firebaseAutoQueriesDisabled')}</li>
                      <li>✓ {translate('firebaseFiltersFixed')}</li>
                      <li>✓ {translate('firebaseWebpackStable')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagrama de Flujo */}
            <div className="mt-4 bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                {translate('firebaseHowItWorks')}
              </h4>
              <div className="flex items-center justify-between text-xs">
                <div className="flex-1 text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 mb-2">
                    <div className="font-semibold text-blue-800 dark:text-blue-200">1. {translate('firebaseStep1')}</div>
                  </div>
                </div>
                <div className="px-2 text-slate-400">→</div>
                <div className="flex-1 text-center">
                  <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 mb-2">
                    <div className="font-semibold text-green-800 dark:text-green-200">2. {translate('firebaseStep2')}</div>
                    <div className="text-green-600 dark:text-green-400 text-[10px]">{translate('firebaseStep2Detail')}</div>
                  </div>
                </div>
                <div className="px-2 text-slate-400">→</div>
                <div className="flex-1 text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 mb-2">
                    <div className="font-semibold text-purple-800 dark:text-purple-200">3. {translate('firebaseStep3')}</div>
                    <div className="text-purple-600 dark:text-purple-400 text-[10px]">{translate('firebaseStep3Detail')}</div>
                  </div>
                </div>
                <div className="px-2 text-slate-400">→</div>
                <div className="flex-1 text-center">
                  <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3 mb-2">
                    <div className="font-semibold text-amber-800 dark:text-amber-200">4. {translate('firebaseStep4')}</div>
                    <div className="text-amber-600 dark:text-amber-400 text-[10px]">{translate('firebaseStep4Detail')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Proyecto */}
            <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{translate('firebaseProjectId')}:</span>
                <code className="font-mono">superjf1234-e9cbc</code>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{translate('firebaseProjectNumber')}:</span>
                <code className="font-mono">742753294911</code>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selector de Año */}
      <div className="flex items-center justify-end gap-2 mb-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm text-muted-foreground">
          {t('calendarYear', 'Año')}:
        </Label>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(y => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card: Carga Masiva de Calificaciones */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center w-full">
              <Database className="w-5 h-5 mr-2" />
              {isFirebaseMode
                ? t('configBulkTasksEvaluationsTitleFirebase', 'Carga masiva: Calificaciones (Firebase)')
                : t('configBulkTasksEvaluationsTitle', 'Carga masiva: Calificaciones (SQL)')}
              <span
                className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded border ${
                  dbProvider === 'firebase'
                    ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-400/40'
                    : isSQLConnected
                    ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                    : 'bg-red-600/20 text-red-700 dark:text-red-300 border-red-400/40'
                }`}
                title={
                  dbProvider === 'firebase'
                    ? 'Firebase + LocalStorage (IndexedDB fallback)'
                    : isSQLConnected
                    ? t('sqlConnected', 'SQL Conectado (Supabase)')
                    : t('sqlDisconnected', 'SQL Desconectado')
                }
              >
                {dbProvider === 'firebase' ? '🔥 Firebase + LS' : isSQLConnected ? '✅ SQL' : '❌ SQL'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg flex flex-col h-full">
              <p className="text-sm text-muted-foreground mb-3">
                {isFirebaseMode
                  ? t(
                      'configBulkTasksEvaluationsDescFirebase',
                      '🔥 Registra calificaciones directamente en Firebase (Firestore). Monitoreo en tiempo real y actualización automática de contadores.'
                    )
                  : t(
                      'configBulkTasksEvaluationsDesc',
                      '🗄️ Registra calificaciones directamente en la base de datos SQL. Ventana con focus permanente, logs y cronómetro hasta completar la carga.'
                    )}
              </p>

              {/* Aviso de migración SQL */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    {isFirebaseMode ? (
                      <>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                          {t('firebaseModeTitle', 'Modo Firebase activo')}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {t(
                            'firebaseModeDesc',
                            'Las calificaciones se guardan en Firestore y los contadores se consultan vía endpoints Admin con agregaciones count().'
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                          {t('sqlMigrationTitle', 'Migración SQL Completada')}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {t(
                            'sqlMigrationDesc',
                            'Las calificaciones ahora se guardan en base de datos SQL para evitar límites de almacenamiento LocalStorage y mejorar el rendimiento.'
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contador de calificaciones cargadas */}
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {isFirebaseMode ? t('gradesCounterFirebase', 'Calificaciones en Firebase') : t('gradesCounter', 'Calificaciones en SQL')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      <strong>{selectedYear}:</strong>{' '}
                      {(
                        firebaseYearCountOverride ??
                        (gradesCount?.year === selectedYear ? gradesCount.count : 0)
                      ).toLocaleString()}{' '}
                      {t('records', 'registros')}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 border-l border-emerald-300 pl-3">
                      <strong>Total:</strong> {(firebaseTotalOverride ?? totalGrades ?? 0).toLocaleString()}{' '}
                      {t('records', 'registros')}
                    </span>
                    <button
                      onClick={handleRefreshCounters}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded transition-colors"
                      title={t('refresh', 'Actualizar')}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('refresh', 'Actualizar')}
                    </button>
                  </div>
                </div>
                {Number(
                  firebaseYearCountOverride ?? (gradesCount?.year === selectedYear ? gradesCount.count : 0)
                ) === 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                    {t('noGradesFound', 'No hay calificaciones cargadas para este año')}
                  </p>
                )}
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleUploadGradesSQL}
                className="hidden"
                id="sql-grades-file"
              />

              {/* Modal de progreso SQL */}
              <GradesImportProgress
                open={showSQLModal}
                progress={
                  showSQLModal && gradesProgress.phase !== 'Esperando archivo'
                    ? {
                        current: Number(gradesProgress.current) || 0,
                        total: Number(gradesProgress.total) || Number(gradesProgress.current) || 1,
                        phase: gradesProgress.phase,
                        errors: Number(gradesProgress.errors) || 0,
                        created: Number(gradesProgress.created) || 0, // Registros realmente guardados
                        message: gradesProgress.phase,
                        percent:
                          (Number(gradesProgress.total) || 0) > 0
                            ? Math.round((Number(gradesProgress.current) / Math.max(1, Number(gradesProgress.total))) * 100)
                            : 0,
                        logs: gradesProgress.logs || [],
                        startTime: gradesProgress.startTime || Date.now(),
                      }
                    : (sqlProgress as any)
                }
                onClose={async () => {
                  console.log('🔄 Cerrando modal de calificaciones y actualizando contadores...');
                  setShowSQLModal(false);
                  
                  // 🔧 FIX: Actualizar contadores y overrides
                  try {
                    const yearResult = await countGradesByYear(selectedYear);
                    const totalResult = await countAllGrades();
                    
                    console.log('📊 Contadores actualizados:', { yearResult, totalResult });
                    
                    // Actualizar overrides para que la UI se actualice inmediatamente
                    if (yearResult && yearResult.count !== undefined) {
                      setFirebaseYearCountOverride(yearResult.count);
                      localStorage.setItem(`grades-counter-year-${selectedYear}`, String(yearResult.count));
                    }
                    if (totalResult && totalResult.total !== undefined) {
                      setFirebaseTotalOverride(totalResult.total);
                      localStorage.setItem('grades-counter-total', String(totalResult.total));
                    }
                    
                    console.log('✅ Contadores de calificaciones actualizados');
                  } catch (e) {
                    console.warn('⚠️ Error actualizando contadores:', e);
                  }
                  
                  // 🔧 FIX: Resetear el progreso local
                  setGradesProgress({
                    current: 0,
                    total: 0,
                    created: 0,
                    errors: 0,
                    phase: 'Esperando archivo',
                    logs: [],
                    startTime: 0,
                  });
                  try {
                    resetProgress();
                  } catch {}
                }}
                title={t('sqlGradesImportTitle', '🗄️ Carga Masiva: Calificaciones → SQL')}
              />

              <GradesDeleteProgress
                open={showDeleteSQLProgress}
                onOpenChange={(v) => {
                  setShowDeleteSQLProgress(v);
                  if (!v) {
                    setIsDeletingAllGrades(false);
                    try {
                      resetDeleteProgress();
                    } catch {}
                  }
                }}
                year={isDeletingAllGrades ? null : selectedYear}
                progress={sqlDeleteProgress as any}
              />

              <div className="mt-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button
                    onClick={downloadGradesTemplate}
                    variant="outline"
                    className="h-11 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/40 dark:hover:text-amber-200"
                    title={t('downloadTemplate', 'Descargar Plantilla CSV')}
                  >
                    <Download className="w-4 h-4 mr-2" /> {t('downloadTemplate', 'Plantilla CSV')}
                  </Button>
                  <Button
                    onClick={() => document.getElementById('sql-grades-file')?.click()}
                    variant="outline"
                    disabled={isSQLUploading}
                    className="h-11 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900/40 dark:hover:text-green-200"
                    title={isFirebaseMode ? t('uploadToFirebase', 'Subir Calificaciones a Firebase') : t('uploadToSQL', 'Subir Calificaciones a SQL')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isSQLUploading
                      ? t('processing', 'Procesando...')
                      : (isFirebaseMode ? t('uploadToFirebaseShort', 'Subir a Firebase') : t('uploadToSQL', 'Subir a SQL'))}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button
                    onClick={exportStudentAssignmentsExcel}
                    variant="outline"
                    className="h-11 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"
                    title={t('downloadAssignments', 'Descargar Asignaciones')}
                  >
                    <Download className="w-4 h-4 mr-2" /> {t('downloadAssignments', 'Descargar')}
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDeleteGradesByYear(true)}
                    variant="outline"
                    disabled={isSQLUploading}
                    className="h-11 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-900/40 dark:hover:text-red-200"
                    title={t('deleteSQLGradesByYear', `Borrar calificaciones del año ${selectedYear}`)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> {t('deleteSQL', 'Borrar SQL')}
                  </Button>
                </div>

                {/* Estado de conexión SQL/Firebase */}
                <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  <span>{t('sqlStatus', 'Estado')}: </span>
                  <span
                    className={
                      isFirebaseMode
                        ? 'text-amber-600'
                        : isSQLConnected
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {isFirebaseMode
                      ? '🔥 Firebase + LocalStorage'
                      : isSQLConnected
                      ? (isIDBMode ? '✅ Local SQL (IndexedDB)' : t('connected', '✅ SQL (Supabase)'))
                      : t('disconnected', '❌ Desconectado')}
                  </span>
                  <span>• {t('year', 'Año')}: {selectedYear}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Carga Masiva de Asistencia */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center w-full">
              <Database className="w-5 h-5 mr-2" />
              {isFirebaseMode
                ? t('configBulkAttendanceTitleFirebase', 'Carga masiva: Asistencia (Firebase)')
                : t('configBulkAttendanceTitle', 'Carga masiva: Asistencia (SQL)')}
              <span
                className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded border ${
                  dbProvider === 'firebase'
                    ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-400/40'
                    : isAttendanceSQLConnected
                    ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                    : 'bg-red-600/20 text-red-700 dark:text-red-300 border-red-400/40'
                }`}
                title={
                  dbProvider === 'firebase'
                    ? 'Firebase + LocalStorage (IndexedDB fallback)'
                    : isAttendanceSQLConnected
                    ? (isIDBMode ? 'Local SQL (IndexedDB)' : t('sqlConnected', 'SQL Conectado (Supabase)'))
                    : t('sqlDisconnected', 'SQL Desconectado')
                }
              >
        {isFirebaseMode ? '🔥 Firebase + LS' : isAttendanceSQLConnected ? (isIDBMode ? '✅ SQL' : '✅ SQL') : '❌ SQL'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg flex flex-col h-full">
              <p className="text-sm text-muted-foreground mb-3">
                {t(
                  'configBulkAttendanceDesc',
                  '🗄️ Administra registros de asistencia en la base de datos SQL. Incluye confirmación y progreso al borrar por año.'
                )}
              </p>

              {/* Aviso de migración SQL */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      {t('sqlMigrationTitle', 'Migración SQL Completada')}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {t(
                        'sqlAttendanceMigrationDesc',
                        'La asistencia ahora se guarda en base de datos SQL para evitar límites de almacenamiento LocalStorage y mejorar el rendimiento.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contador de asistencia cargada */}
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {isFirebaseMode ? t('attendanceCounterFirebase', 'Asistencia en Firebase') : t('attendanceCounter', 'Asistencia en SQL')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      <strong>{selectedYear}:</strong>{' '}
                      {(
                        attendanceYearCountOverride ??
                        (attYearCount?.year === selectedYear ? attYearCount.count : 0)
                      ).toLocaleString()}{' '}
                      {t('records', 'registros')}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 border-l border-emerald-300 pl-3">
                      <strong>Total:</strong> {(attendanceTotalOverride ?? attTotal ?? 0).toLocaleString()}{' '}
                      {t('records', 'registros')}
                    </span>
                    <button
                      onClick={handleRefreshAttendanceCounters}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded transition-colors"
                      title={t('refresh', 'Actualizar')}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('refresh', 'Actualizar')}
                    </button>
                  </div>
                </div>
                {/* 🔴 Mensaje de error de autenticación Firebase */}
                {firebaseAuthError && isFirebaseMode && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-md">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-red-700 dark:text-red-300">
                          Error de autenticación Firebase Admin
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                          {firebaseAuthError}
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          💡 Ve a <strong>Firebase Console → Configuración del proyecto → Cuentas de servicio</strong> y genera una nueva clave privada.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {Number(
                  attendanceYearCountOverride ?? (attYearCount?.year === selectedYear ? attYearCount.count : 0)
                ) === 0 && !firebaseAuthError && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                    {t('noAttendanceFound', 'No hay asistencia cargada para este año')}
                  </p>
                )}
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleUploadAttendanceSQL}
                className="hidden"
                id="sql-attendance-file"
              />

              {/* Modales SQL para Asistencia */}
              <GradesImportProgress
                open={showAttendanceSQLModal}
                progress={attendanceProgress as any}
                onClose={async () => {
                  console.log('🔄 Cerrando modal de asistencia y actualizando contadores...');
                  setShowAttendanceSQLModal(false);
                  
                  // 🔧 FIX: Actualizar contadores y overrides ANTES de resetear el progreso
                  try {
                    const yearResult = await countAttendanceByYear(selectedYear);
                    const totalResult = await countAllAttendance();
                    
                    console.log('📊 Contadores de asistencia actualizados:', { yearResult, totalResult });
                    
                    // Actualizar overrides para que la UI se actualice inmediatamente
                    if (yearResult && yearResult.count !== undefined) {
                      setAttendanceYearCountOverride(yearResult.count);
                      localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(yearResult.count));
                    }
                    if (totalResult && totalResult.total !== undefined) {
                      setAttendanceTotalOverride(totalResult.total);
                      localStorage.setItem('attendance-counter-total', String(totalResult.total));
                    }
                    
                    console.log('✅ Contadores de asistencia actualizados');
                  } catch (e) {
                    console.warn('⚠️ Error actualizando contadores:', e);
                  }
                  
                  // 🔧 FIX: Resetear el progreso local
                  setAttendanceProgress({
                    current: 0,
                    total: 0,
                    phase: 'Esperando archivo',
                    logs: [],
                    errors: 0,
                    success: 0,
                    startTime: 0,
                    elapsedTime: 0
                  });
                  try {
                    resetAttProgress();
                  } catch {}
                }}
                title={isFirebaseMode 
                  ? '📦 Carga Masiva: Asistencia → Firebase' 
                  : t('sqlAttendanceImportTitle', '🗄️ Carga Masiva: Asistencia → SQL')
                }
                kind="attendance"
              />

              <GradesDeleteProgress
                open={showAttendanceDeleteSQLProgress}
                onOpenChange={(v) => {
                  setShowAttendanceDeleteSQLProgress(v);
                  if (!v) {
                    try {
                      resetAttDeleteProgress();
                    } catch {}
                  }
                }}
                year={selectedYear}
                progress={attDeleteProgress as any}
              />

              {/* Acciones básicas */}
              <div className="mt-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button
                    onClick={downloadAttendanceTemplate}
                    variant="outline"
                    className="h-11 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/40 dark:hover:text-amber-200"
                    title={t('downloadTemplate', 'Descargar Plantilla CSV')}
                  >
                    <Download className="w-4 h-4 mr-2" /> {t('downloadTemplate', 'Plantilla CSV')}
                  </Button>
                  <Button
                    onClick={() => document.getElementById('sql-attendance-file')?.click()}
                    variant="outline"
                    disabled={isAttSQLUploading}
                    className="h-11 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900/40 dark:hover:text-green-200"
                    title={isFirebaseMode ? t('uploadToFirebase', 'Subir Asistencia a Firebase') : t('uploadToSQL', 'Subir Asistencia a SQL')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isAttSQLUploading ? t('processing', 'Procesando...') : (isFirebaseMode ? t('uploadToFirebaseShort', 'Subir a Firebase') : t('uploadToSQL', 'Subir a SQL'))}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button
                    onClick={downloadAttendanceStudentsTemplate}
                    variant="outline"
                    className="h-11 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"
                    title={t('downloadAttendanceStudents', 'Descargar Plantilla Estudiantes')}
                  >
                    <Download className="w-4 h-4 mr-2" /> {t('downloadAttendanceStudents', 'Descargar')}
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDeleteAttendanceSQL(true)}
                    variant="outline"
                    disabled={isAttSQLUploading}
                    className="h-11 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-900/40 dark:hover:text-red-200"
                    title={t('deleteSQLAttendance', 'Borrar Asistencia SQL (Año)')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> {t('deleteSQL', 'Borrar SQL')}
                  </Button>
                </div>
                


                {/* Estado de conexión SQL/Firebase */}
                <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  <span>{t('sqlStatus', 'Estado')}: </span>
                  <span
                    className={
                      dbProvider === 'firebase'
                        ? 'text-amber-600'
                        : isAttendanceSQLConnected
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {isFirebaseMode
                      ? '🔥 Firebase + LocalStorage'
                      : isAttendanceSQLConnected
                      ? (isIDBMode ? '✅ Local SQL (IndexedDB)' : t('connected', '✅ SQL (Supabase)'))
                      : t('disconnected', '❌ Desconectado')}
                  </span>
                  <span>• {t('year', 'Año')}: {selectedYear}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AlertDialog de confirmación: Borrar TODAS las calificaciones */}
      <AlertDialog open={showConfirmDeleteAllSQL} onOpenChange={setShowConfirmDeleteAllSQL}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              {isFirebaseMode ? 'Confirmar Eliminación Total de Firebase' : 'Confirmar Eliminación de Calificaciones'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-3">
                <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    {isFirebaseMode
                      ? 'Esta acción eliminará TODOS los datos de carga masiva almacenados en Firebase:'
                      : 'Esta acción eliminará TODAS las calificaciones almacenadas localmente (IndexedDB):'}
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    <li>
                      <strong>TODOS los años</strong> (no solo {selectedYear})
                    </li>
                    {isFirebaseMode && (
                      <li>
                        <strong>Calificaciones y Actividades</strong> (todos los datos de carga masiva)
                      </li>
                    )}
                    <li>
                      Aproximadamente{' '}
                      <strong>{(firebaseTotalOverride ?? totalGrades ?? 0).toLocaleString()} registros</strong>
                    </li>
                    <li>
                      <strong>Esta acción NO se puede deshacer</strong>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground font-medium pt-2">
                  ¿Estás seguro de que deseas eliminar todos los registros?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/40">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={async () => {
                try {
                  setShowConfirmDeleteAllSQL(false);
                  setIsDeletingAllGrades(true);
                  setShowDeleteSQLProgress(true);
                  if (isFirebaseMode) {
                    console.log('🗑️ Iniciando eliminación total de Firebase...');
                    const result = await deleteAllSQLGrades();
                    if (result) {
                      await getFirebaseCounters(selectedYear);
                      toast({ title: '✅ Eliminación Completada', description: 'Todos los registros de Firebase (calificaciones y actividades) han sido eliminados exitosamente.', variant: 'default' });
                    } else {
                      toast({ title: '⚠️ Eliminación Incompleta', description: 'No se pudieron eliminar todos los registros. Revisa los logs.', variant: 'destructive' });
                    }
                  } else {
                    console.log('🗑️ Iniciando limpieza total de SQL/IndexedDB...');
                    try {
                      const cleared = await clearAllSQLData();
                      if (cleared) {
                        toast({ title: '✅ Base local reiniciada', description: 'Se limpiaron todos los registros locales (IndexedDB).', variant: 'default' });
                      } else {
                        toast({ title: '⚠️ No se pudo limpiar', description: 'Revisa los permisos del navegador o vuelve a intentarlo.', variant: 'destructive' });
                      }
                    } catch (e) {
                      toast({ title: '❌ Error', description: 'No se pudo limpiar la base local', variant: 'destructive' });
                    }
                  }
                } catch (e: any) {
                  console.error('❌ Error en eliminación total:', e);
                  toast({
                    title: '❌ Error',
                    description: `No se pudieron eliminar los registros: ${e?.message || 'Error desconocido'}`,
                    variant: 'destructive',
                  });
                } finally {
                  setTimeout(() => {
                    if (isFirebaseMode) { getFirebaseCounters(selectedYear); } else { countAllGrades(); }
                  }, 500);

                  setTimeout(() => {
                    setShowDeleteSQLProgress(false);
                    setIsDeletingAllGrades(false);
                  }, 2000);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sí, eliminar TODO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog de confirmación: Borrar Calificaciones por Año */}
      <AlertDialog open={showConfirmDeleteGradesByYear} onOpenChange={setShowConfirmDeleteGradesByYear}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              {t('confirmDeleteGradesByYearTitle', `Confirmar Eliminación de Calificaciones del Año ${selectedYear}`)}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-3">
                <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    {isFirebaseMode
                      ? t('deleteGradesByYearDescFirebase', `Se eliminarán de Firebase todas las calificaciones del año ${selectedYear}:`)
                      : t('deleteGradesByYearDescSQL', `Se eliminarán de la base de datos todas las calificaciones del año ${selectedYear}:`)}
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    <li>
                      {t('year', 'Año')}: <strong>{selectedYear}</strong>
                    </li>
                    <li>
                      {t('approximately', 'Aproximadamente')}{' '}
                      <strong>
                        {(
                          firebaseYearCountOverride ??
                          (gradesCount?.year === selectedYear ? gradesCount.count : 0)
                        ).toLocaleString()}{' '}
                        {t('records', 'registros')}
                      </strong>
                    </li>
                    <li>
                      <strong>{t('actionCannotBeUndone', 'Esta acción NO se puede deshacer')}</strong>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground font-medium pt-2">
                  {t('confirmDeleteGradesByYearQuestion', `¿Estás seguro de que deseas eliminar todas las calificaciones del año ${selectedYear}?`)}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/40">
              {t('cancel', 'Cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={async () => {
                try {
                  setShowConfirmDeleteGradesByYear(false);
                  setShowDeleteSQLProgress(true);
                  
                  console.log(`🗑️ Iniciando eliminación de calificaciones para el año ${selectedYear}...`);
                  console.log(`🔍 Modo actual: ${isFirebaseMode ? 'Firebase' : 'SQL/IDB'}`);
                  
                  if (isFirebaseMode) {
                    console.log('🔥 Usando API de servidor para eliminar calificaciones de Firebase...');
                    try {
                      const deleteRes = await fetch(`/api/firebase/delete-grades-by-year?year=${encodeURIComponent(selectedYear)}`, {
                        method: 'DELETE',
                        headers: { 'Cache-Control': 'no-cache' }
                      });
                      
                      if (!deleteRes.ok) {
                        const errData = await deleteRes.json().catch(() => ({}));
                        throw new Error(errData.details || errData.error || `HTTP ${deleteRes.status}`);
                      }
                      
                      const deleteData = await deleteRes.json();
                      console.log('✅ Respuesta de eliminación Firebase:', deleteData);
                      
                      // Actualizar contadores
                      await getFirebaseCounters(selectedYear);
                      
                      toast({
                        title: '✅ ' + t('deleteComplete', 'Eliminación Completada'),
                        description: t('gradesDeletedForYear', `Se eliminaron ${deleteData.deleted || 0} calificaciones del año ${selectedYear}.`),
                        variant: 'default',
                      });
                    } catch (apiError: any) {
                      console.error('❌ Error en API de eliminación Firebase:', apiError);
                      toast({
                        title: t('error', 'Error'),
                        description: apiError.message || t('errorDeletingGrades', 'Error al eliminar calificaciones de Firebase'),
                        variant: 'destructive',
                      });
                    }
                  } else {
                    // Modo SQL/IDB: usar el hook local
                    console.log('🗄️ Usando hook SQL para eliminar calificaciones...');
                    const result = await deleteSQLByYear(selectedYear);
                    
                    if (result) {
                      // Obtener contadores actualizados
                      const yearResult = await countGradesByYear(selectedYear);
                      const totalResult = await countAllGrades();
                      
                      console.log('📊 Contadores actualizados:', { yearResult, totalResult });
                      
                      // Actualizar overrides para que la UI se actualice inmediatamente
                      if (yearResult && yearResult.count !== undefined) {
                        setFirebaseYearCountOverride(yearResult.count);
                        localStorage.setItem(`grades-counter-year-${selectedYear}`, String(yearResult.count));
                      }
                      if (totalResult && totalResult.total !== undefined) {
                        setFirebaseTotalOverride(totalResult.total);
                        localStorage.setItem('grades-counter-total', String(totalResult.total));
                      }
                      
                      toast({
                        title: '✅ ' + t('deleteComplete', 'Eliminación Completada'),
                        description: t('gradesDeletedForYear', `Se eliminaron las calificaciones del año ${selectedYear}.`),
                        variant: 'default',
                      });
                    } else {
                      toast({
                        title: '⚠️ ' + t('deleteIncomplete', 'Eliminación Incompleta'),
                        description: t('couldNotDeleteAllRecords', 'No se pudieron eliminar todos los registros. Revisa los logs.'),
                        variant: 'destructive',
                      });
                    }
                  }
                } catch (e: any) {
                  console.error('❌ Error en eliminación de calificaciones:', e);
                  toast({
                    title: '❌ ' + t('error', 'Error'),
                    description: `${t('couldNotDeleteRecords', 'No se pudieron eliminar los registros')}: ${e?.message || t('unknownError', 'Error desconocido')}`,
                    variant: 'destructive',
                  });
                } finally {
                  setTimeout(() => {
                    setShowDeleteSQLProgress(false);
                  }, 2000);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sí, eliminar calificaciones {selectedYear}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog de confirmación: Borrar Asistencia SQL */}
      <AlertDialog open={showConfirmDeleteAttendanceSQL} onOpenChange={setShowConfirmDeleteAttendanceSQL}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              {isFirebaseMode ? 'Confirmar Eliminación de Asistencia en Firebase' : 'Confirmar Eliminación de Asistencia en SQL'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-3">
                <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    {isFirebaseMode
                      ? `Se eliminarán de Firebase todos los registros de asistencia del año ${selectedYear}:`
                      : `Se eliminarán de la base de datos SQL todos los registros de asistencia del año ${selectedYear}:`}
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    <li>
                      Año: <strong>{selectedYear}</strong>
                    </li>
                    <li>
                      Aproximadamente{' '}
                      <strong>
                        {(
                          attendanceYearCountOverride ??
                          (attYearCount?.year === selectedYear ? attYearCount.count : 0)
                        ).toLocaleString()}{' '}
                        registros
                      </strong>
                    </li>
                    <li>
                      <strong>Esta acción NO se puede deshacer</strong>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground font-medium pt-2">
                  ¿Estás seguro de que deseas eliminar todos los registros de asistencia del año {selectedYear}?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted/40">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={async () => {
                try {
                  setShowConfirmDeleteAttendanceSQL(false);
                  setShowAttendanceDeleteSQLProgress(true);
                  
                  console.log(`🗑️ Iniciando eliminación de asistencia para el año ${selectedYear}...`);
                  console.log(`🔍 Modo actual: ${isFirebaseMode ? 'Firebase' : 'SQL/IDB'}`);
                  console.log(`🔍 Provider: ${dbProvider}`);
                  
                  let result: any = null;
                  
                  // 🔥 NUEVO: Si es modo Firebase, usar la API del servidor con Admin SDK
                  if (isFirebaseMode) {
                    console.log('🔥 Usando API de servidor para eliminar asistencia de Firebase...');
                    try {
                      const deleteRes = await fetch(`/api/firebase/delete-attendance-by-year?year=${encodeURIComponent(selectedYear)}`, {
                        method: 'DELETE',
                        headers: { 'Cache-Control': 'no-cache' }
                      });
                      
                      if (!deleteRes.ok) {
                        const errData = await deleteRes.json().catch(() => ({}));
                        throw new Error(errData.details || errData.error || `HTTP ${deleteRes.status}`);
                      }
                      
                      const deleteData = await deleteRes.json();
                      console.log('✅ Respuesta de eliminación Firebase:', deleteData);
                      result = { success: deleteData.success, deleted: deleteData.deleted };
                    } catch (apiError: any) {
                      console.error('❌ Error en API de eliminación Firebase:', apiError);
                      toast({
                        title: t('error', 'Error'),
                        description: apiError.message || 'Error al eliminar asistencia de Firebase',
                        variant: 'destructive',
                      });
                      setShowAttendanceDeleteSQLProgress(false);
                      return;
                    }
                  } else {
                    // Modo SQL/IDB: usar el hook local
                    result = await deleteAttendanceSQLByYear(selectedYear);
                  }
                  
                  if (result) {
                    console.log('✅ Eliminación completada, actualizando contadores...');
                    
                    // 🔄 FORZAR recarga desde Firebase/SQL sin cache
                    if (isFirebaseMode) {
                      // Para Firebase, usar la API que obtiene contadores reales
                      try {
                        console.log('🔥 Obteniendo contadores actualizados desde Firebase...');
                        const res = await fetch(`/api/firebase/attendance-counters?year=${encodeURIComponent(selectedYear)}&_t=${Date.now()}`, { 
                          cache: 'no-store',
                          headers: { 'Cache-Control': 'no-cache' }
                        });
                        
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const data = await res.json();
                        
                        console.log('📊 Contadores recibidos desde Firebase:', data);
                        
                        const yearCount = Number(data?.yearCount || 0);
                        const totalAttendance = Number(data?.totalAttendance || 0);
                        
                        // Actualizar estados
                        setAttendanceYearCountOverride(yearCount);
                        setAttendanceTotalOverride(totalAttendance);
                        
                        // 💾 Actualizar localStorage
                        localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(yearCount));
                        localStorage.setItem('attendance-counter-total', String(totalAttendance));
                        
                        console.log(`✅ Contadores actualizados: año ${selectedYear}=${yearCount}, total=${totalAttendance}`);
                      } catch (error: any) {
                        console.error('❌ Error obteniendo contadores de Firebase:', error);
                      }
                    } else {
                      // Para SQL/IDB, usar el hook
                      const yearResult = await countAttendanceByYear(selectedYear);
                      const totalResult = await countAllAttendance();
                      
                      if (yearResult && yearResult.count !== undefined) {
                        localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(yearResult.count));
                        setAttendanceYearCountOverride(yearResult.count);
                      }
                      if (totalResult && totalResult.total !== undefined) {
                        localStorage.setItem('attendance-counter-total', String(totalResult.total));
                        setAttendanceTotalOverride(totalResult.total);
                      }
                    }
                    
                    toast({
                      title: '✅ Eliminación Completada',
                      description: `Se eliminaron exitosamente los registros de asistencia del año ${selectedYear}.`,
                      variant: 'default',
                    });
                  } else {
                    toast({
                      title: '⚠️ Eliminación Incompleta',
                      description: 'No se pudieron eliminar todos los registros. Revisa los logs.',
                      variant: 'destructive',
                    });
                  }
                } catch (e: any) {
                  console.error('❌ Error en eliminación de asistencia:', e);
                  toast({
                    title: '❌ Error',
                    description: `No se pudieron eliminar los registros: ${e?.message || 'Error desconocido'}`,
                    variant: 'destructive',
                  });
                } finally {
                  setTimeout(async () => {
                    setShowAttendanceDeleteSQLProgress(false);
                    // Recargar contadores una vez más para asegurar sincronización
                    console.log('🔄 Recarga final de contadores de asistencia...');
                    try {
                      if (isFirebaseMode) {
                        // Para Firebase, forzar recarga desde API
                        const res = await fetch(`/api/firebase/attendance-counters?year=${encodeURIComponent(selectedYear)}&_t=${Date.now()}`, { 
                          cache: 'no-store',
                          headers: { 'Cache-Control': 'no-cache' }
                        });
                        
                        if (res.ok) {
                          const data = await res.json();
                          const yearCount = Number(data?.yearCount || 0);
                          const totalAttendance = Number(data?.totalAttendance || 0);
                          
                          setAttendanceYearCountOverride(yearCount);
                          setAttendanceTotalOverride(totalAttendance);
                          localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(yearCount));
                          localStorage.setItem('attendance-counter-total', String(totalAttendance));
                          
                          console.log(`✅ [FINAL] Contadores actualizados: año=${yearCount}, total=${totalAttendance}`);
                        }
                      } else {
                        const finalYearResult = await countAttendanceByYear(selectedYear);
                        const finalTotalResult = await countAllAttendance();
                        
                        if (finalYearResult && finalYearResult.count !== undefined) {
                          setAttendanceYearCountOverride(finalYearResult.count);
                          localStorage.setItem(`attendance-counter-year-${selectedYear}`, String(finalYearResult.count));
                        }
                        if (finalTotalResult && finalTotalResult.total !== undefined) {
                          setAttendanceTotalOverride(finalTotalResult.total);
                          localStorage.setItem('attendance-counter-total', String(finalTotalResult.total));
                        }
                      }
                    } catch (reloadError) {
                      console.warn('⚠️ Error en recarga final de contadores:', reloadError);
                    }
                  }, 1200);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sí, eliminar asistencia {selectedYear}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
