/**
 * 🔍 DIAGNÓSTICO: Verificar campo 'year' en calificaciones de Firebase
 * 
 * Este script verifica si las calificaciones en Firebase tienen el campo 'year'
 * y muestra la estructura real de los documentos
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(async function() {
    'use strict';
    
    console.log('%c🔍 DIAGNÓSTICO DE CALIFICACIONES EN FIREBASE', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
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
    
    window.verificarYearEnFirebase = async function() {
        console.log('\n🚀 Iniciando verificación...\n');
        
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
            
            // Paso 2: Obtener una muestra de calificaciones
            console.log('📥 PASO 2: Obteniendo muestra de calificaciones...');
            const coursesSnapshot = await db.collection('courses').limit(2).get();
            
            const muestraCompleta = [];
            
            for (const courseDoc of coursesSnapshot.docs) {
                console.log(`\n📚 Curso: ${courseDoc.id}`);
                console.log(`   Datos del curso:`, courseDoc.data());
                
                const gradesSnapshot = await db.collection('courses')
                    .doc(courseDoc.id)
                    .collection('grades')
                    .limit(3)
                    .get();
                
                console.log(`   📊 ${gradesSnapshot.size} calificaciones (muestra)`);
                
                gradesSnapshot.docs.forEach((gradeDoc, idx) => {
                    const data = gradeDoc.data();
                    console.log(`   \n   📝 Calificación ${idx + 1}:`);
                    console.log(`      ID: ${gradeDoc.id}`);
                    console.log(`      Estructura:`, {
                        tieneYear: 'year' in data,
                        year: data.year,
                        tipoYear: typeof data.year,
                        courseId: data.courseId,
                        sectionId: data.sectionId,
                        studentId: data.studentId,
                        studentName: data.studentName,
                        score: data.score,
                        title: data.title,
                        campos: Object.keys(data)
                    });
                    
                    muestraCompleta.push({
                        curso: courseDoc.id,
                        gradeId: gradeDoc.id,
                        ...data
                    });
                });
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 RESUMEN DEL DIAGNÓSTICO', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
            console.log('='.repeat(60));
            
            const conYear = muestraCompleta.filter(g => 'year' in g).length;
            const sinYear = muestraCompleta.length - conYear;
            const conCourseId = muestraCompleta.filter(g => 'courseId' in g && g.courseId).length;
            const conSectionId = muestraCompleta.filter(g => 'sectionId' in g && g.sectionId).length;
            
            console.table({
                'Total muestreadas': muestraCompleta.length,
                'Con campo year': conYear,
                'Sin campo year': sinYear,
                'Con courseId': conCourseId,
                'Con sectionId': conSectionId
            });
            
            if (sinYear > 0) {
                console.log('\n%c⚠️ PROBLEMA DETECTADO', 'background: #f59e0b; color: white; padding: 10px; font-weight: bold;');
                console.log(`   ${sinYear} calificaciones NO tienen el campo 'year'`);
                console.log('   Esto impedirá que getGradesByYear funcione correctamente');
            }
            
            if (conYear > 0) {
                const yearsEncontrados = [...new Set(muestraCompleta.filter(g => g.year).map(g => g.year))];
                console.log('\n%c✅ Años encontrados:', 'background: #10b981; color: white; padding: 8px;');
                console.log('   ', yearsEncontrados);
            }
            
            console.log('\n%c🔍 Muestra completa:', 'background: #3b82f6; color: white; padding: 8px;');
            console.table(muestraCompleta.slice(0, 5).map(g => ({
                curso: g.curso,
                year: g.year,
                courseId: g.courseId,
                sectionId: g.sectionId,
                estudiante: g.studentName,
                nota: g.score
            })));
            
            return { total: muestraCompleta.length, conYear, sinYear, muestra: muestraCompleta };
            
        } catch (error) {
            console.error('\n%c❌ ERROR EN DIAGNÓSTICO', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
            console.error(error);
            throw error;
        }
    };
    
    console.log('\n%c✅ SCRIPT DE DIAGNÓSTICO LISTO', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
    console.log('\n💡 PARA EJECUTAR:');
    console.log('%c   await verificarYearEnFirebase()', 'background: #fbbf24; color: #000; padding: 8px; font-weight: bold;');
    console.log('\n');
    
})();
