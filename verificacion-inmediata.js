// Script de verificación inmediata para Estudiantes Específicos
// Copia y pega esto en la consola del navegador en la página de Crear Nueva Tarea

console.log('🔍 INICIANDO VERIFICACIÓN INMEDIATA...');

// Verificar autenticación
const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
console.log('🎓 Usuario actual:', auth.user);

if (!auth.user || auth.user.role !== 'teacher') {
  console.error('❌ ERROR: No estás logueado como profesor');
  console.log('💡 Ve a http://localhost:9002 y haz login como profesor');
} else {
  console.log('✅ Profesor logueado:', auth.user.displayName);
  
  // Verificar datos
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  
  console.log('📊 Total usuarios:', users.length);
  console.log('📊 Total cursos:', courses.length);
  
  // Mostrar estudiantes
  const students = users.filter(u => u.role === 'student');
  console.log('👥 Total estudiantes:', students.length);
  
  students.forEach(s => {
    console.log(`👤 ${s.displayName} (${s.username})`);
    console.log(`   • Cursos: ${s.activeCourses?.join(', ') || 'Ninguno'}`);
    console.log(`   • Profesor asignado: ${s.assignedTeacher || 'Ninguno'}`);
    console.log(`   • Profesores por materia: ${JSON.stringify(s.assignedTeachers) || 'Ninguno'}`);
  });
  
  // Verificar estudiantes asignados al profesor actual
  const myStudents = students.filter(s => 
    s.assignedTeacher === auth.user.username ||
    (s.assignedTeachers && Object.values(s.assignedTeachers).includes(auth.user.username))
  );
  
  console.log(`✅ Estudiantes asignados a ${auth.user.displayName}:`, myStudents.length);
  myStudents.forEach(s => {
    console.log(`   • ${s.displayName} - Cursos: ${s.activeCourses?.join(', ') || 'Ninguno'}`);
  });
  
  if (myStudents.length === 0) {
    console.log('🚀 CREANDO ESTUDIANTES DE PRUEBA...');
    
    // Crear estudiantes de prueba
    const testStudents = [
      { username: 'ana.prueba', name: 'Ana Prueba', course: '4to Básico Sección A' },
      { username: 'luis.prueba', name: 'Luis Prueba', course: '4to Básico Sección A' },
      { username: 'sofia.prueba', name: 'Sofia Prueba', course: '4to Básico Sección A' }
    ];
    
    testStudents.forEach(({ username, name, course }) => {
      // Verificar si ya existe
      const existing = users.find(u => u.username === username);
      if (!existing) {
        const newStudent = {
          id: `student-${username}`,
          username: username,
          displayName: name,
          role: 'student',
          activeCourses: [course],
          assignedTeacher: auth.user.username,
          assignedTeachers: {
            'Lenguaje y Comunicación': auth.user.username,
            'Matemáticas': auth.user.username,
            'Ciencias Naturales': auth.user.username,
            'Historia, Geografía y Ciencias Sociales': auth.user.username
          }
        };
        users.push(newStudent);
        console.log(`✅ Creado: ${name}`);
      } else {
        // Actualizar estudiante existente
        existing.assignedTeacher = auth.user.username;
        existing.assignedTeachers = {
          'Lenguaje y Comunicación': auth.user.username,
          'Matemáticas': auth.user.username,
          'Ciencias Naturales': auth.user.username,
          'Historia, Geografía y Ciencias Sociales': auth.user.username
        };
        existing.activeCourses = [course];
        console.log(`🔄 Actualizado: ${name}`);
      }
    });
    
    // Verificar que el curso exista
    if (!courses.find(c => c.id === '4to Básico Sección A')) {
      courses.push({ id: '4to Básico Sección A', name: '4to Básico Sección A' });
      localStorage.setItem('smart-student-courses', JSON.stringify(courses));
      console.log('✅ Curso creado: 4to Básico Sección A');
    }
    
    // Guardar usuarios
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    console.log('🎉 ESTUDIANTES DE PRUEBA CREADOS');
    console.log('💡 Recarga la página y vuelve a intentar crear una tarea');
  }
}

console.log('🔚 VERIFICACIÓN COMPLETADA');
