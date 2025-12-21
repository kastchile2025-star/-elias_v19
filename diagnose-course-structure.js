// 🔍 Diagnóstico detallado de estructura de datos curso-sección
// Este script analiza la relación entre cursos y secciones

console.log('🔬 Diagnóstico detallado de estructura curso-sección...');

function analyzeCourseStructure() {
    try {
        // 1. Obtener datos
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');

        console.log('\n📊 Resumen de datos:');
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Tareas: ${tasks.length}`);
        console.log(`   Notificaciones: ${notifications.length}`);

        // 2. Analizar estructura de cursos
        console.log('\n📚 Estructura de cursos:');
        courses.forEach((course, index) => {
            console.log(`   ${index + 1}. "${course.name}"`);
            console.log(`      ID: ${course.id}`);
            console.log(`      Propiedades:`, Object.keys(course));
            if (index < 3) console.log(`      Contenido completo:`, course);
        });

        // 3. Analizar estructura de secciones
        console.log('\n📋 Estructura de secciones:');
        sections.forEach((section, index) => {
            console.log(`   ${index + 1}. "${section.name}"`);
            console.log(`      ID: ${section.id}`);
            console.log(`      Propiedades:`, Object.keys(section));
            if (index < 3) console.log(`      Contenido completo:`, section);
        });

        // 4. Buscar relaciones curso-sección
        console.log('\n🔗 Análisis de relaciones curso-sección:');
        
        courses.forEach((course, index) => {
            console.log(`\n   📚 Curso ${index + 1}: "${course.name}" (${course.id})`);
            
            // Buscar secciones relacionadas por diferentes métodos
            const relatedSections = sections.filter(section => 
                section.courseId === course.id ||
                section.course === course.id ||
                section.relatedCourse === course.id ||
                section.parentCourse === course.id
            );
            
            console.log(`      Secciones relacionadas: ${relatedSections.length}`);
            relatedSections.forEach(section => {
                console.log(`         - "${section.name}" (${section.id})`);
            });
            
            if (relatedSections.length === 0) {
                console.log(`      ❌ Sin secciones relacionadas encontradas`);
            }
        });

        // 5. Analizar IDs de tareas para entender el patrón
        console.log('\n📝 Análisis de IDs de curso en tareas:');
        const uniqueCourseIds = [...new Set(tasks.map(task => task.course))];
        
        uniqueCourseIds.forEach((courseId, index) => {
            console.log(`\n   ${index + 1}. ID de curso en tarea: "${courseId}"`);
            
            // Verificar si es ID simple o compuesto
            if (courseId && courseId.includes('-')) {
                const parts = courseId.split('-');
                console.log(`      Partes: ${parts.length}`);
                
                if (parts.length >= 10) {
                    const cursoId = parts.slice(0, 5).join('-');
                    const seccionId = parts.slice(5, 10).join('-');
                    
                    console.log(`      Posible curso ID: ${cursoId}`);
                    console.log(`      Posible sección ID: ${seccionId}`);
                    
                    const curso = courses.find(c => c.id === cursoId);
                    const seccion = sections.find(s => s.id === seccionId);
                    
                    console.log(`      Curso encontrado: ${curso ? curso.name : 'NO'}`);
                    console.log(`      Sección encontrada: ${seccion ? seccion.name : 'NO'}`);
                }
            } else {
                // ID simple, buscar curso directo
                const curso = courses.find(c => c.id === courseId);
                console.log(`      Curso directo: ${curso ? curso.name : 'NO ENCONTRADO'}`);
                
                if (curso) {
                    // Buscar secciones relacionadas
                    const relatedSections = sections.filter(s => 
                        s.courseId === courseId ||
                        s.course === courseId ||
                        s.relatedCourse === courseId
                    );
                    console.log(`      Secciones relacionadas: ${relatedSections.length}`);
                    relatedSections.forEach(section => {
                        console.log(`         - ${section.name}`);
                    });
                }
            }
        });

        // 6. Analizar notificaciones problemáticas
        console.log('\n🔔 Análisis de notificaciones problemáticas:');
        
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
        const userNotifications = notifications.filter(notif => 
            notif.toUsername === currentUser.username ||
            notif.fromUsername === currentUser.username ||
            notif.targetUsernames?.includes(currentUser.username)
        );

        console.log(`   Notificaciones del usuario (${currentUser.role}): ${userNotifications.length}`);
        
        userNotifications.slice(0, 5).forEach((notif, index) => {
            console.log(`\n   ${index + 1}. "${notif.taskTitle}"`);
            console.log(`      Curso ID: ${notif.course}`);
            
            // Aplicar la lógica de resolución
            let resolvedName = 'No resuelto';
            
            // Método 1: ID compuesto
            if (notif.course && notif.course.includes('-')) {
                const parts = notif.course.split('-');
                if (parts.length >= 10) {
                    const cursoId = parts.slice(0, 5).join('-');
                    const seccionId = parts.slice(5, 10).join('-');
                    
                    const curso = courses.find(c => c.id === cursoId);
                    const seccion = sections.find(s => s.id === seccionId);
                    
                    if (curso && seccion) {
                        resolvedName = `${curso.name} ${seccion.name}`;
                    } else if (curso) {
                        resolvedName = curso.name;
                    }
                }
            }
            
            // Método 2: Curso directo con sección relacionada
            if (resolvedName === 'No resuelto') {
                const course = courses.find(c => c.id === notif.course);
                if (course) {
                    const relatedSection = sections.find(s => 
                        s.courseId === notif.course ||
                        s.course === notif.course ||
                        s.relatedCourse === notif.course
                    );
                    
                    if (relatedSection) {
                        resolvedName = `${course.name} ${relatedSection.name}`;
                    } else {
                        resolvedName = course.name;
                    }
                }
            }
            
            console.log(`      Nombre resuelto: "${resolvedName}"`);
            
            if (resolvedName.includes(' ')) {
                console.log(`      ✅ Incluye sección`);
            } else {
                console.log(`      ⚠️ Solo curso, sin sección`);
            }
        });

        // 7. Recomendaciones
        console.log('\n💡 Recomendaciones:');
        
        const coursesWithoutSections = courses.filter(course => {
            const hasSection = sections.some(section => 
                section.courseId === course.id ||
                section.course === course.id ||
                section.relatedCourse === course.id
            );
            return !hasSection;
        });
        
        if (coursesWithoutSections.length > 0) {
            console.log(`   ⚠️ ${coursesWithoutSections.length} cursos sin secciones relacionadas:`);
            coursesWithoutSections.forEach(course => {
                console.log(`      - ${course.name}`);
            });
        }

        const sectionsWithoutCourses = sections.filter(section => {
            const hasCourse = courses.some(course => 
                section.courseId === course.id ||
                section.course === course.id ||
                section.relatedCourse === course.id
            );
            return !hasCourse;
        });
        
        if (sectionsWithoutCourses.length > 0) {
            console.log(`   ⚠️ ${sectionsWithoutCourses.length} secciones sin cursos relacionados:`);
            sectionsWithoutCourses.forEach(section => {
                console.log(`      - ${section.name}`);
            });
        }

        return {
            courses,
            sections,
            coursesWithoutSections,
            sectionsWithoutCourses,
            userNotifications
        };

    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
        return null;
    }
}

// Función para buscar manualmente
function findCourseAndSection(query) {
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    
    console.log(`\n🔍 Buscando: "${query}"`);
    
    const matchingCourses = courses.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.id.includes(query)
    );
    
    const matchingSections = sections.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.id.includes(query)
    );
    
    console.log(`Cursos encontrados: ${matchingCourses.length}`);
    matchingCourses.forEach(course => {
        console.log(`   📚 ${course.name} (${course.id})`);
    });
    
    console.log(`Secciones encontradas: ${matchingSections.length}`);
    matchingSections.forEach(section => {
        console.log(`   📋 ${section.name} (${section.id})`);
    });
}

// Ejecutar diagnóstico
console.log('🚀 Ejecutando diagnóstico...');
const result = analyzeCourseStructure();

if (result) {
    console.log('\n🎉 Diagnóstico completado');
    console.log('💡 Usa findCourseAndSection("término") para buscar específicamente');
    console.log('📝 Usa analyzeCourseStructure() para ejecutar de nuevo');
} else {
    console.log('\n❌ Diagnóstico falló');
}

// Hacer funciones disponibles globalmente
window.analyzeCourseStructure = analyzeCourseStructure;
window.findCourseAndSection = findCourseAndSection;
