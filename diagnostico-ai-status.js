// 🔍 DIAGNÓSTICO DEL INDICADOR DE ESTADO DE IA
// Ejecuta este código en la consola del navegador para diagnosticar el problema

console.log('🔍 INICIANDO DIAGNÓSTICO DE IA STATUS...\n');

// 1. Verificar la URL actual
console.log('📍 URL actual:', window.location.href);
console.log('🌐 Origin:', window.location.origin);
console.log('📂 Pathname:', window.location.pathname);

// 2. Construir la URL del endpoint
const baseUrl = window.location.origin;
const apiUrl = `${baseUrl}/api/ai-status`;
console.log('\n🎯 URL del endpoint de IA:', apiUrl);

// 3. Intentar hacer fetch con manejo de errores detallado
console.log('\n🚀 Probando conexión al endpoint...');

async function testAIStatus() {
  try {
    console.log('⏳ Haciendo fetch a:', apiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado (5 segundos)');
      controller.abort();
    }, 5000);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('📊 Status HTTP:', response.status, response.statusText);
    console.log('✅ Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ Respuesta no exitosa:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ RESPUESTA EXITOSA:');
    console.log('📦 Datos:', JSON.stringify(data, null, 2));
    console.log('🤖 IA Activa:', data.isActive);
    console.log('💬 Razón:', data.reason);
    
    if (data.isActive) {
      console.log('🎉 ¡IA CONFIGURADA Y FUNCIONANDO!');
      console.log('🛠️ Características disponibles:', data.features?.join(', '));
    } else {
      console.log('⚠️ IA NO ACTIVA');
      console.log('📋 Instrucciones:', data.instructions);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR AL HACER FETCH:');
    console.error('🔴 Tipo:', error.name);
    console.error('💬 Mensaje:', error.message);
    console.error('📜 Stack:', error.stack);
    
    if (error.name === 'AbortError') {
      console.log('\n⏰ El servidor no respondió en 5 segundos');
      console.log('💡 Verifica que el servidor de desarrollo esté ejecutándose');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('\n🌐 Error de conexión de red');
      console.log('💡 Posibles causas:');
      console.log('   - Servidor no está ejecutándose');
      console.log('   - CORS bloqueando la petición');
      console.log('   - Problema de red o firewall');
      console.log('   - URL incorrecta en Codespaces');
    }
  }
}

// 4. Verificar localStorage (por si hay datos cacheados)
console.log('\n💾 Verificando LocalStorage...');
const keys = Object.keys(localStorage);
console.log('🔑 Keys en localStorage:', keys.length);
if (keys.length > 0) {
  console.log('📋 Primeras 10 keys:', keys.slice(0, 10));
}

// 5. Ejecutar la prueba
testAIStatus();

console.log('\n✅ Diagnóstico completado. Revisa los resultados arriba.');
console.log('💡 Si ves "Failed to fetch", el problema es de conexión de red.');
console.log('💡 Si ves HTTP 200, el endpoint funciona pero puede que la IA no esté configurada.');
