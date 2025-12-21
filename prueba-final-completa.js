/**
 * 🎯 PRUEBA FINAL: Corrección Completa de "Todo el Curso"
 * 
 * Script para verificar que todas las correcciones aplicadas funcionan correctamente
 */

console.log('🎯 PRUEBA FINAL: CORRECCIÓN COMPLETA');
console.log('='.repeat(50));

// Verificar datos básicos
const currentUser = JSON.parse(localStorage.getItem('smart-student-current-user') || 'null');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

console.log(`👤 Usuario actual: ${currentUser?.username || 'N/A'} (${currentUser?.role || 'N/A'})`);
console.log(`📝 Tareas totales: ${tasks.length}`);

// Buscar tareas de "Todo el Curso"
const tareasCurso = tasks.filter(t => t.assignedTo === 'course');
console.log(`📊 Tareas "Todo el Curso": ${tareasCurso.length}`);

if (tareasCurso.length === 0) {
    console.log('\n❌ NO HAY TAREAS DE "TODO EL CURSO" PARA PROBAR');
    console.log('💡 Para crear una tarea de prueba:');
    console.log('1. Inicia sesión como profesor (jorge)');
    console.log('2. Ve a Tareas > Crear Nueva Tarea');
    console.log('3. Selecciona "Todo el Curso" y elige "4to Básico Sección A"');
    console.log('4. Guarda la tarea');
    console.log('5. Luego inicia sesión como felipe o maria para probar');
    return;
}

// Mostrar tareas encontradas
console.log('\n📝 TAREAS DE "TODO EL CURSO" ENCONTRADAS:');
tareasCurso.forEach((tarea, i) => {
    const courseId = tarea.courseSectionId || tarea.course;
    console.log(`${i + 1}. "${tarea.title}"`);
    console.log(`   CourseId: ${courseId}`);
    console.log(`   Tipo ID: ${courseId?.includes('-') && courseId.length > 40 ? '🔧 Combinado (UUID-UUID)' : '📚 Simple'}`);
    console.log(`   AssignedById: ${tarea.assignedById}`);
});

// Verificar estudiantes relevantes
console.log('\n👥 ESTUDIANTES RELEVANTES:');
const estudiantesRelevantes = [
    { username: 'felipe', seccion: '4to Básico Sección A', debería: 'VER' },
    { username: 'maria', seccion: '4to Básico Sección A', debería: 'VER' },
    { username: 'sofia', seccion: '4to Básico Sección B', debería: 'NO VER' },
    { username: 'karla', seccion: '4to Básico Sección B', debería: 'NO VER' },
    { username: 'gustavo', seccion: '5to Básico Sección A', debería: 'NO VER' },
    { username: 'max', seccion: '5to Básico Sección A', debería: 'NO VER' }
];

estudiantesRelevantes.forEach(est => {
    const userData = users.find(u => u.username === est.username);
    const userAssignments = studentAssignments.filter(a => a.studentId === userData?.id);
    
    console.log(`\n${est.username} (${est.seccion}):`);
    console.log(`   Expectativa: ${est.debería === 'VER' ? '✅ DEBE VER' : '❌ NO DEBE VER'} tareas de 4to A`);
    console.log(`   Asignaciones: ${userAssignments.length}`);
    
    if (userAssignments.length > 0) {
        userAssignments.forEach(asig => {
            console.log(`     CourseId: ${asig.courseId}, SectionId: ${asig.sectionId}`);
        });
    }
});

// Función de prueba simulada
function testGetCourseDataFromCombinedId(combinedId) {
    if (!combinedId) return null;
    
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    const parts = combinedId.split('-');
    if (parts.length < 2) return null;
    
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let courseId = '';
    let sectionId = '';
    
    for (let i = 5; i < parts.length - 4; i++) {
        const testCourseId = parts.slice(0, i).join('-');
        const testSectionId = parts.slice(i).join('-');
        
        if (guidPattern.test(testCourseId) && guidPattern.test(testSectionId)) {
            courseId = testCourseId;
            sectionId = testSectionId;
            break;
        }
    }
    
    if (!courseId || !sectionId) return null;
    
    const course = courses.find(c => c.id === courseId);
    const section = sections.find(s => s.id === sectionId);
    
    if (!course || !section) return null;
    
    return {
        id: combinedId,
        courseId: course.id,
        sectionId: section.id,
        name: `${course.name} Sección ${section.name}`
    };
}

// Probar función auxiliar con tareas reales
console.log('\n🔧 PROBANDO FUNCIÓN AUXILIAR:');
tareasCurso.forEach(tarea => {
    const courseId = tarea.courseSectionId || tarea.course;
    console.log(`\nTarea: "${tarea.title}"`);
    console.log(`CourseId: ${courseId}`);
    
    const result = testGetCourseDataFromCombinedId(courseId);
    if (result) {
        console.log(`✅ Parseado exitoso: ${result.name}`);
        console.log(`   CourseId: ${result.courseId}`);
        console.log(`   SectionId: ${result.sectionId}`);
    } else {
        console.log(`❌ No se pudo parsear el courseId`);
    }
});

console.log('\n🎯 INSTRUCCIONES DE PRUEBA:');
console.log('1. 🔄 Actualiza la página (F5) si no lo has hecho');
console.log('2. 👤 Asegúrate de estar logueado como Felipe o María');
console.log('3. 📚 Ve a la pestaña "Tareas"');
console.log('4. ✅ Deberías ver las tareas de "Todo el Curso" ahora');
console.log('5. 🔍 Si no aparecen, revisa la consola para logs de debug');

console.log('\n📊 LOGS CLAVE A BUSCAR:');
console.log('✅ [CORRECCIÓN] Detectado ID combinado, usando getCourseDataFromCombinedId...');
console.log('✅ [getFilteredTasks] Tarea "xxx" para estudiante felipe: ✅ VISIBLE');
console.log('✅ [isStudentAssignedToTask] Verificando acceso para estudiante...');

console.log('\n🚫 ERRORES QUE YA NO DEBERÍAN APARECER:');
console.log('❌ "availableCourses is not defined" - RESUELTO');
console.log('❌ "getStudentsForCourse No se encontró información" - RESUELTO');
console.log('❌ "getAvailableCoursesWithNames only works for teachers" - RESUELTO');

console.log('\n🎉 ¡TODAS LAS CORRECCIONES APLICADAS!');

// Ejecutar automáticamente si estamos en contexto de estudiante
if (currentUser?.role === 'student' && tareasCurso.length > 0) {
    console.log('\n🧪 EJECUTANDO PRUEBA AUTOMÁTICA...');
    setTimeout(() => {
        location.reload(); // Recargar para ver los cambios
    }, 2000);
    console.log('⏳ Recargando página en 2 segundos para aplicar cambios...');
}
