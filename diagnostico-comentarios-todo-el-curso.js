// 🔍 DIAGNÓSTICO: Comentarios en Tareas "Todo el Curso"
// Verificar que el filtrado dinámico está funcionando correctamente

function diagnosticarComentariosTodoElCurso() {
  console.clear();
  console.log('🔍 DIAGNÓSTICO: Comentarios en Tareas "Todo el Curso"');
  console.log('='.repeat(60));
  
  try {
    // 1. Obtener datos del localStorage
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log('📊 ESTADÍSTICAS GENERALES:');
    console.log(`Total comentarios: ${comments.length}`);
    console.log(`Total tareas: ${tasks.length}`);
    console.log(`Total usuarios: ${users.length}`);
    console.log(`Total asignaciones estudiante: ${studentAssignments.length}`);
    console.log();

    // 2. Filtrar tareas de "Todo el Curso"
    const courseWideTasks = tasks.filter(task => task.assignedTo === 'course');
    console.log('🏫 TAREAS "TODO EL CURSO":');
    console.log(`Total tareas de curso: ${courseWideTasks.length}`);
    
    courseWideTasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.title}" - Curso: ${task.courseSectionId || task.course} - ID: ${task.id}`);
    });
    console.log();

    // 3. Analizar comentarios en tareas de curso
    const commentsInCourseTasks = comments.filter(comment => {
      const task = tasks.find(t => t.id === comment.taskId);
      return task && task.assignedTo === 'course';
    });

    console.log('💬 COMENTARIOS EN TAREAS DE CURSO:');
    console.log(`Total comentarios en tareas de curso: ${commentsInCourseTasks.length}`);
    
    commentsInCourseTasks.forEach((comment, index) => {
      const task = tasks.find(t => t.id === comment.taskId);
      const author = comment.teacherUsername || comment.studentUsername;
      const isSubmission = comment.isSubmission ? '📋 ENTREGA' : '💭 COMENTARIO';
      
      console.log(`${index + 1}. ${isSubmission} en "${task?.title}" por ${author}`);
      console.log(`   - Texto: "${comment.content.substring(0, 50)}..."`);
      console.log(`   - Curso tarea: ${task?.courseSectionId || task?.course}`);
      console.log(`   - Leído por: [${comment.readBy?.join(', ') || 'nadie'}]`);
      console.log();
    });

    // 4. Simular filtrado para cada estudiante
    console.log('👥 SIMULACIÓN DE FILTRADO POR ESTUDIANTE:');
    const students = users.filter(u => u.role === 'student');
    
    students.forEach(student => {
      console.log(`\n📝 Estudiante: ${student.username} (${student.name})`);
      
      // Obtener asignaciones del estudiante
      const studentCourseAssignments = studentAssignments.filter(a => a.studentId === student.id);
      console.log(`   Asignado a ${studentCourseAssignments.length} curso(s)-sección(es):`);
      
      studentCourseAssignments.forEach(assignment => {
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        console.log(`   - ${course?.name || 'Curso desconocido'} - ${section?.name || 'Sección desconocida'}`);
      });
      
      // Filtrar comentarios visibles para este estudiante
      const visibleComments = commentsInCourseTasks.filter(comment => {
        // Excluir comentarios propios
        if (comment.studentUsername === student.username) return false;
        
        // Excluir entregas de otros estudiantes
        if (comment.isSubmission) return false;
        
        // Excluir ya leídos
        if (comment.readBy?.includes(student.username)) return false;
        
        // Verificar acceso a la tarea
        const task = tasks.find(t => t.id === comment.taskId);
        if (!task || task.assignedTo !== 'course') return false;
        
        // Verificar si el estudiante está asignado a este curso-sección
        const taskCourseId = task.courseSectionId || task.course;
        
        // Buscar información del curso-sección de la tarea
        const matchingAssignment = studentCourseAssignments.find(assignment => {
          // Crear el ID compuesto esperado
          const course = courses.find(c => c.id === assignment.courseId);
          const section = sections.find(s => s.id === assignment.sectionId);
          const compositeId = `${course?.id}-${section?.id}`;
          
          return compositeId === taskCourseId || 
                 assignment.courseId === taskCourseId ||
                 course?.id === taskCourseId;
        });
        
        return !!matchingAssignment;
      });
      
      console.log(`   💬 Comentarios visibles: ${visibleComments.length}`);
      
      visibleComments.forEach(comment => {
        const task = tasks.find(t => t.id === comment.taskId);
        const author = comment.teacherUsername || comment.studentUsername;
        console.log(`     - "${task?.title}" por ${author}: "${comment.content.substring(0, 30)}..."`);
      });
    });

    // 5. Verificar integridad del sistema
    console.log('\n🔧 VERIFICACIÓN DE INTEGRIDAD:');
    
    // Verificar tareas sin courseId definido
    const tasksWithoutCourse = courseWideTasks.filter(task => !task.courseSectionId && !task.course);
    if (tasksWithoutCourse.length > 0) {
      console.warn(`⚠️ ${tasksWithoutCourse.length} tareas de curso sin ID de curso definido:`);
      tasksWithoutCourse.forEach(task => console.warn(`   - "${task.title}" (ID: ${task.id})`));
    }
    
    // Verificar comentarios huérfanos
    const orphanComments = comments.filter(comment => {
      return !tasks.find(t => t.id === comment.taskId);
    });
    if (orphanComments.length > 0) {
      console.warn(`⚠️ ${orphanComments.length} comentarios sin tarea asociada:`);
      orphanComments.forEach(comment => console.warn(`   - Comentario ID: ${comment.id}, TaskID: ${comment.taskId}`));
    }
    
    // Verificar estudiantes sin asignaciones
    const studentsWithoutAssignments = students.filter(student => {
      return !studentAssignments.find(a => a.studentId === student.id);
    });
    if (studentsWithoutAssignments.length > 0) {
      console.warn(`⚠️ ${studentsWithoutAssignments.length} estudiantes sin asignaciones de curso:`);
      studentsWithoutAssignments.forEach(student => console.warn(`   - ${student.username} (${student.name})`));
    }

    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('='.repeat(60));
    
    return {
      totalComments: comments.length,
      courseWideTasks: courseWideTasks.length,
      commentsInCourseTasks: commentsInCourseTasks.length,
      studentsAnalyzed: students.length,
      tasksWithoutCourse: tasksWithoutCourse.length,
      orphanComments: orphanComments.length,
      studentsWithoutAssignments: studentsWithoutAssignments.length
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return null;
  }
}

// 🎯 Función específica para probar filtrado de un estudiante
function probarFiltradoEstudiante(username) {
  console.clear();
  console.log(`🎯 PRUEBA DE FILTRADO PARA: ${username}`);
  console.log('='.repeat(50));
  
  try {
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    const student = users.find(u => u.username === username && u.role === 'student');
    if (!student) {
      console.error(`❌ Estudiante "${username}" no encontrado`);
      return;
    }
    
    console.log(`👤 Estudiante: ${student.name} (${student.username})`);
    console.log(`🆔 ID: ${student.id}`);
    
    // Simular el mismo filtrado que usa la aplicación
    const unreadComments = comments.filter(comment => {
      // No mostrar comentarios propios
      if (comment.studentUsername === student.username) {
        console.log(`🚫 Filtrado: Comentario propio - "${comment.content.substring(0, 30)}..."`);
        return false;
      }
      
      // No mostrar entregas de otros estudiantes
      if (comment.isSubmission) {
        console.log(`🚫 Filtrado: Entrega de otro estudiante - "${comment.content.substring(0, 30)}..."`);
        return false;
      }
      
      // Verificar si ya fue leído
      if (comment.readBy?.includes(student.username)) {
        console.log(`🚫 Filtrado: Ya leído - "${comment.content.substring(0, 30)}..."`);
        return false;
      }
      
      // Verificar tarea asociada
      const task = tasks.find(t => t.id === comment.taskId);
      if (!task) {
        console.log(`🚫 Filtrado: Tarea no encontrada - TaskID: ${comment.taskId}`);
        return false;
      }
      
      // Si es tarea específica para estudiantes
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        const isAssigned = task.assignedStudentIds.includes(student.id);
        console.log(`${isAssigned ? '✅' : '🚫'} Tarea específica "${task.title}": ${isAssigned ? 'Asignado' : 'NO asignado'}`);
        return isAssigned;
      }
      
      // Si es tarea de curso completo
      if (task.assignedTo === 'course') {
        const taskCourseId = task.courseSectionId || task.course;
        
        // Verificar asignación usando student-assignments
        const hasAccess = studentAssignments.some(assignment => {
          const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
          const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
          
          const course = courses.find(c => c.id === assignment.courseId);
          const section = sections.find(s => s.id === assignment.sectionId);
          const compositeId = `${course?.id}-${section?.id}`;
          
          return assignment.studentId === student.id && 
                 (compositeId === taskCourseId || assignment.courseId === taskCourseId);
        });
        
        console.log(`${hasAccess ? '✅' : '🚫'} Tarea de curso "${task.title}" (${taskCourseId}): ${hasAccess ? 'Tiene acceso' : 'SIN acceso'}`);
        return hasAccess;
      }
      
      return false;
    });
    
    console.log(`\n📊 RESULTADO: ${unreadComments.length} comentarios no leídos visibles`);
    
    unreadComments.forEach((comment, index) => {
      const task = tasks.find(t => t.id === comment.taskId);
      const author = comment.teacherUsername || comment.studentUsername;
      console.log(`${index + 1}. "${task?.title}" por ${author}`);
      console.log(`   Texto: "${comment.content.substring(0, 50)}..."`);
    });
    
    return unreadComments;
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return null;
  }
}

// Auto-ejecutar diagnóstico al cargar
console.log('🔧 Script de diagnóstico cargado. Funciones disponibles:');
console.log('• diagnosticarComentariosTodoElCurso() - Diagnóstico completo');
console.log('• probarFiltradoEstudiante("username") - Prueba específica');
console.log('\n▶️ Ejecutando diagnóstico automático...');
diagnosticarComentariosTodoElCurso();
