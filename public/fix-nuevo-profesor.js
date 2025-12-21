// Script para solucionar problemas de profesores recién creados
// Ejecutar en la consola del navegador

console.log('🔧 SOLUCIONANDO PROBLEMAS DE NUEVO PROFESOR');
console.log('═══════════════════════════════════════════');

function solucionarNuevoProfesor() {
  try {
    // 1. Obtener usuarios
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    console.log(`📋 Total usuarios encontrados: ${users.length}`);
    
    // 2. Encontrar el profesor más reciente sin estudiantes asignados
    const profesoresSinEstudiantes = users
      .filter(u => u.role === 'teacher')
      .map(teacher => {
        const estudiantesAsignados = users.filter(u => 
          u.role === 'student' && 
          (u.assignedTeacher === teacher.username || 
           (u.assignedTeachers && Object.values(u.assignedTeachers).includes(teacher.username)))
        );
        return {
          ...teacher,
          estudiantesAsignados: estudiantesAsignados.length
        };
      })
      .filter(teacher => teacher.estudiantesAsignados === 0);
    
    if (profesoresSinEstudiantes.length === 0) {
      console.log('✅ Todos los profesores tienen estudiantes asignados');
      return;
    }
    
    console.log(`⚠️  Profesores sin estudiantes: ${profesoresSinEstudiantes.length}`);
    profesoresSinEstudiantes.forEach(p => {
      console.log(`   • ${p.displayName} (@${p.username}) - Cursos: ${p.activeCourses.join(', ')}`);
    });
    
    // 3. Encontrar estudiantes sin profesor o disponibles para reasignar
    const estudiantesSinProfesor = users.filter(u => 
      u.role === 'student' && 
      (!u.assignedTeacher && (!u.assignedTeachers || Object.keys(u.assignedTeachers).length === 0))
    );
    
    console.log(`\n📚 Estudiantes sin profesor: ${estudiantesSinProfesor.length}`);
    estudiantesSinProfesor.forEach(s => {
      console.log(`   • ${s.displayName} (@${s.username}) - Curso: ${s.activeCourses[0] || 'Sin curso'}`);
    });
    
    // 4. Auto-asignar estudiantes al nuevo profesor
    if (profesoresSinEstudiantes.length > 0 && estudiantesSinProfesor.length > 0) {
      const nuevoProfesor = profesoresSinEstudiantes[0];
      console.log(`\n🔧 Asignando estudiantes a ${nuevoProfesor.displayName}...\n`);
      
      const updatedUsers = users.map(user => {
        // Actualizar profesor con materias si no las tiene
        if (user.username === nuevoProfesor.username) {
          const materiasPorDefecto = [
            'Matemáticas',
            'Lenguaje y Comunicación', 
            'Ciencias Naturales',
            'Historia, Geografía y Ciencias Sociales'
          ];
          
          return {
            ...user,
            teachingSubjects: user.teachingSubjects || materiasPorDefecto,
            teachingAssignments: user.teachingAssignments || materiasPorDefecto.map(materia => ({
              teacherUsername: user.username,
              teacherName: user.displayName,
              subject: materia,
              courses: user.activeCourses
            }))
          };
        }
        
        // Asignar estudiantes compatibles al profesor
        if (user.role === 'student' && 
            (!user.assignedTeacher && (!user.assignedTeachers || Object.keys(user.assignedTeachers).length === 0)) &&
            user.activeCourses.length > 0 &&
            nuevoProfesor.activeCourses.includes(user.activeCourses[0])) {
          
          const materias = [
            'Matemáticas',
            'Lenguaje y Comunicación',
            'Ciencias Naturales', 
            'Historia, Geografía y Ciencias Sociales'
          ];
          
          const nuevasAsignaciones = {};
          materias.forEach(materia => {
            nuevasAsignaciones[materia] = nuevoProfesor.username;
          });
          
          console.log(`   ✅ ${user.displayName} asignado a ${nuevoProfesor.displayName} en ${user.activeCourses[0]}`);
          
          return {
            ...user,
            assignedTeacher: nuevoProfesor.username,
            assignedTeachers: nuevasAsignaciones
          };
        }
        
        return user;
      });
      
      // Guardar cambios
      localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
      console.log('\n💾 Cambios guardados en localStorage');
      
      // 5. Crear mensajes de prueba
      crearMensajesPrueba(nuevoProfesor.username, updatedUsers);
      
    } else {
      console.log('\n⚠️  No hay coincidencias para auto-asignar');
      
      if (profesoresSinEstudiantes.length > 0) {
        const profesor = profesoresSinEstudiantes[0];
        console.log(`\n💡 SOLUCIÓN MANUAL para ${profesor.displayName}:`);
        console.log(`   1. Ir a Gestión de Usuarios`);
        console.log(`   2. Crear estudiantes para los cursos: ${profesor.activeCourses.join(', ')}`);
        console.log(`   3. O asignar estudiantes existentes usando: asignarEstudiante('${profesor.username}', 'estudiante_username', 'curso')`);
      }
    }
    
    // 6. Verificar resultado final
    console.log('\n📊 RESULTADO FINAL:');
    const updatedUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    updatedUsers.filter(u => u.role === 'teacher').forEach(teacher => {
      const estudiantesAsignados = updatedUsers.filter(u => 
        u.role === 'student' && 
        (u.assignedTeacher === teacher.username || 
         (u.assignedTeachers && Object.values(u.assignedTeachers).includes(teacher.username)))
      );
      
      console.log(`👨‍🏫 ${teacher.displayName}: ${estudiantesAsignados.length} estudiantes`);
      if (estudiantesAsignados.length > 0) {
        estudiantesAsignados.forEach(e => {
          console.log(`   • ${e.displayName} (${e.activeCourses[0] || 'Sin curso'})`);
        });
      }
    });
    
    console.log('\n🎉 Proceso completado');
    console.log('💡 Recarga la página y ve al Chat para verificar');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function crearMensajesPrueba(profesorUsername, users) {
  const profesor = users.find(u => u.username === profesorUsername);
  const estudiantesAsignados = users.filter(u => 
    u.role === 'student' && 
    (u.assignedTeacher === profesorUsername || 
     (u.assignedTeachers && Object.values(u.assignedTeachers).includes(profesorUsername)))
  );
  
  if (estudiantesAsignados.length === 0) return;
  
  const messages = JSON.parse(localStorage.getItem('smart-student-chat-messages') || '[]');
  const newMessages = [];
  
  estudiantesAsignados.forEach((estudiante, index) => {
    const msgId1 = `auto_${Date.now()}_${index}_1`;
    const msgId2 = `auto_${Date.now()}_${index}_2`;
    
    newMessages.push({
      id: msgId1,
      senderId: profesorUsername,
      recipientId: estudiante.username,
      content: `¡Hola ${estudiante.displayName}! Soy tu nuevo profesor ${profesor.displayName}. ¡Bienvenido a mis clases!`,
      timestamp: new Date(Date.now() - (index * 60000)).toISOString(),
      read: false,
      type: 'text'
    });
    
    newMessages.push({
      id: msgId2,
      senderId: estudiante.username,
      recipientId: profesorUsername,
      content: `¡Hola profesor ${profesor.displayName}! Muchas gracias, estoy emocionado de aprender con usted.`,
      timestamp: new Date(Date.now() - (index * 60000) + 30000).toISOString(),
      read: false,
      type: 'text'
    });
  });
  
  const updatedMessages = [...messages, ...newMessages];
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(updatedMessages));
  
  console.log(`📨 Creados ${newMessages.length} mensajes de prueba para ${profesor.displayName}`);
}

function asignarEstudiante(profesorUsername, estudianteUsername, curso) {
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  const updatedUsers = users.map(user => {
    if (user.username === estudianteUsername && user.role === 'student') {
      const materias = [
        'Matemáticas',
        'Lenguaje y Comunicación',
        'Ciencias Naturales',
        'Historia, Geografía y Ciencias Sociales'
      ];
      
      const asignaciones = {};
      materias.forEach(materia => {
        asignaciones[materia] = profesorUsername;
      });
      
      return {
        ...user,
        activeCourses: [curso],
        assignedTeacher: profesorUsername,
        assignedTeachers: asignaciones
      };
    }
    return user;
  });
  
  localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
  console.log(`✅ ${estudianteUsername} asignado a ${profesorUsername} en ${curso}`);
  
  // Crear mensaje de prueba
  crearMensajesPrueba(profesorUsername, updatedUsers);
}

// Exportar funciones
window.solucionarNuevoProfesor = solucionarNuevoProfesor;
window.asignarEstudiante = asignarEstudiante;

console.log('\n🚀 Funciones disponibles:');
console.log('   • solucionarNuevoProfesor() - Solución automática');
console.log('   • asignarEstudiante(profesorUsername, estudianteUsername, curso) - Asignación manual');
console.log('\n💡 Ejecuta: solucionarNuevoProfesor()');

// Auto-ejecutar
solucionarNuevoProfesor();
