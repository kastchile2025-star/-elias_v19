// IndexedDB wrapper for storing attendance without LocalStorage limits
// Provides a minimal API similar to sql-idb.ts for grades

export type AttendanceRecord = {
  id: string;
  date: string; // ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)
  courseId: string;
  sectionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  comment?: string;
  year: number;
  createdAt: string;
  updatedAt: string;
};

const DB_NAME = 'smart-student-attendance';
const DB_VERSION = 1;
const STORE = 'attendance';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no soportado'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('by_year', 'year', { unique: false });
        store.createIndex('by_course', 'courseId', { unique: false });
        store.createIndex('by_section', 'sectionId', { unique: false });
        store.createIndex('by_student', 'studentId', { unique: false });
        store.createIndex('by_date', 'date', { unique: false });
        store.createIndex('by_year_course', ['year', 'courseId'], { unique: false });
        store.createIndex('by_year_section', ['year', 'sectionId'], { unique: false });
        store.createIndex('by_year_date', ['year', 'date'], { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('No se pudo abrir IndexedDB de asistencia'));
  });
  return dbPromise;
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    Promise.resolve(fn(store))
      .then((res) => {
        tx.oncomplete = () => resolve(res);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transacción abortada'));
      })
      .catch(reject);
  });
}

// Helper to extract year from date string
function extractYear(dateStr: string): number {
  const match = dateStr.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

export const attendanceIDB = {
  async testConnection(): Promise<{ success: boolean }> {
    try {
      await openDB();
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async insertAttendance(records: AttendanceRecord[]): Promise<{ success: boolean; logs: string[]; inserted: number }> {
    const logs: string[] = [];
    let inserted = 0;
    await withStore('readwrite', async (store) => {
      for (const record of records) {
        // Ensure year is set
        const finalRecord = {
          ...record,
          year: record.year || extractYear(record.date),
        };
        await new Promise<void>((resolve, reject) => {
          const req = store.put(finalRecord);
          req.onsuccess = () => { inserted++; resolve(); };
          req.onerror = () => reject(req.error);
        });
      }
    });
    logs.push(`📤 Guardados ${inserted} registros de asistencia en IndexedDB`);
    return { success: true, logs, inserted };
  },

  async bulkInsertAttendance(records: AttendanceRecord[]): Promise<{ success: boolean; logs: string[]; inserted: number }> {
    // Same as insertAttendance but with batching for better performance
    const logs: string[] = [];
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await withStore('readwrite', async (store) => {
        for (const record of batch) {
          const finalRecord = {
            ...record,
            year: record.year || extractYear(record.date),
          };
          await new Promise<void>((resolve, reject) => {
            const req = store.put(finalRecord);
            req.onsuccess = () => { totalInserted++; resolve(); };
            req.onerror = () => reject(req.error);
          });
        }
      });
    }
    
    logs.push(`📤 Guardados ${totalInserted} registros de asistencia en IndexedDB (bulk)`);
    return { success: true, logs, inserted: totalInserted };
  },

  async getAttendanceByYear(year: number): Promise<{ attendance: AttendanceRecord[] }> {
    const attendance = await withStore('readonly', async (store) => {
      const idx = store.index('by_year');
      const res: AttendanceRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        if ('getAll' in idx) {
          const req = (idx as any).getAll(IDBKeyRange.only(year));
          req.onsuccess = () => { res.push(...(req.result || [])); resolve(); };
          req.onerror = () => reject(req.error);
          return;
        }
        const cursorReq = (idx as any).openCursor(IDBKeyRange.only(year));
        cursorReq.onerror = () => reject(cursorReq.error);
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null;
          if (!cursor) { resolve(); return; }
          res.push(cursor.value as AttendanceRecord);
          cursor.continue();
        };
      });
      return res;
    });
    return { attendance };
  },

  async getAttendanceByCourse(courseId: string): Promise<{ attendance: AttendanceRecord[] }> {
    const attendance = await withStore('readonly', async (store) => {
      const idx = store.index('by_course');
      const res: AttendanceRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        if ('getAll' in idx) {
          const req = (idx as any).getAll(IDBKeyRange.only(courseId));
          req.onsuccess = () => { res.push(...(req.result || [])); resolve(); };
          req.onerror = () => reject(req.error);
          return;
        }
        const cursorReq = (idx as any).openCursor(IDBKeyRange.only(courseId));
        cursorReq.onerror = () => reject(cursorReq.error);
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null;
          if (!cursor) { resolve(); return; }
          res.push(cursor.value as AttendanceRecord);
          cursor.continue();
        };
      });
      return res;
    });
    return { attendance };
  },

  async getAttendanceBySection(sectionId: string): Promise<{ attendance: AttendanceRecord[] }> {
    const attendance = await withStore('readonly', async (store) => {
      const idx = store.index('by_section');
      const res: AttendanceRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        if ('getAll' in idx) {
          const req = (idx as any).getAll(IDBKeyRange.only(sectionId));
          req.onsuccess = () => { res.push(...(req.result || [])); resolve(); };
          req.onerror = () => reject(req.error);
          return;
        }
        const cursorReq = (idx as any).openCursor(IDBKeyRange.only(sectionId));
        cursorReq.onerror = () => reject(cursorReq.error);
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null;
          if (!cursor) { resolve(); return; }
          res.push(cursor.value as AttendanceRecord);
          cursor.continue();
        };
      });
      return res;
    });
    return { attendance };
  },

  async getAttendanceByDateRange(startDate: string, endDate: string): Promise<{ attendance: AttendanceRecord[] }> {
    const attendance = await withStore('readonly', async (store) => {
      const idx = store.index('by_date');
      const res: AttendanceRecord[] = [];
      const range = IDBKeyRange.bound(startDate, endDate);
      await new Promise<void>((resolve, reject) => {
        if ('getAll' in idx) {
          const req = (idx as any).getAll(range);
          req.onsuccess = () => { res.push(...(req.result || [])); resolve(); };
          req.onerror = () => reject(req.error);
          return;
        }
        const cursorReq = (idx as any).openCursor(range);
        cursorReq.onerror = () => reject(cursorReq.error);
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null;
          if (!cursor) { resolve(); return; }
          res.push(cursor.value as AttendanceRecord);
          cursor.continue();
        };
      });
      return res;
    });
    return { attendance };
  },

  async countAttendanceByYear(year: number): Promise<{ count: number; year: number }> {
    const count = await withStore('readonly', async (store) => {
      const idx = store.index('by_year');
      return await new Promise<number>((resolve, reject) => {
        const req = idx.count(IDBKeyRange.only(year));
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { count, year };
  },

  async countAllAttendance(): Promise<{ total: number }> {
    const total = await withStore('readonly', async (store) => {
      return await new Promise<number>((resolve, reject) => {
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { total };
  },

  async deleteAttendanceByYear(year: number): Promise<{ success: boolean; deleted: number }> {
    let deleted = 0;
    await withStore('readwrite', async (store) => {
      const idx = store.index('by_year');
      const range = IDBKeyRange.only(year);
      await new Promise<void>((resolve, reject) => {
        const cursorReq = idx.openCursor(range);
        cursorReq.onerror = () => reject(cursorReq.error);
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null;
          if (!cursor) { resolve(); return; }
          const delReq = cursor.delete();
          delReq.onsuccess = () => { deleted++; cursor.continue(); };
          delReq.onerror = () => reject(delReq.error);
        };
      });
    });
    return { success: true, deleted };
  },

  async clearAllData(): Promise<{ success: boolean; logs: string[] }> {
    await withStore('readwrite', async (store) => {
      await new Promise<void>((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
    return { success: true, logs: ['🗑️ IndexedDB de asistencia limpiada'] };
  },

  // Migration function from localStorage
  async migrateFromLocalStorage(year: number, localStorageManager: {
    getAttendanceForYear: (year: number) => any[];
  }): Promise<{ success: boolean; logs: string[]; migrated: number }> {
    const logs: string[] = [];
    try {
      const rawRecords = localStorageManager.getAttendanceForYear(year) || [];
      if (!rawRecords.length) {
        logs.push(`ℹ️ No hay datos de asistencia en localStorage para ${year}`);
        return { success: true, logs, migrated: 0 };
      }
      
      // Transform to AttendanceRecord format
      const records: AttendanceRecord[] = rawRecords.map((r: any) => ({
        id: r.id || `att-${r.studentId}-${r.sectionId}-${String(r.date).slice(0, 10)}`,
        date: r.date,
        courseId: r.courseId || '',
        sectionId: r.sectionId || '',
        studentId: r.studentId || '',
        status: r.status || 'present',
        comment: r.comment,
        year: year,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }));
      
      // Insert in batches
      const result = await this.bulkInsertAttendance(records);
      logs.push(`✅ Migrados ${result.inserted} registros de asistencia de ${year} a IndexedDB`);
      return { success: true, logs, migrated: result.inserted };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`❌ Error migrando asistencia: ${msg}`);
      return { success: false, logs, migrated: 0 };
    }
  },

  // Get attendance statistics by year
  async getAttendanceStats(year: number): Promise<{
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  }> {
    const { attendance } = await this.getAttendanceByYear(year);
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const total = attendance.length;
    const attendanceRate = total > 0 ? ((presentCount + lateCount) / total) * 100 : 0;
    
    return {
      totalRecords: total,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
    };
  },

  // Get monthly attendance breakdown
  async getMonthlyAttendance(year: number): Promise<Map<string, { present: number; absent: number; late: number; total: number }>> {
    const { attendance } = await this.getAttendanceByYear(year);
    const monthly = new Map<string, { present: number; absent: number; late: number; total: number }>();
    
    for (const record of attendance) {
      const month = String(record.date).slice(0, 7); // YYYY-MM
      if (!monthly.has(month)) {
        monthly.set(month, { present: 0, absent: 0, late: 0, total: 0 });
      }
      const m = monthly.get(month)!;
      m.total++;
      if (record.status === 'present') m.present++;
      else if (record.status === 'absent') m.absent++;
      else if (record.status === 'late') m.late++;
    }
    
    return monthly;
  },
};

export default attendanceIDB;
