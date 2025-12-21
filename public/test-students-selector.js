// Test script para verificar el selector de estudiantes
console.log('=== Test Selector de Estudiantes ===');

// Verificar si hay usuarios en localStorage
const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
console.log('Usuarios disponibles:', Object.keys(users).length);

// Filtrar estudiantes
const students = Object.entries(users)
  .filter(([_, userData]) => userData.role === 'student')
  .map(([username, userData]) => ({
    username,
    displayName: userData.displayName || username,
    activeCourses: userData.activeCourses || []
  }));

console.log('Estudiantes encontrados:', students.length);
students.forEach(student => {
  console.log(`- ${student.displayName} (${student.username}) - Cursos: ${student.activeCourses.join(', ')}`);
});

// Verificar cursos disponibles
const courses = [...new Set(students.flatMap(s => s.activeCourses))];
console.log('Cursos disponibles:', courses);

// Función para obtener estudiantes de un curso específico
function getStudentsFromCourse(course) {
  return students.filter(student => student.activeCourses.includes(course));
}

// Probar la función con cada curso
courses.forEach(course => {
  const studentsInCourse = getStudentsFromCourse(course);
  console.log(`Estudiantes en ${course}:`, studentsInCourse.map(s => s.displayName));
});

// Verificar si hay un profesor logueado
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
console.log('Usuario actual:', currentUser?.username, '- Rol:', currentUser?.role);

console.log('=== Fin del Test ===');
