// 🔍 SCRIPT DE DIAGNÓSTICO: Estado de Calificaciones
// Ejecutar en consola del navegador cuando las calificaciones desaparezcan

(function debugCalificaciones() {
  console.log('🔍 ========== DIAGNÓSTICO DE CALIFICACIONES ==========');
  
  // 1. Verificar año seleccionado
  const selectedYear = localStorage.getItem('admin-selected-year');
  console.log('📅 Año seleccionado:', selectedYear);
  
  // 2. Verificar calificaciones en LocalStorage
  const lsKey = `smart-student-test-grades-${selectedYear}`;
  const sessionKey = `smart-student-test-grades-${selectedYear}`;
  
  let lsGrades = [];
  try {
    const raw = localStorage.getItem(lsKey);
    lsGrades = raw ? JSON.parse(raw) : [];
    console.log(`📦 LocalStorage (${lsKey}):`, lsGrades.length, 'calificaciones');
    if (lsGrades.length > 0) {
      console.log('   Primeras 3:', lsGrades.slice(0, 3));
    }
  } catch (e) {
    console.error('❌ Error leyendo LocalStorage:', e);
  }
  
  let sessionGrades = [];
  try {
    const raw = sessionStorage.getItem(sessionKey);
    sessionGrades = raw ? JSON.parse(raw) : [];
    console.log(`📦 SessionStorage (${sessionKey}):`, sessionGrades.length, 'calificaciones');
  } catch (e) {
    console.error('❌ Error leyendo SessionStorage:', e);
  }
  
  // 3. Verificar conexión SQL/Firebase
  const sqlStatus = window.sqlGlobal?.getSQLStatus?.() || { connected: false };
  console.log('🔌 Estado SQL:', sqlStatus);
  
  // 4. Verificar eventos recientes
  console.log('📡 Para monitorear eventos en tiempo real, ejecuta:');
  console.log(`
    window.addEventListener('sqlGradesUpdated', (e) => {
      console.log('🔔 Evento sqlGradesUpdated:', e.detail);
    });
    
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.includes('grades')) {
        console.log('💾 Evento storage (grades):', e.key, e.newValue?.length);
      }
    });
  `);
  
  // 5. Estado del componente React (si es accesible via React DevTools)
  console.log('🔧 Para ver estado del componente, usa React DevTools');
  console.log('   Busca: GradesPage → Hook State → grades');
  
  // 6. Verificar cursores/secciones
  const courses = localStorage.getItem('smart-student-courses');
  const sections = localStorage.getItem('smart-student-sections');
  console.log('📚 Cursos disponibles:', courses ? JSON.parse(courses).length : 0);
  console.log('🏫 Secciones disponibles:', sections ? JSON.parse(sections).length : 0);
  
  console.log('🔍 ================================================');
  
  return {
    year: selectedYear,
    localStorageGrades: lsGrades.length,
    sessionStorageGrades: sessionGrades.length,
    sqlConnected: sqlStatus.connected,
    courses: courses ? JSON.parse(courses).length : 0,
    sections: sections ? JSON.parse(sections).length : 0
  };
})();
