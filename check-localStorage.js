// Script para verificar localStorage y encontrar el problema
console.log('🔍 [VERIFICACIÓN] Revisando localStorage...');

// Función para verificar localStorage en el navegador
function checkLocalStorage() {
  console.log('\n📋 [LOCALSTORAGE] Verificando datos guardados:');
  
  // Verificar comentarios
  const comments = localStorage.getItem('smart-student-task-comments');
  console.log('\n1. 💬 Comentarios:');
  if (comments) {
    const parsedComments = JSON.parse(comments);
    console.log(`   - Total comentarios: ${parsedComments.length}`);
    
    // Buscar comentario de arturo específicamente
    const arturoComments = parsedComments.filter(c => 
      c.studentUsername === 'arturo' && 
      c.comment && c.comment.includes('dfsdfds')
    );
    
    console.log(`   - Comentarios de arturo con "dfsdfds": ${arturoComments.length}`);
    
    if (arturoComments.length > 0) {
      console.log('   - Comentario encontrado:', arturoComments[0]);
    } else {
      console.log('   ❌ No se encontró el comentario de arturo');
      
      // Mostrar todos los comentarios de arturo
      const todosArturo = parsedComments.filter(c => c.studentUsername === 'arturo');
      console.log(`   - Todos los comentarios de arturo: ${todosArturo.length}`);
      todosArturo.forEach((c, i) => {
        console.log(`     ${i+1}. "${c.comment}" (Task: ${c.taskId}, isSubmission: ${c.isSubmission})`);
      });
    }
  } else {
    console.log('   ❌ No hay comentarios en localStorage');
  }
  
  // Verificar tareas
  const tasks = localStorage.getItem('smart-student-tasks');
  console.log('\n2. 📚 Tareas:');
  if (tasks) {
    const parsedTasks = JSON.parse(tasks);
    console.log(`   - Total tareas: ${parsedTasks.length}`);
    
    // Buscar tarea "dfsf"
    const dfsfTask = parsedTasks.filter(t => t.title === 'dfsf');
    console.log(`   - Tareas con título "dfsf": ${dfsfTask.length}`);
    
    if (dfsfTask.length > 0) {
      console.log('   - Tarea encontrada:', dfsfTask[0]);
    }
    
    // Tareas asignadas por felipin
    const felipinTasks = parsedTasks.filter(t => t.assignedBy === 'felipin');
    console.log(`   - Tareas asignadas por felipin: ${felipinTasks.length}`);
  } else {
    console.log('   ❌ No hay tareas en localStorage');
  }
  
  // Verificar usuario actual
  const user = localStorage.getItem('smart-student-user');
  console.log('\n3. 👤 Usuario actual:');
  if (user) {
    const parsedUser = JSON.parse(user);
    console.log('   - Usuario:', parsedUser);
  } else {
    console.log('   ❌ No hay usuario en localStorage');
  }
}

// Ejecutar cuando se cargue la página
if (typeof window !== 'undefined') {
  console.log('🌐 [BROWSER] Ejecutando en navegador...');
  checkLocalStorage();
} else {
  console.log('🖥️ [NODE] Para ejecutar en navegador, copia este código en la consola del DevTools');
}

// Exportar para uso en navegador
if (typeof window !== 'undefined') {
  window.checkLocalStorage = checkLocalStorage;
  console.log('\n💡 [TIP] También puedes ejecutar: checkLocalStorage() en la consola');
}
