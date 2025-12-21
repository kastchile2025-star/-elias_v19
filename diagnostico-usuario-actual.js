/**
 * 🔍 DIAGNÓSTICO: Usuario Actual y Sistema de Tareas
 * 
 * Verificar exactamente qué está pasando con el usuario actual
 * y por qué no ve las tareas de "Todo el Curso"
 */

console.log('🔍 DIAGNÓSTICO USUARIO ACTUAL');
console.log('='.repeat(50));

// 1. Verificar usuario actual
const currentUser = JSON.parse(localStorage.getItem('smart-student-current-user') || 'null');
console.log('\n👤 USUARIO ACTUAL:');
console.log('Usuario:', currentUser);

if (currentUser) {
    console.log(`   ID: ${currentUser.id}`);
    console.log(`   Username: ${currentUser.username}`);
    console.log(`   Role: ${currentUser.role}`);
    console.log(`   ActiveCourses: [${(currentUser.activeCourses || []).join(', ')}]`);
}

// 2. Verificar datos del sistema
const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');

console.log('\n📊 DATOS DEL SISTEMA:');
console.log(`   Usuarios: ${users.length}`);
console.log(`   Tareas: ${tasks.length}`);
console.log(`   Asignaciones de estudiantes: ${studentAssignments.length}`);

// 3. Verificar tareas
console.log('\n📝 TAREAS EN EL SISTEMA:');
tasks.forEach((task, index) => {
    console.log(`${index + 1}. "${task.title}"`);
    console.log(`   AssignedTo: ${task.assignedTo}`);
    console.log(`   Course: ${task.course || 'N/A'}`);
    console.log(`   CourseSectionId: ${task.courseSectionId || 'N/A'}`);
    console.log(`   AssignedStudentIds: [${(task.assignedStudentIds || []).join(', ')}]`);
    console.log('');
});

// 4. Verificar asignaciones del usuario actual (si es estudiante)
if (currentUser && currentUser.role === 'student') {
    console.log('\n🎓 ASIGNACIONES DEL ESTUDIANTE ACTUAL:');
    const userAssignments = studentAssignments.filter(a => a.studentId === currentUser.id);
    
    if (userAssignments.length === 0) {
        console.log('❌ NO SE ENCONTRARON ASIGNACIONES');
        console.log('🔍 Buscando por username...');
        
        const userByUsername = users.find(u => u.username === currentUser.username);
        if (userByUsername && userByUsername.id !== currentUser.id) {
            console.log(`⚠️ DISCREPANCIA DE ID DETECTADA:`);
            console.log(`   CurrentUser.id: ${currentUser.id}`);
            console.log(`   Users.find.id: ${userByUsername.id}`);
            
            const assignmentsByCorrectId = studentAssignments.filter(a => a.studentId === userByUsername.id);
            console.log(`   Asignaciones con ID correcto: ${assignmentsByCorrectId.length}`);
            
            assignmentsByCorrectId.forEach((asig, i) => {
                console.log(`   ${i + 1}. CourseId: ${asig.courseId}, SectionId: ${asig.sectionId}`);
            });
        }
    } else {
        console.log(`✅ Encontradas ${userAssignments.length} asignaciones:`);
        userAssignments.forEach((asig, i) => {
            console.log(`   ${i + 1}. CourseId: ${asig.courseId}, SectionId: ${asig.sectionId}`);
        });
    }
}

// 5. Probar función getCourseDataFromCombinedId si existe
console.log('\n🔧 PROBANDO FUNCIÓN getCourseDataFromCombinedId:');
const testId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';

// Simular la función si no está disponible
function testGetCourseDataFromCombinedId(combinedId) {
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

const testResult = testGetCourseDataFromCombinedId(testId);
console.log('Resultado de parseo:', testResult);

// 6. Verificar si la función isStudentAssignedToTask existe en el contexto actual
console.log('\n🔍 VERIFICANDO CONTEXTO DE LA FUNCIÓN:');
console.log('La función isStudentAssignedToTask debe estar dentro del componente React.');
console.log('Para probar, usa la consola del navegador después de que cargue la página.');

// 7. Mostrar datos específicos de Felipe
console.log('\n👤 DATOS ESPECÍFICOS DE FELIPE:');
const felipe = users.find(u => u.username === 'felipe');
if (felipe) {
    console.log('Felipe encontrado:', felipe);
    
    const felipeAssignments = studentAssignments.filter(a => a.studentId === felipe.id);
    console.log(`Asignaciones de Felipe: ${felipeAssignments.length}`);
    felipeAssignments.forEach(asig => {
        console.log(`   CourseId: ${asig.courseId}, SectionId: ${asig.sectionId}`);
    });
    
    // Buscar tarea de Todo el Curso
    const tareaCurso = tasks.find(t => t.assignedTo === 'course');
    if (tareaCurso) {
        console.log(`\nTarea de curso: "${tareaCurso.title}"`);
        console.log(`TaskCourseId: ${tareaCurso.courseSectionId || tareaCurso.course}`);
        
        const taskData = testGetCourseDataFromCombinedId(tareaCurso.courseSectionId || tareaCurso.course);
        if (taskData) {
            console.log(`Datos de la tarea: ${taskData.name}`);
            console.log(`CourseId: ${taskData.courseId}, SectionId: ${taskData.sectionId}`);
            
            const match = felipeAssignments.some(a => 
                a.courseId === taskData.courseId && a.sectionId === taskData.sectionId
            );
            console.log(`¿Felipe debería ver la tarea? ${match ? '✅ SÍ' : '❌ NO'}`);
        }
    }
} else {
    console.log('❌ Felipe no encontrado en users');
}

console.log('\n💡 SIGUIENTE PASO: Ejecuta este script en la consola del navegador');
console.log('después de que la página se haya cargado completamente.');
