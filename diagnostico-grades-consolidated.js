/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO: Grades Consolidated 2025
 * 
 * Este script verifica por qué las calificaciones del archivo
 * grades-consolidated-2025.csv no aparecen en la pestaña de Calificaciones
 * 
 * EJECUTAR EN: Pestaña Calificaciones (consola del navegador F12)
 */

(async function diagnosticoGradesConsolidated() {
  console.clear();
  console.log('🔍 ════════════════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO: grades-consolidated-2025.csv');
  console.log('🔍 ════════════════════════════════════════════════════════\n');

  const year = Number(localStorage.getItem('admin-selected-year')) || 2025;
  
  // ═══════════════════════════════════════════════════════════
  // 1. VERIFICAR DATOS EN LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════
  console.log('📦 1. DATOS EN LOCALSTORAGE:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const gradesKey = `smart-student-test-grades-${year}`;
  let grades = [];
  
  try {
    const raw = localStorage.getItem(gradesKey);
    grades = raw ? JSON.parse(raw) : [];
    console.log(`   ${grades.length > 0 ? '✅' : '❌'} Calificaciones en caché: ${grades.length} registros`);
    
    if (grades.length > 0) {
      console.log(`\n   📊 Muestra de 5 calificaciones:`);
      grades.slice(0, 5).forEach((g, i) => {
        console.log(`   ${i+1}. ${g.studentName} - ${g.title || 'Sin título'} - Nota: ${g.score}`);
        console.log(`      • testId: ${g.testId || 'N/A'}`);
        console.log(`      • courseId: ${g.courseId || 'N/A'}`);
        console.log(`      • sectionId: ${g.sectionId || 'N/A'}`);
        console.log(`      • subjectId: ${g.subjectId || 'N/A'}`);
        console.log(`      • gradedAt: ${g.gradedAt ? new Date(g.gradedAt).toLocaleDateString() : 'N/A'}`);
      });
    } else {
      console.log(`\n   ⚠️ NO HAY CALIFICACIONES EN CACHÉ`);
      console.log(`   💡 Necesitas cargar el archivo desde Admin > Configuración`);
    }
  } catch (e) {
    console.error(`   ❌ Error al leer calificaciones:`, e);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 2. VERIFICAR ESTUDIANTES
  // ═══════════════════════════════════════════════════════════
  console.log('\n👥 2. ESTUDIANTES EN EL SISTEMA:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const usersKey = 'smart-student-users';
  let students = [];
  
  try {
    const usersRaw = localStorage.getItem(usersKey);
    const allUsers = usersRaw ? JSON.parse(usersRaw) : [];
    students = allUsers.filter(u => u.role === 'student');
    
    console.log(`   ✅ Total estudiantes: ${students.length}`);
    
    // Verificar estudiantes del CSV
    const expectedStudents = [
      'Sofía González González',
      'Matías González Díaz',
      'Valentina González Contreras',
      'Benjamín González Sepúlveda',
      'Martina González López'
    ];
    
    console.log(`\n   🔍 Verificando estudiantes del CSV:`);
    expectedStudents.forEach(name => {
      const found = students.find(s => s.name === name || s.displayName === name);
      console.log(`   ${found ? '✅' : '❌'} ${name} ${found ? `(ID: ${found.id})` : '(NO ENCONTRADO)'}`);
    });
  } catch (e) {
    console.error(`   ❌ Error al leer estudiantes:`, e);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 3. VERIFICAR CURSOS Y SECCIONES
  // ═══════════════════════════════════════════════════════════
  console.log('\n🏫 3. CURSOS Y SECCIONES:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const coursesKey = `smart-student-courses-${year}`;
  const sectionsKey = `smart-student-sections-${year}`;
  
  let courses = [];
  let sections = [];
  
  try {
    const coursesRaw = localStorage.getItem(coursesKey);
    courses = coursesRaw ? JSON.parse(coursesRaw) : [];
    console.log(`   ✅ Cursos: ${courses.length}`);
    
    const expectedCourses = ['1ro Básico', '2do Básico', '3ro Básico'];
    expectedCourses.forEach(name => {
      const found = courses.find(c => c.name === name);
      console.log(`   ${found ? '✅' : '❌'} ${name} ${found ? `(ID: ${found.id})` : '(NO ENCONTRADO)'}`);
    });
  } catch (e) {
    console.error(`   ❌ Error al leer cursos:`, e);
  }
  
  try {
    const sectionsRaw = localStorage.getItem(sectionsKey);
    sections = sectionsRaw ? JSON.parse(sectionsRaw) : [];
    console.log(`\n   ✅ Secciones: ${sections.length}`);
    
    sections.slice(0, 5).forEach(s => {
      const course = courses.find(c => String(c.id) === String(s.courseId));
      console.log(`   • ${s.name} (Curso: ${course?.name || 'N/A'}) - ID: ${s.id}`);
    });
  } catch (e) {
    console.error(`   ❌ Error al leer secciones:`, e);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 4. VERIFICAR ASIGNATURAS
  // ═══════════════════════════════════════════════════════════
  console.log('\n📚 4. ASIGNATURAS:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const subjectsKey = `smart-student-subjects-${year}`;
  let subjects = [];
  
  try {
    const subjectsRaw = localStorage.getItem(subjectsKey);
    subjects = subjectsRaw ? JSON.parse(subjectsRaw) : [];
    console.log(`   ✅ Asignaturas: ${subjects.length}`);
    
    const expectedSubjects = ['Matemáticas', 'Lenguaje y Comunicación'];
    expectedSubjects.forEach(name => {
      const found = subjects.find(s => s.name === name);
      console.log(`   ${found ? '✅' : '❌'} ${name} ${found ? `(ID: ${found.id})` : '(NO ENCONTRADO)'}`);
    });
  } catch (e) {
    console.error(`   ❌ Error al leer asignaturas:`, e);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 5. VERIFICAR ASIGNACIONES
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔗 5. ASIGNACIONES DE ESTUDIANTES:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const assignmentsKey = `smart-student-student-assignments-${year}`;
  let assignments = [];
  
  try {
    const assignmentsRaw = localStorage.getItem(assignmentsKey);
    assignments = assignmentsRaw ? JSON.parse(assignmentsRaw) : [];
    console.log(`   ✅ Asignaciones: ${assignments.length}`);
    
    if (assignments.length > 0) {
      console.log(`\n   📊 Muestra de 5 asignaciones:`);
      assignments.slice(0, 5).forEach((a, i) => {
        const student = students.find(s => String(s.id) === String(a.studentId));
        const section = sections.find(s => String(s.id) === String(a.sectionId));
        const course = courses.find(c => String(c.id) === String(section?.courseId));
        
        console.log(`   ${i+1}. ${student?.name || a.studentUsername || 'N/A'}`);
        console.log(`      • Curso: ${course?.name || 'N/A'}`);
        console.log(`      • Sección: ${section?.name || 'N/A'}`);
      });
    } else {
      console.log(`   ⚠️ NO HAY ASIGNACIONES`);
      console.log(`   💡 Los estudiantes deben estar asignados a cursos/secciones`);
    }
  } catch (e) {
    console.error(`   ❌ Error al leer asignaciones:`, e);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 6. VERIFICAR UI (TABLA)
  // ═══════════════════════════════════════════════════════════
  console.log('\n🖥️ 6. ESTADO DE LA TABLA:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  const tableRows = document.querySelectorAll('table tbody tr');
  console.log(`   📊 Filas visibles en tabla: ${tableRows.length}`);
  
  if (tableRows.length === 0 && grades.length > 0) {
    console.log(`\n   ⚠️ PROBLEMA DETECTADO:`);
    console.log(`   Hay ${grades.length} calificaciones pero la tabla está vacía.`);
    console.log(`\n   Posibles causas:`);
    console.log(`   1. Filtros muy restrictivos`);
    console.log(`   2. Falta mapeo de IDs (testId no coincide con actividades/tareas)`);
    console.log(`   3. Estudiantes no están asignados a secciones`);
    console.log(`   4. Datos de calificaciones no tienen courseId/sectionId correctos`);
  } else if (tableRows.length > 0) {
    console.log(`   ✅ La tabla muestra datos`);
    
    // Analizar primera fila
    const firstRow = tableRows[0];
    const cells = firstRow.querySelectorAll('td');
    console.log(`\n   📋 Primera fila de la tabla:`);
    cells.forEach((cell, i) => {
      const text = cell.textContent?.trim() || '';
      if (text) console.log(`   ${i+1}. ${text.substring(0, 50)}`);
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // 7. ANÁLISIS DE COMPATIBILIDAD
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔬 7. ANÁLISIS DE COMPATIBILIDAD:');
  console.log('   ─────────────────────────────────────────────────────\n');
  
  if (grades.length > 0 && students.length > 0) {
    // Verificar si los estudiantes de las calificaciones existen en el sistema
    const studentsInGrades = new Set(grades.map(g => g.studentName));
    const studentsInSystem = new Set(students.map(s => s.name || s.displayName));
    
    const missingStudents = Array.from(studentsInGrades).filter(name => !studentsInSystem.has(name));
    
    if (missingStudents.length > 0) {
      console.log(`   ⚠️ Estudiantes en calificaciones pero NO en el sistema:`);
      missingStudents.slice(0, 10).forEach(name => {
        console.log(`   • ${name}`);
      });
      console.log(`\n   Total estudiantes faltantes: ${missingStudents.length}`);
    } else {
      console.log(`   ✅ Todos los estudiantes de las calificaciones existen en el sistema`);
    }
    
    // Verificar mapeo de IDs
    console.log(`\n   🔗 Verificando mapeo de IDs:`);
    const gradesWithMissingData = grades.filter(g => 
      !g.courseId || !g.sectionId || !g.subjectId || !g.testId
    );
    
    if (gradesWithMissingData.length > 0) {
      console.log(`   ⚠️ ${gradesWithMissingData.length} calificaciones con datos faltantes:`);
      console.log(`   • Sin courseId: ${grades.filter(g => !g.courseId).length}`);
      console.log(`   • Sin sectionId: ${grades.filter(g => !g.sectionId).length}`);
      console.log(`   • Sin subjectId: ${grades.filter(g => !g.subjectId).length}`);
      console.log(`   • Sin testId: ${grades.filter(g => !g.testId).length}`);
    } else {
      console.log(`   ✅ Todas las calificaciones tienen IDs completos`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // 8. RESUMEN Y ACCIONES
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 8. RESUMEN Y ACCIONES RECOMENDADAS:');
  console.log('   ═════════════════════════════════════════════════════\n');
  
  const issues = [];
  
  if (grades.length === 0) {
    issues.push('NO HAY CALIFICACIONES EN CACHÉ');
    console.log(`   ❌ PROBLEMA PRINCIPAL: No hay calificaciones cargadas`);
    console.log(`\n   💡 SOLUCIÓN:`);
    console.log(`      1. Ve a Admin > Configuración`);
    console.log(`      2. Sección "Carga masiva: Calificaciones (SQL)"`);
    console.log(`      3. Sube el archivo: grades-consolidated-2025.csv`);
    console.log(`      4. Espera a que termine (modal mostrará progreso)`);
    console.log(`      5. Vuelve a esta pestaña y ejecuta este script nuevamente`);
  } else if (students.length === 0) {
    issues.push('NO HAY ESTUDIANTES EN EL SISTEMA');
    console.log(`   ❌ PROBLEMA: No hay estudiantes registrados`);
    console.log(`\n   💡 SOLUCIÓN:`);
    console.log(`      1. Ve a Admin > Gestión de Usuarios`);
    console.log(`      2. Carga el archivo: users-consolidated-2025-CORREGIDO.csv`);
  } else if (assignments.length === 0) {
    issues.push('ESTUDIANTES NO ESTÁN ASIGNADOS A SECCIONES');
    console.log(`   ⚠️ PROBLEMA: Estudiantes sin asignaciones de curso/sección`);
    console.log(`\n   💡 SOLUCIÓN:`);
    console.log(`      1. Las asignaciones se crean automáticamente al cargar usuarios`);
    console.log(`      2. Verifica que el CSV de usuarios tiene columnas: course, section`);
    console.log(`      3. Recarga el archivo de usuarios si es necesario`);
  } else if (tableRows.length === 0 && grades.length > 0) {
    issues.push('DATOS CARGADOS PERO NO SE VISUALIZAN');
    console.log(`   ⚠️ PROBLEMA: Calificaciones cargadas pero no se muestran en tabla`);
    console.log(`\n   💡 SOLUCIONES A PROBAR:`);
    console.log(`      1. Selecciona filtros correctos:`);
    console.log(`         • Nivel: Básica`);
    console.log(`         • Semestre: 1er Semestre`);
    console.log(`         • Curso: 1ro Básico`);
    console.log(`         • Sección: A`);
    console.log(`      2. Forzar recarga con el comando:`);
    console.log(`         window.dispatchEvent(new CustomEvent('sqlGradesUpdated', {`);
    console.log(`           detail: { year: ${year}, timestamp: Date.now() }`);
    console.log(`         }));`);
  } else {
    console.log(`   ✅ SISTEMA FUNCIONANDO CORRECTAMENTE`);
    console.log(`\n   📊 Estado:`);
    console.log(`      • Calificaciones: ${grades.length}`);
    console.log(`      • Estudiantes: ${students.length}`);
    console.log(`      • Asignaciones: ${assignments.length}`);
    console.log(`      • Filas en tabla: ${tableRows.length}`);
  }
  
  console.log('\n🔍 ════════════════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO COMPLETADO');
  console.log('🔍 ════════════════════════════════════════════════════════\n');
  
  // Retornar datos útiles
  return {
    year,
    grades: grades.length,
    students: students.length,
    courses: courses.length,
    sections: sections.length,
    subjects: subjects.length,
    assignments: assignments.length,
    tableRows: tableRows.length,
    issues,
    data: {
      grades: grades.slice(0, 3),
      students: students.slice(0, 3),
      assignments: assignments.slice(0, 3)
    }
  };
})();
