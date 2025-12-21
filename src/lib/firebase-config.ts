// Firebase Configuration and Initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, setPersistence, signInAnonymously, onAuthStateChanged, browserLocalPersistence, Auth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { isFirebaseEnabled, getDatabaseConfig } from './database-config';

// Flag para habilitar/deshabilitar Firebase
export const USE_FIREBASE = isFirebaseEnabled();

const cfg = getDatabaseConfig();
const firebaseConfig = {
  apiKey: cfg.firebaseApiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCX9xW0DwSf-5B9au4NmK3Qc2qF9Vtx1Co",
  authDomain: cfg.firebaseAuthDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "superjf1234-e9cbc.firebaseapp.com",
  projectId: cfg.firebaseProjectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "superjf1234-e9cbc",
  storageBucket: cfg.firebaseStorageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "superjf1234-e9cbc.firebasestorage.app",
  messagingSenderId: cfg.firebaseMessagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "742753294911",
  appId: cfg.firebaseAppId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:742753294911:web:610940c0a3c4ba5ae6768a",
  measurementId: "G-9VYKHSGDL4"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: any = null;
let firestoreInitialized = false;

/**
 * Inicializa Firebase si está habilitado y configurado
 * Usa Long Polling para compatibilidad con GitHub Codespaces y entornos con proxy
 */
export function initializeFirebase(): { app: FirebaseApp | null; db: Firestore | null } {
  if (!USE_FIREBASE) {
    const currentProvider = getDatabaseConfig().provider;
    console.log(`🔵 Firebase deshabilitado, usando ${currentProvider === 'supabase' ? 'Supabase' : 'IndexedDB'}`);
    return { app: null, db: null };
  }

  // Verificar que todas las variables estén configuradas
  const requiredVars = [
    'apiKey',
    'projectId',
  ];

  const missing = requiredVars.filter(varName => !firebaseConfig[varName as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Firebase configuración incompleta, falta:', missing.join(', '));
    return { app: null, db: null };
  }

  try {
    // Inicializar solo si no existe
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      
      // Usar initializeFirestore con Long Polling para compatibilidad con Codespaces
      // y persistencia local para funcionamiento offline
      if (typeof window !== 'undefined' && !firestoreInitialized) {
        try {
          db = initializeFirestore(app, {
            // Long Polling es más compatible con proxies y firewalls (como en Codespaces)
            experimentalForceLongPolling: true,
            // Habilitar caché local persistente con soporte multi-pestaña
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager()
            })
          });
          firestoreInitialized = true;
          console.log('✅ Firestore inicializado con Long Polling y caché persistente');
        } catch (e: any) {
          // Si falla initializeFirestore (ej: ya inicializado), usar getFirestore
          console.warn('⚠️ initializeFirestore falló, usando getFirestore:', e?.message);
          db = getFirestore(app);
        }
      } else {
        db = getFirestore(app);
      }
      
      // Inicializar Analytics solo en navegador
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
          console.log('✅ Firebase Analytics inicializado');
        } catch (e) {
          console.warn('⚠️ No se pudo inicializar Analytics:', e);
        }
      }
      // Inicializar Auth solo en navegador
      if (typeof window !== 'undefined') {
        try {
          auth = getAuth(app);
          // Persistencia local para mantener sesión anónima
          setPersistence(auth, browserLocalPersistence).catch(() => {});
          // ✅ Iniciar sesión anónima si no hay usuario autenticado (con manejo de errores de permisos)
          onAuthStateChanged(auth, (user) => {
            if (!user) {
              signInAnonymously(auth!)
                .then(() => console.info('🔐 Firebase Auth: sesión anónima iniciada'))
                .catch((e) => {
                  // ✅ Ignorar errores de permisos en auth
                  if (e?.code === 'auth/operation-not-allowed' || 
                      e?.message?.includes('permission') || 
                      e?.message?.includes('insufficient')) {
                    console.warn('⚠️ Firebase Auth: sin permisos para sesión anónima (continuando sin auth)');
                  } else {
                    console.warn('⚠️ No se pudo iniciar sesión anónima:', e?.message || e);
                  }
                });
            }
          });
        } catch (e: any) {
          // ✅ Si falla la inicialización de Auth, continuar sin ella
          if (e?.message?.includes('permission') || e?.code === 'permission-denied') {
            console.warn('⚠️ Firebase Auth: sin permisos (continuando sin auth)');
          } else {
            console.warn('⚠️ Error inicializando Firebase Auth:', e);
          }
        }
      }
      
      console.log('✅ Firebase Firestore inicializado correctamente');
    } else {
      app = getApps()[0];
      // Si ya hay una app, obtener la instancia existente de Firestore
      try {
        db = getFirestore(app);
      } catch (e) {
        console.warn('⚠️ Error obteniendo Firestore existente:', e);
      }
      // Asegurar Auth también en rama app ya inicializada
      if (typeof window !== 'undefined') {
        try {
          auth = getAuth(app);
          if (!auth.currentUser) {
            signInAnonymously(auth!).catch((e: any) => {
              // ✅ Ignorar errores de permisos
              if (e?.code === 'auth/operation-not-allowed' || 
                  e?.message?.includes('permission') || 
                  e?.message?.includes('insufficient')) {
                console.warn('⚠️ Firebase Auth: sin permisos (continuando sin auth)');
              }
            });
          }
        } catch {}
      }
      console.log('✅ Firebase Firestore ya estaba inicializado');
    }

    return { app, db };
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    return { app: null, db: null };
  }
}

/**
 * Obtiene la instancia de Firestore
 */
export function getFirestoreInstance(): Firestore | null {
  if (!db && USE_FIREBASE) {
    const { db: newDb } = initializeFirebase();
    return newDb;
  }
  return db;
}

/**
 * Prueba la conexión a Firebase con timeout
 * @returns true si Firebase responde, false si hay timeout
 */
export async function testFirebaseConnection(timeoutMs: number = 5000): Promise<boolean> {
  if (!USE_FIREBASE || !db) return false;
  
  try {
    const { getDocs, collection, limit, query } = await import('firebase/firestore');
    
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn(`⚠️ Firebase: timeout después de ${timeoutMs}ms`);
        resolve(false);
      }, timeoutMs);
    });
    
    const queryPromise = getDocs(query(collection(db, '_health_check_'), limit(1)))
      .then(() => true)
      .catch(() => {
        // Incluso si falla la query, si llegó al backend es que hay conexión
        return true;
      });
    
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (e) {
    console.warn('⚠️ Firebase: error en test de conexión:', e);
    return false;
  }
}

/**
 * Obtiene la instancia de Analytics
 */
export function getAnalyticsInstance() {
  return analytics;
}

/**
 * Verifica si Firebase está habilitado y configurado (re-export)
 */
export { isFirebaseEnabled } from './database-config';
