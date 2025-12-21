/**
 * 👥 VERIFICAR GESTIÓN DE USUARIOS
 * 
 * Script para revisar todas las asignaciones y encontrar discrepancias.
 */

console.log('👥 VERIFICANDO GESTIÓN DE USUARIOS...');
console.log('===================================');

function verificarGestionUsuarios() {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('📊 RESUMEN DEL SISTEMA:');
        console.log('======================');
        console.log(`Total usuarios: ${users.length}`);
        console.log(`Total estudiantes: ${users.filter(u => u.role === 'student').length}`);
        console.log(`Total profesores: ${users.filter(u => u.role === 'teacher').length}`);
        console.log(`Total cursos: ${courses.length}`);
        console.log(`Total secciones: ${sections.length}`);
        console.log(`Total asignaciones: ${studentAssignments.length}`);

        console.log('\n👥 TODOS LOS ESTUDIANTES Y SUS ASIGNACIONES:');
        console.log('===========================================');

        const estudiantes = users.filter(u => u.role === 'student');
        
        estudiantes.forEach((estudiante, index) => {
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            console.log(`\n${index + 1}. ${estudiante.username.toUpperCase()}`);
            console.log(`   ID: ${estudiante.id}`);
            console.log(`   Nombre: ${estudiante.fullName || 'No definido'}`);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                const cursoCompleto = `${curso?.name || 'Curso no encontrado'} - Sección ${seccion?.name || 'Sección no encontrada'}`;
                
                console.log(`   📚 Asignación oficial: ${cursoCompleto}`);
                console.log(`   🏷️ Perfil muestra: ${JSON.stringify(estudiante.activeCourses || [])}`);
                console.log(`   📅 Asignado: ${asignacion.createdAt || 'No definido'}`);
                console.log(`   🤖 Auto-creado: ${asignacion.autoCreated || false}`);
                
                // Verificar sincronización
                const perfilCorrecto = estudiante.activeCourses && 
                                     estudiante.activeCourses.includes(cursoCompleto);
                
                if (perfilCorrecto) {
                    console.log(`   ✅ Sincronizado correctamente`);
                } else {
                    console.log(`   ❌ DESINCRONIZADO - Necesita corrección`);
                }
            } else {
                console.log(`   ❌ SIN ASIGNACIÓN en gestión de usuarios`);
                console.log(`   🏷️ Perfil muestra: ${JSON.stringify(estudiante.activeCourses || [])}`);
            }
        });

        console.log('\n🔍 ESTUDIANTES CON PROBLEMAS:');
        console.log('============================');
        
        let problemasEncontrados = false;
        
        estudiantes.forEach(estudiante => {
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (!asignacion) {
                console.log(`❌ ${estudiante.username}: Sin asignación oficial`);
                problemasEncontrados = true;
            } else {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                const cursoCompleto = `${curso?.name} - Sección ${seccion?.name}`;
                
                const perfilCorrecto = estudiante.activeCourses && 
                                     estudiante.activeCourses.includes(cursoCompleto);
                
                if (!perfilCorrecto) {
                    console.log(`❌ ${estudiante.username}: Perfil desincronizado`);
                    console.log(`   Oficial: ${cursoCompleto}`);
                    console.log(`   Perfil: ${JSON.stringify(estudiante.activeCourses)}`);
                    problemasEncontrados = true;
                }
            }
        });
        
        if (!problemasEncontrados) {
            console.log('✅ Todos los estudiantes están correctamente sincronizados');
        }

        console.log('\n💡 COMANDOS DISPONIBLES:');
        console.log('========================');
        console.log('- corregirTodosLosEstudiantes() - Sincronizar todos automáticamente');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

function corregirTodosLosEstudiantes() {
    try {
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

        console.log('🔧 CORRIGIENDO TODOS LOS ESTUDIANTES...');
        console.log('======================================');

        let corregidos = 0;
        
        const estudiantes = users.filter(u => u.role === 'student');
        
        estudiantes.forEach(estudiante => {
            const asignacion = studentAssignments.find(a => a.studentId === estudiante.id);
            
            if (asignacion) {
                const curso = courses.find(c => c.id === asignacion.courseId);
                const seccion = sections.find(s => s.id === asignacion.sectionId);
                
                if (curso && seccion) {
                    const cursoCompleto = `${curso.name} - Sección ${seccion.name}`;
                    
                    // Actualizar perfil
                    estudiante.activeCourses = [cursoCompleto];
                    corregidos++;
                    
                    console.log(`✅ ${estudiante.username}: ${cursoCompleto}`);
                }
            }
        });

        // Guardar cambios
        localStorage.setItem('smart-student-users', JSON.stringify(users));

        console.log(`\n🎉 CORRECCIÓN COMPLETADA:`);
        console.log(`   Estudiantes corregidos: ${corregidos}`);
        console.log('   Recarga la página para ver los cambios');

    } catch (error) {
        console.error('❌ Error al corregir:', error);
    }
}

// Ejecutar verificación automáticamente
verificarGestionUsuarios();
