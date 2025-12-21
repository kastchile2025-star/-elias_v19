"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Series = {
  data: Array<number | null>;
  label: string;
  color: string;
};

export type MultiTrendChartProps = {
  series: Series[]; // Todas las series deben tener la misma longitud
  labels?: string[]; // Etiquetas X (misma longitud que series[i].data)
  height?: number; // px
  percentGrid?: boolean; // dibuja grid 0..100
  yAxis?: boolean;
  highlightLastValue?: boolean;
  yDomain?: { min: number; max: number };
  yTicks?: number[];
  strokeWidth?: number;
};

function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, rect } as const;
}

export default function MultiTrendChart({
  series,
  labels,
  height = 224,
  percentGrid,
  yAxis = true,
  highlightLastValue = true,
  yDomain,
  yTicks,
  strokeWidth = 2.5,
}: MultiTrendChartProps) {
  const { ref, rect } = useResizeObserver<HTMLDivElement>();
  const width = rect?.width ?? 0;
  
  // Estado para hover (igual que TrendChart)
  const [hover, setHover] = useState<{ i: number; x: number } | null>(null);

  // Padding derecho ajustado para que las etiquetas de meses (ej: "Dic") no se salgan del contenedor
  const padding = { l: yAxis ? 30 : 8, r: 28, t: 12, b: 28 };
  const w = Math.max(0, width - padding.l - padding.r);
  const h = Math.max(0, height - padding.t - padding.b);

  const allValues = useMemo(() => {
    const vals: number[] = [];
    series.forEach(s => s.data.forEach(v => { if (typeof v === 'number' && isFinite(v)) vals.push(v); }));
    return vals;
  }, [series]);

  const min = yDomain?.min ?? (percentGrid ? 0 : Math.min(0, ...(allValues.length ? allValues : [0])));
  const max = yDomain?.max ?? (percentGrid ? 100 : Math.max(1, ...(allValues.length ? allValues : [1])));

  const n = Math.max(0, series[0]?.data.length || 0);
  const xOf = (i: number) => {
    if (n <= 1) return padding.l + w / 2;
    const stepX = w / (n - 1);
    return padding.l + i * stepX;
  };
  const yOf = (v: number) => padding.t + (1 - (v - min) / (max - min)) * h;

  // Construir segmentos continuos por serie
  const segmentsBySeries = useMemo(() => {
    return series.map(s => {
      const segs: { line: string; area: string }[] = [];
      const validPts: { x: number; y: number; i: number }[] = [];
      for (let i = 0; i < n; i++) {
        const v = s.data[i];
        if (typeof v === 'number' && isFinite(v)) {
          validPts.push({ x: xOf(i), y: yOf(v), i });
        }
      }
      
      if (validPts.length > 0) {
        const line = validPts.reduce((acc, p, idx) => acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
        const first = validPts[0];
        const last = validPts[validPts.length - 1];
        const baseY = padding.t + h;
        const area = `${line} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
        segs.push({ line, area });
      }
      
      return segs;
    });
  }, [series, n, w, h, min, max]);

  const yTickValues = useMemo(() => yTicks || (percentGrid ? [0,20,40,60,80,100] : undefined), [yTicks, percentGrid]);

  // Últimos puntos válidos por serie
  const lastPoints = useMemo(() => {
    return series.map(s => {
      for (let i = n - 1; i >= 0; i--) {
        const v = s.data[i];
        if (typeof v === 'number' && isFinite(v)) {
          return { i, v };
        }
      }
      return { i: -1, v: 0 };
    });
  }, [series, n]);

  // Manejar movimiento del mouse - siempre mostrar el punto más cercano con datos
  const onMouseMove = (e: React.MouseEvent) => {
    if (!rect || n === 0 || w <= 0) return;
    const mouseX = e.clientX - rect.left;
    
    // Verificar que el mouse está dentro del área del gráfico (con margen)
    if (mouseX < padding.l - 20 || mouseX > padding.l + w + 20) {
      setHover(null);
      return;
    }
    
    // Encontrar el índice más cercano basado en la posición X
    const stepX = n > 1 ? w / (n - 1) : w;
    const rawIndex = (mouseX - padding.l) / stepX;
    const idx = Math.max(0, Math.min(n - 1, Math.round(rawIndex)));
    
    // Verificar si hay datos en este índice
    const hasDataAtIdx = series.some(s => typeof s.data[idx] === 'number' && isFinite(s.data[idx]));
    
    if (hasDataAtIdx) {
      setHover({ i: idx, x: xOf(idx) });
      return;
    }
    
    // Si no hay datos en el índice exacto, buscar el más cercano
    let bestIdx = -1;
    let minDist = Infinity;
    
    for (let i = 0; i < n; i++) {
      const val = series.some(s => {
        const v = s.data[i];
        return typeof v === 'number' && isFinite(v);
      });
      if (val) {
        const dist = Math.abs(i - rawIndex);
        if (dist < minDist) {
          minDist = dist;
          bestIdx = i;
        }
      }
    }
    
    if (bestIdx >= 0) {
      setHover({ i: bestIdx, x: xOf(bestIdx) });
    }
    // No llamar setHover(null) - mantener el último hover válido
  };

  const onMouseLeave = () => setHover(null);

  // Calcular rangos de meses para el eje X (con posiciones de inicio y fin)
  const monthRanges = useMemo(() => {
    if (!labels || labels.length === 0 || w <= 0) return [];
    const ranges: Array<{ label: string; startIdx: number; endIdx: number; centerX: number; startX: number; endX: number }> = [];
    let currentMonth = '';
    let startIdx = 0;
    
    labels.forEach((label, idx) => {
      if (label !== currentMonth) {
        if (currentMonth) {
          const centerIdx = (startIdx + idx - 1) / 2;
          const startX = xOf(startIdx) - (startIdx === 0 ? 0 : (xOf(1) - xOf(0)) / 2);
          const endX = xOf(idx - 1) + (xOf(1) - xOf(0)) / 2;
          ranges.push({ label: currentMonth, startIdx, endIdx: idx - 1, centerX: xOf(centerIdx), startX, endX });
        }
        currentMonth = label;
        startIdx = idx;
      }
    });
    if (currentMonth) {
      const centerIdx = (startIdx + labels.length - 1) / 2;
      const startX = xOf(startIdx) - (startIdx === 0 ? 0 : (xOf(1) - xOf(0)) / 2);
      const endX = xOf(labels.length - 1) + (xOf(1) - xOf(0)) / 2;
      ranges.push({ label: currentMonth, startIdx, endIdx: labels.length - 1, centerX: xOf(centerIdx), startX, endX });
    }
    
    return ranges;
  }, [labels, n, w]);

  // Obtener el mes correspondiente al índice de hover
  const getMonthForIndex = (idx: number): string => {
    if (!labels || idx < 0 || idx >= labels.length) return '';
    return labels[idx] || '';
  };

  // Encontrar el rango de mes que contiene un índice específico
  const getMonthRangeForIndex = (idx: number) => {
    return monthRanges.find(m => idx >= m.startIdx && idx <= m.endIdx);
  };

  // Datos de hover
  const hoverData = useMemo(() => {
    if (!hover) return null;
    
    const points = series.map(s => {
      const value = s.data[hover.i];
      if (typeof value === 'number' && isFinite(value)) {
        return { value, y: yOf(value), color: s.color, label: s.label };
      }
      return null;
    }).filter(Boolean) as Array<{ value: number; y: number; color: string; label: string }>;
    
    const monthRange = getMonthRangeForIndex(hover.i);
    
    return {
      x: hover.x,
      index: hover.i,
      month: getMonthForIndex(hover.i),
      monthRange,
      points
    };
  }, [hover, series, monthRanges]);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg width={width} height={height}>
        <defs>
          <filter id="multiDropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
          </filter>
          {series.map((s, idx) => (
            <linearGradient key={idx} id={`multiGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>

        {/* Grid horizontal */}
        {(percentGrid || yTickValues) && (
          <g>
            {(yTickValues || []).map((v, idx) => (
              <g key={idx}>
                <line x1={padding.l} x2={padding.l + w} y1={yOf(v)} y2={yOf(v)} stroke="currentColor" strokeOpacity={0.12} strokeDasharray="4 4" />
                {yAxis && (
                  <text x={padding.l - 6} y={yOf(v) + 3} fontSize={10} textAnchor="end" fill="currentColor" fillOpacity={0.6}>
                    {v % 1 === 0 ? `${v}%` : `${v.toFixed(1)}%`}
                  </text>
                )}
              </g>
            ))}
            {yAxis && (
              <line x1={padding.l} x2={padding.l} y1={padding.t} y2={padding.t + h} stroke="currentColor" strokeOpacity={0.25} />
            )}
          </g>
        )}

        {/* Eje X - etiquetas de meses */}
        {labels && labels.length > 0 && (
          <g>
            {monthRanges.map((m, idx) => {
              // Ocultar label si está siendo resaltado en hover
              const isHovered = hoverData?.monthRange?.label === m.label;
              if (isHovered) return null;
              
              // Clamp la posición X para que el label no se salga del contenedor
              // El label tiene ~20px de ancho aproximado (3 caracteres * ~7px)
              const labelHalfWidth = 12;
              const clampedX = Math.max(padding.l + labelHalfWidth, Math.min(m.centerX, padding.l + w - labelHalfWidth));
              
              return (
                <g key={idx}>
                  <text
                    x={clampedX}
                    y={padding.t + h + 14}
                    fontSize={10}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Áreas (sombra) por serie */}
        {segmentsBySeries.map((segs, sIdx) => (
          <g key={`areas-${sIdx}`}>
            {segs.map((seg, k) => (
              <path key={k} d={seg.area} fill={`url(#multiGrad-${sIdx})`} stroke="none" />
            ))}
          </g>
        ))}

        {/* Líneas por serie */}
        {segmentsBySeries.map((segs, sIdx) => (
          <g key={`lines-${sIdx}`}>
            {segs.map((seg, k) => (
              <path
                key={k}
                d={seg.line}
                fill="none"
                stroke={series[sIdx].color}
                strokeWidth={strokeWidth + 0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#multiDropShadow)"
              />
            ))}
          </g>
        ))}

        {/* Último valor - burbuja combinada */}
        {highlightLastValue && (() => {
          const validLastPoints = lastPoints
            .map((p, idx) => ({ ...p, seriesIdx: idx, color: series[idx].color, label: series[idx].label }))
            .filter(p => p.i >= 0);
          
          if (validLastPoints.length === 0) return null;
          
          const maxIndex = Math.max(...validLastPoints.map(p => p.i));
          const pointsAtMax = validLastPoints.filter(p => p.i === maxIndex);
          const x = xOf(maxIndex);
          const monthLabel = labels?.[maxIndex] || '';
          
          // 🔧 CORREGIDO: Ordenar por posición Y (de arriba a abajo) para que coincida con el orden visual de las líneas
          // Menor Y = más arriba en el gráfico = mayor valor
          const lines = pointsAtMax.map(p => ({
            text: `${Math.round(p.v)}%`,
            color: p.color,
            y: yOf(p.v),
            value: p.v
          })).sort((a, b) => a.y - b.y); // Ordenar por Y: menor Y primero (línea más arriba)
          
          const avgY = lines.reduce((sum, l) => sum + l.y, 0) / lines.length;
          const lineHeight = 16;
          const headerHeight = monthLabel ? 14 : 0;
          const boxH = headerHeight + lines.length * lineHeight + 8;
          const maxTextLen = Math.max(monthLabel.length, ...lines.map(l => l.text.length + 2));
          const boxW = Math.max(50, maxTextLen * 7 + 16);
          
          const rawBoxX = x - boxW / 2;
          const boxX = Math.min(Math.max(rawBoxX, padding.l), padding.l + w - boxW);
          let boxY = avgY - boxH - 10;
          if (boxY < padding.t + 2) boxY = avgY + 15;
          boxY = Math.min(boxY, padding.t + h - boxH - 2);
          
          return (
            <g>
              {pointsAtMax.map((p, idx) => (
                <circle key={`circle-${idx}`} cx={x} cy={yOf(p.v)} r={4} fill="#fff" stroke={p.color} strokeWidth={2} />
              ))}
              <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={6} fill="var(--background, #111827)" fillOpacity={0.92} stroke="var(--border, #374151)" strokeWidth={1} />
              {monthLabel && (
                <text x={boxX + boxW / 2} y={boxY + 12} fontSize={10} textAnchor="middle" fill="currentColor" fillOpacity={0.6}>
                  {monthLabel}
                </text>
              )}
              {lines.map((line, idx) => (
                <text key={`val-${idx}`} x={boxX + boxW / 2} y={boxY + headerHeight + 4 + (idx + 1) * lineHeight} fontSize={12} textAnchor="middle" fontWeight={600} fill={line.color}>
                  {line.text}
                </text>
              ))}
            </g>
          );
        })()}

        {/* Hover: línea vertical, puntos y burbuja */}
        {hoverData && hoverData.points.length > 0 && (
          <g>
            {/* Línea vertical */}
            <line
              x1={hoverData.x}
              y1={padding.t}
              x2={hoverData.x}
              y2={padding.t + h}
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            
            {/* Puntos en cada serie */}
            {hoverData.points.map((p, idx) => (
              <g key={`hover-point-${idx}`}>
                <circle cx={hoverData.x} cy={p.y} r={6} fill={p.color} fillOpacity={0.2} />
                <circle cx={hoverData.x} cy={p.y} r={4} fill="#fff" stroke={p.color} strokeWidth={2} />
              </g>
            ))}
            
            {/* Burbuja con valores */}
            {(() => {
              const lineHeight = 14;
              const boxH = hoverData.points.length * lineHeight + 10;
              const maxTextLen = Math.max(...hoverData.points.map(p => `${p.value.toFixed(1)}%`.length));
              const boxW = Math.max(50, maxTextLen * 7 + 16);
              
              const avgY = hoverData.points.reduce((sum, p) => sum + p.y, 0) / hoverData.points.length;
              const rawBoxX = hoverData.x - boxW / 2;
              const boxX = Math.min(Math.max(rawBoxX, padding.l), padding.l + w - boxW);
              let boxY = avgY - boxH - 12;
              if (boxY < padding.t + 2) boxY = avgY + 15;
              
              return (
                <g>
                  <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={6} fill="var(--background, #111827)" fillOpacity={0.95} stroke="var(--border, #374151)" strokeWidth={1} />
                  {hoverData.points.map((p, idx) => (
                    <text key={`hover-val-${idx}`} x={boxX + boxW / 2} y={boxY + 6 + (idx + 1) * lineHeight} fontSize={11} textAnchor="middle" fontWeight={600} fill={p.color}>
                      {p.value.toFixed(1)}%
                    </text>
                  ))}
                </g>
              );
            })()}
            
            {/* Fecha/mes resaltada en el eje X - posicionada sobre el label del mes */}
            {hoverData.monthRange && (() => {
              // Clamp la posición del highlight para que no se salga del contenedor
              const rectWidth = 44;
              const rawX = hoverData.monthRange.centerX - rectWidth / 2;
              const clampedX = Math.max(padding.l, Math.min(rawX, padding.l + w - rectWidth));
              const textX = clampedX + rectWidth / 2;
              
              return (
                <g>
                  <rect 
                    x={clampedX} 
                    y={padding.t + h + 2} 
                    width={rectWidth} 
                    height={16} 
                    rx={3} 
                    fill="var(--background, #111827)" 
                    fillOpacity={0.95}
                    stroke="var(--primary, #3b82f6)"
                    strokeOpacity={0.6}
                    strokeWidth={1}
                  />
                  <text 
                    x={textX} 
                    y={padding.t + h + 13} 
                    fontSize={9} 
                    textAnchor="middle" 
                    fontWeight={600}
                    fill="var(--primary, #3b82f6)"
                  >
                    {hoverData.monthRange.label}
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Capa de interacción */}
      <div 
        className="absolute inset-0 cursor-crosshair" 
        onMouseMove={onMouseMove} 
        onMouseLeave={onMouseLeave} 
      />
    </div>
  );
}
