// Script de depuración para identificar claves duplicadas en comunicaciones
// Ejecutar en la consola del navegador

function debugCommunicationsKeys() {
  console.log('🔍 DEPURANDO CLAVES DUPLICADAS EN COMUNICACIONES');
  console.log('=' .repeat(60));
  
  // Verificar datos de cursos-sección
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
  const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  console.log('📚 DATOS DE CURSOS Y SECCIONES:');
  console.log('Cursos:', courses.length);
  console.log('Secciones:', sections.length);
  console.log('Asignaciones de profesores:', teacherAssignments.length);
  
  // Verificar IDs de cursos-sección duplicados
  console.log('\n🔍 VERIFICANDO IDS DE CURSOS-SECCIÓN:');
  const courseSectionIds = [];
  const duplicateCourseSectionIds = [];
  
  sections.forEach(section => {
    const course = courses.find(c => c.id === section.courseId);
    const courseSectionId = `${section.courseId}-${section.id}`;
    
    if (courseSectionIds.includes(courseSectionId)) {
      duplicateCourseSectionIds.push(courseSectionId);
      console.warn(`❌ ID duplicado encontrado: ${courseSectionId}`);
    } else {
      courseSectionIds.push(courseSectionId);
    }
    
    console.log(`   ${courseSectionId}: ${course?.name || 'Curso'} ${section.name}`);
  });
  
  // Verificar IDs de estudiantes duplicados
  console.log('\n👥 VERIFICANDO IDS DE ESTUDIANTES:');
  const students = users.filter(u => u.role === 'student');
  const studentIds = [];
  const duplicateStudentIds = [];
  
  students.forEach(student => {
    if (studentIds.includes(student.id)) {
      duplicateStudentIds.push(student.id);
      console.warn(`❌ ID de estudiante duplicado: ${student.id}`);
    } else {
      studentIds.push(student.id);
    }
    console.log(`   ${student.id}: ${student.displayName}`);
  });
  
  // Verificar IDs de comunicaciones duplicados
  console.log('\n📧 VERIFICANDO IDS DE COMUNICACIONES:');
  const communications = JSON.parse(localStorage.getItem('smart-student-communications') || '[]');
  const communicationIds = [];
  const duplicateCommunicationIds = [];
  
  communications.forEach(comm => {
    if (communicationIds.includes(comm.id)) {
      duplicateCommunicationIds.push(comm.id);
      console.warn(`❌ ID de comunicación duplicado: ${comm.id}`);
    } else {
      communicationIds.push(comm.id);
    }
    console.log(`   ${comm.id}: ${comm.title}`);
  });
  
  // Resumen
  console.log('\n📊 RESUMEN:');
  console.log(`• Cursos-sección únicos: ${courseSectionIds.length}`);
  console.log(`• Cursos-sección duplicados: ${duplicateCourseSectionIds.length}`);
  console.log(`• Estudiantes únicos: ${studentIds.length}`);
  console.log(`• Estudiantes duplicados: ${duplicateStudentIds.length}`);
  console.log(`• Comunicaciones únicas: ${communicationIds.length}`);
  console.log(`• Comunicaciones duplicadas: ${duplicateCommunicationIds.length}`);
  
  if (duplicateCourseSectionIds.length === 0 && duplicateStudentIds.length === 0 && duplicateCommunicationIds.length === 0) {
    console.log('✅ No se encontraron IDs duplicados en los datos');
  } else {
    console.warn('⚠️ Se encontraron IDs duplicados que podrían causar problemas de claves en React');
  }
  
  return {
    courseSectionIds,
    duplicateCourseSectionIds,
    studentIds,
    duplicateStudentIds,
    communicationIds,
    duplicateCommunicationIds
  };
}

// Ejecutar la función
debugCommunicationsKeys();
