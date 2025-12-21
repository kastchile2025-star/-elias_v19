/**
 * 🔍 VERIFICAR ESTADO ACTUAL DEL PROBLEMA
 * 
 * Este script te ayudará a ver exactamente qué está pasando
 * con los datos de estudiantes entre admin y profesor
 */

console.log('🔍 VERIFICACIÓN DEL ESTADO ACTUAL');

// Función para verificar datos en localStorage
function verificarEstado() {
    console.log('\n📊 DATOS ACTUALES EN LOCALSTORAGE:');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log(`   • ${users.length} usuarios total`);
    console.log(`   • ${studentAssignments.length} asignaciones de estudiantes`);
    console.log(`   • ${courses.length} cursos`);
    console.log(`   • ${sections.length} secciones`);
    
    // Verificar estudiantes
    const students = users.filter(u => u.role === 'student');
    console.log(`\n👥 ESTUDIANTES (${students.length}):`);
    
    students.forEach(student => {
        console.log(`   👤 ${student.displayName || student.username}:`);
        console.log(`      • ID: ${student.id}`);
        console.log(`      • activeCourses: ${JSON.stringify(student.activeCourses || [])}`);
        console.log(`      • sectionName: "${student.sectionName || 'N/A'}"`);
    });
    
    // Verificar 5to Básico específicamente
    const quintoBasico = courses.find(c => c.name === '5to Básico');
    if (quintoBasico) {
        console.log(`\n📖 CURSO: 5to Básico (ID: ${quintoBasico.id})`);
        
        const secciones5to = sections.filter(s => s.courseId === quintoBasico.id);
        console.log(`   Secciones encontradas: ${secciones5to.length}`);
        
        secciones5to.forEach(seccion => {
            console.log(`\n   📚 SECCIÓN ${seccion.name} (ID: ${seccion.id}):`);
            
            // Estudiantes asignados según student-assignments
            const estudiantesAsignados = studentAssignments
                .filter(a => a.courseId === quintoBasico.id && a.sectionId === seccion.id)
                .map(a => {
                    const student = users.find(u => u.id === a.studentId);
                    return {
                        name: student ? (student.displayName || student.username) : 'Desconocido',
                        id: a.studentId,
                        student
                    };
                });
            
            console.log(`      Según student-assignments: ${estudiantesAsignados.length} estudiantes`);
            estudiantesAsignados.forEach(est => {
                console.log(`         • ${est.name} (ID: ${est.id})`);
            });
            
            // Estudiantes según perfiles
            const estudiantesPerfiles = students.filter(student => {
                const activeCourses = student.activeCourses || [];
                return activeCourses.some(course => 
                    course.includes('5to Básico') && course.includes(`Sección ${seccion.name}`)
                );
            });
            
            console.log(`      Según perfiles usuarios: ${estudiantesPerfiles.length} estudiantes`);
            estudiantesPerfiles.forEach(est => {
                console.log(`         • ${est.displayName || est.username} (ID: ${est.id})`);
            });
            
            // Detectar inconsistencias
            if (estudiantesAsignados.length !== estudiantesPerfiles.length) {
                console.log(`      ⚠️ INCONSISTENCIA DETECTADA!`);
                console.log(`         Asignaciones: ${estudiantesAsignados.length} vs Perfiles: ${estudiantesPerfiles.length}`);
            }
        });
    }
    
    console.log('\n🔍 ANÁLISIS COMPLETADO');
    console.log('📝 Si ves inconsistencias, ejecuta el script de sincronización');
}

// Ejecutar verificación
verificarEstado();

// Hacer función disponible globalmente
window.verificarEstado = verificarEstado;

console.log('\n📋 FUNCIÓN DISPONIBLE: verificarEstado()');
