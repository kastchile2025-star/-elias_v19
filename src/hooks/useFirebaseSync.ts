/**
 * 🔄 USE FIREBASE SYNC HOOK
 * 
 * Hook de React para sincronización automática entre LocalStorage y Firebase.
 * 
 * USO:
 * ```tsx
 * import { useFirebaseSync } from '@/hooks/useFirebaseSync';
 * 
 * function MyComponent() {
 *   const { isLoading, isSyncing, loadFromFirebase, syncToFirebase } = useFirebaseSync(selectedYear);
 *   
 *   // Cargar datos al iniciar
 *   useEffect(() => {
 *     loadFromFirebase();
 *   }, [selectedYear]);
 *   
 *   // Sincronizar después de modificar datos
 *   const handleSaveStudents = async (students) => {
 *     LocalStorageManager.setStudentsForYear(selectedYear, students);
 *     await syncToFirebase({ students });
 *   };
 * }
 * ```
 * 
 * @author Sistema SuperJF
 * @date 2025-10-15
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  loadAllDataFromFirebase,
  syncAllDataToFirebase,
  syncCoursesToFirebase,
  syncSectionsToFirebase,
  syncStudentsToFirebase,
  syncTeachersToFirebase,
  syncSubjectsToFirebase,
  syncStudentAssignmentsToFirebase,
  syncTeacherAssignmentsToFirebase
} from '@/lib/firebase-sync-manager';
import { LocalStorageManager } from '@/lib/education-utils';

const USE_FIREBASE = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';

interface SyncStatus {
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: Error | null;
}

export function useFirebaseSync(year: number) {
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    isSyncing: false,
    lastSyncTime: null,
    error: null
  });
  
  /**
   * Carga todos los datos desde Firebase a LocalStorage
   */
  const loadFromFirebase = useCallback(async () => {
    if (!USE_FIREBASE) {
      console.warn('⚠️ Firebase no está habilitado. Usando datos de LocalStorage.');
      return;
    }
    
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log(`📥 Cargando datos del año ${year} desde Firebase...`);
      
      const data = await loadAllDataFromFirebase(year);
      
      // Actualizar LocalStorage con los datos de Firebase
      if (data.courses.length > 0) {
        LocalStorageManager.setCoursesForYear(year, data.courses);
      }
      
      if (data.sections.length > 0) {
        LocalStorageManager.setSectionsForYear(year, data.sections);
      }
      
      if (data.students.length > 0) {
        LocalStorageManager.setStudentsForYear(year, data.students);
      }
      
      if (data.teachers.length > 0) {
        LocalStorageManager.setTeachersForYear(year, data.teachers);
      }
      
      if (data.subjects.length > 0) {
        LocalStorageManager.setSubjectsForYear(year, data.subjects);
      }
      
      if (data.studentAssignments.length > 0) {
        LocalStorageManager.setStudentAssignmentsForYear(year, data.studentAssignments);
      }
      
      if (data.teacherAssignments.length > 0) {
        LocalStorageManager.setTeacherAssignmentsForYear(year, data.teacherAssignments);
      }
      
      // Emitir eventos para actualizar la UI
      window.dispatchEvent(new CustomEvent('dataLoaded', { 
        detail: { year, source: 'firebase' } 
      }));
      
      window.dispatchEvent(new StorageEvent('storage', { 
        key: 'firebase-sync-completed', 
        newValue: String(Date.now()) 
      }));
      
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastSyncTime: new Date() 
      }));
      
      console.log(`✅ Datos cargados desde Firebase y actualizados en LocalStorage`);
      
      return data;
    } catch (error: any) {
      console.error('❌ Error cargando datos desde Firebase:', error);
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error 
      }));
      throw error;
    }
  }, [year]);
  
  /**
   * Sincroniza datos específicos desde LocalStorage a Firebase
   */
  const syncToFirebase = useCallback(async (data: {
    courses?: any[];
    sections?: any[];
    students?: any[];
    teachers?: any[];
    subjects?: any[];
    studentAssignments?: any[];
    teacherAssignments?: any[];
  }) => {
    if (!USE_FIREBASE) {
      return;
    }
    
    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    
    try {
      await syncAllDataToFirebase(year, data);
      
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncTime: new Date() 
      }));
      
      return true;
    } catch (error: any) {
      console.error('❌ Error sincronizando a Firebase:', error);
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        error 
      }));
      return false;
    }
  }, [year]);
  
  /**
   * Sincroniza solo cursos
   */
  const syncCourses = useCallback(async (courses: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncCoursesToFirebase(year, courses);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  /**
   * Sincroniza solo secciones
   */
  const syncSections = useCallback(async (sections: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncSectionsToFirebase(year, sections);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  /**
   * Sincroniza solo estudiantes
   */
  const syncStudents = useCallback(async (students: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncStudentsToFirebase(year, students);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  /**
   * Sincroniza solo profesores
   */
  const syncTeachers = useCallback(async (teachers: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncTeachersToFirebase(year, teachers);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  /**
   * Sincroniza solo asignaturas
   */
  const syncSubjects = useCallback(async (subjects: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncSubjectsToFirebase(year, subjects);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  /**
   * Sincroniza solo asignaciones de estudiantes
   */
  const syncStudentAssignments = useCallback(async (assignments: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncStudentAssignmentsToFirebase(year, assignments);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  /**
   * Sincroniza solo asignaciones de profesores
   */
  const syncTeacherAssignments = useCallback(async (assignments: any[]) => {
    if (!USE_FIREBASE) return;
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await syncTeacherAssignmentsToFirebase(year, assignments);
      setStatus(prev => ({ ...prev, isSyncing: false, lastSyncTime: new Date() }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isSyncing: false, error }));
    }
  }, [year]);
  
  return {
    ...status,
    loadFromFirebase,
    syncToFirebase,
    syncCourses,
    syncSections,
    syncStudents,
    syncTeachers,
    syncSubjects,
    syncStudentAssignments,
    syncTeacherAssignments
  };
}
