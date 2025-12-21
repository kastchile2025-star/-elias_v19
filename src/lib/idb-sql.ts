// IndexedDB wrapper for storing SQL-like grades without localStorage limits
// Lightweight, no external deps. Designed for browser-only (use client).

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
  createdAt: string;
  startAt?: string | null;
  openAt?: string | null;
  dueDate?: string | null;
  status?: string | null;
  assignedById?: string | null;
  assignedByName?: string | null;
  year: number;
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

const DB_NAME = 'smart-student-sql';
const STORE = 'grades';
const DB_VERSION = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('year', 'year', { unique: false });
          store.createIndex('studentId', 'studentId', { unique: false });
          store.createIndex('testId', 'testId', { unique: false });
        }
        if (!db.objectStoreNames.contains('activities')) {
          const act = db.createObjectStore('activities', { keyPath: 'id' });
          act.createIndex('year', 'year', { unique: false });
          act.createIndex('sectionId', 'sectionId', { unique: false });
          act.createIndex('taskType', 'taskType', { unique: false });
        }
        if (!db.objectStoreNames.contains('attendance')) {
          const att = db.createObjectStore('attendance', { keyPath: 'id' });
          att.createIndex('year', 'year', { unique: false });
          att.createIndex('studentId', 'studentId', { unique: false });
          att.createIndex('date', 'date', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => {
        console.warn('IndexedDB open blocked');
      };
    } catch (e) {
      reject(e);
    }
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    Promise.resolve(fn(store)).then((result) => {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    }).catch(reject);
  });
}

// Helper específico para el store 'activities'
async function withActivityStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    try {
      const tx = db.transaction('activities', mode);
      const store = tx.objectStore('activities');
      Promise.resolve(fn(store)).then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

// Helper específico para el store 'attendance'
async function withAttendanceStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    try {
      const tx = db.transaction('attendance', mode);
      const store = tx.objectStore('attendance');
      Promise.resolve(fn(store)).then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

export const sqlDB = {
  async testConnection(): Promise<{ success: boolean }>{
    try {
      await withStore('readonly', () => {});
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async insertGrades(grades: GradeRecord[]): Promise<{ success: boolean; logs: string[] }>{
    // No hacer await/yields dentro de una transacción: puede cerrarse automáticamente
    // Procesamos todo en una sola transacción (el caller ya suele trocear en lotes)
    let written = 0;
    await withStore('readwrite', (store) => {
      for (let i = 0; i < grades.length; i++) {
        store.put(grades[i]);
        written++;
      }
    });
    return { success: true, logs: [`📤 Insertados ${written} registros en IndexedDB`] };
  },

  async deleteGradesByYear(year: number, onProgress?: (deleted: number) => void): Promise<{ success: boolean; deleted: number }>{
    let deleted = 0;
    await withStore('readwrite', async (store) => {
      const idx = store.index('year');
      // Use a cursor to delete lazily
      await new Promise<void>((resolve, reject) => {
        const range = IDBKeyRange.only(year);
        const req = idx.openCursor(range);
        req.onsuccess = () => {
          const cursor = req.result as IDBCursorWithValue | null;
          if (!cursor) return resolve();
          cursor.delete();
          deleted++;
          try { if (onProgress) onProgress(deleted); } catch {}
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      });
    });
    return { success: true, deleted };
  },

  async clearAllData(): Promise<{ success: boolean; logs: string[] }>{
    // Limpiar todos los object stores relevantes: grades, activities y attendance
    await withStore('readwrite', async (store) => { store.clear(); });
    try { await withActivityStore('readwrite', async (act) => { act.clear(); }); } catch (e) { console.warn('No se pudo limpiar activities:', e); }
    try { await withAttendanceStore('readwrite', async (att) => { att.clear(); }); } catch (e) { console.warn('No se pudo limpiar attendance:', e); }
    return { success: true, logs: ['🗑️ IndexedDB limpiada (grades, activities, attendance)'] };
  },

  async countGradesByYear(year: number): Promise<{ count: number; year: number }>{
    const count = await withStore('readonly', async (store) => {
      const idx = store.index('year');
      return await new Promise<number>((resolve, reject) => {
        const req = idx.count(IDBKeyRange.only(year));
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { count, year };
  },

  async countAllGrades(): Promise<{ total: number }>{
    const total = await withStore('readonly', async (store) => {
      return await new Promise<number>((resolve, reject) => {
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { total };
  },

  async getGradesByYear(year: number): Promise<{ grades: GradeRecord[] }>{
    const grades = await withStore('readonly', async (store) => {
      const idx = store.index('year');
      const out: GradeRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        const req = idx.openCursor(IDBKeyRange.only(year));
        req.onsuccess = () => {
          const cursor = req.result as IDBCursorWithValue | null;
          if (!cursor) return resolve();
          out.push(cursor.value as GradeRecord);
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      });
      return out;
    });
    return { grades };
  }
  ,
  async insertActivities(activities: ActivityRecord[]): Promise<{ success: boolean; logs: string[] }>{
    let written = 0;
    await withActivityStore('readwrite', (actStore) => {
      for (let i = 0; i < activities.length; i++) {
        actStore.put(activities[i]);
        written++;
      }
    });
    return { success: true, logs: [`📤 Insertadas ${written} actividades en IndexedDB`] };
  },
  async getActivitiesByYear(year: number): Promise<{ activities: ActivityRecord[] }>{
    const activities = await withActivityStore('readonly', async (actStore) => {
      const idx = actStore.index('year');
      const out: ActivityRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        const req = idx.openCursor(IDBKeyRange.only(year));
        req.onsuccess = () => {
          const cursor = req.result as IDBCursorWithValue | null;
          if (!cursor) return resolve();
          out.push(cursor.value as ActivityRecord);
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      });
      return out;
    });
    return { activities };
  },
  async deleteActivitiesByYear(year: number, onProgress?: (deleted: number) => void): Promise<{ success: boolean; deleted: number }>{
    let deleted = 0;
    await withActivityStore('readwrite', async (actStore) => {
      const idx = actStore.index('year');
      await new Promise<void>((resolve, reject) => {
        const req = idx.openCursor(IDBKeyRange.only(year));
        req.onsuccess = () => {
          const cursor = req.result as IDBCursorWithValue | null;
          if (!cursor) return resolve();
          cursor.delete();
          deleted++;
          try { if (onProgress) onProgress(deleted); } catch {}
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      });
    });
    return { success: true, deleted };
  }
  ,
  async insertAttendance(records: AttendanceRecord[]): Promise<{ success: boolean; logs: string[] }>{
    // Importante: no pausar el event loop dentro de la transacción.
    // Si se reciben grandes volúmenes, el caller ya trae lotes (p.ej. 2000).
    let written = 0;
    await withAttendanceStore('readwrite', (attStore) => {
      for (let i = 0; i < records.length; i++) {
        attStore.put(records[i]);
        written++;
      }
    });
    return { success: true, logs: [`📤 Insertados ${written} registros de asistencia en IndexedDB`] };
  },
  async getAttendanceByYear(year: number): Promise<{ attendance: AttendanceRecord[] }>{
    const rows = await withAttendanceStore('readonly', async (attStore) => {
      const idx = attStore.index('year');
      const out: AttendanceRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        const req = idx.openCursor(IDBKeyRange.only(year));
        req.onsuccess = () => {
          const cursor = req.result as IDBCursorWithValue | null;
          if (!cursor) return resolve();
          out.push(cursor.value as AttendanceRecord);
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      });
      return out;
    });
    return { attendance: rows };
  },
  async deleteAttendanceByYear(year: number, onProgress?: (deleted: number) => void): Promise<{ success: boolean; deleted: number }>{
    // Borrado optimizado manteniendo la transacción activa
    let deleted = 0;
    
    await withAttendanceStore('readwrite', (attStore) => {
      const idx = attStore.index('year');
      return new Promise<void>((resolve, reject) => {
        const range = IDBKeyRange.only(year);
        const req = idx.openKeyCursor(range);
        
        req.onsuccess = () => {
          const cursor = req.result as IDBCursor | null;
          if (!cursor) {
            // Reportar progreso final
            try { if (onProgress) onProgress(deleted); } catch {}
            return resolve();
          }
          
          // Borrar inmediatamente usando la clave primaria
          const pk = (cursor as any).primaryKey;
          if (pk !== undefined) {
            try {
              attStore.delete(pk);
              deleted++;
              // Reportar progreso cada 100 borrados para no sobrecargar
              if (deleted % 100 === 0) {
                try { if (onProgress) onProgress(deleted); } catch {}
              }
            } catch (e) {
              // Si hay error individual, continuar con el siguiente
              console.warn('Error borrando registro de asistencia:', pk, e);
            }
          }
          
          // Continuar al siguiente registro
          cursor.continue();
        };
        
        req.onerror = () => reject(req.error);
      });
    });
    
    return { success: true, deleted };
  },
  async deleteAttendanceByDateCourseSection(
    year: number,
    ymd: string,
    courseId: string | null,
    sectionId: string | null,
    onProgress?: (deleted: number) => void
  ): Promise<{ success: boolean; deleted: number }>{
    let deleted = 0;
    const dayKey = String(ymd).slice(0, 10);
    await withAttendanceStore('readwrite', async (attStore) => {
      const idx = attStore.index('year');
      await new Promise<void>((resolve, reject) => {
        const req = idx.openCursor(IDBKeyRange.only(year));
        req.onsuccess = () => {
          const cursor = req.result as IDBCursorWithValue | null;
          if (!cursor) return resolve();
          const val = cursor.value as AttendanceRecord;
          const sameDay = String(val.date).slice(0, 10) === dayKey;
          const sameCourse = String(val.courseId || '') === String(courseId || '');
          const sameSection = String(val.sectionId || '') === String(sectionId || '');
          if (sameDay && sameCourse && sameSection) {
            cursor.delete();
            deleted++;
            try { if (onProgress) onProgress(deleted); } catch {}
          }
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      });
    });
    return { success: true, deleted };
  },
  async deleteAttendanceById(id: string): Promise<{ success: boolean; deleted: number }>{
    let deleted = 0;
    await withAttendanceStore('readwrite', async (attStore) => {
      await new Promise<void>((resolve, reject) => {
        const req = attStore.delete(id);
        req.onsuccess = () => {
          deleted = 1;
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    });
    return { success: true, deleted };
  },
  async countAttendanceByYear(year: number): Promise<{ count: number; year: number }>{
    const count = await withAttendanceStore('readonly', async (attStore) => {
      const idx = attStore.index('year');
      return await new Promise<number>((resolve, reject) => {
        const req = idx.count(IDBKeyRange.only(year));
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { count, year };
  },
  async countAllAttendance(): Promise<{ total: number }>{
    const total = await withAttendanceStore('readonly', async (attStore) => {
      return await new Promise<number>((resolve, reject) => {
        const req = attStore.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { total };
  }
};

// Extensiones utilitarias explícitas para limpiar por completo actividades y asistencia
export const sqlDBExtra = {
  async clearAllActivities(): Promise<{ success: boolean; logs: string[] }>{
    try {
      await withActivityStore('readwrite', async (act) => { act.clear(); });
      return { success: true, logs: ['🗑️ Activities limpiadas'] };
    } catch (e: any) {
      return { success: false, logs: ['❌ No se pudieron limpiar activities: ' + (e?.message || String(e))] };
    }
  },
  async clearAllAttendance(): Promise<{ success: boolean; logs: string[] }>{
    try {
      await withAttendanceStore('readwrite', async (att) => { att.clear(); });
      return { success: true, logs: ['🗑️ Attendance limpiada'] };
    } catch (e: any) {
      return { success: false, logs: ['❌ No se pudo limpiar attendance: ' + (e?.message || String(e))] };
    }
  }
};
