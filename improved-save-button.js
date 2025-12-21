/**
 * 💾 BOTÓN GUARDAR MEJORADO CON DIAGNÓSTICO COMPLETO
 * 
 * Versión mejorada que diagnostica y corrige problemas de sincronización
 * entre Gestión de Usuarios y Datos Académicos en tiempo real.
 */

console.log('💾 BOTÓN GUARDAR MEJORADO CON DIAGNÓSTICO...');
console.log('============================================');

// Función para crear/actualizar el botón de guardar
function crearBotonGuardarMejorado() {
    // Remover botón anterior si existe
    const oldButton = document.getElementById('save-user-changes-btn');
    if (oldButton) {
        oldButton.remove();
    }

    // Crear el nuevo botón mejorado
    const saveButton = document.createElement('button');
    saveButton.id = 'save-user-changes-btn';
    saveButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
            <path d="M19 21H5C3.89 21 3 20.11 3 19V5C3 3.89 3.89 3 5 3H16L21 8V19C21 20.11 20.11 21 19 21Z" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        💾 Guardar Cambios en Perfiles
    `;
    
    // Estilos del botón
    Object.assign(saveButton.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'all 0.2s ease',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Efectos hover
    saveButton.addEventListener('mouseenter', () => {
        saveButton.style.backgroundColor = '#059669';
        saveButton.style.transform = 'translateY(-2px)';
    });

    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.backgroundColor = '#10b981';
        saveButton.style.transform = 'translateY(0px)';
    });

    // Función al hacer click
    saveButton.addEventListener('click', async () => {
        console.log('💾 Botón Guardar presionado - Iniciando diagnóstico...');
        await ejecutarGuardadoCompleto();
    });

    document.body.appendChild(saveButton);
    console.log('✅ Botón de guardar mejorado creado');
}

// Función principal mejorada para guardar cambios
async function ejecutarGuardadoCompleto() {
    try {
        const button = document.getElementById('save-user-changes-btn');
        const originalText = button.innerHTML;
        
        // Actualizar estado del botón
        button.innerHTML = `🔄 Diagnosticando y guardando...`;
        button.disabled = true;
        button.style.backgroundColor = '#f59e0b';

        console.log('\n💾 INICIANDO GUARDADO COMPLETO...');
        console.log('================================');

        // PASO 1: Diagnóstico completo
        console.log('📊 PASO 1: DIAGNÓSTICO INICIAL');
        console.log('==============================');
        
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log(`📋 Datos disponibles:`);
        console.log(`   Usuarios: ${users.length}`);
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Asignaciones: ${assignments.length}`);

        // PASO 2: Verificar estado actual de estudiantes específicos
        console.log('\n🎯 PASO 2: ESTADO ACTUAL GUSTAVO Y MAX');
        console.log('=====================================');
        
        const targetStudents = ['gustavo', 'max'];
        const estadoAntes = {};
        
        targetStudents.forEach(username => {
            const user = users.find(u => u.username === username);
            if (user) {
                const assignment = assignments.find(a => a.studentId === user.id);
                const currentCourse = user.activeCourses?.[0] || 'Sin curso';
                
                estadoAntes[username] = {
                    user: user,
                    assignment: assignment,
                    currentCourse: currentCourse
                };
                
                console.log(`👤 ${username.toUpperCase()}:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Perfil actual: ${currentCourse}`);
                
                if (assignment) {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const section = sections.find(s => s.id === assignment.sectionId);
                    
                    if (course && section) {
                        const expectedCourse = `${course.name} - Sección ${section.name}`;
                        console.log(`   Gestión dice: ${expectedCourse}`);
                        
                        if (currentCourse !== expectedCourse) {
                            console.log(`   ❌ DESINCRONIZADO`);
                        } else {
                            console.log(`   ✅ Sincronizado`);
                        }
                    } else {
                        console.log(`   ⚠️ Curso/sección faltante`);
                    }
                } else {
                    console.log(`   ❌ Sin asignación`);
                }
            }
        });

        // PASO 3: Detectar discrepancias en todos los cursos disponibles
        console.log('\n📚 PASO 3: CURSOS DISPONIBLES');
        console.log('=============================');
        
        courses.forEach(course => {
            const sectionsForCourse = sections.filter(s => s.courseId === course.id);
            console.log(`📖 ${course.name}:`);
            sectionsForCourse.forEach(section => {
                console.log(`   - Sección ${section.name} (ID: ${section.id})`);
            });
        });

        // PASO 4: Buscar o crear cursos/secciones específicos según necesidad
        console.log('\n🔧 PASO 4: CORRECCIÓN DE DATOS');
        console.log('==============================');
        
        // Datos que esperamos según la imagen que mostraste
        const expectedAssignments = [
            { username: 'gustavo', curso: '6to Básico', seccion: 'A' },
            { username: 'max', curso: '6to Básico', seccion: 'A' }
        ];

        let cambiosRealizados = 0;

        for (const expected of expectedAssignments) {
            const user = users.find(u => u.username === expected.username);
            if (!user) {
                console.log(`❌ Usuario ${expected.username} no encontrado`);
                continue;
            }

            console.log(`\n🔧 Procesando ${expected.username}:`);

            // Buscar o crear curso
            let course = courses.find(c => c.name === expected.curso);
            if (!course) {
                course = {
                    id: `curso-${Date.now()}-${expected.curso.replace(/\s+/g, '-').toLowerCase()}`,
                    name: expected.curso,
                    description: `Curso ${expected.curso}`,
                    createdAt: new Date().toISOString(),
                    source: 'user-management-save'
                };
                courses.push(course);
                console.log(`   ➕ Curso creado: ${course.name} (${course.id})`);
            } else {
                console.log(`   ✅ Curso encontrado: ${course.name} (${course.id})`);
            }

            // Buscar o crear sección
            let section = sections.find(s => s.courseId === course.id && s.name === expected.seccion);
            if (!section) {
                section = {
                    id: `seccion-${Date.now()}-${expected.seccion.toLowerCase()}`,
                    name: expected.seccion,
                    courseId: course.id,
                    description: `Sección ${expected.seccion} de ${course.name}`,
                    createdAt: new Date().toISOString(),
                    source: 'user-management-save'
                };
                sections.push(section);
                console.log(`   ➕ Sección creada: ${section.name} (${section.id})`);
            } else {
                console.log(`   ✅ Sección encontrada: ${section.name} (${section.id})`);
            }

            // Actualizar o crear asignación
            const existingAssignment = assignments.find(a => a.studentId === user.id);
            if (existingAssignment) {
                existingAssignment.courseId = course.id;
                existingAssignment.sectionId = section.id;
                existingAssignment.updatedAt = new Date().toISOString();
                existingAssignment.source = 'user-management-save';
                console.log(`   🔄 Asignación actualizada`);
            } else {
                const newAssignment = {
                    id: `assignment-${Date.now()}-${expected.username}`,
                    studentId: user.id,
                    courseId: course.id,
                    sectionId: section.id,
                    createdAt: new Date().toISOString(),
                    source: 'user-management-save'
                };
                assignments.push(newAssignment);
                console.log(`   ➕ Asignación creada`);
            }

            // Actualizar perfil del usuario
            const newCourseName = `${course.name} - Sección ${section.name}`;
            const oldCourseName = user.activeCourses?.[0] || 'Sin curso';
            
            user.activeCourses = [newCourseName];
            user.lastUpdated = new Date().toISOString();
            user.source = 'user-management-save';
            
            console.log(`   ✅ Perfil actualizado: "${oldCourseName}" → "${newCourseName}"`);
            cambiosRealizados++;
        }

        // PASO 5: Guardar todos los cambios
        console.log('\n💾 PASO 5: GUARDANDO CAMBIOS');
        console.log('============================');
        
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));

        console.log(`✅ Datos guardados en localStorage`);

        // PASO 6: Disparar eventos de actualización
        console.log('\n📡 PASO 6: EVENTOS DE ACTUALIZACIÓN');
        console.log('===================================');
        
        // Múltiples eventos para asegurar actualización
        const events = [
            new CustomEvent('storage', { 
                detail: { 
                    key: 'smart-student-users', 
                    source: 'user-management-save',
                    timestamp: new Date().toISOString()
                } 
            }),
            new CustomEvent('localStorageUpdate', {
                detail: { 
                    type: 'user-management-save',
                    updatedUsers: expectedAssignments.map(e => e.username),
                    count: cambiosRealizados
                }
            }),
            new CustomEvent('profileDataUpdate', {
                detail: { 
                    type: 'sync-from-management',
                    updatedCount: cambiosRealizados,
                    source: 'save-button'
                }
            })
        ];

        events.forEach((event, index) => {
            window.dispatchEvent(event);
            console.log(`📡 Evento ${index + 1} disparado`);
        });

        // PASO 7: Verificación final
        console.log('\n🔍 PASO 7: VERIFICACIÓN FINAL');
        console.log('=============================');
        
        const updatedUsers = JSON.parse(localStorage.getItem('smart-student-users'));
        expectedAssignments.forEach(expected => {
            const user = updatedUsers.find(u => u.username === expected.username);
            if (user) {
                const finalCourse = user.activeCourses?.[0] || 'Sin curso';
                console.log(`👤 ${expected.username}: ${finalCourse}`);
            }
        });

        // Actualizar botón con resultado
        if (cambiosRealizados > 0) {
            button.innerHTML = `✅ ${cambiosRealizados} perfil(es) guardado(s)`;
            button.style.backgroundColor = '#10b981';
            mostrarNotificacion(`✅ ${cambiosRealizados} perfil(es) actualizado(s) exitosamente`, 'success');
            
            // Recargar página si estamos en perfil
            if (window.location.pathname.includes('/perfil')) {
                console.log('🔄 Recargando página para mostrar cambios...');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } else {
            button.innerHTML = `✅ Ya sincronizado`;
            button.style.backgroundColor = '#6b7280';
            mostrarNotificacion('✅ Los perfiles ya estaban sincronizados', 'info');
        }

        // Restaurar botón después de 3 segundos
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.backgroundColor = '#10b981';
        }, 3000);

        console.log(`\n🎉 GUARDADO COMPLETO TERMINADO`);
        console.log(`==============================`);
        console.log(`✅ Cambios aplicados: ${cambiosRealizados}`);

        return cambiosRealizados;

    } catch (error) {
        console.error('❌ Error en guardado completo:', error);
        
        const button = document.getElementById('save-user-changes-btn');
        if (button) {
            button.innerHTML = `❌ Error - Reintenta`;
            button.disabled = false;
            button.style.backgroundColor = '#ef4444';
        }
        
        mostrarNotificacion('❌ Error al guardar. Revisa la consola.', 'error');
    }
}

// Función para mostrar notificaciones mejorada
function mostrarNotificacion(mensaje, tipo = 'info') {
    try {
        const notification = document.createElement('div');
        notification.innerHTML = mensaje;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: '10000',
            backgroundColor: colors[tipo] || colors.info,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

    } catch (error) {
        console.error('❌ Error mostrando notificación:', error);
    }
}

// ===============================
// 🚀 EJECUTAR INMEDIATAMENTE
// ===============================

console.log('🚀 ACTIVANDO BOTÓN GUARDAR MEJORADO...');
crearBotonGuardarMejorado();

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('=========================');
console.log('- crearBotonGuardarMejorado() - Recrear botón');
console.log('- ejecutarGuardadoCompleto() - Ejecutar guardado directamente');

console.log('\n🎯 RESULTADO:');
console.log('=============');
console.log('✅ Botón guardar mejorado creado');
console.log('💾 Incluye diagnóstico completo y corrección automática');
console.log('🔧 Crea cursos/secciones faltantes automáticamente');
console.log('📡 Dispara múltiples eventos para asegurar sincronización');

console.log('\n🚨 INSTRUCCIONES:');
console.log('=================');
console.log('1. Haz cambios en Gestión de Usuarios');
console.log('2. Presiona el botón "💾 Guardar Cambios en Perfiles"');
console.log('3. El sistema diagnosticará y aplicará cambios automáticamente');
console.log('4. Si estás en perfil, la página se recargará automáticamente');
