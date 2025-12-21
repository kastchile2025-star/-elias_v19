// 🧪 PRUEBA EN VIVO: Filtrado Dinámico de Comentarios "Todo el Curso"
// Ejecutar en consola del navegador para verificar funcionamiento

function pruebaFiltradoDinamicoEnVivo() {
  console.clear();
  console.log('🧪 PRUEBA EN VIVO: Filtrado Dinámico de Comentarios');
  console.log('='.repeat(55));
  
  // Función helper para verificar asignación de estudiante a tarea
  const checkStudentAssignmentToTask = (task, studentId, studentUsername) => {
    console.log(`🔍 Verificando acceso de ${studentUsername} a "${task.title}"`);
    
    // Si la tarea está asignada a estudiantes específicos
    if (task.assignedTo === 'student' && task.assignedStudentIds) {
      const isDirectlyAssigned = task.assignedStudentIds.includes(studentId);
      console.log(`🎯 Asignación directa: ${isDirectlyAssigned ? '✅' : '❌'}`);
      return isDirectlyAssigned;
    }
    
    // Si la tarea está asignada a todo el curso
    if (task.assignedTo === 'course') {
      const taskCourseId = task.courseSectionId || task.course;
      
      if (!taskCourseId) {
        console.log(`⚠️ Tarea sin courseId`);
        return false;
      }
      
      // Obtener datos del localStorage
      const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
      const studentData = users.find(u => u.id === studentId || u.username === studentUsername);
      
      if (!studentData) {
        console.log(`❌ Estudiante no encontrado`);
        return false;
      }
      
      // Verificar asignaciones específicas
      const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
      const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
      const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
      
      // Buscar asignación que coincida con el curso de la tarea
      const matchingAssignment = studentAssignments.find(assignment => {
        if (assignment.studentId !== studentId) return false;
        
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        const compositeId = `${course?.id}-${section?.id}`;
        
        return compositeId === taskCourseId || assignment.courseId === taskCourseId;
      });
      
      if (matchingAssignment) {
        console.log(`✅ Acceso por asignación específica`);
        return true;
      }
      
      // Fallback: verificar por activeCourses
      const isInActiveCourses = studentData.activeCourses?.includes(taskCourseId) || false;
      console.log(`🔄 Fallback activeCourses: ${isInActiveCourses ? '✅' : '❌'}`);
      
      return isInActiveCourses;
    }
    
    // Compatibilidad con versiones anteriores
    if (task.assignedStudents && task.assignedStudents.includes(studentUsername)) {
      console.log(`🔄 Fallback assignedStudents: ✅`);
      return true;
    }
    
    console.log(`❌ Sin acceso`);
    return false;
  };
  
  try {
    // 1. Obtener datos
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    console.log('📊 DATOS CARGADOS:');
    console.log(`Comentarios: ${comments.length}`);
    console.log(`Tareas: ${tasks.length}`);
    console.log(`Usuarios: ${users.length}`);
    console.log();
    
    // 2. Identificar estudiantes
    const students = users.filter(u => u.role === 'student');
    console.log(`👥 ESTUDIANTES ENCONTRADOS: ${students.length}`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.username} (${student.name})`);
    });
    console.log();
    
    // 3. Probar filtrado para cada estudiante
    students.forEach(student => {
      console.log(`\n🎯 PRUEBA PARA: ${student.username}`);
      console.log('-'.repeat(40));
      
      // Simular la lógica de loadUnreadComments
      const unreadComments = comments.filter(comment => {
        // No mostrar comentarios propios
        if (comment.studentUsername === student.username) {
          return false;
        }
        
        // No mostrar entregas de otros estudiantes
        if (comment.isSubmission) {
          return false;
        }
        
        // Verificar si ya fue leído
        if (comment.readBy?.includes(student.username)) {
          return false;
        }
        
        // Verificar tarea asociada
        const task = tasks.find(t => t.id === comment.taskId);
        if (!task) {
          return false;
        }
        
        // Si es tarea específica para estudiantes
        if (task.assignedTo === 'student' && task.assignedStudentIds) {
          return task.assignedStudentIds.includes(student.id);
        }
        
        // Para tareas de curso completo, usar el filtro
        return checkStudentAssignmentToTask(task, student.id, student.username);
      });
      
      console.log(`📬 Comentarios no leídos visibles: ${unreadComments.length}`);
      
      if (unreadComments.length > 0) {
        unreadComments.forEach((comment, index) => {
          const task = tasks.find(t => t.id === comment.taskId);
          const author = comment.authorUsername || comment.teacherUsername || comment.studentUsername || 'Autor desconocido';
          const taskType = task?.assignedTo === 'course' ? '🏫 TODO EL CURSO' : '🎯 ESPECÍFICA';
          const content = comment.comment || comment.content || comment.text || 'Sin contenido';
          
          console.log(`  ${index + 1}. ${taskType} "${task?.title || 'Sin título'}"`);
          console.log(`     Por: ${author} (${comment.authorRole || 'rol desconocido'})`);
          console.log(`     Texto: "${content.substring(0, 40)}..."`);
        });
      }
    });
    
    // 4. Verificar tareas de "Todo el Curso"
    const courseWideTasks = tasks.filter(task => task.assignedTo === 'course');
    console.log(`\n🏫 TAREAS "TODO EL CURSO": ${courseWideTasks.length}`);
    
    courseWideTasks.forEach((task, index) => {
      const taskComments = comments.filter(c => c.taskId === task.id && !c.isSubmission);
      console.log(`${index + 1}. "${task.title}" - ${taskComments.length} comentarios`);
      console.log(`   Curso: ${task.courseSectionId || task.course}`);
      
      // Verificar qué estudiantes tienen acceso
      const studentsWithAccess = students.filter(student => 
        checkStudentAssignmentToTask(task, student.id, student.username)
      );
      
      console.log(`   Estudiantes con acceso: ${studentsWithAccess.length}/${students.length}`);
      studentsWithAccess.forEach(student => {
        console.log(`     - ${student.username}`);
      });
    });
    
    console.log('\n✅ PRUEBA COMPLETADA');
    console.log('='.repeat(55));
    
    return {
      totalStudents: students.length,
      courseWideTasks: courseWideTasks.length,
      totalComments: comments.length
    };
    
  } catch (error) {
    console.error('❌ Error en prueba en vivo:', error);
    return null;
  }
}

// 🎮 Función interactiva para probar con un estudiante específico
function probarEstudianteEspecifico(username) {
  if (!username) {
    console.log('📝 Uso: probarEstudianteEspecifico("nombre_usuario")');
    return;
  }
  
  console.clear();
  console.log(`🎮 PRUEBA INTERACTIVA PARA: ${username}`);
  console.log('='.repeat(45));
  
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const student = users.find(u => u.username === username && u.role === 'student');
  
  if (!student) {
    console.error(`❌ Estudiante "${username}" no encontrado`);
    console.log('📋 Estudiantes disponibles:');
    users.filter(u => u.role === 'student').forEach((s, i) => {
      console.log(`${i + 1}. ${s.username} (${s.name})`);
    });
    return;
  }
  
  // Simular el filtrado paso a paso
  console.log(`👤 Estudiante: ${student.name}`);
  console.log(`🆔 ID: ${student.id}`);
  console.log();
  
  const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
  const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
  
  console.log('🔍 PROCESANDO COMENTARIOS:');
  
  let visibleCount = 0;
  
  comments.forEach((comment, index) => {
    const task = tasks.find(t => t.id === comment.taskId);
    const author = comment.authorUsername || comment.teacherUsername || comment.studentUsername || 'Autor desconocido';
    const content = comment.comment || comment.content || comment.text || 'Sin contenido';
    
    console.log(`\n${index + 1}. Comentario por ${author} (${comment.authorRole || 'rol desconocido'}):`);
    console.log(`   "${content.substring(0, 50)}..."`);
    console.log(`   Tarea: "${task?.title || 'Tarea no encontrada'}"`);
    
    // Aplicar filtros paso a paso
    if (comment.studentUsername === student.username) {
      console.log(`   🚫 FILTRADO: Comentario propio`);
      return;
    }
    
    if (comment.isSubmission) {
      console.log(`   🚫 FILTRADO: Es una entrega`);
      return;
    }
    
    if (comment.readBy?.includes(student.username)) {
      console.log(`   🚫 FILTRADO: Ya leído`);
      return;
    }
    
    if (!task) {
      console.log(`   🚫 FILTRADO: Tarea no encontrada`);
      return;
    }
    
    // Verificar acceso a la tarea
    let hasAccess = false;
    
    if (task.assignedTo === 'student' && task.assignedStudentIds) {
      hasAccess = task.assignedStudentIds.includes(student.id);
      console.log(`   ${hasAccess ? '✅' : '🚫'} Tarea específica: ${hasAccess ? 'Asignado' : 'NO asignado'}`);
    } else if (task.assignedTo === 'course') {
      // Verificar acceso a tarea de curso
      const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
      const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
      const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
      
      const taskCourseId = task.courseSectionId || task.course;
      
      hasAccess = studentAssignments.some(assignment => {
        if (assignment.studentId !== student.id) return false;
        
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        const compositeId = `${course?.id}-${section?.id}`;
        
        return compositeId === taskCourseId || assignment.courseId === taskCourseId;
      });
      
      console.log(`   ${hasAccess ? '✅' : '🚫'} Tarea de curso (${taskCourseId}): ${hasAccess ? 'Tiene acceso' : 'SIN acceso'}`);
    }
    
    if (hasAccess) {
      visibleCount++;
      console.log(`   ✅ VISIBLE para ${student.username}`);
    }
  });
  
  console.log(`\n📊 RESUMEN: ${visibleCount} comentarios visibles de ${comments.length} totales`);
}

// 🔍 Función para inspeccionar la estructura exacta de los datos
function inspeccionarDatos() {
  console.clear();
  console.log('🔍 INSPECCIÓN DETALLADA DE DATOS');
  console.log('='.repeat(40));
  
  try {
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    
    console.log('📝 ESTRUCTURA DE COMENTARIOS:');
    comments.forEach((comment, index) => {
      console.log(`\n${index + 1}. Comentario:`);
      console.log('   Propiedades disponibles:', Object.keys(comment));
      console.log('   ID:', comment.id);
      console.log('   TaskID:', comment.taskId);
      console.log('   Autor:', comment.authorUsername);
      console.log('   Rol autor:', comment.authorRole);
      console.log('   Autor (teacher):', comment.teacherUsername);
      console.log('   Autor (student):', comment.studentUsername);
      console.log('   Contenido (comment):', comment.comment);
      console.log('   Contenido (content):', comment.content);
      console.log('   Contenido (text):', comment.text);
      console.log('   Es entrega:', comment.isSubmission);
      console.log('   Leído por:', comment.readBy);
      console.log('   Estructura completa:', JSON.stringify(comment, null, 2));
    });
    
    console.log('\n📋 ESTRUCTURA DE TAREAS:');
    tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. Tarea:`);
      console.log('   Propiedades disponibles:', Object.keys(task));
      console.log('   ID:', task.id);
      console.log('   Título:', task.title);
      console.log('   Asignada a:', task.assignedTo);
      console.log('   Curso/Sección:', task.courseSectionId || task.course);
      console.log('   Estudiantes asignados:', task.assignedStudentIds);
      console.log('   Estructura completa:', JSON.stringify(task, null, 2));
    });
    
    return { comments, tasks };
    
  } catch (error) {
    console.error('❌ Error en inspección:', error);
    return null;
  }
}

// 🎯 Análisis específico de los datos actuales
function analizarDatosActuales() {
  console.clear();
  console.log('🎯 ANÁLISIS DE DATOS ACTUALES');
  console.log('='.repeat(45));
  
  try {
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    
    console.log('📊 RESUMEN:');
    console.log(`• ${comments.length} comentarios`);
    console.log(`• ${tasks.length} tareas`);
    console.log(`• ${users.filter(u => u.role === 'student').length} estudiantes`);
    console.log();
    
    // Analizar la tarea específica
    const task = tasks[0];
    console.log('📋 TAREA "TODO EL CURSO":');
    console.log(`• Título: "${task.title}"`);
    console.log(`• ID: ${task.id}`);
    console.log(`• Asignada a: ${task.assignedTo}`);
    console.log(`• Curso-Sección ID: ${task.courseSectionId}`);
    console.log();
    
    // Analizar los comentarios
    console.log('💬 COMENTARIOS:');
    comments.forEach((comment, index) => {
      console.log(`${index + 1}. Por ${comment.authorUsername} (${comment.authorRole}):`);
      console.log(`   "${comment.comment}"`);
      console.log(`   Leído por: [${comment.readBy.join(', ') || 'nadie'}]`);
    });
    console.log();
    
    // Verificar qué estudiantes deberían ver cada comentario
    console.log('🔍 ANÁLISIS DE VISIBILIDAD POR ESTUDIANTE:');
    
    const students = users.filter(u => u.role === 'student');
    
    students.forEach(student => {
      console.log(`\n👤 ${student.username} (${student.name}):`);
      
      // Verificar asignaciones del estudiante
      const assignments = studentAssignments.filter(a => a.studentId === student.id);
      console.log(`   Asignaciones: ${assignments.length}`);
      
      assignments.forEach(assignment => {
        console.log(`   • Curso: ${assignment.courseId}, Sección: ${assignment.sectionId}`);
      });
      
      // Verificar acceso a la tarea
      const hasAccess = assignments.some(assignment => {
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const course = courses.find(c => c.id === assignment.courseId);
        const section = sections.find(s => s.id === assignment.sectionId);
        const compositeId = `${course?.id}-${section?.id}`;
        
        return compositeId === task.courseSectionId || assignment.courseId === task.courseSectionId;
      });
      
      console.log(`   🏫 Acceso a tarea: ${hasAccess ? '✅' : '❌'}`);
      
      // Filtrar comentarios visibles
      const visibleComments = comments.filter(comment => {
        // No mostrar comentarios propios
        if (comment.studentUsername === student.username) return false;
        
        // No mostrar entregas
        if (comment.isSubmission) return false;
        
        // No mostrar ya leídos
        if (comment.readBy.includes(student.username)) return false;
        
        // Solo si tiene acceso a la tarea
        return hasAccess;
      });
      
      console.log(`   💬 Comentarios visibles: ${visibleComments.length}`);
      visibleComments.forEach(comment => {
        console.log(`     • "${comment.comment}" por ${comment.authorUsername}`);
      });
    });
    
    console.log('\n✅ ANÁLISIS COMPLETADO');
    
    return {
      task,
      comments,
      students: students.length,
      assignments: studentAssignments.length
    };
    
  } catch (error) {
    console.error('❌ Error en análisis:', error);
    return null;
  }
}

// Auto-ejecutar
console.log('🧪 Script de prueba en vivo cargado. Funciones disponibles:');
console.log('• pruebaFiltradoDinamicoEnVivo() - Prueba completa');
console.log('• probarEstudianteEspecifico("username") - Prueba específica');
console.log('• inspeccionarDatos() - Inspección detallada de estructura');
console.log('• analizarDatosActuales() - Análisis específico de datos actuales');
console.log('\n▶️ Ejecutando análisis de datos actuales...');
analizarDatosActuales();
