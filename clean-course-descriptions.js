// Script mejorado para limpiar las descripciones automáticas de los cursos
// Ejecutar en la consola del navegador

console.log('🧹 Iniciando limpieza avanzada de descripciones de cursos...');

// Función para limpiar cursos
function cleanCourseDescriptions() {
  try {
    // Obtener cursos del localStorage
    const coursesData = localStorage.getItem('courses');
    
    if (!coursesData) {
      console.log('ℹ️ No se encontraron datos de cursos en localStorage');
      return;
    }

    const courses = JSON.parse(coursesData);
    console.log(`📊 Encontrados ${courses.length} cursos`);
    
    let updated = false;
    
    // Limpiar descripciones que contengan patrones problemáticos
    const cleanedCourses = courses.map((course, index) => {
      console.log(`🔍 Revisando curso ${index + 1}: ${course.name}`);
      console.log(`📝 Descripción actual: "${course.description}"`);
      
      if (course.description) {
        // Verificar si contiene los patrones problemáticos
        const problematicPatterns = [
          'Curso de',
          'Educación Básica',
          'Educación Media'
        ];
        
        const hasProblematicText = problematicPatterns.some(pattern => 
          course.description.includes(pattern)
        );
        
        if (hasProblematicText) {
          console.log(`🔧 Limpiando descripción del curso: ${course.name}`);
          course.description = '';
          updated = true;
        }
      }
      
      return course;
    });
    
    if (updated) {
      // Guardar de vuelta en localStorage
      localStorage.setItem('courses', JSON.stringify(cleanedCourses));
      console.log('✅ Descripciones limpiadas exitosamente');
      console.log('🔄 Recarga la página para ver los cambios');
      
      // Mostrar resumen
      console.log('📋 Resumen de cursos después de la limpieza:');
      cleanedCourses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.name} - Descripción: "${course.description}"`);
      });
      
    } else {
      console.log('ℹ️ No se encontraron descripciones problemáticas que limpiar');
    }
    
  } catch (error) {
    console.error('❌ Error al procesar cursos:', error);
  }
}

// Ejecutar la función
cleanCourseDescriptions();

// También limpiar cualquier cache adicional
console.log('🗑️ Limpiando cache adicional...');
try {
  // Limpiar otros posibles almacenes de datos
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('course') || key.includes('Course')) {
      console.log(`🔍 Revisando clave: ${key}`);
    }
  });
} catch (error) {
  console.error('❌ Error al limpiar cache:', error);
}

console.log('🎯 Proceso de limpieza completado');
