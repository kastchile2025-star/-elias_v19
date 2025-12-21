console.log('=== VERIFICANDO USUARIOS EN LOCALSTORAGE ===');

// Verificar usuarios principales
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
console.log('Usuarios en smart-student-users:', users.length);
users.forEach(user => {
  console.log(`- ${user.username}: ${user.password} (rol: ${user.role})`);
});

// Verificar usuarios por categoría
const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
const teachers = JSON.parse(localStorage.getItem('smart-student-teachers') || '[]');
const administrators = JSON.parse(localStorage.getItem('smart-student-administrators') || '[]');

console.log('\nUsuarios por categoría:');
console.log('- Estudiantes:', students.length);
console.log('- Profesores:', teachers.length);
console.log('- Administradores:', administrators.length);

// Buscar específicamente el usuario 'max'
const maxUser = users.find(u => u.username === 'max');
if (maxUser) {
  console.log('\n✅ Usuario MAX encontrado:', maxUser);
} else {
  console.log('\n❌ Usuario MAX NO encontrado en smart-student-users');
  
  // Buscar en otras categorías
  const maxInStudents = students.find(s => s.username === 'max');
  const maxInTeachers = teachers.find(t => t.username === 'max');
  const maxInAdmins = administrators.find(a => a.username === 'max');
  
  if (maxInStudents) console.log('Encontrado en estudiantes:', maxInStudents);
  if (maxInTeachers) console.log('Encontrado en profesores:', maxInTeachers);
  if (maxInAdmins) console.log('Encontrado en administradores:', maxInAdmins);
}

// Función para crear usuario max de prueba
window.crearUsuarioMax = function() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  // Verificar si ya existe
  const existingMax = users.find(u => u.username === 'max');
  if (existingMax) {
    console.log('Usuario max ya existe:', existingMax);
    return;
  }
  
  // Crear usuario max
  const maxUser = {
    id: crypto.randomUUID(),
    username: 'max',
    name: 'Max Usuario',
    email: 'max@test.com',
    role: 'student',
    password: '1234',
    displayName: 'Max Usuario',
    activeCourses: ['4to Básico'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Agregar a la lista
  users.push(maxUser);
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  
  console.log('✅ Usuario max creado exitosamente:', maxUser);
  console.log('🔄 Ahora puedes intentar hacer login con max/1234');
};

console.log('\n💡 Para crear el usuario max manualmente, ejecuta: crearUsuarioMax()');
