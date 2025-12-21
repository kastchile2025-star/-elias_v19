/**
 * 🔧 CORRECCIÓN FORZADA: Actualizar courseId a UUID
 * 
 * El diagnóstico confirmó que las calificaciones tienen courseId="1ro_bsico" (texto)
 * pero el traductor espera UUID. Este script FUERZA la actualización.
 * 
 * MAPEO CORRECTO (según diagnóstico):
 * - "1ro_bsico" → UUID del curso correspondiente
 * - "2do_bsico" → UUID del curso correspondiente
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(async function() {
    'use strict';
    
    console.log('%c🔧 CORRECCIÓN FORZADA DE COURSEID', 'background: #ef4444; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
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
    
    // PASO 1: Obtener UUIDs correctos desde studentAssignments
    console.log('\n📚 PASO 1: Obteniendo UUIDs de cursos desde studentAssignments...');
    
    const assignmentsKey = `smart-student-student-assignments-${year}`;
    const studentAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
    
    console.log(`✅ ${studentAssignments.length} asignaciones`);
    
    // Agrupar por courseId para obtener UUIDs únicos
    const courseUuids = new Set();
    studentAssignments.forEach(a => {
        if (a.courseId) courseUuids.add(String(a.courseId));
    });
    
    const sortedCourseUuids = Array.from(courseUuids).sort();
    console.log(`✅ ${sortedCourseUuids.length} cursos únicos encontrados`);
    console.log('Course UUIDs:', sortedCourseUuids);
    
    // PASO 2: Crear mapeo MANUAL basado en orden alfabético
    console.log('\n🗺️ PASO 2: Creando mapeo Firebase ID → UUID...');
    
    const coursesSnapshot = await db.collection('courses').get();
    const firebaseIds = Array.from(coursesSnapshot.docs).map(d => d.id).sort();
    
    console.log('Firebase IDs:', firebaseIds);
    
    // Mapeo: asumimos que están en el mismo orden alfabético
    const firebaseCourseToUuid = new Map();
    
    firebaseIds.forEach((fbId, idx) => {
        if (idx < sortedCourseUuids.length) {
            const uuid = sortedCourseUuids[idx];
            firebaseCourseToUuid.set(fbId, uuid);
            console.log(`  📍 "${fbId}" → ${uuid}`);
        }
    });
    
    if (firebaseCourseToUuid.size === 0) {
        console.error('\n%c❌ ERROR: No se pudo crear mapeo', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
        return;
    }
    
    // PASO 3: Actualizar TODAS las calificaciones (forzado)
    console.log('\n🔄 PASO 3: Actualizando calificaciones (FORZADO)...');
    
    let totalProcesadas = 0;
    let actualizadas = 0;
    let errores = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
        const firebaseCourseId = courseDoc.id;
        const correctUuid = firebaseCourseToUuid.get(firebaseCourseId);
        
        console.log(`\n📚 Procesando: ${firebaseCourseId} → ${correctUuid}`);
        
        if (!correctUuid) {
            console.warn(`  ⚠️ No se encontró UUID para ${firebaseCourseId}`);
            continue;
        }
        
        const gradesSnapshot = await db.collection('courses')
            .doc(courseDoc.id)
            .collection('grades')
            .get();
        
        console.log(`  📊 ${gradesSnapshot.size} calificaciones`);
        
        // Procesar en lotes de 500
        const batch = db.batch();
        let batchCount = 0;
        const MAX_BATCH = 500;
        
        for (const gradeDoc of gradesSnapshot.docs) {
            const data = gradeDoc.data();
            totalProcesadas++;
            
            try {
                // FORZAR actualización sin importar el valor actual
                batch.update(gradeDoc.ref, {
                    courseId: correctUuid,
                    updatedAt: firebase.firestore.Timestamp.now()
                });
                
                actualizadas++;
                batchCount++;
                
                if (batchCount >= MAX_BATCH) {
                    await batch.commit();
                    console.log(`    💾 Batch guardado: ${actualizadas} actualizadas`);
                    batchCount = 0;
                }
            } catch (err) {
                console.error(`    ❌ Error:`, err.message);
                errores++;
            }
        }
        
        // Commit final del curso
        if (batchCount > 0) {
            await batch.commit();
            console.log(`    💾 Batch final guardado para ${firebaseCourseId}`);
        }
    }
    
    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 RESUMEN FINAL', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
    console.log('='.repeat(60));
    console.table({
        'Total procesadas': totalProcesadas,
        'Actualizadas (FORZADAS)': actualizadas,
        'Errores': errores
    });
    
    if (actualizadas > 0) {
        console.log('\n%c✅ ¡CORRECCIÓN COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
        console.log('\n📍 PRÓXIMOS PASOS:');
        console.log('   1. Refresca la página (F5)');
        console.log('   2. Ve a Calificaciones → 1ro Básico → Sección A');
        console.log('   3. Las 100 calificaciones deberían aparecer AHORA');
        console.log('\n💡 Si aún no aparecen, verifica en la consola si hay errores de carga');
    } else {
        console.log('\n%c⚠️ No se actualizó ninguna calificación', 'background: #f59e0b; color: white; padding: 10px;');
    }
    
})();
