/**
 * 🔄 AUTO-SINCRONIZACIÓN ENTRE GESTIÓN DE USUARIOS Y TAREAS
 * 
 * Este script detecta cambios en "Gestión de Usuarios" (admin) 
 * y los sincroniza automáticamente con "Tareas" (profesor)
 */

console.log('🔄 AUTO-SINCRONIZACIÓN ADMIN ↔ PROFESOR');

function sincronizarAdminProfesor() {
    console.log('\n⚡ [SYNC] Sincronizando cambios de Gestión de Usuarios...');
    
    try {
        // Cargar datos actuales
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        console.log('📊 [DATOS] Cargados desde localStorage:');
        console.log(`   • ${users.length} usuarios`);
        console.log(`   • ${studentAssignments.length} asignaciones de estudiantes`);
        console.log(`   • ${courses.length} cursos`);
        console.log(`   • ${sections.length} secciones`);
        
        // PASO 1: Leer información de perfiles (Gestión de Usuarios)
        console.log('\n📋 [GESTIÓN USUARIOS] Leyendo datos de perfiles:');
        
        const students = users.filter(u => u.role === 'student');
        const perfilesAdmin = {};
        
        students.forEach(student => {
            const activeCourses = student.activeCourses || [];
            const sectionName = student.sectionName || null;
            
            console.log(`   👤 ${student.displayName || student.username}:`);
            console.log(`      • activeCourses: ${JSON.stringify(activeCourses)}`);
            console.log(`      • sectionName: "${sectionName}"`);
            
            perfilesAdmin[student.id] = {
                name: student.displayName || student.username,
                activeCourses,
                sectionName,
                student
            };
        });
        
        // PASO 2: Sincronizar asignaciones basándose en perfiles
        console.log('\n🔄 [SINCRONIZACIÓN] Actualizando asignaciones...');
        
        let cambiosRealizados = 0;
        
        Object.values(perfilesAdmin).forEach(perfil => {
            const { student, activeCourses, sectionName } = perfil;
            
            // Buscar asignaciones existentes del estudiante
            const asignacionesExistentes = studentAssignments.filter(a => a.studentId === student.id);
            
            // Procesar cada curso activo en el perfil
            activeCourses.forEach(courseStr => {
                // Extraer nombre del curso y sección del string
                const match = courseStr.match(/^(.+?)\s*-\s*Sección\s*([A-Z])$/);
                if (!match) {
                    console.log(`⚠️ Formato no reconocido: "${courseStr}"`);
                    return;
                }
                
                const [, courseName, sectionLetter] = match;
                
                // Buscar curso y sección en los datos
                const course = courses.find(c => c.name.trim() === courseName.trim());
                const section = sections.find(s => 
                    s.courseId === course?.id && s.name === sectionLetter
                );
                
                if (!course || !section) {
                    console.log(`❌ No se encontró curso "${courseName}" o sección "${sectionLetter}"`);
                    return;
                }
                
                // Verificar si ya existe la asignación correcta
                const asignacionExistente = asignacionesExistentes.find(a => 
                    a.courseId === course.id && a.sectionId === section.id
                );
                
                if (!asignacionExistente) {
                    // Crear nueva asignación
                    const nuevaAsignacion = {
                        studentId: student.id,
                        courseId: course.id,
                        sectionId: section.id,
                        assignedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    studentAssignments.push(nuevaAsignacion);
                    cambiosRealizados++;
                    
                    console.log(`✅ NUEVA ASIGNACIÓN: ${perfil.name} → ${courseName} Sección ${sectionLetter}`);
                    
                } else {
                    // Verificar si la sección es correcta
                    if (asignacionExistente.sectionId !== section.id) {
                        // Actualizar sección
                        const seccionAnterior = sections.find(s => s.id === asignacionExistente.sectionId);
                        asignacionExistente.sectionId = section.id;
                        asignacionExistente.updatedAt = new Date().toISOString();
                        cambiosRealizados++;
                        
                        console.log(`🔄 ACTUALIZADA: ${perfil.name} → ${courseName} de Sección ${seccionAnterior?.name || '?'} a ${sectionLetter}`);
                    }
                }
                
                // Eliminar asignaciones incorrectas para el mismo curso
                const asignacionesIncorrectas = studentAssignments.filter(a => 
                    a.studentId === student.id && 
                    a.courseId === course.id && 
                    a.sectionId !== section.id
                );
                
                asignacionesIncorrectas.forEach(asignacion => {
                    const index = studentAssignments.indexOf(asignacion);
                    if (index > -1) {
                        const seccionIncorrecta = sections.find(s => s.id === asignacion.sectionId);
                        studentAssignments.splice(index, 1);
                        cambiosRealizados++;
                        
                        console.log(`🗑️ ELIMINADA: ${perfil.name} → ${courseName} Sección ${seccionIncorrecta?.name || '?'} (incorrecta)`);
                    }
                });
            });
        });
        
        // PASO 3: Guardar cambios
        if (cambiosRealizados > 0) {
            console.log(`\n💾 [GUARDADO] Guardando ${cambiosRealizados} cambios...`);
            
            localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
            localStorage.setItem('smart-student-last-admin-sync', new Date().toISOString());
            
            // Disparar eventos de sincronización
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-student-assignments',
                newValue: JSON.stringify(studentAssignments),
                storageArea: localStorage
            }));
            
            const eventos = [
                'admin-sync-complete',
                'student-assignments-updated',
                'force-refresh',
                'profile-sync'
            ];
            
            eventos.forEach(evento => {
                window.dispatchEvent(new CustomEvent(evento, {
                    detail: {
                        timestamp: Date.now(),
                        changes: cambiosRealizados,
                        source: 'admin-professor-sync'
                    }
                }));
            });
            
            console.log(`✅ Cambios guardados y ${eventos.length} eventos disparados`);
            
        } else {
            console.log('\n✅ [OK] No se necesitaron cambios');
        }
        
        // PASO 4: Verificar resultado final
        console.log('\n🔍 [VERIFICACIÓN] Estado final:');
        
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (quintoBasico) {
            const seccionA = sections.find(s => s.courseId === quintoBasico.id && s.name === 'A');
            const seccionB = sections.find(s => s.courseId === quintoBasico.id && s.name === 'B');
            
            if (seccionA && seccionB) {
                const estudiantesA = studentAssignments
                    .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccionA.id)
                    .map(a => {
                        const student = users.find(u => u.id === a.studentId);
                        return student ? (student.displayName || student.username) : 'Desconocido';
                    });
                
                const estudiantesB = studentAssignments
                    .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccionB.id)
                    .map(a => {
                        const student = users.find(u => u.id === a.studentId);
                        return student ? (student.displayName || student.username) : 'Desconocido';
                    });
                
                console.log(`📖 5to Básico Sección A: [${estudiantesA.join(', ') || 'Nadie'}]`);
                console.log(`📖 5to Básico Sección B: [${estudiantesB.join(', ') || 'Nadie'}]`);
            }
        }
        
        return { success: true, changes: cambiosRealizados };
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        return { success: false, error };
    }
}

function configurarAutoSync() {
    console.log('\n🔧 [AUTO-SYNC] Configurando sincronización automática...');
    
    // Configurar observador de cambios en localStorage
    let ultimaActualizacion = localStorage.getItem('smart-student-last-admin-sync') || '0';
    
    setInterval(() => {
        const nuevaActualizacion = localStorage.getItem('smart-student-last-admin-sync') || '0';
        
        if (nuevaActualizacion !== ultimaActualizacion) {
            console.log('🔄 [AUTO-SYNC] Cambios detectados, ejecutando sincronización...');
            sincronizarAdminProfesor();
            ultimaActualizacion = nuevaActualizacion;
        }
    }, 2000); // Verificar cada 2 segundos
    
    console.log('✅ Auto-sincronización configurada (verificación cada 2 segundos)');
}

// EJECUTAR SINCRONIZACIÓN INICIAL
console.log('🚀 EJECUTANDO SINCRONIZACIÓN INICIAL...');

const resultado = sincronizarAdminProfesor();

if (resultado.success) {
    console.log('\n✅ SINCRONIZACIÓN INICIAL COMPLETADA');
    
    if (resultado.changes > 0) {
        console.log(`📝 Se realizaron ${resultado.changes} cambios`);
    }
    
    // Configurar auto-sincronización
    configurarAutoSync();
    
    console.log('\n💡 [RESULTADO]:');
    console.log('   • Los cambios en Gestión de Usuarios ahora se sincronizan automáticamente');
    console.log('   • El filtro de tareas mostrará la información actualizada');
    console.log('   • Cualquier cambio futuro se sincronizará automáticamente');
    
} else {
    console.log('\n❌ ERROR EN SINCRONIZACIÓN INICIAL');
    console.error('Detalles:', resultado.error);
}

// Funciones disponibles
window.sincronizarAdminProfesor = sincronizarAdminProfesor;
window.configurarAutoSync = configurarAutoSync;

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • sincronizarAdminProfesor() - Ejecutar sincronización manual');
console.log('   • configurarAutoSync() - Reconfigurar auto-sincronización');
