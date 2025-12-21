// 🔧 CORRECCIÓN: Asignar activeCourses a Felipe
// El problema identificado es que Felipe no tiene activeCourses configurado

function corregirActiveCoursesFelipe() {
  console.clear();
  console.log('🔧 CORRECCIÓN: Asignando activeCourses a Felipe');
  console.log('='.repeat(50));
  
  // 1. Obtener usuarios actuales
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const felipeIndex = users.findIndex(u => u.username === 'felipe');
  
  if (felipeIndex === -1) {
    console.log('❌ Usuario Felipe no encontrado');
    return;
  }
  
  console.log('✅ Usuario Felipe encontrado:');
  console.log('• ID:', users[felipeIndex].id);
  console.log('• Username:', users[felipeIndex].username);
  console.log('• Role:', users[felipeIndex].role);
  console.log('• activeCourses actuales:', users[felipeIndex].activeCourses);
  
  // 2. Obtener información de la tarea para saber qué curso necesita
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  const targetTask = tasks.find(t => t.title === 'Tarea Curso 1');
  
  if (!targetTask) {
    console.log('❌ Tarea "Tarea Curso 1" no encontrada');
    return;
  }
  
  console.log('📋 Tarea encontrada:');
  console.log('• ID:', targetTask.id);
  console.log('• Title:', targetTask.title);
  console.log('• AssignedTo:', targetTask.assignedTo);
  console.log('• CourseId:', targetTask.courseId);
  
  // 3. Extraer el curso y sección del courseId compuesto
  const [cursoId, seccionId] = targetTask.courseId.split('-');
  
  console.log('🔍 Información del curso:');
  console.log('• Curso ID:', cursoId);
  console.log('• Sección ID:', seccionId);
  
  // 4. Configurar activeCourses para Felipe
  const activeCourses = [
    {
      courseId: cursoId,
      sectionId: seccionId,
      courseName: '4to Básico A', // Nombre que aparece en los logs
      enrollmentDate: new Date().toISOString()
    }
  ];
  
  // 5. Actualizar usuario Felipe
  users[felipeIndex].activeCourses = activeCourses;
  
  // 6. Guardar cambios
  localStorage.setItem('smart-student-users', JSON.stringify(users, null, 2));
  
  console.log('✅ CORRECCIÓN APLICADA:');
  console.log('• Felipe ahora tiene activeCourses configurado');
  console.log('• Curso asignado:', cursoId);
  console.log('• Sección asignada:', seccionId);
  console.log('• Nombre del curso: 4to Básico A');
  
  // 7. Verificar la corrección
  console.log('\n🔍 VERIFICANDO CORRECCIÓN:');
  
  // Simular checkStudentAssignmentToTask con los nuevos datos
  const updatedUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const updatedFelipe = updatedUsers.find(u => u.username === 'felipe');
  
  console.log('• Felipe actualizado:', updatedFelipe.username);
  console.log('• activeCourses:', JSON.stringify(updatedFelipe.activeCourses, null, 2));
  
  // Verificar si ahora Felipe tiene acceso a la tarea
  const hasAccess = updatedFelipe.activeCourses?.some(course => 
    course.courseId === cursoId && course.sectionId === seccionId
  );
  
  console.log('• ¿Felipe tiene acceso ahora?', hasAccess ? '✅ SÍ' : '❌ NO');
  
  if (hasAccess) {
    console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
    console.log('Felipe ahora debería ver los comentarios de "Tarea Curso 1"');
    console.log('');
    console.log('🔄 PRÓXIMO PASO: Recargar la página o panel de notificaciones');
  } else {
    console.log('\n❌ La corrección no funcionó, revisar datos');
  }
  
  return {
    success: hasAccess,
    felipeId: updatedFelipe.id,
    coursesAssigned: updatedFelipe.activeCourses?.length || 0,
    targetCourse: cursoId,
    targetSection: seccionId
  };
}

// Auto-ejecutar
console.log('🔧 Iniciando corrección de activeCourses para Felipe...');
corregirActiveCoursesFelipe();
