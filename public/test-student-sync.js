// Script de prueba para verificar la sincronización de datos académicos de estudiantes
console.log("🔧 Iniciando prueba de sincronización de estudiantes...");

// 1. Verificar datos actuales
const students = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const gustavo = students.find(u => u.username === 'gustavo');

console.log("👤 Datos actuales de Gustavo:", gustavo);

if (gustavo) {
  console.log("📊 Datos académicos actuales:");
  console.log("- Curso ID:", gustavo.courseId);
  console.log("- Sección ID:", gustavo.sectionId);
  
  // Verificar cursos y secciones
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  
  const course = courses.find(c => c.id === gustavo.courseId);
  const section = sections.find(s => s.id === gustavo.sectionId);
  
  console.log("📚 Curso encontrado:", course);
  console.log("🏫 Sección encontrada:", section);
  
  // 2. Simular evento de cambio de estudiante
  console.log("🚀 Disparando evento studentAssignmentsChanged...");
  window.dispatchEvent(new CustomEvent('studentAssignmentsChanged'));
  
  // 3. Verificar que el evento se puede escuchar
  window.addEventListener('studentAssignmentsChanged', () => {
    console.log("✅ Evento studentAssignmentsChanged recibido correctamente");
  });
  
  // 4. Disparar evento de nuevo para verificar
  setTimeout(() => {
    console.log("🔄 Disparando evento de prueba...");
    window.dispatchEvent(new CustomEvent('studentAssignmentsChanged'));
  }, 1000);
  
} else {
  console.log("❌ Usuario gustavo no encontrado");
}

console.log("✨ Prueba completada. Revisa la consola del navegador para ver los resultados.");
