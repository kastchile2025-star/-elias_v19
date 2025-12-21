// 🔧 SCRIPT DE REPARACIÓN AUTOMÁTICA PARA COMENTARIOS DE MARÍA
// Copiar y pegar en la consola del navegador (F12)

console.log("🔧 === REPARACIÓN DE COMENTARIOS DE MARÍA ===");

// Cargar datos
const comentarios = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');

// Verificar si hay comentarios de María
const comentariosMaria = comentarios.filter(c => c.studentUsername === 'maria');
console.log(`📊 Total comentarios de María: ${comentariosMaria.length}`);

if (comentariosMaria.length === 0) {
  console.log("❌ No hay comentarios de María para reparar.");
} else {
  // Mostrar comentarios de María antes de reparar
  console.log("\n📝 COMENTARIOS DE MARÍA ANTES DE REPARAR:");
  comentariosMaria.forEach((c, i) => {
    console.log(`${i+1}. "${c.comment}"`);
    console.log(`   isSubmission: ${c.isSubmission}`);
    console.log(`   userRole: ${c.userRole || "NO DEFINIDO"}`);
    console.log(`   readBy: [${c.readBy?.join(', ') || ""}]`);
  });
  
  // Reparar comentarios
  let cambiosRealizados = 0;
  const comentariosReparados = comentarios.map(c => {
    if (c.studentUsername === 'maria') {
      let cambios = [];
      
      // Arreglar problemas
      if (c.isSubmission && !c.attachments?.length) {
        c.isSubmission = false;
        cambios.push("isSubmission: false");
      }
      
      if (!c.userRole) {
        c.userRole = 'student';
        cambios.push("userRole: student");
      }
      
      if (c.readBy?.includes('jorge')) {
        c.readBy = c.readBy.filter(user => user !== 'jorge');
        cambios.push("quitado jorge de readBy");
      }
      
      if (cambios.length > 0) {
        cambiosRealizados++;
        console.log(`\n✅ Reparado: "${c.comment}" - Cambios: ${cambios.join(', ')}`);
      }
    }
    return c;
  });
  
  if (cambiosRealizados > 0) {
    // Guardar comentarios reparados
    localStorage.setItem('smart-student-task-comments', JSON.stringify(comentariosReparados));
    console.log(`\n💾 Se han reparado ${cambiosRealizados} comentarios. Recarga la página para ver los resultados.`);
  } else {
    console.log("\n⚠️ No fue necesario reparar ningún comentario.");
  }
}
