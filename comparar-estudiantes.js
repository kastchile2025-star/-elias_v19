/**
 * 🔍 COMPARAR ESTUDIANTES
 * 
 * Este script compara cómo están los datos de Sofia vs Matías
 * para entender por qué uno funciona y otro no
 */

(function() {
  console.clear();
  console.log('%c🔍 COMPARAR ESTUDIANTES', 'font-size: 18px; font-weight: bold; color: #6366F1');
  console.log('═'.repeat(60) + '\n');

  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  
  // Buscar Sofia y Matías
  const sofia = usuarios.find(u => 
    u.username === 'sofia' || 
    u.username === 's.gonzalez0008' ||
    (u.name && u.name.toLowerCase().includes('sofía gonzález'))
  );
  
  const matias = usuarios.find(u => 
    u.name && u.name.toLowerCase().includes('matías gonzález')
  );

  console.log('👥 USUARIOS ENCONTRADOS:\n');
  
  if (sofia) {
    console.log('%c📌 SOFIA:', 'color: #10B981; font-weight: bold;');
    console.log('   • ID:', sofia.id);
    console.log('   • Username:', sofia.username);
    console.log('   • Name:', sofia.name || sofia.displayName);
    console.log('   • RUT:', sofia.rut || '❌ NO TIENE');
    console.log('   • Role:', sofia.role);
    console.log('   • Active Courses:', sofia.activeCourses);
  } else {
    console.log('%c❌ Sofia no encontrada', 'color: #EF4444;');
  }

  console.log('\n');

  if (matias) {
    console.log('%c📌 MATÍAS:', 'color: #3B82F6; font-weight: bold;');
    console.log('   • ID:', matias.id);
    console.log('   • Username:', matias.username);
    console.log('   • Name:', matias.name || matias.displayName);
    console.log('   • RUT:', matias.rut || '❌ NO TIENE');
    console.log('   • Role:', matias.role);
    console.log('   • Active Courses:', matias.activeCourses);
  } else {
    console.log('%c❌ Matías no encontrado', 'color: #EF4444;');
  }

  // Comparar ASSIGNMENTS
  console.log('\n' + '═'.repeat(60));
  console.log('%c📋 ASSIGNMENTS', 'color: #F59E0B; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(60) + '\n');

  if (sofia) {
    console.log('%c🔍 ASSIGNMENTS DE SOFIA:', 'color: #10B981; font-weight: bold;');
    
    // Buscar por diferentes campos
    const porId = assignments.filter(a => String(a.studentId) === String(sofia.id));
    const porUsername = assignments.filter(a => String(a.studentUsername) === String(sofia.username));
    const porRut = sofia.rut ? assignments.filter(a => String(a.studentId) === String(sofia.rut)) : [];
    const porNombre = assignments.filter(a => {
      const name = String(a.studentName || '').toLowerCase();
      return name.includes('sofía') || name.includes('sofia');
    });

    console.log(`   • Por ID (${sofia.id}):`, porId.length);
    if (porId.length > 0) {
      console.log('     Primeros 2:', porId.slice(0, 2));
    }

    console.log(`   • Por username (${sofia.username}):`, porUsername.length);
    if (porUsername.length > 0) {
      console.log('     Primeros 2:', porUsername.slice(0, 2));
    }

    if (sofia.rut) {
      console.log(`   • Por RUT (${sofia.rut}):`, porRut.length);
      if (porRut.length > 0) {
        console.log('     Primeros 2:', porRut.slice(0, 2));
      }
    }

    console.log(`   • Por nombre (Sofia/Sofía):`, porNombre.length);
    if (porNombre.length > 0) {
      console.log('     Primeros 2:', porNombre.slice(0, 2));
    }

    // Mostrar estructura de un assignment aleatorio
    if (assignments.length > 0) {
      console.log('\n   📝 Estructura de un assignment (muestra):');
      console.log(assignments[0]);
    }
  }

  console.log('\n');

  if (matias) {
    console.log('%c🔍 ASSIGNMENTS DE MATÍAS:', 'color: #3B82F6; font-weight: bold;');
    
    const porId = assignments.filter(a => String(a.studentId) === String(matias.id));
    const porUsername = assignments.filter(a => String(a.studentUsername) === String(matias.username));
    const porRut = matias.rut ? assignments.filter(a => String(a.studentId) === String(matias.rut)) : [];
    const porNombre = assignments.filter(a => {
      const name = String(a.studentName || '').toLowerCase();
      return name.includes('matías') || name.includes('matias');
    });

    console.log(`   • Por ID (${matias.id}):`, porId.length);
    if (porId.length > 0) {
      console.log('     Primeros 2:', porId.slice(0, 2));
    }

    console.log(`   • Por username (${matias.username}):`, porUsername.length);
    if (porUsername.length > 0) {
      console.log('     Primeros 2:', porUsername.slice(0, 2));
    }

    if (matias.rut) {
      console.log(`   • Por RUT (${matias.rut}):`, porRut.length);
      if (porRut.length > 0) {
        console.log('     Primeros 2:', porRut.slice(0, 2));
      }
    }

    console.log(`   • Por nombre (Matías):`, porNombre.length);
    if (porNombre.length > 0) {
      console.log('     Primeros 2:', porNombre.slice(0, 2));
    }
  }

  // CALIFICACIONES
  console.log('\n' + '═'.repeat(60));
  console.log('%c📊 CALIFICACIONES', 'color: #8B5CF6; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(60) + '\n');

  const year = 2025;
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');

  if (sofia) {
    console.log('%c🔍 CALIFICACIONES DE SOFIA:', 'color: #10B981; font-weight: bold;');
    
    const porId = calificaciones.filter(c => String(c.studentId) === String(sofia.id));
    const porRut = sofia.rut ? calificaciones.filter(c => 
      String(c.studentId) === String(sofia.rut) ||
      String(c.studentRut) === String(sofia.rut)
    ) : [];
    const porNombre = calificaciones.filter(c => {
      const name = String(c.studentName || '').toLowerCase();
      return name.includes('sofía') || name.includes('sofia');
    });

    console.log(`   • Por ID (${sofia.id}):`, porId.length);
    console.log(`   • Por RUT (${sofia.rut || 'N/A'}):`, porRut.length);
    console.log(`   • Por nombre (Sofia/Sofía):`, porNombre.length);

    if (porRut.length > 0) {
      console.log('\n   📝 Primeras 3 calificaciones:');
      porRut.slice(0, 3).forEach(c => {
        console.log(`      • ${c.subject || c.subjectName} - ${c.score} - Sección: ${c.sectionId}`);
      });
    }
  }

  console.log('\n');

  if (matias) {
    console.log('%c🔍 CALIFICACIONES DE MATÍAS:', 'color: #3B82F6; font-weight: bold;');
    
    const porId = calificaciones.filter(c => String(c.studentId) === String(matias.id));
    const porRut = matias.rut ? calificaciones.filter(c => 
      String(c.studentId) === String(matias.rut) ||
      String(c.studentRut) === String(matias.rut)
    ) : [];
    const porNombre = calificaciones.filter(c => {
      const name = String(c.studentName || '').toLowerCase();
      return name.includes('matías') || name.includes('matias');
    });

    console.log(`   • Por ID (${matias.id}):`, porId.length);
    console.log(`   • Por RUT (${matias.rut || 'N/A'}):`, porRut.length);
    console.log(`   • Por nombre (Matías):`, porNombre.length);

    if (porRut.length > 0) {
      console.log('\n   📝 Primeras 3 calificaciones:');
      porRut.slice(0, 3).forEach(c => {
        console.log(`      • ${c.subject || c.subjectName} - ${c.score} - Sección: ${c.sectionId}`);
      });
    }
  }

  // RESUMEN
  console.log('\n' + '═'.repeat(60));
  console.log('%c💡 RESUMEN Y SOLUCIÓN', 'color: #F59E0B; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(60) + '\n');

  if (sofia && matias) {
    console.log('Comparación de estructura de datos:\n');
    
    console.log('SOFIA:');
    console.log(`   ✓ Tiene usuario: ${!!sofia}`);
    console.log(`   ✓ Tiene RUT: ${!!sofia.rut}`);
    console.log(`   ✓ Assignments encontrados: ${assignments.filter(a => String(a.studentId) === String(sofia.id) || String(a.studentUsername) === String(sofia.username)).length}`);
    
    console.log('\nMATÍAS:');
    console.log(`   ✓ Tiene usuario: ${!!matias}`);
    console.log(`   ✓ Tiene RUT: ${!!matias.rut}`);
    console.log(`   ✓ Assignments encontrados: ${assignments.filter(a => String(a.studentId) === String(matias.id) || String(a.studentUsername) === String(matias.username)).length}`);
    
    console.log('\n%c🔧 ACCIÓN NECESARIA:', 'color: #EF4444; font-weight: bold;');
    
    const sofiaAssignmentsCount = assignments.filter(a => 
      String(a.studentId) === String(sofia.id) || 
      String(a.studentUsername) === String(sofia.username)
    ).length;
    
    if (sofiaAssignmentsCount === 0) {
      console.log('\n❌ Sofia NO tiene assignments asociados a su ID ni username');
      console.log('   Esto es el PROBLEMA RAÍZ.');
      console.log('\n💡 Necesitamos crear assignments para Sofia manualmente.');
      console.log('   Ejecuta: crearAssignmentsSofia() para solucionarlo');
      
      // Crear función de solución
      window.crearAssignmentsSofia = function() {
        console.log('\n%c🔧 CREANDO ASSIGNMENTS PARA SOFIA', 'color: #10B981; font-weight: bold;');
        
        // Buscar la sección de "1ro Básico A" donde están las calificaciones
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        
        // Buscar calificaciones de Sofia para saber su sección
        const calificacionesSofia = calificaciones.filter(c => 
          String(c.studentId) === String(sofia.rut) || 
          String(c.studentRut) === String(sofia.rut)
        );
        
        if (calificacionesSofia.length > 0) {
          const sectionId = calificacionesSofia[0].sectionId;
          const section = sections.find(s => s.id === sectionId);
          
          console.log(`✅ Sección encontrada: ${section?.name || sectionId}`);
          console.log(`✅ Curso: ${section?.courseId}`);
          
          // Crear assignment
          const newAssignment = {
            id: `assignment-sofia-${Date.now()}`,
            studentId: sofia.id,
            studentUsername: sofia.username,
            studentName: sofia.name || sofia.displayName,
            sectionId: sectionId,
            courseId: section?.courseId || calificacionesSofia[0].courseId,
            year: 2025
          };
          
          assignments.push(newAssignment);
          localStorage.setItem('smart-student-student-assignments', JSON.stringify(assignments));
          
          console.log('\n%c✅ ASSIGNMENT CREADO:', 'color: #10B981; font-weight: bold;');
          console.log(newAssignment);
          console.log('\n📝 Recarga la página para ver los cambios');
        } else {
          console.log('%c❌ No se encontraron calificaciones de Sofia para derivar la sección', 'color: #EF4444;');
        }
      };
      
      console.log('\n%c✨ Función creada: crearAssignmentsSofia()', 'color: #8B5CF6; font-weight: bold;');
    }
  }

})();
