/**
 * Script: Forzar Actualización de Estadísticas en Configuración
 * 
 * PROBLEMA:
 * Después de realizar la carga masiva de calificaciones desde Excel,
 * la pestaña "Configuración" no muestra correctamente la cantidad de
 * estudiantes por curso-sección, aunque en "Cursos y Secciones" sí aparece.
 * 
 * CAUSA:
 * Las estadísticas en la pestaña Configuración se calculan desde LocalStorage,
 * pero después de la carga masiva a Firebase, los datos pueden no estar
 * sincronizados.
 * 
 * USO:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este script completo
 * 3. Presiona Enter
 */

(async function forzarActualizacionEstadisticas() {
  console.log('🔄 Iniciando actualización forzada de estadísticas...');
  
  try {
    // Obtener año seleccionado
    const selectedYear = Number(localStorage.getItem('admin-selected-year')) || new Date().getFullYear();
    console.log(`📅 Año seleccionado: ${selectedYear}`);
    
    // Emitir eventos para actualizar estadísticas
    console.log('🔔 Emitiendo eventos de actualización...');
    
    // Evento dataImported (que ya está escuchándose en Configuration.tsx)
    window.dispatchEvent(new CustomEvent('dataImported', { 
      detail: { type: 'grades', year: selectedYear, timestamp: Date.now() } 
    }));
    
    // Evento force-stats-update
    window.dispatchEvent(new StorageEvent('storage', { 
      key: 'force-stats-update', 
      newValue: String(Date.now()) 
    }));
    
    // Eventos adicionales para asegurar actualización completa
    window.dispatchEvent(new CustomEvent('coursesChanged', { 
      detail: { year: selectedYear } 
    }));
    
    window.dispatchEvent(new CustomEvent('sectionsChanged', { 
      detail: { year: selectedYear } 
    }));
    
    window.dispatchEvent(new CustomEvent('usersChanged', { 
      detail: { year: selectedYear } 
    }));
    
    console.log('✅ Eventos emitidos correctamente');
    
    // Verificar contadores actuales
    console.log('\n📊 Verificando contadores en LocalStorage:');
    
    const students = JSON.parse(localStorage.getItem(`smart-student-students-${selectedYear}`) || '[]');
    const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${selectedYear}`) || '[]');
    const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${selectedYear}`) || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem(`smart-student-student-assignments-${selectedYear}`) || '[]');
    
    console.log(`   👥 Estudiantes: ${students.length}`);
    console.log(`   📚 Cursos: ${courses.length}`);
    console.log(`   📋 Secciones: ${sections.length}`);
    console.log(`   🔗 Asignaciones: ${studentAssignments.length}`);
    
    // Contar estudiantes por curso-sección
    const studentsByCourseSection = {};
    students.forEach(student => {
      if (student.courseId && student.sectionId) {
        const key = `${student.courseId}-${student.sectionId}`;
        studentsByCourseSection[key] = (studentsByCourseSection[key] || 0) + 1;
      }
    });
    
    console.log('\n📊 Estudiantes por Curso-Sección:');
    Object.entries(studentsByCourseSection).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} estudiantes`);
    });
    
    // Si hay estudiantes pero no tienen courseId/sectionId, mostrar advertencia
    const studentsWithoutAssignment = students.filter(s => !s.courseId || !s.sectionId);
    if (studentsWithoutAssignment.length > 0) {
      console.warn(`\n⚠️ Hay ${studentsWithoutAssignment.length} estudiantes sin asignación de curso/sección`);
      console.log('💡 Primeros 5 estudiantes sin asignación:', studentsWithoutAssignment.slice(0, 5).map(s => ({
        id: s.id,
        name: s.name,
        rut: s.rut,
        courseId: s.courseId,
        sectionId: s.sectionId
      })));
    }
    
    // Verificar si Firebase está habilitado
    const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
    console.log(`\n🔥 Firebase habilitado: ${useFirebase}`);
    
    if (useFirebase) {
      console.log('🔍 Consultando datos desde Firebase...');
      
      try {
        const { getFirestoreInstance } = await import('/src/lib/firebase-config');
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        
        const db = getFirestoreInstance();
        if (!db) {
          console.warn('⚠️ Firestore no está inicializado');
        } else {
          // Contar calificaciones en Firebase
          console.log('📊 Contando calificaciones en Firebase...');
          const coursesSnap = await getDocs(collection(db, 'courses'));
          
          let totalGrades = 0;
          let totalActivities = 0;
          
          for (const courseDoc of coursesSnap.docs) {
            const courseId = courseDoc.id;
            
            // Contar calificaciones por curso
            const gradesSnap = await getDocs(
              query(
                collection(db, `courses/${courseId}/grades`),
                where('year', '==', selectedYear)
              )
            );
            
            // Contar actividades por curso
            const activitiesSnap = await getDocs(
              query(
                collection(db, `courses/${courseId}/activities`),
                where('year', '==', selectedYear)
              )
            );
            
            if (gradesSnap.size > 0 || activitiesSnap.size > 0) {
              console.log(`   Curso ${courseId}:`, {
                calificaciones: gradesSnap.size,
                actividades: activitiesSnap.size
              });
            }
            
            totalGrades += gradesSnap.size;
            totalActivities += activitiesSnap.size;
          }
          
          console.log('\n📊 RESUMEN FIREBASE:');
          console.log(`   ✅ Calificaciones: ${totalGrades}`);
          console.log(`   ✅ Actividades: ${totalActivities}`);
          console.log(`   📚 Cursos: ${coursesSnap.size}`);
        }
      } catch (fbError) {
        console.error('❌ Error consultando Firebase:', fbError);
      }
    }
    
    console.log('\n✅ ACTUALIZACIÓN COMPLETADA');
    console.log('💡 Las estadísticas deberían actualizarse automáticamente');
    console.log('💡 Si no se actualizan, recarga la página (Ctrl+R)');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  }
})();

// Función adicional para sincronizar datos entre Firebase y LocalStorage
window.sincronizarFirebaseLocalStorage = async function(year) {
  console.log(`🔄 Sincronizando datos entre Firebase y LocalStorage para año ${year || 'actual'}...`);
  
  const selectedYear = year || Number(localStorage.getItem('admin-selected-year')) || new Date().getFullYear();
  
  try {
    const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
    
    if (!useFirebase) {
      console.warn('⚠️ Firebase no está habilitado');
      return;
    }
    
    const { getFirestoreInstance } = await import('/src/lib/firebase-config');
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    
    const db = getFirestoreInstance();
    if (!db) {
      console.warn('⚠️ Firestore no está inicializado');
      return;
    }
    
    console.log('📥 Descargando datos desde Firebase...');
    
    // Obtener todas las calificaciones
    const coursesSnap = await getDocs(collection(db, 'courses'));
    const allGrades = [];
    
    for (const courseDoc of coursesSnap.docs) {
      const courseId = courseDoc.id;
      const gradesSnap = await getDocs(
        query(
          collection(db, `courses/${courseId}/grades`),
          where('year', '==', selectedYear)
        )
      );
      
      gradesSnap.forEach(doc => {
        allGrades.push({
          ...doc.data(),
          id: doc.id
        });
      });
    }
    
    console.log(`✅ Descargadas ${allGrades.length} calificaciones desde Firebase`);
    
    // Extraer información de estudiantes únicos
    const studentsMap = new Map();
    allGrades.forEach(grade => {
      if (grade.studentId && grade.studentName) {
        if (!studentsMap.has(grade.studentId)) {
          studentsMap.set(grade.studentId, {
            id: grade.studentId,
            name: grade.studentName,
            courseId: grade.courseId,
            sectionId: grade.sectionId,
            rut: grade.studentId, // Asumiendo que studentId es el RUT
            role: 'student',
            year: selectedYear
          });
        }
      }
    });
    
    const students = Array.from(studentsMap.values());
    console.log(`👥 Encontrados ${students.length} estudiantes únicos`);
    
    // Guardar en LocalStorage
    const studentsKey = `smart-student-students-${selectedYear}`;
    localStorage.setItem(studentsKey, JSON.stringify(students));
    
    console.log('✅ Datos sincronizados en LocalStorage');
    
    // Emitir evento para actualizar UI
    window.dispatchEvent(new CustomEvent('usersChanged', { 
      detail: { year: selectedYear, count: students.length } 
    }));
    
    console.log('✅ Sincronización completada');
    console.log('💡 Recarga la página para ver los cambios');
    
    return {
      success: true,
      students: students.length,
      grades: allGrades.length
    };
    
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

console.log('\n💡 FUNCIONES DISPONIBLES:');
console.log('   - forzarActualizacionEstadisticas() [ya ejecutada]');
console.log('   - window.sincronizarFirebaseLocalStorage(year)');
console.log('\n📝 Ejemplo: window.sincronizarFirebaseLocalStorage(2025)');
