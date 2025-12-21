"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type TrendChartProps = {
  data: Array<number | null | undefined>;
  // Label for each point (e.g., date strings); if omitted, indexes are used
  labels?: string[];
  // HSL string for stroke/fill base color (without hsl()) or full CSS color
  color?: string; // e.g. "hsl(var(--custom-rose-700))"
  height?: number; // px
  className?: string;
  valueFormat?: (v: number) => string;
  percentGrid?: boolean; // draw horizontal grid at 0..100 step 20 and fix scale to 0..100
  yAxis?: boolean; // draw a left y-axis with 0..100 labels (used with percentGrid)
  highlightLastValue?: boolean; // show label near last numeric point
  // Custom Y domain for zoom functionality
  yDomain?: { min: number; max: number };
  yTicks?: number[];
  // Force alignment with external grid (for multiple overlapping charts)
  forceAlignment?: boolean;
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

function catmullRom2bezier(points: [number, number][], closed = false): string {
  if (points.length < 2) return "";
  const d: string[] = [];
  const p = points;
  d.push(`M ${p[0][0]},${p[0][1]}`);
  const crp = (i: number) => p[Math.max(0, Math.min(p.length - 1, i))];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = crp(i - 1);
    const p1 = crp(i);
    const p2 = crp(i + 1);
    const p3 = crp(i + 2);
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }
  if (closed) d.push("Z");
  return d.join(" ");
}

export function TrendChart({ data, labels, color = "hsl(var(--custom-rose-700))", height = 160, className, valueFormat, percentGrid, yAxis, highlightLastValue, yDomain, yTicks, forceAlignment }: TrendChartProps) {
  const { ref, rect } = useResizeObserver<HTMLDivElement>();
  const width = rect?.width ?? 0;
  const numeric = data.map(v => (typeof v === 'number' && isFinite(v) ? v : null)).filter(v => v != null) as number[];
  
  // Use custom domain if provided, otherwise use percentGrid or auto-scale
  const min = yDomain?.min ?? 0;
  const max = yDomain?.max ?? (percentGrid ? 100 : Math.max(1, ...(numeric.length ? numeric : [1])));
  
  // 🔧 ALINEACIÓN: padding inferior ajustado para que 0% quede alineado con CourseComparisonChart
  // Con height=288, padding.t=28, padding.b=20 → área de dibujo = 240px
  // El 0% queda en y = 28 + 240 = 268 (proporcional a CourseComparisonChart)
  const padding = { l: yAxis ? 30 : 8, r: 12, t: highlightLastValue ? 28 : 12, b: 20 };
  const w = Math.max(0, width - padding.l - padding.r);
  const h = Math.max(0, height - padding.t - padding.b);

  const xOf = (i: number) => {
    if (data.length <= 1) {
      return padding.l + w / 2; // Centrar el punto único
    }
    
    if (forceAlignment) {
      // Para alineación forzada, usar todo el rango disponible uniformemente
      // independientemente de si hay datos null al inicio o final
      const stepX = w / (data.length - 1);
      return padding.l + i * stepX;
    }
    
    // Distribución normal
    const stepX = w / (data.length - 1);
    return padding.l + i * stepX;
  };
  const yOf = (v: number) => padding.t + (1 - (v - min) / (max - min)) * h;

  const segments = useMemo(() => {
    if (w <= 0 || h <= 0 || data.length === 0) return [] as [number, number][][];
    const segs: [number, number][][] = [];
    let cur: [number, number][] = [];
    data.forEach((v, i) => {
      if (typeof v === 'number' && isFinite(v)) {
        cur.push([xOf(i), yOf(v)]);
      } else {
        if (cur.length) { segs.push(cur); cur = []; }
      }
    });
    if (cur.length) segs.push(cur);
    return segs;
  }, [data, w, h, max]);

  const areaPath = useMemo(() => {
    // Solo dibujar área si hay una única secuencia continua (sin gaps)
    if (segments.length !== 1 || segments[0].length === 0) return "";
    const pts = segments[0];
    const top = catmullRom2bezier(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    const baseline = `L ${last[0]},${padding.t + h} L ${first[0]},${padding.t + h} Z`;
    return `${top} ${baseline}`;
  }, [segments, h]);

  const linePaths = useMemo(() => segments.map(seg => catmullRom2bezier(seg)), [segments]);

  // Tooltip state
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!rect || data.length === 0) return;
    const x = e.clientX - rect.left;
    // find nearest point by x
    const stepX = data.length > 1 ? w / (data.length - 1) : w;
    const approxIndex = Math.round((x - padding.l) / stepX);
    // buscar índice válido más cercano
    const findNearestValid = (start: number) => {
      let left = start, right = start;
      while (left >= 0 || right < data.length) {
        if (left >= 0 && typeof data[left] === 'number' && isFinite(data[left] as number)) return left;
        if (right < data.length && typeof data[right] === 'number' && isFinite(data[right] as number)) return right;
        left--; right++;
      }
      return -1;
    };
    const idx = Math.max(0, Math.min(data.length - 1, approxIndex));
    const nearest = findNearestValid(idx);
    if (nearest === -1) return setHover(null);
    const xi = xOf(nearest);
    const yi = yOf(data[nearest] as number);
    setHover({ i: nearest, x: xi, y: yi });
  };

  const onLeave = () => setHover(null);

  const activeValue = hover ? (typeof data[hover.i] === 'number' ? (data[hover.i] as number) : null) : null;
  const activeLabel = hover ? (labels?.[hover.i] ?? String(hover.i + 1)) : null;

  const gradientId = useMemo(() => `trend-grad-${Math.random().toString(36).slice(2)}`,[data.length]);

  return (
    <div ref={ref} className={`relative w-full`} style={{ height }}>
      <svg width={width} height={height} className={className}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {/* Grid horizontal (opcional) */}
        {(percentGrid || yTicks) && (
          <g>
            {(yTicks || [0,20,40,60,80,100]).map((v,i) => (
              <line key={i} x1={padding.l} x2={padding.l + w} y1={yOf(v)} y2={yOf(v)} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4" />
            ))}
          </g>
        )}

        {/* Y Axis (opcional) */}
        {yAxis && (
          <g>
            <line x1={padding.l} x2={padding.l} y1={padding.t} y2={padding.t + h} stroke="currentColor" strokeOpacity={0.25} />
            {(yTicks || [0,20,40,60,80,100]).map((v,i) => (
              <g key={i}>
                <text x={padding.l - 6} y={yOf(v) + 3} fontSize={10} textAnchor="end" fill="currentColor" fillOpacity={0.6}>
                  {v % 1 === 0 ? `${v}%` : `${v.toFixed(1)}%`}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Area */}
        {areaPath && (
          <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        )}
        {/* Line(s) */}
        {linePaths.map((lp, i) => lp && (
          <path key={i} d={lp} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Static last value label */}
        {highlightLastValue && (() => {
          let lastIdx = -1;
          for (let i = data.length - 1; i >= 0; i--) {
            if (typeof data[i] === 'number' && isFinite(data[i] as number)) { lastIdx = i; break; }
          }
          if (lastIdx === -1) return null;
          const v = data[lastIdx] as number;
          const x = xOf(lastIdx);
          const y = yOf(v);
          const label = valueFormat ? valueFormat(v) : String(v);
          const approxWidth = label.length * 6 + 10; // crude text width estimation
          // Position box so it doesn't overflow right edge
          const boxX = Math.min(x - 5, padding.l + w - approxWidth);
          
          // Posicionar la etiqueta: arriba del punto si hay espacio, o abajo si no
          const labelHeight = 18;
          const margin = 6;
          // Si el punto está muy arriba (y < padding.t + labelHeight + margin), poner etiqueta abajo
          const putBelow = y < padding.t + labelHeight + margin;
          const boxY = putBelow ? y + margin : y - labelHeight - margin;
          
          return (
            <g className="pointer-events-none" key="last-value">
              <circle cx={x} cy={y} r={4} fill="#fff" stroke={color} strokeWidth={2} />
              <g>
                <rect x={boxX} y={boxY} width={approxWidth} height={labelHeight} rx={4} fill="var(--background, #111827)" fillOpacity={0.85} stroke={color} strokeOpacity={0.4} />
                <text x={boxX + approxWidth / 2} y={boxY + 12} fontSize={11} textAnchor="middle" fontWeight={600} fill={color}>{label}</text>
              </g>
            </g>
          );
        })()}
        {/* Hover crosshair and dot */}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding.t} y2={padding.t + h} stroke={color} strokeOpacity={0.2} />
            <circle cx={hover.x} cy={hover.y} r={4} fill="#fff" stroke={color} strokeWidth={2} />
          </g>
        )}
        
        {/* Fecha resaltada en el eje X cuando hay hover */}
        {hover && activeLabel && (
          <g>
            {/* Fondo para la fecha */}
            <rect 
              x={hover.x - 30} 
              y={padding.t + h + 2} 
              width={60} 
              height={16} 
              rx={3} 
              fill="var(--background, #111827)" 
              fillOpacity={0.9}
              stroke={color}
              strokeOpacity={0.5}
              strokeWidth={1}
            />
            {/* Texto de la fecha */}
            <text 
              x={hover.x} 
              y={padding.t + h + 13} 
              fontSize={9} 
              textAnchor="middle" 
              fontWeight={600}
              fill={color}
            >
              {activeLabel}
            </text>
          </g>
        )}
        
        {/* X axis ticks (sparse) */}
        {data.length > 1 && (
          <g>
            {Array.from({length: data.length}).map((_, i) => (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
              <line key={i} x1={xOf(i)} x2={xOf(i)} y1={padding.t + h} y2={padding.t + h + 4} stroke="currentColor" strokeOpacity={0.2} />
            ))}
          </g>
        )}
      </svg>

      {/* Tooltip - solo muestra el porcentaje */}
      {hover && activeValue != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full px-2 py-1 rounded-md text-xs shadow bg-popover text-popover-foreground border"
          style={{ left: hover.x, top: Math.max(0, hover.y - 8) }}
        >
          <div className="font-semibold">{valueFormat ? valueFormat(activeValue as number) : activeValue}</div>
        </div>
      )}

      {/* Interaction layer */}
      <div className="absolute inset-0 cursor-crosshair" onMouseMove={onMove} onMouseLeave={onLeave} />
    </div>
  );
}

export default TrendChart;
