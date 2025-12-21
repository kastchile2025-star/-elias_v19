/**
 * CORRECCIÓN DE ASIGNACIONES: Redistribuir estudiantes a sus secciones correctas
 */

console.log('🔧 CORRECCIÓN DE ASIGNACIONES DE ESTUDIANTES');
console.log('============================================');

// Cargar datos actuales
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log('\n📊 ESTADO ACTUAL:');
console.log('   • Usuarios:', users.length);
console.log('   • Asignaciones estudiantes:', studentAssignments.length);
console.log('   • Cursos:', courses.length);
console.log('   • Secciones:', sections.length);

// Identificar estudiantes
const estudiantes = users.filter(u => u.role === 'student' || u.role === 'estudiante');
console.log('\n👥 ESTUDIANTES ENCONTRADOS:');
estudiantes.forEach((estudiante, index) => {
    console.log(`   ${index + 1}. ${estudiante.username} (${estudiante.displayName || estudiante.username})`);
});

// Identificar secciones de 5to Básico disponibles
const curso5to = courses.find(c => c.id === '0880d4ca-7232-42dc-abef-1223e00a5c6e');
const secciones5to = sections.filter(s => s.courseId === '0880d4ca-7232-42dc-abef-1223e00a5c6e');

console.log('\n🏫 CURSO Y SECCIONES DE 5TO BÁSICO:');
console.log('   Curso:', curso5to?.name, '(ID:', curso5to?.id, ')');
console.log('   Secciones disponibles:');
secciones5to.forEach((seccion, index) => {
    console.log(`     ${index + 1}. Sección ${seccion.name} (ID: ${seccion.id})`);
});

// Propuesta de redistribución equilibrada
console.log('\n💡 PROPUESTA DE REDISTRIBUCIÓN:');
console.log('   Distribuir 6 estudiantes en 2 secciones (A y B):');
console.log('   • Sección A: 3 estudiantes (felipe, maria, sofia)');
console.log('   • Sección B: 3 estudiantes (karla, gustavo, max)');

// Encontrar las secciones A y B de 5to Básico
const seccionA = secciones5to.find(s => s.name === 'A');
const seccionB = secciones5to.find(s => s.name === 'B');

if (!seccionA || !seccionB) {
    console.log('❌ ERROR: No se encontraron las secciones A y B de 5to Básico');
    console.log('   Sección A encontrada:', !!seccionA);
    console.log('   Sección B encontrada:', !!seccionB);
} else {
    console.log('\n✅ SECCIONES IDENTIFICADAS:');
    console.log('   • Sección A ID:', seccionA.id);
    console.log('   • Sección B ID:', seccionB.id);
    
    // Crear nuevas asignaciones
    const nuevasAsignaciones = [
        // Sección A (felipe, maria, sofia)
        {
            studentId: estudiantes.find(e => e.username === 'felipe')?.id,
            courseId: '0880d4ca-7232-42dc-abef-1223e00a5c6e',
            sectionId: seccionA.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        },
        {
            studentId: estudiantes.find(e => e.username === 'maria')?.id,
            courseId: '0880d4ca-7232-42dc-abef-1223e00a5c6e',
            sectionId: seccionA.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        },
        {
            studentId: estudiantes.find(e => e.username === 'sofia')?.id,
            courseId: '0880d4ca-7232-42dc-abef-1223e00a5c6e',
            sectionId: seccionA.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        },
        // Sección B (karla, gustavo, max)
        {
            studentId: estudiantes.find(e => e.username === 'karla')?.id,
            courseId: '0880d4ca-7232-42dc-abef-1223e00a5c6e',
            sectionId: seccionB.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        },
        {
            studentId: estudiantes.find(e => e.username === 'gustavo')?.id,
            courseId: '0880d4ca-7232-42dc-abef-1223e00a5c6e',
            sectionId: seccionB.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        },
        {
            studentId: estudiantes.find(e => e.username === 'max')?.id,
            courseId: '0880d4ca-7232-42dc-abef-1223e00a5c6e',
            sectionId: seccionB.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }
    ];
    
    console.log('\n🔄 APLICANDO CORRECCIÓN...');
    
    // Guardar las nuevas asignaciones
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(nuevasAsignaciones));
    
    console.log('✅ CORRECCIÓN APLICADA EXITOSAMENTE');
    console.log('\n📋 NUEVA DISTRIBUCIÓN:');
    console.log('   Sección A (felipe, maria, sofia):');
    console.log('     • felipe ->', estudiantes.find(e => e.username === 'felipe')?.id);
    console.log('     • maria ->', estudiantes.find(e => e.username === 'maria')?.id);
    console.log('     • sofia ->', estudiantes.find(e => e.username === 'sofia')?.id);
    console.log('   Sección B (karla, gustavo, max):');
    console.log('     • karla ->', estudiantes.find(e => e.username === 'karla')?.id);
    console.log('     • gustavo ->', estudiantes.find(e => e.username === 'gustavo')?.id);
    console.log('     • max ->', estudiantes.find(e => e.username === 'max')?.id);
    
    console.log('\n🎯 RESULTADO:');
    console.log('   • Profesor pedro asignado a Sección A tendrá 3 estudiantes');
    console.log('   • Los otros 3 estudiantes están en Sección B');
    console.log('   • Cada sección tiene una distribución equilibrada');
    
    console.log('\n🔄 REINICIA LA PÁGINA para ver los cambios aplicados');
}

console.log('\n📝 NOTA: Si necesitas una distribución diferente (ej: 2 en A, 4 en B), ');
console.log('         modifica el script antes de ejecutarlo nuevamente.');
