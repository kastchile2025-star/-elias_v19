// Script para verificar datos en localStorage desde la consola del navegador
// Ejecutar este código en la consola de desarrollo del navegador

console.log('🔍 Verificando datos de localStorage...');

// Verificar usuarios
const users = localStorage.getItem('smart-student-users');
if (users) {
  const usersData = JSON.parse(users);
  console.log('👥 Usuarios encontrados:', usersData.length);
  usersData.filter(user => user.role === 'teacher').forEach(teacher => {
    console.log(`👨‍🏫 Profesor: ${teacher.name} (${teacher.username}) - ID: ${teacher.id}`);
  });
} else {
  console.log('❌ No se encontraron usuarios');
}

// Verificar asignaciones
const assignments = localStorage.getItem('smart-student-teacher-assignments');
if (assignments) {
  const assignmentsData = JSON.parse(assignments);
  console.log('📋 Asignaciones encontradas:', assignmentsData.length);
  assignmentsData.forEach(assignment => {
    console.log(`📝 Asignación: Profesor ${assignment.teacherId} -> Sección ${assignment.sectionId} -> ${assignment.subjectName}`);
  });
} else {
  console.log('❌ No se encontraron asignaciones');
}

// Verificar secciones
const sections = localStorage.getItem('smart-student-sections');
if (sections) {
  const sectionsData = JSON.parse(sections);
  console.log('🏫 Secciones encontradas:', sectionsData.length);
  sectionsData.forEach(section => {
    console.log(`🏫 Sección: ${section.name} (${section.id}) -> Curso: ${section.courseId}`);
  });
} else {
  console.log('❌ No se encontraron secciones');
}

// Verificar cursos
const courses = localStorage.getItem('smart-student-courses');
if (courses) {
  const coursesData = JSON.parse(courses);
  console.log('📚 Cursos encontrados:', coursesData.length);
  coursesData.forEach(course => {
    console.log(`📚 Curso: ${course.name} (${course.id})`);
  });
} else {
  console.log('❌ No se encontraron cursos');
}

// Verificar usuario actual
const currentUser = localStorage.getItem('smart-student-current-user');
if (currentUser) {
  const userData = JSON.parse(currentUser);
  console.log('👤 Usuario actual:', userData);
} else {
  console.log('❌ No hay usuario logueado');
}

console.log('✅ Verificación completada');
