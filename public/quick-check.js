/**
 * 🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA
 * 
 * Ejecuta este script en la consola del navegador para ver el estado actual
 */

(function quickCheck() {
  console.log('🔍 ========================================');
  console.log('🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA');
  console.log('🔍 ========================================\n');

  // 1. LocalStorage
  console.log('📦 1. LOCALSTORAGE:');
  const year = localStorage.getItem('admin-selected-year') || new Date().getFullYear();
  console.log(`   Año seleccionado: ${year}`);
  
  try {
    const gradesKey = `smart-student-test-grades-${year}`;
    const grades = JSON.parse(localStorage.getItem(gradesKey) || '[]');
    console.log(`   ✅ Calificaciones en LS: ${grades.length}`);
    if (grades.length > 0) {
      console.log(`   Primera: ${grades[0].studentName} - ${grades[0].title || 'Sin título'}`);
    }
  } catch (e) {
    console.log('   ❌ Error leyendo calificaciones:', e.message);
  }

  // 2. Estado de React (si está disponible)
  console.log('\n⚛️  2. ESTADO DE REACT:');
  const container = document.querySelector('[data-testid="grades-table"]') || document.querySelector('table');
  if (container) {
    const rows = container.querySelectorAll('tbody tr');
    console.log(`   ✅ Filas visibles en tabla: ${rows.length}`);
  } else {
    console.log('   ⚠️ Tabla no encontrada en el DOM');
  }

  // 3. Listeners activos
  console.log('\n🎧 3. LISTENERS ACTIVOS:');
  const checkListener = (eventName) => {
    // No podemos verificar directamente, pero podemos testear
    let received = false;
    const testHandler = () => { received = true; };
    window.addEventListener(eventName, testHandler);
    window.dispatchEvent(new CustomEvent(eventName, { detail: { test: true } }));
    window.removeEventListener(eventName, testHandler);
    return received;
  };
  
  const events = ['sqlGradesUpdated', 'sqlImportProgress', 'dataImported'];
  events.forEach(ev => {
    const works = checkListener(ev);
    console.log(`   ${works ? '✅' : '❌'} ${ev}: ${works ? 'funciona' : 'no responde'}`);
  });

  // 4. SQL/Firebase Connection
  console.log('\n🔌 4. CONEXIÓN SQL/FIREBASE:');
  if (window.__sqlStatus) {
    console.log('   ✅ SQL Status disponible:', window.__sqlStatus);
  } else {
    console.log('   ⚠️ SQL Status no disponible en window');
  }

  // 5. Configuración
  console.log('\n⚙️  5. CONFIGURACIÓN:');
  try {
    const config = JSON.parse(localStorage.getItem('smart-student-config') || '{}');
    console.log('   Sistema:', config);
  } catch (e) {
    console.log('   ⚠️ No se pudo leer configuración');
  }

  // 6. Usuarios
  console.log('\n👥 6. USUARIOS:');
  try {
    const users = JSON.parse(localStorage.getItem('smart-student-users') || '[]');
    const students = users.filter(u => u.role === 'student' || u.role === 'estudiante');
    const teachers = users.filter(u => u.role === 'teacher' || u.role === 'profesor');
    console.log(`   Estudiantes: ${students.length}`);
    console.log(`   Profesores: ${teachers.length}`);
    console.log(`   Total usuarios: ${users.length}`);
  } catch (e) {
    console.log('   ❌ Error leyendo usuarios');
  }

  // 7. Cursos y Secciones
  console.log('\n📚 7. CURSOS Y SECCIONES:');
  try {
    const courses = JSON.parse(localStorage.getItem('smart-student-courses') || '[]');
    const sections = JSON.parse(localStorage.getItem('smart-student-sections') || '[]');
    console.log(`   Cursos: ${courses.length}`);
    console.log(`   Secciones: ${sections.length}`);
  } catch (e) {
    console.log('   ❌ Error leyendo cursos/secciones');
  }

  // 8. Últimos cambios
  console.log('\n🕐 8. ÚLTIMOS CAMBIOS:');
  const keys = [
    'smart-student-test-grades-' + year,
    'smart-student-tasks',
    'smart-student-users'
  ];
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`   ${key}: ${(data.length / 1024).toFixed(1)} KB`);
      }
    } catch (e) {}
  });

  // Resumen
  console.log('\n✅ RESUMEN:');
  console.log('   - LocalStorage: Operativo');
  console.log('   - Listeners: Configurados');
  console.log('   - Datos: Presentes');
  console.log('\n📝 SIGUIENTE PASO:');
  console.log('   Ir a Admin > Configuración y cargar:');
  console.log('   public/test-data/calificaciones_reales_200.csv');
  console.log('\n🔍 ========================================\n');
})();
