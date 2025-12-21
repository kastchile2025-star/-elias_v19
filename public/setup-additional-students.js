// Script para configurar estudiantes adicionales para testing
console.log('=== Configurando estudiantes adicionales ===');

const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');

// Agregar estudiantes adicionales si no existen
const additionalStudents = [
  {
    username: 'ana',
    displayName: 'Ana García',
    email: 'ana@student.com',
    role: 'student',
    activeCourses: ['4to Básico'],
    password: '1234'
  },
  {
    username: 'pedro',
    displayName: 'Pedro López',
    email: 'pedro@student.com',
    role: 'student',
    activeCourses: ['4to Básico'],
    password: '1234'
  },
  {
    username: 'sofia',
    displayName: 'Sofía Martínez',
    email: 'sofia@student.com',
    role: 'student',
    activeCourses: ['5to Básico'],
    password: '1234'
  },
  {
    username: 'diego',
    displayName: 'Diego Rodríguez',
    email: 'diego@student.com',
    role: 'student',
    activeCourses: ['5to Básico'],
    password: '1234'
  },
  {
    username: 'lucia',
    displayName: 'Lucía Fernández',
    email: 'lucia@student.com',
    role: 'student',
    activeCourses: ['1ro Básico'],
    password: '1234'
  },
  {
    username: 'mateo',
    displayName: 'Mateo Silva',
    email: 'mateo@student.com',
    role: 'student',
    activeCourses: ['2do Básico'],
    password: '1234'
  }
];

let addedCount = 0;
additionalStudents.forEach(student => {
  if (!users[student.username]) {
    users[student.username] = student;
    addedCount++;
    console.log(`✅ Agregado: ${student.displayName} - ${student.activeCourses[0]}`);
  } else {
    console.log(`⚠️  Ya existe: ${student.displayName}`);
  }
});

// Guardar en localStorage
localStorage.setItem('smart-student-users', JSON.stringify(users));

console.log(`✅ Se agregaron ${addedCount} estudiantes nuevos`);

// Mostrar resumen por curso
const studentsByCourse = {};
Object.values(users).forEach(user => {
  if (user.role === 'student') {
    user.activeCourses.forEach(course => {
      if (!studentsByCourse[course]) {
        studentsByCourse[course] = [];
      }
      studentsByCourse[course].push(user.displayName);
    });
  }
});

console.log('\n=== Estudiantes por curso ===');
Object.keys(studentsByCourse).sort().forEach(course => {
  console.log(`${course}: ${studentsByCourse[course].length} estudiantes`);
  studentsByCourse[course].forEach(name => {
    console.log(`  - ${name}`);
  });
});

console.log('\n=== Configuración completada ===');
