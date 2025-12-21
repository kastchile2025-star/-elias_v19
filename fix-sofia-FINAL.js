/**
 * 🔧 FIX SOFIA - VERSION FINAL
 * 
 * Usa las claves correctas con el año 2025
 */

(function() {
  console.clear();
  console.log('%c🔧 FIX SOFIA - VERSION FINAL', 'font-size: 20px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(60) + '\n');

  const year = 2025;
  
  // USAR LAS CLAVES CORRECTAS CON EL AÑO
  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const assignmentsYear = JSON.parse(localStorage.getItem(`smart-student-student-assignments-${year}`) || '[]');
  const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');
  const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');

  console.log(`📊 Datos cargados:`);
  console.log(`   Usuarios: ${usuarios.length}`);
  console.log(`   Cursos (${year}): ${courses.length}`);
  console.log(`   Secciones (${year}): ${sections.length}`);
  console.log(`   Calificaciones (${year}): ${calificaciones.length}`);
  console.log(`   Assignments: ${assignments.length}`);
  console.log(`   Assignments (${year}): ${assignmentsYear.length}\n`);

  // Buscar Sofia
  const sofia = usuarios.find(u => u.username === 'sofia');
  if (!sofia) {
    console.log('%c❌ Sofia no encontrada', 'color: #EF4444;');
    return;
  }

  console.log(`✅ Sofia encontrada: ${sofia.username} (ID: ${sofia.id}, RUT: ${sofia.rut})\n`);

  // Buscar el curso "1ro Básico"
  const curso = courses.find(c => c.name === '1ro Básico');
  if (!curso) {
    console.log('%c❌ Curso "1ro Básico" no encontrado', 'color: #EF4444;');
    console.log('Cursos disponibles:', courses.map(c => c.name));
    return;
  }

  console.log(`✅ Curso encontrado: "${curso.name}"`);
  console.log(`   ID: ${curso.id}\n`);

  // Buscar la sección A de ese curso
  const seccion = sections.find(s => 
    s.courseId === curso.id && 
    s.name.toLowerCase() === 'a'
  );

  if (!seccion) {
    console.log('%c❌ Sección A no encontrada', 'color: #EF4444;');
    const seccionesCurso = sections.filter(s => s.courseId === curso.id);
    console.log(`Secciones del curso:`, seccionesCurso.map(s => s.name));
    return;
  }

  console.log(`✅ Sección encontrada: "${seccion.name}"`);
  console.log(`   ID: ${seccion.id}\n`);

  // PASO 1: Corregir TODAS las calificaciones (3600)
  console.log('🔧 PASO 1: Corrigiendo calificaciones...');
  let corregidas = 0;

  calificaciones.forEach(c => {
    // Corregir TODAS las que tienen courseId='1ro_bsico' y sectionId='a'
    if (c.courseId === '1ro_bsico' && c.sectionId === 'a') {
      c.courseId = curso.id;
      c.sectionId = seccion.id;
      corregidas++;
    }
  });

  if (corregidas > 0) {
    localStorage.setItem(`smart-student-test-grades-${year}`, JSON.stringify(calificaciones));
    console.log(`%c✅ ${corregidas} calificaciones corregidas`, 'color: #10B981; font-weight: bold;');
  } else {
    console.log('ℹ️ No había calificaciones que corregir');
  }

  // PASO 2: Limpiar assignment incorrecto
  console.log('\n🧹 PASO 2: Limpiando assignments incorrectos...');
  
  const assignmentsIncorrectos = assignments.filter(a => 
    a.studentId === sofia.id && (a.sectionId === 'a' || a.courseId === '1ro_bsico')
  );

  if (assignmentsIncorrectos.length > 0) {
    assignmentsIncorrectos.forEach(a => {
      const index = assignments.indexOf(a);
      if (index > -1) {
        assignments.splice(index, 1);
        console.log(`   Eliminado assignment con sectionId="${a.sectionId}"`);
      }
    });
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));
  }

  // PASO 3: Crear assignment correcto en assignments-2025
  console.log('\n👤 PASO 3: Creando assignment correcto...');
  
  const existente = assignmentsYear.find(a => 
    a.studentId === sofia.id && 
    a.sectionId === seccion.id &&
    a.courseId === curso.id
  );

  if (existente) {
    console.log('ℹ️ Ya existe un assignment correcto en assignments-2025');
  } else {
    const nuevoAssignment = {
      id: `sa-${sofia.id}-${seccion.id}-${Date.now()}`,
      studentId: sofia.id,
      courseId: curso.id,
      sectionId: seccion.id,
      isActive: true,
      year: year,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assignmentsYear.push(nuevoAssignment);
    localStorage.setItem(`smart-student-student-assignments-${year}`, JSON.stringify(assignmentsYear));
    
    console.log('%c✅ Assignment creado en assignments-2025', 'color: #10B981; font-weight: bold;');
  }

  // VERIFICACIÓN FINAL
  console.log('\n' + '═'.repeat(60));
  console.log('%c🔍 VERIFICACIÓN FINAL', 'color: #3B82F6; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(60) + '\n');

  const calificacionesSofia = calificaciones.filter(c => 
    c.studentId === sofia.rut || c.studentRut === sofia.rut
  );

  const assignmentsSofia = assignmentsYear.filter(a => a.studentId === sofia.id);

  console.log(`📊 Calificaciones de Sofia: ${calificacionesSofia.length}`);
  if (calificacionesSofia.length > 0) {
    const primera = calificacionesSofia[0];
    console.log(`   CourseId: ${primera.courseId}`);
    console.log(`   SectionId: ${primera.sectionId}`);
    console.log(`   ✅ IDs correctos: ${primera.courseId === curso.id && primera.sectionId === seccion.id ? 'SÍ' : 'NO'}`);
  }

  console.log(`\n👤 Assignments de Sofia (${year}): ${assignmentsSofia.length}`);
  if (assignmentsSofia.length > 0) {
    assignmentsSofia.forEach(a => {
      console.log(`   • Section: ${a.sectionId}`);
      console.log(`   • Course: ${a.courseId}`);
      console.log(`   ✅ IDs correctos: ${a.courseId === curso.id && a.sectionId === seccion.id ? 'SÍ' : 'NO'}`);
    });
  }

  // Resumen
  console.log('\n' + '═'.repeat(60));
  console.log('%c✨ REPARACIÓN COMPLETADA', 'color: #10B981; font-weight: bold; font-size: 18px;');
  console.log('═'.repeat(60) + '\n');

  console.log('📋 Resumen:');
  console.log(`   • Curso: "${curso.name}" (${curso.id})`);
  console.log(`   • Sección: "${seccion.name}" (${seccion.id})`);
  console.log(`   • Calificaciones corregidas: ${corregidas}`);
  console.log(`   • Assignments creados: 1`);

  console.log('\n%c🎯 ¡RECARGA LA PÁGINA AHORA! (F5)', 'color: #F59E0B; font-weight: bold; font-size: 16px;');
  console.log('%cLas calificaciones de Sofia deberían aparecer', 'color: #10B981;');

})();
