'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

// Tipos
type Period = 'all' | '7d' | '30d' | '90d';
type Level = 'basica' | 'media';
type Semester = 'all' | 'S1' | 'S2';

export interface CourseComparisonChartProps {
  data: Array<{ label: string; avgPct?: number; attendancePct?: number }>;
  filters: {
    courseSectionId?: string;
    level?: Level;
    courseId?: string;
    sectionId?: string;
    sectionLetter?: string;
    semester?: Exclude<Semester, 'all'>;
  };
  period: Period;
  year: number;
  comparisonType: 'notas' | 'asistencia';
  setComparisonType: (type: 'notas' | 'asistencia') => void;
  // Series de datos para el gráfico
  series?: Array<{
    label: string;
    data: Array<number | null>;
    color: string;
  }>;
  labels?: string[];
  isLoading?: boolean;
  loaderDone?: boolean;
}

/**
 * Componente modular para gráfico de comparación de cursos
 * Muestra comparación de notas o asistencia entre diferentes cursos/niveles
 */
export default function CourseComparisonChart({
  data,
  filters,
  period,
  year,
  comparisonType,
  setComparisonType,
  series = [],
  labels = [],
  isLoading = false,
  loaderDone = true,
}: CourseComparisonChartProps) {
  const { translate, language } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  const [zoomY, setZoomY] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<Set<number>>(new Set([0, 1]));

  // Construir resumen de filtros para el subtítulo
  const titleFiltersSummary = useMemo(() => {
    try {
      const parts: string[] = [];
      if (filters?.semester) {
        parts.push(filters.semester === 'S1' ? t('firstSemester', '1er Semestre') : t('secondSemester', '2do Semestre'));
      }
      if (filters?.level) {
        parts.push(filters.level === 'basica' ? t('levelBasic', 'Básica') : t('levelHigh', 'Media'));
      }
      if (parts.length === 0) {
        parts.push(`${t('academicPeriod', 'Período académico')} • ${year}`);
      } else {
        parts.push(`${year}`);
      }
      return parts.join(' • ');
    } catch {
      return '';
    }
  }, [filters, year, t]);

  // Verificar si hay datos visibles
  const hasData = series.length > 0 && series.some(s => s.data.some(v => typeof v === 'number'));

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
      max: Math.min(100, Math.ceil(maxVal + padding))
    };
  }, [series, zoomY]);

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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="w-5 h-5" />
              {t('courseComparison', 'Comparación de Cursos')}
            </CardTitle>
            {titleFiltersSummary && (
              <div className="mt-1 text-sm text-muted-foreground/80">
                {titleFiltersSummary}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle Notas/Asistencia */}
            <div className="flex rounded-lg border border-border/50 overflow-hidden">
              <button
                onClick={() => setComparisonType('notas')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  comparisonType === 'notas'
                    ? 'bg-blue-500 text-white'
                    : 'bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {t('grades', 'Notas')}
              </button>
              <button
                onClick={() => setComparisonType('asistencia')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  comparisonType === 'asistencia'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-background hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {t('attendance', 'Asistencia')}
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
        
        {/* Leyenda de series */}
        {series.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {series.map((s, idx) => (
              <button
                key={idx}
                onClick={() => toggleSeries(idx)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  visibleSeries.has(idx)
                    ? 'opacity-100'
                    : 'opacity-40 line-through'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 min-h-[320px]">
        {isLoading || !loaderDone ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
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
        ) : !hasData ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
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
                  ? t('noGradesForComparison', 'Sin datos de calificaciones para comparar')
                  : t('noAttendanceForComparison', 'Sin datos de asistencia para comparar')}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                {t('tryAnotherCourse', 'Prueba seleccionando otro curso o ajusta los filtros')}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            {/* Aquí iría el gráfico MultiTrendChart - se carga dinámicamente */}
            <MultiLineChart
              series={series.filter((_, idx) => visibleSeries.has(idx))}
              labels={labels}
              yDomain={yDomain}
              valueFormat={(v) => `${v.toFixed(1)}%`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Componente interno para renderizar gráfico multi-línea
 */
function MultiLineChart({
  series,
  labels,
  yDomain,
  valueFormat,
}: {
  series: Array<{ label: string; data: Array<number | null>; color: string }>;
  labels: string[];
  yDomain: { min: number; max: number };
  valueFormat: (v: number) => string;
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

  const xScale = (index: number) => padding.left + (index / (labels.length - 1 || 1)) * chartWidth;
  const yScale = (value: number) => {
    const range = yDomain.max - yDomain.min || 1;
    return padding.top + (1 - (value - yDomain.min) / range) * chartHeight;
  };

  // Generar paths para cada serie
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

  // Ticks del eje Y
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

        {/* Eje X labels */}
        {labels.map((label, idx) => {
          // Mostrar solo algunos labels si hay muchos
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

        {/* Líneas de las series */}
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

        {/* Puntos de datos */}
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
