// Inicialización global de SQL para conectar inmediatamente después del login
import { sqlDatabase } from './sql-database';
import { setForceIDB, isFirebaseEnabled, isSupabaseEnabled } from './sql-config';
import { FirestoreDatabaseService } from './firestore-database';
import { sqlDB as idbSQL } from './idb-sql';

let isInitialized = false;
let isInitializing = false;
let connectionStatus: 'connecting' | 'connected' | 'failed' = 'connecting';

// Listeners para notificar cambios de estado
const listeners = new Set<(status: typeof connectionStatus) => void>();

export function onSQLStatusChange(callback: (status: typeof connectionStatus) => void) {
  listeners.add(callback);
  callback(connectionStatus); // Notificar estado actual inmediatamente
  return () => listeners.delete(callback);
}

function notifyStatusChange(status: typeof connectionStatus) {
  connectionStatus = status;
  listeners.forEach(callback => {
    try {
      callback(status);
    } catch (e) {
      console.warn('Error in SQL status callback:', e);
    }
  });
}

export async function initializeSQL(force = false): Promise<boolean> {
  if (isInitialized && !force) {
    return connectionStatus === 'connected';
  }
  
  if (isInitializing && !force) {
    // Esperar a que termine la inicialización en curso
    return new Promise((resolve) => {
      const checkStatus = () => {
        if (!isInitializing) {
          resolve(connectionStatus === 'connected');
        } else {
          setTimeout(checkStatus, 100);
        }
      };
      checkStatus();
    });
  }

  isInitializing = true;
  notifyStatusChange('connecting');
  
  try {
    const usingFirebase = isFirebaseEnabled();
    const usingSupabase = isSupabaseEnabled();
    
    // Si no hay Firebase ni Supabase configurado, usar IndexedDB directamente
    if (!usingFirebase && !usingSupabase) {
      console.log('🔌 Sin Firebase/Supabase configurado - Usando IndexedDB local...');
      const startTime = Date.now();
      setForceIDB(true);
      
      try {
        const idbResult = await idbSQL.testConnection();
        const elapsed = Date.now() - startTime;
        
        if (idbResult?.success) {
          isInitialized = true;
          notifyStatusChange('connected');
          console.log(`✅ IndexedDB conectado exitosamente en ${elapsed}ms (modo local)`);
          return true;
        } else {
          notifyStatusChange('failed');
          console.warn(`❌ IndexedDB no disponible en ${elapsed}ms`);
          return false;
        }
      } catch (idbError) {
        notifyStatusChange('failed');
        console.error('Error conectando IndexedDB:', idbError);
        return false;
      }
    }
    
    console.log(`🔌 Iniciando conexión ${usingFirebase ? 'Firebase/Firestore' : 'SQL (Supabase)'}...`);
    const startTime = Date.now();
    
    // Seleccionar backend según proveedor activo
    console.log(`🔍 [DEBUG] Llamando testConnection para ${usingFirebase ? 'Firestore' : 'SQL'}...`);
    const result = usingFirebase
      ? await FirestoreDatabaseService.instance().testConnection()
      : await sqlDatabase.testConnection();
    const elapsed = Date.now() - startTime;
    console.log(`🔍 [DEBUG] testConnection result:`, result, `en ${elapsed}ms`);
    
    if (result?.success) {
      setForceIDB(false);
      isInitialized = true;
      notifyStatusChange('connected');
      console.log(`✅ ${usingFirebase ? 'Firestore' : 'SQL'} conectado exitosamente en ${elapsed}ms`);
      
      // Cargar contadores básicos en background SOLO cuando usamos Supabase
      if (!usingFirebase) {
        try {
          const currentYear = new Date().getFullYear();
          const [totalRes, yearRes] = await Promise.all([
            sqlDatabase.countAllGrades(),
            sqlDatabase.countGradesByYear(currentYear)
          ]);
          console.log(`📊 Contadores SQL: Total ${totalRes.total}, Año ${currentYear}: ${yearRes.count}`);
        } catch (e) {
          console.warn('Error precargando contadores SQL:', e);
        }
      }
      
      return true;
    } else {
      // Firebase/Supabase falló - intentar fallback a IndexedDB
      console.warn(`⚠️ ${usingFirebase ? 'Firestore' : 'Supabase'} falló, intentando IndexedDB como fallback...`);
      setForceIDB(true);
      
      try {
        const idbResult = await idbSQL.testConnection();
        if (idbResult?.success) {
          isInitialized = true;
          notifyStatusChange('connected');
          console.log(`✅ Fallback a IndexedDB exitoso`);
          return true;
        }
      } catch (idbErr) {
        console.warn('IndexedDB fallback también falló:', idbErr);
      }
      
      notifyStatusChange('failed');
      console.warn(`❌ Conexión ${usingFirebase ? 'Firestore' : 'SQL'} falló en ${elapsed}ms:`, (result as any)?.error);
      return false;
    }
  } catch (e: any) {
    // Error general - intentar IndexedDB como último recurso
    console.error('Error durante inicialización SQL:', e);
    setForceIDB(true);
    
    try {
      const idbResult = await idbSQL.testConnection();
      if (idbResult?.success) {
        isInitialized = true;
        notifyStatusChange('connected');
        console.log(`✅ Recuperación con IndexedDB exitosa`);
        return true;
      }
    } catch (idbErr) {
      console.warn('IndexedDB recuperación falló:', idbErr);
    }
    
    notifyStatusChange('failed');
    return false;
  } finally {
    isInitializing = false;
  }
}

export function getSQLStatus(): typeof connectionStatus {
  return connectionStatus;
}

export function isSQLConnected(): boolean {
  return connectionStatus === 'connected';
}

// Auto-inicializar SIEMPRE cuando se carga el módulo (incluso sin usuario logueado)
if (typeof window !== 'undefined') {
  // Inicializar SQL inmediatamente, independiente del estado de login
  console.log('🚀 Iniciando SQL desde carga del módulo...');
  
  // Delay mínimo para evitar bloquear el render inicial
  setTimeout(() => {
    initializeSQL().then(success => {
      if (success) {
        console.log('✅ SQL inicializado exitosamente desde módulo');
      } else {
        console.log('⚠️ SQL no disponible desde módulo, se reintentará en login');
      }
    });
  }, 50);
}