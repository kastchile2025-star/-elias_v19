// 🔧 Script Inmediato - Mostrar "8vo Básico Sección Z" en lugar del ID largo
// Este script corrige INMEDIATAMENTE el problema del ID del curso

console.log('🔧 Corrigiendo visualización de curso inmediatamente...');

function fixCourseDisplayImmediate() {
    try {
        // 1. Verificar datos disponibles
        const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
        const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        
        console.log('📊 Datos disponibles:');
        console.log(`   Cursos: ${courses.length}`);
        console.log(`   Secciones: ${sections.length}`);
        console.log(`   Notificaciones: ${notifications.length}`);

        // 2. Mostrar todos los cursos y secciones
        console.log('\n📚 Cursos disponibles:');
        courses.forEach((curso, index) => {
            console.log(`   ${index + 1}. "${curso.name}" (ID: ${curso.id})`);
        });

        console.log('\n📋 Secciones disponibles:');
        sections.forEach((seccion, index) => {
            console.log(`   ${index + 1}. "${seccion.name}" (ID: ${seccion.id})`);
        });

        // 3. Crear función mejorada para IDs compuestos
        function getCourseNameFixed(courseId) {
            console.log(`\n🔍 Procesando ID: ${courseId}`);
            
            if (!courseId || !courseId.includes('-')) {
                console.log('   No es ID compuesto');
                return courseId;
            }

            // Para IDs como: 9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3
            // Necesitamos separar en dos UUIDs
            const parts = courseId.split('-');
            console.log(`   Partes del ID: ${parts.length}`);
            
            if (parts.length >= 10) { // Dos UUIDs completos (5 partes cada uno)
                // Primer UUID: partes 0-4
                const cursoId = parts.slice(0, 5).join('-');
                // Segundo UUID: partes 5-9 (o resto)
                const seccionId = parts.slice(5, 10).join('-');
                
                console.log(`   Curso ID: ${cursoId}`);
                console.log(`   Sección ID: ${seccionId}`);
                
                // Buscar en los datos
                const curso = courses.find(c => c.id === cursoId);
                const seccion = sections.find(s => s.id === seccionId);
                
                console.log(`   Curso encontrado: ${curso ? curso.name : 'NO'}`);
                console.log(`   Sección encontrada: ${seccion ? seccion.name : 'NO'}`);
                
                if (curso && seccion) {
                    const result = `${curso.name} ${seccion.name}`;
                    console.log(`   ✅ Resultado: "${result}"`);
                    return result;
                }
                
                if (curso) {
                    console.log(`   ✅ Solo curso: "${curso.name}"`);
                    return curso.name;
                }
            }
            
            // Fallback: buscar curso directamente
            const curso = courses.find(c => c.id === courseId);
            if (curso) {
                console.log(`   ✅ Curso directo: "${curso.name}"`);
                return curso.name;
            }
            
            console.log(`   ❌ No encontrado, devolviendo "Curso no encontrado"`);
            return 'Curso no encontrado';
        }

        // 4. Probar con el ID problemático
        const problematicId = '9077a79d-c290-45f9-b549-6e57df8828d2-d326c181-fa30-4c50-ab68-efa085a3ffd3';
        console.log('\n🧪 Probando con ID problemático:');
        const testResult = getCourseNameFixed(problematicId);
        console.log(`Resultado de la prueba: "${testResult}"`);

        // 5. Parche inmediato al TaskNotificationManager
        if (typeof window.TaskNotificationManager !== 'undefined') {
            console.log('\n🔧 Aplicando parche al TaskNotificationManager...');
            
            // Guardar método original por si acaso
            window.TaskNotificationManager.originalGetCourseNameById = window.TaskNotificationManager.getCourseNameById;
            
            // Reemplazar con nuestra función mejorada
            window.TaskNotificationManager.getCourseNameById = getCourseNameFixed;
            
            console.log('✅ TaskNotificationManager.getCourseNameById patcheado');
        } else {
            console.log('\n📦 Creando TaskNotificationManager...');
            window.TaskNotificationManager = {
                getCourseNameById: getCourseNameFixed
            };
            console.log('✅ TaskNotificationManager creado');
        }

        // 6. También crear función global por si acaso
        window.getCourseNameFixed = getCourseNameFixed;

        // 7. Forzar actualización de la UI
        console.log('\n📡 Forzando actualización de la UI...');
        
        // Disparar múltiples eventos
        window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('notificationsRefresh'));
        
        // Intentar forzar re-render de React si existe
        if (window.React) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('react-force-rerender'));
            }, 100);
        }

        console.log('✅ Eventos disparados');

        // 8. Verificar notificaciones del usuario actual (estudiante Y profesor)
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
        
        let userNotifications = [];
        if (currentUser.role === 'student') {
            userNotifications = notifications.filter(notif => 
                (notif.targetUsernames?.includes(currentUser.username) || notif.toUsername === currentUser.username)
            );
        } else if (currentUser.role === 'teacher') {
            // Para profesores, mostrar todas las notificaciones donde aparecen como destinatarios
            userNotifications = notifications.filter(notif => 
                notif.fromUsername === currentUser.username || 
                notif.toUsername === currentUser.username ||
                notif.targetUsernames?.includes(currentUser.username)
            );
        }

        console.log(`\n📋 Verificando notificaciones de ${currentUser.username} (${currentUser.role}):`);
        userNotifications.forEach((notif, index) => {
            const courseName = getCourseNameFixed(notif.course);
            console.log(`   ${index + 1}. "${notif.taskTitle}"`);
            console.log(`      Curso original: ${notif.course}`);
            console.log(`      Debería mostrar: "${courseName}"`);
        });

        return true;

    } catch (error) {
        console.error('❌ Error en la corrección inmediata:', error);
        return false;
    }
}

// Función adicional para probar manualmente
function testCourseConversion(courseId) {
    const result = window.getCourseNameFixed ? window.getCourseNameFixed(courseId) : 'Función no disponible';
    console.log(`Prueba: "${courseId}" -> "${result}"`);
    return result;
}

// Ejecutar corrección
console.log('🚀 Ejecutando corrección inmediata...');
const success = fixCourseDisplayImmediate();

if (success) {
    console.log('\n🎉 ¡Corrección aplicada exitosamente!');
    console.log('💡 Usa testCourseConversion("id-del-curso") para probar manualmente');
    console.log('🔄 Si el panel no se actualiza automáticamente, recarga la página');
} else {
    console.log('\n❌ No se pudo aplicar la corrección');
}

console.log('\n🔧 Script completado. La función está disponible como window.getCourseNameFixed()');
