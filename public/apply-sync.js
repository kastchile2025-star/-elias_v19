// Script para aplicar sincronización inmediata de datos académicos de estudiantes
console.log("🔧 Aplicando sincronización de datos académicos...");

// Función para actualizar perfil de estudiante específico
function syncStudentProfile(username) {
  console.log(`🔄 Sincronizando perfil del estudiante: ${username}`);
  
  // 1. Obtener datos actuales del usuario
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const student = users.find(u => u.username === username && u.role === 'student');
  
  if (!student) {
    console.log(`❌ Estudiante ${username} no encontrado`);
    return false;
  }
  
  console.log("👤 Datos del estudiante:", student);
  
  // 2. Obtener cursos y secciones
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  
  // 3. Encontrar curso y sección
  const course = courses.find(c => c.id === student.courseId);
  const section = sections.find(s => s.id === student.sectionId);
  
  console.log("📚 Curso:", course);
  console.log("🏫 Sección:", section);
  
  if (course && section) {
    console.log(`✅ Datos académicos correctos: ${course.name} - ${section.name}`);
    
    // 4. Disparar eventos de sincronización
    console.log("🚀 Disparando eventos de sincronización...");
    window.dispatchEvent(new CustomEvent('studentAssignmentsChanged'));
    window.dispatchEvent(new CustomEvent('userDataUpdated'));
    window.dispatchEvent(new CustomEvent('localStorageUpdate'));
    
    return true;
  } else {
    console.log("❌ No se pudieron encontrar datos académicos válidos");
    return false;
  }
}

// Función para sincronizar todos los estudiantes
function syncAllStudents() {
  console.log("🔄 Sincronizando todos los estudiantes...");
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const students = users.filter(u => u.role === 'student');
  
  console.log(`👥 Encontrados ${students.length} estudiantes`);
  
  let successCount = 0;
  students.forEach(student => {
    if (syncStudentProfile(student.username)) {
      successCount++;
    }
  });
  
  console.log(`✅ Sincronizados ${successCount}/${students.length} estudiantes`);
  
  // Disparar evento global de sincronización
  setTimeout(() => {
    console.log("🌍 Disparando evento global de sincronización...");
    window.dispatchEvent(new CustomEvent('studentAssignmentsChanged'));
  }, 500);
}

// Ejecutar sincronización
if (typeof window !== 'undefined') {
  // Sincronizar específicamente a gustavo
  syncStudentProfile('gustavo');
  
  // Sincronizar todos después de un momento
  setTimeout(() => {
    syncAllStudents();
  }, 1000);
  
  console.log("✨ Sincronización aplicada. Revisa el perfil del estudiante.");
} else {
  console.log("❌ No se puede ejecutar en este contexto");
}