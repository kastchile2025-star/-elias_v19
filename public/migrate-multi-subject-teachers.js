// Migration Script: Convert single teacher assignment to subject-based teacher assignments
// Run this in browser console to migrate existing user data to the new format

console.log('🔄 Starting migration to multi-subject teacher assignments...');

try {
  // Get existing users data
  const usersData = localStorage.getItem('smart-student-users');
  if (!usersData) {
    console.log('ℹ️ No users data found. Creating sample data with new format...');
    
    // Create sample users with new format
    const sampleUsers = [
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
    
    localStorage.setItem('smart-student-users', JSON.stringify(sampleUsers));
    console.log('✅ Sample users created with new multi-subject teacher assignments');
    return;
  }

  // Parse existing users
  const users = JSON.parse(usersData);
  console.log(`📊 Found ${users.length} existing users`);

  // Migration logic
  let migrationCount = 0;
  const migratedUsers = users.map(user => {
    // Skip if already migrated (has assignedTeachers property)
    if (user.role === 'student' && user.assignedTeachers) {
      console.log(`⏭️ Student ${user.username} already migrated`);
      return user;
    }

    // Skip if already migrated (has teachingAssignments property)
    if (user.role === 'teacher' && user.teachingAssignments) {
      console.log(`⏭️ Teacher ${user.username} already migrated`);
      return user;
    }

    // Migrate students: convert assignedTeacher to assignedTeachers by subject
    if (user.role === 'student' && user.assignedTeacher) {
      migrationCount++;
      console.log(`🔄 Migrating student: ${user.username}`);
      
      // Define default subject assignments
      // This is a basic mapping - in a real scenario, this would be more sophisticated
      const subjectAssignments = {
        'Matemáticas': user.assignedTeacher,
        'Ciencias Naturales': user.assignedTeacher,
        'Lenguaje y Comunicación': user.assignedTeacher,
        'Historia, Geografía y Ciencias Sociales': user.assignedTeacher
      };

      // For higher grades, add additional subjects
      if (user.activeCourses.some(course => course.includes('Medio'))) {
        subjectAssignments['Biología'] = user.assignedTeacher;
        subjectAssignments['Física'] = user.assignedTeacher;
        subjectAssignments['Química'] = user.assignedTeacher;
        subjectAssignments['Ciencias para la Ciudadanía'] = user.assignedTeacher;
        subjectAssignments['Educación Ciudadana'] = user.assignedTeacher;
        subjectAssignments['Filosofía'] = user.assignedTeacher;
      }

      return {
        ...user,
        assignedTeachers: subjectAssignments,
        // Keep old property for backwards compatibility during transition
        assignedTeacher: user.assignedTeacher
      };
    }

    // Migrate teachers: create teachingAssignments based on their courses
    if (user.role === 'teacher') {
      migrationCount++;
      console.log(`🔄 Migrating teacher: ${user.username}`);
      
      // Create teaching assignments for basic subjects
      const teachingAssignments = [
        {
          teacherUsername: user.username,
          teacherName: user.displayName,
          subject: 'Matemáticas',
          courses: user.activeCourses || []
        },
        {
          teacherUsername: user.username,
          teacherName: user.displayName,
          subject: 'Ciencias Naturales',
          courses: user.activeCourses || []
        },
        {
          teacherUsername: user.username,
          teacherName: user.displayName,
          subject: 'Lenguaje y Comunicación',
          courses: user.activeCourses || []
        },
        {
          teacherUsername: user.username,
          teacherName: user.displayName,
          subject: 'Historia, Geografía y Ciencias Sociales',
          courses: user.activeCourses || []
        }
      ];

      // Add specialized subjects for teachers with "Medio" courses
      if (user.activeCourses && user.activeCourses.some(course => course.includes('Medio'))) {
        teachingAssignments.push(
          {
            teacherUsername: user.username,
            teacherName: user.displayName,
            subject: 'Biología',
            courses: user.activeCourses.filter(course => course.includes('Medio'))
          },
          {
            teacherUsername: user.username,
            teacherName: user.displayName,
            subject: 'Física',
            courses: user.activeCourses.filter(course => course.includes('Medio'))
          },
          {
            teacherUsername: user.username,
            teacherName: user.displayName,
            subject: 'Química',
            courses: user.activeCourses.filter(course => course.includes('Medio'))
          }
        );
      }

      return {
        ...user,
        teachingAssignments: teachingAssignments
      };
    }

    // Return unchanged for admins and other roles
    return user;
  });

  // Save migrated data
  localStorage.setItem('smart-student-users', JSON.stringify(migratedUsers));
  
  console.log(`✅ Migration completed successfully!`);
  console.log(`📈 Migrated ${migrationCount} users to new multi-subject teacher assignment format`);
  console.log('🔄 Please refresh the page to see the changes');

} catch (error) {
  console.error('❌ Migration failed:', error);
  console.log('⚠️ Your existing data has not been modified');
}
