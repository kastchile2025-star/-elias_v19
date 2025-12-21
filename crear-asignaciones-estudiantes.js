/**
 * 🔧 SOLUCIÓN INMEDIATA: Crear Asignaciones de Estudiantes
 * 
 * Este script crea las asignaciones faltantes entre estudiantes, cursos y secciones
 * basándose en los datos existentes en activeCourses de cada estudiante.
 */

console.log('🔧 INICIANDO CREACIÓN DE ASIGNACIONES DE ESTUDIANTES...');

function crearAsignacionesFaltantes() {
    console.log('\n🔧 [CREAR ASIGNACIONES] Procesando asignaciones faltantes...');
    
    try {
        // Obtener datos del sistema
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        let studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log(`📊 Datos disponibles:`);
        console.log(`   • Estudiantes: ${students.length}`);
        console.log(`   • Cursos: ${courses.length}`);
        console.log(`   • Secciones: ${sections.length}`);
        console.log(`   • Asignaciones existentes: ${studentAssignments.length}`);
        
        let asignacionesCreadas = 0;
        
        students.forEach(student => {
            // Verificar si ya tiene asignación
            const existingAssignment = studentAssignments.find(a => a.studentId === student.id);
            if (existingAssignment) {
                console.log(`✅ ${student.displayName || student.username} ya tiene asignación`);
                return;
            }
            
            // Buscar curso y sección basándose en activeCourses
            if (student.activeCourses && student.activeCourses.length > 0) {
                const activeCourse = student.activeCourses[0]; // "4to Básico"
                
                // Buscar el curso por nombre
                const course = courses.find(c => c.name === activeCourse || activeCourse.includes(c.name));
                
                if (course) {
                    // Buscar una sección disponible para este curso
                    const availableSections = sections.filter(s => s.courseId === course.id);
                    
                    if (availableSections.length > 0) {
                        // Asignar a la primera sección disponible (o sección A si existe)
                        let targetSection = availableSections.find(s => s.name === 'A') || availableSections[0];
                        
                        // Crear la asignación
                        const newAssignment = {
                            id: `assignment-${student.id}-${Date.now()}`,
                            studentId: student.id,
                            courseId: course.id,
                            sectionId: targetSection.id,
                            createdAt: new Date().toISOString(),
                            createdBy: 'auto-assignment-script'
                        };
                        
                        studentAssignments.push(newAssignment);
                        asignacionesCreadas++;
                        
                        console.log(`✅ Asignación creada para ${student.displayName || student.username}:`);
                        console.log(`   • Curso: ${course.name}`);
                        console.log(`   • Sección: ${targetSection.name}`);
                        console.log(`   • CourseId: ${course.id}`);
                        console.log(`   • SectionId: ${targetSection.id}`);
                        
                        // Actualizar datos del estudiante
                        student.sectionName = targetSection.name;
                        student.assignedTeacher = 'admin'; // Temporalmente asignar a admin
                        
                    } else {
                        console.log(`⚠️ ${student.displayName || student.username}: No hay secciones para el curso ${course.name}`);
                    }
                } else {
                    console.log(`⚠️ ${student.displayName || student.username}: No se encontró curso para "${activeCourse}"`);
                }
            } else {
                console.log(`⚠️ ${student.displayName || student.username}: No tiene activeCourses definido`);
            }
        });
        
        // Guardar los cambios
        localStorage.setItem('smart-student-student-assignments', JSON.stringify(studentAssignments));
        localStorage.setItem('smart-student-users', JSON.stringify(users));
        
        console.log(`\n🎉 COMPLETADO:`);
        console.log(`   • Asignaciones creadas: ${asignacionesCreadas}`);
        console.log(`   • Total asignaciones ahora: ${studentAssignments.length}`);
        
        if (asignacionesCreadas > 0) {
            console.log('\n💡 SIGUIENTE PASO:');
            console.log('   1. Recarga la página (F5)');
            console.log('   2. Ve a crear una nueva tarea');
            console.log('   3. Selecciona un curso-sección');
            console.log('   4. Elige "Estudiantes específicos"');
            console.log('   5. ¡Ahora deberías ver los estudiantes de esa sección!');
        }
        
        return asignacionesCreadas;
        
    } catch (error) {
        console.error('❌ Error al crear asignaciones:', error);
        return 0;
    }
}

// Función para verificar las asignaciones después de crearlas
function verificarAsignaciones() {
    console.log('\n🔍 [VERIFICACIÓN] Verificando asignaciones creadas...');
    
    try {
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        
        const students = users.filter(u => u.role === 'student');
        
        console.log(`📊 Resumen actual:`);
        console.log(`   • Total estudiantes: ${students.length}`);
        console.log(`   • Total asignaciones: ${studentAssignments.length}`);
        
        studentAssignments.forEach((assignment, index) => {
            const student = students.find(s => s.id === assignment.studentId);
            const course = courses.find(c => c.id === assignment.courseId);
            const section = sections.find(s => s.id === assignment.sectionId);
            
            console.log(`\n   ${index + 1}. 👤 ${student?.displayName || 'Estudiante desconocido'}:`);
            console.log(`      • Curso: ${course?.name || 'Curso desconocido'}`);
            console.log(`      • Sección: ${section?.name || 'Sección desconocida'}`);
            console.log(`      • CourseId: ${assignment.courseId}`);
            console.log(`      • SectionId: ${assignment.sectionId}`);
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        return false;
    }
}

// Ejecutar automáticamente
console.log('🚀 Ejecutando creación de asignaciones...');
const resultado = crearAsignacionesFaltantes();

if (resultado > 0) {
    console.log('\n✅ ASIGNACIONES CREADAS EXITOSAMENTE');
    console.log('\n🔧 FUNCIONES DISPONIBLES:');
    console.log('   • crearAsignacionesFaltantes() - Para crear más asignaciones');
    console.log('   • verificarAsignaciones() - Para verificar el estado actual');
    console.log('   • diagnosticoCompleto() - Para ejecutar el diagnóstico completo');
    
    // Verificar automáticamente
    verificarAsignaciones();
} else {
    console.log('\n⚠️ No se crearon asignaciones nuevas');
}
