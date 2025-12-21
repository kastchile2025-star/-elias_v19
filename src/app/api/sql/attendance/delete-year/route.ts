export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API: POST /api/sql/attendance/delete-year
 * Body: { year: number }
 * 
 * Borra asistencia por año usando la Service Role Key del servidor.
 * Nunca expone la clave al cliente. Úsese solo en entorno seguro.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const year = Number(body?.year);

    if (!Number.isFinite(year) || year < 2000 || year > 3000) {
      return NextResponse.json(
        { success: false, error: 'year inválido' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { success: false, error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY y/o SUPABASE_URL en el servidor' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' }
    });

    // Conteo previo
    const { count: beforeCount, error: beforeErr } = await supabase
      .from('attendance')
      .select('id', { head: true, count: 'exact' })
      .eq('year', year);

    if (beforeErr) {
      return NextResponse.json(
        { success: false, error: beforeErr.message, code: beforeErr.code, details: beforeErr.details },
        { status: 500 }
      );
    }

    // Borrado
    const delRes = await supabase
      .from('attendance')
      .delete({ count: 'exact' })
      .eq('year', year);

    if (delRes.error) {
      return NextResponse.json(
        { success: false, error: delRes.error.message, code: delRes.error.code, details: delRes.error.details },
        { status: 500 }
      );
    }

    // Conteo posterior
    const { count: afterCount, error: afterErr } = await supabase
      .from('attendance')
      .select('id', { head: true, count: 'exact' })
      .eq('year', year);

    if (afterErr) {
      return NextResponse.json(
        { success: true, deleted: delRes.count || 0, warning: 'No se pudo verificar conteo posterior', warningDetails: afterErr.message },
        { status: 200 }
      );
    }

    const actualDeleted = (beforeCount || 0) - (afterCount || 0);
    return NextResponse.json({
      success: true,
      deleted: actualDeleted,
      details: { beforeCount: beforeCount || 0, reportedCount: delRes.count || 0, afterCount: afterCount || 0 }
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}
