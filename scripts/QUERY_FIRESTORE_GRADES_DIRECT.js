(async function() {
  'use strict';
  /*
    QUERY_FIRESTORE_GRADES_DIRECT.js
    --------------------------------
    Pega este script en la consola del navegador (DevTools) y ajusta los valores en CONFIG.

    Qué hace:
    - Carga Firebase (compat) si no está presente.
    - Lee `smart-student-sections-<year>` desde localStorage para traducir section UUIDs visibles
      a pares { courseUuid, sectionLetter } (por ejemplo: { '695e2e..': 'a' }).
    - Para cada par ejecuta una consulta directa a `courses/{courseUuid}/grades` filtrando por
      year, sectionId (letra), asignatura (opcional), semestre (si está guardado en doc) y estudiante.
    - Devuelve y muestra estadísticas y los primeros resultados.

    Nota: este script es para diagnóstico/validación en consola. Para producción integrar
    la misma lógica en el código del app (server/client) y crear índices compuestos si Firestore lo solicita.
  */

  const CONFIG = {
    year: 2025,
    // visibleSectionIds: lista de section UUIDs que el UI muestra (por ejemplo: ['ebeebfbd-...'])
    visibleSectionIds: [], // <<< Rellena aquí antes de ejecutar
    semester: null, // 1 | 2 | null (si se guarda en la calificación como `semester` o similar)
    subjectFilter: null, // Ej: 'Lenguaje y Comunicación' o null para no filtrar
    studentFilter: null, // userId (ej: 'user-1762...') o RUT (ej: '10000044-k') o null
    limitPerQuery: 500,
    // Opcional: Configuración pública de Firebase para inicializar el SDK en esta página de diagnóstico.
    // Si tu app NO inicializa Firebase en el cliente, pega aquí tu config pública (NO es secreta):
    // Obténla en Firebase Console → Project settings → Your apps → SDK setup & configuration (Web)
    // Ejemplo:
    // firebaseConfig: {
    //   apiKey: "AIza...",
    //   authDomain: "tu-proyecto.firebaseapp.com",
    //   projectId: "tu-proyecto",
    //   storageBucket: "tu-proyecto.appspot.com",
    //   messagingSenderId: "1234567890",
    //   appId: "1:1234567890:web:abcdef"
    // }
    firebaseConfig: null
  };

  function log(...args) { console.log('[QUERY_FIRESTORE]', ...args); }

  // Cargar Firebase compat si es necesario
  async function loadFirebaseCompat() {
    if (window.firebase && window.firebase.firestore) return window.firebase;
    const load = (url) => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = url; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    log('Cargando Firebase compat...');
    if (!window.firebase) await load('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
    if (!window.firebase.firestore) await load('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
    return window.firebase;
  }

  const firebase = await loadFirebaseCompat();
  // Intentar inicializar si no hay app aún
  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      // 1) Intentar con CONFIG.firebaseConfig
      if (CONFIG.firebaseConfig && typeof CONFIG.firebaseConfig === 'object') {
        log('Inicializando Firebase con CONFIG.firebaseConfig...');
        firebase.initializeApp(CONFIG.firebaseConfig);
      } else if (window.__FIREBASE_PUBLIC_CONFIG__ && typeof window.__FIREBASE_PUBLIC_CONFIG__ === 'object') {
        // 2) Intentar con variable global opcional (si tu app la expone)
        log('Inicializando Firebase con window.__FIREBASE_PUBLIC_CONFIG__...');
        firebase.initializeApp(window.__FIREBASE_PUBLIC_CONFIG__);
      } else if (window.FIREBASE_PUBLIC_CONFIG && typeof window.FIREBASE_PUBLIC_CONFIG === 'object') {
        // 3) Alias alternativo
        log('Inicializando Firebase con window.FIREBASE_PUBLIC_CONFIG...');
        firebase.initializeApp(window.FIREBASE_PUBLIC_CONFIG);
      } else {
        // 4) Sin config disponible: mostrar instrucciones claras
        log('❌ No hay app Firebase inicializada y no se encontró configuración pública.');
        log('ℹ️ Opciones:');
        log('  A) Edita CONFIG.firebaseConfig dentro de este script con tu configuración pública de Firebase y vuelve a ejecutar.');
        log('  B) Define window.__FIREBASE_PUBLIC_CONFIG__ = { ... } en la consola y vuelve a ejecutar.');
        log('  C) Alternativamente, verifica la pestaña "Aplicación" (Application) → Local Storage/env si tu app la expone.');
        throw new Error('Firebase App no inicializada');
      }
    }
  } catch (e) {
    console.error('[QUERY_FIRESTORE] Error inicializando Firebase:', e && e.message ? e.message : e);
    return;
  }

  // Obtener instancia de Firestore
  let db;
  try {
    db = firebase.firestore();
  } catch (e) {
    console.error('[QUERY_FIRESTORE] No se pudo obtener Firestore:', e && e.message ? e.message : e);
    return;
  }

  // 1) Leer secciones del localStorage y construir reverse map: sectionUuid -> { courseUuid, letter }
  const sectionsKey = `smart-student-sections-${CONFIG.year}`;
  const rawSections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');

  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    log(`⚠️ No se encontraron secciones en localStorage con la clave '${sectionsKey}'. Asegúrate de estar en la sesión correcta.`);
  }

  // El formato esperado de rawSections: [{ courseId: '<uuid>', sections: [{ id: '<uuid>', name: 'A' | '1ro Básico A' | 'Sección A' ... }, ... ] }, ...]
  // Pero puede variar; intentamos adaptarnos a las variantes comunes.

  // Construir mapa sectionUuid -> { courseUuid, letter }
  const sectionUuidToPair = new Map();

  function extractLetter(name) {
    if (!name) return null;
    // Intenta extraer una letra A/B/C (alfabética) al final o una letra sola
    const trimmed = String(name).trim();
    // Si es una sola letra
    if (/^[A-Za-z]$/.test(trimmed)) return trimmed.toLowerCase();
    // Buscar una letra sola al final, posiblemente precedida por espacio
    const m = trimmed.match(/([A-Za-z])\s*$/);
    if (m) return m[1].toLowerCase();
    // Si el campo tiene 'Sección A' o '1ro Básico A', tomar la última palabra y su última letra si es alfabética
    const parts = trimmed.split(/\s+/);
    const last = parts[parts.length - 1];
    if (/^[A-Za-z]$/.test(last)) return last.toLowerCase();
    if (/^[A-Za-z]$/.test(last.slice(-1))) return last.slice(-1).toLowerCase();
    return null;
  }

  // rawSections puede ser un array de objetos por curso o un array plano de secciones con courseId
  for (const item of rawSections) {
    // Variante 1: { courseId, sections: [{ id, name }, ...] }
    if (item && item.courseId && Array.isArray(item.sections)) {
      const courseUuid = item.courseId;
      for (const s of item.sections) {
        const id = s.id || s.uuid || s.sectionId;
        const letter = s.letter || extractLetter(s.name || s.label || s.title || '');
        if (id && letter) sectionUuidToPair.set(id, { courseUuid, letter });
      }
      continue;
    }
    // Variante 2: item is a section with courseId property
    if (item && item.id && item.courseId) {
      const id = item.id; const courseUuid = item.courseId;
      const letter = item.letter || extractLetter(item.name || item.label || item.title || '');
      if (id && courseUuid && letter) sectionUuidToPair.set(id, { courseUuid, letter });
      continue;
    }
    // Variante 3: item keyed by courseUuid maybe like { courseUuid: [...sections...] }
    // Intentamos detectar objetos con una propiedad curso -> array
    if (item && typeof item === 'object' && Object.keys(item).length === 1) {
      const [k] = Object.keys(item);
      if (k && k.includes('-') && Array.isArray(item[k])) {
        const courseUuid = k;
        for (const s of item[k]) {
          const id = s.id || s.uuid || s.sectionId;
          const letter = s.letter || extractLetter(s.name || s.label || s.title || '');
          if (id && letter) sectionUuidToPair.set(id, { courseUuid, letter });
        }
      }
    }
  }

  log('Secciones en localStorage (mapeadas):', sectionUuidToPair.size);

  // Filtrar visibleSectionIds y construir lista de pares (courseUuid, letter)
  const visiblePairs = [];
  for (const v of CONFIG.visibleSectionIds) {
    const found = sectionUuidToPair.get(v);
    if (found) visiblePairs.push(found);
    else log(`⚠️ visibleSectionId no encontrada en localStorage: ${v}`);
  }

  if (visiblePairs.length === 0) {
    log('⚠️ No se pudieron derivar pares (courseUuid, letter) desde las visibleSectionIds. Revisa localStorage o rellena CONFIG.visibleSectionIds correctamente.');
  }

  log('Pares a consultar (courseUuid, letter):', visiblePairs);

  // 2) Construir consultas por cada courseUuid / letter y ejecutar
  const results = new Map(); // gradeId -> docData
  let totalQueried = 0;

  // helper para mapear RUT -> userId mediante studentAssignments
  const assignmentsKey = `smart-student-student-assignments-${CONFIG.year}`;
  const studentAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
  const rutToUserIds = new Map(); // rut -> [userId...]
  for (const a of studentAssignments) {
    if (!a.studentId) continue;
    const rut = a.studentRut || a.studentRUT || a.rut || a.studentId;
    if (!rut) continue;
    if (!rutToUserIds.has(rut)) rutToUserIds.set(rut, []);
    rutToUserIds.get(rut).push(a.userId || a.studentUserId || a.user);
  }

  function matchesStudentFilter(docData) {
    if (!CONFIG.studentFilter) return true;
    const f = CONFIG.studentFilter;
    // Si es userId directo
    if (f.startsWith('user-')) return String(docData.userId || docData.studentUserId || docData.studentId) === f;
    // Si es RUT: comparar con studentRut o studentId stored as RUT
    const candidate = String(docData.studentRut || docData.rut || docData.studentId || '').toLowerCase();
    return candidate === String(f).toLowerCase();
  }

  for (const pair of visiblePairs) {
    const { courseUuid, letter } = pair;
    log(`Consultando grades para course=${courseUuid} section(letter)='${letter}' ...`);

    // Intentamos consultar en la subcollection 'courses/{courseUuid}/grades'
    let q = db.collection('courses').doc(courseUuid).collection('grades').orderBy('createdAt', 'desc').limit(CONFIG.limitPerQuery);

    if (CONFIG.year !== null && CONFIG.year !== undefined) {
      try { q = q.where('year', '==', Number(CONFIG.year)); } catch (e) { log('⚠️ Error aplicando filtro year:', e.message); }
    }
    // sectionId en las calificaciones probablemente almacena la letra (e.g., 'a')
    if (letter) {
      try { q = q.where('sectionId', '==', String(letter)); } catch (e) { log('⚠️ Error aplicando filtro sectionId:', e.message); }
    }
    if (CONFIG.subjectFilter) {
      try { q = q.where('subject', '==', CONFIG.subjectFilter); } catch (e) { log('⚠️ Error aplicando filtro subject:', e.message); }
    }

    // Ejecutar consulta
    try {
      const snap = await q.get();
      log(`  ↳ ${snap.size} documentos devueltos`);
      totalQueried += snap.size;
      for (const d of snap.docs) {
        results.set(d.ref.path, { id: d.id, path: d.ref.path, data: d.data() });
      }
    } catch (err) {
      log('❌ Error en consulta Firestore:', err && err.message ? err.message : err);
    }
  }

  // Si no hay visiblePairs (ej: visibleSectionIds vacías), como fallback podemos intentar usar collectionGroup
  if (visiblePairs.length === 0) {
    log('Intentando fallback con collectionGroup sobre `grades` filtrando por year y subject (si aplica)...');
    let q = db.collectionGroup('grades').orderBy('createdAt', 'desc').limit(500);
    if (CONFIG.year !== null && CONFIG.year !== undefined) q = q.where('year', '==', Number(CONFIG.year));
    if (CONFIG.subjectFilter) q = q.where('subject', '==', CONFIG.subjectFilter);
    try {
      const snap = await q.get();
      log(`  ↳ collectionGroup returned ${snap.size}`);
      for (const d of snap.docs) results.set(d.ref.path, { id: d.id, path: d.ref.path, data: d.data() });
    } catch (err) {
      log('❌ Error en collectionGroup fallback:', err && err.message ? err.message : err);
    }
  }

  // Filtrar por studentFilter localmente si fue provisto
  const final = [];
  for (const entry of results.values()) {
    if (!matchesStudentFilter(entry.data)) continue;
    final.push(entry);
  }

  log('='.repeat(60));
  log(`Resultados: total raw documentos encontrados: ${results.size}`);
  log(`Resultados tras aplicar studentFilter/local: ${final.length}`);
  if (final.length > 0) {
    log('Ejemplo (primeros 20):');
    console.table(final.slice(0,20).map(x => ({ path: x.path, id: x.id, ...x.data })));
  }

  // Estadísticas adicionales
  const sectionDist = {};
  for (const e of final) {
    const sec = String(e.data.sectionId || 'NO_SECTION');
    sectionDist[sec] = (sectionDist[sec] || 0) + 1;
  }
  log('Distribución por sectionId:', sectionDist);

  // Devolver el array para que el usuario pueda inspeccionar en la consola (window variable)
  window.__QUERY_FIRESTORE_GRADES_DIRECT__ = final;
  log('✅ Resultado guardado en window.__QUERY_FIRESTORE_GRADES_DIRECT__');
  log('📍 Siguientes pasos: si quieres, copia window.__QUERY_FIRESTORE_GRADES_DIRECT__ en una variable y revísalo.');

})();
