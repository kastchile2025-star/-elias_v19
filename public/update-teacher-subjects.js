// Script para actualizar profesores con múltiples asignaturas
console.log('🔄 ACTUALIZANDO PROFESORES CON MÚLTIPLES ASIGNATURAS...');

function actualizarAsignaturasProfesores() {
    console.log('\n📋 INICIANDO ACTUALIZACIÓN DE ASIGNATURAS...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Definir asignaturas por profesor
    const asignacionesProfesores = {
        'jorge': ['Matemáticas', 'Lenguaje y Comunicación'],
        'carlos': ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales'],
        'pedro': ['Matemáticas', 'Ciencias Naturales', 'Educación Física']
    };
    
    let profesoresActualizados = 0;
    
    console.log('\n👨‍🏫 Actualizando profesores...');
    
    users.forEach((user, index) => {
        if (user.role === 'teacher' && asignacionesProfesores[user.username]) {
            const asignaturasProfesor = asignacionesProfesores[user.username];
            
            console.log(`📝 Actualizando ${user.username} con asignaturas: ${asignaturasProfesor.join(', ')}`);
            
            // Actualizar teachingAssignments con múltiples asignaturas
            users[index].teachingAssignments = asignaturasProfesor.map(asignatura => ({
                teacherUsername: user.username,
                teacherName: user.name || user.username,
                subject: asignatura,
                courses: ['4to Básico']
            }));
            
            profesoresActualizados++;
        }
    });
    
    // Guardar cambios
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    console.log(`\n🎉 ACTUALIZACIÓN COMPLETADA:`);
    console.log(`   - Profesores actualizados: ${profesoresActualizados}`);
    
    return { profesoresActualizados };
}

// Función para verificar las asignaturas de los profesores
function verificarAsignaturasProfesores() {
    console.log('\n🔍 VERIFICANDO ASIGNATURAS DE PROFESORES...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const profesores = users.filter(u => u.role === 'teacher');
    
    profesores.forEach(profesor => {
        console.log(`\n👨‍🏫 ${profesor.name} (${profesor.username}):`);
        
        if (profesor.teachingAssignments && Array.isArray(profesor.teachingAssignments)) {
            console.log(`   📚 Asignaturas asignadas: ${profesor.teachingAssignments.length}`);
            profesor.teachingAssignments.forEach((assignment, index) => {
                console.log(`     ${index + 1}. ${assignment.subject} - ${(assignment.courses || []).join(', ')}`);
            });
        } else {
            console.log('   ⚠️ No tiene asignaturas asignadas');
        }
    });
    
    return profesores;
}

// Ejecutar actualización
console.log('🚀 Ejecutando actualización de asignaturas...');
const resultado = actualizarAsignaturasProfesores();

// Verificar resultados
console.log('\n🔍 Verificando asignaturas después de la actualización...');
verificarAsignaturasProfesores();

// Exponer funciones
window.actualizarAsignaturasProfesores = actualizarAsignaturasProfesores;
window.verificarAsignaturasProfesores = verificarAsignaturasProfesores;

console.log('\n💡 Funciones disponibles:');
console.log('- actualizarAsignaturasProfesores() - Actualizar asignaturas de profesores');
console.log('- verificarAsignaturasProfesores() - Ver asignaturas actuales');
