"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LocalStorageManager } from '@/lib/education-utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedYear: number;
  onCreated?: (newYear: number) => void;
  t?: (key: string, fallback?: string) => string;
};

export function NewYearDialog({ open, onOpenChange, selectedYear, onCreated, t }: Props) {
  const tt = (key: string, fb?: string) => (t ? t(key, fb) : (fb || key));
  const [newYearValue, setNewYearValue] = useState<string>('');
  const [cloneFromCurrent, setCloneFromCurrent] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      setNewYearValue(String(new Date().getFullYear()));
      setCloneFromCurrent(true);
    }
  }, [open]);

  const handleCreate = () => {
    const target = Number(newYearValue);
    if (!Number.isFinite(target) || String(target).length !== 4) {
      // No toast here to keep this component dumb; let parent show messages if desired
      return;
    }
    try {
      LocalStorageManager.bootstrapYear(target, cloneFromCurrent ? selectedYear : undefined);
      onCreated?.(target);
      onOpenChange(false);
    } catch (e) {
      // Parent should handle error toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tt('newYear', 'Nuevo Año')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="newYearInput">{tt('enterNewYear', 'Ingresa el nuevo año (YYYY)')}</Label>
            <Input
              id="newYearInput"
              value={newYearValue}
              onChange={(e) => setNewYearValue(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
              placeholder={String(new Date().getFullYear())}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{tt('copyDataFromYear', 'Copiar datos desde el año actual')}</div>
              <div className="text-muted-foreground">{selectedYear}</div>
            </div>
            <Switch checked={cloneFromCurrent} onCheckedChange={setCloneFromCurrent} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate}>{tt('create', 'Crear')}</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>{tt('cancel', 'Cancelar')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewYearDialog;
