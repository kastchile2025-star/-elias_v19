/**
 * 🔍 DEBUG: Verificar qué devuelve LocalStorageManager
 */

(function() {
  console.clear();
  console.log('%c🔍 DEBUG LOCALSTORAGEMANAGER', 'font-size: 20px; font-weight: bold; color: #3B82F6');
  console.log('═'.repeat(70) + '\n');

  const year = 2025;

  // Cargar directamente de localStorage
  const directLS = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
  console.log(`📦 Directamente de localStorage:`);
  console.log(`   Total: ${directLS.length}`);
  if (directLS.length > 0) {
    const sample = directLS[0];
    console.log(`   Primera calificación:`, sample);
    console.log(`   sectionId: "${sample.sectionId}"`);
    console.log(`   courseId: "${sample.courseId}"`);
  }

  // Cargar usando LocalStorageManager
  const { LocalStorageManager } = require('@/lib/education-utils');
  const fromManager = LocalStorageManager.getTestGradesForYear(year);
  
  console.log(`\n📦 Desde LocalStorageManager.getTestGradesForYear(${year}):`);
  console.log(`   Total: ${fromManager?.length || 0}`);
  if (fromManager && fromManager.length > 0) {
    const sample = fromManager[0];
    console.log(`   Primera calificación:`, sample);
    console.log(`   sectionId: "${sample.sectionId}"`);
    console.log(`   courseId: "${sample.courseId}"`);
  }

  // Comparar sectionIds
  console.log('\n' + '═'.repeat(70));
  console.log('%c🔍 COMPARACIÓN', 'color: #F59E0B; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(70) + '\n');

  if (directLS.length > 0 && fromManager && fromManager.length > 0) {
    const directSectionIds = new Set(directLS.map(g => g.sectionId));
    const managerSectionIds = new Set(fromManager.map((g) => g.sectionId));

    console.log(`Secciones en localStorage directo: ${Array.from(directSectionIds)}`);
    console.log(`Secciones en LocalStorageManager: ${Array.from(managerSectionIds)}`);

    if (JSON.stringify(Array.from(directSectionIds).sort()) !== JSON.stringify(Array.from(managerSectionIds).sort())) {
      console.log('%c⚠️ LOS SECTIONIDS SON DIFERENTES', 'color: #EF4444; font-weight: bold; font-size: 18px;');
      console.log('LocalStorageManager está devolviendo datos incorrectos');
    } else {
      console.log('%c✅ Los sectionIds coinciden', 'color: #10B981; font-weight: bold;');
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('%c✨ DEBUG COMPLETADO', 'font-size: 18px; font-weight: bold; color: #10B981');
  console.log('═'.repeat(70));

})();
