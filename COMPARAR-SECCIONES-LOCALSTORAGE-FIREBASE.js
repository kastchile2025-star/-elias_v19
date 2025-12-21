/**
 * 🔍 COMPARAR: Secciones en localStorage vs sectionId en Firebase
 * 
 * Verifica si hay mismatch entre las IDs de sección
 * 
 * EJECUTAR EN CONSOLA DEL NAVEGADOR
 */

(function() {
    'use strict';
    
    console.log('%c🔍 COMPARACIÓN: Secciones localStorage vs Firebase', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    
    // 1. Leer secciones de localStorage
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    console.log('\n📚 Secciones en localStorage:');
    console.table(sections.map(s => ({
        id: s.id,
        name: s.name,
        courseId: s.courseId,
        tipo_id: typeof s.id
    })));
    
    // 2. Leer usuarios y ver sus courseAssignments
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const estudiantes = usuarios.filter(u => u.role === 'student').slice(0, 5);
    
    console.log('\n👥 Muestra de courseAssignments (5 estudiantes):');
    estudiantes.forEach(e => {
        console.log(`\n   ${e.name} (${e.id}):`);
        (e.courseAssignments || []).forEach(ca => {
            console.log(`      courseId: ${ca.courseId} (${typeof ca.courseId}), sectionId: ${ca.sectionId} (${typeof ca.sectionId}), section: "${ca.section}"`);
        });
    });
    
    // 3. Verificar tipos de datos
    const sectionIds = new Set(sections.map(s => s.id));
    const assignmentSectionIds = new Set();
    usuarios.forEach(u => {
        (u.courseAssignments || []).forEach(ca => {
            if (ca.sectionId) assignmentSectionIds.add(ca.sectionId);
        });
    });
    
    console.log('\n📊 ANÁLISIS DE TIPOS:');
    console.table({
        'Secciones en localStorage': sections.length,
        'IDs únicas en secciones': sectionIds.size,
        'IDs únicas en assignments': assignmentSectionIds.size,
        'Tipo primera sección': sections[0] ? typeof sections[0].id : 'N/A',
        'Tipo primer assignment': Array.from(assignmentSectionIds)[0] ? typeof Array.from(assignmentSectionIds)[0] : 'N/A'
    });
    
    // 4. Verificar coincidencias
    console.log('\n🔍 VERIFICACIÓN DE COINCIDENCIAS:');
    const coincidencias = [];
    const noCoinciden = [];
    
    Array.from(assignmentSectionIds).forEach(assigId => {
        const tipoString = String(assigId);
        const tipoNumber = Number(assigId);
        
        const matchString = sectionIds.has(tipoString);
        const matchNumber = sectionIds.has(tipoNumber);
        const matchOriginal = sectionIds.has(assigId);
        
        if (matchOriginal) {
            coincidencias.push(assigId);
        } else {
            noCoinciden.push({
                original: assigId,
                tipo: typeof assigId,
                matchString,
                matchNumber,
                posibleMatch: matchString ? tipoString : (matchNumber ? tipoNumber : 'NINGUNO')
            });
        }
    });
    
    console.log(`✅ Coincidencias: ${coincidencias.length}`);
    if (noCoinciden.length > 0) {
        console.log(`⚠️ NO coinciden: ${noCoinciden.length}`);
        console.table(noCoinciden);
    }
    
    // 5. Mostrar sectionIds de Firebase (del diagnóstico anterior)
    console.log('\n🔥 Firebase tiene sectionIds en minúscula: "a", "b"');
    console.log('📦 localStorage probablemente tiene mayúscula: "A", "B"');
    console.log('\n💡 SOLUCIÓN: Normalizar a minúscula antes de comparar');
    
})();
