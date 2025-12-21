// Test script for graded submission deletion restrictions
// Run in browser console on the SMART STUDENT app

console.log('=== Testing Graded Submission Deletion Logic ===');

// Check current user
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || '{}');
console.log('Current user:', currentUser);

// Get tasks and comments
const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const comments = JSON.parse(localStorage.getItem('smart-student-task-comments') || '[]');

console.log('Total tasks:', tasks.length);
console.log('Total comments:', comments.length);

// Find submissions (comments with isSubmission = true)
const submissions = comments.filter(c => c.isSubmission);
console.log('Total submissions:', submissions.length);

// Categorize submissions
const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
const ungradedSubmissions = submissions.filter(s => s.grade === undefined);

console.log('Graded submissions:', gradedSubmissions.length);
console.log('Ungraded submissions:', ungradedSubmissions.length);

// Show details
console.log('\n=== Graded Submissions ===');
gradedSubmissions.forEach(s => {
  console.log(`- ${s.studentName}: ${s.comment.substring(0, 30)}... (Grade: ${s.grade}%)`);
});

console.log('\n=== Ungraded Submissions ===');
ungradedSubmissions.forEach(s => {
  console.log(`- ${s.studentName}: ${s.comment.substring(0, 30)}...`);
});

// Test logic for deletion rights
console.log('\n=== Deletion Rights Test ===');
submissions.forEach(submission => {
  const canStudentDelete = submission.grade === undefined;
  const canTeacherDelete = true; // Teachers can always delete
  
  console.log(`${submission.studentName} submission:`);
  console.log(`  - Graded: ${submission.grade !== undefined ? 'Yes (' + submission.grade + '%)' : 'No'}`);
  console.log(`  - Student can delete: ${canStudentDelete ? 'Yes' : 'No (graded)'}`);
  console.log(`  - Teacher can delete: ${canTeacherDelete ? 'Yes' : 'No'}`);
  console.log('');
});

// Test grading a submission
console.log('\n=== Test Grading ===');
if (ungradedSubmissions.length > 0 && currentUser.role === 'teacher') {
  const testSubmission = ungradedSubmissions[0];
  console.log('Testing grading submission:', testSubmission.studentName);
  
  // Grade the submission
  const updatedComments = comments.map(comment => 
    comment.id === testSubmission.id 
      ? {
          ...comment,
          grade: 85,
          feedback: 'Test feedback - Good work!',
          gradedBy: currentUser.username,
          gradedAt: new Date().toISOString()
        }
      : comment
  );
  
  // Save temporarily (you can undo this)
  localStorage.setItem('smart-student-task-comments', JSON.stringify(updatedComments));
  console.log('✓ Submission graded with 85%. Now the student cannot delete it.');
  console.log('Refresh the page to see the changes.');
} else {
  console.log('No ungraded submissions or not a teacher');
}
