// Script para probar la creación de usuarios desde configuración

console.log('🧪 PRUEBA DE CREACIÓN DE USUARIOS');

// Función para simular la creación de un usuario
window.crearUsuarioPrueba = function(tipo = 'student') {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  let newUser;
  
  if (tipo === 'student') {
    newUser = {
      id: crypto.randomUUID(),
      username: 'test_student',
      name: 'Estudiante Prueba',
      email: 'test@student.com',
      role: 'student',
      password: '1234',
      displayName: 'Estudiante Prueba',
      activeCourses: ['4to Básico'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else if (tipo === 'teacher') {
    newUser = {
      id: crypto.randomUUID(),
      username: 'test_teacher',
      name: 'Profesor Prueba',
      email: 'test@teacher.com',
      role: 'teacher',
      password: '1234',
      displayName: 'Profesor Prueba',
      activeCourses: ['4to Básico'],
      teachingAssignments: [{
        teacherUsername: 'test_teacher',
        teacherName: 'Profesor Prueba',
        subject: 'Matemáticas',
        courses: ['4to Básico']
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else if (tipo === 'admin') {
    newUser = {
      id: crypto.randomUUID(),
      username: 'test_admin',
      name: 'Admin Prueba',
      email: 'test@admin.com',
      role: 'admin',
      password: '1234',
      displayName: 'Admin Prueba',
      activeCourses: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  // Verificar si ya existe
  const existing = users.find(u => u.username === newUser.username);
  if (existing) {
    console.log(`❌ Usuario ${newUser.username} ya existe`);
    return;
  }
  
  // Agregar a la lista
  users.push(newUser);
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  
  console.log(`✅ Usuario ${tipo} creado:`, newUser);
  console.log(`🔑 Credenciales: ${newUser.username} / ${newUser.password}`);
  
  return newUser;
};

// Función para probar login
window.probarLogin = function(username, password) {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const user = users.find(u => u.username === username.toLowerCase());
  
  console.log(`🔍 Probando login: ${username} / ${password}`);
  
  if (!user) {
    console.log(`❌ Usuario '${username}' no encontrado`);
    return false;
  }
  
  console.log('👤 Usuario encontrado:', user);
  
  if (user.password !== password) {
    console.log(`❌ Contraseña incorrecta. Esperada: '${user.password}', Recibida: '${password}'`);
    return false;
  }
  
  console.log('✅ Login exitoso');
  return true;
};

// Función para limpiar usuarios de prueba
window.limpiarUsuariosPrueba = function() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const filtered = users.filter(u => !u.username.startsWith('test_'));
  localStorage.setItem('smart-student-users', JSON.stringify(filtered));
  console.log('🧹 Usuarios de prueba eliminados');
};

console.log('\n💡 Funciones disponibles:');
console.log('- crearUsuarioPrueba("student") - Crea estudiante de prueba');
console.log('- crearUsuarioPrueba("teacher") - Crea profesor de prueba');
console.log('- crearUsuarioPrueba("admin") - Crea admin de prueba');
console.log('- probarLogin("username", "password") - Prueba login');
console.log('- limpiarUsuariosPrueba() - Elimina usuarios de prueba');

// Auto-crear usuario de prueba si no existe
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const maxUser = users.find(u => u.username === 'max');
if (!maxUser) {
  console.log('\n🎯 Creando usuario "max" para pruebas...');
  const max = {
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
  
  users.push(max);
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  console.log('✅ Usuario "max" creado con credenciales: max / 1234');
}
