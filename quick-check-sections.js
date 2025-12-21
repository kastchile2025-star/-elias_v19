/**
 * 🔍 QUICK CHECK: Ver secciones y sectionIds reales
 * 
 * PEGAR EN CONSOLA DEL NAVEGADOR
 */

(function() {
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const estudiante = usuarios.find(u => u.role === 'student' && u.name.includes('Sofía'));
    
    console.log('📚 Secciones en sistema:');
    console.table(sections.slice(0, 5).map(s => ({
        id: s.id,
        tipo: typeof s.id,
        name: s.name,
        courseId: s.courseId
    })));
    
    if (estudiante) {
        console.log(`\n👤 Estudiante: ${estudiante.name}`);
        console.log('   CourseAssignments:');
        console.table((estudiante.courseAssignments || []).map(ca => ({
            courseId: ca.courseId,
            courseIdType: typeof ca.courseId,
            sectionId: ca.sectionId,
            sectionIdType: typeof ca.sectionId,
            section: ca.section
        })));
    }
})();
