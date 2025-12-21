// 🔧 Script de Corrección - Mostrar Curso y Sección en lugar de ID
// Este script corrige el problema donde se muestra el ID del curso en lugar del nombre

console.log('🔧 Corrigiendo visualización de curso y sección...');

function fixCourseDisplayInNotifications() {
    try {
        // 1. Obtener datos necesarios
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');

        console.log('📊 Estado inicial:');
        console.log(`   Usuario: ${currentUser.username} (${currentUser.role})`);
        console.log(`   Notificaciones: ${notifications.length}`);
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);

        // 2. Crear función para obtener nombre del curso
        function getCourseNameById(courseId) {
            console.log(`🔍 Buscando curso para ID: ${courseId}`);
            
            // El courseId puede ser un ID compuesto: cursoId-seccionId
            if (courseId && courseId.includes('-')) {
                const parts = courseId.split('-');
                if (parts.length >= 2) {
                    const cursoId = parts[0];
                    const seccionId = parts[1];
                    
                    console.log(`   Curso ID: ${cursoId}`);
                    console.log(`   Sección ID: ${seccionId}`);
                    
                    // Buscar curso
                    const curso = courses.find(c => c.id === cursoId);
                    const seccion = sections.find(s => s.id === seccionId);
                    
                    if (curso && seccion) {
                        const displayName = `${curso.name} ${seccion.name}`;
                        console.log(`   ✅ Encontrado: ${displayName}`);
                        return displayName;
                    }
                    
                    if (curso) {
                        console.log(`   ✅ Solo curso encontrado: ${curso.name}`);
                        return curso.name;
                    }
                }
            }
            
            // Buscar curso directamente
            const curso = courses.find(c => c.id === courseId);
            if (curso) {
                console.log(`   ✅ Curso directo encontrado: ${curso.name}`);
                return curso.name;
            }
            
            console.log(`   ❌ No se encontró curso para ID: ${courseId}`);
            return 'Curso no encontrado';
        }

        // 3. Probar la función con algunos IDs
        console.log('\n🧪 Probando función getCourseNameById:');
        const testCourseId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
        console.log(`Resultado para ID problemático: "${getCourseNameById(testCourseId)}"`);

        // 4. Mostrar todos los cursos disponibles
        console.log('\n📚 Cursos disponibles:');
        courses.forEach((curso, index) => {
            console.log(`   ${index + 1}. ${curso.name} (ID: ${curso.id})`);
        });

        console.log('\n📋 Secciones disponibles:');
        sections.forEach((seccion, index) => {
            console.log(`   ${index + 1}. ${seccion.name} (ID: ${seccion.id})`);
        });

        // 5. Verificar notificaciones actuales
        const userNotifications = notifications.filter(notif => 
            (notif.targetUsernames?.includes(currentUser.username) || notif.toUsername === currentUser.username)
        );

        console.log(`\n📋 Notificaciones del usuario (${userNotifications.length}):`);
        userNotifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. "${notif.taskTitle}"`);
            console.log(`      Course ID: ${notif.course}`);
            console.log(`      Debería mostrar: "${getCourseNameById(notif.course)}"`);
            console.log(`      Subject: ${notif.subject}`);
        });

        // 6. Crear función mejorada en window para uso en el componente
        window.getCourseNameByIdFixed = getCourseNameById;
        
        console.log('\n✅ Función getCourseNameByIdFixed creada en window');
        console.log('💡 Esta función puede ser usada en el componente de notificaciones');

        return true;

    } catch (error) {
        console.error('❌ Error al corregir visualización de curso:', error);
        return false;
    }
}

// Función para parchar el TaskNotificationManager
function patchTaskNotificationManager() {
    console.log('🔧 Aplicando parche al TaskNotificationManager...');
    
    try {
        // Verificar si TaskNotificationManager existe
        if (typeof window.TaskNotificationManager === 'undefined') {
            console.log('📦 TaskNotificationManager no encontrado en window, intentando cargar...');
            
            // Crear versión básica si no existe
            window.TaskNotificationManager = {
                getCourseNameById: window.getCourseNameByIdFixed || function(courseId) {
                    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
                    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
                    
                    if (courseId && courseId.includes('-')) {
                        const parts = courseId.split('-');
                        if (parts.length >= 2) {
                            const cursoId = parts[0];
                            const seccionId = parts[1];
                            
                            const curso = courses.find(c => c.id === cursoId);
                            const seccion = sections.find(s => s.id === seccionId);
                            
                            if (curso && seccion) {
                                return `${curso.name} ${seccion.name}`;
                            }
                            if (curso) {
                                return curso.name;
                            }
                        }
                    }
                    
                    const curso = courses.find(c => c.id === courseId);
                    return curso ? curso.name : 'Curso no encontrado';
                }
            };
            
            console.log('✅ TaskNotificationManager básico creado');
        } else {
            // Parchar el método existente
            const originalMethod = window.TaskNotificationManager.getCourseNameById;
            
            window.TaskNotificationManager.getCourseNameById = function(courseId) {
                try {
                    return window.getCourseNameByIdFixed(courseId);
                } catch (error) {
                    console.warn('⚠️ Error en método patcheado, usando original:', error);
                    return originalMethod ? originalMethod(courseId) : 'Error';
                }
            };
            
            console.log('✅ TaskNotificationManager.getCourseNameById patcheado');
        }
        
        // Forzar actualización del panel
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new Event('storage'));
        
        console.log('📡 Eventos de actualización disparados');
        
    } catch (error) {
        console.error('❌ Error al aplicar parche:', error);
    }
}

// Ejecutar corrección
console.log('🚀 Iniciando corrección completa...');
const success = fixCourseDisplayInNotifications();

if (success) {
    console.log('✅ Análisis completado');
    patchTaskNotificationManager();
    console.log('🎉 Corrección aplicada. El panel debería mostrar ahora el nombre del curso en lugar del ID.');
    console.log('💡 Si el problema persiste, recarga la página.');
} else {
    console.log('❌ No se pudo completar la corrección');
}

console.log('\n🔧 Script completado. Usa window.getCourseNameByIdFixed(courseId) para probar la función.');
