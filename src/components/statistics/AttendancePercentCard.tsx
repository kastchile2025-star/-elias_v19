'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export interface AttendancePercentCardProps {
  percentage: number | undefined;
  daysTotal?: number;
  period: string;
  isLoading?: boolean;
}

/**
 * Componente modular para la tarjeta de porcentaje de asistencia
 * Muestra el % de asistencia del periodo seleccionado
 */
export default function AttendancePercentCard({
  percentage,
  daysTotal,
  period,
  isLoading = false,
}: AttendancePercentCardProps) {
  const { translate } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case '7d':
        return '(7 días)';
      case '30d':
        return '(30 días)';
      case '90d':
        return '(90 días)';
      default:
        return 'año';
    }
  };

  if (percentage === undefined && !isLoading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700 ring-2 ring-emerald-300/40">
      <CardContent className="py-4 flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-200/70 dark:bg-emerald-700/50">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-8 w-24 bg-emerald-200/50 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">
              {typeof percentage === 'number' ? `${percentage.toFixed(2)}%` : '—'}
            </div>
          )}
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase flex flex-col leading-tight">
            <span>{t('cardAttendanceTitle', 'Asistencia')}</span>
            {typeof daysTotal === 'number' && (
              <span className="text-[10px] font-normal normal-case text-emerald-600 dark:text-emerald-300/80">
                {daysTotal} días lectivos {getPeriodLabel()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
