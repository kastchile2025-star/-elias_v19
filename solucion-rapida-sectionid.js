/**
 * 🔧 SOLUCIÓN RÁPIDA: Normalizar sectionId de Firebase
 * 
 * PROBLEMA IDENTIFICADO:
 * - Firebase tiene sectionId como letra: "a", "b", "c"
 * - LocalStorage/UI espera UUID de sección: "1ro_basico_a", etc.
 * 
 * EJECUTAR en consola del navegador:
 */

(function solucionRapida() {
  console.clear();
  console.log('%c🔧 SOLUCIÓN: Normalizando sectionId', 'font-size: 16px; font-weight: bold; color: #059669; background: #D1FAE5; padding: 10px;');
  console.log('\n');
  
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  const gradesKey = `smart-student-test-grades-${year}`;
  const sectionsKey = `smart-student-sections-${year}`;
  const coursesKey = `smart-student-courses-${year}`;
  
  const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
  const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
  const courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
  
  console.log(`📊 Datos actuales:`);
  console.log(`   Calificaciones: ${grades.length}`);
  console.log(`   Secciones: ${sections.length}`);
  console.log(`   Cursos: ${courses.length}`);
  
  if (grades.length === 0) {
    console.error('❌ No hay calificaciones para normalizar');
    return;
  }
  
  if (sections.length === 0) {
    console.error('❌ No hay secciones cargadas');
    return;
  }
  
  if (courses.length === 0) {
    console.error('❌ No hay cursos cargados');
    return;
  }
  
  console.log('\n🔄 Paso 1: Mapear nombres de curso → UUID...\n');
  
  // Crear mapa: nombre normalizado → courseId UUID
  const courseNameMap = new Map();
  courses.forEach(c => {
    // Normalizar nombre: "1ro Básico" → "1ro_basico"
    const normalized = c.name.toLowerCase()
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
      .replace(/ó/g, 'o').replace(/ú/g, 'u')
      .replace(/\s+/g, '_');
    courseNameMap.set(normalized, c.id);
    
    // TAMBIÉN mapear versión sin acentos en vocales: "1ro_bsico"
    const withoutVowels = normalized.replace(/[aeiou]/g, (m) => {
      // Si ya está sin acento, mantenerlo
      return m;
    });
    // Crear versión simplificada eliminando vocales intermedias
    const simplified = normalized
      .replace(/_basico/, '_bsico')
      .replace(/_medio/, '_mdio');
    if (simplified !== normalized) {
      courseNameMap.set(simplified, c.id);
      console.log(`   ${simplified} → ${c.id} (alias)`);
    }
    
    console.log(`   ${normalized} → ${c.id}`);
  });
  
  console.log('\n🔄 Paso 2: Mapear courseUUID + letra → sectionId UUID...\n');
  
  // Crear mapa: courseId UUID + letra → sectionId UUID
  const sectionMap = new Map();
  sections.forEach(s => {
    const key = `${s.courseId}_${s.name.toLowerCase()}`;
    sectionMap.set(key, s.id);
    const course = courses.find(c => c.id === s.courseId);
    console.log(`   ${course?.name || s.courseId} ${s.name} → ${s.id}`);
  });
  
  console.log(`\n✅ Creados ${courseNameMap.size} cursos y ${sectionMap.size} secciones\n`);
  
  // Normalizar calificaciones
  let normalized = 0;
  let notFound = 0;
  
  console.log('🔄 Paso 3: Normalizando calificaciones...\n');
  
  const normalizedGrades = grades.map(g => {
    const courseIdOriginal = String(g.courseId || '').toLowerCase().trim();
    const sectionIdOriginal = String(g.sectionId || '').trim();
    
    // Verificar si courseId ya es UUID
    const courseIsUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOriginal);
    
    if (courseIsUUID) {
      // courseId ya es UUID, solo normalizar a minúsculas
      normalized++;
      return {
        ...g,
        courseId: courseIdOriginal.toLowerCase(),
        sectionId: sectionIdOriginal.toLowerCase()
      };
    }
    
    // courseId es texto (ej: "1ro_bsico"), convertir a UUID
    const courseUUID = courseNameMap.get(courseIdOriginal);
    
    if (!courseUUID) {
      notFound++;
      console.warn(`   ⚠️ Curso no encontrado: ${courseIdOriginal}`);
      return g;
    }
    
    // ✅ Convertir courseId texto → UUID
    normalized++;
    return {
      ...g,
      courseId: courseUUID,
      sectionId: sectionIdOriginal.toLowerCase()
    };
  });
  
  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Normalizadas: ${normalized}`);
  console.log(`   ⚠️ Sin cambios: ${notFound}`);
  
  if (normalized > 0) {
    // Guardar en LocalStorage
    localStorage.setItem(gradesKey, JSON.stringify(normalizedGrades));
    console.log(`\n💾 Guardadas en LocalStorage`);
    
    // Emitir evento para actualizar UI
    window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
      detail: { 
        year, 
        manual: true,
        timestamp: Date.now()
      } 
    }));
    
    console.log(`\n✅ SOLUCIÓN APLICADA EXITOSAMENTE`);
    console.log(`\n🔄 Recarga la página para ver las calificaciones`);
    console.log(`\n   O ejecuta: window.location.reload()`);
    
    // Mostrar muestra de resultado
    console.log(`\n📋 Muestra de calificaciones normalizadas (primeras 3):`);
    normalizedGrades.slice(0, 3).forEach(g => {
      console.log(`   • ${g.studentName}: ${g.score} pts`);
      console.log(`     courseId: ${g.courseId}, sectionId: ${g.sectionId}`);
    });
  } else {
    console.error(`\n❌ No se pudieron normalizar calificaciones`);
    console.log(`\n   Verifica que las secciones estén correctamente cargadas`);
  }
  
})();
