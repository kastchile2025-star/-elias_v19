// 🔧 Script específico para corregir visualización de curso + sección en rol PROFESOR
// Este script diagnostica y corrige específicamente las notificaciones del profesor

console.log('🎓 Diagnóstico PROFESOR - Corrección de curso + sección...');

function fixTeacherCourseDisplay() {
    try {
        // 1. Verificar usuario actual
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
        console.log(`👤 Usuario actual: ${currentUser.username} (${currentUser.role})`);
        
        if (currentUser.role !== 'teacher') {
            console.log('⚠️ Este script es específico para profesores');
            return false;
        }

        // 2. Obtener datos base
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

        console.log('\n📊 Datos disponibles:');
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Notificaciones: ${notifications.length}`);
        console.log(`   Comentarios: ${comments.length}`);
        console.log(`   Tareas: ${tasks.length}`);

        // 3. Analizar notificaciones del profesor
        const teacherNotifications = notifications.filter(notif => 
            notif.toUsername === currentUser.username ||
            notif.fromUsername === currentUser.username ||
            notif.targetUsernames?.includes(currentUser.username)
        );

        console.log(`\n🔔 Notificaciones del profesor: ${teacherNotifications.length}`);

        // 4. Crear función mejorada de análisis de cursos
        function analyzeCourseId(courseId, description = '') {
            console.log(`\n🔍 Analizando ${description}: "${courseId}"`);
            
            if (!courseId) {
                console.log('   ❌ ID de curso vacío');
                return 'Sin curso';
            }

            // Buscar curso directo
            const directCourse = courses.find(c => c.id === courseId);
            if (directCourse) {
                console.log(`   ✅ Curso directo encontrado: "${directCourse.name}"`);
                return directCourse.name;
            }

            // Analizar si es ID compuesto
            if (courseId.includes('-')) {
                const parts = courseId.split('-');
                console.log(`   📝 Partes del ID: ${parts.length}`);
                
                if (parts.length >= 10) { // Dos UUIDs
                    const cursoId = parts.slice(0, 5).join('-');
                    const seccionId = parts.slice(5, 10).join('-');
                    
                    console.log(`   🎯 Curso UUID: ${cursoId}`);
                    console.log(`   🎯 Sección UUID: ${seccionId}`);
                    
                    const curso = courses.find(c => c.id === cursoId);
                    const seccion = sections.find(s => s.id === seccionId);
                    
                    console.log(`   📚 Curso: ${curso ? curso.name : 'NO ENCONTRADO'}`);
                    console.log(`   📋 Sección: ${seccion ? seccion.name : 'NO ENCONTRADA'}`);
                    
                    if (curso && seccion) {
                        const result = `${curso.name} ${seccion.name}`;
                        console.log(`   ✅ Resultado compuesto: "${result}"`);
                        return result;
                    }
                    
                    if (curso) {
                        console.log(`   ⚠️ Solo curso encontrado: "${curso.name}"`);
                        return curso.name;
                    }
                }
            }

            console.log(`   ❌ No se encontró información para: "${courseId}"`);
            return 'Curso no encontrado';
        }

        // 5. Analizar algunas notificaciones específicas
        console.log('\n📋 Análisis de notificaciones específicas:');
        teacherNotifications.slice(0, 5).forEach((notif, index) => {
            console.log(`\n   ${index + 1}. ${notif.taskTitle || 'Sin título'}`);
            const result = analyzeCourseId(notif.course, `notificación ${index + 1}`);
            console.log(`      Debería mostrar: "${result}"`);
        });

        // 6. Analizar comentarios del profesor
        const teacherTasks = tasks.filter(task => task.assignedBy === currentUser.username);
        const teacherTaskIds = teacherTasks.map(task => task.id);
        const teacherComments = comments.filter(comment => 
            teacherTaskIds.includes(comment.taskId) && 
            comment.studentUsername !== currentUser.username
        );

        console.log(`\n💬 Comentarios en tareas del profesor: ${teacherComments.length}`);
        teacherComments.slice(0, 3).forEach((comment, index) => {
            const task = teacherTasks.find(t => t.id === comment.taskId);
            if (task) {
                console.log(`\n   ${index + 1}. Comentario en: ${task.title}`);
                const result = analyzeCourseId(task.course, `tarea ${index + 1}`);
                console.log(`      Debería mostrar: "${result}"`);
            }
        });

        // 7. Verificar si hay un problema específico con los datos
        console.log('\n🔬 Verificación de consistencia de datos:');
        
        // Verificar si todos los cursos tienen secciones
        const coursesWithoutSections = courses.filter(course => {
            const hasSection = sections.some(section => 
                section.courseId === course.id || // Relación directa
                sections.some(s => s.id === course.id) // Por si son iguales
            );
            return !hasSection;
        });

        console.log(`   📚 Cursos sin secciones: ${coursesWithoutSections.length}`);
        coursesWithoutSections.forEach(course => {
            console.log(`      - ${course.name} (ID: ${course.id})`);
        });

        // 8. Aplicar corrección al TaskNotificationManager
        function getCourseNameFixed(courseId) {
            if (!courseId) return 'Sin curso';
            
            // Buscar curso directo primero
            const directCourse = courses.find(c => c.id === courseId);
            if (directCourse) {
                // Buscar si tiene sección asociada
                const relatedSection = sections.find(s => 
                    s.courseId === courseId || 
                    s.course === courseId ||
                    (courseId.includes(s.id) && courseId.includes(directCourse.id))
                );
                
                if (relatedSection) {
                    return `${directCourse.name} ${relatedSection.name}`;
                }
                return directCourse.name;
            }
            
            // Si es ID compuesto
            if (courseId.includes('-')) {
                const parts = courseId.split('-');
                if (parts.length >= 10) {
                    const cursoId = parts.slice(0, 5).join('-');
                    const seccionId = parts.slice(5, 10).join('-');
                    
                    const curso = courses.find(c => c.id === cursoId);
                    const seccion = sections.find(s => s.id === seccionId);
                    
                    if (curso && seccion) {
                        return `${curso.name} ${seccion.name}`;
                    }
                    if (curso) return curso.name;
                }
            }
            
            return 'Curso no encontrado';
        }

        // 9. Aplicar parche
        if (typeof window.TaskNotificationManager !== 'undefined') {
            console.log('\n🔧 Aplicando parche específico para profesor...');
            window.TaskNotificationManager.getCourseNameById = getCourseNameFixed;
            console.log('✅ Parche aplicado al TaskNotificationManager');
        } else {
            console.log('\n📦 Creando TaskNotificationManager para profesor...');
            window.TaskNotificationManager = {
                getCourseNameById: getCourseNameFixed
            };
            console.log('✅ TaskNotificationManager creado');
        }

        // 10. Forzar actualización específica
        console.log('\n🔄 Forzando actualización de UI específica para profesor...');
        
        // Eventos específicos para profesor
        window.dispatchEvent(new CustomEvent('teacherNotificationsUpdate'));
        window.dispatchEvent(new CustomEvent('courseDataUpdate'));
        window.dispatchEvent(new Event('storage'));
        
        // Intentar re-render
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('forceComponentRerender'));
        }, 100);

        console.log('✅ Eventos específicos disparados');

        return true;

    } catch (error) {
        console.error('❌ Error en corrección específica del profesor:', error);
        return false;
    }
}

// Función para probar IDs específicos
function testTeacherCourseId(courseId) {
    console.log(`\n🧪 Prueba específica de ID: "${courseId}"`);
    const result = window.TaskNotificationManager ? 
        window.TaskNotificationManager.getCourseNameById(courseId) : 
        'TaskNotificationManager no disponible';
    console.log(`Resultado: "${result}"`);
    return result;
}

// Ejecutar corrección específica
console.log('🚀 Ejecutando corrección específica para profesor...');
const success = fixTeacherCourseDisplay();

if (success) {
    console.log('\n🎉 ¡Corrección específica aplicada!');
    console.log('💡 Usa testTeacherCourseId("id-del-curso") para probar IDs específicos');
    console.log('🔄 Si no se actualiza automáticamente, recarga la página');
} else {
    console.log('\n❌ No se pudo aplicar la corrección específica');
}

console.log('\n🎓 Script específico para profesor completado');
