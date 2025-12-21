"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Database, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import type { UploadProgress } from '@/hooks/useGradesSQL';

interface Props {
  open: boolean;
  progress: UploadProgress | null;
  onClose: () => void;
  title?: string;
  kind?: 'grades' | 'attendance';
}

export function GradesImportProgress({ 
  open, 
  progress, 
  onClose, 
  title,
  kind = 'grades'
}: Props) {
  const { translate: t } = useLanguage();
  const defaultTitle = kind === 'attendance' 
    ? t('bulkAttendanceUploadTitle', 'Bulk Attendance Upload to SQL')
    : t('bulkGradesUploadTitle', 'Bulk Grades Upload to SQL');
  const [timer, setTimer] = useState(0);
  // 🔧 FIX: Usar useRef para poder actualizar el valor cuando el modal se abre
  const [localStartRef, setLocalStartRef] = useState<number>(() => Date.now());
  
  // 🔧 FIX: Resetear el timer cuando el modal se abre (open cambia a true)
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Modal acaba de abrirse
      setTimer(0);
      setLocalStartRef(Date.now());
    }
    prevOpenRef.current = open;
  }, [open]);
  
  // Debug: registrar cambios de progreso para diagnosticar NaN/0%
  useEffect(() => {
    try {
      if (progress) {
        const dbg = {
          current: (progress as any).current,
          total: (progress as any).total,
          percent: (progress as any).percent,
          phase: (progress as any).phase,
        };
        // eslint-disable-next-line no-console
        console.log('📦 [GradesImportProgress] progress:', dbg);
      }
    } catch {}
  }, [progress]);
  // No permitir cerrar cuando aún no hay progreso (estado previo/franja) o mientras procesa
  const canClose = useMemo(() => {
    if (!progress) return false;
    const reachedEnd = progress.total > 0 && progress.current >= progress.total;
    // Detectar estado completado o error en diferentes idiomas/formatos
    const phaseNorm = (progress.phase || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isCompleted = phaseNorm === 'completado' || 
                        phaseNorm.startsWith('completado') || 
                        phaseNorm === 'completed' ||
                        phaseNorm.startsWith('completed') ||
                        phaseNorm.includes('carga completada') ||
                        phaseNorm.includes('upload completed');
    const isError = phaseNorm === 'error' || phaseNorm.startsWith('error') || phaseNorm.includes('❌');
    return isCompleted || isError || reachedEnd;
  }, [progress]);
  
  // 🔧 FIX: Auto-cerrar el modal 3 segundos después de completar
  useEffect(() => {
    if (canClose && open) {
      const timeout = setTimeout(() => {
        console.log('⏱️ Auto-cerrando modal después de 3 segundos...');
        onClose();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [canClose, open, onClose]);
  
  // Id estable para enfocar el botón de cierre cuando sea posible
  const closeBtnId = 'progress-close-btn';

  useEffect(() => {
    let iv: any;
    if (progress && !canClose) {
      // 🔧 FIX: Validar que startTime sea un número válido Y mayor a 0 (0 es timestamp inválido)
      const hasValidStartTime = typeof progress.startTime === 'number' && 
                                 !Number.isNaN(progress.startTime) && 
                                 progress.startTime > 0;
      const start = hasValidStartTime ? progress.startTime : localStartRef;
      iv = setInterval(() => setTimer(Date.now() - start), 200);
    } else if (progress) {
      const ms = typeof progress.elapsedTime === 'number' ? progress.elapsedTime : timer;
      setTimer(ms);
    }
    return () => iv && clearInterval(iv);
  }, [progress, canClose, localStartRef]);

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  const phaseIcon = (ph?: string) => {
    switch (ph) {
      case 'conectando':
      case 'procesando':
      case 'finalizando':
        return <Database className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completado':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-500" />;
    }
  };

  const phaseLabel = (ph?: string) => {
    if (!ph) return kind === 'attendance' 
      ? t('progressProcessingAttendance', 'Processing attendance') 
      : t('progressProcessingGrades', 'Processing grades');
    
    // Normalizar para comparación
    const phLower = ph.toLowerCase();
    
    // Casos conocidos
    if (phLower === 'conectando') return t('progressConnecting', 'Connecting to SQL');
    if (phLower === 'uploadingtosql' || phLower.includes('subiendo a base de datos') || phLower.includes('uploading to local database')) return t('uploadingToSQL', 'Uploading to local database...');
    if (phLower === 'finalizando') return t('progressFinalizing', 'Finalizing upload');
    if (phLower === 'completado' || phLower === 'completed') return t('progressCompleted', 'Completed');
    if (phLower === 'error' || phLower.startsWith('error')) return t('progressError', 'Error');
    if (phLower === 'procesando') return kind === 'attendance' 
      ? t('progressProcessingAttendance', 'Processing attendance') 
      : t('progressProcessingGrades', 'Processing grades');
    
    // 🔧 FIX: Para cualquier otro valor, mostrar el texto real del phase
    // Esto permite ver estados como "Preparando...", "Subiendo archivo...", etc.
    return ph;
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(o) => { 
        if (o === false && canClose) onClose(); 
      }}
    >
      <DialogContent 
        className="sm:max-w-2xl max-h-[80vh] overflow-hidden" 
        // Evitar que desaparezca por clic fuera o Escape mientras procesa
        onPointerDownOutside={(e) => { if (!canClose) e.preventDefault(); }}
        onInteractOutside={(e) => { if (!canClose) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (!canClose) e.preventDefault(); }}
        onOpenAutoFocus={(e) => {
          try {
            // Mantener el foco dentro del modal; si hay botón de cierre habilitado, darle foco
            const btn = document.getElementById(closeBtnId) as HTMLButtonElement | null;
            if (btn) {
              e.preventDefault();
              btn.focus();
            } else {
              // Si aún no hay botón (estado previo), enfocar contenedor preliminar
              const pre = document.getElementById('progress-preparing') as HTMLDivElement | null;
              if (pre) {
                e.preventDefault();
                pre.focus();
              }
            }
          } catch {}
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            {title || defaultTitle}
          </DialogTitle>
        </DialogHeader>

        {progress ? (
          <div className="space-y-6">
            {/* Fase actual y cronómetro */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {phaseIcon(progress.phase)}
                <span className="font-medium">{phaseLabel(progress.phase)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{fmt(timer)}</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {progress.current}/{progress.total}
                </Badge>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <Progress 
                value={
                  progress.total && progress.total > 0 && !isNaN(progress.total) && !isNaN(progress.current)
                    ? Math.min(100, (progress.current / progress.total) * 100)
                    : 0
                } 
                className="h-3" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {
                    progress.total && progress.total > 0 && !isNaN(progress.total) && !isNaN(progress.current)
                      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
                      : 0
                  }% {t('progressPercentComplete', 'completed')}
                </span>
                <span>
                  {(() => {
                    // Usar 'created' si está disponible, sino calcular de current - errors
                    const succ = typeof (progress as any).created === 'number' 
                      ? (progress as any).created 
                      : typeof progress.success === 'number' 
                        ? progress.success 
                        : Math.max(0, (progress.current || 0) - (progress.errors || 0));
                    return <>✅ {succ} | ❌ {progress.errors || 0}</>;
                  })()}
                </span>
              </div>
            </div>

            {/* Logs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('progressActivityLog', 'Activity Log')}</span>
                {progress.logs?.length ? (
                  <Badge variant="secondary" className="text-xs">
                    {progress.logs.length} {t('progressEvents', 'events')}
                  </Badge>
                ) : null}
              </div>
              <ScrollArea className="h-48 w-full border rounded-md p-3 bg-muted/30">
                <div className="space-y-1">
                  {(!progress.logs || progress.logs.length === 0) ? (
                    <div className="text-sm text-muted-foreground italic">
                      {t('progressWaitingEvents', 'Waiting for events...')}
                    </div>
                  ) : (
                    progress.logs.map((log, i) => (
                      <div 
                        key={i} 
                        className={`text-xs font-mono p-1 rounded ${
                          log.includes('❌') ? 'text-red-600 bg-red-50 dark:bg-red-950' :
                          log.includes('✅') ? 'text-green-600 bg-green-50 dark:bg-green-950' :
                          log.includes('⚠️') ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950' :
                          'text-foreground'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Botón de cierre */}
            <div className="flex justify-end">
              {canClose ? (
                <Button 
                  id={closeBtnId} 
                  onClick={() => {
                    console.log('🔘 Botón Cerrar clickeado, llamando onClose...');
                    onClose();
                  }} 
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('progressClose', 'Close')}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  {t('progressPleaseWait', 'Processing... Please wait')}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Estado previo a iniciar el progreso (franja inicial): bloquear cierre y mantener foco
          <div id="progress-preparing" tabIndex={-1} className="space-y-4 outline-none">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              {t('progressPreparingFile', 'Preparing file...')}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('progressConnectingValidating', 'Connecting and validating data to start upload.')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default GradesImportProgress;