/**
 * 🔧 VERIFICACIÓN: Corrección de Estudiantes Inventados vs Reales
 * Ejecutar en la consola del navegador para verificar la corrección
 */

console.log('🔧 VERIFICACIÓN: Estudiantes Reales vs Inventados');
console.log('===============================================');

// 1. Verificar estudiantes reales en Gestión de Usuarios
console.log('\n👥 ESTUDIANTES REALES EN GESTIÓN DE USUARIOS:');

const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const realStudents = allUsers.filter(u => u.role === 'student' || u.role === 'estudiante');

console.log(`   Total estudiantes reales: ${realStudents.length}`);
realStudents.forEach((student, index) => {
    console.log(`   ${index + 1}. ${student.displayName || student.username} (ID: ${student.id})`);
});

// 2. Verificar asignaciones de estudiantes por sección
console.log('\n📋 ASIGNACIONES DE ESTUDIANTES POR SECCIÓN:');

const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
console.log(`   Total asignaciones: ${studentAssignments.length}`);

// Agrupar por sección
const assignmentsBySectionId = studentAssignments.reduce((acc, assignment) => {
    const sectionId = assignment.sectionId;
    if (!acc[sectionId]) {
        acc[sectionId] = [];
    }
    acc[sectionId].push(assignment);
    return acc;
}, {});

const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');

Object.keys(assignmentsBySectionId).forEach(sectionId => {
    const section = sections.find(s => s.id === sectionId);
    const assignments = assignmentsBySectionId[sectionId];
    
    if (section) {
        const course = courses.find(c => c.id === section.courseId);
        const courseName = course ? course.name : section.courseId;
        
        console.log(`   📚 ${courseName} Sección ${section.name}:`);
        assignments.forEach(assignment => {
            const student = realStudents.find(s => s.id === assignment.studentId);
            const studentName = student ? student.displayName || student.username : `ID: ${assignment.studentId}`;
            console.log(`      • ${studentName}`);
        });
    }
});

// 3. Función para probar obtención de estudiantes
window.testStudentRetrieval = function(courseSectionId) {
    console.log(`\n🧪 PROBANDO OBTENCIÓN DE ESTUDIANTES PARA: ${courseSectionId}`);
    
    // Simular extracción de courseId y sectionId
    const parts = courseSectionId.split('-');
    if (parts.length >= 10) {
        const courseId = parts.slice(0, 5).join('-');
        const sectionId = parts.slice(5).join('-');
        
        console.log(`   CourseId: ${courseId}`);
        console.log(`   SectionId: ${sectionId}`);
        
        // Buscar asignaciones para esta sección específica
        const relevantAssignments = studentAssignments.filter(assignment => 
            assignment.courseId === courseId && assignment.sectionId === sectionId
        );
        
        console.log(`   Asignaciones encontradas: ${relevantAssignments.length}`);
        
        if (relevantAssignments.length > 0) {
            console.log('   ✅ ESTUDIANTES REALES QUE SE ASIGNARÍAN:');
            relevantAssignments.forEach(assignment => {
                const student = realStudents.find(s => s.id === assignment.studentId);
                if (student) {
                    console.log(`      • ${student.displayName || student.username} (ID: ${student.id})`);
                } else {
                    console.log(`      ⚠️ Estudiante no encontrado: ${assignment.studentId}`);
                }
            });
        } else {
            console.log('   ❌ NO HAY ASIGNACIONES - Se mostraría error de configuración');
            console.log('   💡 Solución: Configurar asignaciones en Admin → Gestión de Usuarios');
        }
    }
};

// 4. Función para verificar estudiantes inventados
window.checkForFakeStudents = function() {
    console.log('\n🕵️ BUSCANDO ESTUDIANTES INVENTADOS:');
    
    const fakePatterns = ['ana_martinez', 'carlos_rodriguez', 'student_4to_b_'];
    const fakeStudents = allUsers.filter(user => 
        fakePatterns.some(pattern => 
            user.username.includes(pattern) || 
            (user.displayName && user.displayName.includes('Ana Martínez')) ||
            (user.displayName && user.displayName.includes('Carlos Rodríguez'))
        )
    );
    
    if (fakeStudents.length > 0) {
        console.log(`   ❌ ENCONTRADOS ${fakeStudents.length} ESTUDIANTES INVENTADOS:`);
        fakeStudents.forEach(fake => {
            console.log(`      • ${fake.displayName || fake.username} (ID: ${fake.id})`);
        });
        console.log('   💡 Estos estudiantes deberían eliminarse y usar solo los reales');
    } else {
        console.log('   ✅ NO hay estudiantes inventados - sistema limpio');
    }
    
    return fakeStudents;
};

// 5. Instrucciones de prueba
console.log('\n🎯 INSTRUCCIONES PARA VERIFICAR:');
console.log('1. Ejecuta: checkForFakeStudents()');
console.log('2. Ve a Admin → Gestión de Usuarios → Asignaciones');
console.log('3. Verifica que hay estudiantes asignados a las secciones');
console.log('4. Ve a Profesor → Tareas');
console.log('5. Crea una tarea para "todo el curso"');
console.log('6. Verifica que aparezcan SOLO los estudiantes reales configurados');
console.log('7. NO deben aparecer "Ana Martínez" ni "Carlos Rodríguez"');

console.log('\n💡 PARA PROBAR SECCIONES ESPECÍFICAS:');
console.log('• testStudentRetrieval("courseId-sectionId")');
console.log('• Usa el ID combinado que aparece en los dropdowns');

// Ejecutar verificaciones automáticamente
checkForFakeStudents();

console.log('\n✅ RESULTADO ESPERADO DESPUÉS DE LA CORRECCIÓN:');
console.log('• Las tareas para "todo el curso" solo muestran estudiantes reales');
console.log('• Si no hay asignaciones, se muestra error (no estudiantes inventados)');
console.log('• Los estudiantes aparecen según la configuración del admin');
