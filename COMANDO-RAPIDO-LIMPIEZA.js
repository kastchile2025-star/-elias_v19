// COMANDO RÁPIDO - Pegar en consola del navegador
// Limpia TODOS los datos demo y sincroniza con Gestión de Usuarios

const year = new Date().getFullYear();
const keysToDelete = ['smart-student-tasks', 'smart-student-submissions', 'smart-student-attendance', 'smart-student-assignments', 'smart-student-evaluations', 'smart-student-grades', 'smart-student-notifications', 'smart-student-course-sections'].flatMap(k => [k, `${k}-${year}`]);
keysToDelete.forEach(k => localStorage.removeItem(k));
sessionStorage.clear();
Object.keys(localStorage).filter(k => k.startsWith('demo-stats-generated:')).forEach(k => localStorage.removeItem(k));
localStorage.setItem('stats-filters-state', JSON.stringify({level:'all',course:'all',section:'all',semester:'all',subject:'all',period:'Todo'}));
console.log('✅ Datos demo eliminados. Recargando...'); 
setTimeout(() => location.reload(), 1000);
