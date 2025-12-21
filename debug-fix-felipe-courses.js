// 🔧 CORRECCIÓN INMEDIATA: Actualizar cursos activos de Felipe
// Copia y pega este código completo en la consola del navegador

(function() {
    console.log('🔧 [FIX] Corrigiendo cursos activos de Felipe...');
    console.log('=' .repeat(70));
    
    // Cursos reales donde Felipe tiene tareas
    const cursosReales = [
        'id-1753155622094-srlcevgid',  // Curso donde está "dfsdfds" y "fdsf"
        'id-1753155622094-6vdjupu19'  // Curso donde está "czxcz"
    ];
    
    console.log('🎯 Cursos reales identificados:', cursosReales);
    
    // 1. Actualizar en el componente actual (temporal)
    console.log('\n1️⃣ Actualizando configuración temporal...');
    
    // Forzar actualización de cursos activos
    window.currentUserCourses = cursosReales;
    
    // 2. Simular nueva verificación con cursos corregidos
    console.log('\n2️⃣ Simulando con cursos corregidos...');
    
    const currentUser = {
        username: 'felipe',
        role: 'student', 
        id: 'id-1753155697194-albsgnmuy',
        activeCourses: cursosReales  // ← CURSOS CORREGIDOS
    };
    
    console.log('👤 Usuario con cursos corregidos:', currentUser);
    
    // Obtener tareas
    const storedTasks = localStorage.getItem('smart-student-tasks');
    const tasks = JSON.parse(storedTasks);
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
    // Filtrar tareas del estudiante CON CURSOS CORREGIDOS
    const studentTasks = tasks.filter(task => 
        task.course && currentUser.activeCourses.includes(task.course)
    );
    
    console.log(`\n📋 Tareas de Felipe con cursos corregidos: ${studentTasks.length}`);
    studentTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}" (${task.taskType}) - Curso: ${task.course}`);
    });
    
    // Simular loadPendingTasks CON CURSOS CORREGIDOS
    console.log(`\n📝 SIMULANDO loadPendingTasks CON CURSOS CORREGIDOS:`);
    
    const now = new Date();
    const pendingTasks = [];
    
    studentTasks.forEach(task => {
        const isAssigned = task.course && currentUser.activeCourses.includes(task.course);
        const dueDate = new Date(task.dueDate);
        const isApproaching = dueDate > now;
        
        const isEvaluation = task.taskType === 'evaluation' || task.taskType === 'evaluacion';
        
        const gradeComment = comments.find(comment => 
            comment.taskId === task.id && 
            comment.studentUsername === currentUser.username && 
            comment.isGrade
        );
        const isGraded = !!gradeComment;
        
        console.log(`\n   Procesando "${task.title}":`);
        console.log(`     - Asignada: ${isAssigned}`);
        console.log(`     - No vencida: ${isApproaching}`);
        console.log(`     - Es evaluación: ${isEvaluation}`);
        console.log(`     - Está calificada: ${isGraded}`);
        
        if (isEvaluation) {
            let isCompletedByNotification = false;
            if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
                isCompletedByNotification = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                    task.id, currentUser.username
                );
            }
            console.log(`     - Completada por notificación: ${isCompletedByNotification}`);
            
            const shouldFilter = isGraded || isCompletedByNotification;
            console.log(`     - ¿Debería filtrarse?: ${shouldFilter}`);
            
            if (isAssigned && isApproaching && !shouldFilter) {
                pendingTasks.push(task);
                console.log(`     → 📝 AÑADIDA A PENDIENTES`);
            } else {
                console.log(`     → ✅ FILTRADA (no pendiente)`);
            }
        } else {
            if (isAssigned && isApproaching && !isGraded) {
                pendingTasks.push(task);
                console.log(`     → 📝 AÑADIDA A PENDIENTES`);
            } else {
                console.log(`     → ✅ FILTRADA (no pendiente)`);
            }
        }
    });
    
    console.log(`\n📊 RESULTADO PENDIENTES CON CURSOS CORREGIDOS: ${pendingTasks.length} tareas`);
    
    // Evaluación específica de "dfsdfds"
    const dfsdfdsTask = tasks.find(t => t.title === 'dfsdfds');
    if (dfsdfdsTask) {
        console.log(`\n🎯 VERIFICACIÓN ESPECÍFICA "dfsdfds":`);
        console.log(`   - ¿Está en cursos de Felipe?: ${currentUser.activeCourses.includes(dfsdfdsTask.course)}`);
        
        if (window.TaskNotificationManager?.isEvaluationCompletedByStudent) {
            const isCompleted = window.TaskNotificationManager.isEvaluationCompletedByStudent(
                dfsdfdsTask.id, currentUser.username
            );
            console.log(`   - ¿Está completada?: ${isCompleted}`);
            console.log(`   - ¿Debería aparecer en pendientes?: ${!isCompleted}`);
        }
    }
    
    // 3. Forzar actualización del panel
    console.log(`\n3️⃣ Forzando actualización del panel...`);
    
    // Disparar eventos de actualización
    window.dispatchEvent(new CustomEvent('taskNotificationsUpdated'));
    window.dispatchEvent(new CustomEvent('commentsUpdated'));
    window.dispatchEvent(new CustomEvent('evaluationCompleted'));
    
    console.log(`✅ Eventos de actualización disparados`);
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔧 Corrección completada`);
    
    // 4. Instrucciones para corrección permanente
    console.log(`\n📋 PARA CORRECCIÓN PERMANENTE:`);
    console.log(`Los cursos de Felipe deberían ser:`);
    console.log(`activeCourses: ${JSON.stringify(cursosReales)}`);
    
    return {
        cursosOriginales: ['MATH101', 'PHYS201'],
        cursosCorregidos: cursosReales,
        tareasVisibles: studentTasks.length,
        tareasPendientes: pendingTasks.length
    };
})();
