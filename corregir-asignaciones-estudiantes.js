/**
 * CORRECCIÓN DE ASIGNACIONES: Redistribuir estudiantes según requerimiento del profesor
 */

console.log('🔧 INICIANDO CORRECCIÓN DE ASIGNACIONES DE ESTUDIANTES');
console.log('========================================================');

// Obtener datos actuales
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');

console.log('\n📊 ESTADO ACTUAL:');
console.log('   • Total asignaciones:', studentAssignments.length);

// IDs relevantes
const seccionA_5to = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf'; // 5to Básico Sección A
const seccionB_5to = '687d5963-9507-4753-9bc9-ff07b3a9b4aa';  // 5to Básico Sección B
const curso_5to = '0880d4ca-7232-42dc-abef-1223e00a5c6e';     // 5to Básico

console.log('\n🎯 CONFIGURACIÓN:');
console.log('   • Sección A (pedro - 2 estudiantes):', seccionA_5to);
console.log('   • Sección B (otros 4 estudiantes):', seccionB_5to);
console.log('   • Curso 5to Básico:', curso_5to);

// Estudiantes actuales en sección A
const estudiantesSeccionA = studentAssignments.filter(a => 
    a.sectionId === seccionA_5to && a.courseId === curso_5to
);

console.log('\n👥 ESTUDIANTES ACTUALES EN SECCIÓN A:');
estudiantesSeccionA.forEach((assignment, index) => {
    const estudiante = users.find(u => u.id === assignment.studentId);
    console.log(`   ${index + 1}. ${estudiante?.username || 'NO ENCONTRADO'} (ID: ${assignment.studentId})`);
});

// REDISTRIBUCIÓN:
// - Felipe y Maria se quedan en Sección A (pedro)
// - Sofia, Karla, Gustavo y Max van a Sección B

const estudiantesParaSeccionA = ['felipe', 'maria']; // Solo estos 2 para pedro
const estudiantesIds = {
    'felipe': '0b03b742-dde9-427e-9774-35d4783e6e7a',
    'maria': '6c11408c-d51c-4635-b0ad-fc4fdb9f6446',
    'sofia': 'fe02f91a-582d-4130-a2bd-177acd63e2a3',
    'karla': '4a523c76-58f7-4727-ae11-b0a4f325aeaa',
    'gustavo': '462d161c-c9c3-4297-9ca8-309153cd6f68',
    'max': 'ce2532d0-edd5-4756-95f5-92a1ebe4c109'
};

console.log('\n🔄 APLICANDO REDISTRIBUCIÓN:');

// Actualizar asignaciones
const asignacionesActualizadas = studentAssignments.map(assignment => {
    // Solo procesar asignaciones de 5to básico
    if (assignment.courseId === curso_5to && assignment.sectionId === seccionA_5to) {
        const estudiante = users.find(u => u.id === assignment.studentId);
        const username = estudiante?.username;
        
        if (estudiantesParaSeccionA.includes(username)) {
            // Felipe y Maria se quedan en Sección A
            console.log(`   ✅ ${username} permanece en Sección A (pedro)`);
            return assignment; // Sin cambios
        } else {
            // Los demás van a Sección B
            console.log(`   🔄 ${username} movido a Sección B`);
            return {
                ...assignment,
                sectionId: seccionB_5to
            };
        }
    }
    
    // Otras asignaciones sin cambios
    return assignment;
});

console.log('\n💾 GUARDANDO CAMBIOS...');

// Guardar en localStorage
localStorage.setItem('smart-student-student-assignments', JSON.stringify(asignacionesActualizadas));

console.log('✅ CORRECCIÓN COMPLETADA!');

// Verificar resultado
const verificacion = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

const seccionA_final = verificacion.filter(a => 
    a.sectionId === seccionA_5to && a.courseId === curso_5to
);

const seccionB_final = verificacion.filter(a => 
    a.sectionId === seccionB_5to && a.courseId === curso_5to
);

console.log('\n🎯 RESULTADO FINAL:');
console.log('   📚 Sección A (pedro):');
seccionA_final.forEach((assignment, index) => {
    const estudiante = users.find(u => u.id === assignment.studentId);
    console.log(`      ${index + 1}. ${estudiante?.username || 'NO ENCONTRADO'}`);
});

console.log('   📚 Sección B:');
seccionB_final.forEach((assignment, index) => {
    const estudiante = users.find(u => u.id === assignment.studentId);
    console.log(`      ${index + 1}. ${estudiante?.username || 'NO ENCONTRADO'}`);
});

console.log('\n🎉 PEDRO AHORA TIENE SOLO 2 ESTUDIANTES EN SU SECCIÓN!');
console.log('   Recarga la página para ver los cambios aplicados.');
