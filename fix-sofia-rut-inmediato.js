/**
 * 🔧 FIX INMEDIATO: Agregar RUT a Sofia en localStorage
 * 
 * Este script corrige el problema de Sofia que no ve sus calificaciones
 * porque su usuario en localStorage no tiene el campo RUT.
 * 
 * USO:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega todo este código
 * 3. Se ejecutará automáticamente
 * 4. Cierra sesión y vuelve a iniciar sesión como Sofia
 */

(function() {
  console.clear();
  console.log('%c🔧 FIX SOFIA - AGREGAR RUT', 'font-size: 18px; font-weight: bold; color: #10B981');
  console.log('═══════════════════════════════════════════════\n');

  // PASO 1: Cargar usuarios
  console.log('📊 PASO 1: Cargando usuarios...');
  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  if (usuarios.length === 0) {
    console.log('%c❌ No hay usuarios en el sistema', 'color: #EF4444; font-weight: bold;');
    console.log('\n💡 Solución: Carga primero el archivo users-consolidated-2025-CORREGIDO.csv');
    return;
  }
  
  console.log(`✅ ${usuarios.length} usuarios cargados`);

  // PASO 2: Buscar Sofia
  console.log('\n🔍 PASO 2: Buscando a Sofia...');
  const sofiaIndex = usuarios.findIndex(u => 
    u.username === 'sofia' || 
    u.username === 's.gonzalez0008' ||
    (u.name && u.name.toLowerCase().includes('sofía gonzález'))
  );

  if (sofiaIndex === -1) {
    console.log('%c❌ Sofia no encontrada', 'color: #EF4444; font-weight: bold;');
    console.log('\n📝 Usuarios disponibles que contienen "sofia":');
    usuarios.filter(u => 
      (u.username && u.username.toLowerCase().includes('sofia')) ||
      (u.name && u.name.toLowerCase().includes('sofia'))
    ).forEach(u => {
      console.log(`   • ${u.username} - ${u.name || u.displayName}`);
    });
    return;
  }

  const sofia = usuarios[sofiaIndex];
  console.log(`✅ Sofia encontrada: ${sofia.username} - ${sofia.name || sofia.displayName}`);

  // PASO 3: Verificar si tiene RUT
  console.log('\n🔍 PASO 3: Verificando RUT...');
  console.log('   Datos actuales de Sofia:', {
    username: sofia.username,
    name: sofia.name || sofia.displayName,
    rut: sofia.rut,
    id: sofia.id,
    email: sofia.email,
    activeCourses: sofia.activeCourses
  });

  if (sofia.rut && sofia.rut !== '') {
    console.log(`%c✅ Sofia ya tiene RUT: ${sofia.rut}`, 'color: #10B981; font-weight: bold;');
    console.log('\n💡 El problema puede ser que necesitas cerrar sesión y volver a iniciar sesión');
    console.log('   para que se actualice el RUT en la sesión actual.');
    return;
  }

  console.log('%c⚠️ Sofia NO tiene RUT', 'color: #F59E0B; font-weight: bold;');

  // PASO 4: Agregar RUT
  console.log('\n🔧 PASO 4: Agregando RUT...');
  
  // El RUT oficial de Sofia según el sistema es 10000000-8
  const RUT_SOFIA = '10000000-8';
  
  usuarios[sofiaIndex].rut = RUT_SOFIA;
  
  // Guardar
  localStorage.setItem('smart-student-users', JSON.stringify(usuarios));
  
  console.log(`%c✅ RUT agregado: ${RUT_SOFIA}`, 'color: #10B981; font-weight: bold;');

  // PASO 5: Verificar las calificaciones
  console.log('\n📊 PASO 5: Verificando calificaciones...');
  const year = 2025;
  const calificacionesKey = `smart-student-test-grades-${year}`;
  const calificaciones = JSON.parse(localStorage.getItem(calificacionesKey) || '[]');
  
  console.log(`✅ Total de calificaciones en el sistema: ${calificaciones.length}`);
  
  // Buscar calificaciones de Sofia por RUT
  const calificacionesSofia = calificaciones.filter(c => 
    c.studentRut === RUT_SOFIA ||
    c.studentId === RUT_SOFIA ||
    (c.studentName && c.studentName.toLowerCase().includes('sofía gonzález'))
  );
  
  console.log(`📝 Calificaciones de Sofia encontradas: ${calificacionesSofia.length}`);
  
  if (calificacionesSofia.length > 0) {
    console.log('\n📋 Primeras 3 calificaciones:');
    calificacionesSofia.slice(0, 3).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.subject || c.subjectName} - Nota: ${c.score} - Fecha: ${c.gradedAt}`);
    });
  } else {
    console.log('%c⚠️ No se encontraron calificaciones para Sofia', 'color: #F59E0B; font-weight: bold;');
    console.log('   Esto puede significar que las calificaciones no están cargadas en localStorage');
  }

  // PASO 6: Instrucciones finales
  console.log('\n' + '═'.repeat(50));
  console.log('%c✅ CORRECCIÓN COMPLETADA', 'color: #10B981; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(50) + '\n');
  
  console.log('📋 PASOS SIGUIENTES:\n');
  console.log('   1. %cCierra sesión%c (logout)', 'font-weight: bold; color: #3B82F6;', '');
  console.log('   2. %cVuelve a iniciar sesión como Sofia%c', 'font-weight: bold; color: #3B82F6;', '');
  console.log(`      • Username: ${sofia.username}`);
  console.log(`      • Password: ${sofia.password || 'temporal123'}`);
  console.log('   3. %cVe a la pestaña Calificaciones%c', 'font-weight: bold; color: #3B82F6;', '');
  console.log('   4. %cDeberías ver tus calificaciones%c ✨', 'font-weight: bold; color: #3B82F6;', '');
  
  console.log('\n💡 Si aún no ves las calificaciones:');
  console.log('   • Verifica que las calificaciones estén cargadas en localStorage');
  console.log('   • Ejecuta en consola: diagnosticarSofia()');
  
  // Crear función de diagnóstico
  window.diagnosticarSofia = function() {
    console.clear();
    console.log('%c🔍 DIAGNÓSTICO SOFIA', 'font-size: 16px; font-weight: bold; color: #6366F1;');
    console.log('═'.repeat(50) + '\n');
    
    // Usuario actual
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
    console.log('👤 Usuario actual en sesión:');
    if (currentUser) {
      console.log('   Username:', currentUser.username);
      console.log('   RUT:', currentUser.rut || '❌ NO TIENE RUT');
      console.log('   ID:', currentUser.id);
      console.log('   Rol:', currentUser.role);
    } else {
      console.log('   ❌ No hay usuario en sesión');
    }
    
    // Usuario en localStorage
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const sofia = usuarios.find(u => u.username === 'sofia' || u.username === 's.gonzalez0008');
    console.log('\n📊 Usuario Sofia en localStorage:');
    if (sofia) {
      console.log('   Username:', sofia.username);
      console.log('   RUT:', sofia.rut || '❌ NO TIENE RUT');
      console.log('   ID:', sofia.id);
      console.log('   Nombre:', sofia.name || sofia.displayName);
    } else {
      console.log('   ❌ Sofia no encontrada');
    }
    
    // Calificaciones
    const year = 2025;
    const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
    console.log('\n📊 Calificaciones:');
    console.log('   Total:', calificaciones.length);
    
    if (sofia && sofia.rut) {
      const calificacionesSofia = calificaciones.filter(c => 
        c.studentRut === sofia.rut ||
        c.studentId === sofia.rut
      );
      console.log('   De Sofia (por RUT):', calificacionesSofia.length);
    }
    
    if (sofia && sofia.id) {
      const calificacionesPorId = calificaciones.filter(c => 
        c.studentId === sofia.id
      );
      console.log('   De Sofia (por ID):', calificacionesPorId.length);
    }
    
    // Mapa RUT → userId
    console.log('\n🗺️ Mapa RUT → userId:');
    const rutToUserId = {};
    usuarios.filter(u => u.role === 'student').forEach(u => {
      if (u.rut) {
        rutToUserId[u.rut] = u.id;
      }
    });
    console.log('   Total de mapeos:', Object.keys(rutToUserId).length);
    if (sofia && sofia.rut) {
      console.log(`   Mapeo de Sofia (${sofia.rut}):`, rutToUserId[sofia.rut] || '❌ NO MAPEADO');
    }
  };
  
  console.log('\n%c✨ Función de diagnóstico creada: diagnosticarSofia()', 'color: #8B5CF6; font-weight: bold;');

})();
