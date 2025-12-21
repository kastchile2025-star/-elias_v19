"use client";

// Snapshot de estadísticas por año para precargar gráficos de forma instantánea.
// Mantenerlo pequeño: agregados mensuales y por sección (con courseId para filtrar).

export type AttendanceMonthlyAgg = Record<string, { present: number; total: number }>; // clave YYYY-MM
export type SectionAggItem = { courseId: string | null; sectionId: string | null; present: number; total: number };

export type StatsSnapshot = {
  year: number;
  attendanceMonthly?: AttendanceMonthlyAgg;
  sectionAgg?: SectionAggItem[];
  lastUpdated: number;
};

const STATS_KEY = (year: number) => `smart-student-stats-snapshot:${year}`;

export function readStatsSnapshot(year: number): StatsSnapshot | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STATS_KEY(year));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    return obj as StatsSnapshot;
  } catch {
    return null;
  }
}

export function writeStatsSnapshot(year: number, patch: Partial<StatsSnapshot>) {
  try {
    if (typeof window === 'undefined') return;
    const prev = readStatsSnapshot(year) || { year, lastUpdated: 0 } as StatsSnapshot;
    const next: StatsSnapshot = {
      ...prev,
      ...patch,
      year,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STATS_KEY(year), JSON.stringify(next));
  } catch {}
}

export function mergeMonthly(base: AttendanceMonthlyAgg | undefined, delta: AttendanceMonthlyAgg | undefined): AttendanceMonthlyAgg | undefined {
  if (!delta) return base;
  const out: AttendanceMonthlyAgg = { ...(base || {}) };
  for (const [ym, v] of Object.entries(delta)) {
    const prev = out[ym] || { present: 0, total: 0 };
    out[ym] = { present: prev.present + (v.present || 0), total: prev.total + (v.total || 0) };
  }
  return out;
}

export function mergeSections(base: SectionAggItem[] | undefined, delta: SectionAggItem[] | undefined): SectionAggItem[] | undefined {
  if (!delta || delta.length === 0) return base;
  const map = new Map<string, SectionAggItem>();
  const push = (arr?: SectionAggItem[]) => {
    if (!arr) return;
    for (const it of arr) {
      const key = `${it.courseId || ''}:${it.sectionId || ''}`;
      const prev = map.get(key);
      if (!prev) map.set(key, { ...it });
      else map.set(key, { courseId: it.courseId, sectionId: it.sectionId, present: (prev.present || 0) + (it.present || 0), total: (prev.total || 0) + (it.total || 0) });
    }
  };
  push(base);
  push(delta);
  return Array.from(map.values());
}
