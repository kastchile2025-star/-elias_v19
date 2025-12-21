// Utilidades para manejo de escalas de calificación global
// Fuente de verdad: LocalStorageManager.getConfig().grading

import { LocalStorageManager } from '@/lib/education-utils';
import type { SystemConfig } from '@/types/education';

export type GradingConfig = NonNullable<SystemConfig['grading']>;

export const defaultGrading: GradingConfig = {
  mode: 'percent',
  min: 0,
  max: 100,
  passPercent: 60,
  label: '%',
};

export function getGradingConfig(): GradingConfig {
  try {
    const cfg = LocalStorageManager.getConfig();
    const g = (cfg && cfg.grading) ? cfg.grading : undefined;
    if (!g) return defaultGrading;
    // Saneamiento
    const min = Number.isFinite(Number(g.min)) ? Number(g.min) : defaultGrading.min;
    const max = Number.isFinite(Number(g.max)) ? Number(g.max) : defaultGrading.max;
    const passPercent = Number.isFinite(Number(g.passPercent)) ? Number(g.passPercent) : defaultGrading.passPercent;
    const mode = g.mode === 'numeric' ? 'numeric' : 'percent';
    const label = typeof g.label === 'string' && g.label.trim() ? g.label.trim() : (mode === 'percent' ? '%' : `${min}–${max}`);
    return { mode, min, max, passPercent, label } as GradingConfig;
  } catch {
    return defaultGrading;
  }
}

// Normaliza una nota cualquiera a 0-100 según la configuración actual
export function toPercentFromConfigured(raw: number | undefined | null): number | undefined {
  if (raw == null || !Number.isFinite(Number(raw))) return undefined;
  const g = getGradingConfig();
  const x = Number(raw);

  if (g.mode === 'percent') {
    // Se asume que ya viene en 0-100 si el rango es 0-100; si el rango es 10-100, ajustar linealmente
    if (g.min === 0 && g.max === 100) return clamp0_100(x);
    return clamp0_100(((x - g.min) / (g.max - g.min)) * 100);
  }
  // Numérica (p.ej. 1–7 o 1–10)
  return clamp0_100(((x - g.min) / (g.max - g.min)) * 100);
}

// Convierte porcentaje (0-100) a la escala configurada
export function fromPercentToConfigured(percent: number | undefined | null): number | undefined {
  if (percent == null || !Number.isFinite(Number(percent))) return undefined;
  const g = getGradingConfig();
  const p = clamp0_100(Number(percent));
  if (g.mode === 'percent') {
    if (g.min === 0 && g.max === 100) return roundSmart(p, 2);
    return roundSmart(g.min + (p / 100) * (g.max - g.min), 2);
  }
  return roundSmart(g.min + (p / 100) * (g.max - g.min), 2);
}

export function isApprovedByPercent(percent: number | undefined | null): boolean {
  if (percent == null || !Number.isFinite(Number(percent))) return false;
  const g = getGradingConfig();
  const p = clamp0_100(Number(percent));
  return p >= (g.passPercent ?? 60);
}

export function clamp0_100(x: number): number { return Math.max(0, Math.min(100, x)); }
export function roundSmart(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// Formateadores de visualización
export function formatConfigured(value: number | undefined | null, opts?: { withSymbol?: boolean }): string {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const g = getGradingConfig();
  const v = Number(value);
  if (g.mode === 'percent' && g.min === 0 && g.max === 100) {
    return `${roundSmart(v, 1)}${opts?.withSymbol !== false ? '%' : ''}`;
  }
  // Mostrar en escala configurada
  return `${roundSmart(v, 2)}${opts?.withSymbol !== false ? ` ${g.label || ''}`.trim() : ''}`.trim();
}

// Formatear porcentaje con símbolo por defecto
export function formatPercent(p: number | undefined | null): string {
  if (p == null || !Number.isFinite(Number(p))) return '—';
  return `${roundSmart(Number(p), 1)}%`;
}
