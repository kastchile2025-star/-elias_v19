// 🔧 SCRIPT DE REPARACIÓN INMEDIATA PARA TARGETUSERNAMES
// Ejecutar en la consola del navegador para reparar notificaciones con targetUsernames undefined

console.log('🔧 INICIANDO REPARACIÓN INMEDIATA DE TARGETUSERNAMES');
console.log('================================================');

try {
    // Cargar datos actuales
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
    
    console.log(`📊 Total notificaciones: ${notifications.length}`);
    
    let repaired = 0;
    let removed = 0;
    
    // Función para obtener estudiantes de un curso
    function getStudentsInCourse(course) {
        const students = [];
        Object.values(users).forEach(user => {
            if (user.role === 'student' && user.activeCourses && user.activeCourses.includes(course)) {
                students.push(user.username);
            }
        });
        return students;
    }
    
    // Reparar cada notificación
    const validNotifications = [];
    
    for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
        
        if (!notification) {
            console.log(`❌ Notificación ${i}: null/undefined - eliminando`);
            removed++;
            continue;
        }
        
        // Verificar targetUsernames
        if (!Array.isArray(notification.targetUsernames)) {
            console.log(`🔧 Notificación ${i}: targetUsernames inválido (${typeof notification.targetUsernames}) - reparando`);
            
            if (notification.type === 'new_task' && notification.course) {
                const studentsInCourse = getStudentsInCourse(notification.course);
                notification.targetUsernames = studentsInCourse;
                console.log(`   ✅ Asignados ${studentsInCourse.length} estudiantes del curso ${notification.course}`);
            } else {
                notification.targetUsernames = [];
                console.log(`   ⚠️ Asignado array vacío para tipo ${notification.type}`);
            }
            repaired++;
        }
        
        // Validar otros campos críticos
        if (!notification.id) {
            notification.id = `repair_${Date.now()}_${i}`;
        }
        
        if (!notification.type) {
            notification.type = 'unknown';
        }
        
        validNotifications.push(notification);
    }
    
    console.log(`\n📊 RESULTADOS:`);
    console.log(`   🔧 Notificaciones reparadas: ${repaired}`);
    console.log(`   ❌ Notificaciones eliminadas: ${removed}`);
    console.log(`   ✅ Notificaciones válidas: ${validNotifications.length}`);
    
    // Guardar las notificaciones reparadas
    try {
        localStorage.setItem('smart-student-task-notifications', JSON.stringify(validNotifications));
        console.log(`\n✅ REPARACIÓN COMPLETADA - ${validNotifications.length} notificaciones guardadas`);
        
        // Forzar actualización del TaskNotificationManager si existe
        if (window.TaskNotificationManager) {
            console.log('🔄 Forzando actualización del TaskNotificationManager...');
            window.location.reload();
        }
        
    } catch (saveError) {
        console.error('❌ Error guardando notificaciones reparadas:', saveError);
        
        if (saveError.message.includes('quota')) {
            console.log('⚠️ Cuota excedida - reduciendo notificaciones...');
            
            // Mantener solo las 500 más recientes
            const recent = validNotifications.slice(-500);
            try {
                localStorage.setItem('smart-student-task-notifications', JSON.stringify(recent));
                console.log(`✅ Guardadas ${recent.length} notificaciones más recientes`);
            } catch (finalError) {
                console.error('❌ Error final:', finalError);
                // Último recurso - limpiar completamente
                localStorage.removeItem('smart-student-task-notifications');
                console.log('⚠️ localStorage limpiado completamente');
            }
        }
    }
    
} catch (error) {
    console.error('❌ Error durante reparación:', error);
}

console.log('\n🎯 INSTRUCCIONES:');
console.log('1. Si ves "REPARACIÓN COMPLETADA", recarga la página');
console.log('2. Si el error persiste, ejecuta: localStorage.removeItem("smart-student-task-notifications")');
console.log('3. Luego recarga la página para que se regeneren las notificaciones');
