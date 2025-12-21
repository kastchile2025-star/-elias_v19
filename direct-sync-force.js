/**
 * 🔥 SINCRONIZACIÓN DIRECTA Y FORZADA
 * 
 * Este script aplica cambios INMEDIATAMENTE basándose en los datos
 * mostrados en Gestión de Usuarios, forzando la actualización completa.
 */

console.log('🔥 SINCRONIZACIÓN DIRECTA Y FORZADA...');
console.log('====================================');

// Función para aplicar cambios EXACTOS basados en lo que viste en gestión
function aplicarCambiosDirectos() {
    try {
        console.log('🎯 APLICANDO CAMBIOS DIRECTOS...');
        console.log('===============================');

        // DATOS EXACTOS según la imagen de gestión de usuarios que mostraste
        const cambiosExactos = [
            { username: 'gustavo', curso: '2do Medio', seccion: 'A' },
            { username: 'max', curso: '2do Medio', seccion: 'A' }
        ];

        console.log('📋 CAMBIOS A APLICAR:');
        cambiosExactos.forEach((cambio, index) => {
            console.log(`${index + 1}. ${cambio.username} → ${cambio.curso} - Sección ${cambio.seccion}`);
        });

        // Leer datos actuales
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        let sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('\n🔍 ESTADO ANTES:');
        cambiosExactos.forEach(cambio => {
            const user = users.find(u => u.username === cambio.username);
            if (user) {
                const cursoActual = user.activeCourses?.[0] || 'Sin curso';
                console.log(`👤 ${cambio.username}: ${cursoActual}`);
            }
        });

        let cambiosAplicados = 0;

        // Aplicar cada cambio exacto
        cambiosExactos.forEach(cambio => {
            const user = users.find(u => u.username === cambio.username);
            if (!user) {
                console.log(`❌ Usuario ${cambio.username} no encontrado`);
                return;
            }

            console.log(`\n🔧 Aplicando cambio para ${cambio.username}:`);

            // 1. Buscar o crear curso exacto
            let course = courses.find(c => c.name === cambio.curso);
            if (!course) {
                const courseId = `curso-2do-medio-${Date.now()}`;
                course = {
                    id: courseId,
                    name: cambio.curso,
                    description: `Curso ${cambio.curso}`,
                    createdAt: new Date().toISOString(),
                    source: 'direct-sync'
                };
                courses.push(course);
                console.log(`   ➕ Curso creado: ${course.name} (${course.id})`);
            } else {
                console.log(`   ✅ Curso existe: ${course.name} (${course.id})`);
            }

            // 2. Buscar o crear sección exacta
            let section = sections.find(s => s.courseId === course.id && s.name === cambio.seccion);
            if (!section) {
                const sectionId = `seccion-a-2do-medio-${Date.now()}`;
                section = {
                    id: sectionId,
                    name: cambio.seccion,
                    courseId: course.id,
                    description: `Sección ${cambio.seccion} de ${course.name}`,
                    createdAt: new Date().toISOString(),
                    source: 'direct-sync'
                };
                sections.push(section);
                console.log(`   ➕ Sección creada: ${section.name} (${section.id})`);
            } else {
                console.log(`   ✅ Sección existe: ${section.name} (${section.id})`);
            }

            // 3. Actualizar o crear asignación
            let assignment = assignments.find(a => a.studentId === user.id);
            if (assignment) {
                assignment.courseId = course.id;
                assignment.sectionId = section.id;
                assignment.updatedAt = new Date().toISOString();
                assignment.source = 'direct-sync';
                console.log(`   🔄 Asignación actualizada`);
            } else {
                assignment = {
                    id: `assignment-${user.id}-${Date.now()}`,
                    studentId: user.id,
                    courseId: course.id,
                    sectionId: section.id,
                    createdAt: new Date().toISOString(),
                    source: 'direct-sync'
                };
                assignments.push(assignment);
                console.log(`   ➕ Asignación creada`);
            }

            // 4. ACTUALIZAR PERFIL DIRECTAMENTE
            const nuevoCurso = `${course.name} - Sección ${section.name}`;
            const cursoAnterior = user.activeCourses?.[0] || 'Sin curso';
            
            user.activeCourses = [nuevoCurso];
            user.lastDirectSync = new Date().toISOString();
            user.syncSource = 'direct-management-sync';

            console.log(`   ✅ PERFIL ACTUALIZADO:`);
            console.log(`      Antes: ${cursoAnterior}`);
            console.log(`      Ahora: ${nuevoCurso}`);

            cambiosAplicados++;
        });

        // 5. GUARDAR TODO INMEDIATAMENTE
        console.log('\n💾 GUARDANDO CAMBIOS INMEDIATAMENTE...');
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));

        console.log('✅ Datos guardados en localStorage');

        // 6. VERIFICAR CAMBIOS APLICADOS
        console.log('\n🔍 VERIFICACIÓN FINAL:');
        console.log('======================');
        
        const usersUpdated = JSON.parse(localStorage.getItem('smart-student-users'));
        cambiosExactos.forEach(cambio => {
            const user = usersUpdated.find(u => u.username === cambio.username);
            if (user) {
                const cursoFinal = user.activeCourses?.[0] || 'Sin curso';
                const cursoEsperado = `${cambio.curso} - Sección ${cambio.seccion}`;
                
                console.log(`👤 ${cambio.username}:`);
                console.log(`   Esperado: ${cursoEsperado}`);
                console.log(`   Actual: ${cursoFinal}`);
                
                if (cursoFinal === cursoEsperado) {
                    console.log(`   ✅ CORRECTO`);
                } else {
                    console.log(`   ❌ INCORRECTO`);
                }
            }
        });

        // 7. DISPARAR EVENTOS MÚLTIPLES PARA FORZAR ACTUALIZACIÓN
        console.log('\n📡 DISPARANDO EVENTOS DE ACTUALIZACIÓN...');
        console.log('=========================================');
        
        const eventos = [
            'storage',
            'localStorageUpdate', 
            'profileDataUpdate',
            'userDataChanged',
            'courseAssignmentChanged'
        ];

        eventos.forEach(eventType => {
            const customEvent = new CustomEvent(eventType, {
                detail: {
                    type: 'direct-sync',
                    source: 'management-sync',
                    updatedUsers: cambiosExactos.map(c => c.username),
                    timestamp: new Date().toISOString(),
                    force: true
                }
            });
            window.dispatchEvent(customEvent);
            console.log(`📡 Evento ${eventType} disparado`);
        });

        // 8. FORZAR RECARGA DE PÁGINA SI ES NECESARIO
        if (window.location.pathname.includes('/perfil')) {
            console.log('\n🔄 FORZANDO RECARGA DE PÁGINA...');
            console.log('================================');
            console.log('La página se recargará en 2 segundos para mostrar los cambios');
            
            setTimeout(() => {
                console.log('🔄 Recargando página...');
                window.location.reload(true); // Recarga forzada
            }, 2000);
        }

        console.log(`\n🎉 SINCRONIZACIÓN DIRECTA COMPLETADA`);
        console.log(`===================================`);
        console.log(`✅ Cambios aplicados: ${cambiosAplicados}`);
        console.log(`📊 Cursos totales: ${courses.length}`);
        console.log(`📊 Secciones totales: ${sections.length}`);
        console.log(`📊 Asignaciones totales: ${assignments.length}`);

        return cambiosAplicados;

    } catch (error) {
        console.error('❌ Error en sincronización directa:', error);
        return 0;
    }
}

// Función para verificar inmediatamente después del cambio
function verificarCambiosInmediatos() {
    try {
        console.log('\n🎯 VERIFICACIÓN INMEDIATA POST-CAMBIO:');
        console.log('=====================================');

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        
        ['gustavo', 'max'].forEach(username => {
            const user = users.find(u => u.username === username);
            if (user) {
                const curso = user.activeCourses?.[0] || 'Sin curso';
                console.log(`👤 ${username.toUpperCase()}: ${curso}`);
                
                if (curso === '2do Medio - Sección A') {
                    console.log(`   ✅ PERFECTO - Cambio aplicado correctamente`);
                } else {
                    console.log(`   ❌ PROBLEMA - Debería ser "2do Medio - Sección A"`);
                }
            } else {
                console.log(`❌ Usuario ${username} no encontrado`);
            }
        });

    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

// Función para crear botón de sincronización directa
function crearBotonSincronizacionDirecta() {
    // Remover botón anterior si existe
    const oldButton = document.getElementById('direct-sync-btn');
    if (oldButton) {
        oldButton.remove();
    }

    const button = document.createElement('button');
    button.id = 'direct-sync-btn';
    button.innerHTML = `🔥 SINCRONIZAR AHORA`;
    
    Object.assign(button.style, {
        position: 'fixed',
        top: '20px',
        right: '280px',
        zIndex: '9999',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    button.addEventListener('click', async () => {
        button.innerHTML = '🔄 Sincronizando...';
        button.disabled = true;
        
        const cambios = await aplicarCambiosDirectos();
        
        if (cambios > 0) {
            button.innerHTML = '✅ Sincronizado';
            button.style.backgroundColor = '#10b981';
        } else {
            button.innerHTML = '⚠️ Sin cambios';
            button.style.backgroundColor = '#6b7280';
        }

        setTimeout(() => {
            button.innerHTML = '🔥 SINCRONIZAR AHORA';
            button.style.backgroundColor = '#ef4444';
            button.disabled = false;
        }, 3000);
    });

    document.body.appendChild(button);
    console.log('✅ Botón de sincronización directa creado');
}

// ===============================
// 🚀 EJECUTAR INMEDIATAMENTE
// ===============================

console.log('🚀 EJECUTANDO SINCRONIZACIÓN DIRECTA...');

// 1. Aplicar cambios directos inmediatamente
aplicarCambiosDirectos();

// 2. Verificar inmediatamente
verificarCambiosInmediatos();

// 3. Crear botón para futuras sincronizaciones
crearBotonSincronizacionDirecta();

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('- aplicarCambiosDirectos() - Aplicar cambios inmediatamente');
console.log('- verificarCambiosInmediatos() - Verificar estado actual');

console.log('\n🎯 RESULTADO:');
console.log('=============');
console.log('✅ Sincronización directa ejecutada');
console.log('🔥 Botón rojo "SINCRONIZAR AHORA" creado para futuras sincronizaciones');
console.log('📝 Gustavo y Max ahora deberían mostrar "2do Medio - Sección A"');
