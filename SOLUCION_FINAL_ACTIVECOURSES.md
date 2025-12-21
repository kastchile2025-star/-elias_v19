// 🔧 CORRECCIÓN INMEDIATA: Ejecutar en consola del navegador
// Copia y pega este código en la consola del navegador

// PASO 1: Copiar y pegar el siguiente código en la consola del navegador:

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
      courseName: '4to Básico A',
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
    console.log('🔄 PRÓXIMO PASO: Disparar eventos para actualizar la interfaz');
    
    // 8. Disparar eventos para actualizar la interfaz
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'smart-student-users',
      newValue: JSON.stringify(users)
    }));
    
    window.dispatchEvent(new CustomEvent('commentsUpdated', { 
      detail: { source: 'activeCourses-correction' } 
    }));
    
    console.log('🔄 Eventos disparados para actualizar interfaz');
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

// PASO 2: Ejecutar la función
corregirActiveCoursesFelipe();

// PASO 3: Después de la corrección, ejecutar este test para verificar
function testCorreccion() {
  console.log('\n🧪 TEST: Verificando que Felipe puede ver comentarios');
  console.log('='.repeat(50));
  
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const felipe = users.find(u => u.username === 'felipe');
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  
  if (!felipe) {
    console.log('❌ Felipe no encontrado');
    return;
  }
  
  console.log('👤 Felipe configurado:');
  console.log('• activeCourses:', felipe.activeCourses?.length || 0);
  
  let visibleComments = 0;
  
  comments.forEach((comment, index) => {
    if (comment.author === 'felipe') return; // Filtrar comentarios propios
    
    const task = tasks.find(t => t.id === comment.taskId);
    if (!task) return;
    
    if (task.assignedTo === 'course') {
      const [courseId, sectionId] = task.courseId.split('-');
      const hasAccess = felipe.activeCourses?.some(course => 
        course.courseId === courseId && course.sectionId === sectionId
      );
      
      if (hasAccess) {
        visibleComments++;
        console.log(`✅ Comentario ${index + 1}: "${comment.text}" - VISIBLE`);
      } else {
        console.log(`❌ Comentario ${index + 1}: "${comment.text}" - OCULTO`);
      }
    }
  });
  
  console.log(`\n📊 RESULTADO: Felipe puede ver ${visibleComments} comentarios`);
  
  if (visibleComments > 0) {
    console.log('🎉 ¡CORRECCIÓN EXITOSA! Los comentarios ahora deberían aparecer en el panel de notificaciones');
  } else {
    console.log('❌ Los comentarios siguen ocultos, revisar configuración');
  }
  
  return visibleComments;
}

console.log('\n📋 INSTRUCCIONES:');
console.log('1. La función corregirActiveCoursesFelipe() ya se ejecutó');
console.log('2. Ejecuta testCorreccion() para verificar');
console.log('3. Revisa el panel de notificaciones para ver los comentarios');
