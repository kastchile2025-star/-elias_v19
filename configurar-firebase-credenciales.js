/**
 * CONFIGURADOR DE FIREBASE
 * Smart Student v17
 * 
 * Este script te ayuda a configurar Firebase para habilitar la carga masiva
 */

console.log('🔥 [CONFIGURADOR FIREBASE] Iniciando...');
console.log('\n' + '='.repeat(60));
console.log('📋 CONFIGURAR FIREBASE PARA CARGA MASIVA');
console.log('='.repeat(60));

// Verificar estado actual
const config = JSON.parse(localStorage.getItem('smart-student-config') || '{}');
console.log('\n📊 Estado actual:', {
    useFirebase: config.useFirebase,
    provider: config.provider
});

// Función para configurar Firebase
window.configurarFirebaseCredenciales = function(credenciales) {
    console.log('\n🔧 [PASO 1/3] Validando credenciales...');
    
    const requeridas = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId'
    ];
    
    const faltantes = requeridas.filter(key => !credenciales[key]);
    
    if (faltantes.length > 0) {
        console.error('❌ Faltan credenciales:', faltantes.join(', '));
        return { exito: false, error: `Faltan: ${faltantes.join(', ')}` };
    }
    
    console.log('✅ Todas las credenciales presentes');
    
    // Guardar en config
    console.log('\n🔧 [PASO 2/3] Guardando configuración...');
    
    const nuevaConfig = {
        ...config,
        useFirebase: true,
        provider: 'firebase',
        firebaseApiKey: credenciales.apiKey,
        firebaseAuthDomain: credenciales.authDomain,
        firebaseProjectId: credenciales.projectId,
        firebaseStorageBucket: credenciales.storageBucket,
        firebaseMessagingSenderId: credenciales.messagingSenderId,
        firebaseAppId: credenciales.appId
    };
    
    localStorage.setItem('smart-student-config', JSON.stringify(nuevaConfig));
    console.log('✅ Configuración guardada en localStorage');
    
    // Intentar inicializar Firebase
    console.log('\n🔧 [PASO 3/3] Inicializando Firebase...');
    
    try {
        if (typeof window.firebase !== 'undefined') {
            console.log('✅ Firebase SDK disponible');
            
            // Verificar si ya está inicializado
            if (window.firebase.apps?.length > 0) {
                console.log('ℹ️ Firebase ya inicializado');
            } else {
                console.log('📝 Necesitas recargar la página para inicializar Firebase');
            }
        } else {
            console.warn('⚠️ Firebase SDK no está cargado en esta página');
            console.log('📝 Recarga la página para cargar Firebase');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ [ÉXITO] Firebase configurado correctamente');
        console.log('='.repeat(60));
        console.log('\n🔄 SIGUIENTE PASO: Recarga la página (F5)');
        console.log('💡 Después podrás usar la carga masiva de calificaciones');
        
        return {
            exito: true,
            mensaje: 'Firebase configurado. Recarga la página.',
            config: nuevaConfig
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        return {
            exito: false,
            error: error.message
        };
    }
};

// Función para configurar interactivamente
window.configurarFirebaseInteractivo = function() {
    console.log('\n🎯 [CONFIGURACIÓN INTERACTIVA]');
    console.log('\n📋 Necesitas las credenciales de Firebase Console');
    console.log('🌐 Ve a: https://console.firebase.google.com/');
    console.log('   1. Selecciona tu proyecto: superjf1234-e9cbc');
    console.log('   2. Ve a: Project Settings → General → Your apps');
    console.log('   3. Busca la sección "Firebase SDK snippet"');
    console.log('   4. Copia el objeto firebaseConfig');
    console.log('\n💡 Luego ejecuta:');
    console.log('   configurarFirebaseCredenciales({');
    console.log('       apiKey: "TU_API_KEY",');
    console.log('       authDomain: "superjf1234-e9cbc.firebaseapp.com",');
    console.log('       projectId: "superjf1234-e9cbc",');
    console.log('       storageBucket: "superjf1234-e9cbc.appspot.com",');
    console.log('       messagingSenderId: "TU_MESSAGING_SENDER_ID",');
    console.log('       appId: "TU_APP_ID"');
    console.log('   })');
};

// Función para usar credenciales de entorno
window.usarCredencialesDeEntorno = function() {
    console.log('\n🔍 [VERIFICAR VARIABLES DE ENTORNO]');
    
    const envVars = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    console.log('📊 Variables encontradas:');
    Object.keys(envVars).forEach(key => {
        const valor = envVars[key];
        if (valor && !valor.includes('TU_') && !valor.includes('AQUI')) {
            console.log(`   ✅ ${key}: ${valor.substring(0, 20)}...`);
        } else {
            console.log(`   ❌ ${key}: no configurado`);
        }
    });
    
    const todasPresentes = Object.values(envVars).every(v => 
        v && !v.includes('TU_') && !v.includes('AQUI')
    );
    
    if (todasPresentes) {
        console.log('\n✅ Todas las variables están configuradas');
        console.log('💡 Usando estas credenciales...');
        return configurarFirebaseCredenciales(envVars);
    } else {
        console.log('\n❌ Faltan variables de entorno');
        console.log('📝 Necesitas configurar el archivo .env.local');
        console.log('💡 O usa: configurarFirebaseInteractivo()');
        return { exito: false, error: 'Variables de entorno incompletas' };
    }
};

// Mostrar opciones
console.log('\n🛠️ [FUNCIONES DISPONIBLES]:');
console.log('   1. configurarFirebaseInteractivo() - Guía paso a paso');
console.log('   2. configurarFirebaseCredenciales({...}) - Configurar con credenciales');
console.log('   3. usarCredencialesDeEntorno() - Usar variables de entorno');

console.log('\n💡 [RECOMENDACIÓN]:');
console.log('   Ejecuta: configurarFirebaseInteractivo()');
console.log('   Para ver las instrucciones detalladas');

console.log('\n' + '='.repeat(60));
