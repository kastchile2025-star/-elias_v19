// Script para debuggear el selector de asignaturas
console.log('🔍 Iniciando debugging del selector de asignaturas...');

// Simular datos de localStorage
const sampleUsers = [
  {
    id: 'teacher1',
    username: 'prof.martinez',
    role: 'teacher',
    name: 'María Martínez'
  },
  {
    id: 'teacher2', 
    username: 'prof.gonzalez',
    role: 'teacher',
    name: 'Juan González'
  }
];

const sampleCourses = [
  { id: 'course1', name: '1ro Básico' },
  { id: 'course2', name: '2do Básico' },
  { id: 'course3', name: '3ro Básico' }
];

const sampleSections = [
  { id: 'section1', courseId: 'course1', name: '1A' },
  { id: 'section2', courseId: 'course1', name: '1B' },
  { id: 'section3', courseId: 'course2', name: '2A' }
];

const sampleAssignments = [
  {
    id: 'assign1',
    teacherId: 'teacher1',
    sectionId: 'section1',
    subjectName: 'Ciencias Naturales'
  },
  {
    id: 'assign2',
    teacherId: 'teacher1',
    sectionId: 'section2',
    subjectName: 'Matemáticas'
  },
  {
    id: 'assign3',
    teacherId: 'teacher2',
    sectionId: 'section3',
    subjectName: 'Historia y Geografía'
  }
];

// Simular localStorage
const mockLocalStorage = {
  'smart-student-users': JSON.stringify(sampleUsers),
  'smart-student-courses': JSON.stringify(sampleCourses),
  'smart-student-sections': JSON.stringify(sampleSections),
  'smart-student-teacher-assignments': JSON.stringify(sampleAssignments)
};

console.log('📦 Datos simulados cargados:');
console.log('👥 Usuarios:', sampleUsers.length);
console.log('📚 Cursos:', sampleCourses.length);
console.log('🏫 Secciones:', sampleSections.length);
console.log('📋 Asignaciones:', sampleAssignments.length);

// Función simulada para obtener asignaciones del profesor
function getTeacherAssignedSubjects(teacherId) {
  console.log('\n🔍 Analizando asignaciones para teacherId:', teacherId);
  
  const users = JSON.parse(mockLocalStorage['smart-student-users']);
  const assignments = JSON.parse(mockLocalStorage['smart-student-teacher-assignments']);
  const sections = JSON.parse(mockLocalStorage['smart-student-sections']);
  const courses = JSON.parse(mockLocalStorage['smart-student-courses']);
  
  console.log('📋 Total asignaciones en sistema:', assignments.length);
  
  // Buscar asignaciones por ID del profesor
  const teacherAssignments = assignments.filter(assignment => 
    assignment.teacherId === teacherId
  );
  
  console.log('📋 Asignaciones encontradas para este profesor:', teacherAssignments);
  
  if (teacherAssignments.length > 0) {
    const assignedCourses = new Set();
    const assignedSubjects = new Set();
    
    teacherAssignments.forEach(assignment => {
      console.log('🔍 Procesando asignación:', assignment);
      const section = sections.find(s => s.id === assignment.sectionId);
      
      if (section) {
        const course = courses.find(c => c.id === section.courseId);
        if (course) {
          assignedCourses.add(course.name);
          console.log('📚 Curso agregado:', course.name);
        }
        assignedSubjects.add(assignment.subjectName);
        console.log('🎯 Asignatura agregada:', assignment.subjectName);
      }
    });
    
    const result = {
      courses: Array.from(assignedCourses),
      subjects: Array.from(assignedSubjects)
    };
    
    console.log('✅ Resultado final:', result);
    return result;
  }
  
  console.log('❌ No se encontraron asignaciones para el profesor');
  return null;
}

// Probar para cada profesor
console.log('\n=== PRUEBAS DE ASIGNACIONES ===');

sampleUsers.filter(user => user.role === 'teacher').forEach(teacher => {
  console.log(`\n👨‍🏫 Profesor: ${teacher.name} (${teacher.username})`);
  const assignments = getTeacherAssignedSubjects(teacher.id);
  
  if (assignments) {
    console.log(`✅ Cursos asignados: ${assignments.courses.join(', ')}`);
    console.log(`✅ Asignaturas asignadas: ${assignments.subjects.join(', ')}`);
  } else {
    console.log('❌ Sin asignaciones encontradas');
  }
});

console.log('\n🎯 Debugging completado');
