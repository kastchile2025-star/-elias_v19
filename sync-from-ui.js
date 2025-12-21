/**
 * 🔄 SINCRONIZACIÓN FORZADA DESDE GESTIÓN DE USUARIOS
 * 
 * Este script lee los datos directamente desde la interfaz de gestión
 * y actualiza localStorage para que coincida.
 */

console.log('🔄 SINCRONIZACIÓN FORZADA DESDE GESTIÓN...');
console.log('==========================================');

function sincronizarDesdeGestion() {
    try {
        console.log('🎯 PASO 1: Ir a Gestión de Usuarios primero');
        console.log('=========================================');
        console.log('Necesitas estar en la página de Gestión de Usuarios para que este script funcione.');
        console.log('Ve a: Dashboard → Gestión Usuarios → Estudiantes');
        console.log('');
        console.log('Una vez ahí, ejecuta: leerAsignacionesReales()');
        
        return false;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

function leerAsignacionesReales() {
    try {
        console.log('📖 LEYENDO ASIGNACIONES REALES DE LA INTERFAZ...');
        console.log('================================================');

        // Buscar elementos de estudiantes en la interfaz
        const studentRows = document.querySelectorAll('[data-student-id], .student-row, .estudiante-item');
        
        if (studentRows.length === 0) {
            console.log('❌ No se encontraron filas de estudiantes en la página actual');
            console.log('💡 Asegúrate de estar en la página de Gestión de Usuarios → Estudiantes');
            return false;
        }

        console.log(`✅ Encontradas ${studentRows.length} filas de estudiantes`);

        const asignacionesReales = [];

        studentRows.forEach((row, index) => {
            try {
                // Buscar información del estudiante en la fila
                const usernameElement = row.querySelector('[data-username], .username, .student-username');
                const courseElement = row.querySelector('[data-course], .course, .curso');
                const sectionElement = row.querySelector('[data-section], .section, .seccion');
                
                // También buscar en texto
                const textoCompleto = row.textContent || row.innerText || '';
                
                console.log(`\n${index + 1}. Analizando fila:`);
                console.log(`   Texto completo: "${textoCompleto.replace(/\s+/g, ' ').trim()}"`);
                
                // Extraer username
                let username = null;
                if (usernameElement) {
                    username = usernameElement.textContent?.trim();
                } else {
                    // Buscar patrones comunes de username
                    const usernameMatch = textoCompleto.match(/(felipe|maria|sofia|karla|gustavo|max)/i);
                    if (usernameMatch) {
                        username = usernameMatch[1].toLowerCase();
                    }
                }

                // Extraer curso y sección
                let curso = null;
                let seccion = null;
                
                if (courseElement) {
                    curso = courseElement.textContent?.trim();
                }
                if (sectionElement) {
                    seccion = sectionElement.textContent?.trim();
                }
                
                // Si no encontró en elementos específicos, buscar en texto
                if (!curso || !seccion) {
                    // Buscar patrones como "5to Básico - B" o "1ro Básico - A"
                    const cursoMatch = textoCompleto.match(/(\d+(?:ro|do|to)?\s+Básico)\s*-?\s*([A-Z])/i);
                    if (cursoMatch) {
                        curso = cursoMatch[1];
                        seccion = cursoMatch[2];
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
                    console.log(`   ⚠️ No se pudo extraer información completa`);
                    console.log(`   Username: ${username || 'No encontrado'}`);
                    console.log(`   Curso: ${curso || 'No encontrado'}`);
                    console.log(`   Sección: ${seccion || 'No encontrada'}`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error procesando fila ${index + 1}:`, error.message);
            }
        });

        console.log('\n📋 RESUMEN DE ASIGNACIONES DETECTADAS:');
        console.log('====================================');
        asignacionesReales.forEach((asignacion, index) => {
            console.log(`${index + 1}. ${asignacion.username}: ${asignacion.curso} - Sección ${asignacion.seccion}`);
        });

        if (asignacionesReales.length > 0) {
            console.log('\n💾 Para aplicar estos cambios, ejecuta:');
            console.log('aplicarAsignacionesReales(' + JSON.stringify(asignacionesReales) + ')');
            
            // Guardar en variable global para fácil acceso
            window.asignacionesRealesDetectadas = asignacionesReales;
            console.log('\n💡 También guardadas en: window.asignacionesRealesDetectadas');
            console.log('Puedes ejecutar: aplicarAsignacionesReales(window.asignacionesRealesDetectadas)');
        }

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

// Información para el usuario
sincronizarDesdeGestion();

console.log('\n💡 COMANDOS DISPONIBLES:');
console.log('========================');
console.log('- leerAsignacionesReales() - Leer desde interfaz de gestión');
console.log('- aplicarAsignacionesReales(asignaciones) - Aplicar cambios a localStorage');
