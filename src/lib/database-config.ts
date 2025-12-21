// Configuración unificada para base de datos (Firebase o Supabase)

export type DatabaseProvider = 'firebase' | 'supabase' | 'idb';

export type DatabaseConfig = {
  provider: DatabaseProvider;
  // Supabase
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  // Firebase
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
};

// Permite forzar un fallback a IndexedDB en tiempo de ejecución
let __FORCE_IDB = false;
export function setForceIDB(flag: boolean) {
  __FORCE_IDB = Boolean(flag);
}
export function isForceIDBEnabled() {
  return __FORCE_IDB;
}

/**
 * Obtiene la configuración de base de datos según las variables de entorno
 * Prioridad: Firebase > Supabase > IndexedDB
 */
export function getDatabaseConfig(): DatabaseConfig {
  // Si está forzado IDB, retornar IDB
  if (__FORCE_IDB) {
    return { provider: 'idb' };
  }

  // Verificar si Firebase está habilitado
  const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  if (useFirebase && firebaseApiKey && firebaseProjectId) {
    return {
      provider: 'firebase',
      firebaseApiKey,
      firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId,
      firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };
  }

  // Verificar Supabase (fallback si Firebase no está habilitado)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseKey) {
    return {
      provider: 'supabase',
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
    };
  }

  // Fallback a IndexedDB si ninguno está configurado
  return { provider: 'idb' };
}

/**
 * Verifica si Firebase está habilitado y configurado
 */
export function isFirebaseEnabled(): boolean {
  if (__FORCE_IDB) return false;
  const cfg = getDatabaseConfig();
  return cfg.provider === 'firebase' && !!cfg.firebaseApiKey && !!cfg.firebaseProjectId;
}

/**
 * Verifica si Supabase está habilitado y configurado
 */
export function isSupabaseEnabled(): boolean {
  if (__FORCE_IDB) return false;
  const cfg = getDatabaseConfig();
  return cfg.provider === 'supabase' && !!cfg.supabaseUrl && !!cfg.supabaseAnonKey;
}

/**
 * Obtiene el proveedor actual de base de datos
 */
export function getCurrentProvider(): DatabaseProvider {
  return getDatabaseConfig().provider;
}
