'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import TrendChart from '@/components/charts/TrendChart';

// Tipos
type Period = 'all' | '7d' | '30d' | '90d';
type Level = 'basica' | 'media';
type Semester = 'all' | 'S1' | 'S2';

export interface AttendanceTrendChartProps {
  period: Period;
  filters: {
    semester?: Exclude<Semester, 'all'>;
    courseId?: string;
    sectionId?: string;
    level?: Level;
  };
  year: number;
  titleSummary?: string;
  onChangePeriod?: (p: Period) => void;
  // Datos precargados o callback para obtenerlos
  presentSeries?: number[];
  absentSeries?: number[];
  labels?: string[];
  isLoading?: boolean;
}

/**
 * Componente de gráfico de tendencia de asistencia
 * Renderiza un gráfico de línea mostrando asistencia a lo largo del tiempo
 */
function ResponsiveTrendChart({ 
  data, 
  labels, 
  color, 
  valueFormat, 
  percentGrid, 
  yAxis, 
  highlightLastValue, 
  yDomain, 
  yTicks,
  forceAlignment 
}: {
  data: Array<number | null | undefined>;
  labels?: string[];
  color?: string;
  valueFormat?: (v: number) => string;
  percentGrid?: boolean;
  yAxis?: boolean;
  highlightLastValue?: boolean;
  yDomain?: { min: number; max: number };
  yTicks?: number[];
  forceAlignment?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        setHeight(Math.max(200, containerHeight - 20));
      }
    };

    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <TrendChart
        data={data}
        labels={labels}
        color={color}
        height={height}
        valueFormat={valueFormat}
        percentGrid={percentGrid}
        yAxis={yAxis}
        highlightLastValue={highlightLastValue}
        yDomain={yDomain}
        yTicks={yTicks}
        forceAlignment={forceAlignment}
      />
    </div>
  );
}

export default function AttendanceTrendChart({
  period,
  filters,
  year,
  titleSummary,
  onChangePeriod,
  presentSeries = [],
  absentSeries = [],
  labels = [],
  isLoading = false,
}: AttendanceTrendChartProps) {
  const { translate, language } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  const [viewMode, setViewMode] = useState<'present' | 'absent'>('present');
  const [zoomY, setZoomY] = useState(false);

  // Calcular dominio Y basado en los datos
  const yDomain = useMemo(() => {
    if (!zoomY) return { min: 0, max: 100 };
    
    const series = viewMode === 'present' ? presentSeries : absentSeries;
    const validValues = series.filter((v): v is number => typeof v === 'number' && !isNaN(v));
    
    if (validValues.length === 0) return { min: 0, max: 100 };
    
    const minVal = Math.min(...validValues);
    const maxVal = Math.max(...validValues);
    const padding = (maxVal - minVal) * 0.1 || 10;
    
    return {
      min: Math.max(0, Math.floor(minVal - padding)),
      max: Math.min(100, Math.ceil(maxVal + padding))
    };
  }, [viewMode, presentSeries, absentSeries, zoomY]);

  const hasData = presentSeries.length > 0 && presentSeries.some(v => typeof v === 'number');

  return (
    <Card className="flex flex-col min-h-[400px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="w-5 h-5" />
              {t('attendanceTrend', 'Tendencia de Asistencia')}
            </CardTitle>
            {titleSummary && (
              <div className="mt-1 text-sm text-muted-foreground/80">
                {titleSummary}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Selector Presentes/Ausentes */}
            <div className="flex rounded-lg border border-border/50 overflow-hidden">
              <button
                onClick={() => setViewMode('present')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'present'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {t('present', 'Presentes')}
              </button>
              <button
                onClick={() => setViewMode('absent')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'absent'
                    ? 'bg-rose-500 text-white'
                    : 'bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {t('absent', 'Ausentes')}
              </button>
            </div>
            
            {/* Botón Zoom */}
            <button
              onClick={() => setZoomY(!zoomY)}
              className={`inline-flex items-center justify-center rounded-lg border w-8 h-8 text-xs font-medium transition-all duration-200 ${
                zoomY
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/50 bg-background/60 text-foreground hover:bg-accent/50'
              }`}
              title={zoomY ? t('restoreScale', 'Restaurar escala') : t('zoomToData', 'Zoom a los datos')}
            >
              {zoomY ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-[320px]">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
                {t('loadingAttendanceData', 'Cargando datos de asistencia...')}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                {t('dataWillShowSoon', 'Los datos se mostrarán en unos segundos')}
              </p>
            </div>
          </div>
        ) : !hasData ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
                {t('noAttendanceData', 'Sin datos de asistencia')}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                {t('registerAttendanceToVisualize', 'Registra la asistencia de estudiantes para visualizar tendencias')}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveTrendChart
            data={viewMode === 'present' ? presentSeries : absentSeries}
            labels={labels}
            color={viewMode === 'present' ? '#10B981' : '#F43F5E'}
            valueFormat={(v) => `${v.toFixed(1)}%`}
            percentGrid
            yAxis
            highlightLastValue
            yDomain={yDomain}
            forceAlignment
          />
        )}
      </CardContent>
    </Card>
  );
}
