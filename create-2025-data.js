// Script para crear datos de prueba para el año 2025
// Copia los datos del año 2024 y los adapta para 2025

function create2025Data() {
  const currentYear = 2025;
  const sourceYear = 2024;
  
  console.log(`Creando datos para ${currentYear} basados en ${sourceYear}...`);
  
  // Función para obtener datos del año anterior
  const getYearData = (key, year) => {
    try {
      const data = localStorage.getItem(`${key}-${year}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };
  
  // Función para guardar datos del año actual
  const setYearData = (key, year, data) => {
    localStorage.setItem(`${key}-${year}`, JSON.stringify(data));
  };
  
  // Función para adaptar fechas del año anterior al año actual
  const adaptDate = (dateStr) => {
    if (!dateStr) return dateStr;
    
    try {
      // Si es timestamp numérico
      if (typeof dateStr === 'number') {
        const date = new Date(dateStr);
        date.setFullYear(currentYear);
        return date.getTime();
      }
      
      // Si es string de fecha
      if (typeof dateStr === 'string') {
        // Reemplazar año en formato YYYY
        const adapted = dateStr.replace(/\b2024\b/g, currentYear.toString());
        
        // Si contiene fecha, adaptarla
        if (adapted.includes('-') || adapted.includes('/')) {
          const date = new Date(adapted);
          if (!isNaN(date.getTime())) {
            date.setFullYear(currentYear);
            return date.toISOString();
          }
        }
        
        return adapted;
      }
      
      return dateStr;
    } catch {
      return dateStr;
    }
  };
  
  // Función para adaptar un objeto (recursivamente)
  const adaptObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(adaptObject);
    }
    
    const adapted = {};
    for (const [key, value] of Object.entries(obj)) {
      // Campos de fecha comunes
      if (['createdAt', 'updatedAt', 'when', 'date', 'timestamp', 'submittedAt', 'submissionDate'].includes(key)) {
        adapted[key] = adaptDate(value);
      } else if (typeof value === 'object') {
        adapted[key] = adaptObject(value);
      } else if (typeof value === 'string' && value.includes('2024')) {
        adapted[key] = value.replace(/\b2024\b/g, currentYear.toString());
      } else {
        adapted[key] = value;
      }
    }
    
    return adapted;
  };
  
  // Copiar y adaptar submissions
  console.log('Copiando submissions...');
  const submissions2024 = getYearData('smart-student-submissions', sourceYear);
  if (submissions2024.length > 0) {
    const submissions2025 = adaptObject(submissions2024);
    setYearData('smart-student-submissions', currentYear, submissions2025);
    console.log(`✓ Creados ${submissions2025.length} submissions para ${currentYear}`);
  } else {
    console.log('⚠️ No se encontraron submissions para 2024');
  }
  
  // Copiar y adaptar tasks
  console.log('Copiando tasks...');
  const tasks2024 = getYearData('smart-student-tasks', sourceYear);
  if (tasks2024.length > 0) {
    const tasks2025 = adaptObject(tasks2024);
    setYearData('smart-student-tasks', currentYear, tasks2025);
    console.log(`✓ Creados ${tasks2025.length} tasks para ${currentYear}`);
  } else {
    console.log('⚠️ No se encontraron tasks para 2024');
  }
  
  // Copiar y adaptar attendance
  console.log('Copiando attendance...');
  const attendance2024 = getYearData('smart-student-attendance', sourceYear);
  if (attendance2024.length > 0) {
    const attendance2025 = adaptObject(attendance2024);
    setYearData('smart-student-attendance', currentYear, attendance2025);
    console.log(`✓ Creados ${attendance2025.length} attendance records para ${currentYear}`);
  } else {
    console.log('⚠️ No se encontraron attendance records para 2024');
  }
  
  // Copiar cursos y secciones si no existen
  console.log('Verificando cursos y secciones...');
  const courses2025 = getYearData('smart-student-admin-courses', currentYear);
  if (courses2025.length === 0) {
    const courses2024 = getYearData('smart-student-admin-courses', sourceYear);
    if (courses2024.length > 0) {
      const coursesAdapted = adaptObject(courses2024);
      setYearData('smart-student-admin-courses', currentYear, coursesAdapted);
      console.log(`✓ Copiados ${coursesAdapted.length} cursos para ${currentYear}`);
    }
  }
  
  const sections2025 = getYearData('smart-student-admin-sections', currentYear);
  if (sections2025.length === 0) {
    const sections2024 = getYearData('smart-student-admin-sections', sourceYear);
    if (sections2024.length > 0) {
      const sectionsAdapted = adaptObject(sections2024);
      setYearData('smart-student-admin-sections', currentYear, sectionsAdapted);
      console.log(`✓ Copiadas ${sectionsAdapted.length} secciones para ${currentYear}`);
    }
  }
  
  console.log('✅ Proceso completado. Recarga la página para ver los cambios.');
}

// Ejecutar la función
create2025Data();
