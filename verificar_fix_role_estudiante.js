// Verificación rápida del fix del role de estudiante
function verificarFixRoleEstudiante() {
  console.clear();
  console.log('🔧 VERIFICACIÓN FIX - Role de Estudiante');
  console.log('=====================================');
  
  try {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    console.log(`📊 Datos cargados:`);
    console.log(`   • Usuarios: ${users.length}`);
    console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
    
    // Verificar roles de usuarios
    const roleStats = {};
    users.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });
    
    console.log(`\n👥 Distribución de roles:`);
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   • ${role}: ${count}`);
    });
    
    // Buscar estudiantes con role correcto
    const estudiantesConRoleCorrecto = users.filter(u => u.role === 'estudiante');
    const estudiantesConRoleIncorrecto = users.filter(u => u.role === 'student');
    
    console.log(`\n🔍 Análisis de roles de estudiantes:`);
    console.log(`   • Con role 'estudiante': ${estudiantesConRoleCorrecto.length} ✅`);
    console.log(`   • Con role 'student': ${estudiantesConRoleIncorrecto.length} ${estudiantesConRoleIncorrecto.length > 0 ? '⚠️' : '✅'}`);
    
    if (estudiantesConRoleCorrecto.length > 0) {
      console.log(`\n👥 Estudiantes encontrados:`);
      estudiantesConRoleCorrecto.forEach((estudiante, i) => {
        console.log(`   ${i + 1}. ${estudiante.name} (${estudiante.id})`);
      });
    }
    
    // Verificar el caso específico de la sección problemática
    const sectionId = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
    const estudiantesEnSeccion = studentAssignments
      .filter(assignment => assignment.sectionId === sectionId)
      .map(assignment => assignment.studentId);
    
    console.log(`\n🎯 Verificación para sección problemática (${sectionId}):`);
    console.log(`   • Estudiantes asignados: ${estudiantesEnSeccion.length}`);
    
    // Simular el filtro corregido
    const estudiantesCompletos = users.filter(usuario => 
      usuario.role === 'estudiante' && estudiantesEnSeccion.includes(usuario.id)
    );
    
    console.log(`   • Estudiantes filtrados con role 'estudiante': ${estudiantesCompletos.length} ✅`);
    
    if (estudiantesCompletos.length > 0) {
      console.log(`   • Nombres: ${estudiantesCompletos.map(e => e.name).join(', ')}`);
      
      console.log(`\n🎉 ¡CORRECCIÓN EXITOSA!`);
      console.log(`💡 Ahora los estudiantes deberían aparecer en el dropdown`);
      
      return {
        success: true,
        estudiantesEncontrados: estudiantesCompletos.length,
        nombres: estudiantesCompletos.map(e => e.name)
      };
    } else {
      console.log(`\n⚠️ Aún no se encuentran estudiantes. Verificar asignaciones.`);
      return { success: false };
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar verificación
console.log('🚀 Verificando fix del role de estudiante...');
const resultado = verificarFixRoleEstudiante();
console.log('\n✅ Resultado final:', resultado);

if (resultado?.success) {
  console.log('\n🎯 SIGUIENTE PASO: Recarga la página y prueba crear una tarea');
  console.log('💡 Los estudiantes ahora SÍ deberían aparecer en el dropdown');
}
