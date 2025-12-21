// Script simple para solucionar el problema de Felipe
console.log('🔧 SOLUCIONANDO PROBLEMA DE FELIPE...');

// Función para crear profesores con asignaciones automáticas
function createTeacher(username, displayName, email, subjectAssignments) {
  const allCourses = [...new Set(subjectAssignments.flatMap(sa => sa.courses))];
  
  return {
    username: username,
    password: '1234',
    role: 'teacher',
    displayName: displayName,
    activeCourses: allCourses.sort(),
    email: email,
    teachingAssignments: subjectAssignments.map(sa => ({
      teacherUsername: username,
      teacherName: displayName,
      subject: sa.subject,
      courses: sa.courses
    }))
  };
}

// Crear datos mínimos necesarios
const users = [
  {
    username: 'felipe',
    password: '1234',
    role: 'student',
    displayName: 'Felipe Estudiante',
    activeCourses: ['4to Básico'],
    email: 'felipe@student.com',
    assignedTeachers: {
      'Matemáticas': 'jorge',
      'Ciencias Naturales': 'carlos',
      'Lenguaje y Comunicación': 'jorge',
      'Historia, Geografía y Ciencias Sociales': 'carlos'
    }
  },
  // Profesores creados con asignaciones automáticas
  createTeacher('jorge', 'Jorge Profesor', 'jorge@teacher.com', [
    { subject: 'Matemáticas', courses: ['4to Básico', '5to Básico'] },
    { subject: 'Lenguaje y Comunicación', courses: ['4to Básico', '5to Básico'] }
  ]),
  createTeacher('carlos', 'Carlos Profesor', 'carlos@teacher.com', [
    { subject: 'Ciencias Naturales', courses: ['4to Básico', '5to Básico'] },
    { subject: 'Historia, Geografía y Ciencias Sociales', courses: ['4to Básico', '5to Básico'] }
  ])
];

const messages = [
  {
    id: 'msg1',
    from: 'jorge',
    to: 'felipe',
    content: '¡Hola Felipe! ¿Cómo van tus ejercicios de matemáticas?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'msg2',
    from: 'carlos',
    to: 'felipe',
    content: 'Felipe, no olvides traer tu libro de ciencias mañana.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'msg3',
    from: 'jorge',
    to: 'felipe',
    content: 'Recuerda que mañana tenemos clase de lenguaje a primera hora.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false
  }
];

// Guardar datos
localStorage.setItem('smart-student-users', JSON.stringify(users));
localStorage.setItem('smart-student-chat-messages', JSON.stringify(messages));

// Login como Felipe
localStorage.setItem('smart-student-auth', 'true');
localStorage.setItem('smart-student-user', JSON.stringify({
  username: 'felipe',
  role: 'student',
  displayName: 'Felipe Estudiante',
  activeCourses: ['4to Básico'],
  email: 'felipe@student.com'
}));

console.log('✅ Datos configurados correctamente para Felipe');
console.log('✅ Felipe logueado automáticamente');
console.log('🔄 RECARGA LA PÁGINA para ver los cambios');

// Función de verificación
window.verificarDatos = function() {
  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const mensajes = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
  const sesion = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
  
  console.log('👥 Usuarios:', usuarios.length);
  console.log('💬 Mensajes:', mensajes.length);
  console.log('🔐 Sesión activa:', sesion?.displayName || 'Ninguna');
  
  if (sesion?.username === 'felipe') {
    const felipe = usuarios.find(u => u.username === 'felipe');
    console.log('📋 Profesores de Felipe:', felipe?.assignedTeachers);
    
    const mensajesFelipe = mensajes.filter(m => m.to === 'felipe' || m.from === 'felipe');
    console.log('💬 Mensajes de Felipe:', mensajesFelipe.length);
    mensajesFelipe.forEach(m => {
      console.log(`   ${m.from} → ${m.to}: ${m.content.substring(0, 30)}...`);
    });
  }
};

console.log('💡 Ejecuta verificarDatos() para ver el estado actual');
console.log('💡 Ve al Chat después de recargar la página');
