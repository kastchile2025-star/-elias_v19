"use client";

import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AIStatusIndicator() {
  const [aiStatus, setAiStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    let isActive = true; // evita setState después de unmount
    const checkAIStatus = async () => {
      try {
        setAiStatus('checking');
        
        // Usar la URL absoluta en lugar de relativa para evitar problemas en Codespaces
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const apiUrl = `${baseUrl}/api/ai-status`;
        
        console.log('🔍 Checking AI status at:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!isActive) return;
        setAiStatus(data.isActive ? 'active' : 'inactive');
        setStatusMessage(data.reason || 'Estado desconocido');
        setLastCheck(new Date().toLocaleTimeString());
        console.log('✅ AI Status Check:', data);
      } catch (error) {
        // Determinar el tipo de error para mensaje más específico y logging adecuado
        // Determinar el tipo de error para mensaje más específico
        let errorMessage = 'Error de conexión';
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Timeout - Servidor no responde';
            // No spamear consola en abortos esperados por timeout
            console.debug('⏱️ AI status check aborted (timeout).');
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'No se puede conectar al servidor';
          } else {
            errorMessage = error.message;
          }
        } else {
          console.error('❌ Error checking AI status (unknown error type):', error);
        }
        
        if (!isActive) return;
        setAiStatus('inactive');
        setStatusMessage(errorMessage);
        setLastCheck(new Date().toLocaleTimeString());
      }
    };
    
    // Check immediately
    checkAIStatus();
    
    // Check every 30 seconds for better responsiveness
    const interval = setInterval(checkAIStatus, 30000);
    
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusInfo = () => {
    switch (aiStatus) {
      case 'checking':
        return {
          color: 'bg-yellow-500',
          ring: 'ring-yellow-200',
          animate: 'animate-pulse',
          title: '🔄 Verificando IA...',
          description: 'Comprobando el estado del sistema de inteligencia artificial'
        };
      case 'active':
        return {
          color: 'bg-green-500',
          ring: 'ring-green-200',
          animate: 'animate-pulse',
          title: '✅ IA Activa',
          description: `Sistema de IA funcionando correctamente\n${statusMessage}\nÚltima verificación: ${lastCheck}`
        };
      case 'inactive':
        return {
          color: 'bg-red-500',
          ring: 'ring-red-200',
          animate: '',
          title: '❌ IA Inactiva',
          description: `${statusMessage}\nÚltima verificación: ${lastCheck}\n\nPara activar la IA:\n1. Configura GOOGLE_AI_API_KEY (recomendado) o GOOGLE_API_KEY/GEMINI_API_KEY en .env.local\n2. Reinicia el servidor de desarrollo`
        };
      default:
        return {
          color: 'bg-gray-500',
          ring: 'ring-gray-200',
          animate: '',
          title: '? Estado desconocido',
          description: 'Estado del sistema IA no determinado'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center ml-2 cursor-help">
            <div 
              className={`h-3 w-3 rounded-full ${statusInfo.color} shadow-lg ring-2 ${statusInfo.ring} ${statusInfo.animate}`}
              role="status"
              aria-label={statusInfo.title}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-sm">
            <div className="font-semibold mb-1">{statusInfo.title}</div>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {statusInfo.description}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
