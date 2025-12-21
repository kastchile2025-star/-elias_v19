// Script para verificar los cursos en localStorage
console.log('🔍 Verificando cursos en localStorage...');

// Verificar cursos en smart-student-courses
const coursesData = localStorage.getItem('smart-student-courses');
if (coursesData) {
    console.log('📚 Cursos encontrados en smart-student-courses:');
    const courses = JSON.parse(coursesData);
    courses.forEach((course, index) => {
        console.log(`${index + 1}. ID: ${course.id}, Nombre: "${course.name}"`);
        if (course.name && course.name.includes('(')) {
            console.log(`   ⚠️ POSIBLE PROBLEMA: El nombre incluye paréntesis`);
        }
    });
} else {
    console.log('❌ No se encontraron cursos en smart-student-courses');
}

// Verificar otras claves relacionadas con cursos
const allKeys = Object.keys(localStorage);
const courseKeys = allKeys.filter(key => 
    key.toLowerCase().includes('course') || 
    key.toLowerCase().includes('curso')
);

console.log('\n🔑 Todas las claves relacionadas con cursos:');
courseKeys.forEach(key => {
    const data = localStorage.getItem(key);
    console.log(`- ${key}: ${data ? data.length : 0} caracteres`);
    
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                console.log(`  📊 Array con ${parsed.length} elementos`);
                parsed.forEach((item, index) => {
                    if (typeof item === 'string') {
                        console.log(`    ${index + 1}. "${item}"`);
                        if (item.includes('(')) {
                            console.log(`       ⚠️ POSIBLE PROBLEMA: Incluye paréntesis`);
                        }
                    } else if (item && item.name) {
                        console.log(`    ${index + 1}. "${item.name}"`);
                        if (item.name.includes('(')) {
                            console.log(`       ⚠️ POSIBLE PROBLEMA: Incluye paréntesis`);
                        }
                    }
                });
            }
        } catch (e) {
            console.log(`  ❌ No es JSON válido`);
        }
    }
});

console.log('\n✅ Verificación completada');
