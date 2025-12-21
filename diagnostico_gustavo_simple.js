// Script diagnóstico para verificar problemas con gustavo
console.log('🔍 DIAGNÓSTICO DE GUSTAVO - PROBLEMAS DE AUTENTICACIÓN Y BADGE');
console.log('===============================================================');

// 1. Verificar autenticación actual
console.log('\n1. ESTADO DE AUTENTICACIÓN:');
const authData = localStorage.getItem('smart-student-auth');
const userData = localStorage.getItem('smart-student-user');

console.log('smart-student-auth:', authData);
console.log('smart-student-user:', userData);

let currentUser = null;

// Intentar parsear datos de autenticación
try {
  if (authData && authData !== 'true' && authData !== 'false') {
    currentUser = JSON.parse(authData);
    console.log('Usuario parseado de auth:', currentUser);
  } else if (userData && userData !== 'true' && userData !== 'false') {
    currentUser = JSON.parse(userData);
    console.log('Usuario parseado de user:', currentUser);
  }
} catch (error) {
  console.log('Error parseando datos:', error);
}

// 2. Verificar si gustavo existe en la lista de usuarios
console.log('\n2. VERIFICANDO LISTA DE USUARIOS:');
try {
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  console.log('Total usuarios:', allUsers.length);
  
  const gustavo = allUsers.find(u => u.username === 'gustavo');
  if (gustavo) {
    console.log('✅ Gustavo encontrado en lista:', gustavo);
  } else {
    console.log('❌ Gustavo NO encontrado en lista de usuarios');
    console.log('Usuarios disponibles:', allUsers.map(u => u.username));
  }
} catch (error) {
  console.log('Error verificando usuarios:', error);
}

// 3. Verificar badge en el DOM
console.log('\n3. VERIFICANDO BADGE EN EL DOM:');
const header = document.querySelector('header');
if (header) {
  const badge = header.querySelector('[data-testid="user-role-badge"]') ||
                Array.from(header.querySelectorAll('*')).find(el => 
                  el.textContent?.toLowerCase().includes('estudiante') ||
                  el.textContent?.toLowerCase().includes('student')
                );
  
  if (badge) {
    console.log('✅ Badge encontrado:', {
      text: badge.textContent,
      visible: getComputedStyle(badge).display !== 'none'
    });
  } else {
    console.log('❌ Badge NO encontrado en el header');
  }
} else {
  console.log('❌ Header NO encontrado');
}

// 4. Verificar errores en la consola
console.log('\n4. RECOMENDACIONES:');
if (!currentUser) {
  console.log('❌ PROBLEMA: No hay usuario autenticado correctamente');
  console.log('💡 SOLUCIÓN: Necesitas loguearte correctamente o crear el usuario gustavo');
} else if (!currentUser.role || (currentUser.role !== 'student' && currentUser.role !== 'estudiante')) {
  console.log('❌ PROBLEMA: Usuario no tiene rol de estudiante');
  console.log('💡 SOLUCIÓN: Verificar que el rol sea "student" o "estudiante"');
} else {
  console.log('✅ Autenticación parece correcta');
}

console.log('\n===============================================================');
console.log('🏁 DIAGNÓSTICO COMPLETADO');
