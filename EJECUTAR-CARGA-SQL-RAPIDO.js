/**
 * 🚀 CARGA RÁPIDA DE CALIFICACIONES A FIREBASE - EJECUTAR EN CONSOLA
 * Smart Student v17 - Módulo Admin
 * 
 * INSTRUCCIONES:
 * 1. Abrir Admin → Carga Masiva (ya lo tienes abierto)
 * 2. Abrir Consola del Navegador (F12)
 * 3. Copiar y pegar este script completo
 * 4. Ejecutar: await cargarCalificacionesRapido()
 */

(async function() {
    'use strict';
    
    console.log('%c🚀 CARGA RÁPIDA A FIREBASE', 'background: #ff6b35; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    // ==================== CONFIGURACIÓN ====================
    
    const CONFIG = {
        COLECCION: 'grades',
        LOTE_SIZE: 50,
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
    
    function buscarProfesor(asignatura, curso, seccion, usuarios) {
        const codigo = ASIGNATURAS[asignatura] || asignatura;
        return usuarios.find(u => 
            u.role === 'teacher' && 
            u.subjects?.includes(codigo) &&
            u.courseAssignments?.some(ca => ca.course === curso && ca.section === seccion)
        );
    }
    
    // ==================== FUNCIÓN PRINCIPAL ====================
    
    window.cargarCalificacionesRapido = async function() {
        console.log('\n📋 Iniciando proceso de carga...\n');
        
        try {
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
            
            const contenido = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(archivo);
            });
            
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
            
            // PASO 4: Transformar datos
            console.log('\n🔄 PASO 4: Transformando datos para SQL...');
            
            const calificacionesSQL = [];
            const errores = [];
            
            calificacionesCSV.forEach((cal, idx) => {
                try {
                    const estudiante = buscarEstudiante(cal.rut, usuarios);
                    if (!estudiante) {
                        errores.push(`Línea ${idx + 2}: Estudiante no encontrado - ${cal.nombre} (${cal.rut})`);
                        return;
                    }
                    
                    const profesor = buscarProfesor(cal.asignatura, cal.curso, cal.seccion, usuarios);
                    if (!profesor) {
                        errores.push(`Línea ${idx + 2}: Profesor no encontrado - ${cal.asignatura} en ${cal.curso} ${cal.seccion}`);
                        return;
                    }
                    
                    const codigoAsignatura = ASIGNATURAS[cal.asignatura] || cal.asignatura;
                    const tipo = cal.tipo?.toLowerCase() === 'tarea' ? 'assignment' : 'evaluation';
                    
                    calificacionesSQL.push({
                        id: `grade-${estudiante.id}-${codigoAsignatura}-${cal.fecha}-${Date.now()}-${idx}`,
                        student_id: estudiante.id,
                        student_rut: cal.rut,
                        student_name: cal.nombre,
                        teacher_id: profesor.id,
                        teacher_name: profesor.name,
                        course: cal.curso,
                        section: cal.seccion,
                        subject: codigoAsignatura,
                        subject_name: cal.asignatura,
                        activity_type: tipo,
                        activity_id: `activity-${codigoAsignatura}-${cal.curso}-${cal.seccion}-${cal.tipo}-${cal.fecha}`,
                        grade: parseFloat(cal.nota),
                        max_grade: 100,
                        percentage: parseFloat(cal.nota),
                        date: cal.fecha,
                        graded_at: new Date(cal.fecha).toISOString(),
                        semester: cal.fecha < '2025-07-01' ? 1 : 2,
                        year: CONFIG.YEAR,
                        status: 'graded',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                } catch (err) {
                    errores.push(`Línea ${idx + 2}: ${err.message}`);
                }
            });
            
            console.log(`✅ Transformados: ${calificacionesSQL.length} registros`);
            if (errores.length > 0) {
                console.warn(`⚠️ Errores: ${errores.length}`);
                errores.slice(0, 5).forEach(e => console.warn(`   ${e}`));
                if (errores.length > 5) console.warn(`   ... y ${errores.length - 5} más`);
            }
            
            if (calificacionesSQL.length === 0) {
                throw new Error('❌ No se pudo procesar ninguna calificación');
            }
            
            // PASO 5: Confirmar
            console.log(`\n⚠️ PASO 5: Confirmación`);
            console.log(`   Se cargarán ${calificacionesSQL.length} calificaciones a SQL`);
            
            if (!confirm(`¿Continuar con la carga de ${calificacionesSQL.length} calificaciones?`)) {
                console.log('❌ Cancelado por el usuario');
                return;
            }
            
            // PASO 6: Conectar a Supabase
            console.log('\n🔌 PASO 6: Conectando a Supabase...');
            
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm');
            const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
            
            console.log('✅ Conectado a Supabase');
            
            // PASO 7: Cargar en lotes
            console.log(`\n📦 PASO 7: Cargando a SQL (${Math.ceil(calificacionesSQL.length / CONFIG.LOTE_SIZE)} lotes)...\n`);
            
            let exitosos = 0;
            let fallidos = 0;
            
            for (let i = 0; i < calificacionesSQL.length; i += CONFIG.LOTE_SIZE) {
                const lote = calificacionesSQL.slice(i, i + CONFIG.LOTE_SIZE);
                const numLote = Math.floor(i / CONFIG.LOTE_SIZE) + 1;
                const totalLotes = Math.ceil(calificacionesSQL.length / CONFIG.LOTE_SIZE);
                
                process.stdout?.write?.(`   Lote ${numLote}/${totalLotes}... `) || console.log(`   Lote ${numLote}/${totalLotes}...`);
                
                const { error } = await supabase.from(CONFIG.TABLA).upsert(lote, { onConflict: 'id' });
                
                if (error) {
                    console.log(`❌ Error`);
                    fallidos += lote.length;
                } else {
                    console.log(`✅ OK (${lote.length} registros)`);
                    exitosos += lote.length;
                }
                
                await new Promise(r => setTimeout(r, 300));
            }
            
            // PASO 8: Verificar
            console.log('\n🔍 PASO 8: Verificando carga...');
            
            const { count } = await supabase
                .from(CONFIG.TABLA)
                .select('*', { count: 'exact', head: true })
                .eq('year', CONFIG.YEAR);
            
            console.log(`✅ Total en SQL para ${CONFIG.YEAR}: ${count} registros`);
            
            // RESUMEN
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 RESUMEN FINAL', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
            console.log('='.repeat(60));
            console.table({
                'CSV Leídos': calificacionesCSV.length,
                'Transformados': calificacionesSQL.length,
                'Cargados exitosamente': exitosos,
                'Fallidos': fallidos,
                'Errores transformación': errores.length,
                'Total en SQL 2025': count
            });
            
            if (exitosos > 0) {
                console.log('\n%c✅ ¡CARGA COMPLETADA!', 'background: #10b981; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
                console.log('\n📍 Próximos pasos:');
                console.log('   1. Haz clic en "Actualizar" en la interfaz');
                console.log('   2. Verifica que aparezcan las calificaciones en la sección SQL');
                console.log('   3. Prueba como profesor/estudiante para ver las calificaciones');
            }
            
            return { exitosos, fallidos, errores, total: count };
            
        } catch (error) {
            console.error('\n%c❌ ERROR', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
            console.error(error);
            throw error;
        }
    };
    
    // ==================== FUNCIÓN DE VERIFICACIÓN ====================
    
    window.verificarCalificacionesSQL = async function() {
        console.log('\n🔍 Verificando calificaciones en SQL...\n');
        
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm');
        const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        
        const { data, count } = await supabase
            .from(CONFIG.TABLA)
            .select('*', { count: 'exact' })
            .eq('year', CONFIG.YEAR)
            .limit(10);
        
        console.log(`Total de calificaciones 2025: ${count}`);
        
        if (data && data.length > 0) {
            console.log('\nMuestra de registros:');
            console.table(data.map(d => ({
                estudiante: d.student_name,
                curso: `${d.course} ${d.section}`,
                asignatura: d.subject_name,
                nota: d.grade,
                fecha: d.date
            })));
        }
        
        // Estadísticas por curso
        const porCurso = {};
        data?.forEach(d => {
            const key = `${d.course} ${d.section}`;
            porCurso[key] = (porCurso[key] || 0) + 1;
        });
        
        if (Object.keys(porCurso).length > 0) {
            console.log('\nPor curso/sección:');
            console.table(porCurso);
        }
    };
    
    // ==================== FUNCIÓN DE LIMPIEZA ====================
    
    window.limpiarCalificacionesSQL = async function() {
        console.log('\n🧹 LIMPIEZA DE CALIFICACIONES SQL\n');
        
        if (!confirm('⚠️ ¿Estás seguro de querer BORRAR todas las calificaciones de 2025 de SQL?')) {
            console.log('❌ Cancelado');
            return;
        }
        
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm');
        const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        
        console.log('Borrando...');
        
        const { error } = await supabase
            .from(CONFIG.TABLA)
            .delete()
            .eq('year', CONFIG.YEAR);
        
        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ Calificaciones de 2025 eliminadas');
        }
    };
    
    // ==================== INICIALIZACIÓN ====================
    
    console.log('\n%c✅ SISTEMA LISTO', 'background: #3b82f6; color: white; padding: 8px; font-weight: bold;');
    console.log('\n🎯 FUNCIONES DISPONIBLES:\n');
    console.log('%c   await cargarCalificacionesRapido()', 'color: #3b82f6; font-weight: bold;');
    console.log('   └─ Carga las calificaciones desde CSV a SQL\n');
    console.log('%c   await verificarCalificacionesSQL()', 'color: #10b981; font-weight: bold;');
    console.log('   └─ Muestra las calificaciones en SQL\n');
    console.log('%c   await limpiarCalificacionesSQL()', 'color: #ef4444; font-weight: bold;');
    console.log('   └─ Borra todas las calificaciones de 2025 (¡cuidado!)\n');
    
    console.log('\n💡 PARA EMPEZAR, EJECUTA:');
    console.log('%c   await cargarCalificacionesRapido()', 'background: #fbbf24; color: #000; padding: 8px; font-weight: bold;');
    console.log('\n');
    
})();
