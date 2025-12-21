/**
 * CORRECCIÓN RESPETUOSA: Verificar y preservar asignaciones según Gestión de Usuarios
 */

console.log('🔍 VERIFICACIÓN DE ASIGNACIONES SEGÚN GESTIÓN DE USUARIOS');
console.log('========================================================');

// Cargar datos actuales
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log('\n📊 ESTADO ACTUAL DEL SISTEMA:');
console.log('   • Usuarios:', users.length);
console.log('   • Asignaciones estudiantes:', studentAssignments.length);
console.log('   • Cursos:', courses.length);
console.log('   • Secciones:', sections.length);

// Identificar estudiantes
const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
console.log('\n👥 ESTUDIANTES EN EL SISTEMA:');
estudiantes.forEach((estudiante, index) => {
    console.log(`   ${index + 1}. ${estudiante.username} (${estudiante.displayName || estudiante.username})`);
    console.log(`      ID: ${estudiante.id}`);
    
    // Verificar si el estudiante tiene información de curso en su perfil
    if (estudiante.activeCourses && estudiante.activeCourses.length > 0) {
        console.log(`      👨‍🎓 Cursos activos (perfil): ${estudiante.activeCourses.join(', ')}`);
    }
    
    if (estudiante.courseId) {
        console.log(`      📚 CourseId (perfil): ${estudiante.courseId}`);
    }
    
    if (estudiante.sectionId) {
        console.log(`      🏫 SectionId (perfil): ${estudiante.sectionId}`);
    }
    
    // Verificar asignaciones en tabla student-assignments
    const asignaciones = studentAssignments.filter(sa => sa.studentId === estudiante.id);
    console.log(`      📋 Asignaciones en tabla: ${asignaciones.length}`);
    
    asignaciones.forEach((asignacion, idx) => {
        const curso = courses.find(c => c.id === asignacion.courseId);
        const seccion = sections.find(s => s.id === asignacion.sectionId);
        console.log(`         ${idx + 1}. Curso: ${curso?.name || 'NO ENCONTRADO'} - Sección: ${seccion?.name || 'NO ENCONTRADA'}`);
        console.log(`            CourseId: ${asignacion.courseId}`);
        console.log(`            SectionId: ${asignacion.sectionId}`);
    });
    
    console.log('      ---');
});

console.log('\n🔍 ANÁLISIS DE INCONSISTENCIAS:');

// Verificar inconsistencias entre perfil de usuario y asignaciones
let inconsistenciasEncontradas = 0;
let estudiantesSinAsignacion = 0;
let asignacionesIncorrectas = 0;

estudiantes.forEach(estudiante => {
    const asignaciones = studentAssignments.filter(sa => sa.studentId === estudiante.id);
    
    if (asignaciones.length === 0) {
        console.log(`   ❌ ${estudiante.username}: Sin asignaciones en tabla student-assignments`);
        estudiantesSinAsignacion++;
    } else if (asignaciones.length > 1) {
        console.log(`   ⚠️ ${estudiante.username}: Múltiples asignaciones (${asignaciones.length})`);
        inconsistenciasEncontradas++;
    }
    
    asignaciones.forEach(asignacion => {
        const curso = courses.find(c => c.id === asignacion.courseId);
        const seccion = sections.find(s => s.id === asignacion.sectionId);
        
        if (!curso) {
            console.log(`   ❌ ${estudiante.username}: Curso no encontrado (${asignacion.courseId})`);
            asignacionesIncorrectas++;
        }
        
        if (!seccion) {
            console.log(`   ❌ ${estudiante.username}: Sección no encontrada (${asignacion.sectionId})`);
            asignacionesIncorrectas++;
        }
        
        if (curso && seccion && seccion.courseId !== curso.id) {
            console.log(`   ❌ ${estudiante.username}: Sección no pertenece al curso asignado`);
            asignacionesIncorrectas++;
        }
    });
});

console.log('\n📊 RESUMEN DE PROBLEMAS:');
console.log(`   • Estudiantes sin asignación: ${estudiantesSinAsignacion}`);
console.log(`   • Inconsistencias encontradas: ${inconsistenciasEncontradas}`);
console.log(`   • Asignaciones incorrectas: ${asignacionesIncorrectas}`);

console.log('\n🏫 SECCIONES DISPONIBLES PARA ASIGNACIÓN:');
sections.forEach((seccion, index) => {
    const curso = courses.find(c => c.id === seccion.courseId);
    console.log(`   ${index + 1}. ${curso?.name || 'Curso sin nombre'} - Sección ${seccion.name}`);
    console.log(`      ID Sección: ${seccion.id}`);
    console.log(`      ID Curso: ${seccion.courseId}`);
    
    // Contar estudiantes asignados a esta sección
    const estudiantesEnSeccion = studentAssignments.filter(sa => sa.sectionId === seccion.id);
    console.log(`      👥 Estudiantes asignados: ${estudiantesEnSeccion.length}`);
    
    if (estudiantesEnSeccion.length > 0) {
        estudiantesEnSeccion.forEach(sa => {
            const estudiante = users.find(u => u.id === sa.studentId);
            console.log(`         - ${estudiante?.username || 'Usuario no encontrado'}`);
        });
    }
    console.log('      ---');
});

console.log('\n💡 PREGUNTA PARA EL ADMINISTRADOR:');
console.log('==================================');
console.log('❓ ¿Cuál es la asignación CORRECTA que debería tener cada estudiante?');
console.log('❓ ¿En qué parte del módulo de Gestión de Usuarios se define esto?');
console.log('');
console.log('📋 OPCIONES PARA CORREGIR:');
console.log('1. 🔍 Consultar el módulo de Gestión de Usuarios para ver las asignaciones correctas');
console.log('2. 📝 Proporcionar manualmente la distribución correcta de estudiantes');
console.log('3. 🔄 Verificar si hay información en los perfiles de usuario que indique su sección');
console.log('');
console.log('⚠️ NO procederé con cambios automáticos hasta confirmar las asignaciones correctas');
console.log('   según lo establecido en Gestión de Usuarios.');

// Función auxiliar para aplicar correcciones (NO se ejecuta automáticamente)
console.log('\n🛠️ FUNCIÓN DE CORRECCIÓN DISPONIBLE:');
console.log('====================================');
console.log('function aplicarAsignacionesCorrectas(asignacionesCorrectas) {');
console.log('   // asignacionesCorrectas debe ser un array con formato:');
console.log('   // [');
console.log('   //   { username: "felipe", courseId: "curso-5to-basico", sectionId: "seccion-5to-a" },');
console.log('   //   { username: "maria", courseId: "curso-5to-basico", sectionId: "seccion-5to-a" },');
console.log('   //   etc...');
console.log('   // ]');
console.log('}');
console.log('');
console.log('📋 Para aplicar las correcciones correctas, necesito que proporciones');
console.log('   la distribución exacta según el módulo de Gestión de Usuarios.');
