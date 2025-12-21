/**
 * 🔧 MIGRACIÓN: Agregar courseId y sectionId a calificaciones existentes
 * 
 * Este script actualiza las 76 calificaciones ya cargadas en Firebase
 * agregando los campos courseId y sectionId necesarios para el filtrado
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(async function() {
    'use strict';
    
    console.log('%c🔧 MIGRACIÓN DE CALIFICACIONES', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    // Normaliza strings: quita tildes, pasa a minúsculas y colapsa espacios
    function norm(str = '') {
        return String(str)
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }
    
    // Normaliza curso a forma canónica: "<numero> basico|medio"
    const normCurso = (s='') => {
        const base = norm(s).replace(/[º°]/g, '').replace(/\b(ro|do|to|ero)\b/g, '');
        const m = base.match(/(\d{1,2}).*(basico|medio)/);
        if (m) return `${m[1]} ${m[2]}`;
        return base;
    };
    
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
    
    window.migrarCalificacionesAgregarIds = async function() {
        console.log('\n🚀 Iniciando migración...\n');
        
        try {
            // Paso 1: Verificar Firebase
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
            
            // Paso 2: Cargar usuarios de localStorage
            console.log('👥 PASO 2: Cargando usuarios del sistema...');
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            console.log(`✅ ${usuarios.length} usuarios cargados\n`);
            
            if (usuarios.length === 0) {
                throw new Error('❌ No hay usuarios en localStorage');
            }
            
            // Paso 3: Obtener todos los cursos
            console.log('📥 PASO 3: Consultando cursos en Firebase...');
            const coursesSnapshot = await db.collection('courses').get();
            console.log(`✅ ${coursesSnapshot.size} cursos encontrados\n`);
            
            if (coursesSnapshot.empty) {
                console.log('ℹ️ No hay cursos en Firebase');
                return;
            }
            
            // Paso 4: Obtener calificaciones de cada curso
            console.log('📥 PASO 4: Consultando calificaciones en subcollections...');
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
            
            console.log(`\n✅ Total: ${allGrades.length} calificaciones encontradas\n`);
            
            if (allGrades.length === 0) {
                console.log('ℹ️ No hay calificaciones para migrar');
                return;
            }
            
            // Paso 5: Procesar y actualizar
            console.log('🔄 PASO 5: Procesando calificaciones...');
            
            let actualizadas = 0;
            let yaCompletas = 0;
            let errores = 0;
            let batch = db.batch();
            let batchCount = 0;
            const MAX_BATCH = 500;
            
            for (const grade of allGrades) {
                const data = grade.data;
                
                // Si ya tiene courseId y sectionId, saltar
                if (data.courseId && data.sectionId) {
                    yaCompletas++;
                    continue;
                }
                
                try {
                    // Buscar estudiante por RUT o studentId
                    const estudiante = usuarios.find(u => 
                        (u.rut && data.studentRut && 
                         u.rut.replace(/[.-]/g, '').toLowerCase() === data.studentRut.replace(/[.-]/g, '').toLowerCase()) ||
                        u.id === data.studentId
                    );
                    
                    if (!estudiante) {
                        console.warn(`⚠️ Estudiante no encontrado: ${data.studentName} (${data.studentRut})`);
                        errores++;
                        continue;
                    }
                    
                    // Buscar assignment del estudiante que coincida con curso/sección
                    const assignment = estudiante.courseAssignments?.find(ca => 
                        normCurso(ca.course) === normCurso(data.course) && 
                        norm(ca.section) === norm(data.section)
                    );
                    
                    if (!assignment || !assignment.courseId || !assignment.sectionId) {
                        console.warn(`⚠️ No se encontró courseId/sectionId para: ${data.studentName} en ${data.course} ${data.section}`);
                        errores++;
                        continue;
                    }
                    
                    // Actualizar documento con courseId y sectionId
                    batch.update(grade.ref, {
                        courseId: assignment.courseId,
                        sectionId: assignment.sectionId,
                        updatedAt: firebase.firestore.Timestamp.now()
                    });
                    
                    actualizadas++;
                    batchCount++;
                    
                    // Commit cada 500 operaciones
                    if (batchCount >= MAX_BATCH) {
                        await batch.commit();
                        console.log(`   💾 Batch guardado: ${actualizadas} actualizadas hasta ahora`);
                        batch = db.batch(); // Crear nuevo batch
                        batchCount = 0;
                    }
                    
                } catch (err) {
                    console.error(`❌ Error procesando ${data.id}:`, err.message);
                    errores++;
                }
            }
            
            // Commit final si hay operaciones pendientes
            if (batchCount > 0) {
                await batch.commit();
                console.log(`   💾 Batch final guardado`);
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 RESUMEN DE MIGRACIÓN', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
            console.log('='.repeat(60));
            console.table({
                'Total encontradas': allGrades.length,
                'Ya completas (con IDs)': yaCompletas,
                'Actualizadas': actualizadas,
                'Errores': errores
            });
            
            if (actualizadas > 0) {
                console.log('\n%c✅ ¡MIGRACIÓN COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
                console.log('\n📍 Próximos pasos:');
                console.log('   1. Refresca la página');
                console.log('   2. Ve a Calificaciones → 1ro Básico A');
                console.log('   3. Deberías ver las calificaciones cargadas');
            } else if (yaCompletas === allGrades.length) {
                console.log('\n%cℹ️ Todas las calificaciones ya tienen courseId y sectionId', 'background: #3b82f6; color: white; padding: 10px;');
            } else {
                console.log('\n%c⚠️ No se pudo actualizar ninguna calificación', 'background: #f59e0b; color: white; padding: 10px;');
                console.log('   Revisa los errores arriba');
            }
            
            return { total: allGrades.length, actualizadas, yaCompletas, errores };
            
        } catch (error) {
            console.error('\n%c❌ ERROR EN MIGRACIÓN', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
            console.error(error);
            throw error;
        }
    };
    
    console.log('\n%c✅ SCRIPT DE MIGRACIÓN LISTO', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
    console.log('\n💡 PARA EJECUTAR:');
    console.log('%c   await migrarCalificacionesAgregarIds()', 'background: #fbbf24; color: #000; padding: 8px; font-weight: bold;');
    console.log('\n');
    
})();
