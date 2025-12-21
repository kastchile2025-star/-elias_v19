import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

export const maxDuration = 300; // 5 minutos máximo
export const dynamic = 'force-dynamic';

function jsonResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

/**
 * API Route: POST /api/firebase/bulk-upload-attendance
 * 
 * Carga masiva de asistencia a Firestore usando Firebase Admin SDK.
 * 
 * Formato CSV esperado:
 * - date | fecha (YYYY-MM-DD)
 * - course | curso
 * - section | seccion
 * - studentUsername | username
 * - rut
 * - name | nombre
 * - status (present/absent/late/justified)
 * - comment | comentario (opcional)
 */

function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function getColumnValue(row: any, aliases: string[]): string {
  const normalizedAliases = aliases.map(norm);
  for (const alias of normalizedAliases) {
    const key = Object.keys(row).find(k => norm(k) === alias);
    if (key && row[key]) {
      return String(row[key]).trim();
    }
  }
  for (const alias of aliases) {
    if (row[alias]) {
      return String(row[alias]).trim();
    }
  }
  return '';
}

// Generar ID único para documentos
// IMPORTANTE: Convierte acentos a letras normales para consistencia entre sistemas
function toId(...parts: string[]): string {
  return parts
    .map(p => String(p || '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      // Convertir vocales acentuadas a sin acento
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      // Eliminar caracteres especiales restantes
      .replace(/[^a-z0-9_\-]/g, '')
    )
    .filter(Boolean)
    .join('-');
}

function parseFlexibleDate(input: string): Date | null {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (/[Tt]|:\d{2}/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  const t = raw.replaceAll('.', '/').replaceAll('-', '/');
  const ymd = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

  let y = 0, m = 0, d = 0;
  let match: RegExpMatchArray | null;
  if ((match = t.match(ymd))) {
    y = Number(match[1]); m = Number(match[2]); d = Number(match[3]);
  } else if ((match = t.match(dmy))) {
    d = Number(match[1]); m = Number(match[2]); y = Number(match[3]);
  } else {
    const nd = new Date(raw);
    return isNaN(nd.getTime()) ? null : nd;
  }

  if (!y || !m || !d) return null;
  const localNoon = new Date(y, m - 1, d, 12, 0, 0, 0);
  return isNaN(localNoon.getTime()) ? null : localNoon;
}

export async function POST(request: NextRequest) {
  console.log('🚀 [API] Inicio de solicitud POST a /api/firebase/bulk-upload-attendance');
  
  let formData: FormData | null = null;
  let file: File | null = null;
  
  try {
    console.log('📦 [API] Extrayendo FormData...');
    
    try {
      formData = await request.formData();
      console.log('✅ [API] FormData extraído correctamente');
    } catch (formDataError: any) {
      console.error('❌ [API] Error al extraer FormData:', formDataError);
      return jsonResponse({ 
        error: 'Error al leer los datos del formulario',
        details: formDataError.message 
      }, 400);
    }
    
    file = formData.get('file') as File | null;
    const yearStr = (formData.get('year') as string) || '';
    const jobId = ((formData.get('jobId') as string) || '').trim() || `import-attendance-${Date.now()}`;
    
    console.log('📋 [API] Parámetros recibidos:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      year: yearStr,
      jobId
    });
    
    if (!file) {
      console.error('❌ [API] No se recibió archivo');
      return jsonResponse({ error: 'No se recibió archivo CSV' }, 400);
    }

    const year = yearStr ? Number(yearStr) : new Date().getFullYear();
    console.log('📅 [API] Año para procesamiento:', year);
    
    console.log('📖 [API] Leyendo contenido del archivo...');
    let text: string;
    try {
      // Leer como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Log de bytes crudos para debug
      console.log(`🔍 [API] Primeros 150 bytes RAW (hex): ${Array.from(uint8Array.slice(0, 150)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
      
      // Detectar y remover BOM si existe
      let startOffset = 0;
      if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
        startOffset = 3;
        console.log('⚠️ [API] BOM UTF-8 detectado y removido');
      } else if (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
        startOffset = 2;
        console.log('⚠️ [API] BOM UTF-16 BE detectado');
      } else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
        startOffset = 2;
        console.log('⚠️ [API] BOM UTF-16 LE detectado');
      }
      
      const dataArray = startOffset > 0 ? uint8Array.slice(startOffset) : uint8Array;
      
      // Intentar UTF-8 primero
      const decoder = new TextDecoder('utf-8', { fatal: false });
      text = decoder.decode(dataArray);
      
      // Verificar si hay caracteres de reemplazo (indica fallo de decodificación)
      const replacementCount = (text.match(/\uFFFD/g) || []).length;
      console.log(`🔍 [API] Caracteres de reemplazo UTF-8 encontrados: ${replacementCount}`);
      
      // Detectar mojibake: UTF-8 interpretado como latin1 produce patrones como "Ã­" para "í"
      // Esto ocurre cuando el navegador envía el archivo con encoding incorrecto
      const mojibakePatterns = /Ã¡|Ã©|Ã­|Ã³|Ãº|Ã±|Ã¼|Ã|Ã‰|Ã|Ã"|Ãš|Ã'/g;
      const mojibakeCount = (text.match(mojibakePatterns) || []).length;
      console.log(`🔍 [API] Patrones mojibake detectados: ${mojibakeCount}`);
      
      if (mojibakeCount > 0) {
        // Corregir mojibake: reinterpretar el texto
        console.log('⚠️ [API] Detectado mojibake (UTF-8 mal interpretado), corrigiendo...');
        // La solución es re-codificar como latin1 y luego decodificar como UTF-8
        const latin1Encoder = new TextEncoder();
        const reEncoded = new Uint8Array([...text].map(c => c.charCodeAt(0) & 0xFF));
        const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
        text = utf8Decoder.decode(reEncoded);
        console.log('✅ [API] Mojibake corregido');
        
        // Verificar que la corrección funcionó
        const testSample = text.substring(0, 100);
        console.log(`🔍 [API] Muestra después de corrección: "${testSample}"`);
      } else if (replacementCount > 10) {
        // Probar con latin1/iso-8859-1 (común en archivos de Windows en español)
        console.log('⚠️ [API] Demasiados errores UTF-8, probando latin1...');
        const latin1Decoder = new TextDecoder('iso-8859-1');
        text = latin1Decoder.decode(dataArray);
        console.log('✅ [API] Archivo decodificado como latin1');
      }
      
      // Si la primera línea de datos empieza con comilla, verificar si es un problema de encoding
      const lines = text.split(/\r?\n/);
      console.log(`🔍 [API] Primera línea: "${lines[0]}"`);
      if (lines.length > 1) {
        console.log(`🔍 [API] Segunda línea (primeros 80 chars): "${lines[1]?.substring(0, 80)}"`);
        console.log(`🔍 [API] Segunda línea charCodes: ${lines[1]?.substring(0, 50).split('').map(c => c.charCodeAt(0)).join(',')}`);
        
        // Si la línea de datos empieza con comilla doble pero no debería
        if (lines[1]?.startsWith('"') && lines[0]?.startsWith('date')) {
          console.log('⚠️ [API] Detectada línea de datos envuelta en comillas - posible problema de formato');
        }
      }
      
      console.log(`📁 [API] Archivo leído: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      console.log(`📏 [API] Longitud del texto: ${text.length} caracteres`);
      
      if (!text || text.trim().length === 0) {
        console.error('❌ [API] El archivo está vacío');
        return jsonResponse({ 
          error: 'El archivo CSV está vacío',
          details: 'No se encontró contenido en el archivo'
        }, 400);
      }
    } catch (readError: any) {
      console.error('❌ [API] Error al leer archivo:', readError);
      return jsonResponse({ 
        error: 'Error al leer el archivo',
        details: readError.message 
      }, 400);
    }

    console.log('🔬 [API] Parseando CSV con PapaParse...');
    
    // Detectar delimitador automáticamente analizando la primera línea
    const firstLine = text.split(/\r?\n/)[0] || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    
    let detectedDelimiter = ',';
    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      detectedDelimiter = ';';
    } else if (tabCount > commaCount && tabCount > semicolonCount) {
      detectedDelimiter = '\t';
    }
    
    console.log(`🔍 [API] Primera línea del archivo: "${firstLine.substring(0, 200)}..."`);
    console.log(`🔍 [API] Delimitadores detectados: comas=${commaCount}, punto y coma=${semicolonCount}, tabs=${tabCount}`);
    console.log(`🔍 [API] Usando delimitador: "${detectedDelimiter === '\t' ? 'TAB' : detectedDelimiter}"`);
    
    // Detectar si la primera línea es un header válido o datos
    // Los headers válidos deberían contener palabras como: date, course, section, username, rut, status, etc.
    const headerKeywords = ['date', 'fecha', 'course', 'curso', 'section', 'seccion', 'username', 'studentusername', 'rut', 'status', 'estado', 'name', 'nombre'];
    const firstLineLower = firstLine.toLowerCase();
    const looksLikeHeader = headerKeywords.some(kw => firstLineLower.includes(kw)) && !/^\d{4}-\d{2}-\d{2}/.test(firstLine);
    
    console.log(`🔍 [API] ¿Primera línea parece header? ${looksLikeHeader}`);
    
    let rows: any[];

    const defaultHeaders = ['date', 'course', 'section', 'studentusername', 'rut', 'name', 'status', 'comment'];
    
    if (looksLikeHeader) {
      // Parsear con headers automáticos
      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: detectedDelimiter,
        transformHeader: (h: string) => h.toLowerCase().trim(),
      });
      rows = parseResult.data as any[];
      console.log(`📊 [API] Filas parseadas (con headers): ${rows.length}`);

      // Si solo se detecta una columna (por ejemplo "date"), reprocesar como CSV sin headers
      if (rows.length > 0) {
        const detectedHeaders = Object.keys(rows[0] as object);
        console.log(`📋 [API] Headers detectados inicialmente (${detectedHeaders.length}): ${detectedHeaders.join(', ')}`);

        if (detectedHeaders.length === 1 && detectedHeaders[0].toLowerCase() === 'date') {
          console.warn('⚠️ [API] Solo se detectó la columna "date". PapaParse falló - parseando manualmente línea por línea.');

          // Parseo manual: separar por líneas y luego por comas
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          console.log(`📊 [API] Total líneas en archivo: ${lines.length}`);
          
          // DEBUG: Mostrar las primeras 3 líneas RAW
          console.log(`🔍 [DEBUG] Línea 0 (header) RAW: "${lines[0]}"`);
          console.log(`🔍 [DEBUG] Línea 1 (data) RAW: "${lines[1]}"`);
          console.log(`🔍 [DEBUG] Línea 1 tiene ${(lines[1]?.match(/,/g) || []).length} comas`);
          console.log(`🔍 [DEBUG] Línea 1 charCodes primeros 50: ${lines[1]?.substring(0, 50).split('').map(c => c.charCodeAt(0)).join(',')}`);
          
          // Skipear la primera línea (headers)
          const dataLines = lines.slice(1);
          
          rows = dataLines.map((line: string) => {
            // Parsear la línea manejando campos entre comillas
            const fields: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                fields.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
              } else {
                current += char;
              }
            }
            // Agregar el último campo
            fields.push(current.trim().replace(/^"|"$/g, ''));
            
            const obj: Record<string, string> = {};
            defaultHeaders.forEach((header, idx) => {
              obj[header] = (fields[idx] || '').trim();
            });
            return obj;
          });
          console.log(`📊 [API] Filas parseadas (manualmente): ${rows.length}`);
          
          // Log de muestra para verificar
          if (rows.length > 0) {
            console.log(`🔍 [API] Primera fila parseada manualmente:`, JSON.stringify(rows[0]));
          }
        }
      }
    } else {
      // CSV sin headers - usar headers por defecto
      console.log(`⚠️ [API] CSV sin headers detectado, usando headers por defecto`);

      const parseResult = Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        delimiter: detectedDelimiter,
      });
      
      // Convertir arrays a objetos con headers
      rows = (parseResult.data as string[][]).map((row: string[]) => {
        const obj: Record<string, string> = {};
        defaultHeaders.forEach((header, idx) => {
          obj[header] = (row[idx] || '').trim();
        });
        return obj;
      });
      console.log(`📊 [API] Filas parseadas (sin headers, usando defaults): ${rows.length}`);
    }
    
    // Mostrar headers detectados finales
    if (rows.length > 0) {
      const headers = Object.keys(rows[0] as object);
      console.log(`📋 [API] Headers finales (${headers.length}): ${headers.join(', ')}`);
    }
    
    if (!rows || rows.length === 0) {
      return jsonResponse({ error: 'CSV vacío o inválido' }, 400);
    }

    // Inicializar Firebase Admin
    const admin = (await import('firebase-admin')).default;
    const fs = await import('fs/promises');
    const path = await import('path');
    
    if (admin.apps.length === 0) {
      try {
        let credential: any;
        let projectId: string | undefined;
        
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_JSON');
          } catch (e) {
            console.error('❌ Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
          }
        }
        
        if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
          try {
            const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
            const fileTxt = await fs.readFile(filePath!, 'utf-8');
            const serviceAccount = JSON.parse(fileTxt);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_FILE');
          } catch (e) {
            console.error('❌ Error leyendo FIREBASE_SERVICE_ACCOUNT_FILE:', e);
          }
        }
        
        // Buscar en .secrets/firebase-admin.json
        if (!credential) {
          try {
            const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
            const secretsFile = await fs.readFile(secretsPath, 'utf-8');
            const serviceAccount = JSON.parse(secretsFile);
            if (serviceAccount.type === 'service_account') {
              credential = admin.credential.cert(serviceAccount);
              projectId = serviceAccount.project_id;
              console.log('✅ Credenciales cargadas desde .secrets/firebase-admin.json');
            }
          } catch (e) {
            console.log('⚠️ No se encontró .secrets/firebase-admin.json');
          }
        }
        
        // Fallback: archivo JSON en raíz del proyecto
        if (!credential) {
          try {
            const credentialPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
            const credentialFile = await fs.readFile(credentialPath, 'utf-8');
            const serviceAccount = JSON.parse(credentialFile);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde archivo JSON directo');
          } catch (e) {
            console.log('⚠️ No se encontró archivo de credenciales en raíz');
          }
        }
        
        if (!credential) {
          credential = admin.credential.applicationDefault();
          projectId = process.env.FIREBASE_PROJECT_ID 
            || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
            || process.env.GOOGLE_CLOUD_PROJECT 
            || process.env.GCLOUD_PROJECT;
          console.log('✅ Usando credenciales por defecto del entorno');
        }
        
        if (!credential) {
          throw new Error('No se pudieron cargar las credenciales de Firebase Admin');
        }
        
        const appOptions: any = { credential };
        if (projectId) {
          appOptions.projectId = projectId;
          process.env.GOOGLE_CLOUD_PROJECT = projectId;
          process.env.GCLOUD_PROJECT = projectId;
          process.env.FIREBASE_CONFIG = JSON.stringify({ projectId });
        }
        
        admin.initializeApp(appOptions);
        console.log('✅ Firebase Admin inicializado correctamente');
        console.log('🔧 ProjectId configurado:', projectId);
        console.log('🔧 Variables de entorno:', {
          GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
          GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
          hasFirebaseConfig: !!process.env.FIREBASE_CONFIG
        });
      } catch (initError: any) {
        console.error('❌ Error al inicializar Firebase Admin:', initError);
        return jsonResponse({ 
          error: 'Error de configuración del servidor',
          details: initError.message
        }, 500);
      }
    }

    const db = admin.firestore();
    
    // 🧪 TEST DE CONEXIÓN: Verificar que podemos escribir en Firestore
    console.log('🧪 Probando conexión a Firestore...');
    try {
      const testRef = db.doc(`_health_check/attendance-upload-${Date.now()}`);
      await testRef.set({ test: true, timestamp: new Date().toISOString() });
      await testRef.delete();
      console.log('✅ Conexión a Firestore verificada correctamente');
    } catch (connError: any) {
      console.error('❌ Error de conexión a Firestore:', connError.message);
      console.error('   Code:', connError.code);
      console.error('   Stack:', connError.stack?.substring(0, 500));
      return jsonResponse({ 
        error: 'Error de conexión a Firestore',
        details: connError.message,
        code: connError.code
      }, 500);
    }
    
    let batch = db.batch();
    let opsInBatch = 0;
    
    let processed = 0;
    let saved = 0;
    let errors: string[] = [];
    
    // 🔧 MEJORA: Contador de registros por año
    const savedByYear: Record<number, number> = {};

    console.log(`📦 Total de filas a procesar: ${rows.length}`);

    // Documento de progreso
    const progressRef = db.doc(`imports/${jobId}`);
    await progressRef.set({
      id: jobId,
      type: 'attendance',
      status: 'running',
      year,
      totalRows: rows.length,
      processed: 0,
      saved: 0,
      errors: 0,
      message: 'Iniciando importación de asistencia...',
      startedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    }, { merge: true });

    const progressInterval = Math.max(1, Math.floor(rows.length / 20));
    let lastProgressUpdate = Date.now();

    // Extraer cursos únicos
    console.log('🔍 Extrayendo cursos únicos del CSV...');
    const tempCoursesSet = new Set<string>();
    for (const row of rows) {
      const curso = getColumnValue(row, ['curso', 'course', 'courseid']);
      if (curso) {
        tempCoursesSet.add(toId(curso));
      }
    }
    
    // Crear documentos de curso
    console.log(`📚 Creando ${tempCoursesSet.size} cursos en Firebase...`);
    let coursesBatch = db.batch();
    let coursesOps = 0;
    for (const courseId of tempCoursesSet) {
      const courseRef = db.doc(`courses/${courseId}`);
      coursesBatch.set(courseRef, {
        id: courseId,
        year,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }, { merge: true });
      coursesOps++;
      
      if (coursesOps >= 400) {
        await coursesBatch.commit();
        console.log(`✅ Batch de cursos guardado: ${coursesOps} documentos`);
        coursesBatch = db.batch();
        coursesOps = 0;
      }
    }
    
    if (coursesOps > 0) {
      await coursesBatch.commit();
      console.log(`✅ Batch final de cursos guardado: ${coursesOps} documentos`);
    }

    // 🔍 NUEVO: Construir mapa de secciones desde localStorage para mapeo correcto
    console.log('📋 Construyendo mapa de cursos y secciones...');
    const sectionMap = new Map<string, string>(); // key: "1ro Básico|A" -> value: sectionId
    
    try {
      // Leer desde el formData si viene incluido
      const sectionsData = formData.get('sections') as string | null;
      const coursesData = formData.get('courses') as string | null;
      
      if (sectionsData && coursesData) {
        const sections = JSON.parse(sectionsData);
        const courses = JSON.parse(coursesData);
        
        console.log(`📊 Datos recibidos: ${courses.length} cursos, ${sections.length} secciones`);
        
        // Construir mapa de courseId (UUID o número) → nombre del curso
        const courseIdMap = new Map<string, string>();
        for (const c of courses) {
          if (c && c.id && c.name) {
            courseIdMap.set(String(c.id), String(c.name).trim());
            console.log(`📚 Curso: id=${c.id} → nombre="${c.name}"`);
          }
        }
        
        // Construir mapa de "Curso|Sección" → sectionId
        for (const s of sections) {
          if (s && s.id && s.courseId && s.name) {
            const courseName = courseIdMap.get(String(s.courseId));
            if (courseName) {
              const key = `${courseName}|${String(s.name).trim()}`;
              sectionMap.set(key, String(s.id));
              console.log(`🗺️ Mapeo: "${key}" → sectionId=${s.id}`);
            } else {
              console.warn(`⚠️ No se encontró curso con id=${s.courseId} para sección ${s.name}`);
            }
          }
        }
        
        console.log(`✅ Mapa de secciones construido: ${sectionMap.size} entradas`);
      } else {
        console.warn('⚠️ No se recibieron datos de secciones/cursos en el formData');
      }
    } catch (mapError: any) {
      console.error('❌ Error construyendo mapa de secciones:', mapError);
    }

    // Procesar registros de asistencia
    console.log('📝 Procesando registros de asistencia...');
    
    // Debug: mostrar primera fila para verificar estructura
    if (rows.length > 0) {
      console.log('🔍 Primera fila del CSV (keys):', Object.keys(rows[0]));
      console.log('🔍 Primera fila del CSV (values):', JSON.stringify(rows[0]));
    }
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // 🔍 DEBUG: Mostrar estructura de las primeras 3 filas
      if (i < 3) {
        console.log(`🔍 [DEBUG] Fila ${i + 1} RAW:`, JSON.stringify(row));
        console.log(`🔍 [DEBUG] Fila ${i + 1} Keys:`, Object.keys(row));
      }
      
      try {
        const dateStr = getColumnValue(row, ['date', 'fecha']);
        const curso = getColumnValue(row, ['course', 'curso']);
        const seccion = getColumnValue(row, ['section', 'seccion']);
        const studentUsername = getColumnValue(row, ['studentusername', 'username']);
        const rut = getColumnValue(row, ['rut']);
        const name = getColumnValue(row, ['name', 'nombre']);
        const status = getColumnValue(row, ['status', 'estado']);
        const comment = getColumnValue(row, ['comment', 'comentario', 'observacion']);
        
        // 🔍 DEBUG: Mostrar valores extraídos de las primeras 3 filas
        if (i < 3) {
          console.log(`🔍 [DEBUG] Fila ${i + 1} Valores extraídos:`, {
            date: dateStr,
            course: curso,
            section: seccion,
            username: studentUsername,
            rut: rut,
            name: name,
            status: status
          });
        }

        // Usar RUT como identificador alternativo si no hay username
        const studentIdentifier = studentUsername || rut;
        
        if (!dateStr || !curso || !studentIdentifier || !status) {
          // Debug: mostrar qué campos faltan
          if (i < 5) {
            console.log(`⚠️ Fila ${i + 1} - Campos: date="${dateStr}", course="${curso}", username="${studentUsername}", rut="${rut}", status="${status}"`);
          }
          errors.push(`Fila ${i + 1}: faltan campos obligatorios (date=${!!dateStr}, course=${!!curso}, username/rut=${!!studentIdentifier}, status=${!!status})`);
          processed++;
          continue;
        }

        const date = parseFlexibleDate(dateStr);
        if (!date || isNaN(date.getTime())) {
          errors.push(`Fila ${i + 1}: fecha inválida "${dateStr}"`);
          processed++;
          continue;
        }

        const courseId = toId(curso);
        const attendanceId = toId(dateStr, curso, seccion || '', studentIdentifier);
        
        // Crear timestamp de forma segura
        let dateTimestamp;
        try {
          dateTimestamp = admin.firestore.Timestamp.fromDate(date);
        } catch (tsError: any) {
          errors.push(`Fila ${i + 1}: error al convertir fecha "${dateStr}" a Timestamp: ${tsError.message}`);
          processed++;
          continue;
        }

        // 🎯 NUEVO: Buscar sectionId correcto desde el mapa
        let sectionId: string | null = null;
        if (seccion && curso) {
          // Normalizar para búsqueda insensible a mayúsculas/acentos
          const normalizeKey = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          
          // Intentar match exacto primero
          let key = `${curso}|${seccion}`;
          sectionId = sectionMap.get(key) || null;
          
          // Si falla, intentar normalizado
          if (!sectionId) {
             // Buscar en las claves del mapa normalizando ambas partes
             for (const [mapKey, mapVal] of sectionMap.entries()) {
                const [mapCourse, mapSec] = mapKey.split('|');
                if (normalizeKey(mapCourse) === normalizeKey(curso) && normalizeKey(mapSec) === normalizeKey(seccion)) {
                   sectionId = mapVal;
                   break;
                }
             }
          }

          // Si falla, intentar fuzzy (Levenshtein) para casos como "Bsico" vs "Básico"
          if (!sectionId) {
             let bestMatchId = null;
             let minDistance = Infinity;
             const threshold = 3; // Permitir hasta 3 ediciones

             for (const [mapKey, mapVal] of sectionMap.entries()) {
                const [mapCourse, mapSec] = mapKey.split('|');
                // La sección debe coincidir (normalizada)
                if (normalizeKey(mapSec) !== normalizeKey(seccion)) continue;

                const dist = levenshtein(normalizeKey(mapCourse), normalizeKey(curso));
                if (dist < minDistance && dist <= threshold) {
                   minDistance = dist;
                   bestMatchId = mapVal;
                }
             }
             
             if (bestMatchId) {
                sectionId = bestMatchId;
                console.log(`🔧 Fuzzy match: "${curso}" -> "${[...sectionMap.entries()].find(e => e[1] === bestMatchId)?.[0].split('|')[0]}" (dist: ${minDistance})`);
             }
          }

          if (!sectionId) {
            console.warn(`⚠️ Fila ${i + 1}: No se encontró sectionId para "${key}"`);
          }
        }

        const attendanceRef = db.doc(`courses/${courseId}/attendance/${attendanceId}`);
        
        // 🔧 MEJORA: Extraer el año directamente de la fecha del registro, no del parámetro
        const recordYear = date.getFullYear();
        
        // Preparar datos asegurando que no haya valores undefined (Firestore no acepta undefined)
        const attendanceData: Record<string, any> = {
          id: attendanceId,
          date: dateTimestamp,
          dateString: dateStr,
          courseId,
          course: curso,
          section: seccion || null,
          studentUsername: studentUsername || null,  // Puede ser null si se usa RUT
          studentIdentifier,  // username o RUT, siempre tiene valor
          rut: rut || null,
          studentName: name || null,
          status,
          year: recordYear,  // 🔧 Usar el año de la fecha del registro
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        };
        
        // Solo agregar sectionId si tiene valor (evitar undefined)
        if (sectionId !== null && sectionId !== undefined) {
          attendanceData.sectionId = sectionId;
        } else {
          attendanceData.sectionId = null;
        }
        
        // Solo agregar comment si tiene valor
        if (comment && comment.trim()) {
          attendanceData.comment = comment.trim();
        } else {
          attendanceData.comment = null;
        }
        
        // Debug: mostrar primer registro que se va a guardar
        if (saved === 0) {
          console.log('📋 Primer registro a guardar:', JSON.stringify(attendanceData, null, 2));
        }
        
        batch.set(attendanceRef, attendanceData, { merge: true });

        opsInBatch++;
        processed++;
        saved++;
        
        // 🔧 MEJORA: Contar por año
        savedByYear[recordYear] = (savedByYear[recordYear] || 0) + 1;

        // Commit batch cada 200 operaciones
        if (opsInBatch >= 200) {
          let commitSuccess = false;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (!commitSuccess && retryCount < maxRetries) {
            try {
              await batch.commit();
              console.log(`✅ Batch commit exitoso: ${opsInBatch} operaciones (intento ${retryCount + 1})`);
              commitSuccess = true;
            } catch (batchError: any) {
              retryCount++;
              console.error(`❌ Error en batch commit (intento ${retryCount}/${maxRetries}):`, batchError.message);
              console.error('   Stack:', batchError.stack?.substring(0, 500));
              console.error('   Code:', batchError.code);
              
              if (retryCount < maxRetries) {
                console.log(`🔄 Reintentando en ${retryCount * 1000}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              } else {
                // Revertir el contador de saved ya que el batch falló definitivamente
                saved -= opsInBatch;
                errors.push(`Error en batch (filas ${processed - opsInBatch + 1}-${processed}): ${batchError.message}`);
              }
            }
          }
          
          batch = db.batch();
          opsInBatch = 0;
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Actualizar progreso cada 5%
        if (processed % progressInterval === 0 || Date.now() - lastProgressUpdate > 5000) {
          await progressRef.set({
            processed,
            saved,
            errors: errors.length,
            message: `Procesando... ${processed}/${rows.length} (${saved} guardados, ${errors.length} errores)`,
            updatedAt: admin.firestore.Timestamp.now()
          }, { merge: true });
          lastProgressUpdate = Date.now();
          console.log(`📈 Progreso: ${processed}/${rows.length} (${Math.round(processed/rows.length*100)}%)`);
        }
      } catch (rowError: any) {
        errors.push(`Fila ${i + 1}: ${rowError.message}`);
        processed++;
      }
    }

    // Commit batch final con retry
    if (opsInBatch > 0) {
      let commitSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!commitSuccess && retryCount < maxRetries) {
        try {
          await batch.commit();
          console.log(`✅ Batch final commit exitoso: ${opsInBatch} operaciones (intento ${retryCount + 1})`);
          commitSuccess = true;
        } catch (batchError: any) {
          retryCount++;
          console.error(`❌ Error en batch final commit (intento ${retryCount}/${maxRetries}):`, batchError.message);
          console.error('   Stack:', batchError.stack?.substring(0, 500));
          console.error('   Code:', batchError.code);
          
          if (retryCount < maxRetries) {
            console.log(`🔄 Reintentando en ${retryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          } else {
            saved -= opsInBatch;
            errors.push(`Error en batch final: ${batchError.message}`);
          }
        }
      }
    }

    // 📊 DIAGNÓSTICO FINAL
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE PROCESAMIENTO DE ASISTENCIA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Total filas en CSV: ${rows.length}`);
    console.log(`   Filas procesadas: ${processed}`);
    console.log(`   Registros guardados: ${saved}`);
    console.log(`   Errores totales: ${errors.length}`);
    console.log(`   📅 Registros por año:`, savedByYear);
    if (errors.length > 0 && errors.length <= 10) {
      console.log('   Primeros errores:', errors);
    } else if (errors.length > 10) {
      console.log('   Primeros 10 errores:', errors.slice(0, 10));
    }
    console.log('═══════════════════════════════════════════════════════════');

    // Calcular contadores finales con manejo de errores
    let totalCount = 0;
    const yearCounts: Record<number, number> = {};

    try {
      const totalSnap = await db.collectionGroup('attendance').count().get();
      totalCount = totalSnap.data().count;
    } catch (countError: any) {
      console.warn('⚠️ No se pudo usar count() para total, usando fallback:', countError.message);
      try {
        const snapshot = await db.collectionGroup('attendance').limit(10000).get();
        totalCount = snapshot.size;
      } catch (fallbackError) {
        console.warn('⚠️ Fallback también falló, usando saved como estimación');
        totalCount = saved;
      }
    }

    // 🔧 MEJORA: Contar por cada año que se procesó
    for (const yr of Object.keys(savedByYear).map(Number)) {
      try {
        const yearSnap = await db.collectionGroup('attendance').where('year', '==', yr).count().get();
        yearCounts[yr] = yearSnap.data().count;
      } catch (countError: any) {
        console.warn(`⚠️ No se pudo contar para año ${yr}:`, countError.message);
        yearCounts[yr] = savedByYear[yr] || 0;
      }
    }
    
    console.log('📅 Contadores por año en Firebase:', yearCounts);

    // Actualizar progreso final
    await progressRef.set({
      status: 'completed',
      processed,
      saved,
      savedByYear,
      errors: errors.length,
      totalAttendance: totalCount,
      yearCounts,
      message: `Completado: ${saved} registros guardados (${Object.entries(savedByYear).map(([y, c]) => `${y}: ${c}`).join(', ')}), ${errors.length} errores`,
      completedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }, { merge: true });

    console.log(`✅ Importación completada: ${saved} registros, ${errors.length} errores`);

    return jsonResponse({
      success: true,
      saved,
      savedByYear,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
      totalAttendance: totalCount,
      yearCounts,
      message: `Importación completada: ${saved} registros de asistencia guardados (${Object.entries(savedByYear).map(([y, c]) => `${y}: ${c}`).join(', ')})`
    });

  } catch (error: any) {
    console.error('❌ [API] Error en bulk upload attendance:', error);
    return jsonResponse({
      error: error?.message || 'Error desconocido',
      details: error?.stack || String(error),
      type: error?.constructor?.name || 'Error'
    }, 500);
  }
}
