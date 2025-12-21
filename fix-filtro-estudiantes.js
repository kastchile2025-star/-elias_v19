/**
 * 🔧 FIX INMEDIATO PARA FILTRO DE ESTUDIANTES ESPECÍFICOS
 * 
 * Este script fuerza la actualización del filtro de estudiantes específicos
 * después de cambios en Gestión de Usuarios
 */

console.log('🔧 FIX INMEDIATO - FILTRO ESTUDIANTES ESPECÍFICOS...');

function diagnosticarProblemaFiltro() {
    console.log('\n🔍 [DIAGNÓSTICO] Analizando problema del filtro...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log('\n📊 [ESTADO ACTUAL] Datos en localStorage:');
        console.log(`   • Total estudiantes: ${students.length}`);
        console.log(`   • Total asignaciones: ${studentAssignments.length}`);
        
        // Analizar específicamente 5to Básico
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        if (!quintoBasico) {
            console.log('❌ No se encontró 5to Básico');
            return;
        }
        
        const seccionesQuinto = sections.filter(s => s.courseId === quintoBasico.id);
        
        console.log('\n📚 [5TO BÁSICO] Estado detallado:');
        
        seccionesQuinto.forEach(seccion => {
            console.log(`\n📖 SECCIÓN ${seccion.name}:`);
            
            // Estudiantes según ASIGNACIONES (datos correctos)
            const estudiantesEnAsignaciones = studentAssignments
                .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
                .map(a => {
                    const student = students.find(s => s.id === a.studentId);
                    return student ? (student.displayName || student.username) : 'Desconocido';
                });
            
            console.log(`   📋 Según ASIGNACIONES (${estudiantesEnAsignaciones.length}):`);
            if (estudiantesEnAsignaciones.length === 0) {
                console.log('      📭 Sin estudiantes');
            } else {
                estudiantesEnAsignaciones.forEach(nombre => console.log(`      • ${nombre}`));
            }
            
            // Estudiantes según USERS (lo que puede estar desactualizado)
            const estudiantesEnUsers = students.filter(s => {
                const activeCourse = s.activeCourses?.find(course => 
                    course.includes('5to Básico') && course.includes(`Sección ${seccion.name}`)
                );
                return activeCourse !== undefined;
            }).map(s => s.displayName || s.username);
            
            console.log(`   👤 Según USERS (${estudiantesEnUsers.length}):`);
            if (estudiantesEnUsers.length === 0) {
                console.log('      📭 Sin estudiantes');
            } else {
                estudiantesEnUsers.forEach(nombre => console.log(`      • ${nombre}`));
            }
            
            // Detectar inconsistencias
            const enAsignacionesStr = JSON.stringify(estudiantesEnAsignaciones.sort());
            const enUsersStr = JSON.stringify(estudiantesEnUsers.sort());
            
            if (enAsignacionesStr !== enUsersStr) {
                console.log(`   ❌ INCONSISTENCIA DETECTADA:`);
                console.log(`      Asignaciones: ${enAsignacionesStr}`);
                console.log(`      Users: ${enUsersStr}`);
                console.log(`      🎯 EL FILTRO ESTÁ USANDO USERS (DESACTUALIZADO)`);
            } else {
                console.log(`   ✅ Datos consistentes`);
            }
        });
        
        return { quintoBasico, seccionesQuinto, students, studentAssignments };
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
        return null;
    }
}

function corregirFiltroInmediato() {
    console.log('\n🔧 [CORRECCIÓN] Sincronizando datos para el filtro...');
    
    const datos = diagnosticarProblemaFiltro();
    if (!datos) return false;
    
    try {
        const { quintoBasico, seccionesQuinto, students, studentAssignments } = datos;
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        let correccionesRealizadas = 0;
        
        console.log('\n🔄 [SINCRONIZACIÓN] Actualizando datos de usuarios...');
        
        students.forEach(student => {
            const userIndex = users.findIndex(u => u.id === student.id);
            if (userIndex === -1) return;
            
            // Buscar todas las asignaciones del estudiante
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            
            // Calcular nuevos activeCourses basado en asignaciones reales
            const newActiveCourses = assignmentsForStudent.map(assignment => {
                const course = [quintoBasico].find(c => c.id === assignment.courseId) || 
                              JSON.parse(localStorage.getItem('smart-student-courses') || '[]')
                              .find(c => c.id === assignment.courseId);
                const section = sections.find(s => s.id === assignment.sectionId);
                return `${course?.name || 'Curso'} - Sección ${section?.name || 'A'}`;
            });
            
            // Actualizar sectionName
            let newSectionName = null;
            if (assignmentsForStudent.length > 0) {
                const firstSection = sections.find(s => s.id === assignmentsForStudent[0].sectionId);
                newSectionName = firstSection?.name || null;
            }
            
            // Verificar si necesita actualización
            const currentCourses = JSON.stringify(users[userIndex].activeCourses || []);
            const newCoursesStr = JSON.stringify(newActiveCourses);
            const currentSectionName = users[userIndex].sectionName;
            
            if (currentCourses !== newCoursesStr || currentSectionName !== newSectionName) {
                users[userIndex].activeCourses = newActiveCourses;
                users[userIndex].sectionName = newSectionName;
                
                correccionesRealizadas++;
                console.log(`✅ CORREGIDO: ${users[userIndex].displayName || users[userIndex].username}`);
                console.log(`   activeCourses: ${currentCourses} → ${newCoursesStr}`);
                console.log(`   sectionName: "${currentSectionName}" → "${newSectionName}"`);
            }
        });
        
        if (correccionesRealizadas > 0) {
            // Guardar cambios
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            
            // Actualizar timestamp
            localStorage.setItem('smart-student-last-sync', new Date().toISOString());
            
            console.log(`\n💾 [GUARDADO] ${correccionesRealizadas} correcciones aplicadas`);
            
            // Disparar eventos para React
            const storageEvent = new StorageEvent('storage', {
                key: 'smart-student-users',
                newValue: JSON.stringify(users),
                storageArea: localStorage
            });
            window.dispatchEvent(storageEvent);
            
            // Eventos adicionales
            ['smart-student-refresh', 'force-refresh', 'student-filter-update'].forEach(eventName => {
                window.dispatchEvent(new CustomEvent(eventName, {
                    detail: { 
                        timestamp: Date.now(),
                        source: 'filter-fix',
                        changes: correccionesRealizadas
                    }
                }));
            });
            
            console.log('🎯 [EVENTOS] Eventos de actualización disparados');
            
        } else {
            console.log('\n✅ [OK] No se necesitaron correcciones');
        }
        
        return correccionesRealizadas;
        
    } catch (error) {
        console.error('❌ Error en corrección:', error);
        return false;
    }
}

function forzarActualizacionInterfaz() {
    console.log('\n🖥️ [INTERFAZ] Forzando actualización de la interfaz...');
    
    // 1. Buscar elementos del formulario de tarea
    const selectCurso = document.querySelector('select[name*="course"], select[name*="curso"], select');
    const selectAsignar = document.querySelector('select[name*="assign"], select[name*="asignar"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    console.log(`   🔍 Elementos encontrados:`);
    console.log(`      • Select de curso: ${selectCurso ? 'SÍ' : 'NO'}`);
    console.log(`      • Select de asignación: ${selectAsignar ? 'SÍ' : 'NO'}`);
    console.log(`      • Checkboxes: ${checkboxes.length}`);
    
    // 2. Triggear eventos en selects
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        const currentValue = select.value;
        
        // Triggear múltiples eventos
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('focus', { bubbles: true }));
        select.dispatchEvent(new Event('blur', { bubbles: true }));
        
        // Re-seleccionar el valor para forzar actualización
        if (currentValue) {
            setTimeout(() => {
                select.value = currentValue;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }, 100);
        }
    });
    
    // 3. Clickear en elementos de React
    const reactElements = document.querySelectorAll('[data-react-*, [class*="react"], [class*="component"]');
    reactElements.forEach(el => {
        el.dispatchEvent(new Event('click', { bubbles: true }));
    });
    
    console.log(`   ✅ ${selects.length} selects actualizados`);
    console.log(`   ✅ ${reactElements.length} elementos React actualizados`);
    
    console.log('\n💡 [INSTRUCCIONES] Para completar la actualización:');
    console.log('   1. En el formulario de tarea, cambia el curso a otro y vuelve a "5to Básico"');
    console.log('   2. Cambia la sección entre A y B');
    console.log('   3. Verifica que "Estudiantes específicos" se actualiza correctamente');
    console.log('   4. Si no funciona, recarga la página (F5)');
}

function mostrarEstadoEsperado() {
    console.log('\n🎯 [ESTADO ESPERADO] Lo que debería mostrar cada filtro:');
    
    const datos = diagnosticarProblemaFiltro();
    if (!datos) return;
    
    const { quintoBasico, seccionesQuinto, studentAssignments, students } = datos;
    
    seccionesQuinto.forEach(seccion => {
        console.log(`\n📋 Al seleccionar "5to Básico - Sección ${seccion.name}":`);
        console.log('   🎯 En "Estudiantes específicos" debería aparecer:');
        
        const estudiantesEsperados = studentAssignments
            .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
            .map(a => {
                const student = students.find(s => s.id === a.studentId);
                return student ? (student.displayName || student.username) : 'Desconocido';
            });
        
        if (estudiantesEsperados.length === 0) {
            console.log('      📭 (Lista vacía)');
        } else {
            estudiantesEsperados.forEach(nombre => {
                console.log(`      ☑️ ${nombre}`);
            });
        }
    });
}

// Ejecutar fix automático
console.log('🚀 Ejecutando fix del filtro...');

// 1. Diagnosticar
const problema = diagnosticarProblemaFiltro();

if (problema) {
    // 2. Corregir datos
    const correciones = corregirFiltroInmediato();
    
    if (correciones !== false) {
        console.log('\n✅ DATOS CORREGIDOS');
        
        // 3. Mostrar estado esperado
        mostrarEstadoEsperado();
        
        // 4. Forzar actualización de interfaz
        forzarActualizacionInterfaz();
        
    } else {
        console.log('\n❌ ERROR en corrección de datos');
    }
} else {
    console.log('\n❌ ERROR en diagnóstico');
}

// Hacer funciones disponibles
window.diagnosticarProblemaFiltro = diagnosticarProblemaFiltro;
window.corregirFiltroInmediato = corregirFiltroInmediato;
window.forzarActualizacionInterfaz = forzarActualizacionInterfaz;
window.mostrarEstadoEsperado = mostrarEstadoEsperado;

console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   • diagnosticarProblemaFiltro() - Para analizar el problema');
console.log('   • corregirFiltroInmediato() - Para corregir datos');
console.log('   • forzarActualizacionInterfaz() - Para actualizar la interfaz');
console.log('   • mostrarEstadoEsperado() - Para ver qué debería mostrar cada filtro');
