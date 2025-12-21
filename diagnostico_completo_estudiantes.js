// Diagnóstico completo de getStudentsForCourse
function diagnosticarGetStudentsForCourse() {
  console.clear();
  console.log('🔍 DIAGNÓSTICO COMPLETO - getStudentsForCourse');
  console.log('===============================================');
  
  try {
    // 1. Cargar todos los datos
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log(`📊 Datos cargados:`);
    console.log(`   • Usuarios: ${users.length}`);
    console.log(`   • Asignaciones estudiantes: ${studentAssignments.length}`);
    console.log(`   • Asignaciones profesores: ${teacherAssignments.length}`);
    console.log(`   • Cursos: ${courses.length}`);
    console.log(`   • Secciones: ${sections.length}`);
    
    // 2. Buscar profesor pedro
    const profesor = users.find(u => u.username === 'pedro' && u.role === 'teacher');
    if (!profesor) {
      console.log('❌ Profesor pedro no encontrado');
      return;
    }
    
    console.log(`\n👨‍🏫 Profesor: ${profesor.name} (ID: ${profesor.id})`);
    
    // 3. Simular la función getStudentsForCourse con el courseId problemático
    const courseId = '0880d4ca-7232-42dc-abef-1223e00a5c6e-a75b7e0e-1130-486a-ae5e-6f7233e002bf';
    console.log(`\n🎯 Simulando getStudentsForCourse para: ${courseId}`);
    
    // 4. Obtener availableCourses (simulando getAvailableCoursesWithNames)
    const userAssignments = teacherAssignments.filter(assignment => 
      assignment.teacherId === profesor.id
    );
    
    const courseSectionsMap = new Map();
    userAssignments.forEach(assignment => {
      const section = sections.find(s => s.id === assignment.sectionId);
      if (section) {
        const course = courses.find(c => c.id === section.courseId);
        if (course) {
          const key = `${course.id}-${section.id}`;
          if (!courseSectionsMap.has(key)) {
            courseSectionsMap.set(key, {
              id: key,
              courseId: course.id,
              sectionId: section.id, // ✅ CORREGIDO
              name: `${course.name} Sección ${section.name}`,
              originalCourseName: course.name,
              sectionName: section.name
            });
          }
        }
      }
    });
    
    const availableCourses = Array.from(courseSectionsMap.values());
    console.log(`📚 Cursos disponibles: ${availableCourses.length}`);
    
    // 5. Encontrar el curso específico
    const selectedCourseData = availableCourses.find(c => c.id === courseId);
    console.log(`🔍 Curso encontrado: ${selectedCourseData ? '✅ SÍ' : '❌ NO'}`);
    
    if (!selectedCourseData) {
      console.log('❌ No se encontró selectedCourseData');
      return;
    }
    
    const { sectionId, courseId: actualCourseId } = selectedCourseData;
    console.log(`📋 Datos extraídos:`);
    console.log(`   • courseId: ${actualCourseId}`);
    console.log(`   • sectionId: ${sectionId}`);
    
    // 6. Verificar asignación del profesor
    const profesorAsignado = teacherAssignments.some(assignment => 
      assignment.teacherId === profesor.id && assignment.sectionId === sectionId
    );
    console.log(`👨‍🏫 ¿Profesor asignado a sección?: ${profesorAsignado ? '✅ SÍ' : '❌ NO'}`);
    
    if (!profesorAsignado) {
      console.log('❌ El profesor NO está asignado a la sección');
      return;
    }
    
    // 7. Buscar estudiantes en esa sección
    console.log(`\n🔍 Buscando estudiantes en sección: ${sectionId}`);
    
    // Filtrar asignaciones de estudiantes por sección
    const studentAssignmentsInSection = studentAssignments.filter(assignment => 
      assignment.sectionId === sectionId
    );
    
    console.log(`📊 Asignaciones de estudiantes en la sección: ${studentAssignmentsInSection.length}`);
    
    if (studentAssignmentsInSection.length === 0) {
      console.log('❌ No hay asignaciones de estudiantes en esta sección');
      console.log('\n🔍 ANÁLISIS DE ASIGNACIONES DE ESTUDIANTES:');
      
      // Mostrar todas las asignaciones para debug
      studentAssignments.forEach((assignment, i) => {
        console.log(`   ${i + 1}. Estudiante: ${assignment.studentId}, Sección: ${assignment.sectionId}`);
      });
      
      // Verificar si los estudiantes están en users pero sin asignaciones
      const estudiantes = users.filter(u => u.role === 'estudiante');
      console.log(`\n👥 Estudiantes en users: ${estudiantes.length}`);
      
      estudiantes.forEach(estudiante => {
        const tieneAsignacion = studentAssignments.find(a => a.studentId === estudiante.id);
        console.log(`   • ${estudiante.name} (${estudiante.id}): ${tieneAsignacion ? '✅ tiene asignación' : '❌ sin asignación'}`);
        
        if (tieneAsignacion) {
          console.log(`     Sección asignada: ${tieneAsignacion.sectionId}`);
          console.log(`     ¿Coincide con buscada?: ${tieneAsignacion.sectionId === sectionId ? '✅ SÍ' : '❌ NO'}`);
        }
      });
      
      return;
    }
    
    // 8. Obtener datos completos de estudiantes
    const studentsInSection = studentAssignmentsInSection.map(assignment => {
      const student = users.find(u => u.id === assignment.studentId);
      return student ? {
        ...student,
        assignmentId: assignment.id
      } : null;
    }).filter(Boolean);
    
    console.log(`👥 Estudiantes encontrados: ${studentsInSection.length}`);
    
    studentsInSection.forEach((student, i) => {
      console.log(`   ${i + 1}. ${student.name} (ID: ${student.id})`);
    });
    
    console.log(`\n🎉 RESULTADO FINAL:`);
    console.log(`   • Estudiantes que deberían aparecer: ${studentsInSection.length}`);
    console.log(`   • Nombres: ${studentsInSection.map(s => s.name).join(', ')}`);
    
    return {
      success: true,
      estudiantes: studentsInSection.length,
      nombres: studentsInSection.map(s => s.name),
      sectionId: sectionId
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar diagnóstico
console.log('🚀 Iniciando diagnóstico completo...');
const resultado = diagnosticarGetStudentsForCourse();
console.log('\n✅ Resultado del diagnóstico:', resultado);

if (resultado?.success && resultado.estudiantes > 0) {
  console.log('\n🎯 Los estudiantes SÍ deberían aparecer. Verifica que la página esté recargada.');
} else if (resultado?.success && resultado.estudiantes === 0) {
  console.log('\n⚠️ No se encontraron estudiantes. Revisa las asignaciones de estudiantes.');
}
