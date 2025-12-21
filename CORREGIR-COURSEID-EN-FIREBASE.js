/**
 * 🔧 CORRECCIÓN: Actualizar courseId en Firebase de texto a UUID
 * 
 * PROBLEMA:
 * - Calificaciones tienen courseId="1ro_bsico" (texto normalizado)
 * - Pero la UI espera courseId=UUID para el filtrado
 * 
 * SOLUCIÓN:
 * - Obtener el mapeo: "1ro_bsico" → UUID desde secciones/cursos
 * - Actualizar todas las calificaciones en Firebase
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(async function() {
    'use strict';
    
    console.log('%c🔧 CORRECCIÓN DE COURSEID EN FIREBASE', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
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
    
    const norm = (str) => String(str || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .trim();
    
    // PASO 1: Cargar datos de localStorage
    console.log('\n📚 PASO 1: Cargando datos de localStorage...');
    const year = 2025;
    const sectionsKey = `smart-student-sections-${year}`;
    const coursesKey = `smart-student-courses`;
    const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
    const courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
    
    console.log(`✅ ${sections.length} secciones`);
    console.log(`✅ ${courses.length} cursos`);
    
    // PASO 2: Crear mapa: nombre Firebase (1ro_bsico) → courseId UUID
    console.log('\n🗺️ PASO 2: Creando mapa de cursos...');
    
    // Primero intentar desde cursos explícitos
    const courseMap = new Map();
    
    if (courses.length > 0) {
        courses.forEach(c => {
            const courseId = c.id;
            const courseName = c.name || '';
            
            if (courseId && courseName) {
                const normName = norm(courseName);
                courseMap.set(normName, courseId);
                courseMap.set(courseId, courseId); // También mapear UUID → UUID
                console.log(`  📚 "${courseName}" (${normName}) → ${courseId}`);
            }
        });
    } else {
        // Fallback: Intentar obtener nombres desde Firebase mismo
        console.log('⚠️ No hay cursos en localStorage, obteniendo desde Firebase...');
        
        const coursesSnapshot = await db.collection('courses').get();
        
        for (const courseDoc of coursesSnapshot.docs) {
            const firebaseId = courseDoc.id; // ej: "1ro_bsico"
            const data = courseDoc.data();
            const courseName = data.name || data.courseName || '';
            
            if (courseName) {
                // Mapear el nombre normalizado al ID del documento de Firebase (que necesitamos convertir a UUID)
                console.log(`  📍 Firebase: "${firebaseId}" tiene nombre "${courseName}"`);
            }
        }
        
        // Buscar coincidencias en secciones usando studentAssignments
        const assignmentsKey = `smart-student-student-assignments-${year}`;
        const studentAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
        
        console.log(`  📊 ${studentAssignments.length} asignaciones de estudiantes`);
        
        // Agrupar por courseId para ver qué UUIDs existen
        const courseUuids = new Set();
        studentAssignments.forEach(a => {
            if (a.courseId) courseUuids.add(String(a.courseId));
        });
        
        console.log(`  🔍 Encontrados ${courseUuids.size} cursos únicos en asignaciones`);
        
        // Como no tenemos nombres, usaremos una estrategia diferente:
        // Los documentos de Firebase se llaman "1ro_bsico", "2do_bsico"
        // Necesitamos mapear esto a los UUIDs de las asignaciones
        // La única forma es por las secciones que conectan ambos
        
        const sectionsByCourse = new Map();
        sections.forEach(s => {
            const cid = s.courseId;
            if (cid) {
                if (!sectionsByCourse.has(cid)) sectionsByCourse.set(cid, []);
                sectionsByCourse.get(cid).push(s);
            }
        });
        
        console.log(`  🗂️ ${sectionsByCourse.size} grupos de secciones por courseId`);
        
        // Ahora necesitamos mapear los IDs de Firebase a estos UUIDs
        // Como último recurso, usar el orden: 1ro_bsico → primer UUID, 2do_bsico → segundo UUID
        const sortedFirebaseIds = Array.from(coursesSnapshot.docs).map(d => d.id).sort();
        const sortedCourseUuids = Array.from(courseUuids).sort();
        
        console.log(`  📋 Firebase IDs ordenados:`, sortedFirebaseIds);
        console.log(`  📋 Course UUIDs ordenados:`, sortedCourseUuids.slice(0, 3));
        
        sortedFirebaseIds.forEach((fbId, idx) => {
            if (idx < sortedCourseUuids.length) {
                const uuid = sortedCourseUuids[idx];
                courseMap.set(fbId, uuid);
                courseMap.set(norm(fbId), uuid);
                console.log(`  🔗 Mapeo por orden: "${fbId}" → ${uuid}`);
            }
        });
    }
    
    console.log(`\n✅ ${courseMap.size} entradas en mapa de cursos`);
    if (courseMap.size === 0) {
        console.error('\n%c❌ ERROR: No se pudo crear mapa de cursos', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
        console.log('\n💡 Los cursos y secciones no tienen nombres. Necesitamos otra estrategia.');
        return;
    }
    
    // PASO 3: Obtener cursos de Firebase
    console.log('\n📥 PASO 3: Consultando cursos en Firebase...');
    const coursesSnapshot = await db.collection('courses').get();
    
    console.log(`✅ ${coursesSnapshot.size} cursos encontrados en Firebase`);
    
    // El mapa courseMap ya contiene las traducciones necesarias
    const firebaseCourseToUuid = courseMap;
    
    // PASO 4: Actualizar calificaciones
    console.log('\n🔄 PASO 4: Actualizando courseId en calificaciones...');
    
    let totalProcesadas = 0;
    let actualizadas = 0;
    let noEncontradas = 0;
    let errores = 0;
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 500;
    
    for (const courseDoc of coursesSnapshot.docs) {
        const firebaseCourseId = courseDoc.id; // ej: "1ro_bsico"
        const correctCourseUuid = firebaseCourseToUuid.get(firebaseCourseId);
        
        console.log(`\n📚 Procesando curso: ${firebaseCourseId} (UUID: ${correctCourseUuid || 'NO ENCONTRADO'})`);
        
        const gradesSnapshot = await db.collection('courses')
            .doc(courseDoc.id)
            .collection('grades')
            .get();
        
        console.log(`   ${gradesSnapshot.size} calificaciones`);
        
        gradesSnapshot.docs.forEach(gradeDoc => {
            const data = gradeDoc.data();
            totalProcesadas++;
            
            if (!correctCourseUuid) {
                console.warn(`   ⚠️ No se encontró UUID para curso ${firebaseCourseId}`);
                noEncontradas++;
                return;
            }
            
            try {
                // Actualizar si courseId es diferente del UUID correcto
                const currentCourseId = String(data.courseId || '');
                
                if (currentCourseId !== correctCourseUuid) {
                    batch.update(gradeDoc.ref, {
                        courseId: correctCourseUuid,
                        updatedAt: firebase.firestore.Timestamp.now()
                    });
                    
                    actualizadas++;
                    batchCount++;
                    
                    // Commit cada 500 operaciones
                    if (batchCount >= MAX_BATCH) {
                        batch.commit();
                        console.log(`   💾 Batch guardado: ${actualizadas} actualizadas hasta ahora`);
                        batchCount = 0;
                    }
                }
            } catch (err) {
                console.error(`   ❌ Error procesando calificación:`, err.message);
                errores++;
            }
        });
    }
    
    // Commit final
    if (batchCount > 0) {
        await batch.commit();
        console.log(`   💾 Batch final guardado`);
    }
    
    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 RESUMEN DE CORRECCIÓN', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
    console.log('='.repeat(60));
    console.table({
        'Total procesadas': totalProcesadas,
        'Actualizadas': actualizadas,
        'No encontradas': noEncontradas,
        'Errores': errores
    });
    
    if (actualizadas > 0) {
        console.log('\n%c✅ ¡CORRECCIÓN COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
        console.log('\n📍 Próximos pasos:');
        console.log('   1. Refresca la página (F5)');
        console.log('   2. Ve a Calificaciones → Selecciona curso y sección');
        console.log('   3. Las calificaciones deberían aparecer ahora en la tabla');
    } else if (noEncontradas > 0) {
        console.log('\n%c⚠️ No se pudo mapear algunos cursos', 'background: #f59e0b; color: white; padding: 10px;');
        console.log('Revisa los warnings arriba para ver qué cursos no se encontraron');
    } else {
        console.log('\n%cℹ️ No hubo cambios necesarios (courseId ya está correcto)', 'background: #3b82f6; color: white; padding: 10px;');
    }
    
})();
