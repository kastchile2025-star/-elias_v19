/**
 * 🔧 CORRECCIÓN PARA isStudentAssignedToTask
 * 
 * El problema identificado: la función getAvailableCoursesWithNames() solo funciona para profesores,
 * pero isStudentAssignedToTask la llama cuando el usuario actual es un estudiante.
 * 
 * SOLUCIÓN: Crear una función auxiliar para obtener datos de curso-sección sin depender del rol del usuario
 */

console.log('🔧 APLICANDO CORRECCIÓN PARA isStudentAssignedToTask');
console.log('='.repeat(60));

// 📋 Función auxiliar para obtener datos de curso-sección desde IDs combinados
function getCourseDataFromCombinedId(combinedId) {
    console.log(`🔍 Analizando ID combinado: ${combinedId}`);
    
    // Cargar datos del sistema
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    // El formato es: courseId-sectionId
    const parts = combinedId.split('-');
    
    if (parts.length < 2) {
        console.log('❌ ID no tiene formato correcto (courseId-sectionId)');
        return null;
    }
    
    // Para IDs UUID, necesitamos reconstruir correctamente
    // Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let courseId = '';
    let sectionId = '';
    
    // Encontrar dónde termina el primer UUID y empieza el segundo
    for (let i = 5; i < parts.length - 4; i++) {
        const testCourseId = parts.slice(0, i).join('-');
        const testSectionId = parts.slice(i).join('-');
        
        if (guidPattern.test(testCourseId) && guidPattern.test(testSectionId)) {
            courseId = testCourseId;
            sectionId = testSectionId;
            break;
        }
    }
    
    console.log(`📊 CourseId extraído: ${courseId}`);
    console.log(`📊 SectionId extraído: ${sectionId}`);
    
    if (!courseId || !sectionId) {
        console.log('❌ No se pudieron extraer IDs válidos');
        return null;
    }
    
    // Buscar el curso y la sección
    const course = courses.find(c => c.id === courseId);
    const section = sections.find(s => s.id === sectionId);
    
    if (!course || !section) {
        console.log(`❌ Curso o sección no encontrado. Curso: ${course ? '✅' : '❌'}, Sección: ${section ? '✅' : '❌'}`);
        return null;
    }
    
    const result = {
        id: combinedId,
        courseId: course.id,
        sectionId: section.id,
        name: `${course.name} Sección ${section.name}`,
        originalCourseName: course.name,
        sectionName: section.name
    };
    
    console.log(`✅ Datos extraídos: ${result.name}`);
    return result;
}

// 🧪 Probar la función auxiliar
console.log('\n🧪 PROBANDO FUNCIÓN AUXILIAR:');
const testId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
const result = getCourseDataFromCombinedId(testId);
console.log('Resultado:', result);

// 🛠️ Función corregida para reemplazar la problemática
function isStudentAssignedToTaskCORREGIDA(taskId, studentId, studentUsername) {
    console.log(`\n🔧 FUNCIÓN CORREGIDA: Verificando acceso para ${studentUsername}`);
    
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        console.log(`❌ Tarea no encontrada: ${taskId}`);
        return false;
    }
    
    console.log(`📋 Tarea: "${task.title}", asignada a: ${task.assignedTo}`);
    
    // Si la tarea está asignada a estudiantes específicos
    if (task.assignedTo === 'student' && task.assignedStudentIds) {
        const isDirectlyAssigned = task.assignedStudentIds.includes(studentId);
        console.log(`🎯 Estudiante directamente asignado: ${isDirectlyAssigned ? '✅' : '❌'}`);
        return isDirectlyAssigned;
    }
    
    // Si la tarea está asignada a todo el curso
    if (task.assignedTo === 'course') {
        const taskCourseId = task.courseSectionId || task.course;
        
        if (!taskCourseId) {
            console.log(`⚠️ Tarea sin courseId definido`);
            return false;
        }
        
        console.log(`🎯 TaskCourseId: ${taskCourseId}`);
        
        // 🔧 CORRECCIÓN: Usar función auxiliar en lugar de getAvailableCoursesWithNames()
        const taskCourseData = getCourseDataFromCombinedId(taskCourseId);
        
        if (!taskCourseData) {
            console.log(`❌ No se pudo obtener datos del curso para ID: ${taskCourseId}`);
            return false;
        }
        
        console.log(`✅ Datos del curso obtenidos: ${taskCourseData.name}`);
        
        // Verificar asignaciones del estudiante
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const isAssignedToTaskSection = studentAssignments.some(assignment => 
            assignment.studentId === studentId && 
            assignment.sectionId === taskCourseData.sectionId && 
            assignment.courseId === taskCourseData.courseId
        );
        
        console.log(`🏫 Verificando curso ${taskCourseData.courseId} sección ${taskCourseData.sectionId}`);
        console.log(`📊 Estudiante asignado a esta sección: ${isAssignedToTaskSection ? '✅' : '❌'}`);
        
        if (isAssignedToTaskSection) {
            return true;
        }
        
        // Fallback: verificar por activeCourses
        const usersText = localStorage.getItem('smart-student-users');
        const allUsers = usersText ? JSON.parse(usersText) : [];
        const studentData = allUsers.find(u => u.id === studentId || u.username === studentUsername);
        
        if (studentData) {
            const isInActiveCourses = studentData.activeCourses?.includes(taskCourseId) || false;
            console.log(`🔄 Fallback activeCourses: ${isInActiveCourses ? '✅' : '❌'}`);
            return isInActiveCourses;
        }
    }
    
    // Otros fallbacks...
    console.log(`❌ Estudiante ${studentUsername} no tiene acceso a la tarea`);
    return false;
}

// 🧪 Probar función corregida
console.log('\n🧪 PROBANDO FUNCIÓN CORREGIDA:');
const estudiantePrueba = JSON.parse(localStorage.getItem('smart-student-users') || '[]').find(u => u.role === 'student');
const tareaPrueba = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]').find(t => t.assignedTo === 'course');

if (estudiantePrueba && tareaPrueba) {
    console.log(`\nProbando con estudiante: ${estudiantePrueba.username}`);
    console.log(`Probando con tarea: ${tareaPrueba.title}`);
    
    const resultado = isStudentAssignedToTaskCORREGIDA(tareaPrueba.id, estudiantePrueba.id, estudiantePrueba.username);
    console.log(`\n🎯 RESULTADO FINAL: ${resultado ? '✅ PUEDE VER' : '❌ NO PUEDE VER'}`);
} else {
    console.log('❌ No se encontraron datos para prueba');
}

// Hacer disponible globalmente para pruebas
window.getCourseDataFromCombinedId = getCourseDataFromCombinedId;
window.isStudentAssignedToTaskCORREGIDA = isStudentAssignedToTaskCORREGIDA;

console.log('\n✅ CORRECCIÓN COMPLETADA');
console.log('💡 La función corregida está disponible como: isStudentAssignedToTaskCORREGIDA()');
