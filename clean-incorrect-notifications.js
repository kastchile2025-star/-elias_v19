// 🔧 Script para limpiar notificaciones incorrectas de comentarios de profesor
// Este script limpia notificaciones que llegaron a estudiantes incorrectos

console.log('🔧 Limpiando notificaciones incorrectas de comentarios...');

function cleanIncorrectTeacherCommentNotifications() {
    try {
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');

        console.log(`📊 Estado inicial:`);
        console.log(`   - Notificaciones totales: ${notifications.length}`);
        console.log(`   - Tareas: ${tasks.length}`);
        console.log(`   - Asignaciones de estudiantes: ${studentAssignments.length}`);
        console.log(`   - Usuarios: ${allUsers.length}`);

        const commentNotifications = notifications.filter(n => n.type === 'teacher_comment');
        console.log(`   - Notificaciones de comentarios: ${commentNotifications.length}`);

        let correctedCount = 0;
        let removedCount = 0;

        // Analizar cada notificación de comentario
        commentNotifications.forEach(notif => {
            console.log(`\n🔍 Analizando notificación: "${notif.taskTitle}"`);
            console.log(`   De: ${notif.fromUsername}`);
            console.log(`   Curso: ${notif.course}`);
            console.log(`   Destinatarios actuales: ${notif.targetUsernames?.length || 0}`);

            const task = tasks.find(t => t.id === notif.taskId);
            if (!task) {
                console.log(`   ❌ Tarea no encontrada - eliminando notificación`);
                const index = notifications.findIndex(n => n.id === notif.id);
                if (index > -1) {
                    notifications.splice(index, 1);
                    removedCount++;
                }
                return;
            }

            // Calcular destinatarios correctos
            const correctRecipients = calculateCorrectRecipients(task, allUsers, studentAssignments, notif.fromUsername);
            
            console.log(`   Destinatarios correctos: ${correctRecipients.length}`);
            if (correctRecipients.length > 0) {
                correctRecipients.forEach(username => {
                    console.log(`      - ${username}`);
                });
            }

            const currentRecipients = notif.targetUsernames || [];
            
            // Comparar y corregir
            const shouldUpdate = JSON.stringify(currentRecipients.sort()) !== JSON.stringify(correctRecipients.sort());

            if (shouldUpdate) {
                if (correctRecipients.length === 0) {
                    console.log(`   🗑️ Sin destinatarios válidos - eliminando notificación`);
                    const index = notifications.findIndex(n => n.id === notif.id);
                    if (index > -1) {
                        notifications.splice(index, 1);
                        removedCount++;
                    }
                } else {
                    console.log(`   📝 Corrigiendo destinatarios:`);
                    console.log(`      Antes: [${currentRecipients.join(', ')}]`);
                    console.log(`      Después: [${correctRecipients.join(', ')}]`);
                    
                    notif.targetUsernames = correctRecipients;
                    
                    // También limpiar readBy de usuarios que ya no deberían recibir la notificación
                    if (notif.readBy) {
                        notif.readBy = notif.readBy.filter(username => correctRecipients.includes(username));
                    }
                    
                    correctedCount++;
                }
            } else {
                console.log(`   ✅ Destinatarios correctos`);
            }
        });

        // Guardar cambios
        if (correctedCount > 0 || removedCount > 0) {
            localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
            console.log(`\n✅ Limpieza completada:`);
            console.log(`   - Notificaciones corregidas: ${correctedCount}`);
            console.log(`   - Notificaciones eliminadas: ${removedCount}`);
            console.log(`   - Total de notificaciones restantes: ${notifications.length}`);
        } else {
            console.log(`\n✅ No se encontraron notificaciones incorrectas`);
        }

        // Forzar actualización de la UI
        console.log(`\n🔄 Forzando actualización de UI...`);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('notificationsCleanup'));

        return { correctedCount, removedCount, totalNotifications: notifications.length };

    } catch (error) {
        console.error('❌ Error en limpieza:', error);
        return null;
    }
}

function calculateCorrectRecipients(task, allUsers, studentAssignments, teacherUsername) {
    const courseId = task.course || task.courseSectionId;
    
    if (!courseId) {
        console.log(`   ⚠️ Tarea sin courseId`);
        return [];
    }

    // Parsear courseId
    const courseData = parseCourseId(courseId);
    if (!courseData) {
        console.log(`   ⚠️ No se pudo parsear courseId: ${courseId}`);
        return [];
    }

    const { courseId: actualCourseId, sectionId } = courseData;
    console.log(`   📋 Curso: ${actualCourseId}, Sección: ${sectionId}`);

    // Obtener estudiantes asignados a este curso y sección
    const assignedStudentIds = studentAssignments
        .filter(assignment => 
            assignment.courseId === actualCourseId && 
            assignment.sectionId === sectionId
        )
        .map(assignment => assignment.studentId);

    console.log(`   🎯 Estudiantes asignados (IDs): ${assignedStudentIds.length}`);

    // Convertir IDs a usernames, excluyendo al profesor
    const correctUsernames = assignedStudentIds
        .map(studentId => {
            const user = allUsers.find(u => u.id === studentId && u.role === 'student');
            return user ? user.username : null;
        })
        .filter(username => username !== null && username !== teacherUsername);

    return correctUsernames;
}

function parseCourseId(courseId) {
    if (!courseId) return null;
    
    const parts = courseId.split('-');
    
    if (parts.length >= 10) {
        // ID combinado
        const actualCourseId = parts.slice(0, 5).join('-');
        const sectionId = parts.slice(5, 10).join('-');
        return { courseId: actualCourseId, sectionId };
    } else if (parts.length === 5) {
        // ID simple - buscar sección única
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const assignmentsForCourse = studentAssignments.filter(assignment => assignment.courseId === courseId);
        
        const uniqueSections = [...new Set(assignmentsForCourse.map(assignment => assignment.sectionId))];
        
        if (uniqueSections.length === 1) {
            return { courseId, sectionId: uniqueSections[0] };
        } else {
            console.warn(`   ⚠️ Múltiples secciones para curso ${courseId}: ${uniqueSections.length}`);
            return null;
        }
    }
    
    return null;
}

// Función para verificar estado actual de un estudiante específico
function checkStudentNotifications(studentUsername) {
    console.log(`\n🔍 Verificando notificaciones para estudiante: ${studentUsername}`);
    
    const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
    const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
    const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');

    const studentUser = allUsers.find(u => u.username === studentUsername);
    if (!studentUser) {
        console.log(`❌ Estudiante no encontrado: ${studentUsername}`);
        return;
    }

    const receivedNotifications = notifications.filter(n => 
        n.type === 'teacher_comment' && 
        n.targetUsernames?.includes(studentUsername)
    );

    console.log(`📨 Notificaciones de comentarios recibidas: ${receivedNotifications.length}`);

    receivedNotifications.forEach((notif, index) => {
        console.log(`\n   ${index + 1}. "${notif.taskTitle}"`);
        console.log(`      De: ${notif.fromUsername}`);
        console.log(`      Curso: ${notif.course}`);

        const task = tasks.find(t => t.id === notif.taskId);
        if (task) {
            const shouldReceive = shouldStudentReceiveNotification(task, studentUser, studentAssignments);
            console.log(`      ¿Debería recibir?: ${shouldReceive ? '✅ SÍ' : '❌ NO'}`);
        } else {
            console.log(`      ❌ Tarea no encontrada`);
        }
    });
}

function shouldStudentReceiveNotification(task, student, studentAssignments) {
    const courseData = parseCourseId(task.course || task.courseSectionId);
    if (!courseData) return false;
    
    const { courseId, sectionId } = courseData;
    
    return studentAssignments.some(assignment => 
        assignment.studentId === student.id &&
        assignment.courseId === courseId &&
        assignment.sectionId === sectionId
    );
}

// Ejecutar limpieza
console.log('🚀 Ejecutando limpieza...');
const result = cleanIncorrectTeacherCommentNotifications();

if (result) {
    console.log('\n🎉 Limpieza completada exitosamente');
    console.log(`📊 Resultado: ${result.correctedCount} corregidas, ${result.removedCount} eliminadas`);
    console.log('💡 Usa checkStudentNotifications("username") para verificar un estudiante específico');
    console.log('🔄 Recarga la página para ver los cambios');
} else {
    console.log('\n❌ Limpieza falló');
}

// Hacer funciones disponibles globalmente
window.cleanIncorrectTeacherCommentNotifications = cleanIncorrectTeacherCommentNotifications;
window.checkStudentNotifications = checkStudentNotifications;

console.log('\n🔧 Script de limpieza completado');
