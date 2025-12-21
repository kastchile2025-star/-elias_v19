// Diagnóstico específico para el problema de Felipe
// Ejecutar este script en la consola del navegador

console.log('🔍 DIAGNÓSTICO ESPECÍFICO - FELIPE NO VE CONVERSACIONES');
console.log('═══════════════════════════════════════════════════════');

function diagnosticarProblemaFelipe() {
  try {
    // 1. Verificar usuarios en localStorage
    console.log('\n📋 Paso 1: Verificando usuarios...');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    console.log(`Total usuarios encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ NO HAY USUARIOS - Ejecutando configuración automática...');
      configurarSistemaCompleto();
      return;
    }
    
    // 2. Buscar a Felipe
    const felipe = users.find(u => u.username === 'felipe');
    if (!felipe) {
      console.log('❌ Felipe no encontrado - Creando usuario...');
      crearFelipe();
      return;
    }
    
    console.log('✅ Felipe encontrado:', felipe);
    console.log('   - Curso activo:', felipe.activeCourses);
    console.log('   - Profesores asignados:', felipe.assignedTeachers);
    
    // 3. Verificar profesores de Felipe
    console.log('\n📋 Paso 2: Verificando profesores de Felipe...');
    if (!felipe.assignedTeachers) {
      console.log('❌ Felipe no tiene profesores asignados - Corrigiendo...');
      felipe.assignedTeachers = {
        'Matemáticas': 'jorge',
        'Ciencias Naturales': 'carlos',
        'Lenguaje y Comunicación': 'jorge',
        'Historia, Geografía y Ciencias Sociales': 'carlos'
      };
      
      const updatedUsers = users.map(u => u.username === 'felipe' ? felipe : u);
      localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
      console.log('✅ Profesores asignados a Felipe');
    }
    
    Object.entries(felipe.assignedTeachers).forEach(([materia, profesor]) => {
      const profesorData = users.find(u => u.username === profesor);
      if (profesorData) {
        console.log(`   ✅ ${materia}: ${profesorData.displayName}`);
      } else {
        console.log(`   ❌ ${materia}: Profesor ${profesor} no encontrado`);
      }
    });
    
    // 4. Verificar mensajes
    console.log('\n📋 Paso 3: Verificando mensajes...');
    const messages = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
    console.log(`Total mensajes encontrados: ${messages.length}`);
    
    if (messages.length === 0) {
      console.log('❌ NO HAY MENSAJES - Creando mensajes de prueba...');
      crearMensajesPrueba();
      return;
    }
    
    // 5. Buscar mensajes relacionados con Felipe
    const felipeMessages = messages.filter(msg => 
      (msg.from === 'felipe' || msg.to === 'felipe') ||
      (msg.senderId === 'felipe' || msg.recipientId === 'felipe')
    );
    
    console.log(`Mensajes de Felipe encontrados: ${felipeMessages.length}`);
    felipeMessages.forEach(msg => {
      const from = msg.from || msg.senderId;
      const to = msg.to || msg.recipientId;
      console.log(`   ${from} → ${to}: "${msg.content.substring(0, 30)}..."`);
    });
    
    // 6. Verificar sesión actual
    console.log('\n📋 Paso 4: Verificando sesión actual...');
    const currentAuth = localStorage.getItem('smart-student-auth');
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
    
    console.log('Autenticado:', currentAuth === 'true');
    console.log('Usuario actual:', currentUser);
    
    if (currentUser && currentUser.username === 'felipe') {
      console.log('✅ Felipe está logueado correctamente');
      
      // 7. Simular la lógica del chat para Felipe
      console.log('\n📋 Paso 5: Simulando lógica del chat...');
      const teacherUsernames = Array.from(new Set(Object.values(felipe.assignedTeachers)));
      console.log('Profesores únicos:', teacherUsernames);
      
      teacherUsernames.forEach(teacherUsername => {
        const teacherData = users.find(u => u.username === teacherUsername);
        if (teacherData) {
          const subjects = Object.entries(felipe.assignedTeachers)
            .filter(([_, username]) => username === teacherUsername)
            .map(([subject, _]) => subject);
          
          console.log(`   Profesor: ${teacherData.displayName}`);
          console.log(`   Materias: ${subjects.join(', ')}`);
          
          // Buscar conversación
          const conversationMessages = messages.filter(msg => {
            const msgSender = msg.senderId || msg.from;
            const msgRecipient = msg.recipientId || msg.to;
            return (msgSender === 'felipe' && msgRecipient === teacherUsername) ||
                   (msgSender === teacherUsername && msgRecipient === 'felipe');
          });
          
          console.log(`   Mensajes en conversación: ${conversationMessages.length}`);
          
          if (conversationMessages.length === 0) {
            console.log('   ⚠️ Sin mensajes - Creando mensaje de prueba...');
            const nuevoMensaje = {
              id: `test_${Date.now()}_${teacherUsername}`,
              from: teacherUsername,
              to: 'felipe',
              content: `Hola Felipe, soy tu profesor ${teacherData.displayName}. ¿Cómo estás?`,
              timestamp: new Date().toISOString(),
              read: false
            };
            messages.push(nuevoMensaje);
            console.log(`   ✅ Mensaje creado de ${teacherData.displayName} para Felipe`);
          }
        }
      });
      
      // Guardar mensajes actualizados
      localStorage.setItem('smart-student-chat-messages', JSON.stringify(messages));
      
    } else {
      console.log('❌ Felipe NO está logueado');
      console.log('💡 Ejecuta: loginRapidoFelipe()');
    }
    
    // 8. Resumen final
    console.log('\n🎉 DIAGNÓSTICO COMPLETADO');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Usuarios:', users.length > 0 ? 'OK' : 'ERROR');
    console.log('✅ Felipe existe:', felipe ? 'OK' : 'ERROR');
    console.log('✅ Profesores asignados:', felipe && felipe.assignedTeachers ? 'OK' : 'ERROR');
    console.log('✅ Mensajes:', messages.length > 0 ? 'OK' : 'ERROR');
    console.log('✅ Sesión Felipe:', currentUser && currentUser.username === 'felipe' ? 'OK' : 'ERROR');
    
    console.log('\n📝 ACCIONES RECOMENDADAS:');
    console.log('1. Si Felipe no está logueado: loginRapidoFelipe()');
    console.log('2. Recargar la página después del diagnóstico');
    console.log('3. Ir al Chat y verificar conversaciones');
    
    return {
      usuarios: users.length,
      felipe: !!felipe,
      profesoresAsignados: felipe && felipe.assignedTeachers ? Object.keys(felipe.assignedTeachers).length : 0,
      mensajes: messages.length,
      mensajesFelipe: felipeMessages.length,
      sesionActiva: currentUser && currentUser.username === 'felipe'
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

function configurarSistemaCompleto() {
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

  // Crear usuarios
  const testUsers = [
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
    // Profesores creados con función automática
    createTeacher('jorge', 'Jorge Profesor', 'jorge@teacher.com', [
      { subject: 'Matemáticas', courses: ['4to Básico', '5to Básico'] },
      { subject: 'Lenguaje y Comunicación', courses: ['4to Básico', '5to Básico'] }
    ]),
    createTeacher('carlos', 'Carlos Profesor', 'carlos@teacher.com', [
      { subject: 'Ciencias Naturales', courses: ['4to Básico', '5to Básico'] },
      { subject: 'Historia, Geografía y Ciencias Sociales', courses: ['4to Básico', '5to Básico'] }
    ])
  ];
  
  localStorage.setItem('smart-student-users', JSON.stringify(testUsers));
  console.log('✅ Usuarios creados');
  
  crearMensajesPrueba();
}

function crearMensajesPrueba() {
  const mensajes = [
    {
      id: 'msg1',
      from: 'jorge',
      to: 'felipe',
      content: 'Hola Felipe, ¿cómo van tus ejercicios de matemáticas?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'msg2',
      from: 'carlos',
      to: 'felipe',
      content: 'Felipe, recuerda traer tu libro de ciencias mañana.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'msg3',
      from: 'felipe',
      to: 'jorge',
      content: 'Profesor Jorge, tengo dudas con las fracciones.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true
    }
  ];
  
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(mensajes));
  console.log('✅ Mensajes de prueba creados');
}

function loginRapidoFelipe() {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const felipe = users.find(u => u.username === 'felipe');
  
  if (!felipe) {
    console.log('❌ Felipe no encontrado');
    return;
  }
  
  localStorage.setItem('smart-student-auth', 'true');
  localStorage.setItem('smart-student-user', JSON.stringify({
    username: felipe.username,
    role: felipe.role,
    displayName: felipe.displayName,
    activeCourses: felipe.activeCourses,
    email: felipe.email
  }));
  
  console.log('✅ Felipe logueado correctamente');
  console.log('🔄 Recarga la página para ver los cambios');
}

// Exportar funciones
window.diagnosticarProblemaFelipe = diagnosticarProblemaFelipe;
window.loginRapidoFelipe = loginRapidoFelipe;
window.configurarSistemaCompleto = configurarSistemaCompleto;

// Ejecutar diagnóstico automáticamente
console.log('🚀 Iniciando diagnóstico automático...');
diagnosticarProblemaFelipe();
