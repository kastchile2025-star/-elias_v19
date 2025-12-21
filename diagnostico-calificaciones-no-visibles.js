/**
 * 🔍 DIAGNÓSTICO: Por qué no se ven las calificaciones
 * 
 * Ejecutar en consola del navegador en Dashboard → Calificaciones
 */

(async function diagnosticarCalificaciones() {
  console.clear();
  console.log('%c🔍 DIAGNÓSTICO: Calificaciones no visibles', 'font-size: 16px; font-weight: bold; color: #DC2626; background: #FEE2E2; padding: 10px;');
  console.log('\n');
  
  // ========================================
  // PASO 1: Verificar datos básicos
  // ========================================
  console.log('%c1️⃣ Verificando datos básicos', 'font-weight: bold; color: #4F46E5; font-size: 14px;');
  
  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  console.log('   Año seleccionado:', year);
  
  const gradesKey = `smart-student-test-grades-${year}`;
  const coursesKey = `smart-student-courses-${year}`;
  const sectionsKey = `smart-student-sections-${year}`;
  
  const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
  const courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
  const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
  
  console.log('   Calificaciones en LocalStorage:', grades.length);
  console.log('   Cursos:', courses.length);
  console.log('   Secciones:', sections.length);
  
  if (grades.length > 0) {
    console.log('\n   Muestra de calificaciones (primeras 3):');
    grades.slice(0, 3).forEach(g => {
      console.log(`     • ${g.studentName}: ${g.score} pts - ${g.title || 'Sin título'}`);
      console.log(`       courseId: ${g.courseId}, sectionId: ${g.sectionId}`);
    });
  }
  
  // ========================================
  // PASO 2: Verificar Firebase directamente
  // ========================================
  console.log('\n%c2️⃣ Consultando Firebase directamente', 'font-weight: bold; color: #4F46E5; font-size: 14px;');
  
  try {
    const { getFirestoreInstance } = await import('/src/lib/firebase-config');
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    
    const db = getFirestoreInstance();
    if (!db) {
      console.error('   ❌ Firestore no está inicializado');
      return;
    }
    
    console.log('   ✅ Firestore inicializado');
    
    // Consultar TODAS las calificaciones del año para diagnóstico
    let totalFound = 0;
    const sampleGrades = [];
    
    for (const course of courses.slice(0, 3)) { // Solo primeros 3 cursos para no saturar
      const courseId = course.id;
      console.log(`\n   📂 Consultando curso: ${course.name} (${courseId})`);
      
      const gradesRef = collection(db, `courses/${courseId}/grades`);
      const q = query(gradesRef, where('year', '==', year));
      const snapshot = await getDocs(q);
      
      console.log(`      Calificaciones encontradas: ${snapshot.size}`);
      totalFound += snapshot.size;
      
      if (snapshot.size > 0 && sampleGrades.length < 5) {
        snapshot.forEach(doc => {
          if (sampleGrades.length < 5) {
            const data = doc.data();
            sampleGrades.push(data);
            console.log(`      • ${data.studentName}: ${data.score} pts`);
            console.log(`        sectionId en Firebase: "${data.sectionId}"`);
            console.log(`        subjectId: "${data.subjectId || data.subject}"`);
          }
        });
      }
    }
    
    console.log(`\n   📊 Total encontrado en Firebase: ${totalFound} calificaciones`);
    
    // ========================================
    // PASO 3: Comparar sectionId
    // ========================================
    console.log('\n%c3️⃣ Comparando sectionId: Firebase vs LocalStorage', 'font-weight: bold; color: #4F46E5; font-size: 14px;');
    
    if (sampleGrades.length > 0) {
      const firebaseSectionId = sampleGrades[0].sectionId;
      console.log(`   Firebase sectionId: "${firebaseSectionId}" (tipo: ${typeof firebaseSectionId})`);
      
      // Buscar sección correspondiente
      const matchingSection = sections.find(s => 
        String(s.id).toLowerCase() === String(firebaseSectionId).toLowerCase() ||
        String(s.name).toLowerCase() === String(firebaseSectionId).toLowerCase()
      );
      
      if (matchingSection) {
        console.log(`   ✅ Sección encontrada en LocalStorage:`, matchingSection);
      } else {
        console.log(`   ❌ NO se encontró sección en LocalStorage con id o name: "${firebaseSectionId}"`);
        console.log(`   Secciones disponibles en LocalStorage:`);
        sections.slice(0, 5).forEach(s => {
          console.log(`      • id: "${s.id}", name: "${s.name}", courseId: "${s.courseId}"`);
        });
      }
    }
    
    // ========================================
    // PASO 4: Verificar estructura de courseId
    // ========================================
    console.log('\n%c4️⃣ Verificando estructura de courseId', 'font-weight: bold; color: #4F46E5; font-size: 14px;');
    
    if (sampleGrades.length > 0) {
      const firebaseCourseId = sampleGrades[0].courseId;
      console.log(`   Firebase courseId: "${firebaseCourseId}"`);
      
      const matchingCourse = courses.find(c => String(c.id) === String(firebaseCourseId));
      if (matchingCourse) {
        console.log(`   ✅ Curso encontrado: ${matchingCourse.name}`);
      } else {
        console.log(`   ❌ NO se encontró curso con id: "${firebaseCourseId}"`);
        console.log(`   Cursos disponibles:`);
        courses.slice(0, 5).forEach(c => {
          console.log(`      • id: "${c.id}", name: "${c.name}"`);
        });
      }
    }
    
    // ========================================
    // PASO 5: Diagnóstico del problema
    // ========================================
    console.log('\n%c🎯 DIAGNÓSTICO', 'font-weight: bold; color: #DC2626; font-size: 14px;');
    
    if (totalFound === 0) {
      console.log('\n   ❌ PROBLEMA: No hay calificaciones en Firebase para el año', year);
      console.log('\n   SOLUCIÓN:');
      console.log('   1. Ve a Admin → Configuración → Carga Masiva');
      console.log('   2. Sube el archivo: calificaciones_ejemplo_carga_masiva_100.csv');
      console.log('   3. Espera la confirmación de carga exitosa');
    } else if (sampleGrades.length === 0) {
      console.log('\n   ⚠️ PROBLEMA: Hay calificaciones pero no se pudieron leer');
    } else {
      const firebaseSectionId = sampleGrades[0].sectionId;
      const matchingSection = sections.find(s => 
        String(s.id).toLowerCase() === String(firebaseSectionId).toLowerCase() ||
        String(s.name).toLowerCase() === String(firebaseSectionId).toLowerCase()
      );
      
      if (!matchingSection) {
        console.log('\n   ❌ PROBLEMA IDENTIFICADO: Mismatch entre sectionId');
        console.log(`\n   Firebase usa: "${firebaseSectionId}"`);
        console.log(`   LocalStorage espera: "${sections[0]?.id}" o "${sections[0]?.name}"`);
        console.log('\n   CAUSA:');
        console.log('   El campo sectionId en Firebase no coincide con los IDs de secciones en LocalStorage');
        console.log('\n   SOLUCIONES POSIBLES:');
        console.log('   A) Recargar secciones desde Admin → Configuración');
        console.log('   B) Verificar que la carga masiva usó los sectionId correctos');
        console.log('   C) Modificar el código para normalizar sectionId');
      } else {
        console.log('\n   ✅ La estructura parece correcta');
        console.log('\n   Verifica los filtros activos:');
        console.log('   • ¿Seleccionaste el nivel correcto? (Básica/Media)');
        console.log('   • ¿Seleccionaste el curso correcto?');
        console.log('   • ¿Seleccionaste la sección correcta?');
      }
    }
    
    // ========================================
    // PASO 6: Función de corrección
    // ========================================
    console.log('\n%c🔧 FUNCIÓN DE CORRECCIÓN', 'font-weight: bold; color: #7C3AED; font-size: 14px;');
    
    window.corregirCalificacionesFirebase = async function() {
      console.log('\n🔄 Intentando corregir calificaciones...');
      
      try {
        const { getFirestoreInstance } = await import('/src/lib/firebase-config');
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        
        const db = getFirestoreInstance();
        
        const allGrades = [];
        
        for (const course of courses) {
          const gradesRef = collection(db, `courses/${course.id}/grades`);
          const q = query(gradesRef, where('year', '==', year));
          const snapshot = await getDocs(q);
          
          snapshot.forEach(doc => {
            const data = doc.data();
            allGrades.push({
              ...data,
              gradedAt: typeof data.gradedAt === 'string' ? new Date(data.gradedAt).getTime() : data.gradedAt
            });
          });
        }
        
        console.log(`✅ Cargadas ${allGrades.length} calificaciones desde Firebase`);
        
        // Guardar en LocalStorage
        const { LocalStorageManager } = await import('/src/lib/education-utils');
        LocalStorageManager.setTestGradesForYear(year, allGrades);
        
        console.log('✅ Guardadas en LocalStorage');
        console.log('🔄 Recargando página...');
        
        window.location.reload();
      } catch (error) {
        console.error('❌ Error:', error);
      }
    };
    
    console.log('\n   Función disponible: corregirCalificacionesFirebase()');
    console.log('   Ejecuta esta función para intentar cargar y corregir las calificaciones');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
  
  console.log('\n%c═══════════════════════════════════════', 'color: #4F46E5;');
  
})();
