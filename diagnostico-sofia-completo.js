/**
 * 🔍 DIAGNÓSTICO COMPLETO - Problema de Sofia
 * 
 * Este script analiza en detalle por qué Sofia no ve sus calificaciones
 */

(function() {
  console.clear();
  console.log('%c🔍 DIAGNÓSTICO COMPLETO - SOFIA', 'font-size: 20px; font-weight: bold; color: #6366F1;');
  console.log('═'.repeat(60) + '\n');

  // 1. Usuario actual
  const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
  console.log('👤 USUARIO EN SESIÓN:');
  if (currentUser) {
    console.log('   Username:', currentUser.username);
    console.log('   Nombre:', currentUser.name || currentUser.displayName);
    console.log('   RUT:', currentUser.rut || '❌ NO TIENE RUT');
    console.log('   ID:', currentUser.id);
    console.log('   Rol:', currentUser.role);
    console.log('   Cursos activos:', currentUser.activeCourses);
  } else {
    console.log('   ❌ No hay usuario en sesión');
  }

  // 2. Sofia en base de datos
  const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  const sofia = usuarios.find(u => u.username === 'sofia' || u.username === 's.gonzalez0008');
  
  console.log('\n📊 SOFIA EN BASE DE DATOS:');
  if (sofia) {
    console.log('   Username:', sofia.username);
    console.log('   Nombre:', sofia.name || sofia.displayName);
    console.log('   RUT:', sofia.rut || '❌ NO TIENE RUT');
    console.log('   ID:', sofia.id);
    console.log('   Rol:', sofia.role);
    console.log('   Cursos activos:', sofia.activeCourses);
  } else {
    console.log('   ❌ Sofia no encontrada');
  }

  // 3. Student Assignments de Sofia
  const assignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
  const sofiaAssignments = sofia ? assignments.filter(a => 
    String(a.studentId) === String(sofia.id) ||
    String(a.studentUsername) === sofia.username
  ) : [];

  console.log('\n📋 ASSIGNMENTS DE SOFIA:');
  console.log(`   Total assignments: ${sofiaAssignments.length}`);
  if (sofiaAssignments.length > 0) {
    sofiaAssignments.forEach(a => {
      console.log(`   • Section: ${a.sectionId} | Course: ${a.courseId}`);
    });
    
    // Extraer secciones de Sofia
    const sofiaSections = [...new Set(sofiaAssignments.map(a => a.sectionId).filter(Boolean))];
    console.log(`\n   ✅ Secciones de Sofia: ${sofiaSections.length}`, sofiaSections);
  } else {
    console.log('   ❌ No hay assignments para Sofia');
  }

  // 4. Todas las secciones
  const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
  console.log('\n🏫 TODAS LAS SECCIONES EN EL SISTEMA:');
  console.log(`   Total: ${sections.length}`);
  if (sections.length > 0) {
    console.log('   Primeras 5:');
    sections.slice(0, 5).forEach(s => {
      console.log(`   • ${s.id} - Curso: ${s.courseId} - Nombre: ${s.name}`);
    });
  }

  // 5. Calificaciones
  const year = 2025;
  const calificaciones = JSON.parse(localStorage.getItem(`smart-student-test-grades-${year}`) || '[]');
  
  console.log(`\n📝 CALIFICACIONES ${year}:');
  console.log(`   Total: ${calificaciones.length}`);
  
  // Calificaciones con la sección de Sofia
  const sofiaSections = sofiaAssignments.map(a => a.sectionId).filter(Boolean);
  const gradeSections = [...new Set(calificaciones.map(g => g.sectionId).filter(Boolean))];
  
  console.log(`   Secciones únicas en calificaciones: ${gradeSections.length}`, gradeSections);
  console.log(`   Secciones de Sofia en assignments: ${sofiaSections.length}`, sofiaSections);
  
  // Verificar coincidencias
  const matching = gradeSections.filter(gs => sofiaSections.includes(gs));
  console.log(`   ✅ Coincidencias: ${matching.length}`, matching);
  
  if (matching.length === 0) {
    console.log('\n%c⚠️ PROBLEMA IDENTIFICADO: Las secciones de Sofia no coinciden con las secciones en las calificaciones', 'color: #F59E0B; font-weight: bold; font-size: 14px;');
  }

  // 6. Calificaciones de Sofia por RUT
  if (sofia && sofia.rut) {
    const calificacionesSofiaPorRut = calificaciones.filter(c => 
      c.studentRut === sofia.rut ||
      c.studentId === sofia.rut
    );
    
    console.log(`\n   Calificaciones de Sofia (por RUT ${sofia.rut}): ${calificacionesSofiaPorRut.length}`);
    
    if (calificacionesSofiaPorRut.length > 0) {
      console.log('   Primeras 3:');
      calificacionesSofiaPorRut.slice(0, 3).forEach(c => {
        console.log(`   • ${c.subject || c.subjectName} - Nota: ${c.score} - Sección: ${c.sectionId}`);
      });
      
      // Secciones en las calificaciones de Sofia
      const sofiaGradeSections = [...new Set(calificacionesSofiaPorRut.map(c => c.sectionId).filter(Boolean))];
      console.log(`\n   Secciones en calificaciones de Sofia: ${sofiaGradeSections.length}`, sofiaGradeSections);
      
      // Comparar con assignments
      const assignmentSections = [...new Set(sofiaAssignments.map(a => a.sectionId).filter(Boolean))];
      console.log(`   Secciones en assignments de Sofia: ${assignmentSections.length}`, assignmentSections);
      
      const match = sofiaGradeSections.filter(gs => assignmentSections.includes(gs));
      console.log(`   Coincidencias: ${match.length}`, match);
      
      if (match.length === 0) {
        console.log('\n%c🔴 PROBLEMA CRÍTICO:', 'color: #EF4444; font-weight: bold; font-size: 16px;');
        console.log('%c   Las calificaciones de Sofia están en sección: ' + sofiaGradeSections.join(', '), 'color: #EF4444;');
        console.log('%c   Pero sus assignments están en sección: ' + assignmentSections.join(', '), 'color: #EF4444;');
        console.log('%c   → Las secciones NO COINCIDEN', 'color: #EF4444; font-weight: bold;');
        
        // Buscar info de las secciones
        console.log('\n📋 DETALLES DE LAS SECCIONES:');
        sofiaGradeSections.forEach(sid => {
          const section = sections.find(s => s.id === sid);
          if (section) {
            const course = JSON.parse(localStorage.getItem('smart-student-courses') || '[]').find(c => c.id === section.courseId);
            console.log(`\n   Calificaciones en sección: ${sid}`);
            console.log(`   • Nombre: ${section.name}`);
            console.log(`   • Curso: ${course?.name || section.courseId}`);
          }
        });
        
        assignmentSections.forEach(sid => {
          const section = sections.find(s => s.id === sid);
          if (section) {
            const course = JSON.parse(localStorage.getItem('smart-student-courses') || '[]').find(c => c.id === section.courseId);
            console.log(`\n   Assignments en sección: ${sid}`);
            console.log(`   • Nombre: ${section.name}`);
            console.log(`   • Curso: ${course?.name || section.courseId}`);
          }
        });
      }
    }
  } else {
    console.log('\n   ❌ No se puede buscar por RUT (Sofia no tiene RUT o no fue encontrada)');
  }

  // 7. Resumen final
  console.log('\n' + '═'.repeat(60));
  console.log('%c📊 RESUMEN', 'color: #6366F1; font-weight: bold; font-size: 16px;');
  console.log('═'.repeat(60) + '\n');
  
  const issues = [];
  
  if (!currentUser) {
    issues.push('❌ No hay usuario en sesión');
  } else if (currentUser.username !== 'sofia' && currentUser.username !== 's.gonzalez0008') {
    issues.push('⚠️ El usuario actual no es Sofia');
  }
  
  if (!sofia) {
    issues.push('❌ Sofia no existe en la base de datos');
  } else {
    if (!sofia.rut) {
      issues.push('❌ Sofia no tiene RUT en su perfil');
    }
    
    if (sofiaAssignments.length === 0) {
      issues.push('❌ Sofia no tiene assignments (no está asignada a ninguna sección)');
    }
    
    if (sofia.rut) {
      const calificacionesSofia = calificaciones.filter(c => 
        c.studentRut === sofia.rut || c.studentId === sofia.rut
      );
      
      if (calificacionesSofia.length === 0) {
        issues.push('❌ No hay calificaciones para el RUT de Sofia');
      } else {
        const sofiaGradeSections = [...new Set(calificacionesSofia.map(c => c.sectionId).filter(Boolean))];
        const assignmentSections = [...new Set(sofiaAssignments.map(a => a.sectionId).filter(Boolean))];
        const match = sofiaGradeSections.filter(gs => assignmentSections.includes(gs));
        
        if (match.length === 0 && sofiaGradeSections.length > 0 && assignmentSections.length > 0) {
          issues.push('🔴 PROBLEMA CRÍTICO: Las secciones en calificaciones NO coinciden con las secciones en assignments');
        }
      }
    }
  }
  
  if (issues.length === 0) {
    console.log('%c✅ No se detectaron problemas obvios', 'color: #10B981; font-weight: bold;');
    console.log('\nEl problema puede estar en:');
    console.log('   • Lógica de filtrado en el código (visibleSectionIds)');
    console.log('   • Permisos o rol del usuario');
    console.log('   • Configuración de año académico o semestre');
  } else {
    console.log('%c⚠️ PROBLEMAS DETECTADOS:', 'color: #EF4444; font-weight: bold;');
    issues.forEach(issue => console.log(`   ${issue}`));
  }

})();
