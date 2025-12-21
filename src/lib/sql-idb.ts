// IndexedDB wrapper for storing grades without LocalStorage limits
// Provides a minimal API used by useGradesSQL

export type GradeRecord = {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  score: number;
  courseId: string | null;
  sectionId: string | null;
  subjectId: string | null;
  title: string;
  gradedAt: string; // ISO string in hook; we keep it
  year: number;
  type: 'tarea' | 'prueba' | 'evaluacion';
  createdAt: string;
  updatedAt: string;
};

const DB_NAME = 'smart-student-sql';
const DB_VERSION = 1;
const STORE = 'grades';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB no soportado'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('by_year', 'year', { unique: false });
        store.createIndex('by_test', 'testId', { unique: false });
        store.createIndex('by_student', 'studentId', { unique: false });
        store.createIndex('by_year_test', ['year', 'testId'], { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('No se pudo abrir IndexedDB'));
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

export const sqlIDB = {
  async testConnection(): Promise<{ success: boolean }> {
    try {
      await openDB();
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async insertGrades(grades: GradeRecord[]): Promise<{ success: boolean; logs: string[] }> {
    const logs: string[] = [];
    await withStore('readwrite', async (store) => {
      for (const g of grades) {
        // put = upsert
        await new Promise<void>((resolve, reject) => {
          const req = store.put(g);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    });
    logs.push(`📤 Guardadas ${grades.length} calificaciones en IndexedDB`);
    return { success: true, logs };
  },

  async deleteGradesByYear(year: number): Promise<{ success: boolean; deleted: number }> {
    let deleted = 0;
    await withStore('readwrite', async (store) => {
      const idx = store.index('by_year');
      const range = IDBKeyRange.only(year);
      await new Promise<void>((resolve, reject) => {
        const cursorReq = (idx as any).openCursor(range);
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
    return { success: true, logs: ['🗑️ IndexedDB limpiada (grades)'] };
  },

  async countGradesByYear(year: number): Promise<{ count: number; year: number }> {
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

  async countAllGrades(): Promise<{ total: number }> {
    const total = await withStore('readonly', async (store) => {
      return await new Promise<number>((resolve, reject) => {
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
    return { total };
  },

  async getGradesByYear(year: number): Promise<{ grades: GradeRecord[] }> {
    const grades = await withStore('readonly', async (store) => {
      const idx = store.index('by_year');
      const res: GradeRecord[] = [];
      await new Promise<void>((resolve, reject) => {
        // Prefer getAll if available
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
          res.push(cursor.value as GradeRecord);
          cursor.continue();
        };
      });
      return res;
    });
    return { grades };
  }
};
