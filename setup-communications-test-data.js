// Script para configurar datos de prueba para el módulo de comunicaciones
// Ejecutar en la consola del navegador

function setupCommunicationsTestData() {
  console.log('🔧 Configurando datos de prueba para comunicaciones...');
  
  // 1. Configurar cursos
  const courses = [
    { id: '1ro_basico', name: '1ro Básico' },
    { id: '2do_basico', name: '2do Básico' },
    { id: '3ro_basico', name: '3ro Básico' },
    { id: '4to_basico', name: '4to Básico' },
    { id: '5to_basico', name: '5to Básico' },
    { id: '6to_basico', name: '6to Básico' },
  ];
  
  // 2. Configurar secciones
  const sections = [
    { id: 'seccion_a_1ro', name: 'Sección A', courseId: '1ro_basico' },
    { id: 'seccion_b_1ro', name: 'Sección B', courseId: '1ro_basico' },
    { id: 'seccion_a_2do', name: 'Sección A', courseId: '2do_basico' },
    { id: 'seccion_b_2do', name: 'Sección B', courseId: '2do_basico' },
    { id: 'seccion_a_3ro', name: 'Sección A', courseId: '3ro_basico' },
    { id: 'seccion_b_3ro', name: 'Sección B', courseId: '3ro_basico' },
    { id: 'seccion_a_4to', name: 'Sección A', courseId: '4to_basico' },
    { id: 'seccion_b_4to', name: 'Sección B', courseId: '4to_basico' },
    { id: 'seccion_a_5to', name: 'Sección A', courseId: '5to_basico' },
    { id: 'seccion_b_5to', name: 'Sección B', courseId: '5to_basico' },
    { id: 'seccion_a_6to', name: 'Sección A', courseId: '6to_basico' },
    { id: 'seccion_b_6to', name: 'Sección B', courseId: '6to_basico' },
  ];
  
  // 3. Obtener usuarios existentes y añadir algunos estudiantes de prueba
  let users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  // Agregar algunos estudiantes de prueba si no existen
  const testStudents = [
    {
      id: 'student_maria',
      username: 'maria_estudiante',
      role: 'student',
      displayName: 'María García',
      email: 'maria.garcia@estudiante.com',
      activeCourses: ['1ro_basico'],
      password: 'password123'
    },
    {
      id: 'student_carlos',
      username: 'carlos_estudiante', 
      role: 'student',
      displayName: 'Carlos López',
      email: 'carlos.lopez@estudiante.com',
      activeCourses: ['2do_basico'],
      password: 'password123'
    },
    {
      id: 'student_ana',
      username: 'ana_estudiante',
      role: 'student', 
      displayName: 'Ana Martínez',
      email: 'ana.martinez@estudiante.com',
      activeCourses: ['3ro_basico'],
      password: 'password123'
    },
    {
      id: 'student_pedro',
      username: 'pedro_estudiante',
      role: 'student',
      displayName: 'Pedro Rodríguez',
      email: 'pedro.rodriguez@estudiante.com', 
      activeCourses: ['1ro_basico'],
      password: 'password123'
    },
    {
      id: 'student_lucia',
      username: 'lucia_estudiante',
      role: 'student',
      displayName: 'Lucía Fernández',
      email: 'lucia.fernandez@estudiante.com',
      activeCourses: ['2do_basico'],
      password: 'password123'
    },
    {
      id: 'student_diego',
      username: 'diego_estudiante',
      role: 'student',
      displayName: 'Diego Silva',
      email: 'diego.silva@estudiante.com',
      activeCourses: ['3ro_basico'],
      password: 'password123'
    }
  ];
  
  // Agregar estudiantes que no existan
  testStudents.forEach(student => {
    if (!users.find(u => u.username === student.username)) {
      users.push(student);
    }
  });
  
  // 4. Agregar un profesor de prueba si no existe
  const testTeacher = {
    id: 'teacher_comunicaciones',
    username: 'profesor_comunicaciones',
    role: 'teacher',
    displayName: 'Profesor Comunicaciones',
    email: 'comunicaciones@profesor.com',
    activeCourses: ['1ro_basico', '2do_basico', '3ro_basico'],
    password: 'password123'
  };
  
  if (!users.find(u => u.username === testTeacher.username)) {
    users.push(testTeacher);
  }
  
  // 5. Guardar datos en localStorage
  localStorage.setItem('smart-student-users', JSON.stringify(users));
  localStorage.setItem('smart-student-courses', JSON.stringify(courses));
  localStorage.setItem('smart-student-sections', JSON.stringify(sections));
  
  // 6. Limpiar comunicaciones existentes (opcional)
  localStorage.removeItem('smart-student-communications');
  
  console.log('✅ Datos de prueba configurados correctamente:');
  console.log(`📚 Cursos: ${courses.length}`);
  console.log(`📖 Secciones: ${sections.length}`);
  console.log(`👥 Usuarios totales: ${users.length}`);
  console.log(`👨‍🎓 Estudiantes de prueba: ${testStudents.length}`);
  console.log('👨‍🏫 Profesor de prueba: profesor_comunicaciones');
  
  console.log('\n🔑 Para probar:');
  console.log('1. Hacer login como: profesor_comunicaciones / password123');
  console.log('2. Ir a la pestaña "Comunicaciones"');
  console.log('3. Crear comunicaciones para cursos o estudiantes específicos');
  
  return {
    courses,
    sections,
    students: testStudents,
    teacher: testTeacher
  };
}

// Función para crear comunicaciones de ejemplo
function createSampleCommunications() {
  console.log('📝 Creando comunicaciones de ejemplo...');
  
  const sampleCommunications = [
    {
      id: 'comm_ejemplo_1',
      title: 'Reunión de Apoderados',
      content: 'Estimados apoderados, les informamos que tendremos una reunión el próximo viernes 15 de marzo a las 19:00 hrs en el aula del curso. Los temas a tratar incluyen el rendimiento académico del primer semestre y las actividades planificadas para el segundo semestre.',
      type: 'course',
      targetCourse: '1ro_basico',
      targetSection: 'seccion_a_1ro',
      createdBy: 'profesor_comunicaciones',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
      readBy: []
    },
    {
      id: 'comm_ejemplo_2', 
      title: 'Felicitaciones por Excelente Rendimiento',
      content: 'Querida María, quería felicitarte personalmente por tu excelente rendimiento en la evaluación de matemáticas. Tu dedicación y esfuerzo se han visto reflejados en tus resultados. ¡Sigue así!',
      type: 'student',
      targetStudent: 'student_maria',
      createdBy: 'profesor_comunicaciones',
      createdAt: new Date(Date.now() - 43200000).toISOString(), // Hace 12 horas
      readBy: []
    },
    {
      id: 'comm_ejemplo_3',
      title: 'Importante: Cambio de Horario',
      content: 'Estimados estudiantes y apoderados, les informamos que debido a actividades del establecimiento, las clases del día martes 20 de marzo se realizarán en el siguiente horario modificado: 1ra hora: 08:30-09:15, 2da hora: 09:25-10:10, Recreo: 10:10-10:30, 3ra hora: 10:30-11:15, 4ta hora: 11:25-12:10.',
      type: 'course',
      targetCourse: '2do_basico',
      targetSection: 'seccion_a_2do',
      createdBy: 'profesor_comunicaciones',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
      readBy: []
    }
  ];
  
  localStorage.setItem('smart-student-communications', JSON.stringify(sampleCommunications));
  
  console.log(`✅ ${sampleCommunications.length} comunicaciones de ejemplo creadas`);
  console.log('📋 Tipos: 2 para cursos, 1 para estudiante específico');
  
  return sampleCommunications;
}

// Función para limpiar datos de prueba
function cleanupCommunicationsTestData() {
  console.log('🧹 Limpiando datos de prueba de comunicaciones...');
  
  // Remover comunicaciones
  localStorage.removeItem('smart-student-communications');
  
  // Remover usuarios de prueba (opcional)
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const testUsernames = [
    'maria_estudiante', 'carlos_estudiante', 'ana_estudiante',
    'pedro_estudiante', 'lucia_estudiante', 'diego_estudiante',
    'profesor_comunicaciones'
  ];
  
  const cleanedUsers = users.filter(user => !testUsernames.includes(user.username));
  localStorage.setItem('smart-student-users', JSON.stringify(cleanedUsers));
  
  console.log('✅ Datos de prueba limpiados');
}

// Ejecutar automáticamente al cargar el script
console.log('🚀 Script de comunicaciones cargado. Comandos disponibles:');
console.log('- setupCommunicationsTestData() - Configurar datos de prueba');
console.log('- createSampleCommunications() - Crear comunicaciones de ejemplo');
console.log('- cleanupCommunicationsTestData() - Limpiar datos de prueba');
