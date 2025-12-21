/**
 * 🔄 CORRECCIÓN DINÁMICA COMPLETA
 * 
 * Elimina TODOS los valores hardcodeados y sincroniza dinámicamente
 * con las asignaciones reales de Gestión de Usuarios.
 */

console.log('🔄 CORRECCIÓN DINÁMICA COMPLETA...');
console.log('==================================');

function corregirAsignacionesDinamicas() {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 ESTADO ANTES DE LA CORRECCIÓN:');
        console.log('=================================');

        const estudiantes = users.filter(u => u.role === 'student');
        
        console.log('\n🔍 REVISANDO CADA ESTUDIANTE:');
        estudiantes.forEach((estudiante, index) => {
            console.log(`\n${index + 1}. ${estudiante.username.toUpperCase()}`);
            console.log(`   Perfil actual: ${JSON.stringify(estudiante.activeCourses || [])}`);
            
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                console.log(`   Gestión dice: ${curso?.name} - Sección ${seccion?.name}`);
            } else {
                console.log(`   ❌ Sin asignación en gestión`);
            }
        });

        console.log('\n🔧 APLICANDO CORRECCIÓN DINÁMICA...');
        console.log('====================================');

        let corregidos = 0;
        let sinAsignacion = 0;

        estudiantes.forEach(estudiante => {
            // Buscar la asignación oficial en gestión de usuarios
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (curso && seccion) {
                    // APLICAR ASIGNACIÓN DINÁMICA REAL
                    const cursoReal = `${curso.name} - Sección ${seccion.name}`;
                    
                    // Limpiar CUALQUIER valor anterior (eliminar hardcodeo)
                    estudiante.activeCourses = [cursoReal];
                    
                    console.log(`✅ ${estudiante.username}: ${cursoReal}`);
                    corregidos++;
                } else {
                    console.log(`⚠️ ${estudiante.username}: Asignación apunta a curso/sección inexistente`);
                    // Limpiar datos incorrectos
                    estudiante.activeCourses = [];
                }
            } else {
                console.log(`❌ ${estudiante.username}: Sin asignación oficial - LIMPIANDO perfil`);
                // Eliminar cualquier valor hardcodeado si no hay asignación
                estudiante.activeCourses = [];
                sinAsignacion++;
            }
        });

        // Guardar cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));

        console.log('\n🎉 CORRECCIÓN COMPLETADA:');
        console.log('=========================');
        console.log(`✅ Estudiantes corregidos: ${corregidos}`);
        console.log(`⚠️ Sin asignación oficial: ${sinAsignacion}`);
        console.log(`📋 Total procesados: ${estudiantes.length}`);

        console.log('\n📊 ESTADO DESPUÉS DE LA CORRECCIÓN:');
        console.log('===================================');

        // Mostrar resultado final
        const usuariosActualizados = JSON.parse(localStorage.getItem('smart-student-users'));
        const estudiantesActualizados = usuariosActualizados.filter(u => u.role === 'student');
        
        estudiantesActualizados.forEach((estudiante, index) => {
            console.log(`${index + 1}. ${estudiante.username}: ${JSON.stringify(estudiante.activeCourses)}`);
        });

        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. Recarga la página completamente (Ctrl+F5)');
        console.log('2. Verifica los perfiles de Gustavo y Max');
        console.log('3. Deberían mostrar exactamente lo que está en Gestión de Usuarios');

        return true;

    } catch (error) {
        console.error('❌ ERROR en corrección dinámica:', error);
        return false;
    }
}

function verificarQuedoDinamico() {
    try {
        console.log('\n🔍 VERIFICACIÓN FINAL DE DINAMISMO:');
        console.log('===================================');

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        const estudiantes = users.filter(u => u.role === 'student');
        let todoCorreto = true;

        estudiantes.forEach(estudiante => {
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                const cursoEsperado = `${curso?.name} - Sección ${seccion?.name}`;
                
                const perfilActual = estudiante.activeCourses?.[0] || 'Sin curso';
                
                if (perfilActual === cursoEsperado) {
                    console.log(`✅ ${estudiante.username}: DINÁMICO - ${perfilActual}`);
                } else {
                    console.log(`❌ ${estudiante.username}: PROBLEMA`);
                    console.log(`   Esperado: ${cursoEsperado}`);
                    console.log(`   Actual: ${perfilActual}`);
                    todoCorreto = false;
                }
            } else {
                const perfilActual = estudiante.activeCourses || [];
                if (perfilActual.length === 0) {
                    console.log(`✅ ${estudiante.username}: CORRECTO - Sin asignación oficial`);
                } else {
                    console.log(`❌ ${estudiante.username}: Tiene datos sin asignación oficial`);
                    todoCorreto = false;
                }
            }
        });

        if (todoCorreto) {
            console.log('\n🎉 ¡PERFECTO! Todo está dinámico y sincronizado');
        } else {
            console.log('\n⚠️ Aún hay problemas. Ejecuta corregirAsignacionesDinamicas() otra vez');
        }

        return todoCorreto;

    } catch (error) {
        console.error('❌ Error en verificación:', error);
        return false;
    }
}

// CASO ESPECÍFICO: Verificar Gustavo y Max
function verificarGustavoYMax() {
    try {
        console.log('\n🎯 VERIFICACIÓN ESPECÍFICA: GUSTAVO Y MAX');
        console.log('=========================================');

        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        ['gustavo', 'max'].forEach(username => {
            const usuario = users.find(u => u.username === username);
            if (!usuario) {
                console.log(`❌ ${username}: No encontrado`);
                return;
            }

            const asignacion = studentAssignments.find(a => a.studentId === usuario.id);
            if (!asignacion) {
                console.log(`❌ ${username}: Sin asignación en gestión`);
                return;
            }

            const curso = courses.find(c => c.id === asignacion.courseId);
            const seccion = sections.find(s => s.id === asignacion.sectionId);
            
            console.log(`\n👤 ${username.toUpperCase()}:`);
            console.log(`   Gestión de Usuarios: ${curso?.name} - Sección ${seccion?.name}`);
            console.log(`   Perfil muestra: ${JSON.stringify(usuario.activeCourses || [])}`);
            
            const esperado = `${curso?.name} - Sección ${seccion?.name}`;
            const actual = usuario.activeCourses?.[0];
            
            if (actual === esperado) {
                console.log(`   ✅ CORRECTO - Está dinámico`);
            } else {
                console.log(`   ❌ INCORRECTO - Necesita corrección`);
            }
        });

    } catch (error) {
        console.error('❌ Error verificando Gustavo y Max:', error);
    }
}

// Ejecutar corrección automáticamente
console.log('🚀 INICIANDO CORRECCIÓN DINÁMICA...');
corregirAsignacionesDinamicas();

console.log('\n💡 COMANDOS DISPONIBLES:');
console.log('========================');
console.log('- verificarQuedoDinamico() - Verificar que todo esté dinámico');
console.log('- verificarGustavoYMax() - Verificar específicamente estos usuarios');
console.log('- corregirAsignacionesDinamicas() - Ejecutar corrección otra vez');
