import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// La service key debe estar en una variable de entorno segura del backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Crear cliente solo si las variables existen (lazy initialization)
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase no configurado: faltan variables de entorno SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabase) {
    supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  // Verificar si Supabase está configurado
  if (!supabaseUrl || !serviceKey) {
    return res.status(503).json({ 
      error: 'Supabase no configurado', 
      details: 'Este endpoint requiere configuración de Supabase que no está disponible en modo SQL local' 
    });
  }
  
  const { year } = req.body;
  if (!year || typeof year !== 'number') {
    return res.status(400).json({ error: 'Año inválido' });
  }
  try {
    const client = getSupabaseClient();
    
    // Contar antes
    const { count: beforeCount, error: countError } = await client
      .from('grades')
      .select('*', { count: 'exact', head: true })
      .eq('year', year);
    if (countError) {
      return res.status(500).json({ error: countError.message });
    }
    // Borrar
    const { error, count } = await client
      .from('grades')
      .delete({ count: 'exact' })
      .eq('year', year);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    // Contar después
    const { count: afterCount } = await client
      .from('grades')
      .select('*', { count: 'exact', head: true })
      .eq('year', year);
    return res.status(200).json({
      deleted: count,
      beforeCount,
      afterCount,
      success: true,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Error desconocido' });
  }
}
