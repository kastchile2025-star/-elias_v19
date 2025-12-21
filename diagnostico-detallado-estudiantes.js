// 🔍 DIAGNÓSTICO DETALLADO: ¿Por qué no encuentra estudiantes?
console.clear();
console.log('🔍 DIAGNÓSTICO: ¿Por qué no se encuentran estudiantes?');
console.log('═══════════════════════════════════════════════════════════');

// 1️⃣ ID del curso que estamos probando
const testCourseId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
console.log(`🎯 Testing Course ID: ${testCourseId}`);

// 2️⃣ Función de parseo
function getCourseDataFromCombinedId(combinedId) {
  console.log(`\n📋 Parsing combinedId: "${combinedId}"`);
  
  if (!combinedId || !combinedId.includes('-')) {
    console.log('❌ ID no válido o no contiene guiones');
    return null;
  }
  
  const lastDashIndex = combinedId.lastIndexOf('-');
  console.log(`📍 Last dash index: ${lastDashIndex}`);
  
  const courseId = combinedId.substring(0, lastDashIndex);
  const sectionId = combinedId.substring(lastDashIndex + 1);
  
  console.log(`✂️ Parsed result:`);
  console.log(`   courseId: "${courseId}"`);
  console.log(`   sectionId: "${sectionId}"`);
  
  return { courseId, sectionId };
}

// 3️⃣ Probar el parseo
const parsed = getCourseDataFromCombinedId(testCourseId);

// 4️⃣ Verificar datos en localStorage
console.log('\n📊 DATOS EN LOCALSTORAGE:');
const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

console.log(`👥 Total usuarios: ${allUsers.length}`);
console.log(`📋 Total asignaciones: ${studentAssignments.length}`);

// 5️⃣ Mostrar todas las asignaciones
console.log('\n🔍 TODAS LAS ASIGNACIONES DE ESTUDIANTES:');
studentAssignments.forEach((assignment, index) => {
  console.log(`${index + 1}. StudentId: ${assignment.studentId}`);
  console.log(`   CourseId: "${assignment.courseId}"`);
  console.log(`   SectionId: "${assignment.sectionId}"`);
  console.log(`   Combined: "${assignment.courseId}-${assignment.sectionId}"`);
  console.log('');
});

// 6️⃣ Buscar coincidencias si tenemos el parseo
if (parsed) {
  console.log('\n🎯 BUSCANDO COINCIDENCIAS:');
  console.log(`Buscando CourseId: "${parsed.courseId}"`);
  console.log(`Buscando SectionId: "${parsed.sectionId}"`);
  
  const matchingAssignments = studentAssignments.filter(assignment => {
    const courseMatch = assignment.courseId === parsed.courseId;
    const sectionMatch = assignment.sectionId === parsed.sectionId;
    
    console.log(`Assignment ${assignment.studentId}:`);
    console.log(`   CourseId match: ${courseMatch} ("${assignment.courseId}" === "${parsed.courseId}")`);
    console.log(`   SectionId match: ${sectionMatch} ("${assignment.sectionId}" === "${parsed.sectionId}")`);
    console.log(`   Both match: ${courseMatch && sectionMatch}`);
    
    return courseMatch && sectionMatch;
  });
  
  console.log(`\n📈 RESULTADO: ${matchingAssignments.length} asignaciones coinciden`);
  
  if (matchingAssignments.length > 0) {
    console.log('✅ Asignaciones encontradas:');
    matchingAssignments.forEach(assignment => {
      const user = allUsers.find(u => u.id === assignment.studentId);
      console.log(`   ${assignment.studentId} -> ${user ? user.username : 'Usuario no encontrado'}`);
    });
  } else {
    console.log('❌ No se encontraron asignaciones coincidentes');
  }
} else {
  console.log('❌ No se pudo parsear el ID del curso');
}

// 7️⃣ Verificar también el diagnóstico anterior
console.log('\n🔄 COMPARANDO CON DIAGNÓSTICO ANTERIOR:');
console.log('El diagnóstico anterior mostró estos cursos con estudiantes:');
console.log('📚 9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3: [felipe, maria]');
console.log('📚 9077a79d-c290-45f9-b549-6e57df8828d2-b22c5b5f-162c-4de8-a1fa-d35daedb8ab9: [sofia, karla]');

console.log('\n💡 POSIBLES PROBLEMAS:');
console.log('1. El parseo de ID no funciona correctamente');
console.log('2. Los datos de asignaciones han cambiado');
console.log('3. Hay inconsistencia entre los IDs guardados');

console.log('\n═══════════════════════════════════════════════════════════');
