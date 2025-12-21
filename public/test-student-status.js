// Test to verify student submission status and checkbox behavior
(function() {
  console.log('=== TESTING STUDENT SUBMISSION STATUS ===');
  
  // Get tasks and comments from localStorage
  const tasks = JSON.parse(localStorage.getItem('smart_student_tasks') || '[]');
  const comments = JSON.parse(localStorage.getItem('smart_student_task_comments') || '[]');
  
  console.log('Total tasks:', tasks.length);
  console.log('Total comments:', comments.length);
  
  // Find Felipe Estudiante's tasks
  const felipeUsername = 'felipe_estudiante';
  
  tasks.forEach(task => {
    // Check if Felipe has submitted this task
    const submission = comments.find(comment => 
      comment.taskId === task.id && 
      comment.studentUsername === felipeUsername && 
      comment.isSubmission
    );
    
    console.log(`\nTask: ${task.title}`);
    console.log(`Course: ${task.course}`);
    console.log(`Overall Status: ${task.status}`);
    console.log(`Felipe has submitted: ${submission ? 'YES' : 'NO'}`);
    
    if (submission) {
      console.log(`Submission date: ${submission.timestamp}`);
      console.log(`Submission comment: ${submission.comment}`);
    }
  });
  
  console.log('\n=== All Submissions by Felipe ===');
  const felipeSubmissions = comments.filter(comment => 
    comment.studentUsername === felipeUsername && 
    comment.isSubmission
  );
  
  felipeSubmissions.forEach(sub => {
    console.log(`Task ID: ${sub.taskId}, Comment: ${sub.comment}, Date: ${sub.timestamp}`);
  });
  
})();
