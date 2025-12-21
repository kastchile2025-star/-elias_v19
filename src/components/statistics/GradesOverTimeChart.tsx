'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

// Tipos
type Semester = 'all' | 'S1' | 'S2';
type Level = 'basica' | 'media';

export interface GradesOverTimeChartProps {
  comparisonType: 'notas' | 'asistencia';
  year: number;
  onYearChange?: (year: number) => void;
  filters?: {
    semester?: Exclude<Semester, 'all'>;
    level?: Level;
    courseId?: string;
    sectionId?: string;
    sectionLetter?: string;
  };
  zoomY?: boolean;
  onZoomChange?: (zoom: boolean) => void;
  // Datos de series
  series?: Array<{
    label: string;
    data: Array<number | null>;
    color: string;
  }>;
  labels?: string[];
  isLoading?: boolean;
}

/**
 * Navegador de año para el gráfico
 */
function YearNavigator({
  year,
  onChange,
  minYear,
  maxYear,
}: {
  year: number;
  onChange: (y: number) => void;
  minYear: number;
  maxYear: number;
}) {
  const { translate } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  const canPrev = year > minYear;
  const canNext = year < maxYear;

  return (
    <div className="inline-flex items-center gap-2 text-xs md:text-sm">
      <button
        className="px-2 py-1 border rounded hover:bg-muted/50 disabled:opacity-50"
        onClick={() => canPrev && onChange(Math.max(minYear, year - 1))}
        disabled={!canPrev}
        aria-label={t('prevYear', 'Año anterior')}
        title={t('prevYear', 'Año anterior')}
      >
        «
      </button>
      <span className="min-w-[4ch] text-center font-medium">{year}</span>
      <button
        className="px-2 py-1 border rounded hover:bg-muted/50 disabled:opacity-50"
        onClick={() => canNext && onChange(Math.min(maxYear, year + 1))}
        disabled={!canNext}
        aria-label={t('nextYear', 'Año siguiente')}
        title={t('nextYear', 'Año siguiente')}
      >
        »
      </button>
    </div>
  );
}

/**
 * Componente modular para gráfico de calificaciones/asistencia por período
 * Muestra promedios mensuales a lo largo del tiempo con navegación por año
 */
export default function GradesOverTimeChart({
  comparisonType,
  year,
  onYearChange,
  filters,
  zoomY: externalZoomY,
  onZoomChange,
  series = [],
  labels = [],
  isLoading = false,
}: GradesOverTimeChartProps) {
  const { translate, language } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 2;
  const maxYear = currentYear - 1;

  const [internalZoomY, setInternalZoomY] = useState(false);
  const zoomY = externalZoomY ?? internalZoomY;
  
  const [visibleSeries, setVisibleSeries] = useState<Set<number>>(new Set([0, 1]));

  const handleZoomToggle = () => {
    const newValue = !zoomY;
    setInternalZoomY(newValue);
    onZoomChange?.(newValue);
  };

  // Construir subtítulo dinámico
  const subtitle = useMemo(() => {
    const parts: string[] = [t('monthlyAveragesPercent', 'Promedios mensuales (0–100%)')];
    
    if (filters?.semester) {
      parts.push(
        filters.semester === 'S1'
          ? t('firstSemester', '1er Semestre')
          : t('secondSemester', '2do Semestre')
      );
    }
    
    if (filters?.level) {
      parts.push(
        filters.level === 'basica'
          ? t('levelBasic', 'Básica')
          : t('levelHigh', 'Media')
      );
    }
    
    return parts.join(' • ');
  }, [filters, t]);

  // Calcular dominio Y
  const yDomain = useMemo(() => {
    if (!zoomY) return { min: 0, max: 100 };
    
    const allValues: number[] = [];
    series.forEach(s => {
      s.data.forEach(v => {
        if (typeof v === 'number' && !isNaN(v)) {
          allValues.push(v);
        }
      });
    });
    
    if (allValues.length === 0) return { min: 0, max: 100 };
    
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const padding = (maxVal - minVal) * 0.1 || 10;
    
    return {
      min: Math.max(0, Math.floor(minVal - padding)),
      max: Math.min(100, Math.ceil(maxVal + padding)),
    };
  }, [series, zoomY]);

  const hasData = series.length > 0 && series.some(s => s.data.some(v => typeof v === 'number'));

  // Toggle visibilidad de serie
  const toggleSeries = (index: number) => {
    setVisibleSeries(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        if (next.size > 1) next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Card className="flex flex-col min-h-[400px]">
      <CardHeader className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground">
              {comparisonType === 'notas'
                ? t('gradesOverTimePeriod', 'Calificaciones - Periodo')
                : t('attendanceOverTimePeriod', 'Asistencia - Periodo')}
            </CardTitle>
            <div className="mt-2 text-sm text-muted-foreground/80">{subtitle}</div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <YearNavigator
              year={year}
              onChange={(y) => onYearChange?.(y)}
              minYear={minYear}
              maxYear={maxYear}
            />

            <button
              type="button"
              onClick={handleZoomToggle}
              className={`inline-flex items-center justify-center rounded-lg border w-8 h-8 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                zoomY
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'border-border/50 bg-background/60 text-foreground hover:border-primary/50 hover:bg-accent/50'
              }`}
              title={zoomY ? t('restoreScale', 'Restaurar escala') : t('zoomToData', 'Zoom a los datos')}
            >
              {zoomY ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Leyenda de series */}
        {series.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {series.map((s, idx) => (
              <button
                key={idx}
                onClick={() => toggleSeries(idx)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  visibleSeries.has(idx) ? 'opacity-100' : 'opacity-40 line-through'
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-[320px]">
        {isLoading ? (
          <div className="relative bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30 p-4 h-[300px]">
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
                  {comparisonType === 'notas'
                    ? t('loadingGradesData', 'Cargando datos de calificaciones...')
                    : t('loadingAttendanceData', 'Cargando datos de asistencia...')}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  {t('dataWillShowSoon', 'Los datos se mostrarán en unos segundos')}
                </p>
              </div>
            </div>
          </div>
        ) : !hasData ? (
          <div className="relative bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30 p-4 h-[300px]">
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
                  {comparisonType === 'notas'
                    ? t('noGradesForPeriod', 'Sin datos de calificaciones')
                    : t('noAttendanceForPeriod', 'Sin datos de asistencia')}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  {t('trySelectingAnotherPeriod', 'Prueba seleccionando otro periodo o ajusta los filtros')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <PeriodLineChart
            series={series.filter((_, idx) => visibleSeries.has(idx))}
            labels={labels}
            yDomain={yDomain}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Componente interno para renderizar gráfico de línea del período
 */
function PeriodLineChart({
  series,
  labels,
  yDomain,
}: {
  series: Array<{ label: string; data: Array<number | null>; color: string }>;
  labels: string[];
  yDomain: { min: number; max: number };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(200, containerRef.current.clientHeight - 20),
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (chartWidth <= 0 || chartHeight <= 0 || labels.length === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  const xScale = (index: number) =>
    padding.left + (index / (labels.length - 1 || 1)) * chartWidth;
  const yScale = (value: number) => {
    const range = yDomain.max - yDomain.min || 1;
    return padding.top + (1 - (value - yDomain.min) / range) * chartHeight;
  };

  // Generar paths
  const paths = series.map(s => {
    const points: string[] = [];
    let started = false;
    s.data.forEach((val, idx) => {
      if (typeof val === 'number' && !isNaN(val)) {
        const x = xScale(idx);
        const y = yScale(val);
        if (!started) {
          points.push(`M ${x} ${y}`);
          started = true;
        } else {
          points.push(`L ${x} ${y}`);
        }
      }
    });
    return points.join(' ');
  });

  // Ticks Y
  const yTicks = useMemo(() => {
    const range = yDomain.max - yDomain.min;
    const step = range <= 20 ? 5 : range <= 50 ? 10 : 20;
    const ticks: number[] = [];
    for (let v = yDomain.min; v <= yDomain.max; v += step) {
      ticks.push(v);
    }
    if (!ticks.includes(yDomain.max)) ticks.push(yDomain.max);
    return ticks;
  }, [yDomain]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid horizontal */}
        {yTicks.map((tick, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={padding.left + chartWidth}
              y2={yScale(tick)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {tick}%
            </text>
          </g>
        ))}

        {/* Labels eje X */}
        {labels.map((label, idx) => {
          const shouldShow = labels.length <= 12 || idx % Math.ceil(labels.length / 12) === 0;
          if (!shouldShow) return null;
          return (
            <text
              key={idx}
              x={xScale(idx)}
              y={height - 10}
              textAnchor="middle"
              className="text-[9px] fill-muted-foreground"
            >
              {label}
            </text>
          );
        })}

        {/* Líneas */}
        {paths.map((path, idx) => (
          <path
            key={idx}
            d={path}
            fill="none"
            stroke={series[idx].color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Puntos */}
        {series.map((s, seriesIdx) =>
          s.data.map((val, idx) => {
            if (typeof val !== 'number' || isNaN(val)) return null;
            return (
              <circle
                key={`${seriesIdx}-${idx}`}
                cx={xScale(idx)}
                cy={yScale(val)}
                r={3}
                fill={s.color}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
