/**
 * 🚨 EMERGENCIA: Recuperar Datos Perdidos
 * 
 * CUÁNDO USAR:
 * - Los datos desaparecieron después de carga masiva
 * - LocalStorage está vacío pero Firebase tiene los datos
 * - Necesitas sincronizar Firebase → LocalStorage urgentemente
 * 
 * USO:
 * 1. Abrir consola del navegador en Dashboard > Calificaciones
 * 2. Copiar y pegar este script COMPLETO
 * 3. Seguir las instrucciones en pantalla
 */

(async function recuperarDatosPerdidos() {
  console.clear();
  console.log('%c🚨 EMERGENCIA: RECUPERAR DATOS PERDIDOS', 
    'font-size: 18px; font-weight: bold; color: #fff; background: #e74c3c; padding: 15px;');
  console.log('\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  console.log(`📅 Año seleccionado: ${year}\n`);

  // ============================================
  // PASO 1: VERIFICAR ESTADO ACTUAL
  // ============================================
  console.log('%c📊 PASO 1: Verificando estado actual...', 'font-size: 14px; font-weight: bold; color: #3498db;');
  
  const gradesKey = `smart-student-test-grades-${year}`;
  const currentGrades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
  
  console.log(`LocalStorage tiene ${currentGrades.length} calificaciones`);
  
  if (currentGrades.length > 0) {
    console.log('\n⚠️ ADVERTENCIA: LocalStorage ya tiene datos');
    console.log(`Tienes ${currentGrades.length} calificaciones en LocalStorage`);
    console.log('\n¿Quieres sobrescribirlos con los datos de Firebase?');
    console.log('Ejecuta: recuperarDatosPerdidos.continuar = true');
    console.log('Luego ejecuta este script de nuevo.\n');
    
    if (!window.recuperarDatosPerdidos?.continuar) {
      return;
    }
    
    console.log('✅ Confirmado. Continuando con recuperación...\n');
  }

  // ============================================
  // PASO 2: VERIFICAR FIREBASE
  // ============================================
  console.log('%c🔥 PASO 2: Verificando Firebase...', 'font-size: 14px; font-weight: bold; color: #f39c12;');
  
  // Detectar si Firebase está habilitado (en el navegador)
  const useFirebase = typeof window !== 'undefined';
  
  console.log('Intentando conectar a Firebase...');
  
  let db, collection, getDocs, query, where;
  
  try {
    const firebaseModule = await import('/src/lib/firebase-config.js');
    const firestoreModule = await import('firebase/firestore');
    
    db = firebaseModule.getFirestoreInstance();
    collection = firestoreModule.collection;
    getDocs = firestoreModule.getDocs;
    query = firestoreModule.query;
    where = firestoreModule.where;
    
    if (!db) {
      console.error('❌ Firestore no está inicializado');
      console.log('💡 Verifica la configuración de Firebase');
      return;
    }
    
    console.log('✅ Firebase conectado correctamente\n');
    
  } catch (err) {
    console.error('❌ Error importando Firebase:', err);
    return;
  }

  // ============================================
  // PASO 3: DESCARGAR DATOS DE FIREBASE
  // ============================================
  console.log('%c📥 PASO 3: Descargando datos de Firebase...', 'font-size: 14px; font-weight: bold; color: #9b59b6;');
  
  try {
    const coursesSnap = await getDocs(collection(db, 'courses'));
    console.log(`Encontrados ${coursesSnap.size} cursos en Firebase`);
    
    if (coursesSnap.size === 0) {
      console.error('\n❌ NO HAY CURSOS EN FIREBASE');
      console.log('💡 Esto significa que los datos NO se guardaron en Firebase');
      console.log('💡 Necesitas realizar la carga masiva nuevamente');
      return;
    }
    
    let allGrades = [];
    let allActivities = [];
    let courseCount = 0;
    
    for (const courseDoc of coursesSnap.docs) {
      courseCount++;
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();
      
      process.stdout?.write?.(`\r   Procesando curso ${courseCount}/${coursesSnap.size}...`);
      
      // Descargar calificaciones del curso
      const gradesSnap = await getDocs(
        query(
          collection(db, `courses/${courseId}/grades`),
          where('year', '==', year)
        )
      );
      
      for (const gradeDoc of gradesSnap.docs) {
        const gradeData = gradeDoc.data();
        allGrades.push({
          id: gradeDoc.id,
          ...gradeData,
          // Convertir Timestamp de Firebase a número
          gradedAt: gradeData.gradedAt?.toDate?.() 
            ? gradeData.gradedAt.toDate().getTime() 
            : gradeData.gradedAt
        });
      }
      
      // Descargar actividades del curso
      const activitiesSnap = await getDocs(
        query(
          collection(db, `courses/${courseId}/activities`),
          where('year', '==', year)
        )
      );
      
      for (const actDoc of activitiesSnap.docs) {
        const actData = actDoc.data();
        allActivities.push({
          id: actDoc.id,
          ...actData,
          createdAt: actData.createdAt?.toDate?.() 
            ? actData.createdAt.toDate().getTime() 
            : actData.createdAt
        });
      }
    }
    
    console.log(`\n\n✅ Descarga completada:`);
    console.log(`   📊 ${allGrades.length} calificaciones`);
    console.log(`   🫧 ${allActivities.length} actividades`);
    
    if (allGrades.length === 0) {
      console.error('\n❌ NO HAY CALIFICACIONES EN FIREBASE');
      console.log('💡 Los datos no se guardaron correctamente');
      console.log('💡 Necesitas realizar la carga masiva nuevamente');
      return;
    }

    // ============================================
    // PASO 4: GUARDAR EN LOCALSTORAGE
    // ============================================
    console.log('\n%c💾 PASO 4: Guardando en LocalStorage...', 'font-size: 14px; font-weight: bold; color: #16a085;');
    
    try {
      // Guardar calificaciones
      localStorage.setItem(gradesKey, JSON.stringify(allGrades));
      console.log(`✅ Guardadas ${allGrades.length} calificaciones`);
      
      // Guardar actividades (opcional, para las burbujas)
      // No hay un storage directo para actividades en LS, 
      // se derivan de las grades mediante el sistema de tareas
      
      // Verificar que se guardó correctamente
      const verificacion = JSON.parse(localStorage.getItem(gradesKey) || '[]');
      
      if (verificacion.length === allGrades.length) {
        console.log(`✅ Verificación exitosa: ${verificacion.length} registros en LocalStorage`);
      } else {
        console.warn(`⚠️ Verificación parcial: esperados ${allGrades.length}, guardados ${verificacion.length}`);
      }
      
    } catch (saveErr) {
      console.error('❌ Error guardando en LocalStorage:', saveErr);
      
      if (saveErr.name === 'QuotaExceededError') {
        console.error('\n⚠️ ESPACIO INSUFICIENTE EN LOCALSTORAGE');
        console.log('💡 LocalStorage está lleno. Opciones:');
        console.log('   1. Limpiar datos antiguos');
        console.log('   2. Reducir cantidad de calificaciones');
        console.log('   3. Usar solo Firebase (sin caché local)');
      }
      return;
    }

    // ============================================
    // PASO 5: FORZAR ACTUALIZACIÓN DE LA UI
    // ============================================
    console.log('\n%c🔄 PASO 5: Actualizando la interfaz...', 'font-size: 14px; font-weight: bold; color: #2c3e50;');
    
    // Emitir eventos para que la UI se actualice
    try {
      // Evento de storage (para listeners cross-tab)
      window.dispatchEvent(new StorageEvent('storage', {
        key: gradesKey,
        newValue: JSON.stringify(allGrades),
        oldValue: JSON.stringify(currentGrades)
      }));
      
      // Evento personalizado
      window.dispatchEvent(new CustomEvent('dataImported', {
        detail: {
          type: 'grades',
          year: year,
          count: allGrades.length,
          timestamp: Date.now(),
          source: 'emergency-recovery'
        }
      }));
      
      console.log('✅ Eventos emitidos correctamente');
      
    } catch (eventErr) {
      console.warn('⚠️ Error emitiendo eventos:', eventErr);
    }

    // ============================================
    // PASO 6: RESULTADO FINAL
    // ============================================
    console.log('\n%c✅ RECUPERACIÓN COMPLETADA', 'font-size: 16px; font-weight: bold; color: #fff; background: #27ae60; padding: 10px;');
    
    console.log('\n📊 Resumen:');
    console.log(`   • Calificaciones recuperadas: ${allGrades.length}`);
    console.log(`   • Actividades encontradas: ${allActivities.length}`);
    console.log(`   • Año: ${year}`);
    console.log(`   • Fuente: Firebase`);
    
    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Ve a Dashboard > Calificaciones');
    console.log('   2. Verifica que los datos aparecen');
    console.log('   3. Verifica los filtros funcionan');
    console.log('   4. Si es necesario, recarga la página (F5)');
    
    console.log('\n💡 Prevención futura:');
    console.log('   • Verifica que skipFirebaseReload=true esté implementado');
    console.log('   • Lee: GUIA_SOLUCIONAR_PERDIDA_DATOS_CARGA_MASIVA.md');
    console.log('   • Ejecuta: diagnostico-perdida-datos-carga-masiva.js antes de cargas');
    
    // Opción de recargar automáticamente
    console.log('\n🔄 ¿Recargar página ahora?');
    console.log('Ejecuta: location.reload()');
    
  } catch (err) {
    console.error('\n❌ Error durante la recuperación:', err);
    console.log('\n💡 Posibles causas:');
    console.log('   • Problemas de red/conexión');
    console.log('   • Permisos de Firebase insuficientes');
    console.log('   • Datos corruptos en Firebase');
    console.log('\n💡 Intenta:');
    console.log('   1. Verificar conexión a internet');
    console.log('   2. Revisar Firebase Console manualmente');
    console.log('   3. Re-ejecutar este script');
  }

})();

// Exponer función para confirmar sobrescritura
window.recuperarDatosPerdidos = window.recuperarDatosPerdidos || {};
