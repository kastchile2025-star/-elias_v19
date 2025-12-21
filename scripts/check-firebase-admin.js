#!/usr/bin/env node
/**
 * Verifica credenciales de Firebase Admin y acceso a Firestore.
 * - Muestra el projectId y el email de la cuenta de servicio (si es posible).
 * - Lista colecciones raíz.
 * - Con --write crea/actualiza un doc de salud en `health/check`.
 *
 * Uso:
 *   node scripts/check-firebase-admin.js [--write]
 *
 * Requiere variables de entorno cargadas desde `.env.firebase` o similares:
 *   - GOOGLE_APPLICATION_CREDENTIALS=<ruta absoluta al json>
 *      o
 *   - FIREBASE_SERVICE_ACCOUNT_JSON=<json string>
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve('.env.firebase') });
const { initAdmin } = require('./firebase-admin');

function getProjectId(admin) {
  const opt = admin.app().options || {};
  if (opt.projectId) return opt.projectId;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.GCP_PROJECT) return process.env.GCP_PROJECT;

  // Intentar leer del JSON
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const j = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return j.project_id;
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const raw = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
      const j = JSON.parse(raw);
      return j.project_id;
    }
  } catch (_) {}
  return undefined;
}

function getClientEmailFromEnv() {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON).client_email;
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const raw = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
      return JSON.parse(raw).client_email;
    }
  } catch (_) {}
  return undefined;
}

async function main() {
  const write = process.argv.includes('--write');
  const admin = initAdmin();
  const db = admin.firestore();

  const projectId = getProjectId(admin);
  const clientEmail = getClientEmailFromEnv();

  console.log('Firebase Admin conectado ✅');
  if (projectId) console.log('projectId:', projectId);
  if (clientEmail) console.log('service account:', clientEmail);

  // Probar acceso: listar colecciones raíz (solo Admin SDK)
  const cols = await db.listCollections();
  console.log('Colecciones raíz detectadas:', cols.map(c => c.id));

  if (write) {
    const ref = db.doc('health/check');
    await ref.set({ ts: admin.firestore.Timestamp.now() }, { merge: true });
    console.log('Escritura de prueba realizada en health/check');
  }

  console.log('Chequeo completo.');
}

main().catch(err => {
  console.error('Error en chequeo:', err);
  process.exit(1);
});
