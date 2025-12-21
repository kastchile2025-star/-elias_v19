import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSQLConfig, isSupabaseEnabled } from './sql-config';

export interface GradeRecord {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  score: number;
  courseId: string | null;
  sectionId: string | null;
  subjectId: string | null;
  title: string;
  gradedAt: string; // ISO
  year: number;
  type: 'tarea' | 'prueba' | 'evaluacion';
  createdAt: string;
  updatedAt: string;
}

export class SQLDatabaseService {
  private static _instance: SQLDatabaseService | null = null;
  private client: SupabaseClient | null = null;

  static instance() {
    if (!this._instance) this._instance = new SQLDatabaseService();
    return this._instance;
  }

  connect() {
    if (!isSupabaseEnabled()) return null;
    if (this.client) return this.client;
    const cfg = getSQLConfig();
    this.client = createClient(cfg.supabaseUrl!, cfg.supabaseAnonKey!, {
      auth: { persistSession: false },
      db: { schema: 'public' }
    });
    return this.client;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }>{
    try {
      const client = this.connect();
      if (!client) return { success: false, error: 'Supabase no configurado' };
      // Verificar existencia/permiso de las tablas críticas (en paralelo)
      const tables: Array<'grades'|'attendance'|'activities'> = ['grades', 'attendance', 'activities'];
      const tableChecks = await Promise.all(tables.map(async (t) => {
        const { error } = await client.from(t).select('id', { head: true, count: 'exact' }).limit(1);
        return { t, error };
      }));
      const missing: string[] = [];
      const rlsBlocked: string[] = [];
      for (const { t, error } of tableChecks) {
        if (!error) continue;
        const code = (error as any)?.code || '';
        const msg = (error as any)?.message || String(error);
        if (code === 'PGRST116' || /relation .* not found/i.test(msg)) {
          missing.push(t);
        } else if (code === 'PGRST301' || code === '401' || /not authorized|rls/i.test(msg)) {
          rlsBlocked.push(t);
        } else {
          return { success: false, error: `${t}: ${code || 'ERR'}: ${msg}` };
        }
      }

      if (missing.length > 0) {
        return { success: false, error: `Faltan tablas en Supabase: ${missing.join(', ')}. Crea las tablas antes de usar SQL.` };
      }
      if (rlsBlocked.length > 0) {
        return { success: false, error: `RLS bloquea acceso en: ${rlsBlocked.join(', ')}. Ajusta políticas para SELECT/UPSERT con la clave ANON.` };
      }

      // Verificación rápida de columnas requeridas: 1 consulta por tabla con todas las columnas
      const requiredActivityCols = [
        'task_type', 'title', 'subject_id', 'subject_name', 'course_id', 'section_id',
        'created_at', 'start_at', 'open_at', 'due_date', 'status', 'assigned_by_id',
        'assigned_by_name', 'year'
      ];
      const requiredGradesCols = [
        'test_id', 'student_id', 'student_name', 'score', 'course_id', 'section_id',
        'subject_id', 'title', 'graded_at', 'year', 'type', 'created_at', 'updated_at'
      ];
      const requiredAttendanceCols = [
        'date','course_id','section_id','student_id','status','present','comment','created_at','updated_at','year'
      ];
      const colsChecks = await Promise.all([
        client.from('activities').select(`id, ${requiredActivityCols.join(', ')}`, { head: true, count: 'exact' }).limit(1),
        client.from('grades').select(`id, ${requiredGradesCols.join(', ')}`, { head: true, count: 'exact' }).limit(1),
        client.from('attendance').select(`id, ${requiredAttendanceCols.join(', ')}`, { head: true, count: 'exact' }).limit(1)
      ]);
      const [actErr, gradesErr, attErr] = colsChecks.map(r => (r as any).error || null);
      const explainMissing = (tbl: string, err: any) => {
        if (!err) return null;
        const code = err?.code || '';
        const msg = err?.message || String(err);
        if (/(PGRST301|401)/.test(code)) return `${tbl}: RLS o permisos insuficientes`;
        if (/column .* not found|Could not find the '.*' column|does not exist/i.test(msg)) return `${tbl}: ${msg}`;
        return `${tbl}: ${code || 'ERR'}: ${msg}`;
      };
      const issues = [
        explainMissing('activities', actErr),
        explainMissing('grades', gradesErr),
        explainMissing('attendance', attErr)
      ].filter(Boolean) as string[];
      if (issues.length > 0) {
        return {
          success: false,
          error: `Esquema SQL incompleto o sin permisos: ${issues.join(' | ')}. Usa snake_case en columnas y verifica RLS.`
        };
      }

      return { success: true };
    } catch (e: any) { return { success: false, error: e?.message || 'error' }; }
  }

  async createTables(): Promise<{ success: boolean; error?: string }>{
    // No podemos crear tablas desde el cliente pública de Supabase; se asume migración en servidor.
    // Retornamos ok para no bloquear el flujo.
    return { success: true };
  }


  async insertGrades(grades: GradeRecord[], onProgress?: (progress: { processed: number; total: number; currentBatch: number; totalBatches: number; errors: number; successRate: number }) => void) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    
    console.log(`📤 [SQL DATABASE] insertGrades iniciado con ${grades.length} registros`);
    
    // Adaptar a snake_case para el esquema SQL
    const mapGrade = (g: GradeRecord) => {
      const mapped: any = {
        id: g.id,
        test_id: g.testId,
        student_id: g.studentId,
        student_name: g.studentName,
        score: g.score,
        course_id: g.courseId,
        section_id: g.sectionId,
        subject_id: g.subjectId,
        title: g.title,
        graded_at: g.gradedAt,
        year: g.year,
        type: g.type,
        created_at: g.createdAt,
        updated_at: g.updatedAt,
      };
      
      // Agregar campo topic opcional (tema de la actividad)
      if ((g as any).topic) {
        mapped.topic = (g as any).topic;
      }
      
      return mapped;
    };
    
    // Filtro de seguridad: mantener solo claves válidas snake_case (incluye topic opcional)
    const allowedKeys = new Set([
      'id', 'test_id', 'student_id', 'student_name', 'score', 'course_id', 'section_id',
      'subject_id', 'title', 'graded_at', 'year', 'type', 'created_at', 'updated_at', 'topic'
    ]);
    const sanitize = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([k]) => allowedKeys.has(k)));

    let totalInserted = 0;
    let totalErrors = 0;
    
    // ⚡ OPTIMIZACIÓN PARA CARGAS MASIVAS +100K:
    // Lotes más pequeños para evitar timeouts de Vercel (10s límite en plan gratuito)
    const batchSize = grades.length > 100000 ? 250 : grades.length > 50000 ? 400 : grades.length > 10000 ? 600 : 1000;
    const delayBetweenBatches = grades.length > 100000 ? 150 : grades.length > 50000 ? 100 : grades.length > 10000 ? 50 : 0; // ms
    const maxRetries = 3;
    
    const totalBatches = Math.ceil(grades.length / batchSize);
    console.log(`🎯 [SQL DATABASE] Configuración optimizada para ${grades.length} registros:`);
    console.log(`📦 ${totalBatches} lotes de ${batchSize} registros cada uno`);
    console.log(`⏱️ Delay entre lotes: ${delayBetweenBatches}ms`);
    console.log(`🔄 Reintentos máximos por lote: ${maxRetries}`);
    
    for (let i = 0; i < grades.length; i += batchSize) {
      const currentBatch = Math.floor(i / batchSize) + 1;
      const raw = grades.slice(i, i + batchSize).map(mapGrade);
      const batch = raw.map(sanitize);
      
      console.log(`📦 [SQL DATABASE] Procesando lote ${currentBatch}/${totalBatches}: ${batch.length} registros`);
      
      if (i === 0 && batch.length > 0) {
        try {
          console.log('[SQL] Upsert grades payload sample keys:', Object.keys(batch[0]));
          const hasCamel = Object.keys(batch[0]).some(k => /[A-Z]/.test(k));
          if (hasCamel) {
            console.warn('[SQL] Advertencia: payload de grades contenía claves camelCase; se depuraron a snake_case');
          }
        } catch {}
      }
      
      // Procesar lote con reintentos
      let retryCount = 0;
      let batchSuccess = false;
      let batchInserted = 0;
      
      while (retryCount <= maxRetries && !batchSuccess) {
        try {
          const { error, count } = await client.from('grades').upsert(batch, { onConflict: 'id', count: 'exact' });
          
          if (error) {
            retryCount++;
            console.warn(`⚠️ [SQL DATABASE] Error en lote ${currentBatch}, intento ${retryCount}/${maxRetries + 1}:`, error.message);
            
            if (retryCount > maxRetries) {
              console.error(`❌ [SQL DATABASE] Lote ${currentBatch} falló después de ${maxRetries} reintentos`);
              totalErrors += batch.length;
              
              // Intentar procesar en sub-lotes más pequeños como último recurso
              if (batch.length > 50) {
                console.log(`🔄 [SQL DATABASE] Intentando dividir lote ${currentBatch} en sub-lotes de 50 registros...`);
                const subBatchSize = 50;
                for (let j = 0; j < batch.length; j += subBatchSize) {
                  const subBatch = batch.slice(j, j + subBatchSize);
                  try {
                    const { error: subError, count: subCount } = await client.from('grades').upsert(subBatch, { onConflict: 'id', count: 'exact' });
                    if (!subError) {
                      const subInserted = subCount || subBatch.length;
                      batchInserted += subInserted;
                      totalErrors -= subBatch.length; // Recuperar del error
                      console.log(`✅ [SQL DATABASE] Sub-lote ${Math.floor(j/subBatchSize) + 1} exitoso: ${subInserted} registros`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 25)); // Pausa entre sub-lotes
                  } catch (subErr) {
                    console.error(`❌ [SQL DATABASE] Sub-lote falló:`, subErr);
                  }
                }
              }
              break;
            } else {
              // Esperar antes del reintento con backoff exponencial
              const backoffDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
              console.log(`⏳ [SQL DATABASE] Esperando ${backoffDelay}ms antes del reintento...`);
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
          } else {
            batchInserted = count || batch.length;
            totalInserted += batchInserted;
            batchSuccess = true;
            console.log(`✅ [SQL DATABASE] Lote ${currentBatch}/${totalBatches} completado: ${batchInserted} registros insertados`);
          }
        } catch (batchError: any) {
          retryCount++;
          console.error(`💥 [SQL DATABASE] Error crítico en lote ${currentBatch}, intento ${retryCount}:`, batchError.message);
          
          if (retryCount > maxRetries) {
            totalErrors += batch.length;
            console.error(`❌ [SQL DATABASE] Lote ${currentBatch} abandonado después de ${maxRetries} reintentos`);
            break;
          }
          
          // Backoff exponencial para errores críticos
          const backoffDelay = Math.min(2000 * Math.pow(2, retryCount - 1), 8000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
      
      // Callback de progreso con métricas detalladas
      if (onProgress) {
        const processed = Math.min(i + batchSize, grades.length);
        const successRate = processed > 0 ? ((processed - totalErrors) / processed) * 100 : 0;
        
        onProgress({
          processed,
          total: grades.length,
          currentBatch,
          totalBatches,
          errors: totalErrors,
          successRate
        });
      }
      
      // Delay entre lotes para evitar rate limiting y timeouts
      if (delayBetweenBatches > 0 && currentBatch < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    const successRate = grades.length > 0 ? ((totalInserted / grades.length) * 100) : 0;
    console.log(`✅ [SQL DATABASE] insertGrades completado:`);
    console.log(`📊 Total insertados: ${totalInserted}/${grades.length} (${successRate.toFixed(1)}%)`);
    console.log(`❌ Total errores: ${totalErrors}`);
    
    return { 
      success: totalErrors === 0, 
      logs: [
        `📤 Insertados ${totalInserted}/${grades.length} registros (${successRate.toFixed(1)}% éxito)`,
        totalErrors > 0 ? `❌ ${totalErrors} errores encontrados` : `✅ Procesamiento completamente exitoso`
      ] 
    };
  }

  async getGradesByYear(year: number) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { data, error } = await client
      .from('grades')
      .select('*')
      .eq('year', year);
    if (error) throw error;
    const rows = (data || []).map((g: any) => {
      const grade: any = {
        id: g.id,
        testId: g.test_id,
        studentId: g.student_id,
        studentName: g.student_name,
        score: g.score,
        courseId: g.course_id,
        sectionId: g.section_id,
        subjectId: g.subject_id,
        title: g.title,
        gradedAt: g.graded_at,
        year: g.year,
        type: g.type,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      };
      
      // Agregar topic si existe
      if (g.topic) {
        grade.topic = g.topic;
      }
      
      return grade;
    }) as GradeRecord[];
    return { grades: rows };
  }

  // Borrado de calificaciones por año con preferencia a endpoint de servidor (Service Role)
  async deleteGradesByYear(year: number, onProgress?: (deleted: number) => void) {
    // Intento 1: endpoint de servidor
    try {
      const res = await fetch('/api/sql/grades/delete-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year })
      });
      if (res.ok) {
        const json: any = await res.json();
        if (json?.success) {
          const deleted = Number(json?.deleted || json?.details?.reportedCount || 0) || 0;
          if (onProgress) { try { onProgress(deleted); } catch {} }
          return { success: true, deleted, remaining: Math.max((json?.details?.afterCount ?? 0), 0) };
        }
      }
    } catch (e) {
      console.warn('[SQL DATABASE] Fallback a cliente ANON para deleteGradesByYear:', e);
    }

    // Intento 2: cliente ANON (puede fallar por RLS)
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    
    console.log(`🗑️ [SQL DATABASE] Iniciando deleteGradesByYear(${year})`);
    console.log(`🗑️ [SQL DATABASE] Cliente Supabase conectado:`, !!client);
  try { console.log(`🗑️ [SQL DATABASE] Cliente Supabase listo`); } catch {}
    
    // Primero contar cuántos registros hay para este año
    console.log(`📊 [SQL DATABASE] Contando registros antes del borrado...`);
    const { count: beforeCount, error: countError } = await client
      .from('grades')
      .select('id', { count: 'exact', head: true })
      .eq('year', year);
    
    if (countError) {
      console.error(`❌ [SQL DATABASE] Error contando registros antes del borrado:`, countError);
      throw countError;
    }
    
    console.log(`📊 [SQL DATABASE] Registros encontrados para el año ${year}:`, beforeCount || 0);
    
    if ((beforeCount || 0) === 0) {
      console.log(`ℹ️ [SQL DATABASE] No hay registros para borrar en el año ${year}`);
      return { success: true, deleted: 0, remaining: 0 };
    }
    
    // Ejecutar el borrado
    console.log(`🗑️ [SQL DATABASE] Ejecutando DELETE en Supabase para año ${year}...`);
    console.log(`🗑️ [SQL DATABASE] Query: DELETE FROM grades WHERE year = ${year}`);
    
    const deleteResult = await client
      .from('grades')
      .delete({ count: 'exact' })
      .eq('year', year);
      
    console.log(`🗑️ [SQL DATABASE] Resultado completo del DELETE:`, deleteResult);
    const { count, error, data } = deleteResult;
      
    if (error) {
      console.error(`❌ [SQL DATABASE] Error en DELETE:`, error);
      console.error(`❌ [SQL DATABASE] Error code:`, error.code);
      console.error(`❌ [SQL DATABASE] Error message:`, error.message);
      console.error(`❌ [SQL DATABASE] Error details:`, error.details);
      throw error;
    }
    
    console.log(`✅ [SQL DATABASE] DELETE ejecutado exitosamente`);
    console.log(`📊 [SQL DATABASE] Registros eliminados según respuesta:`, count || 0);
    console.log(`📋 [SQL DATABASE] Data response:`, data);
    
    // Verificar que realmente se eliminaron
    console.log(`🔍 [SQL DATABASE] Verificando borrado real en la base de datos...`);
    const { count: afterCount, error: afterError } = await client
      .from('grades')
      .select('id', { count: 'exact', head: true })
      .eq('year', year);
    
    if (afterError) {
      console.error(`❌ [SQL DATABASE] Error verificando después del borrado:`, afterError);
    } else {
      console.log(`📊 [SQL DATABASE] Registros restantes después del borrado:`, afterCount || 0);
      
      if ((afterCount || 0) > 0) {
        console.warn(`⚠️ [SQL DATABASE] PROBLEMA CRÍTICO: Aún quedan ${afterCount} registros después del borrado`);
        console.warn(`⚠️ [SQL DATABASE] Se reportó borrado de ${count} pero quedan ${afterCount}`);
        
        // Obtener algunos registros que no se borraron para diagnóstico
        const { data: remainingData, error: remainingError } = await client
          .from('grades')
          .select('id, student_name, year, score, created_at')
          .eq('year', year)
          .limit(5);
        
        if (!remainingError && remainingData) {
          console.log(`📋 [SQL DATABASE] Registros que NO se borraron:`, remainingData);
        }
        
        // Intentar un segundo borrado si el primero falló
        console.log(`🔄 [SQL DATABASE] Intentando segundo borrado...`);
        const secondDelete = await client
          .from('grades')
          .delete({ count: 'exact' })
          .eq('year', year);
          
        console.log(`🔄 [SQL DATABASE] Resultado segundo DELETE:`, secondDelete);
      } else {
        console.log(`✅ [SQL DATABASE] Verificación exitosa: No quedan registros para el año ${year}`);
      }
    }
    
    const actuallyDeleted = Math.max((beforeCount || 0) - (afterCount || 0), 0);
    if (onProgress) { try { onProgress(actuallyDeleted); } catch {} }
    return { success: true, deleted: actuallyDeleted, remaining: afterCount || 0 };
  }

  async clearAllData() {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { count, error } = await client.from('grades').delete({ count: 'exact' }).neq('id', '');
    if (error) throw error;
    return { success: true, logs: [`🗑️ Eliminados ${count || 0} registros de grades`] };
  }

  // Limpiezas globales adicionales
  async clearAllActivities() {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { count, error } = await client.from('activities').delete({ count: 'exact' }).neq('id', '');
    if (error) throw error;
    return { success: true, logs: [`🗑️ Eliminadas ${count || 0} actividades`] };
  }

  async clearAllAttendance() {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    const { count, error } = await client.from('attendance').delete({ count: 'exact' }).neq('id', '');
    if (error) throw error;
    return { success: true, logs: [`🗑️ Eliminados ${count || 0} registros de asistencia`] };
  }

  async countGradesByYear(year: number) {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    
    console.log(`📊 [SQL DATABASE] countGradesByYear(${year}) iniciado`);
    const { count, error } = await client.from('grades').select('id', { count: 'exact', head: true }).eq('year', year);
    if (error) {
      console.error(`❌ [SQL DATABASE] Error en countGradesByYear:`, error);
      throw error;
    }
    
    console.log(`📊 [SQL DATABASE] countGradesByYear(${year}) resultado: ${count || 0} registros`);
    return { count: count || 0, year };
  }

  async countAllGrades() {
    const client = this.connect();
    if (!client) throw new Error('Supabase no configurado');
    
    console.log(`📊 [SQL DATABASE] countAllGrades() iniciado`);
    const { count, error } = await client.from('grades').select('id', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ [SQL DATABASE] Error en countAllGrades:`, error);
      throw error;
    }
    
    console.log(`📊 [SQL DATABASE] countAllGrades() resultado: ${count || 0} registros`);
    return { total: count || 0 };
  }
}

export const sqlDatabase = SQLDatabaseService.instance();
 
// Extensiones: actividades académicas (tarea/evaluación/prueba)
export type ActivityRecord = {
  id: string;
  taskType: 'tarea' | 'prueba' | 'evaluacion';
  title: string;
  subjectId: string | null;
  subjectName?: string | null;
  courseId: string | null;
  sectionId: string | null;
  createdAt: string; // ISO
  startAt?: string | null;
  openAt?: string | null;
  dueDate?: string | null;
  status?: string | null;
  assignedById?: string | null;
  assignedByName?: string | null;
  year: number;
};

declare module './sql-database' {
  interface SQLDatabaseService {
    insertActivities(activities: ActivityRecord[]): Promise<{ success: boolean; logs: string[] }>
  getActivitiesByYear(year: number, filters?: { courseId?: string | null; sectionId?: string | null; subjectId?: string | null }): Promise<{ activities: ActivityRecord[] }>
    deleteActivitiesByYear(year: number): Promise<{ success: boolean; deleted: number }>
    clearAllActivities(): Promise<{ success: boolean; logs: string[] }>
  }
}

SQLDatabaseService.prototype.insertActivities = async function(activities: ActivityRecord[], onProgress?: (progress: { processed: number; total: number; currentBatch: number; totalBatches: number; errors: number; successRate: number }) => void) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  console.log(`📤 [SQL DATABASE] insertActivities iniciado con ${activities.length} registros`);
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  // ⚡ OPTIMIZACIÓN PARA CARGAS MASIVAS DE ACTIVIDADES:
  const batchSize = activities.length > 100000 ? 250 : activities.length > 50000 ? 400 : activities.length > 10000 ? 600 : 1000;
  const delayBetweenBatches = activities.length > 100000 ? 150 : activities.length > 50000 ? 100 : activities.length > 10000 ? 50 : 0;
  const maxRetries = 3;
  
  const totalBatches = Math.ceil(activities.length / batchSize);
  console.log(`🎯 [SQL DATABASE] Configuración optimizada para ${activities.length} actividades:`);
  console.log(`📦 ${totalBatches} lotes de ${batchSize} registros cada uno`);
  console.log(`⏱️ Delay entre lotes: ${delayBetweenBatches}ms`);
  
  for (let i = 0; i < activities.length; i += batchSize) {
    const currentBatch = Math.floor(i / batchSize) + 1;
    
    // Mapear a snake_case y sanitizar claves permitidas para evitar fugas camelCase
    const raw = activities.slice(i, i + batchSize).map(a => ({
      id: a.id,
      task_type: a.taskType,
      title: a.title,
      subject_id: a.subjectId,
      subject_name: a.subjectName ?? null,
      course_id: a.courseId,
      section_id: a.sectionId,
      created_at: a.createdAt,
      start_at: a.startAt ?? null,
      open_at: a.openAt ?? null,
      due_date: a.dueDate ?? null,
      status: a.status ?? null,
      assigned_by_id: a.assignedById ?? null,
      assigned_by_name: a.assignedByName ?? null,
      year: a.year,
    }));
    
    const allowedKeys = new Set([
      'id','task_type','title','subject_id','subject_name','course_id','section_id',
      'created_at','start_at','open_at','due_date','status','assigned_by_id','assigned_by_name','year'
    ]);
    const sanitize = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([k]) => allowedKeys.has(k)));
    const batch = raw.map(sanitize);
    
    console.log(`📦 [SQL DATABASE] Procesando lote de actividades ${currentBatch}/${totalBatches}: ${batch.length} registros`);
    
    if (i === 0 && batch.length > 0) {
      try {
        console.log('[SQL] Upsert activities payload sample keys:', Object.keys(batch[0]));
        const hasCamel = Object.keys(batch[0]).some(k => /[A-Z]/.test(k));
        if (hasCamel) console.warn('[SQL] Advertencia: payload de activities contenía claves camelCase; se depuraron a snake_case');
      } catch {}
    }
    
    // Procesar lote con reintentos
    let retryCount = 0;
    let batchSuccess = false;
    let batchInserted = 0;
    
    while (retryCount <= maxRetries && !batchSuccess) {
      try {
        const { error, count } = await client.from('activities').upsert(batch, { onConflict: 'id', count: 'exact' });
        
        if (error) {
          retryCount++;
          console.warn(`⚠️ [SQL DATABASE] Error en lote de actividades ${currentBatch}, intento ${retryCount}/${maxRetries + 1}:`, error.message);
          
          if (retryCount > maxRetries) {
            console.error(`❌ [SQL DATABASE] Lote de actividades ${currentBatch} falló después de ${maxRetries} reintentos`);
            totalErrors += batch.length;
            
            // Sub-lotes como último recurso
            if (batch.length > 50) {
              console.log(`🔄 [SQL DATABASE] Dividiendo lote ${currentBatch} en sub-lotes...`);
              const subBatchSize = 50;
              for (let j = 0; j < batch.length; j += subBatchSize) {
                const subBatch = batch.slice(j, j + subBatchSize);
                try {
                  const { error: subError, count: subCount } = await client.from('activities').upsert(subBatch, { onConflict: 'id', count: 'exact' });
                  if (!subError) {
                    const subInserted = subCount || subBatch.length;
                    batchInserted += subInserted;
                    totalErrors -= subBatch.length;
                    console.log(`✅ [SQL DATABASE] Sub-lote de actividades ${Math.floor(j/subBatchSize) + 1} exitoso: ${subInserted} registros`);
                  }
                  await new Promise(resolve => setTimeout(resolve, 25));
                } catch (subErr) {
                  console.error(`❌ [SQL DATABASE] Sub-lote de actividades falló:`, subErr);
                }
              }
            }
            break;
          } else {
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
            console.log(`⏳ [SQL DATABASE] Esperando ${backoffDelay}ms antes del reintento...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
        } else {
          batchInserted = count || batch.length;
          totalInserted += batchInserted;
          batchSuccess = true;
          console.log(`✅ [SQL DATABASE] Lote de actividades ${currentBatch}/${totalBatches} completado: ${batchInserted} registros insertados`);
        }
      } catch (batchError: any) {
        retryCount++;
        console.error(`💥 [SQL DATABASE] Error crítico en lote de actividades ${currentBatch}, intento ${retryCount}:`, batchError.message);
        
        if (retryCount > maxRetries) {
          totalErrors += batch.length;
          break;
        }
        
        const backoffDelay = Math.min(2000 * Math.pow(2, retryCount - 1), 8000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    // Callback de progreso
    if (onProgress) {
      const processed = Math.min(i + batchSize, activities.length);
      const successRate = processed > 0 ? ((processed - totalErrors) / processed) * 100 : 0;
      
      onProgress({
        processed,
        total: activities.length,
        currentBatch,
        totalBatches,
        errors: totalErrors,
        successRate
      });
    }
    
    // Delay entre lotes
    if (delayBetweenBatches > 0 && currentBatch < totalBatches) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  const successRate = activities.length > 0 ? ((totalInserted / activities.length) * 100) : 0;
  console.log(`✅ [SQL DATABASE] insertActivities completado:`);
  console.log(`📊 Total insertadas: ${totalInserted}/${activities.length} (${successRate.toFixed(1)}%)`);
  console.log(`❌ Total errores: ${totalErrors}`);
  
  return { 
    success: totalErrors === 0, 
    logs: [
      `📤 Insertadas ${totalInserted}/${activities.length} actividades (${successRate.toFixed(1)}% éxito)`,
      totalErrors > 0 ? `❌ ${totalErrors} errores encontrados` : `✅ Procesamiento completamente exitoso`
    ] 
  };
};

SQLDatabaseService.prototype.getActivitiesByYear = async function(year: number) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { data, error } = await client.from('activities').select('*').eq('year', year);
  if (error) throw error;
  const rows = (data || []).map((a: any) => ({
    id: a.id,
    taskType: a.task_type,
    title: a.title,
    subjectId: a.subject_id,
    subjectName: a.subject_name ?? null,
    courseId: a.course_id,
    sectionId: a.section_id,
    createdAt: a.created_at,
    startAt: a.start_at ?? null,
    openAt: a.open_at ?? null,
    dueDate: a.due_date ?? null,
    status: a.status ?? null,
    assignedById: a.assigned_by_id ?? null,
    assignedByName: a.assigned_by_name ?? null,
    year: a.year,
  })) as ActivityRecord[];
  return { activities: rows };
};

SQLDatabaseService.prototype.deleteActivitiesByYear = async function(year: number) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { count, error } = await client.from('activities').delete({ count: 'exact' }).eq('year', year);
  if (error) throw error;
  return { success: true, deleted: count || 0 };
};

SQLDatabaseService.prototype.clearAllActivities = async function() {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { count, error } = await client.from('activities').delete({ count: 'exact' }).neq('id', '');
  if (error) throw error;
  return { success: true, logs: [`🗑️ Eliminadas ${count || 0} actividades`] };
};

// ======================
// Extensiones: Asistencia
// ======================
export type AttendanceRecord = {
  id: string;
  date: string; // ISO
  courseId: string | null;
  sectionId: string | null;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  present?: boolean;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  year: number;
};

declare module './sql-database' {
  interface SQLDatabaseService {
    insertAttendance(records: AttendanceRecord[]): Promise<{ success: boolean; logs: string[] }>;
    getAttendanceByYear(year: number): Promise<{ attendance: AttendanceRecord[] }>;
    deleteAttendanceByYear(year: number): Promise<{ success: boolean; deleted: number }>;
    countAttendanceByYear(year: number): Promise<{ count: number; year: number }>;
    countAllAttendance(): Promise<{ total: number }>;
    deleteAttendanceByDateCourseSection(year: number, ymd: string, courseId: string | null, sectionId: string | null): Promise<{ success: boolean; deleted: number }>;
    clearAllAttendance(): Promise<{ success: boolean; logs: string[] }>;
  }
}

SQLDatabaseService.prototype.insertAttendance = async function(records: AttendanceRecord[], onProgress?: (progress: { processed: number; total: number; currentBatch: number; totalBatches: number; errors: number; successRate: number }) => void) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  console.log(`📤 [SQL DATABASE] insertAttendance iniciado con ${records.length} registros`);
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  // ⚡ OPTIMIZACIÓN PARA CARGAS MASIVAS DE ASISTENCIA:
  const batchSize = records.length > 100000 ? 250 : records.length > 50000 ? 400 : records.length > 10000 ? 600 : 1000;
  const delayBetweenBatches = records.length > 100000 ? 150 : records.length > 50000 ? 100 : records.length > 10000 ? 50 : 0;
  const maxRetries = 3;
  
  const totalBatches = Math.ceil(records.length / batchSize);
  console.log(`🎯 [SQL DATABASE] Configuración optimizada para ${records.length} registros de asistencia:`);
  console.log(`📦 ${totalBatches} lotes de ${batchSize} registros cada uno`);
  console.log(`⏱️ Delay entre lotes: ${delayBetweenBatches}ms`);
  
  for (let i = 0; i < records.length; i += batchSize) {
    const currentBatch = Math.floor(i / batchSize) + 1;
    
    const raw = records.slice(i, i + batchSize).map(r => ({
      id: r.id,
      date: r.date,
      course_id: r.courseId,
      section_id: r.sectionId,
      student_id: r.studentId,
      status: r.status,
      present: r.present ?? (r.status === 'present'),
      comment: r.comment ?? null,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      year: r.year,
    }));
    
    // Sanitizar: solo columnas snake_case válidas
    const allowed = new Set(['id','date','course_id','section_id','student_id','status','present','comment','created_at','updated_at','year']);
    const sanitize = (o: any) => Object.fromEntries(Object.entries(o).filter(([k]) => allowed.has(k)));
    const batch = raw.map(sanitize);
    
    console.log(`📦 [SQL DATABASE] Procesando lote de asistencia ${currentBatch}/${totalBatches}: ${batch.length} registros`);
    
    if (i === 0 && batch.length > 0) {
      try {
        console.log('[SQL] Upsert attendance payload sample keys:', Object.keys(batch[0]));
        const hasCamel = Object.keys(batch[0]).some(k => /[A-Z]/.test(k));
        if (hasCamel) console.warn('[SQL] Advertencia: payload de attendance tenía camelCase; se depuró a snake_case');
      } catch {}
    }
    
    // Procesar lote con reintentos
    let retryCount = 0;
    let batchSuccess = false;
    let batchInserted = 0;
    
    while (retryCount <= maxRetries && !batchSuccess) {
      try {
        const { error, count } = await client.from('attendance').upsert(batch, { 
          onConflict: 'id',
          count: 'exact'
        });
        
        if (error) {
          retryCount++;
          console.warn(`⚠️ [SQL DATABASE] Error en lote de asistencia ${currentBatch}, intento ${retryCount}/${maxRetries + 1}:`, error.message);
          
          if (retryCount > maxRetries) {
            console.error(`❌ [SQL DATABASE] Lote de asistencia ${currentBatch} falló después de ${maxRetries} reintentos`);
            totalErrors += batch.length;
            
            // Sub-lotes como último recurso
            if (batch.length > 50) {
              console.log(`🔄 [SQL DATABASE] Dividiendo lote ${currentBatch} en sub-lotes...`);
              const subBatchSize = 50;
              for (let j = 0; j < batch.length; j += subBatchSize) {
                const subBatch = batch.slice(j, j + subBatchSize);
                try {
                  const { error: subError, count: subCount } = await client.from('attendance').upsert(subBatch, { onConflict: 'id', count: 'exact' });
                  if (!subError) {
                    const subInserted = subCount || subBatch.length;
                    batchInserted += subInserted;
                    totalErrors -= subBatch.length;
                    console.log(`✅ [SQL DATABASE] Sub-lote de asistencia ${Math.floor(j/subBatchSize) + 1} exitoso: ${subInserted} registros`);
                  }
                  await new Promise(resolve => setTimeout(resolve, 25));
                } catch (subErr) {
                  console.error(`❌ [SQL DATABASE] Sub-lote de asistencia falló:`, subErr);
                }
              }
            }
            break;
          } else {
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
            console.log(`⏳ [SQL DATABASE] Esperando ${backoffDelay}ms antes del reintento...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
        } else {
          batchInserted = count || batch.length;
          totalInserted += batchInserted;
          batchSuccess = true;
          console.log(`✅ [SQL DATABASE] Lote de asistencia ${currentBatch}/${totalBatches} completado: ${batchInserted} registros insertados`);
        }
      } catch (batchError: any) {
        retryCount++;
        console.error(`💥 [SQL DATABASE] Error crítico en lote de asistencia ${currentBatch}, intento ${retryCount}:`, batchError.message);
        
        if (retryCount > maxRetries) {
          totalErrors += batch.length;
          break;
        }
        
        const backoffDelay = Math.min(2000 * Math.pow(2, retryCount - 1), 8000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    // Callback de progreso
    if (onProgress) {
      const processed = Math.min(i + batchSize, records.length);
      const successRate = processed > 0 ? ((processed - totalErrors) / processed) * 100 : 0;
      
      onProgress({
        processed,
        total: records.length,
        currentBatch,
        totalBatches,
        errors: totalErrors,
        successRate
      });
    }
    
    // Delay entre lotes
    if (delayBetweenBatches > 0 && currentBatch < totalBatches) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  const successRate = records.length > 0 ? ((totalInserted / records.length) * 100) : 0;
  console.log(`✅ [SQL DATABASE] insertAttendance completado:`);
  console.log(`📊 Total insertados: ${totalInserted}/${records.length} (${successRate.toFixed(1)}%)`);
  console.log(`❌ Total errores: ${totalErrors}`);
  
  return { 
    success: totalErrors === 0, 
    logs: [
      `📤 Insertados ${totalInserted}/${records.length} registros de asistencia (${successRate.toFixed(1)}% éxito)`,
      totalErrors > 0 ? `❌ ${totalErrors} errores encontrados` : `✅ Procesamiento completamente exitoso`
    ] 
  };
};

SQLDatabaseService.prototype.getAttendanceByYear = async function(year: number) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { data, error } = await client.from('attendance').select('*').eq('year', year);
  if (error) throw error;
  const rows = (data || []).map((r: any) => ({
    id: r.id,
    date: r.date,
    courseId: r.course_id,
    sectionId: r.section_id,
    studentId: r.student_id,
    status: r.status,
    present: r.present,
    comment: r.comment ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    year: r.year,
  })) as AttendanceRecord[];
  return { attendance: rows };
};

SQLDatabaseService.prototype.deleteAttendanceByYear = async function(year: number, onProgress?: (deleted: number) => void) {
  // Intento 1: endpoint de servidor con Service Role Key
  try {
    const res = await fetch('/api/sql/attendance/delete-year', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year })
    });
    if (res.ok) {
      const json: any = await res.json();
      if (json?.success) {
        const deleted = Number(json?.deleted || json?.details?.reportedCount || 0) || 0;
        if (onProgress) { try { onProgress(deleted); } catch {} }
        return { success: true, deleted, remaining: Math.max((json?.details?.afterCount ?? 0), 0) };
      }
    }
  } catch (e) {
    console.warn('[SQL DATABASE] Fallback a cliente ANON para deleteAttendanceByYear:', e);
  }

  // Intento 2: cliente ANON (puede fallar por RLS)
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  // Diagnóstico detallado: contar antes, borrar y verificar después
  console.log(`🗑️ [SQL DATABASE] Iniciando deleteAttendanceByYear(${year})`);
  console.log(`🗑️ [SQL DATABASE] Cliente Supabase conectado:`, !!client);
  
  // Conteo previo
  console.log(`📊 [SQL DATABASE] Contando registros de asistencia antes del borrado...`);
  const { count: beforeCount, error: beforeErr } = await client
    .from('attendance')
    .select('id', { head: true, count: 'exact' })
    .eq('year', year);
  if (beforeErr) {
    console.error('❌ [SQL DATABASE] Error contando asistencia antes del borrado:', beforeErr);
    throw beforeErr;
  }
  console.log(`📊 [SQL DATABASE] Registros de asistencia ${year} antes del borrado:`, beforeCount || 0);
  
  if ((beforeCount || 0) === 0) {
    console.log(`ℹ️ [SQL DATABASE] No hay registros de asistencia para borrar en el año ${year}`);
    return { success: true, deleted: 0, remaining: 0 };
  }

  // Borrado
  console.log(`🗑️ [SQL DATABASE] Ejecutando DELETE en Supabase para año ${year}...`);
  console.log(`🗑️ [SQL DATABASE] Query: DELETE FROM attendance WHERE year = ${year}`);
  const deleteResult = await client
    .from('attendance')
    .delete({ count: 'exact' })
    .eq('year', year);
  
  console.log(`🗑️ [SQL DATABASE] Resultado completo del DELETE:`, deleteResult);
  const { count, error, data } = deleteResult;
  
  if (error) {
    console.error('❌ [SQL DATABASE] Error en DELETE asistencia:', error);
    console.error('❌ [SQL DATABASE] Error code:', error.code);
    console.error('❌ [SQL DATABASE] Error message:', error.message);
    console.error('❌ [SQL DATABASE] Error details:', error.details);
    throw error;
  }
  
  const deleted = count || 0;
  console.log(`✅ [SQL DATABASE] DELETE asistencia ejecutado exitosamente`);
  console.log(`📊 [SQL DATABASE] Registros eliminados según respuesta:`, deleted);
  console.log(`📋 [SQL DATABASE] Data response:`, data);

  // Verificación posterior
  console.log(`🔍 [SQL DATABASE] Verificando borrado real en la base de datos...`);
  const { count: afterCount, error: afterErr } = await client
    .from('attendance')
    .select('id', { head: true, count: 'exact' })
    .eq('year', year);
  
  if (afterErr) {
    console.error('❌ [SQL DATABASE] Error verificando asistencia después del borrado:', afterErr);
  } else {
    console.log(`📊 [SQL DATABASE] Registros de asistencia restantes en ${year}:`, afterCount || 0);
    
    if ((afterCount || 0) > 0) {
      console.warn(`⚠️ [SQL DATABASE] PROBLEMA CRÍTICO: Aún quedan ${afterCount} registros de asistencia después del borrado`);
      console.warn(`⚠️ [SQL DATABASE] Se reportó borrado de ${count} pero quedan ${afterCount}`);
      
      // Obtener algunos registros que no se borraron para diagnóstico
      try {
        const { data: remaining } = await client
          .from('attendance')
          .select('id, student_id, date, year, status')
          .eq('year', year)
          .limit(5);
        if (remaining && remaining.length) {
          console.log('📋 [SQL DATABASE] Registros de asistencia que NO se borraron:', remaining);
        }
      } catch {}
      
      // Intentar un segundo borrado si el primero falló
      console.log(`🔄 [SQL DATABASE] Intentando segundo borrado...`);
      const secondDelete = await client
        .from('attendance')
        .delete({ count: 'exact' })
        .eq('year', year);
      console.log(`🔄 [SQL DATABASE] Resultado segundo DELETE:`, secondDelete);
    } else {
      console.log(`✅ [SQL DATABASE] Verificación exitosa: No quedan registros de asistencia para el año ${year}`);
    }
  }

  const actuallyDeleted = Math.max((beforeCount || 0) - (afterCount || 0), 0);
  if (onProgress) { try { onProgress(actuallyDeleted); } catch {} }
  return { success: true, deleted: actuallyDeleted, remaining: afterCount || 0 };
};

SQLDatabaseService.prototype.countAttendanceByYear = async function(year: number) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { count, error } = await client.from('attendance').select('id', { count: 'exact', head: true }).eq('year', year);
  if (error) throw error;
  return { count: count || 0, year };
};

SQLDatabaseService.prototype.countAllAttendance = async function() {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { count, error } = await client.from('attendance').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return { total: count || 0 };
};

SQLDatabaseService.prototype.deleteAttendanceByDateCourseSection = async function(year: number, ymd: string, courseId: string | null, sectionId: string | null) {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const datePrefix = String(ymd).slice(0, 10);
  // Filtrar por rango de fecha del día para cubrir posibles tiempos
  const from = `${datePrefix}T00:00:00.000Z`;
  const to = `${datePrefix}T23:59:59.999Z`;
  let query = client.from('attendance').delete({ count: 'exact' }).eq('year', year).gte('date', from).lte('date', to);
  if (courseId != null) query = query.eq('course_id', courseId);
  if (sectionId != null) query = query.eq('section_id', sectionId);
  const { count, error } = await query;
  if (error) throw error;
  return { success: true, deleted: count || 0 };
};

SQLDatabaseService.prototype.clearAllAttendance = async function() {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  const { count, error } = await client.from('attendance').delete({ count: 'exact' }).neq('id', '');
  if (error) throw error;
  return { success: true, logs: [`🗑️ Eliminados ${count || 0} registros de attendance`] };
};

// ======================
// Extensiones: Estadísticas Precomputadas
// ======================
export type StatsKPIYear = {
  year: number;
  total_students: number;
  active_students: number;
  total_courses: number;
  active_courses: number;
  total_grades: number;
  average_grade: number;
  total_attendance_records: number;
  attendance_rate: number;
  last_updated: string;
};

export type StatsAttendanceMonthly = {
  year: number;
  month: number;
  attendance_rate: number;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  last_updated: string;
};

export type StatsAttendanceSection = {
  year: number;
  course_id: string;
  section_id: string;
  attendance_rate: number;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  last_updated: string;
};

declare module './sql-database' {
  interface SQLDatabaseService {
    // Métodos de lectura de estadísticas precomputadas
    getKPIsByYear(year: number): Promise<StatsKPIYear | null>;
    getAttendanceMonthly(year: number): Promise<StatsAttendanceMonthly[]>;
    getAttendanceSectionAgg(year: number): Promise<StatsAttendanceSection[]>;
    
    // Métodos de refreso de estadísticas
    refreshAttendanceStatsForYear(year: number): Promise<{ success: boolean; logs: string[] }>;
    refreshGradesKpisForYear(year: number): Promise<{ success: boolean; logs: string[] }>;
    refreshAllStatsForYear(year: number): Promise<{ success: boolean; logs: string[] }>;
  }
}

SQLDatabaseService.prototype.getKPIsByYear = async function(year: number): Promise<StatsKPIYear | null> {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  const { data, error } = await client
    .from('stats_kpis_year')
    .select('*')
    .eq('year', year)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  
  return data as StatsKPIYear;
};

SQLDatabaseService.prototype.getAttendanceMonthly = async function(year: number): Promise<StatsAttendanceMonthly[]> {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  const { data, error } = await client
    .from('stats_attendance_monthly')
    .select('*')
    .eq('year', year)
    .order('month', { ascending: true });
  
  if (error) throw error;
  
  return (data || []) as StatsAttendanceMonthly[];
};

SQLDatabaseService.prototype.getAttendanceSectionAgg = async function(year: number): Promise<StatsAttendanceSection[]> {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  const { data, error } = await client
    .from('stats_attendance_section')
    .select('*')
    .eq('year', year)
    .order('course_id', { ascending: true });
  
  if (error) throw error;
  
  return (data || []) as StatsAttendanceSection[];
};

SQLDatabaseService.prototype.refreshAttendanceStatsForYear = async function(year: number): Promise<{ success: boolean; logs: string[] }> {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  try {
    // Llamar función SQL para refrescar estadísticas de asistencia
    const { data, error } = await client.rpc('refresh_attendance_stats_for_year', { target_year: year });
    
    if (error) throw error;
    
    return { 
      success: true, 
      logs: [`📊 Estadísticas de asistencia refrescadas para el año ${year}`] 
    };
  } catch (error) {
    throw new Error(`Error refrescando estadísticas de asistencia: ${error}`);
  }
};

SQLDatabaseService.prototype.refreshGradesKpisForYear = async function(year: number): Promise<{ success: boolean; logs: string[] }> {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  try {
    // Llamar función SQL para refrescar KPIs de calificaciones
    const { data, error } = await client.rpc('refresh_grades_kpis_for_year', { target_year: year });
    
    if (error) throw error;
    
    return { 
      success: true, 
      logs: [`📊 KPIs de calificaciones refrescados para el año ${year}`] 
    };
  } catch (error) {
    throw new Error(`Error refrescando KPIs de calificaciones: ${error}`);
  }
};

SQLDatabaseService.prototype.refreshAllStatsForYear = async function(year: number): Promise<{ success: boolean; logs: string[] }> {
  const client = this.connect();
  if (!client) throw new Error('Supabase no configurado');
  
  try {
    // Llamar función SQL para refrescar todas las estadísticas
    const { data, error } = await client.rpc('refresh_all_stats_for_year', { target_year: year });
    
    if (error) throw error;
    
    return { 
      success: true, 
      logs: [`📊 Todas las estadísticas refrescadas para el año ${year}`] 
    };
  } catch (error) {
    throw new Error(`Error refrescando todas las estadísticas: ${error}`);
  }
};
