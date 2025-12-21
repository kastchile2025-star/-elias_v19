'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Placeholder de carga para el gráfico de asistencia
 */
export function AttendanceChartSkeleton() {
  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <div className="h-6 w-48 bg-muted/30 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-64 bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground/40 text-sm">Cargando gráfico...</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder de carga para la tarjeta de Insights
 */
export function InsightsSkeleton() {
  return (
    <Card className="min-h-[400px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted/30 rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted/30 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-3/5 bg-muted/30 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder de carga para el gráfico de comparación de cursos
 */
export function CourseComparisonSkeleton() {
  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-muted/30 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted/30 rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground/40 text-sm">Cargando comparación...</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder de carga para el gráfico de período
 */
export function PeriodChartSkeleton() {
  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="h-6 w-44 bg-muted/30 rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-muted/20 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-muted/30 rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56 bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground/40 text-sm">Cargando datos del período...</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder de carga para las tarjetas KPI
 */
export function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-12 w-20 bg-muted/30 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Placeholder de carga para las tarjetas de información
 */
export function InfoCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-muted/30 rounded animate-pulse mr-2" />
              <div className="h-4 w-20 bg-muted/30 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-12 bg-muted/30 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Placeholder de carga para la tarjeta de porcentaje de asistencia
 */
export function AttendancePercentSkeleton() {
  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700">
      <CardContent className="py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-200/50 animate-pulse" />
        <div>
          <div className="h-8 w-24 bg-emerald-200/50 rounded animate-pulse mb-1" />
          <div className="h-3 w-32 bg-emerald-200/30 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
