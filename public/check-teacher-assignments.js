// Script para verificar las asignaciones de profesores
console.log('🔍 VERIFICANDO ASIGNACIONES DE PROFESORES...');

function verificarAsignacionesProfesores() {
    console.log('\n📋 REVISANDO DATOS DE ASIGNACIONES...');
    
    // Revisar localStorage
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Usuarios: ${users.length}`);
    console.log(`   - Asignaciones de profesores: ${teacherAssignments.length}`);
    console.log(`   - Cursos: ${courses.length}`);
    console.log(`   - Secciones: ${sections.length}`);
    
    // Buscar profesores
    const profesores = users.filter(u => u.role === 'teacher');
    console.log(`\n👨‍🏫 PROFESORES ENCONTRADOS: ${profesores.length}`);
    
    profesores.forEach(profesor => {
        console.log(`\n📝 ${profesor.name} (${profesor.username}):`);
        console.log(`   - ID: ${profesor.id}`);
        console.log(`   - teachingAssignments:`, profesor.teachingAssignments);
        
        // Buscar asignaciones en el sistema
        const asignaciones = teacherAssignments.filter(a => a.teacherId === profesor.id);
        console.log(`   - Asignaciones en sistema: ${asignaciones.length}`);
        
        asignaciones.forEach((asig, index) => {
            const curso = courses.find(c => c.id === asig.courseId);
            const seccion = sections.find(s => s.id === asig.sectionId);
            
            console.log(`     ${index + 1}. Curso: ${curso?.name || 'No encontrado'}`);
            console.log(`        Sección: ${seccion?.name || 'No encontrada'}`);
            console.log(`        Asignaturas: ${(asig.subjects || []).join(', ')}`);
        });
    });
    
    console.log('\n📚 CURSOS DISPONIBLES:');
    courses.forEach(curso => {
        console.log(`   - ${curso.name} (ID: ${curso.id})`);
    });
    
    console.log('\n📋 SECCIONES DISPONIBLES:');
    sections.forEach(seccion => {
        console.log(`   - ${seccion.name} (ID: ${seccion.id})`);
    });
    
    return { profesores, teacherAssignments, courses, sections };
}

// Función para crear datos de ejemplo si no existen
function crearDatosEjemplo() {
    console.log('\n🚀 CREANDO DATOS DE EJEMPLO...');
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    let teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    let sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    // Crear cursos si no existen
    if (courses.length === 0) {
        courses = [
            { id: 'curso-4to-basico', name: '4to Básico' },
            { id: 'curso-5to-basico', name: '5to Básico' },
            { id: 'curso-6to-basico', name: '6to Básico' }
        ];
        localStorage.setItem('smart-student-courses', JSON.stringify(courses));
        console.log('✅ Cursos creados');
    }
    
    // Crear secciones si no existen
    if (sections.length === 0) {
        sections = [
            { id: 'seccion-a', name: 'A' },
            { id: 'seccion-b', name: 'B' },
            { id: 'seccion-c', name: 'C' }
        ];
        localStorage.setItem('smart-student-sections', JSON.stringify(sections));
        console.log('✅ Secciones creadas');
    }
    
    // Crear asignaciones para profesores si no existen
    const profesores = users.filter(u => u.role === 'teacher');
    
    if (teacherAssignments.length === 0 && profesores.length > 0) {
        // Asignaciones de ejemplo
        const asignacionesEjemplo = [
            {
                id: crypto.randomUUID(),
                teacherId: profesores[0]?.id, // jorge
                courseId: 'curso-4to-basico',
                sectionId: 'seccion-a',
                subjects: ['Matemáticas', 'Lenguaje y Comunicación']
            },
            {
                id: crypto.randomUUID(),
                teacherId: profesores[1]?.id, // carlos
                courseId: 'curso-4to-basico',
                sectionId: 'seccion-b',
                subjects: ['Ciencias Naturales', 'Historia, Geografía y Ciencias Sociales']
            },
            {
                id: crypto.randomUUID(),
                teacherId: profesores[2]?.id, // pedro
                courseId: 'curso-5to-basico',
                sectionId: 'seccion-a',
                subjects: ['Matemáticas', 'Ciencias Naturales']
            }
        ];
        
        localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(asignacionesEjemplo));
        console.log('✅ Asignaciones de profesores creadas');
    }
    
    console.log('\n🎉 Datos de ejemplo listos');
}

// Ejecutar verificación
verificarAsignacionesProfesores();

// Crear datos si es necesario
crearDatosEjemplo();

// Verificar de nuevo después de crear datos
console.log('\n🔄 VERIFICACIÓN FINAL...');
verificarAsignacionesProfesores();

// Exponer funciones
window.verificarAsignacionesProfesores = verificarAsignacionesProfesores;
window.crearDatosEjemplo = crearDatosEjemplo;

console.log('\n💡 Funciones disponibles:');
console.log('- verificarAsignacionesProfesores() - Ver asignaciones actuales');
console.log('- crearDatosEjemplo() - Crear datos de ejemplo');
