/**
 * 🚨 FIX URGENTE - Corregir sectionId en calificaciones
 * 
 * Las calificaciones tienen sectionId='a' pero debería ser el UUID
 */

(function() {
  console.clear();
  console.log('%c🚨 FIX URGENTE - CALIFICACIONES', 'font-size: 20px; font-weight: bold; color: #EF4444');
  console.log('═'.repeat(60) + '\n');

  const year = 2025;
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
  const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
  const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');

  console.log(`📊 Total calificaciones: ${calificaciones.length}`);
  
  // Verificar estado actual
  const conLetraA = calificaciones.filter(c => c.sectionId === 'a');
  const conUUID = calificaciones.filter(c => c.sectionId !== 'a' && c.sectionId && c.sectionId.includes('-'));
  
  console.log(`   ❌ Con sectionId='a': ${conLetraA.length}`);
  console.log(`   ✅ Con UUID correcto: ${conUUID.length}\n`);

  if (conLetraA.length === 0) {
    console.log('%c✅ TODAS las calificaciones ya tienen UUID correcto', 'color: #10B981; font-weight: bold;');
    return;
  }

  // Buscar curso y sección
  const curso = courses.find(c => c.name === '1ro Básico');
  if (!curso) {
    console.log('%c❌ Curso "1ro Básico" no encontrado', 'color: #EF4444;');
    return;
  }

  const seccion = sections.find(s => 
    s.courseId === curso.id && 
    s.name.toLowerCase() === 'a'
  );

  if (!seccion) {
    console.log('%c❌ Sección A no encontrada', 'color: #EF4444;');
    return;
  }

  console.log(`✅ Curso: "${curso.name}" → ${curso.id}`);
  console.log(`✅ Sección: "${seccion.name}" → ${seccion.id}\n`);

  // Corregir TODAS las calificaciones con sectionId='a'
  console.log('🔧 Corrigiendo calificaciones...\n');
  
  let corregidas = 0;
  calificaciones.forEach(c => {
    if (c.sectionId === 'a') {
      const antes = { ...c };
      c.sectionId = seccion.id;
      c.courseId = curso.id;
      corregidas++;
      
      if (corregidas <= 3) {
        console.log(`   Calificación #${corregidas}:`);
        console.log(`      Antes: sectionId="${antes.sectionId}", courseId="${antes.courseId}"`);
        console.log(`      Después: sectionId="${c.sectionId}", courseId="${c.courseId}"`);
      }
    }
  });

  // GUARDAR EN LOCALSTORAGE
  console.log(`\n💾 Guardando ${corregidas} calificaciones corregidas...`);
  localStorage.setItem(`smart-student-test-grades-${year}`, JSON.stringify(calificaciones));
  console.log('%c✅ GUARDADO EXITOSO', 'color: #10B981; font-weight: bold; font-size: 16px;');

  // Verificar que se guardó
  const verificacion = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
  const conLetraADespues = verificacion.filter(c => c.sectionId === 'a');
  const conUUIDDespues = verificacion.filter(c => c.sectionId !== 'a' && c.sectionId && c.sectionId.includes('-'));

  console.log('\n' + '═'.repeat(60));
  console.log('%c🔍 VERIFICACIÓN POST-GUARDADO', 'color: #3B82F6; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(60) + '\n');
  console.log(`   Total calificaciones: ${verificacion.length}`);
  console.log(`   ❌ Con sectionId='a': ${conLetraADespues.length}`);
  console.log(`   ✅ Con UUID correcto: ${conUUIDDespues.length}`);

  if (conLetraADespues.length === 0) {
    console.log('\n%c🎉 ¡PERFECTO! Todas las calificaciones corregidas', 'color: #10B981; font-weight: bold; font-size: 18px;');
    console.log('%c🔄 RECARGA LA PÁGINA AHORA (F5)', 'color: #F59E0B; font-weight: bold; font-size: 16px;');
  } else {
    console.log('\n%c⚠️ ERROR: Aún hay calificaciones con sectionId="a"', 'color: #EF4444; font-weight: bold;');
    console.log('Por favor comparte este resultado con el desarrollador');
  }

})();
