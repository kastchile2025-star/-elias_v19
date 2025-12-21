// Script de depuración específico para el problema de estudiantes no apareciendo
console.log('🔍 DEBUG: Estudiantes específicos no aparecen');
console.log('================================================');

function debugEstudiantesEspecificos() {
  try {
    // Obtener datos
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    
    const currentUser = auth.user;
    
    console.log('\n📊 DATOS CARGADOS:');
    console.log(`   • Usuario actual: ${currentUser?.displayName} (${currentUser?.role})`);
    console.log(`   • Total usuarios: ${users.length}`);
    console.log(`   • Total cursos: ${courses.length}`);
    console.log(`   • Total secciones: ${sections.length}`);
    console.log(`   • Total asignaciones: ${teacherAssignments.length}`);
    
    if (!currentUser || currentUser.role !== 'teacher') {
      console.log('❌ Error: No hay usuario profesor logueado');
      return;
    }
    
    console.log('\n🎓 ANÁLISIS DEL PROFESOR:');
    console.log(`   • ID: ${currentUser.id}`);
    console.log(`   • Username: ${currentUser.username}`);
    console.log(`   • Cursos activos: ${JSON.stringify(currentUser.activeCourses)}`);
    console.log(`   • Asignaturas: ${JSON.stringify(currentUser.teachingSubjects)}`);
    
    // Simular getAvailableCoursesWithNames()
    console.log('\n📚 SIMULANDO getAvailableCoursesWithNames():');
    
    const userAssignments = teacherAssignments.filter(assignment => 
      assignment.teacherId === currentUser.id
    );
    console.log(`   • Asignaciones encontradas: ${userAssignments.length}`);
    userAssignments.forEach(assignment => {
      console.log(`     - teacherId: ${assignment.teacherId}, sectionId: ${assignment.sectionId}, subject: ${assignment.subjectName}`);
    });
    
    let availableCourses = [];
    
    if (userAssignments.length > 0) {
      console.log('\n   🔄 Usando método de asignaciones específicas...');
      const courseSectionsMap = new Map();
      
      userAssignments.forEach(assignment => {
        const section = sections.find(s => s.id === assignment.sectionId);
        console.log(`     • Asignación ${assignment.sectionId}: sección encontrada = ${!!section}`);
        if (section) {
          console.log(`       - Sección: ${section.name}, courseId: ${section.courseId}`);
          const course = courses.find(c => c.id === section.courseId);
          console.log(`       - Curso encontrado: ${!!course}`);
          if (course) {
            const key = `${course.id}-${section.id}`;
            console.log(`       - Clave generada: ${key}`);
            if (!courseSectionsMap.has(key)) {
              const courseObj = {
                id: key,
                courseId: course.id,
                name: `${course.name} Sección ${section.name}`,
                originalCourseName: course.name,
                sectionName: section.name
              };
              courseSectionsMap.set(key, courseObj);
              console.log(`       - Curso agregado al mapa:`, courseObj);
            }
          }
        }
      });
      
      availableCourses = Array.from(courseSectionsMap.values());
      console.log(`   • Cursos disponibles (método específico): ${availableCourses.length}`);
    } else {
      console.log('\n   🔄 Usando método fallback...');
      const courseIds = currentUser.activeCourses || [];
      availableCourses = courseIds.map(courseId => {
        const course = courses.find(c => c.id === courseId);
        return {
          id: courseId,
          name: course ? course.name : courseId,
          originalCourseName: course ? course.name : courseId
        };
      });
      console.log(`   • Cursos disponibles (fallback): ${availableCourses.length}`);
    }
    
    console.log('\n📋 CURSOS DISPONIBLES FINALES:');
    availableCourses.forEach(course => {
      console.log(`   • ${course.name} (ID: ${course.id}, courseId: ${course.courseId || 'N/A'})`);
    });
    
    // Simular obtención de estudiantes para cada curso
    console.log('\n👥 SIMULANDO getStudentsForCourse() PARA CADA CURSO:');
    
    availableCourses.forEach(selectedCourse => {
      console.log(`\n🔍 Procesando curso: ${selectedCourse.name}`);
      console.log(`   • formData.course sería: ${selectedCourse.id}`);
      
      // Simular la lógica de extracción del courseId
      const actualCourseId = selectedCourse.courseId ? selectedCourse.courseId : selectedCourse.id;
      console.log(`   • actualCourseId extraído: ${actualCourseId}`);
      
      // Simular getStudentsForCourse
      console.log(`   • Buscando estudiantes para courseId: ${actualCourseId}`);
      
      // Método 1: Usando getStudentsFromCourseRelevantToTask
      let students1 = users.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses?.includes(actualCourseId);
        const isAssignedToTeacher = !currentUser.id || !u.assignedTeacherId || u.assignedTeacherId === currentUser.id;
        
        console.log(`     👤 ${u.username}: estudiante=${isStudent}, curso=${isInCourse}, asignado=${isAssignedToTeacher}`);
        return isStudent && isInCourse && isAssignedToTeacher;
      }).map(u => ({ id: u.id, username: u.username, displayName: u.displayName || u.username }));
      
      console.log(`   • Estudiantes encontrados (método 1): ${students1.length}`);
      
      // Método 2: Alternativo
      let students2 = users.filter(u => {
        const isStudent = u.role === 'student';
        const isInCourse = u.activeCourses && u.activeCourses.includes(actualCourseId);
        const isAssignedToTeacher = u.assignedTeacher === currentUser.username ||
          (u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentUser.username));
        
        console.log(`     👤 ${u.username} (alt): estudiante=${isStudent}, curso=${isInCourse}, asignado=${isAssignedToTeacher}`);
        return isStudent && isInCourse && isAssignedToTeacher;
      }).map(u => ({ id: u.id, username: u.username, displayName: u.displayName || u.username }));
      
      console.log(`   • Estudiantes encontrados (método 2): ${students2.length}`);
      
      if (students1.length > 0) {
        console.log(`     ✅ Estudiantes (método 1):`);
        students1.forEach(s => console.log(`       - ${s.displayName} (@${s.username})`));
      }
      
      if (students2.length > 0) {
        console.log(`     ✅ Estudiantes (método 2):`);
        students2.forEach(s => console.log(`       - ${s.displayName} (@${s.username})`));
      }
      
      if (students1.length === 0 && students2.length === 0) {
        console.log(`     ❌ No se encontraron estudiantes para este curso`);
      }
    });
    
    // Análisis de estudiantes sin asignaciones
    console.log('\n🔍 ANÁLISIS DE ESTUDIANTES SIN ASIGNACIONES:');
    const studentsWithoutAssignments = users.filter(u => 
      u.role === 'student' && 
      !u.assignedTeacher && 
      (!u.assignedTeachers || Object.keys(u.assignedTeachers).length === 0)
    );
    
    console.log(`   • Estudiantes sin profesor: ${studentsWithoutAssignments.length}`);
    studentsWithoutAssignments.forEach(s => {
      console.log(`     - ${s.displayName} (@${s.username}) - Curso: ${s.activeCourses?.[0] || 'Sin curso'}`);
    });
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    
    if (availableCourses.length === 0) {
      console.log('   ❌ No hay cursos disponibles para el profesor');
      console.log('   📝 Acción: Asignar cursos al profesor en activeCourses o crear asignaciones específicas');
    }
    
    if (userAssignments.length === 0) {
      console.log('   ⚠️  No hay asignaciones específicas de profesor-sección-materia');
      console.log('   📝 Acción: Ir a Gestión de Usuarios > Asignaciones y crear asignaciones específicas');
    }
    
    const totalStudentsForTeacher = users.filter(u => 
      u.role === 'student' && (
        u.assignedTeacher === currentUser.username ||
        (u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentUser.username))
      )
    ).length;
    
    if (totalStudentsForTeacher === 0) {
      console.log('   ❌ No hay estudiantes asignados al profesor actual');
      console.log('   📝 Acción: Asignar estudiantes al profesor usando assignedTeacher o assignedTeachers');
    }
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error);
  }
}

// Función para crear asignaciones de prueba
function crearAsignacionesPrueba() {
  console.log('\n🚀 CREANDO ASIGNACIONES DE PRUEBA...');
  
  try {
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    const currentUser = auth.user;
    
    if (!currentUser || currentUser.role !== 'teacher') {
      console.log('❌ Necesitas estar logueado como profesor');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    // Crear/actualizar estudiantes asignados al profesor actual
    const estudiantesPrueba = [
      'ana.estudiante',
      'luis.estudiante', 
      'sofia.estudiante',
      'maria.estudiante'
    ];
    
    let estudiantesCreados = 0;
    let estudiantesActualizados = 0;
    
    estudiantesPrueba.forEach((username, index) => {
      const existingStudent = users.find(u => u.username === username);
      
      const studentData = {
        id: existingStudent?.id || `student-${username}`,
        username: username,
        displayName: existingStudent?.displayName || username.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
        role: 'student',
        activeCourses: ['4to Básico'],
        assignedTeacher: currentUser.username,
        assignedTeachers: {
          'Matemáticas': currentUser.username,
          'Lenguaje y Comunicación': currentUser.username,
          'Ciencias Naturales': currentUser.username,
          'Historia, Geografía y Ciencias Sociales': currentUser.username
        }
      };
      
      if (existingStudent) {
        // Actualizar estudiante existente
        Object.assign(existingStudent, studentData);
        estudiantesActualizados++;
        console.log(`   ✅ Actualizado: ${studentData.displayName}`);
      } else {
        // Crear nuevo estudiante
        users.push(studentData);
        estudiantesCreados++;
        console.log(`   ✅ Creado: ${studentData.displayName}`);
      }
    });
    
    // Guardar cambios
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    
    console.log(`\n🎉 Proceso completado:`);
    console.log(`   • Estudiantes creados: ${estudiantesCreados}`);
    console.log(`   • Estudiantes actualizados: ${estudiantesActualizados}`);
    console.log(`   • Todos asignados al profesor: ${currentUser.displayName}`);
    console.log('\n🔄 Recarga la página y prueba crear una tarea nuevamente');
    
  } catch (error) {
    console.error('❌ Error creando asignaciones:', error);
  }
}

// Ejecutar debug automáticamente
debugEstudiantesEspecificos();

// Exportar funciones
window.debugEstudiantesEspecificos = debugEstudiantesEspecificos;
window.crearAsignacionesPrueba = crearAsignacionesPrueba;

console.log('\n🛠️  FUNCIONES DISPONIBLES:');
console.log('   • debugEstudiantesEspecificos() - Debug completo del problema');
console.log('   • crearAsignacionesPrueba() - Crear estudiantes de prueba asignados al profesor actual');
