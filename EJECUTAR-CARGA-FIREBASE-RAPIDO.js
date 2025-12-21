/**
 * 🔥 CARGA RÁPIDA DE CALIFICACIONES A FIREBASE - EJECUTAR EN CONSOLA
 * Smart Student v17 - Módulo Admin
 * 
 * INSTRUCCIONES:
 * 1. Abrir Admin → Carga Masiva (ya lo tienes abierto)
 * 2. Abrir Consola del Navegador (F12)
 * 3. Copiar y pegar este script completo
 * 4. Ejecutar: await cargarCalificacionesFirebase()
 */

(async function() {
    'use strict';
    
    console.log('%c🔥 CARGA RÁPIDA A FIREBASE', 'background: #ff6b35; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    // ==================== CONFIGURACIÓN ====================
    
    const CONFIG = {
        COLECCION: 'grades',
        LOTE_SIZE: 500, // Firebase permite hasta 500 operaciones por lote
        YEAR: 2025
    };
    
    const ASIGNATURAS = {
        'Lenguaje y Comunicación': 'LEN',
        'Matemáticas': 'MAT',
        'Ciencias Naturales': 'CNT',
        'Historia y Geografía': 'HIS',
        'Biología': 'BIO',
        'Física': 'FIS',
        'Química': 'QUI',
        'Filosofía': 'FIL',
        'Educación Ciudadana': 'EDC'
    };
    
    // ==================== FUNCIONES AUXILIARES ====================

    // Normaliza strings: quita tildes, pasa a minúsculas y colapsa espacios
    function norm(str = '') {
        return String(str)
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }
    
    function parsearCSV(texto) {
        const lineas = texto.trim().split('\n');
        const headers = lineas[0].split(',').map(h => h.trim());
        
        return lineas.slice(1).filter(l => l.trim()).map(linea => {
            const valores = linea.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h] = valores[i]?.trim() || '');
            return obj;
        });
    }
    
    function buscarEstudiante(rut, usuarios) {
        const rutLimpio = rut.replace(/[.-]/g, '').toLowerCase();
        return usuarios.find(u => 
            u.rut && u.rut.replace(/[.-]/g, '').toLowerCase() === rutLimpio && u.role === 'student'
        );
    }
    
    function buscarProfesor(asignatura, curso, seccion, usuarios, mapAsignaturas) {
        const codigo = mapAsignaturas[norm(asignatura)] || asignatura;

        // Normaliza curso a forma canónica: "<numero> basico|medio"
        const normCurso = (s='') => {
            const base = norm(s).replace(/[º°]/g, '').replace(/\b(ro|do|to|ero)\b/g, '');
            const m = base.match(/(\d{1,2}).*(basico|medio)/);
            if (m) return `${m[1]} ${m[2]}`;
            return base; // fallback
        };

        const cursoN = normCurso(curso);
        const seccionN = norm(seccion);

        // 1) Coincidencia estricta: asignatura + curso + sección
        let prof = usuarios.find(u =>
            u.role === 'teacher' &&
            (u.subjects?.includes(codigo) || u.subjects?.includes(norm(asignatura)) || u.subjects?.includes(asignatura)) &&
            u.courseAssignments?.some(ca => normCurso(ca.course) === cursoN && norm(ca.section) === seccionN)
        );
        if (prof) return prof;

        // 2) Asignatura + curso (ignora sección)
        prof = usuarios.find(u =>
            u.role === 'teacher' &&
            (u.subjects?.includes(codigo) || u.subjects?.includes(norm(asignatura)) || u.subjects?.includes(asignatura)) &&
            u.courseAssignments?.some(ca => normCurso(ca.course) === cursoN)
        );
        if (prof) return prof;

        // 3) Solo asignatura (último recurso)
        prof = usuarios.find(u => u.role === 'teacher' && (u.subjects?.includes(codigo) || u.subjects?.includes(norm(asignatura)) || u.subjects?.includes(asignatura)));
        return prof || null;
    }

    // Lee el archivo con la mejor decodificación disponible (UTF-8 o Windows-1252)
    async function leerArchivoTextoRobusto(file) {
        // Leemos como ArrayBuffer una sola vez
        const buffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
        const utf8 = new TextDecoder('utf-8').decode(buffer);
        const win1252 = new TextDecoder('windows-1252').decode(buffer);
        const score = s => (s.match(/[�]/g)?.length || 0) + (s.match(/Ã|Â|¡|¢|£|¤/g)?.length || 0);
        return score(utf8) <= score(win1252) ? utf8 : win1252;
    }
    
    // ==================== OBTENER FIREBASE ====================
    
    async function obtenerFirebase() {
        // Intentar obtener Firebase desde window
        if (window.firebase && window.firebase.firestore) {
            console.log('✅ Firebase ya está cargado en window');
            return window.firebase;
        }
        
        // Intentar cargar Firebase desde CDN
        console.log('📦 Cargando Firebase desde CDN...');
        
        // Cargar Firebase App
        if (!window.firebase) {
            await cargarScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
        }
        
        // Cargar Firestore
        if (!window.firebase.firestore) {
            await cargarScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
        }
        
        console.log('✅ Firebase cargado desde CDN');
        return window.firebase;
    }
    
    function cargarScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Herramienta de diagnóstico para buscar profesores según distintos niveles de tolerancia
    window.debugBuscarProfesor = function(asignatura, curso, seccion) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const MAP_ASIG = Object.fromEntries(Object.entries(ASIGNATURAS).map(([k, v]) => [norm(k), v]));
            const codigo = MAP_ASIG[norm(asignatura)] || asignatura;
            const normCurso = (s='') => {
                const base = norm(s).replace(/[º°]/g, '').replace(/\b(ro|do|to|ero)\b/g, '');
                const m = base.match(/(\d{1,2}).*(basico|medio)/);
                return m ? `${m[1]} ${m[2]}` : base;
            };
            const cN = normCurso(curso); const sN = norm(seccion);
            const teachers = usuarios.filter(u => u.role === 'teacher');
            const t1 = teachers.filter(u => (u.subjects?.includes(codigo) || u.subjects?.includes(norm(asignatura)) || u.subjects?.includes(asignatura)) && u.courseAssignments?.some(ca => normCurso(ca.course) === cN && norm(ca.section) === sN));
            const t2 = teachers.filter(u => (u.subjects?.includes(codigo) || u.subjects?.includes(norm(asignatura)) || u.subjects?.includes(asignatura)) && u.courseAssignments?.some(ca => normCurso(ca.course) === cN));
            const t3 = teachers.filter(u => (u.subjects?.includes(codigo) || u.subjects?.includes(norm(asignatura)) || u.subjects?.includes(asignatura)));
            console.log('🔎 debugBuscarProfesor:', { asignatura, codigoUsado: codigo, curso, cursoNormalizado: cN, seccion, seccionNorm: sN, t1: t1.map(t=>t.name), t2: t2.map(t=>t.name), t3: t3.map(t=>t.name) });
            return { t1, t2, t3 };
        } catch (e) {
            console.error('debugBuscarProfesor error:', e);
        }
    };
    
    // ==================== FUNCIÓN PRINCIPAL ====================
    
    window.cargarCalificacionesFirebase = async function() {
        console.log('\n📋 Iniciando proceso de carga a Firebase...\n');
        
        try {
            // PASO 0: Verificar Firebase
            console.log('🔍 PASO 0: Verificando Firebase...');
            
            const firebase = await obtenerFirebase();
            
            // Verificar si Firebase está inicializado
            let db;
            if (!firebase.apps || firebase.apps.length === 0) {
                console.log('⚠️ Firebase no está inicializado. Inicializando...');
                
                // 1) Si existe en ventana una configuración explícita, úsala
                //    Puedes definirla en consola ANTES de ejecutar la carga con:
                //    window.SMART_STUDENT_FIREBASE_CONFIG = { ...config de tu app web de Firebase... }
                // 2) Si no existe, usamos la configuración por defecto del proyecto Superjf1234
                const defaultConfig = {
                    apiKey: "AIzaSyCX9xW0DwSf-5B9au4NmK3Qc2qF9Vtx1Co",
                    authDomain: "superjf1234-e9cbc.firebaseapp.com",
                    projectId: "superjf1234-e9cbc",
                    // storageBucket opcional para Firestore
                    messagingSenderId: "742753294911",
                    appId: "1:742753294911:web:010940c0a3c4ba5ae6768a"
                };

                const firebaseConfig = window.SMART_STUDENT_FIREBASE_CONFIG || defaultConfig;
                console.log('🔧 Config Firebase usada:',
                    window.SMART_STUDENT_FIREBASE_CONFIG ? 'SMAR_STUDENT_FIREBASE_CONFIG (custom)' : 'Default Superjf1234');

                firebase.initializeApp(firebaseConfig);
            }
            
            db = firebase.firestore();
            console.log('✅ Firestore conectado\n');
            
            // PASO 1: Solicitar archivo CSV
            console.log('📂 PASO 1: Selecciona el archivo CSV de calificaciones');
            
            const archivo = await new Promise((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = e => {
                    if (e.target.files[0]) resolve(e.target.files[0]);
                    else reject(new Error('No se seleccionó archivo'));
                };
                input.click();
            });
            
            console.log(`✅ Archivo seleccionado: ${archivo.name}`);
            
            // PASO 2: Leer archivo
            console.log('\n📖 PASO 2: Leyendo archivo...');
            
            const contenido = await leerArchivoTextoRobusto(archivo);
            
            const calificacionesCSV = parsearCSV(contenido);
            console.log(`✅ ${calificacionesCSV.length} registros leídos del CSV`);
            
            // PASO 3: Cargar usuarios
            console.log('\n👥 PASO 3: Cargando usuarios del sistema...');
            
            const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
            const estudiantes = usuarios.filter(u => u.role === 'student');
            const profesores = usuarios.filter(u => u.role === 'teacher');
            
            console.log(`✅ Usuarios: ${usuarios.length} (${estudiantes.length} estudiantes, ${profesores.length} profesores)`);
            
            if (usuarios.length === 0) {
                throw new Error('❌ No hay usuarios en el sistema. Carga primero el archivo users-consolidated-2025-CORREGIDO.csv');
            }
            
            // Preparar mapa de asignaturas normalizadas → código
            const MAP_ASIG = Object.fromEntries(
                Object.entries(ASIGNATURAS).map(([k, v]) => [norm(k), v])
            );

            // PASO 4: Transformar datos
            console.log('\n🔄 PASO 4: Transformando datos para Firebase...');
            
            // Función para normalizar nombres de cursos a formato estándar
            const normCurso = (s='') => {
                const base = norm(s).replace(/[º°]/g, '').replace(/\b(ro|do|to|ero)\b/g, '');
                const m = base.match(/(\d{1,2}).*(basico|medio)/);
                if (m) return `${m[1]} ${m[2]}`;
                return base; // fallback
            };
            
            const calificacionesFirebase = [];
            const errores = [];
            
            calificacionesCSV.forEach((cal, idx) => {
                try {
                    const estudiante = buscarEstudiante(cal.rut, usuarios);
                    if (!estudiante) {
                        errores.push(`Línea ${idx + 2}: Estudiante no encontrado - ${cal.nombre} (${cal.rut})`);
                        return;
                    }
                    
                    const profesor = buscarProfesor(cal.asignatura, cal.curso, cal.seccion, usuarios, MAP_ASIG);
                    if (!profesor) {
                        errores.push(`Línea ${idx + 2}: Profesor no encontrado - ${cal.asignatura} en ${cal.curso} ${cal.seccion}`);
                        return;
                    }
                    
                    const codigoAsignatura = MAP_ASIG[norm(cal.asignatura)] || cal.asignatura;
                    const tipo = cal.tipo?.toLowerCase() === 'tarea' ? 'assignment' : 'evaluation';
                    
                    // Buscar courseId y sectionId desde assignments del estudiante
                    const assignment = estudiante.courseAssignments?.find(ca => 
                        normCurso(ca.course) === normCurso(cal.curso) && 
                        norm(ca.section) === norm(cal.seccion)
                    );
                    
                    if (!assignment || !assignment.courseId || !assignment.sectionId) {
                        errores.push(`Línea ${idx + 2}: No se encontró courseId/sectionId para ${cal.curso} ${cal.seccion}`);
                        return;
                    }
                    
                    const docId = `grade-${estudiante.id}-${codigoAsignatura}-${cal.fecha}-${Date.now()}-${idx}`;
                    
                    calificacionesFirebase.push({
                        id: docId,
                        studentId: estudiante.id,
                        studentRut: cal.rut,
                        studentName: cal.nombre,
                        teacherId: profesor.id,
                        teacherName: profesor.name,
                        course: cal.curso,
                        section: cal.seccion,
                        courseId: assignment.courseId,
                        sectionId: assignment.sectionId,
                        subject: codigoAsignatura,
                        subjectName: cal.asignatura,
                        activityType: tipo,
                        activityId: `activity-${codigoAsignatura}-${assignment.courseId}-${assignment.sectionId}-${cal.tipo}-${cal.fecha}`,
                        grade: parseFloat(cal.nota),
                        maxGrade: 100,
                        percentage: parseFloat(cal.nota),
                        date: cal.fecha,
                        // ✅ Parser robusto DD-MM-YYYY / DD/MM/YYYY para conservar día local
                        gradedAt: (() => {
                            const raw = cal.fecha || cal.Fecha || cal.gradedAt;
                            const parseCsvDayFirst = (s) => {
                                if (!s || typeof s !== 'string') return null;
                                const t = s.trim();
                                if (t.includes('T')) return null; // ya ISO
                                const m = t.match(/^([0-9]{1,2})[\/-]([0-9]{1,2})[\/-]([0-9]{4})$/);
                                if (!m) return null;
                                const d = +m[1]; const mo = +m[2]; const y = +m[3];
                                if (!(d>=1&&d<=31&&mo>=1&&mo<=12)) return null;
                                // Mediodía local evita desfase día anterior por timezone
                                return new Date(y, mo-1, d, 12, 0, 0, 0);
                            };
                            let dt = parseCsvDayFirst(raw);
                            if (!dt) {
                                // Intentar parse directo y si falla usar fecha actual
                                const direct = new Date(raw);
                                dt = isNaN(direct.getTime()) ? new Date() : direct;
                            }
                            return firebase.firestore.Timestamp.fromDate(dt);
                        })(),
                        semester: cal.fecha < '2025-07-01' ? 1 : 2,
                        year: CONFIG.YEAR,
                        status: 'graded',
                        createdAt: firebase.firestore.Timestamp.now(),
                        updatedAt: firebase.firestore.Timestamp.now()
                    });
                } catch (err) {
                    errores.push(`Línea ${idx + 2}: ${err.message}`);
                }
            });
            
            console.log(`✅ Transformados: ${calificacionesFirebase.length} registros`);
            if (errores.length > 0) {
                console.warn(`⚠️ Errores: ${errores.length}`);
                errores.slice(0, 5).forEach(e => console.warn(`   ${e}`));
                if (errores.length > 5) console.warn(`   ... y ${errores.length - 5} más`);
            }
            
            if (calificacionesFirebase.length === 0) {
                throw new Error('❌ No se pudo procesar ninguna calificación');
            }
            
            // PASO 5: Confirmar
            console.log(`\n⚠️ PASO 5: Confirmación`);
            console.log(`   Se cargarán ${calificacionesFirebase.length} calificaciones a Firebase`);
            
            if (!confirm(`¿Continuar con la carga de ${calificacionesFirebase.length} calificaciones a Firebase?`)) {
                console.log('❌ Cancelado por el usuario');
                return;
            }
            
            // PASO 6: Cargar en lotes
            console.log(`\n🔥 PASO 6: Cargando a Firebase (${Math.ceil(calificacionesFirebase.length / CONFIG.LOTE_SIZE)} lotes)...\n`);
            
            let exitosos = 0;
            let fallidos = 0;
            
            for (let i = 0; i < calificacionesFirebase.length; i += CONFIG.LOTE_SIZE) {
                const lote = calificacionesFirebase.slice(i, i + CONFIG.LOTE_SIZE);
                const numLote = Math.floor(i / CONFIG.LOTE_SIZE) + 1;
                const totalLotes = Math.ceil(calificacionesFirebase.length / CONFIG.LOTE_SIZE);
                
                console.log(`   Lote ${numLote}/${totalLotes} (${lote.length} registros)...`);
                
                try {
                    // Usar batch de Firebase
                    const batch = db.batch();
                    
                    lote.forEach(cal => {
                        const docRef = db.collection(CONFIG.COLECCION).doc(cal.id);
                        batch.set(docRef, cal);
                    });
                    
                    await batch.commit();
                    
                    exitosos += lote.length;
                    console.log(`   ✅ Lote ${numLote} cargado exitosamente`);
                    
                } catch (error) {
                    console.error(`   ❌ Error en lote ${numLote}:`, error.message);
                    fallidos += lote.length;
                }
                
                // Pequeña pausa entre lotes
                await new Promise(r => setTimeout(r, 300));
            }
            
            // PASO 7: Verificar
            console.log('\n🔍 PASO 7: Verificando carga en Firebase...');
            
            const snapshot = await db.collection(CONFIG.COLECCION)
                .where('year', '==', CONFIG.YEAR)
                .get();
            
            const totalEnFirebase = snapshot.size;
            console.log(`✅ Total en Firebase para ${CONFIG.YEAR}: ${totalEnFirebase} registros`);
            
            // RESUMEN
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 RESUMEN FINAL', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
            console.log('='.repeat(60));
            console.table({
                'CSV Leídos': calificacionesCSV.length,
                'Transformados': calificacionesFirebase.length,
                'Cargados exitosamente': exitosos,
                'Fallidos': fallidos,
                'Errores transformación': errores.length,
                'Total en Firebase 2025': totalEnFirebase
            });
            
            if (exitosos > 0) {
                console.log('\n%c✅ ¡CARGA COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
                console.log('\n📍 Próximos pasos:');
                console.log('   1. Haz clic en "Actualizar" en la interfaz');
                console.log('   2. Verifica que aparezcan las calificaciones en Firebase');
                console.log('   3. Prueba como profesor/estudiante para ver las calificaciones');
            }
            
            return { exitosos, fallidos, errores, total: totalEnFirebase };
            
        } catch (error) {
            console.error('\n%c❌ ERROR', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
            console.error(error);
            throw error;
        }
    };
    
    // ==================== FUNCIÓN DE VERIFICACIÓN ====================
    
    window.verificarCalificacionesFirebase = async function() {
        console.log('\n🔍 Verificando calificaciones en Firebase...\n');
        
        const firebase = await obtenerFirebase();
        const db = firebase.firestore();
        
        const snapshot = await db.collection(CONFIG.COLECCION)
            .where('year', '==', CONFIG.YEAR)
            .limit(10)
            .get();
        
        console.log(`Total de calificaciones 2025 en Firebase: ${snapshot.size}`);
        
        if (!snapshot.empty) {
            const muestra = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                muestra.push({
                    estudiante: data.studentName,
                    curso: `${data.course} ${data.section}`,
                    asignatura: data.subjectName,
                    nota: data.grade,
                    fecha: data.date
                });
            });
            
            console.log('\nMuestra de registros:');
            console.table(muestra);
        }
    };
    
    // ==================== FUNCIÓN DE LIMPIEZA ====================
    
    window.limpiarCalificacionesFirebase = async function() {
        console.log('\n🧹 LIMPIEZA DE CALIFICACIONES FIREBASE\n');
        
        if (!confirm('⚠️ ¿Estás seguro de querer BORRAR todas las calificaciones de 2025 de Firebase?')) {
            console.log('❌ Cancelado');
            return;
        }
        
        const firebase = await obtenerFirebase();
        const db = firebase.firestore();
        
        console.log('Consultando documentos...');
        
        const snapshot = await db.collection(CONFIG.COLECCION)
            .where('year', '==', CONFIG.YEAR)
            .get();
        
        console.log(`Encontrados ${snapshot.size} documentos. Borrando...`);
        
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        console.log('✅ Calificaciones de 2025 eliminadas de Firebase');
    };
    
    // ==================== INICIALIZACIÓN ====================
    
    console.log('\n%c✅ SISTEMA LISTO', 'background: #ff6b35; color: white; padding: 8px; font-weight: bold;');
    console.log('\n🎯 FUNCIONES DISPONIBLES:\n');
    console.log('%c   await cargarCalificacionesFirebase()', 'color: #ff6b35; font-weight: bold;');
    console.log('   └─ Carga las calificaciones desde CSV a Firebase\n');
    console.log('%c   await verificarCalificacionesFirebase()', 'color: #10b981; font-weight: bold;');
    console.log('   └─ Muestra las calificaciones en Firebase\n');
    console.log('%c   await limpiarCalificacionesFirebase()', 'color: #ef4444; font-weight: bold;');
    console.log('   └─ Borra todas las calificaciones de 2025 (¡cuidado!)\n');
    
    console.log('\n💡 PARA EMPEZAR, EJECUTA:');
    console.log('%c   await cargarCalificacionesFirebase()', 'background: #fbbf24; color: #000; padding: 8px; font-weight: bold;');
    console.log('\n');
    
})();
