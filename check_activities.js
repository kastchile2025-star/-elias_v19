// Script para verificar actividades en Firebase
const admin = require('firebase-admin');
const path = require('path');

async function checkActivities() {
  try {
    if (admin.apps.length === 0) {
      const credPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
      const serviceAccount = require(credPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const db = admin.firestore();
    
    // Buscar actividades de 1ro Básico
    const courseId = '1ro_basico';
    const activitiesRef = db.collection(`courses/${courseId}/activities`);
    
    console.log('🔍 Buscando actividades en courses/1ro_basico/activities...\n');
    
    const snapshot = await activitiesRef
      .where('year', '==', 2025)
      .where('subjectId', '==', 'lenguaje_y_comunicacion')
      .orderBy('startAt')
      .get();
    
    console.log(`📊 Total actividades encontradas: ${snapshot.size}\n`);
    
    const activities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const startAt = data.startAt?.toDate();
      const openAt = data.openAt?.toDate();
      activities.push({
        id: doc.id,
        title: data.title,
        topic: data.topic,
        taskType: data.taskType,
        sectionId: data.sectionId,
        startAt: startAt ? startAt.toISOString().slice(0, 10) : 'N/A',
        openAt: openAt ? openAt.toISOString().slice(0, 10) : 'N/A',
        createdAt: data.createdAt?.toDate().toISOString() || 'N/A'
      });
    });
    
    // Agrupar por fecha
    const byDate = {};
    activities.forEach(act => {
      const key = `${act.openAt || act.startAt}|${act.taskType}`;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(act);
    });
    
    console.log('📋 Actividades agrupadas por fecha y tipo:\n');
    Object.entries(byDate).forEach(([key, acts]) => {
      console.log(`\n🔹 ${key} (${acts.length} documentos):`);
      acts.forEach(act => {
        console.log(`   - ID: ${act.id}`);
        console.log(`     Título: ${act.title}`);
        console.log(`     Tema: ${act.topic || 'N/A'}`);
        console.log(`     Sección: ${act.sectionId || 'N/A'}`);
        console.log(`     CreatedAt: ${act.createdAt}`);
      });
    });
    
    // Filtrar por semestre 1 (marzo-junio)
    const semester1 = activities.filter(act => {
      const date = act.openAt !== 'N/A' ? act.openAt : act.startAt;
      if (date === 'N/A') return false;
      const month = parseInt(date.split('-')[1]);
      return month >= 3 && month <= 6; // Mar-Jun
    });
    
    console.log(`\n\n✅ Actividades del 1er semestre (marzo-junio): ${semester1.length}`);
    semester1.forEach(act => {
      console.log(`   ${act.openAt || act.startAt} | ${act.taskType} | ${act.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkActivities();
