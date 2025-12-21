/**
 * 🔧 CORRECCIÓN: Agregar RUT a Sofia para que vea sus calificaciones
 * 
 * EJECUTAR EN LA CONSOLA DEL NAVEGADOR:
 * 1. Copiar y pegar este código completo
 * 2. Recargar la página
 */

(function corregirRutSofia() {
  console.log('%c🔧 CORRECCIÓN: AGREGAR RUT A SOFIA', 'background: #10b981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  
  try {
    // 1. Actualizar usuario en auth
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    if (auth.user && auth.user.username === 'sofia') {
      auth.user.rut = '10000000-8';
      localStorage.setItem('smart-student-auth', JSON.stringify(auth));
      console.log('✅ RUT agregado a smart-student-auth');
    }
    
    // 2. Actualizar usuario en users
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const sofiaIndex = users.findIndex(u => u.username === 'sofia');
    
    if (sofiaIndex !== -1) {
      users[sofiaIndex].rut = '10000000-8';
      localStorage.setItem('smart-student-users', JSON.stringify(users));
      console.log('✅ RUT agregado a smart-student-users');
    } else {
      console.error('❌ No se encontró Sofia en users');
    }
    
    // 3. Verificar el cambio
    console.log('\n📋 VERIFICACIÓN:');
    const authUpdated = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    const usersUpdated = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const sofiaUpdated = usersUpdated.find(u => u.username === 'sofia');
    
    console.log('Auth user RUT:', authUpdated.user?.rut || '❌ NO TIENE');
    console.log('Sofia user RUT:', sofiaUpdated?.rut || '❌ NO TIENE');
    
    // 4. Verificar mapa RUT → userId
    const rutToUserId = new Map();
    usersUpdated.forEach(u => {
      const uid = String(u.id || '');
      const rut = String(u.rut || '').trim();
      if (uid && rut) {
        rutToUserId.set(rut, uid);
      }
    });
    
    console.log(`\n🗺️ Mapa RUT → userId: ${rutToUserId.size} entradas`);
    const sofiaMapping = rutToUserId.get('10000000-8');
    if (sofiaMapping) {
      console.log(`✅ Mapeo de Sofia: 10000000-8 → ${sofiaMapping}`);
    } else {
      console.error('❌ NO se creó el mapeo para Sofia');
    }
    
    console.log('\n✅ CORRECCIÓN COMPLETADA');
    console.log('🔄 RECARGA LA PÁGINA para ver las calificaciones de Sofia');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
})();
