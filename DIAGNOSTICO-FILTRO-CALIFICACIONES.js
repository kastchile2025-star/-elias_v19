/**
 * 🔍 DIAGNÓSTICO: Por qué no aparecen las calificaciones en la UI
 * 
 * Este script verifica:
 * 1. Estructura de calificaciones en Firebase (courseId, sectionId)
 * 2. Estructura de studentAssignments en localStorage (courseId, sectionId)
 * 3. El traductor de sectionId que usa la UI
 * 4. Por qué no coinciden
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR (en la página de Calificaciones)
 */

(async function() {
    'use strict';
    
    console.log('%c🔍 DIAGNÓSTICO DE FILTRO DE CALIFICACIONES', 'background: #f59e0b; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    // Cargar Firebase si no está disponible
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
    
    // PASO 1: Obtener calificaciones de Firebase
    console.log('\n📥 PASO 1: Calificaciones en Firebase');
    const coursesSnapshot = await db.collection('courses').get();
    
    const gradesFirebase = [];
    for (const courseDoc of coursesSnapshot.docs) {
        const gradesSnapshot = await db.collection('courses')
            .doc(courseDoc.id)
            .collection('grades')
            .limit(5)
            .get();
        
        gradesSnapshot.forEach(gradeDoc => {
            const data = gradeDoc.data();
            gradesFirebase.push({
                firebaseDocCourseId: courseDoc.id,
                courseId: data.courseId,
                sectionId: data.sectionId,
                studentId: data.studentId,
                studentName: data.studentName
            });
        });
    }
    
    console.log(`Total muestra: ${gradesFirebase.length} calificaciones`);
    console.table(gradesFirebase.slice(0, 5));
    
    // PASO 2: Obtener studentAssignments de localStorage
    console.log('\n📚 PASO 2: StudentAssignments en localStorage');
    const year = 2025;
    const assignmentsKey = `smart-student-student-assignments-${year}`;
    const studentAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
    
    console.log(`Total: ${studentAssignments.length} asignaciones`);
    
    if (studentAssignments.length > 0) {
        console.log('Primeras 5 asignaciones:');
        console.table(studentAssignments.slice(0, 5).map(a => ({
            studentId: a.studentId,
            courseId: a.courseId,
            sectionId: a.sectionId,
            courseName: a.courseName || 'N/A'
        })));
    } else {
        console.warn('⚠️ No hay studentAssignments para el año', year);
    }
    
    // PASO 3: Simular el traductor que usa la UI
    console.log('\n🗺️ PASO 3: Simulando traductor de sectionId');
    
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
    
    console.log(`Traductor creado: ${sectionIdTranslator.size} mapeos`);
    console.log('Primeros 5 mapeos:');
    Array.from(sectionIdTranslator.entries()).slice(0, 5).forEach(([key, val]) => {
        console.log(`  "${key}" → ${val}`);
    });
    
    // PASO 4: Intentar traducir las calificaciones de Firebase
    console.log('\n🔄 PASO 4: Intentando traducir calificaciones de Firebase');
    
    let traducciones_exitosas = 0;
    let traducciones_fallidas = 0;
    
    gradesFirebase.forEach((g, idx) => {
        const courseId = String(g.courseId || '');
        const sectionId = String(g.sectionId || '');
        
        const key = `${courseId}|${sectionId}`;
        const translated = sectionIdTranslator.get(key);
        
        if (translated) {
            traducciones_exitosas++;
            if (idx < 3) {
                console.log(`✅ Traducción ${idx + 1}:`, {
                    original: `${courseId}|${sectionId}`,
                    traducido: translated,
                    estudiante: g.studentName
                });
            }
        } else {
            traducciones_fallidas++;
            if (idx < 3) {
                console.log(`❌ Fallo ${idx + 1}:`, {
                    clave_buscada: key,
                    no_encontrada: 'No existe en traductor',
                    estudiante: g.studentName
                });
            }
        }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 RESUMEN DEL DIAGNÓSTICO', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
    console.log('='.repeat(60));
    console.table({
        'Calificaciones en Firebase': gradesFirebase.length,
        'StudentAssignments': studentAssignments.length,
        'Mapeos en traductor': sectionIdTranslator.size,
        'Traducciones exitosas': traducciones_exitosas,
        'Traducciones fallidas': traducciones_fallidas
    });
    
    console.log('\n🔍 ANÁLISIS:');
    
    if (traducciones_fallidas > 0) {
        console.log('%c❌ PROBLEMA ENCONTRADO:', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
        console.log('Las calificaciones en Firebase tienen courseId normalizado (ej: "1ro_bsico")');
        console.log('Pero el traductor espera courseId UUID (ej: "f3951885-93e2-46b4-b176-af8a7737bfec")');
        console.log('\n💡 SOLUCIÓN:');
        console.log('Opción 1: Actualizar courseId en Firebase a UUID');
        console.log('Opción 2: Actualizar courseId en studentAssignments a texto normalizado');
        console.log('Opción 3: Crear traductor bidireccional (recomendado)');
    } else {
        console.log('%c✅ TODO CORRECTO:', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
        console.log('Las traducciones funcionan correctamente');
        console.log('El problema debe estar en otro lugar');
    }
    
    // PASO 5: Verificar qué courseId tienen las secciones en localStorage
    console.log('\n📂 PASO 5: Verificando secciones en localStorage');
    const sectionsKey = `smart-student-sections-${year}`;
    const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
    
    console.log(`Total: ${sections.length} secciones`);
    if (sections.length > 0) {
        console.log('Primeras 3 secciones:');
        console.table(sections.slice(0, 3).map(s => ({
            id: s.id,
            name: s.name,
            courseId: s.courseId,
            courseName: s.courseName || 'N/A'
        })));
    }
    
    console.log('\n%c✅ DIAGNÓSTICO COMPLETO', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
    
})();
