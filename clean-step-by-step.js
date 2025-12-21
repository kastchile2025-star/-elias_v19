// Script alternativo - ejecutar línea por línea en la consola
// Copia y pega cada bloque por separado

// PASO 1: Verificar qué hay en localStorage
console.log('=== PASO 1: Verificando datos actuales ===');
const currentData = localStorage.getItem('courses');
if (currentData) {
    const courses = JSON.parse(currentData);
    console.log('Cursos encontrados:', courses.length);
    courses.forEach((course, i) => {
        console.log(`${i+1}. ${course.name} - Descripción: "${course.description}"`);
    });
} else {
    console.log('No hay datos de cursos');
}

// PASO 2: Limpiar descripciones (ejecutar este bloque después del paso 1)
console.log('=== PASO 2: Limpiando descripciones ===');
const coursesToClean = JSON.parse(localStorage.getItem('courses') || '[]');
const cleanedCourses = coursesToClean.map(course => ({
    ...course,
    description: '' // Forzar descripción vacía
}));
localStorage.setItem('courses', JSON.stringify(cleanedCourses));
console.log('✅ Todas las descripciones han sido limpiadas');

// PASO 3: Verificar el resultado (ejecutar después del paso 2)
console.log('=== PASO 3: Verificando resultado ===');
const finalData = JSON.parse(localStorage.getItem('courses') || '[]');
finalData.forEach((course, i) => {
    console.log(`${i+1}. ${course.name} - Descripción: "${course.description}"`);
});
console.log('🔄 Ahora recarga la página para ver los cambios');
