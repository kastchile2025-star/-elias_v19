/**
 * Script de prueba para enviar un email real con Mailrelay
 */

const MAILRELAY_API_KEY = process.env.MAILRELAY_API_KEY || '_kszGyMZqGazPP8UpnFqCryzNmshyDvkXyDwv__y';
const MAILRELAY_BASE_URL = process.env.MAILRELAY_BASE_URL || 'https://smartstudent1.ipzmarketing.com';

async function testSendEmail() {
  console.log('📧 ============================================');
  console.log('📧 PRUEBA DE ENVÍO DE EMAIL CON MAILRELAY');
  console.log('📧 ============================================\n');

  // Email de prueba - usa tu email real para recibir la prueba
  const testEmail = {
    from: {
      email: 'notificaciones@smartstudent.cl',
      name: 'Smart Student'
    },
    to: [{
      email: 'test@smartstudent.cl',  // Email de prueba
      name: 'Usuario de Prueba'
    }],
    subject: '🧪 Prueba de Mailrelay - ' + new Date().toLocaleString('es-CL'),
    html_part: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">🎓 Smart Student</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">✅ Prueba de Mailrelay Exitosa</h2>
          <p style="color: #4b5563;">Este es un email de prueba enviado desde el sistema de notificaciones de Smart Student.</p>
          <p style="color: #4b5563;"><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-CL')}</p>
          <p style="color: #4b5563;"><strong>Servidor:</strong> Mailrelay (80,000 emails/mes)</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">Si recibiste este email, significa que Mailrelay está funcionando correctamente.</p>
        </div>
      </div>
    `
  };

  console.log('📋 Configuración:');
  console.log('   API URL:', MAILRELAY_BASE_URL);
  console.log('   De:', testEmail.from.email);
  console.log('   Para:', testEmail.to[0].email);
  console.log('   Asunto:', testEmail.subject);
  console.log('');

  console.log('📡 Enviando email de prueba...');
  
  try {
    const response = await fetch(`${MAILRELAY_BASE_URL}/api/v1/send_emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': MAILRELAY_API_KEY,
      },
      body: JSON.stringify(testEmail),
    });

    console.log('   Status:', response.status);
    const data = await response.text();
    
    console.log('   Respuesta completa:', data);
    
    if (response.ok || response.status === 201) {
      console.log('\n✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
      try {
        const parsed = JSON.parse(data);
        console.log('   ID del mensaje:', parsed.id || parsed.data?.id || 'enviado');
      } catch {
        console.log('   Respuesta:', data);
      }
    } else {
      console.log('\n❌ ERROR AL ENVIAR EMAIL');
      console.log('   Código:', response.status);
      console.log('   Detalle:', data);
    }
  } catch (error) {
    console.log('\n❌ ERROR DE RED:', error.message);
  }

  console.log('\n📧 ============================================');
  console.log('📧 PRUEBA COMPLETADA');
  console.log('📧 ============================================');
}

testSendEmail().catch(console.error);
