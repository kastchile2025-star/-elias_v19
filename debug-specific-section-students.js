/**
 * DIAGNÓSTICO ESPECÍFICO: Estudiantes por sección específica
 */

console.log('🔍 DIAGNÓSTICO ESPECÍFICO: ¿Qué estudiantes deberían aparecer para "5to Básico Sección A"?');
console.log('======================================================================================');

const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log('\n📊 INFORMACIÓN DEL SISTEMA:');
console.log('   • Total usuarios:', users.length);
console.log('   • Total asignaciones de estudiantes:', studentAssignments.length);
console.log('   • Total cursos:', courses.length);
console.log('   • Total secciones:', sections.length);

console.log('\n🔍 ANÁLISIS DE ESTUDIANTES POR SECCIÓN:');

// Mostrar todos los estudiantes con sus secciones
const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
console.log('\n👥 TODOS LOS ESTUDIANTES EN EL SISTEMA:');
estudiantes.forEach((estudiante, index) => {
    const asignaciones = studentAssignments.filter(a => a.studentId === estudiante.id);
    console.log(`${index + 1}. ${estudiante.displayName || estudiante.username} (${estudiante.username})`);
    console.log(`   • ID: ${estudiante.id}`);
    console.log(`   • Asignaciones:`, asignaciones.length);
    
    asignaciones.forEach((asignacion, idx) => {
        const seccion = sections.find(s => s.id === asignacion.sectionId);
        const curso = courses.find(c => c.id === asignacion.courseId);
        console.log(`     ${idx + 1}. Curso: ${curso?.name || asignacion.courseId}`);
        console.log(`        Sección: ${seccion?.name || asignacion.sectionId}`);
        console.log(`        SectionId: ${asignacion.sectionId}`);
        console.log(`        CourseId: ${asignacion.courseId}`);
    });
    console.log('');
});

console.log('\n🎯 FILTRO ESPECÍFICO PARA "5to Básico Sección A":');

// Encontrar el sectionId específico para "5to Básico Sección A"
const seccion5toA = sections.find(s => s.name && s.name.includes('5to') && s.name.includes('A'));
console.log('   • Sección encontrada:', seccion5toA);

if (seccion5toA) {
    console.log('   • SectionId objetivo:', seccion5toA.id);
    
    // Buscar curso de 5to Básico
    const curso5to = courses.find(c => c.name && c.name.includes('5to'));
    console.log('   • Curso encontrado:', curso5to);
    
    if (curso5to) {
        console.log('   • CourseId objetivo:', curso5to.id);
        
        // Filtrar estudiantes específicos de esta combinación
        const estudiantesEspecificos = studentAssignments.filter(a => 
            a.sectionId === seccion5toA.id && a.courseId === curso5to.id
        );
        
        console.log('\n✅ ESTUDIANTES QUE DEBERÍAN APARECER:');
        console.log('   • Total encontrados:', estudiantesEspecificos.length);
        
        estudiantesEspecificos.forEach((asignacion, index) => {
            const estudiante = users.find(u => u.id === asignacion.studentId);
            console.log(`   ${index + 1}. ${estudiante?.displayName || 'NO ENCONTRADO'} (ID: ${asignacion.studentId})`);
        });
        
        if (estudiantesEspecificos.length === 0) {
            console.log('   ❌ NO HAY ESTUDIANTES asignados a esta combinación específica');
            console.log('\n🔍 VERIFICANDO ASIGNACIONES EXISTENTES:');
            console.log('   • Asignaciones por sección:', studentAssignments.filter(a => a.sectionId === seccion5toA.id));
            console.log('   • Asignaciones por curso:', studentAssignments.filter(a => a.courseId === curso5to.id));
        }
    } else {
        console.log('   ❌ No se encontró curso de 5to Básico');
    }
} else {
    console.log('   ❌ No se encontró sección "5to Básico Sección A"');
    console.log('\n🔍 SECCIONES DISPONIBLES:');
    sections.forEach(s => console.log('   -', s.name, '(ID:', s.id, ')'));
}

console.log('\n🎯 CONCLUSIÓN:');
console.log('Este diagnóstico muestra exactamente qué estudiantes deberían aparecer para el profesor en "5to Básico Sección A"');
