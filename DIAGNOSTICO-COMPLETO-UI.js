/**
 * 🔍 DIAGNÓSTICO COMPLETO: Simulación exacta del filtro de la UI
 * 
 * Este script simula EXACTAMENTE lo que hace la página de Calificaciones
 * para filtrar las calificaciones y determinar por qué no aparecen
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR (en la página de Calificaciones)
 */

(async function() {
    'use strict';
    
    console.log('%c🔍 DIAGNÓSTICO COMPLETO DE UI', 'background: #f59e0b; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    // Cargar Firebase
    async function obtenerFirebase() {
        if (window.firebase && window.firebase.firestore) {
            return window.firebase;
        }
        
        console.log('📦 Cargando Firebase desde CDN...');
        
        const cargarScript = (url) => new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        if (!window.firebase) {
            await cargarScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
        }
        
        if (!window.firebase.firestore) {
            await cargarScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
        }
        
        return window.firebase;
    }
    
    const firebase = await obtenerFirebase();
    
    if (!firebase.apps || firebase.apps.length === 0) {
        const firebaseConfig = {
            apiKey: "AIzaSyCX9xW0DwSf-5B9au4NmK3Qc2qF9Vtx1Co",
            authDomain: "superjf1234-e9cbc.firebaseapp.com",
            projectId: "superjf1234-e9cbc",
            messagingSenderId: "742753294911",
            appId: "1:742753294911:web:010940c0a3c4ba5ae6768a"
        };
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase inicializado');
    }
    
    const db = firebase.firestore();
    const year = 2025;
    
    // PASO 1: Obtener datos de Firebase
    console.log('\n📥 PASO 1: Obteniendo calificaciones de Firebase...');
    
    const gradesFirebase = [];
    const coursesSnapshot = await db.collection('courses').get();
    
    for (const courseDoc of coursesSnapshot.docs) {
        const gradesSnapshot = await db.collection('courses')
            .doc(courseDoc.id)
            .collection('grades')
            .limit(5)
            .get();
        
        gradesSnapshot.forEach(gradeDoc => {
            const data = gradeDoc.data();
            gradesFirebase.push(data);
        });
    }
    
    console.log(`✅ ${gradesFirebase.length} calificaciones obtenidas`);
    console.log('Muestra de 3 calificaciones:');
    console.table(gradesFirebase.slice(0, 3).map(g => ({
        studentId: g.studentId,
        courseId: g.courseId,
        sectionId: g.sectionId,
        score: g.score,
        subject: g.subject || g.subjectId
    })));
    
    // PASO 2: Cargar datos de localStorage
    console.log('\n📚 PASO 2: Cargando datos de localStorage...');
    
    const assignmentsKey = `smart-student-student-assignments-${year}`;
    const sectionsKey = `smart-student-sections-${year}`;
    
    const studentAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
    const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    console.log(`✅ ${studentAssignments.length} asignaciones de estudiantes`);
    console.log(`✅ ${sections.length} secciones`);
    console.log(`✅ ${users.length} usuarios`);
    
    // PASO 3: Simular el traductor de sectionId (EXACTO como en la UI)
    console.log('\n🗺️ PASO 3: Creando traductor de sectionId (como en UI)...');
    
    const sectionIdTranslator = new Map();
    const courseSectionsMap = new Map();
    
    studentAssignments.forEach(a => {
        const cid = String(a.courseId || '');
        const sid = String(a.sectionId || '');
        if (cid && sid) {
            if (!courseSectionsMap.has(cid)) courseSectionsMap.set(cid, new Set());
            courseSectionsMap.get(cid).add(sid);
        }
    });
    
    courseSectionsMap.forEach((uuidSet, courseId) => {
        const sortedUuids = Array.from(uuidSet).sort();
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        sortedUuids.forEach((uuid, idx) => {
            if (idx < letters.length) {
                const key = `${courseId}|${letters[idx]}`;
                sectionIdTranslator.set(key, uuid);
            }
        });
    });
    
    console.log(`✅ Traductor creado: ${sectionIdTranslator.size} mapeos`);
    console.log('Primeros 5 mapeos:');
    Array.from(sectionIdTranslator.entries()).slice(0, 5).forEach(([key, val]) => {
        console.log(`  "${key}" → ${val}`);
    });
    
    // PASO 4: Crear mapa RUT → userId (como en UI)
    console.log('\n👤 PASO 4: Creando mapa RUT → userId...');
    
    const rutToUserId = new Map();
    users.forEach(u => {
        const uid = String(u.id || '');
        const rut = String(u.rut || '').trim();
        if (uid && rut) {
            rutToUserId.set(rut, uid);
        }
    });
    
    console.log(`✅ Mapa RUT creado: ${rutToUserId.size} entradas`);
    
    // PASO 5: Simular visibleSectionIds (seleccionar una sección para probar)
    console.log('\n🎯 PASO 5: Simulando filtro de sección visible...');
    
    // Vamos a usar la primera sección como ejemplo
    const testSection = sections[0];
    if (!testSection) {
        console.error('❌ No hay secciones en localStorage');
        return;
    }
    
    const visibleSectionIds = new Set([String(testSection.id)]);
    
    console.log(`📍 Sección de prueba: ${testSection.name} (${testSection.id})`);
    console.log(`📍 CourseId de la sección: ${testSection.courseId}`);
    console.log(`📍 Secciones visibles:`, Array.from(visibleSectionIds));
    
    // PASO 6: Aplicar el filtro EXACTO de la UI
    console.log('\n🔄 PASO 6: Aplicando filtro (simulación exacta de UI)...');
    
    let pasaFiltro = 0;
    let fallaFiltro = 0;
    const razonesRechazo = {};
    
    gradesFirebase.forEach((g, idx) => {
        // Normalizar studentId (RUT → userId)
        const originalStudentId = String(g.studentId || '');
        const normalizedStudentId = rutToUserId.get(originalStudentId) || originalStudentId;
        
        let razones = [];
        let pasa = true;
        
        // Filtro por sección (EXACTO como en page.tsx línea 2795-2817)
        if (g.sectionId) {
            let effectiveSectionId = String(g.sectionId);
            const courseId = String(g.courseId || '');
            
            // Intentar traducir sectionId si es letra
            if (effectiveSectionId.length <= 2 && courseId) {
                const translationKey = `${courseId}|${effectiveSectionId}`;
                const translatedId = sectionIdTranslator.get(translationKey);
                
                if (translatedId) {
                    effectiveSectionId = translatedId;
                    if (idx < 3) console.log(`  ✅ Traducción: "${translationKey}" → ${effectiveSectionId}`);
                } else {
                    if (idx < 3) console.log(`  ⚠️ No se pudo traducir: "${translationKey}"`);
                }
            }
            
            const secMatch = visibleSectionIds.has(effectiveSectionId);
            
            if (!secMatch) {
                pasa = false;
                razones.push(`sectionId no coincide: "${effectiveSectionId}" no está en visibles`);
            }
        } else {
            // Inferir sección del estudiante
            const assign = studentAssignments.find(as => 
                String(as.studentId) === normalizedStudentId || 
                String(as.studentUsername) === normalizedStudentId ||
                String(as.studentId) === originalStudentId ||
                String(as.studentUsername) === originalStudentId
            );
            
            const secId = assign?.sectionId ? String(assign.sectionId) : null;
            
            if (secId) {
                if (!visibleSectionIds.has(secId)) {
                    pasa = false;
                    razones.push(`sectionId inferida "${secId}" no está en visibles`);
                }
            } else {
                pasa = false;
                razones.push('Sin sectionId y no se pudo inferir');
            }
        }
        
        if (pasa) {
            pasaFiltro++;
        } else {
            fallaFiltro++;
            razones.forEach(r => {
                razonesRechazo[r] = (razonesRechazo[r] || 0) + 1;
            });
            
            if (idx < 3) {
                console.log(`\n❌ Calificación ${idx + 1} rechazada:`);
                console.log(`   Estudiante: ${g.studentName || originalStudentId}`);
                console.log(`   courseId: ${g.courseId}`);
                console.log(`   sectionId: ${g.sectionId}`);
                console.log(`   Razones:`, razones);
            }
        }
    });
    
    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 RESUMEN DEL FILTRADO', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
    console.log('='.repeat(60));
    console.table({
        'Total calificaciones': gradesFirebase.length,
        'Pasan filtro': pasaFiltro,
        'Fallan filtro': fallaFiltro
    });
    
    if (fallaFiltro > 0) {
        console.log('\n📋 Razones de rechazo:');
        console.table(razonesRechazo);
        
        console.log('\n%c❌ PROBLEMA IDENTIFICADO', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
        console.log('Las calificaciones no pasan el filtro de sección de la UI');
        
        // Diagnóstico más profundo
        const primeraCalificacion = gradesFirebase[0];
        if (primeraCalificacion) {
            console.log('\n🔬 ANÁLISIS DETALLADO de la primera calificación:');
            console.log('1. courseId en calificación:', primeraCalificacion.courseId);
            console.log('2. sectionId en calificación:', primeraCalificacion.sectionId);
            
            const translationKey = `${primeraCalificacion.courseId}|${primeraCalificacion.sectionId}`;
            console.log('3. Clave de traducción buscada:', translationKey);
            console.log('4. ¿Existe en traductor?:', sectionIdTranslator.has(translationKey));
            
            if (sectionIdTranslator.has(translationKey)) {
                const traducida = sectionIdTranslator.get(translationKey);
                console.log('5. Traducción encontrada:', traducida);
                console.log('6. ¿Está en secciones visibles?:', visibleSectionIds.has(traducida));
            } else {
                console.log('5. ❌ NO SE ENCONTRÓ TRADUCCIÓN');
                console.log('\n💡 SOLUCIÓN:');
                console.log('   El traductor espera courseId UUID pero la calificación tiene:', primeraCalificacion.courseId);
                console.log('   Claves disponibles en traductor:');
                Array.from(sectionIdTranslator.keys()).slice(0, 5).forEach(k => console.log(`     - ${k}`));
            }
        }
    } else {
        console.log('\n%c✅ LAS CALIFICACIONES PASAN EL FILTRO', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
        console.log('El problema debe estar en otro lugar (UI, estado de React, etc.)');
    }
    
    console.log('\n%c✅ DIAGNÓSTICO COMPLETO', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
    
})();
