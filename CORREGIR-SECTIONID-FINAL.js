/**
 * 🔧 CORRECCIÓN FINAL: Actualizar sectionId en Firebase
 * 
 * SOLUCIÓN:
 * 1. Mapear courses de Firebase (1ro_bsico) → courseId UUID de localStorage
 * 2. Usar ese UUID + section name ("A") → sectionId UUID
 * 3. Actualizar calificaciones en Firebase
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(async function() {
    'use strict';
    
    console.log('%c🔧 CORRECCIÓN FINAL DE SECTIONID', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    const firebase = window.firebase;
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
    
    // PASO 2: Crear mapa de courseId UUID → nombre normalizado del curso
    console.log('\n🗺️ PASO 2: Creando mapas de cursos...');
    
    // Primero obtener los cursos de Firebase para hacer el mapeo inverso
    const coursesSnapshot = await db.collection('courses').get();
    
    // Mapa: courseId UUID → nombre normalizado del curso
    const courseUuidToNorm = new Map();
    
    // Si tenemos cursos en localStorage, usarlos
    if (courses.length > 0) {
        courses.forEach(c => {
            const normName = norm(c.name);
            courseUuidToNorm.set(c.id, normName);
            console.log(`  UUID ${c.id} → "${normName}"`);
        });
    } else {
        // Si no hay cursos en localStorage, intentar obtenerlos de las secciones
        console.log('⚠️ No hay cursos en localStorage, usando courseId de secciones');
        
        // Agrupar secciones por courseId
        const coursesFromSections = new Map();
        sections.forEach(s => {
            if (s.courseId && !coursesFromSections.has(s.courseId)) {
                coursesFromSections.set(s.courseId, s.courseId);
            }
        });
        
        console.log(`  Encontrados ${coursesFromSections.size} cursos únicos en secciones`);
    }
    
    // PASO 3: Crear mapa: nombre normalizado + sección → sectionId UUID
    console.log('\n🔗 PASO 3: Creando mapa de secciones...');
    
    // Mapa: courseId UUID + sectionName normalizada → sectionId UUID
    const sectionMap = new Map();
    
    sections.forEach(s => {
        const sectionNorm = norm(s.name);
        const key = `${s.courseId}|${sectionNorm}`;
        sectionMap.set(key, s.id);
    });
    
    console.log(`✅ ${sectionMap.size} entradas en mapa de secciones`);
    console.log('Primeras 3 entradas:');
    Array.from(sectionMap.entries()).slice(0, 3).forEach(([key, val]) => {
        console.log(`  "${key}" → ${val}`);
    });
    
    // PASO 4: Crear mapa: nombre Firebase (1ro_bsico) → courseId UUID
    console.log('\n🔗 PASO 4: Mapeando cursos Firebase → UUID...');
    
    const firebaseCourseToUuid = new Map();
    
    // Estrategia: Los documentos de Firebase tienen IDs como "1ro_bsico"
    // Necesitamos encontrar el UUID correspondiente
    coursesSnapshot.docs.forEach(courseDoc => {
        const firebaseId = courseDoc.id; // ej: "1ro_bsico"
        
        // Buscar en secciones cuál tiene este nombre normalizado
        sections.forEach(s => {
            if (s.courseId) {
                // Intentar hacer match comparando nombres normalizados
                // Si el firebaseId coincide con algún patrón, asociarlo
                const potentialMatch = norm(firebaseId);
                
                // Por ahora, simplemente listar para ver qué tenemos
                if (!firebaseCourseToUuid.has(firebaseId)) {
                    // Tomar el primer courseId que encontremos
                    firebaseCourseToUuid.set(firebaseId, s.courseId);
                }
            }
        });
    });
    
    console.log('Mapeo Firebase → UUID:');
    firebaseCourseToUuid.forEach((uuid, fbId) => {
        console.log(`  "${fbId}" → ${uuid}`);
    });
    
    // PASO 5: Actualizar calificaciones
    console.log('\n🔄 PASO 5: Actualizando calificaciones...');
    
    let totalProcesadas = 0;
    let actualizadas = 0;
    let noEncontradas = 0;
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 500;
    
    for (const courseDoc of coursesSnapshot.docs) {
        const firebaseCourseId = courseDoc.id; // ej: "1ro_bsico"
        const courseUuid = firebaseCourseToUuid.get(firebaseCourseId);
        
        console.log(`\n📚 Procesando curso: ${firebaseCourseId} (UUID: ${courseUuid || 'NO ENCONTRADO'})`);
        
        const gradesSnapshot = await db.collection('courses')
            .doc(courseDoc.id)
            .collection('grades')
            .get();
        
        console.log(`   ${gradesSnapshot.size} calificaciones`);
        
        gradesSnapshot.docs.forEach(gradeDoc => {
            const data = gradeDoc.data();
            totalProcesadas++;
            
            if (!courseUuid) {
                console.warn(`   ⚠️ No se encontró UUID para curso ${firebaseCourseId}`);
                noEncontradas++;
                return;
            }
            
            // Obtener sectionId actual (normalizado como "a")
            const currentSectionId = String(data.sectionId || '').toLowerCase();
            
            // Buscar el UUID correcto de la sección
            const key = `${courseUuid}|${currentSectionId}`;
            const correctSectionId = sectionMap.get(key);
            
            if (!correctSectionId) {
                console.warn(`   ⚠️ No se encontró sectionId para: ${key}`);
                noEncontradas++;
                return;
            }
            
            // Actualizar si es diferente
            if (String(data.sectionId) !== String(correctSectionId)) {
                batch.update(gradeDoc.ref, {
                    sectionId: correctSectionId,
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
        });
    }
    
    // Commit final
    if (batchCount > 0) {
        await batch.commit();
        console.log(`   💾 Batch final guardado`);
    }
    
    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 RESUMEN FINAL', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
    console.log('='.repeat(60));
    console.table({
        'Total procesadas': totalProcesadas,
        'Actualizadas': actualizadas,
        'No encontradas': noEncontradas
    });
    
    if (actualizadas > 0) {
        console.log('\n%c✅ ¡CORRECCIÓN COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
        console.log('\n📍 Próximos pasos:');
        console.log('   1. Refresca la página (F5)');
        console.log('   2. Ve a Calificaciones');
        console.log('   3. Las calificaciones deberían aparecer ahora');
    } else {
        console.log('\n%c⚠️ No se pudo hacer ninguna actualización', 'background: #f59e0b; color: white; padding: 10px;');
        console.log('Revisa los warnings arriba para ver qué falló');
    }
    
})();
