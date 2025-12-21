// Sincronizador automático de asignaciones de estudiantes
function sincronizarAsignacionesEstudiantes() {
  console.clear();
  console.log('🔄 SINCRONIZADOR AUTOMÁTICO DE ASIGNACIONES');
  console.log('===========================================');
  
  try {
    // 1. Cargar datos existentes
    const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    
    console.log(`📊 Datos cargados:`);
    console.log(`   • Estudiantes: ${students.length}`);
    console.log(`   • Cursos: ${courses.length}`);
    console.log(`   • Secciones: ${sections.length}`);
    
    if (students.length === 0) {
      console.log('❌ No hay estudiantes para sincronizar');
      return { success: false, message: 'No hay estudiantes' };
    }
    
    // 2. Crear asignaciones separadas basadas en los datos de estudiantes
    const studentAssignments = [];
    
    students.forEach((student, index) => {
      console.log(`🔄 Procesando estudiante ${index + 1}/${students.length}: ${student.name}`);
      
      // Verificar que el estudiante tenga courseId y sectionId
      if (!student.courseId || !student.sectionId) {
        console.warn(`   ⚠️ Estudiante ${student.name} sin courseId o sectionId asignado`);
        return;
      }
      
      // Verificar que existan el curso y sección
      const course = courses.find(c => c.id === student.courseId);
      const section = sections.find(s => s.id === student.sectionId);
      
      if (!course) {
        console.warn(`   ⚠️ Curso no encontrado para estudiante ${student.name}: ${student.courseId}`);
        return;
      }
      
      if (!section) {
        console.warn(`   ⚠️ Sección no encontrada para estudiante ${student.name}: ${student.sectionId}`);
        return;
      }
      
      // Crear asignación
      const assignment = {
        id: `assignment-${student.id}`,
        studentId: student.id,
        courseId: student.courseId,
        sectionId: student.sectionId,
        assignedAt: new Date().toISOString(),
        status: 'active'
      };
      
      studentAssignments.push(assignment);
      console.log(`   ✅ Asignación creada: ${student.name} → ${course.name} - ${section.name}`);
    });
    
    // 3. Guardar las asignaciones en localStorage
    localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
    
    console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA:`);
    console.log(`   • ${studentAssignments.length} asignaciones de estudiantes creadas`);
    console.log(`   • Datos guardados en 'smart-student-student-assignments'`);
    
    // 4. También actualizar la estructura de usuarios para que tengan role 'estudiante'
    let usersUpdated = false;
    const updatedUsers = users.map(user => {
      const student = students.find(s => s.id === user.id);
      if (student && user.role !== 'estudiante') {
        usersUpdated = true;
        console.log(`   🔄 Actualizando role de ${user.name} a 'estudiante'`);
        return { ...user, role: 'estudiante' };
      }
      return user;
    });
    
    // Agregar estudiantes que no estén en users
    students.forEach(student => {
      if (!users.find(u => u.id === student.id)) {
        console.log(`   ➕ Agregando estudiante ${student.name} a users`);
        updatedUsers.push({
          ...student,
          role: 'estudiante',
          password: student.password || 'default123'
        });
        usersUpdated = true;
      }
    });
    
    if (usersUpdated) {
      localStorage.setItem('smart-student-users', JSON.stringify(updatedUsers));
      console.log(`   ✅ Estructura de usuarios actualizada`);
    }
    
    // 5. Disparar eventos para notificar cambios
    window.dispatchEvent(new CustomEvent('studentAssignmentsChanged'));
    window.dispatchEvent(new CustomEvent('usersUpdated'));
    
    console.log(`\n🔍 VERIFICACIÓN:`);
    const verificacion = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    console.log(`   • Asignaciones guardadas: ${verificacion.length}`);
    
    return {
      success: true,
      asignacionesCreadas: studentAssignments.length,
      estudiantes: students.length,
      message: 'Sincronización completada exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    return { success: false, message: error.message };
  }
}

// Ejecutar sincronización automáticamente
console.log('🚀 Iniciando sincronización...');
const resultadoSync = sincronizarAsignacionesEstudiantes();
console.log('\n✅ Resultado:', resultadoSync);

// Función de verificación post-sincronización
function verificarSincronizacion() {
  const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const students = JSON.parse(localStorage.getItem('smart-student-students') || '[]');
  
  console.log('\n🔍 VERIFICACIÓN POST-SINCRONIZACIÓN:');
  console.log(`   • Estudiantes: ${students.length}`);
  console.log(`   • Asignaciones: ${studentAssignments.length}`);
  console.log(`   • Estado: ${studentAssignments.length === students.length ? '✅ SINCRONIZADO' : '⚠️ DESINCRONIZADO'}`);
  
  if (studentAssignments.length > 0) {
    console.log('\n📋 Primeras 3 asignaciones:');
    studentAssignments.slice(0, 3).forEach((assignment, i) => {
      const student = students.find(s => s.id === assignment.studentId);
      console.log(`   ${i + 1}. ${student?.name || 'Desconocido'} → Curso: ${assignment.courseId}, Sección: ${assignment.sectionId}`);
    });
  }
  
  return studentAssignments.length === students.length;
}

// Verificar automáticamente
setTimeout(() => {
  const sincronizado = verificarSincronizacion();
  if (sincronizado) {
    console.log('\n🎉 ¡PERFECTO! Los estudiantes ahora deberían aparecer en el formulario de tareas');
  }
}, 1000);
