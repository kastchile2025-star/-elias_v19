import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

// Configuración para Next.js - Aumentar timeout y deshabilitar límites
export const maxDuration = 300; // 5 minutos máximo (plan gratuito de Vercel/Next.js)
export const dynamic = 'force-dynamic'; // No cachear esta ruta

/**
 * Helper para crear respuestas JSON con headers explícitos
 */
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
 * API Route: POST /api/firebase/bulk-upload-grades
 * 
 * Carga masiva de calificaciones a Firestore usando Firebase Admin SDK.
 * IMPORTANTE: Este endpoint debe estar protegido por autenticación de admin.
 * 
 * Body: FormData con archivo CSV
 * Headers: Authorization con token de admin
 * 
 * Formato CSV esperado (encabezados flexibles):
 * - nombre | student | studentName
 * - rut | studentId
 * - curso | course | courseId
 * - seccion | section | sectionId (opcional)
 * - asignatura | subject | subjectId (opcional)
 * - profesor | teacher | teacherName (opcional)
 * - fecha | gradedAt | date (formato: YYYY-MM-DD)
 * - tipo | type (evaluacion/tarea/prueba)
 * - nota | score (número 0-100 o 1.0-7.0)
 */

// Función helper para normalizar nombres de columnas
function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Función para obtener valor de columna con múltiples alias
function getColumnValue(row: any, aliases: string[]): string {
  const normalizedAliases = aliases.map(norm);
  // Primero intentar con la estructura actual (keys normalizadas)
  for (const alias of normalizedAliases) {
    const key = Object.keys(row).find(k => norm(k) === alias);
    if (key && row[key]) {
      return String(row[key]).trim();
    }
  }
  // Fallback: búsqueda directa sin normalización (por si está ya normalizado)
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

// Parseo flexible de fechas con MEDIODÍA LOCAL para evitar retrocesos por zona horaria
// Acepta: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY (y variantes con puntos)
function parseFlexibleDate(input: string): Date | null {
  const raw = String(input || '').trim();
  if (!raw) return null;

  // Si trae hora (T o ':'), respetar el tiempo usando el parser nativo
  if (/[Tt]|:\d{2}/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  // Normalizar separadores a '/'
  const t = raw.replaceAll('.', '/').replaceAll('-', '/');
  const ymd = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/; // YYYY/MM/DD
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/; // DD/MM/YYYY

  let y = 0, m = 0, d = 0;
  let match: RegExpMatchArray | null;
  if ((match = t.match(ymd))) {
    y = Number(match[1]); m = Number(match[2]); d = Number(match[3]);
  } else if ((match = t.match(dmy))) {
    d = Number(match[1]); m = Number(match[2]); y = Number(match[3]);
  } else {
    // Intento final con Date nativo (por si viene en otro formato entendible)
    const nd = new Date(raw);
    return isNaN(nd.getTime()) ? null : nd;
  }

  if (!y || !m || !d) return null;
  // Usar 12:00 (mediodía) hora LOCAL para que el día mostrado sea el del CSV sin retroceso
  const localNoon = new Date(y, m - 1, d, 12, 0, 0, 0);
  return isNaN(localNoon.getTime()) ? null : localNoon;
}

// Convierte nota de string a número; acepta 0-100 o 1.0-7.0
function parseScore(notaStr: string): number | null {
  if (notaStr == null) return null;
  const raw = Number(String(notaStr).replace(',', '.'));
  if (!Number.isFinite(raw)) return null;
  // Aceptar ambos rangos (no convertimos 1-7 a 0-100 aquí; se guarda tal cual)
  if (raw >= 0 && raw <= 100) return raw;
  return null;
}

export async function POST(request: NextRequest) {
  console.log('🚀 [API] Inicio de solicitud POST a /api/firebase/bulk-upload-grades');
  
  // ⚠️ CRÍTICO: Envolver TODO en try-catch para asegurar que siempre se devuelva JSON
  let formData: FormData | null = null;
  let file: File | null = null;
  
  try {
    console.log('📦 [API] Extrayendo FormData...');
    
    // Intentar obtener FormData
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
    const jobId = ((formData.get('jobId') as string) || '').trim() || `import-grades-${Date.now()}`;
    
    console.log('📋 [API] Parámetros recibidos:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      year: yearStr,
      jobId
    });
    
    if (!file) {
      console.error('❌ [API] No se recibió archivo');
      return jsonResponse({ error: 'No file provided' }, 400);
    }

    const year = yearStr ? Number(yearStr) : new Date().getFullYear();
    console.log('📅 [API] Año para procesamiento:', year);
    
    // Leer contenido del archivo con manejo robusto de encoding
    console.log('📖 [API] Leyendo contenido del archivo...');
    let text: string;
    try {
      // Leer como ArrayBuffer para detectar encoding correctamente
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
      
      // Log de debug para verificar encoding
      const lines = text.split(/\r?\n/);
      console.log(`🔍 [API] Primera línea: "${lines[0]}"`);
      if (lines.length > 1) {
        console.log(`🔍 [API] Segunda línea (primeros 80 chars): "${lines[1]?.substring(0, 80)}"`);
        console.log(`🔍 [API] Segunda línea charCodes: ${lines[1]?.substring(0, 50).split('').map(c => c.charCodeAt(0)).join(',')}`);
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

    // ===== PARSER CSV PERSONALIZADO que maneja comillas correctamente =====
    // Normalizador previo: corrige líneas envueltas completas en comillas y dobles comillas internas
    const normalizeCSVQuoting = (raw: string): string => {
      // Normalizar saltos de línea a \n
      const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalized.split('\n');
      if (lines.length === 0) return normalized;

      const header = lines[0];
      const fixed: string[] = [header];
      for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        if (!line) { fixed.push(line); continue; }
        const trimmed = line.trim();
        // Si toda la línea está entre comillas, quitar comillas externas
        if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
          // Remover solo el primer y último caracter de comilla
          line = trimmed.slice(1, -1);
          // Reconvertir comillas escapadas dobles a comilla simple
          line = line.replace(/""/g, '"');
        }
        fixed.push(line);
      }
      return fixed.join('\n');
    };

    // Parser CSV robusto con papaparse
    const parseCSVWithPapa = (csvText: string): any[] => {
      const cleaned = normalizeCSVQuoting(csvText);
      if (cleaned !== csvText) {
        console.log('🧽 CSV pre-normalizado: se removieron comillas envolventes por línea');
      }
      console.log(`🔬 INICIANDO PARSE CON PAPAPARSE`);
      console.log(`🔬 PRIMEROS 200 CARACTERES (limpios):\n${cleaned.substring(0, 200)}`);
      
      const parseResult = Papa.parse(cleaned, {
        header: true,           // Primera fila como headers
        skipEmptyLines: true,   // Ignorar líneas vacías
        delimiter: ',',         // Delimitador de columnas
        newline: '',            // Auto-detectar saltos de línea
        quoteChar: '"',         // Carácter de comillas
        escapeChar: '"',        // Escape de comillas con ""
        transformHeader: (h: string) => h.toLowerCase().trim(), // Normalizar headers
        dynamicTyping: false,   // Mantener todo como strings
      });
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.error('⚠️ ERRORES DE PARSING:', parseResult.errors.slice(0, 5));
      }
      
      console.log(`✅ PAPAPARSE COMPLETADO: ${parseResult.data.length} filas`);
      console.log(`🔬 HEADERS DETECTADOS: ${JSON.stringify(parseResult.meta.fields)}`);
      
      if (parseResult.data.length > 0) {
        console.log(`🔬 PRIMERA FILA: ${JSON.stringify(parseResult.data[0])}`);
      }
      
      return parseResult.data;
    };

    // Usar parser robusto con papaparse
    const rows = parseCSVWithPapa(text);

    console.log(`📊 Filas a procesar: ${rows.length}`);
    
    // ⚠️ ADVERTENCIA para archivos muy grandes
    if (rows.length > 50000) {
      console.warn(`⚠️ ARCHIVO MUY GRANDE: ${rows.length} filas. Esto puede tomar varios minutos.`);
      console.warn(`⚠️ Considera dividir el archivo en partes más pequeñas (máx 50K por archivo).`);
    }

    // Mostrar headers detectados para debug
    if (rows.length > 0) {
      const headers = Object.keys((rows[0] as any) || {});
      console.log(`🔬 HEADERS DETECTADOS: [${headers.map(h => `"${h}"`).join(', ')}]`);
      console.log(`🔬 PRIMERA FILA COMPLETA:`, JSON.stringify(rows[0], null, 2));
      
      // Mostrar primeras 3 filas para debugging (solo si no es archivo gigante)
      if (rows.length < 10000) {
        console.log(`📋 Primeras 3 filas parseadas:`);
        for (let i = 0; i < Math.min(3, rows.length); i++) {
          console.log(`  Fila ${i+1}:`, JSON.stringify(rows[i], null, 2));
        }
      }
    }

    // Verificar que hay datos
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
        
        // Estrategia 1: Leer desde variable de entorno
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_JSON');
            console.log('🔧 ProjectId detectado:', projectId);
          } catch (e) {
            console.error('❌ Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:', e);
          }
        }
        
        // Estrategia 1.5: Leer desde ruta de archivo especificada en env
        if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
          try {
            const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
            const fileTxt = await (await import('fs/promises')).readFile(filePath!, 'utf-8');
            const serviceAccount = JSON.parse(fileTxt);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde FIREBASE_SERVICE_ACCOUNT_FILE');
            console.log('🔧 ProjectId detectado:', projectId);
          } catch (e) {
            console.error('❌ Error leyendo FIREBASE_SERVICE_ACCOUNT_FILE:', e);
          }
        }
        
        // Estrategia 2: Buscar en .secrets/firebase-admin.json
        if (!credential) {
          try {
            const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
            const secretsFile = await fs.readFile(secretsPath, 'utf-8');
            const serviceAccount = JSON.parse(secretsFile);
            if (serviceAccount.type === 'service_account') {
              credential = admin.credential.cert(serviceAccount);
              projectId = serviceAccount.project_id;
              console.log('✅ Credenciales cargadas desde .secrets/firebase-admin.json');
              console.log('🔧 ProjectId detectado:', projectId);
            }
          } catch (e) {
            console.log('⚠️ No se encontró .secrets/firebase-admin.json');
          }
        }
        
        // Estrategia 3: Archivo JSON en raíz del proyecto (legacy)
        if (!credential) {
          try {
            const credentialPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
            const credentialFile = await fs.readFile(credentialPath, 'utf-8');
            const serviceAccount = JSON.parse(credentialFile);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
            console.log('✅ Credenciales cargadas desde archivo JSON directo');
            console.log('🔧 ProjectId detectado:', projectId);
          } catch (e) {
            console.log('⚠️ No se encontró archivo de credenciales en raíz');
          }
        }
        
        // Estrategia 3: Credenciales por defecto
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
        
        // Inicializar app con projectId explícito
        const appOptions: any = { credential };
        if (projectId) {
          appOptions.projectId = projectId;
          // Configurar también en variables de entorno para que Firestore las encuentre
          process.env.GOOGLE_CLOUD_PROJECT = projectId;
          process.env.GCLOUD_PROJECT = projectId;
          process.env.FIREBASE_CONFIG = JSON.stringify({ projectId });
        }
        
        admin.initializeApp(appOptions);
        console.log('✅ Firebase Admin inicializado correctamente');
        console.log('🔧 Project ID configurado:', projectId);
      } catch (initError: any) {
        console.error('❌ Error al inicializar Firebase Admin:', initError);
        return jsonResponse({ 
          error: 'Error de configuración del servidor',
          details: initError.message,
          hint: 'Descarga las credenciales del Admin SDK desde Firebase Console > Configuración > Cuentas de servicio > Generar nueva clave privada. Guarda el JSON en .secrets/firebase-admin.json'
        }, 500);
      }
    }

  const db = admin.firestore();
  let batch = db.batch();
  let opsInBatch = 0;
    
  // 'processed' = filas leídas y preparadas; 'saved' = documentos realmente confirmados en Firestore
  let processed = 0;
  let saved = 0;
  let errors: string[] = [];
  const grades: any[] = [];
  const activitiesMap = new Map<string, any>(); // key por (courseId|section|subject|type|fecha)

  console.log(`📦 Total de filas a procesar: ${rows.length}`);

    // 🔍 NUEVO: Construir mapa de cursos y secciones desde formData para mapeo correcto
    console.log('📋 Construyendo mapa de cursos y secciones...');
    const courseNameToIdMap = new Map<string, string>(); // "1ro Básico" -> UUID real
    const sectionMap = new Map<string, string>(); // "1ro Básico|A" -> sectionId real
    
    try {
      const sectionsData = formData.get('sections') as string | null;
      const coursesData = formData.get('courses') as string | null;
      
      if (sectionsData && coursesData) {
        const sections = JSON.parse(sectionsData);
        const courses = JSON.parse(coursesData);
        
        console.log(`📊 Datos recibidos: ${courses.length} cursos, ${sections.length} secciones`);
        
        // Construir mapa de courseId (UUID o número) → nombre del curso
        const courseIdToNameMap = new Map<string, string>();
        for (const c of courses) {
          if (c && c.id && c.name) {
            const courseIdStr = String(c.id);
            const courseNameStr = String(c.name).trim();
            courseIdToNameMap.set(courseIdStr, courseNameStr);
            
            // Mapear nombre normalizado → ID real
            const normalizedName = courseNameStr.toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
              .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
            courseNameToIdMap.set(normalizedName, courseIdStr);
            // Alias sin vocales para compatibilidad con IDs antiguos
            courseNameToIdMap.set(normalizedName.replace('_basico', '_bsico'), courseIdStr);
            courseNameToIdMap.set(normalizedName.replace('_medio', '_mdio'), courseIdStr);
            console.log(`📚 Curso mapeado: "${courseNameStr}" (${normalizedName}) → id=${courseIdStr}`);
          }
        }
        
        // Construir mapa de "Curso|Sección" → sectionId
        for (const s of sections) {
          if (s && s.id && s.courseId && s.name) {
            const courseName = courseIdToNameMap.get(String(s.courseId));
            if (courseName) {
              const key = `${courseName}|${String(s.name).trim()}`;
              sectionMap.set(key, String(s.id));
              console.log(`🗺️ Sección mapeada: "${key}" → sectionId=${s.id}`);
            }
          }
        }
        
        console.log(`✅ Mapa de cursos: ${courseNameToIdMap.size} entradas`);
        console.log(`✅ Mapa de secciones: ${sectionMap.size} entradas`);
      } else {
        console.warn('⚠️ No se recibieron datos de secciones/cursos en el formData. Se usarán IDs generados.');
      }
    } catch (mapError: any) {
      console.error('❌ Error construyendo mapa de cursos/secciones:', mapError);
    }

    // ===== Documento de progreso (Firestore) =====
    const progressRef = db.doc(`imports/${jobId}`);
    await progressRef.set({
      id: jobId,
      type: 'grades',
      status: 'running',
      year,
      totalRows: rows.length,
      processed: 0,
      activities: 0,
      errors: 0,
      message: 'Iniciando importación de calificaciones...',
      startedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    }, { merge: true });
    const progressInterval = Math.max(1, Math.floor(rows.length / 20)); // Log cada 5%
    let lastProgressUpdate = Date.now();
    
    // ===== PASO 1: Extraer cursos únicos =====
    console.log('🔍 Extrayendo cursos únicos del CSV...');
    const tempCoursesSet = new Set<string>();
    for (const row of rows) {
      const curso = getColumnValue(row, ['curso', 'course', 'courseid']);
      if (curso) {
        tempCoursesSet.add(toId(curso));
      }
    }
    
    // ===== PASO 2: Crear documentos de curso en Firestore =====
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
      
      if (coursesOps >= 200) { // Reducido de 450 a 200
        await coursesBatch.commit();
        console.log(`✅ Creados ${coursesOps} cursos...`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Delay entre batches
        coursesBatch = db.batch();
        coursesOps = 0;
      }
    }
    if (coursesOps > 0) await coursesBatch.commit();
    console.log(`✅ Todos los cursos creados en Firebase`);

    // Reporte intermedio de progreso tras crear cursos
    await progressRef.set({
      message: `Cursos preparados (${tempCoursesSet.size}). Importando calificaciones...`,
      updatedAt: admin.firestore.Timestamp.now(),
    }, { merge: true });
    
    // ===== PASO 3: Procesar calificaciones =====
    console.log(`📝 Procesando calificaciones...`);
    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      // Log de progreso cada 5%
      if (i % progressInterval === 0 && i > 0) {
        const percent = Math.floor((i / rows.length) * 100);
        console.log(`⏳ Progreso: ${percent}% (${i}/${rows.length} procesadas, ${processed} guardadas, ${errors.length} errores)`);
      }
      const row = rows[i];
      const rowNumber = i + 2; // +2 por header y índice 0-based

      try {
        // Extraer datos con aliases flexibles (incluye formato camelCase del CSV generado)
        const nombre = getColumnValue(row, ['nombre', 'student', 'studentname', 'studentName', 'student_name']);
        const rut = getColumnValue(row, ['rut', 'studentid', 'id', 'studentrut', 'studentRut', 'student_rut']);
        const curso = getColumnValue(row, ['curso', 'course', 'courseid', 'courseId', 'course_id']);
        const seccion = getColumnValue(row, ['seccion', 'section', 'sectionid', 'sectionId', 'section_id']);
        const asignatura = getColumnValue(row, ['asignatura', 'subject', 'subjectid', 'subjectId', 'subject_id', 'materia']);
        const profesor = getColumnValue(row, ['profesor', 'teacher', 'teachername', 'teacherName', 'teacher_name']);
        const fechaStr = getColumnValue(row, ['fecha', 'gradedat', 'date', 'activitydate', 'activityDate', 'activity_date']);
  const tipoStr = getColumnValue(row, ['tipo', 'type', 'activitytype', 'activityType', 'activity_type']);
  // Nuevo: campo opcional de tema
  const temaStr = getColumnValue(row, ['tema', 'topic', 'theme']);
  // Nuevo: campo actividad para distinguir evaluaciones del mismo tipo en la misma fecha
  const actividadStr = getColumnValue(row, ['actividad', 'activity', 'title', 'nombre_actividad', 'activitynumber', 'activityNumber', 'activity_number']);
        const notaStr = getColumnValue(row, ['nota', 'score', 'grade', 'calificacion', 'nota_final']);
        // Nuevo: semestre para identificar período
        const semestreStr = getColumnValue(row, ['semestre', 'semester', 'periodo', 'period']);

        // 🔍 DEBUG: Ver el valor del tema en las primeras filas
        if (i < 5) {
          console.log(`🔍 [Fila ${rowNumber}] tema="${temaStr}", asignatura="${asignatura}", tipo="${tipoStr}"`);
        }

        // Debug para primeras filas problemáticas
        if (i < 5 && (!nombre || !rut || !curso || !fechaStr || !notaStr)) {
          const rowAny = row as any;
          console.warn(`⚠️ Fila ${rowNumber} tiene datos incompletos:`, {
            nombre: [nombre, Object.keys(rowAny)],
            rut: [rut, rowAny.studentRut],
            curso: [curso, rowAny.course],
            fechaStr: [fechaStr, rowAny.activityDate],
            notaStr: [notaStr, rowAny.grade],
            rowKeys: Object.keys(rowAny),
            rowValues: rowAny
          });
        }

        // Validaciones
        if (!nombre || !rut || !curso || !fechaStr || !notaStr) {
          errors.push(`Fila ${rowNumber}: Faltan campos requeridos (nombre=${nombre||'?'}, rut=${rut||'?'}, curso=${curso||'?'}, fecha=${fechaStr||'?'}, nota=${notaStr||'?'})`);
          continue;
        }

        // Parsear nota
        const score = parseScore(notaStr);
        if (score == null) {
          errors.push(`Fila ${rowNumber}: Nota inválida: ${notaStr}`);
          continue;
        }

        // Parsear fecha
        const gradedAt = parseFlexibleDate(fechaStr);
        if (!gradedAt) {
          errors.push(`Fila ${rowNumber}: Fecha inválida: ${fechaStr}`);
          continue;
        }

        // Normalizar tipo
        const type = ['tarea', 'prueba', 'evaluacion'].includes(tipoStr.toLowerCase())
          ? tipoStr.toLowerCase()
          : 'evaluacion';

  // Generar IDs - SIEMPRE usar toId() para mantener consistencia con asistencia
  // Esto asegura que grades, activities y attendance queden en la misma carpeta del curso
  // Ejemplo: courses/1ro_basico/grades, courses/1ro_basico/attendance, courses/1ro_basico/activities
  const courseId = toId(curso);
  
  // 🎯 Buscar sectionId real desde el mapa
  let sectionId: string | null = null;
  if (seccion) {
    // Intentar match exacto con el nombre del curso del CSV
    const sectionKey = `${curso}|${seccion}`;
    sectionId = sectionMap.get(sectionKey) || null;
    
    // Si no se encontró, intentar normalizado
    if (!sectionId) {
      // Normalizar nombre del curso para búsqueda
      const cursoNormalizado = curso.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
      
      // Buscar en las claves del mapa normalizando
      for (const [mapKey, mapVal] of sectionMap.entries()) {
        const [mapCourse, mapSec] = mapKey.split('|');
        const mapCourseNorm = mapCourse.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
          .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
        if (mapCourseNorm === cursoNormalizado && 
            mapSec.toLowerCase().trim() === seccion.toLowerCase().trim()) {
          sectionId = mapVal;
          break;
        }
      }
    }
    
    // Fallback: generar ID si no se encontró
    if (!sectionId) {
      sectionId = toId(seccion);
    }
    
    if (i === 0) {
      console.log(`🔍 Mapeo curso/sección: "${curso}" → courseId=${courseId}, "${seccion}" → sectionId=${sectionId}`);
    }
  }
  
  // testId identifica una actividad única por curso+sección+asignatura+tipo+fecha+nombreActividad
  // IMPORTANTE: Incluimos courseId y sectionId para evitar que actividades de diferentes cursos
  // compartan el mismo testId y se mezclen los temas/topics entre cursos
  // Ejemplo: "Tarea" de "Ciencias Naturales" en "1ro Básico A" debe tener testId diferente a la misma en "2do Básico B"
  const testId = toId(courseId || 'general', sectionId || 'all', asignatura || 'general', type, String(+gradedAt), actividadStr || '');
  // IMPORTANTE: fortalecer unicidad del documento para evitar sobrescrituras silenciosas
  // Mantenemos estabilidad por evaluación (testId) pero además
  // incluimos un sufijo derivado del jobId actual para que un mismo alumno
  // pueda tener múltiples registros en la misma evaluación si el CSV los trae.
  // Esto asegura que los contadores reflejen el total procesado del archivo.
  const jobIdShort = toId(String(jobId)).slice(-12) || 'job';
  const docId = toId(jobIdShort, rut, courseId, testId);

        const now = new Date();

        // ===== Construcción de Activity (una por combinación curso+SECCIÓN+asignatura+tipo+fecha) =====
        if (asignatura) {
          const sectionKeyForActivity = sectionId || 'all';
          const day = gradedAt.toISOString().slice(0,10);
          const actKey = [courseId, sectionKeyForActivity, toId(asignatura), type, day].join('|');
          if (!activitiesMap.has(actKey)) {
            // ID único incluyendo curso Y sección para evitar que actividades de diferentes cursos se mezclen
            const activityId = toId(courseId, sectionKeyForActivity, asignatura, type, day);
            const activityDoc = {
              id: activityId,
              taskType: type,
              // Usar tema si existe, de lo contrario fallback al formato anterior
              title: (temaStr && String(temaStr).trim()) || `${type.toUpperCase()} ${asignatura} ${gradedAt.toISOString().slice(0,10)}`,
              subjectId: toId(asignatura),
              subjectName: asignatura,
              // Guardar topic SIEMPRE si existe (no usar spread condicional para evitar que se pierda)
              topic: (temaStr && String(temaStr).trim()) || null,
              courseId,
              sectionId: sectionId,
              createdAt: admin.firestore.Timestamp.fromDate(now),
              startAt: admin.firestore.Timestamp.fromDate(gradedAt),
              openAt: admin.firestore.Timestamp.fromDate(gradedAt),
              dueDate: admin.firestore.Timestamp.fromDate(gradedAt),
              status: 'completed',
              assignedById: 'system',
              assignedByName: profesor || 'System',
              year,
            };
            // 🔍 DEBUG: Log cuando se crea una actividad
            if (activitiesMap.size < 5) {
              console.log(`📝 [Nueva Actividad] id=${activityId}, title="${activityDoc.title}", topic="${activityDoc.topic}"`);
            }
            activitiesMap.set(actKey, activityDoc);
          }
        }
        
        // Preparar documento
        const gradeDoc = {
          id: docId,
          testId,
          jobId: jobIdShort,
          studentId: rut,
          studentName: nombre,
          score,
          courseId,
          sectionId: sectionId,
          subjectId: asignatura ? toId(asignatura) : null,
          // 🆕 Guardar también el nombre original de la asignatura para mostrar en UI
          subjectName: asignatura || null,
          subject: asignatura || null, // Alias alternativo para compatibilidad
          // Título: usar tema si existe
          title: (temaStr && String(temaStr).trim()) || `${asignatura || 'Evaluación'} ${gradedAt.toISOString().slice(0, 10)}`,
          gradedAt: admin.firestore.Timestamp.fromDate(gradedAt),
          year,
          type,
          createdAt: admin.firestore.Timestamp.fromDate(now),
          updatedAt: admin.firestore.Timestamp.fromDate(now),
          teacherName: profesor || null,
          // Campo 'topic' para UI/burbujas - guardar siempre para que merge lo actualice
          topic: (temaStr && String(temaStr).trim()) || null,
        };

        // Agregar al batch
  const docRef = db.doc(`courses/${courseId}/grades/${docId}`);
  batch.set(docRef, gradeDoc, { merge: true });
  opsInBatch++;

  // Aplazar escritura de activities hasta el final (después de loop) para agrupar
        
        grades.push(gradeDoc);
        processed++;

        // Firestore batch tiene límite de 500 operaciones - usar lotes más pequeños
        if (opsInBatch >= 200) { // Reducido de 450 a 200 para evitar sobrecarga
          const committed = opsInBatch; // capturar antes de resetear
          await batch.commit();
          saved += committed;
          console.log(`✅ Guardadas ${saved}/${rows.length} calificaciones (lote ${committed})`);
          batch = db.batch();
          opsInBatch = 0;
          
          // Pequeño delay entre batches para no sobrecargar el stream
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Actualizar progreso solo cada 5 segundos para reducir escrituras
          const now = Date.now();
          if (now - lastProgressUpdate > 5000) {
            await progressRef.set({
              processed,
              saved,
              total: rows.length,
              errors: errors.length,
              percent: Math.min(100, Math.floor((processed / Math.max(1, rows.length)) * 100)),
              message: `Guardadas ${saved}/${rows.length} calificaciones` ,
              updatedAt: admin.firestore.Timestamp.now(),
            }, { merge: true });
            lastProgressUpdate = now;
          }
        }

      } catch (error: any) {
        errors.push(`Fila ${rowNumber}: ${error.message}`);
        continue;
      }
    }

    // Commit final de calificaciones
    if (opsInBatch > 0) {
      const committed = opsInBatch;
      await batch.commit();
      saved += committed;
      console.log(`✅ Batch final guardado. Total procesado: ${processed} • Total guardado: ${saved}`);
      await progressRef.set({
        processed,
        saved,
        total: rows.length,
        errors: errors.length,
        percent: Math.min(100, Math.floor((processed / Math.max(1, rows.length)) * 100)),
        message: `Procesadas ${processed}/${rows.length} • Guardadas ${saved}. Generando actividades...`,
        updatedAt: admin.firestore.Timestamp.now(),
      }, { merge: true });
    }

    // ===== Escribir actividades (cada una 1 doc) =====
    const activities = Array.from(activitiesMap.values());
    console.log(`🗂 Generando ${activities.length} actividades únicas derivadas de las calificaciones`);
    if (activities.length) {
      let actBatch = db.batch();
      let actOps = 0; let actProcessed = 0;
      for (const activity of activities) {
        const actRef = db.doc(`courses/${activity.courseId}/activities/${activity.id}`);
        actBatch.set(actRef, activity, { merge: true });
        actOps++; actProcessed++;
        if (actOps >= 200) { // Reducido de 450 a 200
          await actBatch.commit();
            console.log(`✅ Guardadas ${actProcessed}/${activities.length} actividades`);
          await new Promise(resolve => setTimeout(resolve, 50)); // Delay entre batches
          actBatch = db.batch();
          actOps = 0;
        }
      }
      if (actOps > 0) await actBatch.commit();
      console.log(`✅ Actividades completadas: ${activities.length}`);
      await progressRef.set({
        activities: activities.length,
        total: rows.length,
        message: `Actividades creadas: ${activities.length}`,
        updatedAt: admin.firestore.Timestamp.now(),
      }, { merge: true });
    }

  console.log(`\n🎉 ===== IMPORTACIÓN COMPLETADA =====`);
  console.log(`   ✅ Calificaciones procesadas: ${processed}`);
  console.log(`   🗂️  Actividades generadas: ${activitiesMap.size}`);
  console.log(`   ❌ Errores encontrados: ${errors.length}`);
  if (errors.length > 0) {
    console.log(`   📋 Primeros errores:`, errors.slice(0, 5));
  }
  console.log(`=====================================\n`);

    // Progreso final en Firestore
    await progressRef.set({
      status: 'completed',
      processed,
      saved,
      total: rows.length,
      activities: activitiesMap.size,
      errors: errors.length,
      percent: 100,
      message: `Importación completada: ${saved} guardadas de ${processed} procesadas, ${activitiesMap.size} actividades`,
      finishedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    }, { merge: true });
    
    // Responder al cliente con headers explícitos
    // Leer contador real desde Firestore para incluirlo en la respuesta
    let yearCountAfter: number | null = null;
    try {
      // @ts-ignore
      const agg = await (db as any).collectionGroup('grades').where('year', '==', year).count().get();
      const data = typeof agg?.data === 'function' ? agg.data() : (agg && (agg as any)[0]?.data?.());
      yearCountAfter = Number((data && (data.count ?? data.aggregate?.count)) || 0);
    } catch {
      try {
        const courses = await db.collection('courses').where('year', '==', year).get();
        let sum = 0;
        for (const c of courses.docs) {
          try {
            // @ts-ignore
            const ca = await (c.ref.collection('grades') as any).count().get();
            const d = typeof ca?.data === 'function' ? ca.data() : (ca && (ca as any)[0]?.data?.());
            sum += Number((d && (d.count ?? d.aggregate?.count)) || 0);
          } catch {
            const snap = await c.ref.collection('grades').get();
            sum += snap.size;
          }
        }
        yearCountAfter = sum;
      } catch {
        yearCountAfter = null;
      }
    }

    const responseData = {
      success: true,
      processed,
      saved,
      activities: activitiesMap.size,
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
      totalErrors: errors.length,
      year,
      yearCountAfter,
      message: `Importadas ${saved} calificaciones (de ${processed} procesadas) y ${activitiesMap.size} actividades a Firebase${errors.length > 0 ? `. Errores: ${errors.length}` : ''}`
    };
    
    console.log('📤 [API] Enviando respuesta exitosa al cliente:', responseData);
    
    return jsonResponse(responseData, 200);

  } catch (error: any) {
    console.error('❌ [API] Error en bulk upload:', error);
    console.error('❌ [API] Stack trace:', error?.stack);
    console.error('❌ [API] Tipo de error:', error?.constructor?.name);
    
    // Intentar guardar el error en Firestore (sin leer request de nuevo)
    try {
      const adminMod = (await import('firebase-admin')).default;
      if (adminMod?.apps?.length && file) {
        const db = adminMod.firestore();
        // Usar el jobId de formData si está disponible
        const jobId = formData?.get('jobId') as string || `import-grades-error-${Date.now()}`;
        const progressRef = db.doc(`imports/${jobId}`);
        await progressRef.set({
          id: jobId,
          type: 'grades',
          status: 'failed',
          message: error?.message || 'Error desconocido durante la importación',
          errorDetails: error?.stack || String(error),
          updatedAt: adminMod.firestore.Timestamp.now(),
        }, { merge: true });
        console.log('✅ [API] Error registrado en Firestore');
      }
    } catch (progressError) {
      console.error('❌ [API] Error al actualizar progreso:', progressError);
    }
    
    const errorResponse = {
      error: error?.message || 'Error al procesar la carga masiva',
      details: error?.stack || String(error),
      type: error?.constructor?.name || 'UnknownError'
    };
    
    console.error('📤 [API] Enviando respuesta de error:', errorResponse);
    
    return jsonResponse(errorResponse, 500);
  }
}
