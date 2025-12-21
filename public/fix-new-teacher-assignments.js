#!/usr/bin/env node

/**
 * Script para verificar y corregir asignaciones de estudiantes a nuevos profesores
 * Asegura que los estudiantes asignados a un profesor aparezcan en su vista de chat
 * 
 * Uso: Abrir en el navegador y ejecutar en la consola
 */

console.log('🔧 Iniciando diagnóstico y corrección de asignaciones profesor-estudiante...\n');

// Función para obtener usuarios del localStorage
function getUsers() {
  const usersData = localStorage.getItem('smart-student-users');
  if (!usersData) {
    console.log('❌ No se encontraron datos de usuarios en localStorage');
    return [];
  }
  return JSON.parse(usersData);
}

// Función para guardar usuarios en localStorage
function saveUsers(users) {
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  console.log('💾 Usuarios guardados en localStorage');
}

// Función para obtener datos de chat del localStorage
function getChatMessages() {
  const chatData = localStorage.getItem('smart-student-chat-messages');
  if (!chatData) {
    console.log('❌ No se encontraron datos de chat en localStorage');
    return [];
  }
  return JSON.parse(chatData);
}

// Función para guardar mensajes de chat
function saveChatMessages(messages) {
  localStorage.setItem('smart-student-chat-messages', JSON.stringify(messages));
  console.log('💾 Mensajes de chat guardados en localStorage');
}

// Función para crear mensajes de prueba entre profesor y estudiante
function createTestMessages(teacherUsername, studentUsername, studentCourse) {
  const messages = getChatMessages();
  const messageId1 = `msg_${Date.now()}_1`;
  const messageId2 = `msg_${Date.now()}_2`;
  
  const testMessages = [
    {
      id: messageId1,
      senderId: studentUsername,
      recipientId: teacherUsername,
      content: `Hola profesor, soy estudiante de ${studentCourse}. ¿Podemos conversar sobre las clases?`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    },
    {
      id: messageId2,
      senderId: teacherUsername,
      recipientId: studentUsername,
      content: `¡Hola! Por supuesto, estoy aquí para ayudarte con ${studentCourse}. ¿En qué te puedo ayudar?`,
      timestamp: new Date(Date.now() + 60000).toISOString(),
      read: false,
      type: 'text'
    }
  ];
  
  const updatedMessages = [...messages, ...testMessages];
  saveChatMessages(updatedMessages);
  
  console.log(`📨 Creados 2 mensajes de prueba entre ${teacherUsername} y ${studentUsername}`);
  return testMessages;
}

// Función para asignar estudiante a profesor con todas las materias básicas
function assignStudentToTeacher(studentUsername, teacherUsername, course) {
  const users = getUsers();
  
  // Materias básicas por nivel
  const basicSubjects = {
    'básico': [
      'Matemáticas',
      'Lenguaje y Comunicación',
      'Ciencias Naturales',
      'Historia, Geografía y Ciencias Sociales'
    ],
    'medio': [
      'Matemáticas',
      'Lenguaje y Comunicación',
      'Biología',
      'Física',
      'Química',
      'Historia, Geografía y Ciencias Sociales',
      'Inglés'
    ]
  };
  
  const isBasicLevel = course.includes('Básico');
  const subjects = isBasicLevel ? basicSubjects.básico : basicSubjects.medio;
  
  let studentUpdated = false;
  let teacherUpdated = false;
  
  const updatedUsers = users.map(user => {
    if (user.username === studentUsername && user.role === 'student') {
      // Actualizar estudiante con asignaciones por materia
      const updatedStudent = {
        ...user,
        activeCourses: [course],
        assignedTeacher: teacherUsername, // Mantenemos por compatibilidad
        assignedTeachers: {}
      };
      
      // Asignar el profesor a todas las materias básicas
      subjects.forEach(subject => {
        updatedStudent.assignedTeachers[subject] = teacherUsername;
      });
      
      studentUpdated = true;
      console.log(`✅ Estudiante ${studentUsername} asignado a ${teacherUsername} en ${course}`);
      console.log(`   Materias: ${subjects.join(', ')}`);
      
      return updatedStudent;
    }
    
    if (user.username === teacherUsername && user.role === 'teacher') {
      // Actualizar profesor con asignaciones de enseñanza
      const updatedTeacher = {
        ...user,
        teachingAssignments: user.teachingAssignments || []
      };
      
      // Asegurar que el profesor tiene el curso en su lista
      if (!updatedTeacher.activeCourses.includes(course)) {
        updatedTeacher.activeCourses.push(course);
      }
      
      // Agregar asignaturas si no las tiene
      if (!updatedTeacher.teachingSubjects) {
        updatedTeacher.teachingSubjects = subjects;
      } else {
        // Combinar materias existentes con las nuevas
        const combinedSubjects = [...new Set([...updatedTeacher.teachingSubjects, ...subjects])];
        updatedTeacher.teachingSubjects = combinedSubjects;
      }
      
      // Crear/actualizar asignaciones de enseñanza
      subjects.forEach(subject => {
        const existingAssignment = updatedTeacher.teachingAssignments.find(
          a => a.subject === subject
        );
        
        if (existingAssignment) {
          // Agregar curso si no está
          if (!existingAssignment.courses.includes(course)) {
            existingAssignment.courses.push(course);
          }
        } else {
          // Crear nueva asignación
          updatedTeacher.teachingAssignments.push({
            teacherUsername: teacherUsername,
            teacherName: user.displayName,
            subject: subject,
            courses: [course]
          });
        }
      });
      
      teacherUpdated = true;
      console.log(`✅ Profesor ${teacherUsername} actualizado para enseñar en ${course}`);
      console.log(`   Materias: ${updatedTeacher.teachingSubjects.join(', ')}`);
      
      return updatedTeacher;
    }
    
    return user;
  });
  
  if (studentUpdated && teacherUpdated) {
    saveUsers(updatedUsers);
    
    // Crear mensajes de prueba
    createTestMessages(teacherUsername, studentUsername, course);
    
    return { success: true, updatedUsers };
  } else {
    console.log(`❌ Error: No se pudo actualizar estudiante o profesor`);
    return { success: false, updatedUsers: users };
  }
}

// Función para diagnosticar asignaciones existentes
function diagnoseAssignments() {
  const users = getUsers();
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  
  console.log('📊 DIAGNÓSTICO DE ASIGNACIONES ACTUALES\n');
  
  teachers.forEach(teacher => {
    console.log(`👨‍🏫 ${teacher.displayName} (@${teacher.username})`);
    console.log(`   Cursos: ${teacher.activeCourses.join(', ')}`);
    console.log(`   Materias: ${teacher.teachingSubjects ? teacher.teachingSubjects.join(', ') : 'Sin asignar'}`);
    
    const assignedStudents = students.filter(s => 
      s.assignedTeacher === teacher.username || 
      (s.assignedTeachers && Object.values(s.assignedTeachers).includes(teacher.username))
    );
    
    if (assignedStudents.length > 0) {
      console.log('   Estudiantes asignados:');
      assignedStudents.forEach(student => {
        const subjects = student.assignedTeachers 
          ? Object.keys(student.assignedTeachers).filter(subject => 
              student.assignedTeachers[subject] === teacher.username
            )
          : [];
        console.log(`     • ${student.displayName} (${student.activeCourses[0] || 'Sin curso'}) - ${subjects.join(', ')}`);
      });
    } else {
      console.log('   ⚠️  Sin estudiantes asignados');
    }
    console.log('');
  });
  
  console.log('👨‍🎓 ESTUDIANTES SIN PROFESOR ASIGNADO:');
  const unassignedStudents = students.filter(s => 
    !s.assignedTeacher && (!s.assignedTeachers || Object.keys(s.assignedTeachers).length === 0)
  );
  
  if (unassignedStudents.length > 0) {
    unassignedStudents.forEach(student => {
      console.log(`   • ${student.displayName} (${student.activeCourses[0] || 'Sin curso'})`);
    });
  } else {
    console.log('   ✅ Todos los estudiantes tienen profesor asignado');
  }
  console.log('');
}

// Función para crear un nuevo profesor con estudiantes
function createTeacherWithStudents(teacherData, studentsToAssign = []) {
  const users = getUsers();
  
  // Verificar si el profesor ya existe
  const existingTeacher = users.find(u => u.username === teacherData.username);
  if (existingTeacher) {
    console.log(`⚠️  El profesor ${teacherData.username} ya existe. Actualizando...`);
  }
  
  // Materias básicas por defecto
  const defaultSubjects = [
    'Matemáticas',
    'Lenguaje y Comunicación',
    'Ciencias Naturales',
    'Historia, Geografía y Ciencias Sociales'
  ];
  
  // Crear/actualizar profesor
  const newTeacher = {
    username: teacherData.username,
    displayName: teacherData.displayName,
    email: teacherData.email || `${teacherData.username}@teacher.com`,
    role: 'teacher',
    activeCourses: teacherData.activeCourses || [],
    teachingSubjects: teacherData.teachingSubjects || defaultSubjects,
    password: teacherData.password || '1234',
    teachingAssignments: []
  };
  
  // Crear asignaciones de enseñanza
  newTeacher.teachingSubjects.forEach(subject => {
    newTeacher.teachingAssignments.push({
      teacherUsername: newTeacher.username,
      teacherName: newTeacher.displayName,
      subject: subject,
      courses: newTeacher.activeCourses
    });
  });
  
  let updatedUsers;
  if (existingTeacher) {
    updatedUsers = users.map(u => u.username === teacherData.username ? newTeacher : u);
  } else {
    updatedUsers = [...users, newTeacher];
  }
  
  saveUsers(updatedUsers);
  console.log(`✅ Profesor ${newTeacher.displayName} creado/actualizado exitosamente`);
  console.log(`   Cursos: ${newTeacher.activeCourses.join(', ')}`);
  console.log(`   Materias: ${newTeacher.teachingSubjects.join(', ')}`);
  
  // Asignar estudiantes si se proporcionaron
  studentsToAssign.forEach(studentAssignment => {
    assignStudentToTeacher(
      studentAssignment.studentUsername, 
      newTeacher.username, 
      studentAssignment.course
    );
  });
  
  return newTeacher;
}

// Función principal de prueba
function runTests() {
  console.log('🧪 EJECUTANDO PRUEBAS DE ASIGNACIÓN\n');
  
  // Diagnóstico inicial
  diagnoseAssignments();
  
  // Ejemplo: Crear un nuevo profesor y asignar estudiantes
  console.log('📝 Creando nuevo profesor de ejemplo...\n');
  
  const newTeacher = createTeacherWithStudents({
    username: 'profesor_nuevo',
    displayName: 'Profesor Nuevo',
    email: 'nuevo@teacher.com',
    activeCourses: ['3ro Básico'],
    teachingSubjects: ['Matemáticas', 'Ciencias Naturales'],
    password: '1234'
  });
  
  // Crear un estudiante de prueba y asignarlo
  console.log('\n📝 Creando estudiante de prueba...\n');
  
  const users = getUsers();
  const testStudent = {
    username: 'estudiante_prueba',
    displayName: 'Estudiante Prueba',
    email: 'prueba@student.com',
    role: 'student',
    activeCourses: [],
    password: '1234'
  };
  
  const updatedUsers = [...users, testStudent];
  saveUsers(updatedUsers);
  
  // Asignar el estudiante al nuevo profesor
  assignStudentToTeacher('estudiante_prueba', 'profesor_nuevo', '3ro Básico');
  
  console.log('\n📊 DIAGNÓSTICO FINAL\n');
  diagnoseAssignments();
  
  console.log('✅ Pruebas completadas. Verifica el chat del nuevo profesor para confirmar que ve a sus estudiantes.');
}

// Función para reparar asignaciones existentes
function repairExistingAssignments() {
  console.log('🔧 REPARANDO ASIGNACIONES EXISTENTES\n');
  
  const users = getUsers();
  const teachers = users.filter(u => u.role === 'teacher');
  
  let repaired = false;
  
  const updatedUsers = users.map(user => {
    if (user.role === 'teacher') {
      const updatedTeacher = { ...user };
      
      // Asegurar que tiene teachingSubjects
      if (!updatedTeacher.teachingSubjects) {
        updatedTeacher.teachingSubjects = [
          'Matemáticas',
          'Lenguaje y Comunicación',
          'Ciencias Naturales',
          'Historia, Geografía y Ciencias Sociales'
        ];
        console.log(`✅ Agregadas materias por defecto a ${user.displayName}`);
        repaired = true;
      }
      
      // Asegurar que tiene teachingAssignments
      if (!updatedTeacher.teachingAssignments) {
        updatedTeacher.teachingAssignments = [];
        updatedTeacher.teachingSubjects.forEach(subject => {
          updatedTeacher.teachingAssignments.push({
            teacherUsername: user.username,
            teacherName: user.displayName,
            subject: subject,
            courses: user.activeCourses
          });
        });
        console.log(`✅ Creadas asignaciones de enseñanza para ${user.displayName}`);
        repaired = true;
      }
      
      return updatedTeacher;
    }
    
    if (user.role === 'student' && user.assignedTeacher && !user.assignedTeachers) {
      // Migrar de assignedTeacher a assignedTeachers
      const teacher = teachers.find(t => t.username === user.assignedTeacher);
      if (teacher) {
        const updatedStudent = {
          ...user,
          assignedTeachers: {}
        };
        
        const subjects = [
          'Matemáticas',
          'Lenguaje y Comunicación',
          'Ciencias Naturales',
          'Historia, Geografía y Ciencias Sociales'
        ];
        
        subjects.forEach(subject => {
          updatedStudent.assignedTeachers[subject] = user.assignedTeacher;
        });
        
        console.log(`✅ Migrado ${user.displayName} a nuevo formato de asignaciones`);
        repaired = true;
        
        return updatedStudent;
      }
    }
    
    return user;
  });
  
  if (repaired) {
    saveUsers(updatedUsers);
    console.log('\n✅ Reparaciones completadas\n');
  } else {
    console.log('\n✅ No se necesitaron reparaciones\n');
  }
}

// Exportar funciones para uso manual
window.assignStudentToTeacher = assignStudentToTeacher;
window.createTeacherWithStudents = createTeacherWithStudents;
window.diagnoseAssignments = diagnoseAssignments;
window.repairExistingAssignments = repairExistingAssignments;
window.runTests = runTests;

console.log('🚀 Script cargado. Funciones disponibles:');
console.log('   • diagnoseAssignments() - Diagnosticar asignaciones actuales');
console.log('   • repairExistingAssignments() - Reparar asignaciones existentes');
console.log('   • assignStudentToTeacher(studentUsername, teacherUsername, course) - Asignar estudiante a profesor');
console.log('   • createTeacherWithStudents(teacherData, studentsArray) - Crear profesor con estudiantes');
console.log('   • runTests() - Ejecutar pruebas completas');
console.log('\n💡 Ejecuta runTests() para una prueba completa o diagnoseAssignments() para ver el estado actual');
