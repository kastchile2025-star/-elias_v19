// Script para inspeccionar TODAS las claves de cursos en localStorage
console.log('🔍 Inspeccionando todas las claves de cursos...');

// Revisar todas las claves que contengan 'course'
const allKeys = Object.keys(localStorage);
const courseKeys = allKeys.filter(key => 
  key.toLowerCase().includes('course') || 
  key.toLowerCase().includes('curso')
);

console.log('📋 Claves encontradas relacionadas con cursos:', courseKeys);

courseKeys.forEach(key => {
  console.log(`\n🔑 Clave: ${key}`);
  try {
    const data = localStorage.getItem(key);
    console.log(`📊 Tamaño de datos: ${data?.length || 0} caracteres`);
    
    // Intentar parsear como JSON
    if (data) {
      try {
        const parsed = JSON.parse(data);
        
        if (Array.isArray(parsed)) {
          console.log(`📚 Array con ${parsed.length} elementos`);
          parsed.forEach((item, index) => {
            if (item.name && item.description !== undefined) {
              console.log(`   ${index + 1}. ${item.name} - Descripción: "${item.description}"`);
            }
          });
        } else if (typeof parsed === 'object') {
          console.log('📦 Objeto:', Object.keys(parsed));
          if (parsed.courses && Array.isArray(parsed.courses)) {
            console.log(`📚 Cursos en objeto: ${parsed.courses.length}`);
            parsed.courses.forEach((course, index) => {
              if (course.name && course.description !== undefined) {
                console.log(`   ${index + 1}. ${course.name} - Descripción: "${course.description}"`);
              }
            });
          }
        }
      } catch (parseError) {
        console.log('⚠️ No es JSON válido:', data.substring(0, 100) + '...');
      }
    }
  } catch (error) {
    console.error(`❌ Error al revisar ${key}:`, error);
  }
});

console.log('\n✅ Inspección completada');
