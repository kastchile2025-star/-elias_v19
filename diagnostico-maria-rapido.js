// 🔍 DIAGNÓSTICO RÁPIDO - PROBLEMA DE COMENTARIOS
// Copiar y pegar en la consola de Smart Student

console.log("🔍 === DIAGNÓSTICO DE COMENTARIOS DE MARÍA ===");

// Obtener datos
const comentarios = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

// Filtrar comentarios de María
const comentariosMaria = comentarios.filter(c => c.studentUsername === 'maria');

console.log(`📊 Total comentarios: ${comentarios.length}`);
console.log(`📊 Total comentarios de María: ${comentariosMaria.length}`);

// Examinar cada comentario de María
if (comentariosMaria.length > 0) {
  comentariosMaria.forEach((c, i) => {
    console.log(`\n💬 Comentario ${i+1}: "${c.comment}"`);
    console.log(`   📌 ID Tarea: ${c.taskId}`);
    console.log(`   📅 Fecha: ${new Date(c.timestamp).toLocaleString()}`);
    console.log(`   ⚠️ isSubmission: ${c.isSubmission} (PROBLEMA SI ES TRUE)`);
    console.log(`   👤 userRole: ${c.userRole || "NO DEFINIDO (PROBLEMA)"}`);
    console.log(`   👁️ Leído por: ${c.readBy?.join(', ') || "nadie"}`);
    
    // Verificar si la tarea existe y es de Jorge
    const tarea = tareas.find(t => t.id === c.taskId);
    if (tarea) {
      console.log(`   📋 Tarea: "${tarea.title}" asignada por: ${tarea.assignedBy}`);
      console.log(`   ✅ La tarea ${tarea.assignedBy === 'jorge' ? 'SÍ' : 'NO'} es de Jorge`);
    } else {
      console.log(`   ❌ La tarea con ID ${c.taskId} no existe`);
    }
    
    // Simular la lógica de filtrado del panel de notificaciones
    const pasaFiltro = !c.isSubmission && 
                     tarea && tarea.assignedBy === 'jorge' &&
                     c.studentUsername !== 'jorge' &&
                     (!c.readBy?.includes('jorge'));
                     
    console.log(`   🚦 ${pasaFiltro ? '✅ PASA' : '❌ NO PASA'} el filtro de notificaciones`);
    
    if (!pasaFiltro) {
      console.log("   🔍 RAZONES:");
      if (c.isSubmission) console.log("      - Está marcado como entrega (isSubmission: true)");
      if (!tarea) console.log("      - La tarea no existe");
      if (tarea && tarea.assignedBy !== 'jorge') console.log("      - La tarea no es de Jorge");
      if (c.studentUsername === 'jorge') console.log("      - Es un comentario del propio Jorge");
      if (c.readBy?.includes('jorge')) console.log("      - Ya fue leído por Jorge");
    }
  });
  
  // Crear función de reparación
  console.log("\n🔧 === HERRAMIENTA DE REPARACIÓN ===");
  console.log("Para reparar los comentarios, ejecuta: repararComentariosMaria()");
  
  window.repararComentariosMaria = function() {
    console.log("\n🔧 Reparando comentarios de María...");
    
    const comentariosActualizados = comentarios.map(c => {
      if (c.studentUsername === 'maria') {
        const cambios = [];
        
        if (c.isSubmission) {
          c.isSubmission = false;
          cambios.push("isSubmission: false");
        }
        
        if (!c.userRole) {
          c.userRole = 'student';
          cambios.push("userRole: student");
        }
        
        if (c.readBy?.includes('jorge')) {
          c.readBy = c.readBy.filter(u => u !== 'jorge');
          cambios.push("quitado jorge de readBy");
        }
        
        if (cambios.length > 0) {
          console.log(`✅ Reparado: "${c.comment}" - Cambios: ${cambios.join(', ')}`);
        }
      }
      return c;
    });
    
    localStorage.setItem('smart-student-task-comments', JSON.stringify(comentariosActualizados));
    console.log("\n💾 Cambios guardados. Recarga la página para ver los resultados.");
  };
} else {
  console.log("❌ No se encontraron comentarios de María.");
}
