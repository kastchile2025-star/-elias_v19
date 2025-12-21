// Script para reparar el problema de tareas no visibles para Felipe
// Ejecutar en la consola del navegador en la página de tareas

(function() {
    console.log('🔧 Iniciando reparación automática para Felipe...');
    
    // Obtener datos actuales
    const getCurrentUser = () => JSON.parse(localStorage.getItem('smart-student-current-user') || 'null');
    const getAllUsers = () => JSON.parse(localStorage.getItem('smart-student-users') || '{}');
    const getTasks = () => JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const getNotifications = () => JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    
    const currentUser = getCurrentUser();
    const allUsers = getAllUsers();
    const tasks = getTasks();
    
    console.log('📊 Estado actual:', {
        currentUser: currentUser?.username,
        totalUsers: Object.keys(allUsers).length,
        totalTasks: tasks.length
    });
    
    // Encontrar Felipe
    let felipe = allUsers['felipe'] || Object.values(allUsers).find(u => u.username === 'felipe');
    
    if (!felipe) {
        console.error('❌ Usuario Felipe no encontrado');
        return;
    }
    
    console.log('👤 Felipe encontrado:', {
        username: felipe.username,
        activeCourses: felipe.activeCourses,
        role: felipe.role
    });
    
    // Obtener todos los cursos únicos de las tareas
    const coursesInTasks = [...new Set(tasks.map(task => task.course))];
    console.log('📚 Cursos en tareas:', coursesInTasks);
    
    // Asegurar que Felipe tenga todos los cursos necesarios
    let felipeUpdated = false;
    const originalCourses = felipe.activeCourses || [];
    const newCourses = [...new Set([...originalCourses, ...coursesInTasks])];
    
    if (JSON.stringify(originalCourses.sort()) !== JSON.stringify(newCourses.sort())) {
        felipe.activeCourses = newCourses;
        felipeUpdated = true;
        console.log('🎓 Cursos de Felipe actualizados:', {
            antes: originalCourses,
            después: newCourses
        });
    }
    
    // Asegurar que todas las tareas tengan assignedTo configurado
    let tasksUpdated = false;
    const updatedTasks = tasks.map(task => {
        if (!task.assignedTo) {
            task.assignedTo = 'course';
            tasksUpdated = true;
            console.log(`📋 Tarea "${task.title}" configurada como asignación por curso`);
        }
        return task;
    });
    
    // Guardar cambios
    if (felipeUpdated) {
        // Actualizar Felipe en la estructura de usuarios
        if (allUsers['felipe']) {
            allUsers['felipe'] = felipe;
        } else {
            // Buscar por username y actualizar
            Object.keys(allUsers).forEach(key => {
                if (allUsers[key].username === 'felipe') {
                    allUsers[key] = felipe;
                }
            });
        }
        
        localStorage.setItem('smart-student-users', JSON.stringify(allUsers));
        
        // Si Felipe es el usuario actual, actualizar también
        if (currentUser && currentUser.username === 'felipe') {
            localStorage.setItem('smart-student-current-user', JSON.stringify(felipe));
        }
        
        console.log('✅ Datos de usuario Felipe guardados');
    }
    
    if (tasksUpdated) {
        localStorage.setItem('smart-student-tasks', JSON.stringify(updatedTasks));
        console.log('✅ Tareas actualizadas y guardadas');
    }
    
    // Verificar el resultado
    const verificarTareas = () => {
        const tareasVisibles = updatedTasks.filter(task => {
            if (task.assignedTo === 'course') {
                return felipe.activeCourses?.includes(task.course);
            } else if (task.assignedTo === 'student') {
                return task.assignedStudents?.includes('felipe');
            }
            return false;
        });
        
        console.log('🎯 Verificación final:', {
            totalTareas: updatedTasks.length,
            tareasVisiblesParaFelipe: tareasVisibles.length,
            cursosAsignados: felipe.activeCourses
        });
        
        tareasVisibles.forEach(task => {
            console.log(`✅ Tarea visible: "${task.title}" (${task.course})`);
        });
        
        return tareasVisibles.length;
    };
    
    const tareasVisibles = verificarTareas();
    
    if (tareasVisibles > 0) {
        console.log('🎉 ¡Reparación exitosa! Felipe ahora puede ver sus tareas.');
        console.log('🔄 Recarga la página de tareas para ver los cambios.');
        
        // Opcional: recargar automáticamente si estamos en la página de tareas
        if (window.location.pathname.includes('/tareas')) {
            setTimeout(() => {
                console.log('🔄 Recargando página...');
                window.location.reload();
            }, 2000);
        }
    } else {
        console.warn('⚠️ Aún no hay tareas visibles para Felipe. Puede que no haya tareas creadas.');
    }
    
    return {
        felipe,
        cursosOriginales: originalCourses,
        cursosNuevos: newCourses,
        tareasVisibles,
        reparacionExitosa: tareasVisibles > 0
    };
})();
