// 🔍 Script para diagnosticar y corregir notificaciones de comentarios profesor
// Este script analiza por qué las notificaciones llegan a estudiantes incorrectos

console.log('🔍 Diagnosticando notificaciones de comentarios del profesor...');

function diagnoseTeacherCommentNotifications() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
        const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');

        console.log(`\n👤 Usuario actual: ${currentUser.username} (${currentUser.role})`);
        console.log(`📊 Datos del sistema:`);
        console.log(`   - Usuarios: ${allUsers.length}`);
        console.log(`   - Tareas: ${tasks.length}`);
        console.log(`   - Notificaciones: ${notifications.length}`);
        console.log(`   - Asignaciones: ${studentAssignments.length}`);
        console.log(`   - Comentarios: ${comments.length}`);

        // 1. Buscar tareas de "todo el curso" del profesor actual
        const courseTasks = tasks.filter(task => 
            task.assignedTo === 'course' && 
            task.assignedBy === currentUser.username
        );

        console.log(`\n📚 Tareas de "todo el curso" creadas por ${currentUser.username}: ${courseTasks.length}`);
        
        courseTasks.forEach((task, index) => {
            console.log(`\n   ${index + 1}. "${task.title}"`);
            console.log(`      Curso: ${task.course || task.courseSectionId}`);
            console.log(`      Asignado a: ${task.assignedTo}`);
            console.log(`      ID de tarea: ${task.id}`);

            // Buscar comentarios del profesor en esta tarea
            const professorComments = comments.filter(comment => 
                comment.taskId === task.id && 
                comment.studentUsername === currentUser.username && 
                !comment.isSubmission
            );

            console.log(`      Comentarios del profesor: ${professorComments.length}`);

            if (professorComments.length > 0) {
                // Buscar notificaciones asociadas a estos comentarios
                const relatedNotifications = notifications.filter(notif => 
                    notif.taskId === task.id && 
                    notif.type === 'teacher_comment' &&
                    notif.fromUsername === currentUser.username
                );

                console.log(`      Notificaciones creadas: ${relatedNotifications.length}`);

                relatedNotifications.forEach((notif, nIndex) => {
                    console.log(`         Notificación ${nIndex + 1}:`);
                    console.log(`            Destinatarios: ${notif.targetUsernames?.length || 0}`);
                    console.log(`            Lista: ${notif.targetUsernames?.join(', ') || 'Ninguno'}`);
                });

                // Diagnosticar quién DEBERÍA recibir la notificación
                console.log(`\n      🔍 Análisis de estudiantes que DEBERÍAN recibir notificación:`);
                
                const courseId = task.course || task.courseSectionId;
                console.log(`         Course ID usado: ${courseId}`);

                // Simular la función getStudentsInCourse
                const courseData = parseCourseId(courseId);
                if (courseData) {
                    const { courseId: actualCourseId, sectionId } = courseData;
                    console.log(`         Parsed - Course: ${actualCourseId}, Section: ${sectionId}`);

                    // Buscar estudiantes asignados
                    const assignedStudentIds = studentAssignments
                        .filter(assignment => 
                            assignment.courseId === actualCourseId && 
                            assignment.sectionId === sectionId
                        )
                        .map(assignment => assignment.studentId);

                    console.log(`         Estudiantes asignados (IDs): ${assignedStudentIds.length}`);

                    const expectedStudents = assignedStudentIds
                        .map(studentId => {
                            const user = allUsers.find(u => u.id === studentId && u.role === 'student');
                            return user ? user.username : null;
                        })
                        .filter(username => username !== null);

                    console.log(`         Estudiantes esperados: ${expectedStudents.length}`);
                    expectedStudents.forEach(username => {
                        console.log(`            - ${username}`);
                    });

                    // Comparar con destinatarios reales
                    if (relatedNotifications.length > 0) {
                        const actualRecipients = relatedNotifications[0].targetUsernames || [];
                        const extraRecipients = actualRecipients.filter(username => !expectedStudents.includes(username));
                        const missingRecipients = expectedStudents.filter(username => !actualRecipients.includes(username));

                        if (extraRecipients.length > 0) {
                            console.log(`         ❌ Destinatarios EXTRA (no deberían recibir):`);
                            extraRecipients.forEach(username => {
                                console.log(`            - ${username}`);
                            });
                        }

                        if (missingRecipients.length > 0) {
                            console.log(`         ⚠️ Destinatarios FALTANTES:`);
                            missingRecipients.forEach(username => {
                                console.log(`            - ${username}`);
                            });
                        }

                        if (extraRecipients.length === 0 && missingRecipients.length === 0) {
                            console.log(`         ✅ Destinatarios correctos`);
                        }
                    }
                }
            }
        });

        // 2. Si somos estudiante, verificar notificaciones recibidas incorrectamente
        if (currentUser.role === 'student') {
            console.log(`\n📨 Análisis de notificaciones recibidas por estudiante ${currentUser.username}:`);
            
            const receivedCommentNotifications = notifications.filter(notif => 
                notif.type === 'teacher_comment' &&
                notif.targetUsernames?.includes(currentUser.username)
            );

            console.log(`   Notificaciones de comentarios recibidas: ${receivedCommentNotifications.length}`);

            receivedCommentNotifications.forEach((notif, index) => {
                console.log(`\n      ${index + 1}. "${notif.taskTitle}"`);
                console.log(`         De: ${notif.fromUsername}`);
                console.log(`         Curso: ${notif.course}`);

                // Verificar si DEBERÍA recibir esta notificación
                const task = tasks.find(t => t.id === notif.taskId);
                if (task) {
                    const shouldReceive = checkStudentShouldReceiveNotification(task, currentUser, studentAssignments, allUsers);
                    console.log(`         ¿Debería recibir?: ${shouldReceive ? '✅ SÍ' : '❌ NO'}`);
                    
                    if (!shouldReceive) {
                        console.log(`         🚨 NOTIFICACIÓN INCORRECTA - Debe ser filtrada`);
                    }
                }
            });
        }

        return {
            courseTasks,
            relatedNotifications: notifications.filter(n => n.type === 'teacher_comment'),
            currentUser
        };

    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
        return null;
    }
}

// Función auxiliar para parsear IDs de curso
function parseCourseId(courseId) {
    if (!courseId) return null;
    
    const parts = courseId.split('-');
    
    if (parts.length >= 10) {
        // ID combinado curso-sección
        const actualCourseId = parts.slice(0, 5).join('-');
        const sectionId = parts.slice(5, 10).join('-');
        return { courseId: actualCourseId, sectionId };
    } else if (parts.length === 5) {
        // ID simple - necesita fallback
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const assignmentsForCourse = studentAssignments.filter(assignment => assignment.courseId === courseId);
        
        if (assignmentsForCourse.length > 0) {
            return { courseId, sectionId: assignmentsForCourse[0].sectionId };
        }
    }
    
    return null;
}

// Función auxiliar para verificar si un estudiante debería recibir una notificación
function checkStudentShouldReceiveNotification(task, student, studentAssignments, allUsers) {
    const courseId = task.course || task.courseSectionId;
    const courseData = parseCourseId(courseId);
    
    if (!courseData) return false;
    
    const { courseId: actualCourseId, sectionId } = courseData;
    
    // Buscar datos del estudiante
    const studentData = allUsers.find(u => u.username === student.username);
    if (!studentData) return false;
    
    // Verificar asignación
    const isAssigned = studentAssignments.some(assignment => 
        assignment.studentId === studentData.id &&
        assignment.courseId === actualCourseId &&
        assignment.sectionId === sectionId
    );
    
    return isAssigned;
}

// Función para corregir notificaciones incorrectas
function fixIncorrectNotifications() {
    console.log('\n🔧 Corrigiendo notificaciones incorrectas...');
    
    try {
        const notifications = JSON.parse(localStorage.getItem('smart-student-task-notifications') || '[]');
        const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
        const studentAssignments = JSON.parse(localStorage.getItem('smart-student-student-assignments') || '[]');
        const allUsers = JSON.parse(localStorage.getItem('smart-student-users') || '[]');

        let correctedCount = 0;

        notifications.forEach(notif => {
            if (notif.type === 'teacher_comment') {
                const task = tasks.find(t => t.id === notif.taskId);
                if (task) {
                    // Recalcular destinatarios correctos
                    const courseData = parseCourseId(task.course || task.courseSectionId);
                    if (courseData) {
                        const { courseId, sectionId } = courseData;
                        
                        const correctStudentIds = studentAssignments
                            .filter(assignment => 
                                assignment.courseId === courseId && 
                                assignment.sectionId === sectionId
                            )
                            .map(assignment => assignment.studentId);

                        const correctUsernames = correctStudentIds
                            .map(studentId => {
                                const user = allUsers.find(u => u.id === studentId && u.role === 'student');
                                return user ? user.username : null;
                            })
                            .filter(username => username !== null);

                        // Comparar y corregir si es necesario
                        const currentRecipients = notif.targetUsernames || [];
                        const shouldUpdate = JSON.stringify(currentRecipients.sort()) !== JSON.stringify(correctUsernames.sort());

                        if (shouldUpdate) {
                            console.log(`📝 Corrigiendo notificación "${notif.taskTitle}"`);
                            console.log(`   Antes: ${currentRecipients.join(', ')}`);
                            console.log(`   Después: ${correctUsernames.join(', ')}`);
                            
                            notif.targetUsernames = correctUsernames;
                            correctedCount++;
                        }
                    }
                }
            }
        });

        if (correctedCount > 0) {
            localStorage.setItem('smart-student-task-notifications', JSON.stringify(notifications));
            console.log(`✅ ${correctedCount} notificaciones corregidas`);
        } else {
            console.log(`✅ No se encontraron notificaciones incorrectas`);
        }

        return correctedCount;

    } catch (error) {
        console.error('❌ Error corrigiendo notificaciones:', error);
        return 0;
    }
}

// Ejecutar diagnóstico
console.log('🚀 Ejecutando diagnóstico...');
const result = diagnoseTeacherCommentNotifications();

if (result) {
    console.log('\n🎉 Diagnóstico completado');
    console.log('💡 Usa fixIncorrectNotifications() para corregir notificaciones incorrectas');
    console.log('🔄 Recarga la página después de las correcciones');
} else {
    console.log('\n❌ Diagnóstico falló');
}

// Hacer funciones disponibles globalmente
window.diagnoseTeacherCommentNotifications = diagnoseTeacherCommentNotifications;
window.fixIncorrectNotifications = fixIncorrectNotifications;

console.log('\n🔍 Script de diagnóstico de notificaciones completado');
