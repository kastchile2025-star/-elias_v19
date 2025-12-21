// 🔧 REPARACIÓN COMENTARIOS MARÍA
// Para ejecutar en la consola del navegador en Smart Student

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
  const comentariosReparados = comentarios.map(c => {
    if (c.studentUsername === 'maria' && c.comment === "wqewqeq") {
      let cambios = [];
      
      // Arreglar problemas
      if (c.isSubmission) {
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
        console.log(`\n✅ Reparado: "${c.comment}" - Cambios: ${cambios.join(', ')}`);
      } else {
        console.log(`\n⚠️ No fue necesario reparar: "${c.comment}"`);
      }
    }
    return c;
  });
  
  // Guardar comentarios reparados
  localStorage.setItem('smart-student-task-comments', JSON.stringify(comentariosReparados));
  console.log("\n💾 Cambios guardados. Recarga la página para ver los resultados.");
  
  // Mostrar comentarios después de reparar
  const comentariosMariaDespues = comentariosReparados.filter(c => c.studentUsername === 'maria');
  console.log("\n📝 COMENTARIOS DE MARÍA DESPUÉS DE REPARAR:");
  comentariosMariaDespues.forEach((c, i) => {
    console.log(`${i+1}. "${c.comment}"`);
    console.log(`   isSubmission: ${c.isSubmission}`);
    console.log(`   userRole: ${c.userRole || "NO DEFINIDO"}`);
    console.log(`   readBy: [${c.readBy?.join(', ') || ""}]`);
  });
}
