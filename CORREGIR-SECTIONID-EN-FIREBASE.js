/**
 * 🔧 CORRECCIÓN: Actualizar sectionId en Firebase
 * 
 * Este script actualiza todas las calificaciones en Firebase
 * asignando el sectionId CORRECTO desde localStorage
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(async function() {
    'use strict';
    
    console.log('%c🔧 CORRECCIÓN DE SECTIONID EN FIREBASE', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
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
    
    // Normaliza strings
    function norm(str = '') {
        return String(str)
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }
    
    window.corregirSectionIdEnFirebase = async function() {
        console.log('\n🚀 Iniciando corrección...\n');
        
        try {
            // Paso 1: Conectar a Firebase
            console.log('🔍 PASO 1: Conectando a Firebase...');
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
            }
            
            const db = firebase.firestore();
            console.log('✅ Conectado a Firestore\n');
            
            // Paso 2: Cargar secciones de localStorage
            console.log('📚 PASO 2: Cargando secciones desde localStorage...');
            const year = 2025;
            const sectionsKey = `smart-student-sections-${year}`;
            const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
            console.log(`✅ ${sections.length} secciones cargadas desde ${sectionsKey}\n`);
            
            // Crear mapa: courseId + sectionName → sectionId
            const sectionMap = new Map();
            sections.forEach(s => {
                const key = `${s.courseId}|${norm(s.name)}`;
                sectionMap.set(key, s.id);
                console.log(`   📍 ${s.courseId} + "${s.name}" → sectionId: ${s.id} (${typeof s.id})`);
            });
            
            // Paso 3: Obtener cursos de Firebase
            console.log('\n📥 PASO 3: Consultando cursos en Firebase...');
            const coursesSnapshot = await db.collection('courses').get();
            console.log(`✅ ${coursesSnapshot.size} cursos encontrados\n`);
            
            // Paso 4: Obtener todas las calificaciones
            console.log('📥 PASO 4: Obteniendo calificaciones...');
            const allGrades = [];
            
            for (const courseDoc of coursesSnapshot.docs) {
                const gradesSnapshot = await db.collection('courses')
                    .doc(courseDoc.id)
                    .collection('grades')
                    .get();
                
                console.log(`   📚 ${courseDoc.id}: ${gradesSnapshot.size} calificaciones`);
                
                gradesSnapshot.docs.forEach(gradeDoc => {
                    allGrades.push({
                        ref: gradeDoc.ref,
                        data: gradeDoc.data(),
                        courseDocId: courseDoc.id
                    });
                });
            }
            
            console.log(`\n✅ Total: ${allGrades.length} calificaciones\n`);
            
            // Paso 5: Actualizar calificaciones
            console.log('🔄 PASO 5: Actualizando sectionId...');
            
            let actualizadas = 0;
            let noEncontradas = 0;
            let errores = 0;
            const batch = db.batch();
            let batchCount = 0;
            const MAX_BATCH = 500;
            
            for (const grade of allGrades) {
                const data = grade.data;
                
                try {
                    // Obtener sectionId correcto desde el mapa
                    const courseId = String(data.courseId || data.course || '');
                    const sectionName = String(data.section || '');
                    const key = `${courseId}|${norm(sectionName)}`;
                    
                    const correctSectionId = sectionMap.get(key);
                    
                    if (!correctSectionId) {
                        console.warn(`⚠️ No se encontró sectionId para: ${courseId} + "${sectionName}"`);
                        noEncontradas++;
                        continue;
                    }
                    
                    // Solo actualizar si es diferente
                    if (String(data.sectionId) !== String(correctSectionId)) {
                        batch.update(grade.ref, {
                            sectionId: correctSectionId,
                            updatedAt: firebase.firestore.Timestamp.now()
                        });
                        
                        actualizadas++;
                        batchCount++;
                        
                        // Commit cada 500 operaciones
                        if (batchCount >= MAX_BATCH) {
                            await batch.commit();
                            console.log(`   💾 Batch guardado: ${actualizadas} actualizadas`);
                            batchCount = 0;
                        }
                    }
                    
                } catch (err) {
                    console.error(`❌ Error procesando ${data.id}:`, err.message);
                    errores++;
                }
            }
            
            // Commit final
            if (batchCount > 0) {
                await batch.commit();
                console.log(`   💾 Batch final guardado`);
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 RESUMEN DE CORRECCIÓN', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
            console.log('='.repeat(60));
            console.table({
                'Total procesadas': allGrades.length,
                'Actualizadas': actualizadas,
                'No encontradas': noEncontradas,
                'Errores': errores
            });
            
            if (actualizadas > 0) {
                console.log('\n%c✅ ¡CORRECCIÓN COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
                console.log('\n📍 Próximos pasos:');
                console.log('   1. Refresca la página (F5)');
                console.log('   2. Ve a Calificaciones → 1ro Básico A');
                console.log('   3. Las calificaciones deberían aparecer ahora');
            } else {
                console.log('\n%cℹ️ No hubo cambios necesarios', 'background: #3b82f6; color: white; padding: 10px;');
            }
            
            return { total: allGrades.length, actualizadas, noEncontradas, errores };
            
        } catch (error) {
            console.error('\n%c❌ ERROR EN CORRECCIÓN', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
            console.error(error);
            throw error;
        }
    };
    
    console.log('\n%c✅ SCRIPT DE CORRECCIÓN LISTO', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
    console.log('\n💡 PARA EJECUTAR:');
    console.log('%c   await corregirSectionIdEnFirebase()', 'background: #fbbf24; color: #000; padding: 8px; font-weight: bold;');
    console.log('\n');
    
})();
