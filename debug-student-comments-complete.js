// 🔍 SCRIPT COMPLETO DE DEBUG PARA COMENTARIOS DE ESTUDIANTES
console.log('🔍 DEBUGGING STUDENT COMMENTS FOR TEACHER');
console.log('==========================================');

// 1. Cargar datos del localStorage
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');
const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');

console.log('👤 Current user:', currentUser?.username, '(Role:', currentUser?.role, ')');
console.log('📋 Total comments in localStorage:', comments.length);
console.log('📋 Total tasks in localStorage:', tasks.length);

// 2. Filtrar tareas del profesor usando múltiples criterios
const teacherTasks = tasks.filter(task => 
    task.assignedBy === currentUser.username || 
    task.assignedById === currentUser.id ||
    task.assignedBy === currentUser.id ||
    task.assignedById === currentUser.username
);

const teacherTaskIds = teacherTasks.map(task => task.id);

console.log('\n🔍 TEACHER TASKS ANALYSIS:');
console.log('==========================');
console.log('📚 Teacher tasks found:', teacherTasks.length);
console.log('📚 Teacher task IDs:', teacherTaskIds);

if (teacherTasks.length > 0) {
    console.log('\n📋 Found teacher tasks:');
    teacherTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.title}" (ID: ${task.id})`);
        console.log(`     - assignedBy: "${task.assignedBy}"`);
        console.log(`     - assignedById: "${task.assignedById}"`);
    });
} else {
    console.log('\n❌ NO TEACHER TASKS FOUND. Checking all tasks:');
    tasks.forEach((task, index) => {
        console.log(`  Task ${index + 1}: "${task.title}"`);
        console.log(`    - assignedBy: "${task.assignedBy}"`);
        console.log(`    - assignedById: "${task.assignedById}"`);
    });
}

// 3. Filtrar comentarios de estudiantes no leídos
const studentComments = comments.filter(comment => 
    !comment.isSubmission &&
    teacherTaskIds.includes(comment.taskId) &&
    comment.studentUsername !== currentUser.username &&
    !comment.readBy?.includes(currentUser.username)
);

console.log('\n🔍 STUDENT COMMENTS ANALYSIS:');
console.log('=============================');
console.log('💬 Total student comments (unread):', studentComments.length);

if (studentComments.length > 0) {
    console.log('\n📝 Unread student comments details:');
    studentComments.forEach((comment, index) => {
        const task = tasks.find(t => t.id === comment.taskId);
        console.log(`  ${index + 1}. From: ${comment.studentName} (${comment.studentUsername})`);
        console.log(`     Task: "${task?.title || 'Unknown'}" (ID: ${comment.taskId})`);
        console.log(`     Comment: "${comment.comment.substring(0, 100)}..."`);
        console.log(`     Timestamp: ${comment.timestamp}`);
        console.log(`     Read by: ${comment.readBy || 'None'}`);
        console.log('');
    });
} else {
    console.log('\n🔍 DEBUGGING: Why no student comments found?');
    
    // Analizar todos los comentarios
    const allNonSubmissionComments = comments.filter(c => !c.isSubmission);
    console.log('📝 Total non-submission comments:', allNonSubmissionComments.length);
    
    const commentsForTeacherTasks = comments.filter(c => teacherTaskIds.includes(c.taskId));
    console.log('📝 Comments for teacher tasks:', commentsForTeacherTasks.length);
    
    const commentsFromStudents = comments.filter(c => c.studentUsername !== currentUser.username);
    console.log('📝 Comments from other users:', commentsFromStudents.length);
    
    const unreadComments = comments.filter(c => !c.readBy?.includes(currentUser.username));
    console.log('📝 Unread comments:', unreadComments.length);
    
    if (allNonSubmissionComments.length > 0) {
        console.log('\n📋 Sample non-submission comments:');
        allNonSubmissionComments.slice(0, 3).forEach((comment, index) => {
            console.log(`  ${index + 1}. From: ${comment.studentUsername}`);
            console.log(`     Task ID: ${comment.taskId}`);
            console.log(`     Comment: "${comment.comment.substring(0, 50)}..."`);
            console.log(`     Is in teacher tasks: ${teacherTaskIds.includes(comment.taskId)}`);
            console.log(`     Is from current user: ${comment.studentUsername === currentUser.username}`);
            console.log(`     Is read by user: ${comment.readBy?.includes(currentUser.username)}`);
            console.log('');
        });
    }
}

// 4. Verificar también entregas pendientes
console.log('\n🔍 PENDING SUBMISSIONS ANALYSIS:');
console.log('================================');

const pendingSubmissions = comments.filter(comment => 
    comment.isSubmission === true && 
    teacherTaskIds.includes(comment.taskId) &&
    comment.studentUsername !== currentUser.username &&
    (!comment.grade || comment.grade === null || comment.grade === undefined)
);

console.log('📋 Pending submissions (ungraded):', pendingSubmissions.length);

if (pendingSubmissions.length > 0) {
    console.log('\n📋 Pending submissions details:');
    pendingSubmissions.forEach((submission, index) => {
        const task = tasks.find(t => t.id === submission.taskId);
        console.log(`  ${index + 1}. From: ${submission.studentName} (${submission.studentUsername})`);
        console.log(`     Task: "${task?.title || 'Unknown'}" (ID: ${submission.taskId})`);
        console.log(`     Grade: ${submission.grade} (${typeof submission.grade})`);
        console.log(`     Timestamp: ${submission.timestamp}`);
        console.log('');
    });
}

// 5. Resumen final
console.log('\n📊 FINAL SUMMARY:');
console.log('=================');
console.log(`👤 Teacher: ${currentUser?.username}`);
console.log(`📚 Teacher tasks: ${teacherTasks.length}`);
console.log(`💬 Unread student comments: ${studentComments.length}`);
console.log(`📋 Pending submissions: ${pendingSubmissions.length}`);
console.log(`🎯 Total notifications: ${studentComments.length + pendingSubmissions.length}`);
