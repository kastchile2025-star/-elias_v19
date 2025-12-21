/**
 * 🔍 DIAGNÓSTICO: Por qué Sofia no ve sus calificaciones
 * 
 * EJECUTAR EN LA CONSOLA DEL NAVEGADOR (cuando Sofia está logueada):
 * 1. Copiar y pegar este código completo
 * 2. Revisar los resultados para identificar el problema
 */

(function diagnosticoSofiaCalificaciones() {
  console.log('%c🔍 DIAGNÓSTICO: CALIFICACIONES DE SOFIA', 'background: #ef4444; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  
  // 1. Verificar usuario actual
  console.log('\n👤 1. USUARIO ACTUAL:');
  console.log('   ═══════════════════════════════════════════════════════\n');
  const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
  const currentUser = auth.user;
  
  if (!currentUser) {
    console.error('❌ No hay usuario logueado');
    return;
  }
  
  console.log('✅ Usuario logueado:', {
    id: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    role: currentUser.role,
    rut: currentUser.rut || '❌ NO TIENE RUT'
  });
  
  // 2. Verificar datos de Sofia en smart-student-users
  console.log('\n📋 2. DATOS DE SOFIA EN USUARIOS:');
  console.log('   ═══════════════════════════════════════════════════════\n');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const sofia = users.find(u => u.username === 'sofia');
  
  if (!sofia) {
    console.error('❌ Sofia no está en smart-student-users');
  } else {
    console.log('✅ Sofia en usuarios:', {
      id: sofia.id,
      username: sofia.username,
      displayName: sofia.displayName,
      role: sofia.role,
      rut: sofia.rut || '❌ NO TIENE RUT',
      activeCourses: sofia.activeCourses
    });
  }
  
  // 3. Verificar calificaciones de Sofia
  console.log('\n📊 3. CALIFICACIONES DE SOFIA:');
  console.log('   ═══════════════════════════════════════════════════════\n');
  const grades = JSON.parse(localStorage.getItem('smart-student-grades') || '[]');
  
  // Buscar por diferentes formas de identificación
  const gradesBySofiaId = grades.filter(g => g.studentId === currentUser.id);
  const gradesByRut = grades.filter(g => g.studentId === '10000000-8');
  const gradesBySofiaName = grades.filter(g => 
    g.studentName && g.studentName.toLowerCase().includes('sofía')
  );
  
  console.log(`📊 Total calificaciones en sistema: ${grades.length}`);
  console.log(`🔍 Calificaciones con studentId = "${currentUser.id}": ${gradesBySofiaId.length}`);
  console.log(`🔍 Calificaciones con studentId = "10000000-8" (RUT): ${gradesByRut.length}`);
  console.log(`🔍 Calificaciones con nombre "Sofía": ${gradesBySofiaName.length}`);
  
  if (gradesByRut.length > 0) {
    console.log('\n✅ Muestra de calificaciones por RUT (primeras 3):');
    gradesByRut.slice(0, 3).forEach(g => {
      console.log(`   • ${g.subjectId}: ${g.score} - ${g.testType} (${new Date(g.gradedAt).toLocaleDateString()})`);
    });
  }
  
  // 4. Verificar mapa RUT → userId
  console.log('\n🗺️ 4. MAPA RUT → userId:');
  console.log('   ═══════════════════════════════════════════════════════\n');
  
  const rutToUserId = new Map();
  users.forEach(u => {
    const uid = String(u.id || '');
    const rut = String(u.rut || '').trim();
    if (uid && rut) {
      rutToUserId.set(rut, uid);
    }
  });
  
  console.log(`📊 Total mapeos RUT → userId: ${rutToUserId.size}`);
  
  if (rutToUserId.size > 0) {
    console.log('✅ Ejemplos de mapeo:');
    Array.from(rutToUserId.entries()).slice(0, 5).forEach(([rut, uid]) => {
      console.log(`   • ${rut} → ${uid}`);
    });
  }
  
  const sofiaMapping = rutToUserId.get('10000000-8');
  if (sofiaMapping) {
    console.log(`\n✅ Mapeo de Sofia encontrado: 10000000-8 → ${sofiaMapping}`);
    console.log(`   ¿Coincide con user.id? ${sofiaMapping === currentUser.id ? '✅ SÍ' : '❌ NO'}`);
  } else {
    console.error('\n❌ NO EXISTE MAPEO para RUT 10000000-8');
    console.log('   🔧 SOLUCIÓN: Agregar campo "rut" al usuario Sofia');
  }
  
  // 5. Verificar asignaciones de estudiante
  console.log('\n🎓 5. ASIGNACIONES DE ESTUDIANTE:');
  console.log('   ═══════════════════════════════════════════════════════\n');
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const sofiaAssignments = studentAssignments.filter(a => 
    a.studentId === currentUser.id || a.studentUsername === currentUser.username
  );
  
  console.log(`📊 Total asignaciones: ${studentAssignments.length}`);
  console.log(`🎓 Asignaciones de Sofia: ${sofiaAssignments.length}`);
  
  if (sofiaAssignments.length > 0) {
    sofiaAssignments.forEach(a => {
      console.log(`   • Curso: ${a.courseId}, Sección: ${a.sectionId}`);
    });
  }
  
  // 6. DIAGNÓSTICO FINAL
  console.log('\n🎯 DIAGNÓSTICO FINAL:');
  console.log('   ═══════════════════════════════════════════════════════\n');
  
  const problemas = [];
  const soluciones = [];
  
  if (!currentUser.rut && !sofia?.rut) {
    problemas.push('❌ Sofia NO tiene campo RUT ni en auth ni en users');
    soluciones.push('🔧 Agregar rut: "10000000-8" al usuario Sofia en localStorage');
  }
  
  if (gradesByRut.length > 0 && gradesBySofiaId.length === 0) {
    problemas.push('❌ Las calificaciones usan RUT, pero user.id no coincide');
    soluciones.push('🔧 Asegurar que el mapa rutToUserId funcione correctamente');
  }
  
  if (sofiaAssignments.length === 0) {
    problemas.push('❌ Sofia no tiene asignaciones de estudiante-sección');
    soluciones.push('🔧 Crear student-assignments para Sofia');
  }
  
  if (problemas.length === 0) {
    console.log('✅ ¡No se detectaron problemas obvios!');
    console.log('   El problema puede estar en el código de filtrado de calificaciones.');
  } else {
    console.log('PROBLEMAS DETECTADOS:');
    problemas.forEach(p => console.log(`   ${p}`));
    console.log('\nSOLUCIONES SUGERIDAS:');
    soluciones.forEach(s => console.log(`   ${s}`));
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('FIN DEL DIAGNÓSTICO');
  console.log('═'.repeat(60));
})();
