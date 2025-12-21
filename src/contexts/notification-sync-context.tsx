"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';

interface NotificationSyncContextType {
  isEnabled: boolean;
  lastSyncTime: Date | null;
  healthScore: number;
  enable: () => void;
  disable: () => void;
  forceSync: () => Promise<void>;
}

const NotificationSyncContext = createContext<NotificationSyncContextType | undefined>(undefined);

export function NotificationSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [healthScore, setHealthScore] = useState(100);
  const [syncService, setSyncService] = useState<any>(null);

  // Inicializar el servicio de sincronización
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      // Cargar el servicio de sincronización
      const loadSyncService = async () => {
        try {
          // Intentar cargar desde window primero
          if ((window as any).NotificationSyncService) {
            const service = new (window as any).NotificationSyncService();
            setSyncService(service);
            
            // Activar automáticamente para usuarios autenticados
            service.enable();
            setIsEnabled(true);
            
            // Configurar monitoreo cada 30 segundos
            const monitor = setInterval(() => {
              const stats = service.getStats();
              const report = service.generateStatusReport();
              
              setLastSyncTime(stats.lastSyncTime ? new Date(stats.lastSyncTime) : null);
              setHealthScore(report.healthScore);
            }, 30000);
            
            return () => clearInterval(monitor);
          } else {
            // Si no está disponible, crearlo manualmente
            console.log('NotificationSyncService no disponible, creando instancia manual');
            
            // Crear servicio básico
            const basicService = {
              enable: () => setIsEnabled(true),
              disable: () => setIsEnabled(false),
              getStats: () => ({ lastSyncTime: null }),
              generateStatusReport: () => ({ healthScore: 100 }),
              forceSync: async () => {
                console.log('ForceSync llamado');
                setLastSyncTime(new Date());
              }
            };
            
            setSyncService(basicService);
            setIsEnabled(true);
          }
        } catch (error) {
          console.error('Error loading notification sync service:', error);
        }
      };
      
      loadSyncService();
    }
  }, [user]);

  const enable = useCallback(() => {
    if (syncService) {
      syncService.enable();
      setIsEnabled(true);
    }
  }, [syncService]);

  const disable = useCallback(() => {
    if (syncService) {
      syncService.disable();
      setIsEnabled(false);
    }
  }, [syncService]);

  const forceSync = useCallback(async () => {
    if (syncService) {
      await syncService.forceSync();
      const stats = syncService.getStats();
      setLastSyncTime(stats.lastSyncTime ? new Date(stats.lastSyncTime) : null);
    }
  }, [syncService]);

  const value = {
    isEnabled,
    lastSyncTime,
    healthScore,
    enable,
    disable,
    forceSync
  };

  return (
    <NotificationSyncContext.Provider value={value}>
      {children}
    </NotificationSyncContext.Provider>
  );
}

export function useNotificationSyncContext() {
  const context = useContext(NotificationSyncContext);
  if (context === undefined) {
    throw new Error('useNotificationSyncContext must be used within a NotificationSyncProvider');
  }
  return context;
}
