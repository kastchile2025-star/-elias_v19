// Script para diagnosticar las asignaciones profesor-estudiante y verificar la funcionalidad de tareas
console.log('🔍 DIAGNÓSTICO DE ASIGNACIONES PROFESOR-ESTUDIANTE PARA TAREAS');
console.log('================================================================');

function diagnosticarAsignaciones() {
  try {
    // Obtener datos del localStorage
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    
    console.log('\n📊 RESUMEN GENERAL:');
    console.log(`   • Usuarios totales: ${users.length}`);
    console.log(`   • Profesores: ${users.filter(u => u.role === 'teacher').length}`);
    console.log(`   • Estudiantes: ${users.filter(u => u.role === 'student').length}`);
    console.log(`   • Cursos: ${courses.length}`);
    console.log(`   • Secciones: ${sections.length}`);
    console.log(`   • Asignaciones profesor-sección: ${teacherAssignments.length}`);
    
    // Usuario actual
    const currentUser = auth.user;
    console.log(`\n👤 USUARIO ACTUAL: ${currentUser?.displayName || 'No logueado'} (${currentUser?.role || 'N/A'})`);
    
    if (currentUser?.role === 'teacher') {
      console.log('\n🎓 ANÁLISIS PARA PROFESOR:');
      console.log(`   • Username: ${currentUser.username}`);
      console.log(`   • ID: ${currentUser.id}`);
      console.log(`   • Cursos activos: ${currentUser.activeCourses?.join(', ') || 'Ninguno'}`);
      console.log(`   • Asignaturas: ${currentUser.teachingSubjects?.join(', ') || 'Ninguna'}`);
      
      // Verificar asignaciones específicas del profesor
      const profAssignments = teacherAssignments.filter(ta => ta.teacherId === currentUser.id);
      console.log(`\n📋 ASIGNACIONES ESPECÍFICAS:`)
      if (profAssignments.length > 0) {
        profAssignments.forEach(assignment => {
          const section = sections.find(s => s.id === assignment.sectionId);
          const course = section ? courses.find(c => c.id === section.courseId) : null;
          console.log(`   • ${course?.name || 'Curso desconocido'} - Sección ${section?.name || 'N/A'}: ${assignment.subjectName}`);
        });
      } else {
        console.log('   ⚠️  No hay asignaciones específicas registradas');
      }
      
      // Estudiantes asignados al profesor
      const assignedStudents = users.filter(u => 
        u.role === 'student' && (
          u.assignedTeacher === currentUser.username ||
          (u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentUser.username))
        )
      );
      
      console.log(`\n👨‍🎓 ESTUDIANTES ASIGNADOS (${assignedStudents.length}):`);
      if (assignedStudents.length > 0) {
        assignedStudents.forEach(student => {
          console.log(`   • ${student.displayName} (@${student.username}) - Curso: ${student.activeCourses?.[0] || 'Sin curso'}`);
          if (student.assignedTeachers) {
            const subjects = Object.keys(student.assignedTeachers).filter(subject => 
              student.assignedTeachers[subject] === currentUser.username
            );
            console.log(`     Asignaturas: ${subjects.join(', ')}`);
          }
        });
      } else {
        console.log('   ⚠️  No hay estudiantes asignados');
      }
      
      // Verificar configuración para crear tareas
      console.log(`\n🎯 VERIFICACIÓN PARA CREAR TAREAS:`);
      
      // Simular la función getAvailableCoursesWithNames
      let availableCourses = [];
      if (profAssignments.length > 0) {
        const courseSectionsMap = new Map();
        profAssignments.forEach(assignment => {
          const section = sections.find(s => s.id === assignment.sectionId);
          if (section) {
            const course = courses.find(c => c.id === section.courseId);
            if (course) {
              const key = `${course.id}-${section.id}`;
              if (!courseSectionsMap.has(key)) {
                courseSectionsMap.set(key, {
                  id: key,
                  courseId: course.id,
                  name: `${course.name} Sección ${section.name}`,
                  originalCourseName: course.name,
                  sectionName: section.name
                });
              }
            }
          }
        });
        availableCourses = Array.from(courseSectionsMap.values());
      } else {
        // Fallback al método original
        const courseIds = currentUser.activeCourses || [];
        availableCourses = courseIds.map(courseId => ({
          id: courseId,
          name: courses.find(c => c.id === courseId)?.name || courseId,
          originalCourseName: courses.find(c => c.id === courseId)?.name || courseId
        }));
      }
      
      console.log(`   • Cursos disponibles para crear tareas: ${availableCourses.length}`);
      availableCourses.forEach(course => {
        console.log(`     - ${course.name} (ID: ${course.id})`);
        
        // Simular getStudentsForCourse para cada curso
        const courseId = course.courseId || course.id;
        const studentsInCourse = users.filter(u => 
          u.role === 'student' && 
          u.activeCourses?.includes(courseId) &&
          (u.assignedTeacher === currentUser.username ||
           (u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentUser.username)))
        );
        console.log(`       Estudiantes disponibles: ${studentsInCourse.length}`);
        studentsInCourse.forEach(student => {
          console.log(`         → ${student.displayName}`);
        });
      });
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    if (currentUser?.role === 'teacher') {
      const assignedStudents = users.filter(u => 
        u.role === 'student' && (
          u.assignedTeacher === currentUser.username ||
          (u.assignedTeachers && Object.values(u.assignedTeachers).includes(currentUser.username))
        )
      );
      
      if (assignedStudents.length === 0) {
        console.log('   ⚠️  Necesitas tener estudiantes asignados para crear tareas específicas');
        console.log('   📝 Acción: Ir a Gestión de Usuarios > Asignaciones para asignar estudiantes');
      }
      
      if (teacherAssignments.filter(ta => ta.teacherId === currentUser.id).length === 0) {
        console.log('   ⚠️  No tienes asignaciones específicas de curso-sección-asignatura');
        console.log('   📝 Acción: Usar el sistema de asignaciones para configurar tus cursos específicos');
      }
      
      if (assignedStudents.length > 0) {
        console.log('   ✅ Todo configurado correctamente para crear tareas');
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

// Función para crear datos de prueba si no existen
function crearDatosPrueba() {
  console.log('\n🚀 CREANDO DATOS DE PRUEBA...');
  
  try {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const auth = JSON.parse(localStorage.getItem('smart-student-auth') || '{}');
    
    if (!auth.user || auth.user.role !== 'teacher') {
      console.log('❌ Necesitas estar logueado como profesor para crear datos de prueba');
      return;
    }
    
    const currentTeacher = auth.user;
    
    // Crear algunos estudiantes de prueba si no existen
    const estudiantesPrueba = [
      {
        id: 'student-prueba-1',
        username: 'ana.estudiante',
        displayName: 'Ana Estudiante',
        role: 'student',
        activeCourses: ['4to Básico'],
        assignedTeacher: currentTeacher.username,
        assignedTeachers: {
          'Matemáticas': currentTeacher.username,
          'Lenguaje y Comunicación': currentTeacher.username,
          'Ciencias Naturales': currentTeacher.username,
          'Historia, Geografía y Ciencias Sociales': currentTeacher.username
        }
      },
      {
        id: 'student-prueba-2',
        username: 'luis.estudiante',
        displayName: 'Luis Estudiante',
        role: 'student',
        activeCourses: ['4to Básico'],
        assignedTeacher: currentTeacher.username,
        assignedTeachers: {
          'Matemáticas': currentTeacher.username,
          'Lenguaje y Comunicación': currentTeacher.username,
          'Ciencias Naturales': currentTeacher.username,
          'Historia, Geografía y Ciencias Sociales': currentTeacher.username
        }
      },
      {
        id: 'student-prueba-3',
        username: 'sofia.estudiante',
        displayName: 'Sofia Estudiante',
        role: 'student',
        activeCourses: ['5to Básico'],
        assignedTeacher: currentTeacher.username,
        assignedTeachers: {
          'Matemáticas': currentTeacher.username,
          'Lenguaje y Comunicación': currentTeacher.username,
          'Ciencias Naturales': currentTeacher.username,
          'Historia, Geografía y Ciencias Sociales': currentTeacher.username
        }
      }
    ];
    
    let usuariosCreados = 0;
    estudiantesPrueba.forEach(estudiante => {
      if (!users.find(u => u.username === estudiante.username)) {
        users.push(estudiante);
        usuariosCreados++;
        console.log(`   ✅ Creado estudiante: ${estudiante.displayName}`);
      }
    });
    
    if (usuariosCreados > 0) {
      localStorage.setItem('smart-student-users', JSON.stringify(users));
      console.log(`\n✅ Se crearon ${usuariosCreados} estudiantes de prueba`);
    } else {
      console.log('\n📝 Los estudiantes de prueba ya existen');
    }
    
    // Crear cursos básicos si no existen
    let courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const cursosBasicos = [
      { id: '4to Básico', name: '4to Básico' },
      { id: '5to Básico', name: '5to Básico' }
    ];
    
    let cursosCreados = 0;
    cursosBasicos.forEach(curso => {
      if (!courses.find(c => c.id === curso.id)) {
        courses.push(curso);
        cursosCreados++;
      }
    });
    
    if (cursosCreados > 0) {
      localStorage.setItem('smart-student-courses', JSON.stringify(courses));
      console.log(`✅ Se crearon ${cursosCreados} cursos básicos`);
    }
    
    console.log('\n🎉 Datos de prueba configurados. Recarga la página y prueba crear una tarea.');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

// Ejecutar diagnóstico automáticamente
diagnosticarAsignaciones();

// Exportar funciones para uso manual
window.diagnosticarAsignaciones = diagnosticarAsignaciones;
window.crearDatosPrueba = crearDatosPrueba;

console.log('\n🛠️  FUNCIONES DISPONIBLES:');
console.log('   • diagnosticarAsignaciones() - Ejecutar diagnóstico completo');
console.log('   • crearDatosPrueba() - Crear estudiantes y datos de prueba');
