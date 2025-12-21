#!/usr/bin/env node
/**
 * Script de Migración: Supabase → Firebase Firestore
 * 
 * Este script migra todos los datos de calificaciones y asistencia
 * desde Supabase a Firebase Firestore manteniendo la estructura.
 * 
 * Uso: node scripts/migracion-supabase-a-firebase.js
 */

const { createClient } = require('@supabase/supabase-js');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch, Timestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Configuración de colores para consola
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

// Configuración Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Configuración Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar configuración
function validateConfig() {
  const errors = [];

  if (!supabaseUrl || !supabaseKey) {
    errors.push('Supabase: Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const requiredFirebaseVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  requiredFirebaseVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Firebase: Falta ${varName}`);
    }
  });

  if (errors.length > 0) {
    log('\n❌ Errores de configuración:', 'red');
    errors.forEach(err => log(`  - ${err}`, 'red'));
    log('\nAsegúrate de tener las variables en .env.local\n', 'yellow');
    process.exit(1);
  }
}

// Inicializar clientes
let supabase, db;

function initializeClients() {
  try {
    // Supabase
    supabase = createClient(supabaseUrl, supabaseKey);
    log('✅ Cliente Supabase inicializado', 'green');

    // Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    log('✅ Cliente Firebase inicializado', 'green');
  } catch (error) {
    log(`❌ Error inicializando clientes: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Migrar datos en lotes
async function migrateBatch(collectionName, data, courseIdField = 'course_id') {
  if (data.length === 0) return 0;

  const BATCH_SIZE = 500; // Firestore límite
  let migrated = 0;

  // Agrupar por curso
  const byCourse = {};
  data.forEach(item => {
    const courseId = item[courseIdField] || 'sin_curso';
    if (!byCourse[courseId]) byCourse[courseId] = [];
    byCourse[courseId].push(item);
  });

  // Procesar cada curso
  for (const [courseId, items] of Object.entries(byCourse)) {
    log(`  📦 Procesando curso: ${courseId} (${items.length} registros)`, 'cyan');

    // Dividir en lotes de 500
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = items.slice(i, i + BATCH_SIZE);

      chunk.forEach(item => {
        const docRef = doc(db, `courses/${courseId}/${collectionName}`, item.id);
        const firestoreData = convertToFirestoreFormat(item);
        batch.set(docRef, firestoreData, { merge: true });
      });

      try {
        await batch.commit();
        migrated += chunk.length;
        log(`    ✓ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} registros`, 'green');
      } catch (error) {
        log(`    ✗ Error en lote: ${error.message}`, 'red');
      }
    }
  }

  return migrated;
}

// Convertir fechas de Supabase a Firestore
function convertToFirestoreFormat(item) {
  const converted = { ...item };

  // Campos de fecha comunes
  const dateFields = ['graded_at', 'created_at', 'updated_at', 'date', 'start_at', 'open_at', 'due_date'];

  dateFields.forEach(field => {
    if (converted[field]) {
      try {
        converted[field] = Timestamp.fromDate(new Date(converted[field]));
      } catch (error) {
        // Si falla, mantener el valor original
        log(`    ⚠️  No se pudo convertir fecha: ${field}`, 'yellow');
      }
    }
  });

  return converted;
}

// Migrar calificaciones
async function migrateGrades() {
  log('\n📊 Migrando calificaciones (grades)...', 'bright');

  try {
    // Obtener todas las calificaciones de Supabase
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    log(`  ℹ️  Encontradas: ${data.length} calificaciones`, 'blue');

    if (data.length === 0) {
      log('  ⚠️  No hay datos para migrar', 'yellow');
      return 0;
    }

    const migrated = await migrateBatch('grades', data, 'course_id');
    log(`  ✅ Migradas: ${migrated} calificaciones\n`, 'green');
    return migrated;
  } catch (error) {
    log(`  ❌ Error migrando calificaciones: ${error.message}\n`, 'red');
    return 0;
  }
}

// Migrar asistencia
async function migrateAttendance() {
  log('📅 Migrando asistencia (attendance)...', 'bright');

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    log(`  ℹ️  Encontrados: ${data.length} registros`, 'blue');

    if (data.length === 0) {
      log('  ⚠️  No hay datos para migrar', 'yellow');
      return 0;
    }

    const migrated = await migrateBatch('attendance', data, 'course_id');
    log(`  ✅ Migrados: ${migrated} registros\n`, 'green');
    return migrated;
  } catch (error) {
    log(`  ❌ Error migrando asistencia: ${error.message}\n`, 'red');
    return 0;
  }
}

// Migrar actividades
async function migrateActivities() {
  log('📝 Migrando actividades (activities)...', 'bright');

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      if (error.message.includes('does not exist')) {
        log('  ⚠️  Tabla activities no existe en Supabase (opcional)', 'yellow');
        return 0;
      }
      throw error;
    }

    log(`  ℹ️  Encontradas: ${data.length} actividades`, 'blue');

    if (data.length === 0) {
      log('  ⚠️  No hay datos para migrar', 'yellow');
      return 0;
    }

    const migrated = await migrateBatch('activities', data, 'course_id');
    log(`  ✅ Migradas: ${migrated} actividades\n`, 'green');
    return migrated;
  } catch (error) {
    log(`  ❌ Error migrando actividades: ${error.message}\n`, 'red');
    return 0;
  }
}

// Función principal
async function main() {
  const startTime = Date.now();

  log('\n' + '='.repeat(60), 'cyan');
  log('  🔥 MIGRACIÓN: SUPABASE → FIREBASE FIRESTORE', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  // Validar configuración
  validateConfig();

  // Inicializar clientes
  initializeClients();

  log('\n🚀 Iniciando migración de datos...\n', 'bright');

  // Migrar cada tabla
  const stats = {
    grades: await migrateGrades(),
    attendance: await migrateAttendance(),
    activities: await migrateActivities(),
  };

  // Resumen final
  const totalMigrated = stats.grades + stats.attendance + stats.activities;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  log('\n' + '='.repeat(60), 'cyan');
  log('  📊 RESUMEN DE MIGRACIÓN', 'bright');
  log('='.repeat(60), 'cyan');
  log(`\n  Calificaciones:  ${stats.grades}`, 'green');
  log(`  Asistencia:      ${stats.attendance}`, 'green');
  log(`  Actividades:     ${stats.activities}`, 'green');
  log(`  ${'─'.repeat(30)}`);
  log(`  TOTAL:           ${totalMigrated}`, 'bright');
  log(`\n  ⏱️  Tiempo:        ${duration}s`, 'blue');
  log(`  💾 Origen:        Supabase`, 'blue');
  log(`  🔥 Destino:       Firebase Firestore`, 'blue');
  log('\n' + '='.repeat(60) + '\n', 'cyan');

  if (totalMigrated > 0) {
    log('✅ Migración completada exitosamente!\n', 'green');
    log('📝 Próximos pasos:', 'bright');
    log('  1. Ejecuta: node scripts/verificar-migracion-firebase.js', 'yellow');
    log('  2. Actualiza .env.local: NEXT_PUBLIC_USE_FIREBASE=true', 'yellow');
    log('  3. Reinicia tu aplicación', 'yellow');
    log('');
  } else {
    log('⚠️  No se migraron datos. Verifica tu configuración de Supabase.\n', 'yellow');
  }
}

// Ejecutar
main().catch(error => {
  log(`\n❌ Error fatal: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
