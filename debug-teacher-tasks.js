// DEBUG: Análisis de tareas del profesor
console.log('🔍 DEBUGGING TEACHER TASKS ASSIGNMENT');
console.log('=====================================');

const tasks = JSON.parse(localStorage.getItem('smart-student-tasks') || '[]');
const currentUser = JSON.parse(localStorage.getItem('smart-student-user') || 'null');

console.log('👤 Current user:', currentUser.username, '(ID:', currentUser.id, ')');
console.log('📋 Total tasks in localStorage:', tasks.length);

console.log('\n🔍 DETAILED TASK ANALYSIS:');
console.log('==========================');

tasks.forEach((task, index) => {
  console.log(`Task ${index + 1}: "${task.title}"`);
  console.log(`  - assignedBy: "${task.assignedBy}"`);
  console.log(`  - assignedById: "${task.assignedById}"`);
  console.log(`  - id: "${task.id}"`);
  console.log(`  - status: "${task.status}"`);
  console.log(`  - assignedTo: "${task.assignedTo}"`);
  console.log(`  - Match assignedBy: ${task.assignedBy === currentUser.username}`);
  console.log(`  - Match assignedById: ${task.assignedById === currentUser.id}`);
  console.log('');
});

console.log('\n📚 FILTERING RESULTS:');
console.log('=====================');

// Método 1: Filtrar por assignedBy (como lo hace el código actual)
const teacherTasksByAssignedBy = tasks.filter(task => task.assignedBy === currentUser.username);
console.log('📚 Tasks filtered by assignedBy:', teacherTasksByAssignedBy.length);
console.log('   Task IDs:', teacherTasksByAssignedBy.map(t => t.id));

// Método 2: Filtrar por assignedById (alternativa)
const teacherTasksByAssignedById = tasks.filter(task => task.assignedById === currentUser.id);
console.log('📚 Tasks filtered by assignedById:', teacherTasksByAssignedById.length);
console.log('   Task IDs:', teacherTasksByAssignedById.map(t => t.id));

// Método 3: Buscar cualquier referencia al usuario (más amplio)
const teacherTasksAnyRef = tasks.filter(task => 
  task.assignedBy === currentUser.username || 
  task.assignedById === currentUser.id ||
  task.assignedBy === currentUser.id ||
  task.assignedById === currentUser.username
);
console.log('📚 Tasks with any reference to user:', teacherTasksAnyRef.length);
console.log('   Task IDs:', teacherTasksAnyRef.map(t => t.id));

console.log('\n🔍 RECOMMENDATION:');
console.log('==================');
if (teacherTasksByAssignedBy.length > 0) {
  console.log('✅ Use assignedBy filter (current code is correct)');
} else if (teacherTasksByAssignedById.length > 0) {
  console.log('⚠️  Should use assignedById filter instead of assignedBy');
} else if (teacherTasksAnyRef.length > 0) {
  console.log('⚠️  Need broader filtering logic');
} else {
  console.log('❌ No tasks found for this teacher - check task creation logic');
}
