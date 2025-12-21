// 🔍 SCRIPT DE DIAGNÓSTICO - CALIFICACIONES NO VISIBLES
// Copia y pega este script completo en la consola del navegador (F12)

console.log('🔍 ===== DIAGNÓSTICO DE CALIFICACIONES =====\n');

// 1. Verificar año seleccionado
const selectedYear = parseInt(localStorage.getItem('admin-selected-year') || '2025');
console.log(`📅 Año seleccionado: ${selectedYear}`);

// 2. Verificar LocalStorage para ese año
const lsKey = `smart-student-test-grades-${selectedYear}`;
const localGradesRaw = localStorage.getItem(lsKey);
const localGrades = localGradesRaw ? JSON.parse(localGradesRaw) : [];
console.log(`\n📊 LocalStorage (${lsKey}):`);
console.log(`   Total registros: ${localGrades.length}`);

if (localGrades.length > 0) {
  const sample = localGrades[0];
  console.log(`   Muestra:`, sample);
  
  // Estadísticas
  const courses = [...new Set(localGrades.map(g => g.courseId || 'sin-curso').filter(Boolean))];
  const subjects = [...new Set(localGrades.map(g => g.subjectId || g.title || 'sin-asignatura').filter(Boolean))];
  const students = [...new Set(localGrades.map(g => g.studentId).filter(Boolean))];
  
  console.log(`\n📈 Estadísticas LocalStorage:`);
  console.log(`   Cursos únicos: ${courses.length}`, courses);
  console.log(`   Asignaturas únicas: ${subjects.length}`, subjects);
  console.log(`   Estudiantes únicos: ${students.length}`);
} else {
  console.warn('⚠️ NO hay calificaciones en LocalStorage para el año ' + selectedYear);
}

// 3. Verificar otras claves relacionadas
console.log(`\n🔑 Otras claves de calificaciones en LocalStorage:`);
const allKeys = Object.keys(localStorage).filter(k => k.includes('grades') || k.includes('test'));
allKeys.forEach(key => {
  const value = localStorage.getItem(key);
  const count = value ? (value.startsWith('[') ? JSON.parse(value).length : 'N/A') : 0;
  console.log(`   ${key}: ${count} registros`);
});

// 4. Verificar usuarios y cursos
const students = JSON.parse(localStorage.getItem(`smart-student-students-${selectedYear}`) || '[]');
const courses = JSON.parse(localStorage.getItem(`smart-student-courses-${selectedYear}`) || '[]');
const sections = JSON.parse(localStorage.getItem(`smart-student-sections-${selectedYear}`) || '[]');
const subjects = JSON.parse(localStorage.getItem(`smart-student-subjects-${selectedYear}`) || '[]');

console.log(`\n👥 Datos base del sistema (año ${selectedYear}):`);
console.log(`   Estudiantes: ${students.length}`);
console.log(`   Cursos: ${courses.length}`);
console.log(`   Secciones: ${sections.length}`);
console.log(`   Asignaturas: ${subjects.length}`);

// 5. Verificar ruta actual
console.log(`\n🌐 Información de navegación:`);
console.log(`   URL actual: ${window.location.pathname}`);
console.log(`   En página Calificaciones: ${window.location.pathname.includes('/calificaciones') ? '✅ SÍ' : '❌ NO'}`);

// 6. Sugerencias
console.log(`\n💡 SUGERENCIAS:`);
if (localGrades.length === 0) {
  console.log(`
   ❌ NO hay calificaciones en LocalStorage
   
   Opciones:
   1️⃣ Recargar el CSV desde Admin → Configuración → Carga Masiva
   2️⃣ Verificar que el año de las calificaciones (2025) coincida con el año seleccionado
   3️⃣ Revisar la consola durante la carga para ver si hay errores
   4️⃣ Si tienes conexión SQL activa, las calificaciones se cargarán desde allí
  `);
} else {
  console.log(`
   ✅ HAY calificaciones en LocalStorage (${localGrades.length} registros)
   
   Si no aparecen en la interfaz:
   1️⃣ Refresca la página (Ctrl+R o Cmd+R)
   2️⃣ Ve a Calificaciones y selecciona: Curso → Sección → Asignatura
   3️⃣ Verifica filtros de semestre
   4️⃣ Abre la consola del navegador para ver mensajes de carga
  `);
}

// 7. Test de carga desde SQL (si está disponible)
console.log(`\n🔌 Estado de conexión SQL:`);
const sqlConnected = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard');
console.log(`   Conexión potencial: ${sqlConnected ? '✅ Activa' : '❌ Inactiva'}`);

console.log(`\n🔍 ===== FIN DEL DIAGNÓSTICO =====`);
console.log(`\n📋 Para ver detalles completos de una calificación:`);
console.log(`   console.log(JSON.parse(localStorage.getItem('${lsKey}'))[0]);`);
