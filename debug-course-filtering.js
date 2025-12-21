/**
 * DIAGNÓSTICO AVANZADO: Verificar coincidencia de courseId y sectionId
 */

console.log('🔍 DIAGNÓSTICO AVANZADO: Verificando filtrado por curso y sección');
console.log('=================================================================');

const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

console.log('\n📊 ANÁLISIS COMPLETO:');
console.log('   • Total usuarios:', users.length);
console.log('   • Total asignaciones:', studentAssignments.length);

console.log('\n🎯 INFORMACIÓN DEL CURSO SELECCIONADO:');
const courseIdFormulario = '0880d4ca-7232-42dc-abef-1223e00a5c6e-a75b7e0e-1130-486a-ae5e-6f7233e002bf';
const sectionIdObjetivo = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
const courseIdReal = '0880d4ca-7232-42dc-abef-1223e00a5c6e';

console.log('   • CourseId del formulario:', courseIdFormulario);
console.log('   • SectionId objetivo:', sectionIdObjetivo);
console.log('   • CourseId real esperado:', courseIdReal);

console.log('\n🔍 ANÁLISIS DE ASIGNACIONES:');
studentAssignments.forEach((assignment, index) => {
    console.log(`${index + 1}. Estudiante ID: ${assignment.studentId}`);
    console.log(`   • CourseId en asignación: "${assignment.courseId}"`);
    console.log(`   • SectionId en asignación: "${assignment.sectionId}"`);
    console.log(`   • ¿Coincide courseId? ${assignment.courseId === courseIdFormulario ? '✅' : '❌'} (formulario)`);
    console.log(`   • ¿Coincide courseId? ${assignment.courseId === courseIdReal ? '✅' : '❌'} (real)`);
    console.log(`   • ¿Coincide sectionId? ${assignment.sectionId === sectionIdObjetivo ? '✅' : '❌'}`);
    console.log(`   • ¿Estudiante válido? ${users.find(u => u.id === assignment.studentId)?.username || 'NO ENCONTRADO'}`);
    console.log('');
});

console.log('\n🎯 FILTRADO ACTUAL (courseId formulario + sectionId):');
const filtradoActual = studentAssignments.filter(a => 
    a.sectionId === sectionIdObjetivo && 
    a.courseId === courseIdFormulario
);
console.log('   • Resultado:', filtradoActual.length, 'asignaciones');

console.log('\n🎯 FILTRADO ALTERNATIVO (courseId real + sectionId):');
const filtradoAlternativo = studentAssignments.filter(a => 
    a.sectionId === sectionIdObjetivo && 
    a.courseId === courseIdReal
);
console.log('   • Resultado:', filtradoAlternativo.length, 'asignaciones');

console.log('\n🎯 FILTRADO SOLO POR SECCIÓN:');
const filtradoSoloSeccion = studentAssignments.filter(a => 
    a.sectionId === sectionIdObjetivo
);
console.log('   • Resultado:', filtradoSoloSeccion.length, 'asignaciones');

console.log('\n🎯 CONCLUSIÓN:');
if (filtradoActual.length > 0) {
    console.log('✅ El filtrado actual debería funcionar');
} else if (filtradoAlternativo.length > 0) {
    console.log('✅ PROBLEMA: Los courseId no coinciden');
    console.log('💡 SOLUCIÓN: Usar courseId real, no el del formulario');
} else if (filtradoSoloSeccion.length > 0) {
    console.log('✅ PROBLEMA: Los courseId están mal configurados');
    console.log('💡 SOLUCIÓN: Corregir los courseId en las asignaciones');
} else {
    console.log('❌ PROBLEMA: No hay asignaciones para la sección específica');
}
