// Verificador rápido de corrección sectionId
function verificarCorreccionSectionId() {
  console.clear();
  console.log('🔧 VERIFICADOR DE CORRECCIÓN SECTIONID');
  console.log('=====================================');
  
  // Simular la función getAvailableCoursesWithNames (parte relevante)
  try {
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    const profesor = users.find(u => u.username === 'pedro' && u.role === 'teacher');
    
    if (!profesor) {
      console.log('❌ Profesor pedro no encontrado');
      return;
    }
    
    console.log(`👨‍🏫 Analizando cursos disponibles para: ${profesor.name} (ID: ${profesor.id})`);
    
    // Simular la lógica corregida
    const userAssignments = teacherAssignments.filter(assignment => 
      assignment.teacherId === profesor.id
    );
    
    console.log(`📋 Asignaciones del profesor: ${userAssignments.length}`);
    
    const courseSectionsMap = new Map();
    
    userAssignments.forEach(assignment => {
      const section = sections.find(s => s.id === assignment.sectionId);
      if (section) {
        const course = courses.find(c => c.id === section.courseId);
        if (course) {
          const key = `${course.id}-${section.id}`;
          if (!courseSectionsMap.has(key)) {
            const courseData = {
              id: key,
              courseId: course.id,
              sectionId: section.id, // ✅ AHORA INCLUIDO
              name: `${course.name} Sección ${section.name}`,
              originalCourseName: course.name,
              sectionName: section.name
            };
            courseSectionsMap.set(key, courseData);
            
            console.log(`📚 Curso disponible:`);
            console.log(`   • ID completo: ${courseData.id}`);
            console.log(`   • CourseId: ${courseData.courseId}`);
            console.log(`   • SectionId: ${courseData.sectionId} ✅`);
            console.log(`   • Nombre: ${courseData.name}`);
          }
        }
      }
    });
    
    const availableCourses = Array.from(courseSectionsMap.values());
    
    console.log(`\n🎯 RESULTADO:`);
    console.log(`   • Cursos disponibles: ${availableCourses.length}`);
    
    // Probar el caso específico problemático
    const courseIdProblematico = '0880d4ca-7232-42dc-abef-1223e00a5c6e-a75b7e0e-1130-486a-ae5e-6f7233e002bf';
    const selectedCourseData = availableCourses.find(c => c.id === courseIdProblematico);
    
    console.log(`\n🔍 PRUEBA DEL CASO PROBLEMÁTICO:`);
    console.log(`   • Buscando: ${courseIdProblematico}`);
    console.log(`   • Encontrado: ${selectedCourseData ? '✅ SÍ' : '❌ NO'}`);
    
    if (selectedCourseData) {
      console.log(`   • courseId extraído: ${selectedCourseData.courseId}`);
      console.log(`   • sectionId extraído: ${selectedCourseData.sectionId} ${selectedCourseData.sectionId ? '✅' : '❌'}`);
      console.log(`   • Nombre: ${selectedCourseData.name}`);
      
      // Verificar si coincide con el esperado
      const sectionIdEsperado = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
      const coincide = selectedCourseData.sectionId === sectionIdEsperado;
      
      console.log(`\n🎯 VERIFICACIÓN FINAL:`);
      console.log(`   • SectionId esperado: ${sectionIdEsperado}`);
      console.log(`   • SectionId obtenido: ${selectedCourseData.sectionId}`);
      console.log(`   • ¿Coinciden?: ${coincide ? '✅ SÍ' : '❌ NO'}`);
      
      if (coincide) {
        console.log(`\n🎉 ¡CORRECCIÓN EXITOSA!`);
        console.log(`💡 Ahora el frontend debería poder extraer correctamente el sectionId`);
        return { success: true, sectionId: selectedCourseData.sectionId };
      }
    }
    
    console.log(`\n⚠️ Aún hay problemas con la extracción`);
    return { success: false };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar verificación
console.log('🚀 Verificando corrección del sectionId...');
const resultado = verificarCorreccionSectionId();
console.log('\n✅ Resultado final:', resultado);

if (resultado?.success) {
  console.log('\n🎯 SIGUIENTE PASO: Recarga la página y vuelve a intentar crear una tarea');
  console.log('💡 Los estudiantes ahora deberían aparecer en el dropdown');
}
