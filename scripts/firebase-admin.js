// Inicialización de Firebase Admin para scripts Node (importación masiva)
// Requiere GOOGLE_APPLICATION_CREDENTIALS apuntando a un JSON de cuenta de servicio
// o variables FIREBASE_SERVICE_ACCOUNT_JSON con el contenido del JSON.

const admin = require('firebase-admin');

function loadCredentials() {
  // 1) Si ya hay app inicializada, reutilizar
  if (admin.apps && admin.apps.length > 0) return null;

  // 2) Cargar credenciales desde archivo si existe GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  // 3) Alternativa: variable FIREBASE_SERVICE_ACCOUNT_JSON (string JSON)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return admin.credential.cert(json);
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON inválido: ' + e.message);
    }
  }

  throw new Error('Faltan credenciales: define GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON');
}

function initAdmin() {
  if (admin.apps && admin.apps.length > 0) return admin;
  const credential = loadCredentials();
  admin.initializeApp({ credential });
  return admin;
}

module.exports = { initAdmin };
