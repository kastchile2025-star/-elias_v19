/**
 * 🔍 VERIFICAR ESTRUCTURA DE LOCALSTORAGE
 * 
 * Copiar y pegar en la consola del navegador
 */

(function() {
  console.clear();
  console.log('%c🔍 VERIFICACIÓN DE LOCALSTORAGE', 'font-size: 20px; font-weight: bold; color: #3B82F6');
  console.log('═'.repeat(70) + '\n');

  // Listar TODAS las claves
  console.log('📋 TODAS LAS CLAVES EN LOCALSTORAGE:\n');
  const todasLasClaves = [];
  for (let i = 0; i < localStorage.length; i++) {
    todasLasClaves.push(localStorage.key(i));
  }
  
  todasLasClaves.sort().forEach((key, index) => {
    const valor = localStorage.getItem(key);
    const size = new Blob([valor]).size;
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`${index + 1}. ${key}`);
    console.log(`   📦 Tamaño: ${sizeKB} KB`);
    
    // Intentar parsear como JSON
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed)) {
        console.log(`   📊 Tipo: Array con ${parsed.length} elementos`);
        if (parsed.length > 0) {
          console.log(`   🔑 Primera entrada:`, parsed[0]);
        }
      } else if (typeof parsed === 'object') {
        console.log(`   📊 Tipo: Objeto con claves:`, Object.keys(parsed));
      }
    } catch {
      console.log(`   📊 Tipo: String (no JSON)`);
    }
    console.log('');
  });

  console.log('\n' + '═'.repeat(70));
  console.log('%c🔍 BUSCANDO DATOS DE CURSOS Y SECCIONES', 'font-size: 16px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(70) + '\n');

  // Buscar claves que podrían contener cursos
  const clavesConCursos = todasLasClaves.filter(k => 
    k.toLowerCase().includes('course') || 
    k.toLowerCase().includes('curso') ||
    k.toLowerCase().includes('section') ||
    k.toLowerCase().includes('seccion')
  );

  if (clavesConCursos.length > 0) {
    console.log('✅ Claves encontradas que podrían contener cursos/secciones:\n');
    clavesConCursos.forEach(key => {
      console.log(`📌 ${key}`);
      const valor = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) {
          console.log(`   Array con ${parsed.length} elementos`);
          if (parsed.length > 0) {
            console.log('   Primera entrada:', JSON.stringify(parsed[0], null, 2));
          }
        } else {
          console.log('   Contenido:', parsed);
        }
      } catch {
        console.log('   No es JSON válido');
      }
      console.log('');
    });
  } else {
    console.log('%c⚠️ NO SE ENCONTRARON CLAVES CON CURSOS/SECCIONES', 'color: #F59E0B; font-weight: bold;');
  }

  // Verificar calificaciones específicamente
  console.log('\n' + '═'.repeat(70));
  console.log('%c📊 ANÁLISIS DE CALIFICACIONES', 'font-size: 16px; font-weight: bold; color: #8B5CF6');
  console.log('═'.repeat(70) + '\n');

  const calificaciones = JSON.parse(localStorage.getItem('smart-student-test-grades-2025') || '[]');
  console.log(`Total calificaciones 2025: ${calificaciones.length}`);

  if (calificaciones.length > 0) {
    const courseIds = [...new Set(calificaciones.map(c => c.courseId))];
    const sectionIds = [...new Set(calificaciones.map(c => c.sectionId))];
    
    console.log(`\n📚 CourseIds únicos encontrados en calificaciones (${courseIds.length}):`);
    courseIds.forEach(id => {
      const count = calificaciones.filter(c => c.courseId === id).length;
      console.log(`   • "${id}" → ${count} calificaciones`);
    });

    console.log(`\n📑 SectionIds únicos encontrados en calificaciones (${sectionIds.length}):`);
    sectionIds.forEach(id => {
      const count = calificaciones.filter(c => c.sectionId === id).length;
      console.log(`   • "${id}" → ${count} calificaciones`);
    });

    console.log('\n📋 Ejemplo de calificación:');
    console.log(JSON.stringify(calificaciones[0], null, 2));
  }

  console.log('\n' + '═'.repeat(70));
  console.log('%c✨ VERIFICACIÓN COMPLETADA', 'font-size: 18px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(70));

})();
