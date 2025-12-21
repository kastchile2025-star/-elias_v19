// Migration script for independent teacher-student system
// Execute this in browser console to migrate existing data

function migrateToIndependentTeachers() {
  console.log('🔄 Starting migration to independent teacher-student system...');
  
  // Get current users
  const usersData = localStorage.getItem('smart-student-users');
  
  if (usersData) {
    try {
      const users = JSON.parse(usersData);
      
      // Migrate students to have explicit teacher assignments
      const migratedUsers = users.map(user => {
        if (user.role === 'student' && user.activeCourses && user.activeCourses.length > 0) {
          // If student doesn't have assignedTeacher, try to assign one
          if (!user.assignedTeacher) {
            const studentCourse = user.activeCourses[0]; // Take first course
            const availableTeacher = users.find(u => 
              u.role === 'teacher' && 
              u.activeCourses && 
              u.activeCourses.includes(studentCourse)
            );
            
            if (availableTeacher) {
              console.log(`✅ Assigning ${user.displayName} to teacher ${availableTeacher.displayName} for course ${studentCourse}`);
              return {
                ...user,
                activeCourses: [studentCourse], // Ensure only one course
                assignedTeacher: availableTeacher.username
              };
            }
          }
        }
        return user;
      });
      
      // Save migrated data
      localStorage.setItem('smart-student-users', JSON.stringify(migratedUsers));
      console.log('✅ Migration completed successfully!');
      
      // Show summary
      const students = migratedUsers.filter(u => u.role === 'student');
      const teachers = migratedUsers.filter(u => u.role === 'teacher');
      
      console.log('\n📊 MIGRATION SUMMARY:');
      console.log(`👥 Total students: ${students.length}`);
      console.log(`👨‍🏫 Total teachers: ${teachers.length}`);
      
      console.log('\n👨‍🏫 TEACHER ASSIGNMENTS:');
      teachers.forEach(teacher => {
        const assignedStudents = students.filter(s => s.assignedTeacher === teacher.username);
        console.log(`  ${teacher.displayName} (${teacher.activeCourses.join(', ')}): ${assignedStudents.length} students`);
        assignedStudents.forEach(student => {
          console.log(`    - ${student.displayName} (${student.activeCourses[0] || 'No course'})`);
        });
      });
      
      const unassignedStudents = students.filter(s => !s.assignedTeacher);
      if (unassignedStudents.length > 0) {
        console.log('\n⚠️ UNASSIGNED STUDENTS:');
        unassignedStudents.forEach(student => {
          console.log(`  - ${student.displayName}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error during migration:', error);
    }
  } else {
    console.log('ℹ️ No user data found in localStorage');
  }
}

function resetToIndependentTeachersExample() {
  const exampleUsers = [
    {
      username: 'admin',
      displayName: 'Administrador del Sistema',
      email: 'admin@smartstudent.com',
      role: 'admin',
      activeCourses: [],
      password: '1234'
    },
    // Two teachers for the same course (4to Básico) - independent
    {
      username: 'jorge',
      displayName: 'Jorge Profesor (Sala A)',
      email: 'jorge@teacher.com',
      role: 'teacher',
      activeCourses: ['4to Básico', '5to Básico'],
      password: '1234'
    },
    {
      username: 'ana',
      displayName: 'Ana Profesora (Sala B)',
      email: 'ana@teacher.com',
      role: 'teacher',
      activeCourses: ['4to Básico'], // Same course as Jorge but independent
      password: '1234'
    },
    {
      username: 'carlos',
      displayName: 'Carlos Profesor',
      email: 'carlos@teacher.com',
      role: 'teacher',
      activeCourses: ['1ro Básico', '2do Básico'],
      password: '1234'
    },
    // Students assigned to specific teachers
    {
      username: 'felipe',
      displayName: 'Felipe Estudiante',
      email: 'felipe@student.com',
      role: 'student',
      activeCourses: ['4to Básico'],
      assignedTeacher: 'jorge', // Felipe is in Jorge's class (Sala A)
      password: '1234'
    },
    {
      username: 'luis',
      displayName: 'Luis Estudiante',
      email: 'luis@student.com',
      role: 'student',
      activeCourses: ['4to Básico'],
      assignedTeacher: 'ana', // Luis is in Ana's class (Sala B) - same course, different teacher!
      password: '1234'
    },
    {
      username: 'maria',
      displayName: 'María Estudiante',
      email: 'maria@student.com',
      role: 'student',
      activeCourses: ['1ro Básico'],
      assignedTeacher: 'carlos',
      password: '1234'
    },
    {
      username: 'sofia',
      displayName: 'Sofía Estudiante',
      email: 'sofia@student.com',
      role: 'student',
      activeCourses: [], // Available for assignment
      password: '1234'
    }
  ];
  
  localStorage.setItem('smart-student-users', JSON.stringify(exampleUsers));
  console.log('✅ Reset to independent teachers example completed!');
  console.log('📝 Example shows:');
  console.log('  - Jorge and Ana both teach "4to Básico" but have different students');
  console.log('  - Felipe is in Jorge\'s "4to Básico" class');
  console.log('  - Luis is in Ana\'s "4to Básico" class');
  console.log('  - Each teacher manages their own "classroom" independently');
}

console.log('🚀 Independent Teacher-Student Migration Tools loaded!');
console.log('Use:');
console.log('- migrateToIndependentTeachers() to migrate existing data');
console.log('- resetToIndependentTeachersExample() to see working example');
