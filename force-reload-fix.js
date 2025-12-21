// 🔄 SCRIPT PARA FORZAR RECARGA Y LIMPIAR CACHE
// Ejecutar en la consola si el error persiste después de la reparación

console.log('🔄 FORZANDO RECARGA COMPLETA DEL SISTEMA');
console.log('=====================================');

// 1. Ejecutar reparación inmediata
try {
    if (window.NotificationSyncService && window.NotificationSyncService.repairStoredNotifications) {
        console.log('🔧 Ejecutando reparación del servicio...');
        window.NotificationSyncService.repairStoredNotifications();
    } else {
        console.log('⚠️ NotificationSyncService no disponible, reparación manual...');
        
        // Reparación manual como fallback
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const users = JSON.parse(localStorage.getItem('smart-student-users') || '{}');
        
        let repaired = 0;
        for (const n of notifications) {
            if (n && !Array.isArray(n.targetUsernames)) {
                if (n.type === 'new_task' && n.course) {
                    const students = [];
                    Object.values(users).forEach(user => {
                        if (user.role === 'student' && user.activeCourses && user.activeCourses.includes(n.course)) {
                            students.push(user.username);
                        }
                    });
                    n.targetUsernames = students;
                } else {
                    n.targetUsernames = [];
                }
                repaired++;
            }
        }
        
        if (repaired > 0) {
            try {
                localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
                console.log(`✅ Reparadas ${repaired} notificaciones manualmente`);
            } catch (e) {
                console.warn('❌ Error guardando reparación:', e.message);
                // Último recurso - limpiar
                localStorage.removeItem('smart-student-task-notifications');
                console.log('⚠️ Cache limpiado completamente');
            }
        }
    }
} catch (error) {
    console.error('❌ Error en reparación:', error);
}

// 2. Limpiar caches del navegador
if ('caches' in window) {
    console.log('🧹 Limpiando caches del navegador...');
    caches.keys().then(names => {
        names.forEach(name => {
            console.log(`   Limpiando cache: ${name}`);
            caches.delete(name);
        });
    });
}

// 3. Desactivar cache para la siguiente carga
if ('serviceWorker' in navigator) {
    console.log('🔄 Desactivando service worker...');
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration.unregister();
        });
    });
}

// 4. Forzar recarga dura
console.log('🔄 Forzando recarga completa en 2 segundos...');
console.log('   (Esto debería resolver el error TypeError)');

setTimeout(() => {
    // Intentar recarga dura
    if (window.location) {
        window.location.reload(true);
    }
}, 2000);

console.log('\n📋 SI EL ERROR PERSISTE DESPUÉS DE LA RECARGA:');
console.log('1. Abre DevTools > Application > Storage');
console.log('2. Click en "Clear storage" para limpiar completamente');
console.log('3. Recarga la página nuevamente');
console.log('4. O ejecuta: localStorage.clear() y recarga');
