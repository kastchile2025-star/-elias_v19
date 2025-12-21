/**
 * DIAGNÓSTICO: Verificar roles de usuarios
 */

console.log('🔍 DIAGNÓSTICO: Verificando roles de usuarios');
console.log('=============================================');

const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

console.log('\n📊 ANÁLISIS DE ROLES:');
users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} - Role: "${user.role}" - ID: ${user.id}`);
});

console.log('\n🎯 ESTUDIANTES EN SECCIÓN ESPECÍFICA:');
const sectionIdObjetivo = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
const estudiantesEnSeccion = studentAssignments
    .filter(assignment => assignment.sectionId === sectionIdObjetivo)
    .map(assignment => assignment.studentId);

console.log(`   • IDs de estudiantes en sección: [${estudiantesEnSeccion.join(', ')}]`);

console.log('\n🔍 FILTROS DE COMPARACIÓN:');
console.log('   • Filtro actual: role === "estudiante"');
const conFiltroActual = users.filter(u => u.role === 'estudiante' && estudiantesEnSeccion.includes(u.id));
console.log(`   • Resultados con filtro actual: ${conFiltroActual.length} estudiantes`);

console.log('   • Filtro alternativo: role === "student"');
const conFiltroAlternativo = users.filter(u => u.role === 'student' && estudiantesEnSeccion.includes(u.id));
console.log(`   • Resultados con filtro alternativo: ${conFiltroAlternativo.length} estudiantes`);

console.log('   • Filtro combinado: role === "student" || role === "estudiante"');
const conFiltroCombinado = users.filter(u => (u.role === 'student' || u.role === 'estudiante') && estudiantesEnSeccion.includes(u.id));
console.log(`   • Resultados con filtro combinado: ${conFiltroCombinado.length} estudiantes`);

if (conFiltroCombinado.length > 0) {
    console.log('\n✅ ESTUDIANTES ENCONTRADOS CON FILTRO COMBINADO:');
    conFiltroCombinado.forEach((estudiante, index) => {
        console.log(`   ${index + 1}. ${estudiante.username} (${estudiante.displayName || estudiante.name}) - Role: "${estudiante.role}"`);
    });
}

console.log('\n🎯 CONCLUSIÓN:');
if (conFiltroAlternativo.length > 0) {
    console.log('✅ PROBLEMA IDENTIFICADO: Los usuarios tienen role "student", no "estudiante"');
    console.log('💡 SOLUCIÓN: Cambiar el filtro en el código a role === "student"');
} else if (conFiltroCombinado.length > 0) {
    console.log('✅ PROBLEMA IDENTIFICADO: Hay usuarios con diferentes roles');
    console.log('💡 SOLUCIÓN: Usar filtro combinado (student || estudiante)');
} else {
    console.log('❌ PROBLEMA MÁS COMPLEJO: Revisar otros filtros');
}
