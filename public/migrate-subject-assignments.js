// Migration script to update user data to support multiple teachers per student by subject
// Run this in browser console to migrate existing localStorage data

console.log('🔄 Iniciando migración de asignaciones de profesores por materia...');

try {
  // Get existing users data
  const existingUsers = localStorage.getItem('smart-student-users');
  
  if (!existingUsers) {
    console.log('ℹ️ No hay datos de usuarios existentes. Creando estructura inicial...');
    
    // Create initial user structure with subject assignments
    const initialUsers = [
      {
        username: 'admin',
        password: '1234',
        role: 'admin',
        displayName: 'Administrador del Sistema',
        activeCourses: [],
        email: 'admin@smartstudent.com'
      },
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
      {
        username: 'jorge',
        password: '1234',
        role: 'teacher',
        displayName: 'Jorge Profesor',
        activeCourses: ['4to Básico', '5to Básico'],
        email: 'jorge@teacher.com',
        teachingAssignments: [
          {
            teacherUsername: 'jorge',
            teacherName: 'Jorge Profesor',
            subject: 'Matemáticas',
            courses: ['4to Básico', '5to Básico']
          },
          {
            teacherUsername: 'jorge',
            teacherName: 'Jorge Profesor',
            subject: 'Lenguaje y Comunicación',
            courses: ['4to Básico', '5to Básico']
          }
        ]
      },
      {
        username: 'maria',
        password: '1234',
        role: 'student',
        displayName: 'María Estudiante',
        activeCourses: ['1ro Básico'],
        email: 'maria@student.com',
        assignedTeachers: {
          'Matemáticas': 'carlos',
          'Ciencias Naturales': 'carlos',
          'Lenguaje y Comunicación': 'carlos',
          'Historia, Geografía y Ciencias Sociales': 'carlos'
        }
      },
      {
        username: 'carlos',
        password: '1234',
        role: 'teacher',
        displayName: 'Carlos Profesor',
        activeCourses: ['1ro Básico', '2do Básico', '4to Básico'],
        email: 'carlos@teacher.com',
        teachingAssignments: [
          {
            teacherUsername: 'carlos',
            teacherName: 'Carlos Profesor',
            subject: 'Ciencias Naturales',
            courses: ['1ro Básico', '2do Básico', '4to Básico']
          },
          {
            teacherUsername: 'carlos',
            teacherName: 'Carlos Profesor',
            subject: 'Historia, Geografía y Ciencias Sociales',
            courses: ['1ro Básico', '2do Básico', '4to Básico']
          },
          {
            teacherUsername: 'carlos',
            teacherName: 'Carlos Profesor',
            subject: 'Matemáticas',
            courses: ['1ro Básico']
          },
          {
            teacherUsername: 'carlos',
            teacherName: 'Carlos Profesor',
            subject: 'Lenguaje y Comunicación',
            courses: ['1ro Básico']
          }
        ]
      }
    ];
    
    localStorage.setItem('smart-student-users', JSON.stringify(initialUsers));
    console.log('✅ Estructura inicial de usuarios creada con asignaciones por materia');
    
  } else {
    console.log('📊 Migrando datos existentes...');
    
    const users = JSON.parse(existingUsers);
    let migrationCount = 0;
    
    const updatedUsers = users.map(user => {
      // Skip if user already has the new structure
      if (user.role === 'student' && user.assignedTeachers && typeof user.assignedTeachers === 'object') {
        return user;
      }
      
      if (user.role === 'teacher' && user.teachingAssignments && Array.isArray(user.teachingAssignments)) {
        return user;
      }
      
      migrationCount++;
      
      if (user.role === 'student') {
        // Migrate from single assignedTeacher to multiple assignedTeachers by subject
        const newUser = { ...user };
        
        if (user.assignedTeacher) {
          // Default subject assignments based on course level
          const subjects = user.activeCourses[0]?.includes('Básico') 
            ? ['Matemáticas', 'Ciencias Naturales', 'Lenguaje y Comunicación', 'Historia, Geografía y Ciencias Sociales']
            : ['Matemáticas', 'Biología', 'Física', 'Química', 'Lenguaje y Comunicación', 'Historia, Geografía y Ciencias Sociales'];
          
          newUser.assignedTeachers = {};
          subjects.forEach(subject => {
            newUser.assignedTeachers[subject] = user.assignedTeacher;
          });
          
          // Remove old property
          delete newUser.assignedTeacher;
          
          console.log(`📝 Migrado estudiante ${user.username}: ${user.assignedTeacher} → múltiples materias`);
        }
        
        return newUser;
        
      } else if (user.role === 'teacher') {
        // Create teaching assignments for teachers
        const newUser = { ...user };
        
        // Default teaching assignments based on teacher name and courses
        const teachingAssignments = [];
        
        // Jorge teaches Math and Language
        if (user.username === 'jorge') {
          teachingAssignments.push(
            {
              teacherUsername: 'jorge',
              teacherName: user.displayName,
              subject: 'Matemáticas',
              courses: user.activeCourses || []
            },
            {
              teacherUsername: 'jorge',
              teacherName: user.displayName,
              subject: 'Lenguaje y Comunicación',
              courses: user.activeCourses || []
            }
          );
        }
        // Carlos teaches Sciences and History
        else if (user.username === 'carlos') {
          teachingAssignments.push(
            {
              teacherUsername: 'carlos',
              teacherName: user.displayName,
              subject: 'Ciencias Naturales',
              courses: user.activeCourses || []
            },
            {
              teacherUsername: 'carlos',
              teacherName: user.displayName,
              subject: 'Historia, Geografía y Ciencias Sociales',
              courses: user.activeCourses || []
            }
          );
          
          // Carlos also teaches all subjects for 1st grade
          if (user.activeCourses?.includes('1ro Básico')) {
            teachingAssignments.push(
              {
                teacherUsername: 'carlos',
                teacherName: user.displayName,
                subject: 'Matemáticas',
                courses: ['1ro Básico']
              },
              {
                teacherUsername: 'carlos',
                teacherName: user.displayName,
                subject: 'Lenguaje y Comunicación',
                courses: ['1ro Básico']
              }
            );
          }
        }
        
        newUser.teachingAssignments = teachingAssignments;
        
        console.log(`📝 Migrado profesor ${user.username}: ${teachingAssignments.length} asignaciones de materias`);
        
        return newUser;
      }
      
      return user;
    });
    
    // Save updated users
    localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
    
    console.log(`✅ Migración completada. ${migrationCount} usuarios actualizados.`);
  }
  
  // Display final structure
  const finalUsers = JSON.parse(localStorage.getItem('smart-student-users'));
  console.log('📋 Estructura final de usuarios:');
  
  finalUsers.forEach(user => {
    console.log(`\n👤 ${user.displayName} (${user.role})`);
    if (user.role === 'student' && user.assignedTeachers) {
      console.log('  📚 Profesores asignados por materia:');
      Object.entries(user.assignedTeachers).forEach(([subject, teacher]) => {
        console.log(`    • ${subject}: ${teacher}`);
      });
    } else if (user.role === 'teacher' && user.teachingAssignments) {
      console.log('  🏫 Materias que enseña:');
      user.teachingAssignments.forEach(assignment => {
        console.log(`    • ${assignment.subject} en ${assignment.courses.join(', ')}`);
      });
    }
  });
  
  console.log('\n🎉 ¡Migración de asignaciones por materia completada exitosamente!');
  console.log('💡 Los usuarios ahora pueden tener múltiples profesores (uno por materia)');
  console.log('🔄 Recarga la página para ver los cambios en el chat');
  
} catch (error) {
  console.error('❌ Error durante la migración:', error);
  console.log('🔍 Por favor, revisa la consola para más detalles');
}
