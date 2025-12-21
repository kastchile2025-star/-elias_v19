"use client";

import React, { useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { UploadProgress } from "@/hooks/useGradesSQL";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number | null; // null = eliminar TODO
  progress?: UploadProgress | null;
};

export default function GradesDeleteProgress({ open, onOpenChange, year, progress }: Props) {
  const deleteProgress = progress || null;

  const percent = useMemo(() => {
    if (!deleteProgress) return 0;
    const total = deleteProgress.total || 0;
    const current = deleteProgress.current || 0;

    // 1) Progreso real basado en conteo si lo tenemos
    const real = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : null;

    // 2) Heurística de avance visual por fases para evitar quedarse en 0%
    const phase = deleteProgress.phase || 'conectando';
    const logs = deleteProgress.logs || [];
    const has = (s: string) => logs.some(l => l.toLowerCase().includes(s));

    let heuristic = 5; // base mínima visible
    if (phase === 'conectando') heuristic = 8;
    else if (phase === 'procesando') {
      heuristic = 18; // conectados y preparando
      if (has('actividades')) heuristic = Math.max(heuristic, 25);
      if (has('eliminando calificaciones') || has('eliminando todas')) heuristic = Math.max(heuristic, 35);
      if (has('método directo') || has('usando método') || has('lote')) heuristic = Math.max(heuristic, 45);
      // Si hay progreso real, siempre usarlo
      if (current > 0 && total > 0) {
        heuristic = Math.max(heuristic, real || 0);
      }
    }
    else if (phase === 'finalizando') heuristic = 95;
    else if (phase === 'completado') heuristic = 100;
    else if (phase === 'error') heuristic = Math.max(real ?? 0, 95);

    // 3) SIEMPRE preferir el valor real si existe y es mayor que 0
    const value = (real != null && real > 0) ? real : heuristic;
    return Math.min(100, Math.max(0, value));
  }, [deleteProgress]);

  useEffect(() => {
    if (!open) return;
    // Autocerrar cuando la fase está completada después de un pequeño delay
    if (deleteProgress?.phase === 'completado') {
      const t = setTimeout(() => onOpenChange(false), 1500);
      return () => clearTimeout(t);
    }
  }, [open, deleteProgress?.phase, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {year === null 
              ? 'Eliminando datos de la Base de Firebase' 
              : `Eliminando datos del año ${year}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Fase: <span className="font-medium text-foreground">{deleteProgress?.phase || '—'}</span>
          </div>
          <Progress value={percent} />
          <div className="text-xs text-muted-foreground">
            {(deleteProgress?.logs || []).slice(-5).map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div className="text-xs flex gap-4 text-muted-foreground">
            <span>Eliminadas: {deleteProgress?.success ?? 0}</span>
            <span>Errores: {deleteProgress?.errors ?? 0}</span>
            <span>Tiempo: {deleteProgress?.elapsedTime ? Math.round(deleteProgress.elapsedTime / 1000) + 's' : '—'}</span>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
