'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICardProps } from './types';

/**
 * Componente modular para tarjetas de KPI (Indicadores Clave de Rendimiento)
 * Usado para: Estudiantes Aprobados, Reprobados, Promedio General, Promedio Destacado
 */
export default function KPICard({
  title,
  value,
  subtitle,
  color,
  filterDescription,
  isLoading = false,
  showDash = false,
  showMessage,
}: KPICardProps) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    fuchsia: 'text-fuchsia-400',
    rose: 'text-rose-400',
  };

  const bgColorClasses = {
    emerald: 'bg-emerald-500/10',
    blue: 'bg-blue-500/10',
    fuchsia: 'bg-fuchsia-500/10',
    rose: 'bg-rose-500/10',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showMessage ? (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-muted-foreground">—</div>
            <div className="text-xs text-muted-foreground mt-1">{showMessage}</div>
          </div>
        ) : isLoading ? (
          <div className={`h-12 rounded-md ${bgColorClasses[color]} animate-pulse`} />
        ) : (
          <>
            <div className={`text-5xl font-extrabold ${colorClasses[color]}`}>
              {showDash || value === undefined || value === null
                ? '—'
                : typeof value === 'number'
                ? value > 0
                  ? value
                  : '—'
                : value}
            </div>
            {subtitle && (
              <div className="mt-1 text-xs text-muted-foreground leading-snug">
                <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {subtitle}
                </div>
                {filterDescription && (
                  <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {filterDescription}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Componente para el grid de 4 tarjetas KPI
 */
export function KPICardsGrid({
  approvedCount,
  failedCount,
  overallAvgPct,
  standoutAvgPct,
  totalStudents,
  standoutCount,
  standoutIsFallbackTop,
  passPercent,
  filterParts,
  isLoading,
  showFilterMessage,
  translate,
}: {
  approvedCount: number;
  failedCount: number;
  overallAvgPct?: number;
  standoutAvgPct?: number;
  totalStudents: number;
  standoutCount: number;
  standoutIsFallbackTop?: boolean;
  passPercent: number;
  filterParts: string[];
  isLoading?: boolean;
  showFilterMessage?: boolean;
  translate: (key: string, fallback?: string) => string;
}) {
  const t = translate;
  const filterDescription = filterParts.length > 0 ? filterParts.join(' • ') : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-section>
      <KPICard
        title={t('approvedStudents', 'Estudiantes Aprobados')}
        value={approvedCount}
        color="emerald"
        subtitle={`≥ ${passPercent}% • ${t('total', 'Total')}: ${totalStudents}`}
        filterDescription={filterDescription}
        isLoading={isLoading}
        showMessage={showFilterMessage ? t('removeFiltersToSeeApproved', 'Quita todos los filtros para ver estudiantes aprobados') : undefined}
      />

      <KPICard
        title={t('failedStudents', 'Estudiantes Reprobados')}
        value={failedCount}
        color="blue"
        subtitle={`< ${passPercent}% • ${t('total', 'Total')}: ${totalStudents}`}
        filterDescription={filterDescription}
        isLoading={isLoading}
        showMessage={showFilterMessage ? t('removeFiltersToSeeFailures', 'Quita todos los filtros para ver estudiantes reprobados') : undefined}
      />

      <KPICard
        title={t('avgAllStudents', 'Promedio Todos Estudiantes')}
        value={typeof overallAvgPct === 'number' ? `${overallAvgPct.toFixed(1)}%` : undefined}
        color="blue"
        subtitle={`${t('overallAverageTotalPrefix', 'Promedio General • Total:')} ${totalStudents}`}
        filterDescription={filterDescription}
        isLoading={isLoading}
      />

      <KPICard
        title={t('topStudentAvg', 'Promedio Estudiantes Destacados')}
        value={typeof standoutAvgPct === 'number' ? `${standoutAvgPct.toFixed(1)}%` : undefined}
        color="fuchsia"
        subtitle={
          standoutIsFallbackTop
            ? t('bestAvailableAvgNoStandouts', 'Mejor promedio disponible • Sin destacados ≥ 90%')
            : `${t('gte90', '≥ 90%')} • ${t('standouts', 'Destacados')}: ${standoutCount}`
        }
        filterDescription={filterDescription}
        isLoading={isLoading}
      />
    </div>
  );
}
