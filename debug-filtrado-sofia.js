/**
 * 🔍 DEBUG FILTRADO DE CALIFICACIONES
 * 
 * Ejecutar en consola para ver por qué no aparecen las tablas
 */

(function() {
  console.clear();
  console.log('%c🔍 DEBUG FILTRADO SOFIA', 'font-size: 20px; font-weight: bold; color: #3B82F6');
  console.log('═'.repeat(70) + '\n');

  const year = 2025;
  const user = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
  const assignmentsYear = JSON.parse(localStorage.getItem(`smart-student-student-assignments-${year}`) || '[]');
  const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');
  const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');

  console.log('👤 USUARIO ACTUAL:');
  console.log(user);
  console.log('');

  console.log('📊 ASSIGNMENTS DE SOFIA:');
  const assignmentsSofia = assignmentsYear.filter(a => 
    a.studentId === user.id || a.studentUsername === user.username
  );
  console.log(`Total: ${assignmentsSofia.length}`);
  assignmentsSofia.forEach(a => {
    console.log('   Assignment:', a);
    const section = sections.find(s => s.id === a.sectionId);
    const course = courses.find(c => c.id === a.courseId);
    console.log(`   → Curso: ${course?.name || 'NO ENCONTRADO'}`);
    console.log(`   → Sección: ${section?.name || 'NO ENCONTRADO'}`);
  });
  console.log('');

  console.log('📚 CALIFICACIONES DE SOFIA (por RUT):');
  const calificacionesSofia = calificaciones.filter(c => 
    c.studentId === user.rut || c.studentRut === user.rut
  );
  console.log(`Total: ${calificacionesSofia.length}`);
  
  if (calificacionesSofia.length > 0) {
    const courseIds = [...new Set(calificacionesSofia.map(c => c.courseId))];
    const sectionIds = [...new Set(calificacionesSofia.map(c => c.sectionId))];
    
    console.log(`CourseIds únicos: ${courseIds.length}`);
    courseIds.forEach(id => {
      const course = courses.find(c => c.id === id);
      console.log(`   • ${id} → "${course?.name || 'NO ENCONTRADO'}"`);
    });
    
    console.log(`SectionIds únicos: ${sectionIds.length}`);
    sectionIds.forEach(id => {
      const section = sections.find(s => s.id === id);
      console.log(`   • ${id} → "${section?.name || 'NO ENCONTRADO'}"`);
    });

    console.log('\n📋 Primera calificación:');
    console.log(calificacionesSofia[0]);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('%c🔍 ANÁLISIS DE VISIBILIDAD', 'font-size: 16px; font-weight: bold; color: #F59E0B');
  console.log('═'.repeat(70) + '\n');

  // Simular el filtro de visibleSectionIds
  const visibleSectionIds = new Set(assignmentsSofia.map(a => a.sectionId));
  console.log('🔍 visibleSectionIds (de assignments):');
  console.log([...visibleSectionIds]);
  console.log('');

  // Ver qué calificaciones pasarían el filtro
  const calificacionesVisibles = calificacionesSofia.filter(c => 
    visibleSectionIds.has(c.sectionId)
  );
  console.log(`✅ Calificaciones que deberían ser visibles: ${calificacionesVisibles.length}`);
  
  if (calificacionesVisibles.length > 0) {
    console.log('Primera calificación visible:');
    console.log(calificacionesVisibles[0]);
  } else {
    console.log('%c⚠️ PROBLEMA: Las sectionIds de las calificaciones no coinciden con las de los assignments', 'color: #EF4444; font-weight: bold;');
    
    console.log('\nSectionIds en assignments:');
    assignmentsSofia.forEach(a => console.log(`   • ${a.sectionId}`));
    
    console.log('\nSectionIds en calificaciones:');
    [...new Set(calificacionesSofia.map(c => c.sectionId))].forEach(id => console.log(`   • ${id}`));
  }

  console.log('\n' + '═'.repeat(70));
  console.log('%c✨ DEBUG COMPLETADO', 'font-size: 18px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(70));

})();
