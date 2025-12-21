// Script para limpiar datos corruptos y duplicados en localStorage
// Ejecutar en la consola del navegador si persisten los problemas de claves duplicadas

function cleanDuplicatedData() {
  console.log('🧹 LIMPIANDO DATOS DUPLICADOS EN LOCALSTORAGE');
  console.log('=' .repeat(60));
  
  try {
    // 1. Limpiar cursos duplicados
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const uniqueCourses = courses.filter((course, index, self) => 
      index === self.findIndex(c => c.id === course.id)
    );
    if (courses.length !== uniqueCourses.length) {
      console.log(`📚 Cursos: ${courses.length} → ${uniqueCourses.length} (eliminados ${courses.length - uniqueCourses.length} duplicados)`);
      localStorage.setItem('smart-student-courses', JSON.stringify(uniqueCourses));
    } else {
      console.log(`📚 Cursos: ${courses.length} (sin duplicados)`);
    }
    
    // 2. Limpiar secciones duplicadas
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const uniqueSections = sections.filter((section, index, self) => 
      index === self.findIndex(s => s.id === section.id)
    );
    if (sections.length !== uniqueSections.length) {
      console.log(`📋 Secciones: ${sections.length} → ${uniqueSections.length} (eliminados ${sections.length - uniqueSections.length} duplicados)`);
      localStorage.setItem('smart-student-sections', JSON.stringify(uniqueSections));
    } else {
      console.log(`📋 Secciones: ${sections.length} (sin duplicados)`);
    }
    
    // 3. Limpiar usuarios duplicados
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id || u.username === user.username)
    );
    if (users.length !== uniqueUsers.length) {
      console.log(`👥 Usuarios: ${users.length} → ${uniqueUsers.length} (eliminados ${users.length - uniqueUsers.length} duplicados)`);
      localStorage.setItem('smart-student-users', JSON.stringify(uniqueUsers));
    } else {
      console.log(`👥 Usuarios: ${users.length} (sin duplicados)`);
    }
    
    // 4. Limpiar comunicaciones duplicadas
    const communications = JSON.parse(localStorage.getItem('smart-student-communications') || '[]');
    const uniqueCommunications = communications.filter((comm, index, self) => 
      index === self.findIndex(c => c.id === comm.id)
    );
    if (communications.length !== uniqueCommunications.length) {
      console.log(`📧 Comunicaciones: ${communications.length} → ${uniqueCommunications.length} (eliminados ${communications.length - uniqueCommunications.length} duplicados)`);
      localStorage.setItem('smart-student-communications', JSON.stringify(uniqueCommunications));
    } else {
      console.log(`📧 Comunicaciones: ${communications.length} (sin duplicados)`);
    }
    
    // 5. Limpiar asignaciones duplicadas
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const uniqueAssignments = teacherAssignments.filter((assignment, index, self) => 
      index === self.findIndex(a => 
        a.teacherId === assignment.teacherId && 
        a.sectionId === assignment.sectionId
      )
    );
    if (teacherAssignments.length !== uniqueAssignments.length) {
      console.log(`📝 Asignaciones: ${teacherAssignments.length} → ${uniqueAssignments.length} (eliminados ${teacherAssignments.length - uniqueAssignments.length} duplicados)`);
      localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(uniqueAssignments));
    } else {
      console.log(`📝 Asignaciones: ${teacherAssignments.length} (sin duplicados)`);
    }
    
    console.log('\n✅ LIMPIEZA COMPLETADA');
    console.log('💡 Recarga la página para aplicar los cambios');
    
    return {
      courses: uniqueCourses,
      sections: uniqueSections,
      users: uniqueUsers,
      communications: uniqueCommunications,
      assignments: uniqueAssignments
    };
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    return null;
  }
}

// Función para regenerar IDs si es necesario
function regenerateIds() {
  console.log('🔄 REGENERANDO IDS CORRUPTOS');
  console.log('=' .repeat(60));
  
  try {
    // Regenerar IDs de comunicaciones si tienen formatos incorrectos
    const communications = JSON.parse(localStorage.getItem('smart-student-communications') || '[]');
    let regeneratedCount = 0;
    
    const fixedCommunications = communications.map(comm => {
      if (!comm.id || comm.id.length < 10) {
        regeneratedCount++;
        return {
          ...comm,
          id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
      return comm;
    });
    
    if (regeneratedCount > 0) {
      localStorage.setItem('smart-student-communications', JSON.stringify(fixedCommunications));
      console.log(`📧 Regenerados ${regeneratedCount} IDs de comunicaciones`);
    } else {
      console.log('📧 Todos los IDs de comunicaciones están correctos');
    }
    
    console.log('✅ REGENERACIÓN COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error durante la regeneración:', error);
  }
}

// Ejecutar ambas funciones
console.log('🚀 INICIANDO LIMPIEZA COMPLETA...\n');
const cleanResult = cleanDuplicatedData();
console.log('\n');
regenerateIds();

// Mostrar resumen final
if (cleanResult) {
  console.log('\n📊 RESUMEN FINAL:');
  console.log(`• Cursos únicos: ${cleanResult.courses.length}`);
  console.log(`• Secciones únicas: ${cleanResult.sections.length}`);
  console.log(`• Usuarios únicos: ${cleanResult.users.length}`);
  console.log(`• Comunicaciones únicas: ${cleanResult.communications.length}`);
  console.log(`• Asignaciones únicas: ${cleanResult.assignments.length}`);
}
