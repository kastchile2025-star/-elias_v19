/**
 * Script de prueba para Mailrelay API
 * Ejecutar: node test-mailrelay.js
 */

const MAILRELAY_API_KEY = '_kszGyMZqGazPP8UpnFqCryzNmshyDvkXyDwv__y';
const MAILRELAY_BASE_URL = 'https://smartstudent1.ipzmarketing.com';

async function testConnection() {
  console.log('🔍 PRUEBA 1: Verificando conexión con Mailrelay API...\n');
  
  try {
    // Intentar obtener información de la cuenta
    const response = await fetch(`${MAILRELAY_BASE_URL}/api/v1/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': MAILRELAY_API_KEY,
      },
    });
    
    const data = await response.text();
    console.log('📡 Status:', response.status);
    console.log('📡 Response:', data);
    
    if (response.ok) {
      console.log('✅ Conexión exitosa con Mailrelay!\n');
      return true;
    } else {
      console.log('❌ Error de conexión\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testSendEmail() {
  console.log('\n🔍 PRUEBA 2: Enviando email de prueba...\n');
  
  const testEmail = {
    from: {
      email: 'notificaciones@smartstudent.cl',
      name: 'Smart Student Test'
    },
    to: [{
      email: 'notificaciones@smartstudent.cl',
      name: 'Test Recipient'
    }],
    subject: '[TEST] Prueba de Mailrelay - ' + new Date().toLocaleString('es-CL'),
    html_part: `
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🧪 Prueba de Mailrelay</h2>
        <p>Este es un email de prueba enviado desde Smart Student.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
        <p><strong>Servidor:</strong> Mailrelay (smartstudent1.ipzmarketing.com)</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Si recibiste este email, Mailrelay está funcionando correctamente.
        </p>
      </body>
      </html>
    `
  };
  
  try {
    const response = await fetch(`${MAILRELAY_BASE_URL}/api/v1/send_emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': MAILRELAY_API_KEY,
      },
      body: JSON.stringify(testEmail),
    });
    
    const data = await response.text();
    console.log('📡 Status:', response.status);
    console.log('📡 Response:', data);
    
    if (response.ok || response.status === 201) {
      console.log('\n✅ ¡Email enviado exitosamente!');
      return true;
    } else {
      console.log('\n❌ Error al enviar email');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testSenders() {
  console.log('\n🔍 PRUEBA 3: Verificando remitentes configurados...\n');
  
  try {
    const response = await fetch(`${MAILRELAY_BASE_URL}/api/v1/senders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': MAILRELAY_API_KEY,
      },
    });
    
    const data = await response.text();
    console.log('📡 Status:', response.status);
    console.log('📡 Remitentes:', data);
    
    if (response.ok) {
      try {
        const senders = JSON.parse(data);
        if (senders.data && senders.data.length > 0) {
          console.log('\n✅ Remitentes verificados:');
          senders.data.forEach((sender, i) => {
            console.log(`   ${i+1}. ${sender.email} - Estado: ${sender.status || 'N/A'}`);
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStats() {
  console.log('\n🔍 PRUEBA 4: Verificando estadísticas de envío...\n');
  
  try {
    const response = await fetch(`${MAILRELAY_BASE_URL}/api/v1/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': MAILRELAY_API_KEY,
      },
    });
    
    const data = await response.text();
    console.log('📡 Status:', response.status);
    console.log('📡 Estadísticas:', data);
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('    🧪 PRUEBAS DE MAILRELAY PARA SMART STUDENT     ');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`📍 URL Base: ${MAILRELAY_BASE_URL}`);
  console.log(`🔑 API Key: ${MAILRELAY_API_KEY.substring(0, 10)}...`);
  console.log('\n═══════════════════════════════════════════════════\n');
  
  const results = {
    connection: await testConnection(),
    senders: await testSenders(),
    stats: await testStats(),
    sendEmail: await testSendEmail(),
  };
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('                  📊 RESUMEN                        ');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Conexión API:      ${results.connection ? '✅ OK' : '❌ FALLO'}`);
  console.log(`  Remitentes:        ${results.senders ? '✅ OK' : '❌ FALLO'}`);
  console.log(`  Estadísticas:      ${results.stats ? '✅ OK' : '⚠️ N/A'}`);
  console.log(`  Envío de Email:    ${results.sendEmail ? '✅ OK' : '❌ FALLO'}`);
  console.log('═══════════════════════════════════════════════════\n');
  
  if (results.connection && results.sendEmail) {
    console.log('🎉 ¡Mailrelay está funcionando correctamente!');
  } else {
    console.log('⚠️ Hay problemas con la configuración de Mailrelay');
  }
}

runAllTests().catch(console.error);
