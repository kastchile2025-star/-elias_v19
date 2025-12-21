/**
 * Script de Consola: Forzar Actualización de Calificaciones
 * 
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este script completo
 * 3. Presiona Enter
 * 
 * Este script forzará la recarga de calificaciones y actividades
 * para el año seleccionado actualmente.
 */

(async function forzarActualizacionCalificaciones() {
  console.log('🔄 Iniciando actualización forzada de calificaciones...');
  
  try {
    // Obtener año seleccionado
    const selectedYear = Number(localStorage.getItem('admin-selected-year')) || new Date().getFullYear();
    console.log(`📅 Año seleccionado: ${selectedYear}`);
    
    // Verificar conexión a Firebase
    const useFirebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
    console.log(`🔥 Firebase habilitado: ${useFirebase}`);
    
    if (useFirebase) {
      // Emitir eventos de actualización
      console.log('🔔 Emitiendo eventos de actualización...');
      
      window.dispatchEvent(new CustomEvent('sqlGradesUpdated', { 
        detail: { year: selectedYear, manual: true } 
      }));
      
      window.dispatchEvent(new CustomEvent('sqlActivitiesUpdated', { 
        detail: { year: selectedYear, manual: true } 
      }));
      
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { type: 'grades', year: selectedYear, manual: true } 
      }));
      
      console.log('✅ Eventos emitidos correctamente');
      console.log('📊 Verificando datos en Firebase...');
      
      // Contar calificaciones directamente desde Firestore
      try {
        const { getFirestoreInstance } = await import('/src/lib/firebase-config');
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const db = getFirestoreInstance();
        if (!db) {
          console.warn('⚠️ Firestore no está inicializado');
          return;
        }
        
        console.log('🔍 Consultando cursos...');
        const coursesSnap = await getDocs(collection(db, 'courses'));
        console.log(`📚 Total de cursos: ${coursesSnap.size}`);
        
        let totalGrades = 0;
        let totalActivities = 0;
        
        for (const courseDoc of coursesSnap.docs) {
          const courseId = courseDoc.id;
          const courseData = courseDoc.data();
          
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
            console.log(`📊 Curso ${courseId}:`, {
              calificaciones: gradesSnap.size,
              actividades: activitiesSnap.size,
              year: courseData.year
            });
          }
          
          totalGrades += gradesSnap.size;
          totalActivities += activitiesSnap.size;
        }
        
        console.log('\n📊 RESUMEN TOTAL:');
        console.log(`   ✅ Calificaciones para ${selectedYear}: ${totalGrades}`);
        console.log(`   ✅ Actividades para ${selectedYear}: ${totalActivities}`);
        console.log(`   📚 Cursos totales: ${coursesSnap.size}`);
        
        if (totalGrades === 0) {
          console.warn('\n⚠️ No se encontraron calificaciones para el año seleccionado.');
          console.log('💡 Verifica que la carga masiva se haya completado correctamente.');
        } else {
          console.log('\n✅ Datos encontrados correctamente en Firebase.');
          console.log('🔄 La UI debería actualizarse automáticamente.');
          console.log('💡 Si no ves los datos, intenta recargar la página.');
        }
        
      } catch (fbError) {
        console.error('❌ Error consultando Firebase:', fbError);
        console.log('💡 Asegúrate de estar en la página correcta del dashboard');
      }
      
    } else {
      console.warn('⚠️ Firebase no está habilitado en esta aplicación');
      console.log('💡 Verifica la variable de entorno NEXT_PUBLIC_USE_FIREBASE');
    }
    
    // Forzar refresh del localStorage también
    console.log('\n🔄 Actualizando localStorage...');
    window.dispatchEvent(new StorageEvent('storage', { 
      key: 'admin-selected-year', 
      newValue: String(selectedYear) 
    }));
    
    console.log('\n✅ ACTUALIZACIÓN COMPLETADA');
    console.log('📋 Acciones recomendadas:');
    console.log('   1. Ve a la pestaña "Calificaciones"');
    console.log('   2. Las calificaciones deberían aparecer automáticamente');
    console.log('   3. Si no aparecen, recarga la página (Ctrl+R)');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    console.log('\n💡 Intenta:');
    console.log('   1. Recargar la página completamente');
    console.log('   2. Verificar que estés en el dashboard');
    console.log('   3. Revisar la consola de errores');
  }
})();

// Función adicional para verificar estado de Firebase
window.verificarFirebase = async function() {
  console.log('🔍 Verificando estado de Firebase...');
  
  try {
    const response = await fetch('/api/firebase/admin-diagnostics');
    const data = await response.json();
    
    console.log('📊 Diagnóstico de Firebase:', data);
    
    if (data.firebase?.initialized) {
      console.log('✅ Firebase inicializado correctamente');
      console.log(`🔧 Project ID: ${data.firebase.projectId}`);
    } else {
      console.warn('⚠️ Firebase no está inicializado');
      if (data.firebase?.error) {
        console.error('Error:', data.firebase.error);
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error verificando Firebase:', error);
  }
};

console.log('\n💡 TIP: Puedes ejecutar window.verificarFirebase() en cualquier momento');
