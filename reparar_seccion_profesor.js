// Reparador de asignaciones de sección para profesores
function repararAsignacionesSeccionProfesor() {
  console.clear();
  console.log('🔧 REPARADOR DE ASIGNACIONES DE SECCIÓN PROFESOR');
  console.log('==================================================');
  
  try {
    // 1. Cargar datos actuales
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    
    console.log(`📊 Datos cargados:`);
    console.log(`   • Usuarios: ${users.length}`);
    console.log(`   • Asignaciones de profesores: ${teacherAssignments.length}`);
    console.log(`   • Secciones: ${sections.length}`);
    console.log(`   • Cursos: ${courses.length}`);
    
    // 2. Buscar profesor pedro
    const profesor = users.find(u => u.username === 'pedro' && u.role === 'teacher');
    if (!profesor) {
      console.log('❌ No se encontró el profesor pedro');
      return { success: false, message: 'Profesor no encontrado' };
    }
    
    console.log(`\n👨‍🏫 Profesor encontrado: ${profesor.name} (ID: ${profesor.id})`);
    
    // 3. Revisar asignaciones actuales del profesor
    const asignacionesProfesor = teacherAssignments.filter(ta => ta.teacherId === profesor.id);
    console.log(`\n📋 Asignaciones actuales del profesor (${asignacionesProfesor.length}):`);
    
    asignacionesProfesor.forEach((assignment, i) => {
      const section = sections.find(s => s.id === assignment.sectionId);
      const course = courses.find(c => c.id === section?.courseId);
      
      console.log(`   ${i + 1}. ${assignment.subjectName}`);
      console.log(`      Sección: ${section?.name || 'No encontrada'} (ID: ${assignment.sectionId})`);
      console.log(`      Curso: ${course?.name || 'No encontrado'}`);
    });
    
    // 4. Verificar el problema específico con sección a75b7e0e-1130-486a-ae5e-6f7233e002bf
    const seccionProblematica = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
    const seccionInfo = sections.find(s => s.id === seccionProblematica);
    const cursoInfo = courses.find(c => c.id === seccionInfo?.courseId);
    
    console.log(`\n🎯 Analizando sección problemática:`);
    console.log(`   • Sección ID: ${seccionProblematica}`);
    console.log(`   • Sección: ${seccionInfo?.name || 'No encontrada'}`);
    console.log(`   • Curso: ${cursoInfo?.name || 'No encontrado'}`);
    
    // 5. Verificar si el profesor está asignado a esta sección
    const asignacionEspecifica = asignacionesProfesor.find(a => a.sectionId === seccionProblematica);
    console.log(`   • ¿Profesor asignado a esta sección?: ${asignacionEspecifica ? '✅ SÍ' : '❌ NO'}`);
    
    if (asignacionEspecifica) {
      console.log(`   • Materias asignadas: ${asignacionesProfesor.filter(a => a.sectionId === seccionProblematica).map(a => a.subjectName).join(', ')}`);
    }
    
    // 6. Diagnóstico del courseId combinado
    const courseIdCombinado = '0880d4ca-7232-42dc-abef-1223e00a5c6e-a75b7e0e-1130-486a-ae5e-6f7233e002bf';
    console.log(`\n🔍 Analizando courseId combinado:`);
    console.log(`   • CourseId completo: ${courseIdCombinado}`);
    
    // Extraer partes
    const partes = courseIdCombinado.split('-');
    console.log(`   • Partes divididas: ${partes.length} partes`);
    console.log(`   • Partes: [${partes.join(', ')}]`);
    
    // El courseId real son los primeros 5 elementos
    const courseIdReal = partes.slice(0, 5).join('-');
    // El sectionId son los últimos 5 elementos
    const sectionIdExtraido = partes.slice(5, 10).join('-');
    
    console.log(`   • CourseId extraído: ${courseIdReal}`);
    console.log(`   • SectionId extraído: ${sectionIdExtraido}`);
    console.log(`   • ¿Coincide con sección problemática?: ${sectionIdExtraido === seccionProblematica ? '✅ SÍ' : '❌ NO'}`);
    
    // 7. Verificar si el profesor debería estar asignado automáticamente
    console.log(`\n🔄 Verificando si se necesita reparación automática...`);
    
    if (sectionIdExtraido === seccionProblematica && asignacionEspecifica) {
      console.log('✅ El profesor YA está correctamente asignado a la sección');
      console.log('🔍 El problema puede estar en la lógica de extracción del frontend');
      
      // Crear función de prueba
      console.log(`\n🧪 PRUEBA DE EXTRACCIÓN:`);
      function testExtraction(fullId) {
        const parts = fullId.split('-');
        if (parts.length === 10) {
          const courseId = parts.slice(0, 5).join('-');
          const sectionId = parts.slice(5, 10).join('-');
          return { courseId, sectionId, valid: true };
        }
        return { courseId: null, sectionId: null, valid: false };
      }
      
      const resultado = testExtraction(courseIdCombinado);
      console.log(`   • Test extracción: ${resultado.valid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
      console.log(`   • CourseId test: ${resultado.courseId}`);
      console.log(`   • SectionId test: ${resultado.sectionId}`);
      
      return {
        success: true,
        message: 'Profesor correctamente asignado - problema en frontend',
        profesorId: profesor.id,
        sectionId: seccionProblematica,
        asignaciones: asignacionesProfesor.length,
        debug: {
          courseIdCombinado,
          courseIdExtraido: courseIdReal,
          sectionIdExtraido,
          coincideSeccion: sectionIdExtraido === seccionProblematica
        }
      };
    }
    
    // 8. Si no está asignado, crear asignación
    if (sectionIdExtraido === seccionProblematica && !asignacionEspecifica) {
      console.log('🔧 Creando asignaciones faltantes para el profesor...');
      
      // Materias comunes
      const materias = [
        'Ciencias Naturales',
        'Historia, Geografía y Ciencias Sociales', 
        'Lenguaje y Comunicación',
        'Matemáticas'
      ];
      
      const nuevasAsignaciones = [];
      
      materias.forEach(materia => {
        const nuevaAsignacion = {
          teacherId: profesor.id,
          sectionId: seccionProblematica,
          subjectName: materia,
          assignedAt: new Date().toISOString()
        };
        nuevasAsignaciones.push(nuevaAsignacion);
        console.log(`   ✅ Asignación creada: ${materia}`);
      });
      
      // Guardar asignaciones actualizadas
      const todasLasAsignaciones = [...teacherAssignments, ...nuevasAsignaciones];
      localStorage.setItem('smart-student-teacher-assignments', JSON.stringify(todasLasAsignaciones));
      
      console.log(`\n🎉 REPARACIÓN COMPLETADA:`);
      console.log(`   • ${nuevasAsignaciones.length} asignaciones nuevas creadas`);
      console.log(`   • Profesor pedro ahora asignado a sección ${seccionInfo?.name}`);
      
      return {
        success: true,
        message: 'Asignaciones creadas exitosamente',
        profesorId: profesor.id,
        sectionId: seccionProblematica,
        nuevasAsignaciones: nuevasAsignaciones.length
      };
    }
    
    return {
      success: false,
      message: 'No se pudo determinar la acción necesaria',
      debug: { courseIdCombinado, sectionIdExtraido, seccionProblematica }
    };
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error);
    return { success: false, message: error.message };
  }
}

// Ejecutar reparación
console.log('🚀 Iniciando reparación de asignaciones de sección...');
const resultadoReparacion = repararAsignacionesSeccionProfesor();
console.log('\n✅ Resultado de la reparación:', resultadoReparacion);

// Función de verificación final
function verificarReparacion() {
  console.log('\n🔍 VERIFICACIÓN FINAL:');
  
  const teacherAssignments = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
  const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
  
  const profesor = users.find(u => u.username === 'pedro' && u.role === 'teacher');
  const seccionProblematica = 'a75b7e0e-1130-486a-ae5e-6f7233e002bf';
  
  if (profesor) {
    const asignacionesEnSeccion = teacherAssignments.filter(ta => 
      ta.teacherId === profesor.id && ta.sectionId === seccionProblematica
    );
    
    console.log(`   • Profesor pedro (${profesor.id})`);
    console.log(`   • Asignaciones en sección problemática: ${asignacionesEnSeccion.length}`);
    console.log(`   • Materias: ${asignacionesEnSeccion.map(a => a.subjectName).join(', ')}`);
    console.log(`   • Estado: ${asignacionesEnSeccion.length > 0 ? '✅ REPARADO' : '❌ AÚN CON PROBLEMAS'}`);
    
    return asignacionesEnSeccion.length > 0;
  }
  
  return false;
}

// Verificar automáticamente después de 1 segundo
setTimeout(() => {
  const reparado = verificarReparacion();
  if (reparado) {
    console.log('\n🎉 ¡PERFECTO! El profesor pedro ahora debería poder ver a sus estudiantes');
    console.log('💡 Recarga la página o vuelve a intentar crear una tarea');
  } else {
    console.log('\n⚠️ Puede que se necesite investigación adicional');
  }
}, 1000);
