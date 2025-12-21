"use client";

// Snapshot de KPIs de alto nivel por año para mostrar instantáneamente en Estadísticas
// Se almacena en localStorage (tamaño pequeño) y se usa como preload visual.

export type KPIsSnapshot = {
  year: number;
  // Asistencia
  attendancePct?: number; // 0..100
  // Calificaciones
  studentsCount?: number;
  approvedCount?: number;
  failedCount?: number;
  overallAvgPct?: number; // 0..100
  // Meta
  lastUpdated: number;
};

const SNAPSHOT_KEY = (year: number) => `smart-student-kpis-snapshot:${year}`;

export function readKPIsSnapshot(year: number): KPIsSnapshot | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SNAPSHOT_KEY(year));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    return obj as KPIsSnapshot;
  } catch {
    return null;
  }
}

export function writeKPIsSnapshot(year: number, patch: Partial<KPIsSnapshot>) {
  try {
    if (typeof window === 'undefined') return;
    const prev = readKPIsSnapshot(year) || { year, lastUpdated: 0 } as KPIsSnapshot;
    const next: KPIsSnapshot = {
      ...prev,
      ...patch,
      year,
      lastUpdated: Date.now()
    };
    localStorage.setItem(SNAPSHOT_KEY(year), JSON.stringify(next));
  } catch {
    // ignore
  }
}
