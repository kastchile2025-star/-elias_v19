#!/usr/bin/env node
/**
 * Script de Verificación: Firebase Firestore
 * 
 * Verifica que los datos se hayan migrado correctamente desde Supabase
 * y muestra estadísticas de uso.
 * 
 * Uso: node scripts/verificar-migracion-firebase.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Configuración Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let db;

function initializeFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    log('✅ Firebase Firestore conectado\n', 'green');
  } catch (error) {
    log(`❌ Error conectando Firebase: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function getCourses() {
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    return coursesSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    log(`❌ Error obteniendo cursos: ${error.message}`, 'red');
    return [];
  }
}

async function countDocuments(coursePath, subcollection) {
  try {
    const collectionRef = collection(db, coursePath, subcollection);
    const snapshot = await getDocs(collectionRef);
    return snapshot.size;
  } catch (error) {
    return 0;
  }
}

async function getSampleDocument(coursePath, subcollection) {
  try {
    const collectionRef = collection(db, coursePath, subcollection);
    const q = query(collectionRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } catch (error) {
    return null;
  }
}

async function getStatsByCourse() {
  log('📊 Analizando datos por curso...\n', 'bright');
  
  const courses = await getCourses();
  
  if (courses.length === 0) {
    log('⚠️  No se encontraron cursos en Firestore', 'yellow');
    return { grades: 0, attendance: 0, activities: 0 };
  }

  log(`  📚 Cursos encontrados: ${courses.length}\n`, 'blue');

  const stats = {
    grades: 0,
    attendance: 0,
    activities: 0,
    byCourse: {}
  };

  for (const courseId of courses) {
    const grades = await countDocuments(`courses/${courseId}`, 'grades');
    const attendance = await countDocuments(`courses/${courseId}`, 'attendance');
    const activities = await countDocuments(`courses/${courseId}`, 'activities');

    stats.grades += grades;
    stats.attendance += attendance;
    stats.activities += activities;

    stats.byCourse[courseId] = { grades, attendance, activities };

    // Mostrar solo si tiene datos
    if (grades + attendance + activities > 0) {
      log(`  📖 ${courseId}:`, 'cyan');
      log(`     Calificaciones: ${grades}`, 'reset');
      log(`     Asistencia:     ${attendance}`, 'reset');
      log(`     Actividades:    ${activities}`, 'reset');
      log('');
    }
  }

  return stats;
}

async function showSampleData() {
  log('\n📝 Muestras de datos (primer documento):\n', 'bright');

  const courses = await getCourses();
  if (courses.length === 0) return;

  const courseId = courses[0];

  // Muestra de calificación
  const sampleGrade = await getSampleDocument(`courses/${courseId}`, 'grades');
  if (sampleGrade) {
    log('  📊 Calificación ejemplo:', 'green');
    log('  ' + JSON.stringify(sampleGrade, null, 2).split('\n').join('\n  '), 'reset');
  }

  // Muestra de asistencia
  const sampleAttendance = await getSampleDocument(`courses/${courseId}`, 'attendance');
  if (sampleAttendance) {
    log('\n  📅 Asistencia ejemplo:', 'green');
    log('  ' + JSON.stringify(sampleAttendance, null, 2).split('\n').join('\n  '), 'reset');
  }
}

async function estimateStorage(stats) {
  log('\n💾 Estimación de almacenamiento:\n', 'bright');

  // Estimaciones aproximadas por documento
  const avgSizes = {
    grades: 0.5,      // KB por documento
    attendance: 0.3,
    activities: 0.7
  };

  const totalKB = 
    stats.grades * avgSizes.grades +
    stats.attendance * avgSizes.attendance +
    stats.activities * avgSizes.activities;

  const totalMB = totalKB / 1024;
  const percentOfFree = (totalMB / 1024) * 100; // 1GB free tier

  log(`  📦 Calificaciones:  ~${(stats.grades * avgSizes.grades / 1024).toFixed(2)} MB`, 'cyan');
  log(`  📦 Asistencia:      ~${(stats.attendance * avgSizes.attendance / 1024).toFixed(2)} MB`, 'cyan');
  log(`  📦 Actividades:     ~${(stats.activities * avgSizes.activities / 1024).toFixed(2)} MB`, 'cyan');
  log(`  ${'─'.repeat(40)}`);
  log(`  📊 TOTAL:           ~${totalMB.toFixed(2)} MB`, 'bright');
  log(`  📈 Uso del tier gratuito: ${percentOfFree.toFixed(2)}% (de 1 GB)`, 
      percentOfFree > 80 ? 'yellow' : 'green');
}

async function estimateDailyUsage(stats) {
  log('\n📈 Estimación de lecturas/escrituras diarias:\n', 'bright');

  // Suposiciones razonables para un sistema educativo
  const assumptions = {
    activeUsers: 50,        // Usuarios activos por día
    dashboardLoads: 3,      // Veces que cargan dashboard
    readsPerDashboard: 10,  // Documentos leídos por carga
    newGrades: 20,          // Nuevas calificaciones al día
    attendanceRecords: 50   // Registros de asistencia al día
  };

  const estimatedReads = 
    assumptions.activeUsers * 
    assumptions.dashboardLoads * 
    assumptions.readsPerDashboard;

  const estimatedWrites = 
    assumptions.newGrades + 
    assumptions.attendanceRecords;

  const percentReads = (estimatedReads / 50000) * 100;
  const percentWrites = (estimatedWrites / 20000) * 100;

  log(`  👥 Usuarios activos estimados: ${assumptions.activeUsers}`, 'cyan');
  log(`  📖 Lecturas diarias:  ~${estimatedReads.toLocaleString()}`, 'blue');
  log(`     (${percentReads.toFixed(2)}% del límite de 50,000)`, 
      percentReads > 80 ? 'yellow' : 'green');
  log(`  ✍️  Escrituras diarias: ~${estimatedWrites.toLocaleString()}`, 'blue');
  log(`     (${percentWrites.toFixed(2)}% del límite de 20,000)`, 
      percentWrites > 80 ? 'yellow' : 'green');
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  🔍 VERIFICACIÓN DE MIGRACIÓN - FIREBASE FIRESTORE', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  initializeFirebase();

  const stats = await getStatsByCourse();
  const total = stats.grades + stats.attendance + stats.activities;

  log('\n' + '='.repeat(60), 'cyan');
  log('  📊 RESUMEN GENERAL', 'bright');
  log('='.repeat(60), 'cyan');
  log(`\n  Calificaciones:  ${stats.grades.toLocaleString()}`, 'green');
  log(`  Asistencia:      ${stats.attendance.toLocaleString()}`, 'green');
  log(`  Actividades:     ${stats.activities.toLocaleString()}`, 'green');
  log(`  ${'─'.repeat(40)}`);
  log(`  TOTAL:           ${total.toLocaleString()} documentos`, 'bright');

  if (total === 0) {
    log('\n⚠️  No hay datos en Firestore', 'yellow');
    log('\n💡 Ejecuta el script de migración:', 'blue');
    log('   node scripts/migracion-supabase-a-firebase.js\n', 'yellow');
    return;
  }

  await showSampleData();
  await estimateStorage(stats);
  await estimateDailyUsage(stats);

  log('\n' + '='.repeat(60), 'cyan');
  log('  ✅ VERIFICACIÓN COMPLETADA', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  log('📝 Próximos pasos:', 'bright');
  log('  1. Actualiza .env.local:', 'yellow');
  log('     NEXT_PUBLIC_USE_FIREBASE=true', 'cyan');
  log('  2. Reinicia tu aplicación:', 'yellow');
  log('     npm run dev', 'cyan');
  log('  3. Verifica funcionamiento en tu app', 'yellow');
  log('  4. Una vez confirmado, puedes desactivar Supabase\n', 'yellow');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
