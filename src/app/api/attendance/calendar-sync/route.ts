import { NextRequest, NextResponse } from 'next/server';

type VacationRange = { start?: string; end?: string };
type CalendarYearConfig = {
  showWeekends: boolean;
  summer: VacationRange;
  winter: VacationRange;
  holidays: string[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, config } = body as { year?: number; config?: CalendarYearConfig };
    if (!year || typeof year !== 'number') {
      return NextResponse.json({ ok: false, error: 'Invalid year' }, { status: 400 });
    }
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid config' }, { status: 400 });
    }
    // Basic validation
    if (!Array.isArray(config.holidays)) {
      return NextResponse.json({ ok: false, error: 'Invalid holidays' }, { status: 400 });
    }
    // Here you'd sync with attendance persistence layer.
    // For now, return ok with a tiny echo.
    return NextResponse.json({ ok: true, info: { year, holidays: config.holidays.length } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
