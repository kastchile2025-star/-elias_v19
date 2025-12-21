/**
 * CORRECCIÓN: Comentarios Privados para Tareas de Estudiantes Específicos
 * 
 * PROBLEMA: Cuando un profesor crea una tarea para estudiantes específicos,
 * los comentarios son visibles para todos los estudiantes del curso.
 * 
 * SOLUCIÓN: Filtrar comentarios para que solo sean visibles entre:
 * - El profesor que asignó la tarea
 * - Los estudiantes específicos asignados a esa tarea
 */

console.log('🔧 IMPLEMENTANDO CORRECCIÓN: Comentarios Privados para Estudiantes Específicos');
console.log('==============================================================================');

// Función para verificar si un estudiante está asignado a una tarea específica
function isStudentAssignedToTask(taskId, studentId, studentUsername) {
    // Obtener la tarea
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        console.log(`⚠️ Tarea ${taskId} no encontrada`);
        return false;
    }
    
    console.log(`🔍 Verificando asignación - Tarea: "${task.title}"`);
    console.log(`   Tipo de asignación: ${task.assignedTo}`);
    console.log(`   Estudiante: ${studentUsername} (ID: ${studentId})`);
    
    // Si la tarea está asignada a todo el curso
    if (task.assignedTo === 'course') {
        console.log(`✅ Tarea para todo el curso - estudiante autorizado`);
        return true;
    }
    
    // Si la tarea está asignada a estudiantes específicos
    if (task.assignedTo === 'student' && task.assignedStudentIds) {
        const isAssigned = task.assignedStudentIds.includes(studentId);
        console.log(`   Estudiantes asignados: [${task.assignedStudentIds.join(', ')}]`);
        console.log(`   ¿Está asignado?: ${isAssigned ? 'SÍ' : 'NO'}`);
        return isAssigned;
    }
    
    // Por compatibilidad con versiones anteriores
    if (task.assignedStudents && task.assignedStudents.includes(studentUsername)) {
        console.log(`✅ Asignación por username (legado) - estudiante autorizado`);
        return true;
    }
    
    console.log(`❌ Estudiante NO asignado a esta tarea`);
    return false;
}

// Función para crear el filtro de comentarios mejorado
function createImprovedCommentFilter() {
    return `
    // 🔧 FILTRO MEJORADO: Comentarios privados para estudiantes específicos
    .filter(comment => {
        console.log(\`🔍 Filtrando comentario \${comment.id} para usuario \${user?.username} (\${user?.role})\`);
        
        // PROFESOR: solo comentarios (no entregas)
        if (user?.role === 'teacher') {
            const showComment = !comment.isSubmission;
            console.log(\`   Profesor - Mostrar: \${showComment} (es entrega: \${comment.isSubmission})\`);
            return showComment;
        }
        
        // ESTUDIANTE: aplicar filtros de privacidad
        if (user?.role === 'student') {
            // Para entregas: solo mostrar la propia
            if (comment.isSubmission) {
                const showSubmission = comment.studentId === user.id;
                console.log(\`   Estudiante - Entrega propia: \${showSubmission}\`);
                return showSubmission;
            }
            
            // Para comentarios: verificar si el estudiante está asignado a la tarea
            const isAssigned = isStudentAssignedToTask(comment.taskId, user.id, user.username);
            console.log(\`   Estudiante - Asignado a tarea: \${isAssigned}\`);
            
            // Solo mostrar comentarios si el estudiante está asignado a la tarea
            return isAssigned;
        }
        
        // Otros roles: solo comentarios (no entregas)
        return !comment.isSubmission;
    })`;
}

// Función para aplicar la corrección al código
function aplicarCorreccionComentarios() {
    console.log('\n📝 PASOS PARA APLICAR LA CORRECCIÓN:');
    console.log('=====================================');
    
    console.log('\n1. 📁 Abrir archivo: /workspaces/superjf_v8/src/app/dashboard/tareas/page.tsx');
    
    console.log('\n2. 🔍 Buscar las líneas aproximadamente 4872-4886:');
    console.log(`
    .filter(comment => {
        // PROFESOR: solo comentarios (no entregas)
        if (user?.role === 'teacher') return !comment.isSubmission;
        // ESTUDIANTE: solo su entrega y todos los comentarios
        if (user?.role === 'student') {
          if (comment.isSubmission) {
            return comment.studentId === user.id;
          }
          return true; // <-- ESTE ES EL PROBLEMA
        }
        // Otros roles: solo comentarios
        return !comment.isSubmission;
    })
    `);
    
    console.log('\n3. 🔧 Agregar la función helper al inicio del componente (después de las otras funciones helper):');
    console.log(`
    // 🔧 NUEVA FUNCIÓN: Verificar si un estudiante está asignado a una tarea específica
    const isStudentAssignedToTask = (taskId: string, studentId: string, studentUsername: string): boolean => {
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return false;
      
      // Si la tarea está asignada a todo el curso
      if (task.assignedTo === 'course') {
        return true;
      }
      
      // Si la tarea está asignada a estudiantes específicos
      if (task.assignedTo === 'student' && task.assignedStudentIds) {
        return task.assignedStudentIds.includes(studentId);
      }
      
      // Compatibilidad con versiones anteriores
      if (task.assignedStudents && task.assignedStudents.includes(studentUsername)) {
        return true;
      }
      
      return false;
    };
    `);
    
    console.log('\n4. 🔄 Reemplazar el filtro existente con el mejorado:');
    console.log(createImprovedCommentFilter());
    
    console.log('\n5. 💾 Guardar el archivo');
    console.log('\n6. 🔄 Recargar la página para probar');
    
    return true;
}

// Función para crear un test de la funcionalidad
function crearTestComentariosPrivados() {
    console.log('\n🧪 CREANDO TEST DE COMENTARIOS PRIVADOS');
    console.log('=========================================');
    
    // Crear datos de prueba
    const testProfesor = {
        id: 'prof_001',
        username: 'profesor_test',
        displayName: 'Profesor Test',
        role: 'teacher'
    };
    
    const testEstudiantes = [
        { id: 'est_001', username: 'felipe', displayName: 'Felipe', role: 'student' },
        { id: 'est_002', username: 'maria', displayName: 'María', role: 'student' },
        { id: 'est_003', username: 'carlos', displayName: 'Carlos', role: 'student' }
    ];
    
    // Crear tarea para estudiantes específicos (solo Felipe y María)
    const testTask = {
        id: 'task_especifica_test',
        title: 'Tarea Solo para Felipe y María',
        description: 'Esta tarea es privada',
        assignedBy: testProfesor.username,
        assignedById: testProfesor.id,
        assignedTo: 'student', // IMPORTANTE: asignación específica
        assignedStudentIds: ['est_001', 'est_002'], // Solo Felipe y María
        course: 'Matemáticas',
        subject: 'Matemáticas',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        taskType: 'assignment'
    };
    
    // Crear comentarios de prueba
    const testComments = [
        {
            id: 'comment_001',
            taskId: testTask.id,
            studentUsername: testProfesor.username,
            studentName: testProfesor.displayName,
            studentId: testProfesor.id,
            comment: 'Este comentario solo debe ser visible para Felipe y María',
            timestamp: new Date().toISOString(),
            isSubmission: false,
            readBy: [],
            authorUsername: testProfesor.username,
            authorRole: 'teacher'
        },
        {
            id: 'comment_002',
            taskId: testTask.id,
            studentUsername: 'felipe',
            studentName: 'Felipe',
            studentId: 'est_001',
            comment: 'Respuesta de Felipe al profesor',
            timestamp: new Date().toISOString(),
            isSubmission: false,
            readBy: [],
            authorUsername: 'felipe',
            authorRole: 'student'
        }
    ];
    
    // Guardar datos de prueba
    const existingTasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const existingComments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
    // Limpiar datos de prueba anteriores
    const cleanTasks = existingTasks.filter(t => !t.id.includes('test'));
    const cleanComments = existingComments.filter(c => !c.id.includes('test'));
    
    // Agregar nuevos datos de prueba
    cleanTasks.push(testTask);
    cleanComments.push(...testComments);
    
    localStorage.setItem('smart-student-tasks', JSON.stringify(cleanTasks));
    localStorage.setItem('smart-student-task-comments', JSON.stringify(cleanComments));
    
    console.log('✅ Datos de prueba creados:');
    console.log(`   📝 Tarea: "${testTask.title}"`);
    console.log(`   👥 Asignada solo a: Felipe y María`);
    console.log(`   💬 Comentarios: ${testComments.length}`);
    
    console.log('\n🔬 CASOS DE PRUEBA:');
    console.log('===================');
    console.log('1. 👤 Login como Felipe → Debe ver todos los comentarios');
    console.log('2. 👤 Login como María → Debe ver todos los comentarios');  
    console.log('3. 👤 Login como Carlos → NO debe ver comentarios ni la tarea');
    console.log('4. 👨‍🏫 Login como Profesor → Debe ver todos los comentarios');
    
    return { testTask, testComments, testEstudiantes, testProfesor };
}

// Función para verificar el comportamiento actual
function verificarComportamientoActual() {
    console.log('\n🔍 VERIFICANDO COMPORTAMIENTO ACTUAL');
    console.log('=====================================');
    
    const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
    
    if (!currentUser) {
        console.log('❌ No hay usuario logueado');
        return;
    }
    
    console.log(`👤 Usuario actual: ${currentUser.username} (${currentUser.role})`);
    
    // Buscar tareas específicas
    const specificTasks = tasks.filter(t => t.assignedTo === 'student');
    console.log(`📋 Tareas específicas encontradas: ${specificTasks.length}`);
    
    specificTasks.forEach(task => {
        console.log(`\n📝 Tarea: "${task.title}"`);
        console.log(`   Asignada a IDs: [${task.assignedStudentIds?.join(', ') || 'N/A'}]`);
        
        // Verificar si el usuario actual puede ver esta tarea
        const canSeeTask = isStudentAssignedToTask(task.id, currentUser.id, currentUser.username);
        console.log(`   ¿${currentUser.username} puede ver?: ${canSeeTask ? 'SÍ' : 'NO'}`);
        
        // Mostrar comentarios relacionados
        const taskComments = comments.filter(c => c.taskId === task.id);
        console.log(`   💬 Comentarios totales: ${taskComments.length}`);
        
        if (currentUser.role === 'student') {
            const visibleComments = taskComments.filter(comment => {
                if (comment.isSubmission) {
                    return comment.studentId === currentUser.id;
                }
                // COMPORTAMIENTO ACTUAL: muestra todos los comentarios
                return true; // Este es el problema
            });
            console.log(`   👁️ Comentarios visibles (actual): ${visibleComments.length}`);
            
            const shouldSeeComments = taskComments.filter(comment => {
                if (comment.isSubmission) {
                    return comment.studentId === currentUser.id;
                }
                // COMPORTAMIENTO CORREGIDO: solo si está asignado
                return canSeeTask;
            });
            console.log(`   🔧 Comentarios visibles (corregido): ${shouldSeeComments.length}`);
        }
    });
}

// Función principal
function main() {
    console.log('🚀 INICIANDO DIAGNÓSTICO Y CORRECCIÓN');
    console.log('=====================================');
    
    // Verificar comportamiento actual
    verificarComportamientoActual();
    
    // Crear test
    const testData = crearTestComentariosPrivados();
    
    // Mostrar instrucciones para aplicar la corrección
    aplicarCorreccionComentarios();
    
    console.log('\n✅ PROCESO COMPLETADO');
    console.log('====================');
    console.log('📌 Próximos pasos:');
    console.log('1. Aplicar los cambios en el código como se indica arriba');
    console.log('2. Probar con los datos de prueba creados');
    console.log('3. Verificar que los comentarios son privados entre profesor y estudiantes asignados');
    
    return testData;
}

// Ejecutar
main();
