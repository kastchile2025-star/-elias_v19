// Script para configurar correctamente la relación profesor-estudiante
// Ejecutar en la consola del navegador

console.log('=== CONFIGURANDO RELACIÓN PROFESOR-ESTUDIANTE ===');

// Leer datos actuales
const usersData = localStorage.getItem('smart-student-users');
const authData = localStorage.getItem('smart-student-auth');

if (usersData && authData) {
  const users = JSON.parse(usersData);
  const auth = JSON.parse(authData);
  
  console.log('Usuario actual:', auth.user);
  console.log('Todos los usuarios:', users);
  
  // Buscar el estudiante actual (que está enviando mensajes)
  const currentUser = auth.user;
  
  if (currentUser.role === 'student') {
    console.log('El usuario actual es estudiante:', currentUser.username);
    
    // Buscar profesores disponibles
    const teachers = users.filter(u => u.role === 'teacher');
    console.log('Profesores disponibles:', teachers);
    
    if (teachers.length > 0) {
      const teacher = teachers[0]; // Tomar el primer profesor
      
      // Actualizar la asignación del estudiante
      const updatedUsers = users.map(user => {
        if (user.username === currentUser.username) {
          return { ...user, assignedTeacher: teacher.username };
        }
        return user;
      });
      
      localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
      
      // También actualizar el usuario en auth
      const updatedAuth = {
        ...auth,
        user: { ...currentUser, assignedTeacher: teacher.username }
      };
      localStorage.setItem('smart-student-auth', JSON.stringify(updatedAuth));
      
      console.log(`✅ Estudiante ${currentUser.username} asignado al profesor ${teacher.username}`);
      console.log('Recarga la página para ver los cambios');
    }
  } else if (currentUser.role === 'teacher') {
    console.log('El usuario actual es profesor:', currentUser.username);
    
    // Buscar estudiantes y asignarlos a este profesor
    const students = users.filter(u => u.role === 'student');
    console.log('Estudiantes disponibles:', students);
    
    const updatedUsers = users.map(user => {
      if (user.role === 'student') {
        return { ...user, assignedTeacher: currentUser.username };
      }
      return user;
    });
    
    localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
    
    console.log(`✅ Todos los estudiantes asignados al profesor ${currentUser.username}`);
    console.log('Recarga la página para ver los cambios');
  }
} else {
  console.log('❌ No se encontraron datos de usuarios o autenticación');
}

// Función para verificar las asignaciones después
window.checkAssignments = function() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  console.log('\n--- ASIGNACIONES ACTUALES ---');
  users.forEach(user => {
    if (user.role === 'student') {
      console.log(`Estudiante: ${user.username} -> Profesor: ${user.assignedTeacher || 'NINGUNO'}`);
    }
  });
};

console.log('\nEjecuta checkAssignments() para verificar las asignaciones');
