"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { CalendarDays, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { es as esLocale, enGB } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

type VacationRange = { start?: string; end?: string };
type CalendarYearConfig = {
  showWeekends: boolean;
  summer: VacationRange;
  winter: VacationRange;
  holidays: string[]; // YYYY-MM-DD
};

// Configuración de semestres (compartida con Calificaciones)
type Semesters = { first: { start: string; end: string }; second: { start: string; end: string } };

const pad = (n: number) => String(n).padStart(2, '0');
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const inRange = (date: Date, range?: VacationRange) => {
  if (!range?.start || !range?.end) return false;
  // Comparación en horario local para evitar desfases por zona horaria
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const parseYmdLocal = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const a = parseYmdLocal(range.start).getTime();
  const b = parseYmdLocal(range.end).getTime();
  const [min, max] = a <= b ? [a, b] : [b, a];
  return t >= min && t <= max;
};

export default function AdminCalendarPage() {
  const { translate, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const storageKey = (y: number) => `admin-calendar-${y}`;
  const defaultConfig: CalendarYearConfig = useMemo(() => ({
    showWeekends: true,
    summer: { },
    winter: { },
    holidays: [],
  }), []);
  const [config, setConfig] = useState<CalendarYearConfig>(defaultConfig);
  // Eliminado el indicador de texto "Guardado" en favor de popup/toast
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState<'idle'|'saving'|'synced'|'error'>('idle');
  // Año para el cual ya cargamos la configuración desde localStorage
  const [loadedYear, setLoadedYear] = useState<number | null>(null);

  // Recordar el último año seleccionado para que al volver se mantenga
  useEffect(() => {
    try {
      const last = localStorage.getItem('admin-calendar-last-year');
      if (last) {
        const y = parseInt(last);
        if (!Number.isNaN(y)) setYear(y);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('admin-calendar-last-year', String(year)); } catch {}
  }, [year]);

  // Cargar/guardar configuración por año
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(year));
      if (!raw) {
        setConfig(defaultConfig);
  setLoadedYear(year);
  return;
      }
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      // Si lo importado quedó doblemente serializado, intentar parsear otra vez
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
      }
      if (parsed && typeof parsed === 'object') {
        setConfig({ ...defaultConfig, ...parsed });
      } else {
        setConfig(defaultConfig);
      }
      setLoadedYear(year);
    } catch {
      setConfig(defaultConfig);
      setLoadedYear(year);
    }
  }, [year, defaultConfig]);

  useEffect(() => {
    // Evitar sobrescribir el año recién cambiado antes de cargar su configuración
    if (loadedYear !== year) return;
    try {
      localStorage.setItem(storageKey(year), JSON.stringify(config));
  // Notificar a otras vistas (Configuración, etc.) que el calendario del año cambió
  try { window.dispatchEvent(new CustomEvent('calendarUpdated', { detail: { year } })); } catch {}
    } catch {}
  }, [config, year, loadedYear]);

  const saveManually = () => {
    try {
      localStorage.setItem(storageKey(year), JSON.stringify(config));
      setSavedAt(new Date());
  try { window.dispatchEvent(new CustomEvent('calendarUpdated', { detail: { year } })); } catch {}
      // El popup/confirmación se mostrará al completar la sincronización con el servidor
    } catch {}
  };

  const syncToServer = async () => {
    setSyncing('saving');
    try {
      const res = await fetch('/api/attendance/calendar-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, config }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Sync failed');
      setSyncing('synced');
      // Mostrar popup de confirmación
      toast({
        title: translate('changedSavedTitle') || 'Cambios guardados',
        description: translate('changedSavedDesc') || '¡Perfecto! Los cambios han sido guardados y aplicados correctamente en todo el sistema.',
      });
  try { window.dispatchEvent(new CustomEvent('calendarUpdated', { detail: { year } })); } catch {}
      setTimeout(()=> setSyncing('idle'), 1500);
    } catch {
      setSyncing('error');
      setTimeout(()=> setSyncing('idle'), 2000);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Shield className="w-10 h-10 text-gray-500" />
            <CardTitle className="text-lg font-headline">{translate('accessDenied') || 'Acceso denegado'}</CardTitle>
            <CardDescription className="text-sm">{translate('onlyAdminsCanAccess') || 'Solo administradores pueden acceder a esta página'}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button asChild className="home-card-button-gray w-auto">
              <Link href="/dashboard">{translate('goBack') || 'Volver'}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Meses y días localizados (encabezado de la grilla anual)
  const months = useMemo(() => (
    language === 'es'
      ? ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December']
  ), [language]);
  const dow = useMemo(() => (
    language === 'es' ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  ), [language]);
  const dateLocale: Locale = language === 'es' ? esLocale : enGB; // Lunes a domingo

  const toggleHoliday = (d: Date) => {
    const k = keyOf(d);
    setConfig(prev => {
      const set = new Set(prev.holidays);
      if (set.has(k)) set.delete(k); else set.add(k);
      return { ...prev, holidays: Array.from(set).sort() };
    });
  };

  // Estilo del día según categoría
  const getDayStyle = (d: Date) => {
    const weekend = d.getDay() === 0 || d.getDay() === 6; // D=0, S=6
    const isHoliday = config.holidays.includes(keyOf(d));
    const isSummer = inRange(d, config.summer);
    const isWinter = inRange(d, config.winter);

    if (isHoliday) return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800';
    if (isSummer) return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800';
    if (isWinter) return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800';
  // Weekends styled with higher contrast in light mode
  if (config.showWeekends && weekend) return 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-zinc-900/40 dark:text-zinc-200 dark:border-zinc-700';
    return 'bg-transparent text-foreground border border-transparent';
  };
  // Días disponibles (días hábiles sin vacaciones ni feriados)
  const availableDays = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    let count = 0;
    const d = new Date(start);
    while (d <= end) {
      const dow = d.getDay();
      const isWeekday = dow >= 1 && dow <= 5; // L-V
      if (
        isWeekday &&
        !inRange(d, config.summer) &&
        !inRange(d, config.winter) &&
        !config.holidays.includes(keyOf(d))
      ) {
        count++;
      }
      d.setDate(d.getDate() + 1);
    }
    return count;
  }, [year, config]);

  // Controles handlers
  const handleSummerChange = (part: 'start'|'end', v: string) => setConfig(p => ({ ...p, summer: { ...p.summer, [part]: v || undefined } }));
  const handleWinterChange = (part: 'start'|'end', v: string) => setConfig(p => ({ ...p, winter: { ...p.winter, [part]: v || undefined } }));
  const [holidayInput, setHolidayInput] = useState('');
  const addHoliday = () => {
    if (!holidayInput) return;
    setConfig(p => ({ ...p, holidays: Array.from(new Set([...(p.holidays||[]), holidayInput])).sort() }));
    setHolidayInput('');
  };
  const clearAll = () => setConfig(defaultConfig);

  // --- Semestres académicos (1er/2do) ---
  // Semestres por año (claves independientes) ---------------------------------
  const SEM_KEY_PREFIX = 'smart-student-semesters';
  const semesterKey = (y: number) => `${SEM_KEY_PREFIX}-${y}`;
  const defaultSemestersFor = (y: number): Semesters => ({
    first: { start: `${y}-03-01`, end: `${y}-06-30` },
    second: { start: `${y}-07-01`, end: `${y}-12-15` },
  });
  const [semesters, setSemesters] = useState<Semesters>(() => {
    try {
      const raw = localStorage.getItem(semesterKey(year)) || localStorage.getItem(SEM_KEY_PREFIX);
      if (raw) return JSON.parse(raw) as Semesters;
    } catch {}
    return defaultSemestersFor(year);
  });
  // Recargar semestres cuando cambia el año
  useEffect(() => {
    try {
      const raw = localStorage.getItem(semesterKey(year));
      if (raw) {
        setSemesters(JSON.parse(raw));
      } else {
        // Crear default para este año (sin sobre-escribir otros años)
        const def = defaultSemestersFor(year);
        setSemesters(def);
        try { localStorage.setItem(semesterKey(year), JSON.stringify(def)); } catch {}
      }
    } catch {
      const def = defaultSemestersFor(year);
      setSemesters(def);
    }
  }, [year]);
  const saveSemesters = () => {
    let hadCriticalError = false;
    try {
      const key = semesterKey(year);
      // Utilidades internas -------------------------------------
      const approxSize = (val: string) => new Blob([val]).size; // bytes
      const listKeys = () => Object.keys(localStorage);
      const purgeForSpace = (minBytesToFree: number): number => {
        const priorities = [
          // Caches / datos regenerables primero
          'smart-student-cache-export',
          'smart-student-temp-debug',
          'smart-student-last-export',
          'smart-student-debug-log',
          // Datos potencialmente enormes (se rehidratan desde servidor normalmente)
          'smart-student-attendance',
          'smart-student-submissions',
          'smart-student-tasks',
          'smart-student-student-assignments',
          'smart-student-teacher-assignments',
        ];
        // Añadir variantes por año
        const yearSuffixes = [year, year-1, year-2];
        yearSuffixes.forEach(y => {
          priorities.push(
            `smart-student-attendance-${y}`,
            `smart-student-submissions-${y}`,
            `smart-student-student-assignments-${y}`,
            `smart-student-teacher-assignments-${y}`,
          );
        });
        let freed = 0;
        for (const k of priorities) {
          if (freed >= minBytesToFree) break;
          try {
            const v = localStorage.getItem(k);
            if (v) {
              freed += approxSize(v);
              localStorage.removeItem(k);
            }
          } catch {}
        }
        return freed;
      };
      const norm = (s: string) => {
        if (!s) return s;
        if (/^\d{2}-\d{2}-\d{4}$/.test(s)) { const [dd,mm,yyyy] = s.split('-'); return `${yyyy}-${mm}-${dd}`; }
        return s;
      };
      const normalized = {
        first: { start: norm(semesters.first.start), end: norm(semesters.first.end) },
        second: { start: norm(semesters.second.start), end: norm(semesters.second.end) }
      };
      // Guardar claves
      try { 
        localStorage.setItem(key, JSON.stringify(normalized)); 
      } catch (err: any) {
        if (err && err.name === 'QuotaExceededError') {
          console.warn('[Semestres] Espacio insuficiente. Intentando liberar cache…');
          const freed = purgeForSpace(50_000); // liberar ~50KB
          console.info(`[Semestres] Espacio liberado aprox: ${freed} bytes. Reintentando…`);
          try {
            localStorage.setItem(key, JSON.stringify(normalized));
          } catch (err2) {
            hadCriticalError = true; 
            console.error('[Semestres] Reintento falló. Espacio insuficiente.', err2);
          }
        } else {
          hadCriticalError = true; console.error('[Semestres] Error guardando clave anual', err);
        }
      }
      try { localStorage.setItem('smart-student-semesters', JSON.stringify(normalized)); } catch (err) { console.warn('[Semestres] No se pudo escribir clave global legacy', err); }
      // Actualizar estado local para reflejar normalización
      setSemesters(normalized);
      // Notificaciones internas (no críticas si fallan)
      try { window.dispatchEvent(new CustomEvent('semesterChange', { detail: { year, semesters: normalized } })); } catch {}
      try { window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(normalized) })); } catch (err) { console.warn('[Semestres] StorageEvent no soportado, usando sólo CustomEvent', err); }
      if (!hadCriticalError) {
        toast({ title: 'Calendario guardado', description: 'Semestres actualizados correctamente.' });
      }
    } catch (e) {
      hadCriticalError = true;
      console.error('[Semestres] Error inesperado al guardar', e);
    }
    if (hadCriticalError) {
      toast({ title: 'Error al guardar', description: 'No se pudo guardar. Libera espacio: limpia datos grandes (asistencia, entregas) o usa botón Limpiar todo.', variant: 'destructive' });
    }
  };
  const resetSemesters = () => setSemesters(defaultSemestersFor(year));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-zinc-400" />
          <h1 className="text-2xl font-bold font-headline">{translate('cardCalendarTitle')}</h1>
        </div>

        {/* Año y contador alineados a la derecha */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">{translate('calendarYear') || 'Año'}</label>
            <select
              className="select-clean rounded-md border border-zinc-400 dark:border-zinc-600 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 px-3 py-1 text-sm text-center shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-zinc-400/60 dark:focus:ring-zinc-500/60 min-w-[110px]"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 7 }).map((_, i) => {
                const y = today.getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          <div className="text-sm opacity-80">
            {translate('availableDays') || 'Días Disponibles'}: <span className="font-semibold opacity-100">{availableDays}</span>
          </div>
        </div>
      </div>

      {/* Controles rápidos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-headline">{translate('calendarQuickActions') || 'Acciones rápidas'}</CardTitle>
          <CardDescription>{translate('cardCalendarDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Mostrar fines de semana */}
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.showWeekends} onChange={(e)=>setConfig(p=>({ ...p, showWeekends: e.target.checked }))} />
              {translate('calendarShowWeekends') || 'Fines de semana'}
            </label>

    {/* Verano */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="text-xs opacity-80">{translate('calendarSummer') || 'Vacaciones de verano'}</label>
                <div className="flex items-center gap-2">
      <DateInput value={config.summer.start} onChange={(v)=>handleSummerChange('start', v)} locale={dateLocale} />
                  <span className="text-xs opacity-60">{translate('calendarTo') || 'a'}</span>
      <DateInput value={config.summer.end} onChange={(v)=>handleSummerChange('end', v)} locale={dateLocale} />
                </div>
              </div>
            </div>

    {/* Invierno */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="text-xs opacity-80">{translate('calendarWinter') || 'Vacaciones de invierno'}</label>
                <div className="flex items-center gap-2">
      <DateInput value={config.winter.start} onChange={(v)=>handleWinterChange('start', v)} locale={dateLocale} />
                  <span className="text-xs opacity-60">{translate('calendarTo') || 'a'}</span>
      <DateInput value={config.winter.end} onChange={(v)=>handleWinterChange('end', v)} locale={dateLocale} />
                </div>
              </div>
            </div>

    {/* Feriados */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="text-xs opacity-80">{translate('calendarHoliday') || 'Feriados'}</label>
                <div className="flex items-center gap-2">
      <DateInput value={holidayInput || undefined} onChange={(v)=>setHolidayInput(v)} locale={dateLocale} />
                  <Button className="home-card-button-silver w-auto" onClick={addHoliday}>{translate('add') || 'Agregar'}</Button>
                </div>
              </div>
            </div>

              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <Button className="home-card-button-silver w-auto" onClick={() => { saveManually(); syncToServer(); }}>
                  {syncing === 'saving' ? (translate('saving') || 'Guardando...') : (translate('save') || 'Guardar')}
                </Button>
                {/* Texto "Guardado" reemplazado por popup/Toast; no se muestra etiqueta aquí */}
                {/* Export moved to User Management > Configuración. Button removed from here as requested. */}
                <Button variant="outline" className="home-card-button-red w-auto" onClick={clearAll}>{translate('clearAll') || 'Limpiar todo'}</Button>
              </div>
          </div>

          {/* Semestres académicos */}
          <div className="mt-4 border-t pt-4">
            <CardTitle className="text-base font-headline mb-3">📅 Calendario Académico (Semestres)</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="font-medium">1er Semestre</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                    <DateInput
                      value={semesters.first.start}
                      onChange={(v) => setSemesters(s => ({ ...s, first: { ...s.first, start: v } }))}
                      locale={dateLocale}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Término</label>
                    <DateInput
                      value={semesters.first.end}
                      onChange={(v) => setSemesters(s => ({ ...s, first: { ...s.first, end: v } }))}
                      locale={dateLocale}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">2do Semestre</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                    <DateInput
                      value={semesters.second.start}
                      onChange={(v) => setSemesters(s => ({ ...s, second: { ...s.second, start: v } }))}
                      locale={dateLocale}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Término</label>
                    <DateInput
                      value={semesters.second.end}
                      onChange={(v) => setSemesters(s => ({ ...s, second: { ...s.second, end: v } }))}
                      locale={dateLocale}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={saveSemesters}>Guardar Semestres</Button>
              <Button variant="outline" onClick={resetSemesters}>Restablecer por defecto</Button>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span className="text-sm opacity-80">{translate('legend') || 'Leyenda'}:</span>
            <Legend color="bg-slate-200 text-slate-800 border-slate-300" label={translate('weekend') || 'Fin de semana'} />
            <Legend color="bg-yellow-100 text-yellow-800 border-yellow-200" label={translate('calendarSummer') || 'Vacaciones de verano'} />
            <Legend color="bg-blue-100 text-blue-800 border-blue-200" label={translate('calendarWinter') || 'Vacaciones de invierno'} />
            <Legend color="bg-red-100 text-red-800 border-red-200" label={translate('calendarHoliday') || 'Feriado'} />
          </div>
        </CardContent>
      </Card>

      {/* Vista anual: 12 meses */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {months.map((mName, mIndex) => (
          <Card key={mIndex} className="border-zinc-300/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-headline">{mName} {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs opacity-70 mb-1">
                {dow.map((d, i) => <div key={`${d}-${i}`} className="py-1">{d}</div>)}
              </div>
              <MonthGrid year={year} month={mIndex} getDayStyle={getDayStyle} onDayClick={toggleHoliday} />
            </CardContent>
          </Card>
        ))}
      </div>

  {/* Removed Back to Dashboard button as requested */}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 ${color}`}>
      <span className="w-3 h-3 rounded-sm bg-current/30 border border-current" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function MonthGrid({ year, month, getDayStyle, onDayClick }: {
  year: number;
  month: number; // 0-11
  getDayStyle: (d: Date) => string;
  onDayClick: (d: Date) => void;
}) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7; // convertir a L=0..D=6
  const cells = [] as Array<{ date?: Date }>;
  for (let i = 0; i < startOffset; i++) cells.push({});
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d) });

  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((c, idx) => (
        <div key={idx} className={`aspect-square rounded-md text-center text-xs flex items-center justify-center cursor-pointer select-none ${c.date ? getDayStyle(c.date) : 'bg-transparent'}`}
          onClick={() => c.date && onDayClick(c.date)}
          title={c.date ? keyOf(c.date) : ''}
        >
          {c.date ? c.date.getDate() : ''}
        </div>
      ))}
    </div>
  );
}

// Export moved to User Management > Configuración overall export. No local export here.

// Date input con calendario localizado (semana L-D) y formateo según locale
function DateInput({ value, onChange, locale }: { value?: string; onChange: (v: string) => void; locale: Locale }) {
  // Parseo local seguro para fechas en formato YYYY-MM-DD
  const parseYmdLocal = (ymd?: string) => {
    if (!ymd) return undefined;
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const parsed = parseYmdLocal(value);
  const selected = parsed && !isNaN(parsed.getTime()) ? parsed : undefined;
  // Mostrar siempre dd-mm-yyyy según requerimiento
  const label = selected ? format(selected, 'dd-MM-yyyy', { locale }) : 'dd-mm-yyyy';

  const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          // react-day-picker usa date-fns locale para definir primer día de la semana
          locale={locale}
          onSelect={(d) => d && onChange(toIso(d))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
