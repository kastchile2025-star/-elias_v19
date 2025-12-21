/**
 * Firebase Admin SDK - Módulo centralizado
 * 
 * Este módulo inicializa y exporta una instancia singleton del Admin SDK
 * para usar en APIs de Next.js y funciones del servidor.
 * 
 * Soporta:
 * - Credenciales desde variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY
 * - Credenciales desde archivo JSON local (desarrollo)
 * - Aplicación por defecto (Cloud Run, Cloud Functions)
 */

import admin from 'firebase-admin';

// Singleton para evitar múltiples inicializaciones
let initialized = false;

/**
 * Inicializa Firebase Admin SDK si no está ya inicializado
 */
export function initializeFirebaseAdmin(): admin.app.App {
  if (initialized && admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // Opción 1: Variable de entorno con JSON completo
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      initialized = true;
      console.log('✅ [Firebase Admin] Inicializado desde FIREBASE_SERVICE_ACCOUNT_KEY');
      return admin.app();
    }

    // Opción 2: Variables de entorno individuales (FIREBASE_PRIVATE_KEY, etc.)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (privateKey && clientEmail && projectId) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // Convertir \n escapados a saltos de línea reales
        }),
        projectId,
      });
      initialized = true;
      console.log('✅ [Firebase Admin] Inicializado desde variables de entorno individuales');
      return admin.app();
    }

    // Opción 3: Archivo de credenciales desde variable de entorno
    const fs = require('fs');
    const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
    if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
      const content = fs.readFileSync(serviceAccountFile, 'utf-8');
      const serviceAccount = JSON.parse(content);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      initialized = true;
      console.log(`✅ [Firebase Admin] Inicializado desde archivo: ${serviceAccountFile}`);
      return admin.app();
    }

    // Opción 4: Archivo local .secrets/firebase-admin.json
    const path = require('path');
    const secretsPath = path.join(process.cwd(), '.secrets', 'firebase-admin.json');
    if (fs.existsSync(secretsPath)) {
      const content = fs.readFileSync(secretsPath, 'utf-8');
      const serviceAccount = JSON.parse(content);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      initialized = true;
      console.log('✅ [Firebase Admin] Inicializado desde .secrets/firebase-admin.json');
      return admin.app();
    }

    // Opción 5: Archivos legacy en raíz del proyecto
    const credentialFiles = [
      'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json',
      'superjf1234-e9cbc-firebase-adminsdk-fbsvc-5968559b8c.json',
      'superjf1234-e9cbc-firebase-adminsdk-fbsvc-211a5a809a.json',
    ];

    for (const file of credentialFiles) {
      const credPath = path.join(process.cwd(), file);
      if (fs.existsSync(credPath)) {
        const content = fs.readFileSync(credPath, 'utf-8');
        const serviceAccount = JSON.parse(content);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        initialized = true;
        console.log(`✅ [Firebase Admin] Inicializado desde archivo legacy: ${file}`);
        return admin.app();
      }
    }

    // Opción 6: Aplicación por defecto (Google Cloud environment)
    admin.initializeApp();
    initialized = true;
    console.log('✅ [Firebase Admin] Inicializado con credenciales por defecto');
    return admin.app();

  } catch (error: any) {
    // Si ya hay una app inicializada, usarla
    if (admin.apps.length > 0) {
      initialized = true;
      return admin.app();
    }
    console.error('❌ [Firebase Admin] Error de inicialización:', error.message);
    throw error;
  }
}

/**
 * Obtiene la instancia de Firestore Admin
 */
export function getAdminFirestore(): admin.firestore.Firestore {
  initializeFirebaseAdmin();
  return admin.firestore();
}

/**
 * Obtiene la instancia de Auth Admin
 */
export function getAdminAuth(): admin.auth.Auth {
  initializeFirebaseAdmin();
  return admin.auth();
}

// Tipos exportados para conveniencia
export type AdminFirestore = admin.firestore.Firestore;
export type AdminTimestamp = admin.firestore.Timestamp;
export type AdminFieldValue = admin.firestore.FieldValue;

// Re-exportar admin para uso directo si es necesario
export { admin };
export default admin;
