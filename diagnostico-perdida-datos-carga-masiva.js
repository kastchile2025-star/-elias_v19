/**
 * 🔍 DIAGNÓSTICO: Pérdida de Datos Después de Carga Masiva
 * 
 * PROBLEMA REPORTADO:
 * - Después de carga masiva de calificaciones
 * - Los datos aparecen inicialmente
 * - Luego desaparecen cuando termina la carga en Firebase
 * - Los estudiantes de secciones y cursos también desaparecen
 * 
 * USO:
 * 1. Abrir consola del navegador en Admin > Calificaciones
 * 2. Copiar y pegar este script COMPLETO
 * 3. Ejecutar antes y después de la carga masiva
 */

(async function diagnosticoPerdidaDatos() {
  console.clear();
  console.log('%c🔍 DIAGNÓSTICO: PÉRDIDA DE DATOS DESPUÉS DE CARGA MASIVA', 
    'font-size: 16px; font-weight: bold; color: #fff; background: #e74c3c; padding: 10px;');
  console.log('\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  console.log(`📅 Año seleccionado: ${year}`);

  // ============================================
  // 1. ESTADO DE LOCALSTORAGE
  // ============================================
  console.log('\n%c1️⃣ ESTADO DE LOCALSTORAGE', 'font-size: 14px; font-weight: bold; color: #3498db;');
  
  const gradesKey = `smart-student-test-grades-${year}`;
  const coursesKey = `smart-student-courses-${year}`;
  const sectionsKey = `smart-student-sections-${year}`;
  const studentsKey = `smart-student-students-${year}`;
  
  try {
    const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
    const courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
    const sections = JSON.parse(localStorage.getItem(sectionsKey) || '[]');
    const students = JSON.parse(localStorage.getItem(studentsKey) || '[]');
    
    console.log('📊 Calificaciones:', grades.length, grades.length > 0 ? '✅' : '❌');
    console.log('📚 Cursos:', courses.length, courses.length > 0 ? '✅' : '❌');
    console.log('🏫 Secciones:', sections.length, sections.length > 0 ? '✅' : '❌');
    console.log('👨‍🎓 Estudiantes:', students.length, students.length > 0 ? '✅' : '❌');
    
    if (grades.length > 0) {
      const sample = grades[0];
      console.log('\n📝 Muestra de calificación:');
      console.log('  - Estudiante:', sample.studentName);
      console.log('  - Curso:', sample.courseId);
      console.log('  - Asignatura:', sample.subjectId);
      console.log('  - Nota:', sample.score);
      console.log('  - Fecha:', new Date(sample.gradedAt).toLocaleDateString());
    }
    
    if (courses.length === 0) {
      console.warn('\n⚠️ NO HAY CURSOS - Este es un problema crítico');
      console.log('💡 Solución: Ve a Admin > Configuración > Gestión de Cursos');
    }
    
    if (students.length === 0) {
      console.warn('\n⚠️ NO HAY ESTUDIANTES - Este es un problema crítico');
      console.log('💡 Solución: Ve a Admin > Configuración > Gestión de Estudiantes');
    }
    
  } catch (err) {
    console.error('❌ Error leyendo LocalStorage:', err);
  }

  // ============================================
  // 2. ESTADO DE FIREBASE
  // ============================================
  console.log('\n%c2️⃣ ESTADO DE FIREBASE', 'font-size: 14px; font-weight: bold; color: #f39c12;');
  
  // Detectar si Firebase está habilitado (en el navegador)
  const useFirebase = typeof window !== 'undefined' && 
    (window.location.hostname.includes('localhost') || 
     document.querySelector('meta[name="firebase-enabled"]')?.content === 'true');
  console.log('Firebase habilitado:', useFirebase ? '✅' : '❌');
  
  if (useFirebase) {
    try {
      const { getFirestoreInstance } = await import('/src/lib/firebase-config.js');
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      
      const db = getFirestoreInstance();
      if (!db) {
        console.warn('⚠️ Firestore no está inicializado');
      } else {
        console.log('✅ Firestore inicializado correctamente');
        
        // Contar calificaciones en Firebase
        try {
          const coursesSnap = await getDocs(collection(db, 'courses'));
          let totalGrades = 0;
          let totalActivities = 0;
          
          for (const courseDoc of coursesSnap.docs) {
            const courseId = courseDoc.id;
            
            // Calificaciones
            const gradesSnap = await getDocs(
              query(
                collection(db, `courses/${courseId}/grades`),
                where('year', '==', year)
              )
            );
            totalGrades += gradesSnap.size;
            
            // Actividades
            const activitiesSnap = await getDocs(
              query(
                collection(db, `courses/${courseId}/activities`),
                where('year', '==', year)
              )
            );
            totalActivities += activitiesSnap.size;
          }
          
          console.log('\n📊 Datos en Firebase:');
          console.log('  - Cursos:', coursesSnap.size);
          console.log('  - Calificaciones:', totalGrades, totalGrades > 0 ? '✅' : '❌');
          console.log('  - Actividades:', totalActivities, totalActivities > 0 ? '✅' : '❌');
          
          if (totalGrades === 0) {
            console.warn('\n⚠️ NO HAY CALIFICACIONES EN FIREBASE');
            console.log('💡 Posibles causas:');
            console.log('   1. La carga masiva no se completó');
            console.log('   2. Firebase aún está indexando los datos');
            console.log('   3. Error en las credenciales de Firebase Admin');
          }
          
        } catch (queryErr) {
          console.error('❌ Error consultando Firebase:', queryErr);
        }
      }
    } catch (importErr) {
      console.error('❌ Error importando Firebase:', importErr);
    }
  }

  // ============================================
  // 3. LISTENERS DE EVENTOS
  // ============================================
  console.log('\n%c3️⃣ LISTENERS DE EVENTOS', 'font-size: 14px; font-weight: bold; color: #9b59b6;');
  
  console.log('📡 Monitoreando eventos críticos...');
  console.log('   (Deja esta consola abierta durante la carga masiva)\n');
  
  // Monitor de dataImported
  window.addEventListener('dataImported', (e) => {
    console.log('\n%c📦 EVENTO: dataImported', 'background: #2ecc71; color: white; padding: 5px;');
    console.log('Detail:', e.detail);
    
    if (e.detail?.skipFirebaseReload === true) {
      console.log('✅ skipFirebaseReload=true (CORRECTO)');
      console.log('   → La UI NO intentará recargar desde Firebase inmediatamente');
      console.log('   → Usará LocalStorage como caché');
    } else {
      console.warn('⚠️ skipFirebaseReload=false o undefined (PROBLEMA)');
      console.warn('   → La UI intentará recargar desde Firebase');
      console.warn('   → Si Firebase no terminó de indexar, los datos desaparecerán');
    }
  });
  
  // Monitor de sqlGradesUpdated
  window.addEventListener('sqlGradesUpdated', (e) => {
    console.log('\n%c📊 EVENTO: sqlGradesUpdated', 'background: #3498db; color: white; padding: 5px;');
    console.log('Detail:', e.detail);
    
    if (e.detail?.skipFirebaseReload === true) {
      console.log('✅ skipFirebaseReload=true (CORRECTO)');
    } else {
      console.warn('⚠️ skipFirebaseReload=false o undefined');
    }
  });
  
  // Monitor de cambios en LocalStorage
  window.addEventListener('storage', (e) => {
    if (e.key === gradesKey) {
      const newData = e.newValue ? JSON.parse(e.newValue) : [];
      console.log('\n%c💾 CAMBIO EN LOCALSTORAGE: Calificaciones', 'background: #f39c12; color: white; padding: 5px;');
      console.log('Nuevos registros:', newData.length);
      
      if (newData.length === 0) {
        console.error('❌ ALERTA: LocalStorage fue vaciado!');
        console.error('   Esto explica por qué los datos desaparecen');
      }
    }
  });
  
  // ============================================
  // 4. INSTRUCCIONES
  // ============================================
  console.log('\n%c4️⃣ INSTRUCCIONES', 'font-size: 14px; font-weight: bold; color: #16a085;');
  
  console.log('\n📋 Pasos para diagnosticar:');
  console.log('\n1. ANTES de cargar el CSV:');
  console.log('   - Anota cuántos registros hay en LocalStorage arriba');
  console.log('   - Deja esta consola abierta');
  
  console.log('\n2. DURANTE la carga masiva:');
  console.log('   - Observa los eventos que aparecen');
  console.log('   - Verifica que skipFirebaseReload=true');
  
  console.log('\n3. DESPUÉS de la carga:');
  console.log('   - Ejecuta este script de nuevo');
  console.log('   - Compara los números antes y después');
  
  console.log('\n4. SI los datos desaparecen:');
  console.log('   - Busca el evento que causó el vaciado');
  console.log('   - Verifica el mensaje "CAMBIO EN LOCALSTORAGE"');
  console.log('   - Reporta qué evento ocurrió justo antes');

  // ============================================
  // 5. VERIFICACIÓN DE CÓDIGO
  // ============================================
  console.log('\n%c5️⃣ VERIFICACIÓN DE CÓDIGO', 'font-size: 14px; font-weight: bold; color: #c0392b;');
  
  console.log('\n📝 Verificando implementación de la solución...');
  
  // Verificar que el archivo configuration.tsx tiene la corrección
  try {
    const response = await fetch('/src/components/admin/user-management/configuration.tsx');
    const code = await response.text();
    
    const hasSkipFirebaseReload = code.includes('skipFirebaseReload: true');
    const hasCorrectComment = code.includes('Flag para evitar recarga inmediata de Firebase');
    
    console.log('✅ Archivo configuration.tsx:');
    console.log('  - skipFirebaseReload implementado:', hasSkipFirebaseReload ? '✅' : '❌');
    console.log('  - Comentarios correctos:', hasCorrectComment ? '✅' : '❌');
    
    if (!hasSkipFirebaseReload) {
      console.error('\n❌ PROBLEMA: La solución NO está implementada');
      console.error('   El archivo configuration.tsx no tiene skipFirebaseReload: true');
      console.error('\n💡 Acción requerida:');
      console.error('   1. Ver archivo: SOLUCION_PERDIDA_DATOS_CARGA_MASIVA.md');
      console.error('   2. Aplicar los cambios descritos');
    }
  } catch (err) {
    console.warn('⚠️ No se pudo verificar el código fuente:', err.message);
  }

  // ============================================
  // 6. RESUMEN
  // ============================================
  console.log('\n%c6️⃣ RESUMEN', 'font-size: 14px; font-weight: bold; color: #34495e;');
  
  const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
  const courses = JSON.parse(localStorage.getItem(coursesKey) || '[]');
  const students = JSON.parse(localStorage.getItem(studentsKey) || '[]');
  
  if (grades.length > 0 && courses.length > 0 && students.length > 0) {
    console.log('\n✅ Estado actual: DATOS PRESENTES');
    console.log('   Todo parece estar bien en este momento');
  } else {
    console.log('\n❌ Estado actual: DATOS FALTANTES');
    console.log('\n   Problemas detectados:');
    if (grades.length === 0) console.log('   ❌ Sin calificaciones');
    if (courses.length === 0) console.log('   ❌ Sin cursos');
    if (students.length === 0) console.log('   ❌ Sin estudiantes');
    
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Cargar datos básicos (cursos, estudiantes)');
    console.log('   2. Ejecutar carga masiva con esta consola abierta');
    console.log('   3. Observar qué evento causa la pérdida de datos');
  }

  console.log('\n📚 Documentación:');
  console.log('   - SOLUCION_PERDIDA_DATOS_CARGA_MASIVA.md');
  console.log('   - SOLUCION_ACTUALIZACION_CALIFICACIONES.md');
  console.log('   - CARGA_MASIVA_UI_FIREBASE.md');

  console.log('\n%c✅ DIAGNÓSTICO COMPLETADO', 'font-size: 14px; font-weight: bold; color: #fff; background: #27ae60; padding: 10px;');
  console.log('Los listeners de eventos están activos. Procede con la carga masiva.\n');

})();
