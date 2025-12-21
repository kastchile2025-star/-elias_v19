/**
 * 🔧 FIX SOFIA - VERSION SIMPLIFICADA
 * 
 * Este script usa el courseId directo de las calificaciones
 */

(function() {
  console.clear();
  console.log('%c🔧 FIX SOFIA - SIMPLIFICADO', 'font-size: 20px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(60) + '\n');

  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const year = 2025;
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');

  // Buscar Sofia
  const sofia = usuarios.find(u => u.username === 'sofia');
  if (!sofia) {
    console.log('%c❌ Sofia no encontrada', 'color: #EF4444;');
    return;
  }

  console.log('✅ Sofia encontrada:', sofia.username);

  // Buscar calificaciones
  const calificacionesSofia = calificaciones.filter(c => 
    String(c.studentId) === String(sofia.rut) || 
    String(c.studentRut) === String(sofia.rut)
  );

  console.log(`✅ ${calificacionesSofia.length} calificaciones encontradas\n`);

  if (calificacionesSofia.length === 0) {
    console.log('%c❌ No hay calificaciones', 'color: #EF4444;');
    return;
  }

  // Usar el courseId y sectionId directos de las calificaciones
  const primeraCalificacion = calificacionesSofia[0];
  const courseIdOriginal = primeraCalificacion.courseId; // '1ro_bsico'
  const sectionIdOriginal = primeraCalificacion.sectionId; // 'a'

  console.log('📋 Datos de las calificaciones:');
  console.log(`   CourseId: ${courseIdOriginal}`);
  console.log(`   SectionId: ${sectionIdOriginal}\n`);

  // Buscar curso por ID o por nombre que coincida
  let curso = courses.find(c => 
    String(c.id) === courseIdOriginal || 
    String(c.name).toLowerCase().replace(/[_\s]+/g, '_') === courseIdOriginal.toLowerCase()
  );

  if (!curso) {
    console.log(`⚠️ Curso "${courseIdOriginal}" no existe, listando cursos disponibles:\n`);
    courses.slice(0, 10).forEach((c, i) => {
      console.log(`   ${i + 1}. "${c.name}" → ID: ${c.id}`);
    });
    
    console.log('\n%c💡 SOLUCIÓN: Usar el primer curso que parece ser 1ro Básico', 'color: #F59E0B; font-weight: bold;');
    curso = courses.find(c => {
      const n = String(c.name).toLowerCase();
      return (n.includes('1') && n.includes('basico')) || n.includes('1ro') || n.includes('primero');
    });
    
    if (!curso && courses.length > 0) {
      console.log('   Usando el primer curso disponible como fallback');
      curso = courses[0];
    }
  }

  if (!curso) {
    console.log('%c❌ No hay cursos en el sistema', 'color: #EF4444;');
    return;
  }

  console.log(`✅ Usando curso: "${curso.name}" (${curso.id})\n`);

  // Buscar sección A
  let seccion = sections.find(s => 
    String(s.courseId) === String(curso.id) && 
    String(s.name).toLowerCase() === 'a'
  );

  if (!seccion) {
    console.log('⚠️ Sección A no existe para este curso, listando secciones:\n');
    const seccionesCurso = sections.filter(s => String(s.courseId) === String(curso.id));
    seccionesCurso.forEach(s => {
      console.log(`   • Sección "${s.name}" → ID: ${s.id}`);
    });
    
    if (seccionesCurso.length > 0) {
      console.log('\n   Usando la primera sección disponible');
      seccion = seccionesCurso[0];
    }
  }

  if (!seccion) {
    console.log('%c❌ No hay secciones para este curso', 'color: #EF4444;');
    return;
  }

  console.log(`✅ Usando sección: "${seccion.name}" (${seccion.id})\n`);

  // PASO 1: Corregir calificaciones
  console.log('🔧 PASO 1: Corrigiendo calificaciones...');
  let corregidas = 0;

  calificaciones.forEach(c => {
    if ((String(c.studentId) === String(sofia.rut) || String(c.studentRut) === String(sofia.rut))) {
      // Actualizar con IDs correctos
      c.sectionId = seccion.id;
      c.courseId = curso.id;
      corregidas++;
    }
  });

  if (corregidas > 0) {
    localStorage.setItem(`smart-student-test-grades-${year}`, JSON.stringify(calificaciones));
    console.log(`%c✅ ${corregidas} calificaciones corregidas`, 'color: #10B981; font-weight: bold;');
  }

  // PASO 2: Crear assignment
  console.log('\n👤 PASO 2: Creando assignment...');
  
  const existente = assignments.find(a => 
    String(a.studentId) === String(sofia.id) && 
    String(a.sectionId) === String(seccion.id)
  );

  if (existente) {
    console.log('ℹ️ Ya existe un assignment');
  } else {
    const nuevoAssignment = {
      id: `assignment-sofia-${Date.now()}`,
      studentId: sofia.id,
      studentUsername: sofia.username,
      studentName: sofia.name,
      sectionId: seccion.id,
      courseId: curso.id,
      year: year
    };

    assignments.push(nuevoAssignment);
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));
    
    console.log('%c✅ Assignment creado', 'color: #10B981; font-weight: bold;');
  }

  // Resumen
  console.log('\n' + '═'.repeat(60));
  console.log('%c✨ COMPLETADO', 'color: #10B981; font-weight: bold; font-size: 18px;');
  console.log('═'.repeat(60) + '\n');

  console.log('📊 Resumen:');
  console.log(`   • Curso: ${curso.name}`);
  console.log(`   • Sección: ${seccion.name}`);
  console.log(`   • Calificaciones corregidas: ${corregidas}`);
  console.log(`   • Assignments: ${assignments.filter(a => String(a.studentId) === String(sofia.id)).length}`);

  console.log('\n%c🎯 RECARGA LA PÁGINA AHORA (F5)', 'color: #F59E0B; font-weight: bold; font-size: 16px;');

})();
