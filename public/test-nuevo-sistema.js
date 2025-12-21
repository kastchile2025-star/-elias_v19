// Script de prueba completa para los nuevos cambios
// Ejecutar en la consola del navegador después de hacer login como admin

console.log('🧪 PRUEBA COMPLETA DE NUEVO SISTEMA DE PROFESORES');
console.log('═══════════════════════════════════════════════════');

function pruebaCompleta() {
  console.log('\n1️⃣ VERIFICANDO ESTADO INICIAL...\n');
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const profesores = users.filter(u => u.role === 'teacher');
  const estudiantes = users.filter(u => u.role === 'student');
  
  console.log(`📊 Total usuarios: ${users.length}`);
  console.log(`👨‍🏫 Profesores: ${profesores.length}`);
  console.log(`👨‍🎓 Estudiantes: ${estudiantes.length}`);
  
  // Verificar que los profesores tienen asignaturas
  console.log('\n📚 VERIFICANDO ASIGNATURAS DE PROFESORES:\n');
  profesores.forEach(profesor => {
    console.log(`${profesor.displayName}:`);
    console.log(`   Cursos: ${profesor.activeCourses.join(', ')}`);
    console.log(`   Materias: ${profesor.teachingSubjects ? profesor.teachingSubjects.join(', ') : '❌ Sin asignar'}`);
    
    const estudiantesAsignados = estudiantes.filter(e => 
      e.assignedTeacher === profesor.username ||
      (e.assignedTeachers && Object.values(e.assignedTeachers).includes(profesor.username))
    );
    
    console.log(`   Estudiantes: ${estudiantesAsignados.length}`);
    if (estudiantesAsignados.length === 0) {
      console.log(`   ⚠️  Sin estudiantes asignados`);
    } else {
      estudiantesAsignados.forEach(e => {
        console.log(`     • ${e.displayName} (${e.activeCourses[0] || 'Sin curso'})`);
      });
    }
    console.log('');
  });
  
  console.log('\n2️⃣ CREANDO PROFESOR DE PRUEBA...\n');
  
  // Crear nuevo profesor con todas las validaciones
  const nuevoProfesor = {
    username: 'test_profesor',
    displayName: 'Profesor de Prueba',
    email: 'test@teacher.com',
    role: 'teacher',
    activeCourses: ['6to Básico'],
    teachingSubjects: ['Matemáticas', 'Ciencias Naturales'],
    password: '1234',
    teachingAssignments: [
      {
        teacherUsername: 'test_profesor',
        teacherName: 'Profesor de Prueba',
        subject: 'Matemáticas',
        courses: ['6to Básico']
      },
      {
        teacherUsername: 'test_profesor',
        teacherName: 'Profesor de Prueba',
        subject: 'Ciencias Naturales',
        courses: ['6to Básico']
      }
    ]
  };
  
  // Crear estudiantes de prueba
  const estudiantesPrueba = [
    {
      username: 'test_estudiante1',
      displayName: 'Ana Test',
      email: 'ana@student.com',
      role: 'student',
      activeCourses: ['6to Básico'],
      password: '1234',
      assignedTeacher: 'test_profesor',
      assignedTeachers: {
        'Matemáticas': 'test_profesor',
        'Ciencias Naturales': 'test_profesor',
        'Lenguaje y Comunicación': 'jorge',
        'Historia, Geografía y Ciencias Sociales': 'carlos'
      }
    },
    {
      username: 'test_estudiante2',
      displayName: 'Luis Test',
      email: 'luis@student.com',
      role: 'student',
      activeCourses: ['6to Básico'],
      password: '1234',
      assignedTeacher: 'test_profesor',
      assignedTeachers: {
        'Matemáticas': 'test_profesor',
        'Ciencias Naturales': 'test_profesor',
        'Lenguaje y Comunicación': 'jorge',
        'Historia, Geografía y Ciencias Sociales': 'carlos'
      }
    },
    {
      username: 'test_estudiante3',
      displayName: 'Sofia Test',
      email: 'sofia@student.com',
      role: 'student',
      activeCourses: ['6to Básico'],
      password: '1234',
      assignedTeacher: 'test_profesor',
      assignedTeachers: {
        'Matemáticas': 'test_profesor',
        'Ciencias Naturales': 'test_profesor',
        'Lenguaje y Comunicación': 'jorge',
        'Historia, Geografía y Ciencias Sociales': 'carlos'
      }
    }
  ];
  
  // Agregar nuevos usuarios
  const todosLosUsuarios = [...users, nuevoProfesor, ...estudiantesPrueba];
  localStorage.setItem('smart-student-users', JSON.stringify(todosLosUsuarios));
  
  console.log('✅ Profesor de prueba creado:');
  console.log(`   ${nuevoProfesor.displayName} (@${nuevoProfesor.username})`);
  console.log(`   Cursos: ${nuevoProfesor.activeCourses.join(', ')}`);
  console.log(`   Materias: ${nuevoProfesor.teachingSubjects.join(', ')}`);
  console.log(`   Estudiantes asignados: ${estudiantesPrueba.length}`);
  
  estudiantesPrueba.forEach(e => {
    console.log(`     • ${e.displayName}`);
  });
  
  console.log('\n3️⃣ CREANDO MENSAJES DE CHAT...\n');
  
  const messages = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
  const nuevosmensajes = [];
  
  estudiantesPrueba.forEach((estudiante, index) => {
    // Mensaje del profesor al estudiante
    nuevosmensajes.push({
      id: `test_msg_${Date.now()}_${index}_1`,
      senderId: 'test_profesor',
      recipientId: estudiante.username,
      content: `¡Hola ${estudiante.displayName}! Soy tu nuevo profesor de Matemáticas y Ciencias. ¿Tienes alguna pregunta sobre las clases?`,
      timestamp: new Date(Date.now() - (index * 120000)).toISOString(),
      read: false,
      type: 'text'
    });
    
    // Respuesta del estudiante
    nuevosmensajes.push({
      id: `test_msg_${Date.now()}_${index}_2`,
      senderId: estudiante.username,
      recipientId: 'test_profesor',
      content: `¡Hola profesor! Muchas gracias por contactarme. Tengo muchas ganas de aprender matemáticas y ciencias.`,
      timestamp: new Date(Date.now() - (index * 120000) + 60000).toISOString(),
      read: false,
      type: 'text'
    });
  });
  
  const todosLosMensajes = [...messages, ...nuevosmensajes];
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(todosLosMensajes));
  
  console.log(`✅ Creados ${nuevosmensajes.length} mensajes de prueba`);
  
  console.log('\n4️⃣ PROBANDO LOGIN DEL NUEVO PROFESOR...\n');
  
  // Simular login del nuevo profesor
  localStorage.setItem('smart-student-auth', 'true');
  localStorage.setItem('smart-student-user', JSON.stringify({
    username: 'test_profesor',
    role: 'teacher',
    displayName: 'Profesor de Prueba',
    activeCourses: ['6to Básico'],
    email: 'test@teacher.com'
  }));
  
  console.log('✅ Login simulado para Profesor de Prueba');
  
  console.log('\n5️⃣ VERIFICANDO VISTA DE CHAT DEL PROFESOR...\n');
  
  // Simular la lógica del chat para profesor
  const currentUser = JSON.parse(localStorage.getItem('smart-student-user'));
  const allUsers = JSON.parse(localStorage.getItem('smart-student-users'));
  const chatMessages = JSON.parse(localStorage.getItem('smart-student-chat-messages'));
  
  if (currentUser.role === 'teacher') {
    const estudiantesDelProfesor = allUsers.filter(user => 
      user.role === 'student' && 
      (user.assignedTeacher === currentUser.username ||
       (user.assignedTeachers && Object.values(user.assignedTeachers).includes(currentUser.username)))
    );
    
    console.log(`📊 El profesor ve ${estudiantesDelProfesor.length} estudiantes:`);
    
    const estudiantesPorCurso = {};
    estudiantesDelProfesor.forEach(estudiante => {
      const curso = estudiante.activeCourses[0] || 'Sin Curso';
      if (!estudiantesPorCurso[curso]) {
        estudiantesPorCurso[curso] = [];
      }
      
      // Buscar materias que este profesor enseña a este estudiante
      const materias = estudiante.assignedTeachers 
        ? Object.keys(estudiante.assignedTeachers).filter(materia => 
            estudiante.assignedTeachers[materia] === currentUser.username
          )
        : [];
      
      estudiantesPorCurso[curso].push({
        ...estudiante,
        materias: materias
      });
    });
    
    Object.entries(estudiantesPorCurso).forEach(([curso, estudiantes]) => {
      console.log(`\n📚 ${curso}:`);
      estudiantes.forEach(estudiante => {
        console.log(`   • ${estudiante.displayName} - Materias: ${estudiante.materias.join(', ')}`);
        
        // Verificar mensajes
        const mensajesConEstudiante = chatMessages.filter(msg => 
          (msg.senderId === currentUser.username && msg.recipientId === estudiante.username) ||
          (msg.senderId === estudiante.username && msg.recipientId === currentUser.username)
        );
        
        console.log(`     📨 ${mensajesConEstudiante.length} mensajes en conversación`);
      });
    });
  }
  
  console.log('\n🎉 PRUEBA COMPLETADA');
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ Profesor creado con asignaturas');
  console.log('✅ Estudiantes asignados al profesor');
  console.log('✅ Mensajes de chat creados');
  console.log('✅ Vista de chat del profesor verificada');
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('1. Ve a la página de Chat');
  console.log('2. Verifica que el profesor ve sus 3 estudiantes');
  console.log('3. Verifica que puede chatear con ellos');
  console.log('4. Prueba crear un nuevo profesor desde Gestión de Usuarios');
  console.log('5. Verifica que requiere asignar materias');
  
  return {
    profesorCreado: true,
    estudiantesAsignados: estudiantesPrueba.length,
    mensajesCreados: nuevosmensajes.length,
    loginSimulado: true
  };
}

function limpiarPrueba() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const messages = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
  
  // Remover usuarios de prueba
  const usuariosLimpios = users.filter(u => 
    !u.username.startsWith('test_')
  );
  
  // Remover mensajes de prueba
  const mensajesLimpios = messages.filter(m => 
    !m.id.startsWith('test_msg_')
  );
  
  localStorage.setItem('smart-student-users', JSON.stringify(usuariosLimpios));
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(mensajesLimpios));
  
  console.log('🧹 Datos de prueba limpiados');
}

function loginComoAdmin() {
  localStorage.setItem('smart-student-auth', 'true');
  localStorage.setItem('smart-student-user', JSON.stringify({
    username: 'admin',
    role: 'admin',
    displayName: 'Administrador del Sistema',
    activeCourses: [],
    email: 'admin@smartstudent.com'
  }));
  console.log('✅ Login como admin realizado');
}

function loginComoProfesorPrueba() {
  localStorage.setItem('smart-student-auth', 'true');
  localStorage.setItem('smart-student-user', JSON.stringify({
    username: 'test_profesor',
    role: 'teacher',
    displayName: 'Profesor de Prueba',
    activeCourses: ['6to Básico'],
    email: 'test@teacher.com'
  }));
  console.log('✅ Login como profesor de prueba realizado');
}

// Exportar funciones
window.pruebaCompleta = pruebaCompleta;
window.limpiarPrueba = limpiarPrueba;
window.loginComoAdmin = loginComoAdmin;
window.loginComoProfesorPrueba = loginComoProfesorPrueba;

console.log('\n🚀 FUNCIONES DISPONIBLES:');
console.log('   • pruebaCompleta() - Ejecutar prueba completa');
console.log('   • limpiarPrueba() - Limpiar datos de prueba');
console.log('   • loginComoAdmin() - Login como administrador');
console.log('   • loginComoProfesorPrueba() - Login como profesor de prueba');
console.log('\n💡 Ejecuta: pruebaCompleta()');

console.log('\n📋 Para probar la creación de profesores:');
console.log('1. Ejecuta loginComoAdmin()');
console.log('2. Ve a Gestión de Usuarios');
console.log('3. Crea un nuevo profesor');
console.log('4. Verifica que requiere seleccionar asignaturas');
console.log('5. Asigna estudiantes al profesor');
console.log('6. Ve al Chat y verifica que ve sus estudiantes');
