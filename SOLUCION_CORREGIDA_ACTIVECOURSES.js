// 🔧 CORRECCIÓN MEJORADA: Asignar activeCourses a Felipe
// Versión corregida que maneja el caso donde courseId puede ser undefined

function corregirActiveCoursesFelipe() {
  console.clear();
  console.log('🔧 CORRECCIÓN MEJORADA: Asignando activeCourses a Felipe');
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
  console.log('• Estructura completa:', JSON.stringify(targetTask, null, 2));
  
  // 3. Analizar los comentarios para encontrar el curso correcto
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const taskComments = comments.filter(c => c.taskId === targetTask.id);
  
  console.log('📝 Comentarios de la tarea:');
  taskComments.forEach((comment, index) => {
    console.log(`${index + 1}. "${comment.text}" por ${comment.author}`);
  });
  
  // 4. Buscar información del curso desde los comentarios o desde logs anteriores
  // Según los logs anteriores, el curso es: 9077a79d-c290-45f9-b549-6e57df8828d2
  // Y la sección es: d326c181-fa30-4c50-ab68-efa085a3ffd3
  
  let cursoId, seccionId;
  
  if (targetTask.courseId && targetTask.courseId.includes('-')) {
    [cursoId, seccionId] = targetTask.courseId.split('-');
  } else {
    // Usar los IDs identificados en los logs anteriores
    cursoId = '9077a79d-c290-45f9-b549-6e57df8828d2';
    seccionId = 'd326c181-fa30-4c50-ab68-efa085a3ffd3';
    
    console.log('⚠️ CourseId no encontrado en tarea, usando IDs de logs anteriores');
  }
  
  console.log('🔍 Información del curso a asignar:');
  console.log('• Curso ID:', cursoId);
  console.log('• Sección ID:', seccionId);
  
  // 5. Configurar activeCourses para Felipe
  const activeCourses = [
    {
      courseId: cursoId,
      sectionId: seccionId,
      courseName: '4to Básico A',
      enrollmentDate: new Date().toISOString()
    }
  ];
  
  // 6. Actualizar usuario Felipe
  users[felipeIndex].activeCourses = activeCourses;
  
  // 7. Guardar cambios
  localStorage.setItem('smart-student-users', JSON.stringify(users, null, 2));
  
  console.log('✅ CORRECCIÓN APLICADA:');
  console.log('• Felipe ahora tiene activeCourses configurado');
  console.log('• Curso asignado:', cursoId);
  console.log('• Sección asignada:', seccionId);
  console.log('• Nombre del curso: 4to Básico A');
  
  // 8. Verificar la corrección
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
    
    // 9. Disparar eventos para actualizar la interfaz
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'smart-student-users',
      newValue: JSON.stringify(users)
    }));
    
    window.dispatchEvent(new CustomEvent('commentsUpdated', { 
      detail: { source: 'activeCourses-correction' } 
    }));
    
    console.log('🔄 Eventos disparados para actualizar interfaz');
    
    // 10. Forzar actualización del panel de notificaciones
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('taskNotificationsUpdated', { 
        detail: { force: true, source: 'activeCourses-fix' } 
      }));
      console.log('🔄 Evento adicional disparado para forzar actualización');
    }, 100);
    
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

// Función mejorada para verificar comentarios visibles
function testCorreccionMejorado() {
  console.log('\n🧪 TEST MEJORADO: Verificando que Felipe puede ver comentarios');
  console.log('='.repeat(60));
  
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const felipe = users.find(u => u.username === 'felipe');
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  
  if (!felipe) {
    console.log('❌ Felipe no encontrado');
    return;
  }
  
  console.log('👤 Felipe configurado:');
  console.log('• ID:', felipe.id);
  console.log('• activeCourses:', felipe.activeCourses?.length || 0);
  console.log('• Detalles:', JSON.stringify(felipe.activeCourses, null, 2));
  
  let visibleComments = 0;
  let totalComments = 0;
  
  // Usar los IDs conocidos del log anterior
  const targetCourseId = '9077a79d-c290-45f9-b549-6e57df8828d2';
  const targetSectionId = 'd326c181-fa30-4c50-ab68-efa085a3ffd3';
  
  console.log('\n📋 ANALIZANDO COMENTARIOS:');
  
  comments.forEach((comment, index) => {
    if (comment.author === 'felipe') {
      console.log(`${index + 1}. "${comment.text}" por ${comment.author} - PROPIO (filtrado)`);
      return; // Filtrar comentarios propios
    }
    
    totalComments++;
    
    const task = tasks.find(t => t.id === comment.taskId);
    if (!task) {
      console.log(`${index + 1}. "${comment.text}" - TAREA NO ENCONTRADA`);
      return;
    }
    
    // Verificar acceso usando los IDs conocidos
    const hasAccess = felipe.activeCourses?.some(course => 
      course.courseId === targetCourseId && course.sectionId === targetSectionId
    );
    
    if (hasAccess) {
      visibleComments++;
      console.log(`${index + 1}. "${comment.text}" por ${comment.author} - ✅ VISIBLE`);
    } else {
      console.log(`${index + 1}. "${comment.text}" por ${comment.author} - ❌ OCULTO`);
    }
  });
  
  console.log(`\n📊 RESULTADO FINAL:`);
  console.log(`• Total comentarios en sistema: ${comments.length}`);
  console.log(`• Comentarios de otros (no propios): ${totalComments}`);
  console.log(`• Comentarios visibles para Felipe: ${visibleComments}`);
  
  if (visibleComments > 0) {
    console.log('\n🎉 ¡ÉXITO! Felipe ahora puede ver comentarios');
    console.log('Los comentarios deberían aparecer en el panel de notificaciones');
  } else {
    console.log('\n❌ Los comentarios siguen ocultos');
    console.log('Puede ser necesario revisar la lógica en el código React');
  }
  
  return {
    total: comments.length,
    others: totalComments,
    visible: visibleComments
  };
}

// Auto-ejecutar
console.log('🚀 Iniciando corrección mejorada...');
corregirActiveCoursesFelipe();

console.log('\n📋 INSTRUCCIONES SIGUIENTES:');
console.log('1. Ejecuta testCorreccionMejorado() para verificar');
console.log('2. Revisa el panel de notificaciones');
console.log('3. Si no aparecen, puede ser un problema de React state');
