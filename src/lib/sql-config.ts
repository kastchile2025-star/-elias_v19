// Utilidades de configuración para SQL (Firebase/Supabase/IndexedDB)
// Re-exporta desde database-config para mantener compatibilidad

export {
  type DatabaseProvider as SQLProvider,
  type DatabaseConfig as SQLConfig,
  getDatabaseConfig as getSQLConfig,
  isFirebaseEnabled,
  isSupabaseEnabled,
  getCurrentProvider,
  setForceIDB,
  isForceIDBEnabled
} from './database-config';

// Helper para verificar si hay algún backend SQL disponible (Firebase o Supabase)
export function isSQLBackendEnabled(): boolean {
  const { isFirebaseEnabled, isSupabaseEnabled } = require('./database-config');
  return isFirebaseEnabled() || isSupabaseEnabled();
}
