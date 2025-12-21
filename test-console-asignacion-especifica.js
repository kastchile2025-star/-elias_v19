// 🧪 SCRIPT DE PRUEBA RÁPIDA: Asignaciones de Estudiantes Específicos
// Ejecutar en la consola del navegador en http://localhost:9002/dashboard/tareas

console.log('🧪 === PRUEBA DE ASIGNACIONES ESPECÍFICAS ===');

// Función para probar la corrección implementada
function testAsignacionEspecifica() {
    // 1. Configurar datos de prueba
    const datosPrueba = {
        profesor: {
            id: 'prof_test_001',
            username: 'prof_test',
            displayName: 'Profesor Test',
            role: 'teacher'
        },
        estudiantes: [
            { id: 'est_test_001', username: 'felipe_test', displayName: 'Felipe Test', role: 'student', activeCourses: ['test_course'] },
            { id: 'est_test_002', username: 'maria_test', displayName: 'María Test', role: 'student', activeCourses: ['test_course'] },
            { id: 'est_test_003', username: 'carlos_test', displayName: 'Carlos Test', role: 'student', activeCourses: ['test_course'] }
        ]
    };

    // 2. Guardar usuarios de prueba (preservando datos existentes)
    const usuariosExistentes = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const usuariosTest = [datosPrueba.profesor, ...datosPrueba.estudiantes];
    
    // Filtrar usuarios que no sean de prueba y agregar los de prueba
    const usuariosFiltrados = usuariosExistentes.filter(u => !u.username.includes('_test'));
    const usuariosFinales = [...usuariosFiltrados, ...usuariosTest];
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosFinales));
    
    console.log('✅ Usuarios de prueba configurados');

    // 3. Crear tarea específica
    const taskId = `test_specific_${Date.now()}`;
    const tareaEspecifica = {
        id: taskId,
        title: 'Tarea Test Solo para Felipe',
        description: 'Esta es una tarea de prueba asignada solo a Felipe',
        subject: 'Test',
        course: 'test_course',
        assignedById: datosPrueba.profesor.id,
        assignedByName: datosPrueba.profesor.displayName,
        assignedTo: 'student', // 🔑 Asignación específica
        assignedStudentIds: ['est_test_001'], // 🔑 Solo Felipe
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        attachments: [],
        taskType: 'tarea'
    };

    // 4. Guardar tarea (preservando tareas existentes)
    const tareasExistentes = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const tareasFinales = [...tareasExistentes, tareaEspecifica];
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareasFinales));
    
    console.log('📝 Tarea específica creada:', tareaEspecifica.title);
    console.log('🎯 Asignada a ID:', tareaEspecifica.assignedStudentIds);

    // 5. Probar la función corregida usando TaskNotificationManager
    try {
        if (typeof TaskNotificationManager !== 'undefined') {
            console.log('🔧 Usando TaskNotificationManager del sistema...');
            
            // Llamar a la función corregida
            TaskNotificationManager.createNewTaskNotifications(
                taskId,
                tareaEspecifica.title,
                tareaEspecifica.course,
                tareaEspecifica.subject,
                datosPrueba.profesor.username,
                datosPrueba.profesor.displayName,
                'assignment'
            );
            
            // 6. Verificar resultado
            const notificaciones = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
            const notificacionCreada = notificaciones.find(n => n.taskId === taskId);
            
            if (notificacionCreada) {
                console.log('✅ ÉXITO: Notificación creada correctamente');
                console.log('🎯 Destinatarios:', notificacionCreada.targetUsernames);
                
                if (notificacionCreada.targetUsernames.length === 1 && notificacionCreada.targetUsernames[0] === 'felipe_test') {
                    console.log('🎉 PERFECTO: Solo Felipe recibe la notificación');
                    console.log('✅ La corrección funciona correctamente');
                } else {
                    console.log('❌ ERROR: Destinatarios incorrectos');
                    console.log('Expected: ["felipe_test"]');
                    console.log('Actual:', notificacionCreada.targetUsernames);
                }
            } else {
                console.log('❌ ERROR: No se creó la notificación');
            }
            
        } else {
            console.log('❌ ERROR: TaskNotificationManager no está disponible');
            console.log('💡 Asegúrate de estar en la página de tareas del dashboard');
        }
        
    } catch (error) {
        console.log('❌ ERROR al ejecutar la prueba:', error.message);
    }

    // 7. Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    
    // Remover usuarios de prueba
    const usuariosLimpiados = usuariosFinales.filter(u => !u.username.includes('_test'));
    localStorage.setItem('smart-student-users', JSON.stringify(usuariosLimpiados));
    
    // Remover tarea de prueba
    const tareasLimpiadas = tareasFinales.filter(t => t.id !== taskId);
    localStorage.setItem('smart-student-tasks', JSON.stringify(tareasLimpiadas));
    
    // Remover notificación de prueba
    const notificacionesExistentes = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const notificacionesLimpiadas = notificacionesExistentes.filter(n => n.taskId !== taskId);
    localStorage.setItem('smart-student-task-notifications', JSON.stringify(notificacionesLimpiadas));
    
    console.log('✅ Datos de prueba limpiados');
    console.log('🔄 Recarga la página para ver los cambios');
}

// Función para verificar configuración actual
function verificarConfiguracion() {
    console.log('📊 === VERIFICACIÓN DE CONFIGURACIÓN ===');
    
    const usuarios = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const tareas = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const notificaciones = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    
    console.log(`👥 Usuarios en sistema: ${usuarios.length}`);
    console.log(`📝 Tareas en sistema: ${tareas.length}`);
    console.log(`🔔 Notificaciones en sistema: ${notificaciones.length}`);
    
    const tareasEspecificas = tareas.filter(t => t.assignedTo === 'student');
    const tareasCurso = tareas.filter(t => t.assignedTo === 'course');
    
    console.log(`🎯 Tareas específicas: ${tareasEspecificas.length}`);
    console.log(`📚 Tareas de curso: ${tareasCurso.length}`);
    
    if (tareasEspecificas.length > 0) {
        console.log('📋 Tareas específicas encontradas:');
        tareasEspecificas.forEach((tarea, index) => {
            console.log(`   ${index + 1}. "${tarea.title}" → Estudiantes: ${(tarea.assignedStudentIds || []).length}`);
        });
    }
}

// Exportar funciones para uso en consola
window.testAsignacionEspecifica = testAsignacionEspecifica;
window.verificarConfiguracion = verificarConfiguracion;

console.log('🎯 Funciones disponibles:');
console.log('  - testAsignacionEspecifica()  // Ejecutar prueba completa');
console.log('  - verificarConfiguracion()    // Ver estado actual del sistema');
console.log('');
console.log('💡 Ejecutar: testAsignacionEspecifica()');
