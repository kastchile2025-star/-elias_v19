// ============================================================================
// 🔧 SCRIPT DE CORRECCIÓN AUTOMÁTICA - Asignación de Estudiantes
// ============================================================================
// Ejecuta este script en la consola del navegador (F12) para:
// 1. Verificar que los estudiantes tienen courseId y sectionId
// 2. Si no los tienen, reasignarlos basándose en el campo "course" y "section"
// 3. Si los campos están vacíos, asignar por ÍNDICE (45 por sección)
// 4. Actualizar los contadores de las secciones
// ============================================================================

(function() {
  console.log('🚀 Iniciando corrección automática de asignaciones...\n');
  
  const year = 2025;
  
  // Cargar datos
  const students = JSON.parse(localStorage.getItem(`smart-student-students-${year}`) || '[]');
  const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${year}`) || '[]');
  const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${year}`) || '[]');
  
  console.log(`📊 Datos cargados:`);
  console.log(`   Estudiantes: ${students.length}`);
  console.log(`   Cursos: ${courses.length}`);
  console.log(`   Secciones: ${sections.length}\n`);
  
  if (students.length === 0) {
    console.error('❌ No hay estudiantes en el sistema');
    return;
  }
  
  if (courses.length === 0) {
    console.error('❌ No hay cursos creados. Crea los cursos primero.');
    return;
  }
  
  // Función para normalizar texto
  const normalize = (s) => String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u00ba\u00b0]/g, '')
    .replace(/(\d+)\s*(ro|do|to|mo|vo)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Crear mapas para búsqueda rápida
  const courseMap = new Map();
  courses.forEach(c => {
    courseMap.set(normalize(c.name), c);
  });
  
  const sectionMap = new Map();
  sections.forEach(s => {
    const key = `${s.courseId}|${normalize(s.name)}`;
    sectionMap.set(key, s);
  });
  
  // Distribución por índice (45 estudiantes por sección, orden del CSV)
  const distribucion = [
    { curso: '1ro Básico', seccion: 'A', inicio: 0, fin: 45 },
    { curso: '1ro Básico', seccion: 'B', inicio: 45, fin: 90 },
    { curso: '2do Básico', seccion: 'A', inicio: 90, fin: 135 },
    { curso: '2do Básico', seccion: 'B', inicio: 135, fin: 180 },
    { curso: '3ro Básico', seccion: 'A', inicio: 180, fin: 225 },
    { curso: '3ro Básico', seccion: 'B', inicio: 225, fin: 270 },
    { curso: '4to Básico', seccion: 'A', inicio: 270, fin: 315 },
    { curso: '4to Básico', seccion: 'B', inicio: 315, fin: 360 },
    { curso: '5to Básico', seccion: 'A', inicio: 360, fin: 405 },
    { curso: '5to Básico', seccion: 'B', inicio: 405, fin: 450 },
    { curso: '6to Básico', seccion: 'A', inicio: 450, fin: 495 },
    { curso: '6to Básico', seccion: 'B', inicio: 495, fin: 540 },
    { curso: '7mo Básico', seccion: 'A', inicio: 540, fin: 585 },
    { curso: '7mo Básico', seccion: 'B', inicio: 585, fin: 630 },
    { curso: '8vo Básico', seccion: 'A', inicio: 630, fin: 675 },
    { curso: '8vo Básico', seccion: 'B', inicio: 675, fin: 720 },
    { curso: '1ro Medio', seccion: 'A', inicio: 720, fin: 765 },
    { curso: '1ro Medio', seccion: 'B', inicio: 765, fin: 810 },
    { curso: '2do Medio', seccion: 'A', inicio: 810, fin: 855 },
    { curso: '2do Medio', seccion: 'B', inicio: 855, fin: 900 },
    { curso: '3ro Medio', seccion: 'A', inicio: 900, fin: 945 },
    { curso: '3ro Medio', seccion: 'B', inicio: 945, fin: 990 },
    { curso: '4to Medio', seccion: 'A', inicio: 990, fin: 1035 },
    { curso: '4to Medio', seccion: 'B', inicio: 1035, fin: 1080 }
  ];
  
  // Estadísticas
  let yaAsignados = 0;
  let reasignadosPorCampo = 0;
  let reasignadosPorIndice = 0;
  let errores = 0;
  
  // ESTRATEGIA 1: Intentar asignar por campos course/section
  students.forEach((student, index) => {
    // Verificar si ya tiene asignación completa
    if (student.courseId && student.sectionId) {
      yaAsignados++;
      return;
    }
    
    // Intentar asignar basándose en los campos course/section
    const courseName = student.course || '';
    const sectionName = student.section || '';
    
    if (courseName && sectionName) {
      const courseNorm = normalize(courseName);
      const course = courseMap.get(courseNorm);
      
      if (course) {
        const sectionKey = `${course.id}|${normalize(sectionName)}`;
        const section = sectionMap.get(sectionKey);
        
        if (section) {
          student.courseId = course.id;
          student.sectionId = section.id;
          reasignadosPorCampo++;
          
          if (reasignadosPorCampo <= 3) {
            console.log(`✅ Asignado por campo: ${student.name} → ${courseName} ${sectionName}`);
          }
        }
      }
    }
  });
  
  // ESTRATEGIA 2: Para estudiantes sin campos, asignar por ÍNDICE
  console.log('\n🔄 Asignando estudiantes sin campos por índice...\n');
  
  distribucion.forEach((dist, distIndex) => {
    const courseNorm = normalize(dist.curso);
    const course = courseMap.get(courseNorm);
    
    if (!course) {
      console.error(`❌ Curso no encontrado: ${dist.curso}`);
      return;
    }
    
    const sectionKey = `${course.id}|${normalize(dist.seccion)}`;
    const section = sectionMap.get(sectionKey);
    
    if (!section) {
      console.error(`❌ Sección no encontrada: ${dist.seccion} en ${dist.curso}`);
      return;
    }
    
    let asignadosEnSeccion = 0;
    
    for (let i = dist.inicio; i < dist.fin && i < students.length; i++) {
      const student = students[i];
      
      // Solo asignar si no tiene courseId/sectionId
      if (!student.courseId || !student.sectionId) {
        student.course = dist.curso;
        student.section = dist.seccion;
        student.courseId = course.id;
        student.sectionId = section.id;
        asignadosEnSeccion++;
        reasignadosPorIndice++;
      }
    }
    
    if (asignadosEnSeccion > 0) {
      console.log(`✅ ${dist.curso} ${dist.seccion}: ${asignadosEnSeccion} estudiantes asignados por índice`);
    }
  });
  
  console.log(`\n📊 RESULTADOS:`);
  console.log(`   ✅ Ya asignados: ${yaAsignados}`);
  console.log(`   🔧 Reasignados por campo: ${reasignadosPorCampo}`);
  console.log(`   🔧 Reasignados por índice: ${reasignadosPorIndice}`);
  console.log(`   ❌ Total reasignados: ${reasignadosPorCampo + reasignadosPorIndice}\n`);
  
  // Guardar estudiantes actualizados
  if (reasignadosPorCampo > 0 || reasignadosPorIndice > 0) {
    try {
      localStorage.setItem(`smart-student-students-${year}`, JSON.stringify(students));
      console.log('💾 Estudiantes guardados correctamente\n');
    } catch (e) {
      console.error('❌ Error al guardar estudiantes:', e);
      return;
    }
  }
  
  // Recalcular contadores de secciones
  console.log('🔢 Recalculando contadores de secciones...');
  const countsBySectionId = new Map();
  
  students.forEach(s => {
    if (s.sectionId) {
      const current = countsBySectionId.get(s.sectionId) || 0;
      countsBySectionId.set(s.sectionId, current + 1);
    }
  });
  
  sections.forEach(sec => {
    const newCount = countsBySectionId.get(sec.id) || 0;
    sec.studentCount = newCount;
    console.log(`   📊 ${courses.find(c => c.id === sec.courseId)?.name} ${sec.name}: ${newCount} estudiantes`);
  });
  
  try {
    localStorage.setItem(`smart-student-sections-${year}`, JSON.stringify(sections));
    console.log('\n💾 Contadores actualizados correctamente\n');
  } catch (e) {
    console.error('❌ Error al guardar secciones:', e);
  }
  
  // Guardar cursos también (para refrescar)
  try {
    localStorage.setItem(`smart-student-courses-${year}`, JSON.stringify(courses));
    console.log('💾 Cursos guardados correctamente\n');
  } catch (e) {
    console.error('❌ Error al guardar cursos:', e);
  }
  
  // Mostrar resumen de contadores
  console.log('📊 CONTADORES POR SECCIÓN:');
  const courseSections = new Map();
  sections.forEach(sec => {
    const course = courses.find(c => c.id === sec.courseId);
    if (course) {
      const key = course.name;
      if (!courseSections.has(key)) courseSections.set(key, []);
      courseSections.get(key).push({ name: sec.name, count: sec.studentCount || 0 });
    }
  });
  
  courseSections.forEach((secs, courseName) => {
    console.log(`\n   ${courseName}:`);
    secs.forEach(s => {
      console.log(`      ${s.name}: ${s.count} estudiantes`);
    });
  });
  
  // Disparar eventos para refrescar UI
  console.log('\n🔄 Disparando eventos de actualización...');
  try {
    const totalReasignados = reasignadosPorCampo + reasignadosPorIndice;
    
    // Eventos principales
    window.dispatchEvent(new CustomEvent('usersUpdated', { 
      detail: { action: 'manual-reassignment', total: totalReasignados } 
    }));
    
    window.dispatchEvent(new CustomEvent('sectionsChanged', { 
      detail: { source: 'manual-reassignment' } 
    }));
    
    window.dispatchEvent(new CustomEvent('coursesChanged', { 
      detail: { source: 'manual-reassignment' } 
    }));
    
    // StorageEvent para forzar sincronización completa
    window.dispatchEvent(new StorageEvent('storage', { 
      key: `smart-student-students-${year}`, 
      newValue: JSON.stringify(students)
    }));
    
    window.dispatchEvent(new StorageEvent('storage', { 
      key: `smart-student-sections-${year}`, 
      newValue: JSON.stringify(sections)
    }));
    
    window.dispatchEvent(new StorageEvent('storage', { 
      key: `smart-student-courses-${year}`, 
      newValue: JSON.stringify(courses)
    }));
    
    console.log('✅ Eventos disparados correctamente');
  } catch (e) {
    console.warn('⚠️  No se pudieron disparar eventos:', e);
  }
  
  console.log('\n✅ CORRECCIÓN COMPLETADA');
  console.log('🔄 Refresca la página (F5) para ver los cambios\n');
  
})();
