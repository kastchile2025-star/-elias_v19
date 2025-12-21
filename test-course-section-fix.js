/**
 * 🔧 VERIFICACIÓN DE CORRECCIÓN: Guardado de Curso y Sección
 * Ejecutar en la consola del navegador para verificar las correcciones
 */

console.log('🔧 VERIFICACIÓN DE CORRECCIÓN: Guardado de Curso y Sección');
console.log('=======================================================');

// 1. Verificar estructura de datos en localStorage
console.log('\n📊 VERIFICANDO DATOS EN LOCALSTORAGE:');

const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');

console.log(`   • Tareas: ${tasks.length}`);
console.log(`   • Cursos: ${courses.length}`);
console.log(`   • Secciones: ${sections.length}`);

// 2. Verificar cursos con secciones disponibles
console.log('\n🏫 CURSOS Y SECCIONES DISPONIBLES:');
courses.forEach(course => {
    const courseSections = sections.filter(s => s.courseId === course.id);
    console.log(`   📚 ${course.name}:`);
    courseSections.forEach(section => {
        const combinedId = `${course.id}-${section.id}`;
        console.log(`      📝 Sección ${section.name} - ID combinado: ${combinedId}`);
    });
});

// 3. Verificar tareas existentes y su estructura
console.log('\n📋 ANÁLISIS DE TAREAS EXISTENTES:');
if (tasks.length > 0) {
    tasks.forEach((task, index) => {
        console.log(`   🎯 Tarea ${index + 1}: "${task.title}"`);
        console.log(`      • course: ${task.course}`);
        console.log(`      • courseSectionId: ${task.courseSectionId || 'NO DEFINIDO'}`);
        
        // Verificar si el course corresponde a un courseId o a un ID combinado
        const isComposed = task.course && task.course.includes('-') && task.course.length > 40;
        console.log(`      • Tipo de ID: ${isComposed ? 'COMBINADO (course+section)' : 'SIMPLE (solo course)'}`);
        
        if (task.courseSectionId) {
            console.log(`      • ✅ NUEVA ESTRUCTURA: Tiene courseSectionId`);
        } else {
            console.log(`      • ⚠️ ESTRUCTURA ANTIGUA: Sin courseSectionId`);
        }
    });
} else {
    console.log('   ⚠️ No hay tareas en el sistema');
}

// 4. Función de prueba para crear tarea
window.testTaskCreation = function() {
    console.log('\n🧪 FUNCIÓN DE PRUEBA: Simulación de creación de tarea');
    
    // Simular datos que enviaría el formulario
    const testFormData = {
        course: '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3', // 4to Básico B
        title: 'Tarea de Prueba',
        subject: 'Matemáticas'
    };
    
    console.log('   📝 Datos del formulario simulados:');
    console.log('      course (ID combinado):', testFormData.course);
    
    // Simular extracción como en el código real
    const parts = testFormData.course.split('-');
    if (parts.length >= 10) {
        const courseId = parts.slice(0, 5).join('-');
        const sectionId = parts.slice(5).join('-');
        
        console.log('   🔧 Extracción de IDs:');
        console.log('      courseId extraído:', courseId);
        console.log('      sectionId extraído:', sectionId);
        console.log('      courseSectionId completo:', testFormData.course);
        
        // Buscar nombres
        const course = courses.find(c => c.id === courseId);
        const section = sections.find(s => s.id === sectionId);
        
        if (course && section) {
            console.log('   📚 Información encontrada:');
            console.log('      Curso:', course.name);
            console.log('      Sección:', section.name);
            console.log('      Nombre completo:', `${course.name} Sección ${section.name}`);
        }
        
        // Simular estructura de tarea que se guardaría
        const simulatedTask = {
            id: `task_test_${Date.now()}`,
            title: testFormData.title,
            subject: testFormData.subject,
            course: courseId, // Para compatibilidad
            courseSectionId: testFormData.course, // Para preservar sección
        };
        
        console.log('   💾 Estructura de tarea que se guardaría:');
        console.log('      course (courseId):', simulatedTask.course);
        console.log('      courseSectionId (completo):', simulatedTask.courseSectionId);
        console.log('   ✅ Esta estructura preserva tanto courseId como la información de sección');
    }
};

// 5. Instrucciones de prueba
console.log('\n🎯 INSTRUCCIONES PARA PROBAR:');
console.log('1. Ejecuta: testTaskCreation()');
console.log('2. Ve a la pestaña de Tareas en la app');
console.log('3. Crea una nueva tarea seleccionando "4to Básico Sección B"');
console.log('4. Guarda la tarea');
console.log('5. Verifica que aparezca como "4to Básico Sección B"');
console.log('6. Edita la tarea y verifica que mantiene "4to Básico Sección B"');
console.log('7. Crea otra tarea con "5to Básico Sección A" para verificar que no se confunda');

console.log('\n💡 NOTAS:');
console.log('• Las tareas nuevas tendrán campo "courseSectionId"');
console.log('• Las tareas antiguas seguirán funcionando con "course"');
console.log('• El sistema usa "courseSectionId" si existe, sino usa "course"');
console.log('• Esto garantiza compatibilidad hacia atrás');

// Ejecutar función de prueba automáticamente
testTaskCreation();
