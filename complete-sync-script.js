/**
 * 🔄 SCRIPT COMPLETO DE SINCRONIZACIÓN DESDE UI
 * 
 * Ejecuta ESTE script completo primero para crear las funciones.
 * Luego ejecuta: leerAsignacionesReales()
 */

console.log('🔄 CARGANDO FUNCIONES DE SINCRONIZACIÓN...');
console.log('==========================================');

function leerAsignacionesReales() {
    try {
        console.log('📖 LEYENDO ASIGNACIONES REALES DE LA INTERFAZ...');
        console.log('================================================');

        // Buscar elementos de estudiantes en la interfaz - múltiples selectores
        let studentRows = document.querySelectorAll('[data-student-id], .student-row, .estudiante-item');
        
        // Si no encuentra con esos selectores, busca otros patrones comunes
        if (studentRows.length === 0) {
            studentRows = document.querySelectorAll('tr, .user-item, .student-item, [class*="student"], [class*="user"]');
            console.log(`🔍 Usando selector amplio, encontradas ${studentRows.length} filas`);
        }
        
        if (studentRows.length === 0) {
            console.log('❌ No se encontraron filas de estudiantes en la página actual');
            console.log('💡 Asegúrate de estar en la página de Gestión de Usuarios → Estudiantes');
            console.log('📋 Elementos encontrados en la página:');
            
            // Mostrar algunos elementos para debugging
            const allElements = document.querySelectorAll('*');
            console.log(`Total elementos: ${allElements.length}`);
            
            return false;
        }

        console.log(`✅ Encontradas ${studentRows.length} filas potenciales`);

        const asignacionesReales = [];

        studentRows.forEach((row, index) => {
            try {
                // Buscar información del estudiante en la fila
                const textoCompleto = row.textContent || row.innerText || '';
                
                // Solo procesar si contiene información relevante
                if (!textoCompleto.includes('Básico') && !textoCompleto.includes('felipe') && !textoCompleto.includes('maria') && !textoCompleto.includes('sofia') && !textoCompleto.includes('karla') && !textoCompleto.includes('gustavo') && !textoCompleto.includes('max')) {
                    return; // Saltar esta fila
                }
                
                console.log(`\n${index + 1}. Analizando fila:`);
                console.log(`   Texto: "${textoCompleto.replace(/\s+/g, ' ').trim().substring(0, 150)}"`);
                
                // Extraer username - patrones más amplios
                let username = null;
                const usernameMatch = textoCompleto.match(/(felipe|maria|sofia|karla|gustavo|max)/i);
                if (usernameMatch) {
                    username = usernameMatch[1].toLowerCase();
                }

                // Extraer curso y sección - patrones más flexibles
                let curso = null;
                let seccion = null;
                
                // Buscar patrones como "5to Básico - B", "1ro Básico - A", etc.
                const cursoMatch = textoCompleto.match(/(\d+(?:ro|do|to)?\s+Básico)\s*-?\s*([A-Z])/i);
                if (cursoMatch) {
                    curso = cursoMatch[1].trim();
                    seccion = cursoMatch[2].trim();
                }
                
                // También buscar patrones como "4to Básico A" (sin guión)
                if (!curso || !seccion) {
                    const cursoMatch2 = textoCompleto.match(/(\d+(?:ro|do|to)?\s+Básico)\s+([A-Z])/i);
                    if (cursoMatch2) {
                        curso = cursoMatch2[1].trim();
                        seccion = cursoMatch2[2].trim();
                    }
                }

                if (username && curso && seccion) {
                    asignacionesReales.push({
                        username: username.toLowerCase(),
                        curso,
                        seccion,
                        textoOriginal: textoCompleto.substring(0, 100)
                    });
                    
                    console.log(`   ✅ ${username}: ${curso} - Sección ${seccion}`);
                } else {
                    if (username) {
                        console.log(`   ⚠️ ${username}: No se pudo extraer curso/sección completa`);
                        console.log(`     Curso: ${curso || 'No encontrado'}`);
                        console.log(`     Sección: ${seccion || 'No encontrada'}`);
                    }
                }
                
            } catch (error) {
                console.log(`   ❌ Error procesando fila ${index + 1}:`, error.message);
            }
        });

        console.log('\n📋 RESUMEN DE ASIGNACIONES DETECTADAS:');
        console.log('====================================');
        
        if (asignacionesReales.length === 0) {
            console.log('❌ No se detectaron asignaciones válidas');
            console.log('💡 Posibles soluciones:');
            console.log('1. Asegúrate de estar en la página de Gestión de Usuarios');
            console.log('2. Verifica que los estudiantes estén visibles en la página');
            console.log('3. Ejecuta manualmente: crearAsignacionesManualmente()');
            return false;
        }
        
        asignacionesReales.forEach((asignacion, index) => {
            console.log(`${index + 1}. ${asignacion.username}: ${asignacion.curso} - Sección ${asignacion.seccion}`);
        });

        // Guardar en variable global para fácil acceso
        window.asignacionesRealesDetectadas = asignacionesReales;
        
        console.log('\n💾 ASIGNACIONES GUARDADAS EXITOSAMENTE');
        console.log('Para aplicar estos cambios, ejecuta:');
        console.log('aplicarAsignacionesReales(window.asignacionesRealesDetectadas)');

        return asignacionesReales;

    } catch (error) {
        console.error('❌ Error leyendo asignaciones reales:', error);
        return false;
    }
}

function aplicarAsignacionesReales(asignacionesReales) {
    try {
        console.log('🔧 APLICANDO ASIGNACIONES REALES...');
        console.log('===================================');

        if (!asignacionesReales || asignacionesReales.length === 0) {
            console.log('❌ No hay asignaciones para aplicar');
            console.log('💡 Ejecuta primero: leerAsignacionesReales()');
            return false;
        }

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log(`📝 Aplicando ${asignacionesReales.length} asignaciones...`);

        let aplicadas = 0;

        asignacionesReales.forEach(asignacionReal => {
            const usuario = users.find(u => u.username === asignacionReal.username);
            if (!usuario) {
                console.log(`❌ Usuario ${asignacionReal.username} no encontrado en localStorage`);
                return;
            }

            // Buscar o crear curso
            let curso = courses.find(c => c.name === asignacionReal.curso);
            if (!curso) {
                curso = {
                    id: `curso-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: asignacionReal.curso,
                    description: `Curso ${asignacionReal.curso}`,
                    createdAt: new Date().toISOString(),
                    autoCreated: true
                };
                courses.push(curso);
                console.log(`➕ Curso creado: ${curso.name}`);
            }

            // Buscar o crear sección
            let seccion = sections.find(s => s.name === asignacionReal.seccion && s.courseId === curso.id);
            if (!seccion) {
                seccion = {
                    id: `seccion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: asignacionReal.seccion,
                    courseId: curso.id,
                    description: `Sección ${asignacionReal.seccion} de ${curso.name}`,
                    createdAt: new Date().toISOString(),
                    autoCreated: true
                };
                sections.push(seccion);
                console.log(`➕ Sección creada: ${seccion.name} para ${curso.name}`);
            }

            // Eliminar asignación anterior del estudiante
            studentAssignments = studentAssignments.filter(a => a.studentId !== usuario.id);

            // Crear nueva asignación
            const nuevaAsignacion = {
                id: `real-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                studentId: usuario.id,
                courseId: curso.id,
                sectionId: seccion.id,
                createdAt: new Date().toISOString(),
                syncedFromUI: true,
                source: 'gestion-usuarios-interfaz'
            };

            studentAssignments.push(nuevaAsignacion);

            // Actualizar perfil del usuario
            const cursoCompleto = `${curso.name} - Sección ${seccion.name}`;
            usuario.activeCourses = [cursoCompleto];

            console.log(`✅ ${usuario.username}: ${cursoCompleto}`);
            aplicadas++;
        });

        // Guardar todos los cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));

        console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA:`);
        console.log(`   Asignaciones aplicadas: ${aplicadas}`);
        console.log(`   Cursos en sistema: ${courses.length}`);
        console.log(`   Secciones en sistema: ${sections.length}`);
        console.log('\n💡 Recarga la página para ver los cambios');

        return true;

    } catch (error) {
        console.error('❌ Error aplicando asignaciones:', error);
        return false;
    }
}

function crearAsignacionesManualmente() {
    console.log('🔧 CREACIÓN MANUAL DE ASIGNACIONES');
    console.log('==================================');
    console.log('Si no se pudieron detectar automáticamente, usa esto:');
    console.log('');
    
    // Asignaciones basadas en la imagen que mostraste
    const asignacionesManual = [
        { username: 'felipe', curso: '4to Básico', seccion: 'A' },
        { username: 'maria', curso: '4to Básico', seccion: 'A' },
        { username: 'sofia', curso: '4to Básico', seccion: 'B' },
        { username: 'karla', curso: '4to Básico', seccion: 'B' },
        { username: 'gustavo', curso: '5to Básico', seccion: 'B' },
        { username: 'max', curso: '5to Básico', seccion: 'B' }
    ];
    
    console.log('📋 Asignaciones manuales disponibles:');
    asignacionesManual.forEach((asig, index) => {
        console.log(`${index + 1}. ${asig.username}: ${asig.curso} - Sección ${asig.seccion}`);
    });
    
    console.log('\n💾 Para aplicar estas asignaciones, ejecuta:');
    console.log('aplicarAsignacionesReales(' + JSON.stringify(asignacionesManual) + ')');
    
    window.asignacionesManual = asignacionesManual;
    console.log('\n💡 También guardadas en: window.asignacionesManual');
    console.log('Puedes ejecutar: aplicarAsignacionesReales(window.asignacionesManual)');
    
    return asignacionesManual;
}

// Mostrar estado inicial
console.log('✅ FUNCIONES CARGADAS EXITOSAMENTE');
console.log('==================================');
console.log('Funciones disponibles:');
console.log('- leerAsignacionesReales() - Leer desde interfaz');
console.log('- aplicarAsignacionesReales(asignaciones) - Aplicar cambios');
console.log('- crearAsignacionesManualmente() - Usar asignaciones predefinidas');
console.log('');
console.log('🎯 PRÓXIMO PASO: Ejecuta leerAsignacionesReales()');
