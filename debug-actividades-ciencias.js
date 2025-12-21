// Script para ejecutar en la consola del navegador
// Verifica las actividades de Ciencias Naturales en Firebase

(async function() {
  console.log('🔍 Verificando actividades en Firebase...');
  
  // Verificar si firestoreDB está disponible
  if (!window.firestoreDB) {
    console.error('❌ firestoreDB no disponible. Asegúrate de estar en /dashboard/calificaciones');
    return;
  }
  
  try {
    // Obtener todas las actividades de 2025
    const result = await window.firestoreDB.getActivitiesByYear(2025);
    const activities = result?.activities || [];
    
    console.log(`📊 Total actividades 2025: ${activities.length}`);
    
    // Filtrar actividades de Ciencias Naturales
    const ciencias = activities.filter(a => 
      (a.subjectName || '').toLowerCase().includes('ciencias naturales') ||
      (a.subjectId || '').toLowerCase().includes('ciencias_naturales')
    );
    
    console.log(`\n🧪 Actividades de Ciencias Naturales: ${ciencias.length}`);
    
    // Mostrar las primeras 10
    ciencias.slice(0, 10).forEach((a, i) => {
      console.log(`\n${i + 1}. Actividad:`);
      console.log(`   ID: ${a.id}`);
      console.log(`   Title: "${a.title}"`);
      console.log(`   Topic: "${a.topic || '(NO EXISTE)'}"`);
      console.log(`   TaskType: ${a.taskType}`);
      console.log(`   CourseId: ${a.courseId}`);
      console.log(`   SectionId: ${a.sectionId}`);
      console.log(`   SubjectName: ${a.subjectName}`);
    });
    
    // Estadísticas de topic
    const withTopic = ciencias.filter(a => a.topic && a.topic.trim());
    const withoutTopic = ciencias.filter(a => !a.topic || !a.topic.trim());
    
    console.log(`\n📈 Estadísticas:`);
    console.log(`   Con topic: ${withTopic.length}`);
    console.log(`   Sin topic: ${withoutTopic.length}`);
    
    // Mostrar un ejemplo con topic si existe
    if (withTopic.length > 0) {
      console.log('\n✅ Ejemplo con topic:');
      console.log(JSON.stringify(withTopic[0], null, 2));
    }
    
    if (withoutTopic.length > 0) {
      console.log('\n❌ Ejemplo sin topic:');
      console.log(JSON.stringify(withoutTopic[0], null, 2));
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
