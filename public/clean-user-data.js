// Script para limpiar datos de usuarios corruptos
// Ejecutar en la consola del navegador para limpiar localStorage

function cleanUserData() {
  // Get current users
  const usersData = localStorage.getItem('smart-student-users');
  
  if (usersData) {
    try {
      const users = JSON.parse(usersData);
      
      // Fix students with multiple courses
      const fixedUsers = users.map(user => {
        if (user.role === 'student' && user.activeCourses && user.activeCourses.length > 1) {
          console.log(`Fixing student ${user.username}: had ${user.activeCourses.length} courses, keeping only first one`);
          return {
            ...user,
            activeCourses: [user.activeCourses[0]] // Keep only first course
          };
        }
        return user;
      });
      
      // Save fixed data
      localStorage.setItem('smart-student-users', JSON.stringify(fixedUsers));
      console.log('User data cleaned successfully!');
      
      // Show fixed users
      console.log('Fixed users:', fixedUsers);
      
    } catch (error) {
      console.error('Error cleaning user data:', error);
    }
  } else {
    console.log('No user data found in localStorage');
  }
}

// Reset to default clean data
function resetToDefaultUsers() {
  const defaultUsers = [
    {
      username: 'admin',
      displayName: 'Administrador del Sistema',
      email: 'admin@smartstudent.com',
      role: 'admin',
      activeCourses: [],
      password: '1234'
    },
    {
      username: 'felipe',
      displayName: 'Felipe Estudiante',
      email: 'felipe@student.com',
      role: 'student',
      activeCourses: ['4to Básico'], // Only one course
      password: '1234'
    },
    {
      username: 'jorge',
      displayName: 'Jorge Profesor',
      email: 'jorge@teacher.com',
      role: 'teacher',
      activeCourses: ['4to Básico', '5to Básico'],
      password: '1234'
    },
    {
      username: 'maria',
      displayName: 'María Estudiante',
      email: 'maria@student.com',
      role: 'student',
      activeCourses: ['1ro Básico'], // Only one course
      password: '1234'
    },
    {
      username: 'carlos',
      displayName: 'Carlos Profesor',
      email: 'carlos@teacher.com',
      role: 'teacher',
      activeCourses: ['1ro Básico', '2do Básico'],
      password: '1234'
    }
  ];
  
  localStorage.setItem('smart-student-users', JSON.stringify(defaultUsers));
  console.log('Reset to default users completed!');
  console.log('Default users:', defaultUsers);
}

console.log('User data cleaning scripts loaded. Use:');
console.log('- cleanUserData() to fix existing data');
console.log('- resetToDefaultUsers() to start fresh');
