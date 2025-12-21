/**
 * 🧪 Script de Prueba: Consultas Optimizadas Firebase en Calificaciones
 * 
 * USO:
 * 1. Abrir Dashboard → Calificaciones
 * 2. Abrir consola del navegador (F12)
 * 3. Copiar y pegar este script
 * 4. Presionar Enter
 * 5. Seguir las instrucciones en pantalla
 */

(async function testOptimizedFirebaseQueries() {
  console.clear();
  console.log('%c🧪 TEST: Consultas Optimizadas Firebase - Calificaciones', 'font-size: 16px; font-weight: bold; color: #4F46E5; background: #EEF2FF; padding: 10px;');
  console.log('\n');
  
  // Verificar que estamos en la página correcta
  if (!window.location.pathname.includes('/calificaciones')) {
    console.error('❌ ERROR: Debes ejecutar este script en Dashboard → Calificaciones');
    console.log('   URL actual:', window.location.pathname);
    return;
  }
  
  console.log('✅ Ubicación correcta: Dashboard → Calificaciones\n');
  
  // ==============================================================
  // PASO 1: Verificar Conexión Firebase
  // ==============================================================
  console.log('%c📡 PASO 1: Verificando Conexión Firebase', 'font-size: 14px; font-weight: bold; color: #059669; padding: 5px;');
  
  const useFirebase = localStorage.getItem('smart-student-sql-enabled') === 'true' || 
                      process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
  
  if (!useFirebase) {
    console.warn('⚠️ Firebase NO está habilitado en configuración');
    console.log('   Para habilitar:');
    console.log('   1. Ve a Admin → Configuración');
    console.log('   2. Activa "Usar SQL/Firebase"\n');
    return;
  }
  
  console.log('✅ Firebase habilitado en configuración\n');
  
  // Verificar badge de conexión
  const badge = document.querySelector('[title*="Firebase"]') || 
                document.querySelector('[title*="Conectado a Firebase"]');
  
  if (badge) {
    console.log('✅ Badge de conexión encontrado:', badge.textContent.trim());
    console.log('   Tooltip:', badge.getAttribute('title'));
  } else {
    console.warn('⚠️ No se encontró el badge de conexión Firebase');
    console.log('   Esto es normal si Firebase aún no está conectado\n');
  }
  
  console.log('\n');
  
  // ==============================================================
  // PASO 2: Verificar Estructura de Datos
  // ==============================================================
  console.log('%c📊 PASO 2: Verificando Datos en LocalStorage', 'font-size: 14px; font-weight: bold; color: #059669; padding: 5px;');
  
  const year = Number(localStorage.getItem('admin-selected-year')) || new Date().getFullYear();
  const gradesKey = `smart-student-test-grades-${year}`;
  const coursesKey = `smart-student-courses-${year}`;
  const sectionsKey = `smart-student-sections-${year}`;
  
  console.log('📅 Año seleccionado:', year);
  
  const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
  const courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
  const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
  
  console.log('   Calificaciones:', grades.length);
  console.log('   Cursos:', courses.length);
  console.log('   Secciones:', sections.length);
  
  if (grades.length === 0) {
    console.warn('\n⚠️ No hay calificaciones en LocalStorage para el año', year);
    console.log('   Esto es esperado si:');
    console.log('   1. Aún no se ha realizado carga masiva');
    console.log('   2. Las calificaciones solo están en Firebase (consulta directa)');
    console.log('   3. Es un año sin datos\n');
  }
  
  if (sections.length === 0) {
    console.error('\n❌ ERROR: No hay secciones configuradas');
    console.log('   Las secciones son necesarias para pruebas de filtrado');
    console.log('   Ve a Admin → Configuración → Cursos y Secciones\n');
    return;
  }
  
  console.log('\n✅ Datos estructurales encontrados\n');
  
  // ==============================================================
  // PASO 3: Listar Secciones Disponibles
  // ==============================================================
  console.log('%c📋 PASO 3: Secciones Disponibles para Pruebas', 'font-size: 14px; font-weight: bold; color: #059669; padding: 5px;');
  
  console.log('\n   Secciones encontradas:');
  sections.slice(0, 10).forEach((s, i) => {
    const course = courses.find(c => c.id === s.courseId);
    console.log(`   ${i + 1}. ${course?.name || 'Curso desconocido'} ${s.name} (ID: ${s.id})`);
  });
  
  if (sections.length > 10) {
    console.log(`   ... y ${sections.length - 10} más\n`);
  }
  
  // ==============================================================
  // PASO 4: Instrucciones de Prueba Manual
  // ==============================================================
  console.log('\n');
  console.log('%c🎯 PASO 4: Prueba Manual - Consultas Optimizadas', 'font-size: 14px; font-weight: bold; color: #DC2626; padding: 5px;');
  console.log('\n');
  console.log('%c1️⃣ Verificar Badge de Conexión', 'font-weight: bold; color: #4F46E5;');
  console.log('   • Busca en la esquina superior derecha el badge: 🔥 Firebase');
  console.log('   • DEBE estar SIEMPRE visible (incluso sin calificaciones)\n');
  
  console.log('%c2️⃣ Probar Filtro por Sección', 'font-weight: bold; color: #4F46E5;');
  console.log('   • En los filtros, selecciona una sección específica');
  console.log('   • Ejemplo: "1ro Básico A" o cualquiera de la lista arriba');
  console.log('   • Observa la consola: debe mostrar logs de consulta optimizada\n');
  
  console.log('%c3️⃣ Verificar Indicador de Consulta Optimizada', 'font-weight: bold; color: #4F46E5;');
  console.log('   • Al seleccionar una sección, debe aparecer badge: ⚡ Filtrado directo');
  console.log('   • Este badge indica que se está consultando directamente Firebase');
  console.log('   • Solo se cargan calificaciones de esa sección (no todo el año)\n');
  
  console.log('%c4️⃣ Verificar Logs en Consola', 'font-weight: bold; color: #4F46E5;');
  console.log('   • Busca estos mensajes al filtrar:');
  console.log('     🚀 [Optimized Query] Ejecutando consulta optimizada a Firebase');
  console.log('     ✅ [Optimized Query] Recibidas X calificaciones de Firebase\n');
  
  console.log('%c5️⃣ Probar Cambio de Filtros', 'font-weight: bold; color: #4F46E5;');
  console.log('   • Cambia de sección varias veces');
  console.log('   • Cada cambio debe ejecutar una nueva consulta optimizada');
  console.log('   • El badge 🔥 Firebase NUNCA debe desaparecer\n');
  
  console.log('%c6️⃣ Verificar Modo "Todas las Secciones"', 'font-weight: bold; color: #4F46E5;');
  console.log('   • Selecciona "Todas las secciones" en el filtro');
  console.log('   • El badge ⚡ Filtrado directo debe desaparecer');
  console.log('   • Se cargarán todas las calificaciones del año\n');
  
  // ==============================================================
  // PASO 5: Funciones de Utilidad para Testing
  // ==============================================================
  console.log('\n');
  console.log('%c🛠️ FUNCIONES DE UTILIDAD', 'font-size: 14px; font-weight: bold; color: #7C3AED; padding: 5px;');
  console.log('\n');
  console.log('Funciones disponibles en window para testing:\n');
  
  // Función para verificar estado de conexión
  window.testFirebaseConnection = function() {
    console.log('\n%c🔍 Estado de Conexión Firebase', 'font-weight: bold; color: #4F46E5;');
    console.log('   Firebase habilitado:', useFirebase);
    console.log('   Badge visible:', !!badge);
    
    // Verificar si hay listener activo
    const hasListener = window.hasOwnProperty('testOptimizedQuery');
    console.log('   Listener optimizado:', hasListener ? 'Activo' : 'Inactivo');
    
    return { useFirebase, badgeVisible: !!badge, hasListener };
  };
  
  // Función para simular consulta optimizada (solo muestra lo que haría)
  window.testOptimizedQuery = function(sectionId) {
    console.log('\n%c🚀 Simulando Consulta Optimizada', 'font-weight: bold; color: #4F46E5;');
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) {
      console.error('❌ Sección no encontrada:', sectionId);
      console.log('   Secciones disponibles:', sections.map(s => s.id));
      return;
    }
    
    const course = courses.find(c => c.id === section.courseId);
    console.log('   Curso:', course?.name || 'Desconocido');
    console.log('   Sección:', section.name);
    console.log('   CourseId:', section.courseId);
    console.log('   SectionId:', sectionId);
    console.log('   Año:', year);
    
    console.log('\n   Esta consulta solo traería calificaciones de:');
    console.log(`   ${course?.name} ${section.name} (${year})`);
    
    // Contar calificaciones aproximadas en LocalStorage
    const filtered = grades.filter(g => g.sectionId === sectionId);
    console.log(`\n   Calificaciones en LocalStorage para esta sección: ${filtered.length}`);
    
    if (filtered.length > 0) {
      console.log('   Muestra (primeras 3):');
      filtered.slice(0, 3).forEach(g => {
        console.log(`     • ${g.studentName}: ${g.score} pts (${g.title || 'Sin título'})`);
      });
    }
  };
  
  // Función para listar todas las secciones
  window.testListSections = function() {
    console.log('\n%c📋 Todas las Secciones', 'font-weight: bold; color: #4F46E5;');
    sections.forEach((s, i) => {
      const course = courses.find(c => c.id === s.courseId);
      console.log(`${i + 1}. ${course?.name || '?'} ${s.name} → ID: "${s.id}"`);
    });
    console.log(`\nTotal: ${sections.length} secciones`);
  };
  
  // Función para verificar calificaciones en Firebase (si está disponible)
  window.testFirebaseGrades = async function(courseId, sectionId, subjectId = null) {
    console.log('\n%c🔥 Consultando Firebase Directamente', 'font-weight: bold; color: #DC2626;');
    
    try {
      const { getFirestoreInstance } = await import('/src/lib/firebase-config');
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      
      const db = getFirestoreInstance();
      if (!db) {
        console.error('❌ Firestore no está inicializado');
        return;
      }
      
      console.log('   CourseId:', courseId);
      console.log('   SectionId:', sectionId);
      console.log('   SubjectId:', subjectId || '(todas)');
      console.log('   Año:', year);
      
      const gradesRef = collection(db, `courses/${courseId}/grades`);
      
      const constraints = [
        where('year', '==', year)
      ];
      
      if (subjectId) {
        constraints.push(where('subjectId', '==', subjectId));
      }
      
      constraints.push(orderBy('gradedAt', 'desc'));
      
      const q = query(gradesRef, ...constraints);
      const snapshot = await getDocs(q);
      
      console.log(`\n✅ Consulta completada: ${snapshot.size} calificaciones encontradas`);
      
      if (snapshot.size > 0) {
        console.log('\nMuestra (primeras 5):');
        let count = 0;
        snapshot.forEach(doc => {
          if (count < 5) {
            const data = doc.data();
            console.log(`  ${count + 1}. ${data.studentName}: ${data.score} pts - ${data.title}`);
            count++;
          }
        });
      }
      
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error consultando Firebase:', error);
    }
  };
  
  console.log('%c   testFirebaseConnection()', 'color: #7C3AED;');
  console.log('   → Verifica estado de conexión Firebase\n');
  
  console.log('%c   testOptimizedQuery(sectionId)', 'color: #7C3AED;');
  console.log('   → Simula consulta optimizada para una sección');
  console.log('   → Ejemplo: testOptimizedQuery("1ro_basico_a")\n');
  
  console.log('%c   testListSections()', 'color: #7C3AED;');
  console.log('   → Lista todas las secciones disponibles\n');
  
  console.log('%c   testFirebaseGrades(courseId, sectionId, subjectId)', 'color: #7C3AED;');
  console.log('   → Consulta calificaciones directamente desde Firebase');
  console.log('   → Ejemplo: testFirebaseGrades("1ro_basico", "1ro_basico_a")\n');
  
  // ==============================================================
  // RESUMEN FINAL
  // ==============================================================
  console.log('\n');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #4F46E5;');
  console.log('%c✅ TEST COMPLETADO - LISTO PARA PRUEBAS MANUALES', 'font-size: 14px; font-weight: bold; color: #059669; padding: 5px;');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #4F46E5;');
  console.log('\n');
  
  console.log('📌 CHECKLIST DE VERIFICACIÓN:\n');
  console.log('   [ ] Badge 🔥 Firebase visible en todo momento');
  console.log('   [ ] Al filtrar por sección aparece badge ⚡ Filtrado directo');
  console.log('   [ ] Logs de consulta optimizada en consola');
  console.log('   [ ] Calificaciones se cargan correctamente');
  console.log('   [ ] Badge permanece visible al cambiar filtros');
  console.log('   [ ] Indicador de progreso muestra 0% → 100%');
  console.log('\n');
  
  console.log('💡 TIP: Usa las funciones de utilidad para debugging avanzado\n');
  
})();
