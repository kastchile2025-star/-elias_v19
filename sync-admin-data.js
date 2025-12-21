// Script COMPLETO para sincronizar datos de administrador con Gestión de Usuarios
// Ejecutar en consola del navegador (F12 -> Console)

console.log('🔄 LIMPIEZA COMPLETA: Sincronizando con Gestión de Usuarios...');

// Función para obtener el año actual
const currentYear = new Date().getFullYear();

// 1. Leer datos reales de Gestión de Usuarios (solo lo que existe realmente)
const realCourses = JSON.parse(localStorage.getItem(`smart-student-courses-${currentYear}`) || 
                              localStorage.getItem('smart-student-courses') || '[]');
const realSections = JSON.parse(localStorage.getItem(`smart-student-sections-${currentYear}`) || 
                               localStorage.getItem('smart-student-sections') || '[]');
const realUsers = JSON.parse(localStorage.getItem(`smart-student-users-${currentYear}`) || 
                            localStorage.getItem('smart-student-users') || '[]');

console.log('📊 Datos REALES encontrados en Gestión de Usuarios:');
console.log(`- Cursos: ${realCourses.length}`);
console.log(`- Secciones: ${realSections.length}`);
console.log(`- Usuarios: ${realUsers.length}`);

if (realCourses.length > 0) {
  console.log('  Cursos reales:');
  realCourses.forEach(course => console.log(`    • ${course.name} (${course.level})`));
}

// 2. LIMPIEZA TOTAL de datos demo y estadísticas
const keysToClean = [
  // Datos estadísticos
  'smart-student-tasks',
  'smart-student-submissions',
  'smart-student-attendance',
  'smart-student-assignments', 
  'smart-student-evaluations',
  'smart-student-grades',
  'smart-student-notifications',
  // Datos administrativos que podrían contener demo
  'smart-student-course-sections'
];

// Limpiar tanto keys normales como con sufijo de año
const allKeysToClean = [];
keysToClean.forEach(key => {
  allKeysToClean.push(key);
  allKeysToClean.push(`${key}-${currentYear}`);
  // También limpiar años anteriores potenciales
  allKeysToClean.push(`${key}-${currentYear-1}`);
  allKeysToClean.push(`${key}-${currentYear+1}`);
});

let cleanedCount = 0;
console.log('🧹 Eliminando datos demo y estadísticas...');
allKeysToClean.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`❌ Eliminado: ${key}`);
    cleanedCount++;
  }
});

// 3. Limpiar tracking de demo generación
['stats-demo-seeded-keys', 'demo-admin-stats-generated', 'demo-teacher-data-generated'].forEach(key => {
  if (sessionStorage.getItem(key)) {
    sessionStorage.removeItem(key);
    console.log(`❌ Eliminado: ${key} (sessionStorage)`);
    cleanedCount++;
  }
});

// Limpiar marcadores de demo por usuario
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('demo-stats-generated:')) {
    localStorage.removeItem(key);
    console.log(`❌ Eliminado: ${key}`);
    cleanedCount++;
  }
});

// 4. Si NO hay datos reales, limpiar también la estructura de cursos/secciones
if (realCourses.length === 0 && realSections.length === 0) {
  console.log('⚠️  NO se encontraron datos reales en Gestión de Usuarios');
  console.log('🧹 Limpiando TODA la estructura de cursos/secciones...');
  
  ['smart-student-courses', `smart-student-courses-${currentYear}`,
   'smart-student-sections', `smart-student-sections-${currentYear}`,
   'smart-student-course-sections', `smart-student-course-sections-${currentYear}`
  ].forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`❌ Eliminado: ${key}`);
      cleanedCount++;
    }
  });
  
  // Limpiar también usuarios si no hay estructura académica
  if (realUsers.filter(u => u.role === 'student').length > 0) {
    console.log('⚠️  Hay estudiantes pero sin cursos/secciones - datos inconsistentes');
    console.log('💡 Considera revisar la configuración en Gestión de Usuarios');
  }
}

// 5. Resetear filtros de estadísticas para evitar inconsistencias
const statsFilters = {
  level: 'all',
  course: 'all', 
  section: 'all',
  semester: 'all',
  subject: 'all',
  period: 'Todo'
};

localStorage.setItem('stats-filters-state', JSON.stringify(statsFilters));
console.log('🔄 Filtros de estadísticas reseteados a "Todo"');

console.log(`✅ LIMPIEZA COMPLETADA`);
console.log(`   • ${cleanedCount} elementos eliminados`);
console.log(`   • Filtros reseteados`);
console.log(`   • Solo datos reales de Gestión de Usuarios permanecen`);

// 6. Verificar estado final
console.log('');
console.log('📋 ESTADO FINAL:');
console.log(`   • Cursos reales: ${realCourses.length}`);
console.log(`   • Secciones reales: ${realSections.length}`);  
console.log(`   • Usuarios reales: ${realUsers.length}`);
console.log('');

if (realCourses.length === 0) {
  console.log('✅ Las estadísticas ahora mostrarán CERO cursos, CERO estudiantes');
  console.log('💡 Para agregar datos reales, ve a Gestión de Usuarios > Cursos y Secciones');
} else {
  console.log('✅ Las estadísticas mostrarán solo los cursos reales configurados');
}

console.log('');
console.log('🔄 Recargando página para aplicar cambios...');

// Recargar página después de 3 segundos para que se vean los logs
setTimeout(() => {
  location.reload();
}, 3000);
