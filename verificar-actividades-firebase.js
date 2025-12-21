// Script para verificar actividades en Firebase desde la consola del navegador
// Copiar y pegar en la consola de desarrollador

(async function verificarActividades() {
  // Importar Firebase si no está disponible
  if (typeof window.firestoreDB === 'undefined') {
    console.error('❌ firestoreDB no está disponible. Asegúrate de estar en la página de calificaciones.');
    return;
  }
  
  try {
    const result = await window.firestoreDB.getActivitiesByYear(2025);
    const activities = result?.activities || [];
    
    console.log(`📊 Total actividades: ${activities.length}`);
    
    // Mostrar las primeras 10 actividades con sus campos
    console.log('\n🔍 Primeras 10 actividades:');
    activities.slice(0, 10).forEach((a, i) => {
      console.log(`\n${i + 1}. ${a.subjectName || a.subjectId || 'Sin asignatura'}`);
      console.log(`   ID: ${a.id}`);
      console.log(`   Title: "${a.title}"`);
      console.log(`   Topic: "${a.topic || '(NO EXISTE)'}"`);
      console.log(`   TaskType: ${a.taskType}`);
      console.log(`   CourseId: ${a.courseId}`);
      console.log(`   SectionId: ${a.sectionId}`);
    });
    
    // Contar cuántas tienen topic
    const withTopic = activities.filter(a => a.topic && a.topic.trim());
    const withoutTopic = activities.filter(a => !a.topic || !a.topic.trim());
    
    console.log(`\n📈 Estadísticas:`);
    console.log(`   Con topic: ${withTopic.length}`);
    console.log(`   Sin topic: ${withoutTopic.length}`);
    
    // Mostrar una actividad de Ciencias Naturales si existe
    const ciencias = activities.find(a => 
      (a.subjectName || '').toLowerCase().includes('ciencias') ||
      (a.subjectId || '').toLowerCase().includes('ciencias')
    );
    
    if (ciencias) {
      console.log('\n🧪 Ejemplo de Ciencias Naturales:');
      console.log(JSON.stringify(ciencias, null, 2));
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
