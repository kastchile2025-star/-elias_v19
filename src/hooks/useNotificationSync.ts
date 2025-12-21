// Hook para integrar el servicio de sincronización de notificaciones
// /src/hooks/useNotificationSync.ts

import { useState, useEffect, useCallback } from 'react';

export interface NotificationSyncStats {
  totalSyncs: number;
  ghostsRemoved: number;
  notificationsCreated: number;
  lastSyncDuration: number;
  errors: Array<{
    timestamp: string;
    error: string;
    stack?: string;
  }>;
}

export interface NotificationSyncReport {
  timestamp: string;
  isEnabled: boolean;
  lastSyncTime: Date | null;
  syncInterval: number;
  stats: NotificationSyncStats;
  data: {
    tasksCount: number;
    notificationsCount: number;
    commentsCount: number;
  };
  issues: {
    ghostNotifications: number;
    orphanTasks: number;
    orphanComments: number;
    duplicateNotifications: number;
  };
  healthScore: number;
}

export interface UseNotificationSyncReturn {
  isEnabled: boolean;
  lastSyncTime: Date | null;
  stats: NotificationSyncStats;
  healthScore: number;
  isLoading: boolean;
  error: string | null;
  
  // Métodos de control
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  forceSync: () => Promise<void>;
  
  // Configuración
  setInterval: (milliseconds: number) => void;
  setDebugMode: (enabled: boolean) => void;
  
  // Información
  generateReport: () => NotificationSyncReport;
  checkConsistency: () => any;
  clearStats: () => void;
}

export const useNotificationSync = (): UseNotificationSyncReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<NotificationSyncStats>({
    totalSyncs: 0,
    ghostsRemoved: 0,
    notificationsCreated: 0,
    lastSyncDuration: 0,
    errors: []
  });
  const [healthScore, setHealthScore] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncService, setSyncService] = useState<any>(null);

  // Inicializar el servicio de sincronización
  useEffect(() => {
    const service = (window as any).NotificationSyncService;
    
    if (service) {
      setSyncService(service);
      updateState(service);
      
      // Configurar listener para actualizaciones
      const updateInterval = window.setInterval(() => {
        updateState(service);
      }, 5000); // Actualizar cada 5 segundos
      
      return () => window.clearInterval(updateInterval);
    } else {
      setError('NotificationSyncService no disponible');
    }
  }, []);

  // Actualizar estado desde el servicio
  const updateState = useCallback((service: any) => {
    try {
      const serviceStats = service.getStats();
      const report = service.generateStatusReport();
      
      setIsEnabled(serviceStats.isEnabled);
      setLastSyncTime(serviceStats.lastSyncTime);
      setStats(serviceStats);
      setHealthScore(report.healthScore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  // Métodos de control
  const enable = useCallback(() => {
    if (!syncService) return;
    
    try {
      syncService.enable();
      setIsEnabled(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar sincronización');
    }
  }, [syncService]);

  const disable = useCallback(() => {
    if (!syncService) return;
    
    try {
      syncService.disable();
      setIsEnabled(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar sincronización');
    }
  }, [syncService]);

  const toggle = useCallback(() => {
    if (isEnabled) {
      disable();
    } else {
      enable();
    }
  }, [isEnabled, enable, disable]);

  const forceSync = useCallback(async () => {
    if (!syncService) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await syncService.forcSync();
      updateState(syncService);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en sincronización forzada');
    } finally {
      setIsLoading(false);
    }
  }, [syncService, updateState]);

  // Métodos de configuración
  const setInterval = useCallback((milliseconds: number) => {
    if (!syncService) return;
    
    try {
      syncService.setInterval(milliseconds);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar intervalo');
    }
  }, [syncService]);

  const setDebugMode = useCallback((enabled: boolean) => {
    if (!syncService) return;
    
    try {
      syncService.setDebugMode(enabled);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar modo debug');
    }
  }, [syncService]);

  // Métodos de información
  const generateReport = useCallback((): NotificationSyncReport => {
    if (!syncService) {
      throw new Error('Servicio de sincronización no disponible');
    }
    
    return syncService.generateStatusReport();
  }, [syncService]);

  const checkConsistency = useCallback(() => {
    if (!syncService) return null;
    
    return syncService.checkConsistency();
  }, [syncService]);

  const clearStats = useCallback(() => {
    if (!syncService) return;
    
    try {
      syncService.clearStats();
      updateState(syncService);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar estadísticas');
    }
  }, [syncService, updateState]);

  return {
    isEnabled,
    lastSyncTime,
    stats,
    healthScore,
    isLoading,
    error,
    
    // Métodos de control
    enable,
    disable,
    toggle,
    forceSync,
    
    // Configuración
    setInterval,
    setDebugMode,
    
    // Información
    generateReport,
    checkConsistency,
    clearStats
  };
};
