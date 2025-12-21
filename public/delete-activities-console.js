/**
 * Script de consola para limpiar actividades duplicadas en Firebase
 * 
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12)
 * 2. Pega todo este script y presiona Enter
 * 3. Ejecuta: await deleteActivities2025('1ro_basico', 'a')
 * 4. Espera a que termine (verá progreso en consola)
 * 5. Recarga la página
 */

async function deleteActivities2025(courseId = '1ro_basico', sectionId = 'a') {
  console.log(`🗑️ Iniciando eliminación de actividades 2025 para ${courseId} sección ${sectionId}...`);
  
  try {
    let deleted = 0;
    let moreToDelete = true;
    let iteration = 0;
    
    while (moreToDelete && iteration < 20) { // max 20 iteraciones para evitar loops infinitos
      iteration++;
      console.log(`🔄 Iteración ${iteration}...`);
      
      const url = `/api/firebase/delete-activities-by-year?year=2025&doit=1&paged=1&courseId=${courseId}&sectionId=${sectionId}&limit=500`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      
      if (!data.ok) {
        console.error('❌ Error al eliminar:', data.error);
        break;
      }
      
      deleted += data.deleted;
      moreToDelete = data.more && data.deleted > 0;
      
      console.log(`   ✅ Eliminadas ${data.deleted} actividades (total: ${deleted})`);
      
      if (moreToDelete) {
        // Pequeña pausa para no saturar Firestore
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log(`\n🎉 ¡Completado! Total eliminado: ${deleted} actividades`);
    console.log('💡 Ahora debes REIMPORTAR el CSV con la carga masiva para crear las 5 actividades correctas.');
    
    return { success: true, deleted };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: String(error) };
  }
}

// También función para eliminar TODAS las actividades 2025 (útil para reset completo)
async function deleteAllActivities2025() {
  console.log(`🗑️ Iniciando eliminación de TODAS las actividades 2025...`);
  
  try {
    let deleted = 0;
    let moreToDelete = true;
    let iteration = 0;
    
    while (moreToDelete && iteration < 50) {
      iteration++;
      console.log(`🔄 Iteración ${iteration}...`);
      
      const url = `/api/firebase/delete-activities-by-year?year=2025&doit=1&paged=1&limit=1000`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      
      if (!data.ok) {
        console.error('❌ Error:', data.error);
        break;
      }
      
      deleted += data.deleted;
      moreToDelete = data.more && data.deleted > 0;
      
      console.log(`   ✅ Eliminadas ${data.deleted} actividades (total: ${deleted})`);
      
      if (moreToDelete) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log(`\n🎉 ¡Completado! Total eliminado: ${deleted} actividades`);
    
    return { success: true, deleted };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: String(error) };
  }
}

console.log('✅ Script cargado. Usa:');
console.log('   await deleteActivities2025("1ro_basico", "a")  // Eliminar solo 1ro Básico A');
console.log('   await deleteAllActivities2025()                // Eliminar todas 2025');
