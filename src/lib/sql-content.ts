"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSQLConfig, isSupabaseEnabled } from './sql-config';

export type SummaryRecord = {
  id: string;
  userId?: string | null;
  username?: string | null;
  courseId?: string | null;
  sectionId?: string | null;
  subjectName?: string | null;
  topic: string;
  content: string; // markdown/html
  keyPoints?: string[] | null;
  language?: string | null;
  createdAt: string; // ISO
};

export type MindMapRecord = {
  id: string;
  userId?: string | null;
  username?: string | null;
  courseId?: string | null;
  sectionId?: string | null;
  subjectName?: string | null;
  centralTheme: string;
  imageDataUri: string; // base64 data URI
  language?: string | null;
  createdAt: string; // ISO
};

export type QuizRecord = {
  id: string;
  userId?: string | null;
  username?: string | null;
  courseId?: string | null;
  sectionId?: string | null;
  subjectName?: string | null;
  topic: string;
  quiz: any; // JSON content
  language?: string | null;
  createdAt: string; // ISO
};

export type EvaluationRecord = {
  id: string;
  userId?: string | null;
  username?: string | null;
  courseId?: string | null;
  sectionId?: string | null;
  subjectName?: string | null;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number; // 0-100
  timeSpentSeconds?: number; // optional
  language?: string | null;
  createdAt: string; // ISO
};

type Counts = { summaries: number; maps: number; quizzes: number; evaluations?: number };

class ContentDBService {
  private static _instance: ContentDBService | null = null;
  private client: SupabaseClient | null = null;

  static instance() {
    if (!this._instance) this._instance = new ContentDBService();
    return this._instance;
  }

  private connect() {
    if (!isSupabaseEnabled()) return null;
    if (this.client) return this.client;
    const cfg = getSQLConfig();
    this.client = createClient(cfg.supabaseUrl!, cfg.supabaseAnonKey!, { auth: { persistSession: false } });
    return this.client;
  }

  // =============== SUPABASE BRANCH ===============
  private async sb_insertSummary(rec: SummaryRecord) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { error } = await client.from('summaries').upsert({
      id: rec.id,
      user_id: rec.userId || null,
      username: rec.username || null,
      course_id: rec.courseId || null,
      section_id: rec.sectionId || null,
      subject_name: rec.subjectName || null,
      topic: rec.topic,
      content: rec.content,
      key_points: rec.keyPoints || null,
      language: rec.language || null,
      created_at: rec.createdAt,
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  private async sb_insertMindMap(rec: MindMapRecord) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { error } = await client.from('mindmaps').upsert({
      id: rec.id,
      user_id: rec.userId || null,
      username: rec.username || null,
      course_id: rec.courseId || null,
      section_id: rec.sectionId || null,
      subject_name: rec.subjectName || null,
      central_theme: rec.centralTheme,
      image_data_uri: rec.imageDataUri,
      language: rec.language || null,
      created_at: rec.createdAt,
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  private async sb_insertQuiz(rec: QuizRecord) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { error } = await client.from('quizzes').upsert({
      id: rec.id,
      user_id: rec.userId || null,
      username: rec.username || null,
      course_id: rec.courseId || null,
      section_id: rec.sectionId || null,
      subject_name: rec.subjectName || null,
      topic: rec.topic,
      quiz_json: rec.quiz,
      language: rec.language || null,
      created_at: rec.createdAt,
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  private async sb_insertEvaluation(rec: EvaluationRecord) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { error } = await client.from('evaluations').upsert({
      id: rec.id,
      user_id: rec.userId || null,
      username: rec.username || null,
      course_id: rec.courseId || null,
      section_id: rec.sectionId || null,
      subject_name: rec.subjectName || null,
      topic: rec.topic,
      score: rec.score,
      total_questions: rec.totalQuestions,
      percentage: rec.percentage,
      time_spent_seconds: rec.timeSpentSeconds ?? null,
      language: rec.language || null,
      created_at: rec.createdAt,
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  private async sb_countByUsername(username?: string | null): Promise<Counts> {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const uname = username || null;
    const countTable = async (table: string) => {
      let q = client.from(table).select('id', { count: 'exact', head: true });
      if (uname) q = q.eq('username', uname);
      const { count, error } = await q;
      if (error) throw error;
      return count || 0;
    };
    const [summaries, maps, quizzes, evaluations] = await Promise.all([
      countTable('summaries'),
      countTable('mindmaps'),
      countTable('quizzes'),
      // evaluations table is optional; ignore error by try/catch
      (async () => { try { return await countTable('evaluations'); } catch { return 0; } })(),
    ]);
    return { summaries, maps, quizzes, evaluations };
  }

  // =============== INDEXEDDB BRANCH ===============
  private idb: {
    open?: Promise<IDBDatabase>;
  } = {};

  private async idbOpen(): Promise<IDBDatabase> {
    if (this.idb.open) return this.idb.open;
    this.idb.open = new Promise((resolve, reject) => {
      if (!('indexedDB' in globalThis)) {
        reject(new Error('IndexedDB no soportado'));
        return;
      }
      const req = indexedDB.open('smart-student-content', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('summaries')) {
          const s = db.createObjectStore('summaries', { keyPath: 'id' });
          s.createIndex('by_username', 'username', { unique: false });
        }
        if (!db.objectStoreNames.contains('mindmaps')) {
          const s = db.createObjectStore('mindmaps', { keyPath: 'id' });
          s.createIndex('by_username', 'username', { unique: false });
        }
        if (!db.objectStoreNames.contains('quizzes')) {
          const s = db.createObjectStore('quizzes', { keyPath: 'id' });
          s.createIndex('by_username', 'username', { unique: false });
        }
        if (!db.objectStoreNames.contains('evaluations')) {
          const s = db.createObjectStore('evaluations', { keyPath: 'id' });
          s.createIndex('by_username', 'username', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('No se pudo abrir IndexedDB'));
    });
    return this.idb.open;
  }

  private async idbWith<T>(mode: IDBTransactionMode, storeName: string, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
    const db = await this.idbOpen();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      Promise.resolve(fn(store)).then((res) => {
        tx.oncomplete = () => resolve(res);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transacción abortada'));
      }).catch(reject);
    });
  }

  private async idbPut(store: string, obj: any) {
    return this.idbWith('readwrite', store, async (s) => {
      await new Promise<void>((resolve, reject) => {
        const req = s.put(obj);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }

  private async idbCount(store: string, username?: string | null): Promise<number> {
    return this.idbWith('readonly', store, async (s) => {
      if (!username) {
        return await new Promise<number>((resolve, reject) => {
          const req = s.count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => reject(req.error);
        });
      }
      const idx = s.index('by_username');
      return await new Promise<number>((resolve, reject) => {
        const req = idx.count(IDBKeyRange.only(username));
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    });
  }

  // =============== PUBLIC API ===============
  async saveSummary(rec: SummaryRecord) {
    if (isSupabaseEnabled()) return this.sb_insertSummary(rec);
    return this.idbPut('summaries', rec);
  }

  async saveMindMap(rec: MindMapRecord) {
    if (isSupabaseEnabled()) return this.sb_insertMindMap(rec);
    return this.idbPut('mindmaps', rec);
  }

  async saveQuiz(rec: QuizRecord) {
    if (isSupabaseEnabled()) return this.sb_insertQuiz(rec);
    return this.idbPut('quizzes', rec);
  }

  async saveEvaluation(rec: EvaluationRecord) {
    if (isSupabaseEnabled()) return this.sb_insertEvaluation(rec);
    return this.idbPut('evaluations', rec);
  }

  async countByUsername(username?: string | null): Promise<Counts> {
    if (isSupabaseEnabled()) return this.sb_countByUsername(username);
    const [summaries, maps, quizzes, evaluations] = await Promise.all([
      this.idbCount('summaries', username),
      this.idbCount('mindmaps', username),
      this.idbCount('quizzes', username),
      // evaluations store may exist in newer versions
      (async () => { try { return await this.idbCount('evaluations', username); } catch { return 0; } })(),
    ]);
    return { summaries, maps, quizzes, evaluations };
  }
}

export const contentDB = ContentDBService.instance();
