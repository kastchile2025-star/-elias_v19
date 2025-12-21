// 🔧 SOLUCIÓN DEFINITIVA: Corregir mapeo de cursos de Felipe
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔧 [FIX] Solucionando mapeo de cursos de Felipe...');
    console.log('=' .repeat(70));
    
    // 1. Obtener datos actuales
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const storedUsers = localStorage.getItem('smart-student-users');
    
    if (!storedTasks || !storedUsers) {
        console.log('❌ Faltan datos básicos en localStorage');
        return;
    }
    
    const tasks = JSON.parse(storedTasks);
    const users = JSON.parse(storedUsers);
    
    console.log(`📊 Datos encontrados:`);
    console.log(`   - Tareas: ${tasks.length}`);
    console.log(`   - Usuarios: ${users.length}`);
    
    // 2. Identificar cursos reales de las tareas
    const cursosReales = [...new Set(tasks.map(task => task.course))];
    console.log(`\n📚 Cursos reales identificados en tareas:`, cursosReales);
    
    // 3. Buscar a Felipe en usuarios
    let felipeIndex = -1;
    let felipe = null;
    
    if (Array.isArray(users)) {
        felipeIndex = users.findIndex(u => u.username === 'felipe');
        if (felipeIndex !== -1) {
            felipe = users[felipeIndex];
        }
    } else {
        // Es objeto con keys
        Object.keys(users).forEach(key => {
            if (users[key].username === 'felipe') {
                felipe = users[key];
                felipeIndex = key;
            }
        });
    }
    
    if (!felipe) {
        console.log('❌ Felipe no encontrado en usuarios');
        return;
    }
    
    console.log(`\n👤 Felipe encontrado:`);
    console.log(`   - Cursos actuales:`, felipe.activeCourses);
    console.log(`   - Tipo de usuarios:`, Array.isArray(users) ? 'Array' : 'Object');
    
    // 4. Actualizar cursos de Felipe con los cursos reales
    const felipeActualizado = {
        ...felipe,
        activeCourses: cursosReales
    };
    
    console.log(`\n🔄 Actualizando Felipe:`);
    console.log(`   - Cursos anteriores:`, felipe.activeCourses);
    console.log(`   - Cursos nuevos:`, cursosReales);
    
    // 5. Guardar cambios
    if (Array.isArray(users)) {
        users[felipeIndex] = felipeActualizado;
    } else {
        users[felipeIndex] = felipeActualizado;
    }
    
    localStorage.setItem('smart-student-users', JSON.stringify(users));
    console.log(`✅ Felipe actualizado en localStorage`);
    
    // 6. Verificar que las tareas ahora sean visibles
    const studentTasks = tasks.filter(task => 
        task.course && felipeActualizado.activeCourses.includes(task.course)
    );
    
    console.log(`\n🎯 VERIFICACIÓN:`);
    console.log(`   - Tareas visibles para Felipe: ${studentTasks.length}`);
    studentTasks.forEach((task, index) => {
        console.log(`     ${index + 1}. "${task.title}" (${task.taskType}) - Curso: ${task.course}`);
    });
    
    // 7. Verificar específicamente la evaluación "dfsdfds"
    const dfsdfdsTask = tasks.find(t => t.title === 'dfsdfds');
    if (dfsdfdsTask) {
        const isVisible = felipeActualizado.activeCourses.includes(dfsdfdsTask.course);
        console.log(`\n🎯 Evaluación "dfsdfds":`);
        console.log(`   - ¿Ahora es visible para Felipe?: ${isVisible}`);
        
        if (isVisible && window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
            const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                dfsdfdsTask.id, 'felipe'
            );
            console.log(`   - ¿Está completada?: ${isCompleted}`);
            
            if (isCompleted) {
                console.log(`   ✅ ¡Debería filtrarse y mostrar "¡Todo al día!"!`);
            } else {
                console.log(`   ⚠️ Aparecerá como pendiente`);
            }
        }
    }
    
    // 8. Forzar actualización del panel
    console.log(`\n🔄 Forzando actualización del panel...`);
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('commentsUpdated'));
    window.dispatchEvent(new CustomEvent('evaluationCompleted'));
    console.log(`✅ Eventos de actualización disparados`);
    
    // 9. Actualizar usuario actual si está logueado como Felipe
    const currentUser = localStorage.getItem('smart-student-user');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.username === 'felipe') {
            const updatedCurrentUser = {
                ...user,
                activeCourses: cursosReales
            };
            localStorage.setItem('smart-student-user', JSON.stringify(updatedCurrentUser));
            console.log(`✅ Usuario actual actualizado también`);
        }
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ ¡CORRECCIÓN COMPLETADA!`);
    console.log(`🔄 RECARGA LA PÁGINA para ver los cambios`);
    
    return {
        cursosAnteriores: felipe.activeCourses,
        cursosNuevos: cursosReales,
        tareasVisibles: studentTasks.length,
        evaluacionDfsdfdsVisible: studentTasks.some(t => t.title === 'dfsdfds')
    };
})();
