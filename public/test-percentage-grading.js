// Test to verify the new percentage grading system
(function() {
  console.log('=== TESTING PERCENTAGE GRADING SYSTEM ===');
  
  // Get tasks and comments from localStorage
  const comments = JSON.parse(localStorage.getItem('smart_student_task_comments') || '[]');
  
  console.log('Total comments:', comments.length);
  
  // Find all graded submissions
  const gradedSubmissions = comments.filter(comment => 
    comment.isSubmission && comment.grade !== undefined
  );
  
  console.log('Graded submissions:', gradedSubmissions.length);
  
  gradedSubmissions.forEach(submission => {
    console.log(`\nStudent: ${submission.studentName}`);
    console.log(`Grade: ${submission.grade}%`);
    console.log(`Feedback: ${submission.feedback || 'No feedback'}`);
    console.log(`Graded by: ${submission.gradedBy || 'Unknown'}`);
    console.log(`Date: ${submission.gradedAt || 'Unknown'}`);
  });
  
  // Test the new grade range validation
  console.log('\n=== TESTING GRADE VALIDATION ===');
  const testGrades = [-5, 0, 50, 100, 150];
  
  testGrades.forEach(grade => {
    const validatedGrade = Math.min(100, Math.max(0, grade));
    console.log(`Input: ${grade}% -> Validated: ${validatedGrade}%`);
  });
  
})();
