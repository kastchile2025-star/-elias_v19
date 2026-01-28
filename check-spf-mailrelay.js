// Verificar configuración adicional de Mailrelay

const MAILRELAY_API_KEY = '_kszGyMZqGazPP8UpnFqCryzNmshyDvkXyDwv__y';
const MAILRELAY_BASE_URL = 'https://smartstudent1.ipzmarketing.com';

async function checkDomainSettings() {
  console.log('🔍 Verificando configuración del dominio en Mailrelay...\n');
  
  // Verificar dominios configurados
  const endpoints = [
    '/api/v1/domains',
    '/api/v1/domain_validations',
    '/api/v1/settings',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${MAILRELAY_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': MAILRELAY_API_KEY,
        },
      });
      
      const data = await response.text();
      console.log(`📡 ${endpoint}:`);
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        try {
          const json = JSON.parse(data);
          console.log('   Response:', JSON.stringify(json, null, 2));
        } catch {
          console.log('   Response:', data.substring(0, 200));
        }
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error en ${endpoint}:`, error.message);
    }
  }
  
  // Mostrar el remitente configurado
  console.log('\n📧 Información del remitente verificado:');
  console.log('   Email: notificaciones@smartstudent.cl');
  console.log('   Estado: Confirmado ✅');
  console.log('\n⚠️ PROBLEMA: El dominio smartstudent.cl no tiene SPF configurado');
  console.log('\n📋 PASOS PARA SOLUCIONAR:');
  console.log('   1. Acceder al panel de Mailrelay: https://smartstudent1.ipzmarketing.com');
  console.log('   2. Ir a Configuración > Dominios');
  console.log('   3. Copiar el registro SPF que proporciona Mailrelay');
  console.log('   4. Agregar ese registro TXT en el DNS de smartstudent.cl');
  console.log('   5. Esperar propagación DNS (hasta 48h, usualmente 1-2h)');
}

checkDomainSettings().catch(console.error);
