/**
 * 🔍 MONITOR ESPECÍFICO PARA 5TO BÁSICO
 * 
 * Script enfocado en detectar y mostrar cambios específicos en 5to Básico
 * después de modificaciones en Gestión de Usuarios
 */

console.log('🔍 MONITOR ESPECÍFICO - 5TO BÁSICO...');

function analizarQuintoBasico() {
    console.log('\n📚 [5TO BÁSICO] Análisis detallado...');
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        // Buscar 5to Básico
        const quintoBasico = courses.find(c => c.name === '5to Básico');
        
        if (!quintoBasico) {
            console.log('❌ No se encontró el curso "5to Básico"');
            return;
        }
        
        console.log(`✅ Curso encontrado: ${quintoBasico.name} (ID: ${quintoBasico.id})`);
        
        // Buscar secciones de 5to Básico
        const seccionesQuinto = sections.filter(s => s.courseId === quintoBasico.id);
        console.log(`📖 Secciones disponibles: ${seccionesQuinto.length}`);
        
        seccionesQuinto.forEach(seccion => {
            console.log(`   • Sección ${seccion.name} (ID: ${seccion.id})`);
        });
        
        // Analizar asignaciones actuales
        console.log('\n👥 [ASIGNACIONES ACTUALES] En 5to Básico:');
        
        seccionesQuinto.forEach(seccion => {
            console.log(`\n📋 SECCIÓN ${seccion.name}:`);
            
            const asignacionesSeccion = studentAssignments.filter(a => 
                a.courseId === quintoBasico.id && a.sectionId === seccion.id
            );
            
            if (asignacionesSeccion.length === 0) {
                console.log('   📭 Sin estudiantes asignados');
            } else {
                console.log(`   👥 ${asignacionesSeccion.length} estudiantes asignados:`);
                
                asignacionesSeccion.forEach(assignment => {
                    const student = students.find(s => s.id === assignment.studentId);
                    if (student) {
                        console.log(`      • ${student.displayName || student.username}`);
                        console.log(`        - ID Estudiante: ${student.id}`);
                        console.log(`        - ID Asignación: ${assignment.id}`);
                        console.log(`        - Fecha creación: ${assignment.createdAt || 'Sin fecha'}`);
                        console.log(`        - activeCourses en users: ${JSON.stringify(student.activeCourses || [])}`);
                        console.log(`        - sectionName en users: "${student.sectionName || 'null'}"`);
                    }
                });
            }
        });
        
        // Verificar inconsistencias
        console.log('\n🔍 [INCONSISTENCIAS] Verificando...');
        
        let inconsistenciasEncontradas = 0;
        
        students.forEach(student => {
            const assignmentsForStudent = studentAssignments.filter(a => a.studentId === student.id);
            
            // Verificar si tiene asignaciones a 5to Básico
            const asignacionesQuinto = assignmentsForStudent.filter(a => a.courseId === quintoBasico.id);
            
            if (asignacionesQuinto.length > 0) {
                // Calcular lo que debería tener en activeCourses
                const expectedActiveCourses = asignacionesQuinto.map(a => {
                    const section = sections.find(s => s.id === a.sectionId);
                    return `5to Básico - Sección ${section?.name || 'A'}`;
                });
                
                const currentActiveCourses = student.activeCourses || [];
                
                // Verificar si coincide
                const currentStr = JSON.stringify(currentActiveCourses.sort());
                const expectedStr = JSON.stringify(expectedActiveCourses.sort());
                
                if (currentStr !== expectedStr) {
                    inconsistenciasEncontradas++;
                    console.log(`\n❌ INCONSISTENCIA en ${student.displayName || student.username}:`);
                    console.log(`   Actual: ${currentStr}`);
                    console.log(`   Esperado: ${expectedStr}`);
                }
            }
        });
        
        if (inconsistenciasEncontradas === 0) {
            console.log('✅ No se encontraron inconsistencias');
        } else {
            console.log(`❌ ${inconsistenciasEncontradas} inconsistencias encontradas`);
        }
        
        return {
            curso: quintoBasico,
            secciones: seccionesQuinto,
            inconsistencias: inconsistenciasEncontradas
        };
        
    } catch (error) {
        console.error('❌ Error analizando 5to Básico:', error);
        return null;
    }
}

// Función para corregir específicamente 5to Básico
function corregirQuintoBasico() {
    console.log('\n🔧 [CORRECCIÓN] Aplicando correcciones a 5to Básico...');
    
    const analisis = analizarQuintoBasico();
    if (!analisis) return false;
    
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        let correccionesRealizadas = 0;
        
        students.forEach(student => {
            const asignacionesQuinto = studentAssignments.filter(a => 
                a.courseId === analisis.curso.id && a.studentId === student.id
            );
            
            if (asignacionesQuinto.length > 0) {
                // Calcular activeCourses correcto
                const correctActiveCourses = asignacionesQuinto.map(a => {
                    const section = sections.find(s => s.id === a.sectionId);
                    return `5to Básico - Sección ${section?.name || 'A'}`;
                });
                
                // Actualizar sectionName
                const firstSection = sections.find(s => s.id === asignacionesQuinto[0].sectionId);
                const correctSectionName = firstSection?.name || null;
                
                // Aplicar correcciones
                const originalActiveCourses = JSON.stringify(student.activeCourses || []);
                const newActiveCourses = JSON.stringify(correctActiveCourses);
                
                if (originalActiveCourses !== newActiveCourses || student.sectionName !== correctSectionName) {
                    student.activeCourses = correctActiveCourses;
                    student.sectionName = correctSectionName;
                    
                    correccionesRealizadas++;
                    console.log(`✅ CORREGIDO: ${student.displayName || student.username}`);
                    console.log(`   activeCourses: ${originalActiveCourses} → ${newActiveCourses}`);
                    console.log(`   sectionName: "${student.sectionName}" → "${correctSectionName}"`);
                }
            }
        });
        
        if (correccionesRealizadas > 0) {
            localStorage.setItem('smart-student-users', JSON.stringify(users));
            console.log(`\n💾 ${correccionesRealizadas} correcciones guardadas`);
            
            // Disparar eventos
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'smart-student-users',
                newValue: JSON.stringify(users),
                storageArea: localStorage
            }));
            
            console.log('🎯 Eventos de actualización disparados');
        } else {
            console.log('\n✅ No se necesitaron correcciones');
        }
        
        return correccionesRealizadas;
        
    } catch (error) {
        console.error('❌ Error corrigiendo 5to Básico:', error);
        return false;
    }
}

// Función para mostrar lo que debería verse en el filtro
function simularFiltroQuintoBasico() {
    console.log('\n🎯 [SIMULACIÓN] ¿Qué debería mostrar el filtro de 5to Básico?');
    
    const analisis = analizarQuintoBasico();
    if (!analisis) return;
    
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = users.filter(u => u.role === 'student');
    
    analisis.secciones.forEach(seccion => {
        console.log(`\n📋 Al seleccionar "5to Básico - Sección ${seccion.name}":`);
        console.log('   → En "Estudiantes específicos" debería mostrar:');
        
        const estudiantesEsperados = studentAssignments
            .filter(a => a.courseId === analisis.curso.id && a.sectionId === seccion.id)
            .map(a => {
                const student = students.find(s => s.id === a.studentId);
                return student ? (student.displayName || student.username) : 'Desconocido';
            });
        
        if (estudiantesEsperados.length === 0) {
            console.log('      📭 (Lista vacía - sin estudiantes)');
        } else {
            estudiantesEsperados.forEach(nombre => {
                console.log(`      ☑️ ${nombre}`);
            });
        }
    });
}

// Ejecutar análisis automático
console.log('🚀 Iniciando análisis de 5to Básico...');
const resultado = analizarQuintoBasico();

if (resultado) {
    if (resultado.inconsistencias > 0) {
        console.log('\n🔧 [ACCIÓN REQUERIDA] Se encontraron inconsistencias');
        console.log('   Ejecuta: corregirQuintoBasico()');
    } else {
        console.log('\n✅ [OK] 5to Básico está correctamente configurado');
    }
    
    // Mostrar simulación del filtro
    simularFiltroQuintoBasico();
}

// Hacer funciones disponibles
window.analizarQuintoBasico = analizarQuintoBasico;
window.corregirQuintoBasico = corregirQuintoBasico;
window.simularFiltroQuintoBasico = simularFiltroQuintoBasico;

console.log('\n🛠️ [FUNCIONES ESPECÍFICAS PARA 5TO BÁSICO]:');
console.log('   • analizarQuintoBasico() - Análisis detallado');
console.log('   • corregirQuintoBasico() - Corregir inconsistencias');
console.log('   • simularFiltroQuintoBasico() - Ver qué debería mostrar el filtro');
