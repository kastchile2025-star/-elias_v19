/**
 * 🔧 FIX COMPLETO SOFIA
 * 
 * Este script soluciona TODOS los problemas de Sofia:
 * 1. Crea el assignment faltante
 * 2. Convierte sectionId de letra ('a') a UUID
 * 3. Verifica que todo esté correcto
 */

(function() {
  console.clear();
  console.log('%c🔧 FIX COMPLETO - SOFIA', 'font-size: 20px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(60) + '\n');

  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const year = 2025;
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');

  // Buscar Sofia
  const sofia = usuarios.find(u => 
    u.username === 'sofia' || 
    u.username === 's.gonzalez0008' ||
    (u.name && u.name.toLowerCase().includes('sofía gonzález'))
  );

  if (!sofia) {
    console.log('%c❌ Sofia no encontrada', 'color: #EF4444; font-weight: bold;');
    return;
  }

  console.log('✅ Sofia encontrada:', sofia.username);
  console.log('   • ID:', sofia.id);
  console.log('   • RUT:', sofia.rut);

  // PASO 1: Buscar calificaciones de Sofia
  console.log('\n📊 PASO 1: Buscando calificaciones de Sofia...');
  const calificacionesSofia = calificaciones.filter(c => 
    String(c.studentId) === String(sofia.rut) || 
    String(c.studentRut) === String(sofia.rut)
  );

  console.log(`✅ ${calificacionesSofia.length} calificaciones encontradas`);

  if (calificacionesSofia.length === 0) {
    console.log('%c❌ No hay calificaciones para Sofia', 'color: #EF4444;');
    return;
  }

  // Mostrar muestra de calificaciones
  console.log('\n📋 Muestra de calificaciones (primeras 3):');
  calificacionesSofia.slice(0, 3).forEach(c => {
    console.log(`   • Subject: ${c.subject || c.subjectName || 'N/A'}`);
    console.log(`     Score: ${c.score}`);
    console.log(`     SectionId ACTUAL: ${c.sectionId}`);
    console.log(`     CourseId: ${c.courseId}`);
  });

  // PASO 2: Identificar el curso de Sofia (búsqueda tolerante)
  console.log('\n🏫 PASO 2: Identificando curso de Sofia...');
  
  // Normalizar texto para comparaciones tolerantes (sin Unicode escapes)
  const normalize = (s) => {
    let str = String(s || '').toLowerCase();
    // Remover acentos manualmente
    str = str.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
             .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
    // Normalizar espacios y guiones
    str = str.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    return str;
  };

  // Patrones alternativos para "1ro básico"
  const patterns = [
    /1\s*ro.*basic/i,
    /1ro.*basic/i,
    /1ro_basic/i,
    /1ro_bsic/i,
    /1ro.*bsic/i,
    /primero.*basic/i
  ];

  let curso1roBasico = null;
  for (const c of courses) {
    const n = normalize(c.name);
    const nOriginal = String(c.name || '').toLowerCase();
    
    // aplicar transformaciones comunes (bsico -> basico)
    const nFixed = n.replace(/bsic/g, 'basic');
    
    // Buscar "1ro" o "1" y "basico" o variantes
    const tiene1ro = /1\s*ro|primero/.test(nFixed) || /1\s*ro|primero/.test(nOriginal);
    const tieneBasico = /basic/.test(nFixed) || /basic|bsic/.test(nOriginal);
    
    if (tiene1ro && tieneBasico) {
      curso1roBasico = c;
      break;
    }
    
    // fallback: probar patrones relax
    for (const p of patterns) {
      try { if (p.test(String(c.name))) { curso1roBasico = c; break; } } catch {}
    }
    if (curso1roBasico) break;
  }
  
  // Fallback final: buscar por el courseId que aparece en las calificaciones
  if (!curso1roBasico && calificacionesSofia.length > 0) {
    const courseIdEnCalificaciones = calificacionesSofia[0].courseId;
    console.log(`   ℹ️ Intentando buscar por courseId: ${courseIdEnCalificaciones}`);
    curso1roBasico = courses.find(c => String(c.id) === String(courseIdEnCalificaciones) || String(c.name).toLowerCase() === String(courseIdEnCalificaciones).toLowerCase());
  }

  if (!curso1roBasico) {
    console.log('%c❌ No se encontró el curso "1ro Básico"', 'color: #EF4444;');
    console.log('\n📋 Cursos disponibles (primeros 5):');
    courses.slice(0, 5).forEach(c => console.log(`   • "${c.name}" (id: ${c.id})`));
    return;
  }

  console.log('✅ Curso encontrado:', curso1roBasico.name);
  console.log('   • ID:', curso1roBasico.id);

  // PASO 3: Buscar la sección A de 1ro Básico
  console.log('\n📍 PASO 3: Buscando sección A...');
  const seccionA = sections.find(s => 
    String(s.courseId) === String(curso1roBasico.id) && 
    String(s.name).toLowerCase() === 'a'
  );

  if (!seccionA) {
    console.log('%c❌ No se encontró la sección A para 1ro Básico', 'color: #EF4444;');
    console.log('\n📋 Secciones disponibles para este curso:');
    sections.filter(s => String(s.courseId) === String(curso1roBasico.id)).forEach(s => {
      console.log(`   • ${s.name} (${s.id})`);
    });
    return;
  }

  console.log('✅ Sección A encontrada:', seccionA.id);

  // PASO 4: Corregir sectionId en las calificaciones
  console.log('\n🔧 PASO 4: Corrigiendo sectionId en calificaciones...');
  
  let calificacionesCorregidas = 0;
  calificaciones.forEach(c => {
    // Si es una calificación de Sofia y tiene sectionId como letra
    if ((String(c.studentId) === String(sofia.rut) || String(c.studentRut) === String(sofia.rut)) &&
        String(c.sectionId).toLowerCase() === 'a') {
      c.sectionId = seccionA.id;
      c.courseId = curso1roBasico.id;
      calificacionesCorregidas++;
    }
  });

  if (calificacionesCorregidas > 0) {
    localStorage.setItem(`smart-student-test-grades-${year}`, JSON.stringify(calificaciones));
    console.log(`%c✅ ${calificacionesCorregidas} calificaciones corregidas`, 'color: #10B981; font-weight: bold;');
  } else {
    console.log('ℹ️ No se requirieron correcciones en calificaciones');
  }

  // PASO 5: Crear assignment para Sofia
  console.log('\n👤 PASO 5: Creando assignment para Sofia...');
  
  // Verificar si ya existe
  const assignmentExistente = assignments.find(a => 
    String(a.studentId) === String(sofia.id) && 
    String(a.sectionId) === String(seccionA.id)
  );

  if (assignmentExistente) {
    console.log('ℹ️ Sofia ya tiene un assignment para esta sección');
  } else {
    const nuevoAssignment = {
      id: `assignment-sofia-${Date.now()}`,
      studentId: sofia.id,
      studentUsername: sofia.username,
      studentName: sofia.name || sofia.displayName,
      sectionId: seccionA.id,
      courseId: curso1roBasico.id,
      year: year
    };

    assignments.push(nuevoAssignment);
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));
    
    console.log('%c✅ Assignment creado exitosamente', 'color: #10B981; font-weight: bold;');
    console.log('   Detalles:', nuevoAssignment);
  }

  // PASO 6: Verificación final
  console.log('\n✅ PASO 6: Verificación final...');
  
  const verificacion = {
    sofiaId: sofia.id,
    sofiaUsername: sofia.username,
    sofiaRut: sofia.rut,
    cursoId: curso1roBasico.id,
    cursoNombre: curso1roBasico.name,
    seccionId: seccionA.id,
    seccionNombre: seccionA.name,
    calificacionesConSectionCorrecta: calificaciones.filter(c => 
      (String(c.studentId) === String(sofia.rut) || String(c.studentRut) === String(sofia.rut)) &&
      String(c.sectionId) === String(seccionA.id)
    ).length,
    assignmentsCreados: assignments.filter(a => String(a.studentId) === String(sofia.id)).length
  };

  console.log('📊 Estado final:');
  console.table(verificacion);

  // RESUMEN
  console.log('\n' + '═'.repeat(60));
  console.log('%c✨ CORRECCIÓN COMPLETADA', 'color: #10B981; font-weight: bold; font-size: 18px;');
  console.log('═'.repeat(60) + '\n');

  console.log('%c📝 QUÉ SE HIZO:', 'color: #3B82F6; font-weight: bold;');
  console.log(`   ✅ Corregidas ${calificacionesCorregidas} calificaciones (sectionId de 'a' → UUID)`);
  console.log(`   ✅ Creado assignment para Sofia en sección ${seccionA.name}`);
  console.log(`   ✅ Vinculado al curso: ${curso1roBasico.name}`);

  console.log('\n%c🎯 PRÓXIMO PASO:', 'color: #F59E0B; font-weight: bold;');
  console.log('   1. %cRecarga la página%c (F5 o Ctrl+R)', 'font-weight: bold; color: #10B981;', '');
  console.log('   2. Ve a la pestaña "Calificaciones"');
  console.log('   3. Deberías ver todas las calificaciones de Sofia ✨');

  console.log('\n💡 Si aún no aparecen, ejecuta: verificarSofia()');

  // Crear función de verificación
  window.verificarSofia = function() {
    console.clear();
    console.log('%c🔍 VERIFICACIÓN SOFIA', 'font-size: 16px; font-weight: bold; color: #6366F1;');
    console.log('═'.repeat(50) + '\n');

    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');

    const sofia = usuarios.find(u => u.username === 'sofia');

    console.log('👤 Usuario en sesión:', currentUser?.username);
    console.log('   • ID:', currentUser?.id);
    console.log('   • RUT:', currentUser?.rut);

    console.log('\n📋 Assignments de Sofia:');
    const assignmentsSofia = assignments.filter(a => String(a.studentId) === String(sofia.id));
    console.log(`   Total: ${assignmentsSofia.length}`);
    assignmentsSofia.forEach(a => {
      console.log(`   • Sección: ${a.sectionId}`);
      console.log(`   • Curso: ${a.courseId}`);
    });

    console.log('\n📊 Calificaciones de Sofia:');
    const calificacionesSofia = calificaciones.filter(c => 
      String(c.studentId) === String(sofia.rut) || 
      String(c.studentRut) === String(sofia.rut)
    );
    console.log(`   Total: ${calificacionesSofia.length}`);
    console.log(`   Con sectionId UUID: ${calificacionesSofia.filter(c => c.sectionId.includes('-')).length}`);
    console.log(`   Con sectionId letra: ${calificacionesSofia.filter(c => !c.sectionId.includes('-')).length}`);

    if (calificacionesSofia.filter(c => !c.sectionId.includes('-')).length > 0) {
      console.log('\n%c⚠️ Aún hay calificaciones con sectionId como letra', 'color: #F59E0B; font-weight: bold;');
      console.log('   Ejecuta el script completo de nuevo.');
    } else {
      console.log('\n%c✅ Todas las calificaciones tienen sectionId correcto', 'color: #10B981; font-weight: bold;');
    }
  };

  console.log('\n%c✨ Función de verificación creada: verificarSofia()', 'color: #8B5CF6; font-weight: bold;');

})();
